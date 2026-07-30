/* =========================================================
 * 乐学英语 · srs.js — 单词记忆曲线（Leitner 5 档间隔重复）
 * ---------------------------------------------------------
 * 数据：localStorage[yxyy_srs_v1]（按学习者隔离，_pkey）
 *   { "<word小写>": { box:1-5, due:ms(日对齐), reps, lapses, last,
 *                     w:{word,phonetic,meaning,example} } }
 * 规则：认识 → box+1（间隔拉长）；不认识 → box=1（很快再现）。
 *   盒子间隔(天)：1→1, 2→2, 3→4, 4→7, 5→15。
 * 复习卡自包含展示字段 w，无需回查教材数据。
 * ======================================================= */
'use strict';

const SRS_STORAGE_KEY = 'yxyy_srs_v1';
const SRS_INTERVALS = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 15 };
const SRS_DAY = 86400000;
let _srs = null;

function _srsKey(k) { return (typeof _pkey === 'function') ? _pkey(k) : k; }

function srsLoad() {
  if (_srs) return _srs;
  try {
    const raw = localStorage.getItem(_srsKey(SRS_STORAGE_KEY));
    _srs = raw ? JSON.parse(raw) : {};
  } catch (e) { _srs = {}; }
  if (!_srs || typeof _srs !== 'object') _srs = {};
  return _srs;
}

function srsSave() {
  try { localStorage.setItem(_srsKey(SRS_STORAGE_KEY), JSON.stringify(_srs || {})); } catch (e) {}
  // Phase3 云同步：SRS 写后节流推送云端（未登录时 no-op）
  try { if (window.CloudSync) window.CloudSync.schedulePush(SRS_STORAGE_KEY); } catch (e) {}
}

// 切换学习者后强制重载
function srsReset() { _srs = null; }

function _srsDayStart(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }

/** 记录一次「认识/不认识」。wordObj = {word, phonetic, meaning, example} */
function srsRecord(wordObj, known) {
  if (!wordObj || !wordObj.word) return;
  const m = srsLoad();
  const key = String(wordObj.word).toLowerCase();
  const rec = m[key] || { box: 1, reps: 0, lapses: 0 };
  if (known) {
    rec.box = Math.min((rec.box || 1) + 1, 5);
    rec.reps = (rec.reps || 0) + 1;
  } else {
    rec.box = 1;
    rec.lapses = (rec.lapses || 0) + 1;
  }
  rec.last = Date.now();
  if (rec.box <= 1) {
    // 第 1 档（刚"不认识"）：当日即可复习，强化记忆
    rec.due = Date.now();
  } else {
    // 第 2-5 档：按间隔天数后到期（日对齐）
    rec.due = _srsDayStart(Date.now()) + (SRS_INTERVALS[rec.box] || 1) * SRS_DAY;
  }
  rec.w = {
    word: wordObj.word,
    phonetic: wordObj.phonetic || '',
    meaning: wordObj.meaning || '',
    example: wordObj.example || '',
  };
  m[key] = rec;
  srsSave();
}

/** 今日到期（含逾期）的复习记录，按到期时间升序 */
function srsDueRecords() {
  const m = srsLoad();
  const todayEnd = _srsDayStart(Date.now()) + SRS_DAY - 1;
  const out = [];
  for (const k in m) {
    const r = m[k];
    if (r && r.w && (r.due == null || r.due <= todayEnd)) out.push(r);
  }
  out.sort((a, b) => (a.due || 0) - (b.due || 0));
  return out;
}

function srsDueCount() { return srsDueRecords().length; }

/* ------------------- 复习会话 ------------------- */
let _reviewQueue = [];   // 本次会话队列（今日到期词，进入时一次性确定）
let _reviewIdx = 0;
let _reviewRevealed = false;
let _reviewTotal = 0;

// 进入复习页时调用
function renderReviewPage() {
  _reviewQueue = srsDueRecords().slice();
  _reviewIdx = 0;
  _reviewRevealed = false;
  _reviewTotal = _reviewQueue.length;
  _renderReviewCard();
}

function _reviewEl(id) { return document.getElementById(id); }

function _renderReviewCard() {
  const empty = _reviewEl('reviewEmpty');
  const wrap = _reviewEl('reviewCardWrap');
  const doneView = _reviewEl('reviewDoneView');

  // 全部复习完
  if (_reviewIdx >= _reviewQueue.length) {
    if (wrap) wrap.classList.add('hide');
    if (empty) empty.classList.add('hide');
    if (doneView) {
      doneView.classList.remove('hide');
      const n = _reviewEl('reviewDoneCount');
      if (n) n.textContent = _reviewTotal;
    }
    try { renderHomeStats(); } catch (e) {}
    return;
  }

  // 队列为空（今日无到期）
  if (_reviewQueue.length === 0) {
    if (wrap) wrap.classList.add('hide');
    if (doneView) doneView.classList.add('hide');
    if (empty) empty.classList.remove('hide');
    return;
  }

  if (empty) empty.classList.add('hide');
  if (doneView) doneView.classList.add('hide');
  if (wrap) wrap.classList.remove('hide');

  const rec = _reviewQueue[_reviewIdx];
  const w = rec.w || {};
  _reviewRevealed = false;

  const setText = (id, t) => { const el = _reviewEl(id); if (el) el.textContent = t; };
  setText('reviewWord', w.word || '');
  setText('reviewPhonetic', w.phonetic || '');
  setText('reviewMeaning', w.meaning || '');
  setText('reviewExample', w.example || '');
  setText('reviewProgress', `${_reviewIdx + 1} / ${_reviewTotal}`);

  // 默认遮住释义，先回忆
  const back = _reviewEl('reviewBack');
  if (back) back.classList.add('hide');
  const revealBtn = _reviewEl('reviewRevealBtn');
  if (revealBtn) revealBtn.classList.remove('hide');
  const assess = _reviewEl('reviewAssess');
  if (assess) assess.classList.add('hide');
}

// 翻看释义
function reviewReveal() {
  _reviewRevealed = true;
  const back = _reviewEl('reviewBack');
  if (back) back.classList.remove('hide');
  const revealBtn = _reviewEl('reviewRevealBtn');
  if (revealBtn) revealBtn.classList.add('hide');
  const assess = _reviewEl('reviewAssess');
  if (assess) assess.classList.remove('hide');
  // 顺带发音
  const rec = _reviewQueue[_reviewIdx];
  if (rec && rec.w && rec.w.word) { try { speak(rec.w.word); } catch (e) {} }
}

// 复习卡上点发音
function reviewPlay() {
  const rec = _reviewQueue[_reviewIdx];
  if (rec && rec.w && rec.w.word) { try { speak(rec.w.word); } catch (e) {} }
}

// 自评：known=true 认识 / false 不认识（不认识 → 回第1档，明天再现）
function reviewAssess(known) {
  const rec = _reviewQueue[_reviewIdx];
  if (rec && rec.w) srsRecord(rec.w, known);
  _reviewIdx++;
  _renderReviewCard();
}

// 从复习页返回首页
function exitReview() {
  try { switchPage('home'); } catch (e) {}
}
