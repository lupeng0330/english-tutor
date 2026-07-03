/**
 * grammar.js — 语法讲解模块
 * 加载 grammar_knowledge.json，支持 7 大分类、教材筛选、关键词搜索
 */
(function () {
  'use strict';

  var _grammarData = null;
  var _filterMode = 'all'; // 'all' | 'textbook'
  var _searchText = '';

  // 分类中文名 + 图标
  var CATEGORY_META = {
    parts_of_speech: { label: '词性', icon: 'A' },
    tenses: { label: '时态', icon: '\u23F0' },
    verb_forms: { label: '动词形式', icon: '\u2699' },
    sentence: { label: '句子结构', icon: '\u270D' },
    clauses: { label: '从句', icon: '\U0001F517' },
    voice: { label: '语态', icon: '\u{1F504}' },
    structures: { label: '特殊结构', icon: '\u2B50' }
  };

  var LEVEL_LABEL = { basic: '基础', intermediate: '进阶', advanced: '高级' };
  var LEVEL_STYLE = {
    basic: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700'
  };

  /** 加载语法数据（缓存到内存） */
  function load() {
    if (_grammarData) return Promise.resolve(_grammarData);
    return fetch('data/grammar/grammar_knowledge.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        _grammarData = data;
        return data;
      })
      .catch(function (e) {
        // 降级：旧版硬编码（保留兼容）
        if (typeof grammarData !== 'undefined') {
          console.warn('[grammar] JSON 加载失败，降级使用旧版硬编码数据');
          return grammarData;
        }
        console.error('[grammar] 数据加载失败:', e);
        return [];
      });
  }

  /** 获取当前教材和年级 */
  function getCurrentContext() {
    var ctx = (window.__state && window.__state.ctx)
      || (typeof state !== 'undefined' && state.ctx)
      || {};
    return {
      textbookId: ctx.textbookId || (window.__state && window.__state.currentTextbook) || '',
      grade: ctx.grade || '',
      term: ctx.term || '',
      gradeKey: 'G' + (ctx.grade || '')
    };
  }

  /** 判断语法条目是否匹配当前教材/年级 */
  function matchesTextbook(item, ctx) {
    if (!ctx.textbookId) return true;
    var units = item.relatedUnits && item.relatedUnits[ctx.textbookId];
    if (!units || !units.length) return false;
    // 检查是否有属于当前年级的单元
    for (var i = 0; i < units.length; i++) {
      if (ctx.grade && units[i].indexOf(ctx.grade + 'A') === 0) return true;
      if (ctx.grade && units[i].indexOf(ctx.grade + 'B') === 0) return true;
    }
    // 也检查 grades 数组
    if (item.grades && item.grades.indexOf(ctx.gradeKey) >= 0) return true;
    return false;
  }

  /** 搜索过滤 */
  function matchesSearch(item) {
    if (!_searchText) return true;
    var q = _searchText.toLowerCase();
    if (item.title.indexOf(q) >= 0) return true;
    if (item.titleEn && item.titleEn.toLowerCase().indexOf(q) >= 0) return true;
    if (item.keywords) {
      for (var i = 0; i < item.keywords.length; i++) {
        if (item.keywords[i].indexOf(q) >= 0) return true;
      }
    }
    return false;
  }

  /** 获取过滤后的数据 */
  function getFiltered() {
    if (!_grammarData) return [];
    var ctx = getCurrentContext();
    return _grammarData.filter(function (item) {
      if (_filterMode === 'textbook' && !matchesTextbook(item, ctx)) return false;
      if (!matchesSearch(item)) return false;
      return true;
    });
  }

  /** 按 category 分组 */
  function groupByCategory(items) {
    var groups = {};
    var order = ['parts_of_speech', 'tenses', 'verb_forms', 'sentence', 'clauses', 'voice', 'structures'];
    items.forEach(function (item) {
      var cat = item.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return { groups: groups, order: order };
  }

  /** 渲染左侧目录 */
  function renderNav() {
    var nav = document.getElementById('grammarNav');
    if (!nav) return;
    var items = getFiltered();
    var grouped = groupByCategory(items);

    var html = '<div class="grammar-search mb-3"><input type="text" id="grammarSearch" placeholder="搜索语法..." value="' + _searchText + '" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"></div>';

    // 筛选切换按钮
    var ctx = getCurrentContext();
    html += '<div class="flex gap-2 mb-3"><button id="grammarToggleAll" class="grammar-toggle-btn ' + (_filterMode === 'all' ? 'grammar-toggle-active' : '') + '">全部</button>';
    html += '<button id="grammarToggleTextbook" class="grammar-toggle-btn ' + (_filterMode === 'textbook' ? 'grammar-toggle-active' : '') + '">当前教材</button></div>';

    // 分类 + 条目
    grouped.order.forEach(function (cat) {
      var list = grouped.groups[cat];
      if (!list || !list.length) return;
      var meta = CATEGORY_META[cat] || { label: cat, icon: '-' };
      html += '<div class="grammar-cat-group">';
      html += '<div class="grammar-cat-header" data-cat="' + cat + '">'
        + '<span class="grammar-cat-icon">' + meta.icon + '</span>'
        + '<span class="grammar-cat-label">' + meta.label + '</span>'
        + '<span class="grammar-cat-count">' + list.length + '</span>'
        + '<span class="grammar-cat-arrow">+</span></div>';
      html += '<div class="grammar-cat-items" data-cat="' + cat + '">';
      list.forEach(function (item, idx) {
        html += '<div class="grammar-item p-3 rounded-xl cursor-pointer hover:bg-blue-50" data-id="' + item.id + '">'
          + '<div class="font-semibold text-slate-800 text-sm">' + item.title + '</div>'
          + '<div class="text-xs mt-1"><span class="inline-block px-2 py-0.5 rounded-full ' + (LEVEL_STYLE[item.level] || '') + '">' + (LEVEL_LABEL[item.level] || '') + '</span></div></div>';
      });
      html += '</div></div>';
    });

    nav.innerHTML = html;

    // 绑定事件
    document.getElementById('grammarSearch').addEventListener('input', function () {
      _searchText = this.value;
      renderAll();
    });
    document.getElementById('grammarToggleAll').addEventListener('click', function () {
      _filterMode = 'all'; renderAll();
    });
    document.getElementById('grammarToggleTextbook').addEventListener('click', function () {
      _filterMode = 'textbook'; renderAll();
    });

    // 分类折叠
    nav.querySelectorAll('.grammar-cat-header').forEach(function (hdr) {
      hdr.addEventListener('click', function () {
        var cat = this.dataset.cat;
        var itemsEl = nav.querySelector('.grammar-cat-items[data-cat="' + cat + '"]');
        var arrow = this.querySelector('.grammar-cat-arrow');
        if (itemsEl.classList.contains('grammar-cat-open')) {
          itemsEl.classList.remove('grammar-cat-open');
          arrow.textContent = '+';
        } else {
          itemsEl.classList.add('grammar-cat-open');
          arrow.textContent = '-';
        }
      });
    });

    // 点击条目
    nav.querySelectorAll('.grammar-item').forEach(function (el) {
      el.addEventListener('click', function () {
        nav.querySelectorAll('.grammar-item').forEach(function (e) { e.classList.remove('bg-blue-100'); });
        el.classList.add('bg-blue-100');
        renderContent(el.dataset.id);
      });
    });

    // 默认展开第一个分类
    var firstCat = nav.querySelector('.grammar-cat-header');
    if (firstCat) firstCat.click();
  }

  /** 渲染右侧内容 */
  function renderContent(id) {
    if (!_grammarData) return;
    var item = null;
    for (var i = 0; i < _grammarData.length; i++) {
      if (_grammarData[i].id === id) { item = _grammarData[i]; break; }
    }
    if (!item) return;

    var content = document.getElementById('grammarContent');
    if (!content) return;

    var html = '<h2 class="text-xl font-bold text-slate-800 mb-1">' + item.title + '</h2>'
      + (item.titleEn ? '<p class="text-sm text-slate-400 mb-4">' + item.titleEn + '</p>' : '')
      + '<span class="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ' + (LEVEL_STYLE[item.level] || '') + '">' + (LEVEL_LABEL[item.level] || item.level) + '</span>';

    // 定义
    if (item.definition) {
      html += '<div class="grammar-section"><h4 class="grammar-section-title">定义</h4>'
        + '<p class="text-slate-700">' + item.definition + '</p></div>';
    }

    // 规则
    if (item.rules && item.rules.length) {
      html += '<div class="grammar-section"><h4 class="grammar-section-title">规则</h4>';
      html += '<div class="space-y-2">';
      item.rules.forEach(function (r) {
        html += '<div class="grammar-rule"><code class="grammar-rule-code">' + r.rule + '</code>'
          + (r.note ? '<span class="grammar-rule-note">' + r.note + '</span>' : '') + '</div>';
      });
      html += '</div></div>';
    }

    // 例句
    if (item.examples && item.examples.length) {
      html += '<div class="grammar-section"><h4 class="grammar-section-title">例句</h4>';
      html += '<div class="grammar-example">';
      item.examples.forEach(function (ex) {
        html += '<div class="grammar-example-item"><div class="grammar-example-en">' + ex.en + '</div>'
          + '<div class="grammar-example-cn">' + (ex.cn || '') + '</div></div>';
      });
      html += '</div></div>';
    }

    // 常见错误
    if (item.commonErrors && item.commonErrors.length) {
      html += '<div class="grammar-section"><h4 class="grammar-section-title">常见错误</h4>';
      item.commonErrors.forEach(function (err) {
        html += '<div class="grammar-error"><div class="grammar-error-wrong">+ ' + err.wrong + '</div>'
          + '<div class="grammar-error-correct">- ' + err.correct + '</div>'
          + (err.note ? '<div class="grammar-error-note">' + err.note + '</div>' : '') + '</div>';
      });
      html += '</div>';
    }

    // 口诀
    if (item.tips) {
      html += '<div class="grammar-tips">+ ' + item.tips + '</div>';
    }

    // 练习按钮
    html += '<div class="mt-6"><button class="gradient-btn" onclick="switchPage(\'practice\');setTimeout(function(){startPractice(\'grammar\')},100)">开始本知识点练习 </button></div>';

    content.innerHTML = html;
  }

  /** 全量重新渲染 */
  function renderAll() {
    renderNav();
    // 自动点击第一条
    var firstItem = document.querySelector('#grammarNav .grammar-item');
    if (firstItem) firstItem.click();
  }

  /** 公共入口：由 app.js switchPage 调用 */
  window.renderGrammarPage = function () {
    var content = document.getElementById('grammarContent');
    if (content) content.innerHTML = '<div class="text-center text-slate-400 py-10">加载中...</div>';
    load().then(function () {
      renderAll();
    });
  };

  /** 暴露切换/搜索接口 */
  window.GrammarModule = {
    load: load,
    setFilter: function (mode) { _filterMode = mode; renderAll(); },
    search: function (text) { _searchText = text; renderAll(); },
    refresh: renderAll
  };
})();
