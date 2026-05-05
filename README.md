# 🎓 乐学英语 · English Tutor

> 面向小学一年级到初中三年级（1-9 年级）学生的英语辅导 Web 应用。  
> 🌐 在线体验：**https://lupeng0330.github.io/english-tutor/**

## ✨ 主要功能

- 📚 **课本学习**：1-9 年级同步教材，单词卡片（音标/例句），真人级 TTS 课文朗读
- 🎙️ **课文朗读**：预生成 MP3（Microsoft Edge Neural TTS，真人音质）
- ✏️ **练习测试**：4 大题型（单词拼写 / 听力选择 / 语法练习 / 阅读理解）
- 🎧 **男女声听力对话**：对话题中 W/M 自动区分女声/男声，更真实
- 🔀 **全局学习上下文**：顶部一键切换年级/学期/教材版本，所有模块联动
- 📝 **语法讲解**：核心语法点详解 + 即时练习
- 💬 **AI 英语对话**：口语陪练模拟（接入 LLM 后可真实对话）
- 📊 **学习报告**：图表展示学习时长、得分趋势
- 📱 **响应式设计**：完美适配手机 / 平板 / 电脑

## 🏗️ 项目结构

```
english-tutor/
├── index.html                         # 主页面
├── styles.css                         # 样式（含移动端深度适配）
├── app.js                             # 核心交互逻辑
├── questionBank.js                    # 题库加载器（异步拉取 data/questions/*.json）
│
├── data/                              # 📂 数据（JSON，可独立维护）
│   ├── textbooks/
│   │   ├── jk.json                    # 广州教科版教材（1-9 年级全学期）
│   │   ├── rj.json                    # 人教版（待补充）
│   │   └── wy.json                    # 外研版（待补充）
│   └── questions/
│       ├── jk_spelling.json           # 单词拼写题库
│       ├── jk_listening.json          # 听力题库
│       ├── jk_grammar.json            # 语法题库
│       └── jk_reading.json            # 阅读题库
│
├── audio/                             # 🎵 所有预生成的 MP3
│   ├── grade1_u1.mp3 ... grade9_u2.mp3   # 课文朗读
│   └── listening_*.mp3                # 听力题音频
│
├── gen_audio.py                       # 🎙️ 批量生成 MP3 脚本（Edge TTS）
│
├── scripts/                           # 🛠️ 工具脚本
│   ├── import_questions.py            # Excel 模板 → 题库 JSON
│   ├── make_template.py               # 生成 Excel 导入模板
│   ├── ai_generate_questions.py       # 基于课文自动生成题目
│   └── excel_templates/
│       └── 题库导入模板.xlsx
│
├── start-windows.bat / start-mac.command
└── README.md
```

## 🚀 快速启动

### 本地运行
```bash
# 进入项目目录
cd english-tutor

# Python 自带 HTTP 服务器
python3 -m http.server 8765

# 浏览器访问
# http://localhost:8765/
```

### Windows 一键启动
双击 `start-windows.bat`

### Mac 一键启动
双击 `start-mac.command`（首次需要 `chmod +x start-mac.command`）

## 📊 当前题库规模

| 类型 | 题数 | 年级跨度 |
|------|------|---------|
| 单词拼写 | **184 题** | 1-9 年级 |
| 听力选择 | **30 题** | 1-9 年级 |
| 语法练习 | **40+ 题** | 1-9 年级 |
| 阅读理解 | **54 题** | 3-9 年级 |
| **总计** | **308+ 题** | **1-9 年级全覆盖** |

教材覆盖：**广州教科版 1-9 年级 × 上下册 × 每册 2-3 单元 = 37 个单元**

## 🎨 数据扩展方式

### 方式一：手动编辑 JSON（最灵活）

直接编辑 `data/questions/jk_{type}.json`，按下面格式追加：

**单词拼写** (`jk_spelling.json`)
```json
{
  "grade": 5, "term": "上", "code": "5A_U1",
  "q": "科学家", "answer": "scientist", "hint": "s________",
  "difficulty": 2, "explain": "职业：科学家"
}
```

**听力选择** (`jk_listening.json`)
```json
{
  "grade": 3, "term": "上", "code": "3A_U1",
  "audioText": "W: Hello! M: Hi!",    // W:女声, M:男声
  "audioFile": "listening_01.mp3",    // 手动指定文件名
  "q": "What did they say?",
  "options": ["Hi", "Bye", "Hello"], "answer": 0,
  "difficulty": 1, "explain": "开场问候"
}
```

**语法** (`jk_grammar.json`) / **阅读** (`jk_reading.json`) 格式类似。

### 方式二：Excel 模板导入（推荐批量录入）

```bash
# 1) 生成 Excel 模板
python scripts/make_template.py
# → 生成 scripts/excel_templates/题库导入模板.xlsx

# 2) 按模板填空（4 个 sheet 对应 4 种题型）

# 3) 导入：
python scripts/import_questions.py "我的题库.xlsx"

# 4) 如果有新听力题，生成 MP3：
python gen_audio.py
```

### 方式三：AI 自动生成（基于课文）

```bash
# 基于 data/textbooks/jk.json 的课文，自动生成题目
python scripts/ai_generate_questions.py

# 限定年级：
python scripts/ai_generate_questions.py --grade 5
```

## 🎙️ 音频生成工作流

所有 TTS 音频都是**预先生成**的 MP3（存放在 `audio/` 目录），避免浏览器/网络 TTS 的各种兼容性问题。

```bash
# 一键生成所有新增的音频（已存在的会跳过）
python gen_audio.py

# 分篇 + 多角色（推荐）：教科版 grade6 下
python gen_audio_v2.py --grade grade6 --term 下

# 沪教牛津版 · 全册课文（每册 24 篇：Reading / Grammar focus / More reading）
python gen_audio_v2.py --textbook hj --grade grade7 --term 上    # → grade7A_u*_L*.mp3
python gen_audio_v2.py --textbook hj --grade grade7 --term 下    # → grade7B_u*_L*.mp3
python gen_audio_v2.py --textbook hj --grade grade8 --term 上    # → grade8A_u*_L*.mp3
python gen_audio_v2.py --textbook hj --grade grade8 --term 下    # → grade8B_u*_L*.mp3
python gen_audio_v2.py --textbook hj --grade grade9 --term 上    # → grade9A_u*_L*.mp3
python gen_audio_v2.py --textbook hj --grade grade9 --term 下    # → grade9B_u*_L*.mp3
# 合计 6 册 × 24 篇 = 144 个 mp3

# 沪教七上 32 道听力题（W/M 双人对话，自动男女声）
python gen_hj_listening.py
# → 生成 audio/hj_listening_g7_01.mp3 ~ audio/hj_listening_g7_32.mp3
```

**声音分配**：
- 课文（教科版 / 沪教版）：按说话人名字自动分配男女声池，同一角色音色稳定
- 沪教听力对话：`W:` 前缀 → Jenny 女声、`M:` 前缀 → Guy 男声
- 教科版听力：`W:` 前缀 Aria 女声、`M:` 前缀 Guy 男声

**依赖**：`pip install edge-tts`（无需 API Key）

## 🔀 全局学习上下文

顶部 sticky 的"上下文切换条"可以随时调整：
- **年级**：1-9 年级
- **学期**：上 / 下
- **教材版本**：广州教科版 / 人教版（待开发）/ 外研版（待开发）

切换时：
1. 课本模块自动刷新对应单元
2. 练习模块的题数徽章按当前学段实时更新
3. 状态保存到 `localStorage`，下次打开自动恢复

## 🛠 技术栈

- **前端**：HTML5 + Tailwind CSS + 原生 JavaScript (ES6+)
- **图表**：Chart.js
- **TTS**：Microsoft Edge Neural TTS（通过 Python 脚本预生成 MP3）
- **部署**：GitHub Pages（静态托管）
- **数据**：JSON（无数据库，Git 友好）

## 🎯 目标用户

- 小学 1-6 年级学生
- 初中 1-3 年级学生
- 家长辅助学习使用

## 📝 开发进度

- [x] UI 框架（6 大功能模块）
- [x] 1-9 年级教材数据（广州教科版全套）
- [x] 沪教牛津版初中全套（7-9 年级 × 上下册 × 8 单元 = 48 单元，每单元 15 词 + 3 篇课文）
- [x] 308+ 题真实题库
- [x] 预生成 MP3 音频（真人级 Neural TTS）
- [x] 男女声听力区分
- [x] 全局学习上下文切换 + localStorage 记忆
- [x] Excel 批量导入工具
- [x] 基于课文的 AI 自动生成题目
- [x] GitHub Pages 自动部署
- [ ] 人教版 / 外研版教材补充
- [ ] 真实 AI 语音评测（接入云端 ASR）
- [ ] AI 对话接入 LLM
- [ ] 多用户账号 + 学习数据持久化
- [ ] 智能推题（基于错题本）

## 🔧 开发协作

### 双端开发（PC + Mac）
```bash
# PC 开发完推送
git add . && git commit -m "..." && git push

# Mac 拉取
git pull

# Mac 首次克隆
git clone git@github.com:lupeng0330/english-tutor.git
```

### SSH Key 配置
```bash
# 如果还没配置 SSH Key（首次）
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub
# 把公钥贴到 https://github.com/settings/keys
```

## 📄 License

MIT
