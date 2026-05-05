# -*- coding: utf-8 -*-
"""修复 hj.json 里中文内容中误用的半角直引号 " → 中文弯引号 “ ”。

只处理明确成对出现且两端都紧邻中文字符的模式：
    [中文]"xxx"[中文/标点]  →  [中文]"xxx"[中文/标点]

只修改这种"一对"形式，不动 JSON 语法中的键值字符串引号。
跑完自动校验 JSON 合法性。
"""
import re, sys, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data", "textbooks", "hj.json")

with open(PATH, "r", encoding="utf-8") as f:
    src = f.read()

# 模式：
#   (前有中文/标点/空格) " (内容，不含引号和换行) " (后有中文/标点)
#   其中"内容"可以包含中文、ASCII 字母、空格、标点，但不含 " 和换行
# 要求两端至少一端是中文字符，且内容里包含中文（避免破坏 JSON 结构）。
# 触发字符集：中文字符 + 常见中文标点（注意把顿号 、 也加进来）
CH = r'[\u4e00-\u9fa5，。！？：；、——()（）]'
pattern = re.compile(
    r'(' + CH + r')"([^"\n\r]{1,60}?)"(' + CH + r')'
)

def looks_chinese_content(inner):
    # 内容里必须含至少 1 个中文字符
    return bool(re.search(r'[\u4e00-\u9fa5]', inner))

def repl(m):
    before, inner, after = m.group(1), m.group(2), m.group(3)
    if not looks_chinese_content(inner):
        return m.group(0)  # 不动
    return before + "\u201c" + inner + "\u201d" + after

# 多次迭代（处理相邻情况）
new = src
for _ in range(5):
    nxt = pattern.sub(repl, new)
    if nxt == new:
        break
    new = nxt

if new != src:
    # 先校验
    try:
        json.loads(new)
    except Exception as e:
        print("[error] JSON invalid after fix:", e)
        # 显示首个错误附近内容
        with open(PATH + ".bak", "w", encoding="utf-8") as f:
            f.write(new)
        sys.exit(1)
    with open(PATH, "w", encoding="utf-8") as f:
        f.write(new)
    # 统计修改了多少处
    # 简单计数：原有直引号对数 - 修复后剩余对数
    print("[ok] Fixed, JSON valid.")
    print("     Original len :", len(src))
    print("     New      len :", len(new))
    print("     Chars diff   :", len(new) - len(src))
else:
    print("[info] No target pattern found.")
    try:
        json.loads(src)
        print("[ok] JSON already valid.")
    except Exception as e:
        print("[error] JSON is already invalid:", e)
        sys.exit(1)
