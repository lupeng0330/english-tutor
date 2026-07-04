// ============ 题库加载器 ============
// 按教材 id 动态从 data/questions/ 下加载 4 份题库 JSON
// 调用：window.loadQuestionBank('jk').then(() => { ... })
(function() {
  // 初始化空题库，等加载
  window.questionBank = {
    spelling: [],
    listening: [],
    grammar: [],
    reading: [],
    cloze: [],  // 🆕 完形填空（P2-C）
    // 阶段 2 新题型（批次 1）
    listen_pic: [],
    listen_judge: [],
    listen_fill: [],
    blank_fill: [],
    sentence_transform: [],
    sentence_order: [],
    writing: [],  // 🆕 书面表达（P6-C）
    dialog_complete: [],  // 🆕 补全对话（P6-A）
    stats: { spelling: 0, listening: 0, grammar: 0, reading: 0, cloze: 0,
           listen_pic: 0, listen_judge: 0, listen_fill: 0,
           blank_fill: 0, sentence_transform: 0, sentence_order: 0,
           writing: 0, dialog_complete: 0, total: 0 }
  };

  window.loadQuestionBank = async function(textbookId) {
    textbookId = textbookId || 'jk';
    const base = 'data/questions/' + textbookId + '_';
    const types = ['spelling', 'listening', 'grammar', 'reading', 'cloze',
                   'listen_pic', 'listen_judge', 'listen_fill',
                   'blank_fill', 'sentence_transform', 'sentence_order', 'writing', 'dialog_complete'];
    const results = {};
    for (const t of types) {
      try {
        const raw = base + t + '.json';
        const url = (typeof window !== 'undefined' && typeof window.__withVer === 'function')
          ? window.__withVer(raw)
          : (raw + '?t=' + Date.now());
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        results[t] = await res.json();
      } catch (err) {
        // 新题型 404 是正常的（还没填充题目），降到 debug
        if (['listen_pic','listen_judge','listen_fill',
            'blank_fill','sentence_transform','sentence_order','writing','dialog_complete'].includes(t)) {
          console.debug('[题库] 新题型未配置（正常）:', base + t + '.json');
        } else if (t === 'cloze') {
          console.debug('[题库] cloze 未配置（正常）:', base + t + '.json');
        } else {
          console.warn('[题库] 加载失败:', base + t + '.json', err);
        }
        results[t] = [];
      }
    }
    // 合并到 window.questionBank
    window.questionBank.spelling  = results.spelling;
    window.questionBank.listening = results.listening;
    window.questionBank.grammar   = results.grammar;
    window.questionBank.reading   = results.reading;
    window.questionBank.cloze     = results.cloze;
    window.questionBank.listen_pic = results.listen_pic || [];
    window.questionBank.listen_judge = results.listen_judge || [];
    window.questionBank.listen_fill = results.listen_fill || [];
    window.questionBank.blank_fill = results.blank_fill || [];
    window.questionBank.sentence_transform = results.sentence_transform || [];
    window.questionBank.sentence_order = results.sentence_order || [];
    window.questionBank.writing = results.writing || [];
    window.questionBank.dialog_complete = results.dialog_complete || [];
    window.questionBank.stats = {
      spelling:  results.spelling.length,
      listening: results.listening.length,
      grammar:   results.grammar.length,
      reading:   results.reading.length,
      cloze:     results.cloze.length,
      listen_pic: results.listen_pic.length,
      listen_judge: results.listen_judge.length,
      listen_fill: results.listen_fill.length,
      blank_fill: results.blank_fill.length,
      sentence_transform: results.sentence_transform.length,
      sentence_order: results.sentence_order.length,
      writing:   (results.writing || []).length,
      dialog_complete: (results.dialog_complete || []).length,
      total:     results.spelling.length + results.listening.length +
                 results.grammar.length + results.reading.length + results.cloze.length +
                 results.listen_pic.length + results.listen_judge.length + results.listen_fill.length +
                 results.blank_fill.length + results.sentence_transform.length + results.sentence_order.length +
                 (results.writing || []).length + (results.dialog_complete || []).length
    };
    console.log(
      '[题库] 加载完成 (' + textbookId + '): 单词' + window.questionBank.stats.spelling +
      ' · 听力' + window.questionBank.stats.listening +
      ' · 语法' + window.questionBank.stats.grammar +
      ' · 阅读' + window.questionBank.stats.reading +
      ' · 完形' + window.questionBank.stats.cloze +
      ' · 新题型(' + window.questionBank.stats.listen_pic + '/' +
      window.questionBank.stats.listen_judge + '/' + window.questionBank.stats.listen_fill + '/' +
      window.questionBank.stats.blank_fill + '/' + window.questionBank.stats.sentence_transform + '/' +
      window.questionBank.stats.sentence_order + ')' +
      ' · 写作' + window.questionBank.stats.writing +
      ' · 对话' + window.questionBank.stats.dialog_complete +
      ' · 共' + window.questionBank.stats.total + '题'
    );
    return window.questionBank;
  };
})();
