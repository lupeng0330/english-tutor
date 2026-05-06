# 🎓 乐学英语（English Tutor）· 项目交接状态

> 这份文档给"另一端的你 / AI 助手"看的，目的是**无缝接上当前进度**。  
> 最后更新：2026-05-05 晚（PC 端，状态校准 + 准备启动 PWA 收尾 v01.14）  
> 对应 Git HEAD：`d91e3d6`

---

## 0. 给新进来的 AI 助手的一段话

你好，我是在 **Windows PC 端** 协作过本项目的助手。用户 `lupeng` 的 CodeBuddy 对话上下文保存在本地 IDE，**无法跨设备同步**，所以我把关键信息整理成这份 `PROJECT_STATUS.md` 推到 GitHub。

请你在开始任何新任务前：

1. **先读完这份文件**（尤其第 4、5、7 节）。
2. 再读 `README.md` 补全产品视角。
3. 需要看具体实现时再打开对应源文件。

用户是在 **Mac 和 PC 双端轮流开发** 的，请始终走 `git pull --rebase` → 改 → `git commit` → `git push` 的工作流，不要在对方没推送前改同一文件以避免冲突。

---

## 1. 项目一句话简介

面向 **1-9 年级学生** 的英语学习 Web 应用（纯静态，GitHub Pages 部署）。  
线上地址：<https://lupeng0330.github.io/english-tutor/>

核心能力：单词/课文学习 + 4 类题型练习 + 真人级 TTS 朗读 + 全局年级切换。

---

## 2. 技术栈与运行

| 项 | 选型 |
|---|---|
| 前端 | 原生 HTML / CSS(+Tailwind CDN) / ES6 JS，无构建 |
| 图表 | Chart.js |
| 音频 | **预生成 MP3**（Python `edge-tts` 包，Microsoft Neural TTS） |
| 音频兜底 | Web Speech API（浏览器 TTS） |
| 数据 | JSON 文件（`data/textbooks/*.json`、`data/questions/*.json`） |
| 部署 | GitHub Pages（main 分支根目录） |
| 仓库 | `git@github.com:lupeng0330/english-tutor.git` |

本地开发：

```bash
# Windows
双击 start-windows.bat

# Mac
双击 start-mac.command   # 首次需 chmod +x

# 或手动
python3 -m http.server 8765
# → http://localhost:8765/
```

---

## 3. 当前规模（2026-05-05 晚核查）

| 类别 | 数量 |
|---|---|
| **教材单元（教科版 jk）** | **83** 个（1-5 年级每年级 10 单元、6 年级 9 单元、7-9 年级每年级 8 单元） |
| **教材单元（沪教版 hj）** | **48** 个（7-9 年级 × 上下册 × 8 单元；每单元 15 词 + 3 篇课文 Reading / Grammar focus / More reading） |
| **题库（jk · 单词拼写）** | 224 题 |
| **题库（jk · 听力选择）** | 52 题 |
| **题库（jk · 语法）** | 72 题 |
| **题库（jk · 阅读）** | 72 题 |
| **题库（jk 合计）** | **420 题** |
| **题库（hj · 单词拼写）** | 95 题（距每单元 15 词全量 720 题还差 ~625） |
| **题库（hj · 听力选择）** | 32 题（7 上全量） |
| **题库（hj · 语法）** | 80 题 |
| **题库（hj · 阅读）** | 48 题 |
| **题库（hj 合计）** | **255 题** |
| **题库总计** | **675 题** |
| **音频 MP3** | 303 个（教科版课文 42 + 教科版听力 31 + 沪教听力 32 + 沪教课文 144 + 杂项 54；grade9B_u5_L0 已补齐） |
| **音频增量元数据** | `audio/.manifest.json`：143 条 hash 记录，下次跑 `gen_audio_v2.py` 零改动时 0.53 秒扫完 |
| **前端代码** | `app.js` 2912 行（-23%）+ `js/textbook.js` / `js/state.js` / `js/player.js` 三个抽出模块 |
| **PWA 雏形** | `manifest.json` + `icon.svg` 已就绪（工作区 untracked），待注入 `index.html` + 补 192/512 PNG + 建 `sw.js` |

教材版本占位：`rj`（人教）、`wy`（外研）尚未填充数据。

---

## 4. 目录与关键文件

```
english-tutor/
├── index.html              # 主页面。顶部 sticky「学习上下文条」（年级/学期/教材）
│                           # 🆕 底部动态按序注入 js/*.js → questionBank.js → app.js
├── styles.css              # 含移动端深度适配
├── app.js                  # ★ 核心逻辑：渲染 / 单元 / 练习 / 上下文切换包装
├── questionBank.js         # ★ 题库异步加载器 window.loadQuestionBank(textbookId)
│
├── js/                     # 🆕 从 app.js 抽出的三个独立模块（仍是全局变量风格）
│   ├── textbook.js         # textbookData / loadTextbook / 分片缓存 / _bust
│   ├── state.js            # state 对象 / TEXTBOOK_NAMES/GRADES/LABELS / ctxSummaryText
│   └── player.js           # speakBrowser / speak / stopSpeak / playYoudao 系列
│
├── data/
│   ├── textbooks/
│   │   ├── jk.json              # 结构: { meta, grades: { grade1: { 上:[...], 下:[...] } } }
│   │   ├── hj.json              # 沪教整册（380KB，作为分片回退兜底）
│   │   └── hj_grade{7,8,9}.json # 🆕 按年级拆出的分片（108-185KB），loadTextbook 优先走这里
│   └── questions/
│       ├── jk_spelling.json   # 单词拼写
│       ├── jk_listening.json  # 听力（含 audioFile 字段指向 audio/*.mp3）
│       ├── jk_grammar.json    # 语法
│       └── jk_reading.json    # 阅读
│
├── audio/                  # 预生成 MP3
│   ├── grade{N}_u{M}.mp3   # 课文朗读（Aria 女声）
│   ├── listening_XX.mp3    # 听力题（W=Aria 女 / M=Guy 男）
│   └── .manifest.json      # 🆕 增量校验元数据：{fname: {text_hash, textbook, generated_at}}
│
├── gen_audio.py            # 旧版单文件音频脚本
├── gen_audio_v2.py         # 🆕 V2：按篇 + 多音色 + --dry-run / --stale-only 增量
│
├── scripts/
│   ├── make_template.py              # 生成 Excel 导入模板
│   ├── import_questions.py           # Excel → JSON 题库
│   ├── ai_generate_questions.py      # 基于课文自动造题
│   ├── expand_textbook.py            # 扩展教材单元
│   ├── split_textbook_by_grade.py    # 🆕 把教材 JSON 按年级拆成 {tb}_{grade}.json 分片
│   └── excel_templates/题库导入模板.xlsx
│
├── start-windows.bat / start-mac.command
├── README.md               # 用户视角文档
└── PROJECT_STATUS.md       # ← 当前文件（AI/开发者视角交接）
```

### `app.js` 关键结构（务必先看）

- `state.ctx = { grade, term, textbook }`：全局学习上下文，变更走 `applyContextChange()`。
- `loadTextbook(id)` / `loadQuestionBank(id)`：异步拉取 JSON，缓存到 `state`。
- `playLesson(unit)` / `playAudioText(text, audioFile?)`：**先尝试 MP3，再降级 Web Speech API**。
- `_showUnitAtIndex(i)` + 左右滑动手势：单元详情页横滑切换。
- 练习页切年级：**在答题中自动重新抽题 + toast 提示**，不踢回选择页。

### `questionBank.js`

```js
window.loadQuestionBank(textbookId)  // 返回 { spelling, listening, grammar, reading }
```

---

## 5. 重要约定（容易踩坑）

1. **听力题必须写死 `audioFile` 字段**（别再回退到按字符串 findIndex 匹配，手机会失败）。
2. **课文朗读优先 MP3**：新增/修改课文后，跑 `python gen_audio.py` 同步补齐。  
   生成命名规则 `grade{N}_u{M}.mp3`。
3. **听力题 MP3 命名** `listening_{序号}.mp3`，对话体用 `W:` / `M:` 前缀区分女/男声。
4. **数字/时间**（如 `7:30`、`12:00`）在 Web TTS 里曾导致 Chrome 缺字 → 能用 MP3 就别走 TTS。
5. **移动端自动播放限制**：所有音频播放必须在用户手势回调里触发，别在 `DOMContentLoaded` 后立刻 play。
6. **不要硬编码题目/单元**：只改 JSON，不要把数据写回 `app.js` / `questionBank.js`。
7. **Git 双端**：开工先 `git pull --rebase origin main`，结束 `git push`。

---

## 6. 部署与发布

- 静态托管：GitHub Pages，`main` 分支根目录（`/`）。
- Push 到 main ≈ 1 分钟后自动上线（偶尔 2-3 分钟）。
- 如果页面不刷新：强刷（Ctrl+F5 / Cmd+Shift+R），或查 Actions 页 Pages build 日志。

---

## 7. 近期进展（Git log 摘要）

```
d91e3d6 2026-05-05 docs: 同步 PROJECT_STATUS 至技术债收尾后状态（分片/增量/模块拆分）[PC]
c66e3e7 2026-05-05 ci: auto-bump version to 20260505V01.13                        [PC]
dde6cdc 2026-05-05 refactor(js): 拆分 app.js 为 textbook/state/player 三个独立模块  [PC]
c5fa1fc 2026-05-05 ci: auto-bump version to 20260505V01.12                        [PC]
f8634b6 2026-05-05 feat(audio): gen_audio_v2 支持 manifest 增量校验                [PC]
b5dae7f 2026-05-05 perf(data): 沪教版 hj.json 按年级分片懒加载，首屏降 71%          [PC]
38b01bc 2026-05-05 feat(audio): 沪教版 144 篇课文 MP3 + gen_audio_v2 扩展          [PC]
5d7a903 2026-05-05 feat(hj): 补齐沪教牛津版 7-9 年级全 48 单元教材内容              [PC]
627371b 2026-05-05 chore(git): ignore *.err                                      [PC]
14e061f 2026-05-04 feat(spelling): 字母格子填空+手机发音修复+UI优化                [Mac]
fd4fc1d 2026-05-04 fix(spelling): 单词拼写题增加英文输入UI                        [Mac]
ea5f85c 2026-05-04 feat(practice): 答题中切换年级/学期无缝刷新题目                [PC]
c67c4da 2026-05-03 feat: 切换年级重置练习+单元左右滑+每年级扩4-5单元(+22 MP3)     [PC]
0ae229e 2026-05-03 feat: 重构数据架构 + 308 题 + 1-9 年级全覆盖 + 导入工具        [PC]
da1fccc 2026-05-03 feat(arch): 全局学习上下文切换（localStorage 记忆）            [PC]
e40b4d9 2026-05-03 feat(listening): 听力题男女声区分（W→Aria / M→Guy）            [PC]
942a7bc 2026-05-03 fix(listening): 每题直接写死 audioFile                        [PC]
1870b5f 2026-05-03 feat(listening): 预生成 10 道听力题 MP3                       [PC]
4bf5082 2026-05-03 feat(voice): 预生成 13 篇课文 MP3（Edge Neural TTS）          [PC]
... (更早的 voice 调试若干次)
a4f0da4 2026-05-03 Initial commit                                                [PC]
```

## 8. 后续版本开发计划（v01.10 → v02.x）

> 当前基线：`v01.13`（2026-05-05 晚），最新 HEAD `d91e3d6`。下一次 bump 后为 `v01.14`（PWA 收尾）。
> 总策略：**先把沪教版练习闭环做完 → 补人教/外研 → 学习闭环（错题本+数据）→ AI 真接入**。

### 🟡 P0 · 沪教版练习闭环（最近 2-3 周）

> 现状：沪教版 48 单元课文已就位，题库框架已打通（hj 四类文件都在，共 255 题），主要缺口是 AI 造题量仍不够（拼写距离 720 题全量还差 ~625）。

#### v01.10 — 沪教版题库框架打通 ✅ 已完成
- [x] 新建 `data/questions/hj_spelling.json` / `hj_listening.json` / `hj_grammar.json` / `hj_reading.json`（已有内容：95 / 32 / 80 / 48）
- [x] `questionBank.js` 按 `textbookId + '_' + type + '.json'` 统一路由到 hj_*.json
- [x] 教材切到沪教版时，练习页自动从 hj_*.json 取题
- [x] 原 g7 32 道听力已归位到 `hj_listening.json` 且 schema 对齐

#### v01.11 — 沪教版 AI 自动造题（首批）
复用 `scripts/ai_generate_questions.py`，针对 hj.json 的 48 单元批量造题：
- [ ] 单词拼写：每单元 15 词全量出题 → 48 × 15 = **720 题**（按难度分级）
- [ ] 语法：基于 Grammar focus 课文核心点，每单元 3-5 题 → ~150-240 题
- [ ] 阅读：基于 Reading + More reading 课文，每单元 1-2 篇问答 → ~96 题
- [ ] 流程上"AI 草稿 + 人工抽样校对"，每年级抽 3 单元过一遍后再合入

#### v01.12 — 沪教版练习体验打磨
- [ ] 单词拼写支持"按当前单元 / 全册 / 全年级"三档范围筛选
- [ ] 听力题增加"原文显示开关"（默认隐藏，做完才能看）
- [ ] 阅读题长文滚动 + 题目悬浮，避免反复滚屏
- [ ] 练习页徽章统一格式：`沪教 · 7上 · 共 95 题`

---

### 🟢 P1 · 人教 / 外研版教材补齐（约 1 个月）

> 现状：`rj.json` / `wy.json` 仍是占位，切过去看到空白。

#### v01.13 — 人教版 PEP 1-9 年级骨架
- [ ] 小学 PEP 3-6 年级：每册 6 单元 × 上下册 = 8 册共 48 单元
- [ ] 初中 Go for it! 7-9 年级：每册 12 单元（Section A/B）
- [ ] 数据结构沿用 `jk.json` 的 `{ meta, grades }` 格式，每单元 12-15 词 + 1-2 篇短课文

#### v01.14 — 外研版（New Standard）骨架
- [ ] 三年级起点（更主流），与人教版结构对齐，单元数略少

#### v01.15 — 三套教材音频统一生成 + 题库初稿
- [ ] `gen_audio_v2.py --textbook rj/wy` 一次性生成课文 MP3
- [ ] `ai_generate_questions.py` 给两套教材造首批题（每教材 200 题左右）

---

### 🔵 P2 · 学习闭环 & 数据沉淀（1-1.5 个月）

> 现状：刷新即清零，没有"我学到哪儿了"的感知。

#### v01.16 — 错题本（纯前端 localStorage，零成本）
- [ ] 答错的题自动入错题本，按 `教材 + 题型 + 错误次数` 分桶
- [ ] 学习页新增"错题本"入口，可重做、可移除

#### v01.17 — 学习数据可视化升级
- [ ] 每日学习时长热力图（GitHub 风格 53 周方格）
- [ ] 各教材 / 各题型正确率雷达图
- [ ] 单词掌握度（基于做题历史的 SRS 间隔重复初版）

#### v01.18 — 智能推题 v1
- [ ] 优先推：错题本里 < 3 次答对的题
- [ ] 其次推：当前学段做题率 < 50% 的单元
- [ ] 简单加权随机即可，不引入复杂算法栈

#### v01.19 — PWA 离线可用（🆕 提前到 v01.14 做）
- [ ] `manifest.json` + Service Worker 缓存 `audio/` + `data/`
- [ ] 安装到桌面 / 主屏，离线也能背单词
- 备注：`manifest.json` / `icon.svg` 已就位；本轮 v01.14 落地 `index.html` 注入 + 两张 PNG + `sw.js`（SWR for data / cache-first for audio）

#### v01.20 — 多用户本地档案 ✅ 已完成（2026-05-07，详见 §11）
- [x] localStorage 存多个 profile（家里两个孩子分别记录）
- [x] 顶栏右上角加"切换学习者"

---

### 🟣 P3 · AI 真接入 & 多端（v02.x，按需启动）

> 这一阶段开始有云端依赖，需要权衡成本。

- [ ] **v02.0** AI 对话陪练真接入：OpenAI / 智谱 / 通义 任一 LLM API；按当前单元词汇/语法点的角色扮演；用户自带 Key 模式（前端直连，零后端成本）
- [ ] **v02.1** AI 语音评测：Web Speech API 兜底；进阶接腾讯云 / Azure Pronunciation Assessment
- [ ] **v02.2** 云端账号 + 跨端同步：建议选型 **Supabase**（免费层 Auth + Postgres + Storage 一站式）
- [ ] **v02.3** 家长 / 教师端轻量看板：单独页面 `/parent.html`，凭学习者码查看学习报告

---

### 🛠️ 横向技术债（穿插各版本完成）

| 项 | 优先级 | 备注 |
|---|---|---|
| `data/` 按年级分片懒加载 | 中 | `jk.json` 已偏大，再加两套教材首屏会卡 |
| `app.js` 拆 ES Module | 中 | 单文件越来越长，按功能域拆 5-6 个文件 |
| 视觉规范（设计 token） | 低 | 颜色/间距常量化，方便日后做主题切换 |
| 自动化测试 | 低 | 至少给 `applyContextChange` / `loadQuestionBank` 加冒烟测试 |
| `gen_audio_v2.py` 增量校验 | 中 | 课文文本改动后能识别"哪句变了，只重生成那句"，省时间 |

---

### 📊 里程碑时间线（按双端轮流开发节奏的预估）

| 版本 | 大致里程 | 主交付 |
|---|---|---|
| v01.10 | +1 周 | 沪教版题库框架 + 练习页联动 |
| v01.11 | +1 周 | 沪教版 ~1000 道 AI 题（含人工抽检） |
| v01.12 | +0.5 周 | 沪教版练习体验打磨 |
| v01.13-15 | +3 周 | 人教 + 外研全套教材骨架 + 音频 + 首批题 |
| v01.16-18 | +3 周 | 错题本 / 数据可视化 / 智能推题 |
| v01.19-20 | +2 周 | PWA 离线 + 多学习者档案 |
| v02.0+ | 视情况 | AI 真接入（建议先做"自带 Key"模式探路） |

---

### ✅ 给"下一次进来的 AI 助手"的执行建议

1. **接手第一件事**：跑一遍 `loadQuestionBank('hj')`，确认徽章数为 `0/32/0/0`，验证 P0 缺口仍在。
2. **不要急着扩人教/外研**：沪教版课文做完了却没题，体验断层最严重，先把 P0 闭环。
3. **AI 造题脚本扩展沪教版时**：注意 `hj.json` 里课文用的是中文弯引号 `""`，正则提取时别误判（参考 `scripts/fix_quotes_v3.py` 的判断思路）。
4. **音频零增量**：P0 / P1.2 都不需要重生成 144 篇课文 MP3，只在课文文本真改动时跑 `gen_audio_v2.py`。
5. **每个里程碑结束**：同步更新本节的 checkbox 和 §3 当前规模，push 后让对端下次 pull 看到最新状态。

## 9. 常见命令速查

```bash
# 同步最新
git pull --rebase origin main

# 生成/补齐音频（需 pip install edge-tts）
python gen_audio.py

# 生成 Excel 模板
python scripts/make_template.py

# 导入 Excel 题库
python scripts/import_questions.py path/to/题库.xlsx

# 按课文自动造题
python scripts/ai_generate_questions.py --grade 5

# 本地预览
python3 -m http.server 8765
```

---

_此文档由 PC 端 AI 助手在 2026-05-05（晚）校准至磁盘事实（jk 420 题 / hj 255 题 / 音频 303 / HEAD d91e3d6），并启动 v01.14 PWA 收尾。修改本文件后请务必 `git push`，让对端下次 pull 时看到最新状态。_

---

## 10. ⚠️ v01.20 多用户档案首次尝试与回滚复盘（2026-05-05 深夜）

> 给下次接手 v01.20 的 AI 助手看：本次尝试翻车了，已全量回滚到 `fd27ce0`。这里记录症状 / 根因推测 / 教训，避免重蹈覆辙。

### 本次尝试的改动范围（一次性全做完 → 翻车）
1. 新建 `js/profile.js`：`ProfileManager` 数据层（list / active / create / update / remove / migrateLegacyOnce）
2. `index.html` addScript 链里注入 `./js/profile.js`
3. `app.js` 引入 `_pkey(key)` 工具函数（自动给 localStorage key 加 `:profileId` 后缀）
4. `app.js` 6 个入口换用 `_pkey`：`_loadStats` / `_saveStats` / `_loadWrongbook` / `_saveWrongbook` / `loadCtx` / `saveCtx`
5. `bootstrap()` 最前面调用 `ProfileManager.migrateLegacyOnce()` 把老 key 搬到 `:default` 后缀

### 翻车症状
- 本地 `http://localhost:8765/` 首屏**按钮全部失效**（点击无反应）
- Tailwind 样式大面积失效（class 不生效）、单元列表直接显示在首页（`.hide` 没生效）
- Console 红错：`Uncaught ReferenceError: continueLearning is not defined at HTMLButtonElement.onclick ((index):148:175)`

### 根因推测（事后复盘，不 100% 确定）
- `app.js` 磁盘源码中 `function continueLearning()` **确实存在**（501 行）
- 报 undefined 的唯一可能是 `app.js` 顶层执行中**某一行更早抛了异常**，中断了后续所有 `function xxx()` 定义，导致 501 行的 `continueLearning` 根本没被绑到 window
- 最可疑的点：**一次性改动太多**，`_pkey` / `bootstrap` migrate / profile.js 注入的时序链里有微妙 bug
- 清 SW + 硬刷无效 → 排除 Service Worker 缓存因素

### 已做处理
- 备份了 6 个新建文件到 `.backup_v0120/`（已删除，彻底干净）
- `git checkout -- .` + `git clean -fd` 把工作区回到 `fd27ce0` 干净状态
- 页面恢复正常，按钮全部可点

### ⛳ 下次重做 v01.20 的**纪律**（必须遵守）

1. **每步独立 commit，改一步验一步**。不要一次性写完再整体刷浏览器。
2. 推荐拆分顺序（每步结束都要在浏览器里跑通才能进下一步）：
   - **Step 1**：只新建 `js/profile.js`，**不接任何地方**。浏览器 Console 里手动 `window.ProfileManager.list()` / `active()` 验证。→ commit
   - **Step 2**：`index.html` 注入 profile.js（放在 `state.js` 之后、`player.js` 之前）。浏览器刷一次确认页面照常跑、`window.ProfileManager` 可访问。→ commit
   - **Step 3**：`app.js` 引入 `_pkey` 工具函数 + **只改 wrongbook 一对 key**。刷页面，手动做错一题看错题本还在不在。→ commit
   - **Step 4**：同样方式只改 stats 一对 key。刷页面，看首页统计是否仍正常。→ commit
   - **Step 5**：同样方式只改 ctx 一对 key。刷页面，切年级 + 刷新看记忆是否仍正常。→ commit
   - **Step 6**：`bootstrap()` 加 `migrateLegacyOnce()`。清 localStorage 的 `:default` key 模拟老用户，刷新后看老数据是否自动搬迁。→ commit
   - **Step 7**：UI 部分（header 切换按钮 + 下拉 + 新建/编辑弹框）。→ 可拆 2-3 个 commit
3. **每步出问题立刻 `git revert` 那一步**，不要在同一个乱状态里继续调试。
4. **不要在 `js/profile.js` 的 IIFE 里做任何副作用**（如自动 migrate、自动写 localStorage）。迁移动作必须由 `app.js` 的 `bootstrap()` 在受控时机显式调用。
5. **预估工期**：按小步提交方式 ~2.5-3 小时；若按本次"一次性全做"方式实际会 >4 小时（含翻车 + 排障 + 回滚 + 重做）。

### 保留的产物
- 本次 PWA v01.14 已成功上线（`fd27ce0`），`manifest.json` / `sw.js` / `icon-*.png` / `icon.svg` 都在 HEAD 里
- `scripts/make_pwa_icons_stdlib.py` 是生成 192/512 PNG 的唯一推荐脚本（零依赖，纯 Python stdlib）

---

_2026-05-05 深夜追加：v01.20 尝试失败全量回滚，当前 HEAD 仍为 `fd27ce0`（=线上最后一次稳定 push）。本次 PWA 小收尾只做了文档记录 + 死代码清理，未 push。_

---

## 11. ✅ v01.20 多用户档案 · 重做成功记录（2026-05-07 凌晨）

> 严格按 §10 复盘里的 7 步纪律重做，**全部 7 步逐个 commit + 每步浏览器验证**，最终一次性 push 收尾。无翻车，全功能可用。

### 最终交付的 8 个 commit（在 HEAD 之前）

| 步骤 | commit | 内容 |
|---|---|---|
| Step 1 | `e8fe211` | 新建 `js/profile.js`（ProfileManager 数据层 / IIFE 零副作用 / 228 行 / 7 个 API） |
| Step 2 | `a16c7bc` | `index.html` addScript 链注入 `./js/profile.js`（state.js 之后、player.js 之前） |
| Step 3 | `f4b1e29` | `app.js` 顶部加 `_pkey(baseKey)` 工具函数（fallback-safe，先不接任何 key） |
| —— | `8805bcb` | Revert Step 3（误判 SW 兼容问题，立刻 revert） |
| Step 3' | `6a66ee3` | Reapply Step 3（清 SW + 重启 dev server 后再次确认无问题） |
| Step 4 | `08ec4b9` | `_loadWrongbook` / `_saveWrongbook` 走 `_pkey(WRONGBOOK_STORAGE_KEY)` |
| Step 5 | `0100a2f` | `_loadStats` / `_saveStats` 走 `_pkey(STATS_KEY)` |
| Step 6 | `d858ab0` | `loadCtx` / `saveCtx` 走 `_pkey(CTX_KEY)` + bootstrap 首行加 `migrateLegacyOnce()` |
| Step 7 | `0890940` | header 加 👤 档案切换按钮 + 下拉面板 + `switchToProfile()` + 新建/重命名/删除（app.js +209 / index.html +20 / styles.css +106） |

### 这次成功的关键改进 vs 上次翻车

1. **小步提交 + 浏览器逐步验证**：每改完一步立刻清 SW 硬刷验证，问题暴露范围极窄
2. **`_pkey()` fallback 设计**：内置 `try-catch + 退化为原 key`，即使 ProfileManager 异常 app.js 顶层也永不抛
3. **`profile.js` IIFE 零副作用纪律**：所有写操作必须由调用方显式触发，迁移由 `bootstrap()` 在 `loadCtx()` 之前显式调一次 `migrateLegacyOnce()`
4. **Step 7 前先用 code-explorer subagent 扫"档案绑定缓存"清单**：避免 `switchToProfile()` 漏清导致跨档案数据串台。最终重置清单：
   - 必清：`_wrongbook` / `_stats` / `_lastLoadedTextbook` / `_lastLoadedTerm` / `_lastLoadedGrade` / `state.ctx`
   - 建议清：`_wrongbookTabFilter` / `_readingExState` / `_irregPractice`
   - 不清（静态数据）：`_textbookShardCache` / `_textbookFullCache` / `_exercisesCache` / `_examplesCache` / `_irregCache` / 题库
5. **真凶澄清**：上次翻车的"按钮失效 + continueLearning is not defined"经过这次重现 + 排查，确认根因不是代码、是 **dev server 偶尔挂掉时 SW 的 networkFirst 兜底返回旧缓存 / 504**。本次坚持小步走 + 每步硬刷，规避了这个隐性陷阱

### localStorage 数据 schema（v01.20 之后）

```
yxyy_profiles_v1                   [{id,name,createdAt}, ...]
yxyy_active_profile_v1             "default" | "p_xxx_yyyy"
yxyy_migrated_legacy_v1            "1"  ← 一次性迁移完成标记

yxyy_wrongbook_v1                  老数据（保留作 fallback，不删）
yxyy_stats_v1                      老数据（保留作 fallback，不删）
yxyy_ctx                           老数据（保留作 fallback，不删）

yxyy_wrongbook_v1:default          默认档案的错题本
yxyy_stats_v1:default              默认档案的学习统计
yxyy_ctx:default                   默认档案的学习上下文
yxyy_wrongbook_v1:p_xxx_yyyy       新建档案"哥哥"的错题本
yxyy_stats_v1:p_xxx_yyyy           ...
yxyy_ctx:p_xxx_yyyy                ...
```

### 公共 API 速查（Console 调试）

```js
// 数据层
window.ProfileManager.list()                       // 所有档案
window.ProfileManager.active()                     // 当前档案 {id,name,createdAt}
window.ProfileManager.create('哥哥')               // 新建，返回新档案对象
window.ProfileManager.update(id, {name:'妹妹'})    // 改名
window.ProfileManager.remove(id)                   // 删除（自动清 3 个数据 key；只剩 1 个时拒绝）
window.ProfileManager.setActive(id)                // 切档案 ID（不重新加载数据）
window.ProfileManager.migrateLegacyOnce()          // 老数据迁移（幂等）

// app.js UI 层
window.switchToProfile(id)                         // 切档案 + 清缓存 + 重渲染（推荐用这个）
window.openProfilePanel() / closeProfilePanel()
window.refreshProfileBadge()                       // 手动刷新 header 显示

// 工具
_pkey('yxyy_stats_v1')                             // 返回 'yxyy_stats_v1:<activeId>'
```

### ⛳ 给下一个版本的提醒

- **新增任何 localStorage 数据 key**，都必须走 `_pkey()`，并把 base 加进 `js/profile.js` 顶部的 `DATA_KEYS` 常量数组（这样 `remove(id)` 才能清理干净）
- **新增任何"档案绑定"的内存缓存变量**，都必须在 `switchToProfile()` 里加一行 `_xxx = null`，否则会出现"切档案后看到上一个档案数据残留"的 bug
- 当前 7 个 ProfileManager API 已覆盖 99% 用例；如需 `import / export / 导出 JSON 备份`，可在 v01.21 扩展，不破坏现有 schema
