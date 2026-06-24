/* =========================================================
 * 乐学英语 · smartpick.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：智能推题打分 + 开关设置。导出 window.__smartpick / toggleSmartPick。依赖：core。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

function _scoreQuestion(type, q, ctx) {
  const wb = _loadWrongbook();
  const rec = wb[_wbKey(type, q)];
  const mRec = _masteryOf(type, q);
  let score = 1;                 // 基础分
  let tag = '';
  let reason = 'review';         // review 常规 / wrong 错题 / new 新题 / weak 薄弱

  // 1) 错题本加权
  if (rec) {
    score += 3 * (rec.wrongCount || 0);
    const dt = Date.now() - (rec.lastWrongAt || 0);
    const DAY = 24 * 3600 * 1000;
    if (dt <= DAY)          score += 3;           // 24h 内错过 → 强化
    else if (dt <= 7 * DAY) score += 1.5;         // 一周内错过 → 中等
    tag = '🔥';
    reason = 'wrong';
    // 错题本里答对 < 3 次（还没练熟）→ 额外强化，优先消灭
    const okTimes = mRec ? (mRec.correct || 0) : 0;
    if (okTimes < 3) score += 2.5;
  }

  // 2) 新题曝光 bonus：从未做过的题给一份曝光
  if (!mRec || !mRec.seen) {
    score += 2;
    if (!rec) { tag = '✨'; reason = 'new'; }
  } else if (!rec) {
    // 3) 掌握度衰减：做过的非错题，掌握越好越少出；薄弱（正确率低）反而优先
    const lvl = masteryLevel(mRec);
    score -= lvl * 1.5;                            // 满掌握最多 -1.5
    if (lvl < 0.4) { score += 1.5; tag = '💪'; reason = 'weak'; }
  }

  // 4) 单元覆盖率 < 50% 加权
  if (ctx && ctx.unitCoverage) {
    const cov = ctx.unitCoverage[q.code || ''];
    if (cov != null && cov < 0.5) score += (0.5 - cov) * 2;   // 最多 +1
  }

  // 难度高一点点的稍微优先（让练习不全是简单题）
  if (q.difficulty === 3) score += 0.3;

  if (score < 0.2) score = 0.2;   // 保底，避免权重为 0 永远抽不到
  return { score, tag, reason };
}

// 计算当前题集每个单元(code)的「做过题占比」，供单元覆盖率加权
function _unitCoverage(questions, type) {
  const tot = {}, seen = {};
  for (const q of questions) {
    const c = q.code || '';
    tot[c] = (tot[c] || 0) + 1;
    if (_masteryOf(type, q)) seen[c] = (seen[c] || 0) + 1;
  }
  const cov = {};
  for (const c in tot) cov[c] = (seen[c] || 0) / tot[c];
  return cov;
}

// 统计一批题目的推题构成（错题/新题/薄弱/常规），用于「本次推题构成」摘要
function _tallyMeta(arr, type, ctx, smart) {
  const meta = { smart: !!smart, total: arr.length, wrong: 0, new: 0, weak: 0, review: 0 };
  for (const q of arr) {
    const reason = _scoreQuestion(type, q, ctx).reason;
    if (meta[reason] == null) meta.review++;
    else meta[reason]++;
  }
  return meta;
}

function pickSmartQuestions(questions, n, type) {
  if (!questions || !questions.length) { state.lastSmartMeta = null; return []; }
  const t = type || state.quizType || 'spelling';
  const smartOn = (state.smartPick !== false);   // 默认开启，可关

  // 开关关闭 → 纯随机（Fisher-Yates 取前 n）
  if (!smartOn) {
    const arr = questions.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    const out = arr.slice(0, Math.min(n, arr.length));
    state.lastSmartMeta = { smart: false, total: out.length, wrong: 0, new: 0, weak: 0, review: out.length };
    return out;
  }

  const ctx = { unitCoverage: _unitCoverage(questions, t) };

  // 全取：仍 Fisher-Yates 打乱，但统计构成
  if (n >= questions.length) {
    const arr = questions.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    state.lastSmartMeta = _tallyMeta(arr, t, ctx, true);
    return arr;
  }

  // 加权采样不放回（累加权重 → 线性查找）
  const scored = questions.map(q => ({ q, score: _scoreQuestion(t, q, ctx).score }));
  const picked = [];
  const pool = scored.slice();
  for (let k = 0; k < n && pool.length > 0; k++) {
    const total = pool.reduce((s, x) => s + x.score, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= pool[idx].score;
      if (r <= 0) break;
    }
    if (idx >= pool.length) idx = pool.length - 1;
    picked.push(pool[idx].q);
    pool.splice(idx, 1);
  }
  state.lastSmartMeta = _tallyMeta(picked, t, ctx, true);
  return picked;
}
// 辅助：判断一道题当前是否"错题本里的"，用于 UI 上打 🔥 标
function isPriorityQuestion(type, q) {
  const wb = _loadWrongbook();
  return !!wb[_wbKey(type, q)];
}
window.__smartpick = { score: _scoreQuestion, pick: pickSmartQuestions, coverage: _unitCoverage, tally: _tallyMeta };

// ===================== 📊 学习统计（localStorage 真实累计） =====================
const SMARTPICK_KEY = 'yxyy_smartpick_v1';
function _loadSmartPick() {
  try {
    const raw = localStorage.getItem(_pkey(SMARTPICK_KEY));
    state.smartPick = (raw === null) ? true : (raw === '1' || raw === 'true');
  } catch (e) { state.smartPick = true; }
  return state.smartPick;
}
function _saveSmartPick() {
  try { localStorage.setItem(_pkey(SMARTPICK_KEY), (state.smartPick !== false) ? '1' : '0'); } catch (e) {}
}
function setSmartPick(on) {
  state.smartPick = !!on;
  _saveSmartPick();
  _renderSmartPickToggle();
}
function toggleSmartPick() { setSmartPick(!(state.smartPick !== false)); }
// 同步开关 UI（颜色 + 滑块位置 + 文案）
function _renderSmartPickToggle() {
  const on = (state.smartPick !== false);
  const btn = document.getElementById('smartPickToggle');
  const knob = document.getElementById('smartPickKnob');
  const hint = document.getElementById('smartPickHint');
  if (btn)  btn.className = 'relative w-12 h-7 rounded-full transition flex-shrink-0 ' + (on ? 'bg-emerald-500' : 'bg-slate-300');
  if (knob) knob.style.transform = on ? 'translateX(22px)' : 'translateX(2px)';
  if (hint) hint.textContent = on ? '按错题/薄弱/新题智能排序出题' : '已关闭：随机出题';
}
window.toggleSmartPick = toggleSmartPick;
window.__smartpick.setEnabled = setSmartPick;

