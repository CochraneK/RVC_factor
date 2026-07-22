/* ==================== Mock Adapter for GitHub Pages Static Demo ==================== */
"use strict";

// ---------- Mock Data ----------
const MOCK_COUNSELORS = [
  { id: 1, type: "counselor", name: "王医生", sex: "female", avatar_path: null, note: "主治医师，从事心理咨询10年", created_at: "2026-07-20T08:30:00", client_count: 2, audio_count: 3 },
  { id: 2, type: "counselor", name: "李医生", sex: "male", avatar_path: null, note: "副主任医师，专注认知行为疗法", created_at: "2026-07-18T14:00:00", client_count: 1, audio_count: 2 },
];

const MOCK_CLIENTS = {
  1: [
    { id: 101, type: "client", name: "张三", sex: "male", avatar_path: null, note: "焦虑障碍，定期复诊", created_at: "2026-07-19T09:00:00", counselor_id: 1, audio_count: 2 },
    { id: 102, type: "client", name: "李四", sex: "female", avatar_path: null, note: "抑郁症初诊", created_at: "2026-07-20T10:00:00", counselor_id: 1, audio_count: 1 },
  ],
  2: [
    { id: 201, type: "client", name: "赵五", sex: "male", avatar_path: null, note: "社交恐惧", created_at: "2026-07-18T15:00:00", counselor_id: 2, audio_count: 1 },
  ],
};

const MOCK_AUDIOS = {
  "counselor-1": [
    { id: 1001, person_type: "counselor", person_id: 1, stored_filename: "c1_sample1.wav", original_name: "咨询录音_20260720", pitch_hz: 185.5, gender: 0.62, duration: 45.2, rms: 0.078, zcr: 0.045, centroid: 1850.3, transcript: "今天感觉怎么样？", audio_role: "original", target_client_id: null, target_client_name: "", uploaded_at: "2026-07-20T08:35:00" },
    { id: 1002, person_type: "counselor", person_id: 1, stored_filename: "c1_sample2.wav", original_name: "变音_张三", pitch_hz: 192.1, gender: 0.58, duration: 32.8, rms: 0.065, zcr: 0.052, centroid: 1780.5, transcript: "", audio_role: "converted", target_client_id: 101, target_client_name: "张三", uploaded_at: "2026-07-20T09:10:00" },
    { id: 1003, person_type: "counselor", person_id: 1, stored_filename: "c1_sample3.wav", original_name: "咨询录音_20260721", pitch_hz: 180.3, gender: 0.65, duration: 60.0, rms: 0.082, zcr: 0.041, centroid: 1920.1, transcript: "我们继续上次的讨论", audio_role: "original", target_client_id: null, target_client_name: "", uploaded_at: "2026-07-21T08:30:00" },
  ],
  "counselor-2": [
    { id: 2001, person_type: "counselor", person_id: 2, stored_filename: "c2_sample1.wav", original_name: "初诊录音", pitch_hz: 125.4, gender: 0.85, duration: 28.5, rms: 0.072, zcr: 0.038, centroid: 1650.2, transcript: "请描述一下你的症状", audio_role: "original", target_client_id: null, target_client_name: "", uploaded_at: "2026-07-18T14:10:00" },
    { id: 2002, person_type: "counselor", person_id: 2, stored_filename: "c2_sample2.wav", original_name: "变音_赵五", pitch_hz: 130.2, gender: 0.80, duration: 35.0, rms: 0.068, zcr: 0.042, centroid: 1700.5, transcript: "", audio_role: "converted", target_client_id: 201, target_client_name: "赵五", uploaded_at: "2026-07-18T15:20:00" },
  ],
  "client-101": [
    { id: 1101, person_type: "client", person_id: 101, stored_filename: "cl101_s1.wav", original_name: "张三_自述", pitch_hz: 155.2, gender: 0.45, duration: 120.5, rms: 0.055, zcr: 0.065, centroid: 2100.3, transcript: "我最近总是感到紧张", audio_role: "original", target_client_id: null, target_client_name: "", uploaded_at: "2026-07-19T09:15:00" },
    { id: 1102, person_type: "client", person_id: 101, stored_filename: "cl101_s2.wav", original_name: "张三_录音2", pitch_hz: 148.6, gender: 0.48, duration: 88.3, rms: 0.058, zcr: 0.062, centroid: 2050.1, transcript: "睡眠也不好", audio_role: "original", target_client_id: null, target_client_name: "", uploaded_at: "2026-07-20T10:05:00" },
  ],
  "client-102": [
    { id: 1201, person_type: "client", person_id: 102, stored_filename: "cl102_s1.wav", original_name: "李四_初诊", pitch_hz: 220.5, gender: 0.25, duration: 95.0, rms: 0.048, zcr: 0.072, centroid: 2400.8, transcript: "没什么动力做事情", audio_role: "original", target_client_id: null, target_client_name: "", uploaded_at: "2026-07-20T10:15:00" },
  ],
  "client-201": [
    { id: 2101, person_type: "client", person_id: 201, stored_filename: "cl201_s1.wav", original_name: "赵五_自述", pitch_hz: 135.8, gender: 0.72, duration: 150.2, rms: 0.062, zcr: 0.055, centroid: 1750.4, transcript: "我害怕在人群中说话", audio_role: "original", target_client_id: null, target_client_name: "", uploaded_at: "2026-07-18T15:30:00" },
  ],
};

const MOCK_ALL_AUDIOS = [
  ...MOCK_AUDIOS["counselor-1"].map(a => ({ ...a, person_name: "王医生", person_sex: "female", counselor_id: null })),
  ...MOCK_AUDIOS["counselor-2"].map(a => ({ ...a, person_name: "李医生", person_sex: "male", counselor_id: null })),
  ...MOCK_AUDIOS["client-101"].map(a => ({ ...a, person_name: "张三", person_sex: "male", counselor_id: 1 })),
  ...MOCK_AUDIOS["client-102"].map(a => ({ ...a, person_name: "李四", person_sex: "female", counselor_id: 1 })),
  ...MOCK_AUDIOS["client-201"].map(a => ({ ...a, person_name: "赵五", person_sex: "male", counselor_id: 2 })),
];

const MOCK_REPORTS = [
  { id: 1, a_audio_id: 1001, b_audio_id: 1101, counselor_id: 1, client_id: 101, audio_role: "", report_type: "pair", title: "王医生 vs 张三 — 声音对比分析", html_filename: "report_1_1001_1101.html", created_at: "2026-07-19T10:00:00" },
  { id: 2, a_audio_id: 1002, b_audio_id: 1101, counselor_id: 1, client_id: 101, audio_role: "converted", report_type: "pair", title: "王医生(变音) vs 张三 — 声音对比分析", html_filename: "report_2_1002_1101.html", created_at: "2026-07-20T09:30:00" },
  { id: 3, a_audio_id: 1001, b_audio_id: 1001, counselor_id: 1, client_id: null, audio_role: "", report_type: "single", title: "王医生 — 单人声音分析报告", html_filename: "report_single_1001.html", created_at: "2026-07-20T11:00:00" },
];

// ---------- Mock API ----------
const _originalApi = window.api;
const _originalAvatarHTML = window.avatarHTML;

window.api = async function api(path, opts = {}) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 80));

  // Parse path
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
    return [...MOCK_REPORTS];
  }

  // GET /api/report_html_single/:id
  if (mReportHtmlSingle && (!opts.method || opts.method === "GET")) {
    return `<html><body><h1>单人报告</h1><p>这是演示模式的报告内容。</p></body></html>`;
  }

  // POST /api/compare
  if (mCompare && opts.method === "POST") {
    // Return a mock comparison result
    return {
      verdict: "NO",
      confidence: "Medium",
      reason: "Speaker embedding significantly different. pitch differs by 4.2 semitones (large). formant F2 differs by 85 Hz (noticeable). spectral centroid moderately different. Multiple acoustic cues diverge, indicating different speakers.",
      metrics: {
        pitch_a_hz: 185.5, pitch_b_hz: 155.2, pitch_diff_st: 4.2,
        f2_a_hz: 1450, f2_b_hz: 1535, f2_diff_hz: 85,
        centroid_a: 1850.3, centroid_b: 2100.3, centroid_diff: 250,
        rms_a: 0.078, rms_b: 0.055,
        zcr_a: 0.045, zcr_b: 0.065,
        duration_a: 45.2, duration_b: 120.5,
      }
    };
  }

  // GET /api/report/:a/:b (for viewing pair report HTML)
  const mReportPair = path.match(/^\/api\/report\/(\d+)\/(\d+)$/);
  if (mReportPair && (!opts.method || opts.method === "GET")) {
    return `<html><body><h1>双人对比报告</h1><p>这是演示模式的报告内容。</p></body></html>`;
  }

  // GET /api/report_html/:a/:b
  const mReportHtmlPair = path.match(/^\/api\/report_html\/(\d+)\/(\d+)$/);
  if (mReportHtmlPair && (!opts.method || opts.method === "GET")) {
    return `<html><body><h1>双人对比报告</h1><p>这是演示模式的报告内容。</p></body></html>`;
  }

  // Fallback: try to return sensible defaults for unhandled GETs
  if (!opts.method || opts.method === "GET") {
    return [];
  }

  throw new Error(`演示模式：未模拟的 API 端点 ${path}`);
};

// ---------- Override avatarHTML to avoid external image paths ----------
window.avatarHTML = function avatarHTML(person, variant = "") {
  const cls = "avatar" + (variant ? " " + variant : "") + (person && person.sex ? ` sex-${person.sex}` : "");
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
