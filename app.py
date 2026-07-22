#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
app.py — Flask web server for RVC_factor.

Wraps the analysis core (core.py) and the SQLite persistence (db.py) behind a
small REST API and serves the single-page front-end in static/.

Run:
    python app.py
    # then open http://127.0.0.1:5000
"""

import io
import math
import os
import re
import struct
import sys
import uuid
import tempfile
from datetime import datetime
from html import escape

import librosa
import numpy as np
import soundfile as sf
from PIL import Image
from flask import (Flask, request, jsonify, send_from_directory, send_file,
                   abort, Response)

sys.dont_write_bytecode = True

import db
import core

try:
    import cv2
except ImportError:
    cv2 = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOAD_AUDIO_DIR = os.path.join(OUTPUT_DIR, "uploads", "audio")
UPLOAD_AVATAR_DIR = os.path.join(OUTPUT_DIR, "uploads", "avatars")
PICTURE_DIR = os.path.join(OUTPUT_DIR, "picture")
REPORT_DIR = os.path.join(OUTPUT_DIR, "report")

ALLOWED_AUDIO_EXT = {".wav", ".mp3", ".flac", ".ogg", ".m4a", ".webm"}
ALLOWED_AVATAR_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp"}

PINYIN_ABBR = {
    "阿": "A", "安": "AN", "白": "B", "包": "B", "陈": "CH", "程": "CH", "崔": "C",
    "戴": "D", "邓": "D", "丁": "D", "董": "D", "杜": "D", "范": "F", "方": "F",
    "冯": "F", "高": "G", "郭": "G", "韩": "H", "何": "H", "胡": "H", "黄": "H",
    "贾": "J", "姜": "J", "蒋": "J", "金": "J", "康": "K", "孔": "K", "李": "L",
    "例": "LI", "刘": "L", "老": "L", "梁": "L", "林": "L", "罗": "L", "吕": "L",
    "马": "M", "牛": "N", "彭": "P", "钱": "Q", "秦": "Q", "邱": "Q", "任": "R",
    "沈": "SH", "师": "SH", "示": "SH", "宋": "S", "孙": "S", "唐": "T", "田": "T",
    "王": "W", "吴": "W", "夏": "X", "肖": "X", "谢": "X", "辛": "X", "徐": "X",
    "许": "X", "杨": "Y", "羊": "YA", "姚": "Y", "叶": "Y", "一": "Y", "远": "YU",
    "于": "YU", "余": "YU", "袁": "YU", "张": "ZH", "赵": "ZH", "郑": "ZH", "周": "ZH",
    "朱": "ZH", "钟": "ZH", "中": "ZH", "咨": "Z", "询": "X", "晓": "X", "娟": "JU",
    "来": "L", "访": "F", "者": "ZH",
}

app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="/static")
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024 * 1024  # 64 MB cap
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0


def _ensure_dirs():
    for d in (UPLOAD_AUDIO_DIR, UPLOAD_AVATAR_DIR, PICTURE_DIR, REPORT_DIR):
        os.makedirs(d, exist_ok=True)


_ensure_dirs()
db.init_db()


@app.after_request
def _disable_cache_for_local_app(response):
    if request.path == "/" or request.path.startswith("/static/"):
        response.headers["Cache-Control"] = "no-store, max-age=0"
    return response


# ==================== Helpers ====================
def _read_audio_bytes(file_bytes):
    """Decode uploaded bytes into (audio_float64, sample_rate)."""
    audio, sr = sf.read(io.BytesIO(file_bytes), dtype='float64')
    if audio.ndim > 1:
        audio = audio[:, 0]
    return audio, sr


def _extract_features(audio, sr):
    """Extract DB-storable features without letting DSP failures reject upload."""
    try:
        feats = core.get_audio_features(audio, sr)
    except Exception:
        feats = {
            'duration': round(len(audio) / sr, 2) if sr else None,
            'rms': None,
            'zcr': None,
            'centroid': None,
        }
    try:
        _, pitch, gender = core.extract_pitch_array(audio, sr)
        feats['pitch_hz'] = float(pitch)
        feats['gender'] = float(gender)
    except Exception:
        feats['pitch_hz'] = None
        feats['gender'] = None
    return {k: _finite_or_none(v) for k, v in feats.items()}


def _finite_or_none(value):
    if value is None:
        return None
    try:
        value = float(value)
    except (TypeError, ValueError):
        return None
    return value if math.isfinite(value) else None


def _validate_decoded_audio(audio, sr):
    if sr is None or sr <= 0:
        abort(400, description="invalid audio sample rate")
    if audio is None or len(audio) == 0:
        abort(400, description="recording is empty; please record again")
    if len(audio) < max(1, int(sr * 0.2)):
        abort(400, description="recording is too short; please record at least 1 second")
    if not np.isfinite(audio).all():
        abort(400, description="audio contains invalid samples")
    peak = float(np.max(np.abs(audio)))
    if peak == 0:
        abort(400, description="recording is silent; please check the microphone")


def _decode_uploaded_audio(path, ext):
    """Decode an uploaded audio file, with a robust PCM WAV fallback."""
    if ext == ".webm":
        try:
            return librosa.load(path, sr=None, mono=True, dtype='float64')
        except Exception:
            abort(400, description="Cannot decode WebM audio. Please record again or upload wav/mp3/flac/ogg/m4a.")

    try:
        audio, sr = sf.read(path, dtype='float64')
        if audio.ndim > 1:
            audio = audio[:, 0]
        return audio, sr
    except Exception as exc:
        if ext == ".wav":
            try:
                return _decode_pcm_wav(path)
            except ValueError as wav_exc:
                raise DecodeAudioError(str(wav_exc)) from exc
        raise DecodeAudioError(_audio_debug_message(path, "unsupported or corrupt audio")) from exc


class DecodeAudioError(Exception):
    pass


def _decode_pcm_wav(path):
    with open(path, "rb") as f:
        data = f.read()
    if len(data) < 44:
        raise ValueError(_audio_debug_message(path, "wav file is too small"))
    if data[0:4] != b"RIFF" or data[8:12] != b"WAVE":
        raise ValueError(_audio_debug_message(path, "wav header is not RIFF/WAVE"))

    pos = 12
    fmt = None
    pcm = None
    while pos + 8 <= len(data):
        chunk_id = data[pos:pos + 4]
        chunk_size = struct.unpack_from("<I", data, pos + 4)[0]
        chunk_start = pos + 8
        chunk_end = min(chunk_start + chunk_size, len(data))
        chunk = data[chunk_start:chunk_end]
        if chunk_id == b"fmt ":
            if len(chunk) < 16:
                raise ValueError(_audio_debug_message(path, "wav fmt chunk is invalid"))
            fmt = struct.unpack_from("<HHIIHH", chunk, 0)
        elif chunk_id == b"data":
            pcm = chunk
        pos = chunk_end + (chunk_size % 2)

    if fmt is None or pcm is None:
        raise ValueError(_audio_debug_message(path, "wav fmt/data chunk is missing"))

    audio_format, channels, sr, _byte_rate, block_align, bits = fmt
    if channels <= 0 or sr <= 0 or block_align <= 0:
        raise ValueError(_audio_debug_message(path, "wav metadata is invalid"))
    if bits == 0:
        bits = (block_align * 8) // channels

    frame_count = len(pcm) // block_align
    pcm = pcm[:frame_count * block_align]
    if not pcm:
        raise ValueError(_audio_debug_message(path, "wav data chunk is empty"))

    if audio_format == 1 and bits == 16:
        samples = np.frombuffer(pcm, dtype="<i2").astype(np.float64) / 32768.0
    elif audio_format == 1 and bits == 32:
        samples = np.frombuffer(pcm, dtype="<i4").astype(np.float64) / 2147483648.0
    elif audio_format == 3 and bits == 32:
        samples = np.frombuffer(pcm, dtype="<f4").astype(np.float64)
    else:
        raise ValueError(_audio_debug_message(path, f"unsupported wav format={audio_format} bits={bits}"))

    samples = samples.reshape(-1, channels)
    return samples[:, 0], sr


def _audio_debug_message(path, reason):
    try:
        size = os.path.getsize(path)
        with open(path, "rb") as f:
            head = f.read(16).hex(" ")
    except OSError:
        size = "unknown"
        head = "unavailable"
    return f"Cannot decode audio file ({reason}; size={size}; header={head}). Please refresh the page and record again."


def _save_uploaded_file(storage, allowed_ext, dest_dir, prefix=""):
    """Save a Werkzeug FileStorage to dest_dir with a safe unique name."""
    original = storage.filename or "upload"
    ext = os.path.splitext(original)[1].lower()
    if ext not in allowed_ext:
        abort(400, description=f"Unsupported file type: {ext}")
    name = f"{prefix}{uuid.uuid4().hex}{ext}"
    path = os.path.join(dest_dir, name)
    storage.save(path)
    return name, original


def _face_crop_box_with_opencv(img):
    if cv2 is None:
        return None
    w, h = img.size
    arr = np.array(img)
    gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
    gray = cv2.equalizeHist(gray)
    cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
    cascade = cv2.CascadeClassifier(cascade_path)
    if cascade.empty():
        return None
    faces = cascade.detectMultiScale(
        gray,
        scaleFactor=1.06,
        minNeighbors=4,
        minSize=(max(32, w // 18), max(32, h // 18)),
        flags=cv2.CASCADE_SCALE_IMAGE,
    )
    if len(faces) == 0:
        return None

    x, y, fw, fh = max(faces, key=lambda box: box[2] * box[3])
    center_x = x + fw / 2
    size = max(fw * 2.35, fh * 2.85, min(w, h) * 0.22)
    size = min(size, w, h)
    left = center_x - size / 2
    top = y - fh * 0.62
    left = max(0, min(w - size, left))
    top = max(0, min(h - size, top))
    return tuple(int(round(v)) for v in (left, top, size))


def _fallback_avatar_crop_box(w, h):
    crop_size = max(1, int(min(w, h) * 0.72))
    left = max(0, min(w - crop_size, (w - crop_size) // 2))
    top = max(0, min(h - crop_size, int(h * 0.08)))
    return left, top, crop_size


def _save_avatar_file(storage, prefix="", pre_cropped=False):
    """Save avatar as a normalized 512x512 head-focused JPEG."""
    original = storage.filename or "avatar"
    ext = os.path.splitext(original)[1].lower()
    if ext not in ALLOWED_AVATAR_EXT:
        abort(400, description=f"Unsupported file type: {ext}")

    name = f"{prefix}{uuid.uuid4().hex}.jpg"
    path = os.path.join(UPLOAD_AVATAR_DIR, name)
    try:
        img = Image.open(storage.stream)
        img = img.convert("RGB")
        w, h = img.size
        if pre_cropped:
            crop_size = min(w, h)
            left = max(0, (w - crop_size) // 2)
            top = max(0, (h - crop_size) // 2)
        else:
            left, top, crop_size = _face_crop_box_with_opencv(img) or _fallback_avatar_crop_box(w, h)
        img = img.crop((left, top, left + crop_size, top + crop_size))
        img = img.resize((512, 512), Image.Resampling.LANCZOS)
        img.save(path, "JPEG", quality=92, optimize=True)
        return name, original
    except Exception:
        storage.stream.seek(0)
        fallback_name = f"{prefix}{uuid.uuid4().hex}{ext}"
        fallback_path = os.path.join(UPLOAD_AVATAR_DIR, fallback_name)
        storage.save(fallback_path)
        return fallback_name, original


def _name_code(name, upper=True):
    parts = []
    for ch in re.sub(r"\s+", "", name or ""):
        if ch.isascii() and ch.isalnum():
            parts.append(ch.upper())
        else:
            parts.append(PINYIN_ABBR.get(ch, ""))
        if len("".join(parts)) >= 4:
            break
    code = "".join(parts)[:4] or "AUD"
    return code.upper() if upper else code.lower()


def _sex_code(sex):
    if sex == "female":
        return "F"
    if sex == "male":
        return "M"
    return "U"


def _safe_audio_filename_base(display_name):
    base = os.path.splitext(display_name or "")[0].strip()
    base = re.sub(r"\s+", "_", base)
    base = re.sub(r"[^\w\u4e00-\u9fff.-]+", "_", base, flags=re.UNICODE)
    base = base.strip("._-")
    return base[:80] or "audio"


def _next_audio_display_name(ptype, pid, audio_role="original", target_client_id=None):
    person = db.get_person(ptype, pid)
    if not person:
        abort(404)
    suffix = "Raw"
    if ptype == "counselor" and audio_role == "converted":
        target = db.get_client(target_client_id)
        if not target or target["counselor_id"] != pid:
            abort(400, description="target client does not belong to this counselor")
        suffix = _name_code(target["name"], upper=False)
    base = f"{_name_code(person['name'], upper=True)}_{_sex_code(person.get('sex'))}_{suffix}"
    pattern = re.compile(rf"^{re.escape(base)}_(\d+)$", re.IGNORECASE)
    max_no = 0
    for audio in db.list_audio(ptype, pid):
        match = pattern.match(audio.get("original_name") or "")
        if match:
            max_no = max(max_no, int(match.group(1)))
    return f"{base}_{max_no + 1:02d}"


# ==================== Page route ====================
@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


# ==================== Counselor API ====================
@app.route("/api/counselors", methods=["GET"])
def api_list_counselors():
    return jsonify(db.list_counselors())


@app.route("/api/counselors", methods=["POST"])
def api_create_counselor():
    name = (request.form.get("name") or "").strip()
    if not name:
        abort(400, description="name is required")
    note = request.form.get("note") or ""
    sex = request.form.get("sex") or ""
    avatar = None
    if "avatar" in request.files and request.files["avatar"].filename:
        avatar, _ = _save_avatar_file(request.files["avatar"], "counselor_", request.form.get("avatar_pre_cropped") == "1")
    cid = db.create_counselor(name, sex=sex, avatar_path=avatar, note=note)
    return jsonify(db.get_counselor(cid)), 201


@app.route("/api/counselors/<int:cid>", methods=["GET"])
def api_get_counselor(cid):
    c = db.get_counselor(cid)
    if not c:
        abort(404)
    return jsonify(c)


@app.route("/api/counselors/<int:cid>", methods=["PUT", "POST"])
def api_update_counselor(cid):
    if not db.get_counselor(cid):
        abort(404)
    name = request.form.get("name")
    note = request.form.get("note")
    sex = request.form.get("sex")
    avatar = None
    if "avatar" in request.files and request.files["avatar"].filename:
        avatar, _ = _save_avatar_file(request.files["avatar"], "counselor_", request.form.get("avatar_pre_cropped") == "1")
    db.update_counselor(cid,
                        name=name.strip() if name else None,
                        sex=sex if sex is not None else None,
                        avatar_path=avatar,
                        note=note if note is not None else None)
    return jsonify(db.get_counselor(cid))


@app.route("/api/counselors/<int:cid>", methods=["DELETE"])
def api_delete_counselor(cid):
    # Cascade will remove clients; explicitly remove their audio files too.
    for cl in db.list_clients(cid):
        for a in db.list_audio("client", cl["id"]):
            _safe_remove_audio(a)
        db.delete_audio_for_person("client", cl["id"])
    for a in db.list_audio("counselor", cid):
        _safe_remove_audio(a)
    db.delete_audio_for_person("counselor", cid)
    db.delete_counselor(cid)
    return jsonify({"ok": True})


# ==================== Client API ====================
@app.route("/api/counselors/<int:cid>/clients", methods=["GET"])
def api_list_clients(cid):
    if not db.get_counselor(cid):
        abort(404)
    return jsonify(db.list_clients(cid))


@app.route("/api/counselors/<int:cid>/clients", methods=["POST"])
def api_create_client(cid):
    if not db.get_counselor(cid):
        abort(404)
    name = (request.form.get("name") or "").strip()
    if not name:
        abort(400, description="name is required")
    note = request.form.get("note") or ""
    sex = request.form.get("sex") or ""
    avatar = None
    if "avatar" in request.files and request.files["avatar"].filename:
        avatar, _ = _save_avatar_file(request.files["avatar"], "client_", request.form.get("avatar_pre_cropped") == "1")
    clid = db.create_client(cid, name, sex=sex, avatar_path=avatar, note=note)
    return jsonify(db.get_client(clid)), 201


@app.route("/api/clients/<int:clid>", methods=["GET"])
def api_get_client(clid):
    cl = db.get_client(clid)
    if not cl:
        abort(404)
    return jsonify(cl)


@app.route("/api/clients/<int:clid>", methods=["PUT", "POST"])
def api_update_client(clid):
    cl = db.get_client(clid)
    if not cl:
        abort(404)
    name = request.form.get("name")
    note = request.form.get("note")
    sex = request.form.get("sex")
    avatar = None
    if "avatar" in request.files and request.files["avatar"].filename:
        avatar, _ = _save_avatar_file(request.files["avatar"], "client_", request.form.get("avatar_pre_cropped") == "1")
    db.update_client(clid,
                     name=name.strip() if name else None,
                     sex=sex if sex is not None else None,
                     avatar_path=avatar,
                     note=note if note is not None else None)
    return jsonify(db.get_client(clid))


@app.route("/api/clients/<int:clid>", methods=["DELETE"])
def api_delete_client(clid):
    for a in db.list_audio("client", clid):
        _safe_remove_audio(a)
    db.delete_audio_for_person("client", clid)
    db.delete_client(clid)
    return jsonify({"ok": True})


# ==================== Audio API ====================
@app.route("/api/audios", methods=["GET"])
def api_list_all_audio():
    return jsonify(db.list_all_audio())


@app.route("/api/persons/<ptype>/<int:pid>/audios", methods=["GET"])
def api_list_audio(ptype, pid):
    if ptype not in ("counselor", "client"):
        abort(400)
    if not db.get_person(ptype, pid):
        abort(404)
    return jsonify(db.list_audio(ptype, pid))


@app.route("/api/persons/<ptype>/<int:pid>/audio_name_suggestion", methods=["GET"])
def api_audio_name_suggestion(ptype, pid):
    if ptype not in ("counselor", "client"):
        abort(400)
    if not db.get_person(ptype, pid):
        abort(404)
    audio_role = (request.args.get("audio_role") or "original").strip()
    target_client_id = request.args.get("target_client_id", type=int)
    if ptype != "counselor":
        audio_role = "original"
        target_client_id = None
    elif audio_role not in ("original", "converted"):
        abort(400, description="invalid audio role")
    return jsonify({
        "name": _next_audio_display_name(ptype, pid, audio_role, target_client_id)
    })


@app.route("/api/persons/<ptype>/<int:pid>/audios", methods=["POST"])
def api_upload_audio(ptype, pid):
    if ptype not in ("counselor", "client"):
        abort(400)
    if not db.get_person(ptype, pid):
        abort(404)
    if "audio" not in request.files or not request.files["audio"].filename:
        abort(400, description="audio file is required")

    storage = request.files["audio"]
    original = storage.filename or "audio.wav"
    display_name = (request.form.get("audio_name") or "").strip()
    audio_role = (request.form.get("audio_role") or "original").strip()
    target_client_id = None
    if ptype == "counselor":
        if audio_role not in ("original", "converted"):
            abort(400, description="invalid audio role")
        if audio_role == "converted":
            raw_target = request.form.get("target_client_id")
            if not raw_target:
                abort(400, description="target client is required for converted audio")
            try:
                target_client_id = int(raw_target)
            except ValueError:
                abort(400, description="invalid target client")
            target = db.get_client(target_client_id)
            if not target or target["counselor_id"] != pid:
                abort(400, description="target client does not belong to this counselor")
    else:
        audio_role = "original"

    if not display_name:
        display_name = _next_audio_display_name(ptype, pid, audio_role, target_client_id)

    ext = os.path.splitext(original)[1].lower()
    if ext not in ALLOWED_AUDIO_EXT:
        abort(400, description=f"Unsupported audio type: {ext}")

    # Stream to a temp file first (soundfile needs seekable input).
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=ext)
    try:
        os.close(tmp_fd)
        storage.save(tmp_path)

        try:
            audio, sr = _decode_uploaded_audio(tmp_path, ext)
        except DecodeAudioError as e:
            abort(400, description=str(e))

        _validate_decoded_audio(audio, sr)

        stored_base = _safe_audio_filename_base(display_name)
        stored_name = f"{ptype}_{pid}_{stored_base}_{uuid.uuid4().hex[:8]}.wav"
        stored_path = os.path.join(UPLOAD_AUDIO_DIR, stored_name)
        # Re-encode to wav mono for predictable downstream behaviour.
        sf.write(stored_path, audio, sr, subtype='PCM_16')
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    feats = _extract_features(audio, sr)
    aid = db.create_audio(ptype, pid,
                          stored_filename=stored_name,
                          original_name=display_name,
                          pitch_hz=feats['pitch_hz'],
                          gender=feats['gender'],
                          duration=feats['duration'],
                          rms=feats['rms'],
                          zcr=feats['zcr'],
                          centroid=feats['centroid'],
                          audio_role=audio_role,
                          target_client_id=target_client_id)
    return jsonify(db.get_audio(aid)), 201


@app.route("/api/audios/<int:aid>", methods=["GET"])
def api_get_audio(aid):
    a = db.get_audio(aid)
    if not a:
        abort(404)
    return jsonify(a)


@app.route("/api/audios/<int:aid>/transcript", methods=["PUT", "POST"])
def api_update_audio_transcript(aid):
    if not db.get_audio(aid):
        abort(404)
    data = request.get_json(silent=True) or {}
    transcript = (data.get("transcript") or "").strip()
    db.update_audio_transcript(aid, transcript)
    return jsonify(db.get_audio(aid))


@app.route("/api/audios/<int:aid>/meta", methods=["PUT", "POST"])
def api_update_audio_meta(aid):
    audio = db.get_audio(aid)
    if not audio:
        abort(404)
    data = request.get_json(silent=True) or {}
    name = (data.get("original_name") or "").strip()
    if not name:
        abort(400, description="audio name is required")
    audio_role = audio.get("audio_role") or "original"
    target_client_id = audio.get("target_client_id")
    if audio["person_type"] == "counselor":
        audio_role = (data.get("audio_role") or "original").strip()
        if audio_role not in ("original", "converted"):
            abort(400, description="invalid audio role")
        if audio_role == "converted":
            raw_target = data.get("target_client_id")
            if raw_target in (None, ""):
                abort(400, description="target client is required for converted audio")
            try:
                target_client_id = int(raw_target)
            except (TypeError, ValueError):
                abort(400, description="invalid target client")
            target = db.get_client(target_client_id)
            if not target or target["counselor_id"] != audio["person_id"]:
                abort(400, description="target client does not belong to this counselor")
        else:
            target_client_id = None
    db.update_audio_meta(aid, original_name=name, audio_role=audio_role, target_client_id=target_client_id)
    return jsonify(db.get_audio(aid))


@app.route("/api/audios/<int:aid>", methods=["DELETE"])
def api_delete_audio(aid):
    _safe_remove_audio(db.get_audio(aid))
    db.delete_audio(aid)
    return jsonify({"ok": True})


@app.route("/api/audios/<int:aid>/file", methods=["GET"])
def api_get_audio_file(aid):
    a = db.get_audio(aid)
    if not a:
        abort(404)
    _audio_file_path(a)
    return send_from_directory(UPLOAD_AUDIO_DIR, a["stored_filename"])


def _safe_remove_audio(audio_row):
    """Delete the on-disk file for an audio row, if it exists."""
    if not audio_row:
        return
    path = os.path.join(UPLOAD_AUDIO_DIR, audio_row["stored_filename"])
    if os.path.exists(path):
        try:
            os.remove(path)
        except OSError:
            pass


# ==================== Avatar file route ====================
@app.route("/uploads/avatars/<path:filename>", methods=["GET"])
def serve_avatar(filename):
    return send_from_directory(UPLOAD_AVATAR_DIR, filename)


@app.route("/picture/<path:filename>", methods=["GET"])
def serve_picture(filename):
    return send_from_directory(PICTURE_DIR, filename)


# ==================== Compare + Report ====================
@app.route("/api/compare", methods=["POST"])
def api_compare():
    data = request.get_json(silent=True) or {}
    a_id = data.get("a_id")
    b_id = data.get("b_id")
    if a_id is None or b_id is None:
        abort(400, description="a_id and b_id are required")

    a, b, a_person, b_person = _validate_comparison_pair(a_id, b_id)

    a_audio, a_sr = _load_audio_row(a)
    b_audio, b_sr = _load_audio_row(b)
    decision = core.analyze_speaker_verification(a_audio, a_sr, b_audio, b_sr)
    return jsonify({
        "a_audio": a,
        "b_audio": b,
        "a_person": a_person,
        "b_person": b_person,
        "decision": decision,
    })


@app.route("/api/report/<int:a_id>/<int:b_id>", methods=["GET"])
def api_report(a_id, b_id):
    a, b, a_person, b_person = _validate_comparison_pair(a_id, b_id)

    a_audio, a_sr = _load_audio_row(a)
    b_audio, b_sr = _load_audio_row(b)
    decision = core.analyze_speaker_verification(a_audio, a_sr, b_audio, b_sr)

    src_id = a_person["name"] if a_person else "src"
    tgt_id = b_person["name"] if b_person else "tgt"

    # Timestamped filename to avoid silent overwrite.
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pic_subdir = os.path.join(PICTURE_DIR, f"{src_id}_{tgt_id}_{stamp}")
    img_paths = core.generate_report_figures(
        a_audio, a_sr, b_audio, b_sr, src_id, tgt_id, pic_subdir
    )

    metrics = _report_metrics(decision)
    docx_name = f"report_{src_id}_{tgt_id}_{stamp}.docx"
    docx_path = os.path.join(REPORT_DIR, docx_name)
    core.create_word_report(img_paths, src_id, tgt_id, metrics, decision, docx_path)
    return send_file(docx_path, as_attachment=True, download_name=docx_name)


@app.route("/api/report_html/<int:a_id>/<int:b_id>", methods=["GET"])
def api_report_html(a_id, b_id):
    a, b, a_person, b_person = _validate_comparison_pair(a_id, b_id)
    counselor_audio, counselor, client, report_role = _comparison_report_context(a, b, a_person, b_person)
    existing = db.find_report(counselor["id"], client["id"], report_role)

    a_audio, a_sr = _load_audio_row(a)
    b_audio, b_sr = _load_audio_row(b)
    decision = core.analyze_speaker_verification(a_audio, a_sr, b_audio, b_sr)

    src_id = a_person["name"] if a_person else "src"
    tgt_id = b_person["name"] if b_person else "tgt"
    role_label = "变音" if report_role == "converted" else "原音"
    title = f"{counselor['name']} vs {client['name']}（{role_label}）"
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pic_subdir_name = f"{src_id}_{tgt_id}_{stamp if not existing else 'latest'}"
    pic_subdir = os.path.join(PICTURE_DIR, pic_subdir_name)
    img_paths = core.generate_report_figures(
        a_audio, a_sr, b_audio, b_sr, src_id, tgt_id, pic_subdir
    )
    metrics = _report_metrics(decision)
    html = _build_html_report(title, src_id, tgt_id, metrics, decision, img_paths)
    html_name = existing["html_filename"] if existing else f"report_{src_id}_{tgt_id}_{stamp}.html"
    html_path = os.path.join(REPORT_DIR, html_name)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    if existing:
        return jsonify({"id": existing["id"], "title": existing["title"], "url": f"/reports/{existing['id']}", "reused": True, "refreshed": True})
    rid = db.create_report(
        a_id, b_id, title, html_name,
        counselor_id=counselor["id"],
        client_id=client["id"],
        audio_role=report_role,
        report_type="pair"
    )
    return jsonify({"id": rid, "title": title, "url": f"/reports/{rid}"})


@app.route("/api/report_html_single/<int:audio_id>", methods=["GET"])
def api_report_html_single(audio_id):
    audio_row = db.get_audio(audio_id)
    if not audio_row:
        abort(404)
    person = db.get_person(audio_row["person_type"], audio_row["person_id"])
    if not person:
        abort(404)

    title = f"{person['name']} 单人声音报告"
    existing = db.find_single_report(audio_id)
    html_name = existing["html_filename"] if existing else f"single_report_{person['name']}_{audio_id}.html"
    audio, sr = _load_audio_row(audio_row)
    analysis = core.analyze_single_audio(audio, sr)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pic_subdir_name = f"{person['name']}_single_{audio_id}_{'latest' if existing else stamp}"
    pic_subdir = os.path.join(PICTURE_DIR, pic_subdir_name)
    img_paths = core.generate_single_report_figures(audio, sr, person["name"], pic_subdir)
    html = _build_single_html_report(title, person, audio_row, analysis, img_paths)
    html_path = os.path.join(REPORT_DIR, html_name)
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)

    if existing:
        return jsonify({"id": existing["id"], "title": existing["title"], "url": f"/reports/{existing['id']}", "reused": True, "refreshed": True})

    rid = db.create_report(
        audio_id, audio_id, title, html_name,
        counselor_id=person["id"] if audio_row["person_type"] == "counselor" else None,
        client_id=person["id"] if audio_row["person_type"] == "client" else None,
        audio_role=audio_row.get("audio_role") or "original",
        report_type="single"
    )
    return jsonify({"id": rid, "title": title, "url": f"/reports/{rid}"})


@app.route("/api/reports", methods=["GET"])
def api_reports():
    person_type = request.args.get("person_type")
    person_id = request.args.get("person_id", type=int)
    report_type = request.args.get("report_type")
    return jsonify([{
        **r,
        "url": f"/reports/{r['id']}",
    } for r in db.list_reports(person_type, person_id, report_type)])


@app.route("/reports/<int:report_id>", methods=["GET"])
def view_report(report_id):
    r = db.get_report(report_id)
    if not r:
        abort(404)
    return send_from_directory(REPORT_DIR, r["html_filename"])


@app.route("/api/reports/<int:report_id>", methods=["DELETE"])
def api_delete_report(report_id):
    filename = db.delete_report(report_id)
    if not filename:
        abort(404)
    path = os.path.join(REPORT_DIR, filename)
    if os.path.isfile(path):
        try:
            os.remove(path)
        except OSError:
            pass
    return jsonify({"ok": True})


def _report_metrics(decision):
    return {
        "咨询师音高": f"{decision['src_pitch']:.2f} Hz",
        "来访者音高": f"{decision['tgt_pitch']:.2f} Hz",
        "音高差": f"{decision['semitones']:.1f} 半音",
        "音色相似度": f"{decision['speaker_sim']:.3f}",
        "音高相似度": f"{decision['pitch_sim']:.3f}",
        "共鸣差异 F2": f"{decision['f2_diff']:.0f} Hz",
        "共鸣差异比例": f"{decision['f2_norm']:.2f}",
        "明亮度差异": f"{decision['cent_diff']:.0f} Hz",
        "声音纹理相似度": f"{decision['mfcc_sim']:.3f}",
        "综合分": f"{decision['decision_score']:.3f}",
        "结论": f"{_verdict_label(decision['verdict'])}（置信度：{_confidence_label(decision['confidence'])}）",
    }


def _verdict_label(verdict):
    return {
        "YES": "更像同一说话人",
        "NO": "更像不同说话人",
        "Uncertain": "需要人工复核",
    }.get(verdict, verdict)


def _confidence_label(confidence):
    return {
        "High": "高",
        "Medium": "中等",
        "Low": "低",
        "Very Low / Different": "很低",
    }.get(confidence, confidence)


def _plain_decision_summary(decision):
    verdict = _verdict_label(decision["verdict"])
    confidence = _confidence_label(decision["confidence"])
    score = decision["decision_score"]
    speaker = decision["speaker_sim"]
    pitch_gap = abs(decision["semitones"])
    f2_gap = decision["f2_diff"]
    return (
        f"系统判断：{verdict}，把握程度为{confidence}。综合分为 {score:.3f}，音色相似度为 {speaker:.3f}。"
        f"两段声音的音高相差约 {pitch_gap:.1f} 个半音，共鸣位置差约 {f2_gap:.0f} Hz。"
        "可以把这些数字理解为辅助线索：分数越高、差异越小，两段声音听起来通常越接近；但录音环境、情绪和说话内容也会影响结果。"
    )


def _single_gender_text(source):
    gender = source.get("gender")
    if gender is None:
        return "暂时无法判断"
    if gender < 0.4:
        return f"男声倾向 {gender:.2f}"
    if gender > 0.6:
        return f"女声倾向 {gender:.2f}"
    return f"中性 {gender:.2f}"


def _single_audio_metrics(audio_row, analysis=None):
    source = analysis or audio_row
    return {
        "音频名称": audio_row.get("original_name") or audio_row.get("stored_filename"),
        "基频 F0": f"{source['pitch_hz']:.1f} Hz" if source.get("pitch_hz") else "—",
        "常用音高范围": f"{source['pitch_low']:.1f}-{source['pitch_high']:.1f} Hz" if source.get("pitch_low") else "—",
        "声线倾向": _single_gender_text(source),
        "时长": f"{source['duration']:.1f} 秒" if source.get("duration") else "—",
        "频谱质心": f"{source['centroid']:.0f} Hz" if source.get("centroid") else "—",
        "频谱带宽": f"{source['spectral_bandwidth']:.0f} Hz" if source.get("spectral_bandwidth") else "—",
        "频谱滚降点": f"{source['spectral_rolloff']:.0f} Hz" if source.get("spectral_rolloff") else "—",
        "F1 平均值": f"{source['f1_mean']:.0f} Hz" if source.get("f1_mean") else "—",
        "F2 平均值": f"{source['f2_mean']:.0f} Hz" if source.get("f2_mean") else "—",
        "F3 平均值": f"{source['f3_mean']:.0f} Hz" if source.get("f3_mean") else "—",
        "声音纹理变化": f"{source['mfcc_texture']:.2f}" if source.get("mfcc_texture") else "—",
        "RMS": f"{source['rms']:.3f}" if source.get("rms") else "—",
        "ZCR": f"{source['zcr']:.3f}" if source.get("zcr") else "—",
    }


def _build_single_html_report(title, person, audio_row, analysis, img_paths):
    metrics = _single_audio_metrics(audio_row, analysis)
    rows = "\n".join(
        f"<tr><th>{escape(str(k))}</th><td>{escape(str(v))}</td></tr>"
        for k, v in metrics.items()
    )
    pitch = metrics["基频 F0"]
    duration = metrics["时长"]
    centroid = metrics["频谱质心"]
    figure_notes = {
        "single_overview.png": (
            "单人声音总览",
            "这张图把音量起伏、频谱图和常用音高放在一起。它可以帮助你先整体看这段声音是否清晰、音量是否稳定、音高集中在哪里。"
        ),
        "single_f0_contour.png": (
            "音高走势",
            "这张图看声音的高低怎样随时间变化。线条平稳说明音高变化小，起伏多说明说话时高低变化更明显。"
        ),
        "single_formants.png": (
            "口腔共鸣特征",
            "共振峰反映声音经过口腔和鼻腔后的共鸣位置。它帮助理解这段声音的音色结构，而不是判断好坏。"
        ),
        "single_avg_spectrum.png": (
            "平均频谱",
            "这张图看声音整体偏亮还是偏厚。高频更多通常听起来更亮，低频更多通常听起来更厚。"
        ),
        "single_mfcc.png": (
            "声音纹理",
            "可以把 MFCC 理解成声音细节的纹理图，用来观察这段声音内部结构是否稳定。"
        ),
    }
    figs = []
    for p in img_paths:
        rel = os.path.relpath(p, PICTURE_DIR).replace("\\", "/")
        name = os.path.basename(p)
        caption, note = figure_notes.get(name, (name, "这张图用于辅助观察单段声音特征。"))
        figs.append(
            f'<figure><img src="/picture/{escape(rel)}" alt="{escape(caption)}">'
            f'<figcaption><b>{escape(caption)}</b><span>{escape(note)}</span></figcaption></figure>'
        )
    figures = "\n".join(figs)
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<style>
body {{ margin:0; font-family:"Microsoft YaHei","PingFang SC","Segoe UI",sans-serif; background:#fff8f0; color:#35281c; }}
main {{ max-width:920px; margin:0 auto; padding:32px 24px 56px; }}
h1 {{ margin:0 0 8px; font-size:30px; }}
.sub {{ color:#7a6755; margin-bottom:24px; }}
.summary,.plain-note {{ padding:18px 20px; border-radius:12px; background:#fff; border:1px solid #f0e2d0; margin-bottom:18px; line-height:1.8; }}
table {{ width:100%; border-collapse:collapse; background:#fff; border:1px solid #f0e2d0; border-radius:12px; overflow:hidden; margin:18px 0; }}
th,td {{ padding:10px 12px; border-bottom:1px solid #f0e2d0; text-align:left; }}
th {{ width:38%; color:#7a6755; background:#fff6ee; }}
h2 {{ margin-top:26px; font-size:20px; }}
li {{ margin:8px 0; line-height:1.8; }}
figure {{ background:#fff; border:1px solid #f0e2d0; border-radius:12px; padding:12px; margin:18px 0; }}
img {{ max-width:100%; display:block; margin:auto; }}
figcaption {{ color:#7a6755; font-size:13px; margin-top:10px; line-height:1.7; }}
figcaption b {{ display:block; color:#35281c; font-size:15px; margin-bottom:4px; }}
figcaption span {{ display:block; }}
</style>
</head>
<body>
<main>
<h1>{escape(person['name'])}</h1>
<div class="sub">单人声音 HTML 报告</div>
<section class="summary">这段声音的主要音高为 {escape(pitch)}，录音时长为 {escape(duration)}，频谱质心为 {escape(centroid)}。这些指标用于了解单段声音的高低、明亮度和录音质量，不用于判断两个人是否相像。</section>
<table>{rows}</table>
<section class="plain-note">
<h2>怎样理解这些数字</h2>
<ul>
<li><b>基频 F0</b>：可以理解为声音的主要高低。</li>
<li><b>声线倾向</b>：根据音高和声学特征给出的粗略倾向，不等同于真实性别。</li>
<li><b>频谱质心</b>：数值越高，声音通常越亮；数值越低，声音通常越厚。</li>
<li><b>RMS</b>：平均音量强度，过低可能说明录音偏小。</li>
<li><b>ZCR</b>：声音里细碎变化的多少，噪声较多时可能偏高。</li>
</ul>
</section>
{figures}
</main>
</body>
</html>"""


def _build_html_report(title, src_id, tgt_id, metrics, decision, img_paths):
    rows = "\n".join(
        f"<tr><th>{escape(str(k))}</th><td>{escape(str(v))}</td></tr>"
        for k, v in metrics.items()
    )
    plain_summary = _plain_decision_summary(decision)
    verdict_label = _verdict_label(decision["verdict"])
    figure_notes = {
        "overview.png": (
            "总览图",
            "这张图把两段声音放在一起看：上面是音量起伏，中间是声音里不同频率的强弱，下面是常用音高的分布。"
            "简单说，它帮我们同时观察“说话节奏、声音高低、声音颜色”是否接近。"
        ),
        "f0_contours.png": (
            "音高走势",
            "这张图看声音的高低怎样随时间变化。线条越像，说明两个人说话时升高、降低的习惯越接近；线条差很多，就需要谨慎判断。"
        ),
        "formants.png": (
            "口腔共鸣特征",
            "这里反映的是声音经过口腔、鼻腔后形成的共鸣位置。它不像音量那样容易刻意改变，所以常用来辅助判断声音是否来自同一个人。"
        ),
        "avg_spectrum.png": (
            "声音明亮度",
            "这张图看整体声音偏亮还是偏闷。高频更多通常听起来更亮，低频更多通常听起来更厚；差距过大时，可能是不同人或录音环境不同。"
        ),
        "mfcc.png": (
            "声音纹理",
            "可以把它理解成声音的“纹理照片”。颜色分布越接近，说明整体音色结构越像；差异明显时，代表两段声音的细节特征不同。"
        ),
    }
    figs = []
    for p in img_paths:
        rel = os.path.relpath(p, PICTURE_DIR).replace("\\", "/")
        name = os.path.basename(p)
        caption, note = figure_notes.get(name, (name, "这张图用于辅助观察两段声音的差异。"))
        figs.append(
            f'<figure><img src="/picture/{escape(rel)}" alt="{escape(caption)}">'
            f'<figcaption><b>{escape(caption)}</b><span>{escape(note)}</span></figcaption></figure>'
        )
    figures = "\n".join(figs)
    return f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)} 声音相似度报告</title>
<style>
body {{ margin:0; font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif; background:#fff8f0; color:#35281c; }}
main {{ max-width: 1040px; margin: 0 auto; padding: 32px 24px 56px; }}
h1 {{ margin:0 0 8px; font-size: 30px; }}
.sub {{ color:#7a6755; margin-bottom:24px; }}
.verdict,.plain-note {{ padding:18px 20px; border-radius:12px; background:#fff; border:1px solid #f0e2d0; margin-bottom:18px; }}
.verdict b {{ font-size:22px; color:#e26d8e; }}
table {{ width:100%; border-collapse:collapse; background:#fff; border:1px solid #f0e2d0; border-radius:12px; overflow:hidden; margin:18px 0; }}
th,td {{ padding:10px 12px; border-bottom:1px solid #f0e2d0; text-align:left; }}
th {{ width:38%; color:#7a6755; background:#fff6ee; }}
figure {{ background:#fff; border:1px solid #f0e2d0; border-radius:12px; padding:12px; margin:18px 0; }}
img {{ max-width:100%; display:block; margin:auto; }}
figcaption {{ color:#7a6755; font-size:13px; margin-top:10px; line-height:1.7; }}
figcaption b {{ display:block; color:#35281c; font-size:15px; margin-bottom:4px; }}
figcaption span {{ display:block; }}
</style>
</head>
<body>
<main>
<h1>{escape(src_id)} vs {escape(tgt_id)}</h1>
<div class="sub">声音相似度 HTML 报告</div>
<section class="verdict"><b>{escape(verdict_label)}</b> <span>置信度：{escape(_confidence_label(decision['confidence']))}</span><p>{escape(plain_summary)}</p></section>
<section class="plain-note">这份报告不是医学诊断，也不是最终身份结论。它只是把两段声音的几个关键特征放在一起，帮助咨询师和来访者更直观地理解“哪里像、哪里不像”。</section>
<table>{rows}</table>
{figures}
</main>
</body>
</html>"""


def _load_audio_row(row):
    """Read an audio row's stored file into (audio_float64, sr)."""
    path = _audio_file_path(row)
    audio, sr = sf.read(path, dtype='float64')
    if audio.ndim > 1:
        audio = audio[:, 0]
    return audio, sr


def _audio_file_path(row):
    """Return a stored audio path, or abort with a useful client error."""
    path = os.path.join(UPLOAD_AUDIO_DIR, row["stored_filename"])
    if not os.path.isfile(path):
        abort(404, description=f"stored audio file missing: {row['stored_filename']}")
    return path


def _validate_comparison_pair(a_id, b_id):
    """Enforce comparing one counselor audio against one of their own clients."""
    a = db.get_audio(a_id)
    b = db.get_audio(b_id)
    if not a or not b:
        abort(404, description="audio not found")

    a_person = db.get_person(a["person_type"], a["person_id"])
    b_person = db.get_person(b["person_type"], b["person_id"])
    if not a_person or not b_person:
        abort(400, description="person lookup failed")

    types = {a["person_type"], b["person_type"]}
    if types != {"counselor", "client"}:
        abort(400, description="compare must be between one counselor and one client")

    counselor = a_person if a["person_type"] == "counselor" else b_person
    client = a_person if a["person_type"] == "client" else b_person
    if client["counselor_id"] != counselor["id"]:
        abort(400, description="client does not belong to this counselor")

    counselor_audio = a if a["person_type"] == "counselor" else b
    if (counselor_audio.get("audio_role") or "original") == "converted":
        target_client_id = counselor_audio.get("target_client_id")
        if target_client_id and target_client_id != client["id"]:
            abort(400, description="converted counselor audio targets a different client")

    return a, b, a_person, b_person


def _comparison_report_context(a, b, a_person, b_person):
    counselor_audio = a if a["person_type"] == "counselor" else b
    counselor = a_person if a["person_type"] == "counselor" else b_person
    client = a_person if a["person_type"] == "client" else b_person
    report_role = counselor_audio.get("audio_role") or "original"
    if report_role not in ("original", "converted"):
        report_role = "original"
    return counselor_audio, counselor, client, report_role


# ==================== Error handlers ====================
@app.errorhandler(400)
@app.errorhandler(404)
def _handle_client_error(e):
    return jsonify({"error": e.description}), e.code


@app.errorhandler(413)
def _handle_too_large(e):
    return jsonify({"error": "file too large (max 64MB)"}), 413


if __name__ == "__main__":
    print("RVC_factor server: http://127.0.0.1:5000  (Ctrl+C to stop)")
    app.run(host="127.0.0.1", port=5000, debug=False)
