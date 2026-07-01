# 阶段 2：16 种新题型基础设施

> 状态：⏳ 设计中（2026-06-30 晚）
> 预估：~30h，拆 6-8 次会话
> 触发：用户确认阶段 1 完成，选「阶段 2：16 种新题型」

---

## 1. 16 种题型清单

| # | 题型名 | type 键 | 类别 | 状态 |
|---|---|---|---|---|
| 1 | 单词拼写 | `spelling` | 已有 | ✅ |
| 2 | 听力理解 | `listening` | 已有 | ✅ |
| 3 | 语法选择 | `grammar` | 已有 | ✅ |
| 4 | 完形填空 | `cloze` | 已有 | ✅ |
| 5 | 阅读理解 | `reading` | 已有 | ✅ |
| 6 | 书面表达 | `writing` | 已有 | ✅ |
| 7 | **听音选图** | `listen_pic` | 听力子类 | 🆕 |
| 8 | **听音判断** | `listen_judge` | 听力子类 | 🆕 |
| 9 | **听音填空** | `listen_fill` | 听力子类 | 🆕 |
| 10 | **选词填空** | `blank_fill` | 完形子类 | 🆕 |
| 11 | **句型转换** | `sentence_transform` | 语法子类 | 🆕 |
| 12 | **连词成句** | `sentence_order` | 语法子类 | 🆕 |
| 13 | **看图写词** | `picture_word` | 词汇类 | 🆕 |
| 14 | **情景对话** | `dialogue` | 口语类 | 🆕 |
| 15 | **翻译** | `translation` | 综合类 | 🆕 |
| 16 | **语音辨析** | `phonetic` | 语音类 | 🆕 |
| 17 | **词汇匹配** | `match` | 词汇类 | 🆕 |
| 18 | **短文改错** | `proofreading` | 阅读子类 | 🆕 |
| 19 | **信息提取** | `info_extract` | 阅读子类 | 🆕 |
| 20 | **看图说话** | `picture_talk` | 口语类 | 🆕 |
| 21 | **开放回答** | `open_answer` | 综合类 | 🆕 |

> 注：实际 21 种（含 6 种已有）。`listen_*` 统一挂在听力大类下，`sentence_*` / `blank_fill` 挂在语法/完形下。

---

## 2. 题库 JSON schema 设计

### 2.1 通用字段（所有题型）

```json
{
  "grade": 3,           // 年级 1-9
  "term": "上",          // 上/下
  "code": "3A_U2",     // 单元归属
  "difficulty": 2,      // 1-5
  "type": "listen_pic"   // 题型键
}
```

### 2.2 各题型专属字段

#### `listen_pic`（听音选图）
```json
{
  "audioText": "M: It's sunny today.",
  "audioFile": "listen_pic_01.mp3",
  "images": ["sunny.png", "rainy.png", "cloudy.png"],
  "answer": 0,
  "explain": "音频说 sunny，对应图1"
}
```

#### `listen_judge`（听音判断）
```json
{
  "audioText": "W: I have 3 books.",
  "audioFile": "listen_judge_01.mp3",
  "statement": "The girl has 3 books.",
  "answer": true,
  "explain": "音频明确说 3 books"
}
```

#### `listen_fill`（听音填空）
```json
{
  "audioText": "M: My favourite colour is ____.",
  "audioFile": "listen_fill_01.mp3",
  "blank": "blue",
  "options": ["blue", "red", "green"],
  "answer": 0,
  "explain": "音频说 favourite colour is blue"
}
```

#### `blank_fill`（选词填空）
```json
{
  "passage": "I have a ____. It is ____.",
  "blanks": [{"answer": "dog", "options": ["dog", "cat", "bird"]}],
  "explain": "上下文描述宠物"
}
```

#### `sentence_transform`（句型转换）
```json
{
  "original": "I am a student.",
  "target": "否定句",
  "answer": "I am not a student.",
  "explain": "be 动词后加 not"
}
```

#### `sentence_order`（连词成句）
```json
{
  "words": ["is", "This", "apple", "an"],
  "answer": "This is an apple.",
  "explain": "陈述句语序：主+谓+宾"
}
```

#### `picture_word`（看图写词）
```json
{
  "image": "apple.png",
  "hint": "水果",
  "answer": "apple",
  "explain": "图片显示苹果"
}
```

#### `dialogue`（情景对话）
```json
{
  "context": "在商店买东西",
  "question": "Can I help you?",
  "options": ["Yes, I want a pen.", "I'm fine.", "See you."],
  "answer": 0,
  "explain": "商店场景，店员问候，顾客回应需求"
}
```

#### `translation`（翻译）
```json
{
  "from": "zh",
  "to": "en",
  "text": "我有一只猫。",
  "answer": "I have a cat.",
  "explain": "have 表示拥有"
}
```

#### `phonetic`（语音辨析）
```json
{
  "words": ["cat", "cake", "city"],
  "phoneme": "/k/",
  "answer": 0,
  "explain": "cat 中 c 发 /k/，cake 中 c 发 /k/ 但..."
}
```

#### `match`（词汇匹配）
```json
{
  "left": ["apple", "dog", "red"],
  "right": ["苹果", "狗", "红色"],
  "pairs": [[0,0], [1,1], [2,2]],
  "explain": "词义匹配"
}
```

#### `proofreading`（短文改错）
```json
{
  "passage": "I is a student.",
  "errors": [{"pos": 2, "wrong": "is", "right": "am"}],
  "explain": "I 后用 am"
}
```

#### `info_extract`（信息提取）
```json
{
  "passage": "My name is Tom. I'm 10 years old.",
  "questions": [
    {"q": "How old is Tom?", "answer": "10", "explain": "文中说 10 years old"}
  ]
}
```

#### `picture_talk`（看图说话）
```json
{
  "image": "park.png",
  "prompt": "描述图片内容",
  "modelAnswer": "There are many people in the park...",
  "keyPoints": ["people", "activity", "weather"]
}
```

#### `open_answer`（开放回答）
```json
{
  "q": "What is your favourite animal? Why?",
  "modelAnswer": "My favourite animal is the panda because it is cute.",
  "scoringRubric": {"content": 3, "language": 2}
}
```

---

## 3. 文件结构

```
data/questions/
├── jk_spelling.json      ✅ 已有
├── jk_grammar.json       ✅ 已有
├── jk_listening.json     ✅ 已有
├── jk_reading.json      ✅ 已有
├── jk_cloze.json        ✅ 已有
├── jk_writing.json       🆕 写作题库
├── jk_listen_pic.json    🆕 听音选图
├── jk_listen_judge.json 🆕 听音判断
├── jk_listen_fill.json  🆕 听音填空
├── jk_blank_fill.json   🆕 选词填空
├── jk_sentence_tf.json  🆕 句型转换
├── jk_sentence_order.json 🆕 连词成句
├── jk_picture_word.json 🆕 看图写词
├── jk_dialogue.json     🆕 情景对话
├── jk_translation.json  🆕 翻译
├── jk_phonetic.json     🆕 语音辨析
├── jk_match.json        🆕 词汇匹配
├── jk_proofreading.json 🆕 短文改错
├── jk_info_extract.json 🆕 信息提取
└── jk_picture_talk.json 🆕 看图说话
```

---

## 4. 实施批次

### 批次 1：基础设施 + 3 种听力子类（~4h）
- [ ] `exam_config.json` 扩展 `typeLabels` / `typeIcons` / `typeOrder`
- [ ] `questionBank.js` 支持新题型加载
- [ ] `listen_pic` / `listen_judge` / `listen_fill` schema + 题库文件
- [ ] `exam.js` 抽题 + 渲染 + 评分
- [ ] 双端验证

### 批次 2：语法子类（~4h）
- [ ] `blank_fill` / `sentence_transform` / `sentence_order` schema
- [ ] 题库文件 + 前端渲染

### 批次 3：词汇类（~3h）
- [ ] `picture_word` / `match` / `phonetic` schema
- [ ] 前端渲染

### 批次 4：阅读子类（~3h）
- [ ] `proofreading` / `info_extract` schema

### 批次 5：口语/综合类（~4h）
- [ ] `dialogue` / `translation` / `picture_talk` / `open_answer`
- [ ] 写作题库 `jk_writing.json`

### 批次 6：题库内容填充（~10h）
- [ ] 为 jk 3-6 年级每册填充新题型题目
- [ ] 生成所需 MP3（听力类）

### 批次 7：练习页支持（~2h）
- [ ] `practice.js` 支持新题型练习

---

## 5. 决策项（待确认）

| # | 决策项 | 选项 |
|---|---|---|
| Q1 | 批次顺序 | A：按上表顺序 B：先做听力子类（最常用） C：用户指定 |
| Q2 | 图片存储 | A：用 emoji/Unicode 字符代替图片（零存储） B：用 SVG 内联 C：用外部 PNG |
| Q3 | 第一批做哪几种 | A：3 种听力子类 B：6 种（听力+语法） C：用户指定 |

