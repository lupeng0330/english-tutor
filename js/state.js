// ============================================================
// state.js · 全局 state 对象 + 学习上下文常量 + 工具函数
// ------------------------------------------------------------
// 职责：
//   - 定义全局 state（所有页面共享的运行时状态）
//   - TEXTBOOK_NAMES / TEXTBOOK_GRADES / GRADE_LABELS 常量
//   - ctxSummaryText() / ctxBadgeText() 上下文文案工具
//   - refreshGradeOptionsForTextbook() 重建年级下拉
// 依赖：
//   - 本模块无外部依赖（但其它模块会读 state / 常量）
// 导出（全局）：
//   - state
//   - TEXTBOOK_NAMES, TEXTBOOK_GRADES, GRADE_LABELS
//   - refreshGradeOptionsForTextbook, ctxSummaryText, ctxBadgeText
// ============================================================

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
  filterDifficulty: 0,
  filterUnit: 'all',        // 🆕 单元筛选：'all' 全部单元 / 'current' 跟随课本选中 / 'u1'/'u2'/... 指定单元
};

// 🆕 学习上下文工具函数
const TEXTBOOK_NAMES = { jk: '广州教科版', gzk: '广州口语', hj: '广州沪教版', rj: '人教版', wy: '外研版' };
// 每个教材覆盖的年级数字（静态白名单，用于顶部下拉过滤）
const TEXTBOOK_GRADES = {
  jk:  [3, 4, 5, 6],            // 广州教科版 → 小学 3-6 年级
  gzk: [1, 2],                  // 广州口语 → 小学 1-2 年级
  hj:  [7, 8, 9],               // 广州沪教版 → 初中 7-9 年级
  rj:  [1, 2, 3, 4, 5, 6, 7, 8, 9],
  wy:  [1, 2, 3, 4, 5, 6, 7, 8, 9],
};
const GRADE_LABELS = {
  1: '一年级', 2: '二年级', 3: '三年级', 4: '四年级', 5: '五年级', 6: '六年级',
  7: '初一',   8: '初二',   9: '初三'
};
// 根据当前教材，重建 #ctxGrade 下拉的 options，并在 state.ctx.grade 不在白名单时自动修正
function refreshGradeOptionsForTextbook() {
  const sel = document.getElementById('ctxGrade');
  if (!sel) return;
  const tbId   = (state && state.ctx && state.ctx.textbook) || 'jk';
  const grades = TEXTBOOK_GRADES[tbId] || [1,2,3,4,5,6,7,8,9];
  // 若当前 ctx.grade 不在白名单 → 自动修正
  if (!grades.includes(state.ctx.grade)) {
    state.ctx.grade = grades[0];
    state.currentGrade = (typeof gradeNumToKey !== 'undefined' && gradeNumToKey[state.ctx.grade]) || ('grade' + state.ctx.grade);
  }
  // 重建选项
  sel.innerHTML = grades.map(n =>
    `<option value="${n}">${GRADE_LABELS[n] || ('G' + n)}</option>`
  ).join('');
  sel.value = String(state.ctx.grade);
}
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
