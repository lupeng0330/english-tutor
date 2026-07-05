# 🎓 乐学英语（English Tutor）· 项目交接状态

> 这份文档给"另一端的你 / AI 助手"看的，目的是**无缝接上当前进度**。  
> 最后更新：**2026-07-05 · T1-T4 6主题系统上线(§54) + contextBar下拉框修复(§54.6) + 项目清理(删 __v.txt/__pycache__/_tmp_jk_listen/_sent ~93MB，gen_sample_mp3.py 核查后保留); 下一站③P6-A补全对话**

---

## 🚀 速读卡（新 AI 30 秒上手）

> 👋 你好，**先读这一节再开工**。如果只读一节，就读这节。

### ① 项目是什么

| 字段 | 值 |
|---|---|
| 名字 | 乐学英语（English Tutor） |
| 形态 | 面向 **1-9 年级** 学生的英语学习 **纯静态 Web 应用** |
| 部署 | GitHub Pages（main 分支根目录，push 后 1-2 分钟自动上线） |
| 仓库 | `git@github.com:lupeng0330/english-tutor.git` |
| 当前线上 | 见仓库根 `version.txt`（CI 自动维护）/ Pages 首页 <https://lupeng0330.github.io/english-tutor/> · 详见 [铁律 9](#铁律-9--绝不手改-versiontxt2026-06-28-新增--最高优先级红线) |
| 核心能力 | 单词卡 / 课文 / 例句阶梯 / 4 类题型练习 / 真人 TTS / 错题本 / 智能推题 / 学习报告 / 模拟考试 / PWA 离线 |

### ② 立刻能跑起来（本地验证）

```bash
# Mac（一键启动 + 免缓存）
./dev-open.sh

# Windows · 在项目根目录
Start-Process python -ArgumentList '-m','http.server','8765' -WindowStyle Hidden
# 电脑端入口（加 ?v= 日期 破缓存）
start http://localhost:8765/index.html?v=$(Get-Date -Format yyyyMMdd)
# 手机端
start http://localhost:8765/mobile.html?v=$(Get-Date -Format yyyyMMdd)
```

> Mac 运行 `./dev-open.sh` 自动启动服务 + 打开双端免缓存页面。参数 `./dev-open.sh pc` 仅电脑端、`./dev-open.sh mb` 仅手机端。`?v=日期` 参数不修改 version.txt，仅用于浏览器缓存破坏。

> ⚡ **推送 & 版本一句话**：要推送时——Mac 跑 `./dev-push.sh`、Windows 跑 `dev-push.ps1`（都会先 `pull --rebase` 再 push）。**`version.txt` 由 CI 全自动 bump、前端缓存随之自动刷新，任何人/任何端都【绝不手改它】（铁律9）**——这是历来 rebase 版本冲突的唯一根因。

### ③ 九条铁律（最高优先级，每次任务都必须遵守）

<a id="铁律速查卡"></a>

| # | 铁律 | 一句话 | 链接 |
|---|---|---|---|
| 1 | 双端验证 | 电脑端 + 手机端两个 URL 都给出，配验证清单 | [§0 铁律 1](#铁律-1--每个任务完成后必须提供电脑端--手机端双验证无需真机) |
| 2 | 必更新文档 | 任务收尾必须更新本文档（新增完成记录 + §3 规模 + 顶部最后更新行） | [§0 铁律 2](#铁律-2--每个任务完成后必须补记本-project_statusmd不能漏) |
| 3 | 验证不 push | 本地服务不动 `version.txt` 不擅自 push；上线走 `dev-push.sh`(Mac)/`dev-push.ps1`(Win) | [§0 铁律 3](#铁律-3--验证服务不动-versiontxt不-push部署只走-dev-pushps1) |
| 4 | 上线后对齐文档 | 用户确认 push 后必须把文档状态同步成「已上线（含版本号）」 | [§0 铁律 4](#铁律-4--经用户确认的任务在自动部署上线后必须同步更新-project_statusmd2026-06-26-新增) |
| 5 | 选项清单决策 | 决策项必须用 `ask_followup_question` 选项清单收集，禁止裸文本提问 | [§0 铁律 5](#铁律-5--涉及方案版本范围节奏的决策项必须用选项清单收集2026-06-26-新增) |
| 6 | 真实落盘验证 | 关键改动只信磁盘真相：Python 直写 + 读盘验证 + `git diff` 确认 + 拉线上 URL 复核；本环境编辑/shell 输出会乱码出假数据，绝不据此下结论 | [§0 铁律 6](#铁律-6--关键改动必须真实落盘验证2026-06-28-新增) |
| 7 | 省 token 执行 | 按用户字面诉求一步到位：不脑补问题、不过度自证、不反复测试、不上重工具(Playwright/截图等非必要不用)；少读多准、结论先行 | [§0 铁律 7](#铁律-7--省-token按字面诉求一步到位2026-06-28-新增) |
| 8 | 数据安全三件套 | 任何写入题库/例句/教材 JSON 的脚本必须带三层防护：①写入前自动备份 `.backups/` ②打印差异报告（保留X/新增Y/替换Z）③合并后题量骤降>30% 中断；写完必须跑 `scripts/_verify_qbank.py` 校验 | [§0 铁律 8](#铁律-8--数据安全三件套2026-06-28-新增) |
| 9 | **绝不手改 version.txt** | `version.txt` 由 CI（`update-version.yml`）全自动 bump + 缓存自动刷新；任何端/任何人都禁止手写它（曾因手改反复引发 rebase 版本冲突）。推送统一走 `dev-push.sh`/`dev-push.ps1`（内置 pull --rebase + 误改自动还原） | [§0 铁律 9](#铁律-9--绝不手改-versiontxt2026-06-28-新增--最高优先级红线) |

### ④ 最近大事（按时间倒序）

| 时间 | 事件 | 详见 |
|---|---|---|
| 2026-07-04 深夜 | **T1-T4·6主题系统上线 + contextBar下拉框修复**：T1 根治白底(`styles.css`静态引入/防FOUC/变量收敛)；T2 6套主题变量(朱砂/青瓷/水墨黛/藏青/胭脂+晴空蓝默认)；T3 `js/theme.js` 管理器(localStorage持久化+主题切换)；T4 个人中心面板6色卡选择器 + A+覆盖Tailwind固定色(header/bg-white/text-slate等都跟主题)；fix contextBar from-blue-50子串匹配误伤致3下拉框白字白底，收窄为深色调类列表 + #contextBar例外规则固化浅色语境 | §54 |
| 2026-07-04 全天 | **P6-C 写作上线 + P6-E 16套模板完成**：`jk_writing.json` 16篇(中国元素优先)+复用`_gradeWriting`零重写；16套学期独立模板(g3a_midterm~g6b_final)总分100+题型递进+写作接入，待验收 | §53 |
| 2026-07-02 下午 | **A 档 B1 · 考试配置模板化（推送后 CI bump）**：`data/exams/exam_templates.json` 新建（10 套模板：low/mid/high × midterm/final/unit + 3 上期中 GZ 8 题型样板）；`exam_config.json` 简化为 280 行引用形式（`{ template, writing? }`）；`exam.js` 加 `_loadExamTemplates()` + `_applyTemplate()` 展开引擎；首验修复 1 竞态（`renderExamPage` / `_startExam` 漏 await）→ 44/44 smoke test 全过；9 下 final 中考模拟改名 / 7-9 年级写作题 prompt+model 注入均落地 | §40 |
| 2026-07-01 下午 | **三大题型重做 + 听音填空 bug 修复 + 新听力三题型 MP3（推送后 CI bump）**：`exam.js` 重做 `spelling` / `blank_fill` / `sentence_order` 渲染+路由+判分；新增 `_renderListenFillHTML` + 路由（修复「听音填空只有题目没有听力按钮」bug）；5 个 edge-tts 多角色童声 MP3 落盘（listen_fill_01 / judge_01-02 / pic_01-02）；`index.html` SW 防本地缓存改造（仅 `*.github.io` 注册，本地自动 `unregister` + `caches.delete`） | §39 |
| 2026-07-01 上午 | **广州题型方案 P1（推送后 CI bump）**：产出全学段《广州题型分布方案》文档 + 定稿 4 决策；`exam.js` 全题型 section 满分锁定 `count×points` + 抽不满按比例折算(`shortfall`)，杜绝总分溢出；**3 上期中重写为低段 8 题型 / 50 题模板，106→100**；`mobile.html` 支持 `?v=` 透传验证 | `GZ_EXAM_BLUEPRINT.md` |
| 2026-06-30 下午 | **阶段 1 分值 Bug 修复（V02.47）** + **jk midterm 题库补全（V02.48）**：用户报告初中 110+/小学 150+ 分值异常；定位 3 根因；exam.js cloze totalPoints 锁死配置；jk 6 下补 5 篇 cloze；audit 196 sections 0 不一致；final 全过；V02.48 补全 jk 3A-6A 共 7 个 U2（+20 题 + 7 MP3）→ midterm 88-96 → 100 ✅ 已上线 | §38.8（附录 A） |
| 2026-06-30 中午 | **小学模拟考试阶段 1**：按广州真实试卷标准重做 jk 3-6 年级 8 张 final 为 100 分制 + 新增 8 张 midterm 期中卷 + 4 个 unitTest 升级 50 分制 + 所有卷加完形 section（修配置遗漏 Bug） | §38（附录 A） |
| 2026-06-30 上午+ | **P2-C 批次 3 · jk 小学 cloze**：jk 3 上→6 上 7 册 × 5 篇 = 35 篇基础 + 6下补 5 篇 + 后续追加 → **实盘 56 篇 / 290+ 挖空**，分级适龄（3-4 年级 4 挖空 / 5-6 年级 5 挖空 + 难度梯度 diff1→3）；P2-C 全部完成（hj 36 + jk 56 = 92 篇） | §37（附录 A） |
| 2026-06-30 上午 | **P2-C 批次 2 · hj 全 6 册 cloze**：追加 7B/8A/8B/9A/9B 共 30 篇 150 挖空；hj 完形 6→36 篇 / 30→180 挖空 | §36（附录 A） |
| 2026-06-29 深夜 | **P2-C 完形填空 · 批次 1**：真完形模式上线，hj 7A 6 篇 30 挖空，独立题型徽章 + 篇章式答题 UI + 错题本 cloze tab + exam.js 抽题源 grammar→cloze 改造 | §36（附录 A） |
| 2026-06-29 傍晚 | **P2-B 质量增强 + 全局 Bug 修复**：切单元/教材徽章不刷新 + 难度筛选全 0 题（全教材）；gzk 听力 35/46 含角色男女声分流；230+ 词 POS_BUCKETS 词性感知干扰；零退化标记 | §35（附录 A） |
| 2026-06-29 下午 | **P2-B · gzk 题库补齐**：244 拼写 + 46 听力 + 46 听力 MP3，铁律 8 三件套；前端零改动 | §34（附录 A） |
| 2026-06-29 上午 | **澄清 jk vs gzk 教材边界**：3 信源确认 jk 是「三年级起点」，移除 jk.json grade1/grade2 占位 8 单元（82→74） | §33（附录 A） |
| 2026-06-29 上午 | PROJECT_STATUS.md 二次梳理：铁律 6-9 上移并入 §0 形成 9 条单一信源 | §32 之前 |
| 2026-06-28 深夜 | **铁律 6/7/8/9 集中引入** + `dev-push.sh` 新增 + `dev-push.ps1` 加 version.txt 护栏 | §32（附录 A） |

### ⑤「我现在该干啥」决策树

```
开工前：
  1) git pull --rebase origin main          ← 双端开发铁律
  2) 读完本速读卡 + §0 铁律 + §3 当前规模 + §8 逐期计划
  3) 看 §8「🎯 一期」当前正在进行的任务

  ▼ 一期 P5 未完成？  → 立刻做 P5（jk 6下 U11 中国化替换，~45分钟）
  ▼ 一期完成？       → 做二期 P3-D（语法讲解页数据化，~5天）
  ▼ 二期完成？       → 做三期 P4（人教 rj / 外研 wy 新教材建设，~1月）
  ▼ 三期完成 + 有 Key？ → 做 P3-A/B/C（AI 对话 / ASR / 作文评分）
  ▼ 都完成？         → 维护：跑 tests/smoke.py 回归 / 升级依赖 / 清理技术债
```

> 当前优先级（2026-07-03 用户决策，铁律 5）：
> - ✅ **一期 P5**：jk 6 下 U11 Review 中国化替换（§46，已上线）
> - 🎯 **二期 P3-D**：语法讲解页数据化（~5 天，无需 Key）← **当前**
> - 🎯 **三期 P4**：人教 rj + 外研 wy 新教材建设（~1 月，无需 Key）
> - 📋 **等 Key 到位**：P3-A AI 对话 / P3-B 录音 ASR / P3-C 作文评分
> - ✅ **P0/P1/P2/P5 全部清零** 🎉

### ⑥ 接手三件套

| 文件 | 作用 |
|---|---|
| `PROJECT_STATUS.md`（本文档） | AI / 开发者视角的完整交接（你正在看的就是它） |
| `README.md` | 产品视角的用户文档 |
| `JK_REMAINING_7_VOLUMES_PLAN.md` | jk 教科版 7 册补齐开发宪法（已收官，作为后续小学教材数据补齐的模板参考） |

---

## 📑 目录（TOC）

### 主体（当前活跃）

- [§0 给新进来的 AI 助手的一段话 + 九条铁律](#0-给新进来的-ai-助手的一段话)
- [§1 项目一句话简介](#1-项目一句话简介)
- [§2 技术栈与运行](#2-技术栈与运行)
- [§3 当前规模（2026-06-27 核查）](#3-当前规模2026-06-27-核查)
- [§4 目录与关键文件](#4-目录与关键文件)
- [§5 重要约定（容易踩坑）](#5-重要约定容易踩坑)
- [§6 部署与发布](#6-部署与发布)
- [§7 近期进展（Git log 摘要）](#7-近期进展git-log-摘要)
- [§8 后续版本开发计划（v01.10 → v02.x）](#8-后续版本开发计划v0110--v02x)
- [§9 常见命令速查](#9-常见命令速查)

### 附录 A · 完成记录档案（按时间倒序，仅做历史检索用）

> 历史完成记录共 16 章保持原章节号（§10-§25），仅在每章标题前加 `[已归档]` 前缀以示与"当前活跃"段落区分。这些章节**不是当前活跃任务**，新 AI 接手无需逐章读完；如查具体历史决策 / 实现细节再按需翻阅。下面是按**时间倒序**的索引（与正文章节号方向相反）：

> GitHub Markdown 锚点会按"小写 + 空格变 `-` + 移除大部分标点"自动生成，下表是按时间倒序的快速跳转表。

| 时间 | 章节 | 主题 |
|---|---|---|
| 2026-06-26 晚 | §25 | jk 教科版剩余 5 册全量补齐 · 批次 2-6 一次性收官 |
| 2026-06-26 | §24 | jk 教科版 3 下全量内容补齐 · 批次 1 |
| 2026-06-26 | §23 | jk 剩余 7 册补齐 · 开发宪法 + 流水线模板化 |
| 2026-06-26 | §22 | P1-4 jk 教科版 3 上全量内容补齐 |
| 2026-06-26 | §21 | 全量测试报告 + 待开发任务清单（**P0 全清 / P1-4 已完成快照**） |
| 2026-06-25 | §20 | 考试模块改造：120 分制 + 单元测试 + 历年真题 |
| 2026-06-25 | §19 | 手机底部导航栏改版（重复名 / 两行 修复） |
| 2026-06-25 | §18 | 错题本阅读题「显示文章」优化 + Tab 改名 |
| 2026-06-25 | §17 | v01.11 语法/阅读补齐 + v01.12 练习体验打磨 |
| 2026-06-24 | §16 | 技术债清理与框架优化（纯重构） |
| 2026-06-24 | §15 | v01.18 智能推题 v1 |
| 2026-06-23 | §14 | v01.17 数据可视化（真实数据） |
| 2026-06-23 | §13 | v01.16 错题本独立页 |
| 2026-05-07 | §12 | v01.11 沪教版 AI 自动造题 |
| 2026-05-07 | §11 | v01.20 多用户档案 · 重做成功记录 |
| 2026-05-05 | §10 | v01.20 多用户档案首次尝试与回滚复盘（翻车复盘） |

---

## 0. 给新进来的 AI 助手的一段话

> 📌 最近一次文档状态校准：2026-06-27（**文档整体梳理：顶部加速读卡 + TOC + 历史完成记录 §10-§25 标记 [已归档]**；P1-4 jk 7 册收官 V02.28）

你好，我是在 **Windows PC 端** 协作过本项目的助手。用户 `lupeng` 的 CodeBuddy 对话上下文保存在本地 IDE，**无法跨设备同步**，所以我把关键信息整理成这份 `PROJECT_STATUS.md` 推到 GitHub。

**👋 如果你只读一节，请读文档顶部的「🚀 速读卡」**（在本节之前）。 30 秒可上手。

如果还有时间，请按顺序读：

1. 顶部 **🚀 速读卡**（项目 / 起服务 / 9 条铁律 / 最近大事 / 决策树 / 接手三件套）
2. **本节 §0**（9 条铁律完整版） + **§3 当前规模** + **§4 目录与关键文件** + **§5 重要约定（容易踩坑）**
3. **§8 后续版本开发计划**：看 P0/P1/P2/P3 哪些 checkbox 还没勾，决定干啥
4. 需要看具体实现时再打开对应源文件。
5. **附录 A**（§10-§25）是历史完成记录，**按需检索**，不需要逐章读完。

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

#### 铁律 3 · 验证服务不动 `version.txt`、不 push；部署走 `dev-push.sh`(Mac)/`dev-push.ps1`(Win)

- 本地起的服务仅用于验证，**绝不手改 `version.txt`、不擅自 push**（详见铁律 9 红线）。
- 部署 / 上线由用户确认后跑推送脚本——**Mac/Linux：`./dev-push.sh`；Windows：`dev-push.ps1`**；脚本做 `commit + pull --rebase + push`（**版本号 bump 由 CI 负责，脚本本身不写 `version.txt`**）。用户明确说"推送"时才执行。

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

#### 铁律 6 · 关键改动必须"真实落盘验证"（2026-06-28 新增）

> 起因：单词卡按钮重设计时，`index.html` 结构改动因编辑工具未真正落盘而遗漏，且本环境 shell/工具输出间歇性乱码（grep/print 返回假数字），AI 据假数据误判"已改"，导致只有 CSS 上线、按钮重设计漏部署，反复排查浪费大量 token。

铁律：涉及代码改动的验证，**只信磁盘真相**，按以下链路确认；**禁止凭单次工具输出（尤其 shell grep/print，本环境会乱码）下结论**：

1. 用 **Python 直写磁盘**（替代不稳定的行编辑），写后**重新读盘**统计关键标记。
2. `git diff --numstat HEAD` 确认改动**真实进入工作区**。
3. push 后**直接拉线上 URL**（`urllib`）核对内容，再宣布完成。

#### 铁律 7 · 省 token、按字面诉求一步到位（2026-06-28 新增）

> 起因：多轮反复测试 / 脑补"按钮不见" / 安装 Playwright + Chromium 自证，严重浪费 token。

1. **严格按用户字面诉求**，不脑补、不预设问题、不绕弯；用户说"部署"就部署。
2. **一次到位**：改动落盘验证一次即可，不反复自证、不上重工具（Playwright / 截图等非必要不用）。
3. **少读多准**：只读必要片段，不重复 / 大段读；识别到环境乱码立即固定可靠通道。
4. **回复精简**：结论先行，少铺陈。

> **与铁律 6 的边界**（避免误读为矛盾）：铁律 6 要"真实落盘验证"、铁律 7 要"省 token 不过度自证"，二者自洽的边界是——**关键改动（代码/数据）落盘验证一次到位即可，但不重复自证、不为同一结论反复跑测试或上重工具**。即"验证要到位，但只到位一次"。

#### 铁律 8 · 数据安全三件套（2026-06-28 新增）

> 起因：`build_qbank.py --write` 第一次运行时完全替换了 4 个题库 JSON（420→70 题），导致其他年级旧题全丢。幸好 git 可恢复，但暴露了「构建脚本直接覆写生产数据无安全网」的致命风险。

任何写入 `data/questions/*.json` / `data/examples/*.json` / `data/textbooks/*.json` 的脚本都必须遵守：

1. **写入前自动备份**：把旧文件存到 `data/questions/.backups/{文件名}_{时间戳}.json`（目录已加入 `.gitignore`）。
2. **打印差异报告**：输出「旧 X → 保留 Y + 新 Z → 合并 W | 替换 N 条旧题」明细，一目了然。
3. **题量骤降阻断**：合并后题量比旧版减少超过 30% → 立即中断写入，提示 `.backups` 位置；确认是预期行为后加 `--force` 跳过。
4. **写完跑校验**：`python scripts/_verify_qbank.py` 退出码 0 才算通过；检查 4 类型题库完整性（必填字段 / code 格式 / grade-term 一致 / 听力 audioFile 规范）。

已有参考实现：`scripts/jk/build_qbank.py --write`（内置备份 + 差异报告 + 骤降阻断）、`scripts/_verify_qbank.py`（全题库校验，jk+hj 2703 题 0 错误）。

#### 铁律 9 · 绝不手改 `version.txt`（2026-06-28 新增 · 最高优先级红线）

> 起因：多次（含最近一次智能推题开关修复）AI 在 Mac 端用裸 `git push`，并**手写 `version.txt` 想"刷新缓存"**，结果与 CI 自动 bump 的 `version.txt` 在同一行 rebase 冲突。这是历来"版本冲突"的**唯一根因**。

任何端、任何人、任何任务都必须遵守：

1. **`version.txt` 完全由 CI 托管**：`.github/workflows/update-version.yml` 在 `feat/fix/perf/refactor` 提交推送后，自动计算下一个版本号（同月小版本 +1 / 跨月大版本 +1）、写入 `version.txt` 并以 "GitHub Actions" 身份提交。`docs/chore/ci/test/style/build` 不 bump。
2. **缓存自动刷新**：前端按 `version.txt` 的版本号给 `styles.css` / `js` 加 `?ver=` 参数，CI bump 后 URL 自动变化、缓存自动失效。**无需、也禁止手改 `version.txt` 来"刷缓存"**。
3. **推送统一走脚本**：Mac/Linux 跑 `./dev-push.sh`、Windows 跑 `dev-push.ps1`。两者都：先提交业务改动 → `git pull --rebase origin main` → `git push`，且**内置护栏**：若检测到 `version.txt` 被本地改动，自动 `git checkout -- version.txt` 还原后再推，从源头杜绝冲突。
4. **绝不裸操作**：不要绕开脚本手敲 `git push`；更不要 `echo / printf > version.txt`。若脚本不可用，至少手动遵循「`pull --rebase` → push、且不碰 `version.txt`」。
5. **真要改版本格式**：只能改 `update-version.yml`（CI 规则），不能改产物 `version.txt`。

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

## 3. 当前规模（2026-07-03 对账核查）

> 数据通过磁盘文件计数核出，与实际一致；变动以本表为准，旧版表述请忽略。

### 教材（合计 **153 个真实单元 + 0 占位**）

| 教材 | 状态 | 详情 |
|---|---|---|
| **教科版 jk** | ✅ 主力（三年级起点） | **74 个单元** —— 1-2 年级 **不存在**（教科版广州小学英语为三年级起点，1-2 年级请切到「广州口语 gzk」教材，详见 §33）；**3 上 → 6 上 共 7 册 63 单元**（每册 9 单元 / 70 词 / 18 课文，2024 秋新版）；6 下 11 单元真实（2014 旧版） |
| **沪教版 hj** | ✅ 完整 | **48 个单元**（7-9 年级 × 上下册 × 8 单元；每单元 15 词 + 3 篇课文 Reading / Grammar focus / More reading） |
| **广州口语 gzk** | ✅ 完整 | **23 个单元全部真实**（1A 6 + 1B 6 + 2A 6 + 2B 5，0 占位），P1-5 收官（§30） |
| 人教 rj / 外研 wy | ⏳ 未启动 | 下拉框 `disabled`，P3 待启动 |

### 题库（合计 **3501 题** + 92 篇完形）

| 教材 | 拼写 | 听力 | 语法 | 阅读 | 完形(篇) | 听音填空 | 听音判断 | 听音选图 | 连词成句 | 完成句子 | 句型转换 | **合计** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **jk** | 645 | 125 | 235 | 160 | **56** | 49 | 50 | 50 | 73 | 73 | 1 | **1517 题 + 56 篇** |
| **hj** | 698 | 192 | 480 | 288 | **36** | — | — | — | — | — | — | **1694 题 + 36 篇** |
| **gzk** | 244 | 46 | — | — | — | — | — | — | — | — | — | **290 题** |

> ✅ **完形填空（P2-C 批次 1-3 完成 + 后续补全）**：hj 全 6 册 36 篇 / 180 挖空 + **jk 全 7 册 + 6下 共 56 篇** = 总 **92 篇 / 460+ 挖空**。
> - hj：每篇 80-100 词 + 5 挖空（diff 2-4），每册 6 篇
> - jk：3-4 年级 40-60 词 + 4 挖空（diff 1-2），5-6 年级 60-90 词 + 5 挖空（diff 2-3），每册 5 篇 × 7 册 = 35 篇 + 6下补 5 篇 + 后续批次追加 16 篇 = 56 篇
> - 详见 §36（hj）+ §37（jk）。
> - 🆕 **三大听力新题型（§39）**：听音填空 49、听音判断 50、听音选图 50（jk 教材）
> - 🆕 **三大书写/词汇题型（§39）**：连词成句 73、完成句子 73、句型转换 1（jk 教材）
> - 🆕 **书面表达（P6-C §52）**：`jk_writing.json` 16 篇（5下5+6上5+6下6），中国元素优先；5下/6上/6下期末经 `mid_final_w` 模板接入写作 10 分

> jk 1-6 年级全册题量（§31 收官）：G1-2 每册 10 拼写 / 4 语法 / 2 听力（无阅读）；G3-6 每册 70 拼写 / 18 语法 / 9 听力 / 9 阅读；G6 下沿用旧版（55 拼写 / 33 语法 / 22 听力 / 22 阅读，含旧版 code 后缀）。  
> hj 听力 192（7-9 年级全册），7A 32 题为人工原题、其余 160 题 AI 造题 + MP3。  
> 🆕 **gzk 题库（§34）**：仅拼写 + 听力两类（一二年级口语教材不做语法/阅读）；每词 1 道拼写、每单元 2 道听力；G1上 84 / G1下 72 / G2上 72 / G2下 62，每单元 code 格式 `{1-2}{A/B}_U{N}_{S/L}{NN}`。

> jk 1-6 年级全册题量（§31 收官）：G1-2 每册 10 拼写 / 4 语法 / 2 听力（无阅读）；G3-6 每册 70 拼写 / 18 语法 / 9 听力 / 9 阅读；G6 下沿用旧版（55 拼写 / 33 语法 / 22 听力 / 22 阅读，含旧版 code 后缀）。  
> hj 听力 192（7-9 年级全册），7A 32 题为人工原题、其余 160 题 AI 造题 + MP3。  
> 🆕 **gzk 题库（§34）**：仅拼写 + 听力两类（一二年级口语教材不做语法/阅读）；每词 1 道拼写、每单元 2 道听力；G1上 84 / G1下 72 / G2上 72 / G2下 62，每单元 code 格式 `{1-2}{A/B}_U{N}_{S/L}{NN}`。

### 例句（合计 **14 册 / 1383 词 / 4149 句**，全含 `audioFile`）

| 教材 | 册数 | 词数 | 句数 |
|---|---|---|---|
| hj | 6（7A/7B/8A/8B/9A/9B） | 690 | 2070 |
| jk | 8（3 上→6 上 7 册 + 6 下 1 册） | 693 | 2079 |

### 音频 MP3（合计 **5626 个**）

| 类别 | 数量 | 说明 |
|---|---|---|
| **例句朗读 `ex_*.mp3`** | **3833** | hj 6 册（约 2070 句）+ jk 8 册（约 2079 句），跨册 hash 去重后实际唯一句数 |
| **单词卡 `word_*.mp3`** | **1043** | 周末新增（§27）：964 词 hj/jk 全词库 MP3 化 + 79 词 gzk 新词 |
| **听力题 MP3**（jk + hj + gzk + 历史） | **362** | 各教材听力题音频，含 71 个 jk 1-6 年级听力（§31）+ 🆕 **46 个 gzk_listening_01-46.mp3**（§34） |
| **课文朗读 `grade*.mp3`** | **318** | 教科版多角色男女声重生成（§26 情感韵律增强） |
| **gzk 课文 `gzk_*.mp3`** | **70** | 广州口语 23 单元课文（§30，含 `gzk_` 前缀避免与 jk 文件名冲突） |

### 数据安全

| 机制 | 说明 |
|---|---|
| 自动备份 | `scripts/jk/build_qbank.py --write` 写入前备份到 `data/questions/.backups/` |
| 差异报告 | 每次写入打印「保留 X / 新增 Y / 替换 Z」明细 |
| 骤降阻断 | 合并后题量减少 >30% 自动中断，加 `--force` 跳过 |
| 校验脚本 | `python3 scripts/_verify_qbank.py` 检查 3501 题完整性 |

### 前端代码

| 项 | 状态 |
|---|---|
| `app.js` | **577 行**（按功能域拆分后，原 3851 行） |
| `js/*.js` | **13 个**全局变量风格模块：`textbook` / `state` / `profile` / `player` / `core` / `wrongbook` / `mastery` / `smartpick` / `stats` / `home` / `lesson` / `practice` / `exam` |
| PWA | ✅ 完整（manifest + 192/512 PNG + `sw.js` 预缓存 `data/` + `audio/` + 13 个 js 模块） |
| Chart.js | ✅ 本地化（`js/vendor/chart.umd.min.js` 进 SW 预缓存） |
| 自动化测试 | ✅ `tests/smoke.py`（Playwright headless）—— 35 全局函数 + 4 命名空间断言 + 关键调用 |

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

> 详细的功能详情见**附录 A**对应章节；本节只给「按周里程碑」的速读视图，方便接手 AI 快速对齐时间线。  
> 完整 git log：`git log --pretty=oneline --no-merges`

### 📅 2026-W26（2026-06-22 → 2026-06-28）· 内容大爆发 + 9 条铁律收尾

| 日期 | 里程碑 | 章节 |
|---|---|---|
| 06-23 | v01.16 错题本独立页 · v01.17 数据可视化（真实数据 + Chart.js 本地化） | §13 / §14 |
| 06-24 | v01.18 智能推题 v1（4 维加权打分 + 可解释标签）· 技术债清理（app.js 拆分 / token / 冒烟测试 / 音频句级增量） | §15 / §16 |
| 06-25 | hj 语法+阅读补齐至 48 单元全覆盖（480+288 题）· v01.12 练习体验四项 · 手机底栏改版 · 考试 120 分制 + 36 真题 + 作文自动评分 | §17-§20 |
| 06-26 | hj 6 册例句全量补齐（7A-9B）· **P0-1 听力 MP3 补全 160 个** · 全量测试报告 + 待办清单 · **P1-4 jk 教科版 7 册（3 上→6 上）全量补齐 + 开发宪法 + 流水线模板化** | §21-§25 |
| 06-27 | 课文情感韵律增强 + 多角色男女声 · **单词卡发音本地 MP3 化 964 词** · 在线依赖兜底 · 技术债 T-1/2/3 · **P1-5 gzk 广州口语 1-2 年级 22 单元全量收官** | §26-§30 |
| 06-28 | **P1-6 jk 小学 1-6 年级题库补齐 1045 题 + 71 MP3 + 三层数据安全防护** · 单词记忆曲线 SRS · 单词卡按钮重设计 · smartpick 圆钮修复 · **铁律 6/7/8/9 集中引入** + Mac `dev-push.sh` + ps1 护栏 | §31 / §32 |

### 📅 2026-06-29（PC 端）· 本次

- `docs(status)`: PROJECT_STATUS.md 二次梳理（铁律 6/7/8/9 上移并入 §0 与 1-5 并列形成 9 条单一信源；速读卡当前线上改为指针；§3/§7/§8 同步到周末后真实数据）

### 📅 早期里程碑（2026-05 前）

```
d91e3d6 2026-05-05 docs: 同步 PROJECT_STATUS 至技术债收尾后状态（分片/增量/模块拆分）          [PC]
dde6cdc 2026-05-05 refactor(js): 拆分 app.js 为 textbook/state/player 三个独立模块            [PC]
f8634b6 2026-05-05 feat(audio): gen_audio_v2 支持 manifest 增量校验                          [PC]
b5dae7f 2026-05-05 perf(data): 沪教版 hj.json 按年级分片懒加载，首屏降 71%                    [PC]
38b01bc 2026-05-05 feat(audio): 沪教版 144 篇课文 MP3 + gen_audio_v2 扩展                    [PC]
5d7a903 2026-05-05 feat(hj): 补齐沪教牛津版 7-9 年级全 48 单元教材内容                        [PC]
14e061f 2026-05-04 feat(spelling): 字母格子填空+手机发音修复+UI优化                          [Mac]
ea5f85c 2026-05-04 feat(practice): 答题中切换年级/学期无缝刷新题目                          [PC]
c67c4da 2026-05-03 feat: 切换年级重置练习+单元左右滑+每年级扩4-5单元(+22 MP3)                [PC]
0ae229e 2026-05-03 feat: 重构数据架构 + 308 题 + 1-9 年级全覆盖 + 导入工具                  [PC]
da1fccc 2026-05-03 feat(arch): 全局学习上下文切换（localStorage 记忆）                       [PC]
4bf5082 2026-05-03 feat(voice): 预生成 13 篇课文 MP3（Edge Neural TTS）                     [PC]
a4f0da4 2026-05-03 Initial commit                                                          [PC]
```

## 8. 后续版本开发计划

> 当前基线：`20260702V03.04`（CI 自动维护）。  
> 📌 **接手 AI 重点看这一节**：「已完成存档」确认现状 → 「🎯 逐期计划」按顺序执行 → 「📋 条件就绪后启动」等 Key 到位再看。  
> **决策记录**：2026-07-03 用户通过铁律 5 选项清单确定：①优先级 C（版本升级优先）②逐个完成再推进 ③暂无 LLM Key（详见 §43）。

---

### ✅ 已完成存档（P0 / P1 / P2 全部零原则）

| 编号 | 范畴 | 关键产出 | 详见 |
|---|---|---|---|
| P0 全清 | 基础设施 | 听力 MP3 / sw.js 缓存 / 小学考试配置 / 依赖兜底 / 例句三级降级 | §21 |
| P1-4 | jk 7 册例句补齐 | 63 单元 / 1437 例句 / 1344 ex_*.mp3 | §22-§25 |
| P1-5 | gzk 全量填充 | 23 单元 / gzk 课文音频 70 个 | §30 |
| P1-6 | jk 1-6 题库补齐 | 1045 题 + 71 jk 听力 MP3 + 铁律 8 三件套 | §31 |
| P5-A | 教材边界澄清 | jk 三年级起点，移除 1-2 年级占位 82→74 | §33 |
| P2-A | jk 8 册例句 | 1930 句 100% 含 audioFile | §22-§25 |
| P2-B | gzk 题库 | 244 拼写 + 46 听力 + 46 MP3 + 质量增强 | §34-§35 |
| P2-C | 完形填空 | hj 36 篇 + jk 56 篇 = 92 篇 / 460+ 挖空 | §36-§37 |
| A2-B1 | 考试模板化 | `exam_templates.json` 10 套模板 + 引用化 2390→280 行 | §40 |

---

### 🎯 一期（当前）：P5 · jk 6 下 U11 Review 中国化替换

> ⚠️ **方向修正**（2026-07-03）：6 下 U5 孙中山 + U6 邓稼先**已就位**（已替换老版 Steve Jobs），核心无需升级。仅 U11 Review（非洲 Safari / 曼德拉）需替换为中国科学家/文化主题。

| 维度 | 说明 |
|---|---|
| **目标** | 6 下 U11 Review 从全非洲/外国内容 → 中国文化名人/科学家回顾主题 |
| **工时** | ~45 分钟 |
| **风险** | **低**。仅 1 个复习单元替换，不改 U1-U10 核心 |
| **无 LLM Key 依赖** | ✅ |
| **产出** | U11 新课文 3 篇 + 对应题库更新 + MP3 |
| **验收**（铁律 1） | 切 jk 6 下 → 复习页显示中国科学家/文化内容，不再出现非洲 Safari |

---

### 🎯 二期：P3-D · 语法讲解页数据化

| 维度 | 说明 |
|---|---|
| **目标** | 当前语法讲解页仅 4 条硬编码示例 → 建设结构化语法知识库 JSON |
| **工时** | ~5 天 |
| **无 LLM Key 依赖** | ✅（纯数据结构化，人工整理 + 规则驱动） |
| **覆盖范围** | jk 3-6 年级 + hj 7-9 年级核心语法点（时态 / 句型 / 词性 / 从句等） |
| **产出** | `data/grammar/grammar_knowledge.json`（按年级/教材/语法点索引）+ grammar.js 渲染引擎改造 |
| **验收** | 切任意年级 + 语法页 → 显示该年级对应语法条目，不再只有 4 条占位 |

---

### 🎯 三期：P4 · 人教 rj + 外研 wy 新教材从 0 建设

| 维度 | 说明 |
|---|---|
| **目标** | 新增两套主流教材数据，扩大覆盖用户群 |
| **工时** | ~1 个月（分册分批交付） |
| **策略** | 复用 jk 教科版 7 册补齐流水线（`scripts/{tb}/build_qbank.py` + 铁律 8 三件套 + 分册交付） |
| **无 LLM Key 依赖** | ✅ |
| **分期** | rj 先做、wy 后做；每册独立 commit + 独立验证 + 独立推送 |
| **产出** | textbook JSON × N 册 + 对应题库 JSON + 课文 MP3 + 例句数据 |

---

### 📋 条件就绪后启动：P3-A/B/C · AI 真功能（需 LLM Key）

> ⚠️ 以下三项均需要 LLM API Key（OpenAI / 通义千问 / DeepSeek 等），当前无 Key，暂不启动。获得 Key 后按此顺序逐个推进。

| 编号 | 功能 | 现状 | 工时 | 依赖 |
|---|---|---|---|---|
| **P3-A** | AI 对话 | `app.js:216-260` 关键词匹配 → 真 LLM 对话 | ~1 周 | LLM Key |
| **P3-B** | 录音 ASR | `lesson.js` 随机分 85+ → Web Speech API 兜底 + 云端 ASR | ~1 周 | 浏览器 Web Speech API（免费）/ 云端需 Key |
| **P3-C** | 作文评分 | `exam.js` 启发式 → LLM 真评分 | ~3-5 天 | 复用 P3-A 的 Key |

---

### 🛠️ 横向技术债（全部 ✅ 完成）

| 项 | 状态 |
|---|---|
| `data/` 按年级分片懒加载 | ✅ |
| `app.js` 按功能域拆模块（3851→577 行） | ✅ |
| 视觉规范（design token） | ✅ |
| 自动化测试（`tests/smoke.py`） | ✅ |
| `gen_audio_v2.py` 句级增量 | ✅ |
| 数据安全防护（铁律 8 三件套） | ✅ |
| 推送脚本双端对等 + version.txt 护栏（铁律 9） | ✅ |

### 🛠️ 横向技术债（穿插各版本完成）

| 项 | 状态 | 备注 |
|---|---|---|
| `data/` 按年级分片懒加载 | ✅ 已完成（`b5dae7f`，`hj.json` 按年级分片懒加载） |
| `app.js` 按功能域拆模块 | ✅ 已完成（§16）· 方案 A 全局变量风格分片，app.js 3851→577 行，新增 12 个 `js/*.js` |
| 视觉规范（设计 token） | ✅ 已完成（§16）· `styles.css` `:root` 完整 token 体系 |
| 自动化测试 | ✅ 已完成（§16）· `tests/smoke.py` Playwright headless |
| `gen_audio_v2.py` 句级增量 | ✅ 已完成（§16）· 句 hash + `audio/_sent/` 持久缓存 |
| 数据安全防护 | ✅ 已完成（§31 / 铁律 8）· `build_qbank.py` 三件套 + `_verify_qbank.py` |
| 推送脚本双端对等 + version.txt 护栏 | ✅ 已完成（§32 / 铁律 9）· `dev-push.sh` + `dev-push.ps1` 内置 `git checkout -- version.txt` 自动还原 |

---

### 📜 历史版本计划归档（v01.10 → v01.20，已全部完成）

> 以下计划已全部完成，作为历史档案留存；细节详见对应附录 A 章节。

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

#### v01.13 → v02.x 历史规划（已收敛/已并入完成态）

> ⚠️ 以下子段（P1 人教外研 / P2 学习闭环 / P3 AI 真接入 / 横向技术债 / 里程碑预估）原为 v01.13 时的版本计划，**多数已完成或并入新优先级**。  
> ✅ **当前可执行任务以本节顶部「⭐ 当前优先级」+「🎯 下一档可选任务」为准**，下面段仅作历史档案：
>
> - 🟢 P1 人教/外研版教材（v01.13/14/15）→ **未启动**，现归入「🎯 下一档 P4」。
> - 🔵 P2 学习闭环（错题本 v01.16 / 数据可视化 v01.17 / 智能推题 v01.18 / PWA v01.19 / 多档案 v01.20）→ **全部 ✅ 已完成**，详见 §13-§15、§11、§10。
> - 🟣 P3 AI 真接入（v02.0-v02.3）→ **未启动**，现归入「🎯 下一档 P3-A/B/C」。
> - 🛠️ 横向技术债（分片懒加载 / 模块拆分 / token / 冒烟测试 / 句级增量）→ **全部 ✅ 已完成**，并入本节顶部技术债表。
>
> 接手第一件事：① `git pull --rebase origin main`；② 读速读卡 + §0 九条铁律 + §3 规模 + §8 当前优先级；③ 跑 `python scripts/_verify_qbank.py` 确认题库 2703 题 0 错误；④ 双端起服务验证一切如常后再开工。

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

---

# 📦 附录 A · 完成记录档案（按章节号顺序，时间正序）

> 以下 16 章为历史完成记录，标题已加 `[已归档]` 前缀，作为档案保留。新接手 AI 无需逐章读完，按需检索即可（也可按附录 A 索引表的时间倒序查阅）。

---

## 10. [已归档] ⚠️ v01.20 多用户档案首次尝试与回滚复盘（2026-05-05 深夜）

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

## 11. [已归档] ✅ v01.20 多用户档案 · 重做成功记录（2026-05-07 凌晨）

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

## 12. [已归档] ✅ v01.11 沪教版 AI 自动造题 · 完成记录（2026-05-07 凌晨）

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

## 13. [已归档] ✅ v01.16 错题本独立页 · 完成记录（2026-06-23）

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

## 14. [已归档] ✅ v01.17 数据可视化（真实数据）· 完成记录（2026-06-23）

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

## 15. [已归档] ✅ v01.18 智能推题 v1 · 完成记录（2026-06-24）

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

## 16. [已归档] ✅ 技术债清理与框架优化（2026-06-24，纯重构·零行为变更）

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

## 17. [已归档] ✅ v01.11 语法/阅读补齐 + v01.12 练习体验打磨 · 完成记录（2026-06-25）

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

## 18. [已归档] ✅ 错题本阅读题「显示文章」优化 + Tab 改名 · 完成记录（2026-06-25）

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

## 19. [已归档] ✅ 手机底部导航栏改版（重复名 / 两行 修复）· 完成记录（2026-06-25）

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

## 20. [已归档] ✅ 考试模块改造：120 分制 + 单元测试 + 历年真题 · 完成记录（2026-06-25）

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

## 21. [已归档] 🔍 全量测试报告 + 待开发任务清单（2026-06-26）

> ⚠️ 注：本章「§21.4 待开发任务清单」是当时（2026-06-26）的快照；**最新待办优先级以 [§8 后续版本开发计划](#8-后续版本开发计划v0110--v02x) 为准**（P0 全清 ✅、P1-4 jk 例句已收官 ✅、P1-5 gzk 1-2 待做）。

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
4. ✅ **jk 例句补全（2026-06-27 收官，已上线 `20260626V02.27`）**：教科版 3 上 → 6 上 7 册全量补齐，对齐 hj 人工精编模式。
   - 3 上 §22 / 3 下 §24 / 4 上下 + 5 上下 + 6 上 §25 — **累计 7 册 63 单元 / 490 词卡 / 126 课文 / 1437 例句 / 1344 新 ex_*.mp3**，单册 verify 6 项全 PASS。
   - 6 下 11 单元（2014 旧版）保持原状，后续按需单独排期重做。
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

## 22. [已归档] ✅ P1-4 jk 教科版 3 上全量内容补齐 · 完成记录（2026-06-26）

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

## 23. [已归档] ✅ jk 剩余 7 册补齐 · 开发宪法 + 流水线模板化（2026-06-26）

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
- ✅ 批次 1（3 下）已落地，见 §24

---

## 24. [已归档] ✅ jk 教科版 3 下全量内容补齐 · 批次 1 完成记录（2026-06-26）

> 7 册补齐宪法启动后的第 1 册，**完整复用模板化共享库 + 通用校验**，11 步流水线一气呵成。

### 24.1 决策（铁律 5 · 选项清单一次收齐）

| Q | 选项 | 已选 |
|---|---|---|
| Q1 单元结构 | 8 + Review Road Helper Day（草案） | ✅ 符合，按草案走 |
| Q2 词表 | 70 词草案 | ✅ 全部接受 |
| Q3 课文风格 | Get started 对话 + Reading Room 短文 | ✅ 沿用 3 上 |
| Q4 节奏 | 一口气推到上线 | ✅ 立刻开工 |

### 24.2 关键产出

| 项 | 值 |
|---|---|
| jk.json grade3.下 | 9 单元 / **70 词条**（含 2 跨 Review 复用：rule/help）/ 18 课文（每单元 2 篇） |
| jk_grade3_xia.json | **68 独立词** × 3 句 = **204 例句**（全含 audioFile） |
| audio/ex_*.mp3 | **193 新生成 + 10 复用既有 hash**（与 hj/jk 3上/jk 6下 跨册命中） |
| 备份 | `jk.json.bak.20260626_215043`（自动） |
| `scripts/g3x/` | 9 个 u*.json + 9 个 e*.json + 2 个薄入口（共享库模式） |

### 24.3 流水线性能（新基线，供后续 6 册参考）

| 阶段 | 实际耗时 |
|---|---|
| 单元草稿 9 个 u*.json | 一次写入（~10 分钟） |
| dry-run + --write 导入 jk.json | < 5 秒 |
| 例句草稿 9 个 e*.json | 一次写入（~12 分钟） |
| merge → jk_grade3_xia.json | < 1 秒 |
| 音频 3 批（80+80+33） | 约 12 分钟（edge-tts） |
| verify 6 项校验 | < 1 秒 |
| **单册净流水线耗时** | **约 30-35 分钟** |

> 比开发宪法预估的 ~2 小时**快了 4 倍**，证明共享库 + verify 模板化的提效效果。

### 24.4 关键工程实践

1. **共享库回归 + audioFile 保留 bug 修复**已在 3 上回归验证生效；3 下首次实战，merge 末尾 [preserve] 行虽未出现（因 jk_grade3_xia.json 是首次创建），但批 2/3 之间 audioFile 字段层层叠加保留正确。
2. **跨册 hash 去重收益显著**：3 下 204 句中 **10 句**与既有 hj/jk 6下/jk 3上 复用，节约 10 次 TTS 调用。
3. **跨单元复用词（rule/help）零特判**：jk.json 允许同词在不同单元出现，merge 用后者覆盖前者的例句，前端按 `word` 键查找，体验一致。
4. **decision-by-options 模式（铁律 5）**实战首次落地：4 个问题一次问完，零追问、零模糊。

### 24.5 收口状态

- ✅ verify 6 项全 PASS（jk.json 9 单元/字段完整/例句对齐/audioFile/level/MP3 落盘）
- ✅ 双端预览 `http://localhost:8765/index.html` + `mobile.html` 数据 200
- ✅ JK_REMAINING_7_VOLUMES_PLAN.md §7 进度表 3 下行打勾
- ✅ **已上线** `20260626V02.25`（HEAD `46aa720`，2026-06-26）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260626V02.25>

---

## 25. [已归档] ✅ jk 教科版剩余 5 册全量补齐 · 批次 2-6 一次性收官（2026-06-26 晚）

> 用户要求"完成全部 7 册，明天统一验收"。基于 §22/§24 已验证的流水线 + 共享库 + 通用校验，连续完成 4 上 / 4 下 / 5 上 / 5 下 / 6 上 5 册，**单晚累计交付**。

### 25.1 5 册数据规模（含 3 上/3 下回顾）

| 册 | 单元 | 词条 | 课文 | 例句 | 新 MP3 | 复用 | jk_grade*.json |
|---|---|---|---|---|---|---|---|
| 3 上（§22） | 9 | 70 | 18 | 210 | 208 | 0 | jk_grade3_shang.json |
| 3 下（§24） | 9 | 70 | 18 | 204 | 193 | 10 | jk_grade3_xia.json |
| **4 上** | **9** | **70** | **18** | **207** | **195** | **11** | jk_grade4_shang.json |
| **4 下** | **9** | **70** | **18** | **204** | **189** | **15** | jk_grade4_xia.json |
| **5 上** | **9** | **70** | **18** | **210** | **191** | **19** | jk_grade5_shang.json |
| **5 下** | **9** | **70** | **18** | **207** | **197** | **10** | jk_grade5_xia.json |
| **6 上** | **9** | **70** | **18** | **195** | **171** | **23** | jk_grade6_shang.json |
| **7 册合计** | **63** | **490** | **126** | **1437** | **1344** | **88** | — |

（6 下 11 单元 / 164 词 / 493 例句 仍保持 2014 旧版，未动）

### 25.2 流水线性能（实战收益）

| 项 | 开发宪法预估 | §22 实测 | §24 实测 | §25 五册平均 |
|---|---|---|---|---|
| 单册净耗时 | ~2 小时 | ~30 分钟 | ~30 分钟 | **~15-20 分钟** |
| 跨册 hash 命中 | — | 0 | 10 | 11~23（持续增长） |
| 失败次数 | — | 0 | 0 | 0（5 册全 PASS） |

效率从开发宪法预估的 2 小时/册降到 **20 分钟/册**——共享库 + 通用 verify + hash 去重三件套累积收益巨大。

### 25.3 教材数据来源说明

5 册的单元标题与词表基于以下来源整理：
- **2024 秋新版教科版小学英语**电子课本目录（多渠道交叉核实：教学设计合集 / 知识点归纳 / 课件大单元设计 / dzkbw 电子课本网）
- **2022 新课标**话题大纲
- 与已交付的 3 上 / 3 下话题主线自然衔接

各册主题主线：
- 4 上：Come on In!（问候 / 家庭 / 房间 / 日常 / 爱好 / 动物 / 周末 / 节日 / Happy New Year）
- 4 下：Spring（春天 / 衣服 / 购物 / 数字价格 / 食物 / 厨房 / 健康习惯 / 野餐 / Picnic Review）
- 5 上：New School Year（新学年 / 科目 / 才艺 / 图书馆 / 运动会 / 节日 / 社团 / 志愿者 / Show Time）
- 5 下：Trip Plans（出行 / 问路 / 景点 / 纪念品 / 明信片 / 文化 / 安全 / Journey Review）
- 6 上：Welcome to Junior（小升初衔接 / 梦想职业 / 英雄 / 运动 / You Are What You Eat / 环保 / 发明 / 友谊 / Bright Future）

> ⚠️ 编纂方针沿用合规改编：**话题与词汇大纲对齐官方，课文与例句全部原创**，不照搬课本原文。
> 如用户对照课本发现 1-2 处个别词需替换，可在 scripts/g{N}{s|x}/u*.json 修改后重跑 `python scripts/g{N}{s|x}/import_textbook.py --write` 即可（增量 .bak 备份，可回滚）。

### 25.4 工程实践亮点

1. **5 册流水线一气呵成零失败**：1344 个新 MP3 + 1437 条例句 + 1437 条 audioFile 回写，0 fail，0 重跑。
2. **跨册 hash 去重收益累计 88 条**（约 6% 节约）：6 上达到 23 条复用，说明越到后期共享率越高。
3. **每册 verify 6 项 PASS**：单元数 / 字段完整 / 词表对齐 / audioFile / level / MP3 落盘 — 7 册全绿。
4. **铁律 5 自洽**：开工前 4 个决策项一次性用 `ask_followup_question` 收齐，整晚执行无追问。

### 25.5 收口状态

- ✅ 7 册（3上 → 6上）全部上线，6 下保持原状（2014 旧版，后续单独排期）
- ✅ `JK_REMAINING_7_VOLUMES_PLAN.md §7` 进度表 6 个 ☐ 全部打勾
- ✅ **已上线** `20260626V02.27`（HEAD `32576f4`，2026-06-26 晚批量推送；2026-06-27 用户验收通过）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260626V02.27>
- ✅ 7 册全量交付收官（3 上 → 6 上，6 下 2014 旧版保持原状未动）；P1-4 jk 例句补全任务整体关闭


---

## 26. ✅ 课文朗读情感韵律增强 + 全年级多角色男女声重生成（2026-06-27 晚 · 待验收）

### 26.1 问题与决策（铁律 5 · 选项清单收齐）

- **用户反馈**：小学课文音频"干巴、没感情色彩"，且对话"没区分男女不同人物的声音"。
- **Q1 技术路线**（单选）→ 选 **方案 A**：免费 edge-tts + 韵律增强（按语气动态调语速/音高/音量 + 童声），不接入 Azure 付费 express-as。
- **Q2 覆盖范围**（单选）→ 选 **全年级 1–9（jk + hj）全量重生成多角色 + 情感音频**。

### 26.2 落地改动（`gen_audio_v2.py`）

1. **情感韵律层** `analyze_prosody(content, speaker, voice)`：
   - 疑问句 → 音高 +12Hz、语速略放慢（上扬询问感）
   - 感叹句 → 音高 +10Hz、语速 +6%、音量 +12%（激动强调）
   - 激动开头词（wow/oh/look…）→ 音高/音量轻微抬高
   - 童声角色（Ana/Brandon）→ 再抬高音高、略快（天真活泼）
2. `tts_to_file` / `tts_with_retry` 新增 `pitch` / `volume` 参数；`gen_example_audio.py` 用关键字调用，向后兼容。
3. `sentence_hash` 纳入 pitch/volume → 韵律参数变化时句缓存自然失效。
4. 扩充 `NAME_GENDER` 字典（Anna/Jim/Tina/Marco/Edison/Nina/Betty/Daisy 等 ~50 名），修正主角色性别误判（Anna 出现 142 次，此前被哈希随机分配忽男忽女）。
5. 新增 `PROSODY_VERSION` 并入 `text_hash`：韵律/性别规则变更时整体判 stale → 触发增量重生成（仅重跑受影响句、其余复用句缓存）。

### 26.3 数据规模

- 全量重生成：jk 174 篇 + hj 144 篇 = **318 篇 `_L` 多角色情感音频**，966 句 TTS，0 fail。
- 字典修正后增量重生成：jk 重跑 65 句 / hj 重跑 23 句（共 88 句），其余 878 句复用缓存。
- 清理 34 个已被 `_L` 取代的旧单女声 `gradeX{A|B}_uN.mp3`（早期精简调试残留）。

### 26.4 验证（铁律 1 · 双端）

- _L 音频 HTTP 全 200（grade3A_u2_L0 / grade1A_u1_L0 / grade9A_u3_L0…），legacy 已 404。
- manifest 核验：grade3A_u2_L0 = Mr Lin 男声(Guy) / Lily 女声(Emma)；grade9A_u3_L0 = Jim 已修正为 Brandon 男童声；疑问句 pitch+12、感叹句 vol+12 已烧录。
- 双端预览：`http://localhost:8765/index.html` + `http://localhost:8765/mobile.html`。

### 26.5 收口状态（✅ 已上线）

- ⚠️ **铁律 3 教训**：音频改动当时以裸 `git push origin main`（`73d21f4`）直接推送，未先经双端验收。**但远端 GitHub Action 自动 bump 了版本**（`d57a3cc ci: auto-bump version to 20260627V02.30`），故线上版本号已对齐，无需手动跑 `dev-push.ps1` 写 `version.txt`（version.txt 由 CI 单行格式接管）。
- ✅ **用户 2026-06-27 晚双端验收通过**；本文档 §26 随收尾提交一并 push（铁律 2 / 4）。
- ✅ **已上线** `20260627V02.30`（音频 `73d21f4` + CI 版本 `d57a3cc`）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260627V02.30>
- 📌 客户端 PWA（sw.js）可能需刷新一次才能听到新音频。
- 📝 **流程纠正**：今后涉及上线一律「先双端验证 → 用户验收 → 再 push」；本地不必手写 `version.txt`，推送后由 CI 自动 bump。

---

## 27. ✅ 单词卡发音本地 MP3 化 · 根治"认识不发音"（2026-06-27 晚 · 待验收）

### 27.1 问题与定位

- **用户反馈**：单词卡点"✓ 认识"单词不发音，疑似 bug。
- **逐层排查**：有道接口正常（HTTP 200，换任何 Referer/Origin 均返回有效 MP3）；`sw.js` 第 115 行跨域请求不拦截；🔊 与 ✓认识 同走 `playWord()→speak()`，`player.js` 无近期回归。
- **根因（架构脆弱性，非回归）**：单词发音 **100% 依赖有道在线 + 浏览器 TTS 兜底，无本地 MP3**。网络到有道不通 / PWA 离线 / 设备无英文 TTS 语音包（华为/安卓常见）/ 连点认识时 500ms 自动翻页掐断在线音频 → 都会"不发音"。

### 27.2 落地改动（方案 A · 用户选定）

1. **新增 `gen_word_audio.py`**：遍历所有教材 `words[*].word`，去重 **964 个**单词，用 edge-tts（Aria，RATE -8%）生成本地 MP3。
   - 确定性文件名：`audio/word_{key}.mp3`，`key = word.lower()` 后非 `[a-z0-9]` 段替换为 `_` 去首尾（apple→word_apple；"get up"→word_get_up）。前端可用同规则拼路径，无需 hash 库。
2. **`js/player.js` 改造**：`speak()` 单段短词路径改为 `playLocalWordThenOnline()` —— **本地 MP3 优先 → 有道在线 → 浏览器 TTS**。新增 `_wordAudioKey()`（与 Python `word_key` 同规则）。本地命中 2.5s 超时退回在线。

### 27.3 规模与验证

- 生成 **964 个 `word_*.mp3`**，0 fail；HTTP 抽样全 200（apple/hello/cat、带空格词组 word_get_up 等）。
- 前后端文件名规则一致，单词卡发音离线可用，不再依赖有道。
- 双端预览：`http://localhost:8765/index.html` + `http://localhost:8765/mobile.html`。
- `sw.js` 对 `audio/*.mp3` 走 cache-first，单词 MP3 首次播放后自动入缓存离线可播，无需改 SW。

### 27.4 验收期连带修复（同批）

验收过程中暴露并修复了 3 个发音体验问题（均在 `js/player.js` / `js/lesson.js`）：

1. **叠音**：`stopSpeak()` 用 `src=''` 停音会触发本地音频 `onerror` → 误回退有道在线重播 → 与新词叠音。修复：清 `src` 前先解绑 `onerror/onended/onplaying`（与例句早期同款解法）。
2. **发音被切**：旧 `markKnown` 固定 `setTimeout(nextWord, 500)`，单词常比 500ms 长 → 被 `renderWordExamples→stopSpeak()` 掐断。修复：改为**发音结束回调驱动翻页**。
3. **不翻页 / onEnd 丢失**：播放期间例句异步重渲染会 `stopSpeak()` 清空 `_currentCallbacks`，丢掉 onEnd。修复：`playLocalWordThenOnline` **调用时闭包捕获回调**；`markKnown` 加 **0.15s 提顿 + 3.2s 绝对兜底 + 连点保护**。
   - 体验定版：读完单词 → 提顿 **150ms** → 自动翻下一个。

> 本地调试经验：脚本用 `?v={version.txt 首行}` 加载，版本号没变时浏览器走 HTTP 缓存旧 JS；本地验证改用 `index.html?v=<任意新串>` 强制加载最新（URL 的 `?v=` 优先级最高）。线上 push 后 CI 自动 bump 版本，无此问题。

### 27.5 收口状态（✅ 已验收）

- ✅ **2026-06-27 晚用户双端验收通过**（不同词发声 / 断网可发声 / 不叠音 / 读完提顿翻页 / 不跳词）。
- ✅ 随本次一并 push（CI 自动 bump 版本，铁律 3/4）；客户端 PWA 需刷新一次拉取新 `player.js`+`lesson.js`+单词 MP3。

---

## 28. ✅ P0-2 在线依赖排查 + 本地化兜底（2026-06-27 晚 · 已验收）

### 28.1 排查结论

全量梳理联网点（详见过程报告）：单词卡/例句/课文/听力发音均已本地优先离线可用；发现两处短板已修：

- 🔴 **Tailwind 运行时 CDN**（`cdn.tailwindcss.com`，不在 SW 预缓存）→ 离线/弱网整页样式错乱。
- 🟡 **拼写题两处发音**（答对自动发音、小喇叭）仍直连有道，没用 V02.31 的本地 `word_*.mp3`。

### 28.2 落地改动

- **R1 拼写题发音本地优先**（`js/practice.js`）：答对自动发音 + `speakSpellWord` 小喇叭改为走 `speak()`（本地 `word_*.mp3` → 有道 → 浏览器 TTS），与单词卡一致、离线可用。
- **R2 Tailwind 本地化**：Node + Tailwind CLI 静态编译实际用到的类 → `tailwind.css`（30KB），替换 CDN `<script>` 为本地 `<link>`；加入 `sw.js` `STATIC_ASSETS` 预缓存。保留 `tailwind.config.js`+`tailwind.input.css`（含重建命令），不引入 node_modules（仍纯静态）。
  - 动态色类（`_posBadgeClass` 返回的整串 `bg-blue-100`/`text-emerald-700`/`border-amber-200` 等）均被内容扫描捕获，无需 broad safelist。
- R3 二维码本地化：本轮不做（仅真机扫码调试用，影响极小）。

### 28.3 收口状态（✅ 已验收）

- ✅ **2026-06-27 晚双端验收通过**（视觉无回归、词性标签配色正常、拼写题发音正常）。
- ✅ 随本次 push（CI 自动 bump 版本，铁律 3/4）；PWA 需刷新一次拉取新 `tailwind.css`+`practice.js`+`sw.js`。
- 🛠️ 后续：T-1 删废弃 `gen_audio.py` / T-2 统一 `version.txt` 格式 / T-3 性别词典校准（接续进行）。

---

## 29. ✅ 技术债清理 T-1/T-2/T-3（2026-06-27 晚 · 待验收）

- **T-1 删除废弃脚本 `gen_audio.py`**：旧全女声整单元版（`gradeXA_uN.mp3` 无 `_L`），已被 `gen_audio_v2.py` 取代且无代码引用。同步修正 `scripts/import_questions.py`、`scripts/make_template.py` 里指向 `gen_audio.py` 的过期提示（改指 `gen_hj_listening.py` / `gen_audio_v2.py`）。
- **T-2 统一 version.txt 管理权**：根因是「两个写入者」——本地 `dev-push.ps1`（两行格式 + ISO 周递增）与 CI `update-version.yml`（单行 `版本 hash (utc)` + 月递增）冲突，曾致 rebase 冲突。**改为 `dev-push.ps1` 不再本地写 version.txt，完全交给 CI**（脚本只 commit + pull --rebase + push + 提示）。版本号单一源 = CI。
- **T-3 课文性别词典校准**：`VoiceAllocator` 未知性别判定从「含篇 salt 的哈希」改为「**仅名字哈希**」，保证同一角色（Aki/Ming/Guo/Aido 等）在所有单元/教材里性别一致（此前会忽男忽女）。`PROSODY_VERSION` 2→3 触发增量重生成：jk 重跑 20 句 / hj 重跑 84 句，其余复用缓存，318 篇 0 fail。

### 29.1 收口状态（⏳ 待验收 → 部署）

- 验证：Aki/Ming/Guo/Aido 跨单元性别集合均为单一值（✅ 一致）；lint 0 错误。
- 待用户确认后随本次 push（CI 自动 bump，铁律 3/4）。

---

## 30. ✅ P0-1 广州口语 gzk 填充 · 批次1 grade1上（2026-06-27 晚）

> 决策（铁律5）：先做1册验证→对齐参考单元深度→原创改编(话题对官方大纲)。

- **内容**（`scripts/gzk_fill_g1s.py` → `data/textbooks/gzk.json`）：grade1上 6 单元（问候/文具/数字/颜色/玩具/动作），每单元 **12 词**(音标+释义+内联例句) + **3 篇口语课文**(Let's Learn / Let's Talk 对话 / Let's Chant)。对话用"说话人:"前缀触发多角色男女声。
- **技术链路**：gzk 与 jk 同为 grade1/2，音频文件名冲突 → 课文音频加 `gzk_` 前缀（`gen_audio_v2.py` TEXTBOOK_PREFIX + 前端 `playLesson` 同步）。
- **音频**：18 个课文 `gzk_grade1A_u*_L*.mp3`（Andy 男/Lily 女/老师女/Ben 男）+ 28 个新单词 MP3（词库 964→992），0 fail。
- ✅ 用户验收通过；剩余 16 单元（1下6/2上6/2下4）接续。


### 30.1 批次2-4 grade1下/2上/2下（2026-06-27 晚 · 已验收上线）

- `scripts/gzk_fill_rest.py` 填充剩余 **16 单元**：grade1下6（家庭/房子/房间/看见/宠物/食物）+ grade2上6（能力/晚餐/At the Zoo/时间/进行时运动/家务）+ grade2下4（交通/职业/地点/星期）。
- ⚠️ grade2上 u3 官方标题缺失 → 拟定 **"Unit 3 At the Zoo（待核对）"**，待用户提供官方标题替换。
- gzk **23 单元全部填充，0 占位**；课文音频共 **70 个**（gzk_grade1A/1B/2A 各18 + 2B 16）；单词词库 992→1043（gzk 累计新增 79 词 MP3）。0 fail。
- ✅ 用户验收通过 → P0-1 广州口语填充任务**整体收官**。

---

## 31. ✅ jk 小学 1-6 年级全册题库补齐（2026-06-28 晚 · 已上线）

### 31.1 背景

grade3上题库补齐（70拼写/18语法/9听力/9阅读）验证通过后，用户要求继续完成剩余所有年级。

### 31.2 全量成果

| 年级 | 拼写 | 语法 | 听力 | 阅读 | 状态 |
|------|------|------|------|------|------|
| G1上 | 10 | 4 | 2 | - | ✅ 本次精造 |
| G1下 | 10 | 4 | 2 | - | ✅ 本次精造 |
| G2上 | 10 | 4 | 2 | - | ✅ 本次精造 |
| G2下 | 10 | 4 | 2 | - | ✅ 本次精造 |
| G3上 | 70 | 18 | 9 | 9 | ✅ 前置完成 |
| G3下 | 70 | 18 | 9 | 9 | ✅ 本次精造 |
| G4上 | 70 | 18 | 9 | 9 | ✅ 本次精造 |
| G4下 | 70 | 18 | 9 | 9 | ✅ 本次精造 |
| G5上 | 70 | 18 | 9 | 9 | ✅ 本次精造 |
| G5下 | 70 | 18 | 9 | 9 | ✅ 本次精造 |
| G6上 | 70 | 18 | 9 | 9 | ✅ 本次精造 |
| G6下 | 55 | 33 | 22 | 22 | ✅ 旧版沿用 |

- **jk 合计**：645 拼写 + 189 语法 + 102 听力 + 109 阅读 = **1045 题**
- **全题库**（jk+hj）：**2703 题**
- **听力 MP3**：71 个（`jk_listening_{book}_{NN}.mp3`，edge-tts 多角色合成）

### 31.3 构建方法

- `scripts/jk/build_qbank.py`：单一数据源，BOOKS dict 包含 12 册全部单元数据（词表+语法+听力+阅读），一键 `--write` 生成 4 个 JSON
- 每题 `source: "ai_jk_v2"`，code 格式 `{1-6}{A/B}_U{n}`，与前端 `matchUnit` 按 `_U{n}` 匹配完全兼容
- 听力 `audioText` 使用 `W:`/`M:` 多角色标记，由 `gen_jk_listening.py` 合成 MP3

### 31.4 数据安全三层防护

> 📌 本节是 **铁律 8** 的首次实战落地，正式定义见 [§0 铁律 8](#铁律-8--数据安全三件套2026-06-28-新增)；这里只列本任务的实测结果。

- ✅ 写入前自动备份到 `data/questions/.backups/`（已生效）
- ✅ 差异报告打印「保留 X / 新增 Y / 替换 Z」明细（已生效）
- ✅ 题量减少 >30% 自动中断（实测在 build_qbank.py 第一次运行时阻断了 420→70 的覆写灾难）
- ✅ `python scripts/_verify_qbank.py` 退出码 0（2703 题 0 错误）

### 31.5 验证

- `scripts/_verify_qbank.py`：2703 题 0 错误（仅 4 条旧版 code 后缀警告）
- 71 个 jk 听力 MP3 全部存在、非空
- `python3 scripts/jk/build_qbank.py --write` 合并逻辑验证：旧题保留 + 新题替换


## 32. [已归档] ✅ 铁律体系修订时间线（2026-06-28）

> 📌 **本章只做"事件时间线"留档；铁律 6/7/8/9 的权威定义请直接看 [§0 铁律 6-9](#0-给新进来的-ai-助手的一段话)**（与铁律 1-5 并列）。本文档遵循单一信源原则——铁律正文仅 §0 一处，本章不再重复抄录。

### 32.1 修订背景

用户复盘"近几次 AI 没按铁律执行、反复出现版本冲突"。定位根因：**AI 在 Mac 端用裸 `git push` 并手改 `version.txt`**，与 CI 自动 bump 的 `version.txt` 同行 rebase 冲突（最近一次智能推题开关修复即为现行犯）。三个缺口：①只有 Windows 的 `dev-push.ps1`，Mac 端无对等脚本；②"绝不手改 version.txt"红线藏太深；③缓存刷新机制没讲清，诱导 AI 手改 `version.txt`"刷缓存"。

### 32.2 时间线 & 触发的铁律

| 时间 | 事件 | 引入的铁律 | 详见 |
|---|---|---|---|
| 2026-06-28 中午 | 单词卡按钮重设计漏部署排查 | **铁律 6 · 真实落盘验证** + **铁律 7 · 省 token 一步到位**（含 6/7 边界说明） | §0 |
| 2026-06-28 傍晚 | `build_qbank.py` 第一次运行覆写全部 4 个题库 JSON（420→70 题） | **铁律 8 · 数据安全三件套** | §0 |
| 2026-06-28 深夜 | 智能推题开关 Mac 端裸 push + 手改 `version.txt` → rebase 冲突 | **铁律 9 · 绝不手改 `version.txt`（最高红线）** | §0 |

### 32.3 配套基础设施落地

1. **新增 `dev-push.sh`**（Mac/Linux，对等 `dev-push.ps1`）：`commit → pull --rebase → push`，**内置护栏**——检测到 `version.txt` 被本地改动会自动 `git checkout -- version.txt` 还原再推，从源头杜绝冲突。`bash -n` 校验通过、已 `chmod +x`。
2. **更新 `dev-push.ps1`**：补同样的 `version.txt` 误改自动还原护栏，与 Mac 版对等。
3. **铁律 3 正文修订**：补 Mac/Win 双脚本，纠正过时表述（版本 bump 由 CI 负责，脚本不写 `version.txt`）。
4. **`scripts/_verify_qbank.py`**：全题库 4 类型校验脚本（jk + hj，2703 题，0 错误），作为铁律 8 第 4 步的标准工具。
5. **`scripts/jk/build_qbank.py`**：作为铁律 8 三层防护（备份 + 差异报告 + 骤降阻断）的参考实现。

### 32.4 收口

- 9 条铁律全面体检结论：整体合理、无逻辑硬冲突，本次堵住 3 个执行缺口。
- 2026-06-29 PROJECT_STATUS.md 二次梳理后：铁律 6-9 正式上移至 §0 与 1-5 并列，全文单一信源；本章只保留时间线 + 配套基础设施记录。

---

## 33. ✅ 澄清 jk vs gzk 教材边界 · jk 三年级起点（2026-06-29）

> 📌 本章记录 P5-A 任务在调研阶段发现的**重大事实**及最终处理，作为教材数据架构的权威说明。

### 33.1 背景：P5-A 调研中发现的疑点

原 P5-A 任务计划是「jk 1-2 年级教材升级到 2024 新版」，对应清空 `jk.json` 里 grade1/grade2 的 8 个占位单元（每年级 × 上下册 × 2 单元，每单元 5 词，共 40 词、0 课文）。开工前为了确认实际教材结构，先做 web 调研。

第一份资源（book118 课文样本）显示「教科版 2024 一年级上册 Unit 1 Hello, I'm Andy」，但**这个标题与你周末 Mac 端已经完成的 gzk（广州口语）1A Unit 1 完全一致**，触发疑点：**jk 1-2 年级 vs gzk 1-2 年级是否就是同一套教材？**

### 33.2 调研：3 信源独立确认

| # | 信源 | 关键结论 |
|---|---|---|
| 1 | 知乎专栏（2024-12 更新） | "教科版广州小学英语**(三年级起点)** 教育部 2012/2013 审核通过" |
| 2 | 教习网 / book118 资源标签 | 教科版广州 1-2 年级**只标记为「英语口语」**（对应 gzk）；3 年级起的资源才标「英语」（对应 jk） |
| 3 | 官方电子课本网 `dzkbw.com/books/jkb/xiaoxue-yingyu/` | jk 主教材路径 `/3s_2024/` 起始 = **三年级**，无 1-2 年级目录 |

### 33.3 结论：教科版广州小学英语 2024 新版教材体系

| 教材代号 | 真名 | 年级覆盖 | 状态 |
|---|---|---|---|
| **jk** | 教科版广州小学**英语**主教材（三年级起点） | 3-6 年级 = 8 册 | ✅ 已就绪（3 上→6 上 7 册 §22-§25 真实 + 6 下 1 册 2014 旧版） |
| **gzk** | 教科版广州小学**英语口语**教材 | 1-2 年级 = 4 册 | ✅ 已就绪（周末 23 单元全量填充 §30） |
| **rj** | 人教版 PEP | 3-6 年级或 1-9 年级 | ⏳ 未启动（P4） |
| **wy** | 外研版（New Standard） | 3-6 年级或 1-9 年级 | ⏳ 未启动（P4） |

**结论**：**"jk 1-2 年级英语主教材"在现实中不存在**，jk.json 里的 grade1/grade2 段是项目早期建数据结构时的历史遗留占位。

### 33.4 落地改动

1. **数据层**：`scripts/clean_jk_g12_placeholder.py` 清空 jk.json grade1/grade2 占位单元，保留 `grade1/grade2 = {上:[], 下:[]}` 空容器（避免删字段引发前端崩溃）。
   - 改动：jk 总单元 **82 → 74**（grade1 上下 4 单元、grade2 上下 4 单元清空，3-6 年级 0 改动）
   - 词表：清空 40 词（grade1 20 词、grade2 20 词），词库总词数 **494 → 454**
   - 备份：`data/textbooks/.backups/jk_20260629_112715.json`（已 `.gitignore`）
2. **前端**：**零改动**。`js/textbook.js` 中 `TEXTBOOK_GRADES.jk = [3,4,5,6]` 早就把 jk 1-2 年级隐式隐藏（用户切到 jk 时年级下拉只显示 3-6），数据清理后数据层与 UI 完全对齐。
3. **铁律 8 三件套**：数据清理脚本内置备份 + 差异报告（dry-run 默认）+ 骤降检测；本次为「清理无用占位」预期内骤降，加 `--force` 跳过阻断（在脚本中改为 `placeholder-cleanup` 模式不阻断）。
4. **gitignore 加强**：补 `data/textbooks/.backups/` 和 `data/examples/.backups/`，与 `data/questions/.backups/` 一起完整覆盖三类数据备份目录。

### 33.5 影响

- ✅ **数据真实性**：jk.json 与官方教材一致，不再误导（接手 AI 看到 grade1/grade2 空容器就知道这是有意的，详见本章）。
- ✅ **UX 无回归**：用户切到 jk + 年级下拉看不到 1-2，与之前完全一样。
- ✅ **题库不动**：`jk_listening` / `jk_spelling` 等题库的 grade1-2 内容是按「孩子学段」打标签（周末 §31 题库补齐时的设计），与 jk 教材本身的 grade1/grade2 概念是两回事，本次不动。

### 33.6 收口

- ✅ 教材数据架构现在与现实教科书事实完全对齐：jk 三年级起点 8 册（3-6 年级）+ gzk 一年级起点 4 册（1-2 年级，口语）。
- ✅ §3 当前规模 / 速读卡 / §8 P5 状态全同步。
- ✅ 后续 jk 教材只剩 6 下 2014 → 2024 升级一项可选（P5），不再有"1-2 年级 8 占位待补"的伪需求。
- ✅ **已上线** `20260629V02.42`（业务 HEAD `61be038`，CI bump `2d981e6`；2026-06-29 用户验收通过）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260629V02.42>

---

## 34. ✅ P2-B · gzk 题库补齐（2026-06-29 下午）

> 📌 任务背景：在 §33 澄清 jk vs gzk 教材边界后，gzk 教材本体已完整（23 单元 / 244 词 / 70 课文），但**题库还是空白**（gzk_*.json 不存在）。本任务为 gzk 教材补齐题库 + 听力 MP3，让一二年级孩子能像 jk/hj 用户一样做练习。

### 34.1 设计原则

按一二年级口语教材的特点，**只做拼写 + 听力两类**（不做语法/阅读，与 jk G1-2 题型一致）：

| 维度 | 决策 | 理由 |
|---|---|---|
| 题型 | 拼写 + 听力 | 一二年级以听说为主，阅读/语法太难 |
| 拼写量 | 每词 1 道（按词数 1:1）共 244 题 | 覆盖每个词，且单题量小不超载孩子 |
| 听力量 | 每单元 2 道共 46 题 | 量足够练耳朵，且每单元数量平均 |
| 音频命名 | `gzk_listening_{NN:02d}.mp3` | 清晰前缀，与 §30 `gzk_*.mp3` 课文音频风格一致；避免与 jk 文件名冲突 |
| 题目内容 | 基于 `gzk.json` 已有 244 词 + 70 课文自动生成 | 可控、与教材对齐、无需手工 |
| code 格式 | `{1-2}{A/B}_U{N}_{S/L}{NN}` | 复用 _verify_qbank 已识别的「旧版兼容」格式 |

### 34.2 落地实现

#### 34.2.1 新增 `scripts/gzk/build_qbank.py`（235 行）

参考 `scripts/jk/build_qbank.py`，实现铁律 8 三件套：

1. **备份**：写入前自动备份旧文件到 `data/questions/.backups/gzk_{type}_{ts}.json`（首次写入跳过）。
2. **差异报告**：打印「旧 X → 新 Y → 合并 Z 题」。
3. **骤降阻断**：合并后题量比旧版减少 >30% 自动中断（首次写入旧版 0 题不触发）。
4. **dry-run 默认**：跑无 `--write` 时只打印不写盘，避免误操作。

题目构造细节：

- **拼写题**：`q` = 中文释义 + 音标 + "首字母 X·共 N 个字母"提示；`hint` = `首字母 + (N-1) 个下划线`；`answer` = 原词；`explain` = 例句或中文。
- **听力题**：从每单元 lessons 的 `en` 抽取 3-12 词的短句，优先 5-8 词；从全教材词池随机替换 1-2 个非虚词构造 3 个干扰句；options 4 项 shuffle；`audioText` = 原句、`audioFile` 全局递增。
- **干扰策略**：跳过虚词（i / am / the / a / is / 等），只替换实词；保留大小写；用 `random.seed(42)` 固定种子确保结果可复现。

#### 34.2.2 新增 `scripts/gzk/gen_listening_audio.py`（70 行）

复用 `scripts/gen_listening_audio.py` 的 `gen_one`（Edge Neural TTS + 角色音色映射），读取 `gzk_listening.json` 的 audioText 生成对应 audioFile。
文件已存在且 >1KB 时自动跳过（hash 增量复用，对 PWA 离线缓存友好）。

#### 34.2.3 扩 `scripts/_verify_qbank.py`

```diff
-TEXTBOOKS = ['jk', 'hj']
+TEXTBOOKS = ['jk', 'hj', 'gzk']
```

校验逻辑零修改（code 格式 `{N}{A/B}_U{N}_[SLGR]\d+` 已覆盖 gzk 用的格式；`gzk_grammar/gzk_reading.json` 不存在会走 `warnings.append('文件不存在，跳过')`，不影响整体退出码）。

### 34.3 产出数据

| 文件 | 内容 | 题量 |
|---|---|---|
| `data/questions/gzk_spelling.json` | 244 拼写题 | G1上 72 / G1下 60 / G2上 60 / G2下 52 |
| `data/questions/gzk_listening.json` | 46 听力题 | G1上 12 / G1下 12 / G2上 12 / G2下 10 |
| `audio/gzk_listening_01.mp3` ~ `gzk_listening_46.mp3` | 46 个听力音频 | 13-27 KB / 个，narrator → Aria 女声 |

**题库总规模**：2703 → **2993 题**（+290）  
**MP3 总规模**：5580 → **5626 个**（+46）

### 34.4 前端零改动验证

- `questionBank.js` 的 `loadQuestionBank('gzk')` 自动按 `data/questions/gzk_*.json` 加载，404 时走 `results[t] = []` 兜底（gzk_grammar / gzk_reading 自然返回空数组，刚好对应"gzk 不做语法/阅读"的决策）。
- `sw.js` 用 stale-while-revalidate 策略匹配 `/data/*.json`，新加的 gzk_*.json 自动命中 PWA 缓存，无需改 sw.js。
- 用户从教材下拉切到「广州口语 gzk」+ 任一年级 → 练习页面会自动显示拼写 + 听力两类题徽章；语法/阅读徽章为 0（与设计一致）。

### 34.5 校验（铁律 6 真实落盘 + 铁律 8 第 4 步 verify）

9 项校验全 PASS：

- gzk_spelling.json 244 题 ✓ / gzk_listening.json 46 题 ✓
- 必填字段全 ✓（spelling: grade/term/code/q/answer；listening: 含 options/audioFile）
- code 格式 `[12][AB]_U\d+_[SL]\d{2}` 全合规 ✓
- code 中 A/B 与 term 上/下 一致性 全 ✓
- 46 个 gzk_listening MP3 全部存在且 >1KB ✓
- options 4 项 + answer A/B/C/D ✓
- `_verify_qbank.py` 退出码 0（jk+hj+gzk 三教材合计 2993 题，0 错误）

### 34.6 收口

- ✅ gzk 教材现在从「23 单元教材 + 课文音频」升级为「教材 + 课文音频 + 290 题 + 46 听力 MP3」完整闭环。
- ✅ 一二年级孩子可以像高年级一样做单词拼写练习 + 听力训练，学习闭环不再断层。
- ✅ §3 当前规模 / 速读卡最近大事 / §8 P2-B 状态全同步。
- ✅ 新工具栈沉淀：`scripts/gzk/build_qbank.py` + `scripts/gzk/gen_listening_audio.py` 可作为「教材题库补齐」的第三个参考样板（前两个是 `scripts/jk/build_qbank.py` 和 `scripts/_jk_volume_lib.py`）。
- ✅ **已上线** `20260629V02.43`（业务 HEAD `d23236b`，CI bump `1602907`；2026-06-29 用户验收通过，与 §35 同批一次上线）— 注：题库数据本身正确，但**首次验收时发现 2 个全教材 Bug + 2 个 P2-B 质量瑕疵**，详见 §35。

---

## 35. ✅ P2-B 质量增强 + 全局 Bug 修复（2026-06-29 下午）

> 📌 P2-B 首次验收时发现 2 个独立 Bug + 2 个 P2-B 质量瑕疵，按用户授权一次性修完并打包上线。

### 35.1 Bug A · 单元范围切换后徽章不刷新（影响全教材）

**症状**：练习页切「本册全部单元」/「当前课本单元」后，4 个题型徽害数字没变化（看起来事件没触发）。

**根因**（两个独立陷阱）：

1. **陷阱 1**：`js/practice.js` `_resolveTargetUnit()` 当 `state.filterUnit === 'current'` 且 `state.currentUnit === null`（用户未进过课本页时）返回 `null`，与「all」表现完全一致 → 视觉上「没变」。
2. **陷阱 2**：`app.js` `applyContextChange` 切教材时**只重载教材文件、漏调 `loadQuestionBank`** → `window.questionBank` 仍是旧教材的题，切单元筛选错配。

**修复**：

- `_resolveTargetUnit()` 兜底取当前年级第一个单元 id（与 UI 一致）
- `applyContextChange` 切教材时并行 `Promise.all([loadTextbook(), loadQuestionBank(tb)])`，并在重载完后主动调一次 `refreshPracticeCounts()` 触发徽章重算

### 35.2 Bug B · 难度筛选全 0 题（仅 gzk）

**症状**：练习页切难度档（基础/中等/较难/挑战）后 4 个徽害全显示 0 题。

**根因**：

| 题库 | difficulty 字段 | 类型 |
|---|---|---|
| jk_*.json | `1` / `2` / `3` / `4` | **数字** |
| hj_*.json | `1` / `2` / `3` / `4` | **数字** |
| **gzk_*.json**（P2-B 新建） | `"easy"` | **字符串** |

`js/practice.js:100` 用 `q.difficulty !== state.filterDifficulty` 严格 `!==` 比较，`"easy" !== 1` 恒 true → gzk 所有题被滤掉。HTML 下拉只有 1-4 数字。

**修复**：双层兜底（前端 + 数据）

- `filterQuestions` 加 `_normalizeDifficulty()` 归一化：`easy/简单/基础 → 1`、`medium/中等 → 2`、`hard/较难/难 → 3`、`challenge/expert/挑战 → 4`，兼容历史数据
- 同时改造 `scripts/gzk/build_qbank.py` 输出 `'difficulty': 1`（数字），与 jk/hj 数字规范对齐
- 新增 `scripts/gzk/normalize_difficulty.py` 数据迁移脚本（已在 P2-B 流程内完成，但留作样板）

### 35.3 P2-B 质量增强 · 听力 audioText 男女声分流

**改进前**：所有 46 题 audioText 都被剥掉了角色标签（`re.sub(r'^[A-Z][a-zA-Z ]*[:：]\s*', '', en)`），TTS 全用 narrator → Aria 单女声。

**改进后**：`extract_listening_sentences` 保留角色标签，复用 `gen_audio_v2.py` 的 `split_dialogue` + `VoiceAllocator` 实现按角色稳定分配男女声：

| 角色 | TTS 音色（多个稳定哈希） | 性别 |
|---|---|---|
| Andy / Ben / Dad | Guy / Christopher / Ryan | 男 |
| Lily / Mum | Emma / Aria / Jenny / Ana / Sonia | 女 |
| Miss Li | （未在本批样例） | 女（按 Ms 推断） |
| 无角色叙述 | Aria | 女声叙述 |

**覆盖率**：35/46 题（76%）含角色标签 → 男女声分流；其余 11 题（24%）为单词/数字/颜色列表等纯叙述。

### 35.4 P2-B 质量增强 · 听力干扰句词性感知

**改进前**：随机替换实词，容易出现 `Family for night`、`I cook dance and draw` 等语义错乱组合。

**改进后**：手工分类的词性词库 `POS_BUCKETS`（一二年级常用 230+ 词）：

- **名词** 12 子类：person / animal / toy / clothes / food / place / furniture / school / nature / body / color / time / misc
- **动词**（45 个）/ **形容词**（30 个）/ **数词**（17 个）/ **介词**（11 个）/ **副词**（10 个）
- **人名**：male（Andy/Ben/Tom/Jack...）/ female（Lily/Sue/Mary/Anne...）—— 同性别互换避免 TTS 音色错乱

替换策略：

1. 拆分句子（保留角色标签前缀和标点）
2. 跳过虚词（i/a/the/am/is/are/this/that 等）和角色标签
3. 对句中实词查 `POS_LOOKUP`（小写倒查表）
4. 名词优先在同子类替换（park→home/house/garden 而非 park→cat）
5. 大小写保持（Hello→World、hello→world）
6. 60% 概率换 1 个词、40% 换 2 个词（让干扰更细微）
7. 退化兜底：极少触发，用通用 word_pool；若仍兜底失败给原始词池随机词

**结果**：抽样 10 题 + 全量校验 = **零退化标记 / 零重复选项**。

### 35.5 落地改动文件

| 文件 | 行为 |
|---|---|
| `js/practice.js` | 加 `_normalizeDifficulty` 函数；改 `filterQuestions`/`_resolveTargetUnit` 兜底逻辑 |
| `app.js` | `applyContextChange` 切教材时并行 `loadQuestionBank` + 主动调 `refreshPracticeCounts` |
| `scripts/gzk/build_qbank.py` | 加 `POS_BUCKETS` / `_replacement_pool`；改写 `generate_distractors` / `extract_listening_sentences` / `make_listening_q`；difficulty 字符串→数字 |
| `scripts/gzk/normalize_difficulty.py`（新增）| 一次性数据迁移脚本（铁律 8 三件套） |
| `data/questions/gzk_spelling.json` | 244 题 difficulty 改 1；q 内容不变 |
| `data/questions/gzk_listening.json` | 46 题 difficulty 改 1；audioText 含角色标签；options 干扰句质量提升 |
| `audio/gzk_listening_01-46.mp3` | 全 46 个重生成，男女声分流（35/46 含角色） |

### 35.6 校验（铁律 6 + 铁律 8 第 4 步）

| 项 | 结果 |
|---|---|
| `_verify_qbank.py` 退出码 | 0（2993 题全 PASS） |
| 退化标记 `[N]` / `#N` / `(?)` | 0 个 |
| 重复选项 | 0 道题 |
| difficulty 字段类型 | 全部 `int`（spelling + listening 共 290 题） |
| 含角色标签的听力题 | 35/46（76%） |
| MP3 文件全在 + >1KB | 46/46 ✓ |
| lint（practice.js + app.js） | 0 错 |

### 35.7 影响范围与回归

- ✅ **Bug 修复影响全教材**：jk / hj / gzk 切换后徽章正确刷新；难度筛选数字筛对（gzk 也是）
- ✅ **质量增强仅影响 gzk 听力 46 题**：拼写、jk/hj 题库完全不动
- ✅ **PWA SW 缓存**：gzk_listening_*.mp3 走 SW 缓存策略，但因为是新文件 + URL 路径相同，建议用户首次访问后强刷一下（或等 ?v= 版本号 bump 触发）

### 35.8 收口

- 经验固化：**新增教材题库脚本时，difficulty 必须用数字（1-4），不能用字符串**；前端的归一化函数 `_normalizeDifficulty` 作为「向后兼容兜底」保留，但写入侧统一规范。
- TTS 听力题建议：**audioText 优先保留角色标签**（`Andy: ...`），让 `VoiceAllocator` 自动分配性别音色，避免单音色枯燥。
- 词性词库 `POS_BUCKETS` 可作为后续 hj / 其他教材题库生成的复用资产（沪教 7-9 年级词汇可扩展该库）。
- ✅ **已上线** `20260629V02.43`（业务 HEAD `d23236b`，CI bump `1602907`；2026-06-29 17:28 用户验收通过 → 17:29 推送 + CI bump 完成）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260629V02.43>
- 影响范围确认：① Bug A+B 修复影响**全教材**（jk/hj/gzk 通用），② P2-B 质量增强仅影响 gzk 听力 46 题（jk/hj 0 改动），③ `js/practice.js` + `app.js` 修改不影响任何现有题型逻辑（仅加兜底归一化 + 切教材重载链路）。

---

## 36. ⏳ P2-C 完形填空独立题库（批次 1 工程基建 + hj 7A · 批次 2 hj 7B/8A/8B/9A/9B；2026-06-29 深夜）

> 📌 目标：用「真完形短文 + N 挖空」彻底替换"借 grammar 串句子"的临时方案。批次 1 完成工程基建（脚本框架 + 前端 UI + exam.js 改造）+ hj 7A 6 篇示例，验证整条链路。批次 2/3 仅纯数据填充。

### 36.1 现状分析（任务起因）

排查报告（详见 36.2 节）确认：
- 原模拟考试中的「完形填空」实际是把 N 个独立语法选择题（grammar 池）首尾串成假短文，没有上下文衔接
- 练习页**没有**完形填空入口
- 错题/掌握度全部归到 grammar（混淆数据）
- 不存在 `*_cloze.json` 独立题库

### 36.2 数据 schema 设计（写在 `scripts/_build_cloze_common.py`）

```json
{
  "grade": 7, "term": "上", "code": "7A_U1_C01",
  "topic": "Making friends · My new classmate",
  "passage": "Hi! I am Tom. ... I have a new ___1___ at school. ... She ___2___ German very well. ...",
  "blanks": [
    {"pos": 1, "options": ["friend", "family", "pet", "job"], "answer": "friend", "explain": "..."},
    {"pos": 2, "options": ["speaks", "speak", "speaking", "spoke"], "answer": "speaks", "explain": "..."}
  ],
  "difficulty": 2,
  "explain": "本篇主题..."
}
```

- `passage`：连贯英文短文 80-100 词，挖空用 `___1___` `___2___` 占位符
- `blanks[]`：与占位符 pos 一一对应，options 4 选项，answer 写**完整文本**（不是 A/B/C/D 索引，便于前端按 options 反查）
- `code` 格式 `{7-9}{A/B}_U{N}_C{NN}`：扩展现有 `_S/_L/_G/_R` 体系到 `_C`
- `difficulty` 数字 1-4（吸取 P2-B gzk 字符串的教训）

### 36.3 落地改动

#### 数据 + 脚本
| 文件 | 改动 |
|---|---|
| `scripts/_build_cloze_common.py`（新增） | schema 校验 + 占位符工具 + 铁律 8 三件套写入器 + `make_cloze/make_blank` 工厂 |
| `scripts/hj/build_cloze.py`（新增） | 手工编写 hj 7A 6 篇短文（U1/U2/U3/U4/U6/U7）；dry-run 默认；schema 预校验 |
| `data/questions/hj_cloze.json`（新增） | 6 篇 × 5 挖空 = 30 道挖空题，1 万字 |
| `scripts/_verify_qbank.py` | TYPES 加 `'cloze'` + cloze 专项校验复用 `_build_cloze_common.validate_cloze_list` + code 正则加 C 后缀 |

#### 前端 loader + UI
| 文件 | 改动 |
|---|---|
| `questionBank.js` | 加 cloze 到 types 数组 / stats / total；404 时降级为 debug 日志（cloze 缺失不刷红）|
| `index.html` | 练习页加第 5 个题型徽章 `countCloze` 📝 完形填空；错题本 tab 加 cloze 分类 |
| `js/practice.js` | `refreshPracticeCounts` 加 cloze（单位「篇」）；`typeLabelShort`/`typeLabel` 加完形；`startPractice` cloze 分支：抽 1-2 篇展开为 N 道挖空题 + 注入 `_clozeContext`；`showQuiz` passage 高亮当前空（amber 框）+ topic + 第 N/总数 提示；`_shuffleArr` 工具函数 |
| `js/wrongbook.js` | `_WB_TYPE_LABELS.cloze = '完形填空'` |

#### exam.js 抽题源改造
| 改动点 | 内容 |
|---|---|
| 抽题逻辑（line 259-280 → 改写） | 优先 `qb.cloze` 池抽 1 篇匹配 secDef.count 目标挖空数，展开为 N 道；**兜底**：cloze 池缺失时仍走旧 grammar 串句子（jk/gzk 无 cloze 时模拟考试不崩） |
| 错题归类（line 1196-1213 × 3 处） | 删除 `sec.type === 'cloze' ? 'grammar' : sec.type` 这种 mapping，cloze 错题/掌握度归 cloze 类（不再混淆 grammar）|

### 36.4 答题体验（练习页）

- 用户点「📝 完形填空」徽章 → 抽 1-2 篇 → 展开为 5×N=5~10 道挖空题
- 每道题界面：**amber 框显示完整短文**（当前空位高亮黄底加粗，其它空位灰色虚线占位）+ 4 选项单选
- 单空判分（每空算一道题对错）→ 错题进 cloze 类
- 篇章上下文始终可见，符合真完形训练目标

### 36.5 进度 & 剩余

| 阶段 | 状态 | 备注 |
|---|---|---|
| 工程基建（脚本 + 前端 + UI + exam.js + 错题本） | ✅ 完成 | 批次 1 V02.44 已上线 |
| hj 7A 6 篇 30 挖空 | ✅ 完成 | 批次 1 V02.44 已上线 |
| hj 7B / 8A / 8B / 9A / 9B 共 30 篇 150 挖空 | ✅ 完成 | 批次 2 本次会话，待验收后推送 |
| **hj 全 6 册合计** | ✅ **36 篇 / 180 挖空** | 7A 6 / 7B 6 / 8A 6 / 8B 6 / 9A 6 / 9B 6 |
| jk 3 上→6 上 7 册 + 6下 = **实盘 56 篇** | ✅ **完成（批次 3 + 后续补全）** | 详见 §37；每册 5 篇基础 + 6下追加 + 批次补充 |
| **P2-C 全部合计** | ✅ **92 篇 / 460+ 挖空** | hj 36 + jk 56 |
| gzk（一二年级口语教材） | 🚫 不做 | 一二年级不适合完形填空 |

### 36.6 验证（铁律 6 + 8）

| 项 | 结果 |
|---|---|
| `_verify_qbank.py` 退出码 | 0（2999 题 + 6 篇 cloze 全 PASS） |
| `_build_cloze_common.validate_cloze_list` schema 校验 | 6/6 通过（passage 占位符 ↔ blanks.pos 一致 / answer in options / code 格式 / difficulty 数字） |
| lint（practice.js + exam.js + questionBank.js + index.html） | 0 错 |
| 综合落盘校验 | 13/13 全通过 |
| 本地 HTTP 200 | `hj_cloze.json` 11.5 KB 可访问 |

### 36.7 待用户验收清单

| # | 操作 | 期望 |
|---|---|---|
| 1 | 教材切到 hj + 七年级上 → 进练习页 | 看到 **5 个**徽章：拼写 / 听力 / 语法 / 阅读 / **完形 6 篇** |
| 2 | 点「完形填空 6 篇」 | 进入答题，能看到 amber 框完整短文，当前空黄底加粗 |
| 3 | 选选项 → 看反馈 | 正确/错误都有反馈；错题进错题本 cloze 类 |
| 4 | 错题本页 → 切「完形填空」tab | 应能看到刚才答错的 cloze 题 |
| 5 | 模拟考试任一 hj 7A 卷 → 第三大题完形填空 | 抽到的应该是真完形短文（非旧版串句子） |
| 6 | 教材切到 jk / gzk + 任意年级 | 完形徽章显示「0 篇」（jk/gzk 还没造数据，UI 不报错） |

### 36.8 收口

- ✅ **批次 1 已上线** `20260629V02.44`（业务 HEAD `a58fd2c`，CI bump `5415f0a`；2026-06-29 深夜用户验收通过）— 工程基建 + hj 7A 6 篇
- ✅ **批次 2 已上线** `20260630V02.45`（业务 HEAD `c9273a5`，CI bump `0d7ff8f`；2026-06-30 上午用户验收通过）— hj 7B/8A/8B/9A/9B 共 30 篇 150 挖空 → 线上 <https://lupeng0330.github.io/english-tutor/?v=20260630V02.45>
- ✅ **hj 全 6 册完形覆盖完成**：36 篇 / 180 挖空 / 6 学期均匀分布（每册 6 篇）；30 篇短文话题严格对齐 hj 教材 U1-U8 主题；schema 36/36 通过，verify_qbank 3029 题 0 错。
- ✅ 工程基建 100% 就绪：schema / 共享库 / 校验扩展 / 前端徽章 / 篇章式答题 UI / exam.js 抽题源改造 / 错题本 cloze tab。
- ✅ **批次 3 完成**：jk 56 篇（详见 §37）
- 🚫 gzk 不做 cloze（一二年级口语教材不适合）。
- 经验固化：**真完形 = 篇章式答题**比「串句子假完形」体验质的提升；schema 设计「passage 占位符 + blanks 数组」让一篇短文 = 一条 JSON 记录、保留语境完整性；前端展开为「每空一题」+ 注入 `_clozeContext` 让 showQuiz 复用 grammar 单选 UI，**最小改动获最大体验**。

---

## 37. ✅ P2-C 批次 3 · jk 小学完形填空（2026-06-30 上午，实盘 56 篇）

> 📌 P2-C 收官批次。基于批次 1 工程基建（共享库 + 前端 + UI + exam.js）零改动，纯数据填充 jk 教科版 3 上→6 上 全 7 册完形。设计核心：**分级适龄** + **难度梯度**，避免小学生做初中题模板。

### 37.1 设计原则

| 维度 | 决策 | 理由 |
|---|---|---|
| 每篇挖空数 | 3-4 年级 **4 挖空** / 5-6 年级 **5 挖空** | 3-4 年级注意力跨度短；5-6 年级与 hj 标准对齐 |
| 每篇短文长度 | 3-4 年级 **40-60 词** / 5-6 年级 **70-90 词** | 与挖空数和年级阅读能力匹配 |
| 难度梯度 | 3 上→3 下 = `diff 1`；4 上→4 下 = `diff 2`；5-6 年级 = `diff 2-3` 混合 | 与教材年级跨度一致 |
| 每册篇数 | **5 篇/册** × 7 册 = **35 篇基础**（用户选 Q3=B）+ **6下补 5 篇 + 后续批次追加 16 篇 = 实盘 56 篇** | 4 篇高频主题 + 1 篇均衡选 |
| 短文话题 | 严格对齐 jk 教材单元主题（每篇 topic 字段记录单元 + 副标题） | 与教材话题对齐，复习巩固 |
| code 格式 | `{3-6}{A/B}_U{N}_C{NN}`（NN=册内 01-05） | 复用批次 1 已识别的「旧版兼容」格式 |

### 37.2 落地实现

#### 37.2.1 新增 `scripts/jk/build_cloze.py`（约 730 行）

仿 `scripts/hj/build_cloze.py`，但每册 5 个工厂函数（jk_3a / jk_3b / jk_4a / jk_4b / jk_5a / jk_5b / jk_6a），合计 35 个 `make_cloze` 调用。`build()` 注册全部 7 个函数。

铁律 8 三件套（备份 / 差异 / 骤降阻断）由 `_build_cloze_common.write_with_safety` 提供，自动备份旧文件到 `data/questions/.backups/jk_cloze_{ts}.json`。

#### 37.2.2 单元选取（用户 Q4 推荐 + 补 1 个均衡单元）

| 册 | 选 5 单元 |
|---|---|
| **3A** | U2 English+Chinese / U4 Colours / U6 I Can Draw / **U7 Listening（补）** / U8 Exercise |
| **3B** | U1 Get up / **U2 What a Day（补）** / U4 Party / U5 Classroom / U7 School Rules |
| **4A** | U2 Family / U5 Hobbies / U6 Animals / **U7 Weekend（补）** / U8 Festivals |
| **4B** | U1 Spring / U3 Shopping / U5 Food / U7 Healthy / **U8 Picnic（补）** |
| **5A** | U1 New School / U2 Subjects / U5 Sports Day / **U7 Hobby Club（补）** / U8 Helping Hands |
| **5B** | U1 Trip Plans / U3 Asking Way / U6 Postcards / **U7 Cultures（补）** / U8 Safe Travels |
| **6A** | U2 Dream Jobs / U3 Heroes / U6 Save Earth / **U7 Inventions（补）** / U8 Friendship |

### 37.3 产出数据

| 文件 | 内容 | 题量 |
|---|---|---|
| `data/questions/jk_cloze.json`（新增）| 56 篇短文 | 3A/3B/4A/4B/5A/5B/6A 每册 5 篇基础 + 6下追加 + 后续批次补充 |

**难度分布**：diff1 = 10 篇 / diff2 = 14 篇 / diff3 = 11 篇

**全局规模变化**：
- 题库总数：2999 + 36 篇 cloze（hj）→ **2999 + 92 篇 cloze**（+56 篇 jk）
- jk 总数：1045 → **~1517**（含新题型 + 56 篇完形）
- hj + jk 完形总篇数：36 → **92 篇**（hj 36 + jk 56）

### 37.4 前端零改动验证

- `questionBank.js` loader 自动加载 `jk_cloze.json`（types 已含 'cloze'）
- 练习页第 5 个题型徽章「📝 完形填空」自动显示题量（jk 切到 3-6 任一年级都有完形可做）
- 模拟考试 `exam.js` 抽题源命中 `qb.cloze`，jk 各年级模拟考第三大题自动用真完形（不再走兜底 grammar 串句子）
- 错题本 cloze tab 自动收集 jk 完形错题（独立分类，不混 grammar）
- PWA SW stale-while-revalidate 自动缓存 `jk_cloze.json`

### 37.5 校验（铁律 6 + 8）

| 项 | 结果 |
|---|---|
| `build_cloze.py` schema 预校验 | 56/56 通过 |
| `_verify_qbank.py` 退出码 | 0（题库全 PASS）|
| 综合落盘 11 项校验 | **11/11 全过 🎉**（含挖空数与年级匹配 / difficulty 梯度匹配 / 短文长度按年级合理 等）|
| 本地 HTTP 200 | `jk_cloze.json` 53 KB 可访问 |

### 37.6 待用户验收清单

| # | 操作 | 期望 |
|---|---|---|
| 1 | hj + 七年级 + 上 → 练习页 | 完形「6 篇」（批次 1+2 已上线 V02.45）|
| 2 | **jk + 三年级 + 上** → 练习页 | 完形「**5 篇**」（U2/U4/U6/U7/U8）|
| 3 | jk + 三年级 + 下 → 练习页 | 完形「**5 篇**」（Get up / Day / Party / Classroom / Rules）|
| 4 | jk + 四/五/六年级各上下 | 各 5 篇 |
| 5 | 任选一篇 jk 3A 答题 | amber 框短文，**4 个挖空**（非 5）|
| 6 | 任选一篇 jk 5A 答题 | amber 框短文，**5 个挖空** |
| 7 | jk 模拟考试 → 完形大题 | 抽真完形（非旧版 grammar 串句子）|
| 8 | F12 控制台 | `[题库] 加载完成 (jk): 单词 645 · 听力 125 · 语法 235 · 阅读 160 · 完形 56 · 共 1517 题` |

### 37.7 收口

- ✅ **P2-C 全部完成**（三批次：工程基建 + hj 36 篇 + jk 56 篇 = 92 篇 / 460+ 挖空）
- ✅ jk 小学 3 上→6 上 全 7 册完形覆盖（56 篇覆盖每册 5 个核心单元话题 + 6下追加）
- ✅ 分级适龄设计落地：3-4 年级 4 挖空短句、5-6 年级 5 挖空中等长度短文、难度 diff1→diff3 渐进
- ✅ 前端零改动：所有 UI/loader/exam/错题本 全复用批次 1 工程基建
- ✅ 经验固化：「工程基建一次性 + 分批数据填充」的模式跑通 3 批次，证明 P2-C schema 设计可扩展（未来加 rj/wy 新教材完形只需写一个新的 `scripts/{tb}/build_cloze.py` 即可）。
- ✅ **已上线** `20260630V02.46`（业务 HEAD `202d0a1`，CI bump `d4a42ab`；2026-06-30 上午用户验收通过）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260630V02.46>
- ✅ **P2-C 三批次累计**：V02.44（批次 1 工程基建 + hj 7A）→ V02.45（批次 2 hj 7B-9B）→ V02.46（批次 3 jk 全 7 册），共 92 篇 / 460+ 挖空 / 13 个学期完形覆盖。

---

## 38. ✅ 小学模拟考试 · 阶段 1（100 分制 + 期中 + 完形修复，2026-06-30 中午）

> 📌 触发：用户在 P2-C 验收完成后反馈两个问题：① 小学单元测试卷只有 40 多分（与广州真实考试 100 分差距大）② 小学模拟考试看不到完形大题（P2-C 已造 56 篇 jk 完形但配置未引用）。多信源调研后得出新方案 v2（详见 artifact），分 4 阶段推进，本节为**阶段 1（配置改造）**收口。

### 38.1 现状问题（铁律 6 真实数据）

| 卷子 | 问题 |
|---|---|
| 小学 final（综合测试）| 配置声明 `totalPoints: 60`，sections 累加实际 **44 分**，自相矛盾 16 分 |
| 小学 unitTest | 总分仅 **22 分**，与广州真实单元测试 50 分差距大 |
| 小学完形 | **完全没有 cloze section**，jk_cloze.json 56 篇数据闲置 |
| 小学期中 | 配置完全不存在，与中学 hj 7-9 同时有 midterm+final 不对称 |
| 小学 listening 分值 | 仅 6 分（10%），与广州小学英语听力 30-50% 比重严重偏离 |

### 38.2 广州小学英语真实考试标准（调研得出）

| 年级 | 满分 | 时长 | 听力占比 | 笔试占比 |
|---|---|---|---|---|
| 3 上下 | 100 | 50 分钟 | **50%**（年级越低听力越重） | 50% |
| 4 上下 | 100 | 60-70 分钟 | 40-45% | 55-60% |
| 5 上下 | 100 | 70-80 分钟 | 35-40% | 60-65% |
| 6 上下 | 100 | 80 分钟 | 30% | 70% |

### 38.3 本次落地（阶段 1）

#### 38.3.1 jk 3-6 年级 final（期末考试）改为 100 分制

| 年级 | 拼写 | 听力 | 语法 | 完形 | 阅读 | 总分 | 时长 |
|---|---|---|---|---|---|---|---|
| 3 | 10×3=30 | 5×4=20 | 5×3=15 | 1篇×20=20 | 3×5=15 | **100** | 50 分钟 |
| 4 | 10×2.5=25 | 5×4=20 | 10×1.5=15 | 1篇×20=20 | 4×5=20 | **100** | 60 分钟 |
| 5 | 10×2=20 | 5×4=20 | 10×1.5=15 | 1篇×20=20 | 5×5=25 | **100** | 70 分钟 |
| 6 | 10×2=20 | 5×4=20 | 10×1.5=15 | 1篇×20=20 | 5×5=25 | **100** | 70 分钟 |

- 名称从「综合测试」改为「**期末考试**」（与中学 hj final 命名对齐）
- 听力分值统一 20 分（受现有题库 9 题/年级容量限制，阶段 5 听力扩容后再提升至 30-40 分）
- 完形 1 篇短文（3-4 年级 4 挖空 / 5-6 年级 5 挖空），固定 20 分（设计为「篇章答全对得 20 / 答错按挖空比例扣分」）

#### 38.3.2 jk 3-6 年级 midterm（期中考试）= 新增 8 张卷子

结构与 final 完全一致，仅两处差异：
- `unitRange: [1, 4]`（前半册）
- 时长比 final 短 10 分钟（如 3 年级 40 分钟 / 4 年级 50 分钟 / 5-6 年级 60 分钟）
- 名称：「期中考试」

#### 38.3.3 jk 3-6 年级 unitTest（单元测试）= 50 分制

| 题型 | 题数×分 | 小计 |
|---|---|---|
| 一、单词拼写 | 5×4 | 20 |
| 二、听力理解 | 2×5 | 10 |
| 三、语法选择 | 2×5 | 10 |
| 四、阅读理解 | 1×10 | 10 |
| **合计** |  | **50** |

- 时长统一 25 分钟（原 20 分钟略短）
- 4 个年级共用同一模板（保持简洁）

### 38.4 校验（铁律 6 + 8）

| 项 | 结果 |
|---|---|
| JSON 加载合法性 | ✅ 57.5 KB → 63.6 KB |
| 4 年级 × 上下 × (final+midterm+unitTest) 全在 | ✅ 24 张卷全部就位 |
| 所有 final + midterm 总分 = 100 且声明与累加一致 | ✅ 16/16 |
| 所有 unitTest 总分 = 50 且声明一致 | ✅ 8/8 |
| 所有小学 final + midterm 都有 cloze section | ✅ 16/16（修复批 1 遗漏 Bug） |
| 中学 7/8/9 final 仍 120 分制（未被误伤）| ✅ |
| 综合校验 10/10 全过 EXITCODE=0 | ✅ |
| `_verify_qbank.py` 退出码 | ✅ 0（题库回归全过） |
| 本地 HTTP 200 | ✅ exam_config.json 63 KB 可访问 |

### 38.5 已知边界与限制

- **听力分值偏低**（仅 20 分，真实试卷应 30-50 分）：受 jk 听力题库容量约束（9 题/年级），阶段 5 扩容到 20 题/年级后会提升听力分值至 30-40 分
- **题型种类有限**（仅 5 种：spelling/listening/grammar/cloze/reading）：真实试卷有 13-20 种题型（听音选图/选词填空/句型转换 等），阶段 2 渐进引入 16 种新题型
- **writing 暂未引入**（5-6 年级真实试卷必考）：等阶段 2-D 引入「需家长/老师评分」UI 后加入
- **历年真题**：阶段 3 建立真题题源池后才有，目前小学历年真题 tab 仍为 0 份

### 38.6 阶段 1 设计原则

1. **遵循广州真实分值结构**（虽未完全对齐，但 100 分制 + 听力占比明显提升）
2. **零工程改动**：仅改配置 JSON，前端代码不动（exam.js 抽题逻辑批 1 已就绪）
3. **向下兼容**：中学 hj 卷子完全不动，jk 现有题库容量内能稳定抽题
4. **修复历史遗留 Bug**：totalPoints 与 sections 累加不一致（44 vs 60）+ 完形 section 配置遗漏

### 38.7 后续阶段路线（v2 方案 §3 摘要）

| 阶段 | 内容 | 预估 |
|---|---|---|
| **阶段 1** ✅ 本节 | 配置改造 100 分制 + 期中 + 完形 | ~1.5h（已完成）|
| 阶段 2 ⏳ | 16 种新题型基础设施 schema+前端+评分 | ~30h（拆 6-8 次会话）|
| 阶段 3 ⏳ | 真题题源池建设：广东 6 个区 × 96 份原题 → 题源池 | ~40h（拆 8-10 次会话）|
| 阶段 4 ⏳ | 真题模拟卷生成 + 听力扩容到 20 题/年级 | ~15h |
| **总计** | | ~95-105 小时跨 4-6 周 |

> 用户已选 Q7=B：阶段 1 验收后先用一周收集真实使用反馈，再定阶段 2 优先级。

---

### 38.8 分值 Bug 紧急修复（2026-06-30 下午，V02.47）

> 📌 触发：用户在阶段 1 V02.46 验收后反馈「初中卷总分只 110 多 / 小学卷 150 多分，与 120/100 声明不符」。审计后定位 3 类配置/逻辑根因，本节为紧急修复收口。

#### 38.8.1 根因诊断（铁律 6 真实数据）

| 症状 | 实际值 | 声明值 | 根因 |
|---|---|---|---|
| **hj 中学 final/midterm** | 112.5 | 120 | cloze section `count=10×points=1.5=15`，但 hj_cloze 池每篇仅 5 挖空，`exam.js` 按实际抽题计分 → 5×1.5=7.5（少 7.5）|
| **jk 小学 final/midterm** | 160-180 | 100 | cloze section `count=1×points=20=20`，但 `exam.js` 把 1 篇 cloze **展开为 N 道挖空题**，每题用 `pointsPer=20` → N×20 = 80-100 分超额 |
| **hj 中学 unitTest** | 50 | 0 | unitTest 模板未声明 `totalPoints`/`autoPoints`，UI 显示「总分 0 但累加 50」自相矛盾 |
| **jk 6 下 cloze** | 0 篇 | 应有 | P2-C 批次 3 未覆盖 6 下，midterm/final 抽不到 cloze 走 grammar 兜底 |

#### 38.8.2 修复方案（用户 Q1-Q6 全部 A/C 推荐）

**① exam.js 改造**（核心代码修复 Q2A）：cloze section 的 `totalPoints` 强制锁死到 **配置 `count × points`**（不再随实际抽到挖空数浮动）；单空分按 `expectedTotal / N实际` 缩放，最后 1 空兜底凑齐避免浮点误差；评分时优先用题级 `pointsPer`（兼容旧逻辑用 `sec.pointsPer`）。

```js
// js/exam.js 第 349-373 行
if (secDef.type === 'cloze') {
  const N = sec.questions.length;
  const expectedTotal = (secDef.count || 0) * (secDef.points || 0);
  const perBlank = Math.floor((expectedTotal / N) * 100) / 100;
  // 前 N-1 空均分，最后 1 空兜底凑齐
  sec.totalPoints = expectedTotal;  // 锁死到配置
}
```

**② exam_config.json 配置统一**（Q2B 双保险 + Q3 + Q4）：
- **hj 中学 final/midterm cloze**：`count: 10→5, points: 1.5→3` = 15 分（与池子一致）
- **hj 中学 unitTest cloze**：`count: 5, points: 2→3` = 15 分
- **hj 中学 unitTest**：补 `totalPoints: 55, autoPoints: 55`（5×2+10×1+5×3+10×2=55）
- **jk 小学 3-4 年级 cloze**：`count: 1→4, points: 20→5` = 20 分（每篇 4 挖空 × 5）
- **jk 小学 5-6 年级 cloze**：`count: 1→5, points: 20→4` = 20 分（每篇 5 挖空 × 4）

**③ 补 jk 6 下 5 篇 cloze**（Q5A）：扩 `scripts/jk/build_cloze.py` 加 `jk_6b()` 函数 5 篇：U1 龟兔赛跑 / U2 守株待兔 / U4 保护大象 / U5 孙中山 / U8 礼貌用语；后续批次持续扩充 → jk_cloze.json **实盘 56 篇**。

#### 38.8.3 校验（铁律 6 + 8）

| 项 | 结果 |
|---|---|
| 配置审计：所有 196 sections 声明 == 累加 | ✅ 0 不一致 |
| 运行时模拟：jk/hj **final** 实际 = 声明（100/120）| ✅ 全过 |
| 运行时模拟：jk **midterm** 实际 = 声明（100）| ✅ 全过（V02.48 补全题库） |
| `_verify_qbank.py` 全题库回归 | ✅ 退出码 0 |
| 本地 HTTP 200 | ✅ exam_config.json 62.4 KB、jk_cloze.json 63.1 KB |

#### 38.8.4 已知尾巴（✅ V02.48 已修）

| 项 | 结果 |
|---|---|
| jk **midterm 题库容量缺口**：U1-U4 部分缺 grammar 10 + listening 7 + reading 3 = 20 题 | ✅ 已补全（7 个 U2 各 +2~3 题，含 7 个 listening MP3）→ midterm 88-96 → 100 |

#### 38.8.6 收口

- ✅ **已上线** `20260630V02.47`（业务 HEAD `b6a3c71`，CI bump `c8f01d3`；2026-06-30 下午用户验收通过）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260630V02.47>
- ✅ **已上线** `20260630V02.48`（业务 HEAD `8d179d3`；2026-06-30 晚用户验收通过）— jk midterm 题库补全，全年级 midterm 满分 100 ✅
- ✅ 修复后实际渲染：hj 7-9 全卷 **120 分**、jk 3-6 final **100 分**、jk 3-6 midterm **100 分**、jk 6 下 cloze 可抽到（5 篇覆盖 U1/U2/U4/U5/U8）。

#### 38.8.5 经验固化

1. **配置类 bug 必跑「运行时模拟审计」**：之前阶段 1 上线的 V02.46 只校验「config.totalPoints == sections 累加」（静态一致性），未跑「按题库容量模拟抽题计分」的运行时一致性。新增 `_verify_runtime.py` 模式（虽然本次清理了，但写过的脚本逻辑沉淀到经验中）。
2. **cloze 计分约束法**：一篇完形 = 1 道大题，**整体分值锁死配置**，N 个挖空内部按比例分配。让数据池容量（每篇 4/5/10 空）和配置（期望分值 20 分）解耦。
3. **审计脚本要兼顾两个层面**：① 配置自洽（声明 vs 累加）② 运行时实际（声明 vs 实际抽题计分），二者都得过。


---

## 39. ✅ 三大题型重做 + 听音填空 bug 修复 + 新听力三题型 MP3（2026-07-01 下午）

> 本次会话三件实事一齐推：
> 1. `spelling` / `blank_fill` / `sentence_order` 三个低段书写/词汇题型从「残废」（有数据没渲染/没判分）重做；
> 2. 修「听音填空（`listen_fill`）只有题目、没有听力按钮」的 bug（路由+渲染+判分三处全断）；
> 3. 给新听力三题型（`listen_fill` / `listen_judge` / `listen_pic`）生成 5 个 edge-tts 多角色童声 MP3（不再靠 TTS 兜底）。
> 另：`index.html` SW 防本地缓存改造 — 本地/局域网自动 `unregister` + `caches.delete`。

### 39.1 三大题型重做（spelling / blank_fill / sentence_order）

#### 39.1.1 原 Bug 诊断

| 题型 | 现象 | 根因（代码层） |
|---|---|---|
| `spelling` 单词拼写 | 有中文词义，但**没地方填英文** | 题库是「中文→拼英文」（`q`=中文、`answer`=英文），但**被当选择题**走 `_renderQuestionHTML`（遍历 `q.options`，为空）→ 只显示中文；判分还按「选项索引」比对（完全错位）|
| `blank_fill` 完成句子 | **只有标题，没有题干、无处作答** | 题库是 `passage + blanks[]`（无 `q`/`options`），却当普通选择题渲染 → 题干 `q` 为空；也无判分 |
| `sentence_order` 连词成句 | **上方没有可点的单词** | 抽题时**漏拷 `words` 字段** → 渲染函数里 `q.words` 为空 |

#### 39.1.2 修复（`exam.js`）

| 题型 | 渲染函数 | 数据补全 | 判分策略 |
|---|---|---|---|
| `spelling` | 新增 `_renderSpellingHTML`（中文词义+首字母提示+输入框）| 题库保持原状 | `_normText(用户输入) === _normText(answer)`（忽略大小写/首尾空格）|
| `blank_fill` | 新增 `_renderBlankFillHTML`（题干+下拉选词）| 给 25 题补 `cn`（中文整句释义）+ `blanks[0].options`（3 选 1）| 逐空比对，**全对才得分** |
| `sentence_order` | 新增 `_renderSentenceOrderHTML`（乱序词池+点选拼句+清空重排）| 给 25 题补 `words`（乱序池）+ `answer` | 拼接用户序列为句子 → `_normText` 后 === `_normText(answer)` |

判分/错题回顾：spelling/blank_fill/sentence_order 三块在 `_grade` 和错题回顾里都接入了对应分支（含 `你的答案 / 正确答案 / explain` 展示）。

#### 39.1.3 总分验算（P1 总分锁定兼容）

- 受 P1 锁约束：每个 section 满分 = 配置 `count × points`，题库抽不满时单题分按比例折算。
- 实测：3 上期中 50 题 / 100 分严格不溢出。✅

---

### 39.2 听音填空 bug 修复（`listen_fill`）

#### 39.2.1 现象与根因

- 用户报告：「听音填空题型逻辑有问题，只有题目，没有听力按钮，无法做题」
- 根因（代码层）：`listen_fill` 在业务识别/组卷层已「预留」（`exam.js` L326 类型列表、L340 `audioText` 装填），但**三层全断**：
  1. `_renderListenFillHTML` 函数**不存在** → 不会渲染播放按钮、不会渲染选项
  2. `_renderSection` 路由**未到** `listen_fill` → 整 section 走 `else` 兜底（只显示 `q.q` 一句中文）
  3. 判分函数**未识别** `listen_fill` → 永远记 0 分
- 配套：5 个 MP3 全部缺失（`audio/listen_fill_01.mp3` / `listen_judge_01-02.mp3` / `listen_pic_01-02.mp3`），此前靠 TTS 兜底。

#### 39.2.2 修复（A 方案 · 最小修复）

| 改动 | 文件 | 内容 |
|---|---|---|
| 渲染函数 | `js/exam.js` | 新增 `_renderListenFillHTML`（与 `_renderListenPicHTML` 同构：播放按钮+中文题干+文字选项）|
| 路由分支 | `js/exam.js` | `_renderSection` 在 `listen_judge` 后插入 `listen_fill` 分支 |
| 判分/回顾 | `js/exam.js` | 复用 `else` 兜底（`userAnswer` 数字索引 vs `q.answer` 数字索引）— 跟 `listen_pic` 一致，无需新分支 |

---

### 39.3 新听力三题型 MP3（B+C 方案 · 多角色童声）

#### 39.3.1 工具沉淀：`gen_jk_listen_new.py`

- 复用 `gen_jk_listening.py` 的 edge-tts 模式（VOICE_W=Aria / VOICE_M=Guy，RATE=-10% 童声感）
- 遍历 3 个目标题库 `jk_listen_fill.json` / `jk_listen_judge.json` / `jk_listen_pic.json`
- 单声部单句直接出 MP3（无需 ffmpeg 拼接），5 段都满足
- 用法：`python gen_jk_listen_new.py [--dry-run] [--force] [--limit N]`

#### 39.3.2 生成结果

| MP3 | 题型 | 角色 | 内容 | 体积 |
|---|---|---|---|---|
| `listen_fill_01.mp3` | 听音填空 | M=Guy | "My favourite colour is blue." | 16848 B |
| `listen_judge_01.mp3` | 听音判断 | M=Guy | "I have 3 books." | 14400 B |
| `listen_judge_02.mp3` | 听音判断 | W=Aria | "My favourite colour is red." | 17424 B |
| `listen_pic_01.mp3` | 听音选图 | M=Guy | "It's sunny today." | 13968 B |
| `listen_pic_02.mp3` | 听音选图 | W=Aria | "I like cats." | 13248 B |

> 三听力题型现在全部有真 MP3，不再靠 TTS 兜底，体验与教材原声接近。

---

### 39.4 SW 防本地缓存改造（index.html）

#### 39.4.1 根因

- 此前 PWA 的 `sw.js` 在**所有环境**（含 `localhost`）都注册，导致本地验证时被旧 SW 拦截 → 出现「回到 106 分旧版本」类问题
- 唯一靠 `?v=` 时间戳绕过，治标不治本

#### 39.4.2 改造

- **判定**：`isProd = /\.github\.io$/i.test(location.hostname)`
- **线上**（`*.github.io`）：保留 SW 注册逻辑不变
- **本地/局域网**（`localhost` / `127.0.0.1` / `192.168.x` 等）：**自动 `navigator.serviceWorker.getRegistrations()` → 全部 `unregister()` + `caches.keys()` → 全部 `caches.delete()`**，从根源杜绝 SW 旧缓存回退
- 配合 `?v=` 时间戳双保险：双端预览（电脑+手机）都带 `?v=1782925744` 验证

---

### 39.5 本次未推送改动一览（5 modified + 7 untracked）

| 类型 | 文件 | 关键改动 |
|---|---|---|
| M | `data/questions/jk_blank_fill.json` | 25 题加 `cn`（中文释义）+ `blanks[0].options` |
| M | `data/questions/jk_sentence_order.json` | 25 题加 `words`（乱序池）+ `answer` |
| M | `index.html` | SW 防本地缓存：仅 `*.github.io` 注册；本地自动 `unregister` + `caches.delete` |
| M | `js/exam.js` | 新增 `_renderListenFillHTML` / `_renderListenJudgeHTML` / `_renderBlankFillHTML` / `_renderSentenceOrderHTML` / `_renderSpellingHTML` + 路由 + 判分（+269 / -37）|
| M | `styles.css` | `.exam-blank-passage` / `.exam-blank-cn` / `.exam-word-pool-item` / `.exam-clear-btn` / `.exam-blank-select` 等（+67 行）|
| ? | `GZ_THREE_TYPES_REDESIGN.md` | 三大书写/词汇题型重设计方案文档 |
| ? | `audio/listen_fill_01.mp3` | edge-tts 童声 "My favourite colour is blue." |
| ? | `audio/listen_judge_01.mp3` | edge-tts 童声 "I have 3 books." |
| ? | `audio/listen_judge_02.mp3` | edge-tts 童声 "My favourite colour is red." |
| ? | `audio/listen_pic_01.mp3` | edge-tts 童声 "It's sunny today." |
| ? | `audio/listen_pic_02.mp3` | edge-tts 童声 "I like cats." |
| ? | `gen_jk_listen_new.py` | 新听力三题型 MP3 生成器 |

---

### 39.6 验证清单（双端 · 入口：考试 → 3 年级 → 上 → 期中考试）

> 详情见双端 preview（电脑 `http://localhost:8765/index.html?v=1782925744` / 手机 `http://localhost:8765/mobile.html?v=1782925744`）

| # | 题型 | 关键点 | 状态 |
|---|---|---|---|
| 1 | 单词拼写 `spelling` | 中文词义 + 首字母提示 + 输入框 + 判分（忽略大小写）| ✅ |
| 2 | 听音选图 `listen_pic` | 播放按钮 + 3 个 emoji 选项 + 判分 | ✅ |
| 3 | 听音判断 `listen_judge` | 播放按钮 + True/False 按钮 + 判分 | ✅ |
| 4 | 听音填空 `listen_fill` | **bug 已修**：播放按钮 + 中文题问 + 3 个文字选项 + 判分 | ✅ |
| 5 | 情景选择（普通选择题）| 题型无变化，正常 | ✅ |
| 6 | 连词成句 `sentence_order` | 乱序词池 + 点选拼句 + 清空重排 + 判分 | ✅ |
| 7 | 完成句子 `blank_fill` | 题干 + 高亮中文释义 + 下拉选词 + 判分 | ✅ |
| 8 | 短文阅读 | 篇章+题目，正常 | ✅ |
| 9 | 总分 | 严格 100 分不溢出 | ✅ |
| 10 | SW 防本地缓存 | F12 → Application → Service Workers：本地 SW 状态 `unregistered`，无残留 worker | ✅ |
| 11 | 双端一致性 | 电脑端 + 手机端均正常 | ✅ |

---

### 39.7 收口状态

- ✅ **已上线** `20260701V03.02`（业务 HEAD `dce97e3`，CI bump `b80d596`；2026-07-01 17:14 用户双端验收通过）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260701V03.02>
- 📌 客户端 PWA（sw.js）需刷新一次才能听到新 MP3（线上环境）
- 📌 本次未做（按用户指示）：① 连词成句朗读按钮（用户说「那钮可以不做」）；② jk 小学 3-6 其它年级 blank_fill / sentence_order 扩容（GZ_THREE_TYPES_REDESIGN.md §四 后续排期）
- 📝 流程固化：今后所有「新题型」上线前必须三处接通（识别/组卷 + 渲染+路由 + 判分），缺一不可；本次 `listen_fill` 漏接就是反例。

### 39.8 经验固化

1. **新题型上线三件套**：`类型列表`（业务识别） + `组卷时带字段` + `渲染函数 + 路由 + 判分`。只看类型列表看不出断点，必须全链路跑通。
2. **听力的"三件"**：数据 + 渲染 + MP3。MP3 缺失时 TTS 兜底可工作，但体验差；落地童声 MP3 才是合格状态。
3. **PWA 本地验证的根因治理**：之前只靠 `?v=` 治标，SW 一注册就把 `?v=` 后的真实版本拦截到旧缓存。把 SW 注册限定到「线上域名」是治本（`isProd = /\.github\.io$/i.test(location.hostname)`），本地/局域网自动 `unregister` + `caches.delete`。
4. **MP3 生成的工程化**：单声部单句无需 ffmpeg 拼接（直接 `edge-tts.Communicate.save`），多声部才需要 ffmpeg concat + list.txt。脚本写成可复用（`gen_jk_listen_new.py`），后续其它教材同理。

---

## 40. ✅ A 档 B1 · 考试配置模板化（2026-07-02 用户双端验收通过）

### 40.1 背景与目标

`data/exams/exam_config.json` v2 时期 2390 行，每张卷都把 sections 全量内联，3-9 年级 × 上/下 × midterm/final/unitTest = 42 套卷（实际 14 个 grade/term 各 3 套共 42 套），改一处要翻半天；题型增减 / 改分值也得每处单独改。

**目标：** 抽离到 `data/exams/exam_templates.json`（10 套模板），主配置改为 `{ template, writing? }` 引用形式，未来加新学段 / 调模板 1 处搞定。

### 40.2 关键决策（用户拍板）

| 决策点 | 选定 |
|---|---|
| 批次顺序 | **B1 → B2 → B3 → B4**（先打配置骨架，再填题库） |
| 题库扩容方式 | **AI 脚本半自动**（edge-tts 造句 + 人工抽查 + 校对话术） |
| 部署节奏 | **每批独立 push**（逐批验收，失败可回滚） |
| 模板化策略 | 9 套「段 × 类」模板 + 1 套 GZ 8 题型样板（3 上期中特殊）|

### 40.3 改动清单

| # | 文件 | 操作 | 行数 | 关键变化 |
|---|---|---|---|---|
| 1 | `data/exams/exam_templates.json` | **新建** | 152 | 10 套模板：`low_midterm_gz`（3 上期中 GZ 8 题型样板 100 分）+ `low_midterm` / `low_final` / `low_unit`（小学 100/50 分）+ `mid_midterm` / `mid_final` / `mid_unit`（5-6 年级 100/50 分）+ `high_midterm` / `high_final` / `high_unit`（7-9 年级 120/55 分）|
| 2 | `data/exams/exam_config.json` | **重写** | 2390 → 240 | version 2 → 3；`grades.{g}.{上\|下}.{midterm\|final\|unitTest}` 全部简化为 `{ template: '...' }` 引用；7-9 年级保留 `writing: { prompts, modelAnswers }` 用于注入模板中 `_writingPlaceholder` 标记的写作题；9 下 final 个性覆盖 `name: "期末考试 / 中考模拟"` |
| 3 | `js/exam.js` | **+82 行** | — | 新增 `_loadExamTemplates()`（带 Promise 缓存 + `__withVer` 版本号 + 失败回退空对象）+ `_applyTemplate(node)` 浅合并 + sections 深拷贝 + writing 注入 + 清理中间字段；`_getExamsForContext()` 在展开后 push；`_buildPaper()` 零改动（兼容 v2 形态）|
| 4 | `scripts/verify_templates.py` | **新建** | — | smoke test：模拟前端 `_applyTemplate` 校验 14 个 grade/term × 3 套 = 42 套 + 9 下 final 中考模拟改名特殊覆盖 + 3 上 midterm GZ 8 题型样板 = **44/44 全过** |

### 40.4 模板分值矩阵（10 套）

| 模板 | 适用 | 题型 / 题数 / 单分 | 总分 | 自动判分 |
|---|---|---|---|---|
| `low_midterm_gz` | 3 上期中 | listen_pic(5×2) + listen_judge(5×2) + listen_fill(5×2) + spelling(10×2) + grammar(5×2) + sentence_order(5×2) + blank_fill(5×2) + reading(10×2) | 100 | 100 |
| `low_midterm` | 3 下 / 4 期中 | spelling(10×2.5) + listening(5×4) + grammar(10×1.5) + cloze(4×5) + reading(4×5) | 100 | 100 |
| `low_final` | 3-4 期末 | spelling(10×3) + listening(5×4) + grammar(5×3) + cloze(4×5) + reading(3×5) | 100 | 100 |
| `low_unit` | 3-4 单元 | spelling(5×4) + listening(2×5) + grammar(2×5) + reading(1×10) | 50 | 50 |
| `mid_midterm` | 5-6 期中 | spelling(10×2) + listening(5×4) + grammar(10×1.5) + cloze(5×4) + reading(5×5) | 100 | 100 |
| `mid_final` | 5-6 期末 | 同 mid_midterm | 100 | 100 |
| `mid_unit` | 5-6 单元 | 同 low_unit | 50 | 50 |
| `high_midterm` | 7-9 期中 | listening(15×2) + grammar(15×1) + cloze(5×3) + reading(15×2) + writing(1×30) | 120 | 90 |
| `high_final` | 7-9 期末 | 同 high_midterm | 120 | 90 |
| `high_unit` | 7-9 单元 | listening(5×2) + grammar(10×1) + cloze(5×3) + reading(10×2) | 55 | 55 |

### 40.5 写作题 prompt / model 注入矩阵

| 年级 / 学期 | 期中 prompt | 期末 prompt |
|---|---|---|
| 7 上 | My Best Friend | My Daily Life |
| 7 下 | My Best Friend | My School |
| 8 上 | My Hobby | An Unforgettable Experience |
| 8 下 | My Hobby | Volunteering |
| 9 上 | The Power of Dreams | Online Learning |
| 9 下 | The Power of Dreams | My Junior High School Life（**期末：期末考试 / 中考模拟**）|

### 40.6 收口状态

- ✅ **已上线 `20260702V03.03`**（业务 HEAD `cd9a513`，CI bump `5b6a23c`；2026-07-02 16:21 用户双端验收通过）— 线上 <https://lupeng0330.github.io/english-tutor/?v=20260702V03.03>
- ✅ smoke test 44/44 全过
- ✅ `_buildPaper()` 零改动（渲染兼容，零风险）
- ✅ 9 下 final 中考模拟改名落地
- ✅ 7-9 年级 6 × 2 = 12 个写作题 prompt + model 全部注入

### 40.7 经验固化

1. **模板抽离三件套**：`templates` 独立文件 + 主配置 `{ template: '...' }` 引用 + 前端 `applyTemplate()` 浅合并引擎。三者缺一不可，否则要么体积大（不抽离）、要么配置不直观（不引用）、要么组卷错乱（不展开）。
2. **首验竞态反例**：`_applyTemplate` 内部依赖 `_examTemplates` 全局缓存已加载完成，但 `renderExamPage` / `_startExam` 入口只 await 了 `_loadExamConfig()`，模板异步加载还没 resolve 就开始调 `_getExamsForContext()` → sections 为空 → 卡片看似渲染但点击报"题库数据不足"。**铁律追加候选**：凡是新加的 async 加载器（`_loadXxx`），调用方入口必须 `await`，且 `_applyXxx()` 这类依赖它的同步函数也应在被调前确认依赖已就绪。
3. **smoke test 提前发现**：44 个组合在 Python 端模拟前端 `_applyTemplate` 跑一遍，能在 1 秒内发现模板缺失、字段错位、总分不符、writing 未注入等问题，比等用户到浏览器验收再发现省 1 轮交互。
4. **占位字段约定**：写作题用 `_writingPlaceholder: true` 标记，提醒「该 section 的 prompts/modelAnswers 需要从年级配置注入」，避免后续接 GZ 真实写作题库时漏接。

### 40.8 下一档预告（B2 · 已上线 / B3 · 高段题库扩容 / B4 · 验收回滚预案）

- **B2**：✅ 已上线 `20260702V03.04`；本次按 C 方案同时扩低段通用题库 + 新增广东小学仿真真题（详见 §41）
- **B3**：高段（7-9 年级）题库扩容，目标是让 high 模板的 cloze 5×3 / reading 15×2 在 midterm 抽得动
- **B4**：全量回归（14 个 grade/term 模拟卷 + 单元测试 1-8 共 196 套）全部能正常生成、开始考试、提交、查看历史

---

## 41. B2-C · 低段题库扩容 + 广东小学仿真真题（2026-07-02，已上线 `20260702V03.04`）

### 41.1 本次范围

- ✅ 扩充 JK 3-4 年级低段通用题库：新增 `source: "b2_primary_v01"` 原创题，覆盖 `grammar` / `cloze` / `reading`，并补齐广州低段核心题型 `listen_pic` / `listen_judge` / `listen_fill` / `sentence_order` / `blank_fill`。
- ✅ 新增广东主要区县小学仿真真题：在 `data/exams/real_papers/index.json` 追加 32 套 `b2_gd_primary_*` 固定卷，覆盖 3-6 年级 × 上/下学期 × 天河/越秀/海珠/番禺 4 区。
- ✅ 补充地区索引：新增 `广州·海珠区`、`广州·白云区`、`广州·荔湾区`、`广州·黄埔区`。
- ✅ 为 5-6 年级仿真卷补足高段小学听力池，保证新增卷可抽满。

### 41.2 扩容后 3-4 年级核心题库数量

| 题型 | 3上 | 3下 | 4上 | 4下 |
|---|---:|---:|---:|---:|
| `listen_pic` | 14 | 12 | 12 | 12 |
| `listen_judge` | 14 | 12 | 12 | 12 |
| `listen_fill` | 13 | 12 | 12 | 12 |
| `sentence_order` | 37 | 12 | 12 | 12 |
| `blank_fill` | 37 | 12 | 12 | 12 |
| `grammar` | 28 | 28 | 28 | 28 |
| `cloze` | 9 | 9 | 9 | 9 |
| `reading` | 21 | 21 | 21 | 21 |

### 41.3 验证记录

- ✅ 修改 JSON 全部通过 `python -m json.tool`
- ✅ `python scripts/verify_templates.py`：44/44 全过
- ✅ B2 新增 32 套小学仿真卷抽题池校验通过：每个 section 均可抽满
- ✅ 用户已双端验收通过，并已执行 `dev-push.ps1` 上线：业务提交 `c200c7f`，CI 版本提交 `a1cec47`，线上版本 `20260702V03.04`。




## 42. 📋 文档全量对账（2026-07-03 深夜）

### 42.1 背景

用户从 PC 回到 Mac，要求梳理开发计划和任务状态。审计发现 §3 规模表与 §8 任务清单中存在 **9 处文档与代码脱节**的问题，多处源自 7/1-7/2 期间新增 6 种新题型（听音填空/听音判断/听音选图/连词成句/完成句子/句型转换）后规模表未同步更新。

### 42.2 修复清单

| # | 位置 | 修正前 | 修正后 |
|---|---|---|---|
| 1 | §3 题库表 | 2999 题 + 71 篇完形，缺 6 种新题型 | **3501 题 + 92 篇完形**，新增 6 列全题型 |
| 2 | §3 完形备注 | jk cloze 35 篇 / 155 挖空 | jk cloze 56 篇 / 460+ 总挖空 |
| 3 | 速读卡"下一档可选" | 含已完成的"完形填空独立题库" | 移除（P2-C 已完成） |
| 4 | 顶部最后更新行 | 2026-07-01 | **2026-07-03** |
| 5 | 速读卡仓库地址 | `lupeng0330/email/english-tutor` | `lupeng0330/english-tutor` |
| 6 | gzk 单元数 | 速读卡 22 / §3 表 23 | 统一 **23** |
| 7 | "最近 5 件大事" | 实际 13 条 | 改名"最近大事" |
| 8 | §3 核查日期 | 2026-06-29 | **2026-07-03** |
| 9 | 校验脚本题量 | `_verify_qbank.py` 检查 2703 题 | **3501 题** |

### 42.3 验证

- ✅ 所有 "35 篇 jk cloze" 引用已同步为 56 篇（§3/§8/§37/§38 共 12 处）
- ✅ 所有 gzk 单元数已统一为 23
- ✅ 所有过时的题量数字已更新（1080→1517 / 71篇→92篇 等）
- ✅ 无 "email/english" 残留
- ✅ 无 "2703/2999" 过时题量残留
- ✅ 无 "22 单元 gzk" 残留

> 本节为 docs 改动，CI 不 bump 版本。推送走 `dev-push.sh`。


## 43. 📋 开发计划重构 · 逐期推进（2026-07-03 深夜）

### 43.1 背景

P0/P1/P2 全部清零，用户通过铁律 5 选项清单确定后续方向：**①版本升级优先（C）②逐个完成再推进 ③暂无 LLM Key**。

### 43.2 计划结构

| 序 | 编号 | 任务 | 工时 | 需 Key | 见 §8 |
|---|---|---|---|---|---|
| 🎯 一期 | **P5** | jk 6 下 2024 新版升级 | ~3 天 | ❌ | §8.一期 |
| 🎯 二期 | **P3-D** | 语法讲解页数据化 | ~5 天 | ❌ | §8.二期 |
| 🎯 三期 | **P4** | 人教 rj + 外研 wy 新教材建设 | ~1 月 | ❌ | §8.三期 |
| 📋 等 Key | P3-A | AI 对话真接入 | ~1 周 | ✅ | §8.条件就绪 |
| 📋 等 Key | P3-B | 录音 ASR 评测 | ~1 周 | ✅/免费 | §8.条件就绪 |
| 📋 等 Key | P3-C | 作文 AI 评分 | ~3-5 天 | ✅ | §8.条件就绪 |

### 43.3 铁律遵循

- ✅ **铁律 2**：本文档 §8 重写为结构化逐期计划 + 速读卡决策树同步更新 + 本节完成记录
- ✅ **铁律 5**：方向/节奏/Key 通过 `ask_followup_question` 3 问收集（Q1=C / Q2=逐个 / Q3=无Key）
- ✅ **无版本冲突**：docs 改动，CI 不 bump；推送走 `dev-push.sh`

> 本节为 docs 改动，CI 不 bump 版本。


## 44. 🚧 P5 · jk 6 下内容审查 + U11 Review 中国化替换（方案制定，待执行）

> ⚠️ **前版方案（Steve Jobs 替换邓稼先）方向性错误，已废弃。经用户纠正：2024 新版方向是「用中国科学家替换外国名人」，项目 6 下 U5 孙中山 + U6 邓稼先 **已就位**，无需升级。**
> 
> 📌 决策依据：2026-07-03 用户通过铁律 5 三次选项清单确定——①U9 暂不动（等实体书）②U11 需替换为中国内容 ③U5/U6 副课文保留。
> 📌 新增审查：用户要求强化本国科学家、家国教育内容。

### 44.1 审查结论：6 下核心中国内容已正确

| 单元 | 内容 | 国籍 | 判定 |
|---|---|---|---|
| U5 | Dr Sun Yatsen（孙中山） | 🇨🇳 中国 | ✅ 正确 |
| U6 | Early years of Deng Jiaxian（邓稼先） | 🇨🇳 中国 | ✅ 正确（已替换老版 Steve Jobs） |

> **"2014 旧版"标签为过去错误标注**——6 下 U6 邓稼先已经是课改方向下的成果（老版此处为 Steve Jobs，已被替换）。无需再做 U6→Steve Jobs 的逆方向升级。

### 44.2 全年级审查发现（3-6 年级）

#### ✅ 中国正向内容
| 位置 | 内容 |
|---|---|
| 5下 U4 | Famous spots in China（中国名胜） |
| 5下 U6 | A postcard from Beijing（北京明信片） |
| 6下 U5 | Dr Sun Yatsen（孙中山） |
| 6下 U6 | Early years of Deng Jiaxian（邓稼先） |

#### ⚠️ 保留（经决策：可接受的副课文/语言素材）
| 位置 | 内容 | 决策 |
|---|---|---|
| 6下 U5 Fun with language | Mozart（莫扎特） | B.保留 |
| 6下 U6 Fun with language | J.K. Rowling（罗琳） | B.保留 |
| 6下 U9 整单元 | Daniel→Sydney / Mr Brown→Hawaii | C.暂不动（等实体书） |

#### 🔴 需替换
| 位置 | 现内容 | 替换方向 |
|---|---|---|
| 6下 U11 Review | African Safari / The Lion and the Mouse / Nelson Mandela | → 中国科学家/文化主题 |

### 44.3 执行范围：仅 U11 Review 替换

| 影响文件 | 操作 |
|---|---|
| `data/textbooks/jk.json` grade6/下 U11 | 替换课文内容 |
| `data/questions/jk_spelling.json` | U11 旧题 ~5 道 → 新题 |
| `data/questions/jk_reading.json` | U11 旧题 ~2 道 → 新题 |
| `data/questions/jk_listening.json` | U11 旧题 ~2 道 → 新题 + 重生成 MP3 |
| `data/questions/jk_grammar.json` | U11 旧题 ~3 道 → 新题（可选） |
| 其他新型题库 | U11 无数据 → 不受影响 |
| `data/exams/` | 检查是否有考试卷引用 U11 |

### 44.4 U11 替换建议方案

**推荐方向**：中国文化名人/科学家回顾 + 广州/广东文化

| 新课文 | 主题 | 说明 |
|---|---|---|
| 课文1 | Chinese Scientists（中国科学家） | 回顾邓稼先 + 延伸介绍屠呦呦/袁隆平/钱学森 |
| 课文2 | A Trip to Guangzhou（广州之旅） | 广州地标/美食/文化，对接本土认同 |
| 课文3 | Great Chinese Inventions（中国伟大发明） | 四大发明 + 现代中国科技成就 |

### 44.5 执行步骤（~45 分钟）

```
第1步 备份（铁律8）→ 第2步 替换U11课文 → 第3步 造新题（3类题型） 
→ 第4步 生成MP3 → 第5步 exam配置检查 → 第6步 全量校验+推送
```

每步独立 commit，铁律 8 三件套（备份/差异报告/骤降阻断）兜底。

### 44.6 待确认事项

> ⚠️ 以上 U11 替换方案基于公开资料推测。**最终以实体书为准**。用户对照 2024 新版实体书确认后，我立即执行。

---

## 45. ⚠️ 审查纠错 · 全年级内容审查报告（2026-07-03 深夜）

### 45.1 触发

用户在审查 §44 P5 方案时指出 AI 犯了**方向性错误**：把老版教材（Steve Jobs）误认为"2024 新版"，推导出"邓稼先→乔布斯"的逆方向升级。经用户纠正：2024 教科书改革方向是**强化本国科学家、家国情怀教育**，用中国科学家替换外国名人。

### 45.2 审查结论

| 结论 | 说明 |
|---|---|
| ✅ 6下 U5 孙中山 | 中国历史人物，正确 |
| ✅ 6下 U6 邓稼先 | 已替换老版 Steve Jobs，正确 |
| ⚠️ 6下 U9 | 全西方故事线（悉尼/夏威夷），用户决定暂不动 |
| 🔴 6下 U11 | 非洲/外国 Review，用户决定替换为中国内容 |
| ✅ 3-5 年级、6上 | 日常/学校/家庭主题，无突出问题 |
| ✅ U5/U6 副课文 | 莫扎特/罗琳，用户决定保留 |

### 45.3 铁律

- ✅ 铁律 5：三次 `ask_followup_question` 收集决策
- ✅ 铁律 2：§44+§45 完整记录
- ✅ 无版本冲突：docs 改动，走 dev-push.sh

> 本文为 docs 改动，CI 不 bump 版本。


## 46. ✅ P5 一期 · U11 Review 中国化替换完成（2026-07-03 深夜，已上线）

### 46.1 执行摘要

| 项目 | 内容 |
|---|---|
| 触发 | 用户纠正 AI 方向性错误 + 全年级审查后决策 |
| 执行 | 4 个 feat/fix commit，7 个文件 |
| 改动 | 课文 3 篇 / 题库 12 题 / MP3 2 个 |
| 基线 | `verify_qbank` 37 预存错误，本轮 0 新增 |
| 上线 | feat/fix 提交，CI 自动 bump 版本号 |

### 46.2 替换对照

| 旧内容 | 新内容 | 方向 |
|---|---|---|
| African Safari Brochure | Great Chinese Scientists（中国科学家） | 🇨🇳 家国教育 |
| Fable — The Lion and the Mouse | A Trip to Guangzhou（广州之旅） | 🇨🇳 本土文化 |
| Nelson Mandela | Great Chinese Inventions（中国发明） | 🇨🇳 民族自豪 |
| 保护/拯救/地球 拼写 | 科学家/发明/文化/国家/梦想 | 🇨🇳 正面词汇 |
| 曼德拉/非洲 题 | 屠呦呦/广州/邓稼先 题 | 🇨🇳 中国人物 |

### 46.3 铁律

- ✅ 铁律 8：第1步全量备份 5 个 JSON + 差异报告（各文件删除=新增，无骤降）
- ✅ 铁律 6：`git diff --stat` + `verify_qbank` 基线对比（37→37，0新增错误）
- ✅ 铁律 1：双端验证（电脑端 `localhost:8765/index.html` + 手机端 `mobile.html`）
- ✅ 铁律 3：走 `dev-push.sh`，4 独立 commit
- ✅ 铁律 9：version.txt 全程未碰（CI 自动 bump）

### 46.4 待后续确认（需对照实体书）

| 项目 | 状态 |
|---|---|
| U6 邓稼先 | ✅ 已正确（无需升级） |
| U5 孙中山 | ✅ 已正确 |
| U9 Daniel→Sydney | ⏸️ 暂不动 |
| U5/U6 副课文（莫扎特/罗琳） | ✅ 保留 |

> 本节为收口记录，CI 不 bump 版本。
> 线上版本见仓库根 `version.txt`



## 47. 📋 P3-D · 语法讲解页数据化完整方案（2026-07-03 深夜制定）

> 📌 铁律 5 决策：C.完整版(~80条) + A.结构化字段 + B.全部/当前教材切换。
> 📌 目标：4条硬编码 → ~80条结构化语法知识库，覆盖小学三年级到初中九年级全体系，支持按教材/年级筛选。

### 47.1 JSON Schema 设计

每条语法知识点存储在 `data/grammar/grammar_knowledge.json`，结构如下：

```json
{
  "id": "g001",
  "title": "一般现在时",
  "titleEn": "Simple Present Tense",
  "category": "tenses",
  "level": "basic",
  "grades": ["G3", "G4", "G5", "G6", "G7"],
  "relatedUnits": {
    "jk": ["3A_U5", "4A_U3", "5A_U1", "6A_U2"],
    "hj": ["7A_U2", "7A_U4"]
  },
  "definition": "表示经常性、习惯性的动作或存在的状态。",
  "definitionEn": "Used to express habitual actions, general truths, or states.",
  "rules": [
    {"rule": "主语+动词原形(s/es)", "note": "第三人称单数加s/es"},
    {"rule": "主语+don't/doesn't+动词原形", "note": "否定句"}
  ],
  "examples": [
    {"en": "I go to school every day.", "cn": "我每天上学。"},
    {"en": "She likes apples.", "cn": "她喜欢苹果。"}
  ],
  "commonErrors": [
    {"wrong": "She like apples.", "correct": "She likes apples.", "note": "三单忘加s"}
  ],
  "keywords": ["时态", "一般现在时", "三单", "do/does"],
  "tips": "I/You/We/They用原形，He/She/It加s/es"
}
```

**字段说明**：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | string | 唯一标识 `g001`~`g080` |
| `title` | string | 中文标题 |
| `titleEn` | string | 英文标题（可选） |
| `category` | enum | parts_of_speech / tenses / verb_forms / sentence / clauses / voice / structures |
| `level` | enum | basic(G3-G4) / intermediate(G5-G6) / advanced(G7-G9) |
| `grades` | []string | 适用年级 `G3`~`G9` |
| `relatedUnits` | object | 按教材分组的单元 code 列表 |
| `definition` | string | 中文定义 |
| `definitionEn` | string | 英文定义 |
| `rules` | []object | 规则列表(rule + note) |
| `examples` | []object | 例句列表(en + cn) |
| `commonErrors` | []object | 常见错误(wrong + correct + note) |
| `keywords` | []string | 搜索关键词 |
| `tips` | string | 记忆口诀/提示 |

### 47.2 完整语法分类体系（80条）

#### Ⅰ. 词性 · Parts of Speech（20条）

| id | 语法点 | level | 关键年级 |
|---|---|---|---|
| g001 | 名词：可数/不可数 | basic | G3 |
| g002 | 名词：复数规则 | basic | G3 |
| g003 | 名词：所有格 | basic | G4 |
| g004 | 人称代词(I/you/he/she/it/we/they) | basic | G3 |
| g005 | 物主代词(my/your/his/her) | basic | G3 |
| g006 | 反身代词(myself/yourself) | intermediate | G6 |
| g007 | 指示代词(this/that/these/those) | basic | G3 |
| g008 | 不定代词(some/any/no/every) | intermediate | G5 |
| g009 | 冠词：定冠词 the | basic | G4 |
| g010 | 冠词：不定冠词 a/an | basic | G3 |
| g011 | 数词：基数词 1-100 | basic | G3 |
| g012 | 数词：序数词 first-tenth | basic | G4 |
| g013 | 形容词：用法与位置 | basic | G4 |
| g014 | 副词：方式副词(ly结尾) | intermediate | G5 |
| g015 | 副词：频度副词(always/usually/often) | basic | G4 |
| g016 | 介词：时间介词(at/in/on) | basic | G4 |
| g017 | 介词：地点介词(in/on/under/behind) | basic | G3 |
| g018 | 连词：and/but/or/so/because | intermediate | G5 |
| g019 | 感叹词(Oh/Wow/Great/Oops) | basic | G3 |
| g020 | 量词(a cup of/a piece of) | intermediate | G5 |

#### Ⅱ. 动词时态 · Tenses（16条）

| id | 语法点 | level | 关键年级 |
|---|---|---|---|
| g021 | 一般现在时 | basic | G3 |
| g022 | 现在进行时 | basic | G4 |
| g023 | 一般过去时(规则动词) | intermediate | G5 |
| g024 | 一般过去时(不规则动词) | intermediate | G5 |
| g025 | 过去进行时 | advanced | G8 |
| g026 | 一般将来时 will | intermediate | G5 |
| g027 | 一般将来时 be going to | intermediate | G6 |
| g028 | 现在完成时(1)：基本用法 | advanced | G8 |
| g029 | 现在完成时(2)：since/for | advanced | G8 |
| g030 | 现在完成时(3)：already/yet/just | advanced | G9 |
| g031 | 过去完成时 | advanced | G9 |
| g032 | 过去将来时 | advanced | G9 |
| g033 | 现在完成进行时 | advanced | G9 |
| g034 | 一般过去时 vs 现在完成时 | advanced | G9 |
| g035 | be动词的时态变化 | basic | G3 |
| g036 | have/has got 句型 | basic | G3 |

#### Ⅲ. 动词形式 · Verb Forms（10条）

| id | 语法点 | level | 关键年级 |
|---|---|---|---|
| g037 | 情态动词 can/can't | basic | G3 |
| g038 | 情态动词 must/have to | intermediate | G5 |
| g039 | 情态动词 should/shouldn't | intermediate | G6 |
| g040 | 情态动词 may/might | intermediate | G6 |
| g041 | 情态动词 would/could | advanced | G8 |
| g042 | 情态动词 need/dare | advanced | G9 |
| g043 | 不定式 to do(作宾语/目的状语) | advanced | G8 |
| g044 | 动名词 doing(作宾语) | advanced | G8 |
| g045 | 使役动词 make/let/have | advanced | G9 |
| g046 | 感官动词 see/hear/watch+do/doing | advanced | G9 |

#### Ⅳ. 句子结构 · Sentence Structure（15条）

| id | 语法点 | level | 关键年级 |
|---|---|---|---|
| g047 | 陈述句(肯定句/否定句) | basic | G3 |
| g048 | 一般疑问句(Yes/No) | basic | G3 |
| g049 | 特殊疑问句(Wh-Questions) | basic | G4 |
| g050 | 选择疑问句(Or-Questions) | intermediate | G5 |
| g051 | 反意疑问句 | advanced | G8 |
| g052 | 祈使句(肯定/否定) | basic | G3 |
| g053 | 感叹句 What/How | intermediate | G6 |
| g054 | There be 句型(1)：基本用法 | basic | G3 |
| g055 | There be 句型(2)：时态变化 | intermediate | G5 |
| g056 | 主谓一致(1)：基本规则 | basic | G4 |
| g057 | 主谓一致(2)：特殊主语 | intermediate | G6 |
| g058 | 倒装句(so/neither/nor) | advanced | G9 |
| g059 | 强调句(It is...that) | advanced | G9 |
| g060 | 并列句(and/but/or) | intermediate | G5 |
| g061 | 复合句概述 | advanced | G8 |

#### Ⅴ. 从句 · Clauses（8条）

| id | 语法点 | level | 关键年级 |
|---|---|---|---|
| g062 | 宾语从句(1)：that引导 | advanced | G8 |
| g063 | 宾语从句(2)：if/whether引导 | advanced | G9 |
| g064 | 宾语从句(3)：wh-引导 | advanced | G9 |
| g065 | 定语从句(1)：关系代词 who/which/that | advanced | G9 |
| g066 | 定语从句(2)：关系副词 when/where/why | advanced | G9 |
| g067 | 状语从句：时间(when/while/as) | advanced | G8 |
| g068 | 状语从句：条件(if/unless) | advanced | G8 |
| g069 | 状语从句：原因/目的/结果 | advanced | G9 |

#### Ⅵ. 语态 · Voice（4条）

| id | 语法点 | level | 关键年级 |
|---|---|---|---|
| g070 | 被动语态(1)：一般现在时/一般过去时 | advanced | G8 |
| g071 | 被动语态(2)：含情态动词 | advanced | G9 |
| g072 | 被动语态(3)：现在完成时/将来时 | advanced | G9 |
| g073 | 主动语态 vs 被动语态 | advanced | G8 |

#### Ⅶ. 特殊结构 · Special Structures（7条）

| id | 语法点 | level | 关键年级 |
|---|---|---|---|
| g074 | used to do / be used to doing | advanced | G8 |
| g075 | It is + adj + (for/of sb) to do | advanced | G8 |
| g076 | so...that / such...that | advanced | G9 |
| g077 | 比较级 & 最高级 (完整版) | intermediate | G5 |
| g078 | 直接引语 → 间接引语 | advanced | G9 |
| g079 | 条件句：真实条件 (if+一般现在, will) | advanced | G8 |
| g080 | 祈使句 + and/or + 陈述句 | advanced | G9 |

### 47.3 前端改造方案

| 维度 | 现状 | 目标 |
|---|---|---|
| 数据源 | `app.js` 硬编码 `grammarData` 4条 | `data/grammar/grammar_knowledge.json` ~80条 |
| 加载方式 | 内联变量 | `js/grammar.js` 模块 fetch + 缓存 |
| 目录渲染 | 全部 4 条平铺 | 7大分类折叠 + 筛选 + 搜索 |
| 内容渲染 | innerHTML 直出 | 结构化渲染（定义→规则→例句→常见错误→提示） |
| 教材关联 | 无 | `relatedUnits` + "全部/当前教材"切换 |
| 搜索 | 无 | 关键词搜索框 |

#### 新增/修改文件

| 文件 | 变更 |
|---|---|
| `data/grammar/grammar_knowledge.json` | 🆕 新建，~80条结构化数据 |
| `js/grammar.js` | 🆕 新建模块：加载/筛选/渲染 |
| `index.html` | ✏️ 注入 `grammar.js` + 更新 `#page-grammar` DOM |
| `app.js` | ✏️ 删除 `grammarData` + `renderGrammar()`，改为调用 GrammarModule |
| `styles.css` | ✏️ 新增语法页筛选/toggle/搜索样式 |

### 47.4 执行步骤（~2天，5个commit）

| 步 | 内容 | 预估 |
|---|---|---|
| 1 | 铁律8备份 + 创建 `data/grammar/` | 2min |
| 2 | 编写 80 条语法 JSON（分4批，每批20条独立校验） | ~3h |
| 3 | 创建 `js/grammar.js`（加载/分组/筛选/渲染 4 函数） | ~1h |
| 4 | 更新 `index.html` + `app.js` + `styles.css` | ~1.5h |
| 5 | 全量校验 + 双端验证 + 推送 | ~30min |

### 47.5 铁律

| 铁律 | 状态 |
|---|---|
| 1 双端验证 | ✅ 第5步电脑+手机语法页 |
| 2 更新文档 | ✅ §47 方案 + §48 收口 |
| 3 分批推送 | ✅ 5 个独立 commit |
| 5 选项清单 | ✅ C.完整版/A.结构化/B.切换按钮 |
| 6 落盘验证 | ✅ JSON 写入后 python 校验 |
| 8 数据安全 | ✅ 全量备份 + 写入前校验 |
| 9 version.txt | ✅ 全程不碰 |






## 48. 📋 广州小学英语考试题型对账分析报告（2026-07-04 修订版）

> ⚠️ **修订说明**：初版基于单一来源（renrendoc.com 六上试卷）错误判定「6年级无作文」。经用户指出后扩大信源——增补 21世纪教育网 各年级及历年真题、各区试卷专项复习资料、百度文库历年范文合集——**确认广州六年级期中/期末均含书面表达题**。本版为修正后完整版。

### 48.1 数据源（覆盖 2020-2025，广州多区）

| 序号 | 来源 | 覆盖范围 |
|---|---|---|
| 1 | 21cnjy.com 2024-2025各年级期末真题 | 3下/4下/5下/6下 |
| 2 | 21cnjy.com 2023-2024六下真题汇编 | ⭐ 含12道广州各区写作真题 |
| 3 | 学科网 2024-2025六上真题分类汇编 | 六上书面表达专项 |
| 4 | 百度文库 广州版六上作文范文合集 | 9大话题范文 |
| 5 | 人人文库 2024六上期末真题 | 花都/白云等区 |
| 6 | 广州妈妈网 各区期末真题汇总 | 2019-2023各年级 |

### 48.2 广州各年级官方试卷完整题型（修订）

#### 三年级（100分）· 听力40 + 笔试60

| 题号 | 题型 | 分值 |
|---|---|---|
| 一 | 听力(选词/排序/判断/选择) | 40 |
| 二 | 选择题 | 10 |
| 三 | 填空题 | 10 |
| 四 | **连词成句** | 10 |
| 五 | **匹配题**（问答配对） | 10 |
| 六 | **句型转换** | 10 |
| 七 | **补全对话** | 10 |

#### 四年级（100分）· 听力40 + 笔试60

| 题号 | 题型 | 分值 |
|---|---|---|
| 一 | 听力(选信息/判断/选择) | 40 |
| 二 | 选择题 | 10 |
| 三 | 填空题 | 10 |
| 四 | **连词成句** | 10 |
| 五 | **句型转换** | 10 |
| 六 | **补全对话** | 10 |
| 七 | 阅读理解 | 10 |

#### 五年级（100分）· 听力40 + 笔试60

| 题号 | 题型 | 分值 |
|---|---|---|
| 一 | 听力(编号/判断/选答语) | 40 |
| 二 | 选择题 | 10 |
| 三 | 判断题 | 10 |
| 四 | **句型转换** | 10 |
| 五 | **补全对话** | 10 |
| 六 | 阅读理解 | 10 |
| 七 | 🆕 **书面表达（写作）** | **10** |

#### 🔴 六年级（100分）· 听力30 + 笔试70 【修订版】

| 题号 | 题型 | 分值 |
|---|---|---|
| 一-五 | 听力(编号/选信息/选答句/短文选择/听写) | 30 |
| 六 | 单词归类 | 8 |
| 七 | 看图写词 | 5 |
| 八 | 单项选择 | 12 |
| 九 | **补全对话**（选句子+填空） | 10 |
| 十 | 补全短文（选词填空） | 6 |
| 十一 | 🆕 **书面表达/写作** | **10** |
| 十二 | 阅读理解（选择） | 8 |
| 十三 | 阅读理解（判断） | 5 |

> ✅ **确认：广州六年级期中/期末均含书面表达题**（各区和不同年份在题型顺序上略有差异，但写作题普遍存在）

### 48.3 六年级书面表达真题主题库（来自2023-2024广州各区期末真题）

| # | 写作主题 | 字数要求 | 类型 |
|---|---|---|---|
| 1 | 写自己的偶像（外观、性格、职业等） | ≥6句或45词 | 人物描写 |
| 2 | 伦敦旅游计划（看图提示词） | ≥40词 | 旅行计划 |
| 3 | 介绍一位名人 / 最喜欢的动物（二选一） | ≥45词 | 人物/动物 |
| 4 | 暑假国内旅游计划（按思维导图） | ≥40词 | 旅行计划 |
| 5 | 介绍一位熟悉的名人（杨利伟） | ≥45词 | 人物描写 |
| 6 | 介绍一个熟悉的国家（中国） | ≥40词 | 国家介绍 |
| 7 | 介绍钟南山院士（按提示词） | ≥6句，40词 | 人物介绍 |
| 8 | 介绍袁隆平（按表格信息） | ≥40词 | 人物介绍 |
| 9 | 用过去时写故事 / 介绍野生动物（二选一） | ≥40词 | 故事/动物 |
| 10 | 围绕"changes"描写人或地方变化 | ≥6句，40词 | 对比描写 |
| 11 | 介绍喜欢的动物 / 想去哪个国家（二选一） | 40词左右 | 动物/旅行 |
| 12 | 介绍老虎并提出保护建议（看图） | ≥40词 | 动物保护 |

**写作特点**：
- 词数：≥40词（主流）或 ≥6句
- 形式：自由写作 / 提示词写作 / 表格写作 / 思维导图写作 / 看图写话 / 二选一
- 高频主题：**人物描写（名人/院士）、旅行计划、动物介绍**
- 中国元素：杨利伟、钟南山、袁隆平、苏炳添、孔融让梨（近年增加趋势）

### 48.4 广州各区六年级写作题差异

| 区/类型 | 写作分值 | 典型要求 |
|---|---|---|
| 花都区 | 10分 | 按实际情况回答问题 + 写作 |
| 越秀区 | 10分 | ≥40词话题作文 |
| 天河区 | 10分 | ≥6句话或≥40词 |
| 海珠区 | 10分 | 二选一话题 |
| 番禺区 | 10分 | ≥40词 |
| 白云区 | 10分 | 提示词/看图写作 |

### 48.5 项目现有 vs 官方题型

| 题型 | 官3 | 官4 | 官5 | 官6 | 项目小学模板现状 | 缺口 |
|---|---|---|---|---|---|---|
| 听力单选 | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| 听力新题型(选图/判断/填空) | ✅ | ✅ | ✅ | ✅ | ✅ gz模板 | — |
| 单词拼写 | — | — | — | ✅ | ✅ | — |
| 语法选择 | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| 完形填空(cloze) | — | — | — | — | ✅ | ⚠️ 官无此题型, 保留作拓展练习 |
| 阅读理解 | — | ✅ | ✅ | ✅ | ✅ | — |
| **连词成句** | ✅ | ✅ | — | — | ✅ gz模板 | 3-4年级low/mid模板缺 |
| **句型转换** | ✅ | ✅ | ✅ | — | ❌ | **3-6年级全缺** |
| **补全对话** | ✅ | ✅ | ✅ | ✅ | ❌ | **全部年级缺** |
| **匹配题** | ✅ | — | — | — | ❌ | **3年级缺** |
| 🆕 **书面表达/写作** | — | — | ✅ | ✅ | ❌ | **5-6年级缺(关键!)** |
| **回答问题(书面)** | — | — | — | ✅(部分区) | ❌ | 6年级缺 |
| 补全短文 | — | — | — | ✅ | ❌ | 6年级缺 |

### 48.6 完整参考来源

| 来源 | URL |
|---|---|
| 三年级期末真题(2024-2025) | https://zy.21cnjy.com/23109558 |
| 四年级期末真题(2024-2025) | https://zy.21cnjy.com/23109560 |
| 五年级期末真题(2024-2025) | https://zy.21cnjy.com/23109561 |
| 六年级六下书面表达真题汇编(2023-2024) | https://zy.21cnjy.com/20686974 |
| 六年级六上书面表达真题(2024-2025) | https://www.51jiaoxi.com/doc-17015933.html |
| 六年级六上期末真题(2024) | https://www.renrendoc.com/paper/385190289.html |
| 广州版六上作文范文合集 | https://wenku.baidu.com/aggs/75dd5b04cc17552707220826.html |
| 广州版六下作文范文 | https://wenku.baidu.com/aggs/2be0424de518964bcf847c07.html |
| 六年级书面表达期末真题(广州专版) | https://www.zxxk.com/soft/49097140.html |






## 49. 📋 各年级/学期题型详细对比（2026-07-04 补充分析）

### 49.0 问题发现

项目当前**不分年级、不分学期**，3-4年级全部考试用同一套 `low_*` 模板（5种题型），5-6年级用 `mid_*` 模板（5种题型）。但广州官考真题显示：不同年级、甚至同一年的上/下学期，题型和分值都有差异。仅3上期中用了 `low_midterm_gz` 的8种题型模板，其余全部用只有5种的通用模板。

### 49.1 各年级题型逐行对比

> ⚠️ 数据来源：已获取的广州各区/学期真题。上册（上学期）部分为合理推论（基于教材难度递进规律：上册偏基础/听力+词汇，下册增加连词成句/句型转换/写作等输出题型）。

#### 三年级

| 题型 | 三上(官) | 三下(官来源) | 项目三上 | 项目三下 | 差距 |
|---|---|---|---|---|---|
| 听力选择/排序/判断 | ✅ 40分 | ✅ 40分 | ✅ 5题 | ✅ 5题 | 题数不足 |
| 选择/填空 | ✅ 20分 | ✅ 20分 | — | — | **缺** |
| 连词成句 | ✅ 10分 | ✅ 10分 | ✅(仅gz模板) | ❌ | **三下缺** |
| 匹配题(问答配对) | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **全缺** |
| 句型转换 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **全缺** |
| 补全对话 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **全缺** |
| 拼写(spelling) | — | — | ✅ 10题 | ✅ 10题 | ⚠️ 官无(官考填词,非拼写) |
| 完形(cloze) | — | — | ✅ 4题 | ✅ 4题 | ⚠️ 官无 |
| **题型数** | **7种** | **7种** | **5种** | **5种** | **缺2-3种** |

#### 四年级

| 题型 | 四上(推) | 四下(官来源) | 项目四上 | 项目四下 | 差距 |
|---|---|---|---|---|---|
| 听力选择/判断/问答 | ✅ 40分 | ✅ 40分 | ✅ 5题 | ✅ 5题 | 题数不足 |
| 选择/填空 | ✅ 20分 | ✅ 20分 | — | — | **缺** |
| 连词成句 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **全缺** |
| 句型转换 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **全缺** |
| 补全对话 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **全缺** |
| 阅读理解 | ✅ 10分 | ✅ 10分 | ✅ 3题 | ✅ 3题 | 题数不足 |
| **题型数** | **6种** | **6种** | **5种** | **5种** | **缺3种** |

#### 五年级

| 题型 | 五上(推) | 五下(官来源) | 项目五上 | 项目五下 | 差距 |
|---|---|---|---|---|---|
| 听力编号/判断/选答 | ✅ 40分 | ✅ 40分 | ✅ 5题 | ✅ 5题 | 题数不足 |
| 选择 | ✅ 10分 | ✅ 10分 | — | — | **缺** |
| 判断 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **缺** |
| 句型转换 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **缺** |
| 补全对话 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **缺** |
| 阅读理解 | ✅ 10分 | ✅ 10分 | ✅ 5题 | ✅ 5题 | 题数不足 |
| 🆕 书面表达(写作) | — | ✅ 10分 | ❌ | ❌ | **五下缺** |
| **题型数** | **6种** | **7种**(含写作) | **5种** | **5种** | **缺2-3种** |

#### 六年级

| 题型 | 六上(官来源) | 六下(推) | 项目六上 | 项目六下 | 差距 |
|---|---|---|---|---|---|
| 听力5子题型 | ✅ 30分 | ✅ 30分 | ✅ 5题 | ✅ 5题 | 题数/子题型不足 |
| 单词归类/填词 | ✅ 13分 | ✅ 13分 | — | — | **缺** |
| 单项选择 | ✅ 12分 | ✅ 12分 | — | — | **缺** |
| 补全对话 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **缺** |
| 补全短文 | ✅ 6分 | ✅ 6分 | ❌ | ❌ | **缺** |
| 书面表达/写作 | ✅ 10分 | ✅ 10分 | ❌ | ❌ | **缺** |
| 阅读理解选择+判断 | ✅ 13分 | ✅ 13分 | ✅ 5题 | ✅ 5题 | 题数不足 |
| **题型数** | **7种** | **7种** | **5种** | **5种** | **缺4种** |

### 49.2 项目现状 vs 广州官考

| 年级 | 官考题型数 | 项目题型数 | 缺口数 | 主要缺失 |
|---|---|---|---|---|
| 三年级 | 7 | 5(通用) / 8(gz模板) | 3-4 | 匹配题/句型转换/补全对话 |
| 四年级 | 6 | 5 | 3 | 连词成句/句型转换/补全对话 |
| 五年级 | 6-7 | 5 | 2-3 | 判断/句型转换/补全对话/写作(下) |
| 六年级 | 7 | 5 | 4 | 归类/对话/短文/写作/选择 |

### 49.3 上层/下层差异总结

```
三年级: 上(听说基础) → 下(+连词成句/句型转换)             差异: 2种题型增加
四年级: 上(听说+阅读)  → 下(+连词成句/句型转换/补全对话)    差异: 2-3种题型增加
五年级: 上(6种)       → 下(+书面表达10分)                  差异: 1种(写作)
六年级: 上(7种)       → 下(保持7种, 主题变难)              差异: 内容难度
```

> 📌 核心规律：**上册偏输入（听力+词汇+语法），下册增加输出型题型（连词成句/句型转换/写作）**。项目需为每学期独立配置模板。

### 49.4 结论

| # | 问题 | 严重程度 |
|---|---|---|
| 1 | 3上gz模板有8种、3下只有5种——确实不合理，三下和三上题型数应接近（均为7种） | 🔴 严重 |
| 2 | **所有年级**上/下学期用同一套模板，无法反映官考「上册输入→下册输出」的递进规律 | 🔴 严重 |
| 3 | 低年级听力题数（5题）远不足官考（~15-20小题） | 🟡 中等 |
| 4 | gz模板仅应用于3上期中，是一片孤岛——其他年级/学期均未受益 | 🟡 中等 |

> 📌 此分析待用户验收后整合入 §48 报告。下一步可制定各年级/学期独立模板方案。

## 50. 📋 P6 · 小学模拟考试题型对齐广州官方 · 开发计划（2026-07-04）

> 📌 基于 §48 对账报告，补全缺失题型、移除多余题型。
> 📌 决策记录：铁律5 用户选择「逐个完成」节奏。暂无 LLM Key。
> 📌 规划原则：按缺失影响面 + 实现复杂度 排序，分 4 阶段推进。

### 49.1 任务全景

| 阶段 | 任务 | 题型 | 影响年级 | 复杂度 | 预估工期 | 需Key |
|---|---|---|---|---|---|---|
| ✅ P6-A | **补全对话** | 新题型 | 3-6 | 中 | ~2天 | ❌ |
| ✅ P6-B | **句型转换** | 新题型 | 3-6 | 低 | ~1.5天 | ❌ |
| ✅ P6-C | **书面表达/写作** | 新题型 | 5-6 | 高 | ~3天 | ❌(纯前端) |
| ✅ P6-D | **匹配题+补全短文+连词成句模板** | 补齐/补全 | 3-6 | 低 | ~1天 | ❌ |
| ✅ P6-E | **移除小学完形填空+模板最终对齐** | 重构 | 3-6 | 低 | ~0.5天 | ❌ |

> **合计 ~8 天**，建议分 5 个子版本独立推送。

---

### 49.2 P6-A · 补全对话（~2 天）

#### 目标

新增「补全对话」题型。广州 3-6 年级官考均含 10 分补全对话。

#### 题型设计

**形式**：显示一段不完整对话（5个空），给出 6-8 个候选句子（含1-2个干扰项），学生将正确的句子拖入/选入对应空白。

```
示例：
A: Hello! ___________ (空白1)
B: I'm fine, thank you. ___________(空白2)
A: I'm going to the library. ___________ (空白3)

候选句：A. How are you?  B. Where are you going?  C. I'm sorry.  
        D. What about you?  E. See you later!  F. I like reading.
```

#### 实施步骤

| 步 | 内容 | 文件 |
|---|---|---|
| 1 | 创建 `data/questions/jk_dialog_complete.json`（jk 3-6，每册 2 套 × 5 空 = 80题） | 🆕 |
| 2 | 创建 `data/questions/hj_dialog_complete.json`（hj 7-9，20题） | 🆕 |
| 3 | `questionBank.js` types 数组加 `dialog_complete` | ✏️ |
| 4 | `js/practice.js` 新增 `startPractice('dialog_complete')` 路由 + `_renderDialogCompleteHTML` | ✏️ |
| 5 | `js/exam.js` 考试模板 sections 加 `dialog_complete` | ✏️ |
| 6 | `index.html` 练习页加补全对话徽章卡片 | ✏️ |
| 7 | 所有考试模板更新（low/mid final/midterm 加 `dialog_complete` 10分） | ✏️ |

#### 评分逻辑

每空匹配正确得 2 分，5 空满分 10 分。匹配按序号对位校验，不区分大小写。

---

### 49.3 P6-B · 句型转换（~1.5 天）

#### 目标

新增「句型转换」题型。广州 3-5 年级官考均含 10 分。

#### 题型设计

**形式**：给出原句 + 转换要求，学生输入改写后的句子。如：
- 肯定句→否定句
- 陈述句→一般疑问句
- 主动→被动（高年级）
- 同义句转换

```
示例：
原句：She is a student.
要求：改为一般疑问句
答案：Is she a student? (2分)
```

#### 实施步骤

| 步 | 内容 | 文件 |
|---|---|---|
| 1 | 扩充 `data/questions/jk_sentence_transform.json`（1题 → 50题，每单元1-2题） | ✏️ |
| 2 | `js/practice.js` 新增 `_renderSentenceTransformHTML` 输入框渲染 | ✏️ |
| 3 | `js/exam.js` 考试模板 sections 加 `sentence_transform` | ✏️ |
| 4 | 所有考试模板更新（3-5年级加 10分句型转换） | ✏️ |

#### 评分逻辑

**自动判分方案**（无需 AI）：
1. 存储预期答案列表（多个可接受答案）
2. 标准化：去多余空格/标点 → 小写匹配
3. 支持多答案：如 `Is she a student?` / `Is she the student?` 都算对

---

### 49.4 P6-C · 书面表达/写作（~3 天）

#### 目标

新增「书面表达」题型。广州 5-6 年级官考含 10 分写作（≥40 词）。

#### 题型设计

**形式**：给出写作题目 + 提示词/思维导图/表格，学生在 textarea 中书写短文，系统按词数+关键词+结构评分，并展示参考范文。

```
示例：
题目：介绍你最喜欢的一位名人
要求：≥40词，包含姓名、外貌、职业、你喜欢的原因
关键词：famous, because, hardworking, admire

作答区：___________________
[提交] [查看范文]
```

#### 评分方案（无 LLM Key 的务实方案）

| 维度 | 计分 | 实现方式 |
|---|---|---|
| 词数达标 | 3分 | `words.split(/\s+/).length >= 40` |
| 关键词覆盖 | 3分 | 检查提示词是否出现在文本中 |
| 结构完整 | 2分 | 是否有开头句/主体/结尾（句号数量>3） |
| 拼写规范 | 2分 | 无连续大写/无过长无空格串 |

> ⚠️ 以上为启发式评分，不是真正 AI 评分。用户提交后可查看「参考范文」对比。获得 LLM Key 后升级为真实 AI 批改。

#### 实施步骤

| 步 | 内容 | 文件 |
|---|---|---|
| 1 | 创建 `data/questions/jk_writing.json`（5-6年级，每学期4篇 = 16题） | 🆕 |
| 2 | `js/practice.js` 新增 `_renderWritingHTML`（textarea + 词数统计 + 关键词匹配 + 范文展示） | ✏️ |
| 3 | `js/exam.js` 考试模板 sections 加 `writing` + `_scoreWriting()` 评分函数 | ✏️ |
| 4 | 5-6年级考试模板加 `writing` 10分 | ✏️ |
| 5 | 样式适配（textarea 美观、词数计数器） | ✏️ |

#### 写作题库设计（16 篇，参考 §48 真题主题）

| # | 主题 | 年级 | 类型 |
|---|---|---|---|
| 1 | 介绍一位名人（杨利伟） | 5下 | 人物描写 |
| 2 | 暑假旅游计划（北京） | 5下 | 旅行计划 |
| 3 | 我喜欢的动物 | 5下 | 动物描写 |
| 4 | 我的周末计划 | 5上 | 日常计划 |
| 5 | 介绍我的偶像 | 6上 | 人物描写 |
| 6 | 伦敦旅游计划 | 6下 | 旅行计划 |
| 7 | 介绍钟南山 | 6下 | 人物介绍 |
| 8 | 介绍袁隆平 | 6下 | 人物介绍 |
| 9 | 我的变化（Before vs Now） | 6上 | 对比描写 |
| 10 | 如何保持健康 | 6上 | 建议类 |
| 11 | 介绍中国 | 6下 | 国家介绍 |
| 12 | 保护动物（老虎） | 6下 | 倡议类 |
| 13 | 我理想的学校 | 6上 | 想象类 |
| 14 | 给我的朋友写一封信 | 6下 | 书信 |
| 15 | 用过去时写一个故事 | 6上 | 叙事 |
| 16 | 介绍广州 | 6下 | 城市介绍 |

---

### 49.5 P6-D · 匹配题+补全短文+连词成句模板（~1 天）

#### P6-D1 匹配题（3年级）

| 步 | 内容 |
|---|---|
| 1 | 创建 `data/questions/jk_matching.json`（30组问答配对） |
| 2 | 前端渲染：左侧问题列 / 右侧答案列 → 拖拽或下拉匹配 |
| 3 | exam 模板 3年级加 matching 10分 |

#### P6-D2 补全短文（6年级）

| 步 | 内容 |
|---|---|
| 1 | 创建 `data/questions/jk_cloze_passage.json`（选词填空型，10篇） |
| 2 | 前端渲染：短文（含空白）+ 候选词池 → 点击/拖入 |
| 3 | exam 模板 6年级加 cloze_passage 6分 |

#### P6-D3 连词成句模板补全

| 步 | 内容 |
|---|---|
| 1 | 3-4年级 low/mid 考试模板加 `sentence_order` 10分 |
| 2 | 扩充 `jk_sentence_order.json` 3-4年级专项（当前73题主要覆盖全年级） |

---

### 49.6 P6-E · 模板对齐（~0.5 天）

| # | 操作 | 影响模板 |
|---|---|---|
| 1 | low_midterm 加 `dialog_complete` 10分 + `sentence_transform` 10分 + `sentence_order` 10分(3-4级) | low_midterm |
| 2 | low_final 同上 | low_final |
| 3 | mid_midterm 加 `dialog_complete` 10分 + `sentence_transform` 10分 | mid_midterm |
| 4 | mid_final 同上 + `writing` 10分(5-6级) | mid_final |
| 5 | low_unit 加 `dialog_complete` 10分 | low_unit |
| 6 | `cloze` 保留为拓展练习（官无此题型，但作为阅读+词汇综合训-练） | low/mid 全模板 |
| 7 | gz 广州市题型模板：补全 `dialog_complete` + `sentence_transform` + `matching`(3年级) + `writing`(5-6) + `cloze_passage`(6年级) | gz模板 |
| 8 | 总分重算：确保每卷 100 分 | 全模板 |

---

### 49.7 执行顺序 & 工时总览

```
P6-A 补全对话 (~2天)
  → P6-B 句型转换 (~1.5天)
    → P6-C 书面表达 (~3天)
      → P6-D 匹配/短文/连词 (~1天)
        → P6-E 模板对齐 (~0.5天)
```

| 阶段 | 工期 | 代码改动量 |
|---|---|---|
| P6-A | ~2天 | 🆕 2 JSON + ✏️ 3 JS + ✏️ 1 HTML + ✏️ 1 JSON |
| P6-B | ~1.5天 | ✏️ 2 JSON + ✏️ 2 JS |
| P6-C | ~3天 | 🆕 1 JSON + ✏️ 2 JS + ✏️ 1 CSS + ✏️ 1 JSON |
| P6-D | ~1天 | 🆕 2 JSON + ✏️ 2 JS + ✏️ 1 JSON |
| P6-E | ~0.5天 | ✏️ 2 JSON |
| **合计** | **~8天** | |

### 49.8 铁律遵循

| 铁律 | P6-A | P6-B | P6-C | P6-D | P6-E |
|---|---|---|---|---|---|
| 1 双端验证 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 2 更新文档 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 3 分批推送 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 选项清单 | — | — | — | — | — |
| 6 落盘验证 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 数据安全 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 9 version.txt | ✅ | ✅ | ✅ | ✅ | ✅ |

> 📌 本方案为 docs 记录。建议从 P6-A 补全对话开始执行（影响面最大+相对简单）。


## 51. 📋 P6 完整开发计划（DeepSeek 初稿，⚠️ 已被 §52 取代）

> ⚠️ **本节为初稿，未做代码核查，存在重复造轮子问题（如 P6-C 写作实际已在 exam.js 实现）。最终执行以 §52 为准。**

> 📌 整合 §48(对账) + §49(年级逐行对比) + §50(5阶段框架)，按 9 大铁律逐步执行。
> 📌 核心目标：①补全新题型 ②每学期独立模板 ③上册输入→下册输出递进 ④总分严格100分。

### 51.0 铁律前置声明

| 铁律 | 本计划贯穿方式 |
|---|---|
| 1 双端验证 | 每步结束后启动 `dev-open.sh`，给电脑+手机双URL验证 |
| 2 更新文档 | 每步 commit 后更新本文档子节 + §3 规模表 |
| 3 不分批擅自push | **每步完成后不push**，等用户确认"验收通过请推送" |
| 5 选项清单 | 涉及方案选择时用 `ask_followup_question` |
| 6 真实落盘 | Python直写JSON → `python3 -c "json.load(open(...))"` 校验 → `git diff --stat` 确认 |
| 7 省token | 按字面诉求一步到位，不反复测试 |
| 8 数据安全 | 写入前备份 → 差异报告 → 骤降阻断 → `verify_qbank.py` |
| 9 version.txt | 全程不碰，推送走 `dev-push.sh` |

---

### 51.1 分阶段总览

```
P6-A 补全对话    P6-B 句型转换    P6-C 书面表达     P6-D 补齐        P6-E 学期模板
  ~2天             ~1.5天            ~3天              ~1天             ~1天
  新增题型          扩充+判分         新题型+评分        匹配/短文/连词    每学期独立模板
```

---

### 51.2 P6-A · 补全对话（~2天，影响 3-6 年级）

#### 目标
新增 `dialog_complete` 题型。官考3-6年级均含10分补全对话。

#### 题型设计
```
显示：5空对话 + 7个候选句(含2干扰) 
交互：下拉选择 / 点击匹配
判分：每空2分，按序号对位校验
```

#### 执行步骤

| 步 | 内容 | 铁律6验证 | commit |
|---|---|---|---|
| A1 | 铁律8备份 | `verify_qbank.py` 基线 | — |
| A2 | 创建 `data/questions/jk_dialog_complete.json`（3-6年级，每册2套×5空=40组） | `json.load` 校验 + `git diff` | `feat(dialog):` |
| A3 | 创建 `data/questions/hj_dialog_complete.json`（7-9年级，30组） | 同上 | `feat(dialog):` |
| A4 | `questionBank.js` types数组加 `dialog_complete` + 加载逻辑 | HTTP 200 可达验证 | `feat(dialog):` |
| A5 | `js/practice.js` 新增 `_renderDialogCompleteHTML()` + `startPractice('dialog_complete')` 路由 | 本地验证：语法页→补全对话→选题答题 | `feat(dialog):` |
| A6 | `index.html` 练习页加补全对话徽章卡片 | 本地验证：徽章显示+题数正确 | `feat(dialog):` |
| A7 | `js/exam.js` 考试渲染加 `dialog_complete` section | 本地验证：模拟考中出现补全对话 | `feat(dialog):` |
| A8 | 铁律1双端验证 + 更新 §3 规模表 → 等待用户验收 | `dev-open.sh` 双端URL | 不push |

#### 铁律6验证清单（A8完成时）

```
✅ verify_qbank.py 基线 3205题, 错误37(预存) 0新增
✅ jk_dialog_complete.json → json.load 通过
✅ hj_dialog_complete.json → json.load 通过
✅ 练习页徽章显示 dialog_complete
✅ 模拟考出现补全对话 section
✅ 电脑端 localhost:8765/index.html?v=日期 功能正确
✅ 手机端 localhost:8765/mobile.html?v=日期 功能正确
```

---

### 51.3 P6-B · 句型转换（~1.5天，影响 3-6 年级）

#### 目标
官考3-6年级均含10分句型转换。扩充现有 `jk_sentence_transform.json`（1题→50题），新增判分逻辑。

#### 题型设计
```
题干：原句 + 转换要求（如"改为一般疑问句"）
交互：input框或填空
判分：标准化后对比预期答案（支持多答案）
```

#### 执行步骤

| 步 | 内容 | 铁律8 | commit |
|---|---|---|---|
| B1 | 备份 `jk_sentence_transform.json` | ✅ 差异报告 | — |
| B2 | 扩充至50题（每单元1-2题，覆盖3下→6下核心转换） | 保留1/新增49/置换0 | `feat(sentence_transform):` |
| B3 | `js/practice.js` 新增 `_renderSentenceTransformHTML()` input框判分 | 本地grammar选择 | `feat(sentence_transform):` |
| B4 | `js/exam.js` + 考试模板加 `sentence_transform` 10分section | 本地考试验证 | `feat(sentence_transform):` |
| B5 | 铁律1双端验证 → 等用户验收 | `dev-open.sh` | 不push |

#### 判分算法（无AI方案）
```
step1: 标准化 input → lower() → strip() → 去多余空格
step2: 匹配预期答案列表（支持多可接受答案）
step3: 全字匹配则满分，否则0分
```

---

### 51.4 P6-C · 书面表达/写作（~3天，影响 5-6 年级）

#### 目标
官考5下+6上/下均含10分写作（≥40词）。无LLM Key下用启发式评分+参考范文。

#### 题型设计
```
题干：写作题目 + 提示词 + 要求
交互：textarea（实时词数统计）
评分：词数(3) + 关键词(3) + 结构(2) + 规范(2) = 10分
展示：提交后显示参考范文供对比
```

#### 执行步骤

| 步 | 内容 | 关键点 | commit |
|---|---|---|---|
| C1 | 创建 `data/questions/jk_writing.json`（5-6年级16篇，真题主题） | 铁律8备份 | `feat(writing):` |
| C2 | `js/practice.js` 新增 `_renderWritingHTML()`（textarea+词数+关键词检测+范文） | 本地页面验证 | `feat(writing):` |
| C3 | `js/exam.js` 新增 `_scoreWriting()` 评分函数 | 测试评分输出正常 | `feat(writing):` |
| C4 | 考试模板更新（5下+6上下加 `writing` 10分） | 模板总分100验证 | `feat(writing):` |
| C5 | 铁律1双端验证 → 等用户验收 | `dev-open.sh` | 不push |

#### 写作题库主题（16篇真题）

| # | 主题 | 年级 | 字数 |
|---|---|---|---|
| 1-4 | 介绍名人(杨利伟/钟南山/袁隆平/偶像) | 5下/6下 | ≥40 |
| 5-8 | 旅行计划(北京/伦敦/广州/暑假) | 5下/6下 | ≥40 |
| 9-12 | 动物/国家/变化/健康 | 6上/6下 | ≥40 |
| 13-16 | 故事/书信/理想学校/环保 | 6上/6下 | ≥40 |

---

### 51.5 P6-D · 匹配题+补全短文+连词成句补齐（~1天）

#### D1 匹配题（3年级）

| 步 | 内容 |
|---|---|
| D1.1 | 创建 `jk_matching.json`（30组问答配对+图文匹配） |
| D1.2 | `js/practice.js` + `js/exam.js` 新增匹配渲染 |

#### D2 补全短文（6年级）

| 步 | 内容 |
|---|---|
| D2.1 | 创建 `jk_cloze_passage.json`（10篇选词填空型短文） |
| D2.2 | 前端渲染（词池点击+空白填入） |

#### D3 连词成句模板补全

| 步 | 内容 |
|---|---|
| D3.1 | 3-4年级 low_final/low_midterm 模板加 `sentence_order` 10分 |
| D3.2 | 扩充 `jk_sentence_order.json` 3-4年级专项 |

---

### 51.6 P6-E · 每学期独立模板 + 总分对齐（~1天）

#### 目标
当前所有小学考试共用 `low_*`（3-4级）和 `mid_*`（5-6级）模板，需改为每学期独立模板以反映官考差异。

#### 模板矩阵

| 模板名 | 适用 | 题型 | 总分 |
|---|---|---|---|
| **g3a_final** | 3上期末 | 听力+拼写+语法+连词成句+匹配+补全对话+句型转换 | 100 |
| **g3b_final** | 3下期末 | 同上（7种） | 100 |
| **g3a_midterm** | 3上期中 | 听力+拼写+语法+连词成句+匹配+补全对话 | 100 |
| **g3b_midterm** | 3下期中 | 同上（6种，3上无句型转换） | 100 |
| **g4a_final** | 4上期末 | 听力+拼写+语法+连词成句+补全对话+阅读 | 100 |
| **g4b_final** | 4下期末 | 听力+拼写+语法+连词成句+补全对话+句型转换+阅读（7种） | 100 |
| **g4a_midterm** | 4上期中 | 听力+拼写+语法+连词成句+补全对话 | 100 |
| **g4b_midterm** | 4下期中 | 听力+拼写+语法+连词成句+补全对话+句型转换（6种） | 100 |
| **g5a_final** | 5上期末 | 听力+拼写+语法+补全对话+句型转换+判断+阅读 | 100 |
| **g5b_final** | 5下期末 | 同上 + 🆕写作10分（8种） | 100 |
| **g5a_midterm** | 5上期中 | 听力+拼写+语法+补全对话+句型转换+阅读 | 100 |
| **g5b_midterm** | 5下期中 | 听力+拼写+语法+补全对话+句型转换+阅读（6种） | 100 |
| **g6a_final** | 6上期末 | 听力+归类填词+选择+补全对话+补全短文+写作+阅读（8种） | 100 |
| **g6b_final** | 6下期末 | 同上（8种） | 100 |
| **g6a_midterm** | 6上期中 | 听力+拼写+语法+补全对话+句型转换+阅读（6种） | 100 |
| **g6b_midterm** | 6下期中 | 同上 + 写作（7种） | 100 |

> 上册≈6种（输入为主），下册≈7-8种（增加输出型题型）。原 `low_*`/`mid_*` 模板归档为 `[deprecated]`。

#### 执行步骤

| 步 | 内容 |
|---|---|
| E1 | 创建16套新模板 → `exam_templates.json` 新增 |
| E2 | 更新 `exam_config.json`：每个年级/学期/考试类型指向对应模板 |
| E3 | 每套模板总分校验（保证100分） |
| E4 | 每套模板 `sections[].points_per_question` 补全（修复当前全部=0的bug） |
| E5 | 铁律1双端：每个年级至少验证1套模板 → 等验收 |

---

### 51.7 铁律全面落地总结

| 铁律 | P6-A | P6-B | P6-C | P6-D | P6-E |
|---|---|---|---|---|---|
| 1 双端验证 | A8 | B5 | C5 | D最后 | E5 |
| 2 更新文档 | A8 | B5 | C5 | D最后 | E5 |
| 3 不擅自push | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 选项清单 | — | — | — | — | — |
| 6 落盘验证 | A2-A7 | B2-B4 | C1-C4 | D各步 | E1-E4 |
| 7 省token | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 数据安全 | A1+A2 | B1+B2 | C1 | D各步 | E1 |
| 9 version.txt | ✅ | ✅ | ✅ | ✅ | ✅ |

### 51.8 工时总览

| 阶段 | 工期 | 新增JSON | 修改JS | 新增模板 | 关键风险 |
|---|---|---|---|---|---|
| P6-A | ~2天 | 2 | 3 JS + 1 HTML | 0 | 无 |
| P6-B | ~1.5天 | 0(扩充) | 2 JS | 4(低年级) | 判分准确性 |
| P6-C | ~3天 | 1 | 2 JS + 1 CSS | 4(高年级) | 写作评分合理性 |
| P6-D | ~1天 | 2 | 2 JS | 1 | 匹配题交互复杂度 |
| P6-E | ~1天 | 0 | 0(改配置) | 16套 | 总分100分对齐 |
| **合计** | **~8.5天** | | | | |

> 📌 每步完成后暂停，等用户"验收通过请推送"。建议从 P6-A 补全对话开始。


## 52. ✅ P6 最终开发计划（代码核查修正版，2026-07-04）

> 📌 **本节为 P6 权威执行计划**，取代 §51。基于对 `exam.js`/`practice.js`/`questionBank.js` 的代码实况核查修正，避免重复造轮子。
> 📌 **铁律 5 决策记录**（2026-07-04 用户 4 问确认）：
> - Q1=A：P6-C 大幅简化——只补写作题库 + 模板引用，**复用现有 `_gradeWriting`**（省 2 天）
> - Q2=C：新题型（补全对话/匹配/补全短文）**全链路集成**——考试 + 练习 + 智能推题 + 错题本（工期翻倍）
> - Q3=A：**全做 16 套**学期独立模板（3-6 年级 × 上下 × 期中期末）
> - Q4=A：**先易后难**——P6-C 写作(快赢) → P6-E 模板 → P6-A 对话 → P6-B 转换 → P6-D 补齐

### 52.1 代码核查关键发现（修正 §51 的错误）

| # | §51 初稿假设 | 代码实况 | 修正 |
|---|---|---|---|
| 1 | P6-C「新增写作+评分」需 3 天 | `exam.js` **已完整实现** writing：textarea + `_gradeWriting()`（内容60%+语法20%+文笔20%）+ 范文对比 | **只补题库+模板引用，~1 天** |
| 2 | 新题型渲染需从零写 | `exam.js` **已有 6 种渲染函数**（listen_pic/judge/fill/blank_fill/sentence_order/spelling） | 补全对话/匹配/短文**复用同架构** |
| 3 | 只提考试模式 | 用户选 Q2=C **全链路** | 每个新题型 = 考试 + 练习 + 智能推题 + 错题本 |
| 4 | `points_per_question=0` 判为 bug | 需先诊断模板是用 `totalPoints` 还是逐项分配 | P6-E 第 1 步先诊断再修 |

### 52.2 执行顺序（Q4=A 先易后难）

```
① P6-C 写作      ② P6-E 模板       ③ P6-A 补全对话    ④ P6-B 句型转换   ⑤ P6-D 补齐
  ~1天 快赢         ~1天              ~3天 全链路          ~2.5天 全链路       ~2天 全链路
 (复用_gradeWriting) (16套独立模板)    (考+练+智+错)        (考+练+智+错)      (匹配/短文/连词)
                                                                        合计 ~9.5天
```

> 每阶段结束后**暂停等用户"验收通过请推送"**（铁律 3），验收前必给 `dev-open.sh` 双端 URL（铁律 1）。

---

### 52.3 ① P6-C · 书面表达（~1 天，简化版 · 5-6 年级）

**目标**：官考 5下/6上/6下含 10 分写作。**复用 `exam.js` 现有 `_gradeWriting` + textarea + 范文对比**，只补题库和模板引用。

| 步 | 内容 | 铁律6验证 | commit |
|---|---|---|---|
| C1 | 铁律8备份 + 基线 | `verify_qbank.py` | — |
| C2 | 创建 `data/questions/jk_writing.json`（16 篇真题主题，含 prompt/提示词/参考范文/关键词/字数要求） | `json.load` 校验 | `feat(writing):` |
| C3 | 核对 `exam.js` writing section 渲染 + `_gradeWriting` 是否读取新题库字段（如缺字段则适配） | 本地考试出现写作题 | `feat(writing):` |
| C4 | 5下/6上/6下模板加 `writing` 10分 section（此步与 P6-E 模板合并落地也可） | 模板总分=100 | `feat(writing):` |
| C5 | 铁律1双端验证 + 更新 §3 → **等用户验收** | `dev-open.sh` 双端 | 不push |

**16 篇写作主题**（广州各区真题，中国元素优先）：

| # | 主题 | 年级 | 字数 |
|---|---|---|---|
| 1-4 | 介绍名人（杨利伟/钟南山/袁隆平/我的偶像） | 5下/6下 | ≥40 |
| 5-8 | 旅行/计划（北京/广州/暑假计划/伦敦） | 5下/6下 | ≥40 |
| 9-12 | 动物保护/介绍中国/今昔变化/健康生活 | 6上/6下 | ≥40 |
| 13-16 | 我的理想学校/一封信/难忘的一天/环保 | 6上/6下 | ≥40 |

---

### 52.4 ② P6-E · 16 套学期独立模板 + 总分对齐（~1 天）

**目标**：现所有小学考试共用 `low_*`/`mid_*` 通用模板（仅 5 种题型），改为**每学期独立 16 套**，反映"上册输入→下册输出"递进。

| 步 | 内容 | 铁律 |
|---|---|---|
| E1 | **先诊断** `points_per_question=0` 是真 bug 还是 `totalPoints` 分配机制 | 铁律6 |
| E2 | 备份 `exam_templates.json` + `exam_config.json` | 铁律8 |
| E3 | 新增 16 套模板（见下矩阵），原 `low_*`/`mid_*` 标 `[deprecated]` 保留 | — |
| E4 | 更新 `exam_config.json`：每年级/学期/考试类型指向对应模板 | 铁律6 |
| E5 | 每套模板总分校验=100 + 逐项 `points_per_question` 补全 | `json.load`+断言 |
| E6 | 铁律1双端：每年级至少验证 1 套 → **等验收** | `dev-open.sh` |

**16 套模板矩阵**（上册≈6种输入 / 下册≈7-8种含输出）：

| 模板 | 适用 | 题型（种数） | 分 |
|---|---|---|---|
| g3a_midterm | 3上期中 | 听力+拼写+语法+连词成句+匹配+补全对话（6） | 100 |
| g3a_final | 3上期末 | +句型转换（7） | 100 |
| g3b_midterm | 3下期中 | 听力+拼写+语法+连词成句+匹配+补全对话（6） | 100 |
| g3b_final | 3下期末 | +句型转换（7） | 100 |
| g4a_midterm | 4上期中 | 听力+拼写+语法+连词成句+补全对话（5-6） | 100 |
| g4a_final | 4上期末 | +阅读（6） | 100 |
| g4b_midterm | 4下期中 | +句型转换（6） | 100 |
| g4b_final | 4下期末 | 听力+拼写+语法+连词成句+补全对话+句型转换+阅读（7） | 100 |
| g5a_midterm | 5上期中 | 听力+拼写+语法+补全对话+句型转换+阅读（6） | 100 |
| g5a_final | 5上期末 | +判断（7） | 100 |
| g5b_midterm | 5下期中 | 听力+拼写+语法+补全对话+句型转换+阅读（6） | 100 |
| g5b_final | 5下期末 | +🆕写作10分（7-8） | 100 |
| g6a_midterm | 6上期中 | 听力+拼写+语法+补全对话+句型转换+阅读（6） | 100 |
| g6a_final | 6上期末 | 听力+归类填词+选择+补全对话+补全短文+写作+阅读（8） | 100 |
| g6b_midterm | 6下期中 | +写作（7） | 100 |
| g6b_final | 6下期末 | 听力+归类+选择+补全对话+补全短文+写作+阅读（8） | 100 |

---

### 52.5 ③ P6-A · 补全对话（~3 天，全链路 · 3-6 年级）

**目标**：官考 3-6 年级均含 10 分补全对话。**全链路集成**（Q2=C）。

**题型设计**：5空对话 + 7候选句（含2干扰）→ 下拉/点选匹配 → 每空2分对位判分。

| 步 | 内容 | 链路 | commit |
|---|---|---|---|
| A1 | 铁律8备份 + 基线 | — | — |
| A2 | `data/questions/jk_dialog_complete.json`（3-6 年级，每册2套×5空≈40组） | 题库 | `feat(dialog):` |
| A3 | `data/questions/hj_dialog_complete.json`（7-9 年级，30组） | 题库 | `feat(dialog):` |
| A4 | `questionBank.js` types 加 `dialog_complete` + 加载 | 加载 | `feat(dialog):` |
| A5 | `js/exam.js` 复用 section 架构加 `_renderDialogCompleteHTML` + 判分 | **考试** | `feat(dialog):` |
| A6 | `js/practice.js` 加渲染 + `startPractice('dialog_complete')` 路由 | **练习** | `feat(dialog):` |
| A7 | `index.html` 练习页加补全对话徽章卡片 | **练习入口** | `feat(dialog):` |
| A8 | `startSmartPractice` 智能推题纳入 `dialog_complete` | **智能推题** | `feat(dialog):` |
| A9 | `wrongbook.js` 加 `dialog_complete` 类型标签 + 错题渲染 | **错题本** | `feat(dialog):` |
| A10 | `tests/smoke.py` 加回归用例 + 铁律1双端 + 更新§3 → **等验收** | 回归 | 不push |

---

### 52.6 ④ P6-B · 句型转换（~2.5 天，全链路 · 3-6 年级）

**目标**：官考 3-6 年级均含 10 分句型转换。扩充 `jk_sentence_transform.json`（1→50题）+ 全链路。

**判分（无AI）**：标准化(lower/strip/去多余空格) → 匹配可接受答案列表 → 全字匹配满分。

| 步 | 内容 | 链路 | commit |
|---|---|---|---|
| B1 | 备份 + 差异报告 | — | — |
| B2 | 扩充 `jk_sentence_transform.json` 至 50 题（3下→6下核心转换：单复数/时态/肯否/一般疑问/特殊疑问/there be 等） | 题库 | `feat(sent_trans):` |
| B3 | `js/exam.js` 加 `_renderSentenceTransformHTML` + input判分 | **考试** | `feat(sent_trans):` |
| B4 | `js/practice.js` 渲染 + 路由 + `index.html` 徽章 | **练习** | `feat(sent_trans):` |
| B5 | `startSmartPractice` + `wrongbook.js` 纳入 | **智能+错题** | `feat(sent_trans):` |
| B6 | `tests/smoke.py` + 铁律1双端 → **等验收** | 回归 | 不push |

---

### 52.7 ⑤ P6-D · 匹配题 + 补全短文 + 连词成句补齐（~2 天，全链路）

| 子项 | 内容 | 年级 | 链路 |
|---|---|---|---|
| **D1 匹配题** | `jk_matching.json`（30组问答/图文配对）+ 考试+练习+智能+错题 | 3 年级 | 全链路 |
| **D2 补全短文** | `jk_cloze_passage.json`（10篇选词填空型短文）+ 词池点选前端 + 全链路 | 6 年级 | 全链路 |
| **D3 连词成句补齐** | 扩充 `jk_sentence_order.json` 3-4 年级专项 + 3-4 年级模板加 `sentence_order` 10分 | 3-4 年级 | 复用现有渲染 |

> `sentence_order`/`blank_fill` 等渲染已在 `exam.js` 存在，D3 主要补题库+模板引用。

---

### 52.8 铁律全面落地矩阵

| 铁律 | P6-C | P6-E | P6-A | P6-B | P6-D |
|---|---|---|---|---|---|
| 1 双端验证 | C5 | E6 | A10 | B6 | D最后 |
| 2 更新文档 | C5 | E6 | A10 | B6 | D最后 |
| 3 不擅自push（每步等验收） | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5 选项清单 | ✅本节 | — | — | — | — |
| 6 落盘验证 | C2-C4 | E1/E5 | A2-A9 | B2-B5 | D各步 |
| 7 省token | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8 数据安全 | C1 | E2 | A1 | B1 | D各步 |
| 9 version.txt 不碰 | ✅ | ✅ | ✅ | ✅ | ✅ |

### 52.9 工时总览

| 阶段 | 工期 | 全链路 | 复用现有 | 关键风险 |
|---|---|---|---|---|
| ① P6-C 写作 | ~1天 | — | `_gradeWriting`+textarea+范文 | 题库字段与评分适配 |
| ② P6-E 模板 | ~1天 | — | — | 16套总分100对齐 + points bug 诊断 |
| ③ P6-A 对话 | ~3天 | 考+练+智+错 | section 渲染架构 | 全链路一致性 |
| ④ P6-B 转换 | ~2.5天 | 考+练+智+错 | input 判分 | 判分准确性 |
| ⑤ P6-D 补齐 | ~2天 | 考+练+智+错 | 部分渲染已存在 | 匹配题交互 |
| **合计** | **~9.5天** | | | |

> 📌 建议从 **① P6-C 写作（快赢）** 开始。每步完成后暂停等验收，绝不擅自 push（铁律 3）。


## 53. ✅ P6-C 写作 + P6-E 16套模板完成（2026-07-04，待验收/部分已上线）

### 53.1 P6-C 书面表达（已上线）

| 项 | 内容 |
|---|---|
| 题库 | `data/questions/jk_writing.json` 16篇（5下5+6上5+6下6），中国元素优先（杨利伟/钟南山/袁隆平/广州/介绍中国） |
| 评分 | **复用** `exam.js` 现有 `_gradeWriting`（内容60%+语法20%+文笔20%）+ textarea + 范文对比，零重写（Q1=A 省2天） |
| 题库化 | 仿 cloze，`exam.js` writing分支从 `qb.writing` 按年级/学期抽题，回退模板 prompts（7-9年级零回归）；`questionBank.js` 加 writing 类型加载 |
| 渲染增强 | 提示词 chip + 实时字数统计 + 动态词数要求 |

### 53.2 P6-E 16套学期独立模板

| 项 | 内容 |
|---|---|
| 模板 | `g{3-6}{a/b}_{midterm/final}` 共 16 套，**每套声明总分=100** |
| 递进 | 上册≈6种（输入偏重）/ 下册≈7-8种（增句型转换/写作等输出题型） |
| 写作接入 | g5b_final / g6a_midterm / g6a_final / g6b_midterm / g6b_final 含 writing 10分 |
| config | 3-6年级期中/期末重指向 16 套；unitTest 保留 low_unit/mid_unit；7-9年级 high_* 不变 |
| 旧模板 | low_*/mid_* 标 `[deprecated]` 保留兜底 |

### 53.3 关键工程决策

| 决策 | 说明 |
|---|---|
| **points=0 非真bug** | E1诊断：字段名是 `points`（非 `points_per_question`），exam.js 正确读取；之前对账脚本字段名写错导致误判 |
| **空题型section自动跳过** | exam.js line522 `if(sec.questions.length>0)push` —— 未实现题型(dialog/matching/cloze_passage)题库为空时section自动跳过，出卷不崩；P6-A/B/D补齐后自动出现，无需再改模板 |
| **当前可达分** | 各卷当前 60-90 分（跳过待补题型），P6-A/B/D 完成后达 100 |

### 53.4 铁律

- ✅ 8 数据安全：exam_templates/config 全量备份 + 差异报告
- ✅ 6 落盘：JSON合法校验 + 模拟出卷验证16套可解析零崩溃 + verify_qbank 0新增
- ✅ 1 双端验证：`dev-open.sh` 双端URL（P6-E 验收中）
- ✅ 9 version.txt 全程未碰
- ✅ 3 P6-E 未推送，等验收

> 本节 docs 收口，CI 不 bump。

---

## 54. ✅ T1-T4 · 6 套主题系统 + contextBar 下拉框修复（2026-07-04 ~ 07-05，已上线）

> 📌 主题系统跨 5 个 commit（T1→T4→hotfix），全部已 push 上线。

### 54.1 T1 · 根治白底 + 变量收敛（`9136216`）

| 项 | 内容 |
|---|---|
| 问题 | `styles.css` 原为 JS 动态注入，注入失败时全站 CSS 变量丢失 → 白底白字；`:root` 缺变量 `card/border/shadow/ink-1/bg-1/amber-50` 致 exam 页渲染异常 |
| 修复 | `styles.css` 改为 `<head>` 静态引入（`index.html`/`mobile.html`）；`:root` 补齐所有缺失变量；`body` 背景变量化 `--page-bg`；防 FOUC 预应用主题脚本 |
| 影响面 | `index.html`、`mobile.html`、`styles.css` |

### 54.2 T2 · 6 套主题变量定义（`d8870bd`）

| 主题 | `data-theme` | `--brand` | `--brand-strong` | `--surface` | 特色 |
|---|---|---|---|---|---|
| 晴空蓝(默认) | `:root` | `#3b82f6` | `#2563eb` | `#fff` | 蓝紫渐变品牌色 |
| 朱砂 | `vermilion` | `#e2483a` | `#c62f22` | `#fffaf7` | 橘红暖色调 |
| 青瓷 | `celadon` | `#0d9488` | `#0f766e` | `#f8fdfb` | 青绿冷色调 |
| 水墨黛 | `ink` | `#64748b` | `#475569` | `#26303f` | 深色模式 |
| 藏青 | `navy` | `#1e3a8a` | `#1e40af` | `#fbfcfe` | 稳重蓝金 |
| 胭脂 | `rouge` | `#db2777` | `#be185d` | `#fffafc` | 粉红温馨 |

每组变量含：品牌色系(`--brand/strong/stronger/-2/-ink/gradient/-50/-100/-150`)、状态色(`--accent/warn/success/danger + --ink`)、文字色(`--text-1~4`)、线条色(`--line-1~3`)、底面色(`--surface/card/border/bg-soft/bg-softer/bg-1`)、阴影色(`--shadow-*`)、页面背景(`--page-bg`)。

### 54.3 T3 · ThemeManager（`d5bac79`）

| 项 | 内容 |
|---|---|
| 文件 | `js/theme.js`（2.57 KB） |
| API | `list()` 返回全部主题；`get()` 获取当前；`set(id)` 切换主题（设置 `<html data-theme>`，`sunny` 移除属性回退 :root）；`apply()` 恢复持久化主题 |
| 持久化 | `localStorage` key `yxyy_theme_v1` |
| 事件 | `window.dispatchEvent('themechange', { theme: id })` |
| 加载链 | `index.html` 中 `theme.js` 在 `profile.js` 之后加载 |

### 54.4 T4 · 主题切换 UI + A+ 覆盖 Tailwind 固定色（`27c26ce`）

**UI**：个人中心面板加 6 色卡选择器（圆形 swatch，点击即换主题 + 高亮当前）

**A+ 覆盖**（`styles.css` 第 1803-1855 行）：Tailwind 编译的静态色类不跟随 `data-theme`，用 CSS 变量覆盖关键视觉面：
- `header.bg-white` → `var(--surface)`
- `.bg-white` 无渐变元素 → `var(--surface)`
- `.bg-blue-50/.bg-indigo-50` → `var(--brand-50)`（浅底色）
- `.text-blue-600/.text-blue-700` → `var(--brand-strong)`（品牌色字）
- `.text-slate-800/700/500/400` → `var(--text-1~4)`（中性文字）
- 深色渐变横幅（`from-blue-500` 等）→ `var(--brand-gradient)` + 白字

### 54.5 修复：contextBar 白字白底（`d2fd968`）

| 问题 | A+ 覆盖用了 `[class*="from-blue"]` 子串匹配，同时命中深色 `from-blue-500`（应处理）和浅色 `from-blue-50`（`#contextBar`，不该碰）→ 3 个 `<select>`（`text-blue-700`）被强制染白 + `bg-white→surface` 白底 → 白字白底 |
|---|---|
| 修复 | 3 处子串匹配收窄为显式深色调类列表（`.from-blue-400/500/600/700` 等）；新增 `#contextBar` 例外规则块（固定白底 select + 品牌色字 + 深灰标签），保证 6 主题（含水墨黛深色主题）全程可读 |
| 顺带修复 | 考试入口卡/阅读练习区/听力音频区等 `-50` 浅色调容器文字恢复正常 |

### 54.6 铁律（汇总）

| 铁律 | T1 | T2 | T3 | T4 | fix |
|---|---|---|---|---|---|
| ✅ 1 双端验证 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ✅ 2 更新文档 | — | — | — | — | ✅ 本§54 补录 |
| ✅ 6 落盘验证 | ✓ | ✓ | ✓ | ✓ | ✓ |
| ✅ 9 version.txt 不碰 | ✓ | ✓ | ✓ | ✓ | ✓ |

### 54.7 项目清理（2026-07-05）

| 清理项 | 说明 |
|---|---|
| `__v.txt` (177B) | 双语测试样本，0 引用 |
| `__pycache__/` × 3 (72KB) | Python 编译缓存（本地，未入库） |
| `audio/_tmp_jk_listen/` (72KB) | 听力临时分片（`gen_jk_listening.py` 运行时自动重建；误入库，顺带清理） |
| `audio/_sent/` (93MB) | 句级增量缓存（388 子目录，从未入库的本地缓存） |
| **回收** | **~93MB+** |
| ⚠️ 保留 `gen_sample_mp3.py` | 用户核查后保留（虽 listen_pic_01/02.mp3 产物已在，脚本留作日后重生成样例） |

> 本节 docs 收口，CI 不 bump。

