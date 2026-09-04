# scripts/ 工具脚本说明

> 本目录存放开发和内容维护过程中使用的工具脚本。大部分为一次性脚本，执行完即自动删除，仅保留本 README 说明文档。

---

## 目录结构

| 文件 | 用途 |
|---|---|
| `gen_audio_v2.py` | **音频生成**（多角色朗读）。输入课文列表 → 调用 TTS API → 输出 MP3，支持角色分配 |
| `gen_audio.py` | 旧版音频生成脚本（功能子集，建议弃用） |
| `*.xlsx` | 音频脚本源文件（Excel 格式），记录课文文本与角色分配 |
| `audio/` | MP3 文件输出目录，`*.mp3` 按 `grade{N}A_U{nn}_{lesson}.mp3` 命名 |

---

## 使用方式

### 音频生成

```powershell
# 生成指定年级/学期的课文音频
python scripts/gen_audio_v2.py --grade 6 --term 下 --textbook hj

# 或直接修改脚本顶部参数后执行
python scripts/gen_audio_v2.py
```

**输出命名规则**（gen_audio_v2.py 内部约定）：

| 文件 | 命名规则 |
|---|---|
| 课文朗读 | `grade{N}A_U{nn}_{lesson}.mp3`（A=上册，B=下册） |
| 听力音频 | `hj_listening_g7_{nn}.mp3`（题库听力） |

---

## 文件命名规范

- **教材前缀**：`jk`（广州教科版）/ `hj`（广州沪教版）/ `gzk`（广州口语）
- **年级/学期**：`grade{N}` + `A`（上）/ `B`（下）
- **内容类型**：`words`（单词）/ `exercises`（阅读理解）/ `questions/`（题库）

### 示例

```
data/
├── textbooks/
│   ├── jk.json          # 广州教科版教材（含 grade 1-9）
│   ├── hj.json          # 广州沪教版教材（仅 grade 7-9）
│   └── ...
├── examples/
│   ├── jk_grade6_xia.json    # 六下单词例句
│   ├── hj_grade7_shang.json  # 七上单词例句
│   └── ...
├── extras/
│   ├── jk_grade6_xia_exercises.json   # 六下课文阅读理解
│   ├── hj_grade7_shang_exercises.json # 七上课文阅读理解
│   └── ...
└── questions/
    ├── jk_spelling.json    # 广州教科版·拼写题
    ├── hj_spelling.json    # 广州沪教版·拼写题
    ├── hj_grammar.json     # 广州沪教版·语法题
    ├── hj_reading.json     # 广州沪教版·阅读理解
    ├── hj_listening.json   # 广州沪教版·听力
    └── ...
```

---

## 部署相关

- `version.txt`：存放当前线上版本号（格式 `YYYYMMDDVBB.SS`）。本地 `dev-push.ps1` 推送时会自动更新
- `.github/workflows/update-version.yml`：GitHub Action，push 到 main 时自动计算新版本、写入 `version.txt` 并提交
- `dev-push.ps1`：本地一键推送脚本（PowerShell），等价于手动：
  1. `git add . && git commit`
  2. `git push`
  3. 更新 `version.txt` → 再 commit → 再 push

---

## 题库结构（各 `data/questions/*.json` 字段说明）

每道题至少包含以下字段：

```js
{
  "code": "7A_U1",          // 单元码：年级(1位) + 学期(A/B) + _U + 单元号
  "unit": "Unit 1",         // 单元名称（与教材保持一致）
  "type": "spelling",       // 题型
  "q": "题目题干",
  "a": "答案",
  "grade": 7,               // 年级数字（前端 filter 用）
  "term": "上",             // 学期
  // 根据题型不同，可能还有：
  "options": ["A","B","C","D"],     // 选择题选项
  "passage": "...",                  // 阅读理解短文
  "audioText": "...",                // 听力原文
  "audioFile": "xxx.mp3",            // 音频文件路径（暂无则走 TTS 兜底）
  "level": "easy/medium/hard"        // 难度（可选）
}
```

---

## 添加新内容的标准流程

1. **补充教材** → 编辑 `data/textbooks/{id}.json`
   - 按 `{ word, phonetic, meaning }` 添加单词
   - 按 `lessons[]` 添加课文（`title`/`text`/`translation`）

2. **生成例句** → 创建/编辑 `data/examples/{id}_grade{N}_{term}.json`
   - 三级难度（level 1/2/3）
   - key = 单词原文

3. **生成阅读理解** → 创建/编辑 `data/extras/{id}_grade{N}_{term}_exercises.json`
   - 每 lesson 至少 1 组 `reading_qa` + 1 组 `choice_qa`
   - `title` 须与 lesson.title 做子串匹配

4. **生成题库** → 创建 `data/questions/{id}_{type}.json`
   - 参考已有文件的 schema
   - code 格式：`{grade}A_U{nn}`（A=上册）

5. **生成音频** → 使用 `gen_audio_v2.py` 生成 MP3 → 放入 `audio/` 目录

6. **推送上线** → 执行 `.\dev-push.ps1 "更新说明"`
