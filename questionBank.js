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
    stats: { spelling: 0, listening: 0, grammar: 0, reading: 0, cloze: 0, total: 0 }
  };

  window.loadQuestionBank = async function(textbookId) {
    textbookId = textbookId || 'jk';
    const base = 'data/questions/' + textbookId + '_';
    const types = ['spelling', 'listening', 'grammar', 'reading', 'cloze'];  // 🆕 cloze
    const results = {};
    for (const t of types) {
      try {
        // 🆕 优先走全局 __withVer（附带 ?v= 版本号），否则退回到 ?t= 时间戳
        const raw = base + t + '.json';
        const url = (typeof window !== 'undefined' && typeof window.__withVer === 'function')
          ? window.__withVer(raw)
          : (raw + '?t=' + Date.now());
        const res = await fetch(url);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        results[t] = await res.json();
      } catch (err) {
        // cloze 404 是正常的（jk/gzk 还没造），降到 debug
        if (t === 'cloze') {
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
    window.questionBank.cloze     = results.cloze;  // 🆕
    window.questionBank.stats = {
      spelling:  results.spelling.length,
      listening: results.listening.length,
      grammar:   results.grammar.length,
      reading:   results.reading.length,
      cloze:     results.cloze.length,  // 🆕
      total:     results.spelling.length + results.listening.length + results.grammar.length + results.reading.length + results.cloze.length
    };
    console.log(
      '[题库] 加载完成 (' + textbookId + '): 单词' + window.questionBank.stats.spelling +
      ' · 听力' + window.questionBank.stats.listening +
      ' · 语法' + window.questionBank.stats.grammar +
      ' · 阅读' + window.questionBank.stats.reading +
      ' · 完形' + window.questionBank.stats.cloze +  // 🆕
      ' · 共' + window.questionBank.stats.total + '题'
    );
    return window.questionBank;
  };
})();
