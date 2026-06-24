/* =========================================================
 * 乐学英语 · home.js（从 app.js 拆出 · v01.21 框架优化）
 * ---------------------------------------------------------
 * 职责：首页数据看板渲染。导出 window.continueLearning。依赖：stats/state。
 * 约定：经典脚本（非 ES Module），顶层 function 自动全局；
 *      凡 window.xxx 导出均随函数迁移；跨域调用在运行时解析。
 *      加载顺序见 index.html / sw.js。
 * ======================================================= */

function renderHomeStats() {
  const s = _loadStats();
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  // 🆕 顶栏版本号 / 今日分钟 / 累计分钟（由首页顶栏使用）
  //   完整版本号形如 "20260505V01.08"，页面只展示 "V" 后的短版本号 "01.08"
  const curVer = window.__APP_VERSION || '—';
  const shortVer = (curVer.match(/V(\d+\.\d+)/) || [,''])[1] || curVer;
  setText('homeVersionTag',  shortVer);
  const totalSec = s.totalSeconds || 0;
  const todaySec = s.todaySeconds || 0;
  // 今日分钟：有 todaySeconds 记录则用之，否则保守显示 0（避免跨天数字错乱）
  const todayMin = todaySec > 0 ? Math.floor(todaySec / 60) : 0;
  setText('homeTodayMinBig', todayMin);
  setText('homeTodayMin',    todayMin);
  setText('homeTodayLabel', '今日');
  setText('homeTotalMin',   Math.floor(totalSec / 60));

  setText('statTotalTime', Math.floor((s.totalSeconds || 0) / 60));
  setText('statKnownWords', Object.keys(s.knownWords || {}).length);
  // 🆕 v01.16：首页错题本入口角标（当前教材范围）
  try { setText('homeWrongCount', _wbCountCurrentTb() + ' 题'); } catch (e) {}
  setText('statStreak', s.streak || 0);
  setText('headerStreak', s.streak || 0);
  // 🆕 阅读答题总览（全部尝试、答对）
  const allRex = s.readingExDone || {};
  const rexTotal = Object.keys(allRex).length;
  const rexOk   = Object.values(allRex).filter(v => v && v.ok).length;
  const setRexText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setRexText('statReadingTotal', rexTotal);
  setRexText('statReadingOk',   rexOk);
  setRexText('statReadingPct',  rexTotal > 0 ? Math.round(rexOk / rexTotal * 100) + '%' : '—');

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
