/* =========================================================
 * 乐学英语 · stats.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：学习统计 + 计时器 IIFE + 版本检查 + 学习报告图表。导出 window.__stats / forceCheckUpdate。依赖：core。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

const STATS_KEY = 'yxyy_stats_v1';
let _stats = null;
function _loadStats() {
  if (_stats) return _stats;
  try {
    // v01.20：走 _pkey() 加 :profileId 后缀，实现多用户档案数据隔离
    const raw = localStorage.getItem(_pkey(STATS_KEY));
    _stats = raw ? JSON.parse(raw) : {};
  } catch (e) { _stats = {}; }
  _stats.totalSeconds = _stats.totalSeconds || 0;
  _stats.todaySeconds  = _stats.todaySeconds  || 0;
  // 跨天重置 todaySeconds（每天0点把 todaySeconds 清零，totalSeconds 累计不动）
  const today = new Date().toISOString().slice(0, 10);
  if (_stats.lastActiveDay && _stats.lastActiveDay !== today) {
    // 新的一天：todaySeconds 重置为0（从0开始累加今日）
    _stats.todaySeconds = 0;
  }
  _stats.lastActiveDay = today;
  // 初始化 knownWords/answers 等
  _stats.knownWords   = _stats.knownWords   || {};
  _stats.answers      = _stats.answers      || [];
  _stats.streak       = _stats.streak       || 0;
  _stats.lastUnit     = _stats.lastUnit     || null;
  // 🆕 阅读自测每题状态：key = "<tb>::<grade>::<term>::<uid>::<lessonIdx>::<qIdx>"
  //                      val = { ok: true|false, at: ts }
  _stats.readingExDone = _stats.readingExDone || {};
  // 🆕 v01.17：每日学习时长序列 { 'YYYY-MM-DD': seconds }（用于报告页时长趋势）
  _stats.dailySeconds = _stats.dailySeconds || {};
  return _stats;
}
function _saveStats() {
  // v01.20：走 _pkey() 加 :profileId 后缀
  try { localStorage.setItem(_pkey(STATS_KEY), JSON.stringify(_stats || {})); } catch(e) {}
  // Phase3 云同步：本地写变更后节流推送云端（未登录时 no-op；计时器高频写由 CloudSync 节流）
  try { if (window.CloudSync) window.CloudSync.schedulePush(STATS_KEY); } catch(e) {}
}

// Phase3 云同步：拉取云端覆盖 localStorage 后，清空内存缓存以让 _loadStats 重读新数据
window.__statsReload = function () {
  _stats = null;
  _loadStats();
};
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

// 🆕 强制检查更新（绕过所有缓存，读取最新 version.txt 并重载页面）
//    由首页「检查更新」按钮触发；同时更新左下角角标
async function forceCheckUpdate() {
  const btnIcon  = document.getElementById('forceUpdateIcon');
  const btnLabel = document.getElementById('forceUpdateLabel');
  if (btnIcon)  btnIcon.textContent  = '⏳';
  if (btnLabel) btnLabel.textContent = '检查中…';
  try {
    // 带 no-store 强制拉最新
    const r = await fetch('./version.txt?_=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const txt  = (await r.text()).trim();
    const ver  = txt.split(/\r?\n/)[0];          // 首行即版本号
    const cur  = (window.__APP_VERSION || '');
    if (ver !== cur) {
      // 版本不同 → 弹提示，让用户手动刷新（或直接 reload）
      if (btnLabel) btnLabel.textContent = '发现新版本';
      if (btnIcon)  btnIcon.textContent  = '✅';
      if (confirm(`发现新版本 ${ver}（当前 ${cur}），点击「确定」刷新页面到最新。`)) {
        // 用最新版本号作为 ?v= 参数 reload，确保所有资源均带新 ?v=
        const url = new URL(location.href);
        url.searchParams.set('v', ver);
        location.href = url.toString();
      } else {
        if (btnIcon)  btnIcon.textContent  = '🔄';
        if (btnLabel) btnLabel.textContent = '检查更新';
      }
    } else {
      if (btnIcon)  btnIcon.textContent  = '✔️';
      if (btnLabel) btnLabel.textContent = '已是最新';
      setTimeout(() => {
        if (btnIcon)  btnIcon.textContent  = '🔄';
        if (btnLabel) btnLabel.textContent = '检查更新';
      }, 2000);
    }
  } catch(e) {
    if (btnIcon)  btnIcon.textContent  = '❌';
    if (btnLabel) btnLabel.textContent = '检查失败';
    setTimeout(() => {
      if (btnIcon)  btnIcon.textContent  = '🔄';
      if (btnLabel) btnLabel.textContent = '检查更新';
    }, 2500);
  }
}
window.forceCheckUpdate = forceCheckUpdate;
// ctx 必传：{ textbook, grade, term, uid, lessonIdx, qIdx }
// 存储：{ ok: bool（本次）, at: ts, attempts: int（累计尝试次数）}
function markReadingExAnswer(ctx, ok) {
  if (!ctx || !ctx.uid) return;
  const s = _loadStats();
  const key = [ctx.textbook || 'jk', ctx.grade || 0, ctx.term || '上',
               ctx.uid, ctx.lessonIdx|0, ctx.qIdx|0].join('::');
  const prev = s.readingExDone[key] || {};
  s.readingExDone[key] = {
    ok:       !!ok,
    attempts: (prev.attempts || 0) + 1,
    at:       Date.now(),
  };
  _saveStats();
}
// 答题记录（用于本周正确率 + v01.17 题型分布）
// type 可选：spelling/listening/grammar/reading/reading_qa；旧记录无 type，读取处需容错
function recordAnswerStats(isCorrect, type) {
  const s = _loadStats();
  const rec = { at: Date.now(), ok: !!isCorrect };
  if (type) rec.type = type;
  s.answers.push(rec);
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
        const delta = Math.floor((now - lastTick) / 1000);
        s.totalSeconds  = (s.totalSeconds  || 0) + delta;
        s.todaySeconds  = (s.todaySeconds  || 0) + delta;
        // 🆕 v01.17：按天累计到 dailySeconds，供报告页时长趋势图使用
        s.dailySeconds = s.dailySeconds || {};
        const _d = new Date().toISOString().slice(0, 10);
        s.dailySeconds[_d] = (s.dailySeconds[_d] || 0) + delta;
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
let _studyChart = null;
let _scoreChart = null;

const _REPORT_TYPES = [
  { key: 'spelling',  label: '单词拼写' },
  { key: 'listening', label: '听力选择' },
  { key: 'grammar',   label: '语法练习' },
  { key: 'reading',   label: '阅读理解' }
];

// 最近 7 天的 'YYYY-MM-DD' 数组（含今天）
function _reportLast7Days() {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function renderReport() {
  const s = _loadStats();
  const answers = Array.isArray(s.answers) ? s.answers : [];
  const setText = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  // ---- 顶部 4 张统计卡 ----
  const totalMin = Math.floor((s.totalSeconds || 0) / 60);
  setText('reportTotalTime', totalMin >= 60 ? (totalMin / 60).toFixed(1) + 'h' : totalMin + ' 分');
  setText('reportTotalAnswers', answers.length);
  const okAll = answers.filter(a => a.ok).length;
  setText('reportAvgScore', answers.length ? Math.round(okAll / answers.length * 100) + '%' : '—');
  setText('reportKnownWords', Object.keys(s.knownWords || {}).length);

  // ---- 题型正确率分布（复用 unitMastery 容器）----
  //   旧记录无 type 字段 → 不计入分布（仍计入总题数），向后兼容
  const dist = _REPORT_TYPES.map(t => {
    const arr = answers.filter(a => a.type === t.key);
    const ok = arr.filter(a => a.ok).length;
    return { label: t.label, key: t.key, count: arr.length, pct: arr.length ? Math.round(ok / arr.length * 100) : null };
  });
  // 阅读自测并入（来自 readingExDone）
  const rexArr = Object.values(s.readingExDone || {});
  if (rexArr.length) {
    const rexOk = rexArr.filter(v => v && v.ok).length;
    dist.push({ label: '阅读自测', key: 'reading_qa', count: rexArr.length, pct: Math.round(rexOk / rexArr.length * 100) });
  }
  const um = document.getElementById('unitMastery');
  if (um) {
    const withData = dist.filter(d => d.count > 0);
    if (!withData.length) {
      um.innerHTML = '<div class="text-sm text-slate-400 text-center py-4">还没有练习记录，去做几道题就能看到分布啦～</div>';
    } else {
      um.innerHTML = withData.map(d => {
        const pct = d.pct == null ? 0 : d.pct;
        const color = pct >= 80 ? 'from-green-500 to-emerald-500' : (pct >= 60 ? 'from-blue-500 to-indigo-500' : 'from-orange-500 to-red-500');
        return ''
          + '<div>'
          +   '<div class="flex justify-between text-sm mb-1">'
          +     '<span class="text-slate-700 font-medium">' + d.label + ' <span class="text-xs text-slate-400">(' + d.count + ' 题)</span></span>'
          +     '<span class="text-slate-500">' + pct + '%</span>'
          +   '</div>'
          +   '<div class="h-2 bg-slate-100 rounded-full overflow-hidden">'
          +     '<div class="h-full bg-gradient-to-r ' + color + '" style="width: ' + pct + '%"></div>'
          +   '</div>'
          + '</div>';
      }).join('');
    }
  }

  // ---- 弱项分析（按正确率从低到高，样本 >= 3 才纳入）----
  const weak = document.getElementById('weakAnalysis');
  if (weak) {
    const sampled = dist.filter(d => d.count >= 3 && d.pct != null);
    if (!sampled.length) {
      weak.innerHTML = '<div class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl"><span class="text-2xl">📝</span><div><div class="font-semibold text-blue-800">数据积累中</div><div class="text-sm text-slate-600 mt-1">每种题型做满 3 题后，这里会给出针对性的强弱项分析</div></div></div>';
    } else {
      const sorted = sampled.slice().sort((a, b) => a.pct - b.pct);
      const rows = [];
      sorted.filter(d => d.pct < 80).slice(0, 2).forEach(d => {
        rows.push('<div class="flex items-start gap-3 p-3 bg-amber-50 rounded-xl"><span class="text-2xl">⚠️</span><div><div class="font-semibold text-amber-800">' + d.label + '</div><div class="text-sm text-slate-600 mt-1">正确率 ' + d.pct + '%（' + d.count + ' 题），建议多练这一类巩固薄弱点</div></div></div>');
      });
      const best = sorted[sorted.length - 1];
      if (best && best.pct >= 80) {
        rows.push('<div class="flex items-start gap-3 p-3 bg-green-50 rounded-xl"><span class="text-2xl">✨</span><div><div class="font-semibold text-green-800">优势：' + best.label + '</div><div class="text-sm text-slate-600 mt-1">正确率达 ' + best.pct + '%，继续保持！</div></div></div>');
      }
      if (!rows.length) {
        rows.push('<div class="flex items-start gap-3 p-3 bg-green-50 rounded-xl"><span class="text-2xl">🎉</span><div><div class="font-semibold text-green-800">表现优秀</div><div class="text-sm text-slate-600 mt-1">各题型正确率都不错，继续加油！</div></div></div>');
      }
      weak.innerHTML = rows.join('');
    }
  }

  // ---- 图表：每次进入先 destroy 旧实例再重建，避免重复 new Chart 报错 + 陈旧数据 ----
  if (typeof Chart === 'undefined') return;  // 离线且未缓存 Chart.js 时优雅降级

  const days = _reportLast7Days();
  const dayLabels = days.map(d => d.slice(5));  // MM-DD
  const dailySec = s.dailySeconds || {};
  const studyMins = days.map(d => Math.round((dailySec[d] || 0) / 60));

  const ctx1 = document.getElementById('studyTimeChart');
  if (ctx1) {
    if (_studyChart) { try { _studyChart.destroy(); } catch (e) {} }
    _studyChart = new Chart(ctx1, {
      type: 'bar',
      data: { labels: dayLabels, datasets: [{ label: '学习时长(分钟)', data: studyMins, backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 8 }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }

  // 每天正确率（当天无记录 → null，折线在该点断开）
  const dayAcc = days.map(d => {
    const arr = answers.filter(a => {
      try { return new Date(a.at).toISOString().slice(0, 10) === d; } catch (e) { return false; }
    });
    if (!arr.length) return null;
    return Math.round(arr.filter(a => a.ok).length / arr.length * 100);
  });
  const ctx2 = document.getElementById('scoreChart');
  if (ctx2) {
    if (_scoreChart) { try { _scoreChart.destroy(); } catch (e) {} }
    _scoreChart = new Chart(ctx2, {
      type: 'line',
      data: { labels: dayLabels, datasets: [{ label: '正确率(%)', data: dayAcc, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#6366f1', spanGaps: true }] },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
    });
  }
}

// ===================== 初始化 =====================
// 练习筛选器事件
