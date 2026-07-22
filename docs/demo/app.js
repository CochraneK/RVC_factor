/* ==================== RVC Voice Studio — front-end (macaron edition) ==================== */
"use strict";

// ---------- Icon library (inline SVG, no emoji) ----------
const ICONS = {
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  pitch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h2l3-9 4 18 3-9 2 4 2-4h4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  centroid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h3l3-9 6 18 3-9h3"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1"/><line x1="12" y1="19" x2="12" y2="23"/></svg>`,
  micOff: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-1m14 0v1a7 7 0 0 1-.11 1.23"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  empty: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`,
  fileText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
};

// ---------- Helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Use window.api if already defined (e.g. mock-adapter.js), otherwise define it
const api = window.api || (async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = (body && body.error) ? body.error : `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
});

function toast(msg, kind = "") {
  const el = $("#toast");
  const icon = kind === "ok" ? `<span style="color:var(--green-deep)">${ICONS.check}</span>`
            : kind === "bad" ? `<span style="color:var(--pink-deep)">${ICONS.x}</span>` : "";
  el.innerHTML = `${icon}<span>${escapeHTML(msg)}</span>`;
  el.className = "toast " + kind;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), 2800);
}

function fmt(n, d = 2) {
  return (n === null || n === undefined || Number.isNaN(n)) ? "—" : Number(n).toFixed(d);
}

function verdictLabel(verdict) {
  return {
    YES: "更像同一说话人",
    NO: "更像不同说话人",
    Uncertain: "需要人工复核",
  }[verdict] || verdict || "—";
}

function confidenceLabel(confidence) {
  return {
    High: "高",
    Medium: "中等",
    Low: "低",
    "Very Low / Different": "很低",
  }[confidence] || confidence || "—";
}

function localizeReason(text) {
  return String(text || "")
    .replaceAll("Speaker embedding strongly similar (timbre)", "说话人音色特征非常接近")
    .replaceAll("Speaker embedding moderately similar", "说话人音色特征有一定相似")
    .replaceAll("Speaker embedding significantly different", "说话人音色特征差异明显")
    .replaceAll("pitch range closely matches", "音高范围很接近")
    .replaceAll("formant F2 means very close (similar vocal tract)", "F2 共振峰均值很接近，提示口腔共鸣位置相似")
    .replaceAll("spectral centroid very close", "频谱质心很接近，声音明亮度相似")
    .replaceAll("spectral centroid moderately different", "频谱质心有中等差异，声音明亮度不完全一致")
    .replaceAll("spectral centroid clearly different", "频谱质心差异明显，声音明亮度不同")
    .replaceAll("Multiple acoustic cues align, supporting same-speaker hypothesis.", "多个声音线索方向一致，因此支持同一说话人的判断。")
    .replaceAll("Multiple acoustic cues diverge, indicating different speakers.", "多个声音线索分歧较大，因此更支持不同说话人的判断。")
    .replaceAll("Evidence is mixed; further manual inspection recommended.", "目前线索有相似也有差异，建议结合人工听辨和录音条件再复核。")
    .replace(/\bpitch differs by ([\d.]+) semitones \(moderate\)/g, "音高相差约 $1 个半音，属于中等差异")
    .replace(/\bpitch differs by ([\d.]+) semitones \(large\)/g, "音高相差约 $1 个半音，差异较大")
    .replace(/\bformant F2 differs by ([\d.]+) Hz \(noticeable\)/g, "F2 共振峰相差约 $1 Hz，有可见差异")
    .replace(/\bformant F2 differs by ([\d.]+) Hz \(strong difference\)/g, "F2 共振峰相差约 $1 Hz，差异明显");
}

// Use window.avatarHTML if already defined (e.g. mock-adapter.js), otherwise define it
const avatarHTML = window.avatarHTML || (function avatarHTML(person, variant = "") {
  const cls = "avatar" + (variant ? " " + variant : "") + (person && person.sex ? ` sex-${person.sex}` : "");
  if (person.avatar_path) {
    return `<div class="${cls}"><img src="/uploads/avatars/${encodeURIComponent(person.avatar_path)}" alt=""></div>`;
  }
  const initial = (person.name || "?").trim().charAt(0).toUpperCase();
  return `<div class="${cls}">${initial}</div>`;
});

function escapeHTML(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function escapeAttr(s) { return escapeHTML(s); }

// ---------- View switching ----------
function switchView(name, opts = {}) {
  $$(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  $$(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.view === name));
  if (name === "people") loadCounselors();
  if (name === "audio" && !opts.skipAudioDefault) openAudioView("all");
  if (name === "compare") {
    if (compareAnalysis.running) showAnalysisProgress();
    else loadAnalysisControls();
  }
  if (name === "reports") {
    if (!opts.keepReportFilter) reportFilter = null;
    loadReports();
  }
}

$$(".nav-item").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));

// ==================== Modal ====================
let modalCleanup = null;
function openModal(title, bodyHTML) {
  if (modalCleanup) {
    modalCleanup();
    modalCleanup = null;
  }
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHTML;
  $("#modalMask").classList.remove("hidden");
  setTimeout(() => {
    const first = $("#modalBody input, #modalBody textarea, #modalBody select");
    if (first) first.focus();
  }, 50);
}
function closeModal() {
  if (modalCleanup) {
    modalCleanup();
    modalCleanup = null;
  }
  $("#modalMask").classList.add("hidden");
}
$("#modalClose").addEventListener("click", closeModal);
$("#modalMask").addEventListener("click", (e) => { if (e.target.id === "modalMask") closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

function fieldRow(label, inputHTML, hint = "") {
  return `<div class="field-row">
    <label>${label}</label>
    ${inputHTML}
    ${hint ? `<span class="muted" style="font-size:11px;margin-top:2px">${hint}</span>` : ""}
  </div>`;
}

// ==================== People view ====================
let counselorsCache = [];
let selectedCounselorId = null;
let reportFilter = null;

async function loadCounselors() {
  const grid = $("#counselorGrid");
  const clientPanel = $("#clientPanel");
  grid.innerHTML = Array(3).fill(`<div class="loading-row"></div>`).join("");
  if (clientPanel) clientPanel.innerHTML = `<div class="loading-row"></div>`;
  try {
    const list = await api("/api/counselors");
    counselorsCache = list;
    const totalClients = list.reduce((s, c) => s + (c.client_count || 0), 0);
    const totalAudio = list.reduce((s, c) => s + (c.audio_count || 0), 0);
    $("#dbStats").textContent = `${list.length} 位咨询师 · ${totalClients} 位来访者 · ${totalAudio} 个音频`;
    $("#counselorPanelSub").textContent = `${list.length} 位咨询师`;

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          ${ICONS.empty}
          <div class="empty-title">还没有咨询师</div>
          <div class="empty-sub">点击右上角 <b>新增人员</b> 开始</div>
        </div>`;
      selectedCounselorId = null;
      renderClientPanel([]);
      return;
    }

    if (!selectedCounselorId || !list.some(c => c.id === selectedCounselorId)) {
      selectedCounselorId = list[0].id;
    }
    renderCounselors();
    await loadSelectedClients();
  } catch (e) {
    grid.innerHTML = `<div class="empty-state">${ICONS.folder}<div class="empty-title">加载失败</div><div class="empty-sub">${escapeHTML(e.message)}</div></div>`;
    if (clientPanel) clientPanel.innerHTML = "";
  }
}

function renderCounselors() {
  const grid = $("#counselorGrid");
  grid.innerHTML = counselorsCache.map(c => counselorCardHTML(c)).join("");
}

function counselorCardHTML(c) {
  const active = c.id === selectedCounselorId ? " selected" : "";
  return `
    <div class="person-card counselor-person sex-${escapeAttr(c.sex || "")} compact${active}" data-cid="${c.id}">
      <span class="person-type-badge counselor">咨询师</span>
      <div class="card-head">
        ${avatarHTML(c, "counselor")}
        <div style="flex:1; min-width:0;">
          <div class="card-title">${escapeHTML(c.name)}</div>
          <div class="card-note">${c.note ? `“${escapeHTML(c.note)}”` : "未填写备注"}</div>
        </div>
      </div>
      <div class="card-meta">
        <span class="meta-chip pink">${ICONS.users}${c.client_count} 来访者</span>
        <span class="meta-chip blue">${ICONS.music}${c.audio_count} 音频</span>
      </div>
      <div class="card-actions client-actions">
        <button class="btn btn-sm" data-act="audio">${ICONS.music}音频</button>
        <button class="btn btn-sm btn-ghost" data-act="reports">${ICONS.eye}报告</button>
        <button class="btn btn-sm btn-ghost" data-act="edit">${ICONS.edit}编辑</button>
        <button class="btn btn-sm btn-danger" data-act="del" title="删除">${ICONS.trash}</button>
      </div>
    </div>`;
}

$("#counselorGrid").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-act]");
  if (btn) {
    const card = btn.closest(".person-card");
    const cid = Number(card.dataset.cid);
    const act = btn.dataset.act;
    if (act === "audio") return openAudioView("counselor", cid);
    if (act === "reports") return openReportsForPerson("counselor", cid, counselorsCache.find(c => c.id === cid)?.name || "咨询师");
    if (act === "edit") return editCounselor(cid);
    if (act === "del") return deleteCounselor(cid);
  }

  const card = e.target.closest(".person-card");
  if (card) {
    await selectCounselor(Number(card.dataset.cid));
  }
});

$("#clientPanel").addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-cl-act]");
  if (!btn) return;
  const clid = Number(btn.dataset.clId);
  const act = btn.dataset.clAct;
  if (act === "audio") return openAudioView("client", clid);
  if (act === "reports") return openReportsForPerson("client", clid, btn.dataset.clName || "来访者");
  if (act === "edit") return editClient(clid);
  if (act === "del") return deleteClient(clid);
});

$("#btnAddCounselor").addEventListener("click", () => openPersonModal("counselor"));
$("#btnAddClientForSelected").addEventListener("click", () => {
  if (selectedCounselorId) openPersonModal("client", null, selectedCounselorId);
});

async function selectCounselor(cid) {
  selectedCounselorId = cid;
  renderCounselors();
  await loadSelectedClients();
}

async function loadSelectedClients() {
  const counselor = counselorsCache.find(c => c.id === selectedCounselorId);
  $("#btnAddClientForSelected").disabled = !counselor;
  if (!counselor) {
    renderClientPanel([]);
    return;
  }

  $("#clientPanelTitle").textContent = `${counselor.name} 的来访者`;
  $("#clientPanelSub").textContent = "加载中…";
  $("#clientPanel").innerHTML = `<div class="loading-row"></div>`;
  try {
    const list = await api(`/api/counselors/${selectedCounselorId}/clients`);
    renderClientPanel(list, counselor);
  } catch (e) {
    $("#clientPanel").innerHTML = `<div class="empty-state">${ICONS.folder}<div class="empty-title">加载失败</div><div class="empty-sub">${escapeHTML(e.message)}</div></div>`;
  }
}

function renderClientPanel(list, counselor = null) {
  const panel = $("#clientPanel");
  if (!counselor) {
    $("#clientPanelTitle").textContent = "来访者";
    $("#clientPanelSub").textContent = "来访者列表";
    $("#btnAddClientForSelected").disabled = true;
    panel.innerHTML = `<div class="empty-state">${ICONS.users}<div class="empty-title">暂无来访者</div><div class="empty-sub">左侧咨询师的来访者会显示在这里</div></div>`;
    return;
  }
  $("#clientPanelTitle").textContent = `${counselor.name} 的来访者`;
  $("#clientPanelSub").textContent = `${list.length} 位来访者`;
  $("#btnAddClientForSelected").disabled = false;
  panel.innerHTML = list.length
    ? list.map(clientRowHTML).join("")
    : `<div class="empty-state">${ICONS.empty}<div class="empty-title">还没有来访者</div><div class="empty-sub">点击右上角新增来访者</div></div>`;
}

function clientRowHTML(cl) {
  return `
    <div class="person-card compact client-person-card sex-${escapeAttr(cl.sex || "")}">
      <span class="person-type-badge client">来访者</span>
      <div class="card-head">
        ${avatarHTML(cl, "client")}
        <div style="flex:1; min-width:0;">
          <div class="card-title">${escapeHTML(cl.name)}</div>
          <div class="card-note">${cl.note ? `“${escapeHTML(cl.note)}”` : "未填写备注"}</div>
        </div>
      </div>
      <div class="card-meta">
        <span class="meta-chip blue">${ICONS.music}${cl.audio_count} 音频</span>
      </div>
      <div class="card-actions client-actions">
        <button class="btn btn-sm" data-cl-act="audio" data-cl-id="${cl.id}">${ICONS.music}音频</button>
        <button class="btn btn-sm btn-ghost" data-cl-act="reports" data-cl-id="${cl.id}" data-cl-name="${escapeAttr(cl.name)}">${ICONS.eye}报告</button>
        <button class="btn btn-sm btn-ghost" data-cl-act="edit" data-cl-id="${cl.id}">${ICONS.edit}编辑</button>
        <button class="btn btn-sm btn-danger" data-cl-act="del" data-cl-id="${cl.id}" title="删除">${ICONS.trash}</button>
      </div>
    </div>`;
}

function avatarFieldHTML(existing, isEdit) {
  const currentAvatar = existing && existing.avatar_path
    ? `<div style="text-align:center;margin-bottom:4px;">
         <img src="avatars/${encodeURIComponent(existing.avatar_path)}" style="width:64px;height:64px;border-radius:50%;border:2.5px solid var(--pink-soft);object-fit:cover;">
         <div class="muted" style="font-size:11px;margin-top:4px;">当前头像</div>
       </div>`
    : "";
  return `
    ${currentAvatar}
    ${fieldRow("头像（可选）", `
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <label class="btn btn-sm btn-ghost" style="cursor:pointer;margin:0;">
          ${ICONS.upload} 选择图片
          <input type="file" id="f_avatar" accept="image/*" style="display:none">
        </label>
        <button class="btn btn-sm btn-ghost" id="btnOpenCamera" type="button">
          ${ICONS.camera} 拍照
        </button>
      </div>
      <div id="cameraBox" class="camera-box hidden">
        <video id="cameraVideo" autoplay playsinline></video>
        <div class="camera-actions">
          <button class="btn btn-sm btn-primary" id="btnCapturePhoto" type="button">拍摄</button>
        </div>
      </div>
      <div id="avatarPreview" class="muted avatar-preview"></div>
    `)}
  `;
}

function setupAvatarPicker() {
  let selectedFile = null;
  let selectedPreCropped = false;
  let stream = null;
  const fileInput = $("#f_avatar");
  const preview = $("#avatarPreview");
  const cameraBox = $("#cameraBox");
  const video = $("#cameraVideo");
  const openBtn = $("#btnOpenCamera");
  const captureBtn = $("#btnCapturePhoto");

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    stream = null;
    if (video) video.srcObject = null;
    if (cameraBox) cameraBox.classList.add("hidden");
  };
  const showPreview = (file, label = "已选择") => {
    selectedFile = file;
    selectedPreCropped = false;
    const url = URL.createObjectURL(file);
    preview.innerHTML = `<div class="avatar-preview-photo"><img src="${url}" alt=""></div><span>${label}</span>`;
  };
  const clampCrop = (crop, sourceW, sourceH) => {
    const size = Math.max(1, Math.min(crop.size, sourceW, sourceH));
    return {
      sx: Math.max(0, Math.min(sourceW - size, crop.sx)),
      sy: Math.max(0, Math.min(sourceH - size, crop.sy)),
      size,
    };
  };
  const renderCroppedFile = (sourceCanvas, crop, imgEl) => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const safe = clampCrop(crop, sourceCanvas.width, sourceCanvas.height);
    canvas.getContext("2d").drawImage(sourceCanvas, safe.sx, safe.sy, safe.size, safe.size, 0, 0, 512, 512);
    canvas.toBlob((blob) => {
      if (!blob) return toast("头像预览生成失败", "bad");
      selectedFile = new File([blob], `avatar_${Date.now()}.jpg`, { type: "image/jpeg" });
      selectedPreCropped = true;
      if (imgEl) imgEl.src = URL.createObjectURL(blob);
    }, "image/jpeg", 0.92);
  };
  const showCropEditor = (sourceCanvas, initialCrop) => {
    const baseCrop = clampCrop(initialCrop, sourceCanvas.width, sourceCanvas.height);
    preview.innerHTML = `
      <div class="avatar-preview-photo"><img id="avatarCropPreview" alt=""></div>
      <div class="avatar-crop-tools">
        <label>左右 <input type="range" id="avatarCropX" min="-100" max="100" value="0"></label>
        <label>上下 <input type="range" id="avatarCropY" min="-100" max="100" value="0"></label>
        <label>缩放 <input type="range" id="avatarCropZoom" min="70" max="230" value="100"></label>
      </div>
    `;
    const imgEl = $("#avatarCropPreview");
    const xEl = $("#avatarCropX");
    const yEl = $("#avatarCropY");
    const zEl = $("#avatarCropZoom");
    const update = () => {
      const zoom = Number(zEl.value) / 100;
      const size = Math.max(1, baseCrop.size / zoom);
      const crop = {
        sx: baseCrop.sx + (baseCrop.size - size) / 2 + Number(xEl.value) * size * 0.004,
        sy: baseCrop.sy + (baseCrop.size - size) / 2 + Number(yEl.value) * size * 0.004,
        size,
      };
      renderCroppedFile(sourceCanvas, crop, imgEl);
    };
    [xEl, yEl, zEl].forEach(el => el.addEventListener("input", update));
    update();
  };

  if (fileInput) fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) showPreview(fileInput.files[0], `已选择：${fileInput.files[0].name}`);
  });
  if (openBtn) openBtn.addEventListener("click", async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false
      });
      video.srcObject = stream;
      cameraBox.classList.remove("hidden");
    } catch (e) {
      toast("无法访问摄像头：" + e.message, "bad");
    }
  });
  const fallbackHeadCrop = (sourceW, sourceH) => {
    const size = Math.max(1, Math.min(sourceW, sourceH) * 0.62);
    return {
      sx: Math.max(0, (sourceW - size) / 2),
      sy: Math.max(0, Math.min(sourceH - size, sourceH * 0.04)),
      size,
    };
  };
  const faceHeadCrop = async (sourceW, sourceH) => {
    if (!("FaceDetector" in window)) return fallbackHeadCrop(sourceW, sourceH);
    try {
      const frame = document.createElement("canvas");
      frame.width = sourceW;
      frame.height = sourceH;
      frame.getContext("2d").drawImage(video, 0, 0, sourceW, sourceH);
      const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      const faces = await detector.detect(frame);
      if (!faces || !faces.length) return fallbackHeadCrop(sourceW, sourceH);
      const box = faces[0].boundingBox;
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height * 0.34;
      const size = Math.min(sourceW, sourceH, Math.max(box.width * 2.35, box.height * 2.85));
      return {
        sx: Math.max(0, Math.min(sourceW - size, centerX - size / 2)),
        sy: Math.max(0, Math.min(sourceH - size, centerY - size * 0.32)),
        size,
      };
    } catch (e) {
      return fallbackHeadCrop(sourceW, sourceH);
    }
  };

  if (captureBtn) captureBtn.addEventListener("click", async () => {
    if (!video || !video.videoWidth) {
      toast("摄像头画面还未准备好", "bad");
      return;
    }
    const sourceW = video.videoWidth;
    const sourceH = video.videoHeight;
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = sourceW;
    sourceCanvas.height = sourceH;
    sourceCanvas.getContext("2d").drawImage(video, 0, 0, sourceW, sourceH);
    const crop = await faceHeadCrop(sourceW, sourceH);
    showCropEditor(sourceCanvas, crop);
    stopCamera();
  });
  modalCleanup = stopCamera;
  return () => ({ file: selectedFile, preCropped: selectedPreCropped });
}

function openAddPersonModal() {
  const counselorOptions = counselorsCache.map(c => `<option value="${c.id}" ${c.id === selectedCounselorId ? "selected" : ""}>${escapeHTML(c.name)}</option>`).join("");
  openModal("新增人员", `
    ${fieldRow("人员类型", `
      <select id="f_kind">
        <option value="counselor">咨询师</option>
        <option value="client">来访者</option>
      </select>
    `)}
    <div id="f_parent_wrap" class="hidden">
      ${fieldRow("归属咨询师", `
        <select id="f_parent_cid" ${counselorsCache.length ? "" : "disabled"}>
          ${counselorOptions || `<option value="">请先创建咨询师</option>`}
        </select>
      `)}
    </div>
    ${fieldRow("姓名 *", `<input type="text" id="f_name" placeholder="请输入姓名">`)}
    ${fieldRow("性别", `
      <select id="f_sex">
        <option value="">未填写</option>
        <option value="female">女</option>
        <option value="male">男</option>
      </select>
    `)}
    ${fieldRow("备注（可选）", `<textarea id="f_note" rows="2" placeholder=""></textarea>`)}
    ${avatarFieldHTML(null, false)}
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" id="f_save">创建</button>
    </div>
  `);

  const getAvatarFile = setupAvatarPicker();
  const kindSel = $("#f_kind");
  const parentWrap = $("#f_parent_wrap");
  const syncKind = () => parentWrap.classList.toggle("hidden", kindSel.value !== "client");
  kindSel.addEventListener("change", syncKind);
  syncKind();

  $("#f_save").addEventListener("click", async () => {
    const kind = kindSel.value;
    const name = $("#f_name").value.trim();
    if (!name) { toast("请填写姓名", "bad"); $("#f_name").focus(); return; }
    if (kind === "client" && !$("#f_parent_cid").value) {
      toast("请选择归属咨询师", "bad");
      return;
    }

    const fd = new FormData();
    fd.append("name", name);
    fd.append("sex", $("#f_sex").value);
    fd.append("note", $("#f_note").value);
    const avatar = getAvatarFile();
    if (avatar.file) {
      fd.append("avatar", avatar.file);
      if (avatar.preCropped) fd.append("avatar_pre_cropped", "1");
    }
    try {
      if (kind === "counselor") {
        const created = await api("/api/counselors", { method: "POST", body: fd });
        selectedCounselorId = created.id;
      } else {
        const cid = Number($("#f_parent_cid").value);
        await api(`/api/counselors/${cid}/clients`, { method: "POST", body: fd });
        selectedCounselorId = cid;
      }
      toast("已创建", "ok");
      closeModal();
      await loadCounselors();
    } catch (e) { toast(e.message, "bad"); }
  });
}

// ---- Counselor create/edit/delete ----
function openPersonModal(kind, existing = null, cid = null) {
  const isEdit = !!existing;
  const title = `${isEdit ? "编辑" : "新建"}${kind === "counselor" ? "咨询师" : "来访者"}`;
  openModal(title, `
    ${fieldRow("姓名 *", `<input type="text" id="f_name" placeholder="${kind === "counselor" ? "如：张老师" : "如：李同学"}" value="${existing ? escapeAttr(existing.name) : ""}">`)}
    ${fieldRow("性别", `
      <select id="f_sex">
        <option value="" ${!existing || !existing.sex ? "selected" : ""}>未填写</option>
        <option value="female" ${existing && existing.sex === "female" ? "selected" : ""}>女</option>
        <option value="male" ${existing && existing.sex === "male" ? "selected" : ""}>男</option>
      </select>
    `)}
    ${fieldRow("备注（可选）", `<textarea id="f_note" rows="2" placeholder="">${existing ? escapeHTML(existing.note || "") : ""}</textarea>`)}
    ${avatarFieldHTML(existing, isEdit)}
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" id="f_save">${isEdit ? "保存修改" : "创建"}</button>
    </div>
  `);
  const getAvatarFile = setupAvatarPicker();
  $("#f_save").addEventListener("click", async () => {
    const name = $("#f_name").value.trim();
    if (!name) { toast("请填写姓名", "bad"); $("#f_name").focus(); return; }
    const fd = new FormData();
    fd.append("name", name);
    fd.append("sex", $("#f_sex").value);
    fd.append("note", $("#f_note").value);
    const avatar = getAvatarFile();
    if (avatar.file) {
      fd.append("avatar", avatar.file);
      if (avatar.preCropped) fd.append("avatar_pre_cropped", "1");
    }
    try {
      if (isEdit) {
        const url = kind === "counselor"
          ? `/api/counselors/${existing.id}`
          : `/api/clients/${existing.id}`;
        await api(url, { method: "PUT", body: fd });
        toast("已更新", "ok");
      } else {
        if (kind === "counselor") {
          await api("/api/counselors", { method: "POST", body: fd });
        } else {
          await api(`/api/counselors/${cid}/clients`, { method: "POST", body: fd });
        }
        toast(`${kind === "counselor" ? "咨询师" : "来访者"}已创建`, "ok");
      }
      closeModal();
      await refreshAfterPersonChange(kind, isEdit ? existing.id : null, cid);
    } catch (e) { toast(e.message, "bad"); }
  });
}

async function refreshAfterPersonChange(kind, personId, parentCid) {
  if (kind === "client" && parentCid) selectedCounselorId = parentCid;
  if (kind === "counselor" && personId) selectedCounselorId = personId;
  await loadCounselors();
}

async function editCounselor(cid) {
  const c = await api(`/api/counselors/${cid}`);
  openPersonModal("counselor", c);
}
async function deleteCounselor(cid) {
  if (!confirm("删除咨询师将同时删除其名下所有来访者与音频，确认继续？")) return;
  try {
    await api(`/api/counselors/${cid}`, { method: "DELETE" });
    toast("已删除", "ok"); loadCounselors();
  } catch (e) { toast(e.message, "bad"); }
}

function newClient(cid) { openPersonModal("client", null, cid); }
async function editClient(clid) {
  const cl = await api(`/api/clients/${clid}`);
  openPersonModal("client", cl, cl.counselor_id);
}
async function deleteClient(clid) {
  if (!confirm("删除该来访者及其名下所有音频？")) return;
  try {
    await api(`/api/clients/${clid}`, { method: "DELETE" });
    toast("已删除", "ok");
    await loadCounselors();
  } catch (e) { toast(e.message, "bad"); }
}

// ==================== Audio view ====================
let audioContext = null;
let audioListCache = [];

async function openAudioView(type, id) {
  audioContext = { type, id, clients: [] };
  switchView("audio", { skipAudioDefault: true });
  if (type === "all") {
    $("#audioTitle").textContent = "全部音频";
    $("#btnBackAudio").classList.add("hidden");
    $("#audioContext").innerHTML = `
      <div class="avatar">${ICONS.music}</div>
      <div>
        <div style="font-weight:700;font-size:16px">全部音频列表</div>
        <div class="muted" style="font-size:12px">共 <b id="audioCount">—</b> 个音频</div>
      </div>`;
    await loadAudioList();
    return;
  }
  $("#btnBackAudio").classList.remove("hidden");
  const person = type === "counselor"
    ? await api(`/api/counselors/${id}`)
    : await api(`/api/clients/${id}`);
  if (type === "counselor") {
    audioContext.clients = await api(`/api/counselors/${id}/clients`);
  }
  audioContext.person = person;
  $("#audioTitle").textContent = `${person.name} · 音频库`;
  const roleLabel = type === "counselor" ? "咨询师" : "来访者";
  $("#audioContext").innerHTML = `
    ${avatarHTML(person, type === "client" ? "client" : "")}
    <div>
      <div style="font-weight:700;font-size:16px">${escapeHTML(person.name)}</div>
      <div class="muted" style="font-size:12px">${roleLabel} · 共 <b id="audioCount">—</b> 个音频</div>
    </div>`;
  await loadAudioList();
}

async function loadAudioList(highlightId = null) {
  const { type, id } = audioContext;
  const listEl = $("#audioList");
  listEl.innerHTML = `<div class="loading-row"></div>`;
  try {
    const list = type === "all"
      ? await api("/api/audios")
      : await api(`/api/persons/${type}/${id}/audios`);
    audioListCache = list;
    const countEl = $("#audioCount");
    if (countEl) countEl.textContent = list.length;
    listEl.innerHTML = list.length
      ? list.map(a => audioRowHTML(a, highlightId)).join("") + (type === "all" ? "" : uploadZoneHTML())
      : `<div class="empty-state">${ICONS.music}<div class="empty-title">还没有音频</div><div class="empty-sub">${type === "all" ? "人员音频会显示在这里" : "使用下方上传或录音"}</div></div>` + (type === "all" ? "" : uploadZoneHTML());
    if (type !== "all") bindUploadZone();
    if (highlightId) {
      const row = listEl.querySelector(`[data-audio-id="${highlightId}"]`);
      if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch (e) {
    listEl.innerHTML = `<div class="empty-state">${ICONS.folder}<div class="empty-title">加载失败</div><div class="empty-sub">${escapeHTML(e.message)}</div></div>`;
  }
}

function audioRowHTML(a, highlightId = null) {
  const genderLabel = a.gender === null || a.gender === undefined
    ? "—"
    : a.gender < 0.4 ? `男声倾向 ${fmt(a.gender, 2)}`
    : a.gender > 0.6 ? `女声倾向 ${fmt(a.gender, 2)}`
    : `中性 ${fmt(a.gender, 2)}`;

  return `
    <div class="audio-row ${Number(a.id) === Number(highlightId) ? "just-saved" : ""}" data-audio-id="${a.id}">
      <audio controls preload="none" src="/api/audios/${a.id}/file"></audio>
      <div class="audio-info">
        <div class="audio-name">${ICONS.music}<span>${escapeHTML(a.original_name || a.stored_filename)}</span></div>
        ${a.person_name ? `<div class="audio-owner">${escapeHTML(a.person_name)} · ${a.person_type === "counselor" ? "咨询师" : "来访者"}</div>` : ""}
        <div class="audio-file-path">保存文件：output/uploads/audio/${escapeHTML(a.stored_filename || "")}</div>
        ${audioRoleHTML(a)}
        <div class="audio-feats metric-feats">
          ${audioMetricHTML("基频 F0", a.pitch_hz ? `${fmt(a.pitch_hz, 1)} Hz` : "—", "pitch")}
          ${audioMetricHTML("声线倾向", genderLabel, "gender")}
          ${audioMetricHTML("时长", a.duration ? `${fmt(a.duration, 1)} s` : "—", "dur")}
          ${audioMetricHTML("频谱质心", a.centroid ? `${Math.round(a.centroid)} Hz` : "—", "centroid")}
          ${audioMetricHTML("RMS", a.rms ? fmt(a.rms, 3) : "—", "")}
          ${audioMetricHTML("ZCR", a.zcr ? fmt(a.zcr, 3) : "—", "")}
        </div>
        ${a.transcript ? `<div class="audio-transcript">${escapeHTML(a.transcript)}</div>` : ""}
      </div>
      <div class="audio-actions">
        <button class="btn btn-sm btn-ghost" data-edit-audio="${a.id}" title="重命名和标签">${ICONS.edit}</button>
        <button class="btn btn-sm btn-ghost" data-transcribe-audio="${a.id}" data-transcript="${escapeAttr(a.transcript || "")}" title="转文字">${ICONS.fileText}</button>
        <button class="btn btn-sm btn-danger" data-del-audio="${a.id}" title="删除">${ICONS.trash}</button>
      </div>
    </div>`;
}

function audioRoleHTML(a) {
  if (a.person_type !== "counselor") return "";
  const role = a.audio_role === "converted" ? "变音" : "原音";
  const target = a.audio_role === "converted" && a.target_client_name
    ? ` · ${escapeHTML(a.target_client_name)}`
    : "";
  return `<div class="audio-role"><span class="${a.audio_role === "converted" ? "converted" : "original"}">${role}${target}</span></div>`;
}

function audioMetricHTML(label, value, tone) {
  return `<div class="audio-metric ${tone}">
    <span>${label}</span>
    <b>${escapeHTML(value)}</b>
  </div>`;
}

const NAME_CODE_MAP = {
  "阿": "A", "安": "AN", "白": "B", "包": "B", "陈": "CH", "程": "CH", "崔": "C",
  "戴": "D", "邓": "D", "丁": "D", "董": "D", "杜": "D", "范": "F", "方": "F",
  "冯": "F", "高": "G", "郭": "G", "韩": "H", "何": "H", "胡": "H", "黄": "H",
  "贾": "J", "姜": "J", "蒋": "J", "金": "J", "康": "K", "孔": "K", "李": "L",
  "刘": "L", "老": "L", "梁": "L", "林": "L", "罗": "L", "吕": "L", "马": "M",
  "牛": "N", "彭": "P", "钱": "Q", "秦": "Q", "邱": "Q", "任": "R", "沈": "SH",
  "师": "SH", "宋": "S", "孙": "S", "唐": "T", "田": "T", "王": "W", "吴": "W",
  "夏": "X", "肖": "X", "谢": "X", "辛": "X", "徐": "X", "许": "X", "杨": "Y",
  "羊": "YA", "姚": "Y", "叶": "Y", "一": "Y", "远": "YU", "于": "YU", "余": "YU",
  "袁": "YU", "张": "ZH", "赵": "ZH", "郑": "ZH", "周": "ZH", "朱": "ZH",
  "钟": "ZH", "晓": "X", "娟": "JU"
};

function nameCode(name, upper = true) {
  const parts = [];
  for (const ch of String(name || "").replace(/\s+/g, "")) {
    if (/^[a-z0-9]$/i.test(ch)) parts.push(ch.toUpperCase());
    else parts.push(NAME_CODE_MAP[ch] || "");
    if (parts.join("").length >= 4) break;
  }
  const code = (parts.join("").slice(0, 4) || "AUD");
  return upper ? code.toUpperCase() : code.toLowerCase();
}

function sexCode(sex) {
  if (sex === "female") return "F";
  if (sex === "male") return "M";
  return "U";
}

function localSuggestedAudioName(role = "original", targetId = "") {
  if (!audioContext || !audioContext.person) return "";
  const target = (audioContext.clients || []).find(c => String(c.id) === String(targetId));
  const suffix = role === "converted" && target ? nameCode(target.name, false) : "Raw";
  const base = `${nameCode(audioContext.person.name)}_${sexCode(audioContext.person.sex)}_${suffix}`;
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_(\\d+)$`, "i");
  let maxNo = 0;
  for (const audio of audioListCache || []) {
    const match = re.exec(audio.original_name || "");
    if (match) maxNo = Math.max(maxNo, Number(match[1]));
  }
  return `${base}_${String(maxNo + 1).padStart(2, "0")}`;
}

function uploadZoneHTML() {
  const clientOptions = (audioContext?.clients || [])
    .map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`)
    .join("");
  const defaultName = localSuggestedAudioName("original");
  const counselorOptions = audioContext?.type === "counselor" ? `
    <div class="upload-options">
      <div class="field">
        <label>音频名称</label>
        <input type="text" id="audioDisplayName" value="${escapeAttr(defaultName)}">
      </div>
      <div class="field">
        <label>音频标签</label>
        <select id="audioRole">
          <option value="original">原音</option>
          <option value="converted">变音</option>
        </select>
      </div>
      <div class="field hidden" id="targetClientWrap">
        <label>对应来访者</label>
        <select id="targetClientId" ${clientOptions ? "" : "disabled"}>
          ${clientOptions || `<option value="">暂无来访者</option>`}
        </select>
      </div>
    </div>` : `
    <div class="upload-options">
      <div class="field">
        <label>音频名称</label>
        <input type="text" id="audioDisplayName" value="${escapeAttr(defaultName)}">
      </div>
    </div>`;
  return `
    <div class="upload-zone" id="uploadZone">
      <div class="upload-drop" id="uploadDrop">
        <div class="upload-drop-icon">${ICONS.upload}</div>
        <div>
          <div class="upload-drop-title">点击或拖拽上传音频</div>
          <div class="hint">支持 wav / mp3 / flac / ogg / m4a，最大 64 MB</div>
        </div>
        <button class="btn btn-sm btn-primary" id="btnPickAudio" type="button">${ICONS.upload} 选择文件</button>
      </div>
      <div class="upload-controls">
        ${counselorOptions}
        <div class="record-control">
          <button class="btn btn-sm" id="btnRecord" type="button">${ICONS.mic} 开始录音</button>
          <span id="recHint" class="muted"></span>
        </div>
      </div>
      <input type="file" id="fileInput" accept=".wav,.mp3,.flac,.ogg,.m4a">
    </div>`;
}

$("#audioList").addEventListener("click", async (e) => {
  const edit = e.target.closest("[data-edit-audio]");
  if (edit) {
    const audio = audioListCache.find(a => a.id === Number(edit.dataset.editAudio));
    if (audio) openAudioMetaModal(audio);
    return;
  }
  const transcribe = e.target.closest("[data-transcribe-audio]");
  if (transcribe) {
    openTranscriptModal(Number(transcribe.dataset.transcribeAudio), transcribe.dataset.transcript || "");
    return;
  }
  const del = e.target.closest("[data-del-audio]");
  if (del) {
    if (!confirm("删除该音频？")) return;
    try {
      await api(`/api/audios/${del.dataset.delAudio}`, { method: "DELETE" });
      toast("已删除", "ok"); loadAudioList();
    } catch (err) { toast(err.message, "bad"); }
  }
});

async function openAudioMetaModal(audio) {
  const isCounselorAudio = audio.person_type === "counselor";
  const clients = isCounselorAudio ? await api(`/api/counselors/${audio.person_id}/clients`) : [];
  const clientOptions = clients
    .map(c => `<option value="${c.id}" ${audio.target_client_id === c.id ? "selected" : ""}>${escapeHTML(c.name)}</option>`)
    .join("");
  openModal("音频信息", `
    ${fieldRow("音频名称", `<input type="text" id="audioMetaName" value="${escapeAttr(audio.original_name || audio.stored_filename)}">`)}
    ${isCounselorAudio ? `
      ${fieldRow("音频标签", `
        <select id="audioMetaRole">
          <option value="original" ${audio.audio_role !== "converted" ? "selected" : ""}>原音</option>
          <option value="converted" ${audio.audio_role === "converted" ? "selected" : ""}>变音</option>
        </select>
      `)}
      <div id="audioMetaTargetWrap">
        ${fieldRow("对应来访者", `
          <select id="audioMetaTarget" ${clientOptions ? "" : "disabled"}>
            ${clientOptions || `<option value="">暂无来访者</option>`}
          </select>
        `)}
      </div>
    ` : ""}
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" id="btnSaveAudioMeta">${ICONS.check} 保存</button>
    </div>
  `);
  const roleSel = $("#audioMetaRole");
  const targetWrap = $("#audioMetaTargetWrap");
  const sync = () => {
    if (targetWrap && roleSel) targetWrap.classList.toggle("hidden", roleSel.value !== "converted");
  };
  if (roleSel) roleSel.addEventListener("change", sync);
  sync();
  $("#btnSaveAudioMeta").addEventListener("click", async () => {
    const payload = { original_name: $("#audioMetaName").value.trim() };
    if (isCounselorAudio) {
      payload.audio_role = roleSel.value;
      payload.target_client_id = roleSel.value === "converted" ? $("#audioMetaTarget").value : null;
    }
    try {
      await api(`/api/audios/${audio.id}/meta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast("音频信息已更新", "ok");
      closeModal();
      await loadAudioList();
    } catch (e) { toast(e.message, "bad"); }
  });
}

function openTranscriptModal(audioId, existingText = "") {
  openModal("音频转文字", `
    ${fieldRow("转写内容", `<textarea id="transcriptText" rows="8" placeholder="">${escapeHTML(existingText)}</textarea>`)}
    <div class="transcript-actions">
      <button class="btn btn-ghost" id="btnSpeechListen" type="button">${ICONS.mic} 语音识别</button>
      <button class="btn btn-primary" id="btnSaveTranscript" type="button">${ICONS.check} 保存</button>
    </div>
  `);

  const area = $("#transcriptText");
  const listenBtn = $("#btnSpeechListen");
  const saveBtn = $("#btnSaveTranscript");
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let listening = false;
  let finalText = existingText || "";

  const stopListening = () => {
    if (recognition && listening) recognition.stop();
    listening = false;
    if (listenBtn) listenBtn.innerHTML = `${ICONS.mic} 语音识别`;
  };

  if (!Recognition) {
    listenBtn.disabled = true;
    listenBtn.title = "当前浏览器不支持语音识别，可手动输入后保存";
  } else {
    recognition = new Recognition();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text;
        else interim += text;
      }
      area.value = (finalText + interim).trim();
    };
    recognition.onerror = (event) => {
      toast("语音识别失败：" + (event.error || "未知错误"), "bad");
      stopListening();
    };
    recognition.onend = () => {
      listening = false;
      listenBtn.innerHTML = `${ICONS.mic} 语音识别`;
      finalText = area.value.trim();
    };
    listenBtn.addEventListener("click", () => {
      if (listening) return stopListening();
      finalText = area.value.trim();
      try {
        recognition.start();
        listening = true;
        listenBtn.innerHTML = `<span class="recording-pulse"></span> 停止识别`;
      } catch (e) {
        toast("无法开始语音识别：" + e.message, "bad");
      }
    });
  }

  saveBtn.addEventListener("click", async () => {
    stopListening();
    saveBtn.disabled = true;
    try {
      await api(`/api/audios/${audioId}/transcript`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: area.value.trim() }),
      });
      toast("转写内容已保存", "ok");
      closeModal();
      await loadAudioList();
    } catch (e) {
      toast(e.message, "bad");
    } finally {
      saveBtn.disabled = false;
    }
  });

  modalCleanup = stopListening;
}

function bindUploadZone() {
  const zone = $("#uploadZone");
  const input = $("#fileInput");
  if (!zone || !input) return;
  const roleSel = $("#audioRole");
  const targetWrap = $("#targetClientWrap");
  const targetSel = $("#targetClientId");
  const nameInput = $("#audioDisplayName");
  let audioNameTouched = false;
  const fetchSuggestedAudioName = async () => {
    if (!audioContext || audioContext.type === "all") return "";
    const role = roleSel?.value || "original";
    const target = targetSel?.value || "";
    if (audioContext.type === "counselor" && role === "converted" && !target) return "";
    const qs = new URLSearchParams({ audio_role: role });
    if (target) qs.set("target_client_id", target);
    const r = await api(`/api/persons/${audioContext.type}/${audioContext.id}/audio_name_suggestion?${qs.toString()}`);
    return r.name || "";
  };
  const refreshSuggestedName = async (force = false) => {
    if (!audioContext || audioContext.type === "all" || !nameInput) return;
    if (audioNameTouched && !force) return;
    const role = roleSel?.value || "original";
    const target = targetSel?.value || "";
    nameInput.value = localSuggestedAudioName(role, target);
    try {
      nameInput.value = await fetchSuggestedAudioName() || nameInput.value;
    } catch (e) {
      nameInput.value = localSuggestedAudioName(role, target);
    }
  };
  const syncRole = () => {
    if (roleSel && targetWrap) targetWrap.classList.toggle("hidden", roleSel.value !== "converted");
    refreshSuggestedName();
  };
  if (nameInput) nameInput.addEventListener("input", () => { audioNameTouched = true; });
  if (roleSel) roleSel.addEventListener("change", syncRole);
  if (targetSel) targetSel.addEventListener("change", () => refreshSuggestedName());
  syncRole();
  refreshSuggestedName(true);
  const pickBtn = $("#btnPickAudio");
  if (pickBtn) pickBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    input.click();
  });
  zone.addEventListener("click", (e) => {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select") || e.target.closest("label")) return;
    if (e.target.closest("#uploadDrop")) {
      input.click();
      return;
    }
  });
  input.addEventListener("change", () => {
    if (input.files[0]) uploadAudio(input.files[0]);
    input.value = "";
  });
  ["dragenter", "dragover"].forEach(ev =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("drag"); }));
  ["dragleave", "drop"].forEach(ev =>
    zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("drag"); }));
  zone.addEventListener("drop", (e) => {
    const f = e.dataTransfer.files[0];
    if (f) uploadAudio(f);
  });
  const recBtn = $("#btnRecord");
  if (recBtn) recBtn.addEventListener("click", toggleRecord);
}

$("#btnBackAudio").addEventListener("click", () => openAudioView("all"));

async function suggestedAudioNameForCurrentContext() {
  if (!audioContext || audioContext.type === "all") return "";
  const role = $("#audioRole")?.value || "original";
  const target = $("#targetClientId")?.value || "";
  if (audioContext.type === "counselor" && role === "converted" && !target) return "";
  const qs = new URLSearchParams({ audio_role: role });
  if (target) qs.set("target_client_id", target);
  try {
    const r = await api(`/api/persons/${audioContext.type}/${audioContext.id}/audio_name_suggestion?${qs.toString()}`);
    return r.name || "";
  } catch (e) {
    return "";
  }
}

async function uploadAudio(file) {
  const fd = new FormData();
  fd.append("audio", file);
  const nameInput = $("#audioDisplayName");
  let customName = (nameInput?.value || "").trim();
  if (!customName) {
    customName = await suggestedAudioNameForCurrentContext();
    if (nameInput && customName) nameInput.value = customName;
  }
  if (customName) fd.append("audio_name", customName);
  if (audioContext.type === "counselor") {
    const role = $("#audioRole")?.value || "original";
    fd.append("audio_role", role);
    if (role === "converted") {
      const targetId = $("#targetClientId")?.value || "";
      if (!targetId) {
        toast("请选择变音对应的来访者", "bad");
        return;
      }
      fd.append("target_client_id", targetId);
    }
  }
  toast("上传中…");
  try {
    const saved = await api(`/api/persons/${audioContext.type}/${audioContext.id}/audios`, { method: "POST", body: fd });
    toast(`已保存：${saved.original_name || saved.stored_filename}`, "ok");
    await loadAudioList(saved.id);
  } catch (e) { toast(e.message, "bad"); }
}

// ---------- Browser recording (PCM → wav in-browser, no ffmpeg needed) ----------
let recording = false;
let recordStream = null;
let recordCtx = null;
let recordSource = null;
let recordProcessor = null;
let recordChunks = [];
let recordSampleRate = 0;

function mergeFloat32Chunks(chunks) {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function pcmToWavBlob(pcm, sr) {
  if (!pcm || pcm.length === 0 || !sr) {
    throw new Error("录音为空，请重新录制");
  }
  const numCh = 1;
  // WAV header builder
  const buf = new ArrayBuffer(44 + pcm.length * 2);
  const v = new DataView(buf);
  const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) v.setUint8(off + i, str.charCodeAt(i)); };
  writeStr(0, "RIFF");
  v.setUint32(4, 36 + pcm.length * 2, true);
  writeStr(8, "WAVE"); writeStr(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true);  // PCM 16-bit
  v.setUint16(22, numCh, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * numCh * 2, true); v.setUint16(32, numCh * 2, true);
  v.setUint16(34, 16, true);
  writeStr(36, "data");
  v.setUint32(40, pcm.length * 2, true);
  let off = 44;
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    off += 2;
  }
  return new Blob([buf], { type: "audio/wav" });
}

function resetRecordButton() {
  const btn = $("#btnRecord");
  if (!btn) return;
  btn.disabled = false;
  btn.innerHTML = `${ICONS.mic} 开始录音`;
}

function stopRecord() {
  const btn = $("#btnRecord");
  const hint = $("#recHint");
  if (!recording) {
    recording = false;
    resetRecordButton();
    if (hint) hint.innerHTML = "";
    return;
  }

  if (btn) btn.disabled = true;
  if (hint) hint.innerHTML = "正在结束录音…";
  try {
    if (recordProcessor) recordProcessor.disconnect();
    if (recordSource) recordSource.disconnect();
    if (recordStream) recordStream.getTracks().forEach(t => t.stop());
    const closePromise = recordCtx ? recordCtx.close() : Promise.resolve();
    closePromise.finally(async () => {
      recording = false;
      resetRecordButton();
      if (hint) hint.innerHTML = "正在生成音频…";
      try {
        const pcm = mergeFloat32Chunks(recordChunks);
        if (pcm.length < recordSampleRate) throw new Error("录音太短，请至少录制 1 秒");
        const wavBlob = pcmToWavBlob(pcm, recordSampleRate);
        const file = new File([wavBlob], `recording_${Date.now()}.wav`, { type: "audio/wav" });
        if (hint) hint.innerHTML = "";
        await uploadAudio(file);
      } catch (e) {
        if (hint) hint.innerHTML = "";
        toast("录音生成失败：" + e.message, "bad");
      } finally {
        recordStream = null;
        recordCtx = null;
        recordSource = null;
        recordProcessor = null;
        recordChunks = [];
        recordSampleRate = 0;
      }
    });
  } catch (e) {
    recording = false;
    resetRecordButton();
    if (hint) hint.innerHTML = "";
    toast("停止录音失败：" + e.message, "bad");
  }
}

async function toggleRecord() {
  if (recording) return stopRecord();
  const btn = $("#btnRecord");
  const hint = $("#recHint");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1 } });
    recordStream = stream;
    recordCtx = new (window.AudioContext || window.webkitAudioContext)();
    recordSampleRate = recordCtx.sampleRate;
    recordChunks = [];
    recordSource = recordCtx.createMediaStreamSource(stream);
    recordProcessor = recordCtx.createScriptProcessor(4096, 1, 1);
    recordProcessor.onaudioprocess = (event) => {
      if (!recording) return;
      recordChunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };
    recordSource.connect(recordProcessor);
    recordProcessor.connect(recordCtx.destination);
    recording = true;
    btn.innerHTML = `<span class="recording-pulse"></span> 停止录音`;
    hint.innerHTML = "录音中…再次点击停止";
  } catch (e) {
    recording = false;
    resetRecordButton();
    toast("无法访问麦克风：" + e.message, "bad");
  }
}

// ==================== Analysis view ====================
let currentAnalysisMode = "pair";
let lastSingleAudioId = null;

function setAnalysisMode(mode) {
  currentAnalysisMode = mode;
  $$(".analysis-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.analysisMode === mode));
  $("#singleAnalysisPanel").classList.toggle("hidden", mode !== "single");
  $("#pairAnalysisPanel").classList.toggle("hidden", mode !== "pair");
  $("#compareResult").innerHTML = "";
  if (mode === "single") {
    $("#btnDownloadReport").disabled = true;
    loadSingleDropdowns();
  } else {
    loadCompareDropdowns();
  }
}

async function loadAnalysisControls() {
  if (currentAnalysisMode === "single") await loadSingleDropdowns();
  else await loadCompareDropdowns();
}

async function loadSingleDropdowns() {
  try {
    const type = $("#singlePersonType").value;
    const sel = $("#singlePerson");
    resetSelect("singleAudio", "— 选择 —");
    let persons = [];
    if (type === "counselor") {
      persons = await api("/api/counselors");
    } else {
      const counselors = await api("/api/counselors");
      const nested = await Promise.all(counselors.map(c => api(`/api/counselors/${c.id}/clients`)));
      persons = nested.flat();
    }
    fillSelect("singlePerson", persons, p => p.name, "— 选择 —");
    if (!persons.length) sel.innerHTML = `<option value="">（无）</option>`;
  } catch (e) { toast(e.message, "bad"); }
}

$("#singlePersonType").addEventListener("change", loadSingleDropdowns);

$("#singlePerson").addEventListener("change", async (e) => {
  const pid = e.target.value;
  resetSelect("singleAudio", "— 选择 —");
  lastSingleAudioId = null;
  $("#btnSingleReport").disabled = true;
  if (!pid) return;
  try {
    const audios = await api(`/api/persons/${$("#singlePersonType").value}/${pid}/audios`);
    fillSelect("singleAudio", audios, compareAudioLabel);
  } catch (err) { toast(err.message, "bad"); }
});

$("#btnRunSingleAnalysis").addEventListener("click", async () => {
  const aid = $("#singleAudio").value;
  if (!aid) { toast("请选择一段音频", "bad"); return; }
  try {
    const audio = await api(`/api/audios/${aid}`);
    lastSingleAudioId = Number(aid);
    renderSingleAnalysis(audio);
    $("#btnSingleReport").disabled = false;
  } catch (e) { toast(e.message, "bad"); }
});

$("#singleAudio").addEventListener("change", () => {
  lastSingleAudioId = null;
  $("#btnSingleReport").disabled = true;
  $("#compareResult").innerHTML = "";
});

$("#btnSingleReport").addEventListener("click", () => {
  const aid = lastSingleAudioId || Number($("#singleAudio").value);
  if (!aid) return;
  const btn = $("#btnSingleReport");
  const oldHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> 生成报告…`;
  api(`/api/report_html_single/${aid}`)
    .then((r) => {
      toast("单人报告已生成", "ok");
      const opened = window.open(r.url, "_blank");
      if (opened) opened.opener = null;
      else window.location.href = r.url;
      if ($("#view-reports").classList.contains("active")) loadReports();
    })
    .catch((e) => toast(e.message, "bad"))
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = oldHTML;
    });
});

function singleGenderText(audio) {
  if (audio.gender === null || audio.gender === undefined) return "暂时无法判断";
  if (audio.gender < 0.4) return `男声倾向 ${fmt(audio.gender, 2)}`;
  if (audio.gender > 0.6) return `女声倾向 ${fmt(audio.gender, 2)}`;
  return `中性 ${fmt(audio.gender, 2)}`;
}

function renderSingleAnalysis(audio) {
  const metricCard = (name, value, note = "") => `
    <div class="metric-card">
      <div class="metric-name">${name}</div>
      <div class="metric-value">${escapeHTML(value)}</div>
      ${note ? `<div class="metric-note">${escapeHTML(note)}</div>` : ""}
    </div>`;
  const pitch = audio.pitch_hz ? `${fmt(audio.pitch_hz, 1)} Hz` : "—";
  const dur = audio.duration ? `${fmt(audio.duration, 1)} 秒` : "—";
  const centroid = audio.centroid ? `${Math.round(audio.centroid)} Hz` : "—";
  const rms = audio.rms ? fmt(audio.rms, 3) : "—";
  const zcr = audio.zcr ? fmt(audio.zcr, 3) : "—";
  $("#compareResult").innerHTML = `
    <div class="single-analysis-summary">
      <h2>${escapeHTML(audio.original_name || audio.stored_filename)}</h2>
      <p>这是一段单人声音特征概览，用来查看音高、响度、明亮度和声音稳定程度；它不判断两个人是否相像。</p>
    </div>
    <div class="metric-grid">
      ${metricCard("基频 F0", pitch, "可以理解为这段声音的主要高低。")}
      ${metricCard("声线倾向", singleGenderText(audio), "根据音高和声学特征给出的粗略倾向，不等同于真实性别。")}
      ${metricCard("时长", dur, "录音越短，分析越容易受某一句话影响。")}
      ${metricCard("频谱质心", centroid, "数值越高，声音通常越亮；数值越低，声音通常越厚。")}
      ${metricCard("RMS", rms, "可以理解为平均音量强度，过低可能说明录音偏小。")}
      ${metricCard("ZCR", zcr, "反映声音里细碎变化的多少，噪声多时可能变高。")}
    </div>`;
}

$$(".analysis-tab").forEach(btn => btn.addEventListener("click", () => setAnalysisMode(btn.dataset.analysisMode)));

// ==================== Pair compare view ====================
async function loadCompareDropdowns() {
  try {
    const counselors = await api("/api/counselors");
    const csel = $("#cmpCounselor");
    csel.innerHTML = `<option value="">— 选择 —</option>` +
      counselors.map(c => `<option value="${c.id}">${escapeHTML(c.name)}</option>`).join("");
    resetSelect("cmpClient", "— 选择 —");
    resetSelect("cmpCounselorAudio", "— 选择 —");
    resetSelect("cmpClientAudio", "— 选择 —");
    if (compareAnalysis.running) {
      showAnalysisProgress();
      $("#btnRunCompare").disabled = true;
      $("#btnRunCompare").innerHTML = `<span class="spinner"></span> 分析中…`;
    } else if (lastCompareResult) {
      renderCompareResult(lastCompareResult);
      $("#btnDownloadReport").disabled = !lastCompare;
    } else {
      $("#compareResult").innerHTML = "";
      $("#btnDownloadReport").disabled = true;
    }
  } catch (e) { toast(e.message, "bad"); }
}

$("#cmpCounselor").addEventListener("change", async (e) => {
  const cid = e.target.value;
  resetSelect("cmpClient", "— 选择 —");
  resetSelect("cmpCounselorAudio", "— 选择 —");
  resetSelect("cmpClientAudio", "— 选择 —");
  if (!cid) return;
  try {
    const [audios, clients] = await Promise.all([
      api(`/api/persons/counselor/${cid}/audios`),
      api(`/api/counselors/${cid}/clients`),
    ]);
    fillSelect("cmpCounselorAudio", audios, compareAudioLabel);
    fillSelect("cmpClient", clients, c => c.name, "— 选择 —");
  } catch (e) { toast(e.message, "bad"); }
});

$("#cmpClient").addEventListener("change", async (e) => {
  const clid = e.target.value;
  resetSelect("cmpClientAudio", "— 选择 —");
  if (!clid) return;
  try {
    const audios = await api(`/api/persons/client/${clid}/audios`);
    fillSelect("cmpClientAudio", audios, compareAudioLabel);
  } catch (e) { toast(e.message, "bad"); }
});

function fillSelect(id, items, labelFn, emptyHint = "— 选择 —") {
  const sel = $(`#${id}`);
  sel.innerHTML = items.length
    ? `<option value="">${emptyHint}</option>` + items.map(i => `<option value="${i.id}">${escapeHTML(labelFn(i))}</option>`).join("")
    : `<option value="">（无）</option>`;
}
function resetSelect(id, hint) { $(`#${id}`).innerHTML = `<option value="">${hint}</option>`; }

function compareAudioLabel(a) {
  const role = a.person_type === "counselor"
    ? (a.audio_role === "converted" ? `变音${a.target_client_name ? "→" + a.target_client_name : ""}` : "原音")
    : "来访者音";
  const pitch = a.pitch_hz ? ` · ${Math.round(a.pitch_hz)}Hz` : "";
  return `${a.original_name || a.stored_filename} · ${role}${pitch}`;
}

let lastCompare = null;
let lastCompareResult = null;
let compareAnalysis = {
  running: false,
  startAt: 0,
  estimateMs: 26000,
  timer: null,
};

function analysisProgressSnapshot() {
  if (!compareAnalysis.running) return { pct: 0, remaining: 0 };
  const elapsed = Date.now() - compareAnalysis.startAt;
  const pct = Math.min(96, Math.max(5, (elapsed / compareAnalysis.estimateMs) * 100));
  const remaining = Math.max(0, Math.ceil((compareAnalysis.estimateMs - elapsed) / 1000));
  return { pct, remaining };
}

function showAnalysisProgress(label = "正在分析两段声音…") {
  const { pct, remaining } = analysisProgressSnapshot();
  $("#compareResult").innerHTML = `
    <div class="analysis-progress">
      <div class="analysis-progress-head">
        <span>${escapeHTML(label)}</span>
        <b>${Math.round(pct)}%</b>
      </div>
      <div class="analysis-progress-meta">预计约 ${Math.round(compareAnalysis.estimateMs / 1000)} 秒，剩余约 ${remaining} 秒。可以切换页面，分析会继续进行。</div>
      <div class="analysis-progress-track">
        <div style="width:${pct}%"></div>
      </div>
    </div>`;
}

function startCompareProgress() {
  clearInterval(compareAnalysis.timer);
  compareAnalysis.timer = setInterval(() => {
    if (compareAnalysis.running && $("#view-compare").classList.contains("active")) {
      showAnalysisProgress();
    }
  }, 500);
}

function stopCompareProgress() {
  clearInterval(compareAnalysis.timer);
  compareAnalysis.timer = null;
}

$("#btnRunCompare").addEventListener("click", async () => {
  if (compareAnalysis.running) {
    toast("分析正在进行中，可以切换页面等待", "bad");
    return;
  }
  const a_id = $("#cmpCounselorAudio").value;
  const b_id = $("#cmpClientAudio").value;
  if (!a_id || !b_id) { toast("请选择两段音频", "bad"); return; }
  const btn = $("#btnRunCompare");
  const oldHTML = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> 分析中…`;
  compareAnalysis.running = true;
  compareAnalysis.startAt = Date.now();
  startCompareProgress();
  showAnalysisProgress();
  try {
    const r = await api("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a_id: Number(a_id), b_id: Number(b_id) }),
    });
    lastCompare = { a_id: Number(a_id), b_id: Number(b_id) };
    lastCompareResult = r;
    compareAnalysis.running = false;
    stopCompareProgress();
    if ($("#view-compare").classList.contains("active")) renderCompareResult(r);
    $("#btnDownloadReport").disabled = false;
    toast("分析完成", "ok");
  } catch (e) {
    compareAnalysis.running = false;
    stopCompareProgress();
    if ($("#view-compare").classList.contains("active")) $("#compareResult").innerHTML = "";
    toast(e.message, "bad");
  } finally {
    btn.disabled = false; btn.innerHTML = oldHTML;
  }
});

function renderCompareResult(r) {
  const d = r.decision;
  const verdictIcon = d.verdict === "YES" ? ICONS.check : d.verdict === "NO" ? ICONS.x : ICONS.help;
  const verdictText = verdictLabel(d.verdict);
  const confidenceText = confidenceLabel(d.confidence);
  const reasonText = localizeReason(d.reason);
  const metricCard = (name, value, suffix = "", pct = null, tone = "") => `
    <div class="metric-card">
      <div class="metric-name">${name}</div>
      <div class="metric-value ${suffix ? "suffix" : ""}">${value}${suffix ? `<small> ${suffix}</small>` : ""}</div>
      ${pct !== null ? `<div class="metric-bar"><div style="width:${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%"></div></div>` : ""}
    </div>`;
  $("#compareResult").innerHTML = `
    <div class="verdict-banner ${d.verdict}">
      <div class="verdict-icon">${verdictIcon}</div>
      <div class="verdict-body">
        <span class="verdict-label">${escapeHTML(verdictText)}</span>
        <span class="verdict-conf">置信度：${escapeHTML(confidenceText)}</span>
        <div class="verdict-reason">${escapeHTML(reasonText)}</div>
      </div>
    </div>
    <div class="metric-section">
      <div class="metric-section-title">核心判断</div>
      <div class="metric-grid metric-grid-core">
        ${metricCard("说话人嵌入相似度", fmt(d.speaker_sim, 3), "", d.speaker_sim)}
        ${metricCard("音高相似度", fmt(d.pitch_sim, 3), "", d.pitch_sim)}
        ${metricCard("综合决策分", fmt(d.decision_score, 3), "", d.decision_score)}
        ${metricCard("MFCC 相似度", fmt(d.mfcc_sim, 3), "", d.mfcc_sim)}
      </div>
    </div>
    <div class="metric-section">
      <div class="metric-section-title">声学差异</div>
      <div class="metric-grid metric-grid-detail">
        ${metricCard("源音高", fmt(d.src_pitch, 1), "Hz")}
        ${metricCard("目标音高", fmt(d.tgt_pitch, 1), "Hz")}
        ${metricCard("半音差", (d.semitones >= 0 ? "+" : "") + fmt(d.semitones, 1), "半音")}
        ${metricCard("F2 差", Math.round(d.f2_diff), "Hz")}
        ${metricCard("频谱质心差", Math.round(d.cent_diff), "Hz")}
      </div>
    </div>
    <div class="muted" style="font-size:12px;line-height:1.7;">
      <b>说明</b>：更像同一说话人 = 多项声音线索接近；更像不同说话人 = 多项声音线索差异较大；需要人工复核 = 线索不够一致。<br>
      决策分综合说话人嵌入（0.4）+ 音高（0.2）+ 共振峰 F2（0.2）+ 频谱质心（0.1）+ MFCC（0.1）。
    </div>`;
}

$("#btnDownloadReport").addEventListener("click", () => {
  if (!lastCompare) return;
  const btn = $("#btnDownloadReport");
  const oldHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner"></span> 生成报告…`;
  toast("生成报告中…");
  api(`/api/report_html/${lastCompare.a_id}/${lastCompare.b_id}`)
    .then((r) => {
      toast("报告已生成", "ok");
      const opened = window.open(r.url, "_blank");
      if (opened) opened.opener = null;
      else window.location.href = r.url;
      if ($("#view-reports").classList.contains("active")) loadReports();
    })
    .catch((e) => {
      toast(e.message, "bad");
    })
    .finally(() => {
      btn.disabled = false;
      btn.innerHTML = oldHTML;
    });
});

// ==================== Reports view ====================
async function loadReports() {
  const singleBox = $("#singleReportList");
  const pairBox = $("#pairReportList");
  if (!singleBox || !pairBox) return;
  singleBox.innerHTML = `<div class="loading-row"></div>`;
  pairBox.innerHTML = `<div class="loading-row"></div>`;
  try {
    const makeQs = (type) => {
      const qs = new URLSearchParams({ report_type: type });
      if (reportFilter) {
        qs.set("person_type", reportFilter.type);
        qs.set("person_id", reportFilter.id);
      }
      return "?" + qs.toString();
    };
    const [singleReports, pairReports] = await Promise.all([
      api("/api/reports" + makeQs("single")),
      api("/api/reports" + makeQs("pair")),
    ]);
    const sub = $("#view-reports .page-sub");
    if (sub) {
      sub.textContent = reportFilter
        ? `${reportFilter.name} 的相关 HTML 报告，按单人/双人分区显示。`
        : "已生成的 HTML 报告，按单人报告和双人报告分区管理。";
    }
    singleBox.innerHTML = singleReports.length
      ? singleReports.map(reportRowHTML).join("")
      : reportEmptyHTML(reportFilter ? "该人员暂无单人报告" : "暂无单人报告");
    pairBox.innerHTML = pairReports.length
      ? pairReports.map(reportRowHTML).join("")
      : reportEmptyHTML(reportFilter ? "该人员暂无双人报告" : "在比较分析中点击查看报告后会自动保存双人报告");
  } catch (e) {
    const errorHTML = `<div class="empty-state">${ICONS.folder}<div class="empty-title">加载失败</div><div class="empty-sub">${escapeHTML(e.message)}</div></div>`;
    singleBox.innerHTML = errorHTML;
    pairBox.innerHTML = errorHTML;
  }
}

function reportEmptyHTML(text) {
  return `<div class="empty-state compact-empty">${ICONS.folder}<div class="empty-title">还没有报告</div><div class="empty-sub">${escapeHTML(text)}</div></div>`;
}

function openReportsForPerson(type, id, name) {
  reportFilter = { type, id, name };
  switchView("reports", { keepReportFilter: true });
}

function reportRowHTML(r) {
  const created = (r.created_at || "").replace("T", " ").slice(0, 19);
  return `
    <div class="report-row">
      <div>
        <div class="report-title">${escapeHTML(r.title)}</div>
        <div class="report-sub">HTML 报告 · ${escapeHTML(created)}</div>
      </div>
      <div class="report-actions">
        <a class="report-open" href="${escapeAttr(r.url)}" target="_blank" rel="noopener">${ICONS.eye}查看</a>
        <button class="btn btn-sm btn-danger" data-del-report="${r.id}" title="删除">${ICONS.trash}</button>
      </div>
    </div>`;
}

$("#view-reports").addEventListener("click", async (e) => {
  const del = e.target.closest("[data-del-report]");
  if (!del) return;
  if (!confirm("删除该报告？")) return;
  try {
    await api(`/api/reports/${del.dataset.delReport}`, { method: "DELETE" });
    toast("报告已删除", "ok");
    await loadReports();
  } catch (err) {
    const msg = err.message.includes("requested URL was not found")
      ? "删除接口还未生效，请重启服务后再删除"
      : err.message;
    toast(msg, "bad");
  }
});

// ---------- Init ----------
switchView("people");
