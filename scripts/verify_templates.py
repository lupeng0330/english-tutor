# -*- coding: utf-8 -*-
"""
模板解析 smoke test —— 模拟前端 _applyTemplate() 行为，校验所有 14 个 grade/term
组合展开后 sections 完整性、题量、分值、加总。

等价前端逻辑：
  out = Object.assign({}, tpl, node);
  out.sections = (tpl.sections || []).map(s => Object.assign({}, s));
  if (node.writing) { for sec in out.sections: if sec.type=='writing': inject prompts/modelAnswers }
  delete out.template; delete out.writing;
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXAM_DIR = os.path.join(ROOT, "data", "exams")

with open(os.path.join(EXAM_DIR, "exam_config.json"), "r", encoding="utf-8") as f:
    cfg = json.load(f)
with open(os.path.join(EXAM_DIR, "exam_templates.json"), "r", encoding="utf-8") as f:
    tpl_lib = json.load(f)

assert cfg["version"] == 3, "exam_config.json 应为 v3，当前 v" + str(cfg.get("version"))
assert tpl_lib["version"] == 1, "exam_templates.json 应为 v1"


def apply_template(node):
    """等价前端 _applyTemplate()"""
    if not node or not isinstance(node, dict):
        return node
    if not node.get("template") or not tpl_lib.get("templates"):
        return node
    tpl = tpl_lib["templates"].get(node["template"])
    if not tpl:
        print(f"  ! 模板缺失: {node['template']}")
        return node
    out = dict(tpl)  # 浅拷贝模板
    out.update(node)  # node 覆盖
    out["sections"] = [dict(s) for s in tpl.get("sections", [])]
    if isinstance(node.get("writing"), dict):
        for sec in out["sections"]:
            if sec.get("type") == "writing":
                if "prompts" in node["writing"]:
                    sec["prompts"] = node["writing"]["prompts"]
                if "modelAnswers" in node["writing"]:
                    sec["modelAnswers"] = node["writing"]["modelAnswers"]
    out.pop("template", None)
    out.pop("writing", None)
    return out


def verify_one(grade, term, key, expected_total, expected_auto=None, expect_writing=False, expect_name=None):
    """校验单个试卷定义"""
    node = cfg["grades"][str(grade)][term].get(key)
    if not node:
        return f"[FAIL] {grade}{term} {key}: 配置缺失"
    resolved = apply_template(node)
    sections = resolved.get("sections", [])

    # 1. sections 完整性
    if not sections:
        return f"[FAIL] {grade}{term} {key}: sections 为空"

    # 2. 题量 + 分值汇总
    total = 0
    auto = 0
    writing = 0
    sec_summary = []
    for sec in sections:
        n = sec.get("count", 0)
        p = sec.get("points", 0)
        sub = n * p
        total += sub
        if sec.get("type") == "writing":
            writing += sub
        else:
            auto += sub
        sec_summary.append(f"{sec.get('type')}({n}×{p})")

    # 3. 期望分值校验
    total = round(total, 1)
    auto = round(auto, 1)
    writing = round(writing, 1)
    errs = []
    if abs(total - expected_total) > 0.1:
        errs.append(f"总分 {total}≠{expected_total}")
    if expected_auto is not None and abs(auto - expected_auto) > 0.1:
        errs.append(f"自动 {auto}≠{expected_auto}")
    if expect_writing and abs(writing - 30) > 0.1:
        errs.append(f"写作 {writing}≠30")
    if expect_writing:
        # writing section 需有 prompts
        for sec in sections:
            if sec.get("type") == "writing":
                if not sec.get("prompts"):
                    errs.append("writing 缺 prompts")
                if not sec.get("modelAnswers"):
                    errs.append("writing 缺 modelAnswers")
    if expect_name and resolved.get("name") != expect_name:
        errs.append(f"名称 '{resolved.get('name')}'≠'{expect_name}'")

    mark = "[OK]" if not errs else "[FAIL]"
    name = resolved.get("name", "")
    line = f"{mark} {grade}{term} {key:<8} {name:<22} 总{total} 自动{auto} 写作{writing}"
    if errs:
        line += "  →  " + " | ".join(errs)
    line += "\n     " + " + ".join(sec_summary)
    return line


# ===== 校验表 =====
# 期望：3上 midterm (gz 8 题型) = 100 / 3上 final/3下 final = 100
# 3下/4 上下 midterm = 100 / 4 上下 final = 100
# 5/6 上下 midterm/final = 100
# 7/8/9 midterm/final = 120（自动 90 + 写作 30）
# 9下 final 改名 "期末考试 / 中考模拟"
# 所有 unitTest 总分见模板
print("=" * 80)
print("[Exam] 配置 smoke test（v3 模板化后）")
print("=" * 80)

# 3-6 年级
results = []
for g in (3, 4):
    for term in ("上", "下"):
        results.append(verify_one(g, term, "midterm", 100, 100))
        results.append(verify_one(g, term, "final", 100, 100))

# 3 上 midterm 特殊：GZ 8 题型样板 100
results.append(verify_one(3, "上", "midterm", 100, 100))

# 5-6 年级
for g in (5, 6):
    for term in ("上", "下"):
        results.append(verify_one(g, term, "midterm", 100, 100))
        results.append(verify_one(g, term, "final", 100, 100))

# 7-9 年级
for g in (7, 8, 9):
    for term in ("上", "下"):
        results.append(verify_one(g, term, "midterm", 120, 90, expect_writing=True))
        results.append(verify_one(g, term, "final", 120, 90, expect_writing=True))

# 9 下 final 改名
results.append(verify_one(9, "下", "final", 120, 90, expect_writing=True, expect_name="期末考试 / 中考模拟"))

# unitTest
for g in (3, 4):
    for term in ("上", "下"):
        results.append(verify_one(g, term, "unitTest", 50, 50))
for g in (5, 6):
    for term in ("上", "下"):
        results.append(verify_one(g, term, "unitTest", 50, 50))
for g in (7, 8, 9):
    for term in ("上", "下"):
        results.append(verify_one(g, term, "unitTest", 55, 55))

for line in results:
    print(line)

# 汇总
errors = [l for l in results if l.startswith("❌")]
print("=" * 80)
print(f"[OK] 通过: {len(results) - len(errors)} / {len(results)}")
if errors:
    print(f"[FAIL] 失败: {len(errors)}")
    for l in errors:
        print(l)
    sys.exit(1)
else:
    print("[DONE] 全部通过！")
    sys.exit(0)
