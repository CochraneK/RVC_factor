#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
db.py — SQLite persistence layer for RVC_factor.

Schema:
  counselors    (id, name, avatar_path, note, created_at)
  clients       (id, counselor_id FK, name, avatar_path, note, created_at)
  audio_samples (id, person_type, person_id, stored_filename, original_name,
                 pitch_hz, gender, duration, rms, zcr, centroid, transcript,
                 audio_role, target_client_id, uploaded_at)

Relationships:
  - counselors 1 -> N clients  (FK with ON DELETE CASCADE)
  - a counselor's audio_samples and a client's audio_samples are distinguished
    by person_type ('counselor' | 'client')
"""

import os
import sqlite3
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
DB_PATH = os.path.join(OUTPUT_DIR, "rvc.db")
_MISSING = object()


def get_conn():
    """Open a connection with sane defaults (FK on, decode timestamps as str)."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    os.makedirs(os.path.dirname(DB_PATH) or ".", exist_ok=True)
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS counselors (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                name         TEXT NOT NULL,
                sex          TEXT DEFAULT '',
                avatar_path  TEXT,
                note         TEXT DEFAULT '',
                created_at   TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS clients (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                counselor_id INTEGER NOT NULL,
                name         TEXT NOT NULL,
                sex          TEXT DEFAULT '',
                avatar_path  TEXT,
                note         TEXT DEFAULT '',
                created_at   TEXT NOT NULL,
                FOREIGN KEY (counselor_id) REFERENCES counselors(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS audio_samples (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                person_type     TEXT NOT NULL CHECK (person_type IN ('counselor','client')),
                person_id       INTEGER NOT NULL,
                stored_filename TEXT NOT NULL,
                original_name   TEXT,
                pitch_hz        REAL,
                gender          REAL,
                duration        REAL,
                rms             REAL,
                zcr             REAL,
                centroid        REAL,
                transcript      TEXT DEFAULT '',
                audio_role      TEXT DEFAULT 'original',
                target_client_id INTEGER,
                uploaded_at     TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_audio_person
                ON audio_samples(person_type, person_id);

            CREATE TABLE IF NOT EXISTS reports (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                a_audio_id      INTEGER NOT NULL,
                b_audio_id      INTEGER NOT NULL,
                counselor_id    INTEGER,
                client_id       INTEGER,
                audio_role      TEXT DEFAULT '',
                report_type     TEXT DEFAULT 'pair',
                title           TEXT NOT NULL,
                html_filename   TEXT NOT NULL,
                created_at      TEXT NOT NULL
            );
            """
        )
        _ensure_column(conn, "counselors", "sex", "TEXT DEFAULT ''")
        _ensure_column(conn, "clients", "sex", "TEXT DEFAULT ''")
        _ensure_column(conn, "audio_samples", "transcript", "TEXT DEFAULT ''")
        _ensure_column(conn, "audio_samples", "audio_role", "TEXT DEFAULT 'original'")
        _ensure_column(conn, "audio_samples", "target_client_id", "INTEGER")
        _ensure_column(conn, "reports", "counselor_id", "INTEGER")
        _ensure_column(conn, "reports", "client_id", "INTEGER")
        _ensure_column(conn, "reports", "audio_role", "TEXT DEFAULT ''")
        _ensure_column(conn, "reports", "report_type", "TEXT DEFAULT 'pair'")


def _ensure_column(conn, table, column, ddl):
    cols = [r["name"] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()]
    if column not in cols:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl}")


# ==================== Person helpers ====================
def _row_to_person(row, kind):
    return {
        'id': row['id'],
        'type': kind,
        'name': row['name'],
        'sex': row['sex'] if 'sex' in row.keys() else '',
        'avatar_path': row['avatar_path'],
        'note': row['note'] or '',
        'created_at': row['created_at'],
    }


def list_counselors():
    with get_conn() as c:
        rows = c.execute(
            "SELECT cs.*, (SELECT COUNT(*) FROM clients cl WHERE cl.counselor_id = cs.id) AS client_count, "
            "(SELECT COUNT(*) FROM audio_samples a WHERE a.person_type='counselor' AND a.person_id = cs.id) AS audio_count "
            "FROM counselors cs ORDER BY cs.id DESC"
        ).fetchall()
        return [{
            **_row_to_person(r, 'counselor'),
            'client_count': r['client_count'],
            'audio_count': r['audio_count'],
        } for r in rows]


def get_counselor(cid):
    with get_conn() as c:
        r = c.execute("SELECT * FROM counselors WHERE id = ?", (cid,)).fetchone()
        return _row_to_person(r, 'counselor') if r else None


def create_counselor(name, sex='', avatar_path=None, note=''):
    with get_conn() as c:
        cur = c.execute(
            "INSERT INTO counselors (name, sex, avatar_path, note, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, sex or '', avatar_path, note or '', datetime.utcnow().isoformat())
        )
        return cur.lastrowid


def update_counselor(cid, name=None, sex=None, avatar_path=None, note=None):
    with get_conn() as c:
        if name is not None:
            c.execute("UPDATE counselors SET name = ? WHERE id = ?", (name, cid))
        if sex is not None:
            c.execute("UPDATE counselors SET sex = ? WHERE id = ?", (sex, cid))
        if avatar_path is not None:
            c.execute("UPDATE counselors SET avatar_path = ? WHERE id = ?", (avatar_path, cid))
        if note is not None:
            c.execute("UPDATE counselors SET note = ? WHERE id = ?", (note, cid))


def delete_counselor(cid):
    with get_conn() as c:
        c.execute("DELETE FROM counselors WHERE id = ?", (cid,))


def list_clients(counselor_id):
    with get_conn() as c:
        rows = c.execute(
            "SELECT cl.*, (SELECT COUNT(*) FROM audio_samples a WHERE a.person_type='client' AND a.person_id = cl.id) AS audio_count "
            "FROM clients cl WHERE cl.counselor_id = ? ORDER BY cl.id DESC",
            (counselor_id,)
        ).fetchall()
        return [{**_row_to_person(r, 'client'),
                 'counselor_id': r['counselor_id'],
                 'audio_count': r['audio_count']} for r in rows]


def get_client(client_id):
    with get_conn() as c:
        r = c.execute("SELECT * FROM clients WHERE id = ?", (client_id,)).fetchone()
        if not r:
            return None
        d = _row_to_person(r, 'client')
        d['counselor_id'] = r['counselor_id']
        return d


def create_client(counselor_id, name, sex='', avatar_path=None, note=''):
    with get_conn() as c:
        cur = c.execute(
            "INSERT INTO clients (counselor_id, name, sex, avatar_path, note, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (counselor_id, name, sex or '', avatar_path, note or '', datetime.utcnow().isoformat())
        )
        return cur.lastrowid


def update_client(client_id, name=None, sex=None, avatar_path=None, note=None):
    with get_conn() as c:
        if name is not None:
            c.execute("UPDATE clients SET name = ? WHERE id = ?", (name, client_id))
        if sex is not None:
            c.execute("UPDATE clients SET sex = ? WHERE id = ?", (sex, client_id))
        if avatar_path is not None:
            c.execute("UPDATE clients SET avatar_path = ? WHERE id = ?", (avatar_path, client_id))
        if note is not None:
            c.execute("UPDATE clients SET note = ? WHERE id = ?", (note, client_id))


def delete_client(client_id):
    with get_conn() as c:
        c.execute("DELETE FROM clients WHERE id = ?", (client_id,))


def get_person(person_type, person_id):
    """Unified accessor: type in {'counselor','client'}."""
    if person_type == 'counselor':
        return get_counselor(person_id)
    return get_client(person_id)


# ==================== Audio helpers ====================
def _audio_row_to_dict(r):
    return {
        'id': r['id'],
        'person_type': r['person_type'],
        'person_id': r['person_id'],
        'stored_filename': r['stored_filename'],
        'original_name': r['original_name'],
        'pitch_hz': r['pitch_hz'],
        'gender': r['gender'],
        'duration': r['duration'],
        'rms': r['rms'],
        'zcr': r['zcr'],
        'centroid': r['centroid'],
        'transcript': r['transcript'] if 'transcript' in r.keys() else '',
        'audio_role': r['audio_role'] if 'audio_role' in r.keys() else 'original',
        'target_client_id': r['target_client_id'] if 'target_client_id' in r.keys() else None,
        'uploaded_at': r['uploaded_at'],
    }


def list_audio(person_type, person_id):
    with get_conn() as c:
        rows = c.execute(
            """
            SELECT a.*, tcl.name AS target_client_name
            FROM audio_samples a
            LEFT JOIN clients tcl ON a.target_client_id=tcl.id
            WHERE a.person_type = ? AND a.person_id = ?
            ORDER BY a.id DESC
            """,
            (person_type, person_id)
        ).fetchall()
        out = []
        for r in rows:
            d = _audio_row_to_dict(r)
            d['target_client_name'] = r['target_client_name'] or ''
            out.append(d)
        return out


def get_audio(audio_id):
    with get_conn() as c:
        r = c.execute(
            """
            SELECT a.*, tcl.name AS target_client_name
            FROM audio_samples a
            LEFT JOIN clients tcl ON a.target_client_id=tcl.id
            WHERE a.id = ?
            """,
            (audio_id,)
        ).fetchone()
        if not r:
            return None
        d = _audio_row_to_dict(r)
        d['target_client_name'] = r['target_client_name'] or ''
        return d


def list_all_audio():
    with get_conn() as c:
        rows = c.execute(
            """
            SELECT a.*,
                   CASE
                     WHEN a.person_type='counselor' THEN cs.name
                     ELSE cl.name
                   END AS person_name,
                   CASE
                     WHEN a.person_type='counselor' THEN cs.sex
                     ELSE cl.sex
                   END AS person_sex,
                   tcl.name AS target_client_name,
                   cl.counselor_id AS counselor_id
            FROM audio_samples a
            LEFT JOIN counselors cs ON a.person_type='counselor' AND a.person_id=cs.id
            LEFT JOIN clients cl ON a.person_type='client' AND a.person_id=cl.id
            LEFT JOIN clients tcl ON a.target_client_id=tcl.id
            WHERE (a.person_type='counselor' AND cs.id IS NOT NULL)
               OR (a.person_type='client' AND cl.id IS NOT NULL)
            ORDER BY a.id DESC
            """
        ).fetchall()
        out = []
        for r in rows:
            d = _audio_row_to_dict(r)
            d['person_name'] = r['person_name']
            d['person_sex'] = r['person_sex'] or ''
            d['target_client_name'] = r['target_client_name'] or ''
            d['counselor_id'] = r['counselor_id']
            out.append(d)
        return out


def create_audio(person_type, person_id, stored_filename, original_name,
                 pitch_hz=None, gender=None, duration=None, rms=None, zcr=None, centroid=None,
                 audio_role='original', target_client_id=None):
    with get_conn() as c:
        cur = c.execute(
            "INSERT INTO audio_samples "
            "(person_type, person_id, stored_filename, original_name, pitch_hz, gender, duration, rms, zcr, centroid, audio_role, target_client_id, uploaded_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (person_type, person_id, stored_filename, original_name,
             pitch_hz, gender, duration, rms, zcr, centroid, audio_role or 'original',
             target_client_id, datetime.utcnow().isoformat())
        )
        return cur.lastrowid


def delete_audio(audio_id):
    with get_conn() as c:
        r = c.execute("SELECT stored_filename FROM audio_samples WHERE id = ?", (audio_id,)).fetchone()
        c.execute("DELETE FROM audio_samples WHERE id = ?", (audio_id,))
        return r['stored_filename'] if r else None


def delete_audio_for_person(person_type, person_id):
    with get_conn() as c:
        c.execute(
            "DELETE FROM audio_samples WHERE person_type = ? AND person_id = ?",
            (person_type, person_id)
        )


def update_audio_transcript(audio_id, transcript):
    with get_conn() as c:
        c.execute(
            "UPDATE audio_samples SET transcript = ? WHERE id = ?",
            (transcript or '', audio_id)
        )


def update_audio_meta(audio_id, original_name=None, audio_role=None, target_client_id=_MISSING):
    with get_conn() as c:
        if original_name is not None:
            c.execute("UPDATE audio_samples SET original_name = ? WHERE id = ?", (original_name, audio_id))
        if audio_role is not None:
            c.execute("UPDATE audio_samples SET audio_role = ? WHERE id = ?", (audio_role, audio_id))
        if target_client_id is not _MISSING:
            c.execute("UPDATE audio_samples SET target_client_id = ? WHERE id = ?", (target_client_id, audio_id))


def find_report(counselor_id, client_id, audio_role):
    with get_conn() as c:
        r = c.execute(
            "SELECT * FROM reports WHERE counselor_id = ? AND client_id = ? AND audio_role = ? ORDER BY id DESC LIMIT 1",
            (counselor_id, client_id, audio_role or '')
        ).fetchone()
        return dict(r) if r else None


def find_single_report(audio_id):
    with get_conn() as c:
        r = c.execute(
            "SELECT * FROM reports WHERE report_type = 'single' AND a_audio_id = ? ORDER BY id DESC LIMIT 1",
            (audio_id,)
        ).fetchone()
        return dict(r) if r else None


def create_report(a_audio_id, b_audio_id, title, html_filename,
                  counselor_id=None, client_id=None, audio_role='', report_type='pair'):
    with get_conn() as c:
        cur = c.execute(
            "INSERT INTO reports (a_audio_id, b_audio_id, counselor_id, client_id, audio_role, report_type, title, html_filename, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (a_audio_id, b_audio_id, counselor_id, client_id, audio_role or '',
             report_type or 'pair', title, html_filename, datetime.utcnow().isoformat())
        )
        return cur.lastrowid


def list_reports(person_type=None, person_id=None, report_type=None):
    with get_conn() as c:
        clauses = []
        params = []
        if person_type == 'counselor':
            clauses.append("counselor_id = ?")
            params.append(person_id)
        elif person_type == 'client':
            clauses.append("client_id = ?")
            params.append(person_id)
        if report_type:
            clauses.append("report_type = ?")
            params.append(report_type)
        where = (" WHERE " + " AND ".join(clauses)) if clauses else ""
        rows = c.execute("SELECT * FROM reports" + where + " ORDER BY id DESC", params).fetchall()
        return [dict(r) for r in rows]


def get_report(report_id):
    with get_conn() as c:
        r = c.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
        return dict(r) if r else None


def delete_report(report_id):
    with get_conn() as c:
        r = c.execute("SELECT html_filename FROM reports WHERE id = ?", (report_id,)).fetchone()
        c.execute("DELETE FROM reports WHERE id = ?", (report_id,))
        return r['html_filename'] if r else None
