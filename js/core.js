/* =========================================================
 * 乐学英语 · core.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：跨域共享纯工具（无 DOM / 无副作用）：_pkey / _escapeHtml / _answerMatch / gradeText / escapeHtml / _cleanVerbForm 等。最先于业务分片加载。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

function _pkey(baseKey) {
  try {
    var pid = (window.ProfileManager && window.ProfileManager.active && window.ProfileManager.active().id) || 'default';
    return baseKey + ':' + pid;
  } catch (e) {
    // 任何异常（包括 ProfileManager 还没加载好）都退化为原 key，保证调用点永不崩
    return baseKey;
  }
}

// 语法
function _escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 简单的文本相似度：把关键词都命中了算对，忽略大小写/标点
function _answerMatch(userAns, correctAns) {
  const clean = (s) => String(s || '').toLowerCase()
    .replace(/[.,!?;:"'\(\)\[\]]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const u = clean(userAns);
  const c = clean(correctAns);
  if (!u) return { ok: false, score: 0, hint: '未作答' };
  if (u === c) return { ok: true, score: 100, hint: '完全正确' };
  // 关键词覆盖率（取正确答案里长度 >=3 的词）
  const stop = new Set(['the','and','was','were','are','is','am','has','have','had','for','with','about','that','this','when','where','who','what','how','why','yes','not','her','his','him','its','you','she','they','them','their','our']);
  const cWords = c.split(' ').filter(w => w.length >= 3 && !stop.has(w));
  if (cWords.length === 0) return { ok: false, score: 30, hint: '请对照参考答案' };
  const hits = cWords.filter(w => u.indexOf(w) >= 0).length;
  const ratio = hits / cWords.length;
  if (ratio >= 0.7) return { ok: true, score: Math.round(70 + ratio * 30), hint: `命中 ${hits}/${cWords.length} 个关键词` };
  if (ratio >= 0.4) return { ok: false, score: Math.round(40 + ratio * 50), hint: `部分正确（${hits}/${cWords.length} 关键词）` };
  return { ok: false, score: Math.round(ratio * 50), hint: `不够完整（${hits}/${cWords.length} 关键词）` };
}

function gradeText(n){ return ({3:'小学三年级',4:'小学四年级',5:'小学五年级',6:'小学六年级',7:'初中一年级',8:'初中二年级',9:'初中三年级'})[n] || '未知'; }

// ===================== 导航 =====================
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ===================== 学习报告 =====================
// ===================== 📊 学习报告（真实数据，v01.17）=====================
