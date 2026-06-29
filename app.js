/* =========================================================
 * 乐学英语 · app.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：精简入口：switchPage/applyContextChange(+async 重写)/bootstrap/Profile UI 绑定/AI chat/语法/初始化编排。最后加载，依赖以上全部。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

// 注：textbookData / _currentTextbookMeta / _bust / textbookJsonPath / loadTextbook /
// TEXTBOOK_SHARDED / _textbookShardCache / _textbookFullCache 已迁移到 js/textbook.js。
// 此处保留注释以帮助 grep 追溯。

// =====================================================================
// 🆔 多用户档案 key 命名空间工具（v01.20）
// ---------------------------------------------------------------------
// 把基础 key 加上 ":<profileId>" 后缀，让不同档案的数据互相隔离。
// 设计要点：
//   1. 严格 try-catch 兜底：即使 ProfileManager 未加载或异常，也退化为原 key，
//      绝不让 app.js 顶层抛错（吸取上次翻车教训）。
//   2. 当前 Step 3 仅定义函数、不接入任何 key；接入留给 Step 4-6 一对一对改。
//   3. 测试入口：浏览器 Console 输入 `_pkey('yxyy_stats_v1')` 应返回带后缀的字符串。
// =====================================================================
const grammarData = [
  {
    id: 'g1', title: '一般现在时 (Simple Present)', level: '小学',
    content: `<h3 class="text-xl font-bold text-slate-800 mb-3">一般现在时 (Simple Present Tense)</h3>
      <p class="text-slate-700 mb-3"><b>概念：</b>表示经常性的动作、习惯性的行为或客观事实。</p>
      <p class="text-slate-700 mb-3"><b>构成：</b>主语 + 动词原形 (第三人称单数时动词加 -s/-es)</p>
      <div class="grammar-example">
        <div class="font-semibold">✅ I <b>like</b> apples.（我喜欢苹果。）</div>
        <div class="font-semibold">✅ She <b>likes</b> apples.（她喜欢苹果。）</div>
        <div class="text-sm text-slate-600 mt-1">👉 第三人称单数 (he/she/it) 后面动词要加 -s</div>
      </div>
      <p class="text-slate-700 mt-3"><b>时间状语：</b>often, usually, always, every day, sometimes</p>`
  },
  {
    id: 'g2', title: '一般过去时 (Simple Past)', level: '小学/初中',
    content: `<h3 class="text-xl font-bold text-slate-800 mb-3">一般过去时 (Simple Past Tense)</h3>
      <p class="text-slate-700 mb-3"><b>概念：</b>表示过去某时发生的动作或存在的状态。</p>
      <p class="text-slate-700 mb-3"><b>构成：</b>主语 + 动词过去式</p>
      <div class="grammar-example">
        <div class="font-semibold">✅ I <b>visited</b> my grandma yesterday.</div>
        <div class="font-semibold">✅ He <b>went</b> to school by bike.</div>
      </div>
      <p class="text-slate-700 mt-3"><b>规则动词变化：</b></p>
      <ul class="list-disc ml-6 text-slate-700">
        <li>一般情况加 -ed: play → played</li>
        <li>以 e 结尾加 -d: live → lived</li>
        <li>辅音字母+y结尾，变 y 为 i 加 -ed: study → studied</li>
        <li>重读闭音节双写末尾字母加 -ed: stop → stopped</li>
      </ul>
      <p class="text-slate-700 mt-3"><b>时间状语：</b>yesterday, last week, ago, just now</p>`
  },
  {
    id: 'g3', title: '形容词比较级 (Comparative)', level: '小学高/初中',
    content: `<h3 class="text-xl font-bold text-slate-800 mb-3">形容词比较级 (Comparative)</h3>
      <p class="text-slate-700 mb-3"><b>概念：</b>比较两个人或事物的性质、特征的等级差异。</p>
      <p class="text-slate-700 mb-3"><b>构成：</b>形容词比较级 + than</p>
      <div class="grammar-example">
        <div class="font-semibold">✅ Tom is <b>taller than</b> Jerry.</div>
        <div class="font-semibold">✅ This book is <b>more interesting than</b> that one.</div>
      </div>
      <p class="text-slate-700 mt-3"><b>变化规则：</b></p>
      <ul class="list-disc ml-6 text-slate-700">
        <li>单音节+-er: tall → taller</li>
        <li>以 e 结尾+-r: nice → nicer</li>
        <li>辅音+y结尾变y为i+-er: happy → happier</li>
        <li>多音节词前加 more: beautiful → more beautiful</li>
        <li>不规则: good → better, bad → worse, many → more</li>
      </ul>`
  },
  {
    id: 'g4', title: '情态动词 should', level: '初中',
    content: `<h3 class="text-xl font-bold text-slate-800 mb-3">情态动词 should (应该)</h3>
      <p class="text-slate-700 mb-3"><b>用法：</b>表示建议、劝告，后接动词原形。</p>
      <div class="grammar-example">
        <div class="font-semibold">✅ You <b>should</b> drink more water.</div>
        <div class="font-semibold">✅ You <b>shouldn't</b> eat too much junk food.</div>
      </div>
      <p class="text-slate-700 mt-3"><b>疑问句：</b>Should + 主语 + 动词原形?</p>
      <div class="grammar-example">
        <div class="font-semibold">✅ Should I see a doctor? Yes, you should.</div>
      </div>`
  }
];

// 注：state / TEXTBOOK_NAMES / TEXTBOOK_GRADES / GRADE_LABELS /
// refreshGradeOptionsForTextbook / ctxSummaryText / ctxBadgeText 已迁移到 js/state.js。
// 此处保留注释以帮助 grep 追溯。

// ===================== 错题本（B3）=====================
// 存储在 localStorage: { "textbook::type::qid": { type, question, wrongCount, correctStreak, lastWrongAt, lastAnswerAt } }
// qid 用题库的 code+q 组合产生稳定 hash（题库没 id 字段）
const CTX_KEY = 'yxyy_ctx';
function loadCtx() {
  try {
    const raw = localStorage.getItem(_pkey(CTX_KEY));
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && obj.grade) Object.assign(state.ctx, obj);
    }
  } catch(e) {}
}

const childMap = {
  xiaoming: { name: '小明', grade: 'grade3', gradeText: '三年级', avatar: '明', unit: 'Unit 1', gradeNum: 3 },
  xiaohong: { name: '小红', grade: 'grade6', gradeText: '六年级', avatar: '红', unit: 'Unit 2', gradeNum: 6 },
  xiaolei: { name: '小磊', grade: 'grade8', gradeText: '初二', avatar: '磊', unit: 'Unit 1', gradeNum: 8 }
};

// 年级编号 <-> grade key 映射
const gradeNumToKey = { 1:'grade1', 2:'grade2', 3:'grade3', 4:'grade4', 5:'grade5', 6:'grade6', 7:'grade7', 8:'grade8', 9:'grade9' };
const gradeKeyToNum = { grade3:3, grade4:4, grade5:5, grade6:6, grade7:7, grade8:8, grade9:9 };
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchPage(item.dataset.page));
});

function switchPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.add('hide'));
  document.getElementById('page-' + page).classList.remove('hide');

  if (page === 'textbook') renderUnitList();
  if (page === 'exam') { try { renderExamPage(); } catch(e) { console.warn(e); } }
  if (page === 'grammar') { renderGrammar(); try { renderIrregVerbTable(); } catch(e){} }
  if (page === 'report') setTimeout(renderReport, 100);
  if (page === 'wrongbook') { _wbPageFilter = 'all'; renderWrongbookPage(); }
  if (page === 'review') { try { renderReviewPage(); } catch(e) { console.warn(e); } }
  if (page === 'practice') {
    // 重置练习视图到初始状态
    document.getElementById('practiceQuizView').classList.add('hide');
    document.getElementById('practiceResultView').classList.add('hide');
    document.getElementById('practiceFilterView').classList.remove('hide');
    document.getElementById('practiceTypeView').classList.remove('hide');
    document.getElementById('smartPickCard').classList.remove('hide');
    try { refreshUnitFilterOptions(); } catch(e){}
    refreshPracticeCounts();
    try { _loadSmartPick(); _renderSmartPickToggle(); } catch(e){}   // 同步智能推题开关偏好
  }
}

// ===================== 孩子切换（已移除：当前单用户 Demo） =====================
// 如果未来接真实多用户，在此挂上 onChildChange
// 相关 UI 元素已从 index.html 删除，保留 childMap 结构给未来用


// ===================== 🆕 全局学习上下文切换 =====================
function applyContextChange() {
  // 0) 🆕 根据教材白名单，先过滤 #ctxGrade 的 options（可能顺带自动修正 ctx.grade）
  try { refreshGradeOptionsForTextbook(); } catch(e) {}

  // 1) 同步顶部上下文条的 3 个下拉（UI ← state.ctx）
  const sel = (id) => document.getElementById(id);
  if (sel('ctxGrade'))    sel('ctxGrade').value    = String(state.ctx.grade);
  if (sel('ctxTerm'))     sel('ctxTerm').value     = state.ctx.term;
  if (sel('ctxTextbook')) sel('ctxTextbook').value = state.ctx.textbook;

  // 2) 更新上下文摘要文字
  if (sel('ctxSummary'))         sel('ctxSummary').textContent = ctxSummaryText(state.ctx);
  if (sel('textbookCtxBadge'))   sel('textbookCtxBadge').textContent = '（' + ctxBadgeText(state.ctx) + '）';

  // 3) 同步 currentGrade（与课本数据结构 grade3..grade9 对齐）
  state.currentGrade = gradeNumToKey[state.ctx.grade] || state.currentGrade;

  // 4) 🆕 重置练习状态：切换学段时正在答题的题目自动作废，回到题型选择页
  resetPracticeOnContextChange();

  // 5) 联动刷新各模块
  try { renderUnitList(); } catch(e) {}
  try { refreshUnitFilterOptions(); } catch(e) {}
  try { refreshPracticeCounts(); } catch(e) {}

  // 6) 持久化
  saveCtx();
}

// 切换上下文时处理练习状态
['ctxGrade', 'ctxTerm', 'ctxTextbook'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', (e) => {
    if (id === 'ctxGrade')    state.ctx.grade    = parseInt(e.target.value, 10);
    if (id === 'ctxTerm')     state.ctx.term     = e.target.value;
    if (id === 'ctxTextbook') state.ctx.textbook = e.target.value;
    applyContextChange();
  });
});

// ===================== 课本 - 单元列表 =====================
// 计算单元学习进度（0-100 整数），综合「单词掌握」+「阅读自测」两部分：
//   words: unit.words 里在 knownWords 中的数量
//   reading: readingExDone 里该单元已做过的题数（作为分母）/ 其中答对数（作为分子）
// 返回 { pct, known, total, readingOk, readingAttempted }
function renderGrammar() {
  const list = document.getElementById('grammarList');
  list.innerHTML = grammarData.map((g, i) => `
    <div class="p-3 rounded-xl cursor-pointer hover:bg-blue-50 grammar-item" data-idx="${i}">
      <div class="font-semibold text-slate-800 text-sm">${g.title}</div>
      <div class="text-xs text-slate-500 mt-1">${g.level}</div>
    </div>
  `).join('');
  list.querySelectorAll('.grammar-item').forEach(el => {
    el.addEventListener('click', () => {
      list.querySelectorAll('.grammar-item').forEach(e => e.classList.remove('bg-blue-100'));
      el.classList.add('bg-blue-100');
      document.getElementById('grammarContent').innerHTML = grammarData[el.dataset.idx].content +
        `<div class="mt-6"><button class="gradient-btn" onclick="switchPage('practice'); setTimeout(()=>startPractice('grammar'),100)">开始本知识点练习 →</button></div>`;
    });
  });
  list.querySelector('.grammar-item').click();
}

// ===================== AI 对话 =====================
const aiResponses = {
  hello: "Hello! Nice to meet you! 你好！很高兴认识你。How are you today? 😊",
  how: "I'm doing great, thanks for asking! How about you? 我很好，你呢？",
  weather: "☀️ Today is sunny and warm. It's a perfect day for learning! 今天阳光明媚，很适合学习！",
  word: "Sure! Let's learn a new word: <b>brilliant</b> /ˈbrɪliənt/ - 聪明的、出色的。Example: You are a brilliant student! ✨",
  story: "📖 Once upon a time, there was a little rabbit who loved carrots. One day, he met a clever fox... 从前，有一只喜欢胡萝卜的小兔子，一天他遇到了一只聪明的狐狸...",
  default: [
    "That's interesting! Tell me more. 真有趣，再告诉我一些！",
    "Great try! 你说得很好！Keep going!",
    "I see! Can you say it in English? 你能用英语说说吗？",
    "Wow, you're doing great! 🌟 Keep practicing!",
    "Good question! Let me think... 好问题，让我想想..."
  ]
};

function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;
  addChatMessage(text, 'user');
  input.value = '';

  setTimeout(() => {
    const reply = getAIReply(text);
    addChatMessage(reply, 'ai');
    const enOnly = reply.replace(/<[^>]+>/g, '').replace(/[\u4e00-\u9fa5]/g, '').replace(/[。，！？：；、]/g, '').trim();
    if (enOnly.length > 3) speak(enOnly.substring(0, 120));
  }, 600);
}

function quickChat(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

function getAIReply(text) {
  const lower = text.toLowerCase();
  if (/hello|hi|你好/.test(lower)) return aiResponses.hello;
  if (/how are you|怎么样/.test(lower)) return aiResponses.how;
  if (/weather|天气/.test(lower)) return aiResponses.weather;
  if (/word|单词|teach/.test(lower)) return aiResponses.word;
  if (/story|故事/.test(lower)) return aiResponses.story;
  const arr = aiResponses.default;
  return arr[Math.floor(Math.random() * arr.length)];
}

function addChatMessage(text, role) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  if (role === 'user') {
    div.className = 'flex gap-2 justify-end';
    div.innerHTML = `<div class="chat-bubble-user">${escapeHtml(text)}</div>
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-sm flex-shrink-0">我</div>`;
  } else {
    div.className = 'flex gap-2';
    div.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm flex-shrink-0">🤖</div>
      <div class="chat-bubble-ai">${text}</div>`;
  }
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

const fa = document.getElementById('filterAllGrades');
const fd = document.getElementById('filterDifficulty');
const fu = document.getElementById('filterUnit');
if (fa) fa.addEventListener('change', (e) => {
  state.includeAllGrades = e.target.checked;
  // 跨年级时单元筛选无意义，禁用下拉
  if (fu) fu.disabled = state.includeAllGrades;
  refreshPracticeCounts();
});
if (fd) fd.addEventListener('change', (e) => { state.filterDifficulty = parseInt(e.target.value); refreshPracticeCounts(); });
if (fu) fu.addEventListener('change', (e) => { state.filterUnit = e.target.value; refreshPracticeCounts(); });

// 预热语音引擎（部分浏览器需要）
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
}

// 🆕 启动流程：恢复上下文 → 异步加载教材 JSON + 题库 JSON → 渲染 UI
(async function bootstrap() {
  // v01.20：老数据一次性迁移到 :default 档案。必须在 loadCtx() / 任何 _pkey 调用之前。
  // - 幂等：第二次启动时直接 return false，不会重复搬
  // - 防御：try-catch 兜底，失败也不阻塞启动（_pkey 自带 fallback）
  try {
    if (window.ProfileManager && typeof window.ProfileManager.migrateLegacyOnce === 'function') {
      window.ProfileManager.migrateLegacyOnce();
    }
  } catch (e) {
    console.warn('[bootstrap] ProfileManager.migrateLegacyOnce failed', e);
  }

  loadCtx();                          // 从 localStorage 读取上次的 ctx
  await Promise.all([
    loadTextbook(),                   // 拉取 data/textbooks/{ctx.textbook}.json
    window.loadQuestionBank(state.ctx.textbook)  // 拉取 4 份题库 JSON
  ]);
  applyContextChange();               // 统一渲染（会调用 renderUnitList + refreshPracticeCounts）
  renderHomeStats();                  // 📊 首页数据看板（真实 localStorage 统计）
})();

// 🆕 全局虚拟键盘检测：弹起时给 body 加 class，让 CSS 自动隐藏底部 tab 栏
//    使用 visualViewport API（iOS/Android 主流浏览器均支持）
(function setupKeyboardDetection() {
  if (!window.visualViewport) return;
  const vv = window.visualViewport;
  function check() {
    // 可视视口高度 vs 布局视口高度差距 > 150px 基本可判定为键盘弹起
    const diff = window.innerHeight - vv.height;
    document.body.classList.toggle('keyboard-open', diff > 150);
  }
  vv.addEventListener('resize', check);
  vv.addEventListener('scroll', check);
  check();
})();

// 切换教材 / 学期 / 年级时重新加载数据
// 把 applyContextChange 包装一层：检测 textbook/term/grade 变化时再 load 一次
// （🆕 grade 变化也触发：分片教材需要按年级拉新文件；整册教材命中内存缓存，零网络开销）
const _originalApplyContextChange = applyContextChange;
// 🆕 初始化为 bootstrap 已加载的值，避免第一次调用重复拉取教材
let _lastLoadedTextbook = (state && state.ctx && state.ctx.textbook) || null;
let _lastLoadedTerm     = (state && state.ctx && state.ctx.term)     || null;
let _lastLoadedGrade    = (state && state.ctx && state.ctx.grade)    || null;
applyContextChange = async function() {
  const tb = state.ctx.textbook;
  const tm = state.ctx.term;
  const gr = state.ctx.grade;
  let needReload = false;
  if (tb !== _lastLoadedTextbook) {
    // 🆕 切教材时，先按静态白名单把年级对齐到该教材覆盖范围（立即反映在下拉），再拉教材 JSON
    try {
      const allow = TEXTBOOK_GRADES[tb] || [1,2,3,4,5,6,7,8,9];
      if (allow.length > 0 && !allow.includes(state.ctx.grade)) {
        state.ctx.grade = allow[0];
        state.currentGrade = gradeNumToKey[state.ctx.grade] || state.currentGrade;
      }
    } catch(e){}
    needReload = true;
  } else if (tm !== _lastLoadedTerm) {
    needReload = true;
  } else if (gr !== _lastLoadedGrade) {
    needReload = true;
  }
  // 🆕 切教材时必须同步重载题库（与 bootstrap / switchToProfile 行为对齐）
  // 否则 window.questionBank 还是上一个教材的，导致练习页筛选错配（症状：徽害数字看着不刷新）
  const textbookChanged = tb !== _lastLoadedTextbook;
  if (needReload) {
    const reloadTasks = [loadTextbook()];
    if (textbookChanged && typeof window.loadQuestionBank === 'function') {
      reloadTasks.push(window.loadQuestionBank(tb));
    }
    await Promise.all(reloadTasks);
    _lastLoadedTextbook = state.ctx.textbook;
    _lastLoadedTerm     = state.ctx.term;
    _lastLoadedGrade    = state.ctx.grade;
  }
  _originalApplyContextChange();
  // 🆕 题库重载后，主动刷一次练习页徽章数（覆盖 textbookChanged 但未触发其它 hook 的场景）
  if (textbookChanged && typeof window.refreshPracticeCounts === 'function') {
    try { window.refreshPracticeCounts(); } catch (e) { /* ignore */ }
  }
};

// 供 renderUnitList 里的"切到XX"按钮调用
function ctxJumpToGrade(n) {
  state.ctx.grade = parseInt(n, 10);
  state.currentGrade = gradeNumToKey[state.ctx.grade] || state.currentGrade;
  applyContextChange();
}
window.ctxJumpToGrade = ctxJumpToGrade;

// =============================================================
// 🔀 不规则动词表 & 练习（数据来自 data/extras/*_irregular_verbs.json）
// =============================================================
// =====================================================================
// 👤 v01.20 多用户档案 UI 模块
// ---------------------------------------------------------------------
// 提供：
//   - switchToProfile(id) ：切档案 + 清所有"档案绑定"内存缓存 + 重新加载 + 刷新 UI
//   - openProfilePanel()  ：弹出 header 下方的档案下拉面板（创建/重命名/删除）
//   - closeProfilePanel() ：关闭面板
//   - renderProfilePanel(): 渲染面板内容（每次打开都重渲，保证列表最新）
//   - refreshProfileBadge(): 刷新 header 上"👤 当前档案 ▾"按钮文字
//   - openCreateProfileModal/openRenameProfileModal: 简单 prompt 弹框
// 入口绑定：bindProfileUI()（DOMContentLoaded 时调用一次）
// =====================================================================

/**
 * 切档案核心：把所有跟"档案绑定"的内存缓存清掉，重读 localStorage，刷新 UI
 * 实现细节来自 code-explorer subagent 的盘点结论
 */
async function switchToProfile(profileId) {
  if (!profileId) return false;
  const ok = window.ProfileManager && window.ProfileManager.setActive(profileId);
  if (!ok) {
    console.warn('[switchToProfile] setActive 失败:', profileId);
    return false;
  }

  // 1) 清"档案绑定"的内存缓存
  _wrongbook = null;
  _stats     = null;
  if (typeof srsReset === 'function') srsReset();   // 🆕 SRS 记忆曲线缓存随档案切换复位
  if (typeof _lastLoadedTextbook !== 'undefined') _lastLoadedTextbook = null;
  if (typeof _lastLoadedTerm     !== 'undefined') _lastLoadedTerm     = null;
  if (typeof _lastLoadedGrade    !== 'undefined') _lastLoadedGrade    = null;
  if (typeof _wrongbookTabFilter !== 'undefined') _wrongbookTabFilter = 'all';
  if (typeof _readingExState     !== 'undefined') _readingExState = { uid: null, lessonIdx: -1, items: [], submitted: false };
  if (typeof _irregPractice      !== 'undefined') _irregPractice = null;

  // 2) 复位 state.ctx 默认值（避免旧档案残留多余字段），再 loadCtx 覆盖
  state.ctx = { grade: 3, term: '上', textbook: 'jk' };
  loadCtx();

  // 3) 重新加载教材 + 题库（与 bootstrap 末尾一致）
  try {
    await Promise.all([
      loadTextbook(),
      window.loadQuestionBank(state.ctx.textbook)
    ]);
  } catch (e) {
    console.warn('[switchToProfile] 教材/题库加载失败', e);
  }

  // 4) 全量刷新 UI
  try { applyContextChange(); } catch (e) { console.warn(e); }
  try { renderHomeStats(); }   catch (e) { console.warn(e); }

  // 5) 跳回首页，避免用户停在某个深层页面看到混乱状态
  try { if (typeof switchPage === 'function') switchPage('home'); } catch (e) {}

  // 6) 刷新 header 档案徽标
  refreshProfileBadge();

  return true;
}

/** 刷新 header 上 "👤 当前档案 ▾" 按钮文字 */
function refreshProfileBadge() {
  try {
    const el = document.getElementById('profileBadgeName');
    if (!el || !window.ProfileManager) return;
    const a = window.ProfileManager.active();
    el.textContent = a && a.name ? a.name : '默认档案';
  } catch (e) {}
}

/** 渲染档案面板内容（列表 + 操作按钮） */
function renderProfilePanel() {
  const panel = document.getElementById('profilePanel');
  if (!panel || !window.ProfileManager) return;
  const list   = window.ProfileManager.list();
  const active = window.ProfileManager.active();
  const html = [
    '<div class="profile-panel-title">👤 学习档案</div>',
    '<div class="profile-panel-list">',
    ...list.map(p => {
      const isActive = (p.id === active.id);
      const safeName = String(p.name || '').replace(/</g, '&lt;');
      return (
        '<div class="profile-row' + (isActive ? ' active' : '') + '" data-id="' + p.id + '">' +
          '<div class="profile-row-main" data-action="switch" data-id="' + p.id + '">' +
            '<span class="profile-row-tick">' + (isActive ? '✓' : '') + '</span>' +
            '<span class="profile-row-name">' + safeName + '</span>' +
          '</div>' +
          '<div class="profile-row-ops">' +
            '<button class="profile-op-btn" data-action="rename" data-id="' + p.id + '" title="重命名">✎</button>' +
            (list.length > 1
              ? '<button class="profile-op-btn profile-op-del" data-action="delete" data-id="' + p.id + '" title="删除档案及其所有数据">🗑</button>'
              : '<button class="profile-op-btn" disabled title="至少保留 1 个档案">🗑</button>') +
          '</div>' +
        '</div>'
      );
    }),
    '</div>',
    '<button id="profileCreateBtn" class="profile-create-btn">+ 新建档案</button>',
    '<div class="profile-panel-hint">不同档案的学习记录、错题本、统计互相独立</div>'
  ].join('');
  panel.innerHTML = html;

  // 绑定事件（事件委托）
  panel.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', async function (ev) {
      ev.stopPropagation();
      const action = el.dataset.action;
      const id     = el.dataset.id;
      if (action === 'switch') {
        if (id === window.ProfileManager.active().id) { closeProfilePanel(); return; }
        closeProfilePanel();
        await switchToProfile(id);
      } else if (action === 'rename') {
        const cur = window.ProfileManager.list().find(p => p.id === id);
        const newName = prompt('给档案重命名：', cur ? cur.name : '');
        if (newName && newName.trim()) {
          window.ProfileManager.update(id, { name: newName.trim() });
          renderProfilePanel();
          if (id === window.ProfileManager.active().id) refreshProfileBadge();
        }
      } else if (action === 'delete') {
        const cur = window.ProfileManager.list().find(p => p.id === id);
        if (!cur) return;
        if (!confirm('确定删除档案"' + cur.name + '"？\n该档案的所有学习记录、错题本、统计将一并删除，无法恢复！')) return;
        const wasActive = (id === window.ProfileManager.active().id);
        window.ProfileManager.remove(id);
        if (wasActive) {
          // 删的是当前档案 → 切到 ProfileManager 自动选定的剩余档案
          closeProfilePanel();
          await switchToProfile(window.ProfileManager.active().id);
        } else {
          renderProfilePanel();
        }
      }
    });
  });

  const createBtn = panel.querySelector('#profileCreateBtn');
  if (createBtn) {
    createBtn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      const name = prompt('给新档案起个名字（如：哥哥 / 妹妹 / 爸爸）：', '');
      if (!name || !name.trim()) return;
      const prof = window.ProfileManager.create(name.trim());
      if (prof) {
        renderProfilePanel();
        // 不自动切，让用户自己决定是否进入新档案
      }
    });
  }
}

function openProfilePanel() {
  const panel = document.getElementById('profilePanel');
  if (!panel) return;
  renderProfilePanel();
  panel.classList.remove('hide');
  // 点击面板外关闭
  setTimeout(function () {
    document.addEventListener('click', _profilePanelOutsideHandler, { once: true });
  }, 0);
}

function closeProfilePanel() {
  const panel = document.getElementById('profilePanel');
  if (panel) panel.classList.add('hide');
}

function _profilePanelOutsideHandler(ev) {
  const panel = document.getElementById('profilePanel');
  const btn   = document.getElementById('profileBadgeBtn');
  if (!panel || panel.classList.contains('hide')) return;
  if (panel.contains(ev.target) || (btn && btn.contains(ev.target))) {
    // 点在面板/按钮内，重新挂监听
    document.addEventListener('click', _profilePanelOutsideHandler, { once: true });
    return;
  }
  closeProfilePanel();
}

/** 入口：DOMContentLoaded 时绑定一次（按钮点击切换面板） */
function bindProfileUI() {
  const btn = document.getElementById('profileBadgeBtn');
  if (!btn) return;
  btn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    const panel = document.getElementById('profilePanel');
    if (panel && panel.classList.contains('hide')) openProfilePanel();
    else closeProfilePanel();
  });
  refreshProfileBadge();
}

// 立即绑定（app.js 是 deferred 加载的，DOM 已就绪；保险起见再监听 DOMContentLoaded）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindProfileUI);
} else {
  bindProfileUI();
}

// 暴露到 window，方便 Console 调试和未来扩展
window.switchToProfile      = switchToProfile;
window.openProfilePanel     = openProfilePanel;
window.closeProfilePanel    = closeProfilePanel;
window.refreshProfileBadge  = refreshProfileBadge;
