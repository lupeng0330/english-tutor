# -*- coding: utf-8 -*-
"""
validate_questions.py — 一次性题库校验脚本（纯标准库，无第三方依赖）

校验沪教版 (hj) 语法 / 阅读题库 JSON 的合法性：
  - JSON 可解析、为数组
  - 必填字段完整（语法/阅读各自字段序）
  - options 为数组且数量达标（默认 >=2）
  - answer 为整数且落在 options 下标范围内
  - code 形如 7A_U1 / 8B_U3 / 9B_U8（与 practice.js 的 /_U(\\d+)/i 兼容）
  - grade / term 与 code 自洽（code 首位=年级，A=上、B=下）
  - 单元覆盖统计：每个 code 的题量，并对照期望值给出报告

用法：
    python scripts/validate_questions.py
退出码：全部通过返回 0，任何 ERROR 返回 1（便于 CI / smoke 前置）。
"""

import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Q_DIR = os.path.join(ROOT, "data", "questions")

GRAMMAR_FILE = os.path.join(Q_DIR, "hj_grammar.json")
READING_FILE = os.path.join(Q_DIR, "hj_reading.json")

CODE_RE = re.compile(r"^([789])([AB])_U(\d+)$")

# 期望每单元题量（对齐 7A 风格）
EXPECT_PER_UNIT = {"grammar": 10, "reading": 6}

# 期望覆盖的 40 个新单元 + 原有 7A 共 48 单元
TERMS = {"A": "上", "B": "下"}
GRADES = ["7", "8", "9"]
EXPECT_CODES = []
for g in GRADES:
    for t in ("A", "B"):
        for u in range(1, 9):
            EXPECT_CODES.append("{}{}_U{}".format(g, t, u))


def _load(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _check_item(kind, idx, item, errors):
    base = ["grade", "term", "code", "q", "options", "answer", "explain", "difficulty"]
    required = base[:]
    if kind == "reading":
        required = ["grade", "term", "code", "passage", "q", "options", "answer", "explain", "difficulty"]

    where = "{}[{}]".format(kind, idx)

    if not isinstance(item, dict):
        errors.append("{}: 不是对象".format(where))
        return None

    for field in required:
        if field not in item:
            errors.append("{}: 缺少字段 '{}'".format(where, field))

    code = item.get("code", "")
    m = CODE_RE.match(str(code))
    if not m:
        errors.append("{}: code 格式非法 '{}'".format(where, code))
    else:
        g, t, _u = m.group(1), m.group(2), m.group(3)
        grade = item.get("grade")
        if grade != int(g):
            errors.append("{}: grade({}) 与 code({}) 不一致".format(where, grade, code))
        term = item.get("term")
        if term != TERMS[t]:
            errors.append("{}: term('{}') 与 code({}) 不一致，应为 '{}'".format(where, term, code, TERMS[t]))

    options = item.get("options")
    if not isinstance(options, list):
        errors.append("{}: options 不是数组".format(where))
    else:
        if len(options) < 2:
            errors.append("{}: options 数量不足({})".format(where, len(options)))
        answer = item.get("answer")
        if not isinstance(answer, int) or isinstance(answer, bool):
            errors.append("{}: answer 不是整数 '{}'".format(where, answer))
        elif answer < 0 or answer >= len(options):
            errors.append("{}: answer 下标越界({} / {})".format(where, answer, len(options)))

    diff = item.get("difficulty")
    if diff not in (1, 2, 3):
        errors.append("{}: difficulty 应为 1/2/3，实际 '{}'".format(where, diff))

    q = item.get("q", "")
    if not isinstance(q, str) or not q.strip():
        errors.append("{}: q 为空".format(where))

    if kind == "reading":
        passage = item.get("passage", "")
        if not isinstance(passage, str) or not passage.strip():
            errors.append("{}: passage 为空".format(where))

    return str(code)


def _validate_file(kind, path, errors):
    if not os.path.exists(path):
        errors.append("{}: 文件不存在 {}".format(kind, path))
        return {}
    try:
        data = _load(path)
    except Exception as e:  # noqa
        errors.append("{}: JSON 解析失败 {}".format(kind, e))
        return {}
    if not isinstance(data, list):
        errors.append("{}: 顶层不是数组".format(kind))
        return {}

    counts = {}
    for i, item in enumerate(data):
        code = _check_item(kind, i, item, errors)
        if code:
            counts[code] = counts.get(code, 0) + 1
    return counts


def _report_coverage(kind, counts, warnings):
    expect = EXPECT_PER_UNIT[kind]
    print("\n[{}] 已覆盖 {} 单元，总计 {} 题".format(kind, len(counts), sum(counts.values())))
    missing = [c for c in EXPECT_CODES if c not in counts]
    if missing:
        warnings.append("[{}] 未覆盖单元({}): {}".format(kind, len(missing), ", ".join(missing)))
    off = []
    for c in EXPECT_CODES:
        n = counts.get(c, 0)
        if n and n != expect:
            off.append("{}={}".format(c, n))
    if off:
        warnings.append("[{}] 单元题量与期望({})不符: {}".format(kind, expect, ", ".join(off)))


def main():
    errors = []
    warnings = []

    g_counts = _validate_file("grammar", GRAMMAR_FILE, errors)
    r_counts = _validate_file("reading", READING_FILE, errors)

    _report_coverage("grammar", g_counts, warnings)
    _report_coverage("reading", r_counts, warnings)

    print("\n================ 校验结果 ================")
    if warnings:
        print("WARNING ({}):".format(len(warnings)))
        for w in warnings:
            print("  - " + w)
    if errors:
        print("ERROR ({}):".format(len(errors)))
        for e in errors[:200]:
            print("  - " + e)
        print("\n[FAIL] 题库校验未通过。")
        return 1
    print("[PASS] 题库结构校验通过（0 error，{} warning）。".format(len(warnings)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
