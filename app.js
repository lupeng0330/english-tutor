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
// 注：语法数据已迁移到 data/grammar/grammar_knowledge.json（80条结构化）
// 语法渲染由 js/grammar.js 模块负责（window.renderGrammarPage）

// 注：state / TEXTBOOK_NAMES / TEXTBOOK_GRADES / GRADE_LABELS /
// refreshGradeOptionsForTextbook / ctxSummaryText / ctxBadgeText 已迁移到 js/state.js。

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
  if (page === 'grammar') { if (window.renderGrammarPage) window.renderGrammarPage(); try { renderIrregVerbTable(); } catch(e){} }
  if (page === 'report') setTimeout(renderReport, 100);
  if (page === 'wrongbook') { _wbPageFilter = 'all'; renderWrongbookPage(); }
  if (page === 'review') { try { renderReviewPage(); } catch(e) { console.warn(e); } }
  if (page === 'member') { try { if (window.MemberCenter) window.MemberCenter.open(); } catch(e) { console.warn(e); } }
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
// 轻量提示条（Phase 5 权益门控等场景复用）
function showToast(msg, type) {
  try {
    var old = document.getElementById('appToast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.id = 'appToast';
    el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:9999;max-width:90vw;padding:10px 16px;border-radius:10px;font-size:14px;box-shadow:0 6px 20px rgba(0,0,0,.18);' +
      (type === 'warn' ? 'background:#fff7ed;color:#b45309;border:1px solid #fed7aa;' : 'background:#0f172a;color:#fff;');
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 2600);
  } catch (e) {}
}

['ctxGrade', 'ctxTerm', 'ctxTextbook'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('change', (e) => {
    if (id === 'ctxGrade')    state.ctx.grade    = parseInt(e.target.value, 10);
    if (id === 'ctxTerm')     state.ctx.term     = e.target.value;
    if (id === 'ctxTextbook') {
      // Phase 5：付费教材按 textbook_* 权益门控（免费教材始终可访问）
      const want = e.target.value;
      if (window.Entitlements && !window.Entitlements.canTextbook(want)) {
        e.target.value = state.ctx.textbook; // 还原选择
        if (window.ApiClient && window.ApiClient.isLoggedIn && window.ApiClient.isLoggedIn()) {
          showToast('🔒 该教材为会员专享，请到「会员中心」开通对应权益后解锁', 'warn');
        } else {
          showToast('🔒 该教材为会员专享，登录并开通会员后可解锁', 'warn');
        }
        return;
      }
      state.ctx.textbook = want;
    }
    applyContextChange();
  });
});

// ===================== 课本 - 单元列表 =====================
// 计算单元学习进度（0-100 整数），综合「单词掌握」+「阅读自测」两部分：
//   words: unit.words 里在 knownWords 中的数量
//   reading: readingExDone 里该单元已做过的题数（作为分母）/ 其中答对数（作为分子）
// 返回 { pct, known, total, readingOk, readingAttempted }
// renderGrammar 已迁移到 js/grammar.js → window.renderGrammarPage

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

  // Phase 5：持有 ai_chat 权益且 AI 服务开启 → 真·流式对话；否则本地演示 + 会员提示
  if (window.Entitlements && window.Entitlements.canAI('ai_chat')) {
    streamAIChat(text);
    return;
  }

  setTimeout(() => {
    const reply = getAIReply(text);
    addChatMessage(reply, 'ai');
    const enOnly = reply.replace(/<[^>]+>/g, '').replace(/[\u4e00-\u9fa5]/g, '').replace(/[。，！？：；、]/g, '').trim();
    if (enOnly.length > 3) speak(enOnly.substring(0, 120));
    const goMember = ' <a href="javascript:void(0)" onclick="switchPage(\'member\')" class="underline text-sky-600 font-bold">👑 前往会员中心</a>';
    if (window.ApiClient && window.ApiClient.isLoggedIn && window.ApiClient.isLoggedIn()) {
      addChatMessage('🔒 真·AI 对话为会员功能，开通 <b>AI 对话</b> 权益后体验。' + goMember, 'ai');
    } else {
      addChatMessage('💡 登录并开通会员，即可使用真·AI 对话（当前为本地演示回复）。' + goMember, 'ai');
    }
  }, 600);
}

// Phase 5：流式调用后端 /api/ai/chat（SSE），逐字渲染。降级由 sendChat 的 canAI 判断保证。
function streamAIChat(userText) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'flex gap-2';
  div.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm flex-shrink-0">🤖</div>
    <div class="chat-bubble-ai">思考中…</div>`;
  const bubble = div.querySelector('.chat-bubble-ai');
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;

  if (!window.ApiClient || !window.ApiClient.stream) { bubble.textContent = '客户端不支持流式对话'; return; }
  window.ApiClient.stream('POST', '/api/ai/chat', { messages: [{ role: 'user', content: userText }] })
    .then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          let msg = 'AI 服务暂不可用';
          try { var j = JSON.parse(t); if (j && j.error) msg = (typeof j.error === 'string') ? j.error : (j.error.message || msg); } catch (e) {}
          bubble.textContent = '⚠️ ' + msg;
        });
      }
      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      if (!reader) { bubble.textContent = '⚠️ 当前环境不支持流式读取'; return; }
      const decoder = new TextDecoder('utf-8');
      let buf = '';
      let full = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) { bubble.innerHTML = _aiLinkify(full); return; }
          buf += decoder.decode(r.value, { stream: true });
          let idx;
          while ((idx = buf.indexOf('\n\n')) >= 0) {
            const chunk = buf.slice(0, idx); buf = buf.slice(idx + 2);
            const line = chunk.split('\n').find(function (l) { return l.indexOf('data:') === 0; });
            if (!line) continue;
            const data = line.slice(5).trim();
            if (data === '[DONE]') { bubble.innerHTML = _aiLinkify(full); return; }
            try {
              const j = JSON.parse(data);
              const delta = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
              if (delta) { full += delta; bubble.textContent = full; container.scrollTop = container.scrollHeight; }
            } catch (e) {}
          }
          return pump();
        });
      }
      return pump().then(function () { bubble.innerHTML = _aiLinkify(full); });
    })
    .catch(function () { bubble.textContent = '⚠️ 连接 AI 服务失败，请稍后再试。'; });
}

function _aiLinkify(s) { return (typeof escapeHtml === 'function' ? escapeHtml(s) : s).replace(/\n/g, '<br>'); }

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

  // Phase 5：拉取登录用户的「有效权益」与「AI 服务状态」（未登录/失败则无权益，功能降级）
  try { if (window.Entitlements) window.Entitlements.bootstrap(); } catch (e) {}
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
  if (window.__masteryReset) window.__masteryReset(); // 🆕 掌握度缓存随档案切换复位
  if (typeof srsReset === 'function') srsReset();   // 🆕 SRS 记忆曲线缓存随档案切换复位
  try { if (window.ThemeManager) window.ThemeManager.apply(window.ThemeManager.get()); } catch (e) {} // 🆕 主题已档案化，切档后应用新档案主题
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

  // 3.5) 已登录时：拉取新档案的云端数据（错题/统计），让该档案在他端的学习记录同步过来
  try {
    if (window.CloudSync && window.CloudSync.isEnabled && window.CloudSync.isEnabled()) {
      await window.CloudSync.pullAll();
    }
  } catch (e) { console.warn('[switchToProfile] 云端拉取失败（保留本地）', e); }

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
    '<div class="profile-panel-hint">不同档案的学习记录、错题本、统计互相独立</div>',
    _renderCloudAuthHTML(),
    _renderMemberEntryHTML(),
    _renderOfflineAudioHTML(),
    _renderThemePickerHTML()
  ].join('');
  panel.innerHTML = html;
  _bindThemePicker(panel);
  _bindCloudAuth(panel);
  _bindMemberEntry(panel);
  _bindOfflineAudio(panel);

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

/** ☁️ 云账号登录区块 HTML（渐进增强：未登录显示登录/注册入口，已登录显示账号+同步+登出） */
function _renderCloudAuthHTML() {
  if (!window.ApiClient) return '';
  // 后端未开通（如线上未部署云端）：优雅降级——只提示“即将上线”，不显示登录框，避免连不上转圈/误导
  if (window.ApiClient.isBackendAvailable && !window.ApiClient.isBackendAvailable()) {
    return (
      '<div class="cloud-auth" id="cloudAuthBox">' +
        '<div class="cloud-auth-title">☁️ 云同步（即将上线）</div>' +
        '<div class="cloud-auth-hint">当前学习记录、错题本已安全保存在本机，完全可用；跨设备云端同步正在开发中，上线后可登录账号多端同步，敬请期待。</div>' +
      '</div>'
    );
  }
  const user = window.ApiClient.getUser();
  const loggedIn = window.ApiClient.isLoggedIn();
  if (loggedIn && user) {
    const name = String(user.displayName || user.username || '').replace(/</g, '&lt;');
    return (
      '<div class="cloud-auth" id="cloudAuthBox">' +
        '<div class="cloud-auth-title">☁️ 云账号</div>' +
        '<div class="cloud-auth-user">已登录：<b>' + name + '</b></div>' +
        '<div class="cloud-auth-hint">错题本、学习统计已开启云端同步</div>' +
        '<div class="cloud-auth-ops">' +
          '<button id="cloudSyncNowBtn" class="profile-create-btn" style="margin-top:6px">立即同步</button>' +
          '<button id="cloudLogoutBtn" class="profile-op-btn profile-op-del" style="margin-left:8px">登出</button>' +
        '</div>' +
        '<div class="cloud-auth-msg" id="cloudAuthMsg"></div>' +
      '</div>'
    );
  }
  return (
    '<div class="cloud-auth" id="cloudAuthBox">' +
      '<div class="cloud-auth-title">☁️ 云账号（可选）</div>' +
      '<div class="cloud-auth-hint">登录后错题本/统计可跨设备同步；不登录不影响本地使用</div>' +
      '<input id="cloudUser" class="cloud-auth-input" placeholder="用户名" autocomplete="username" />' +
      '<input id="cloudPass" class="cloud-auth-input" type="password" placeholder="密码" autocomplete="current-password" />' +
      '<div class="cloud-auth-ops">' +
        '<button id="cloudLoginBtn" class="profile-create-btn" style="margin-top:6px">登录</button>' +
        '<button id="cloudRegisterBtn" class="profile-op-btn" style="margin-left:8px">注册</button>' +
      '</div>' +
      '<div class="cloud-auth-msg" id="cloudAuthMsg"></div>' +
    '</div>'
  );
}

/** 👑 会员中心入口（档案面板内，桌面/移动端通用；后端未开通时不显示） */
function _renderMemberEntryHTML() {
  if (!window.ApiClient || !window.ApiClient.isBackendAvailable || !window.ApiClient.isBackendAvailable()) return '';
  return (
    '<div class="offline-audio-entry member-entry" id="memberEntryBox">' +
      '<div class="offline-audio-entry-copy">' +
        '<div class="offline-audio-entry-title">👑 会员中心</div>' +
        '<div class="offline-audio-entry-hint">查看会员状态、已解锁权益与套餐订购</div>' +
      '</div>' +
      '<button id="memberEntryBtn" type="button" class="offline-audio-entry-btn">进入</button>' +
    '</div>'
  );
}

function _bindMemberEntry(panel) {
  if (!panel) return;
  const btn = panel.querySelector('#memberEntryBtn');
  if (!btn) return;
  btn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    closeProfilePanel();
    switchPage('member');
  });
}

/** 绑定云账号登录区块事件（独立于档案/主题逻辑） */
function _bindCloudAuth(panel) {
  if (!panel || !window.ApiClient) return;
  const msg = panel.querySelector('#cloudAuthMsg');
  const setMsg = function (t, isErr) {
    if (msg) { msg.textContent = t || ''; msg.style.color = isErr ? '#dc2626' : '#16a34a'; }
  };

  const loginBtn = panel.querySelector('#cloudLoginBtn');
  const registerBtn = panel.querySelector('#cloudRegisterBtn');
  const logoutBtn = panel.querySelector('#cloudLogoutBtn');
  const syncBtn = panel.querySelector('#cloudSyncNowBtn');

  const doLogin = function () {
    const u = (panel.querySelector('#cloudUser') || {}).value || '';
    const p = (panel.querySelector('#cloudPass') || {}).value || '';
    if (!u || !p) { setMsg('请输入用户名和密码', true); return; }
    setMsg('登录中…');
    window.ApiClient.login(u.trim(), p)
      .then(function () {
        // 登录成功：立即更新 UI 为已登录（不再长时间停留“正在同步…”）；
        // 云同步放后台执行，并加 10s 超时兜底——即使同步卡住/失败，也不会转圈、不影响已登录状态。
        renderProfilePanel();
        try {
          if (window.Entitlements) {
            window.Entitlements.refresh().then(function () {
              if (window.MemberCenter && state.currentPage === 'member') window.MemberCenter.refresh();
            });
          }
        } catch (e) {}
        try {
          if (window.CloudSync) {
            var syncP = window.CloudSync.onLogin();
            Promise.race([
              syncP,
              new Promise(function (resolve) { setTimeout(resolve, 10000); }),
            ]).catch(function () {});
          }
        } catch (e) {}
      })
      .catch(function (err) {
        const m = (err && err.body && err.body.error && err.body.error.message) || '登录失败，请检查用户名密码或后端服务';
        setMsg(m, true);
      });
  };

  if (loginBtn) loginBtn.addEventListener('click', function (ev) { ev.stopPropagation(); doLogin(); });
  if (registerBtn) registerBtn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    const u = (panel.querySelector('#cloudUser') || {}).value || '';
    const p = (panel.querySelector('#cloudPass') || {}).value || '';
    if (!u || u.trim().length < 3 || !p || p.length < 6) { setMsg('用户名≥3位、密码≥6位', true); return; }
    setMsg('注册中…');
    window.ApiClient.register(u.trim(), p)
      .then(function () { setMsg('注册成功，正在登录…'); doLogin(); })
      .catch(function (err) {
        const m = (err && err.body && err.body.error && err.body.error.message) || '注册失败';
        setMsg(m, true);
      });
  });
  if (logoutBtn) logoutBtn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    window.ApiClient.logout().then(function () {
      if (window.CloudSync) window.CloudSync.onLogout();
      try {
        if (window.Entitlements) {
          window.Entitlements.refresh().then(function () {
            if (window.MemberCenter && state.currentPage === 'member') window.MemberCenter.refresh();
          });
        }
      } catch (e) {}
      renderProfilePanel();
    });
  });
  if (syncBtn) syncBtn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    setMsg('同步中…');
    // 推送全部同步 key（错题/统计/考试历史/掌握度/SRS/主题/推题/上下文/档案列表），再拉取合并
    var keys = (window.CloudSync && window.CloudSync.keys) || [];
    Promise.all(keys.map(function (k) { return window.CloudSync.pushNow(k); }))
      .then(function () {
        return window.CloudSync ? window.CloudSync.pullAll() : null;
      }).then(function () { setMsg('同步完成'); })
      .catch(function () { setMsg('同步失败，请稍后重试', true); });
  });
}

/** Phase 3.5 离线语音包入口（下载数据全局共享，不跟随学习档案切换） */
function _renderOfflineAudioHTML() {
  if (!window.OfflineAudio) return '';
  return (
    '<div class="offline-audio-entry">' +
      '<div class="offline-audio-entry-copy">' +
        '<div class="offline-audio-entry-title">离线语音包</div>' +
        '<div class="offline-audio-entry-hint" data-offline-audio-summary>正在读取当前教材…</div>' +
      '</div>' +
      '<button id="offlineAudioManageBtn" type="button" class="offline-audio-entry-btn">管理</button>' +
    '</div>'
  );
}

function _bindOfflineAudio(panel) {
  if (!panel || !window.OfflineAudio) return;
  const summary = panel.querySelector('[data-offline-audio-summary]');
  window.OfflineAudio.updateSummary(summary);
  const button = panel.querySelector('#offlineAudioManageBtn');
  if (button) button.addEventListener('click', function (ev) {
    ev.stopPropagation();
    closeProfilePanel();
    window.OfflineAudio.openManager();
  });
}

/** 🎨 主题选择器 HTML（6 套色卡，当前高亮） */
function _renderThemePickerHTML() {
  if (!window.ThemeManager) return '';
  const cur = window.ThemeManager.get();
  const cards = window.ThemeManager.list().map(function (t) {
    const on = (t.id === cur);
    return (
      '<button class="theme-card' + (on ? ' active' : '') + '" data-theme-id="' + t.id + '" title="' + t.desc + '">' +
        '<span class="theme-card-swatch" style="background:linear-gradient(135deg,' + t.c1 + ',' + t.c2 + ')">' + (on ? '✓' : '') + '</span>' +
        '<span class="theme-card-name">' + t.name + '</span>' +
      '</button>'
    );
  }).join('');
  return (
    '<div class="theme-picker">' +
      '<div class="theme-picker-title">🎨 界面主题</div>' +
      '<div class="theme-card-grid">' + cards + '</div>' +
    '</div>'
  );
}

/** 绑定主题色卡点击：切换主题 + 刷新高亮 */
function _bindThemePicker(panel) {
  if (!panel || !window.ThemeManager) return;
  panel.querySelectorAll('.theme-card[data-theme-id]').forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      const id = btn.dataset.themeId;
      window.ThemeManager.set(id);
      // 刷新色卡高亮（重渲染主题区块即可）
      const wrap = panel.querySelector('.theme-picker');
      if (wrap) {
        wrap.outerHTML = _renderThemePickerHTML();
        _bindThemePicker(panel);
      }
    });
  });
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
