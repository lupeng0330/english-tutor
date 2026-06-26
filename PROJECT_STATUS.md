# 🎓 乐学英语（English Tutor）· 项目交接状态

> 这份文档给"另一端的你 / AI 助手"看的，目的是**无缝接上当前进度**。  
> 最后更新：2026-06-26（PC 端，新增：**铁律 5** 决策项必须用选项清单收集（§0）+ **jk 剩余 7 册补齐开发宪法** `JK_REMAINING_7_VOLUMES_PLAN.md` + 脚本模板化 `scripts/_jk_volume_lib.py` + 通用校验 `scripts/_verify_volume.py`；**P1-4 jk 教科版 3 上全量内容补齐**：9 单元真实教材数据 + 70 词卡 + 18 篇课文 + 210 例句 + 208 个 ex_*.mp3 §22；P0-1 听力 MP3 全量补全 160 个 §21.6；全量测试报告 §21；沪教版 6 册例句 V02.16；例句朗读本地 MP3 三级降级 + 播放交互修复 V02.20；P0-3 小学考试配置 + 无配置学段友好引导 V02.21；`sw.js` 补缓存 `js/exam.js`）  
> 对应 Git HEAD：以各章节完成记录为准（不臆造 hash）

---

## 0. 给新进来的 AI 助手的一段话

> 📌 最近一次文档状态校准：2026-06-25（PWA v01.19 标记对齐已完成态）


你好，我是在 **Windows PC 端** 协作过本项目的助手。用户 `lupeng` 的 CodeBuddy 对话上下文保存在本地 IDE，**无法跨设备同步**，所以我把关键信息整理成这份 `PROJECT_STATUS.md` 推到 GitHub。

请你在开始任何新任务前：

1. **先读完这份文件**（尤其第 4、5、7 节）。
2. 再读 `README.md` 补全产品视角。
3. 需要看具体实现时再打开对应源文件。

用户是在 **Mac 和 PC 双端轮流开发** 的，请始终走 `git pull --rebase` → 改 → `git commit` → `git push` 的工作流，不要在对方没推送前改同一文件以避免冲突。

### ⭐⭐ 固定开发规范（铁律，每个任务都必须遵守）

> 用户偏好（2026-06-25 确立 / 校准）。下面三条是**贯穿所有任务**的硬性流程，不分大小功能一律执行。

#### 铁律 1 · 每个任务完成后必须提供「电脑端 + 手机端」双验证（无需真机）

1. 起本地服务（Python，端口 8765）：
   - 后台启动：`Start-Process python -ArgumentList '-m','http.server','8765' -WindowStyle Hidden`（在项目根目录）。
2. 打开两个验证入口（用 IDE 内置浏览器 `preview_url`）：
   - **电脑端**：`http://localhost:8765/index.html`
   - **手机端（电脑上模拟）**：`http://localhost:8765/mobile.html` —— 项目自带手机模拟器，带手机外壳 + iframe 真实渲染，可切换 iPhone 14(390) / **Huawei(360, 最窄)** / iPhone 11 Pro Max(414) 三种尺寸，是验证移动端排版的首选。
3. 在回复里明确给出上面两个 URL + 本次改动「该验证哪几点」的清单。
4. 需要真机验证时，再给局域网 IP 地址（如 `http://10.9.137.65:8765/mobile.html`）+ 扫码提示。

#### 铁律 2 · 每个任务完成后必须补记本 `PROJECT_STATUS.md`（不能漏！）

> 背景：曾出现「连续几次功能开发都没写入备忘」的断档，导致对端 / 下次接手的 AI 看不到最新进度。**从此每完成一个功能，收尾动作必须包含更新本文档**，否则视为任务未完成。

每次至少更新：
- **追加一节完成记录**（接着当前最大编号往后排，如 §20、§21…）：写清问题/决策/落地改动/收口状态。
- 视情况更新 **§3 当前规模**、**§7 近期进展 git log 摘要**、相关版本计划的 **checkbox**。
- 顶部「最后更新」行同步成本次内容。

#### 铁律 3 · 验证服务不动 `version.txt`、不 push；部署只走 `dev-push.ps1`

- 本地起的服务仅用于验证，**绝不手改 `version.txt`、不擅自 push**。
- 部署 / 上线由用户确认后跑 `dev-push.ps1`（脚本自动 bump 版本号 + commit + push）；用户明确说"推送"时才执行该脚本。

#### 铁律 4 · 经用户确认的任务在自动部署上线后，必须同步更新 `PROJECT_STATUS.md`（2026-06-26 新增）

> 背景：曾出现 9A/9B 推送上线后，状态表仍标「待验收」、标题仍写「🚧 进行中」，文档与线上脱节。

- 用户验收通过 → AI 自动 `dev-push.ps1` 上线后，**收尾必须把本文档与线上状态对齐**：相关条目 / 状态表从「待验收」改为「已上线（含版本号）」、更新标题进度标记。
- 文档更新可**随业务改动一并提交**，或部署后**补一次提交**，确保文档与线上一致。

#### 铁律 5 · 涉及方案/版本/范围/节奏的决策项必须用「选项清单」收集（2026-06-26 新增）

> 背景：自然语言提问"你倾向哪种？"容易产生模糊回复或漏答某一项，导致 AI 还要再追问一轮、甚至自行假设走错路径。

**适用场景（出现以下任一即必须走清单）**：
- 教材版本 / 数据规模 / 优先级排序等会影响后续多步工作的**决定性选择**
- 任何"逐项 / 多项可选 / 是否启用"的开关式决策
- 启动一个**多批次**任务前的"开工前需确认事项"
- 把方案 A/B/C 摆给用户挑（包括"是否做某项提效"）

**做法**：
- 必须使用 `ask_followup_question` 工具，**不能在正文里散写问题**。
- 每个 question 必须配**清晰选项**：单选用 `multiSelect:false`；可多选用 `multiSelect:true`。
- 每个推荐项在选项文案末尾加【推荐】标记 + 一句话理由，**降低用户阅读成本**。
- 一次最多 4 个 question（覆盖所有决策项一次问完，避免来回追问）。

**反面案例（禁止）**：
- "你觉得 A 还是 B？" / "需要我做 X 吗？"（裸文本提问，无选项结构）
- 把多个独立决策塞进一段话里让用户用自然语言回答

**正面参考**：本文档 §22 完成后给"7 册任务单"的 4 个清单问题（Q1 版本 / Q2 容量 / Q3 节奏 / Q4 提效项）。

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
| **教材单元（教科版 jk）** | 🆕 **3 上**已替换为新版教科版 9 单元真实数据（Letters in Our Life ~ Review · A Music Show，70 词 + 18 课文，详见 §22）；其余 1-2/4-5 年级与 6 上仍为旧 2 单元占位、6 下 11 单元真实、3-9 年级实际单元详见 `data/textbooks/jk.json` |
| **教材单元（沪教版 hj）** | **48** 个（7-9 年级 × 上下册 × 8 单元；每单元 15 词 + 3 篇课文 Reading / Grammar focus / More reading） |
| **题库（jk · 单词拼写）** | 224 题 |
| **题库（jk · 听力选择）** | 52 题 |
| **题库（jk · 语法）** | 72 题 |
| **题库（jk · 阅读）** | 72 题 |
| **题库（jk 合计）** | **420 题** |
| **题库（hj · 单词拼写）** | **698 题**（v01.11 AI 自动造题，48 单元全覆盖；旧 95 题保留人工 hint，新增 603 题打 `source:"ai_v01_11"` 标签） |
| **题库（hj · 听力选择）** | 32 题（7 上全量） |
| **题库（hj · 语法）** | **480 题**（v01.12 AI 精造，48 单元各 10 题；旧 80 题保留，新增 400 题打 `source:"ai_v01_12"`） |
| **题库（hj · 阅读）** | **288 题**（v01.12 AI 精造，48 单元各 6 题；旧 48 题保留，新增 240 题打 `source:"ai_v01_12"`） |
| **题库（hj 合计）** | **1498 题** |
| **题库总计** | **1918 题** |
| **音频 MP3** | 教材/听力类 303 个（教科版课文 42 + 教科版听力 31 + 沪教听力 32 + 沪教课文 144 + 杂项 54）；🆕 P0-1 沪教听力补全 160 个（§21.6）；🆕 例句朗读 `ex_*.mp3` 共 2697 个（沪教 6 册 + jk 6下 + 🆕 **jk 3上 208 新增 §22**） |
| **音频增量元数据** | `audio/.manifest.json`：143 条 hash 记录，下次跑 `gen_audio_v2.py` 零改动时 0.53 秒扫完；🆕 句级增量后每篇额外记录 `sentences[]`（拼接顺序 + 句 hash） |
| **前端代码** | 🆕 `app.js` **577 行**（按功能域拆分后，原 3851 行）+ `js/` 下 **12 个**全局变量风格模块（`textbook`/`state`/`profile`/`player` + 🆕 `core`/`wrongbook`/`mastery`/`smartpick`/`stats`/`home`/`lesson`/`practice`） |
| **PWA 雏形** | ✅ 已落地（v01.14）：`manifest.json` 已注入 `index.html`、192/512 PNG 已补齐、`sw.js` 已建并预缓存 `data/` + `audio/`，支持桌面/主屏安装 |

教材版本占位：`rj`（人教）、`wy`（外研）尚未填充数据。

---

## 4. 目录与关键文件

```
english-tutor/
├── index.html              # 主页面。顶部 sticky「学习上下文条」（年级/学期/教材）
│                           # 🆕 底部动态按序注入 js/*.js → questionBank.js → app.js
├── styles.css              # 含移动端深度适配
├── app.js                  # ★ 精简入口（577 行）：switchPage / applyContextChange / bootstrap / AI 对话 / Profile UI 绑定 / 初始化编排
├── questionBank.js         # ★ 题库异步加载器 window.loadQuestionBank(textbookId)
│
├── js/                     # 🆕 全局变量风格分片（经典脚本，非 ES Module；index.html 按序注入、sw.js 预缓存）
│   ├── textbook.js         # textbookData / loadTextbook / 分片缓存 / _bust
│   ├── state.js            # state 对象 / TEXTBOOK_NAMES/GRADES/LABELS / ctxSummaryText
│   ├── profile.js          # 多用户档案 ProfileManager / _pkey / DATA_KEYS
│   ├── player.js           # speakBrowser / speak / stopSpeak / playYoudao 系列
│   ├── core.js             # 🆕 共享纯工具：_pkey / _escapeHtml / _answerMatch / gradeText
│   ├── wrongbook.js        # 🆕 错题本数据层 + UI（window.__wrongbook）
│   ├── mastery.js          # 🆕 题目级掌握度（window.__mastery）
│   ├── smartpick.js        # 🆕 智能推题打分（window.__smartpick）
│   ├── stats.js            # 🆕 学习统计 + 计时器 + 版本检查（window.__stats / forceCheckUpdate）
│   ├── home.js             # 🆕 首页渲染（renderHomeStats / continueLearning）
│   ├── lesson.js           # 🆕 单元/课文/阅读练习/单词卡/课文播放/滑动手势
│   └── practice.js         # 🆕 练习答题（filterQuestions / startPractice / showQuiz / startSmartPractice / 不规则动词）
│   # 加载顺序：textbook→state→profile→player→core→wrongbook→mastery→smartpick→stats→home→lesson→practice→questionBank→app.js
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
│   ├── _sent/{篇base}/{句hash}.mp3  # 🆕 句级增量：单句音频持久缓存（gitignore，构建用）
│   └── .manifest.json      # 增量校验元数据：{fname: {text_hash, textbook, generated_at, 🆕 sentences[]}}
│
├── gen_audio.py            # 旧版单文件音频脚本
├── gen_audio_v2.py         # 🆕 V2：按篇 + 多音色 + 篇级/🆕句级增量（--dry-run / --stale-only / --force）
│
├── tests/                  # 🆕 冒烟测试
│   ├── smoke.py            # Playwright headless：断言 35 全局函数 + 关键调用无异常
│   └── README.md           # 运行说明
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
- [x] 单词拼写：每单元词全量出题 → **698 题**（教材实际 698 词，非 720；7A 部分单元 ≠15 词；详见 §12）
- [x] 语法：基于 Grammar focus 课文核心点，每单元 **10 题** → **480 题**（48 单元全覆盖，详见 §17）
- [x] 阅读：基于 Reading + More reading 课文，每单元 **6 题** → **288 题**（48 单元全覆盖，详见 §17）
- [x] AI 精造（非规则生成器），对齐 7A schema/风格，新题打 `source:"ai_v01_12"`；校验脚本 + smoke 回归全绿

#### v01.12 — 沪教版练习体验打磨 ✅ 已完成（2026-06-25，详见 §17）
- [x] 单词拼写支持"按当前单元 / 全册 / 全年级"三档范围筛选
- [x] 听力题增加"原文显示开关"（默认隐藏，做完才能看）
- [x] 阅读题长文滚动 + 题目悬浮，避免反复滚屏
- [x] 练习页徽章统一格式：`沪教 · 7上 · 共 95 题`

#### v01.13(例句) — 沪教版单词例句补全（✅ 已完成：6 册 7A/7B/8A/8B/9A/9B 全部上线，截至 20260626V02.16）

> 用户反馈：单词卡「例句阶梯」目前**只有沪教版初一上册（7A）有**，其余册全空。  
> 根因（已查实）：例句数据来自单词自带 `examples` 字段或独立文件 `data/examples/{教材}_{年级}_{学期}.json`；当前 `data/examples/` 下仅 `hj_grade7_shang.json`（沪教 7A）与 `jk_grade6_xia.json` 两份，沪教其余 5 册无例句文件 → 例句区为空。  
> **本轮已确认决策**：范围**先只做沪教版（hj）**，其他教材（jk / 人教 / 外研）**暂不做，后续单独排期**；方式选 **A 人工精编、按册分批交付**（逐词结合本单元课文语境，每词 3 句易/中/难），**不走脚本批量模板**。

待补清单（沪教版 hj，约 598 词 ≈ 1800 条例句）：

| 册 | code | 词数 | 例句文件 | 状态 |
|---|---|---|---|---|
| 初一上 | 7A | 98 | `hj_grade7_shang.json` | ✅ 已有（基准样例） |
| 初一下 | 7B | 120（119词条，dream去重） | `hj_grade7_xia.json` | ✅ 已上线（20260625V02.13） |
| 初二上 | 8A | 120（118词条，ancient/useful各去重1） | `hj_grade8_shang.json` | ✅ 已上线（20260626V02.14） |
| 初二下 | 8B | 120（119词条，dream去重） | `hj_grade8_xia.json` | ✅ 已上线（20260626V02.15） |
| 初三上 | 9A | 120（118词条，audience/species各去重1） | `hj_grade9_shang.json` | ✅ 已上线（20260626V02.16） |
| 初三下 | 9B | 120（118词条，tradition/culture各去重1） | `hj_grade9_xia.json` | ✅ 已上线（20260626V02.16） |

> 🎉 至此沪教版 6 册例句**全部补全并上线**（7A基准 + 7B/8A/8B/9A/9B 人工精编，每词 3 句易/中/难），前端零改动。任务收尾。

#### v02.20(例句朗读) — 本地 MP3 三级降级 + 播放交互修复（✅ 已上线 20260626V02.20）

> 例句 🔊 朗读改为三级降级：① 本地预生成 `audio/ex_*.mp3`（离线最稳）→ ② 有道在线真人音频 → ③ 浏览器 TTS 兜底；并给 6 册 hj + jk 6下例句数据补 `audioFile` 字段、批量生成 `ex_*.mp3`。

本轮修复的 3 个交互 bug（`js/lesson.js`）：

| # | 现象 | 根因 | 修复 |
|---|---|---|---|
| 1 | 连点例句叠音 / 切词后旧句仍在响 | `_stopExampleAudio()` 清 `src=''` 触发 `onerror`→`failLocal`→在线重播 | 停止前先解绑 `onerror/onended/onplaying` 再 pause+清 src |
| 2 | 切单词卡后例句声音不停 | 重渲染只停本地 MP3，没停在线/TTS | `renderWordExamples()` 开头补 `stopSpeak()` |
| 3 | 连点多条后前面几条喇叭卡激活、再点不响 | 旧按钮 `reset()` 是局部闭包，停音够不到其 UI，卡 disabled | 全局 `_exampleBtnReset` 引用，切换前先复位上一个按钮 UI |


执行约定：
- **数据格式**沿用 `data/examples/hj_grade7_shang.json`（`{ words: { 单词: [{en, cn, level}] } }`，level=1/2/3 对应易/中/难），落到 `data/examples/hj_gradeX_{shang|xia}.json`，**前端加载逻辑已支持（`loadExamplesIfNeeded`），无需改任何前端代码**。
- **按册分批**：先做 **初一下(7B)** 交付 → 用户验收质量/节奏 → 再逐册推进 8A/8B/9A/9B。
- 每册完成后照铁律双端验证（例句区显示 + 朗读出声）并单独推送，便于按册回滚。
- 词表来源：`data/textbooks/hj_grade{7,8,9}.json` 的 `grades.gradeN['上'/'下'][*].words[]`。

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

#### v01.16 — 错题本（纯前端 localStorage，零成本）✅ 已完成（2026-06-23，详见 §13）
- [x] 答错的题自动入错题本，按 `教材 + 题型 + 错误次数` 分桶（数据层 v01.20 已就绪）
- [x] 学习页新增"错题本"独立页入口（首页卡片 + 侧栏），可浏览/筛选/展开看答案解析/单题删除/一键重练

#### v01.17 — 学习数据可视化（真实数据）✅ 已完成（2026-06-23，详见 §14）
- [x] 报告页接真实统计：顶部 4 卡 + 每日学习时长柱状图 + 每日正确率折线图
- [x] 各题型正确率分布 + 弱项分析（按正确率排序，样本≥3 才纳入）
- [x] 扩展数据结构：`answers` 加 `type`、新增 `dailySeconds` 每日时长序列（向后兼容）
- [x] Chart.js 本地化 + 加入 SW 预缓存，离线报告页图表可用
- [ ] （后续）单词掌握度 SRS 间隔重复初版 / 时长热力图 / 雷达图 — 留待 v01.18+

#### v01.18 — 智能推题 v1 ✅ 已完成（2026-06-24，详见 §15）
- [x] 优先推：错题本里 < 3 次答对的题（题目级掌握度表 `perItemMastery`）
- [x] 其次推：当前学段做题率 < 50% 的单元（`_unitCoverage` 单元覆盖率加权）
- [x] 4 维加权打分（错题加权 + 新题曝光 + 掌握度衰减 + 单元覆盖率），不引入重算法栈
- [x] UI：练习开始前显示「本次推荐理由」摘要条 + 单题「为什么推这题」可解释标签
- [x] 跨题型「🧠 智能推荐练习」入口 + 智能推题开关（持久化，可关闭走纯随机）

#### v01.19 — PWA 离线可用 ✅ 已完成（🆕 已在 v01.14 提前落地，见 §10 收尾记录）
- [x] `manifest.json` + Service Worker 缓存 `audio/` + `data/`
- [x] 安装到桌面 / 主屏，离线也能背单词
- 备注：v01.14 已落地 `index.html` 注入 manifest + apple-touch-icon、两张 PNG、`sw.js`（SWR for data / cache-first for audio / version.txt 不拦截 + install 时 skipWaiting + activate 清旧缓存）

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
| `data/` 按年级分片懒加载 | 中 | ✅ 已完成（`b5dae7f`，`hj.json` 按年级分片懒加载） |
| `app.js` 按功能域拆模块 | 中 | ✅ 已完成（2026-06-24，详见 §16）· **方案 A 全局变量风格分片**（非 ES Module，内联 onclick 零改动）：`app.js` 3851→577 行，新增 9 个 `js/*.js` |
| 视觉规范（设计 token） | 低 | ✅ 已完成（2026-06-24，详见 §16）· `styles.css` `:root` 建立完整 token 体系，硬编码色/圆角/阴影全量 `var()` 化（视觉等值不变） |
| 自动化测试 | 低 | ✅ 已完成（2026-06-24，详见 §16）· `tests/smoke.py`（Playwright headless）覆盖 35 个全局函数 + `applyContextChange`/`filterQuestions` 等关键调用 |
| `gen_audio_v2.py` 句级增量 | 中 | ✅ 已完成（2026-06-24，详见 §16）· 句 hash + `audio/_sent/` 持久缓存，改一句只重念那一句 |

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

_此文档于 2026-06-25 由 PC 端 AI 助手做状态校准：题量与 PWA 状态以 §3 规模表与各章节完成记录为准（jk 420 题 / hj 1498 题 / 音频 303 / PWA v01.19 已落地）。修改本文件后请务必 `git push`，让对端下次 pull 时看到最新状态。_

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

---

## 12. ✅ v01.11 沪教版 AI 自动造题 · 完成记录（2026-05-07 凌晨）

> 严格按 §10 复盘里的"小步 + 可回滚"纪律执行，**全程零破坏：旧 95 题字节级未动；新增 603 题全部带 `source:"ai_v01_11"` 标签可一键回滚**。

### 关键产出

| 指标 | 数值 |
|---|---|
| `data/questions/hj_spelling.json` 题数 | **95 → 698**（+603） |
| 沪教 48 单元覆盖 | 8/48 → **48/48**（7A_U1 ~ 9B_U8 全覆盖） |
| 旧题改动 | **0 行 -**（`git diff --stat`：1 file changed, 6633 insertions(+), 0 deletions） |
| 新题 source 标签 | 603 条全部带 `"source": "ai_v01_11"` |
| 前端代码改动 | **0 行**（数据驱动，`loadQuestionBank('hj')` 自动读取） |
| 教材生词总数 N1 | **698**（不是计划中的 720；7A 部分单元词数 ≠15，见下） |

### 7A 单元词数异常清单（教材原始数据，非脚本问题）

| code | 实际词数 | 偏差 |
|---|---|---|
| 7A_U1 | 17 | +2 |
| 7A_U3 | 10 | -5 |
| 7A_U4 | 13 | -2 |
| 7A_U5 | 11 | -4 |
| 7A_U6 | 10 | -5 |
| 7A_U7 | 11 | -4 |
| 7A_U8 | 11 | -4 |

> 7B / 8A / 8B / 9A / 9B 共 40 个单元每个严格 15 词。`hj.json` 的 `meta.note_progress` 自述"每单元 15 词"与 7A 实际数据不符，但本次不动教材，按教材实际词数生成题目即可。如后续要把 7A 补齐到 15 词/单元，加完后重跑 `--mode merge-spelling` 因去重生效会自动只补差额，幂等安全。

### 关键决策落地

| 决策 | 落地 |
|---|---|
| **scope** = A | 仅做拼写题，未触碰 hj_listening/grammar/reading.json |
| **ai_mode** = A | 纯本地规则（`gen_spelling_for_unit`），零 API、零网络、零依赖 |
| **merge_policy** = B | 直接 append 到主题库 hj_spelling.json，新题字段 `source:"ai_v01_11"` |
| **dedup** = C | `(code, answer.lower())` 二元组去重，旧 95 题完整保留人工 hint/explain |

### 脚本扩展（`scripts/ai_generate_questions.py`）

新增 `--mode merge-spelling` 子命令，**原 `--mode auto` 行为完全不变**（向后兼容）：

```bash
# Dry-run（看统计不写文件）
py -3 scripts/ai_generate_questions.py --mode merge-spelling --textbook hj

# 实际写入
py -3 scripts/ai_generate_questions.py --mode merge-spelling --textbook hj --write
```

输出示例（dry-run）：

```
[merge-spelling] 教材: hj.json
  候选总数 = 698
  已存数   = 95 (主题库当前 95 题)
  跳过(已存) = 95
  新增      = 603  [打 source=ai_v01_11]
  写入后总数 = 698
```

实现要点：

1. **OCP**：不改 `gen_spelling_for_unit` 函数本体，仅在调用方加 `source` 注入与去重过滤
2. **字段顺序对齐**：`SPELLING_FIELD_ORDER = [grade, term, code, q, answer, hint, difficulty, explain, source]`，避免 git diff 视觉混乱
3. **原子写入**：先写 `hj_spelling.json.tmp` 再 `os.replace`，避免中途崩溃留下半截文件
4. **幂等**：再次执行因去重生效不会产生重复题，可重跑验证
5. **可回滚**：一行 jq 即可剔除全部新题：
   ```bash
   jq 'map(select(.source != "ai_v01_11"))' data/questions/hj_spelling.json > /tmp/x && mv /tmp/x data/questions/hj_spelling.json
   ```

### 已知遗留 / 给下个版本的提醒

1. **难度统一为 3**：现有 `gen_spelling_for_unit` 规则 `grade>6 → difficulty=3`，导致新增 603 题难度全为 3，与旧 95 题"按词难度梯度标注（1/2/3 混合）"风格不一致。**前端不影响**（仅徽章显示和未来按难度筛题用）。如要校准：v01.11.x 可加一个轻量"按词长 / 词频"的 difficulty 启发式重打分，**只对 `source:"ai_v01_11"` 的题生效**，旧题继续保留人工值。
2. **explain 模板偏单一**：新增题 explain 是 `"'{中文}' 的英文是 {word}"` 的固定模板，不如旧题人工写的那么精彩（如旧题里的"h 不发音"、"-tient 结尾"等记忆点）。后续可在 v02.0 接 LLM 时只针对 `source:"ai_v01_11"` 的题做 explain 二次润色，仍保留 hint/answer 不动。
3. **7A 词数异常未修**：见上文清单，纯教材数据问题，本版本不修。如要补，加完词后直接重跑 `--mode merge-spelling --write` 会自动只补差额。
4. **listening / grammar / reading 仍是 v01.10 状态**（32 / 80 / 48），按 §8 v01.11 子任务表，留给 v01.11.x 或独立版本继续。

### 提交计划（本次会话内将分批 commit）

| 文件 | commit 主题 |
|---|---|
| `scripts/ai_generate_questions.py` | `feat(ai): ai_generate_questions 新增 --mode merge-spelling 子命令（去重/source 标签/原子写入）` |
| `data/questions/hj_spelling.json` | `feat(hj): v01.11 沪教版拼写题全量补齐至 698 题（48 单元全覆盖，旧 95 题字节不变）` |
| `PROJECT_STATUS.md` | `docs: 同步 v01.11 完成记录（§3 规模 / §8 checkbox / §12 复盘）` |

> 三个 commit 拆开，便于日后单独 revert（例如只想撤题库不撤脚本，或只想撤文档）。

---

## 13. ✅ v01.16 错题本独立页 · 完成记录（2026-06-23）

> P2 学习闭环第一阶段。严格按 §10 纪律小步走：4 步逐个 commit，每步 lint + 浏览器加载验证无顶层异常。错题本数据层 v01.20 已就绪，本次主要补"独立浏览/复习 UI + 单题删除 API"。

### 交付的 4 个 commit

| 步骤 | commit | 内容 |
|---|---|---|
| Step 1 | `b7d7083` | `app.js` 错题本区新增 `removeWrongQuestion(_key)` 单题删除 API（复用 `_pkey` 隔离 + 内存缓存，挂到 `window.__wrongbook.remove`） |
| Step 2 | `1addfef` | 错题本独立页 UI 骨架：侧栏 `data-page="wrongbook"` nav + 首页橙色入口卡片（角标 `homeWrongCount`）+ `<section id="page-wrongbook">` + `styles.css` 错题本样式（`.wb-filter-tab` / `.wb-item` / `.wb-type-tag`） |
| Step 3 | `cadfc59` | `app.js` 实现 `renderWrongbookPage()`（按当前教材范围列表 + 题型筛选 Tab + 展开看选项/答案/解析 + 单题删除 + 一键重练）；`switchPage` 增 `wrongbook` 分支；`renderHomeStats` 更新首页角标 |
| Step 4 | （本次文档） | `PROJECT_STATUS.md` 同步 §8 checkbox + §13 完成记录 |

### 关键实现点

1. **复用而非重造**：一键重练直接复用 `startPractice('wrongbook')`；列表数据走现有 `getWrongQuestions(filter)`；角标走 `getWrongQuestions` 计数。
2. **题型兼容渲染**：`_wbAnswerText(rec)` 统一兼容三种存储结构 —— 选择题（`options[]` + `answer` 索引）、拼写题（`answer` 字符串）、阅读自测（`correct` 字段）。
3. **范围口径一致**：错题本页 + 首页角标 + 一键重练 全部按 `当前教材(textbook)::` 前缀过滤，口径统一（`_wbCountCurrentTb()`）。
4. **题型筛选 Tab**：全部 / 单词(spelling) / 听力(listening) / 语法(grammar) / 阅读(reading) / 阅读自测(reading_qa)，状态变量 `_wbPageFilter`。
5. **多用户隔离**：未新增 localStorage base key（`yxyy_wrongbook_v1` 已在 `DATA_KEYS` 且已走 `_pkey`），无需改 profile.js。

### 给下一阶段（v01.17）的提醒

- 当前 `stats.answers` 元素仅 `{at, ok}`，**无题型字段**；`stats` 时长只有 `totalSeconds/todaySeconds` 两个标量，**无每日序列** —— v01.17 要按题型分布 + 每日时长趋势，需先扩展数据结构并改答题写入挂钩（拼写 L2340 区 / 选择 `answerQuiz` L2520 区 / `recordAnswerStats`）。
- `renderReport`（report 页）目前仍全是 mock 数据；Chart.js 走 CDN（index.html `<head>`），离线不可用，v01.17 需本地化并加入 `sw.js` 的 `STATIC_ASSETS`。
- **version.txt 由 `dev-push.ps1` 自动管理**（ISO 周版本号 + hash + 时间戳），部署时跑脚本即可，勿手改。

---

## 14. ✅ v01.17 数据可视化（真实数据）· 完成记录（2026-06-23）

> P2 学习闭环第二阶段。承接 §13 的提醒，把报告页从 mock 切到真实统计，并扩展数据结构支撑题型分布与每日时长趋势，同时把 Chart.js 本地化保证离线可用。严格按 §10 纪律：3 步逐个 commit，每步 lint + 浏览器加载验证无顶层异常。

### 交付的 3 个 commit

| 步骤 | commit | 内容 |
|---|---|---|
| Step 1 | `f755842` | 扩展 `stats` 数据结构：`answers` 元素由 `{at,ok}` → `{at,ok,type}`；`_loadStats` 初始化 `dailySeconds`（每日时长序列）；计时器 IIFE 按天滚动落盘 `dailySeconds`；答题判定挂钩（拼写 + 选择）改传 `recordAnswerStats(isCorrect, realType)`。旧记录缺 `type`/`dailySeconds` 全部容错 |
| Step 2 | `4a001ad` | Chart.js 4.4.0 本地化到 `js/vendor/chart.umd.min.js`；`index.html` `<head>` 改本地引用；`sw.js` `STATIC_ASSETS` 加入 `chart.umd.min.js`（并补回 v01.20 遗漏的 `js/profile.js`），保证离线报告页图表可用 |
| Step 3 | `7179a10` | 重写 `renderReport()` 接真实数据：顶部 4 卡（总时长/题数/平均正确率/掌握单词）+ 题型正确率分布（复用 `unitMastery` 容器，含 `reading_qa`）+ 弱项分析（按正确率排序，样本≥3）+ 每日时长柱状图 + 每日正确率折线图；移除 `chartsInited`/`unitsMock`，图表每次进入先 `destroy()` 再重建 |
| Step 4 | （本次文档） | `PROJECT_STATUS.md` 同步 §8 checkbox + §14 完成记录 |

### 关键实现点

1. **向后兼容只增不改**：`answers` 仅追加 `type` 字段，不动判定逻辑；读取处对旧记录缺 `type` 不计入题型分布（仍计入总题数），缺 `dailySeconds` 用 `|| {}` 容错，零迁移成本。
2. **图表资源管理**：`_studyChart`/`_scoreChart` 持有实例引用，每次进入报告页先 `destroy()` 旧实例再 `new Chart`，根治"仅初始化一次"的陈旧数据与重复 new 报错，避免 canvas 上下文泄漏。
3. **离线优雅降级**：`renderReport` 内 `if (typeof Chart === 'undefined') return;` —— 即使 Chart.js 未加载，统计卡/分布/弱项的 DOM 文本仍正常渲染，仅跳过图表。
4. **题型分布口径**：选择/拼写/听力/语法/阅读走 `answers` 按 `type` 聚合；阅读自测（`reading_qa`）单独并入 `readingExDone`，不回写 `answers` 以免"总题数"重复计数。
5. **PWA 缓存修复**：顺带补回 `js/profile.js`（v01.20 多用户档案核心，此前漏加预缓存），离线首屏不再缺档案模块。

### 收口状态

- P2 学习闭环两阶段（v01.16 错题本独立页 + v01.17 数据可视化）**全部完成**，共 7 个 commit（`b7d7083`…`7179a10`）。
- 本地 lint 全绿、`index.html` / `js/vendor/chart.umd.min.js`（205222 B）本地服务器均 200。
- **version.txt 仍由 `dev-push.ps1` 自动管理**，上线时跑脚本即触发 SW 缓存刷新，本次未手改、未 push。

---

## 15. ✅ v01.18 智能推题 v1 · 完成记录（2026-06-24）

> P2 学习闭环第三阶段。在 §14 真实统计的基础上，把"刷题"升级为"智能推题"：用题目级掌握度 + 错题本 + 单元覆盖率做加权打分，并把推荐逻辑做成用户可感知、可解释、可关闭。严格按 §10 纪律：拆 7 步逐个验证，**每一步都用真实浏览器（Playwright + Chromium，headless）注入 localStorage 数据 → 调用全局函数 → 断言 → 截图**后才确认通过（不再用 HTTP 200 糊弄）。

### 交付的 7 步

| 步骤 | 内容 | 真实浏览器验证 |
|---|---|---|
| Step 1 | 题目级掌握度数据层 `perItemMastery`：`_loadMastery/_saveMastery/recordMastery/_masteryOf/masteryLevel` + `window.__mastery`；答题判定两处（拼写 + 选择）挂钩 `recordMastery`；key `yxyy_mastery_v1` 进 `_pkey` + 注册 `DATA_KEYS` | 注入后断言读写一致 |
| Step 2 | 4 维加权打分 `_scoreQuestion`（错题本加权 + 新题曝光 bonus + 掌握度衰减 + 单元覆盖率<50% 加权）+ `_unitCoverage`/`_tallyMeta`；`pickSmartQuestions` 接开关、算 ctx、写 `state.lastSmartMeta`；`window.__smartpick` | 13 项断言 allpass |
| Step 3 | `_renderPickSummary()` 渲染练习页顶部推题构成摘要条（仅智能模式显示）；`startPractice` 普通 + 错题本两分支正确接管（修复错题本残留误显示） | 8 项断言 allpass + 截图 |
| Step 4 | `showQuiz` 题目标记：`realType = q._wbType||state.quizType`，按 reason 写 `#quizWhy` 可解释文案（wrong/new/weak/review 四态），受开关控制显隐 | 11 项断言 allpass |
| Step 5 | 统一 3 处 `realType` 解析；新增跨题型 `startSmartPractice()`（4 题型加权采样不放回取 10 题，`_wbType` 标识真实题型），首页「🧠 智能推荐练习」入口卡片 | 9 项断言 + 截图证实拼写4/听力2/语法2/阅读2 混合组卷 |
| Step 6 | 智能推题开关数据层 `_loadSmartPick/_saveSmartPick/setSmartPick/toggleSmartPick/_renderSmartPickToggle`，key `yxyy_smartpick_v1` 持久化（关闭走纯随机 Fisher-Yates）；`switchPage` practice 分支恢复开关态 | 12 项断言 allpass |
| Step 7 | 收口：`PROJECT_STATUS.md` 同步 §8 checkbox + §15 完成记录；清理全部临时验证脚本/输出/截图 | 离线 + 浏览器整体回归 |

### 关键实现点

1. **题目级掌握度 `masteryLevel(rec)`**：正确率×0.7 + 连对加成 + 充分练习微调，作为打分的"掌握度衰减"维度——越熟越少推，低于 0.4 反而以 `💪` 加权补强。
2. **4 维打分模型**：错题本（按 `wrongCount` 与最近错误时间衰减加权）+ 新题曝光 bonus（未 seen 加 `✨`）+ 掌握度衰减 + 单元覆盖率（当前学段该 `code` 做题率 <50% 额外加权），reason 归类 `wrong/new/weak/review` 驱动可解释标签。
3. **混合题型零特判**：`showQuiz` 全部渲染分支（listening/reading/spelling/选择）统一基于 `realType = q._wbType||state.quizType`，故 `startSmartPractice` 给每题打 `_wbType` 后，跨题型组卷可被既有渲染/判定/错题本逻辑无缝复用。
4. **可感知 + 可解释 + 可关闭**：摘要条说明"本次为何这样组卷"，单题标签说明"为什么推这题"，开关持久化（`yxyy_smartpick_v1`）允许回退纯随机，三者均受开关统一控制显隐。
5. **多档案隔离**：新增两个 base key（`yxyy_mastery_v1`/`yxyy_smartpick_v1`）均走 `_pkey` 加 profile 后缀并注册到 `js/profile.js` 的 `DATA_KEYS`，与既有 wrongbook/stats 一致。

### 收口状态

- 第 1~6 步代码改动全部完成，**每步真实 Chromium 验证 allpass=True**（断言累计 13+8+11+9+12 项 + 多张视觉截图核对），临时脚本/输出/截图已清理。
- 仅新增 2 个 localStorage key，无新增静态文件，`sw.js` 预缓存清单无需变更；版本号变化即触发 SW 缓存刷新。
- **version.txt 仍由 `dev-push.ps1` 自动管理**，本次未手改、未 push，待用户确认后再部署上线。

---

## 16. ✅ 技术债清理与框架优化（2026-06-24，纯重构·零行为变更）

> 目标：为后续填充教材/题库内容打好工程基础。**铁律：运行时表现/视觉/交互与现状完全一致**，只动结构不动逻辑。一次性完成 4 项横向技术债（详见 §8 表格已勾选）。

### 16.1 `app.js` 按功能域拆模块（方案 A·全局变量风格）

- **决策**：经典脚本中顶层 `function foo(){}` 自动成为 `window` 属性、顶层 `let/const` 是跨脚本共享的全局词法绑定，因此"剪切函数块到新文件 + 维护加载顺序"即可**零改动迁移**。**明确不采用 ES Module**（避免内联 `onclick` 全量失效的高风险改造）。
- **结果**：`app.js` 3851 → **577 行**；抽出 8 个新分片（数据算法层 `core/wrongbook/mastery/smartpick/stats` + 渲染交互层 `home/lesson/practice`）。所有原 `window.xxx` 导出随函数迁移，无重复声明。
- **三同步**：每个分片同时进入 `index.html` 注入链与 `sw.js` 的 `STATIC_ASSETS` 预缓存。加载顺序：`textbook→state→profile→player→core→wrongbook→mastery→smartpick→stats→home→lesson→practice→questionBank→app.js`（被依赖者在前）。
- **保留在 app.js 入口的关键时序**：`bootstrap` 异步 IIFE 与 `applyContextChange` 的"异步改写"必须留在 app.js 且保持原相对顺序（改写须先于 bootstrap 的 await 回调执行）。
- **零内容变更验证**：行多重集比对——原 3850 行 == 各分片函数体 3850 行，逐行 [PASS]。

### 16.2 视觉规范 / 设计 token

- `styles.css` `:root` 从 3 个变量扩为**完整 token 体系**：品牌/中性/语义色（成功/警告/危险）、品牌渐变、圆角 `--r-xs…--r-pill/--r-circle`、阴影 `--shadow-card/-hover/-nav/-btn/-warn/-panel`、品牌 alpha。
- 散落的硬编码颜色/圆角/阴影**全量 `var()` 化**，token 值与原值 **1:1 等值映射**，视觉像素级不变。
- `mobile.html` 是开发预览工具（iframe 套 index.html，独立深色主题，且不加载 styles.css），与 App 设计语言无关 → **按 §计划"无则跳过"原则不做 token 化**。

### 16.3 自动化冒烟测试

- `tests/smoke.py`（Python Playwright + headless Chromium，**零新增 npm 依赖**）：等 `app.js` 末尾导出就绪 → 断言 **35 个全局函数** + **4 个命名空间对象**（`__wrongbook/__mastery/__smartpick/__stats`）存在 → 安全调用 `renderHomeStats/renderWrongbookPage/applyContextChange` + `filterQuestions('word')` → 监听 `pageerror/console.error` → 首页截图。
- 拆分后 + token 化后**两轮回归均 [PASS]：0 JS 报错、0 断言失败**，内联 `onclick` 目标（`switchPage/openUnit/answerQuiz/startPractice`）全部在 `window` 上。

### 16.4 `gen_audio_v2.py` 句级增量

- 在原"篇级 hash 增量"之上新增**句级增量**：每篇按说话人/叙述句切分，对每句计算 `hash(句文本 + 分配音色 + 语速)`，单句音频持久化到 `audio/_sent/{篇base}/{句hash}.mp3`。
- 重生成一篇时只对 hash 变化的句子重跑 TTS，未变句直接复用缓存，再按 `manifest.sentences[]` 顺序二进制拼接。**改一个字也只重念那一句**。
- **完全向后兼容**：篇级 hash 匹配仍走 `skip-fresh` 快速路径；旧 manifest（legacy_import，无 sentences）行为不变；`--force`（逐句重跑，忽略缓存）/`--dry-run`（报告句级 复用/重跑 统计）/`--stale-only` 语义保留。`audio/_sent/` 已加入 `.gitignore`。
- **验证**：`--dry-run`（含 `--force`）真实跑通切句/音色分配/句 hash；离线伪造 TTS 自测 8 项 [PASS]——改一句确认 `复用2/重跑1`、`detail=['Tom=cache','Amy→Ana','narr=cache']`。

### 收口状态

- 四项全部完成；**未改任何运行时逻辑**；新增 9 个 `js/*.js` 已同步进 `index.html` 注入链与 `sw.js` 预缓存。
- 临时验证脚本/输出全部清理；`tests/smoke.py` + `tests/README.md` 作为长期回归资产保留。
- **version.txt 仍由 `dev-push.ps1` 自动管理**，本次未手改、未 push，待用户确认后再部署上线。

---

## 17. ✅ v01.11 语法/阅读补齐 + v01.12 练习体验打磨 · 完成记录（2026-06-25）

> P0 沪教版练习闭环收尾。把仅覆盖 7A 的语法/阅读题 **AI 精造补齐到全部 48 单元**，并落地 v01.12 四项练习体验打磨。延续 §10 "小步 + 可回滚 + source 标签" 纪律：旧题字节不动，新增题全部带 `source:"ai_v01_12"`，分册（7B→8A/8B→9A/9B）逐批造题、每批跑校验。

### 17.1 题库补齐（AI 精造，非规则生成器）

| 指标 | 数值 |
|---|---|
| `data/questions/hj_grammar.json` | **80 → 480**（+400；40 单元 × 10 题/单元） |
| `data/questions/hj_reading.json` | **48 → 288**（+240；40 单元 × 6 题/单元） |
| 沪教 48 单元覆盖（语法/阅读） | 8/48 → **48/48** 全覆盖 |
| 旧题改动 | **0 行 -**（旧 80 语法 / 48 阅读 字节级未动） |
| 新题 source 标签 | 全部带 `"source": "ai_v01_12"`（可一键回滚） |
| 前端代码改动 | **0 行**（数据驱动，`loadQuestionBank('hj')` 自动读取） |

- **造题方式**：逐单元阅读 `data/textbooks/hj_grade{7,8,9}.json` 的 `lessons[]`（Reading / Grammar focus / More reading）+ `words[]`，人工水准编写贴合课文情节与语法点的题目；**不复用** `scripts/ai_generate_questions.py` 的正则规则生成器。
- **严格对齐 7A schema**：语法 `grade,term,code,q,options,answer,explain,difficulty`；阅读 `grade,term,code,passage,q,options,answer,explain,difficulty`（同一 passage 重复挂在该篇每道小题）；`answer` 为正确选项下标；`difficulty` 用 1/2/3 混合梯度；`code` 形如 `7B_U1`/`9B_U8`。
- 阅读 passage 用课文忠实精简版，英文 passage 内引文用单引号避免 JSON 转义冲突。

### 17.2 新增工具脚本（纯标准库）

| 脚本 | 用途 |
|---|---|
| `scripts/validate_questions.py` | 一次性校验：JSON 可解析 + 字段完整 + options≥2 + answer 下标合法 + code 正则 `^([789])([AB])_U(\d+)$` + difficulty∈{1,2,3} + 48 单元全覆盖与每单元题量（grammar 10 / reading 6）。有 ERROR 退出码 1 |
| `scripts/append_questions.py` | `append_questions.py <grammar\|reading> <batch.json> [source]`：按 code 去重、自动推断 grade/term、补 source 标签，仅重写文件结尾 `]`（旧题字节不动、原子追加） |

校验结果：`[grammar] 48 单元 / 480 题`、`[reading] 48 单元 / 288 题`，**[PASS] 0 error 0 warning**。

### 17.3 v01.12 练习体验打磨（4 项，复用既有钩子，零回归）

| 项 | 落地位置 | 实现要点 |
|---|---|---|
| ① 拼写三档筛选（当前单元/全册/全年级） | `js/practice.js` `refreshUnitFilterOptions` | 复用 `state.filterUnit`(all/current/u*) + `state.includeAllGrades`；"全部单元"标签优化为「📚 本册全部单元」 |
| ② 听力"原文显示开关"门控 | `js/practice.js` + `index.html` | `showQuiz` 进听力题 `_setAudioTextLocked(true)` + 重置 `state.quizAnswered=false`；`toggleAudioText` 作答前拦截提示"✋ 先作答，作答后才能查看原文哦"；`answerQuiz`/`checkSpellFilled` 判定后 `quizAnswered=true` + 解锁。`#quizAudioTextToggle` 加门控态 |
| ③ 阅读长文滚动 + 题干悬浮 | `styles.css` | `#quizPassageBox` `max-height:46vh + overflow-y:auto`（移动端 38vh）+ 自定义滚动条；首个子块 `position:sticky` 悬浮 |
| ④ 练习页徽章统一格式 | `js/state.js` + `js/practice.js` | 新增 `TEXTBOOK_SHORT_NAMES` + `practiceScopeText(ctx,allGrades)`；`refreshPracticeCounts` 输出「沪教 · 7上 · 共 N 题」（全年级时「沪教 · 全年级」） |

### 收口状态

- 题库补齐 + 校验 + v01.12 四项打磨全部完成；**新增题全带 `source` 标签可回滚，旧题字节不动**。
- `js/state.js` / `js/practice.js` / `styles.css` / `index.html` lint **0 错误**。
- `tests/smoke.py`（Playwright headless）回归 **[PASS]：0 JS 报错、0 断言失败，35 函数 + 4 命名空间齐全**。
- 用 code-explorer 子代理产出 v01.12 改点清单 + 钩子复用映射，确认改动最小、不破坏既有内联 `onclick`。
- ⚠️ **重启数据恢复**：开发途中电脑重启导致 9B 阅读 48 题丢失，已据 grade9.json 真实课文重新造回并入库，最终 reading 288/48 单元完整。
- **version.txt 仍由 `dev-push.ps1` 自动管理**，本次未手改、未 push，待用户确认后再部署上线。

---

## 18. ✅ 错题本阅读题「显示文章」优化 + Tab 改名 · 完成记录（2026-06-25）

> 用户反馈：错题集收录的「课文阅读题型」没有显示文章，不好练习。诊断后发现涉及**两类阅读题**，病因不同（见下），按"深度改造（把课文原文带进错题本）"方向落地，并顺手修复 Tab 命名误导。延续 §10 小步纪律：仅追加字段/分支，旧数据兼容降级，零回归。

### 18.1 问题诊断（两类阅读题）

| 类型 | 数据来源 | passage 字段 | 改动前错题本表现 |
|---|---|---|---|
| `reading` 阅读理解 | `data/questions/<tb>_reading.json`（jk 72 / hj 288） | ✅ 题库自带 | 详情区**没渲染 passage** |
| `reading_qa` 课文自测 | `data/extras/<tb>_<grade>_<term>_exercises.json`（`kind:reading_qa` 题块） | ❌ 源数据无 passage，仅 问题/答案/选项 | 入错题本时只存 `id/q/correct/user/unit/grade/lessonTitle`，**连原文都没有** |

### 18.2 落地改动

| 文件 | 改动 |
|---|---|
| `js/lesson.js` `updateReadingExForCurrentLesson` | `_readingExState` 增存 `blockTitle`（首个命中题块标题，如 "Fun with language · Mozart"） |
| `js/lesson.js` `submitReadingEx` | reading_qa 入错题本时用现成 `normalizeLessons(state.currentUnit)[lessonIdx].en` 取课文原文，追加 `passage / lessonIdx / blockTitle` 字段（零网络/异步，提交时数据已在内存） |
| `js/lesson.js` 新增 `switchToLesson(uid, lessonIdx)` | 「去此单元重读」：切课本页 → `openUnit` 定位单元 → `switchUnitTab('lesson')` → `renderLessonAt` 跳篇目；跨学段找不到单元时 alert 提示 |
| `js/wrongbook.js` 新增 `_wbPassageHtml(rec)` | 阅读类详情区文章原文 HTML：reading 直接渲染 `q.passage`；reading_qa 渲染「出处条 + 原文框 + 去此单元按钮」；**历史无 passage 数据降级**为「原文暂未收录」提示 + 跳转 |
| `js/wrongbook.js` `renderWrongbookPage` | `.wb-detail` 详情区在选项前插入 `passageHtml` |
| `js/wrongbook.js` `_WB_TYPE_LABELS` | `reading_qa` 标签 `阅读自测` → `课文自测`（与入口卡统一） |
| `js/practice.js` `showQuiz` | passage 显示条件从 `reading` 扩为 `reading \|\| reading_qa`，错题重练 reading_qa 时也显示原文框 |
| `index.html` | 入口卡子 Tab「阅读理解」→「课文自测」（与内部 `switchWrongbookTab('reading_qa')` 语义自洽，id `tabWrongbookRead` 不变）；独立页筛选 Tab「阅读」→「阅读理解」、「阅读自测」→「课文自测」 |
| `styles.css` | 新增 `.wb-passage`（琥珀底原文框，max-height 320 + 滚动）/ `.wb-source-tag`（出处胶囊）/ `.wb-source-link`（橙色跳转按钮）/ `.wb-source-missing`（降级提示条） |

### 18.3 历史数据兼容

- 旧版本入库的 reading_qa 错题没有 `passage`/`lessonIdx`/`blockTitle` 字段。
- `_wbPassageHtml` 检测无 passage 时走降级分支（提示 + 「去此单元重读」按钮按 `q.unit` 跳转），**不抛错、不清空数据**。

### 收口状态

- `js/lesson.js` / `js/wrongbook.js` / `js/practice.js` / `styles.css` / `index.html` lint **0 错误**。
- **version.txt 仍由 `dev-push.ps1` 自动管理**，本次未手改、未 push，待用户确认后再部署上线。

---

## 19. ✅ 手机底部导航栏改版（重复名 / 两行 修复）· 完成记录（2026-06-25）

> 用户反馈：手机版底部导航图标「名字重复 + 排版变两行」。诊断为两个独立病因，采用 **B2 方向（底栏精简为 5 项 + 语法/对话移入首页快捷入口）** 落地。

### 19.1 问题诊断

| 现象 | 根因 |
|---|---|
| **底栏变两行** | 导航共 7 项，移动端网格却是 `grid-template-columns: repeat(6, 1fr)`，第 7 项（学习报告）被挤到第二行 |
| **图标名字重复**（如「课本课本学习」「首页首页」） | 旧用 `span[data-mb]{font-size:0}` + `::before content:attr(data-mb)` 把长名换短名；手机/微信内置浏览器若开启「最小字号」无障碍设置，`font-size:0` 失效 → 真实文字与 `::before` 短名同时显示 |

### 19.2 落地改动（B2）

| 文件 | 改动 |
|---|---|
| `index.html` 导航 DOM | 每个 `.nav-item` 重构为「`.nav-ico` 图标 + `.nav-lbl-full` 完整名 + `.nav-lbl-mb` 短名」三 span，**彻底移除 `data-mb` hack**；语法/对话两项加 `nav-item--deskonly` 类 |
| `index.html` 首页 | 新增「语法讲解 / AI对话」快捷入口卡（`grid-cols-2 md:hidden`，仅移动端显示；桌面端侧栏已含这两项，故隐藏避免重复） |
| `styles.css` 桌面基础 | 新增 `.nav-lbl-mb { display:none }`（桌面只显示完整名） |
| `styles.css` `@media(max-width:768px)` | 底栏网格 `repeat(6,1fr)` → `repeat(5,1fr)`；`.nav-item--deskonly { display:none }` 移动端隐藏语法/对话；用 `.nav-lbl-full{display:none}` + `.nav-lbl-mb{display:block}` 做长短名切换（替代失效 hack）；图标/选中态选择器由 `span:first-child` 改为 `.nav-ico` |
| `styles.css` 小屏 380 / 横屏媒体查询 | 同步把 `span:first-child/last-child` 改为 `.nav-ico/.nav-lbl-mb` |

### 19.3 效果

- 移动端底栏稳定 **单行 5 项**：首页 · 课本 · 练习 · 错题 · 报告。
- 名称切换不再依赖 `font-size:0`，**任何最小字号设置下都不会重复**。
- 语法讲解 / AI对话 在移动端通过首页快捷入口进入，桌面端仍在侧栏 7 项中；JS 仅依赖 `data-page` + `.active`，结构重构零影响。

### 收口状态

- `index.html` / `styles.css` lint **0 错误**。
- **version.txt 仍由 `dev-push.ps1` 自动管理**，本次未手改、未 push，待用户确认后再部署上线。

---

## 20. ✅ 考试模块改造：120 分制 + 单元测试 + 历年真题 · 完成记录（2026-06-25）

> 用户三项确认决策落地：①卷面 **120 分 / 100 分钟**；②方案 A（仿真真题，题目取自现有题库，非照搬版权原卷）；③首批真题覆盖广州各区（含增城/从化）+ 清远/深圳/东莞/佛山，初中全年级 + 中考卷。延续 §10 小步纪律：新增数据带稳定 seed 可回滚，旧逻辑统一收敛到一个组卷引擎，零行为残留。

### 20.1 核心改动总览

| 需求 | 落地 |
|---|---|
| **总分对齐广州考纲** | 模拟卷（期中/期末/中考模拟）统一 **卷面 120 分 / 100 分钟**：听力 30 + 语法选择 15 + 完形 15 + 阅读 30 + 书面表达 30（参考分）；自动判分 90。新增「按实际抽到题量计分」，题库不足也能达满分 |
| **月考卷 → 单元测试卷（累积式）** | 删除原 `monthly1/3/4`，改为**第 1~第 8 单元测试**，范围**累积式 [1, N]**（本单元为主 + 复习前面）；纯自动判分（约 50 分 / 40 分钟），点完即出分 |
| **列表界面精简 + 分区 Tab** | 顶部三分区 **[模拟卷] [单元测试] [历年真题]**（带数量角标）；卡片只保留 标题·时长·满分·自动判分·历史最高·开始，点击即考 |
| **扩充真题库（方案 A）** | 新增 `data/exams/real_papers/index.json`，**36 份固定真题卷**，覆盖广州天河/越秀/番禺/增城/从化、清远、深圳、东莞、佛山（9 地区）× 初一/初二/初三全年级 + 每地区 1 份中考卷（共 9 份中考） |

### 20.2 文件改动

| 文件 | 改动 |
|---|---|
| 🆕 `scripts/gen_exam_papers.py` | 可复用生成器：产出 120 分制 `exam_config.json`（期中/期末 + 单元测试模板）与 `real_papers/index.json`（36 份真题）。日后扩地区/卷数改它再跑一次即可 |
| ✏️ `data/exams/exam_config.json` | 120 分制 + 单元测试模板（`unitTest.namePattern/maxUnit/cumulative/sections`） |
| 🆕 `data/exams/real_papers/index.json` | 36 份真题（每份带稳定 `seed` + `region` + `kind`；中考卷 `kind:"zhongkao"`） |
| ✏️ `js/exam.js` | 见 20.3 引擎重构 |
| ✏️ `styles.css` | 新增 `.exam-tabs/.exam-tab/.exam-ctxbar/.exam-card2/.exam-region-group` 等分区 Tab 与精简卡片样式（含移动端单列） |
| ✏️ `index.html` | 首页考试入口提示文案 → 「真题·模拟·单元测试」 |

### 20.3 `js/exam.js` 引擎重构（关键）

1. **统一组卷引擎 `_buildPaper(def)`**：取代原 `_generatePaper(examKey)`，模拟卷 / 单元测试 / 真题三类**共用同一引擎**。
2. **种子化固定卷**：`def.seed` 存在时用 `_mulberry32(seed)` 驱动 `_sampleRng` 洗牌采样 → **同一份真题每次生成题目一致、可反复对答案**；模拟卷/单元测试无 seed 走 `Math.random`，每次随机。
3. **按实际题量计分**：`sec.totalPoints = 实际抽到题数 × points`，题库不足时不再分值错乱；汇总 `totalAutoPoints / writingPoints / totalPaperPoints`。
4. **数据分支**：`_loadRealPapers()` 加载真题；`_getExamsForContext()` 返回 `{sim, unit}`（单元测试按模板展开为第 1~N 单元）；`_getRealPapersForContext()` 按年级过滤真题（含中考卷）。
5. **三分区列表**：`_examListTab`(sim/unit/real) + `_renderExamList()` + `_examCardHtml()`；真题按 `region` 分组、中考卷打红色「中考」标签。
6. **`_startExam(examKey, source)`**：按 `source`(config/real) 解析试卷定义后交给 `_buildPaper`。

### 20.4 数据规模（生成校验）

- 真题：**36 份**、**9 地区**、含 **9 份中考卷**、覆盖 **7/8/9 全年级**。
- 配置：`scoreSystem.total=120 / time=100`。
- 初中题库走 `hj`（广州沪教版 7-9 年级），grammar 480 / listening 32 / reading 288 / spelling 698，足够支撑 120 分卷的抽题。

### 收口状态

- `js/exam.js` lint **0 错误**；本地服务对两份考试 JSON 解析与关键字段校验全通过。
- 电脑端 `http://localhost:8765/index.html` + 手机端 `http://localhost:8765/mobile.html` 双端预览已验证（铁律 1）。
- 本次经用户确认后**执行 `dev-push.ps1` 推送上线**（铁律 3）。

---

## 21. 🔍 全量测试报告 + 待开发任务清单（2026-06-26）

> 用户要求做一次全量功能测试，记录哪些功能未开发、哪些内容未填充，并输出待开发清单。本节为该次测试的存档结论；测试方式：`tests/smoke.py`（Playwright headless）自动回归 + 代码盘点 + 数据完整性量化核查 + 双端预览人工抽验。

### 21.1 自动化冒烟测试

- `tests/smoke.py`（Playwright headless）：**✅ PASS** —— 页面 JS 错误 **0**、网络失败 **0**，**35 个全局函数 + 4 个页面入口**全部注册、关键调用无异常。

### 21.2 功能可用性（逐项判定）

| 功能 | 状态 | 说明 |
|---|---|---|
| 页面导航 / 上下文切换 | ✅ 正常 | home/textbook/practice/exam/grammar/chat/wrongbook/report 全通 |
| 多用户档案 | ✅ 正常 | 创建/切换/删除，数据按档案隔离 |
| 课本（单词卡/课文/例句阶梯/阅读自测） | ✅ 正常 | hj 例句已 6 册全覆盖 |
| 课文真人 MP3 朗读 | ✅ 正常 | 303 个 MP3，MP3→TTS 双路降级 |
| TTS / 有道发音 | ✅ 正常 | 有道公开接口 + 浏览器 TTS |
| 4 类题型练习（拼写/听力/语法/阅读） | ✅ 正常 | filterQuestions 三档范围筛选可用 |
| 智能推题 / 错题本 / 掌握度 / 学习报告 | ✅ 正常 | 真实算法 + localStorage 落地 + Chart.js |
| 模拟考试（组卷/判分/历史/倒计时） | ✅ 正常（初中） | 完形填空从 grammar 借题包装，引擎完整 |
| 仿真历年真题 | ✅ 正常 | 36 份卷，固定 seed 可对答案 |
| 录音跟读 AI 评测 | ⚠️ **模拟** | `lesson.js:1221` 随机分 85+，无真实 ASR |
| AI 对话 | ⚠️ **模拟** | `app.js:216-260` 关键词匹配，未接大模型 |
| 作文评分 | ⚠️ 半成品 | `exam.js:979` 本地启发式打分，非 AI |
| 语法讲解页 | ⚠️ 半成品 | 仅 4 条硬编码，无数据文件 |
| PWA（安装/离线） | ✅ 正常 | manifest 完整；**`sw.js` 漏缓存 `js/exam.js` → 本次已修复**（见 21.5） |

### 21.3 数据完整性（量化）

| 项 | jk（教科版） | hj（沪教版） | 缺口 |
|---|---|---|---|
| 拼写题 | 224 | 698 | — |
| 语法题 | 72 | 480 | — |
| 阅读题 | 72 | 288 | — |
| 听力题 | 52 | 192 | 见下 |
| 单词例句 | **仅 6下 1 册** | **6 册全 ✅** | jk 1-6 年级其余学期全缺 |
| 完形填空独立题库 | 0 | 0 | 现由 grammar 借题，无独立 cloze 库 |

- **听力音频缺口（实测）**：~~`hj_listening` 192 题中仅 g7 的 32 题有真人 MP3~~ → ✅ **已补全**（见 §21.6）；`jk_listening` 52 题经核实**全部已有 MP3**（此前误判为无，实际 `audioFile` 非空且文件存在）。
- **教材覆盖**：✅ jk（3-6 年级）、hj（7-9 年级）数据完整；❌ **gzk（广州口语 1-2 年级）22 个单元全是 `placeholder:true` 空壳**；❌ **rj（人教）、wy（外研）无任何数据**，下拉框 `disabled`。
- **考试配置缺口**：`exam_config.json` 仅含 7/8/9 年级，真题 36 份全为初中；**小学（jk 3-6、gzk 1-2）进考试页三 Tab 全 0**。

### 21.4 待开发任务清单（按优先级）

**P0 · 影响体验的硬缺口**
1. ~~**听力 MP3 补全**~~ → ✅ **已完成上线 V02.19**（见 §21.6）：hj 160 题 MP3 全量生成 + `audioFile` 回填 JSON；jk 52 题核实无需补。
2. ~~`sw.js` 补缓存 `./js/exam.js`~~ —— ✅ **本次已修复**（见 21.5）。
3. ~~**小学考试配置**~~ → ✅ **已完成上线 V02.21**：①为小学 grade 3-6 补 `exam_config.json`（贴合小学题量的轻量卷：综合测试=拼写10+听力2+语法3+阅读3、单元小测=拼写5+听力1+阅读1，无完形/书面表达，宽 `unitRange` 配合"按实际抽到题量计分"）；②无配置学段（gzk 1-2、rj/wy 占位等）由近空白升级为友好引导卡片（🧩 筹备中 + 「去专项练习」「背单词/看课文」跳页 + 保留历史记录区）。

**P1 · 内容填充**
4. **jk 例句补全**：教科版 3-6 年级各学期例句（当前仅 6 下 1 册），对齐 hj 人工精编模式。
   - ✅ **3 上**已完成（2026-06-26，详见 §22）：替换旧 2 个占位单元为 9 单元真实教材（Letters in Our Life ~ Review Music Show）+ 70 词卡 + 18 课文 + 210 例句 + 208 个 ex_*.mp3。
   - ⏳ 余下 3 下 / 4 上下 / 5 上下 / 6 上 共 7 册待补。
5. **gzk（广州口语 1-2 年级）内容**：填充 22 个占位单元的课文 + 词表 + 题库。
6. **完形填空独立题库**（可选）：建 `*_cloze.json` 替代借题包装。

**P2 · 真功能接入（目前为模拟）**
7. **AI 对话接入真实大模型**（替换 `app.js` 关键词匹配，对应 P3 v02.0）。
8. **录音跟读真实 ASR 评测**（替换 `lesson.js` 随机分，对应 P3 v02.1）。
9. **作文 AI 评分**（替换 `exam.js` 本地启发式）。
10. **语法讲解页数据化**（4 条硬编码 → 建语法知识库数据文件）。

**P3 · 新教材**
11. **人教版（rj）、外研版（wy）** 教材 + 题库从 0 建设（当前仅占位，对应 §8 P1）。

### 21.5 本次随手修复（P0-2）

- **问题**：`sw.js` 的 `STATIC_ASSETS` 预缓存清单遗漏 `./js/exam.js`，离线场景下考试模块脚本可能拿不到。
- **修复**：在 `./js/practice.js` 之后补入 `'./js/exam.js'`，与 `index.html` 注入链对齐（现 12 个 js 模块全覆盖）。
- **验证**：lint 0 错误；双端预览通过。经用户确认后随本节文档一并 `dev-push.ps1` 上线（铁律 3 / 4）。

### 21.6 听力 MP3 全量补全（P0-1 · 2026-06-26 V02.19）

- **问题**：`hj_listening.json` 192 题中仅 g7 上 32 题有 MP3，其余 g7下/g8/g9 共 160 题 `audioFile` 为空，播放走浏览器 TTS 兜底。
- **核实**：`jk_listening` 52 题全部已有 MP3（§21 初版误判，实际 `audioFile` 非空且文件存在），无需处理。
- **修复内容**：
  1. 修复 `gen_hj_listening.py`：① 预扫描已有 `audioFile` 确定每年级计数器起点；② fallback 命名由硬编码 `g7` 改为按 `q["grade"]` 动态生成 `hj_listening_g{grade}_{编号}.mp3`；③ 生成成功后自动将 `audioFile` 原子写回 JSON。
  2. 运行脚本生成 160 个 MP3：g7下 32 个（33-64）、g8上 32 个（01-32）、g8下 32 个（33-64）、g9上 32 个（01-32）、g9下 32 个（33-64）。
  3. `hj_listening.json` 192 条 `audioFile` 全部非空，磁盘 192 个 `hj_listening_*.mp3` 全覆盖。
- **生成统计**：ok=160, skip=32（已有 g7 上）, fail=0；新写入 audioFile 160 条。
- **验证**：双端预览，沪教版练习/考试听力题播放 MP3（不再走 TTS fallback）。经用户确认后 `dev-push.ps1` 上线（铁律 3 / 4）。

---

## 22. ✅ P1-4 jk 教科版 3 上全量内容补齐 · 完成记录（2026-06-26）

> 用户反馈"上一次任务卡住很久"，本次重启该需求时**严格按"颗粒度极小子任务"拆分推进**（19 项 todo），每项独立 1-3 分钟可完成、可中断续跑、可单独回滚，最终零卡顿一次通过。

### 22.1 背景与缺口

| 项 | 修复前 | 修复后 |
|---|---|---|
| `data/textbooks/jk.json` grade3.上 | 仅 2 个旧版**占位单元**（School Things / My Classroom）·每单元 5 词·无 lessons 数组·与真实教材完全不符 | **9 个**新版教科版真实单元（Unit 1 ~ Review）· 共 **70 词 + 18 篇课文** |
| `data/examples/jk_grade3_shang.json` | **不存在** | 70 词 × 3 句易/中/难 = **210 句**例句 |
| `audio/ex_*.mp3`（3 上例句） | 0 | **208 个新生成 + 1 复用既有**（hash 全局去重） |

教材数据来源：基于 `JK_G3_SHANG_DATASET.md` 已确认的单元结构 + 词表，由 `scripts/g3s/u1.json ~ u9.json` 9 份独立草稿提供（每份含 `words + lessons`，单文件易于审阅与回滚）。

### 22.2 颗粒化执行（19 步 todo · 全过）

| 阶段 | 步骤 | 关键动作 / 产出 |
|---|---|---|
| 准备 | prep-1 | `scripts/g3s/_verify.py` 校验 9 单元 70 词 18 课文字段完整 [PASS] |
| 准备 | prep-2 | 写 `scripts/g3s/import_textbook.py`（含 --write/dry-run 双模式 + 自动 .bak 备份 + 原子写入） |
| 准备 | prep-3 | 执行 --write 写入 jk.json（备份 `jk.json.bak.20260626_202214`），`_verify_jk.py` 复核 9/9 单元词数课文数全对齐 [PASS] |
| 例句 | ex-u1 ~ ex-u9 | 9 个独立 e*.json 手工精编（**单步只动 1 单元**，单步规模 ≤24 句）；每词三档 level=1/2/3 全覆盖 |
| 合并 | merge | `scripts/g3s/merge_examples.py` 合并到 `data/examples/jk_grade3_shang.json` · missing/extra 词为空 [PASS]（70/210） |
| 音频 | audio-script | 扩展 `gen_example_audio.py`：① `EX_FILES` 加入 `jk_grade3_shang.json`；② 新增 `--only`（按文件过滤）/ `--limit`（单次最多生成 N 条新 MP3，到点自动保存并退出）防卡死开关 |
| 音频 | audio-u1-3 | `--limit 72` 第一批 ok=72/fail=0 |
| 音频 | audio-u4-6 | `--limit 72` 第二批 ok=72/fail=0（skip=72 既有 hash 跳过） |
| 音频 | audio-u7-9 | 无限额跑完 ok=64/skip=145/fail=0（含 1 句 hash 与既有教材音频复用） |
| 验证 | verify | 起 `python -m http.server 8765`；`jk_grade3_shang.json`/`jk.json`/抽样 `ex_8ba75aa675.mp3` HTTP 全 200；双端 `index.html` + `mobile.html` 预览人工抽查通过（铁律 1） |
| 收尾 | docs | 更新本文档：顶部最后更新行、§3 规模行 jk 教材/音频条目、§21.4 P1 任务4 状态、新增本章 §22 |

### 22.3 关键工程实践

1. **"颗粒极小 + 可断点"双保险**：例句按单元一文件一文件写、音频按 72/72/剩余三批限额跑，任意一批失败/中断都可重跑续生成（脚本 hash 去重 + 增量跳过零浪费）。
2. **原子写入 + 自动备份**：教材导入用 `jk.json.tmp → os.replace` + 时间戳 `.bak` 双保险，回滚 1 条 `mv` 即可。
3. **复用 > 重写**：音频生成不写新脚本，仅给既有 `gen_example_audio.py` 加 `--only`/`--limit` 两个无副作用开关；既有沪教 6 册 + jk 6 下例句行为完全不受影响。
4. **数据 schema 对齐既有规范**：例句结构 `{words: {word: [{en, cn, level, audioFile}]}}` 与 `jk_grade6_xia.json`/`hj_grade*.json` 完全一致，前端 `loadExamplesIfNeeded` 零改动即可加载。
5. **字段顺序与旧 grade3.上 对齐**：`id/title/words/lessons` + 词字段 `word/phonetic/meaning/example`，避免 git diff 视觉污染。

### 22.4 收口状态

- ✅ jk.json grade3.上：9 单元 / 70 词 / 18 课文，备份 `data/textbooks/jk.json.bak.20260626_202214`
- ✅ jk_grade3_shang.json：70 词 / 210 例句 / 210 条 `audioFile` 字段
- ✅ audio/ex_*.mp3：210 条例句对应 MP3 全部落盘（208 新生成 + 2 复用既有 hash），文件存在性校验 missing=0
- ✅ 前端零改动；`tests/smoke.py` 未触发新增风险面
- ✅ `gen_example_audio.py` 新增 `--only` / `--limit` 参数无副作用，沪教 6 册 + jk 6 下回归默认行为不变
- ✅ **已上线** `20260626V02.22`（HEAD `811814c`，2026-06-26 21:21；`dev-push.ps1` 自动 bump + 双 commit + push origin main）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260626V02.22>

### 22.5 给下次接手"jk 例句继续补"的提醒

后续 7 册（3 下 / 4 上下 / 5 上下 / 6 上）可完全照搬本次流程：

1. 在 `scripts/g3s/` 同级建 `g3x/`、`g4s/`、`g4x/` ... 每个目录下放 `u*.json` 单元草稿 + 复用 `import_textbook.py`（仅改路径常量）+ `merge_examples.py`。
2. 音频：直接 `python gen_example_audio.py --only jk_grade{N}_{shang|xia}.json --limit 80`（边跑边断、零卡死）。
3. 单步规模建议：例句单元粒度（每步 8-12 词），音频单批 ≤80 句。**永远不要尝试一次完成全 7 册** —— 这是本次重启该需求时翻车的根因之一。

---

## 23. ✅ jk 剩余 7 册补齐 · 开发宪法 + 流水线模板化（2026-06-26）

> 在 §22 完成 3 上后，按铁律 5 用选项清单一次性收齐 4 项决策（全部按推荐项），并把 3 上的"颗粒极小流水线"重构为可复用的共享库 + 通用校验，为后续 6 册 / 1655 个新 mp3 / ~1632 例句 / ~63 单元的批量交付铺好工程基础。

### 23.1 决策结果（用户 2026-06-26 21:35 勾选）

| # | 决策项 | 选定 |
|---|---|---|
| Q1 | 教材版本 | **A** · 全部用 2024 秋新版（与 3 上一致 / 与孩子在校教材同步） |
| Q2 | 单册容量 | 默认量级（8+1 复习 / 70-96 词 / 18-20 课文 / 210-288 例句 / 册） |
| Q3 | 推进节奏 | 逐册推进（每批 1 册，单册 ~2 小时净时间） |
| Q4 | 提效项（多选） | §3.1 脚本模板化 + §3.3 通用 verify + 任务单 push 上线 + 铁律 5 入文档（全部） |

### 23.2 开发宪法（新增文档）

- 📄 **`JK_REMAINING_7_VOLUMES_PLAN.md`** —— 7 册详细任务单（现状盘点 / 决策结果 / 19 步单册流水线 / 时间预估 / 风险对策 / 进度追踪表 / 给下一位 AI 的执行约定）。
- 任何接手 jk 剩余 7 册（3 下 / 4 上下 / 5 上下 / 6 上）的助手，**必须先读这份开发宪法**再开工。

### 23.3 脚本模板化（§3.1 落地）

- 🆕 `scripts/_jk_volume_lib.py` 共享库（174 行）：
  - `import_units(here_dir, grade, term, write)` —— 从 `uN.json` 写入 jk.json，dry-run 默认 + 自动 .bak 备份 + 原子写入。
  - `merge_examples(here_dir, grade, term)` —— 从 `eN.json` 合并到 `data/examples/jk_grade{N}_{term}.json`，**含既有 audioFile 字段保留机制**（按 (word, en) 键回灌）。
  - 顺带 CLI 直跑入口 `python scripts/_jk_volume_lib.py import|merge ...`。
- ♻️ `scripts/g3s/import_textbook.py` / `merge_examples.py` 重构为 **6 行薄入口**，仅指定 `HERE / grade / term`。
- 🆕 单册脚本目录命名约定：`scripts/g{N}{s|x}/`（g3x/g4s/g4x/g5s/g5x/g6s）。

### 23.4 通用校验（§3.3 落地）

- 🆕 `scripts/_verify_volume.py grade term` —— 一行命令校验 6 项：
  1. jk.json 单元数 > 0 + 单元字段 `id/title/words/lessons` 完整
  2. 例句文件存在
  3. 例句词表与 jk.json 词卡**完全对齐**（无 missing/extra）
  4. 所有例句 `audioFile` 字段非空
  5. 每词三档 `level=1/2/3` 完整覆盖
  6. 每个 `audioFile` 对应 `audio/ex_*.mp3` 落盘且 >256 B
- 命令行支持 ASCII 别名（shang/xia/s/x）规避 Windows GBK 控制台中文传参问题。

### 23.5 回归带出的潜在 bug 修复（重要）

回归 3 上时发现：**老 merge_examples 会把既有 audioFile 字段全部冲掉**（合并 e*.json 草稿覆盖 out 文件）。  
本次共享库版本新增"既有 audioFile 按 (word, en) 键回灌"逻辑，**修复后** merge 重跑会输出 `[preserve] 从既有 ... 回灌 audioFile N 条`，文件大小保持稳定。  
影响：避免后续 6 册每次修改例句重跑 merge 都要重跑音频脚本回填，**节省 6 次回填操作 + 杜绝中间态丢字段风险**。

### 23.6 收口状态

- ✅ `_jk_volume_lib.py` + `_verify_volume.py` 全绿回归（3 上 6 项全 PASS）
- ✅ `JK_REMAINING_7_VOLUMES_PLAN.md` 开发宪法定稿
- ✅ §0 铁律 5 已写入；本章上线后任何决策项必须用 `ask_followup_question` 选项清单收集
- ⏳ 待用户给"开工"信号后，按宪法启动**批次 1（3 下）**：先产出 `JK_G3_XIA_DATASET.md` 给用户勾选词表 → 走 19 步 → 上线

