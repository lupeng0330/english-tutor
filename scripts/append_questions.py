# -*- coding: utf-8 -*-
"""
append_questions.py — 把一批手工精造的题目「文本追加」进现有题库 JSON。

特点：
  - 只重写文件结尾的 ']'，旧题字节完全不动（可回滚、防回归）。
  - 按 code 去重：若某 code 已存在于目标文件，则跳过该批次中相同 code 的题，避免重复追加。
  - 自动从 code 推断 grade / term，并补 source 标签（默认 ai_v01_12）。
  - 追加项格式与现有 7A 题完全一致（2 空格缩进，ensure_ascii=False）。

用法：
    python scripts/append_questions.py <grammar|reading> <batch.json> [source]

batch.json 为数组，每项至少包含：code, q, options, answer, explain, difficulty
（reading 还需 passage）。grade/term/source 会自动补齐。
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q_DIR = os.path.join(ROOT, "data", "questions")
CODE_RE = re.compile(r"^([789])([AB])_U(\d+)$")
TERMS = {"A": "上", "B": "下"}

FIELD_ORDER = {
    "grammar": ["grade", "term", "code", "q", "options", "answer", "explain", "difficulty", "source"],
    "reading": ["grade", "term", "code", "passage", "q", "options", "answer", "explain", "difficulty", "source"],
}


def _target(kind):
    return os.path.join(Q_DIR, "hj_{}.json".format(kind))


def _existing_codes(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return {it.get("code") for it in data}, len(data)


def _build(kind, raw, source):
    m = CODE_RE.match(str(raw["code"]))
    if not m:
        raise ValueError("非法 code: {}".format(raw.get("code")))
    grade = int(m.group(1))
    term = TERMS[m.group(2)]
    item = {
        "grade": grade,
        "term": term,
        "code": raw["code"],
    }
    if kind == "reading":
        item["passage"] = raw["passage"]
    item["q"] = raw["q"]
    item["options"] = raw["options"]
    item["answer"] = raw["answer"]
    item["explain"] = raw["explain"]
    item["difficulty"] = raw["difficulty"]
    item["source"] = source
    # 按既定字段序输出
    return {k: item[k] for k in FIELD_ORDER[kind] if k in item}


def main():
    if len(sys.argv) < 3:
        print("用法: python scripts/append_questions.py <grammar|reading> <batch.json> [source]")
        return 2
    kind = sys.argv[1]
    batch_path = sys.argv[2]
    source = sys.argv[3] if len(sys.argv) > 3 else "ai_v01_12"
    if kind not in ("grammar", "reading"):
        print("kind 必须为 grammar 或 reading")
        return 2

    target = _target(kind)
    existing, old_n = _existing_codes(target)

    with open(batch_path, "r", encoding="utf-8") as f:
        raw_items = json.load(f)

    new_items = []
    skipped = 0
    for raw in raw_items:
        if raw.get("code") in existing:
            skipped += 1
            continue
        new_items.append(_build(kind, raw, source))

    if not new_items:
        print("[{}] 无新增（{} 条因 code 已存在被跳过）。".format(kind, skipped))
        return 0

    # 文本追加：仅重写结尾的 ]
    with open(target, "r", encoding="utf-8") as f:
        text = f.read().rstrip()
    assert text.endswith("]"), "目标文件结尾异常"
    text = text[:-1].rstrip()  # 去掉最后的 ]

    blocks = []
    for it in new_items:
        dumped = json.dumps(it, ensure_ascii=False, indent=2)
        indented = "\n".join("  " + line for line in dumped.split("\n"))
        blocks.append(indented)

    new_text = text + ",\n" + ",\n".join(blocks) + "\n]\n"
    with open(target, "w", encoding="utf-8") as f:
        f.write(new_text)

    print("[{}] 追加 {} 条，跳过 {} 条；总计 {} -> {} 条。".format(
        kind, len(new_items), skipped, old_n, old_n + len(new_items)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
