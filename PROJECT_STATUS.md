# 🎓 乐学英语（English Tutor）· 项目交接状态

> 这份文档给"另一端的你 / AI 助手"看的，目的是**无缝接上当前进度**。  
> 最后更新：2026-05-04（PC 端生成）  
> 对应 Git HEAD：`14e061f`

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

## 3. 当前规模（2026-05-05 核查）

| 类别 | 数量 |
|---|---|
| **教材单元（教科版 jk）** | **83** 个（1-5 年级每年级 10 单元、6 年级 9 单元、7-9 年级每年级 8 单元） |
| **教材单元（沪教版 hj）** | **48** 个（7-9 年级 × 上下册 × 8 单元；每单元 15 词 + 3 篇课文 Reading / Grammar focus / More reading） |
| **题库（单词拼写）** | 184 题 |
| **题库（听力选择）** | 31 题（教科版 31 + 沪教 g7 32，实际 g7 暂未纳入 jk 题库计数） |
| **题库（语法）** | 42 题 |
| **题库（阅读）** | 54 题 |
| **题库合计** | 311 题（jk）+ 32 题（沪教 g7 听力） |
| **音频 MP3** | 300+ 个（教科版课文 42 + 教科版听力 31 + 沪教听力 32 + 沪教课文 144） |

教材版本占位：`rj`（人教）、`wy`（外研）尚未填充数据。

---

## 4. 目录与关键文件

```
english-tutor/
├── index.html              # 主页面。顶部 sticky「学习上下文条」（年级/学期/教材）
├── styles.css              # 含移动端深度适配
├── app.js                  # ★ 核心逻辑：state/上下文切换/渲染/播放/练习
├── questionBank.js         # ★ 题库异步加载器 window.loadQuestionBank(textbookId)
│
├── data/
│   ├── textbooks/
│   │   └── jk.json         # 结构: { meta, grades: { grade1: { 上:[...], 下:[...] } } }
│   └── questions/
│       ├── jk_spelling.json   # 单词拼写
│       ├── jk_listening.json  # 听力（含 audioFile 字段指向 audio/*.mp3）
│       ├── jk_grammar.json    # 语法
│       └── jk_reading.json    # 阅读
│
├── audio/                  # 预生成 MP3
│   ├── grade{N}_u{M}.mp3   # 课文朗读（Aria 女声）
│   └── listening_XX.mp3    # 听力题（W=Aria 女 / M=Guy 男）
│
├── gen_audio.py            # 读 JSON 批量生成缺失 MP3（edge-tts）
│
├── scripts/
│   ├── make_template.py         # 生成 Excel 导入模板
│   ├── import_questions.py      # Excel → JSON 题库
│   ├── ai_generate_questions.py # 基于课文自动造题
│   ├── expand_textbook.py       # 扩展教材单元
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
14e061f 2026-05-04 feat(spelling): 字母格子填空+手机发音修复+UI优化          [Mac]
fd4fc1d 2026-05-04 fix(spelling): 单词拼写题增加英文输入UI                   [Mac]
ea5f85c 2026-05-04 feat(practice): 答题中切换年级/学期无缝刷新题目             [PC]
c67c4da 2026-05-03 feat: 切换年级重置练习+单元左右滑+每年级扩4-5单元(+22 MP3) [PC]
0ae229e 2026-05-03 feat: 重构数据架构 + 308 题 + 1-9 年级全覆盖 + 导入工具    [PC]
da1fccc 2026-05-03 feat(arch): 全局学习上下文切换（localStorage 记忆）        [PC]
e40b4d9 2026-05-03 feat(listening): 听力题男女声区分（W→Aria / M→Guy）        [PC]
942a7bc 2026-05-03 fix(listening): 每题直接写死 audioFile                    [PC]
1870b5f 2026-05-03 feat(listening): 预生成 10 道听力题 MP3                   [PC]
4bf5082 2026-05-03 feat(voice): 预生成 13 篇课文 MP3（Edge Neural TTS）      [PC]
be6734f 2026-05-03 fix(voice): 链式手动触发 utterance + 时间数字转英文单词    [PC]
1e7cff1 2026-05-03 fix(voice): 防重复朗读（全局锁）+ 挑高质量 TTS 语音        [PC]
e5c7764 2026-05-03 fix(voice): 按句拆分多 utterance + keepAlive               [PC]
... (更早的 voice 调试若干次)
a4f0da4 2026-05-03 Initial commit                                            [PC]
```

## 8. 已知 TODO / 下一步

- [ ] 人教版 `rj.json`、外研版 `wy.json` 教材数据补充。
- [ ] AI 对话模块真正接入 LLM（目前是模拟）。
- [ ] 真实 AI 语音评测（云端 ASR）。
- [ ] 多用户账号 + 学习数据云端持久化。
- [ ] 错题本 + 智能推题。
- [ ] （可选）把 `data/` 拆分为按年级分片，加速首屏。

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

_此文档由 PC 端 AI 助手在 2026-05-04 生成，用于 Mac 端 / 未来任意端无缝接续。修改本文件后请务必 `git push`，让对端下次 pull 时看到最新状态。_
