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
const TEXTBOOK_NAMES = { jk: '广州教科版', rj: '人教版', wy: '外研版' };
function ctxSummaryText(ctx) {
  const g = gradeText(ctx.grade);
  const t = ctx.term === '上' ? '上册' : '下册';
  const b = TEXTBOOK_NAMES[ctx.textbook] || ctx.textbook;
  return `${g} · ${t} · ${b}`;
}
function ctxBadgeText(ctx) {
  const g = ({3:'三年级',4:'四年级',5:'五年级',6:'六年级',7:'初一',8:'初二',9:'初三'})[ctx.grade] || '';
  const t = ctx.term === '上' ? '上' : '下';
  return `${g}${t}册`;
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
const gradeNumToKey = { 3:'grade3', 4:'grade4', 5:'grade5', 6:'grade6', 7:'grade7', 8:'grade8', 9:'grade9' };
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

// ===================== 孩子切换 =====================
function onChildChange(e) {
  state.currentChild = e.target.value;
  const c = childMap[e.target.value];
  state.currentGrade = c.grade;
  // 同步全局学习上下文
  state.ctx.grade = c.gradeNum;
  // 同步两个下拉
  document.getElementById('childSelect').value = e.target.value;
  document.getElementById('childSelectMobile').value = e.target.value;
  document.getElementById('childAvatar').textContent = c.avatar;
  document.getElementById('welcomeTitle').textContent = `你好，${c.name}！👋`;
  document.getElementById('welcomeSub').textContent = `今天是新一天的学习，加油哦！广州教科版${c.gradeText} · ${c.unit}`;
  applyContextChange();  // 一处同步所有 UI
}
document.getElementById('childSelect').addEventListener('change', onChildChange);
document.getElementById('childSelectMobile').addEventListener('change', onChildChange);

// ===================== 🆕 全局学习上下文切换 =====================
function applyContextChange() {
  // 1) 同步顶部上下文条的 3 个下拉（UI ← state.ctx）
  const sel = (id) => document.getElementById(id);
  if (sel('ctxGrade'))    sel('ctxGrade').value    = String(state.ctx.grade);
  if (sel('ctxTerm'))     sel('ctxTerm').value     = state.ctx.term;
  if (sel('ctxTextbook')) sel('ctxTextbook').value = state.ctx.textbook;

  // 2) 更新上下文摘要文字
  if (sel('ctxSummary'))         sel('ctxSummary').textContent = ctxSummaryText(state.ctx);
  if (sel('textbookCtxBadge'))   sel('textbookCtxBadge').textContent = ctxSummaryText(state.ctx);
  if (sel('practiceCtxBadge'))   sel('practiceCtxBadge').textContent = ctxBadgeText(state.ctx) + ' · ' + (TEXTBOOK_NAMES[state.ctx.textbook] || '');

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

  // 更新单词+课文
  document.getElementById('wordTotal').textContent = unit.words.length;
  document.getElementById('lessonText').textContent = unit.lesson;
  const cn = unit.lessonCN || '';
  document.getElementById('lessonTranslation').textContent = cn;

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
    lessonPlayStatus.textContent = '点击播放标准发音';
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
  const w = state.currentUnit.words[state.currentWordIndex];
  document.getElementById('wordText').textContent = w.word;
  document.getElementById('wordPhonetic').textContent = w.phonetic;
  document.getElementById('wordMeaning').textContent = w.meaning;
  document.getElementById('wordExample').textContent = w.example;
  document.getElementById('wordIndex').textContent = state.currentWordIndex + 1;
  document.getElementById('wordCard').classList.remove('flipped');
}

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
  const text = state.currentUnit && state.currentUnit.lesson;
  const grade = state.currentGrade;
  const unitId = state.currentUnit && state.currentUnit.id;
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

  // 🎯 优先播放预生成的 MP3（100% 稳定 + 真人级音质）
  if (grade && unitId) {
    // 命名规则：audio/grade{N}{A|B}_u{M}.mp3 （A=上册, B=下册）
    const termAB = (state.ctx && state.ctx.term === '下') ? 'B' : 'A';
    const mp3Url = `audio/${grade}${termAB}_${unitId}.mp3`;
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
      _lessonPlaying = false;
      _lessonAudio = null;
      setUI('idle', '✅ 朗读完成，点击可重听', 'text-slate-600');
    };
    audio.onerror = () => {
      console.warn('[课文] MP3 加载失败，降级浏览器 TTS:', mp3Url);
      _lessonAudio = null;
      // 降级到浏览器 TTS
      fallbackTTS();
    };

    audio.play().catch((err) => {
      console.warn('[课文] audio.play() 失败:', err && err.name);
      _lessonAudio = null;
      fallbackTTS();
    });

    // 5 秒 MP3 都没开始播 → 降级
    setTimeout(() => {
      if (_lessonPlaying && !started && _lessonAudio === audio) {
        try { audio.pause(); } catch(e){}
        _lessonAudio = null;
        fallbackTTS();
      }
    }, 5000);
  } else {
    fallbackTTS();
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
  // 总题数 + 当前学段提示
  const total = ['spelling','listening','grammar','reading'].reduce((s,t)=>s+filterQuestions(t).length, 0);
  const totalAll = ['spelling','listening','grammar','reading'].reduce((s,t)=>s+(QB()[t]||[]).length, 0);
  const cnt = document.getElementById('filterCount');
  if (cnt) {
    const scope = state.includeAllGrades ? '全部年级' : ctxBadgeText(state.ctx);
    if (total === 0) {
      cnt.innerHTML = `<span class="text-orange-500">⚠️ ${scope}暂无题目</span>，请勾选"包含全部年级"或切换学段`;
    } else {
      cnt.textContent = `${scope}共 ${total} 题（题库总计 ${totalAll} 题）`;
    }
  }
}

function startPractice(type) {
  const questions = filterQuestions(type);
  if (questions.length === 0) {
    alert('⚠️ 当前筛选条件下没有题目，请放宽筛选后再试！');
    return;
  }
  // 随机打乱取前10题（或全部）
  const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length));
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

  // 显示年级/难度 badge
  const metaEl = document.getElementById('quizMeta');
  const stars = '★'.repeat(q.difficulty || 1);
  metaEl.textContent = `${gradeText(q.grade)} · ${q.code || ''} · ${stars}`;

  // 听力原文
  const audioBox = document.getElementById('quizAudioBox');
  const audioText = document.getElementById('quizAudioText');
  const playHint = document.getElementById('playAudioHint');
  if (state.quizType === 'listening' && q.audioText) {
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
  if (state.quizType === 'reading' && q.passage) {
    passageBox.classList.remove('hide');
    document.getElementById('quizPassage').textContent = q.passage;
  } else {
    passageBox.classList.add('hide');
  }

  const opts = document.getElementById('quizOptions');
  const spellBox = document.getElementById('quizSpellBox');

  if (state.quizType === 'spelling') {
    // ===== 单词拼写：字母格子填空 =====
    const qEl = document.getElementById('quizQuestion');
    qEl.innerHTML = '请拼写：<span class="text-blue-600">"' + (q.q || '') + '"</span>';
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

// 根据 hint（如 "h___o"）生成字母格子：
// - 字母位：固定显示字母（灰色格子）
// - 下划线位：空白输入格（蓝色边框 + 下划线）
// 用户输入时自动跳到下一个空格；删除时自动回到上一个空格。
function renderSpellCells(q) {
  const container = document.getElementById('quizSpellCells');
  if (!container) return;
  const answer = (q.answer || '').toLowerCase();
  let hint = q.hint || '';
  // hint 缺失或长度不一致时，按答案长度兜底（首字母给提示，其他全空）
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
  if (userWord === correct) {
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
  // 自动朗读一下正确答案
  try { speakWordDirect(q.answer); } catch(e) {}

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

  if (idx === q.answer) {
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
function speakSpellWord() {
  const q = state.quizQuestions[state.quizIndex];
  if (!q || !q.answer) return;
  const hintEl = document.getElementById('quizSpellSpeakHint');

  // iOS Safari / 手机 Chrome 首次调用需要用户手势，这里就是 onclick 回调，同步调用即可
  const ok = speakWordDirect(q.answer);

  if (hintEl) {
    if (ok) {
      hintEl.textContent = '🔊 正在播放…点击可重听';
      hintEl.className = 'text-xs text-blue-600';
      // 简单估计时长，结束后改回提示
      setTimeout(() => {
        if (!window.speechSynthesis.speaking) {
          hintEl.textContent = '点击可重听';
          hintEl.className = 'text-xs text-slate-500';
        }
      }, Math.max(1200, q.answer.length * 180));
    } else {
      hintEl.textContent = '⚠️ 当前浏览器不支持语音';
      hintEl.className = 'text-xs text-orange-500';
    }
  }

  // 再朗读一遍（稍慢），加深印象
  setTimeout(() => {
    if (!window.speechSynthesis.speaking) return;
    // 如果第一遍还在播，不打断
  }, 50);
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
