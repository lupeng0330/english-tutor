/* =========================================================
 * 乐学英语 · js/exam.js — 模拟考试模块
 * ---------------------------------------------------------
 * 职责：考试组卷、答题界面、倒计时、自动判分、成绩报告、历史记录
 * 依赖：questionBank.js（window.questionBank）、core.js（_pkey、escapeHtml）
 *       wrongbook.js（recordAnswer）、stats.js（recordAnswerStats）
 *       textbook.js（textbookData、_currentTextbookMeta）
 * 加载：在 questionBank.js 之后、app.js 之前（index.html 底部脚本链）
 * ========================================================= */

// ===================== 考试状态 =====================
let _examState = {
  paper: null,          // 当前试卷对象
  answers: {},          // { questionFlatIndex: selectedOptionIndex }
  writingText: '',      // 写作文本
  timeLeft: 0,          // 剩余秒数
  totalTime: 0,         // 总秒数
  timerId: null,        // setInterval id
  currentSection: 0,    // 当前题型区索引
  submitted: false,     // 是否已交卷
  history: []           // 考试历史（从 localStorage 加载）
};

let _examConfig = null;   // exam_config.json 缓存
let _examConfigLoading = false;
let _examConfigPromise = null;

let _examTemplates = null;        // exam_templates.json 缓存（v3 起：模板化抽离）
let _examTemplatesLoading = false;
let _examTemplatesPromise = null;

let _realPapers = null;   // real_papers/index.json 缓存（历年真题·固定卷）
let _realPapersPromise = null;

let _examListTab = 'sim'; // 列表分区：sim=模拟卷 / unit=单元测试 / real=历年真题

// ===================== 加载考试配置 =====================
async function _loadExamConfig() {
  if (_examConfig) return _examConfig;
  if (_examConfigLoading) return _examConfigPromise;
  _examConfigLoading = true;
  _examConfigPromise = (async () => {
    try {
      const url = (typeof window.__withVer === 'function')
        ? window.__withVer('data/exams/exam_config.json')
        : 'data/exams/exam_config.json?t=' + Date.now();
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _examConfig = await res.json();
      return _examConfig;
    } catch (e) {
      console.warn('[考试] 配置加载失败', e);
      _examConfig = null;
      return null;
    } finally {
      _examConfigLoading = false;
    }
  })();
  return _examConfigPromise;
}

// ===================== 加载考试模板（v3 · exam_templates.json） =====================
async function _loadExamTemplates() {
  if (_examTemplates) return _examTemplates;
  if (_examTemplatesLoading) return _examTemplatesPromise;
  _examTemplatesLoading = true;
  _examTemplatesPromise = (async () => {
    try {
      const raw = 'data/exams/exam_templates.json';
      const url = (typeof window.__withVer === 'function')
        ? window.__withVer(raw) : (raw + '?t=' + Date.now());
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _examTemplates = await res.json();
      return _examTemplates;
    } catch (e) {
      console.warn('[考试] 模板库加载失败（将回退到 v2 内联 sections）', e);
      _examTemplates = { templates: {} };
      return _examTemplates;
    } finally {
      _examTemplatesLoading = false;
    }
  })();
  return _examTemplatesPromise;
}

/**
 * 把 grades[g][t].{midterm|final|unitTest} 引用模板展开为完整 sections 对象。
 * 解析规则：
 *   1. 若 node 含 `template` 字段 → 拷贝对应模板的字段（name/time/unitRange/sections/totalPoints/autoPoints）
 *   2. node 上其它字段（除 template/writing/sections）覆盖模板字段
 *   3. 若 node.writing.prompts / node.writing.modelAnswers 存在 → 注入到 sections 中 type==='writing' 的项
 *   4. 删掉 template/writing 字段，返回纯 v2 形态（_buildPaper 兼容）
 */
function _applyTemplate(node) {
  if (!node || typeof node !== 'object') return node;
  if (!node.template || !_examTemplates || !_examTemplates.templates) return node;
  const tpl = _examTemplates.templates[node.template];
  if (!tpl) {
    console.warn('[考试] 模板不存在：' + node.template);
    return node;
  }
  // 1+2 浅合并：tpl 为基，node 覆盖；sections 深拷贝（防外部修改污染模板）
  const out = Object.assign({}, tpl, node);
  out.sections = (tpl.sections || []).map(s => Object.assign({}, s));
  // 3 写作题注入
  if (node.writing && typeof node.writing === 'object') {
    for (const sec of out.sections) {
      if (sec.type === 'writing') {
        if (Array.isArray(node.writing.prompts)) sec.prompts = node.writing.prompts;
        if (Array.isArray(node.writing.modelAnswers)) sec.modelAnswers = node.writing.modelAnswers;
      }
    }
  }
  // 4 清理中间字段
  delete out.template;
  delete out.writing;
  return out;
}

// ===================== 加载历年真题（固定卷） =====================
async function _loadRealPapers() {
  if (_realPapers) return _realPapers;
  if (_realPapersPromise) return _realPapersPromise;
  _realPapersPromise = (async () => {
    try {
      const raw = 'data/exams/real_papers/index.json';
      const url = (typeof window.__withVer === 'function')
        ? window.__withVer(raw) : (raw + '?t=' + Date.now());
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      _realPapers = await res.json();
      return _realPapers;
    } catch (e) {
      console.warn('[考试] 真题库加载失败', e);
      _realPapers = { papers: [] };
      return _realPapers;
    }
  })();
  return _realPapersPromise;
}

// ===================== 工具函数 =====================

/** 从 code 字段解析单元号，如 "7A_U3_L02" → 3 */
function _parseUnit(code) {
  if (!code) return -1;
  const m = code.match(/_U(\d+)/i);
  return m ? parseInt(m[1], 10) : -1;
}

/** 检查题目是否在单元范围内 */
function _inUnitRange(q, range) {
  const unit = _parseUnit(q.code);
  // code 无 _U 单元号（如补全对话 3A_DC01）→ 视为通用题，不做单元过滤，避免被误排除导致 section 抽空
  if (unit < 0) return true;
  return unit >= range[0] && unit <= range[1];
}

/** 随机采样 n 个不重复元素 */
function _sample(arr, n) {
  if (!arr || arr.length === 0) return [];
  if (n >= arr.length) return [...arr];
  const pool = [...arr];
  const result = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

/** 字符串/整数 → 32位种子随机数发生器 (mulberry32) */
function _mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 用给定 rng（缺省 Math.random）采样 n 个不重复元素（Fisher-Yates 洗牌后取前 n）*/
function _sampleRng(arr, n, rng) {
  rng = rng || Math.random;
  if (!arr || arr.length === 0) return [];
  const pool = [...arr];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  return pool.slice(0, Math.min(n, pool.length));
}

/** 计算某组 sections 的「计划」分值（按 count×points），用于列表卡片展示 */
function _plannedPoints(sections) {
  let auto = 0, writing = 0;
  for (const s of (sections || [])) {
    const pts = (s.count || 0) * (s.points || 0);
    if (s.type === 'writing') writing += pts; else auto += pts;
  }
  return { auto: Math.round(auto * 10) / 10, writing, total: Math.round((auto + writing) * 10) / 10 };
}

/** 格式化时间 mm:ss */
function _fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

/** 获取当前学期的模拟卷 + 单元测试（单元测试由模板展开为 第1~第N单元测试） */
function _getExamsForContext() {
  const g = String(state.ctx.grade);
  const t = state.ctx.term;
  const cfg = _examConfig;
  const out = { sim: [], unit: [] };
  if (!cfg || !cfg.grades || !cfg.grades[g] || !cfg.grades[g][t]) return out;
  const node = cfg.grades[g][t];

  // 模拟卷：期中、期末（含中考模拟）—— 先把 { template, writing } 引用展开为完整 sections
  for (const key of ['midterm', 'final']) {
    if (node[key]) {
      const resolved = _applyTemplate(node[key]);
      out.sim.push({ key, source: 'config', grade: parseInt(g), term: t, ...resolved });
    }
  }

  // 单元测试：按模板展开，累积式 [1, N]
  if (node.unitTest) {
    const ut = _applyTemplate(node.unitTest);
    const maxUnit = ut.maxUnit || 8;
    for (let n = 1; n <= maxUnit; n++) {
      out.unit.push({
        key: 'unit' + n,
        source: 'config',
        grade: parseInt(g),
        term: t,
        name: (ut.namePattern || '第{n}单元测试').replace('{n}', n),
        time: ut.time || 40,
        unitRange: ut.cumulative ? [1, n] : [n, n],
        sections: ut.sections,
        unitTest: true,
        unitNo: n
      });
    }
  }
  return out;
}

/** 获取当前年级可用的历年真题（按年级过滤；含中考卷） */
function _getRealPapersForContext() {
  const g = parseInt(state.ctx.grade);
  if (!_realPapers || !_realPapers.papers) return [];
  return _realPapers.papers
    .filter(p => p.grade === g)
    .map(p => ({ ...p, key: p.id, source: 'real' }));
}

/** 获取题型图标 */
function _typeIcon(type) {
  return (_examConfig && _examConfig.typeIcons && _examConfig.typeIcons[type]) || '📝';
}
function _typeLabel(type) {
  return (_examConfig && _examConfig.typeLabels && _examConfig.typeLabels[type]) || type;
}

// ===================== 组卷引擎 =====================

/**
 * 按试卷定义从题库抽题生成试卷（统一引擎，模拟卷/单元测试/真题共用）
 * @param {object} def - 试卷定义：{ id/key, name, grade, term, time, unitRange,
 *                                    sections, seed?, region?, kind? }
 *   - 当 def.seed 存在时使用「种子化随机」→ 同一份卷每次生成题目一致（真题固定卷）
 *   - 否则使用 Math.random（模拟卷/单元测试，每次随机）
 * @returns {object|null} 试卷对象
 */
function _buildPaper(def) {
  const qb = window.questionBank;
  if (!def || !qb) return null;
  const g = parseInt(def.grade);
  const t = def.term;
  const hasSeed = (def.seed !== undefined && def.seed !== null);
  const rng = hasSeed ? _mulberry32(def.seed >>> 0) : Math.random;

  const paper = {
    id: def.id || def.key,
    name: def.name || def.id || def.key,
    grade: g,
    term: t,
    region: def.region || '',
    kind: def.kind || (def.unitTest ? 'unit' : 'sim'),
    fixed: !!hasSeed,
    totalTime: def.time || 60,  // 分钟
    sections: [],
    generatedAt: Date.now()
  };

  let flatIdx = 0;
  for (const secDef of (def.sections || [])) {
    const sec = {
      type: secDef.type,
      title: secDef.title || _typeLabel(secDef.type),
      count: secDef.count,
      pointsPer: secDef.points,
      unitRange: secDef.unitRange || def.unitRange,
      questions: [],
      startIdx: flatIdx
    };

    if (secDef.type === 'writing') {
      // 🆕 P6-C：优先从独立写作题库 qb.writing 按年级/学期抽一题（含 prompt/modelAnswer/hints）；
      // 题库缺失时回退到模板内联 prompts/modelAnswers（兼容旧模板）。
      const wPool = (qb.writing || []).filter(q => q.grade === g && q.term === t);
      if (wPool.length > 0) {
        const wq = wPool[Math.floor(rng() * wPool.length)];
        sec.questions.push({
          type: 'writing',
          prompt: wq.prompt || '请根据题目要求写一篇短文。',
          modelAnswer: wq.modelAnswer || '',
          hints: wq.hints || [],
          keywords: wq.keywords || [],
          minWords: wq.minWords || 0,
          code: wq.code || '',
          index: flatIdx,
          sectionIdx: paper.sections.length
        });
      } else {
        const prompts = secDef.prompts || [];
        const modelAnswers = secDef.modelAnswers || [];
        const pickIdx = Math.floor(rng() * Math.max(1, prompts.length));
        sec.questions.push({
          type: 'writing',
          prompt: prompts[pickIdx] || '请根据题目要求写一篇短文。',
          modelAnswer: modelAnswers[pickIdx] || '',
          index: flatIdx,
          sectionIdx: paper.sections.length
        });
      }
      flatIdx += 1;
    } else if (secDef.type === 'cloze') {
      // 🆕 P2-C：优先从独立 cloze 题库抽（真完形短文 + N 挖空），
      // 题库缺失时回退到旧逻辑（grammar 题串句子）作为兼容兜底。
      let clozePool = (qb.cloze || []).filter(q =>
        q.grade === g && q.term === t && _inUnitRange(q, sec.unitRange)
      );
      if (clozePool.length > 0) {
        // 真完形模式：抽 1 篇短文 → 展开为 N 道挖空题
        // secDef.count 视为「期望挖空数」；选择最接近的一篇
        const target = secDef.count || 10;
        clozePool.sort((a, b) =>
          Math.abs((a.blanks || []).length - target) - Math.abs((b.blanks || []).length - target));
        const picked = _sampleRng(clozePool, 1, rng);
        if (picked.length > 0) {
          const cz = picked[0];
          // 在 passage 中标记当前序号给学生看（保留教材本身的 ___N___ 占位符样式）
          sec.clozePassage = (cz.passage || '').replace(/___(\d+)___/g, '(__$1__)');
          sec.clozeTopic = cz.topic || '';
          for (const b of (cz.blanks || [])) {
            sec.questions.push({
              type: 'cloze', original: cz, q: `第 ${b.pos} 空`,
              options: b.options || ['A', 'B', 'C', 'D'],
              answer: (b.options || []).indexOf(b.answer),  // 索引化（与现有渲染一致）
              explain: b.explain || '',
              blankPos: b.pos,
              index: flatIdx, sectionIdx: paper.sections.length
            });
            flatIdx += 1;
          }
        }
      } else {
        // 兼容兜底：旧版从 grammar 串句子（jk/gzk 没造 cloze 时仍可考）
        let pool = (qb.grammar || []).filter(q =>
          q.grade === g && q.term === t && _inUnitRange(q, sec.unitRange)
        );
        const sampled = _sampleRng(pool, secDef.count, rng);
        if (sampled.length > 0) {
          const passageParts = [];
          for (let i = 0; i < sampled.length; i++) {
            const q = sampled[i];
            const sentence = (q.q || '').replace(/_{2,}/g, '___').replace(/[？?。.]$/, '');
            passageParts.push(`(${i + 1}) ${sentence}.`);
            sec.questions.push({
              type: 'cloze', original: q, q: q.q,
              options: q.options || ['A', 'B', 'C', 'D'],
              answer: q.answer, explain: q.explain || '',
              index: flatIdx, sectionIdx: paper.sections.length
            });
            flatIdx += 1;
          }
          sec.clozePassage = passageParts.join(' ');
        }
      }
    } else if (secDef.type === 'reading') {
      let pool = (qb.reading || []).filter(q =>
        q.grade === g && q.term === t && _inUnitRange(q, sec.unitRange)
      );
      const sampled = _sampleRng(pool, secDef.count, rng);
      for (const q of sampled) {
        sec.questions.push({
          type: 'reading', original: q, passage: q.passage || '', q: q.q,
          options: q.options || ['A', 'B', 'C', 'D'],
          answer: q.answer, explain: q.explain || '',
          index: flatIdx, sectionIdx: paper.sections.length
        });
        flatIdx += 1;
      }
    } else if (['listen_pic','listen_judge','listen_fill','blank_fill','sentence_transform','sentence_order','dialog_complete'].includes(secDef.type)) {
      // 🆕 新题型：直接从对应题库抽取
      let pool = (qb[secDef.type] || []).filter(q =>
        q.grade === g && q.term === t && _inUnitRange(q, sec.unitRange)
      );
      const sampled = _sampleRng(pool, secDef.count, rng);
      for (const q of sampled) {
        const item = {
          type: secDef.type, original: q, q: q.q || '',
          options: q.options || [], answer: q.answer,
          explain: q.explain || '', difficulty: q.difficulty || 1,
          index: flatIdx, sectionIdx: paper.sections.length
        };
        // 听力类题型需要 audioText / audioFile
        if (['listen_pic','listen_judge','listen_fill'].includes(secDef.type)) {
          item.audioText = q.audioText || '';
          item.audioFile = q.audioFile || '';
        }
        // 🆕 连词成句：带上乱序词块 words（answer 为正确句子字符串）
        if (secDef.type === 'sentence_order') {
          item.words = Array.isArray(q.words) ? q.words.slice() : [];
        }
        // 🆕 完成句子：带上 passage（含 ____ 占位）与 blanks（每空 answer/options）
        if (secDef.type === 'blank_fill') {
          item.passage = q.passage || '';
          item.cn = q.cn || '';
          item.blanks = Array.isArray(q.blanks) ? q.blanks : [];
        }
        // 听音判断：渲染用 statement（兼容旧字段 q）
        if (secDef.type === 'listen_judge') {
          item.statement = q.statement || q.q || '';
        }
        // 🆕 句型转换：带上原句 original + 转换要求 target + 多可接受答案 answers
        if (secDef.type === 'sentence_transform') {
          item.originalSentence = q.original || '';
          item.target = q.target || '';
          item.answers = Array.isArray(q.answers) ? q.answers : (q.answer ? [q.answer] : []);
        }
        // 🆕 匹配题：带上 pairs（问答对），选项 = 打乱后的全部答句
        if (secDef.type === 'matching') {
          item.pairs = Array.isArray(q.pairs) ? q.pairs : [];
          item.answerOptions = _sampleRng(item.pairs.map(p => p.a), item.pairs.length, rng);
        }
        // 🆕 补全短文：带上 passage(含 ___n___) + blanks(每空 answer) + 词池 options
        if (secDef.type === 'cloze_passage') {
          item.passage = q.passage || '';
          item.blanks = Array.isArray(q.blanks) ? q.blanks : [];
          item.wordbank = Array.isArray(q.wordbank) ? q.wordbank : [];
        }
        sec.questions.push(item);
        flatIdx += 1;
      }
    } else {
      // listening / spelling / grammar / 新题型
      const bankKey = secDef.type;
      let pool = (qb[bankKey] || []).filter(q =>
        q.grade === g && q.term === t && _inUnitRange(q, sec.unitRange)
      );
      // 🔧 防御：如果 bankKey 对应题型未加载，pool 为空，直接跳过
      if (!qb[bankKey] && console) {
        console.warn('[考试] 题型未加载:', bankKey, '→ 跳过该 section');
      }
      const sampled = _sampleRng(pool, secDef.count, rng);
      for (const q of sampled) {
        const item = {
          type: secDef.type, original: q, q: q.q || '',
          options: q.options || [], answer: q.answer,
          explain: q.explain || '', difficulty: q.difficulty || 1,
          index: flatIdx, sectionIdx: paper.sections.length
        };
        if (secDef.type === 'listening') {
          item.audioText = q.audioText || '';
          item.audioFile = q.audioFile || '';
        }
        // 🆕 单词拼写（中译英）：带上首字母提示 hint（answer 为正确英文单词）
        if (secDef.type === 'spelling') {
          item.hint = q.hint || '';
        }
        sec.questions.push(item);
        flatIdx += 1;
      }
    }

    // 计分策略：
    //  - cloze（真完形整篇当 1 大题）：totalPoints 强制 = 配置 count × points（与配置声明一致），
    //    单空分按比例缩放（避免「池子里短文 4 空 vs 配置 5 空」导致总分跳动）。
    //  - 其他题型：按「实际抽到的题量 × 单题分」（题库不足时分值自然减少，与现状一致）。
    if (secDef.type === 'cloze') {
      const N = sec.questions.length;
      const expectedTotal = Math.round((secDef.count || 0) * (secDef.points || 0) * 10) / 10;
      if (N > 0 && expectedTotal > 0) {
        // 单空分按 expectedTotal/N 缩放（保留 2 位小数，最后 1 空兜底凑齐 totalPoints 避免浮点误差）
        const perBlank = Math.floor((expectedTotal / N) * 100) / 100;
        let acc = 0;
        for (let i = 0; i < N - 1; i++) {
          sec.questions[i].pointsPer = perBlank;
          acc += perBlank;
        }
        // 最后 1 空兜底凑齐
        sec.questions[N - 1].pointsPer = Math.round((expectedTotal - acc) * 100) / 100;
        sec.pointsPer = perBlank;                  // 段级默认（多数空用此值）
        sec.totalPoints = expectedTotal;           // 锁死到配置
      } else {
        sec.totalPoints = 0;
        sec.pointsPer = 0;
      }
    } else {
      // 🔒 P1 总分锁定：section 满分锁定到「配置 count × points」（声明值）；
      //    题库抽不满时，单题分按比例放大（答对全部实抽题仍得该 section 满分），
      //    并打 shortfall 标记，供卷面/结果页提示「题库不足，按比例计分」。
      //    → 保证整卷满分 = Σ(count × points) = 配置声明总分，严格闭合，杜绝 106 溢出。
      const N = sec.questions.length;
      const expectedTotal = Math.round((secDef.count || 0) * (secDef.points || 0) * 10) / 10;
      if (N > 0 && expectedTotal > 0) {
        if (N < (secDef.count || 0)) {
          const perQ = Math.floor((expectedTotal / N) * 100) / 100;
          let acc = 0;
          for (let i = 0; i < N - 1; i++) { sec.questions[i].pointsPer = perQ; acc += perQ; }
          sec.questions[N - 1].pointsPer = Math.round((expectedTotal - acc) * 100) / 100;
          sec.pointsPer = perQ;
          sec.shortfall = { got: N, need: secDef.count || 0 };
        } else {
          sec.pointsPer = secDef.points || 0;
        }
        sec.totalPoints = expectedTotal;   // 锁定到配置声明
      } else {
        sec.totalPoints = 0;
        sec.pointsPer = 0;
      }
    }
    sec.endIdx = flatIdx - 1;
    if (sec.questions.length > 0) paper.sections.push(sec);
  }

  paper.totalQuestions = flatIdx;

  // 汇总分值（按实际题量）
  let autoMax = 0, writingMax = 0;
  for (const sec of paper.sections) {
    if (sec.type === 'writing') writingMax += sec.totalPoints;
    else autoMax += sec.totalPoints;
  }
  paper.totalAutoPoints = Math.round(autoMax * 10) / 10;
  paper.writingPoints = Math.round(writingMax * 10) / 10;
  paper.totalPaperPoints = Math.round((autoMax + writingMax) * 10) / 10;
  return paper;
}


// ===================== 页面：考试列表 =====================

/** 入口：渲染考试页 */
// 声明为 window 以便 switchPage 调用；内部依赖会在调用时已加载
let renderExamPage = async function() {
  await _loadExamConfig();
  await _loadExamTemplates();   // B1 模板化后必须先加载模板库，否则 _applyTemplate() 不会展开 sections
  _loadHistory();
  _examState.submitted = false;
  _examState.paper = null;
  _examState.answers = {};
  _examState.writingText = '';
  if (_examState.timerId) { clearInterval(_examState.timerId); _examState.timerId = null; }

  await _loadRealPapers();

  const el = document.getElementById('examView');
  if (!el) return;
  const gText = (GRADE_LABELS || {})[state.ctx.grade] || String(state.ctx.grade);
  const tText = state.ctx.term === '上' ? '上册' : '下册';

  const exams = _getExamsForContext();      // { sim, unit }
  const realPapers = _getRealPapersForContext();

  // 该学段完全没有任何考试配置（如小学未开放学段 / gzk / 占位教材）：
  // 给出友好引导，而不是只甩一句"暂无配置"的近空白页。
  const hasConfig = !!(_examConfig && _examConfig.grades
    && _examConfig.grades[String(state.ctx.grade)]
    && _examConfig.grades[String(state.ctx.grade)][state.ctx.term]);
  const totalAvailable = exams.sim.length + exams.unit.length + realPapers.length;
  if (!hasConfig && totalAvailable === 0) {
    el.innerHTML = `
      <h2 class="text-xl font-bold text-slate-800 mb-3">📋 模拟考试</h2>
      <div class="exam-ctxbar">
        <span class="font-semibold">📚 ${gText}${tText} · ${TEXTBOOK_NAMES[state.ctx.textbook] || state.ctx.textbook}</span>
      </div>
      <div class="exam-guide">
        <div class="exam-guide-icon">🧩</div>
        <div class="exam-guide-title">该学段的模拟考试正在筹备中</div>
        <div class="exam-guide-desc">
          当前「${gText}${tText}」暂未开放整卷考试。<br>
          你可以先用下面的方式继续学习，掌握后再来挑战考试～
        </div>
        <div class="exam-guide-actions">
          <button class="exam-guide-btn primary" data-go="practice">✏️ 去专项练习</button>
          <button class="exam-guide-btn" data-go="textbook">📖 背单词 / 看课文</button>
        </div>
      </div>
      <div id="examHistoryWrap" class="mt-6"></div>
    `;
    const goPractice = el.querySelector('[data-go="practice"]');
    const goTextbook = el.querySelector('[data-go="textbook"]');
    if (goPractice) goPractice.addEventListener('click', () => { try { switchPage('practice'); } catch (e) {} });
    if (goTextbook) goTextbook.addEventListener('click', () => { try { switchPage('textbook'); } catch (e) {} });
    _renderHistory();
    return;
  }

  const tabs = [
    { id: 'sim',  label: '模拟卷',  count: exams.sim.length },
    { id: 'unit', label: '单元测试', count: exams.unit.length },
    { id: 'real', label: '历年真题', count: realPapers.length }
  ];
  if (!tabs.some(tb => tb.id === _examListTab && tb.count > 0)) {
    _examListTab = (tabs.find(tb => tb.count > 0) || tabs[0]).id;
  }

  const tabsHtml = tabs.map(tb =>
    `<button class="exam-tab ${tb.id === _examListTab ? 'active' : ''}" data-tab="${tb.id}">
       ${tb.label}<span class="exam-tab-count">${tb.count}</span>
     </button>`
  ).join('');

  el.innerHTML = `
    <h2 class="text-xl font-bold text-slate-800 mb-3">📋 模拟考试</h2>
    <div class="exam-ctxbar">
      <span class="font-semibold">📚 ${gText}${tText} · ${TEXTBOOK_NAMES[state.ctx.textbook] || state.ctx.textbook}</span>
      <span class="exam-ctxbar-hint">卷面满分 120 分 · 100 分钟 · 点击试卷即可开考</span>
    </div>
    <div class="exam-tabs">${tabsHtml}</div>
    <div id="examList" class="exam-grid"></div>
    <div id="examHistoryWrap" class="mt-6"></div>
  `;

  // 绑定分区 Tab 切换
  el.querySelectorAll('.exam-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      _examListTab = btn.dataset.tab;
      el.querySelectorAll('.exam-tab').forEach(b => b.classList.toggle('active', b === btn));
      _renderExamList();
    });
  });

  _renderExamList();
  _renderHistory();
};

window.renderExamPage = renderExamPage;

/** 渲染当前分区下的试卷卡片 */
function _renderExamList() {
  const wrap = document.getElementById('examList');
  if (!wrap) return;
  const exams = _getExamsForContext();
  const realPapers = _getRealPapersForContext();

  let list = [];
  if (_examListTab === 'sim') list = exams.sim;
  else if (_examListTab === 'unit') list = exams.unit;
  else list = realPapers;

  if (!list.length) {
    const tip = _examListTab === 'real'
      ? '该年级暂无历年真题卷'
      : '暂无该学期试卷配置';
    wrap.innerHTML = `<div class="exam-empty">${tip}</div>`;
    return;
  }

  // 历年真题按地区分组展示
  if (_examListTab === 'real') {
    const groups = {};
    for (const ex of list) {
      const r = ex.region || '其他';
      (groups[r] = groups[r] || []).push(ex);
    }
    let html = '';
    for (const region of Object.keys(groups)) {
      html += `<div class="exam-region-group">
        <div class="exam-region-title">📍 ${escapeHtml(region)}</div>
        <div class="exam-grid-inner">
          ${groups[region].map(_examCardHtml).join('')}
        </div>
      </div>`;
    }
    wrap.innerHTML = html;
  } else {
    wrap.innerHTML = `<div class="exam-grid-inner">${list.map(_examCardHtml).join('')}</div>`;
  }

  // 绑定点击
  wrap.querySelectorAll('.exam-card2').forEach(card => {
    card.addEventListener('click', () => _startExam(card.dataset.key, card.dataset.source));
  });
}

/** 精简卡片：标题 / 时长 / 满分 / 自动判分 / 历史最高 / 开始 */
function _examCardHtml(ex) {
  const planned = _plannedPoints(ex.sections);
  const isUnit = ex.source === 'config' && ex.unitTest;
  const isReal = ex.source === 'real';
  const icon = isReal ? '📄' : (isUnit ? '📝' : '📋');

  // 历史最高分（移到右上角显示，分值字符醒目放大）
  const histKey = ex.grade + '_' + ex.term + '_' + ex.key;
  const hist = (_examState.history || []).filter(h => h.examKey === histKey);
  let bestHtml = '<span class="exam-card2-best" title="尚未考过"><span class="exam-card2-best-label">历史最高</span><span class="exam-card2-best-none">未考</span></span>';
  if (hist.length > 0) {
    const best = Math.max(...hist.map(h => (h.totalScore != null ? h.totalScore : (h.autoScore || 0))));
    bestHtml = `<span class="exam-card2-best done" title="历史最高分"><span class="exam-card2-best-label">🏆 历史最高</span><b class="exam-card2-best-num">${best}</b><span class="exam-card2-best-unit">分</span></span>`;
  }

  // 副标题信息（满分/自动判分保持原样，不放大）
  let metaHtml;
  if (isUnit) {
    metaHtml = `⏱ ${ex.time}分钟 · 累积单元 1-${ex.unitNo} · 自动判分 ${planned.auto} 分`;
  } else {
    metaHtml = `⏱ ${ex.time}分钟 · 满分 ${planned.total} 分 · 自动判分 ${planned.auto} 分`;
  }

  const tagHtml = (isReal && ex.kind === 'zhongkao')
    ? '<span class="exam-card2-tag zk">中考</span>' : '';

  return `
    <div class="exam-card2" data-key="${ex.key}" data-source="${ex.source}">
      <div class="exam-card2-head">
        <span class="exam-card2-title">${icon} ${escapeHtml(ex.name)}${tagHtml}</span>
        ${bestHtml}
      </div>
      <div class="exam-card2-meta">${metaHtml}</div>
      <div class="exam-card2-foot">
        <span class="exam-card2-go">开始考试 →</span>
      </div>
    </div>`;
}


// ===================== 开始考试 =====================

async function _startExam(examKey, source) {
  await _loadExamConfig();
  await _loadExamTemplates();   // B1 模板化后必须先加载模板库，否则 _getExamsForContext() 拿不到 sections

  // 解析试卷定义
  let def = null;
  if (source === 'real') {
    await _loadRealPapers();
    const p = (_realPapers && _realPapers.papers || []).find(x => x.id === examKey);
    if (p) def = Object.assign({}, p, { key: p.id });
  } else {
    const exams = _getExamsForContext();
    def = [...exams.sim, ...exams.unit].find(e => e.key === examKey);
    if (def) def = Object.assign({}, def, { id: examKey });
  }
  if (!def) { alert('未找到试卷定义。'); return; }

  const paper = _buildPaper(def);
  if (!paper || !paper.sections.length) {
    alert('试卷生成失败，题库数据不足。请检查当前学期是否有足够题目。');
    return;
  }

  // 确认开始
  const totalQ = paper.totalQuestions || 0;
  const paperMax = paper.totalPaperPoints || paper.totalAutoPoints || 0;
  if (!confirm(
    '【' + paper.name + '】\n' +
    (paper.region ? '地区：' + paper.region + '\n' : '') +
    '年级：' + (GRADE_LABELS[paper.grade] || paper.grade) + ' · ' + (paper.term === '上' ? '上册' : '下册') + '\n' +
    '时长：' + paper.totalTime + ' 分钟\n' +
    '题目：' + totalQ + ' 题 · 卷面满分 ' + paperMax + ' 分\n' +
    '自动判分：' + (paper.totalAutoPoints || 0) + ' 分\n\n' +
    '考试开始后将启动倒计时，时间到自动交卷。确定开始吗？'
  )) return;

  // 初始化状态
  _examState.paper = paper;
  _examState.answers = {};
  _examState.writingText = '';
  _examState.currentSection = 0;
  _examState.submitted = false;
  _examState.totalTime = paper.totalTime * 60;
  _examState.timeLeft = paper.totalTime * 60;

  _renderExamQuiz();

  // 启动倒计时
  if (_examState.timerId) clearInterval(_examState.timerId);
  _examState.timerId = setInterval(() => {
    _examState.timeLeft--;
    _updateTimerDisplay();
    if (_examState.timeLeft <= 0) {
      clearInterval(_examState.timerId);
      _examState.timerId = null;
      _submitExam(true);
    }
  }, 1000);
}


// ===================== 考试答题界面 =====================

function _renderExamQuiz() {
  const el = document.getElementById('examView');
  if (!el) return;
  const paper = _examState.paper;
  if (!paper) return;

  // 构建题型 Tab
  const sectionTabs = paper.sections.map((sec, i) => {
    const answeredCount = sec.questions.filter(q => _examState.answers[q.index] !== undefined).length;
    const totalCount = sec.questions.length;
    const activeClass = i === _examState.currentSection ? 'exam-section-tab active' : 'exam-section-tab';
    return `<button class="${activeClass}" onclick="_switchExamSection(${i})">
      ${_typeIcon(sec.type)} ${sec.title}
      <span class="text-xs opacity-70">(${answeredCount}/${totalCount})</span>
    </button>`;
  }).join('');

  // 构建答题卡
  let answerSheetHtml = '';
  let flatIdx = 0;
  for (const sec of paper.sections) {
    if (sec.type === 'writing') {
      answerSheetHtml += `<span class="exam-sheet-item exam-sheet-writing" title="写作">W</span>`;
      flatIdx++;
      continue;
    }
    for (const q of sec.questions) {
      const answered = _examState.answers[flatIdx] !== undefined;
      const cls = answered ? 'exam-sheet-item answered' : 'exam-sheet-item';
      answerSheetHtml += `<span class="${cls}" onclick="_jumpToQuestion(${flatIdx})" title="第${flatIdx+1}题">${flatIdx+1}</span>`;
      flatIdx++;
    }
  }

  el.innerHTML = `
    <div class="exam-quiz-container">
      <!-- 顶栏：计时 + 交卷 -->
      <div class="exam-topbar">
        <div class="exam-timer" id="examTimer">
          ⏱ <span id="examTimerText">${_fmtTime(_examState.timeLeft)}</span>
        </div>
        <div class="exam-topbar-info">
          ${paper.name} · ${(GRADE_LABELS || {})[paper.grade] || paper.grade}${paper.term === '上' ? '上' : '下'}册
        </div>
        <button class="exam-submit-btn" onclick="_submitExam(false)">📤 交卷</button>
      </div>

      <div class="exam-body">
        <!-- 题型区 -->
        <div class="exam-main">
          <!-- 题型切换 Tab -->
          <div class="exam-section-tabs">
            ${sectionTabs}
          </div>
          <!-- 当前题型内容 -->
          <div class="exam-section-content card" id="examSectionContent"></div>
        </div>

        <!-- 答题卡侧栏 -->
        <div class="exam-answersheet">
          <div class="exam-answersheet-title">📋 答题卡</div>
          <div class="exam-answersheet-grid" id="examAnswersheet">
            ${answerSheetHtml}
          </div>
          <div class="exam-answersheet-legend">
            <span class="exam-sheet-item answered" style="cursor:default">✓</span> 已答
            <span class="exam-sheet-item" style="cursor:default">○</span> 未答
          </div>
        </div>
      </div>
    </div>
  `;

  // 渲染当前 section
  _renderSection(_examState.currentSection);
  _updateTimerDisplay();
}


/** 渲染某一题型区 */
function _renderSection(sectionIdx) {
  const paper = _examState.paper;
  if (!paper || !paper.sections[sectionIdx]) return;
  const sec = paper.sections[sectionIdx];
  const contentEl = document.getElementById('examSectionContent');
  if (!contentEl) return;

  let html = '';

  if (sec.type === 'writing') {
    // 写作区
    const q = sec.questions[0];
    if (q) {
      const minW = q.minWords || 40;
      const hintsHtml = (q.hints && q.hints.length > 0)
        ? `<div class="exam-writing-hints text-xs text-slate-500 mt-2">💡 提示词：${q.hints.map(h => `<span class="exam-writing-hint">${escapeHtml(h)}</span>`).join(' ')}</div>`
        : '';
      html = `
        <div class="mb-4 text-sm text-slate-500">${_typeIcon('writing')} ${sec.title} · 共 ${sec.count} 题 · ${sec.totalPoints} 分</div>
        <div class="exam-writing-prompt">
          <div class="font-semibold text-slate-700 mb-2">📝 写作题目：</div>
          <div class="text-slate-600 leading-relaxed">${escapeHtml(q.prompt || '')}</div>
          ${hintsHtml}
        </div>
        <div class="mt-4">
          <div class="font-semibold text-slate-700 mb-2">✏️ 请在下方作答（不少于${minW}词）：</div>
          <textarea id="examWritingArea" class="exam-writing-textarea" rows="10"
            placeholder="在此输入你的作文..." oninput="try{var w=(this.value.toLowerCase().match(/[a-z']+/g)||[]).length;var el=document.getElementById('examWritingWordCount');if(el){el.textContent=w;el.style.color=w>=${minW}?'#16a34a':'#f59e0b';}}catch(e){}">${escapeHtml(_examState.writingText || '')}</textarea>
          <div class="text-xs text-slate-400 mt-1">当前字数：<span id="examWritingWordCount">0</span> / ${minW} 词 · 提交后系统会自动评分并展示范文参考</div>
        </div>`;
    }
  } else if (sec.type === 'cloze' && sec.clozePassage) {
    // 完形填空：显示合成短文
    html = `
      <div class="mb-4 text-sm text-slate-500">${_typeIcon('cloze')} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分</div>
      <div class="exam-cloze-passage">${escapeHtml(sec.clozePassage)}</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderQuestionHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'reading') {
    // 阅读理解：先显示 passage，再显示题目
    // 按 passage 分组
    const passageGroups = {};
    for (const q of sec.questions) {
      const key = (q.passage || '').substring(0, 60);
      if (!passageGroups[key]) passageGroups[key] = { passage: q.passage, questions: [] };
      passageGroups[key].questions.push(q);
    }
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon('reading')} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分</div>`;
    for (const [key, group] of Object.entries(passageGroups)) {
      html += `
        <div class="exam-reading-passage">
          <div class="text-xs text-amber-700 font-semibold mb-2">📄 阅读短文</div>
          <div class="text-sm text-slate-800 leading-relaxed">${escapeHtml(group.passage || '')}</div>
        </div>
        <div class="exam-questions">`;
      for (const q of group.questions) {
        html += _renderQuestionHTML(q);
      }
      html += `</div>`;
    }
  } else if (sec.type === 'listen_pic') {
    // 听音选图：选项为 emoji 图片
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderListenPicHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'listen_judge') {
    // 听音判断：True / False 按钮
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderListenJudgeHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'listen_fill') {
    // 🆕 听音填空：播放听力 + 中文题问 + 文字选项（与 listen_pic 同构）
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderListenFillHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'sentence_order') {
    // 连词成句：点击乱序单词组句
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderSentenceOrderHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'spelling') {
    // 🆕 单词拼写：中文词义 + 首字母/字母数提示 + 英文输入框
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分 · 根据中文写出英文单词</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderSpellingHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'blank_fill') {
    // 🆕 完成句子：句子中挖空，逐空选词/填空
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分 · 在空格处填入正确的单词</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderBlankFillHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'dialog_complete') {
    // 🆕 补全对话：显示对话，每个空白处下拉选择
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分 · 为每个空白选择正确的选项</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderDialogCompleteHTML(q, paper.sections.indexOf(sec));
    }
    html += `</div>`;
  } else if (sec.type === 'sentence_transform') {
    // 🆕 句型转换：原句 + 转换要求 + 文本输入框
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分 · 按要求改写句子</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderSentenceTransformHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'matching') {
    // 🆕 匹配题：左问句 + 右下拉选答句
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.totalPoints} 分 · 为每个问句选择正确的答句</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderMatchingHTML(q);
    }
    html += `</div>`;
  } else if (sec.type === 'cloze_passage') {
    // 🆕 补全短文：短文含空 + 词池下拉选择
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.totalPoints} 分 · 从方框中选择合适的词补全短文</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      html += _renderClozePassageHTML(q);
    }
    html += `</div>`;
  } else {
    // 普通题型（听力 / 拼写 / 语法 / 新题型单选类）
    html = `<div class="mb-4 text-sm text-slate-500">${_typeIcon(sec.type)} ${sec.title} · 共 ${sec.questions.length} 题 · ${sec.totalPoints} 分</div>
      <div class="exam-questions">`;
    for (const q of sec.questions) {
      if (sec.type === 'listening' || q.type === 'listening') {
        html += _renderListeningHTML(q);
      } else {
        html += _renderQuestionHTML(q);
      }
    }
    html += `</div>`;
  }

  contentEl.innerHTML = html;

  // 绑定写作区事件
  const textarea = document.getElementById('examWritingArea');
  if (textarea) {
    textarea.addEventListener('input', () => {
      _examState.writingText = textarea.value;
    });
  }

  // 绑定听力播放按钮
  contentEl.querySelectorAll('.exam-listen-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const qIdx = parseInt(this.dataset.qindex);
      _playExamAudio(qIdx);
    });
  });

  // 绑定选项点击
  contentEl.querySelectorAll('.exam-option').forEach(opt => {
    opt.addEventListener('click', function() {
      const qIdx = parseInt(this.dataset.qindex);
      const optIdx = parseInt(this.dataset.optindex);
      _selectOption(qIdx, optIdx);
    });
  });

  // 高亮已选选项
  _highlightSelected();

  // 🆕 补全对话下拉事件
  contentEl.querySelectorAll('.exam-dialog-select').forEach(function(sel) {
    sel.addEventListener('change', function() {
      var qIdx = parseInt(this.dataset.qindex);
      var blankPos = parseInt(this.dataset.blankpos);
      if (!_examState.answers[qIdx]) _examState.answers[qIdx] = [];
      var arr = _examState.answers[qIdx];
      // 确保索引对齐，空白位置-1为数组索引
      var idx = blankPos - 1;
      if (!Array.isArray(arr)) arr = [];
      arr[idx] = this.value;
      _examState.answers[qIdx] = arr;
      // 更新答题卡
      var sheetItem = document.querySelector('#examAnswersheet .exam-sheet-item:nth-child(' + (qIdx + 1) + ')');
      if (sheetItem) sheetItem.classList.add('answered');
    });
  });
}


/** 渲染单个选择题 */
function _renderQuestionHTML(q) {
  const selected = _examState.answers[q.index];
  let optionsHtml = '';
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let i = 0; i < (q.options || []).length; i++) {
    const selClass = selected === i ? 'exam-option selected' : 'exam-option';
    optionsHtml += `<div class="${selClass}" data-qindex="${q.index}" data-optindex="${i}">
      <span class="exam-option-label">${labels[i] || i}</span>
      <span>${escapeHtml(String(q.options[i] || ''))}</span>
    </div>`;
  }
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">${q.index + 1}. ${escapeHtml(q.q || '')}</div>
    <div class="exam-options">${optionsHtml}</div>
  </div>`;
}


/** 渲染听力题（含播放按钮） */
function _renderListeningHTML(q) {
  const selected = _examState.answers[q.index];
  let optionsHtml = '';
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let i = 0; i < (q.options || []).length; i++) {
    const selClass = selected === i ? 'exam-option selected' : 'exam-option';
    optionsHtml += `<div class="${selClass}" data-qindex="${q.index}" data-optindex="${i}">
      <span class="exam-option-label">${labels[i] || i}</span>
      <span>${escapeHtml(String(q.options[i] || ''))}</span>
    </div>`;
  }
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">
      ${q.index + 1}.
      <button class="exam-listen-btn" data-qindex="${q.index}" title="播放听力">🔊 播放</button>
      ${escapeHtml(q.q || '')}
    </div>
    <div class="exam-options">${optionsHtml}</div>
  </div>`;
}


/** 渲染听音选图题（选项为 emoji） */
function _renderListenPicHTML(q) {
  const selected = _examState.answers[q.index];
  let optionsHtml = '';
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let i = 0; i < (q.options || []).length; i++) {
    const selClass = selected === i ? 'exam-option selected' : 'exam-option';
    optionsHtml += `<div class="${selClass}" data-qindex="${q.index}" data-optindex="${i}">
      <span class="exam-option-label">${labels[i] || i}</span>
      <span style="font-size:2rem">${escapeHtml(String(q.options[i] || ''))}</span>
    </div>`;
  }
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">
      ${q.index + 1}.
      <button class="exam-listen-btn" data-qindex="${q.index}" title="播放听力">🔊 播放</button>
      ${escapeHtml(q.q || '请听录音，选择正确的图片')}
    </div>
    <div class="exam-options exam-options-grid">${optionsHtml}</div>
  </div>`;
}


/** 渲染听音判断题（True / False 按钮） */
function _renderListenJudgeHTML(q) {
  const selected = _examState.answers[q.index];
  const isTrue = selected === true;
  const isFalse = selected === false;
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">
      ${q.index + 1}.
      <button class="exam-listen-btn" data-qindex="${q.index}" title="播放听力">🔊 播放</button>
      ${escapeHtml(q.statement || '')}
    </div>
    <div class="exam-judge-btns">
      <button class="exam-judge-btn ${isTrue ? 'selected' : ''}" data-qindex="${q.index}" data-value="true">✅ True</button>
      <button class="exam-judge-btn ${isFalse ? 'selected' : ''}" data-qindex="${q.index}" data-value="false">❌ False</button>
    </div>
  </div>`;
}

function _renderListenFillHTML(q) {
  // 🆕 听音填空：播放听力 + 中文题问 + 文字选项（与 listen_pic 同构）
  const selected = _examState.answers[q.index];
  let optionsHtml = '';
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let i = 0; i < (q.options || []).length; i++) {
    const selClass = selected === i ? 'exam-option selected' : 'exam-option';
    optionsHtml += `<div class="${selClass}" data-qindex="${q.index}" data-optindex="${i}">
      <span class="exam-option-label">${labels[i] || i}</span>
      <span>${escapeHtml(String(q.options[i] || ''))}</span>
    </div>`;
  }
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">
      ${q.index + 1}.
      <button class="exam-listen-btn" data-qindex="${q.index}" title="播放听力">🔊 播放</button>
      ${escapeHtml(q.q || '请听录音，选择正确的答案')}
    </div>
    <div class="exam-options">${optionsHtml}</div>
  </div>`;
}


/** 渲染连词成句题（点击单词排序） */
function _renderSentenceOrderHTML(q) {
  const selected = _examState.answers[q.index] || [];
  const words = q.words || [];
  // 已选单词 → 答案区；未选单词 → 候选区
  const chosen = selected.map(i => words[i]).join(' ');
  let poolHtml = '';
  for (let i = 0; i < words.length; i++) {
    if (selected.includes(i)) continue;
    poolHtml += `<span class="exam-word-pool-item" data-qindex="${q.index}" data-wordidx="${i}">${escapeHtml(words[i])}</span> `;
  }
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">${q.index + 1}. ${escapeHtml(q.q || '请点击单词，组成正确句子')}</div>
    <div class="exam-sentence-answer">${chosen ? escapeHtml(chosen) : '<span class="text-slate-400">点击上方单词组成句子...</span>'}</div>
    <div class="exam-word-pool">${poolHtml}</div>
    <button class="exam-clear-btn" data-qindex="${q.index}">🔄 清空重排</button>
  </div>`;
}


/** 文本答案规范化：忽略大小写、合并空格、去标点前空格（用于拼写/句子/填空判分） */
function _normText(s) {
  return String(s == null ? '' : s)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:'"])/g, '$1')
    .trim();
}


/** 🆕 渲染单词拼写题（中文词义 + 首字母/字母数提示 + 英文输入框） */
function _renderSpellingHTML(q) {
  const cur = _examState.answers[q.index] || '';
  const ans = q.answer || '';
  // 首字母提示（题库 hint 优先；缺省时用首字母 + 下划线补足单词长度）
  let hintTxt = q.hint || '';
  if (!hintTxt && ans) hintTxt = ans[0] + '＿'.repeat(Math.max(0, ans.length - 1));
  // 字母数下划线（提示单词长度）
  const underline = ans ? '＿'.repeat(ans.length) : '';
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">${q.index + 1}. ${escapeHtml(q.q || '')}
      <span class="exam-spell-hint">💡 ${escapeHtml(hintTxt)}${ans ? '（' + ans.length + ' 个字母）' : ''}</span>
    </div>
    <div class="exam-spell-wrap">
      <input type="text" class="exam-spell-input" data-qindex="${q.index}"
             value="${escapeHtml(cur)}" placeholder="${underline}" autocomplete="off"
             autocapitalize="off" spellcheck="false" />
    </div>
  </div>`;
}


/** 🆕 渲染完成句子题（passage 就地挖空：有选项则选词、无则填空，按空给分） */
function _renderBlankFillHTML(q) {
  const passage = q.passage || '';
  const blanks = q.blanks || [];
  const cur = Array.isArray(_examState.answers[q.index]) ? _examState.answers[q.index] : [];
  // 以连续 2 个及以上下划线作为一个空的占位符切分
  const parts = passage.split(/_{2,}/);
  let inner = '';
  for (let i = 0; i < parts.length; i++) {
    inner += escapeHtml(parts[i]);
    if (i < parts.length - 1) {
      const b = blanks[i] || {};
      const val = cur[i] != null ? cur[i] : '';
      if (Array.isArray(b.options) && b.options.length) {
        let opts = `<option value="">— 选择 —</option>`;
        for (const o of b.options) {
          opts += `<option value="${escapeHtml(o)}" ${val === o ? 'selected' : ''}>${escapeHtml(o)}</option>`;
        }
        inner += `<select class="exam-blank-select" data-qindex="${q.index}" data-blankidx="${i}">${opts}</select>`;
      } else {
        inner += `<input type="text" class="exam-blank-input" data-qindex="${q.index}" data-blankidx="${i}"
                    value="${escapeHtml(val)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="＿＿＿" />`;
      }
    }
  }
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">${q.index + 1}. 根据中文意思，完成句子${q.cn ? `<span class="exam-blank-cn">${escapeHtml(q.cn)}</span>` : ''}</div>
    <div class="exam-blank-passage">${inner}</div>
  </div>`;
}


// ===================== 答题交互 =====================

function _selectOption(qIdx, optIdx) {
  if (_examState.submitted) return;
  _examState.answers[qIdx] = optIdx;

  // 更新选项高亮
  const container = document.getElementById('examSectionContent');
  if (container) {
    container.querySelectorAll(`.exam-option[data-qindex="${qIdx}"]`).forEach(el => {
      el.classList.toggle('selected', parseInt(el.dataset.optindex) === optIdx);
    });
  }

  // 更新答题卡
  const sheetItem = document.querySelector(`#examAnswersheet .exam-sheet-item:nth-child(${qIdx + 1})`);
  if (sheetItem) sheetItem.classList.add('answered');

  // 更新题型 Tab 计数
  _updateSectionTabCounts();
}

function _highlightSelected() {
  for (const [idx, optIdx] of Object.entries(_examState.answers)) {
    const container = document.getElementById('examSectionContent');
    if (container) {
      container.querySelectorAll(`.exam-option[data-qindex="${idx}"]`).forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.optindex) === optIdx);
      });
    }
  }
}

function _updateSectionTabCounts() {
  const paper = _examState.paper;
  if (!paper) return;
  const tabs = document.querySelectorAll('.exam-section-tab');
  tabs.forEach((tab, i) => {
    if (!paper.sections[i]) return;
    const sec = paper.sections[i];
    const answered = sec.questions.filter(q => _examState.answers[q.index] !== undefined).length;
    const badge = tab.querySelector('span');
    if (badge) badge.textContent = `(${answered}/${sec.questions.length})`;
  });
}

// ===================== 新题型交互（事件委托） =====================

// 听音选图点击
document.addEventListener('click', (e) => {
  if (_examState.submitted) return;
  const opt = e.target.closest('.exam-option[data-qindex]');
  if (!opt) return;
  const qIdx = parseInt(opt.dataset.qindex);
  const optIdx = parseInt(opt.dataset.optindex);
  _selectOption(qIdx, optIdx);
});

// 听音判断点击
document.addEventListener('click', (e) => {
  if (_examState.submitted) return;
  const btn = e.target.closest('.exam-judge-btn[data-qindex]');
  if (!btn) return;
  const qIdx = parseInt(btn.dataset.qindex);
  const val = btn.dataset.value === 'true';
  _examState.answers[qIdx] = val;
  // 更新按钮高亮
  const container = document.getElementById('examSectionContent');
  if (container) {
    container.querySelectorAll(`.exam-judge-btn[data-qindex="${qIdx}"]`).forEach(b => {
      b.classList.toggle('selected', b.dataset.value === String(val));
    });
  }
  _updateSectionTabCounts();
});

// 连词成句：点击单词池
document.addEventListener('click', (e) => {
  if (_examState.submitted) return;
  const item = e.target.closest('.exam-word-pool-item[data-qindex]');
  if (!item) return;
  const qIdx = parseInt(item.dataset.qindex);
  const wIdx = parseInt(item.dataset.wordidx);
  if (!_examState.answers[qIdx]) _examState.answers[qIdx] = [];
  if (!_examState.answers[qIdx].includes(wIdx)) {
    _examState.answers[qIdx].push(wIdx);
    _renderSection(_examState.currentSection);
    _updateSectionTabCounts();
  }
});

// 连词成句：清空按钮
document.addEventListener('click', (e) => {
  if (_examState.submitted) return;
  const btn = e.target.closest('.exam-clear-btn[data-qindex]');
  if (!btn) return;
  const qIdx = parseInt(btn.dataset.qindex);
  delete _examState.answers[qIdx];
  _renderSection(_examState.currentSection);
  _updateSectionTabCounts();
});

/** 更新答题卡某题的已答/未答状态（不重渲染，避免输入框失焦） */
function _markAnswered(qIdx, answered) {
  const sheetItem = document.querySelector(`#examAnswersheet .exam-sheet-item:nth-child(${qIdx + 1})`);
  if (sheetItem) sheetItem.classList.toggle('answered', !!answered);
}

// 🆕 单词拼写：文本输入（不重渲染，保持焦点）
document.addEventListener('input', (e) => {
  if (_examState.submitted) return;
  const inp = e.target.closest('.exam-spell-input[data-qindex]');
  if (!inp) return;
  const qIdx = parseInt(inp.dataset.qindex);
  const v = inp.value.trim();
  if (v) _examState.answers[qIdx] = inp.value;
  else delete _examState.answers[qIdx];
  _markAnswered(qIdx, !!v);
  _updateSectionTabCounts();
});

// 🆕 完成句子：写入某一空的答案
function _setBlankAnswer(qIdx, blankIdx, val) {
  if (!Array.isArray(_examState.answers[qIdx])) _examState.answers[qIdx] = [];
  _examState.answers[qIdx][blankIdx] = val;
  const arr = _examState.answers[qIdx];
  const anyFilled = arr.some(x => x != null && String(x).trim() !== '');
  if (!anyFilled) delete _examState.answers[qIdx];
  _markAnswered(qIdx, anyFilled);
  _updateSectionTabCounts();
}

// 🆕 完成句子：选词（下拉）
document.addEventListener('change', (e) => {
  if (_examState.submitted) return;
  const sel = e.target.closest('.exam-blank-select[data-qindex]');
  if (!sel) return;
  _setBlankAnswer(parseInt(sel.dataset.qindex), parseInt(sel.dataset.blankidx), sel.value);
});

// 🆕 完成句子：填空（输入）
document.addEventListener('input', (e) => {
  if (_examState.submitted) return;
  const inp = e.target.closest('.exam-blank-input[data-qindex]');
  if (!inp) return;
  _setBlankAnswer(parseInt(inp.dataset.qindex), parseInt(inp.dataset.blankidx), inp.value.trim());
});

// 听力播放按钮（新题型通用）
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.exam-listen-btn[data-qindex]');
  if (!btn) return;
  const qIdx = parseInt(btn.dataset.qindex);
  const paper = _examState.paper;
  if (!paper) return;
  for (const sec of paper.sections) {
    const q = sec.questions.find(q => q.index === qIdx);
    if (q && q.audioFile) {
      _playExamAudio(q.audioFile, btn);
      break;
    }
  }
});


/** 切换题型区 */
function _switchExamSection(idx) {
  _examState.currentSection = idx;
  // 更新 Tab 样式
  document.querySelectorAll('.exam-section-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === idx);
  });
  _renderSection(idx);
  // 滚动到题目区顶部
  const content = document.getElementById('examSectionContent');
  if (content) content.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** 跳转到指定题目 */
function _jumpToQuestion(flatIdx) {
  const paper = _examState.paper;
  if (!paper) return;
  // 找到该题目所在的 section
  for (let i = 0; i < paper.sections.length; i++) {
    const sec = paper.sections[i];
    const start = sec.questions[0] ? sec.questions[0].index : -1;
    const end = sec.questions[sec.questions.length - 1] ? sec.questions[sec.questions.length - 1].index : -1;
    if (start <= flatIdx && flatIdx <= end) {
      _switchExamSection(i);
      // 滚动到具体题目
      setTimeout(() => {
        const el = document.getElementById('examQ' + flatIdx);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
      return;
    }
  }
}

// 暴露全局
window._switchExamSection = _switchExamSection;
window._jumpToQuestion = _jumpToQuestion;

// 考试听力播放状态（自包含，不依赖练习模块的 state.quizQuestions）
let _examListeningAudio = null;
let _examListeningPlaying = false;

/**
 * 播放考试听力音频（自包含引擎：优先预生成 MP3，失败回退浏览器 TTS）
 * ⚠️ 历史 bug：旧实现调用 practice.js 的 playAudioText()，但该函数只读
 *    state.quizQuestions[state.quizIndex]（练习模块当前题），考试时为空 → 听力无声。
 *    现改为直接根据考试题目的 audioFile / audioText 播放。
 */
function _playExamAudio(qIdx) {
  const paper = _examState.paper;
  if (!paper || _examState.submitted) return;

  // 定位题目
  let target = null;
  for (const sec of paper.sections) {
    const q = sec.questions.find(qq => qq.index === qIdx);
    if (q) { target = q; break; }
  }
  if (!target) return;

  const btn = document.querySelector(`.exam-listen-btn[data-qindex="${qIdx}"]`);
  const setBtn = (txt) => { if (btn) btn.innerHTML = txt; };

  // 停掉上一段播放
  if (_examListeningAudio) {
    try { _examListeningAudio.pause(); } catch (e) {}
    _examListeningAudio = null;
  }
  if (typeof stopSpeak === 'function') { try { stopSpeak(); } catch (e) {} }
  _examListeningPlaying = true;

  // 浏览器 TTS 兜底
  const fallbackTTS = () => {
    if (!_examListeningPlaying) return;
    const cleanText = (target.audioText || '')
      .replace(/\bW:/g, 'Woman:')
      .replace(/\bM:/g, 'Man:');
    if (!cleanText || typeof speakBrowser !== 'function') {
      _examListeningPlaying = false;
      setBtn('🔊 播放');
      return;
    }
    setBtn('🔊 播放中');
    speakBrowser(cleanText, {
      onEnd:   () => { _examListeningPlaying = false; setBtn('🔊 重听'); },
      onError: () => { _examListeningPlaying = false; setBtn('🔊 播放'); }
    });
  };

  setBtn('⏳ 加载中');

  // 优先播放预生成 MP3（与练习模块一致：audio/ + audioFile）
  if (target.audioFile) {
    const audio = new Audio('audio/' + target.audioFile);
    _examListeningAudio = audio;
    let started = false;
    audio.onplaying = () => { started = true; setBtn('🔊 播放中'); };
    audio.onended   = () => { _examListeningPlaying = false; setBtn('🔊 重听'); };
    audio.onerror   = () => { if (!started) fallbackTTS(); };
    const p = audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => { if (!started) fallbackTTS(); });
    }
  } else {
    fallbackTTS();
  }
}


// ===================== 倒计时显示 =====================

function _updateTimerDisplay() {
  const el = document.getElementById('examTimerText');
  const timer = document.getElementById('examTimer');
  if (el) el.textContent = _fmtTime(Math.max(0, _examState.timeLeft));
  // 时间不足5分钟时变红
  if (timer) {
    if (_examState.timeLeft <= 300) {
      timer.classList.add('exam-timer-warning');
    } else {
      timer.classList.remove('exam-timer-warning');
    }
  }
}


// ===================== 交卷 & 判分 =====================

function _submitExam(autoSubmit) {
  if (_examState.submitted) return;
  if (!autoSubmit && !confirm('确定交卷吗？未答完的题目将计为错误。')) return;

  _examState.submitted = true;
  if (_examState.timerId) { clearInterval(_examState.timerId); _examState.timerId = null; }

  // 收集写作文本
  const textarea = document.getElementById('examWritingArea');
  if (textarea) _examState.writingText = textarea.value;

  _gradeExam();
}

window._submitExam = _submitExam;


/**
 * 作文本地启发式自动评分。
 * 评分阶梯（按满分 maxPoints 拆分，默认 30）：
 *   内容(切题) 60% → 切题且字数达标即给满（保底）
 *   语法       20% → 句首大写、句末标点等无明显错误即给满
 *   文笔       20% → 词汇丰富、连接词、高级词汇 → 酌情加分，优可满分
 */
function _gradeWriting(text, q, maxPoints) {
  maxPoints = maxPoints || 30;
  const CMAX = Math.round(maxPoints * 0.6 * 10) / 10; // 内容（切题）保底分
  const GMAX = Math.round(maxPoints * 0.2 * 10) / 10; // 语法
  const SMAX = Math.round((maxPoints - CMAX - GMAX) * 10) / 10; // 文笔
  const comments = [];
  text = (text || '').trim();

  const words = (text.toLowerCase().match(/[a-z']+/g) || []);
  const wordCount = words.length;

  if (wordCount < 10) {
    comments.push('作文内容过少（不足 10 个单词），未能进入评分。');
    return {
      score: 0, max: maxPoints,
      content: 0, grammar: 0, style: 0,
      contentMax: CMAX, grammarMax: GMAX, styleMax: SMAX,
      wordCount: wordCount, targetWords: 0, comments: comments
    };
  }

  // 目标词数：优先用范文词数，其次从题目提取数字，默认 60
  let target = 60;
  const model = (q && q.modelAnswer) || '';
  const modelWords = (model.toLowerCase().match(/[a-z']+/g) || []);
  if (modelWords.length >= 20) {
    target = modelWords.length;
  } else {
    const m = ((q && q.prompt) || '').match(/(\d+)\s*(词|字|words?)/i);
    if (m) target = parseInt(m[1], 10);
  }
  if (!target || target < 30) target = 60;

  const userSet = new Set(words);

  // ---- 内容（切题）----
  const wordRatio = Math.min(1, wordCount / target);
  const modelKeys = Array.from(new Set(modelWords.filter(w => w.length >= 4)));
  let hit = 0;
  for (const k of modelKeys) if (userSet.has(k)) hit++;
  const kwScore = modelKeys.length > 0 ? hit / modelKeys.length : wordRatio;

  let contentRatio = wordRatio * 0.6 + kwScore * 0.4;
  if (wordRatio >= 0.7 && kwScore >= 0.25) {
    contentRatio = 1; // 切题且字数达标 → 内容保底满分
    comments.push('内容切题、字数达标，内容分给满。');
  } else if (wordRatio < 0.5) {
    comments.push('字数偏少（约 ' + wordCount + '/' + target + ' 词），内容分受影响。');
  } else {
    comments.push('内容基本切题，可进一步贴合题目要点。');
  }
  const content = Math.round(contentRatio * CMAX * 10) / 10;

  // ---- 语法 ----
  let grammarRatio = 1;
  const sentences = text.split(/[.!?。！？]+/).map(s => s.trim()).filter(s => s.length > 0);
  let capOk = 0, capTotal = 0;
  for (const s of sentences) {
    const first = s.charAt(0);
    if (/[a-zA-Z]/.test(first)) {
      capTotal++;
      if (first === first.toUpperCase()) capOk++;
    }
  }
  if (capTotal > 0 && capOk / capTotal < 0.6) {
    grammarRatio -= 0.4;
    comments.push('部分句子句首未大写，注意大小写规范。');
  }
  if (!/[.!?。！？]\s*$/.test(text)) {
    grammarRatio -= 0.2;
    comments.push('结尾缺少句末标点。');
  }
  if (sentences.length === 0) grammarRatio -= 0.3;
  if (grammarRatio < 0) grammarRatio = 0;
  if (grammarRatio >= 1) comments.push('语法与书写规范良好，语法分给满。');
  const grammar = Math.round(grammarRatio * GMAX * 10) / 10;

  // ---- 文笔 ----
  let styleRatio = 0;
  const richness = new Set(words).size / wordCount; // 词汇丰富度
  styleRatio += Math.min(0.4, richness * 0.6);
  const connectors = ['because', 'however', 'therefore', 'although', 'moreover', 'besides', 'finally', 'firstly', 'secondly', 'meanwhile', 'while', 'though', 'so', 'then', 'also', 'and', 'but'];
  let connHit = 0;
  for (const c of connectors) if (userSet.has(c)) connHit++;
  styleRatio += Math.min(0.4, connHit * 0.1);
  const longWords = words.filter(w => w.length >= 7).length;
  styleRatio += Math.min(0.2, longWords / wordCount * 2);
  if (styleRatio > 1) styleRatio = 1;
  if (styleRatio >= 0.8) comments.push('用词丰富、表达流畅，文笔加分。');
  else comments.push('可尝试使用更多连接词与高级词汇提升文采。');
  const style = Math.round(styleRatio * SMAX * 10) / 10;

  let score = Math.round((content + grammar + style) * 10) / 10;
  if (score > maxPoints) score = maxPoints;

  return {
    score: score, max: maxPoints,
    content: content, grammar: grammar, style: style,
    contentMax: CMAX, grammarMax: GMAX, styleMax: SMAX,
    wordCount: wordCount, targetWords: target, comments: comments
  };
}
window._gradeWriting = _gradeWriting;

// 🆕 补全对话渲染 (P6-A)：对话 + 每空下拉选择
function _renderDialogCompleteHTML(q, sectionIdx) {
  var dia = q.dialogue || q.original.dialogue || [];
  var blanks = q.blanks || q.original.blanks || [];
  var html = '<div class="exam-dialog bg-sky-50 border border-sky-200 rounded-xl p-4 mb-4"><div class="text-xs text-sky-600 font-semibold mb-3">' + (q.title || q.original.title || '补全对话') + '</div>';
  for (var li = 0; li < dia.length; li++) {
    var line = dia[li];
    var text = line.text;
    var speaker = line.speaker || '';
    // 替换 ___N___ 为下拉选择
    var rendered = text.replace(/___(\d+)___/g, function(match, num) {
      var b = null;
      for (var bi = 0; bi < blanks.length; bi++) { if (blanks[bi].pos === parseInt(num)) { b = blanks[bi]; break; } }
      if (!b) return match;
      var opts = b.options || [];
      var optionsHtml = '';
      for (var oi = 0; oi < opts.length; oi++) {
        optionsHtml += '<option value="' + opts[oi] + '">' + opts[oi] + '</option>';
      }
      return '<select class="exam-dialog-select exam-qselect" data-qindex="' + q.index + '" data-blankpos="' + num + '"><option value="">--</option>' + optionsHtml + '</select>';
    });
    html += '<div class="exam-dialog-line"><span class="exam-dialog-speaker">' + speaker + ':</span> <span class="exam-dialog-text">' + rendered + '</span></div>';
  }
  html += '</div>';
  return html;
}
window._renderDialogCompleteHTML = _renderDialogCompleteHTML;

// 🆕 句型转换渲染 (P6-B)：原句 + 转换要求 + 文本输入框（复用 spelling 输入机制）
function _renderSentenceTransformHTML(q) {
  const cur = _examState.answers[q.index] || '';
  const orig = q.originalSentence || (q.original && q.original.original) || '';
  const target = q.target || (q.original && q.original.target) || '';
  return `<div class="exam-question" id="examQ${q.index}">
    <div class="exam-q-num">${q.index + 1}. <span class="exam-transform-orig">${escapeHtml(orig)}</span>
      <span class="exam-transform-target">（${escapeHtml(target)}）</span>
    </div>
    <div class="exam-spell-wrap">
      <input type="text" class="exam-spell-input" data-qindex="${q.index}"
             value="${escapeHtml(cur)}" placeholder="在此输入改写后的句子..." autocomplete="off"
             autocapitalize="off" spellcheck="false" />
    </div>
  </div>`;
}
window._renderSentenceTransformHTML = _renderSentenceTransformHTML;

// 🆕 匹配题渲染 (P6-D1)：左问句 + 右下拉选答句（复用 exam-dialog-select 事件收集）
function _renderMatchingHTML(q) {
  var pairs = q.pairs || (q.original && q.original.pairs) || [];
  var opts = q.answerOptions || pairs.map(function(p){ return p.a; });
  var optionsHtml = '<option value="">--</option>';
  for (var oi = 0; oi < opts.length; oi++) {
    optionsHtml += '<option value="' + escapeHtml(opts[oi]) + '">' + escapeHtml(opts[oi]) + '</option>';
  }
  var html = '<div class="exam-matching bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">';
  for (var i = 0; i < pairs.length; i++) {
    html += '<div class="exam-matching-row">'
      + '<span class="exam-matching-q">' + (i + 1) + '. ' + escapeHtml(pairs[i].q) + '</span>'
      + '<select class="exam-dialog-select exam-matching-select" data-qindex="' + q.index + '" data-blankpos="' + (i + 1) + '">' + optionsHtml + '</select>'
      + '</div>';
  }
  html += '</div>';
  return html;
}
window._renderMatchingHTML = _renderMatchingHTML;

// 🆕 补全短文渲染 (P6-D2)：短文含 ___n___ + 词池提示 + 每空下拉选词
function _renderClozePassageHTML(q) {
  var passage = q.passage || (q.original && q.original.passage) || '';
  var blanks = q.blanks || (q.original && q.original.blanks) || [];
  var bank = q.wordbank || (q.original && q.original.wordbank) || [];
  // 词池提示
  var bankHtml = bank.length ? ('<div class="exam-clozep-bank">' + bank.map(function(w){ return '<span class="exam-clozep-word">' + escapeHtml(w) + '</span>'; }).join('') + '</div>') : '';
  // 选项统一用词池（无则用各空 answer 汇总）
  var opts = bank.length ? bank : blanks.map(function(b){ return b.answer; });
  var optionsHtml = '<option value="">--</option>';
  for (var oi = 0; oi < opts.length; oi++) {
    optionsHtml += '<option value="' + escapeHtml(opts[oi]) + '">' + escapeHtml(opts[oi]) + '</option>';
  }
  // 替换 ___n___ 为下拉
  var rendered = String(passage).replace(/___(\d+)___/g, function(_m, num) {
    return '<select class="exam-dialog-select exam-clozep-select" data-qindex="' + q.index + '" data-blankpos="' + num + '">' + optionsHtml + '</select>';
  });
  return '<div class="exam-clozep bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">'
    + bankHtml
    + '<div class="exam-clozep-passage">' + rendered + '</div>'
    + '</div>';
}
window._renderClozePassageHTML = _renderClozePassageHTML;


function _gradeExam() {
  const paper = _examState.paper;
  if (!paper) return;

  let totalCorrect = 0;
  let totalAutoPoints = 0;
  let totalMaxPoints = 0;
  let writingScore = 0;
  let maxWritingScore = 0;
  let writingDetail = null;
  const sectionResults = [];

  for (const sec of paper.sections) {
    const secMaxPoints = sec.totalPoints || 0;

    // 写作：本地启发式自动判分（切题保底 → 语法 → 文笔）
    if (sec.type === 'writing') {
      const wq = (sec.questions && sec.questions[0]) || {};
      const wmax = secMaxPoints || 30;
      const detail = _gradeWriting(_examState.writingText || '', wq, wmax);
      writingDetail = detail;
      writingScore = detail.score;
      maxWritingScore = wmax;
      sectionResults.push({
        type: 'writing',
        title: sec.title || _typeLabel('writing'),
        correct: 0,
        total: 0,
        points: detail.score,
        maxPoints: wmax,
        writing: detail
      });
      totalAutoPoints += detail.score;
      totalMaxPoints += wmax;
      continue;
    }

    let secCorrect = 0;
    let secPoints = 0;

    for (const q of sec.questions) {
      const userAnswer = _examState.answers[q.index];
      let isCorrect = false;
      let qPoints = 0;
      // cloze 段：题级 pointsPer 优先（最后 1 空兜底凑齐总分，与段级默认略不同）
      const pp = (q.pointsPer != null) ? q.pointsPer : (sec.pointsPer || 0);

      // listen_judge：answer 是 true/false，userAnswer 也是 true/false
      if (q.type === 'listen_judge' || sec.type === 'listen_judge') {
        isCorrect = (userAnswer !== undefined && userAnswer === q.answer);
        if (isCorrect) qPoints = pp;
      }
      // 🆕 单词拼写：answer 是英文单词，userAnswer 是输入文本（忽略大小写/空格）
      else if (sec.type === 'spelling') {
        const ansN = _normText(q.answer);
        isCorrect = (userAnswer !== undefined && ansN !== '' && _normText(userAnswer) === ansN);
        if (isCorrect) qPoints = pp;
      }
      // 🆕 连词成句：新规范 answer=正确句子字符串；兼容旧规范 answer=索引数组
      else if (q.type === 'sentence_order' || sec.type === 'sentence_order') {
        const words = q.words || [];
        const ua = Array.isArray(userAnswer) ? userAnswer : [];
        if (Array.isArray(q.answer)) {
          isCorrect = (q.answer.length === ua.length && q.answer.every((v, i) => v === ua[i]));
        } else {
          const userSent = ua.map(i => words[i]).join(' ');
          isCorrect = (ua.length === words.length && _normText(userSent) === _normText(q.answer));
        }
        if (isCorrect) qPoints = pp;
      }
      // 🆕 完成句子：blanks 逐空比对，按空给分
      else if (sec.type === 'blank_fill') {
        const blanks = q.blanks || [];
        const ua = Array.isArray(userAnswer) ? userAnswer : [];
        let correctBlanks = 0;
        for (let i = 0; i < blanks.length; i++) {
          const bAns = _normText(blanks[i].answer);
          if (bAns !== '' && _normText(ua[i]) === bAns) correctBlanks++;
        }
        isCorrect = (blanks.length > 0 && correctBlanks === blanks.length);
        qPoints = blanks.length > 0 ? Math.round(pp * correctBlanks / blanks.length * 10) / 10 : 0;
      }
      // 🆕 句型转换：用户输入标准化后与 answers 中任一匹配即算对
      else if (sec.type === 'sentence_transform') {
        const accept = (q.answers && q.answers.length ? q.answers : [q.answer]).filter(Boolean);
        const ua = _normText(userAnswer);
        isCorrect = (ua !== '' && accept.some(a => _normText(a) === ua));
        if (isCorrect) qPoints = pp;
      }
      // 🆕 补全对话：blanks逐空比对，按空给分
      else if (sec.type === 'dialog_complete') {
        var diaBlanks = q.blanks || (q.original && q.original.blanks) || [];
        var ua = Array.isArray(userAnswer) ? userAnswer : [];
        var correctBlanks = 0;
        for (var bi = 0; bi < diaBlanks.length; bi++) {
          var bAns = diaBlanks[bi].answer;
          if (bAns && ua[bi] === bAns) correctBlanks++;
        }
        isCorrect = (diaBlanks.length > 0 && correctBlanks === diaBlanks.length);
        qPoints = diaBlanks.length > 0 ? Math.round(pp * correctBlanks / diaBlanks.length * 10) / 10 : 0;
      }
      // 🆕 匹配题：每个问句选对答句，按对数给分
      else if (sec.type === 'matching') {
        var mPairs = q.pairs || (q.original && q.original.pairs) || [];
        var mUa = Array.isArray(userAnswer) ? userAnswer : [];
        var mCorrect = 0;
        for (var mi = 0; mi < mPairs.length; mi++) {
          if (mUa[mi] && _normText(mUa[mi]) === _normText(mPairs[mi].a)) mCorrect++;
        }
        isCorrect = (mPairs.length > 0 && mCorrect === mPairs.length);
        qPoints = mPairs.length > 0 ? Math.round(pp * mCorrect / mPairs.length * 10) / 10 : 0;
      }
      // 🆕 补全短文：每空选对词，按空给分
      else if (sec.type === 'cloze_passage') {
        var cpBlanks = q.blanks || (q.original && q.original.blanks) || [];
        var cpUa = Array.isArray(userAnswer) ? userAnswer : [];
        var cpCorrect = 0;
        for (var ci = 0; ci < cpBlanks.length; ci++) {
          if (cpUa[ci] && _normText(cpUa[ci]) === _normText(cpBlanks[ci].answer)) cpCorrect++;
        }
        isCorrect = (cpBlanks.length > 0 && cpCorrect === cpBlanks.length);
        qPoints = cpBlanks.length > 0 ? Math.round(pp * cpCorrect / cpBlanks.length * 10) / 10 : 0;
      }
      // 通用单选：answer 是选项索引
      else {
        isCorrect = (userAnswer !== undefined && userAnswer === q.answer);
        if (isCorrect) qPoints = pp;
      }
      if (isCorrect) secCorrect++;
      secPoints += qPoints;
      // 错题本与掌握度共用同一题目快照，保证 key 一致。
      let trackedQuestion = q.original || q;
      // 完形必须按当前空保存，而不是每个空反复写入同一篇原题；否则会碰撞、互相抵消且无法重练。
      if (sec.type === 'cloze' && q.original && q.blankPos != null) {
        trackedQuestion = {
          grade: q.original.grade, term: q.original.term,
          code: String(q.original.code || '') + '#' + q.blankPos,
          q: q.q || ('第 ' + q.blankPos + ' 空'), options: q.options || [], answer: q.answer,
          explain: q.explain || '', difficulty: q.original.difficulty || 2,
          _clozeContext: {
            passageCode: q.original.code || '', passage: q.original.passage || '',
            topic: q.original.topic || '', currentBlankPos: q.blankPos,
            totalBlanks: (q.original.blanks || []).length
          }
        };
      }
      // 记录到错题本（🆕 P2-C：cloze 错题归 cloze 类，不再 mapping 到 grammar）
      try {
        if (typeof recordAnswer === 'function') recordAnswer(sec.type, trackedQuestion, isCorrect);
      } catch (e) { /* 静默 */ }
      // 记录掌握度
      try {
        if (typeof recordMastery === 'function') recordMastery(sec.type, trackedQuestion, isCorrect);
      } catch (e) { /* 静默 */ }
      // 记录统计
      try {
        if (typeof recordAnswerStats === 'function') {
          recordAnswerStats(isCorrect, sec.type);
        }
      } catch (e) { /* 静默 */ }
    }

    // Round points
    secPoints = Math.round(secPoints * 10) / 10;
    sectionResults.push({
      type: sec.type,
      title: sec.title || _typeLabel(sec.type),
      correct: secCorrect,
      total: sec.questions.length,
      points: secPoints,
      maxPoints: secMaxPoints
    });
    totalCorrect += secCorrect;
    totalAutoPoints += secPoints;
    totalMaxPoints += secMaxPoints;
  }

  totalAutoPoints = Math.round(totalAutoPoints * 10) / 10;
  totalMaxPoints = Math.round(totalMaxPoints * 10) / 10;

  // 保存历史
  const result = {
    examKey: paper.grade + '_' + paper.term + '_' + paper.id,
    name: paper.name,
    grade: paper.grade,
    term: paper.term,
    autoScore: totalAutoPoints,
    maxAutoScore: totalMaxPoints,
    totalScore: totalAutoPoints,
    writingScore: writingScore,
    maxWritingScore: maxWritingScore,
    writingDetail: writingDetail,
    totalCorrect: totalCorrect,
    totalQuestions: paper.totalQuestions,
    sections: sectionResults,
    writingText: _examState.writingText || '',
    timeUsed: _examState.totalTime - _examState.timeLeft,
    date: new Date().toISOString()
  };
  _saveHistory(result);

  _renderResult(result);
}


// ===================== 成绩报告 =====================

function _renderResult(result) {
  const el = document.getElementById('examView');
  if (!el) return;
  const paper = _examState.paper;

  const pct = result.maxAutoScore > 0 ? Math.round(result.autoScore / result.maxAutoScore * 100) : 0;
  let emoji = '🎉';
  if (pct >= 90) emoji = '🏆';
  else if (pct >= 80) emoji = '🌟';
  else if (pct >= 60) emoji = '👍';
  else emoji = '💪';

  // 各题型得分柱状图
  let sectionBars = result.sections.map(sec => {
    const secPct = sec.maxPoints > 0 ? Math.round(sec.points / sec.maxPoints * 100) : 0;
    const barColor = secPct >= 80 ? 'bg-green-500' : secPct >= 60 ? 'bg-yellow-500' : 'bg-red-500';
    return `<div class="mb-2">
      <div class="flex justify-between text-xs mb-1">
        <span>${_typeIcon(sec.type)} ${sec.title}</span>
        <span class="font-semibold">${sec.points} / ${sec.maxPoints} 分</span>
      </div>
      <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div class="h-full ${barColor} rounded-full transition-all" style="width:${secPct}%"></div>
      </div>
    </div>`;
  }).join('');

  // 错题回顾
  let wrongReviewHtml = '';
  if (paper) {
    for (const sec of paper.sections) {
      if (sec.type === 'writing') continue;
      for (const q of sec.questions) {
        const userAnswer = _examState.answers[q.index];
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        let isCorrect, userLabel, correctLabel, stem;

        if (sec.type === 'spelling') {
          const ansN = _normText(q.answer);
          isCorrect = (userAnswer !== undefined && ansN !== '' && _normText(userAnswer) === ansN);
          userLabel = (userAnswer && String(userAnswer).trim()) ? escapeHtml(userAnswer) : '未作答';
          correctLabel = escapeHtml(q.answer || '');
          stem = escapeHtml(q.q || '');
        } else if (q.type === 'sentence_order' || sec.type === 'sentence_order') {
          const words = q.words || [];
          const ua = Array.isArray(userAnswer) ? userAnswer : [];
          const userSent = ua.map(i => words[i]).join(' ');
          const correctSent = Array.isArray(q.answer) ? q.answer.map(i => words[i]).join(' ') : (q.answer || '');
          isCorrect = (ua.length === words.length && _normText(userSent) === _normText(correctSent));
          userLabel = userSent ? escapeHtml(userSent) : '未作答';
          correctLabel = escapeHtml(correctSent);
          stem = escapeHtml(q.q || '连词成句');
        } else if (sec.type === 'blank_fill') {
          const blanks = q.blanks || [];
          const ua = Array.isArray(userAnswer) ? userAnswer : [];
          let ok = blanks.length > 0;
          for (let i = 0; i < blanks.length; i++) {
            if (_normText(ua[i]) !== _normText(blanks[i].answer)) ok = false;
          }
          isCorrect = ok;
          userLabel = ua.length ? escapeHtml(ua.map(x => (x && String(x).trim()) ? x : '＿').join(' / ')) : '未作答';
          correctLabel = escapeHtml(blanks.map(b => b.answer).join(' / '));
          stem = escapeHtml(q.passage || '完成句子');
        } else if (sec.type === 'sentence_transform') {
          const accept = (q.answers && q.answers.length ? q.answers : [q.answer]).filter(Boolean);
          const ua = _normText(userAnswer);
          isCorrect = (ua !== '' && accept.some(a => _normText(a) === ua));
          userLabel = (userAnswer && String(userAnswer).trim()) ? escapeHtml(userAnswer) : '未作答';
          correctLabel = escapeHtml((q.answers && q.answers.length ? q.answers : [q.answer]).filter(Boolean).join(' / '));
          stem = escapeHtml((q.originalSentence || (q.original && q.original.original) || '') + '（' + (q.target || (q.original && q.original.target) || '') + '）');
        } else if (q.type === 'listen_judge' || sec.type === 'listen_judge') {
          isCorrect = (userAnswer !== undefined && userAnswer === q.answer);
          userLabel = userAnswer === undefined ? '未作答' : (userAnswer ? 'True' : 'False');
          correctLabel = q.answer ? 'True' : 'False';
          stem = escapeHtml(q.statement || q.q || '');
        } else {
          isCorrect = (userAnswer !== undefined && userAnswer === q.answer);
          userLabel = userAnswer !== undefined ? (labels[userAnswer] || userAnswer) : '未作答';
          correctLabel = labels[q.answer] || q.answer;
          stem = escapeHtml(q.q || '');
        }

        if (!isCorrect) {
          wrongReviewHtml += `<div class="exam-wrong-item">
            <div class="font-semibold text-slate-700 text-sm">${q.index + 1}. ${stem}</div>
            <div class="text-xs mt-1">
              <span class="text-red-600">你的答案：${userLabel}</span>
              <span class="mx-2">→</span>
              <span class="text-green-600">正确答案：${correctLabel}</span>
            </div>
            ${q.explain ? `<div class="text-xs text-slate-500 mt-1">💡 ${escapeHtml(q.explain)}</div>` : ''}
          </div>`;
        }
      }
    }
  }

  // 作文自动评分卡
  let writingGradeHtml = '';
  const wd = result.writingDetail;
  if (wd) {
    const wbar = (label, val, mx) => {
      const p = mx > 0 ? Math.round(val / mx * 100) : 0;
      const color = p >= 80 ? 'bg-green-500' : p >= 50 ? 'bg-yellow-500' : 'bg-red-500';
      return `<div class="mb-2">
        <div class="flex justify-between text-xs mb-1">
          <span>${label}</span><span class="font-semibold">${val} / ${mx} 分</span>
        </div>
        <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full ${color} rounded-full transition-all" style="width:${p}%"></div>
        </div>
      </div>`;
    };
    const commentsHtml = (wd.comments || []).map(c => `<li>${escapeHtml(c)}</li>`).join('');
    writingGradeHtml = `
      <div class="card p-5 mb-4 exam-writing-grade">
        <div class="ewg-head">
          <h3 class="font-bold text-slate-700">✍️ 作文自动评分</h3>
          <div class="ewg-score">${result.writingScore}<span class="ewg-score-max"> / ${result.maxWritingScore} 分</span></div>
        </div>
        <div class="ewg-bars mt-3">
          ${wbar('📌 内容（切题）', wd.content, wd.contentMax)}
          ${wbar('📐 语法', wd.grammar, wd.grammarMax)}
          ${wbar('✒️ 文笔', wd.style, wd.styleMax)}
        </div>
        <div class="ewg-meta text-xs text-slate-500 mt-2">字数：${wd.wordCount} 词${wd.targetWords ? `（参考 ${wd.targetWords} 词）` : ''}</div>
        ${commentsHtml ? `<ul class="ewg-comments text-xs text-slate-600 mt-2">${commentsHtml}</ul>` : ''}
        <div class="text-[11px] text-slate-400 mt-2">※ 作文为本地启发式评分，仅供参考，请以老师评阅为准。</div>
      </div>`;
  }

  el.innerHTML = `
    <div class="exam-result-container">
      <h2 class="text-xl font-bold text-slate-800 mb-4">📊 考试成绩报告</h2>

      <!-- 总分卡 -->
      <div class="card p-6 text-center mb-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div class="text-5xl mb-2">${emoji}</div>
        <div class="text-4xl font-bold text-blue-600">${result.autoScore}<span class="text-lg text-slate-400 font-normal"> / ${result.maxAutoScore}</span></div>
        <div class="text-sm text-slate-500 mt-1">自动判分部分 · ${result.name}</div>
        <div class="flex justify-center gap-6 mt-3 text-sm">
          <span>✅ 正确 ${result.totalCorrect} 题</span>
          <span>❌ 错误 ${result.totalQuestions - result.totalCorrect} 题</span>
          <span>⏱ ${_fmtTime(result.timeUsed || 0)}</span>
        </div>
      </div>

      <!-- 各题型分析 -->
      <div class="card p-5 mb-4">
        <h3 class="font-bold text-slate-700 mb-3">📈 各题型得分率</h3>
        ${sectionBars}
      </div>

      <!-- 作文自动评分 -->
      ${writingGradeHtml}

      <!-- 写作范文 -->
      ${paper && paper.sections.find(s => s.type === 'writing') ? `
      <div class="card p-5 mb-4">
        <h3 class="font-bold text-slate-700 mb-3">✍️ 写作题目 & 范文参考</h3>
        <div class="text-sm text-slate-600 mb-3 p-3 bg-amber-50 rounded-lg">
          ${escapeHtml(paper.sections.find(s => s.type === 'writing').questions[0]?.prompt || '')}
        </div>
        <div class="text-sm text-slate-500 mb-2">📝 你的作答：</div>
        <div class="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap mb-3 min-h-[60px]">
          ${escapeHtml(result.writingText || '（未作答）')}
        </div>
        <div class="text-sm text-slate-500 mb-2">🌟 范文参考：</div>
        <div class="p-3 bg-green-50 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
          ${escapeHtml(paper.sections.find(s => s.type === 'writing').questions[0]?.modelAnswer || '')}
        </div>
      </div>
      ` : ''}

      <!-- 错题回顾 -->
      ${wrongReviewHtml ? `
      <div class="card p-5 mb-4">
        <h3 class="font-bold text-slate-700 mb-3">🩹 错题回顾（共 ${result.totalQuestions - result.totalCorrect} 题）</h3>
        ${wrongReviewHtml}
        <div class="mt-3 text-sm text-slate-500">💡 错题已自动加入错题本，可在错题本页面重练</div>
      </div>
      ` : '<div class="card p-5 text-center text-green-600 font-bold">🎉 全部正确！太棒了！</div>'}

      <!-- 操作按钮 -->
      <div class="flex gap-3 flex-wrap">
        <button class="gradient-btn" onclick="renderExamPage()">📋 返回试卷列表</button>
        <button class="px-6 py-2 rounded-xl bg-orange-100 text-orange-700 font-semibold hover:bg-orange-200 transition"
          onclick="switchPage('wrongbook')">🩹 查看错题本</button>
      </div>
    </div>
  `;
}


// ===================== 考试历史 =====================

function _loadHistory() {
  try {
    const raw = localStorage.getItem(_pkey('yxyy_exam_history'));
    _examState.history = raw ? JSON.parse(raw) : [];
  } catch (e) {
    _examState.history = [];
  }
}

function _saveHistory(result) {
  _loadHistory();
  _examState.history.unshift(result);
  // 只保留最近 50 条
  if (_examState.history.length > 50) _examState.history = _examState.history.slice(0, 50);
  try {
    localStorage.setItem(_pkey('yxyy_exam_history'), JSON.stringify(_examState.history));
  } catch (e) { /* ignore */ }
  // Phase3 云同步：考试历史写后节流推送云端（未登录时 no-op）
  try { if (window.CloudSync) window.CloudSync.schedulePush('yxyy_exam_history'); } catch (e) {}
}

function _renderHistory() {
  const wrap = document.getElementById('examHistoryWrap');
  if (!wrap) return;
  _loadHistory();
  if (_examState.history.length === 0) {
    wrap.innerHTML = '<div class="text-sm text-slate-400 mt-4">暂无考试记录</div>';
    return;
  }

  const recent = _examState.history.slice(0, 5);
  let html = '<h3 class="font-bold text-slate-700 mt-6 mb-3">📜 最近考试记录</h3>';
  for (const h of recent) {
    const dateStr = h.date ? new Date(h.date).toLocaleDateString('zh-CN') : '';
    const pct = h.maxAutoScore > 0 ? Math.round(h.autoScore / h.maxAutoScore * 100) : 0;
    html += `<div class="card p-3 mb-2 flex items-center justify-between text-sm">
      <div>
        <span class="font-semibold">${h.name || '考试'}</span>
        <span class="text-slate-400 ml-2">${dateStr}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-bold text-blue-600">${h.autoScore}分</span>
        <span class="text-xs text-slate-400">正确${h.totalCorrect}/${h.totalQuestions}</span>
        <span class="text-xs px-2 py-0.5 rounded-full ${pct >= 80 ? 'bg-green-100 text-green-700' : pct >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">${pct}%</span>
      </div>
    </div>`;
  }
  wrap.innerHTML = html;
}

// 导出一个获取最近考试成绩的接口（供首页数据用）
function getLatestExamScore() {
  _loadHistory();
  if (_examState.history.length === 0) return null;
  return _examState.history[0];
}
window.getLatestExamScore = getLatestExamScore;