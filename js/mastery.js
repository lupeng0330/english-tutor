/* =========================================================
 * 乐学英语 · mastery.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：题目级掌握度数据层。导出 window.__mastery。依赖：core/wrongbook（运行时）。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

const MASTERY_STORAGE_KEY = 'yxyy_mastery_v1';
let _mastery = null;

function _loadMastery() {
  if (_mastery) return _mastery;
  try {
    const raw = localStorage.getItem(_pkey(MASTERY_STORAGE_KEY));
    _mastery = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[掌握度] 加载失败', e);
    _mastery = {};
  }
  return _mastery;
}
function _saveMastery() {
  try {
    localStorage.setItem(_pkey(MASTERY_STORAGE_KEY), JSON.stringify(_mastery || {}));
  } catch (e) {
    console.warn('[掌握度] 保存失败', e);
  }
  // Phase3 云同步：掌握度写后节流推送云端（未登录时 no-op）
  try { if (window.CloudSync) window.CloudSync.schedulePush(MASTERY_STORAGE_KEY); } catch (e) {}
}

// Phase3 云同步：拉取云端覆盖 localStorage 后 / 切档案时，清空内存缓存重读
window.__masteryReset = function () { _mastery = null; };

// 记录单题作答（对错都调），维护 seen/correct/wrong/streak/时间戳
function recordMastery(type, q, isCorrect) {
  if (!q) return;
  const m = _loadMastery();
  const key = _wbKey(type, q);
  const now = Date.now();
  const rec = m[key] || { seen: 0, correct: 0, wrong: 0, streak: 0, firstAt: now, lastAt: now };
  rec.seen += 1;
  if (isCorrect) { rec.correct += 1; rec.streak = (rec.streak || 0) + 1; }
  else           { rec.wrong   += 1; rec.streak = 0; }
  rec.lastAt = now;
  if (!rec.firstAt) rec.firstAt = now;
  m[key] = rec;
  _saveMastery();
}

// 查询单题掌握记录（无记录 → null，表示全新题）
function _masteryOf(type, q) {
  return _loadMastery()[_wbKey(type, q)] || null;
}
// 掌握度 0~1：历史正确率为主 + 连对加成 + 充分练习微调（无记录视为 0 = 全新题）
function masteryLevel(rec) {
  if (!rec || !rec.seen) return 0;
  const acc = rec.correct / rec.seen;                       // 历史正确率
  const streakBoost = Math.min(rec.streak || 0, 3) * 0.08;  // 连对最多 +0.24
  const seenBoost   = rec.seen >= 3 ? 0.06 : 0;             // 练够 3 次微调
  return Math.max(0, Math.min(1, acc * 0.7 + streakBoost + seenBoost));
}

window.__mastery = { load: _loadMastery, of: _masteryOf, level: masteryLevel, record: recordMastery };

// 🆕 错题本 Tab 状态（'all' | 'reading_qa'）
