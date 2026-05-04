// ===================== 教材数据（改为异步从 data/textbooks/jk.json 加载）=====================
// 运行时容器：textbookData[grade3].title / units，和原结构保持兼容
let textbookData = {};
let _currentTextbookMeta = null;

// 根据 state.ctx 构造教材 JSON 路径（支持未来多教材版本）
function textbookJsonPath() {
  const id = state && state.ctx && state.ctx.textbook ? state.ctx.textbook : 'jk';
  return 'data/textbooks/' + id + '.json';
}

// 异步加载教材 JSON，转换成原来 textbookData 的结构
async function loadTextbook() {
  const url = textbookJsonPath();
  try {
    const res = await fetch(url + '?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    _currentTextbookMeta = data.meta || null;

    // 把 grades.grade3.上/下 结构展平成 textbookData[grade3] = { title, units, term 一起 }
    const out = {};
    const term = (state && state.ctx && state.ctx.term) || '上';
    for (const [gk, terms] of Object.entries(data.grades || {})) {
      const units = (terms && terms[term]) || [];
      const gnum = parseInt(String(gk).replace('grade',''), 10);
      const gradeText = ({1:'小学一年级',2:'小学二年级',3:'小学三年级',4:'小学四年级',5:'小学五年级',6:'小学六年级',7:'初中一年级',8:'初中二年级',9:'初中三年级'})[gnum] || gk;
      const termText = term === '上' ? '上册' : '下册';
      out[gk] = {
        title: gradeText + termText,
        units: units
      };
    }
    textbookData = out;
    console.log('[教材] 已加载', url, '教材版本=' + (data.meta && data.meta.name));
    return true;
  } catch(err) {
    console.error('[教材] 加载失败:', url, err);
    return false;
  }
}

// 语法
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

// 练习题（已替换为真实题库：见 questionBank.js，通过 window.questionBank 访问）
// ===================== 状态 =====================
let state = {
  currentPage: 'home',
  currentGrade: 'grade3',
  currentUnit: null,
  currentWordIndex: 0,
  currentLessonIndex: 0, // 🆕 当前单元内课文分篇索引
  quizType: 'grammar',
  quizIndex: 0,
  quizCorrect: 0,
  quizQuestions: [], // 当前抽取的题组
  quizStartTime: 0,
  isRecording: false,
  currentChild: 'xiaoming',
  // 🆕 全局学习上下文（年级+学期+教材版本）
  ctx: {
    grade: 3,          // 3/4/5/6/7/8/9
    term: '上',        // '上' | '下'
    textbook: 'jk'     // jk=广州教科版, rj=人教版（待开发）, wy=外研版（待开发）
  },
  includeAllGrades: false,  // 练习题"包含全部年级"复选框
  filterDifficulty: 0
};

// 🆕 学习上下文工具函数
const TEXTBOOK_NAMES = { jk: '广州教科版', gzk: '广州口语', rj: '人教版', wy: '外研版' };
function ctxSummaryText(ctx) {
  const g = gradeText(ctx.grade);
  const t = ctx.term === '上' ? '上册' : '下册';
  const b = TEXTBOOK_NAMES[ctx.textbook] || ctx.textbook;
  return `${g} · ${t} · ${b}`;
}
function ctxBadgeText(ctx) {
  const g = ({1:'一年级',2:'二年级',3:'三年级',4:'四年级',5:'五年级',6:'六年级',7:'初一',8:'初二',9:'初三'})[ctx.grade] || '';
  const t = ctx.term === '上' ? '上' : '下';
  return `${g}${t}册`;
}

// ===================== 错题本（B3）=====================
// 存储在 localStorage: { "textbook::type::qid": { type, question, wrongCount, correctStreak, lastWrongAt, lastAnswerAt } }
// qid 用题库的 code+q 组合产生稳定 hash（题库没 id 字段）
const WRONGBOOK_STORAGE_KEY = 'yxyy_wrongbook_v1';
const WRONGBOOK_CORRECT_STREAK_TO_REMOVE = 2;  // 连续答对 N 次自动移出错题本
let _wrongbook = null;

function _loadWrongbook() {
  if (_wrongbook) return _wrongbook;
  try {
    const raw = localStorage.getItem(WRONGBOOK_STORAGE_KEY);
    _wrongbook = raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('[错题本] 加载失败', e);
    _wrongbook = {};
  }
  return _wrongbook;
}
function _saveWrongbook() {
  try {
    localStorage.setItem(WRONGBOOK_STORAGE_KEY, JSON.stringify(_wrongbook || {}));
  } catch (e) {
    console.warn('[错题本] 保存失败', e);
  }
}

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
// 供调试用：把当前本轮错题手动推进错题本（正常流程 answerQuiz 已自动调 recordAnswer）
window.__wrongbook = { get: getWrongQuestions, count: getWrongCount, clear: clearWrongbook };

// ===================== B2 智能推题 =====================
// 根据错题本给题目打分，加权随机抽取（不放回）；
// 同一题在题库 + 错题本之间靠 _wbKey 关联。
// 用户可通过 state.smartPick = false 关闭（走纯随机）。
function _scoreQuestion(type, q) {
  const wb = _loadWrongbook();
  const key = _wbKey(type, q);
  const rec = wb[key];
  let score = 1;                 // 基础分
  let tag = '';
  if (rec) {
    score += 3 * (rec.wrongCount || 0);
    const dt = Date.now() - (rec.lastWrongAt || 0);
    const DAY = 24 * 3600 * 1000;
    if (dt <= DAY)          score += 3;           // 24h 内错过 → 强化
    else if (dt <= 7 * DAY) score += 1.5;         // 一周内错过 → 中等
    // 再久远就只靠 wrongCount
    tag = '🔥';
  }
  // 难度高一点点的稍微优先（让练习不全是简单题）
  if (q.difficulty === 3) score += 0.3;
  return { score, tag };
}

function pickSmartQuestions(questions, n, type) {
  if (!questions || !questions.length) return [];
  if (n >= questions.length) {
    // 全取的情况下保留 Fisher-Yates 打乱
    const arr = questions.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  // 打分（type 由调用方传入，避免 state.quizType 时序问题）
  const t = type || state.quizType || 'spelling';
  const scored = questions.map(q => ({ q, score: _scoreQuestion(t, q).score }));
  // 加权采样不放回（累加权重 → 二分查找）
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
  return picked;
}
// 辅助：判断一道题当前是否"错题本里的"，用于 UI 上打 🔥 标
function isPriorityQuestion(type, q) {
  const wb = _loadWrongbook();
  return !!wb[_wbKey(type, q)];
}
window.__smartpick = { score: _scoreQuestion, pick: pickSmartQuestions };

// ===================== 📊 学习统计（localStorage 真实累计） =====================
const STATS_KEY = 'yxyy_stats_v1';
let _stats = null;
function _loadStats() {
  if (_stats) return _stats;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    _stats = raw ? JSON.parse(raw) : {};
  } catch (e) { _stats = {}; }
  _stats.totalSeconds = _stats.totalSeconds || 0;
  _stats.knownWords   = _stats.knownWords   || {};
  _stats.answers      = _stats.answers      || [];
  _stats.lastActiveDay = _stats.lastActiveDay || '';
  _stats.streak       = _stats.streak       || 0;
  _stats.lastUnit     = _stats.lastUnit     || null;
  return _stats;
}
function _saveStats() {
  try { localStorage.setItem(STATS_KEY, JSON.stringify(_stats || {})); } catch(e) {}
}
function _todayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}
// 更新连续学习天数：今日第一次调 → streak++（隔天）或 streak=1（中断后重启）
function _bumpStreak() {
  const s = _loadStats();
  const today = _todayStr();
  if (s.lastActiveDay === today) return; // 今日已记过
  if (!s.lastActiveDay) {
    s.streak = 1;
  } else {
    // 判断是不是昨天
    const d = new Date(s.lastActiveDay);
    d.setDate(d.getDate() + 1);
    const yest = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    if (yest === today) s.streak = (s.streak || 0) + 1;
    else s.streak = 1; // 中断
  }
  s.lastActiveDay = today;
  _saveStats();
}
// 标记"已掌握单词"（在课本单词卡点 ✓ 认识 时触发）
function markWordKnown(word) {
  if (!word) return;
  const s = _loadStats();
  s.knownWords[String(word).toLowerCase()] = Date.now();
  _saveStats();
  renderHomeStats();
}
// 答题记录（用于本周正确率）
function recordAnswerStats(isCorrect) {
  const s = _loadStats();
  s.answers.push({ at: Date.now(), ok: !!isCorrect });
  if (s.answers.length > 500) s.answers = s.answers.slice(-500);
  _saveStats();
}
// 记录最近学习的单元（给"继续学习"按钮用）
function rememberLastUnit(grade, term, unitId, unitTitle, textbook) {
  const s = _loadStats();
  s.lastUnit = {
    grade: grade, term: term, unitId: unitId, unitTitle: unitTitle,
    textbook: textbook || (state.ctx && state.ctx.textbook) || 'jk',
    at: Date.now()
  };
  _saveStats();
  renderHomeStats();
}
// 页面可见时每 10s +1 个单位（近似学习分钟），隐藏/离开时停止
(function setupTimeTracker() {
  let lastTick = 0;
  function tick() {
    if (document.visibilityState === 'visible') {
      const now = Date.now();
      if (lastTick && (now - lastTick) < 60 * 1000) { // 不超过 1 分钟间隔才累计
        const s = _loadStats();
        s.totalSeconds = (s.totalSeconds || 0) + Math.floor((now - lastTick) / 1000);
        _saveStats();
      }
      lastTick = now;
    } else {
      lastTick = 0;
    }
  }
  setInterval(tick, 10 * 1000);
  document.addEventListener('visibilitychange', () => { lastTick = 0; });
})();
window.__stats = {
  get: _loadStats,
  reset: () => { _stats = {}; _saveStats(); renderHomeStats(); },
  markWordKnown, recordAnswerStats, rememberLastUnit
};

// 首页数据看板渲染
function renderHomeStats() {
  const s = _loadStats();
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText('statTotalTime', Math.floor((s.totalSeconds || 0) / 60));
  setText('statKnownWords', Object.keys(s.knownWords || {}).length);
  setText('statStreak', s.streak || 0);
  setText('headerStreak', s.streak || 0);
  // 本周正确率（最近 7 天）
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const recent = (s.answers || []).filter(a => a.at >= weekAgo);
  if (recent.length === 0) {
    setText('statAccuracy', '—');
  } else {
    const ok = recent.filter(a => a.ok).length;
    setText('statAccuracy', Math.round(ok / recent.length * 100) + '%');
  }
  // 继续学习提示
  const hint = document.getElementById('homeNextHint');
  if (hint) {
    if (s.lastUnit && s.lastUnit.unitTitle) {
      const gText = ({1:'小学一年级',2:'小学二年级',3:'小学三年级',4:'小学四年级',5:'小学五年级',6:'小学六年级',7:'初中一年级',8:'初中二年级',9:'初中三年级'})[parseInt(String(s.lastUnit.grade).replace('grade',''),10)] || s.lastUnit.grade;
      hint.textContent = '接下来：' + gText + ' · ' + (s.lastUnit.term === '下' ? '下册' : '上册') + ' · ' + s.lastUnit.unitTitle;
    } else {
      hint.textContent = '接下来：' + ctxSummaryText(state.ctx);
    }
  }
  // 问候语按时间变
  const greeting = document.getElementById('homeGreeting');
  if (greeting) {
    const h = new Date().getHours();
    greeting.textContent = (h < 5 ? '夜深了，早点休息 🌙' : h < 11 ? 'Good morning ☀️' : h < 14 ? '中午好 🍱' : h < 18 ? 'Good afternoon 📚' : h < 22 ? 'Good evening 🌆' : '晚上好 🌙');
  }
}

// 首页"继续学习"按钮：跳到 lastUnit 或当前 ctx 下的第一个单元
function continueLearning() {
  const s = _loadStats();
  if (s.lastUnit) {
    // 切到相应 ctx
    const gnum = parseInt(String(s.lastUnit.grade).replace('grade',''), 10);
    state.ctx.grade = gnum;
    state.ctx.term  = s.lastUnit.term || '上';
    if (s.lastUnit.textbook) state.ctx.textbook = s.lastUnit.textbook;
    saveCtx();
    applyContextChange();
    // 延时进入课本页 → 单元详情（等 loadTextbook 完成）
    setTimeout(() => {
      switchPage('textbook');
      setTimeout(() => {
        const units = (textbookData[s.lastUnit.grade] && textbookData[s.lastUnit.grade].units) || [];
        const idx = Math.max(0, units.findIndex(u => u.id === s.lastUnit.unitId));
        if (units.length) _showUnitAtIndex(idx);
      }, 300);
    }, 300);
  } else {
    switchPage('textbook');
  }
}
window.continueLearning = continueLearning;

// ===================== 🗂 单元详情页 Tab 切换 =====================
function switchUnitTab(which) {
  const panels = {
    words:  document.getElementById('unitTabWords'),
    lesson: document.getElementById('unitTabLesson')
  };
  const tabs = {
    words:  document.getElementById('tabWords'),
    lesson: document.getElementById('tabLesson')
  };
  Object.keys(panels).forEach(k => {
    if (panels[k]) panels[k].classList.toggle('hide', k !== which);
    if (tabs[k])   tabs[k].classList.toggle('active', k === which);
  });
  // 单词计数器只在 words Tab 显示
  const counter = document.getElementById('wordCounter');
  if (counter) counter.style.display = (which === 'words' ? '' : 'none');
}
window.switchUnitTab = switchUnitTab;

// 课文翻转（英文 ↔ 中文）
function flipLesson() {
  const card  = document.getElementById('lessonFlipCard');
  const label = document.getElementById('lessonFlipLabel');
  if (!card) return;
  const cn = document.getElementById('lessonTranslation');
  if (!cn || !cn.textContent || cn.textContent.indexOf('暂无翻译') >= 0) {
    return; // 没翻译就不翻
  }
  card.classList.toggle('flipped');
  if (label) label.textContent = card.classList.contains('flipped') ? '看原文' : '看译文';
}
window.flipLesson = flipLesson;

// ============ 课文分篇（多篇左右滑动） ============
// 规整化：把单元里的课文数据统一成 [{page,title,en,cn}, ...]
function normalizeLessons(unit) {
  if (!unit) return [];
  // 新格式：lessons 数组
  if (Array.isArray(unit.lessons) && unit.lessons.length > 0) {
    return unit.lessons.filter(l => l && (l.en || '').trim().length > 0);
  }
  // 旧格式：lesson/lessonCN 单篇字符串
  if (typeof unit.lesson === 'string' && unit.lesson.trim().length > 0) {
    return [{
      page: '',
      title: '课文',
      en: unit.lesson,
      cn: unit.lessonCN || ''
    }];
  }
  return [];
}

// 渲染指定索引的课文；lessons 传入避免每次重新 normalize
function renderLessonAt(idx, lessons) {
  const list = lessons || normalizeLessons(state.currentUnit);
  const total = list.length;
  const textEl = document.getElementById('lessonText');
  const cnEl   = document.getElementById('lessonTranslation');
  const nav    = document.getElementById('lessonNav');
  const dots   = document.getElementById('lessonDots');
  const titleEl= document.getElementById('lessonPageTitle');
  const idxEl  = document.getElementById('lessonPageIndex');
  const prevBtn= document.getElementById('lessonPrevBtn');
  const nextBtn= document.getElementById('lessonNextBtn');
  const flipBtn= document.getElementById('lessonFlipBtn');
  const card   = document.getElementById('lessonFlipCard');

  // 翻转状态重置
  if (card) card.classList.remove('flipped');
  const label = document.getElementById('lessonFlipLabel');
  if (label) label.textContent = '看译文';

  if (total === 0) {
    if (textEl) textEl.textContent = '📖 本单元课文内容待补充。\n（教材结构已导入，内容请通过课本核对后补到 data/textbooks/*.json）';
    if (cnEl)   cnEl.textContent   = '（暂无翻译）';
    if (nav)    nav.classList.add('hide');
    if (dots)   { dots.classList.add('hide'); dots.innerHTML = ''; }
    if (flipBtn) flipBtn.style.display = 'none';
    state.currentLessonIndex = 0;
    return;
  }

  // 夹紧 idx
  if (idx < 0) idx = 0;
  if (idx >= total) idx = total - 1;
  state.currentLessonIndex = idx;
  const cur = list[idx];

  if (textEl) textEl.textContent = cur.en || '';
  const cnText = (cur.cn || '').trim();
  if (cnEl)   cnEl.textContent   = cnText || '（暂无翻译）';
  if (flipBtn) flipBtn.style.display = cnText ? '' : 'none';

  // 导航条：多于 1 篇才显示
  if (total > 1) {
    if (nav)  nav.classList.remove('hide');
    if (dots) dots.classList.remove('hide');
  } else {
    if (nav)  nav.classList.add('hide');
    if (dots) dots.classList.add('hide');
  }

  // 标题 / 索引
  const page = (cur.page || '').trim();
  const tt   = (cur.title || '').trim();
  if (titleEl) titleEl.textContent = page ? (tt ? page + ' · ' + tt : page) : (tt || ('第 ' + (idx + 1) + ' 篇'));
  if (idxEl)   idxEl.textContent   = '第 ' + (idx + 1) + ' / ' + total + ' 篇';

  // 箭头可用态
  if (prevBtn) prevBtn.disabled = (idx === 0);
  if (nextBtn) nextBtn.disabled = (idx === total - 1);

  // 圆点
  if (dots) {
    dots.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const d = document.createElement('span');
      d.className = 'dot' + (i === idx ? ' active' : '');
      d.onclick = (function(j) { return function(e) { e.stopPropagation(); goLesson(j); }; })(i);
      dots.appendChild(d);
    }
  }
}

function goLesson(i) {
  const list = normalizeLessons(state.currentUnit);
  if (i < 0 || i >= list.length || i === state.currentLessonIndex) return;
  const card = document.getElementById('lessonFlipCard');
  if (card) {
    const dir = i > state.currentLessonIndex ? 'slide-left' : 'slide-right';
    card.classList.remove('slide-left', 'slide-right');
    // 强制重绘以便动画重放
    void card.offsetWidth;
    card.classList.add(dir);
    setTimeout(() => card.classList.remove(dir), 260);
  }
  renderLessonAt(i, list);
  // 切课文时停止正在播放的朗读
  try { if (typeof stopSpeak === 'function') stopSpeak(); } catch(e){}
  try {
    if (typeof _lessonAudio !== 'undefined' && _lessonAudio) {
      _lessonAudio.pause(); _lessonAudio.src = ''; _lessonAudio = null;
    }
    if (typeof _lessonPlaying !== 'undefined') _lessonPlaying = false;
    const btn = document.getElementById('lessonPlayBtn');
    const st  = document.getElementById('lessonPlayStatus');
    if (btn) btn.innerHTML = '▶';
    if (st)  { st.textContent = '点击播放真人朗读'; st.className = 'text-sm text-slate-600'; }
  } catch(e){}
}
function prevLesson() { goLesson(state.currentLessonIndex - 1); }
function nextLesson() { goLesson(state.currentLessonIndex + 1); }
window.prevLesson = prevLesson;
window.nextLesson = nextLesson;
window.goLesson   = goLesson;

// 触屏左右滑动切换课文
(function bindLessonSwipe() {
  function bind() {
    const card = document.getElementById('lessonFlipCard');
    if (!card || card._swipeBound) return;
    card._swipeBound = true;
    let sx = 0, sy = 0, moved = false;
    card.addEventListener('touchstart', function(e) {
      if (!e.touches || !e.touches[0]) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      moved = false;
    }, { passive: true });
    card.addEventListener('touchmove', function(e) {
      if (!e.touches || !e.touches[0]) return;
      const dx = e.touches[0].clientX - sx;
      const dy = e.touches[0].clientY - sy;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) moved = true;
    }, { passive: true });
    card.addEventListener('touchend', function(e) {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - sx;
      const dy = e.changedTouches[0].clientY - sy;
      if (moved && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        // 横向滑动，拦截翻转点击
        if (dx < 0) nextLesson(); else prevLesson();
      }
    }, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();


// 单元学习进度条（按"该单元已掌握单词数 / 单元总词数"显示）
function updateUnitProgress() {
  if (!state.currentUnit || !state.currentUnit.words) return;
  const words = state.currentUnit.words;
  const total = words.length;
  const knownMap = _loadStats().knownWords || {};
  let knownInUnit = 0;
  for (const w of words) {
    if (knownMap[String(w.word).toLowerCase()]) knownInUnit++;
  }
  const pct = total > 0 ? Math.round(knownInUnit / total * 100) : 0;
  const bar = document.getElementById('unitProgressBar');
  const pctEl = document.getElementById('unitProgressPct');
  const label = document.getElementById('unitProgressLabel');
  if (bar)   bar.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';
  if (label) label.textContent = knownInUnit + ' / ' + total + ' 词已掌握';
}





// 保存/恢复学习上下文（跨会话记忆）
function saveCtx() {
  try {
    localStorage.setItem('yxyy_ctx', JSON.stringify(state.ctx));
  } catch(e) {}
}
function loadCtx() {
  try {
    const raw = localStorage.getItem('yxyy_ctx');
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
function gradeText(n){ return ({3:'小学三年级',4:'小学四年级',5:'小学五年级',6:'小学六年级',7:'初中一年级',8:'初中二年级',9:'初中三年级'})[n] || '未知'; }

// ===================== 导航 =====================
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
  if (page === 'grammar') renderGrammar();
  if (page === 'report') setTimeout(renderReport, 100);
  if (page === 'practice') {
    // 重置练习视图到初始状态
    document.getElementById('practiceQuizView').classList.add('hide');
    document.getElementById('practiceResultView').classList.add('hide');
    document.getElementById('practiceFilterView').classList.remove('hide');
    document.getElementById('practiceTypeView').classList.remove('hide');
    refreshPracticeCounts();
  }
}

// ===================== 孩子切换（已移除：当前单用户 Demo） =====================
// 如果未来接真实多用户，在此挂上 onChildChange
// 相关 UI 元素已从 index.html 删除，保留 childMap 结构给未来用


// ===================== 🆕 全局学习上下文切换 =====================
function applyContextChange() {
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
  try { refreshPracticeCounts(); } catch(e) {}

  // 6) 持久化
  saveCtx();
}

// 切换上下文时处理练习状态
function resetPracticeOnContextChange() {
  // 停掉可能正在播放的音频
  try { stopSpeak(); } catch(e) {}
  if (typeof _listeningAudio !== 'undefined' && _listeningAudio) {
    try { _listeningAudio.pause(); _listeningAudio.src = ''; } catch(e){}
    _listeningAudio = null;
  }
  if (typeof _listeningPlaying !== 'undefined') _listeningPlaying = false;

  const quizView   = document.getElementById('practiceQuizView');
  const resultView = document.getElementById('practiceResultView');
  const typeView   = document.getElementById('practiceTypeView');
  const filterView = document.getElementById('practiceFilterView');

  const inQuiz   = quizView   && !quizView.classList.contains('hide');
  const inResult = resultView && !resultView.classList.contains('hide');

  // 正在答题：用新学段的题库重新抽题，无缝留在当前答题界面
  if (inQuiz && state.quizType) {
    const newQs = filterQuestions(state.quizType);
    if (newQs.length > 0) {
      const shuffled = [...newQs].sort(() => Math.random() - 0.5).slice(0, Math.min(10, newQs.length));
      state.quizQuestions = shuffled;
      state.quizIndex = 0;
      state.quizCorrect = 0;
      state.quizStartTime = Date.now();
      const totalEl = document.getElementById('quizTotal');
      if (totalEl) totalEl.textContent = shuffled.length;
      showQuiz();   // 刷新当前题目 UI

      // 显示 toast 提示 2 秒
      const toast = document.getElementById('quizRefreshToast');
      const ctxSpan = document.getElementById('quizRefreshCtx');
      if (toast && ctxSpan) {
        ctxSpan.textContent = ctxBadgeText(state.ctx) + ' · ' + ({spelling:'单词拼写',listening:'听力选择',grammar:'语法练习',reading:'阅读理解'}[state.quizType] || '');
        toast.classList.remove('hide');
        clearTimeout(window._quizToastTimer);
        window._quizToastTimer = setTimeout(() => toast.classList.add('hide'), 2000);
      }
      return;
    } else {
      // 新学段下这种题型没题，回到选择页 + 提示
      state.quizQuestions = [];
      quizView.classList.add('hide');
      if (typeView)   typeView.classList.remove('hide');
      if (filterView) filterView.classList.remove('hide');
      setTimeout(() => {
        alert('⚠️ ' + ctxBadgeText(state.ctx) + ' 下暂无"' +
              ({spelling:'单词拼写',listening:'听力选择',grammar:'语法练习',reading:'阅读理解'}[state.quizType]) +
              '"题目，请切换到其他学段或勾选"包含全部年级"');
      }, 100);
      return;
    }
  }

  // 结果页：直接回选择页（做完的结果没意义了）
  if (inResult) {
    state.quizQuestions = [];
    state.quizIndex = 0;
    state.quizCorrect = 0;
    resultView.classList.add('hide');
    if (typeView)   typeView.classList.remove('hide');
    if (filterView) filterView.classList.remove('hide');
    return;
  }

  // 非答题状态：清空即可
  state.quizQuestions = [];
  state.quizIndex = 0;
  state.quizCorrect = 0;
}

// 绑定顶部上下文条三个下拉
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
function renderUnitList() {
  const data = textbookData[state.currentGrade];
  const container = document.getElementById('unitList');
  container.innerHTML = data.units.map(u => `
    <div class="unit-card" onclick="openUnit('${u.id}')">
      <div class="flex items-start justify-between mb-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xl font-bold">${u.title.split(' ')[1] || 'U'}</div>
        <span class="badge ${u.progress === 100 ? 'bg-green-100 text-green-700' : u.progress > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}">
          ${u.progress === 100 ? '已完成' : u.progress > 0 ? '学习中' : '未开始'}
        </span>
      </div>
      <div class="font-bold text-slate-800">${u.title}</div>
      <div class="text-xs text-slate-500 mt-1">${u.words.length} 个单词</div>
      <div class="mt-3">
        <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style="width: ${u.progress}%"></div>
        </div>
        <div class="text-xs text-slate-500 mt-1">进度 ${u.progress}%</div>
      </div>
    </div>
  `).join('');
  document.getElementById('unitListView').classList.remove('hide');
  document.getElementById('unitDetailView').classList.add('hide');
}

function openUnit(unitId) {
  const units = textbookData[state.currentGrade] && textbookData[state.currentGrade].units || [];
  const idx = Math.max(0, units.findIndex(u => u.id === unitId));
  state.currentUnitIndex = idx;
  _showUnitAtIndex(idx);
  document.getElementById('unitListView').classList.add('hide');
  document.getElementById('unitDetailView').classList.remove('hide');
  window.scrollTo(0, 0);
}

// 单元切换（左右箭头/滑动/键盘）
function _showUnitAtIndex(idx) {
  const units = textbookData[state.currentGrade] && textbookData[state.currentGrade].units || [];
  if (!units.length) return;
  idx = Math.max(0, Math.min(idx, units.length - 1));
  state.currentUnitIndex = idx;
  const unit = units[idx];
  state.currentUnit = unit;
  state.currentWordIndex = 0;
  // 📊 记录最近学习的单元
  try { rememberLastUnit(state.currentGrade, state.ctx.term, unit.id, unit.title, state.ctx.textbook); } catch(e) {}
  // 默认切到"单词"Tab + 刷新进度条
  try { switchUnitTab('words'); updateUnitProgress(); } catch(e) {}

  // 更新标题
  document.getElementById('unitDetailTitle').textContent = unit.title;
  document.getElementById('unitDetailSub').textContent = textbookData[state.currentGrade].title;
  const pager = document.getElementById('unitDetailPager');
  if (pager) pager.textContent = `第 ${idx + 1} / ${units.length} 单元`;

  // 左右按钮可用状态
  const prev = document.getElementById('unitPrevBtn');
  const next = document.getElementById('unitNextBtn');
  if (prev) prev.style.opacity = idx === 0 ? '0.35' : '1';
  if (next) next.style.opacity = idx === units.length - 1 ? '0.35' : '1';

  // 更新单词+课文（兼容"占位单元"：没 words/lesson 时显示友好提示）
  const hasWords  = Array.isArray(unit.words)  && unit.words.length > 0;
  // 🆕 规整化课文：优先用 lessons[] 多篇，兼容旧的 lesson/lessonCN 单篇
  const lessonList = normalizeLessons(unit);
  const hasLesson = lessonList.length > 0;
  document.getElementById('wordTotal').textContent = hasWords ? unit.words.length : 0;

  // 切单元时重置课文分篇索引
  state.currentLessonIndex = 0;
  renderLessonAt(0, lessonList);

  try {
    // 单词面空时：显示占位
    const wordText     = document.getElementById('wordText');
    const wordPhonetic = document.getElementById('wordPhonetic');
    const wordMeaning  = document.getElementById('wordMeaning');
    const wordExample  = document.getElementById('wordExample');
    if (!hasWords) {
      if (wordText)     wordText.textContent     = '（待补充）';
      if (wordPhonetic) wordPhonetic.textContent = '';
      if (wordMeaning)  wordMeaning.textContent  = '本单元单词待补充';
      if (wordExample)  wordExample.textContent  = '请根据课本把 words 数据填入 data/textbooks/' + (state.ctx.textbook || 'jk') + '.json';
      // 占位单元也隐藏例句区块
      const exWrap = document.getElementById('wordExamplesWrap');
      if (exWrap) exWrap.classList.add('hide');
    }
    // 课文朗读按钮：没内容时禁用
    const pb = document.getElementById('lessonPlayBtn');
    if (pb) {
      pb.disabled = !hasLesson;
      pb.style.opacity = hasLesson ? '1' : '0.4';
      pb.style.cursor  = hasLesson ? 'pointer' : 'not-allowed';
    }
  } catch(e) {}

  // 停掉任何正在播放的课文朗读
  try { stopSpeak(); } catch(e) {}
  if (typeof _lessonPlaying !== 'undefined') _lessonPlaying = false;
  if (typeof _lessonAudio !== 'undefined' && _lessonAudio) {
    try { _lessonAudio.pause(); _lessonAudio.src = ''; } catch(e){}
    _lessonAudio = null;
  }
  // 复位课文朗读按钮
  const lessonPlayStatus = document.getElementById('lessonPlayStatus');
  const lessonPlayBtn    = document.getElementById('lessonPlayBtn');
  if (lessonPlayStatus) {
    lessonPlayStatus.textContent = '点击播放真人朗读';
    lessonPlayStatus.className   = 'text-sm text-slate-600';
  }
  if (lessonPlayBtn) { lessonPlayBtn.disabled = false; lessonPlayBtn.innerHTML = '▶'; }

  // 复位录音 UI
  const recordResult = document.getElementById('recordResult');
  const recordHint   = document.getElementById('recordHint');
  const recordBtn    = document.getElementById('recordBtn');
  if (recordResult) recordResult.classList.add('hide');
  if (recordHint)   recordHint.textContent = '点击开始录音跟读';
  if (recordBtn)    recordBtn.classList.remove('record-pulse');

  showWord();

  // 切换动画（轻微 fade-in）
  const switcher = document.getElementById('unitSwitcher');
  if (switcher) {
    switcher.classList.remove('unit-slide-in');
    void switcher.offsetWidth;  // trigger reflow
    switcher.classList.add('unit-slide-in');
  }
}

function nextUnit() {
  const units = textbookData[state.currentGrade] && textbookData[state.currentGrade].units || [];
  if (state.currentUnitIndex < units.length - 1) _showUnitAtIndex(state.currentUnitIndex + 1);
}
function prevUnit() {
  if (state.currentUnitIndex > 0) _showUnitAtIndex(state.currentUnitIndex - 1);
}

// 绑定左右按钮 + 触屏滑动 + 键盘左右箭头
(function setupUnitSwitcher() {
  const tryBind = () => {
    const prev = document.getElementById('unitPrevBtn');
    const next = document.getElementById('unitNextBtn');
    const area = document.getElementById('unitSwipeArea');
    if (!prev || !next || !area) { setTimeout(tryBind, 100); return; }

    prev.addEventListener('click', prevUnit);
    next.addEventListener('click', nextUnit);

    // 触屏滑动
    let startX = 0, startY = 0, moved = false;
    area.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY; moved = false;
    }, { passive: true });
    area.addEventListener('touchmove', (e) => { moved = true; }, { passive: true });
    area.addEventListener('touchend', (e) => {
      if (!moved) return;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) nextUnit(); else prevUnit();
      }
    });

    // 鼠标拖动（桌面）
    let mouseDownX = null;
    area.addEventListener('mousedown', (e) => { mouseDownX = e.clientX; });
    area.addEventListener('mouseup', (e) => {
      if (mouseDownX === null) return;
      const dx = e.clientX - mouseDownX;
      mouseDownX = null;
      if (Math.abs(dx) > 60) {
        if (dx < 0) nextUnit(); else prevUnit();
      }
    });
    area.addEventListener('mouseleave', () => { mouseDownX = null; });

    // 键盘左右方向键（只在单元详情页可见时生效）
    document.addEventListener('keydown', (e) => {
      const view = document.getElementById('unitDetailView');
      if (!view || view.classList.contains('hide')) return;
      // 如果焦点在输入框里不响应
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'ArrowRight') { nextUnit(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { prevUnit(); e.preventDefault(); }
    });
  };
  tryBind();
})();

function backToUnits() {
  document.getElementById('unitListView').classList.remove('hide');
  document.getElementById('unitDetailView').classList.add('hide');
}

// ===================== 单词卡片 =====================
function showWord() {
  if (!state.currentUnit || !Array.isArray(state.currentUnit.words) || state.currentUnit.words.length === 0) {
    return; // 占位单元：已由 _showUnitAtIndex 渲染好"待补充"提示
  }
  const w = state.currentUnit.words[state.currentWordIndex];
  if (!w) return;
  document.getElementById('wordText').textContent = w.word;
  document.getElementById('wordPhonetic').textContent = w.phonetic;
  document.getElementById('wordMeaning').textContent = w.meaning;
  document.getElementById('wordExample').textContent = w.example;
  document.getElementById('wordIndex').textContent = state.currentWordIndex + 1;
  document.getElementById('wordCard').classList.remove('flipped');
  // 🆕 渲染例句阶梯
  renderWordExamples(w);
}

// ============ 例句阶梯：按需懒加载 examples 文件 ============
// 缓存：textbook id -> { grade_term: { words: { word: [...] } } }
const _examplesCache = {};
const _examplesLoading = {};

function _examplesFileKey(ctx) {
  // 目前仅 jk 教材的 grade6.下 有例句数据，对应 data/examples/jk_grade6_xia.json
  const gradeKey = 'grade' + (ctx.grade || 3);
  const termKey  = ctx.term === '下' ? 'xia' : 'shang';
  return `${ctx.textbook || 'jk'}_${gradeKey}_${termKey}`;
}

function _examplesFilePath(ctx) {
  return `data/examples/${_examplesFileKey(ctx)}.json`;
}

function loadExamplesIfNeeded(ctx, onReady) {
  const key = _examplesFileKey(ctx);
  if (_examplesCache[key] !== undefined) { onReady(_examplesCache[key]); return; }
  if (_examplesLoading[key]) { _examplesLoading[key].push(onReady); return; }
  _examplesLoading[key] = [onReady];
  fetch(_examplesFilePath(ctx))
    .then(r => r.ok ? r.json() : null)
    .catch(() => null)
    .then(data => {
      _examplesCache[key] = data; // null 也缓存，避免反复 404
      const cbs = _examplesLoading[key] || [];
      delete _examplesLoading[key];
      cbs.forEach(cb => { try { cb(data); } catch(e){} });
    });
}

function renderWordExamples(w) {
  const wrap = document.getElementById('wordExamplesWrap');
  const list = document.getElementById('wordExamplesList');
  const toggle = document.getElementById('wordExamplesToggle');
  if (!wrap || !list) return;

  // 先尝试用单词自己带的 examples 字段；否则从独立例句文件查找
  const inlineExamples = Array.isArray(w.examples) ? w.examples : null;
  const draw = (arr) => {
    if (!arr || arr.length === 0) {
      wrap.classList.add('hide');
      return;
    }
    wrap.classList.remove('hide');
    // 默认展开
    list.style.display = '';
    if (toggle) toggle.textContent = '收起';
    list.innerHTML = '';
    arr.forEach((ex) => {
      const lvl = Number(ex.level) || 1;
      const lvlText = lvl === 1 ? '易' : (lvl === 2 ? '中' : '难');
      const item = document.createElement('div');
      item.className = 'example-item';
      const en = (ex.en || '').replace(/&/g,'&amp;').replace(/</g,'&lt;');
      const cn = (ex.cn || '').replace(/&/g,'&amp;').replace(/</g,'&lt;');
      item.innerHTML = `
        <span class="lvl lv${lvl}">${lvlText}</span>
        <div class="ex-body">
          <div class="ex-en">${en}</div>
          <div class="ex-cn">${cn}</div>
        </div>
        <button type="button" class="ex-play" title="朗读例句">🔊</button>
      `;
      const btn = item.querySelector('.ex-play');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { speakBrowser(ex.en || '', {}); } catch(err) { try { speak(ex.en || ''); } catch(e){} }
      });
      list.appendChild(item);
    });
  };

  if (inlineExamples) { draw(inlineExamples); return; }

  // 从 examples 文件查
  loadExamplesIfNeeded(state.ctx || {}, (data) => {
    // 只有当前 word 没变才渲染（防止快速翻页后渲染错乱）
    const cur = state.currentUnit && state.currentUnit.words[state.currentWordIndex];
    if (!cur || cur.word !== w.word) return;
    const arr = (data && data.words && data.words[w.word]) || null;
    draw(arr);
  });
}

function toggleWordExamples() {
  const list = document.getElementById('wordExamplesList');
  const toggle = document.getElementById('wordExamplesToggle');
  if (!list || !toggle) return;
  const collapsed = list.style.display === 'none';
  list.style.display = collapsed ? '' : 'none';
  toggle.textContent = collapsed ? '收起' : '展开';
}
window.toggleWordExamples = toggleWordExamples;

function flipCard() {
  document.getElementById('wordCard').classList.toggle('flipped');
}

function nextWord() {
  if (state.currentWordIndex < state.currentUnit.words.length - 1) {
    state.currentWordIndex++;
    showWord();
  } else {
    alert('🎉 本单元单词学习完毕！');
  }
}

function prevWord() {
  if (state.currentWordIndex > 0) {
    state.currentWordIndex--;
    showWord();
  }
}

function markKnown() {
  // 📊 记录已掌握单词
  try {
    const w = state.currentUnit && state.currentUnit.words[state.currentWordIndex];
    if (w && w.word) markWordKnown(w.word);
    updateUnitProgress();
  } catch(e) {}
  playWord();
  setTimeout(() => nextWord(), 500);
}

function playWord() {
  const w = state.currentUnit.words[state.currentWordIndex];
  speak(w.word);
}

// 课文朗读全局状态锁（防止重复点击导致 TTS 队列重叠）
let _lessonPlaying = false;
let _lessonAudio = null;

function playLesson() {
  const btn = document.getElementById('lessonPlayBtn');
  const status = document.getElementById('lessonPlayStatus');
  // 🆕 优先取"当前分篇"的英文；没有分篇再回退到单元 lesson
  const _lessons = normalizeLessons(state.currentUnit);
  const _curIdx  = Math.min(state.currentLessonIndex || 0, Math.max(0, _lessons.length - 1));
  const text = _lessons.length > 0
    ? (_lessons[_curIdx] && _lessons[_curIdx].en) || ''
    : (state.currentUnit && state.currentUnit.lesson) || '';
  const grade = state.currentGrade;
  const unitId = state.currentUnit && state.currentUnit.id;
  const multiLesson = _lessons.length > 1; // 多篇时 MP3 是整单元合并音，不匹配 → 走 TTS
  if (!text) return;

  const setUI = (state, msg, color) => {
    if (status) {
      status.textContent = msg;
      status.className = 'text-sm ' + (color || 'text-slate-600');
    }
    if (btn) {
      btn.disabled = (state === 'loading');
      btn.innerHTML = state === 'playing' ? '⏸' : (state === 'loading' ? '…' : '▶');
    }
  };

  // 如果正在朗读，当作"停止"按钮用
  if (_lessonPlaying) {
    _lessonPlaying = false;
    if (_lessonAudio) {
      try { _lessonAudio.pause(); _lessonAudio.src = ''; } catch(e){}
      _lessonAudio = null;
    }
    stopSpeak();
    setUI('idle', '⏹ 已停止，点击重新朗读', 'text-slate-600');
    return;
  }

  _lessonPlaying = true;
  stopSpeak();
  setUI('loading', '加载中…', 'text-blue-500');

  // 🎯 候选 MP3 列表（依次尝试）：
  //   1) 分篇 MP3 audio/{grade}{A|B}_{uid}_L{i}.mp3（新：真人多角色）
  //   2) 整单元 MP3 audio/{grade}{A|B}_{uid}.mp3（旧：单女声）——仅在单篇课文时尝试
  //   3) 浏览器 TTS 兜底
  const termAB = (state.ctx && state.ctx.term === '下') ? 'B' : 'A';
  const candidates = [];
  if (grade && unitId) {
    candidates.push(`audio/${grade}${termAB}_${unitId}_L${_curIdx}.mp3`);
    if (!multiLesson) {
      candidates.push(`audio/${grade}${termAB}_${unitId}.mp3`);
    }
  }

  if (candidates.length > 0) {
    tryCandidate(0);
  } else {
    fallbackTTS();
  }

  function tryCandidate(i) {
    if (!_lessonPlaying) return;
    if (i >= candidates.length) { fallbackTTS(); return; }
    const mp3Url = candidates[i];
    const audio = new Audio(mp3Url);
    _lessonAudio = audio;
    let started = false;

    audio.onplaying = () => {
      if (!started) {
        started = true;
        setUI('playing', '🔊 正在朗读…（点击可停止）', 'text-green-600');
      }
    };
    audio.onended = () => {
      if (_lessonAudio === audio) {
        _lessonPlaying = false;
        _lessonAudio = null;
        setUI('idle', '✅ 朗读完成，点击可重听', 'text-slate-600');
      }
    };
    audio.onerror = () => {
      if (_lessonAudio !== audio) return;
      console.warn('[课文] MP3 加载失败，尝试下一候选:', mp3Url);
      _lessonAudio = null;
      tryCandidate(i + 1);
    };

    audio.play().catch((err) => {
      if (_lessonAudio !== audio) return;
      console.warn('[课文] audio.play() 失败:', err && err.name, mp3Url);
      _lessonAudio = null;
      tryCandidate(i + 1);
    });

    // 5 秒还没开始播 → 尝试下一候选
    setTimeout(() => {
      if (_lessonPlaying && !started && _lessonAudio === audio) {
        try { audio.pause(); } catch(e){}
        _lessonAudio = null;
        tryCandidate(i + 1);
      }
    }, 5000);
  }

  function fallbackTTS() {
    if (!_lessonPlaying) return;
    setTimeout(() => {
      if (!_lessonPlaying) return;
      speakBrowser(text, {
        onStart: () => setUI('playing', '🔊 正在朗读（离线模式）…', 'text-green-600'),
        onEnd: () => {
          _lessonPlaying = false;
          setUI('idle', '✅ 朗读完成，点击可重听', 'text-slate-600');
        },
        onError: (why) => {
          _lessonPlaying = false;
          setUI('idle', '⚠️ ' + (why || '播放失败'), 'text-orange-600');
        }
      });
    }, 200);
  }
}

// 纯浏览器 TTS 朗读（用于课文等长文本，无跨域问题）
// 注：Chrome/Edge/大多数移动浏览器的 speechSynthesis 对"单个长 utterance"有丢字 bug，
// 必须把长文本拆成多个短 utterance 依次入队，才能完整朗读。
function speakBrowser(text, callbacks) {
  callbacks = callbacks || {};
  if (!('speechSynthesis' in window)) {
    if (callbacks.onError) callbacks.onError('当前浏览器不支持语音朗读');
    return;
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const isHuawei = /huaweibrowser|hbpc/i.test(ua);

  // 🔧 预处理：把时间数字转成英文单词（手机 Chrome TTS 对 "7:00" 朗读不稳定）
  // 例：7:00 → seven o'clock；7:30 → seven thirty
  const numberWord = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
  const normalized = text.replace(/(\d{1,2}):(\d{2})/g, (_, h, m) => {
    const hh = parseInt(h, 10);
    const mm = parseInt(m, 10);
    const hword = (hh >= 0 && hh <= 12) ? numberWord[hh] : h;
    if (mm === 0)  return hword + " o'clock";
    if (mm === 15) return 'quarter past ' + hword;
    if (mm === 30) return 'half past ' + hword;
    if (mm === 45) return 'quarter to ' + hword;
    if (mm < 10)   return hword + ' oh ' + (numberWord[mm] || mm);
    if (mm < 21)   return hword + ' ' + (numberWord[mm] || mm);
    // 21-59
    return hword + ' ' + m;
  });

  // 把课文按标点切成若干短句
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s);
  if (sentences.length === 0) sentences.push(normalized);

  // 再把超长句子按逗号切
  const utteranceTexts = [];
  for (const sent of sentences) {
    if (sent.length <= 100) {
      utteranceTexts.push(sent);
    } else {
      const subs = sent.split(/,\s*/).map(s => s.trim()).filter(s => s);
      for (const sub of subs) utteranceTexts.push(sub);
    }
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();

      // 挑选英语语音（按音质优先级）
      const voices = window.speechSynthesis.getVoices();
      let chosenVoice = null;
      if (voices && voices.length) {
        const enUS = voices.filter(v => /en[-_]?US/i.test(v.lang));
        const en   = voices.filter(v => /^en/i.test(v.lang));
        const candidates = enUS.length ? enUS : (en.length ? en : voices);

        // 按音质排序优先级（高 → 低）
        const priority = [
          /Google.*US.*English/i,       // Chrome: Google US English (最自然)
          /Microsoft.*Aria.*Natural/i,  // Edge: 神经网络 TTS
          /Microsoft.*Jenny.*Natural/i,
          /Microsoft.*Guy.*Natural/i,
          /Samantha/i,                  // macOS/iOS 默认
          /Ava/i,                       // macOS 高质量
          /Allison/i,
          /Karen/i,
          /Microsoft.*Aria/i,
          /Microsoft.*Zira/i,           // Windows 默认（音质一般但稳定）
          /female/i,
          /en[-_]?US/i                  // 最后兜底任意 en-US
        ];

        for (const pattern of priority) {
          const match = candidates.find(v => pattern.test(v.name));
          if (match) { chosenVoice = match; break; }
        }
        if (!chosenVoice) chosenVoice = candidates[0];
        console.log('[课文 TTS] 选用语音:', chosenVoice && (chosenVoice.name + ' | ' + chosenVoice.lang));
      }

      let started = false;
      let hasErrored = false;
      let hasEnded = false;

      // keepAlive：防止 Chrome 长时间朗读时被浏览器暂停
      const keepAliveTimer = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          try {
            window.speechSynthesis.pause();
            window.speechSynthesis.resume();
          } catch(e) {}
        } else {
          clearInterval(keepAliveTimer);
        }
      }, 10000);

      const finish = (errMsg) => {
        clearInterval(keepAliveTimer);
        if (hasEnded || hasErrored) return;
        if (errMsg) {
          hasErrored = true;
          if (callbacks.onError) callbacks.onError(errMsg);
        } else {
          hasEnded = true;
          if (callbacks.onEnd) callbacks.onEnd();
        }
      };

      // 链式手动触发：一段完全结束后才 speak 下一段（解决手机 Chrome 队列重叠 bug）
      let idx = 0;
      const speakOne = () => {
        if (hasErrored || hasEnded) return;
        if (idx >= utteranceTexts.length) {
          finish();
          return;
        }
        const i = idx++;
        const t = utteranceTexts[i];
        const u = new SpeechSynthesisUtterance(t);
        u.lang = 'en-US';
        u.rate = 0.85;
        u.pitch = 1.0;
        u.volume = 1.0;
        if (chosenVoice) u.voice = chosenVoice;

        u.onstart = () => {
          if (!started) {
            started = true;
            if (callbacks.onStart) callbacks.onStart();
          }
        };
        u.onend = () => {
          // 关键：等 80ms 让手机 Chrome 真正把 speaking 置 false，再启动下一句
          setTimeout(speakOne, 80);
        };
        u.onerror = (e) => {
          console.error('[课文 TTS] utterance #' + i + ' error:', e && e.error);
          // 单句出错不终止整体，继续下一句
          setTimeout(speakOne, 80);
        };

        try {
          window.speechSynthesis.speak(u);
        } catch(e) {
          console.error('[课文 TTS] speak() 异常:', e);
          setTimeout(speakOne, 80);
        }
      };

      speakOne();

      // 4 秒兜底：如果第一段都没开始播
      setTimeout(() => {
        if (!started) {
          clearInterval(keepAliveTimer);
          try { window.speechSynthesis.cancel(); } catch(e){}
          if (!hasErrored) {
            hasErrored = true;
            if (callbacks.onError) callbacks.onError(
              isHuawei ? '华为浏览器不支持此功能，请用 Chrome 或微信打开' : '朗读启动超时，请重试'
            );
          }
        }
      }, 4000);
    } catch(e) {
      console.error('[课文 TTS] 异常:', e);
      if (callbacks.onError) callbacks.onError('朗读出错');
    }
  };

  // 安卓浏览器 voices 是异步加载的
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    doSpeak();
  } else {
    let triggered = false;
    const onReady = () => {
      if (triggered) return;
      triggered = true;
      try { window.speechSynthesis.onvoiceschanged = null; } catch(e){}
      doSpeak();
    };
    try { window.speechSynthesis.onvoiceschanged = onReady; } catch(e){}
    setTimeout(onReady, 1500);
  }
}

// ==================== 语音播放：双引擎 + 长文本分段 ====================
// 有道API对文本长度有限制（约200字符），所以长文本要分段

let _currentAudio = null;
let _playQueue = [];    // 待播放的片段队列
let _playingQueue = false;
let _currentCallbacks = null;  // 当前播放的回调（onStart/onEnd/onError）
let _hasEmittedStart = false;

function stopSpeak() {
  if (_currentAudio) {
    try { _currentAudio.pause(); _currentAudio.src = ''; } catch(e){}
    _currentAudio = null;
  }
  // 清理预加载队列里剩余的 Audio 对象
  if (Array.isArray(_playQueue)) {
    for (const item of _playQueue) {
      if (item && typeof item.pause === 'function') {
        try { item.pause(); item.src = ''; } catch(e){}
      }
    }
  }
  _playQueue = [];
  _playingQueue = false;
  _currentCallbacks = null;
  _hasEmittedStart = false;
  try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch(e){}
  // 多 cancel 几次增加清空队列概率（某些手机浏览器 cancel 只清当前一个）
  try { if ('speechSynthesis' in window) { setTimeout(() => window.speechSynthesis.cancel(), 50); } } catch(e){}
}

// 把长文本按"短语"切分（每段 <= SEG_MAX 字符，按空格切词组合）
// 重要：有道 API 对长 URL/复杂文本有反爬拦截，经测试 "hello" 能响 "Look at my bag..." 不响
// 所以这里把每段严格压到 15 字符以内，每段只包含 1-3 个单词，URL 形态和单个单词几乎一致
function splitText(text) {
  const SEG_MAX = 15;
  // 先按句末标点分句
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s);
  const segs = [];

  for (const sent of sentences) {
    // 再按逗号/分号切短语
    const phrases = sent.split(/[,;]\s*/).map(p => p.trim()).filter(p => p);
    for (const phrase of phrases) {
      if (phrase.length <= SEG_MAX) {
        segs.push(phrase);
      } else {
        // 还是太长，按空格切词并累积到 SEG_MAX
        const words = phrase.split(/\s+/).filter(w => w);
        let buf = '';
        for (const w of words) {
          const next = buf ? buf + ' ' + w : w;
          if (next.length > SEG_MAX && buf) {
            segs.push(buf);
            buf = w;
          } else {
            buf = next;
          }
        }
        if (buf) segs.push(buf);
      }
    }
  }
  return segs.length ? segs : [text];
}

function speak(text, callbacks) {
  if (!text) return;
  stopSpeak();
  _currentCallbacks = callbacks || null;
  _hasEmittedStart = false;

  const segs = splitText(text);

  // 单个短片段（通常是单词 / 短词组）：直接走单次请求路径
  if (segs.length === 1 && segs[0].length <= 15) {
    playYoudao(segs[0],
      () => fallbackWebSpeech(segs[0], _currentCallbacks),
      () => { if (_currentCallbacks && _currentCallbacks.onEnd) _currentCallbacks.onEnd(); }
    );
    return;
  }

  // 多段：串行播放，每一段都在前一段 onended 的回调里紧接着 play
  // 这是 Android/华为浏览器接受的合法链式播放，不会触发"非用户手势"拦截
  playChain(segs, 0);
}

function playChain(segs, idx, preloadedAudio) {
  if (idx >= segs.length) {
    if (_currentCallbacks && _currentCallbacks.onEnd) _currentCallbacks.onEnd();
    return;
  }
  const seg = segs[idx];

  // 同步预加载下一段（在当前 audio 事件栈里，避免 Android 自动播放策略拦截）
  let nextAudio = null;
  if (idx + 1 < segs.length) {
    const nextSeg = segs[idx + 1];
    const nextUrl = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(nextSeg) + '&type=1';
    nextAudio = new Audio(nextUrl);
    nextAudio.preload = 'auto';
    try { nextAudio.load(); } catch(e) {}
  }

  // 如果有预加载好的 audio，直接用；否则新建
  playYoudaoWith(seg, preloadedAudio,
    // onFail
    () => {
      if (idx === 0) {
        fallbackWebSpeech(segs.join(' '), _currentCallbacks);
      } else {
        console.warn('[有道-链] 跳过失败段 #' + idx);
        // 跳过失败段，用预加载的下一段继续
        setTimeout(() => playChain(segs, idx + 1, nextAudio), 150);
      }
    },
    // onEnd: 150ms 后播下一段（给浏览器缓冲时间）
    () => {
      setTimeout(() => playChain(segs, idx + 1, nextAudio), 150);
    }
  );
}

// playYoudao 的变体：支持传入已预加载的 Audio 对象
function playYoudaoWith(text, existingAudio, onFail, onEnd) {
  let audio;
  if (existingAudio) {
    audio = existingAudio;
  } else {
    const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=1';
    audio = new Audio(url);
  }
  _currentAudio = audio;

  let failed = false;
  const handleFail = () => {
    if (failed) return;
    failed = true;
    _currentAudio = null;
    console.warn('[有道] 播放失败，文本:', text.substring(0, 40));
    if (onFail) onFail();
  };

  audio.onerror = handleFail;
  audio.onplaying = () => {
    if (!_hasEmittedStart && _currentCallbacks && _currentCallbacks.onStart) {
      _hasEmittedStart = true;
      _currentCallbacks.onStart();
    }
  };
  audio.onended = () => {
    _currentAudio = null;
    if (onEnd) onEnd();
  };

  audio.play().catch(handleFail);

  // 5秒还没开始播就判定失败
  setTimeout(() => {
    if (_currentAudio === audio && audio.paused && audio.currentTime === 0) {
      handleFail();
    }
  }, 5000);
}

function playYoudao(text, onFail, onEnd) {
  const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(text) + '&type=1';
  const audio = new Audio(url);
  _currentAudio = audio;

  let failed = false;
  const handleFail = () => {
    if (failed) return;
    failed = true;
    _currentAudio = null;
    console.warn('[有道] 播放失败，文本:', text.substring(0, 40));
    if (onFail) onFail();
  };

  audio.onerror = handleFail;
  audio.onplaying = () => {
    if (!_hasEmittedStart && _currentCallbacks && _currentCallbacks.onStart) {
      _hasEmittedStart = true;
      _currentCallbacks.onStart();
    }
  };
  audio.onended = () => {
    _currentAudio = null;
    if (onEnd) onEnd();
  };

  audio.play().catch(handleFail);

  // 5秒还没开始播就判定失败
  setTimeout(() => {
    if (_currentAudio === audio && audio.paused && audio.currentTime === 0) {
      handleFail();
    }
  }, 5000);
}

function fallbackWebSpeech(text, callbacks) {
  callbacks = callbacks || _currentCallbacks;

  // 检测是否华为浏览器（针对性提示）
  const ua = (navigator.userAgent || '').toLowerCase();
  const isHuaweiBrowser = /huaweibrowser|hbpc|version\/[\d.]+ .*huawei/i.test(navigator.userAgent || '');
  const hintMsg = isHuaweiBrowser
    ? '华为浏览器不支持此功能，请复制链接用 Chrome 或微信浏览器打开'
    : '语音加载失败，建议换 Chrome/微信浏览器';

  if (!('speechSynthesis' in window)) {
    console.warn('[浏览器TTS] 不支持 speechSynthesis');
    if (callbacks && callbacks.onError) callbacks.onError(hintMsg);
    return;
  }

  const doSpeak = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = 0.9;
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => /en[-_]?US/i.test(v.lang)) ||
                      voices.find(v => /^en/i.test(v.lang));
      if (enVoice) u.voice = enVoice;
      u.onstart = () => {
        if (!_hasEmittedStart && callbacks && callbacks.onStart) {
          _hasEmittedStart = true;
          callbacks.onStart();
        }
      };
      u.onend = () => { if (callbacks && callbacks.onEnd) callbacks.onEnd(); };
      u.onerror = (e) => {
        console.error('[浏览器TTS] utterance error:', e);
        if (callbacks && callbacks.onError) callbacks.onError(hintMsg);
      };
      window.speechSynthesis.speak(u);

      // 华为浏览器兜底：2秒没触发 onstart 就认为失败
      setTimeout(() => {
        if (!_hasEmittedStart && callbacks && callbacks.onError) {
          callbacks.onError(hintMsg);
        }
      }, 2500);
    } catch(e) {
      console.error('[浏览器TTS] 失败:', e);
      if (callbacks && callbacks.onError) callbacks.onError(hintMsg);
    }
  };

  // 华为/部分安卓浏览器 voices 是异步加载的，首次调用 getVoices() 可能为空
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    doSpeak();
  } else {
    // 等 voices 加载完成再播放
    let triggered = false;
    const onReady = () => {
      if (triggered) return;
      triggered = true;
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
    window.speechSynthesis.onvoiceschanged = onReady;
    // 1秒兜底，即使没有 voices 也强制尝试（某些浏览器根本不触发 voiceschanged）
    setTimeout(onReady, 1000);
  }
}

// ===================== 录音模拟 =====================
function toggleRecord() {
  const btn = document.getElementById('recordBtn');
  const hint = document.getElementById('recordHint');
  const result = document.getElementById('recordResult');

  if (!state.isRecording) {
    state.isRecording = true;
    btn.classList.add('record-pulse');
    btn.textContent = '⏹';
    hint.textContent = '🔴 录音中... 请大声朗读课文，再次点击停止';
    result.classList.add('hide');
  } else {
    state.isRecording = false;
    btn.classList.remove('record-pulse');
    btn.textContent = '🎤';
    hint.textContent = '✅ 录音完成，AI 正在评测...';

    setTimeout(() => {
      const score = 85 + Math.floor(Math.random() * 12);
      document.getElementById('scoreDisplay').textContent = score + ' 分';
      hint.textContent = '点击麦克风重新录音';
      result.classList.remove('hide');
    }, 1500);
  }
}

// ===================== 练习（接入真实题库 window.questionBank） =====================
const QB = () => window.questionBank || { spelling:[], listening:[], grammar:[], reading:[] };

// 按筛选条件筛题
function filterQuestions(type) {
  const all = QB()[type] || [];
  return all.filter(q => {
    // 年级筛选（除非勾选了"包含全部年级"）
    if (!state.includeAllGrades && q.grade !== state.ctx.grade) return false;
    // 学期筛选（题库里 term 可能是"上"/"下"，也可能从 code 的 A/B 判断：A=上, B=下）
    const qTerm = q.term || inferTermFromCode(q.code);
    if (qTerm && qTerm !== state.ctx.term) {
      // 如果题目明确标注了学期且不匹配 → 排除
      // 但在"包含全部年级"时宽松处理（跨年级时也允许跨学期）
      if (!state.includeAllGrades) return false;
    }
    if (state.filterDifficulty > 0 && q.difficulty !== state.filterDifficulty) return false;
    return true;
  });
}

// 从 code（如 "3A_U1" / "3B_U4"）推断学期：A=上, B=下
function inferTermFromCode(code) {
  if (!code) return null;
  const m = String(code).match(/^\d+([AB])/i);
  if (!m) return null;
  return m[1].toUpperCase() === 'A' ? '上' : '下';
}

// 刷新练习入口卡片的题数徽章
function refreshPracticeCounts() {
  ['spelling','listening','grammar','reading'].forEach(t => {
    const el = document.getElementById('count' + t.charAt(0).toUpperCase() + t.slice(1));
    if (el) el.textContent = filterQuestions(t).length + ' 题';
  });
  // 🆕 错题本角标
  const wbCount = getWrongCount();
  const wbEl = document.getElementById('countWrongbook');
  if (wbEl) wbEl.textContent = wbCount + ' 题';
  const wbCard = document.getElementById('practiceCardWrongbook');
  if (wbCard) {
    // 空错题本时给个柔和灰色，避免"0 题"被误点
    if (wbCount === 0) wbCard.classList.add('opacity-60');
    else wbCard.classList.remove('opacity-60');
  }

  // 总题数 + 当前学段提示
  const total = ['spelling','listening','grammar','reading'].reduce((s,t)=>s+filterQuestions(t).length, 0);
  const totalAll = ['spelling','listening','grammar','reading'].reduce((s,t)=>s+(QB()[t]||[]).length, 0);
  const cnt = document.getElementById('filterCount');
  if (cnt) {
    const scope = state.includeAllGrades ? '全部年级' : ctxBadgeText(state.ctx);
    if (totalAll === 0) {
      // 整本教材都没题库（如 gzk 占位）→ 友好提示
      const tbName = TEXTBOOK_NAMES[state.ctx.textbook] || state.ctx.textbook;
      cnt.innerHTML = `<span class="text-slate-500">📖 《${tbName}》暂未配置题库，可切回<b class="text-blue-600">广州教科版</b>练习</span>`;
    } else if (total === 0) {
      cnt.innerHTML = `<span class="text-orange-500">⚠️ ${scope}暂无题目</span>，请勾选"跨年级刷题"或切换学段`;
    } else {
      cnt.textContent = `${scope}共 ${total} 题（题库总计 ${totalAll} 题）`;
    }
  }
}

function startPractice(type) {
  // 🆕 错题本模式：混合 4 种题型，从 localStorage 读
  if (type === 'wrongbook') {
    const all = getWrongQuestions(); // 已按 lastWrongAt 降序
    if (all.length === 0) {
      alert('🎉 错题本是空的，去做几题练习吧！');
      return;
    }
    // 只取本教材版本的错题
    const currentTb = (state.ctx && state.ctx.textbook) || 'jk';
    const mine = all.filter(w => String(w._key).startsWith(currentTb + '::'));
    const list = mine.length ? mine : all;
    // 最多 10 题
    const picked = list.slice(0, Math.min(10, list.length));
    state.quizType = 'wrongbook';
    state.quizQuestions = picked.map(w => Object.assign({}, w.question, { _wbType: w.type }));
    state.quizIndex = 0;
    state.quizCorrect = 0;
    state.quizStartTime = Date.now();
    document.getElementById('quizType').textContent = '🩹 错题重练';
    document.getElementById('quizTotal').textContent = picked.length;
    document.getElementById('practiceTypeView').classList.add('hide');
    document.getElementById('practiceFilterView').classList.add('hide');
    document.getElementById('practiceResultView').classList.add('hide');
    document.getElementById('practiceQuizView').classList.remove('hide');
    showQuiz();
    return;
  }

  const questions = filterQuestions(type);
  if (questions.length === 0) {
    alert('⚠️ 当前筛选条件下没有题目，请放宽筛选后再试！');
    return;
  }
  // 🧠 B2 智能推题：依据错题本给题目打分，加权随机抽取
  //   baseScore = 1
  //   + 3 × wrongCount              （错的次数越多权重越高）
  //   + recencyBoost(lastWrongAt)    （最近错过的优先）
  //   + newQuestionBonus             （从未做过的也给点曝光，避免只刷错题）
  const shuffled = pickSmartQuestions(questions, Math.min(10, questions.length), type);
  state.quizType = type;
  state.quizQuestions = shuffled;
  state.quizIndex = 0;
  state.quizCorrect = 0;
  state.quizStartTime = Date.now();
  const typeLabel = { spelling: '单词拼写', listening: '听力选择', grammar: '语法练习', reading: '阅读理解' };
  document.getElementById('quizType').textContent = typeLabel[type];
  document.getElementById('quizTotal').textContent = shuffled.length;
  document.getElementById('practiceTypeView').classList.add('hide');
  document.getElementById('practiceFilterView').classList.add('hide');
  document.getElementById('practiceResultView').classList.add('hide');
  document.getElementById('practiceQuizView').classList.remove('hide');
  showQuiz();
}

function showQuiz() {
  const q = state.quizQuestions[state.quizIndex];
  const total = state.quizQuestions.length;
  document.getElementById('quizIndex').textContent = state.quizIndex + 1;
  document.getElementById('quizProgress').style.width = ((state.quizIndex + 1) / total * 100) + '%';

  // 🆕 实际题型：错题本模式下取题目自带的 _wbType；其他模式就是 state.quizType
  const realType = (state.quizType === 'wrongbook' && q._wbType) ? q._wbType : state.quizType;

  // 显示年级/难度 badge
  const metaEl = document.getElementById('quizMeta');
  const stars = '★'.repeat(q.difficulty || 1);
  const typeLabelShort = { spelling: '拼写', listening: '听力', grammar: '语法', reading: '阅读' };
  const wbPrefix = state.quizType === 'wrongbook' ? (typeLabelShort[realType] || realType) + ' · ' : '';
  // 🔥 智能推题：非错题本模式下，若此题在错题本里 → 打 🔥 标
  const priorityMark = (state.quizType !== 'wrongbook' && isPriorityQuestion(realType, q)) ? '🔥 ' : '';
  metaEl.textContent = `${priorityMark}${wbPrefix}${gradeText(q.grade)} · ${q.code || ''} · ${stars}`;

  // 听力原文
  const audioBox = document.getElementById('quizAudioBox');
  const audioText = document.getElementById('quizAudioText');
  const playHint = document.getElementById('playAudioHint');
  if (realType === 'listening' && q.audioText) {
    audioBox.classList.remove('hide');
    audioText.textContent = q.audioText;
    audioText.classList.add('hide'); // 默认隐藏原文
    if (playHint) playHint.textContent = '播放后才能作答';
    // ⚠️ 不要自动播放！手机浏览器会拦截未经用户授权的语音
    // 让用户点击按钮触发
  } else {
    audioBox.classList.add('hide');
  }

  // 阅读文章
  const passageBox = document.getElementById('quizPassageBox');
  if (realType === 'reading' && q.passage) {
    passageBox.classList.remove('hide');
    document.getElementById('quizPassage').textContent = q.passage;
  } else {
    passageBox.classList.add('hide');
  }

  const opts = document.getElementById('quizOptions');
  const spellBox = document.getElementById('quizSpellBox');

  if (realType === 'spelling') {
    // ===== 单词拼写：字母格子填空 =====
    const qEl = document.getElementById('quizQuestion');
    const ansLen = (q.answer || '').length;
    qEl.innerHTML = '请拼写：<span class="text-blue-600">"' + (q.q || '') + '"</span>'
                  + '<span class="block text-xs text-slate-400 font-normal mt-1">共 ' + ansLen + ' 个字母</span>';
    qEl.className = 'text-xl sm:text-2xl font-bold text-slate-800 mb-5 text-center';
    opts.innerHTML = '';
    opts.classList.add('hide');
    if (spellBox) {
      spellBox.classList.remove('hide');
      renderSpellCells(q);
      const hintEl = document.getElementById('quizSpellSpeakHint');
      if (hintEl) {
        hintEl.textContent = '点击听发音';
        hintEl.className = 'text-xs text-slate-500';
      }
    }
  } else {
    // ===== 选择题（听力/语法/阅读） =====
    const qEl = document.getElementById('quizQuestion');
    qEl.textContent = q.q;
    qEl.className = 'text-lg font-semibold text-slate-800 mb-4';
    opts.classList.remove('hide');
    if (spellBox) spellBox.classList.add('hide');
    opts.innerHTML = (q.options || []).map((opt, i) => `
      <button onclick="answerQuiz(${i})" class="w-full text-left px-4 py-3 bg-slate-50 rounded-xl hover:bg-blue-50 border-2 border-transparent hover:border-blue-300 transition">
        <span class="inline-block w-6 h-6 rounded-full bg-white text-center font-bold mr-2 text-sm">${String.fromCharCode(65 + i)}</span>
        ${opt}
      </button>
    `).join('');
  }
  document.getElementById('quizFeedback').classList.add('hide');
  document.getElementById('quizNextBtn').classList.add('hide');
}

// 🎲 根据答案长度随机挖空生成 hint（每次调用位置都不同，增加趣味性）
//    难度自适应：
//      长度 ≤3  → 挖 1 个（首字母保留、其他任一位）
//      长度 4-6 → 挖 2-3 个
//      长度 7-9 → 挖 3-4 个
//      长度 ≥10 → 挖 4-5 个
//    规则：至少保留"首字母"作为提示，其他位置从后续字符中随机选 k 个挖掉。
function generateRandomHint(answer) {
  const w = String(answer || '').toLowerCase();
  if (!w) return '';
  const n = w.length;
  let k;
  if      (n <= 3) k = 1;
  else if (n <= 6) k = 2 + ((Math.random() * 2) | 0);   // 2 or 3
  else if (n <= 9) k = 3 + ((Math.random() * 2) | 0);   // 3 or 4
  else             k = 4 + ((Math.random() * 2) | 0);   // 4 or 5
  k = Math.min(k, n - 1);                               // 至少保留 1 个首字母
  if (k <= 0) return w;
  // 从 [1, n-1] 中随机选 k 个位置挖掉（0 位保留首字母）
  const candidates = [];
  for (let i = 1; i < n; i++) candidates.push(i);
  // Fisher-Yates 洗牌
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const blanks = new Set(candidates.slice(0, k));
  let out = '';
  for (let i = 0; i < n; i++) out += blanks.has(i) ? '_' : w[i];
  return out;
}

// 根据 hint（如 "h___o"）生成字母格子：
// - 字母位：固定显示字母（灰色格子）
// - 下划线位：空白输入格（蓝色边框 + 下划线）
// 用户输入时自动跳到下一个空格；删除时自动回到上一个空格。
function renderSpellCells(q) {
  const container = document.getElementById('quizSpellCells');
  if (!container) return;
  const answer = (q.answer || '').toLowerCase();
  // 🎲 每次都动态生成 hint，确保"同一道题每次练习挖的字母位置都不同"
  //    若题目自带的 hint 想保留为"老师指定"风格，把这行改回：let hint = q.hint || '';
  let hint = generateRandomHint(answer);
  // 兜底：若生成失败/长度不符，仍按答案长度首字母提示
  if (!hint || hint.length !== answer.length) {
    hint = answer.charAt(0) + '_'.repeat(Math.max(0, answer.length - 1));
  }

  container.innerHTML = '';
  const inputs = [];
  for (let i = 0; i < hint.length; i++) {
    const ch = hint[i];
    if (ch === '_') {
      // 空格位：单字母输入
      const wrap = document.createElement('div');
      wrap.className = 'relative';
      const inp = document.createElement('input');
      inp.type = 'text';
      inp.maxLength = 1;
      inp.autocomplete = 'off';
      inp.autocapitalize = 'off';
      inp.spellcheck = false;
      inp.setAttribute('inputmode', 'text');
      inp.setAttribute('pattern', '[A-Za-z]');
      inp.dataset.idx = i;
      inp.className = 'spell-cell w-9 h-12 sm:w-10 sm:h-14 text-center text-xl sm:text-2xl font-bold text-indigo-700 '
                    + 'bg-white border-b-4 border-indigo-300 rounded-t-md focus:border-blue-500 focus:outline-none '
                    + 'caret-blue-500';
      wrap.appendChild(inp);
      container.appendChild(wrap);
      inputs.push(inp);
    } else {
      // 字母提示位：灰色固定格
      const box = document.createElement('div');
      box.className = 'w-9 h-12 sm:w-10 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold '
                    + 'text-slate-500 bg-slate-100 border-b-4 border-slate-300 rounded-t-md select-none';
      box.textContent = ch;
      container.appendChild(box);
    }
  }

  // 输入行为：输入后跳下一格；退格回上一格；填满自动判定
  inputs.forEach((inp, k) => {
    // 🆕 focus 时只给 body 加 class（让 CSS 负责隐底部 Tab），不做任何 scrollIntoView
    //    —— 原因：字母格已在答题卡最上方，答题卡本身离 sticky header 很近，不需要滚动；
    //    scrollIntoView 反而会触发可视区变化 + CSS class 切换双重回流，产生"上下浮动"感
    inp.addEventListener('focus', () => {
      document.body.classList.add('keyboard-open');
    });
    inp.addEventListener('blur', () => {
      // 延迟 200ms 移除——如果同时切到另一个 input，它的 focus 会先触发，这里就不误删
      setTimeout(() => {
        const active = document.activeElement;
        if (!active || !active.classList || !active.classList.contains('spell-cell')) {
          document.body.classList.remove('keyboard-open');
        }
      }, 200);
    });
    inp.addEventListener('input', (e) => {
      let v = (inp.value || '').toLowerCase().replace(/[^a-z]/g, '').slice(-1);
      inp.value = v;
      if (v) {
        if (k + 1 < inputs.length) inputs[k + 1].focus();
        checkSpellFilled(q, inputs);
      }
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && k > 0) {
        inputs[k - 1].focus();
        inputs[k - 1].value = '';
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && k > 0) {
        inputs[k - 1].focus(); e.preventDefault();
      } else if (e.key === 'ArrowRight' && k + 1 < inputs.length) {
        inputs[k + 1].focus(); e.preventDefault();
      } else if (e.key === 'Enter') {
        checkSpellFilled(q, inputs, true);
      }
    });
    // 粘贴整词时分发填入各格
    inp.addEventListener('paste', (e) => {
      const text = (e.clipboardData || window.clipboardData).getData('text') || '';
      const letters = text.toLowerCase().replace(/[^a-z]/g, '').split('');
      if (!letters.length) return;
      e.preventDefault();
      let j = k;
      for (const L of letters) {
        if (j >= inputs.length) break;
        inputs[j].value = L;
        j++;
      }
      if (j < inputs.length) inputs[j].focus();
      else inputs[inputs.length - 1].blur();
      checkSpellFilled(q, inputs);
    });
  });

  // 自动聚焦第一个空格
  setTimeout(() => { if (inputs[0]) inputs[0].focus(); }, 80);
}

// 检查是否所有输入格都已填；如是则判定对错
function checkSpellFilled(q, inputs, force) {
  const allFilled = inputs.every(i => i.value && i.value.trim());
  if (!allFilled && !force) return;

  // 拼出用户答案
  const cells = document.querySelectorAll('#quizSpellCells > div, #quizSpellCells > input');
  // 重新按 DOM 顺序拼：固定格取 textContent，输入格取 value
  const kids = document.getElementById('quizSpellCells').children;
  let userWord = '';
  for (const el of kids) {
    if (el.tagName === 'INPUT') userWord += (el.value || '').toLowerCase();
    else {
      // wrap div 内含 input
      const innerInput = el.querySelector && el.querySelector('input');
      if (innerInput) userWord += (innerInput.value || '').toLowerCase();
      else userWord += (el.textContent || '').toLowerCase();
    }
  }
  const correct = (q.answer || '').toLowerCase();

  // 锁定所有输入
  inputs.forEach(i => i.disabled = true);

  const fb = document.getElementById('quizFeedback');
  const isCorrect = (userWord === correct);
  const realType = (state.quizType === 'wrongbook' && q._wbType) ? q._wbType : state.quizType;
  try { recordAnswer(realType, q, isCorrect); } catch(e) { console.warn('[错题本]', e); }
  try { recordAnswerStats(isCorrect); _bumpStreak(); } catch(e) {}
  if (isCorrect) {
    state.quizCorrect++;
    inputs.forEach(i => i.classList.add('!border-green-500', 'bg-green-50', 'text-green-700'));
    fb.className = 'mt-4 p-4 rounded-xl bg-green-50 text-green-800';
    fb.innerHTML = `<b>✅ 回答正确！<span class="confetti-emoji">🎉</span></b>`
      + `<div class="text-sm mt-1">${q.q} = <b>${q.answer}</b></div>`
      + (q.explain ? `<div class="text-sm mt-1">${q.explain}</div>` : '');
  } else {
    // 高亮错误的字母
    let ai = 0;
    for (let i = 0; i < correct.length; i++) {
      if (inputs[ai] && inputs[ai].dataset.idx == i) {
        const expected = correct[i];
        if ((inputs[ai].value || '').toLowerCase() !== expected) {
          inputs[ai].classList.add('!border-red-500', 'bg-red-50', 'text-red-700');
        } else {
          inputs[ai].classList.add('!border-green-500', 'bg-green-50', 'text-green-700');
        }
        ai++;
      }
    }
    fb.className = 'mt-4 p-4 rounded-xl bg-red-50 text-red-800';
    fb.innerHTML = `<b>❌ 回答错误</b>`
      + `<div class="text-sm mt-1">你的答案：<span class="line-through">${escapeHtml(userWord || '(空)')}</span></div>`
      + `<div class="text-sm mt-1">正确答案：<b>${q.answer}</b></div>`
      + (q.explain ? `<div class="text-sm mt-1">${q.explain}</div>` : '');
  }
  fb.classList.remove('hide');
  // 🆕 答对时：同步播放单词发音 —— 必须同步调用 new Audio().play()，否则手机浏览器会拒绝自动播放
  if (isCorrect) {
    try {
      // ① 立刻发起播放（仍在用户最后一次 input 事件的调用栈里 → 算用户手势）
      const word = String(q.answer).trim();
      const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(word) + '&type=1';
      // 停掉旧音频，避免重叠
      try {
        if (typeof _currentAudio !== 'undefined' && _currentAudio) {
          _currentAudio.pause(); _currentAudio.src = '';
        }
      } catch(e) {}
      const audio = new Audio(url);
      _currentAudio = audio;
      audio.onerror = () => {
        // 有道失败 → 降级 TTS（此时可能已脱离手势上下文但 TTS 限制宽松）
        try { speakWordDirect(word); } catch(e) {}
      };
      audio.onended = () => { if (_currentAudio === audio) _currentAudio = null; };
      const p = audio.play();
      if (p && p.catch) p.catch(() => { try { speakWordDirect(word); } catch(e) {} });
    } catch(e) {
      try { speakWordDirect(q.answer); } catch(e2) {}
    }
    // ② 播放发起后，再收键盘（稍延时避免 blur 事件打断播放链）
    setTimeout(() => {
      try {
        inputs.forEach(i => i.blur && i.blur());
        document.body.classList.remove('keyboard-open');
      } catch(e) {}
    }, 50);
  }

  document.getElementById('quizNextBtn').classList.remove('hide');
  document.getElementById('quizNextBtn').textContent =
    state.quizIndex < state.quizQuestions.length - 1 ? '下一题 →' : '查看结果 →';
}

// 听力题音频播放状态
let _listeningPlaying = false;
let _listeningAudio = null;

function playAudioText() {
  const q = state.quizQuestions[state.quizIndex];
  if (!q || !q.audioText) return;
  const hint = document.getElementById('playAudioHint');
  const setHint = (msg, color) => {
    if (!hint) return;
    hint.textContent = msg;
    hint.className = 'text-xs mt-1 ' + (color || 'text-slate-500');
  };

  // 如果正在播，当作停止按钮用
  if (_listeningPlaying) {
    _listeningPlaying = false;
    if (_listeningAudio) {
      try { _listeningAudio.pause(); _listeningAudio.src = ''; } catch(e){}
      _listeningAudio = null;
    }
    stopSpeak();
    setHint('⏹ 已停止，点击可重听', 'text-slate-500');
    return;
  }

  _listeningPlaying = true;
  stopSpeak();
  setHint('加载中…', 'text-blue-500');

  // 🎯 优先播放预生成 MP3（通过 q.audioFile 直接定位，不做 findIndex 字符串匹配）
  const tryMp3 = () => {
    if (!q.audioFile) return false;
    const mp3Url = 'audio/' + q.audioFile;
    console.log('[听力] 尝试播放 MP3:', mp3Url);
    const audio = new Audio(mp3Url);
    _listeningAudio = audio;
    let started = false;

    audio.onplaying = () => {
      started = true;
      setHint('🔊 正在播放... 可以多次点击重听', 'text-blue-600');
    };
    audio.onended = () => {
      _listeningPlaying = false;
      _listeningAudio = null;
      setHint('✅ 播放完成，点击可重听', 'text-slate-500');
    };
    audio.onerror = (e) => {
      console.warn('[听力] MP3 加载失败，降级 TTS:', mp3Url, e);
      _listeningAudio = null;
      fallbackTTS();
    };

    audio.play().catch((err) => {
      console.warn('[听力] audio.play() 失败:', err && err.name, err && err.message);
      _listeningAudio = null;
      fallbackTTS();
    });

    // 5 秒还没开始播就降级
    setTimeout(() => {
      if (_listeningPlaying && !started && _listeningAudio === audio) {
        console.warn('[听力] 5秒未开始，降级 TTS');
        try { audio.pause(); } catch(e){}
        _listeningAudio = null;
        fallbackTTS();
      }
    }, 5000);

    return true;
  };

  const fallbackTTS = () => {
    if (!_listeningPlaying) return;
    setHint('加载中…', 'text-blue-500');
    setTimeout(() => {
      if (!_listeningPlaying) return;
      // 把 W: / M: 转成自然的 Woman: / Man: 让 TTS 好读
      const cleanText = (q.audioText || '')
        .replace(/\bW:/g, 'Woman:')
        .replace(/\bM:/g, 'Man:');
      speakBrowser(cleanText, {
        onStart: () => setHint('🔊 正在播放（离线模式）... 可多次点击重听', 'text-blue-600'),
        onEnd:   () => {
          _listeningPlaying = false;
          setHint('✅ 播放完成，点击可重听', 'text-slate-500');
        },
        onError: (why) => {
          _listeningPlaying = false;
          setHint('⚠️ ' + (why || '播放失败，请重试'), 'text-orange-500');
        }
      });
    }, 200);
  };

  if (!tryMp3()) fallbackTTS();
}

function toggleAudioText() {
  const el = document.getElementById('quizAudioText');
  if (el) el.classList.toggle('hide');
}

function answerQuiz(idx) {
  const q = state.quizQuestions[state.quizIndex];
  const btns = document.querySelectorAll('#quizOptions button');
  btns.forEach(b => b.disabled = true);
  const fb = document.getElementById('quizFeedback');

  const isCorrect = (idx === q.answer);
  const realType = (state.quizType === 'wrongbook' && q._wbType) ? q._wbType : state.quizType;
  try { recordAnswer(realType, q, isCorrect); } catch(e) { console.warn('[错题本]', e); }
  try { recordAnswerStats(isCorrect); _bumpStreak(); } catch(e) {}
  if (isCorrect) {
    state.quizCorrect++;
    btns[idx].classList.add('bg-green-100', 'border-green-500');
    fb.className = 'mt-4 p-4 rounded-xl bg-green-50 text-green-800';
    fb.innerHTML = `<b>✅ 回答正确！<span class="confetti-emoji">🎉</span></b><div class="text-sm mt-1">${q.explain || ''}</div>`;
  } else {
    btns[idx].classList.add('bg-red-100', 'border-red-500');
    if (btns[q.answer]) btns[q.answer].classList.add('bg-green-100', 'border-green-500');
    fb.className = 'mt-4 p-4 rounded-xl bg-red-50 text-red-800';
    const correctText = (q.options && q.options[q.answer] != null) ? q.options[q.answer] : q.answer;
    fb.innerHTML = `<b>❌ 回答错误</b><div class="text-sm mt-1">正确答案：<b>${correctText}</b></div><div class="text-sm mt-1">${q.explain || ''}</div>`;
  }
  fb.classList.remove('hide');
  document.getElementById('quizNextBtn').classList.remove('hide');
  document.getElementById('quizNextBtn').textContent =
    state.quizIndex < state.quizQuestions.length - 1 ? '下一题 →' : '查看结果 →';
}

// 直接朗读单词（不走长文本拆分管线，专为单词发音设计）
// 手机浏览器的 speechSynthesis 必须在用户手势回调同步触发才响，
// 这里保证调用栈足够浅、没有异步延迟。
let _spellSpeakUnlocked = false;
function speakWordDirect(word) {
  if (!word || !('speechSynthesis' in window)) return false;
  try {
    // 取消任何在队列里的旧语音
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(String(word));
    u.lang = 'en-US';
    u.rate = 0.9;
    u.pitch = 1.0;
    u.volume = 1.0;

    // 选个英语语音（同步取，若 voices 还没加载就用默认）
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      if (voices.length) {
        const priority = [
          /Google.*US.*English/i,
          /Microsoft.*Aria.*Natural/i,
          /Microsoft.*Jenny.*Natural/i,
          /Samantha/i, /Ava/i, /Karen/i,
          /Microsoft.*Zira/i, /en[-_]?US/i, /^en/i
        ];
        let voice = null;
        for (const p of priority) {
          const m = voices.find(v => p.test(v.name) || p.test(v.lang));
          if (m) { voice = m; break; }
        }
        if (voice) u.voice = voice;
      }
    } catch(e) {}

    window.speechSynthesis.speak(u);
    _spellSpeakUnlocked = true;
    return true;
  } catch(e) {
    console.warn('[拼写 TTS] 失败:', e);
    return false;
  }
}

// 点击小喇叭：朗读当前拼写题的英文单词（可多次点击重听）
// 策略：优先用有道 dictvoice API 拿 MP3（真人发音，手机 100% 可播）→ 失败降级 Web Speech API
function speakSpellWord() {
  const q = state.quizQuestions[state.quizIndex];
  if (!q || !q.answer) return;
  const hintEl = document.getElementById('quizSpellSpeakHint');
  const word = String(q.answer).trim();
  const setHint = (text, cls) => {
    if (!hintEl) return;
    hintEl.textContent = text;
    hintEl.className = 'text-xs ' + (cls || 'text-slate-500');
  };

  // 先停掉任何在播的老音频
  try {
    if (typeof _currentAudio !== 'undefined' && _currentAudio) {
      _currentAudio.pause(); _currentAudio.src = ''; _currentAudio = null;
    }
  } catch(e) {}
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch(e) {}

  setHint('🔊 加载发音…', 'text-blue-600');

  // 方案 A：有道 API MP3
  const url = 'https://dict.youdao.com/dictvoice?audio=' + encodeURIComponent(word) + '&type=1';
  const audio = new Audio(url);
  _currentAudio = audio;
  let started = false;

  audio.onplaying = () => {
    started = true;
    setHint('🔊 正在播放…点击可重听', 'text-blue-600');
  };
  audio.onended = () => {
    if (_currentAudio === audio) _currentAudio = null;
    setHint('点击可重听', 'text-slate-500');
  };
  audio.onerror = () => {
    // 方案 B：浏览器 TTS 兜底
    console.warn('[拼写] 有道 MP3 失败，降级 TTS');
    const ok = speakWordDirect(word);
    setHint(ok ? '🔊 正在播放…点击可重听' : '⚠️ 当前浏览器不支持语音', ok ? 'text-blue-600' : 'text-orange-500');
  };

  audio.play().catch((err) => {
    console.warn('[拼写] audio.play() 被拒:', err && err.name);
    const ok = speakWordDirect(word);
    setHint(ok ? '🔊 正在播放…点击可重听' : '⚠️ 点一下小喇叭才能播放', ok ? 'text-blue-600' : 'text-orange-500');
  });

  // 3 秒还没播成 → 降级 TTS
  setTimeout(() => {
    if (!started && _currentAudio === audio) {
      try { audio.pause(); } catch(e) {}
      _currentAudio = null;
      const ok = speakWordDirect(word);
      if (ok) setHint('🔊 正在播放…点击可重听', 'text-blue-600');
    }
  }, 3000);
}

function nextQuiz() {
  if (state.quizIndex < state.quizQuestions.length - 1) {
    state.quizIndex++;
    showQuiz();
  } else {
    showQuizResult();
  }
}

function showQuizResult() {
  const total = state.quizQuestions.length;
  const score = Math.round(state.quizCorrect / total * 100);
  document.getElementById('resultScore').textContent = score;
  document.getElementById('resultCorrect').textContent = state.quizCorrect;
  document.getElementById('resultWrong').textContent = total - state.quizCorrect;

  // 用时
  const elapsed = Math.round((Date.now() - state.quizStartTime) / 1000);
  const mm = Math.floor(elapsed / 60), ss = elapsed % 60;
  document.getElementById('resultTime').textContent = `${mm}'${ss.toString().padStart(2,'0')}"`;

  let emoji, msg;
  if (score >= 90) { emoji = '🏆'; msg = '太棒了！继续保持这样的水平！'; }
  else if (score >= 70) { emoji = '🎉'; msg = '表现不错，再加把劲！'; }
  else if (score >= 60) { emoji = '💪'; msg = '及格了，多做几次练习就能更好！'; }
  else { emoji = '📚'; msg = '别灰心，回去复习一下再来挑战！'; }
  document.getElementById('resultEmoji').textContent = emoji;
  document.getElementById('resultMessage').textContent = msg;

  // 🆕 有错题时显示"去错题本重练"提示；错题本模式下不显示
  const wrongHint = document.getElementById('resultWrongbookHint');
  if (wrongHint) {
    const hasWrong = (total - state.quizCorrect) > 0;
    const inWrongbookMode = state.quizType === 'wrongbook';
    if (hasWrong && !inWrongbookMode) wrongHint.classList.remove('hide');
    else wrongHint.classList.add('hide');
  }

  document.getElementById('practiceQuizView').classList.add('hide');
  document.getElementById('practiceResultView').classList.remove('hide');
}

function restartPractice() {
  startPractice(state.quizType);
}

function backToPracticeList() {
  document.getElementById('practiceResultView').classList.add('hide');
  document.getElementById('practiceQuizView').classList.add('hide');
  document.getElementById('practiceTypeView').classList.remove('hide');
  document.getElementById('practiceFilterView').classList.remove('hide');
  refreshPracticeCounts();
}

// ===================== 语法 =====================
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

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ===================== 学习报告 =====================
let chartsInited = false;
function renderReport() {
  const um = document.getElementById('unitMastery');
  const unitsMock = [
    { name: 'Unit 1 Food', percent: 95 },
    { name: 'Unit 2 Colors', percent: 80 },
    { name: 'Unit 3 My Family', percent: 60 },
    { name: 'Unit 4 Animals', percent: 30 },
    { name: 'Unit 5 School', percent: 10 }
  ];
  um.innerHTML = unitsMock.map(u => `
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span class="text-slate-700 font-medium">${u.name}</span>
        <span class="text-slate-500">${u.percent}%</span>
      </div>
      <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style="width: ${u.percent}%"></div>
      </div>
    </div>
  `).join('');

  if (chartsInited) return;
  chartsInited = true;

  const ctx1 = document.getElementById('studyTimeChart');
  if (ctx1) {
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        datasets: [{
          label: '学习时长(分钟)',
          data: [35, 42, 28, 55, 40, 65, 50],
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  const ctx2 = document.getElementById('scoreChart');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'line',
      data: {
        labels: ['第1次', '第2次', '第3次', '第4次', '第5次', '第6次', '第7次'],
        datasets: [{
          label: '得分',
          data: [75, 78, 82, 80, 85, 88, 92],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#6366f1'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: false, min: 60, max: 100 } }
      }
    });
  }
}

// ===================== 初始化 =====================
// 练习筛选器事件
const fa = document.getElementById('filterAllGrades');
const fd = document.getElementById('filterDifficulty');
if (fa) fa.addEventListener('change', (e) => { state.includeAllGrades = e.target.checked; refreshPracticeCounts(); });
if (fd) fd.addEventListener('change', (e) => { state.filterDifficulty = parseInt(e.target.value); refreshPracticeCounts(); });

// 预热语音引擎（部分浏览器需要）
if ('speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
}

// 🆕 启动流程：恢复上下文 → 异步加载教材 JSON + 题库 JSON → 渲染 UI
(async function bootstrap() {
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

// 切换教材或学期时重新加载数据
// 把 applyContextChange 包装一层：检测 textbook/term 变化时再 load 一次
const _originalApplyContextChange = applyContextChange;
let _lastLoadedTextbook = null;
let _lastLoadedTerm = null;
applyContextChange = async function() {
  const tb = state.ctx.textbook;
  const tm = state.ctx.term;
  if (tb !== _lastLoadedTextbook) {
    await loadTextbook();
    await window.loadQuestionBank(tb);
    _lastLoadedTextbook = tb;
    _lastLoadedTerm = tm;
  } else if (tm !== _lastLoadedTerm) {
    // 只换学期 → 只需重载教材（题库自带 term 字段，筛选即可）
    await loadTextbook();
    _lastLoadedTerm = tm;
  }
  _originalApplyContextChange();
};
