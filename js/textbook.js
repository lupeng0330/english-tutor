// ============================================================
// textbook.js · 教材 JSON 加载 + 分片缓存
// ------------------------------------------------------------
// 职责：
//   - 向全局暴露 textbookData / _currentTextbookMeta
//   - loadTextbook() 按 state.ctx 异步拉取教材 JSON
//   - 已拆分教材（如 hj）优先走按年级的分片，失败回退整册
//   - _bust() 通用缓存破坏工具（其它脚本也会用到）
// 依赖：
//   - 读 state.ctx.{textbook,grade,term}（由 state.js 提供）
//   - index.html 注入的 window.__withVer（可选）
// 导出（以全局变量/函数形式）：
//   - textbookData, _currentTextbookMeta
//   - loadTextbook()
//   - _bust(), textbookJsonPath()
// ============================================================

// ===================== 教材数据（改为异步从 data/textbooks/jk.json 加载）=====================
// 运行时容器：textbookData[grade3].title / units，和原结构保持兼容
let textbookData = {};
let _currentTextbookMeta = null;

// 🆕 统一的资源破缓存工具：优先使用 index.html 注入的 __withVer(url)；否则追加 ?t= 时间戳
function _bust(url) {
  if (typeof window !== 'undefined' && typeof window.__withVer === 'function') {
    return window.__withVer(url);
  }
  return url + (url.indexOf('?') < 0 ? '?' : '&') + 't=' + Date.now();
}

// 🆕 教材 JSON 的分片加载策略
// ------------------------------------------------------------
// 背景：hj.json 全量 380KB，切到沪教版时首屏偏慢。按年级拆成
//      hj_grade7.json / hj_grade8.json / hj_grade9.json 后，
//      单年级只需 ~110KB（降 70%）。
//
// 策略：loadTextbook() 优先拉 {tb}_{grade}.json 分片；若 404 或解析失败，
//      自动回退到整册 {tb}.json（保证旧部署 / 未拆分教材仍能工作）。
//
// 对外行为保持不变：textbookData / _currentTextbookMeta 的结构与原来一致，
// 只是 textbookData 里只会有"当前年级"那一个 key（原来也是只渲染当前年级，
// 无副作用）。
//
// 🆕 已拆分教材白名单：列入此表的教材会先尝试按年级拉分片
const TEXTBOOK_SHARDED = { hj: true };

// 教材级缓存：{ tb: { grade: data } } —— 同教材同年级不重复拉取
const _textbookShardCache = {};
// 整册兜底缓存：{ tb: data }
const _textbookFullCache = {};

// 根据 state.ctx 构造教材 JSON 路径（支持未来多教材版本）
function textbookJsonPath() {
  const id = state && state.ctx && state.ctx.textbook ? state.ctx.textbook : 'jk';
  return 'data/textbooks/' + id + '.json';
}

// 🆕 拼接分片路径
function _textbookShardPath(tb, gradeKey) {
  return 'data/textbooks/' + tb + '_' + gradeKey + '.json';
}

// 🆕 真正执行 fetch 的内部工具，返回 JSON 或 null（不抛）
async function _fetchJson(url) {
  try {
    const res = await fetch(_bust(url));
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// 异步加载教材 JSON，转换成原来 textbookData 的结构
async function loadTextbook() {
  const tb = (state && state.ctx && state.ctx.textbook) || 'jk';
  const gradeKey = 'grade' + ((state && state.ctx && state.ctx.grade) || 3);
  const term = (state && state.ctx && state.ctx.term) || '上';

  let data = null;
  let loadedFrom = '';

  // 1) 优先走分片（按年级）
  if (TEXTBOOK_SHARDED[tb]) {
    if (_textbookShardCache[tb] && _textbookShardCache[tb][gradeKey]) {
      data = _textbookShardCache[tb][gradeKey];
      loadedFrom = 'shard-cache';
    } else {
      const shardUrl = _textbookShardPath(tb, gradeKey);
      data = await _fetchJson(shardUrl);
      if (data) {
        if (!_textbookShardCache[tb]) _textbookShardCache[tb] = {};
        _textbookShardCache[tb][gradeKey] = data;
        loadedFrom = 'shard:' + shardUrl;
      }
    }
  }

  // 2) 分片不可用（未拆 / 404）→ 回退到整册
  if (!data) {
    if (_textbookFullCache[tb]) {
      data = _textbookFullCache[tb];
      loadedFrom = loadedFrom || 'full-cache';
    } else {
      const fullUrl = textbookJsonPath();
      data = await _fetchJson(fullUrl);
      if (data) {
        _textbookFullCache[tb] = data;
        loadedFrom = loadedFrom ? (loadedFrom + ' (fallback→full)') : ('full:' + fullUrl);
      }
    }
  }

  if (!data) {
    console.error('[教材] 加载失败: textbook=' + tb + ', grade=' + gradeKey);
    return false;
  }

  _currentTextbookMeta = data.meta || null;

  // 把 grades.grade3.上/下 结构展平成 textbookData[grade3] = { title, units }
  const out = {};
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
  console.log('[教材] 已加载 (' + loadedFrom + ') 教材版本=' + (data.meta && data.meta.name) +
              ' · 年级=' + gradeKey + ' · 学期=' + term +
              ' · 单元数=' + ((out[gradeKey] && out[gradeKey].units.length) || 0));
  return true;
}
