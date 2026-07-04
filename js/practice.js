/* =========================================================
 * 乐学英语 · practice.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：练习答题全流程：filterQuestions/startPractice/showQuiz/showQuizResult/startSmartPractice + 拼写/听力/不规则动词。依赖：core/smartpick/questionBank（运行时）。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

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
const QB = () => window.questionBank || {
  spelling:[], listening:[], grammar:[], reading:[],
  // 阶段 2 新题型（批次 1）
  listen_pic:[], listen_judge:[], listen_fill:[],
  blank_fill:[], sentence_transform:[], sentence_order:[]
};

// 🆕 通用工具：Fisher-Yates 洗牌
function _shuffleArr(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 🆕 难度归一化：兼容数字 (1-4) 和字符串 (easy/medium/hard/challenge)
// gzk 早期题库写的是字符串，jk/hj 是数字；前端统一转 1-4 数字再比较
function _normalizeDifficulty(d) {
  if (typeof d === 'number') return d;
  if (typeof d === 'string') {
    const k = d.trim().toLowerCase();
    if (k === 'easy' || k === '简单' || k === '基础') return 1;
    if (k === 'medium' || k === '中等') return 2;
    if (k === 'hard' || k === '较难' || k === '难') return 3;
    if (k === 'challenge' || k === 'expert' || k === '挑战') return 4;
    const n = parseInt(k);
    if (!isNaN(n)) return n;
  }
  return 0; // 未知 → 不参与难度筛选
}

// 按筛选条件筛题
function filterQuestions(type) {
  const all = QB()[type] || [];
  // 目标单元（仅非"全部单元"且非"跨年级"时生效）
  const targetUnit = _resolveTargetUnit();
  // 语法知识点过滤：从语法讲解页跳转来时，按关联单元码过滤
  const gtp = window._grammarPracticeTopic;
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
    if (state.filterDifficulty > 0) {
      const qd = _normalizeDifficulty(q.difficulty);
      if (qd !== state.filterDifficulty) return false;
    }
    // 🆕 单元筛选（仅在非跨年级模式下生效）
    if (!state.includeAllGrades && targetUnit) {
      const qUnit = q.unit || _inferUnitFromCode(q.code);
      if (!qUnit || qUnit !== targetUnit) return false;
    }
    // 🆕 语法知识点过滤：匹配关联单元码
    if (type === 'grammar' && gtp && gtp.relatedUnits) {
      var qCode = q.code || '';
      var tbUnits = gtp.relatedUnits[(state.ctx && state.ctx.textbook) || 'jk'] || [];
      if (tbUnits.length > 0 && !tbUnits.some(function(u) { return qCode.indexOf(u) === 0; })) {
        return false;
      }
    }
    return true;
  });
}

// 从 code（如 "6B_U1" / "3A_U10"）推断单元 id（小写形式 u1/u10）
function _inferUnitFromCode(code) {
  if (!code) return null;
  const m = String(code).match(/_U(\d+)/i);
  if (!m) return null;
  return 'u' + m[1];
}

// 根据 state.filterUnit 解析实际目标单元
function _resolveTargetUnit() {
  const fu = state.filterUnit || 'all';
  if (fu === 'all') return null;
  if (fu === 'current') {
    // 跟随课本当前选中的单元
    if (state.currentUnit && state.currentUnit.id) return state.currentUnit.id;
    // 🆕 兜底：用户未进过课本页时 currentUnit=null，取当前年级第一个单元
    // 避免「当前课本单元」与「本册全部单元」表现完全一致的视觉错觉
    try {
      const tb = window.textbookData || {};
      const grKey = state.currentGrade;
      const units = ((tb[grKey] && tb[grKey].units) || []);
      if (units.length > 0) return units[0].id;
    } catch (e) { /* ignore */ }
    return null;
  }
  return fu; // 已是 'u1' 这类形式
}

// 根据当前年级+学期的教材单元，填充「单元」下拉框
function refreshUnitFilterOptions() {
  const sel = document.getElementById('filterUnit');
  if (!sel) return;
  const tb = (window.textbookData) || {};
  const grKey = state.currentGrade;
  const units = ((tb[grKey] && tb[grKey].units) || []);
  const prev = state.filterUnit || 'all';
  // 构造选项
  let html = '<option value="all">📚 本册全部单元</option>';
  html += '<option value="current">📖 当前课本单元</option>';
  for (const u of units) {
    // 去掉 "Unit N" 前缀只取标题，避免下拉太长
    const label = u.title || u.id;
    const short = label.length > 28 ? label.slice(0, 26) + '…' : label;
    html += `<option value="${u.id}">${short}</option>`;
  }
  sel.innerHTML = html;
  // 还原选中（如果之前的选项还存在）
  const stillExists = prev === 'all' || prev === 'current' || units.some(u => u.id === prev);
  sel.value = stillExists ? prev : 'all';
  state.filterUnit = sel.value;
  sel.disabled = !!state.includeAllGrades;
}

// 课本单元切换时：如果练习筛选设为"当前单元"，则刷新计数
function notifyPracticeUnitChanged() {
  if (state.filterUnit === 'current') {
    refreshPracticeCounts();
  }
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
  const targetUnit = _resolveTargetUnit();
  const showUnitTag = !state.includeAllGrades && !!targetUnit;
  // 🆕 cloze 加入；cloze 单位是「篇」，其它是「题」
  ['spelling','listening','grammar','reading','cloze'].forEach(t => {
    const el = document.getElementById('count' + t.charAt(0).toUpperCase() + t.slice(1));
    if (!el) return;
    const cur = filterQuestions(t).length;
    const unit = (t === 'cloze') ? '篇' : '题';
    if (showUnitTag) {
      // 同时计算本册的总数给用户参照
      const savedUnit = state.filterUnit;
      state.filterUnit = 'all';
      const termTotal = filterQuestions(t).length;
      state.filterUnit = savedUnit;
      el.textContent = `${cur} / 册 ${termTotal}`;
    } else {
      el.textContent = cur + ' ' + unit;
    }
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
    const scope = practiceScopeText(state.ctx, state.includeAllGrades);
    // 当前单元名（如果有）
    let unitLabel = '';
    if (showUnitTag) {
      const units = (textbookData[state.currentGrade] && textbookData[state.currentGrade].units) || [];
      const u = units.find(x => x.id === targetUnit);
      unitLabel = u ? ' · ' + (u.title.length > 22 ? u.title.slice(0, 20) + '…' : u.title) : '';
    }
    if (totalAll === 0) {
      // 整本教材都没题库（如 gzk 占位）→ 友好提示
      const tbName = TEXTBOOK_NAMES[state.ctx.textbook] || state.ctx.textbook;
      cnt.innerHTML = `<span class="text-slate-500">📖 《${tbName}》暂未配置题库，可切回<b class="text-blue-600">广州教科版</b>练习</span>`;
    } else if (total === 0) {
      const tip = showUnitTag ? '本单元暂无题目，请切换单元或选"全部单元"' : '请勾选"跨年级刷题"或切换学段';
      cnt.innerHTML = `<span class="text-orange-500">⚠️ ${scope}${unitLabel}暂无题目</span>，${tip}`;
    } else {
      cnt.textContent = `${scope}${unitLabel} · 共 ${total} 题`;
    }
  }
}

function startPractice(type) {
  // 🆕 错题本模式：混合 4 种题型，从 localStorage 读
  // 🆕 错题本模式：支持 Tab 过滤（'all' | 'reading_qa'）
  if (type === 'wrongbook') {
    const all = getWrongQuestions(); // 已按 lastWrongAt 降序
    if (all.length === 0) {
      alert('🎉 错题本是空的，去做几题练习吧！');
      return;
    }
    // 只取本教材版本的错题
    const currentTb = (state.ctx && state.ctx.textbook) || 'jk';
    let list = all.filter(w => String(w._key).startsWith(currentTb + '::'));
    // 🆕 Tab 过滤：如果是「阅读理解」Tab，只取 reading_qa
    if (_wrongbookTabFilter === 'reading_qa') {
      list = list.filter(w => (w.type || '') === 'reading_qa');
    }
    if (!list.length) {
      const tabTip = _wrongbookTabFilter === 'reading_qa' ? '阅读理解' : '';
      alert('🎉 错题本' + tabTip + '是空的，先去做一些练习吧！');
      return;
    }
    // 最多 10 题
    const picked = list.slice(0, Math.min(10, list.length));
    state.quizType = 'wrongbook';
    state.quizQuestions = picked.map(w => Object.assign({}, w.question, { _wbType: w.type }));
    state.quizIndex = 0;
    state.quizCorrect = 0;
    state.quizStartTime = Date.now();
    // 「一键重练」按钮位于错题本独立页，必须先切到练习页，否则点击后用户仍停留在错题本页（看似无反应）
    switchPage('practice');   // switchPage 内部会重置练习视图（show typeView / hide quizView），下面再切到答题视图
    document.getElementById('quizType').textContent = '🩹 错题重练';
    document.getElementById('quizTotal').textContent = picked.length;
    document.getElementById('practiceTypeView').classList.add('hide');
    document.getElementById('practiceFilterView').classList.add('hide');
    document.getElementById('practiceResultView').classList.add('hide');
    document.getElementById('practiceQuizView').classList.remove('hide');
    document.getElementById('smartPickCard').classList.add('hide');
    state.lastSmartMeta = null;   // 错题本模式非智能推题产物，清掉避免误显示上次摘要
    _renderPickSummary();
    showQuiz();
    return;
  }

  const questions = filterQuestions(type);
  if (questions.length === 0) {
    // 语法知识点过滤无结果时，给出更具体的提示
    if (type === 'grammar' && window._grammarPracticeTopic) {
      var msg = '当前教材暂无「' + window._grammarPracticeTopic.title + '」相关语法题。\\n\\n请尝试：\\n1. 切到教材对应年级\\n2. 选择\"全部教材\"模式查看语法讲解\\n3. 或在练习页直接选\"语法练习\"做全部语法题';
      alert(msg);
    } else {
      alert('⚠️ 当前筛选条件下没有题目，请放宽筛选后再试！');
    }
    return;
  }
  // 🆕 cloze 特殊：每篇短文 = N 道挖空题；不走 pickSmartQuestions 的 4 维加权
  //   抽 1-2 篇短文 → 展开为「每空一题」的扁平列表，保留同篇 passage/passageCode 关联
  let shuffled;
  if (type === 'cloze') {
    const pickCount = Math.min(2, questions.length);   // 一次做 1-2 篇
    const passages = _shuffleArr(questions.slice()).slice(0, pickCount);
    shuffled = [];
    for (const p of passages) {
      const blanks = p.blanks || [];
      blanks.forEach((b, bi) => {
        // 包装成 grammar-like 单选题，但保留 cloze 上下文信息
        shuffled.push({
          // 原题字段
          grade: p.grade,
          term: p.term,
          code: `${p.code}#${b.pos}`,        // 子题唯一编号
          q: `第 ${b.pos} 空`,                // showQuiz 标题
          options: b.options || [],
          answer: (b.options || []).indexOf(b.answer),  // 索引化（与 grammar 一致）
          explain: b.explain || '',
          difficulty: p.difficulty || 2,
          // cloze 上下文（供 showQuiz 渲染篇章）
          _clozeContext: {
            passageCode: p.code,
            passage: p.passage,
            topic: p.topic || '',
            currentBlankPos: b.pos,
            totalBlanks: blanks.length,
            blankIndex: bi,
          },
          // 标记本题来自 cloze，使错题/掌握度归到 cloze 类
          _wbType: 'cloze',
        });
      });
    }
  } else {
    // 🧠 v01.18 智能推题：pickSmartQuestions 按 4 维度（错题/新题曝光/掌握衰减/单元覆盖）
    //   加权抽样，并把本次推题构成写入 state.lastSmartMeta，供下面 _renderPickSummary 展示。
    shuffled = pickSmartQuestions(questions, Math.min(10, questions.length), type);
  }
  state.quizType = type;
  state.quizQuestions = shuffled;
  state.quizIndex = 0;
  state.quizCorrect = 0;
  state.quizStartTime = Date.now();
  const typeLabel = {
    spelling: '单词拼写', listening: '听力选择', grammar: '语法练习',
    reading: '阅读理解', cloze: '完形填空',
    listen_pic: '听音选图', listen_judge: '听音判断', listen_fill: '听音填空',
    blank_fill: '选词填空', sentence_transform: '句型转换', sentence_order: '连词成句'
  };
  // 语法知识点练习：显示具体知识点名称
  var quizLabel = typeLabel[type];
  if (type === 'grammar' && window._grammarPracticeTopic) {
    quizLabel = '语法「' + window._grammarPracticeTopic.title + '」';
  }
  document.getElementById('quizType').textContent = quizLabel;
  document.getElementById('quizTotal').textContent = shuffled.length;
  document.getElementById('practiceTypeView').classList.add('hide');
  document.getElementById('practiceFilterView').classList.add('hide');
  document.getElementById('practiceResultView').classList.add('hide');
  document.getElementById('practiceQuizView').classList.remove('hide');
  document.getElementById('smartPickCard').classList.add('hide');
  _renderPickSummary();   // 普通模式：渲染「本次推题构成」摘要
  showQuiz();
}

// 渲染练习页顶部「本次推题构成」摘要条（仅智能推题且有构成时显示）
function _renderPickSummary() {
  const el = document.getElementById('quizPickSummary');
  if (!el) return;
  const m = state.lastSmartMeta;
  if (!m || !m.smart || !m.total) { el.classList.add('hide'); return; }
  const parts = [];
  if (m.wrong)  parts.push(`🔥 错题 ${m.wrong}`);
  if (m.new)    parts.push(`✨ 新题 ${m.new}`);
  if (m.weak)   parts.push(`💪 薄弱 ${m.weak}`);
  if (m.review) parts.push(`📚 巩固 ${m.review}`);
  el.innerHTML = `<span class="font-semibold text-emerald-700">🧠 智能推题</span> · 本次 ${m.total} 题 = ` + parts.join(' · ');
  el.classList.remove('hide');
}

// 🧠 智能推荐练习（v01.18）：跨 4 种题型按打分混合组卷，首页一键开练
function startSmartPractice() {
  const types = ['spelling', 'listening', 'grammar', 'reading', 'cloze',
                'listen_pic', 'listen_judge', 'listen_fill',
                'blank_fill', 'sentence_transform', 'sentence_order'];
  const pool = [];
  for (const t of types) {
    let qs = [];
    try { qs = filterQuestions(t) || []; } catch (e) { qs = []; }
    for (const q of qs) pool.push({ q, t, score: _scoreQuestion(t, q).score });
  }
  if (!pool.length) { alert('⚠️ 当前学段下暂无可练习的题目，请先到「练习」调整筛选。'); return; }
  // 跨题型加权采样不放回，取 10 题
  const n = Math.min(10, pool.length);
  const picked = [];
  const arr = pool.slice();
  for (let k = 0; k < n && arr.length; k++) {
    const total = arr.reduce((s, x) => s + x.score, 0);
    let r = Math.random() * total, idx = 0;
    for (; idx < arr.length; idx++) { r -= arr[idx].score; if (r <= 0) break; }
    if (idx >= arr.length) idx = arr.length - 1;
    const it = arr[idx];
    picked.push(Object.assign({}, it.q, { _wbType: it.t }));   // 带真实题型，供混合渲染/判定
    arr.splice(idx, 1);
  }
  // 推题构成统计（各题按其真实题型打分的 reason）
  const meta = { smart: true, total: picked.length, wrong: 0, new: 0, weak: 0, review: 0 };
  for (const it of picked) {
    const reason = _scoreQuestion(it._wbType, it).reason;
    if (meta[reason] == null) meta.review++; else meta[reason]++;
  }
  state.lastSmartMeta = meta;
  state.quizType = 'smart';
  state.quizQuestions = picked;
  state.quizIndex = 0;
  state.quizCorrect = 0;
  state.quizStartTime = Date.now();
  switchPage('practice');   // 切到练习页（内部会重置视图，下面再切到答题视图）
  document.getElementById('quizType').textContent = '🧠 智能推荐';
  document.getElementById('quizTotal').textContent = picked.length;
  document.getElementById('practiceTypeView').classList.add('hide');
  document.getElementById('practiceFilterView').classList.add('hide');
  document.getElementById('practiceResultView').classList.add('hide');
  document.getElementById('practiceQuizView').classList.remove('hide');
  document.getElementById('smartPickCard').classList.add('hide');
  _renderPickSummary();
  showQuiz();
}
window.startSmartPractice = startSmartPractice;

// ===================== 🧠 智能推题开关（v01.18，持久化偏好） =====================
// 存 localStorage（走 _pkey 多用户隔离）：'1' 开 / '0' 关；默认开启。
function showQuiz() {
  const q = state.quizQuestions[state.quizIndex];
  const total = state.quizQuestions.length;
  state.quizAnswered = false;   // 🆕 v01.12：新题进入，重置"已作答"门控（听力原文锁回去）
  document.getElementById('quizIndex').textContent = state.quizIndex + 1;
  document.getElementById('quizProgress').style.width = ((state.quizIndex + 1) / total * 100) + '%';

  // 🆕 实际题型：错题本/智能推荐(混合题型)模式取题目自带的 _wbType；普通模式就是 state.quizType
  const realType = q._wbType || state.quizType;

  // 显示年级/难度 badge
  const metaEl = document.getElementById('quizMeta');
  const stars = '★'.repeat(q.difficulty || 1);
  const typeLabelShort = { spelling: '拼写', listening: '听力', grammar: '语法', reading: '阅读', cloze: '完形' };
  // 混合题型模式（错题本/智能推荐）显示题型前缀，方便用户辨识当前是哪种题
  const wbPrefix = (state.quizType === 'wrongbook' || state.quizType === 'smart') ? (typeLabelShort[realType] || realType) + ' · ' : '';
  // 🧠 v01.18 智能推题：非错题本模式下，按打分 reason 打标（🔥错题/✨新题/💪薄弱）并给出「为什么推这题」
  let smartMark = '';
  const whyEl = document.getElementById('quizWhy');
  if (state.quizType !== 'wrongbook') {
    const sc = _scoreQuestion(realType, q);     // tag/reason 不依赖 ctx
    smartMark = sc.tag ? sc.tag + ' ' : '';
    const WHY = {
      wrong:  '🔥 错题强化：这道题你之前做错过，再巩固一次',
      new:    '✨ 新题：还没做过，帮你拓展覆盖面',
      weak:   '💪 薄弱项：做过但正确率偏低，重点突破',
      review: '📚 巩固练习：维持熟练度',
    };
    if (whyEl) {
      const txt = WHY[sc.reason] || '';
      whyEl.textContent = txt;
      whyEl.classList.toggle('hide', !(state.smartPick !== false && txt));
    }
  } else if (whyEl) {
    whyEl.classList.add('hide');
  }
  metaEl.textContent = `${smartMark}${wbPrefix}${gradeText(q.grade)} · ${q.code || ''} · ${stars}`;

  // 听力原文
  const audioBox = document.getElementById('quizAudioBox');
  const audioText = document.getElementById('quizAudioText');
  const playHint = document.getElementById('playAudioHint');
  if (realType === 'listening' && q.audioText) {
    audioBox.classList.remove('hide');
    audioText.textContent = q.audioText;
    audioText.classList.add('hide'); // 默认隐藏原文
    if (playHint) playHint.textContent = '播放后才能作答';
    _setAudioTextLocked(true);   // 🆕 v01.12：作答前锁定"显示原文"，防偷看
    // ⚠️ 不要自动播放！手机浏览器会拦截未经用户授权的语音
    // 让用户点击按钮触发
  } else {
    audioBox.classList.add('hide');
  }

  // 阅读文章
  const passageBox = document.getElementById('quizPassageBox');
  // 🆕 reading（阅读理解）与 reading_qa（课文自测）错题重练时都展示文章原文
  if ((realType === 'reading' || realType === 'reading_qa') && q.passage) {
    passageBox.classList.remove('hide');
    document.getElementById('quizPassage').textContent = q.passage;
  } else if (realType === 'cloze' && q._clozeContext) {
    // 🆕 完形填空：显示短文 + 当前空位高亮（其它空位用占位符样式）
    passageBox.classList.remove('hide');
    const ctx = q._clozeContext;
    const curPos = ctx.currentBlankPos;
    // 把 ___N___ 替换为高亮/普通的内嵌占位文本
    let html = ctx.passage
      .replace(/\n/g, '<br>')
      .replace(/___(\d+)___/g, (_m, n) => {
        const isCur = (parseInt(n, 10) === curPos);
        return isCur
          ? `<span style="display:inline-block;min-width:50px;padding:0 6px;border-bottom:2px solid #f59e0b;background:#fef3c7;font-weight:600;color:#b45309;border-radius:3px;">(${n})</span>`
          : `<span style="display:inline-block;min-width:50px;padding:0 6px;border-bottom:1px dashed #cbd5e1;color:#94a3b8;">(${n})</span>`;
      });
    const topicLine = ctx.topic ? `<div class="text-xs text-amber-700 font-semibold mb-2">📝 完形填空 · ${escapeHtml(ctx.topic)} · 第 ${curPos} / ${ctx.totalBlanks} 空</div>` : `<div class="text-xs text-amber-700 font-semibold mb-2">📝 完形填空 · 第 ${curPos} / ${ctx.totalBlanks} 空</div>`;
    document.getElementById('quizPassage').innerHTML = topicLine + html;
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
  state.quizAnswered = true;   // 🆕 v01.12：拼写已作答（保持门控状态一致）

  const fb = document.getElementById('quizFeedback');
  const isCorrect = (userWord === correct);
  const realType = q._wbType || state.quizType;
  try { recordAnswer(realType, q, isCorrect); } catch(e) { console.warn('[错题本]', e); }
  try { recordMastery(realType, q, isCorrect); } catch(e) { console.warn('[掌握度]', e); }
  try { recordAnswerStats(isCorrect, realType); _bumpStreak(); } catch(e) {}
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
      // 本地优先 → 有道 → 浏览器 TTS（复用 player.js 的 speak，与单词卡一致、离线可用）
      // 仍在用户最后一次 input 事件的调用栈里同步发起 → 算用户手势，手机不拦截
      speak(String(q.answer).trim());
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

// 🆕 v01.12：锁定/解锁听力"显示原文"按钮（作答前锁、作答后解锁）
function _setAudioTextLocked(locked) {
  const btn = document.getElementById('quizAudioTextToggle');
  const txt = document.getElementById('quizAudioText');
  if (locked && txt) txt.classList.add('hide');   // 锁定时强制收起原文
  if (!btn) return;
  btn.disabled = !!locked;
  btn.classList.toggle('opacity-50', !!locked);
  btn.classList.toggle('cursor-not-allowed', !!locked);
  btn.textContent = locked ? '🔒 作答后看原文' : '显示/隐藏原文';
}

function toggleAudioText() {
  // 🆕 v01.12：作答前不允许查看原文（防偷看）
  if (!state.quizAnswered) {
    const hint = document.getElementById('playAudioHint');
    if (hint) {
      hint.textContent = '✋ 先作答，作答后才能查看原文哦';
      hint.className = 'text-xs mt-1 text-orange-500';
    }
    return;
  }
  const el = document.getElementById('quizAudioText');
  if (el) el.classList.toggle('hide');
}

function answerQuiz(idx) {
  const q = state.quizQuestions[state.quizIndex];
  const btns = document.querySelectorAll('#quizOptions button');
  btns.forEach(b => b.disabled = true);
  const fb = document.getElementById('quizFeedback');

  const isCorrect = (idx === q.answer);
  const realType = q._wbType || state.quizType;
  try { recordAnswer(realType, q, isCorrect); } catch(e) { console.warn('[错题本]', e); }
  try { recordMastery(realType, q, isCorrect); } catch(e) { console.warn('[掌握度]', e); }
  try { recordAnswerStats(isCorrect, realType); _bumpStreak(); } catch(e) {}
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
  state.quizAnswered = true;        // 🆕 v01.12：已作答
  _setAudioTextLocked(false);       // 🆕 v01.12：放开听力原文查看
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

  setHint('🔊 加载发音…', 'text-blue-600');

  // 本地优先 → 有道 → 浏览器 TTS（复用 player.js 的 speak，与单词卡一致、离线可用）
  try {
    speak(word, {
      onStart: () => setHint('🔊 正在播放…点击可重听', 'text-blue-600'),
      onEnd:   () => setHint('点击可重听', 'text-slate-500'),
      onError: (msg) => setHint('⚠️ ' + (msg || '当前浏览器不支持语音'), 'text-orange-500'),
    });
  } catch(e) {
    const ok = speakWordDirect(word);
    setHint(ok ? '🔊 正在播放…点击可重听' : '⚠️ 当前浏览器不支持语音',
            ok ? 'text-blue-600' : 'text-orange-500');
  }
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
  // 清除语法知识点过滤，回到全量练习
  if (window._grammarPracticeTopic) { delete window._grammarPracticeTopic; }
  document.getElementById('practiceResultView').classList.add('hide');
  document.getElementById('practiceQuizView').classList.add('hide');
  document.getElementById('practiceTypeView').classList.remove('hide');
  document.getElementById('practiceFilterView').classList.remove('hide');
  document.getElementById('smartPickCard').classList.remove('hide');
  refreshPracticeCounts();
}

// ===================== 语法 =====================
const _irregCache = {};
let _irregPractice = null;

function _irregFileKey(ctx) {
  const gradeKey = 'grade' + (ctx.grade || 6);
  const termKey  = ctx.term === '下' ? 'xia' : 'shang';
  return `${ctx.textbook || 'jk'}_${gradeKey}_${termKey}`;
}

function loadIrregVerbs(cb) {
  const key = _irregFileKey(state.ctx || {});
  if (_irregCache[key] !== undefined) { cb(_irregCache[key]); return; }
  fetch(`data/extras/${key}_irregular_verbs.json`)
    .then(r => r.ok ? r.json() : null)
    .catch(() => null)
    .then(data => {
      _irregCache[key] = data;
      cb(data);
    });
}

// 把原形字段清洗成可朗读文本（忽略 /.../ 音标标注）
function _cleanVerbForm(s) {
  if (!s) return '';
  return String(s).replace(/\s*\/[^\/]*\/\s*/g, '').replace(/\s*\(.*?\)\s*/g, ' ').trim();
}

function renderIrregVerbTable() {
  const tbl = document.getElementById('irregVerbTable');
  const sub = document.getElementById('irregVerbSubtitle');
  if (!tbl) return;
  const prac = document.getElementById('irregPracticeWrap');
  if (prac) prac.classList.add('hide');
  tbl.classList.remove('hide');

  loadIrregVerbs((data) => {
    const verbs = (data && data.verbs) || [];
    if (sub) {
      const gradeLabel = (window.gradeText ? gradeText(state.ctx.grade) : ('grade' + state.ctx.grade))
        + ' · ' + (state.ctx.term === '下' ? '下册' : '上册');
      sub.textContent = `${gradeLabel} · 共 ${verbs.length} 条`;
    }
    tbl.innerHTML = '';
    verbs.forEach(v => {
      const base = v['原形'] || '';
      const past = v['过去式'] || '';
      const item = document.createElement('div');
      item.className = 'bg-white rounded-lg px-2.5 py-1.5 border border-violet-100 flex items-center justify-between gap-1';
      item.innerHTML = `
        <span class="font-semibold text-slate-700 truncate">${_escapeHtml(base)}</span>
        <span class="text-slate-400 text-xs">→</span>
        <span class="text-pink-700 truncate text-right">${_escapeHtml(past)}</span>
      `;
      item.title = base + ' → ' + past;
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        // 点击 → 朗读原形 → 朗读过去式
        try {
          const tts = (text, delay) => setTimeout(() => {
            try { speakBrowser(text, {}); } catch(e) { try { speak(text); } catch(e){} }
          }, delay);
          tts(_cleanVerbForm(base), 0);
          tts(_cleanVerbForm(past), 900);
        } catch(e) {}
      });
      tbl.appendChild(item);
    });
  });
}

function startIrregPractice(mode) {
  loadIrregVerbs((data) => {
    const verbs = (data && data.verbs) || [];
    if (verbs.length === 0) { alert('暂无不规则动词数据'); return; }
    // 洗牌并取 15 题
    const arr = verbs.slice().sort(() => Math.random() - 0.5);
    const qs = arr.slice(0, Math.min(15, arr.length)).map(v => {
      const base = _cleanVerbForm(v['原形']);
      const past = _cleanVerbForm(v['过去式']);
      let dir;
      if (mode === 'en_to_past') dir = 'en_to_past';
      else if (mode === 'past_to_en') dir = 'past_to_en';
      else dir = Math.random() < 0.5 ? 'en_to_past' : 'past_to_en';
      if (dir === 'en_to_past') {
        return { prompt: base, answer: past, dirLabel: '请给出过去式' };
      } else {
        return { prompt: past, answer: base, dirLabel: '请给出原形' };
      }
    });
    _irregPractice = { items: qs, idx: 0, correct: 0, wrong: 0, hintUsed: 0 };
    document.getElementById('irregVerbTable').classList.add('hide');
    document.getElementById('irregPracticeWrap').classList.remove('hide');
    renderIrregCurrent();
  });
}

function renderIrregCurrent() {
  if (!_irregPractice) return;
  const p = _irregPractice;
  const q = p.items[p.idx];
  if (!q) return;
  document.getElementById('irregPromptLabel').textContent = q.dirLabel;
  document.getElementById('irregPromptText').textContent = q.prompt;
  const input = document.getElementById('irregAnswerInput');
  input.value = '';
  input.focus();
  document.getElementById('irregFeedback').innerHTML = '';
  document.getElementById('irregFeedback').className = 'mt-3 text-sm text-center';
  document.getElementById('irregPracticeBadge').textContent = `第 ${p.idx + 1} / ${p.items.length} 题`;
  document.getElementById('irregProgress').textContent =
    `✅ ${p.correct}  ✗ ${p.wrong}  · 提示 ${p.hintUsed} 次`;
  // 朗读 prompt
  try { speakBrowser(q.prompt, {}); } catch(e) {}
}

function irregSubmit() {
  if (!_irregPractice) return;
  const p = _irregPractice;
  const q = p.items[p.idx];
  const input = document.getElementById('irregAnswerInput');
  const user = (input.value || '').trim();
  if (!user) return;
  // 答案里可能有多个合法形式，比如 "smelt (smelled)" → 接受括号内或不带括号
  const accepted = q.answer.split(/[\/,]|（|\(|）|\)|（|）/)
    .map(s => s.trim().toLowerCase()).filter(Boolean);
  // 把参考答案也加进去
  accepted.push(q.answer.toLowerCase().trim());
  const ok = accepted.some(a => a && a === user.toLowerCase());
  const fb = document.getElementById('irregFeedback');
  if (ok) {
    p.correct++;
    fb.className = 'mt-3 text-sm text-center text-green-600 font-semibold';
    fb.innerHTML = '✓ 正确！';
    // 朗读答案
    try { speakBrowser(q.answer, {}); } catch(e){}
    setTimeout(irregNext, 700);
  } else {
    p.wrong++;
    fb.className = 'mt-3 text-sm text-center text-red-600';
    fb.innerHTML = `✗ 正确答案：<b>${_escapeHtml(q.answer)}</b>`;
    try { speakBrowser(q.answer, {}); } catch(e){}
    // 错题进错题本
    try {
      recordAnswer('irreg_verb', {
        id: 'irreg_' + q.prompt + '_' + q.dirLabel,
        q: q.dirLabel + ' ' + q.prompt,
        correct: q.answer,
        user: user
      }, false);
    } catch(e){}
    setTimeout(irregNext, 1400);
  }
}

function irregShowHint() {
  if (!_irregPractice) return;
  const p = _irregPractice;
  const q = p.items[p.idx];
  p.hintUsed++;
  const hint = q.answer.charAt(0) + '_'.repeat(Math.max(1, q.answer.length - 1));
  document.getElementById('irregFeedback').className = 'mt-3 text-sm text-center text-amber-600';
  document.getElementById('irregFeedback').innerHTML = '💡 首字母：<b>' + _escapeHtml(hint) + '</b>';
  document.getElementById('irregProgress').textContent =
    `✅ ${p.correct}  ✗ ${p.wrong}  · 提示 ${p.hintUsed} 次`;
}

function irregSkip() {
  if (!_irregPractice) return;
  const p = _irregPractice;
  p.wrong++;
  irregNext();
}

function irregNext() {
  if (!_irregPractice) return;
  const p = _irregPractice;
  p.idx++;
  if (p.idx >= p.items.length) {
    // 结束
    const pct = Math.round(p.correct / p.items.length * 100);
    document.getElementById('irregPromptLabel').textContent = '练习完成！';
    document.getElementById('irregPromptText').textContent = `🎯 ${p.correct} / ${p.items.length}`;
    document.getElementById('irregAnswerInput').value = '';
    document.getElementById('irregAnswerInput').disabled = true;
    document.getElementById('irregFeedback').className = 'mt-3 text-sm text-center text-violet-700 font-semibold';
    document.getElementById('irregFeedback').innerHTML =
      `得分 ${pct}% · ✅ ${p.correct} 对 · ✗ ${p.wrong} 错 · 提示 ${p.hintUsed} 次`;
    document.getElementById('irregProgress').textContent = '';
    return;
  }
  document.getElementById('irregAnswerInput').disabled = false;
  renderIrregCurrent();
}

function exitIrregPractice() {
  _irregPractice = null;
  document.getElementById('irregPracticeWrap').classList.add('hide');
  document.getElementById('irregAnswerInput').disabled = false;
  renderIrregVerbTable();
}

// 绑定回车提交
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('irregAnswerInput');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); irregSubmit(); }
    });
  }
});

window.startIrregPractice = startIrregPractice;
window.irregSubmit        = irregSubmit;
window.irregShowHint      = irregShowHint;
window.irregSkip          = irregSkip;
window.exitIrregPractice  = exitIrregPractice;

