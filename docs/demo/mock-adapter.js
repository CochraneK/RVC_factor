/* ==================== Mock Adapter for GitHub Pages Static Demo ==================== */
"use strict";

// ---------- Mock Data (from real SQLite DB) ----------
const MOCK_COUNSELORS = [
  {"id":16,"name":"王老师","avatar_path":"counselor_c7e35ba86a4e417799aae23dc39c0c18.jpg","note":"协助测试","created_at":"2026-07-22T06:05:18.300773","sex":"male","client_count":3,"audio_count":1,"type":"counselor"},
  {"id":13,"name":"付老师","avatar_path":null,"note":"CBT治疗干预技术","created_at":"2026-07-22T01:48:43.137802","sex":"female","client_count":3,"audio_count":0,"type":"counselor"},
  {"id":4,"name":"贾老师","avatar_path":null,"note":"戏剧疗法","created_at":"2026-07-21T02:50:58.568095","sex":"female","client_count":1,"audio_count":0,"type":"counselor"}
];

const MOCK_CLIENTS = {
  13: [
    {"id":19,"counselor_id":13,"name":"JXJU","avatar_path":null,"note":"","created_at":"2026-07-22T08:15:40.019917","sex":"female","audio_count":0,"type":"client"},
    {"id":17,"counselor_id":13,"name":"WCXI","avatar_path":null,"note":"","created_at":"2026-07-22T08:15:10.469758","sex":"female","audio_count":0,"type":"client"},
    {"id":16,"counselor_id":13,"name":"LIHA","avatar_path":null,"note":"","created_at":"2026-07-22T08:15:03.446910","sex":"male","audio_count":0,"type":"client"}
  ],
  16: [
    {"id":15,"counselor_id":16,"name":"CHXI","avatar_path":null,"note":"","created_at":"2026-07-22T08:14:52.914855","sex":"female","audio_count":0,"type":"client"},
    {"id":14,"counselor_id":16,"name":"ZHYA","avatar_path":null,"note":"","created_at":"2026-07-22T08:14:25.116453","sex":"female","audio_count":0,"type":"client"},
    {"id":13,"counselor_id":16,"name":"LUJI","avatar_path":null,"note":"","created_at":"2026-07-22T08:14:15.504649","sex":"male","audio_count":2,"type":"client"}
  ],
  4: [
    {"id":8,"counselor_id":4,"name":"WYYA","avatar_path":null,"note":"妄想幻听","created_at":"2026-07-21T10:40:49.681107","sex":"female","audio_count":0,"type":"client"}
  ]
};

const MOCK_AUDIOS = {
  "client-13": [
    {"id":30,"person_type":"client","person_id":13,"stored_filename":"client_13_LUJI_M_Raw_01_4f73a4e3.wav","original_name":"LUJI_M_Raw_01","pitch_hz":100.75,"gender":0.0,"duration":2.13,"rms":0.0087,"zcr":0.0102,"centroid":2057.9,"uploaded_at":"2026-07-22T08:27:00","transcript":"","audio_role":"original","target_client_id":null,"target_client_name":""},
    {"id":29,"person_type":"client","person_id":13,"stored_filename":"client_13_LUJI_M_Raw_01_3ba05563.wav","original_name":"LUJI_M_Raw_01","pitch_hz":121.79,"gender":0.02,"duration":6.31,"rms":0.0644,"zcr":0.0324,"centroid":2460.7,"uploaded_at":"2026-07-22T08:26:58","transcript":"","audio_role":"original","target_client_id":null,"target_client_name":""}
  ],
  "counselor-16": [
    {"id":28,"person_type":"counselor","person_id":16,"stored_filename":"counselor_16_KLSH_M_Raw_01_3ea65d2b.wav","original_name":"KLSH_M_Raw_01","pitch_hz":140.47,"gender":0.23,"duration":6.74,"rms":0.0418,"zcr":0.0312,"centroid":2434.6,"uploaded_at":"2026-07-22T08:05:20","transcript":"","audio_role":"original","target_client_id":null,"target_client_name":""}
  ]
};

const MOCK_ALL_AUDIOS = [
  {"id":30,"person_type":"client","person_id":13,"stored_filename":"client_13_LUJI_M_Raw_01_4f73a4e3.wav","original_name":"LUJI_M_Raw_01","pitch_hz":100.75,"gender":0.0,"duration":2.13,"rms":0.0087,"zcr":0.0102,"centroid":2057.9,"uploaded_at":"2026-07-22T08:27:00","transcript":"","audio_role":"original","target_client_id":null,"target_client_name":"","person_name":"LUJI","person_sex":"male","counselor_id":16},
  {"id":29,"person_type":"client","person_id":13,"stored_filename":"client_13_LUJI_M_Raw_01_3ba05563.wav","original_name":"LUJI_M_Raw_01","pitch_hz":121.79,"gender":0.02,"duration":6.31,"rms":0.0644,"zcr":0.0324,"centroid":2460.7,"uploaded_at":"2026-07-22T08:26:58","transcript":"","audio_role":"original","target_client_id":null,"target_client_name":"","person_name":"LUJI","person_sex":"male","counselor_id":16},
  {"id":28,"person_type":"counselor","person_id":16,"stored_filename":"counselor_16_KLSH_M_Raw_01_3ea65d2b.wav","original_name":"KLSH_M_Raw_01","pitch_hz":140.47,"gender":0.23,"duration":6.74,"rms":0.0418,"zcr":0.0312,"centroid":2434.6,"uploaded_at":"2026-07-22T08:05:20","transcript":"","audio_role":"original","target_client_id":null,"target_client_name":"","person_name":"王老师","person_sex":"male","counselor_id":null}
];

const MOCK_REPORTS = [
  {"id":8,"a_audio_id":28,"b_audio_id":28,"counselor_id":16,"client_id":null,"audio_role":"original","report_type":"single","title":"王老师 单人声音报告","html_filename":"single_report_王老师_28.html","created_at":"2026-07-22T09:04:05","url":"./reports/single_report_王老师_28.html"},
  {"id":7,"a_audio_id":30,"b_audio_id":30,"counselor_id":null,"client_id":13,"audio_role":"original","report_type":"single","title":"LUJI 单人声音报告","html_filename":"single_report_LUJI_30.html","created_at":"2026-07-22T09:01:10","url":"./reports/single_report_LUJI_30.html"},
  {"id":6,"a_audio_id":28,"b_audio_id":30,"counselor_id":16,"client_id":13,"audio_role":"original","report_type":"pair","title":"王老师 vs LUJI（原音）","html_filename":"report_王老师_LUJI_20260722_162735.html","created_at":"2026-07-22T08:27:41","url":"./reports/report_王老师_LUJI_20260722_162735.html"}
];

// ---------- Mock API ----------
window.api = async function api(path, opts = {}) {
  await new Promise(r => setTimeout(r, 80));

  const mCounselors = path.match(/^\/api\/counselors\/?$/);
  const mCounselor = path.match(/^\/api\/counselors\/(\d+)$/);
  const mClients = path.match(/^\/api\/counselors\/(\d+)\/clients$/);
  const mClient = path.match(/^\/api\/clients\/(\d+)$/);
  const mAllAudio = path.match(/^\/api\/audios\/?$/);
  const mPersonAudio = path.match(/^\/api\/persons\/(counselor|client)\/(\d+)\/audios$/);
  const mAudio = path.match(/^\/api\/audios\/(\d+)$/);
  const mAudioNameSuggestion = path.match(/^\/api\/persons\/(counselor|client)\/(\d+)\/audio_name_suggestion/);
  const mReports = path.match(/^\/api\/reports\/?$/);
  const mReportHtmlSingle = path.match(/^\/api\/report_html_single\/(\d+)$/);
  const mCompare = path.match(/^\/api\/compare$/);

  // GET /api/counselors
  if (mCounselors && (!opts.method || opts.method === "GET")) {
    return [...MOCK_COUNSELORS];
  }

  // POST /api/counselors
  if (mCounselors && opts.method === "POST") {
    toast("【演示模式】不支持添加数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/counselors/:id
  if (mCounselor && (!opts.method || opts.method === "GET")) {
    const cid = parseInt(mCounselor[1]);
    const c = MOCK_COUNSELORS.find(x => x.id === cid);
    if (!c) throw new Error("Not found");
    return { ...c };
  }

  // PUT/POST /api/counselors/:id
  if (mCounselor && (opts.method === "PUT" || opts.method === "POST")) {
    toast("【演示模式】不支持修改数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // DELETE /api/counselors/:id
  if (mCounselor && opts.method === "DELETE") {
    toast("【演示模式】不支持删除数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/counselors/:id/clients
  if (mClients && (!opts.method || opts.method === "GET")) {
    const cid = parseInt(mClients[1]);
    return [...(MOCK_CLIENTS[cid] || [])];
  }

  // POST /api/counselors/:id/clients
  if (mClients && opts.method === "POST") {
    toast("【演示模式】不支持添加数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/clients/:id
  if (mClient && (!opts.method || opts.method === "GET")) {
    const clid = parseInt(mClient[1]);
    for (const cs of Object.values(MOCK_CLIENTS)) {
      const cl = cs.find(x => x.id === clid);
      if (cl) return { ...cl };
    }
    throw new Error("Not found");
  }

  // DELETE /api/clients/:id
  if (mClient && opts.method === "DELETE") {
    toast("【演示模式】不支持删除数据", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/audios
  if (mAllAudio && (!opts.method || opts.method === "GET")) {
    return [...MOCK_ALL_AUDIOS];
  }

  // GET /api/persons/:type/:id/audios
  if (mPersonAudio && (!opts.method || opts.method === "GET")) {
    const ptype = mPersonAudio[1];
    const pid = parseInt(mPersonAudio[2]);
    const key = `${ptype}-${pid}`;
    return [...(MOCK_AUDIOS[key] || [])];
  }

  // POST /api/persons/:type/:id/audios
  if (mPersonAudio && opts.method === "POST") {
    toast("【演示模式】不支持上传音频", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/audios/:id
  if (mAudio && (!opts.method || opts.method === "GET")) {
    const aid = parseInt(mAudio[1]);
    for (const list of Object.values(MOCK_AUDIOS)) {
      const a = list.find(x => x.id === aid);
      if (a) return { ...a };
    }
    throw new Error("Not found");
  }

  // DELETE /api/audios/:id
  if (mAudio && opts.method === "DELETE") {
    toast("【演示模式】不支持删除音频", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // PUT /api/audios/:id/meta
  if (path.match(/^\/api\/audios\/(\d+)\/meta$/) && opts.method === "PUT") {
    toast("【演示模式】不支持修改音频", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // PUT /api/audios/:id/transcript
  if (path.match(/^\/api\/audios\/(\d+)\/transcript$/) && opts.method === "PUT") {
    toast("【演示模式】不支持修改备注", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/persons/:type/:id/audio_name_suggestion
  if (mAudioNameSuggestion && (!opts.method || opts.method === "GET")) {
    return { name: "sample_name" };
  }

  // GET /api/reports
  if (mReports && (!opts.method || opts.method === "GET")) {
    const urlParams = new URLSearchParams(path.split("?")[1] || "");
    const reportType = urlParams.get("report_type");
    let reports = MOCK_REPORTS.map(r => ({ ...r }));
    if (reportType) {
      reports = reports.filter(r => r.report_type === reportType);
    }
    return reports;
  }

  // DELETE /api/reports/:id
  const mDeleteReport = path.match(/^\/api\/reports\/(\d+)$/);
  if (mDeleteReport && opts.method === "DELETE") {
    toast("【演示模式】不支持删除报告", "bad");
    throw new Error("演示模式：数据为只读");
  }

  // GET /api/report_html_single/:id
  if (mReportHtmlSingle && (!opts.method || opts.method === "GET")) {
    const aid = parseInt(mReportHtmlSingle[1]);
    const report = MOCK_REPORTS.find(r => r.report_type === "single" && r.a_audio_id === aid);
    if (report) {
      return { url: report.url };
    }
    throw new Error("未找到报告");
  }

  // POST /api/compare
  if (mCompare && opts.method === "POST") {
    return {
      verdict: "Uncertain",
      confidence: "Low",
      reason: "Speaker embedding strongly similar (timbre). pitch differs by 5.8 semitones (large). formant F2 differs by 403 Hz (strong difference). spectral centroid moderately different. Evidence is mixed; further manual inspection recommended.",
      metrics: {
        pitch_a_hz: 140.47, pitch_b_hz: 100.75, pitch_diff_st: 5.8,
        f2_a_hz: 1450, f2_b_hz: 1853, f2_diff_hz: 403,
        centroid_a: 2434.6, centroid_b: 2057.9, centroid_diff: 376.7,
        rms_a: 0.0418, rms_b: 0.0087,
        zcr_a: 0.0312, zcr_b: 0.0102,
        duration_a: 6.74, duration_b: 2.13,
      }
    };
  }

  // GET /api/report/:a/:b
  const mReportPair = path.match(/^\/api\/report\/(\d+)\/(\d+)$/);
  if (mReportPair && (!opts.method || opts.method === "GET")) {
    const aId = parseInt(mReportPair[1]);
    const bId = parseInt(mReportPair[2]);
    const report = MOCK_REPORTS.find(r => r.report_type === "pair" && r.a_audio_id === aId && r.b_audio_id === bId);
    if (report) {
      return { url: report.url };
    }
    throw new Error("未找到报告");
  }

  // GET /api/report_html/:a/:b
  const mReportHtmlPair = path.match(/^\/api\/report_html\/(\d+)\/(\d+)$/);
  if (mReportHtmlPair && (!opts.method || opts.method === "GET")) {
    const aId = parseInt(mReportHtmlPair[1]);
    const bId = parseInt(mReportHtmlPair[2]);
    const report = MOCK_REPORTS.find(r => r.report_type === "pair" && r.a_audio_id === aId && r.b_audio_id === bId);
    if (report) {
      return { url: report.url };
    }
    throw new Error("未找到报告");
  }

  // Fallback
  if (!opts.method || opts.method === "GET") {
    return [];
  }

  throw new Error(`演示模式：未模拟的 API 端点 ${path}`);
};

// ---------- Override avatarHTML to use local avatar path ----------
window.avatarHTML = function avatarHTML(person, variant = "") {
  const cls = "avatar" + (variant ? " " + variant : "") + (person && person.sex ? ` sex-${person.sex}` : "");
  if (person.avatar_path) {
    return `<div class="${cls}"><img src="avatars/${encodeURIComponent(person.avatar_path)}" alt=""></div>`;
  }
  const initial = (person.name || "?").trim().charAt(0).toUpperCase();
  return `<div class="${cls}">${initial}</div>`;
};

// ---------- Show demo banner ----------
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.createElement("div");
  banner.className = "demo-banner";
  banner.innerHTML = `
    <span>🎬 演示模式 — 数据为只读 Mock 数据，所有修改/上传/分析操作均不会生效</span>
    <a href="../" class="demo-banner-link">返回项目首页</a>
  `;
  document.body.insertBefore(banner, document.body.firstChild);
});

// ---------- app.js will call switchView("people") on load, api() is already mocked ----------
if (typeof switchView === "function") {
  switchView("people");
}
