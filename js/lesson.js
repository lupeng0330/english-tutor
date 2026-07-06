/* =========================================================
 * 乐学英语 · lesson.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：单元/课文/阅读自测/单词卡/课文播放/滑动手势。保留全部相关 window 导出。依赖：core/state/player。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

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

  // 🆕 刷新理解自测
  try { updateReadingExForCurrentLesson(); } catch(e){}
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

// ============ 理解自测（阅读问答 / 选择题） ============
// extras 数据按教材独立文件加载：data/extras/{textbook}_{grade}_{shang|xia}_exercises.json
const _exercisesCache = {};
const _exercisesLoading = {};
let _readingExState = { uid: null, lessonIdx: -1, items: [], submitted: false };

function _exercisesFileKey(ctx) {
  const gradeKey = 'grade' + (ctx.grade || 3);
  const termKey  = ctx.term === '下' ? 'xia' : 'shang';
  return `${ctx.textbook || 'jk'}_${gradeKey}_${termKey}`;
}
function loadExercisesIfNeeded(ctx, onReady) {
  const key = _exercisesFileKey(ctx);
  if (_exercisesCache[key] !== undefined) { onReady(_exercisesCache[key]); return; }
  if (_exercisesLoading[key]) { _exercisesLoading[key].push(onReady); return; }
  _exercisesLoading[key] = [onReady];
  fetch(_bust(`data/extras/${key}_exercises.json`))
    .then(r => r.ok ? r.json() : null)
    .catch(() => null)
    .then(data => {
      _exercisesCache[key] = data;
      const cbs = _exercisesLoading[key] || [];
      delete _exercisesLoading[key];
      cbs.forEach(cb => { try { cb(data); } catch(e){} });
    });
}

// 找到"当前篇课文"应该关联的练习（按 extras.title 与当前 lesson.title 模糊匹配）
function _findExerciseForLesson(allExs, lesson) {
  if (!Array.isArray(allExs) || !lesson) return [];
  const t = (lesson.title || '').toLowerCase();
  const page = (lesson.page || '').toLowerCase();
  // 命中规则：extras.title 与 lesson.title / lesson.page 有共同子串
  const hits = [];
  for (const ex of allExs) {
    const exTitle = (ex.title || '').toLowerCase();
    if (!exTitle) continue;
    // 精确：任一方包含另一方
    if (t && (exTitle.indexOf(t) >= 0 || t.indexOf(exTitle) >= 0)) { hits.push(ex); continue; }
    // 关键词匹配：取 lesson.title / page 里的显著词做 AND
    const keywords = (t + ' ' + page).split(/[·\-·\s/]+/).filter(k => k.length >= 3);
    if (keywords.length > 0 && keywords.some(k => exTitle.indexOf(k) >= 0)) {
      hits.push(ex);
    }
  }
  return hits;
}

// 规整化 extras 的数据项 → 统一 {type:'text'|'choice', q, a, options?}
function _normalizeExerciseItems(ex) {
  const out = [];
  if (!ex) return out;
  const kind = ex.kind;
  const data = ex.data || [];
  for (const item of data) {
    if (item['问题'] && item['答案'] !== undefined) {
      const q = item['问题'];
      const a = item['答案'];
      if (Array.isArray(item['选项']) && item['选项'].length > 0) {
        out.push({ type: 'choice', q, a, options: item['选项'] });
      } else {
        out.push({ type: 'text', q, a });
      }
    } else if (item['国家/地区'] && item['礼仪']) {
      // reading_table：阅读信息表，跳过（不是自测题）
      continue;
    } else if (item['时态'] && item['问句']) {
      // grammar_table：语法句对照，也不转成自测题（留给 ④ 时态诊断）
      continue;
    }
  }
  return out;
}

function renderReadingEx() {
  const wrap = document.getElementById('readingExWrap');
  const list = document.getElementById('readingExList');
  const badge = document.getElementById('readingExBadge');
  const result = document.getElementById('readingExResult');
  const toggle = document.getElementById('readingExToggle');
  if (!wrap || !list) return;

  const items = _readingExState.items;
  if (!items || items.length === 0) {
    wrap.classList.add('hide');
    return;
  }
  wrap.classList.remove('hide');
  if (toggle) toggle.textContent = '收起';
  list.style.display = '';
  if (badge) badge.textContent = `${items.length} 题`;
  if (result) { result.classList.add('hide'); result.innerHTML = ''; }
  _readingExState.submitted = false;

  list.innerHTML = '';
  items.forEach((it, i) => {
    const row = document.createElement('div');
    row.className = 'bg-white rounded-lg p-3 border border-indigo-100';
    const qHtml = `<div class="text-sm font-semibold text-slate-800 mb-2">${i + 1}. ${_escapeHtml(it.q)}</div>`;
    let inputHtml = '';
    if (it.type === 'choice') {
      inputHtml = it.options.map((opt, k) => {
        const safe = _escapeHtml(opt);
        return `<label class="flex items-center gap-2 py-1 cursor-pointer">
          <input type="radio" name="rex_${i}" value="${k}" class="rex-input">
          <span class="text-sm text-slate-700">${safe}</span>
        </label>`;
      }).join('');
    } else {
      // 🆕 固定最小高度，禁止手动拖拽 resize（手机端误触常见），输入时自动按内容扩展
      inputHtml = `<textarea rows="2" data-autogrow="1" style="resize:none;overflow:hidden;min-height:56px;" class="rex-input w-full text-sm border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-indigo-400" placeholder="用英文回答…"></textarea>`;
    }
    const fb = `<div class="rex-feedback hide mt-2 text-xs"></div>`;
    row.innerHTML = qHtml + inputHtml + fb;
    list.appendChild(row);
  });

  // 🆕 为所有带 data-autogrow 的 textarea 绑定"按内容自动扩展高度"
  //    原理：每次 input 事件都先把 height 归零再赋 scrollHeight，完美贴合内容
  list.querySelectorAll('textarea[data-autogrow]').forEach((ta) => {
    const autoGrow = () => {
      ta.style.height = 'auto';
      ta.style.height = (ta.scrollHeight + 2) + 'px';
    };
    ta.addEventListener('input', autoGrow);
    // 聚焦时也触发一次，避免"首次输入一个字符看起来没变化"
    ta.addEventListener('focus', autoGrow);
    // 初始测算
    autoGrow();
  });
}

function submitReadingEx() {
  const items = _readingExState.items;
  if (!items || items.length === 0) return;
  const listEl = document.getElementById('readingExList');
  if (!listEl) return;
  // 🆕 统一的 progress ctx，用于写入 readingExDone
  const progressCtx = {
    textbook: (state.ctx && state.ctx.textbook) || 'jk',
    grade:    state.ctx && state.ctx.grade,
    term:     state.ctx && state.ctx.term,
    uid:      _readingExState.uid,
    lessonIdx: _readingExState.lessonIdx|0,
  };
  let ok = 0;
  items.forEach((it, i) => {
    const row = listEl.children[i];
    if (!row) return;
    const fb = row.querySelector('.rex-feedback');
    let user = '';
    let thisOk = false;
    if (it.type === 'choice') {
      const picked = row.querySelector('input[name="rex_' + i + '"]:checked');
      const userIdx = picked ? parseInt(picked.value) : -1;
      // 选择题：答案 "A"/"B"/"C" → 索引 0/1/2 比对
      const correctLetter = String(it.a || '').trim().charAt(0).toUpperCase();
      const correctIdx = correctLetter.charCodeAt(0) - 65; // A=0, B=1, C=2
      thisOk = !!(userIdx >= 0 && userIdx === correctIdx);
      if (thisOk) ok++;
      if (fb) {
        fb.classList.remove('hide');
        fb.className = 'rex-feedback mt-2 text-xs ' + (thisOk ? 'text-green-600' : 'text-red-600');
        if (thisOk) {
          fb.textContent = '✓ 正确';
        } else {
          const correctText = (it.options && it.options[correctIdx]) ? it.options[correctIdx] : it.a;
          fb.textContent = '✗ 正确答案：' + correctText;
        }
      }
    } else {
      const ta = row.querySelector('textarea.rex-input');
      user = ta ? ta.value : '';
      const r = _answerMatch(user, it.a);
      thisOk = !!r.ok;
      if (thisOk) ok++;
      if (fb) {
        fb.classList.remove('hide');
        fb.className = 'rex-feedback mt-2 text-xs ' + (thisOk ? 'text-green-600' : 'text-orange-600');
        fb.innerHTML = (thisOk ? '✓ ' : '⚠ ') + r.hint
          + '<div class="text-slate-500 mt-1">参考答案：' + _escapeHtml(it.a) + '</div>';
      }
      // 错题进错题本（复用 recordAnswer）
      if (!r.ok) {
        try {
          const uid = _readingExState.uid;
          const _lessonIdx = _readingExState.lessonIdx | 0;
          const _lesson = normalizeLessons(state.currentUnit)[_lessonIdx] || {};
          recordAnswer('reading_qa', {
            id: 'rex_' + uid + '_' + i,
            q: it.q,
            correct: it.a,
            user: user,
            unit: uid,
            grade: state.currentGrade,
            lessonIdx: _lessonIdx,
            lessonTitle: _lesson.title || '',
            // 🆕 课文原文（用于错题本详情区直接阅读），零网络代价：提交时 unit/lessonIdx 已在内存
            passage: _lesson.en || '',
            // 🆕 题块出处标题（如 "Fun with language · Mozart"）
            blockTitle: _readingExState.blockTitle || ''
          }, false);
        } catch(e){}
      }
    }
    // 🆕 每题落盘，纳入单元进度统计
    try { markReadingExAnswer(Object.assign({}, progressCtx, { qIdx: i }), thisOk); } catch(e){}
  });
  _readingExState.submitted = true;
  const result = document.getElementById('readingExResult');
  if (result) {
    const pct = Math.round(ok / items.length * 100);
    const color = pct >= 80 ? 'text-green-700' : (pct >= 60 ? 'text-amber-700' : 'text-red-700');
    result.classList.remove('hide');
    result.innerHTML = `<div class="${color} font-semibold">🎯 答对 ${ok} / ${items.length}（${pct}%）</div>`;
  }
  const badge = document.getElementById('readingExBadge');
  if (badge) badge.textContent = `${ok} / ${items.length}`;
  // 🆕 阅读自测也算入单元进度，立即刷新当前单元的进度条与首页统计
  try { updateUnitProgress(); } catch(e){}
  try { renderHomeStats(); } catch(e){}
}

function resetReadingEx() {
  renderReadingEx();
}

function toggleReadingEx() {
  const list = document.getElementById('readingExList');
  const toggle = document.getElementById('readingExToggle');
  if (!list || !toggle) return;
  const collapsed = list.style.display === 'none';
  list.style.display = collapsed ? '' : 'none';
  toggle.textContent = collapsed ? '收起' : '展开';
}

// 当 renderLessonAt 被调用时，同步刷新理解自测
function updateReadingExForCurrentLesson() {
  const wrap = document.getElementById('readingExWrap');
  if (!wrap) return;
  const unit = state.currentUnit;
  if (!unit) { wrap.classList.add('hide'); return; }
  const lessons = normalizeLessons(unit);
  const lesson = lessons[state.currentLessonIndex] || null;
  if (!lesson) { wrap.classList.add('hide'); return; }

  loadExercisesIfNeeded(state.ctx || {}, (data) => {
    const uid = unit.id;
    const exs = (data && data.exercises && data.exercises[uid]) || [];
    const hits = _findExerciseForLesson(exs, lesson);
    const items = [];
    for (const ex of hits) items.push(..._normalizeExerciseItems(ex));
    // 🆕 题块出处标题（取首个命中块的 title，如 "Fun with language · Mozart"），入错题本时一并存档
    const blockTitle = (hits[0] && hits[0].title) || (lesson && lesson.title) || '';
    _readingExState = { uid, lessonIdx: state.currentLessonIndex, items, submitted: false, blockTitle };
    renderReadingEx();
  });
}

window.toggleReadingEx = toggleReadingEx;
window.submitReadingEx = submitReadingEx;
window.resetReadingEx  = resetReadingEx;

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


// 单元学习进度条（词汇蓝 + 阅读紫 双轨）
function updateUnitProgress() {
  if (!state.currentUnit) return;
  const p = computeUnitProgress(state.currentUnit);
  const pctEl = document.getElementById('unitProgressPct');
  const label = document.getElementById('unitProgressLabel');
  const wordBar    = document.getElementById('unitWordBar');
  const readBar    = document.getElementById('unitReadBar');
  const wordDetail = document.getElementById('unitWordDetail');
  const readDetail = document.getElementById('unitReadDetail');
  const readHistEl = document.getElementById('unitReadHistory');
  const readAttEl  = document.getElementById('unitReadAttempts');
  const readBestEl = document.getElementById('unitReadBest');

  // 词汇进度（蓝）
  const wordPct = p.total > 0 ? Math.round(p.known / p.total * 100) : 0;
  if (wordBar)    wordBar.style.width    = wordPct + '%';
  if (wordDetail) wordDetail.textContent = p.known + '/' + p.total + ' 词';

  // 阅读进度（紫）—— 分子=答对数，分母=已尝试数
  const readPct = p.readingAttempted > 0
    ? Math.round(p.readingOk / p.readingAttempted * 100) : 0;
  if (readBar)    readBar.style.width    = readPct + '%';
  if (readDetail) readDetail.textContent = p.readingOk + '/' + p.readingAttempted + ' 题';

  // 综合百分比（PCT 还是原有的：词汇+阅读 / 词数+已尝试数）
  if (pctEl) pctEl.textContent = p.pct + '%';
  if (label) {
    const parts = [];
    if (p.total > 0) parts.push('词汇 ' + p.known + '/' + p.total);
    if (p.readingAttempted > 0) parts.push('阅读 ' + p.readingOk + '/' + p.readingAttempted);
    label.textContent = parts.length > 0 ? '学习进度 · ' + parts.join(' · ') : '开始学习吧';
  }

  // 🆕 阅读答题历史（若本单元有尝试过任何阅读题，显示统计）
  if (p.readingAttempted > 0 && readHistEl) {
    readHistEl.classList.remove('hide');
    if (readAttEl) readAttEl.textContent  = '共答题 ' + p.readingAttempted + ' 次';
    if (readBestEl) {
      const best = Math.round(p.readingOk / p.readingAttempted * 100);
      readBestEl.textContent = '历史最高 ' + best + '%';
    }
  } else if (readHistEl) {
    readHistEl.classList.add('hide');
  }
}





// 保存/恢复学习上下文（跨会话记忆）
// v01.20：把硬编码的 'yxyy_ctx' 改成 _pkey('yxyy_ctx')，按档案隔离；
// 老数据迁移由 bootstrap() 的 migrateLegacyOnce() 一次性搬到 :default 档案。
function saveCtx() {
  try {
    localStorage.setItem(_pkey(CTX_KEY), JSON.stringify(state.ctx));
  } catch(e) {}
}
function computeUnitProgress(unit) {
  const knownMap = _loadStats().knownWords || {};
  const rexMap   = _loadStats().readingExDone || {};
  const words = Array.isArray(unit && unit.words) ? unit.words : [];
  let known = 0;
  for (const w of words) {
    if (knownMap[String(w && w.word).toLowerCase()]) known++;
  }
  // 阅读自测：匹配本教材/年级/学期/本单元的所有记录
  const tb = (state && state.ctx && state.ctx.textbook) || 'jk';
  const gr = (state && state.ctx && state.ctx.grade)    || 0;
  const tm = (state && state.ctx && state.ctx.term)     || '上';
  const prefix = [tb, gr, tm, unit && unit.id].join('::') + '::';
  let readingAttempted = 0, readingOk = 0;
  for (const k in rexMap) {
    if (!k.startsWith(prefix)) continue;
    readingAttempted++;
    if (rexMap[k] && rexMap[k].ok) readingOk++;
  }
  const total   = words.length;
  const numer   = known + readingOk;
  const denom   = total + readingAttempted;
  const pct     = denom > 0 ? Math.round(numer / denom * 100) : 0;
  return { pct, known, total, readingOk, readingAttempted };
}

// 返回当前教材实际覆盖的年级数字数组（按 textbookData 推断）
function availableGradesInTextbook() {
  const out = [];
  for (const k of Object.keys(textbookData || {})) {
    const n = parseInt(String(k).replace('grade',''), 10);
    if (!isNaN(n)) {
      // 判定是否有实数据：只要其中至少 1 个 unit 有 words 或 lessons 即视为"上线"
      const units = (textbookData[k] && textbookData[k].units) || [];
      if (units.length > 0) out.push(n);
    }
  }
  return out.sort((a,b)=>a-b);
}

function renderUnitList() {
  const data = textbookData[state.currentGrade];
  const container = document.getElementById('unitList');
  if (!container) return;
  if (!data || !Array.isArray(data.units) || data.units.length === 0) {
    // 当前教材没有该年级的数据
    const tbName = TEXTBOOK_NAMES[state.ctx.textbook] || state.ctx.textbook;
    const avail = availableGradesInTextbook();
    const gradeLabels = {1:'一年级',2:'二年级',3:'三年级',4:'四年级',5:'五年级',6:'六年级',7:'初一',8:'初二',9:'初三'};
    const tip = avail.length > 0
      ? `当前教材《${tbName}》覆盖：${avail.map(n=>gradeLabels[n]||('G'+n)).join(' · ')}。`
      : `当前教材《${tbName}》暂未上线内容。`;
    container.innerHTML = `
      <div class="col-span-full bg-white rounded-xl p-6 border border-slate-200 text-center">
        <div class="text-4xl mb-2">📭</div>
        <div class="text-slate-700 font-semibold mb-1">此学段暂无数据</div>
        <div class="text-sm text-slate-500 mb-3">${tip}</div>
        ${avail.length > 0 ? `<button onclick="ctxJumpToGrade(${avail[0]})" class="inline-block px-4 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600">切到${gradeLabels[avail[0]]||('G'+avail[0])}</button>` : ''}
      </div>`;
    document.getElementById('unitListView').classList.remove('hide');
    document.getElementById('unitDetailView').classList.add('hide');
    return;
  }
  container.innerHTML = data.units.map(u => {
    const p = computeUnitProgress(u);
    const pct = p.pct;
    // 占位/空单元：没有词 且 没做过阅读题 → "待补充"；否则有任何记录都算进度
    const isEmpty = p.total === 0 && p.readingAttempted === 0;
    const badge = isEmpty
      ? '<span class="badge bg-slate-100 text-slate-500">📦 待补充</span>'
      : pct === 100
        ? '<span class="badge bg-green-100 text-green-700">✓ 已完成</span>'
        : pct > 0
          ? '<span class="badge bg-amber-100 text-amber-700">学习中 · ' + (p.known + p.readingOk) + '/' + (p.total + p.readingAttempted) + '</span>'
          : '<span class="badge bg-slate-100 text-slate-500">未开始</span>';
    const barStyle = isEmpty ? 'width: 0%' : 'width: ' + pct + '%';
    // 底部文案：词汇 + 阅读题（有做过才显示阅读）
    let footText;
    if (isEmpty) {
      footText = '内容待补充';
    } else {
      const parts = [];
      if (p.total > 0) parts.push(p.known + ' / ' + p.total + ' 词');
      if (p.readingAttempted > 0) parts.push('阅读 ' + p.readingOk + ' / ' + p.readingAttempted + ' 题');
      parts.push('进度 ' + pct + '%');
      footText = parts.join(' · ');
    }
    // 模块徽章（可选）
    const moduleTag = u.module
      ? '<span class="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 ml-1.5 align-middle">📦 ' + u.module.split(' ').slice(0,2).join(' ') + '</span>'
      : '';
    return `
    <div class="unit-card" onclick="openUnit('${u.id}')">
      <div class="flex items-start justify-between mb-3">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white text-xl font-bold">${u.title.split(' ')[1] || 'U'}</div>
        ${badge}
      </div>
      <div class="font-bold text-slate-800">${u.title}${moduleTag}</div>
      <div class="text-xs text-slate-500 mt-1">${(u.words || []).length} 个单词</div>
      <div class="mt-3">
        <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style="${barStyle}"></div>
        </div>
        <div class="text-xs text-slate-500 mt-1">${footText}</div>
      </div>
    </div>
  `;
  }).join('');
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

// 🆕 从错题本「去此单元重读」：切到课本页 → 定位单元 → 切课文 Tab → 跳到指定篇目
function switchToLesson(unitId, lessonIdx) {
  if (!unitId) { try { switchPage('textbook'); } catch(e){} return; }
  const li = Math.max(0, lessonIdx | 0);
  try { switchPage('textbook'); } catch(e){}
  // 等课本页渲染就绪后再定位（与 home.js continueLearning 的延时范式一致）
  setTimeout(() => {
    try {
      const units = (textbookData[state.currentGrade] && textbookData[state.currentGrade].units) || [];
      const idx = units.findIndex(u => u.id === unitId);
      if (idx < 0) {
        // 当前 grade 找不到该单元（可能错题来自其它学段）：仅打开课本列表，给出提示
        alert('该错题对应的课文不在当前所选学段，请先切换到对应年级/学期再来重读～');
        return;
      }
      openUnit(unitId);
      // 切到「课文」Tab 并跳到对应篇目
      switchUnitTab('lesson');
      const lessons = normalizeLessons(state.currentUnit);
      renderLessonAt(Math.min(li, Math.max(0, lessons.length - 1)), lessons);
      try { updateReadingExForCurrentLesson(); } catch(e){}
      window.scrollTo(0, 0);
    } catch(e){ console.warn('[去此单元]', e); }
  }, 200);
}
window.switchToLesson = switchToLesson;

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
  // 🆕 通知练习页：如果筛选锁在"当前单元"，同步更新数量
  try { notifyPracticeUnitChanged(); } catch(e) {}

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

  // 🆕 模块徽章（仅当 unit.module 存在）
  try {
    const badge = document.getElementById('unitModuleBadge');
    if (badge) {
      if (unit.module) {
        badge.classList.remove('hide');
        const span = badge.querySelector('span');
        if (span) span.textContent = '📦 ' + unit.module;
      } else {
        badge.classList.add('hide');
      }
    }
  } catch(e){}

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
  // 返回时重渲染：这样用户"✓认识"过的单词进度能反映到卡片
  try { renderUnitList(); } catch(e) {}
  document.getElementById('unitListView').classList.remove('hide');
  document.getElementById('unitDetailView').classList.add('hide');
}

// ===================== 单词卡片 =====================
// 词性徽章配色
function _posBadgeClass(pos) {
  const p = String(pos || '').toLowerCase().trim();
  if (p.startsWith('n'))        return 'bg-blue-100 text-blue-700 border-blue-200';
  if (p.startsWith('v'))        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (p.startsWith('adj'))      return 'bg-amber-100 text-amber-700 border-amber-200';
  if (p.startsWith('adv'))      return 'bg-orange-100 text-orange-700 border-orange-200';
  if (p.startsWith('prep'))     return 'bg-slate-100 text-slate-700 border-slate-200';
  if (p.startsWith('pron'))     return 'bg-purple-100 text-purple-700 border-purple-200';
  if (p.startsWith('conj'))     return 'bg-teal-100 text-teal-700 border-teal-200';
  if (p.startsWith('interj'))   return 'bg-pink-100 text-pink-700 border-pink-200';
  if (p.includes('短语') || p.includes('phrase')) return 'bg-rose-100 text-rose-700 border-rose-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}
function showWord() {
  if (!state.currentUnit || !Array.isArray(state.currentUnit.words) || state.currentUnit.words.length === 0) {
    return; // 占位单元：已由 _showUnitAtIndex 渲染好"待补充"提示
  }
  const w = state.currentUnit.words[state.currentWordIndex];
  if (!w) return;
  document.getElementById('wordText').textContent = w.word;
  document.getElementById('wordPhonetic').textContent = w.phonetic || '';
  // 🆕 拆解 meaning：兼容 "[n.] 野兔" / "[短语] xxx" / 纯中文
  const posEl = document.getElementById('wordPos');
  let pos = '';
  let meaningClean = String(w.meaning || '');
  const m = meaningClean.match(/^\s*\[([^\]]+)\]\s*(.*)$/);
  if (m) { pos = m[1].trim(); meaningClean = m[2].trim(); }
  if (posEl) {
    if (pos) {
      posEl.classList.remove('hide');
      posEl.textContent = pos;
      // 词性 → 颜色
      posEl.className = 'text-xs font-semibold px-2 py-0.5 rounded-full border ' + _posBadgeClass(pos);
    } else {
      posEl.classList.add('hide');
    }
  }
  document.getElementById('wordMeaning').textContent = meaningClean;
  document.getElementById('wordExample').textContent = w.example || '';
  document.getElementById('wordIndex').textContent = state.currentWordIndex + 1;
  document.getElementById('wordCard').classList.remove('flipped');
  // 🆕 渲染例句阶梯
  renderWordExamples(w);
}

// ============ 例句阶梯：按需懒加载 examples 文件 ============
// 缓存：textbook id -> { grade_term: { words: { word: [...] } } }
const _examplesCache = {};
const _examplesLoading = {};
// 当前正在播放的例句本地 MP3（用于点其它例句/切词时停掉，避免叠音）
let _exampleAudio = null;
// 当前正处于"播放中"的例句按钮的复位函数。
// 点新例句/切词时，光停音频还不够——旧按钮的 done/disabled/图标是局部闭包，
// 停音够不到它，会卡在 ⏳/🔈 且 disabled（再点无反应）。这里全局记一个引用，
// 切换前先把上一个按钮 UI 复位。
let _exampleBtnReset = null;
function _resetExampleBtn() {
  if (_exampleBtnReset) {
    const fn = _exampleBtnReset;
    _exampleBtnReset = null;
    try { fn(); } catch (e) {}
  }
}
function _stopExampleAudio() {
  if (_exampleAudio) {
    try {
      // 关键：先解绑事件回调再清空 src。
      // 否则 src='' 会触发 onerror → failLocal → playOnlineThenTTS，
      // 导致"被停掉"的例句又用有道在线重播一遍（叠音 / 切词后仍在响的根因）。
      _exampleAudio.onerror = null;
      _exampleAudio.onended = null;
      _exampleAudio.onplaying = null;
      _exampleAudio.pause();
      _exampleAudio.src = '';
    } catch (e) {}
    _exampleAudio = null;
  }
}

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
  // 切词重渲染前，停掉上一条例句音频，避免旧句继续响。
  // 注意：例句可能正走「有道在线/浏览器 TTS」，光停本地 MP3 不够，
  // 必须连 stopSpeak() 一起停，否则切单词卡后旧例句仍在出声。
  try { stopSpeak(); } catch (e) {}
  _stopExampleAudio();
  _resetExampleBtn();

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
        const sentence = ex.en || '';
        if (!sentence) return;
        // 例句朗读三级降级（与听力题一致，手机端可靠出声）：
        //   ① 本地预生成 MP3（audio/ex_xxx.mp3，离线 + 单文件，最稳）
        //   ② 有道在线真人音频（speak）
        //   ③ 浏览器 TTS（speakBrowser，兜底）
        let done = false;
        const reset = (mark) => {
          if (done) return;
          done = true;
          if (_exampleBtnReset === reset) _exampleBtnReset = null;
          btn.disabled = false;
          btn.classList.remove('playing');
          btn.textContent = mark || '🔊';
          if (mark && mark !== '🔊') {
            setTimeout(() => { if (btn.textContent === mark) btn.textContent = '🔊'; }, 1500);
          }
        };

        // 关键：先把上一个还在"播放中"的例句按钮 UI 复位，
        // 否则旧按钮卡在 ⏳/🔈 且 disabled，再点无反应（连点多条后前面几条点不响的根因）。
        _resetExampleBtn();

        btn.disabled = true;
        btn.classList.add('playing');
        btn.textContent = '⏳';
        _exampleBtnReset = reset;   // 记录当前激活按钮的复位函数

        // 停掉任何正在播放的音频，避免叠音
        try { stopSpeak(); } catch (e) {}
        _stopExampleAudio();

        // ②③：有道在线 → 浏览器 TTS
        const playOnlineThenTTS = () => {
          try {
            speak(sentence, {
              onStart: () => { btn.textContent = '🔈'; },
              onEnd: () => reset('🔊'),
              onError: () => {
                try {
                  speakBrowser(sentence, {
                    onStart: () => { done = false; btn.disabled = true; btn.classList.add('playing'); btn.textContent = '🔈'; },
                    onEnd: () => reset('🔊'),
                    onError: () => reset('⚠️')
                  });
                } catch (e2) { reset('⚠️'); }
              }
            });
          } catch (err) {
            try {
              speakBrowser(sentence, { onEnd: () => reset('🔊'), onError: () => reset('⚠️') });
            } catch (e2) { reset('⚠️'); }
          }
        };

        // ①：本地 MP3 优先（命中即播，离线可用）
        const audioFile = ex.audioFile;
        if (audioFile) {
          const audio = new Audio('audio/' + audioFile);
          _exampleAudio = audio;
          let localFailed = false;
          const failLocal = () => {
            if (localFailed) return;
            localFailed = true;
            if (_exampleAudio === audio) _exampleAudio = null;
            playOnlineThenTTS();   // 本地失败 → 退到在线
          };
          audio.onplaying = () => { if (!done) btn.textContent = '🔈'; };
          audio.onended = () => { if (_exampleAudio === audio) _exampleAudio = null; reset('🔊'); };
          audio.onerror = failLocal;
          audio.play().catch(failLocal);
          // 5 秒还没开始播 → 判定本地失败，降级在线
          setTimeout(() => {
            if (!localFailed && _exampleAudio === audio && audio.paused && audio.currentTime === 0) {
              failLocal();
            }
          }, 5000);
        } else {
          playOnlineThenTTS();
        }
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

// 点"认识"后的"待翻页"令牌：连点时取消上一次未触发的前进，避免一次跳多个词
let _pendingKnownAdvance = null;

// ✓ 认识：标记已掌握 + SRS 升档（间隔拉长）+ 读完提顿翻页
function markKnown() { _markWordAndAdvance(true); }
// ✗ 不认识：SRS 回第 1 档（明天再现）+ 读完提顿翻页（不计入"已掌握"）
function markUnknown() { _markWordAndAdvance(false); }

function _markWordAndAdvance(known) {
  const w = state.currentUnit && state.currentUnit.words[state.currentWordIndex];
  // 📊 记录掌握度 + SRS 记忆曲线
  try {
    if (w && w.word) {
      if (known) markWordKnown(w.word);
      if (typeof srsRecord === 'function') srsRecord(w, known);
    }
    updateUnitProgress();
  } catch(e) {}

  // 取消上一次还没触发的前进（连点保护）
  if (_pendingKnownAdvance) {
    try { clearTimeout(_pendingKnownAdvance.timer); } catch(e) {}
    _pendingKnownAdvance.done = true;
    _pendingKnownAdvance = null;
  }

  if (!w || !w.word) { nextWord(); return; }

  // 关键体验优化：先把当前单词读完整，"提顿"一下，再切下一个
  const token = { done: false, timer: null };
  _pendingKnownAdvance = token;
  const advance = () => {
    if (token.done) return;
    token.done = true;
    if (_pendingKnownAdvance === token) _pendingKnownAdvance = null;
    nextWord();
  };
  // 发音结束 → 提顿约 0.15s → 切换（停顿短一点，节奏更跟手）
  const onAudioEnd = () => {
    if (token.done) return;
    if (token.timer) { try { clearTimeout(token.timer); } catch(e) {} }
    token.timer = setTimeout(advance, 150);
  };

  speak(w.word, { onEnd: onAudioEnd });
  // 绝对兜底：无论 onEnd 是否回调，最多 3.2s 后也前进，避免卡住不翻页
  token.timer = setTimeout(advance, 3200);
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
  // 🆕 教材前缀：gzk(广州口语) 与 jk(教科版) 同为 grade1/2，音频文件名会撞车，
  //     故 gzk 课文音频统一加 'gzk_' 前缀（与 gen_audio_v2.py 的 TEXTBOOK_PREFIX 一致）。
  const _tb  = (state.ctx && state.ctx.textbook) || 'jk';
  const _pfx = _tb === 'gzk' ? 'gzk_' : '';
  const candidates = [];
  if (grade && unitId) {
    candidates.push(`audio/${_pfx}${grade}${termAB}_${unitId}_L${_curIdx}.mp3`);
    if (!multiLesson) {
      candidates.push(`audio/${_pfx}${grade}${termAB}_${unitId}.mp3`);
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

// 注：speakBrowser / speak / stopSpeak / fallbackWebSpeech / playYoudao / playYoudaoWith /
// playChain / splitText 以及 _currentAudio / _currentCallbacks / _hasEmittedStart /
// _playQueue / _playingQueue 等顶级变量已迁移到 js/player.js。
// 此处保留注释以帮助 grep 追溯。

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
