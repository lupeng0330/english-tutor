/* =========================================================
 * 乐学英语 · wrongbook.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：错题本数据层 + 独立页 UI。导出 window.__wrongbook 及 switchWrongbookTab/setWrongbookFilter/toggle/delete/renderWrongbookPage 等。依赖：core。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

const WRONGBOOK_STORAGE_KEY = 'yxyy_wrongbook_v1';
const WRONGBOOK_CORRECT_STREAK_TO_REMOVE = 2;  // 连续答对 N 次自动移出错题本
let _wrongbook = null;

function _loadWrongbook() {
  if (_wrongbook) return _wrongbook;
  try {
    // v01.20：走 _pkey() 加 :profileId 后缀，实现多用户档案数据隔离
    const raw = localStorage.getItem(_pkey(WRONGBOOK_STORAGE_KEY));
    _wrongbook = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[错题本] 加载失败', e);
    _wrongbook = {};
  }
  return _wrongbook;
}
function _saveWrongbook() {
  try {
    // v01.20：走 _pkey() 加 :profileId 后缀
    localStorage.setItem(_pkey(WRONGBOOK_STORAGE_KEY), JSON.stringify(_wrongbook || {}));
  } catch (e) {
    console.warn('[错题本] 保存失败', e);
  }
  // Phase3 云同步：本地写变更后节流推送云端（未登录时 no-op）
  try { if (window.CloudSync) window.CloudSync.schedulePush(WRONGBOOK_STORAGE_KEY); } catch (e) {}
}

// Phase3 云同步：拉取云端覆盖 localStorage 后，清空内存缓存以让 _loadWrongbook 重读新数据
window.__wrongbookReload = function () {
  _wrongbook = null;
  _loadWrongbook();
};

// 题目稳定 id：优先 q.id / 否则 code + q 文本的简易 hash
function _questionId(q) {
  if (q && q.id) return String(q.id);
  const raw = String(q.code || '') + '|' + String(q.q || '') + '|' + String(q.answer || '');
  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = ((h << 5) - h + raw.charCodeAt(i)) | 0;
  }
  return 'h' + (h >>> 0).toString(36);
}
function _wbKey(type, q) {
  const tb = (state && state.ctx && state.ctx.textbook) || 'jk';
  return tb + '::' + type + '::' + _questionId(q);
}

// 记录答题结果（对错都要调，用来维护 correctStreak → 自动移除）
function recordAnswer(type, q, isCorrect) {
  if (!q) return;
  const wb = _loadWrongbook();
  const key = _wbKey(type, q);
  const now = Date.now();
  if (isCorrect) {
    // 答对：若在错题本里，streak++，达到阈值则移除
    if (wb[key]) {
      wb[key].correctStreak = (wb[key].correctStreak || 0) + 1;
      wb[key].lastAnswerAt = now;
      if (wb[key].correctStreak >= WRONGBOOK_CORRECT_STREAK_TO_REMOVE) {
        delete wb[key];
      }
      _saveWrongbook();
    }
    return;
  }
  // 答错：新增或累加
  if (!wb[key]) {
    wb[key] = {
      type: type,
      question: q,
      wrongCount: 1,
      correctStreak: 0,
      firstWrongAt: now,
      lastWrongAt: now,
      lastAnswerAt: now
    };
  } else {
    wb[key].wrongCount = (wb[key].wrongCount || 0) + 1;
    wb[key].correctStreak = 0;
    wb[key].lastWrongAt = now;
    wb[key].lastAnswerAt = now;
    // 快照更新（题库可能被改过）
    wb[key].question = q;
    wb[key].type = type;
  }
  _saveWrongbook();
}

// 获取错题本里的题目列表（按上次错时间降序）
function getWrongQuestions(filter) {
  const wb = _loadWrongbook();
  const list = Object.keys(wb).map(k => Object.assign({ _key: k }, wb[k]));
  const filtered = filter ? list.filter(filter) : list;
  filtered.sort((a, b) => (b.lastWrongAt || 0) - (a.lastWrongAt || 0));
  return filtered;
}
function getWrongCount() {
  return Object.keys(_loadWrongbook()).length;
}
function clearWrongbook() {
  _wrongbook = {};
  _saveWrongbook();
}
// v01.16：按 _key 删除单条错题（用户手动移除/已掌握/误判）。返回是否删除成功。
function removeWrongQuestion(key) {
  if (!key) return false;
  const wb = _loadWrongbook();
  if (!wb[key]) return false;
  delete wb[key];
  _saveWrongbook();
  return true;
}
// 供调试用：把当前本轮错题手动推进错题本（正常流程 answerQuiz 已自动调 recordAnswer）
window.__wrongbook = { get: getWrongQuestions, count: getWrongCount, clear: clearWrongbook, remove: removeWrongQuestion };

// ===================== 🎯 题目级掌握度（perItemMastery · v01.18 智能推题） =====================
// 存储 localStorage: { "<tb>::<type>::<qid>": { seen, correct, wrong, streak, firstAt, lastAt } }
//   - key 与错题本同构（_wbKey），便于两表关联
//   - 走 _pkey() 做多用户档案隔离；base key 已注册到 js/profile.js 的 DATA_KEYS
//   - 答错的细节仍由错题本负责；本表专注「做过几次 / 正确率 / 连对」用于智能推题打分
let _wrongbookTabFilter = 'all';
function switchWrongbookTab(type) {
  _wrongbookTabFilter = type;
  ['tabWrongbookAll','tabWrongbookRead'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = id === 'tabWrongbook' + type.charAt(0).toUpperCase() + type.slice(1)
      ? 'px-2 py-0.5 rounded text-xs bg-orange-200 text-orange-800 font-semibold'
      : 'px-2 py-0.5 rounded text-xs bg-white text-orange-600 border border-orange-200';
  });
  // 更新卡片计数（显示当前 Tab 过滤后的题数）
  const wb = _loadWrongbook();
  const currentTb = (state.ctx && state.ctx.textbook) || 'jk';
  let filtered = Object.keys(wb).filter(k => k.startsWith(currentTb + '::'));
  if (type === 'reading_qa') filtered = filtered.filter(k => (wb[k] && wb[k].type) === 'reading_qa');
  const countEl = document.getElementById('countWrongbook');
  if (countEl) countEl.textContent = filtered.length + ' 题';
  const wbCard = document.getElementById('practiceCardWrongbook');
  if (wbCard) {
    if (filtered.length === 0) wbCard.classList.add('opacity-60');
    else wbCard.classList.remove('opacity-60');
  }
}
window.switchWrongbookTab = switchWrongbookTab;

// ===================== 错题本独立页渲染（v01.16）=====================
let _wbPageFilter = 'all';  // 'all' | 'spelling' | 'listening' | 'grammar' | 'reading' | 'reading_qa'

const _WB_TYPE_LABELS = {
  spelling: '单词拼写',
  listening: '听力选择',
  grammar: '语法练习',
  reading: '阅读理解',
  cloze: '完形填空',     // 🆕 P2-C
  dialog_complete: '补全对话',  // 🆕 P6-A
  sentence_transform: '句型转换',  // 🆕 P6-B
  matching: '匹配题',  // 🆕 P6-D1
  cloze_passage: '补全短文',  // 🆕 P6-D2
  reading_qa: '课文自测',
  irregular: '不规则动词'
};
function _wbTypeLabel(type) {
  return _WB_TYPE_LABELS[type] || (type || '其他');
}

// 取一条错题记录的"正确答案"文本（兼容选择题索引 / 拼写串 / 阅读自测 correct 字段）
function _wbAnswerText(rec) {
  const q = (rec && rec.question) || {};
  if (Array.isArray(q.options) && typeof q.answer === 'number') {
    return q.options[q.answer] != null ? String(q.options[q.answer]) : String(q.answer);
  }
  if (q.correct != null) return String(q.correct);
  if (q.answer != null) return String(q.answer);
  return '—';
}

// 🆕 阅读类错题详情区的「文章原文」HTML（reading / reading_qa 双分支 + 历史数据降级）
function _wbPassageHtml(rec) {
  const type = (rec && rec.type) || '';
  if (type !== 'reading' && type !== 'reading_qa') return '';
  const q = (rec && rec.question) || {};
  const passage = (q.passage != null) ? String(q.passage).trim() : '';

  // 课文自测：先拼一条「出处」条（题块标题 / 单元 / 篇目）
  let sourceTag = '';
  if (type === 'reading_qa') {
    const bits = [];
    if (q.blockTitle) bits.push(String(q.blockTitle));
    else if (q.lessonTitle) bits.push(String(q.lessonTitle));
    const where = bits.length ? ('本题出自：' + _escapeHtml(bits.join(' · '))) : '本题出自课文阅读自测';
    sourceTag = '<div class="wb-source-tag">📖 ' + where + '</div>';
  }

  if (passage) {
    const safe = _escapeHtml(passage);
    return ''
      + sourceTag
      + '<div class="wb-passage">' + safe + '</div>'
      + ((type === 'reading_qa' && q.unit)
          ? '<button class="wb-source-link" onclick="switchToLesson(\'' + _escapeHtml(String(q.unit)) + '\',' + (q.lessonIdx | 0) + ')">📚 去此单元重读</button>'
          : '');
  }

  // 无原文（历史 reading_qa 错题在旧版本里未存 passage）：降级提示 + 跳转
  if (type === 'reading_qa') {
    return ''
      + sourceTag
      + '<div class="wb-source-missing">原文暂未收录，点击下方按钮去课本此课重读 👇</div>'
      + (q.unit
          ? '<button class="wb-source-link" onclick="switchToLesson(\'' + _escapeHtml(String(q.unit)) + '\',' + (q.lessonIdx | 0) + ')">📚 去此单元重读</button>'
          : '');
  }
  return '';
}

// 相对时间（"刚刚 / N 分钟前 / N 小时前 / N 天前"）
function _wbTimeAgo(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const MIN = 60000, HOUR = 3600000, DAY = 86400000;
  if (diff < MIN) return '刚刚';
  if (diff < HOUR) return Math.floor(diff / MIN) + ' 分钟前';
  if (diff < DAY) return Math.floor(diff / HOUR) + ' 小时前';
  if (diff < 30 * DAY) return Math.floor(diff / DAY) + ' 天前';
  return new Date(ts).toISOString().slice(0, 10);
}

// 当前教材范围内的错题数（与一键重练口径一致）
function _wbCountCurrentTb() {
  const tb = (state.ctx && state.ctx.textbook) || 'jk';
  return getWrongQuestions(w => String(w._key).startsWith(tb + '::')).length;
}

function setWrongbookFilter(f) {
  _wbPageFilter = f || 'all';
  renderWrongbookPage();
}
window.setWrongbookFilter = setWrongbookFilter;

function toggleWrongbookItem(el) {
  const item = el && el.closest('.wb-item');
  if (item) item.classList.toggle('open');
}
window.toggleWrongbookItem = toggleWrongbookItem;

function deleteWrongbookItem(key) {
  if (!confirm('确定从错题本移除这道题？')) return;
  removeWrongQuestion(key);
  renderWrongbookPage();
  try { refreshPracticeCounts(); } catch (e) {}
  try { renderHomeStats(); } catch (e) {}
}
window.deleteWrongbookItem = deleteWrongbookItem;

// 渲染错题本独立页（列表 / 筛选 / 展开详情 / 删除 / 角标）
function renderWrongbookPage() {
  const listEl = document.getElementById('wrongbookList');
  const emptyEl = document.getElementById('wrongbookEmpty');
  const actionsEl = document.getElementById('wrongbookActions');
  const badgeEl = document.getElementById('wbTotalBadge');
  if (!listEl) return;

  const tb = (state.ctx && state.ctx.textbook) || 'jk';
  // 当前教材全部错题（不受题型筛选影响），用于总数徽标
  const allOfTb = getWrongQuestions(w => String(w._key).startsWith(tb + '::'));
  if (badgeEl) badgeEl.textContent = allOfTb.length + ' 题';

  // 题型筛选
  let list = (_wbPageFilter === 'all')
    ? allOfTb
    : allOfTb.filter(w => (w.type || '') === _wbPageFilter);

  // 更新筛选 Tab active 态
  document.querySelectorAll('#wbFilterTabs .wb-filter-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === _wbPageFilter);
  });

  if (list.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hide');
    if (actionsEl) actionsEl.classList.add('hide');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hide');
  if (actionsEl) actionsEl.classList.remove('hide');

  listEl.innerHTML = list.map(rec => {
    const q = rec.question || {};
    const typeLabel = _wbTypeLabel(rec.type);
    const stem = _escapeHtml(q.q || q.word || '(无题干)');
    const answer = _escapeHtml(_wbAnswerText(rec));
    const explain = q.explain ? _escapeHtml(q.explain) : '';
    const when = _wbTimeAgo(rec.lastWrongAt);
    const key = _escapeHtml(rec._key);
    // 🆕 阅读类题目：详情区展示文章原文（reading 题来自题库 passage；reading_qa 题来自入错题本时存档的课文原文）
    const passageHtml = _wbPassageHtml(rec);
    const optionsHtml = (Array.isArray(q.options) && q.options.length)
      ? '<div class="mt-1 space-y-1">' + q.options.map((o, i) =>
          '<div class="text-sm ' + (i === q.answer ? 'text-green-700 font-semibold' : 'text-slate-600') + '">'
          + String.fromCharCode(65 + i) + '. ' + _escapeHtml(String(o)) + (i === q.answer ? ' ✓' : '')
          + '</div>').join('') + '</div>'
      : '';
    return ''
      + '<div class="wb-item card p-4" data-key="' + key + '">'
      +   '<div class="flex items-start gap-3">'
      +     '<div class="flex-1 min-w-0 cursor-pointer" onclick="toggleWrongbookItem(this)">'
      +       '<div class="flex items-center gap-2 flex-wrap mb-1">'
      +         '<span class="wb-type-tag">' + typeLabel + '</span>'
      +         '<span class="text-xs text-red-500">错 ' + (rec.wrongCount || 1) + ' 次</span>'
      +         (when ? '<span class="text-xs text-slate-400">' + when + '</span>' : '')
      +         '<span class="wb-toggle-icon text-slate-400 ml-auto">▾</span>'
      +       '</div>'
      +       '<div class="text-sm font-semibold text-slate-800">' + stem + '</div>'
      +     '</div>'
      +     '<button class="text-slate-300 hover:text-red-500 transition flex-shrink-0" title="移除此题" '
      +             'onclick="deleteWrongbookItem(\'' + key + '\')">🗑</button>'
      +   '</div>'
      +   '<div class="wb-detail mt-3 pt-3 border-t border-slate-100">'
      +     passageHtml
      +     optionsHtml
      +     '<div class="mt-2 text-sm"><span class="text-slate-400">正确答案：</span><b class="text-green-700">' + answer + '</b></div>'
      +     (explain ? '<div class="mt-1 text-sm text-slate-500">💡 ' + explain + '</div>' : '')
      +   '</div>'
      + '</div>';
  }).join('');
}
window.renderWrongbookPage = renderWrongbookPage;

// ===================== B2 智能推题（v01.18 增强） =====================
// 给题目打分，按权重随机抽取（不放回）。综合 4 个维度：
//   1) 错题本：错得越多/越近越优先；错题本里答对 < 3 次（没练熟）再加权
//   2) 新题曝光：从未做过（掌握度表无记录）的题给曝光，避免只刷错题
//   3) 掌握度衰减：做过的非错题，掌握越好越少出；正确率低（薄弱）反而优先
//   4) 单元覆盖率：当前题集里做过题占比 < 50% 的单元（按 q.code）补齐
// reason 分类：wrong 错题 / new 新题 / weak 薄弱 / review 常规，供 UI 摘要与「为什么推这题」。
// 用户可通过 state.smartPick = false 关闭（走纯随机）。
