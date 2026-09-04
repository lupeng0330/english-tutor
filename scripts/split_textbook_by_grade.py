# -*- coding: utf-8 -*-
"""
按年级拆分 data/textbooks/{tb}.json → data/textbooks/{tb}_grade{N}.json

每个分片保持 { meta, grades: { gradeN: {上:[...], 下:[...]} } } 的结构，
前端加载时拿到与整册一致的子集，无需额外代码差异。

用法：
  python scripts/split_textbook_by_grade.py --textbook hj
  python scripts/split_textbook_by_grade.py --textbook hj --dry-run
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXTBOOK_DIR = os.path.join(ROOT, "data", "textbooks")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--textbook", required=True, help="教材 ID，如 hj / jk")
    parser.add_argument("--dry-run", action="store_true", help="只打印，不写文件")
    args = parser.parse_args()

    src = os.path.join(TEXTBOOK_DIR, f"{args.textbook}.json")
    if not os.path.exists(src):
        print(f"[error] 找不到源文件: {src}")
        sys.exit(1)

    with open(src, "r", encoding="utf-8") as f:
        data = json.load(f)

    meta = data.get("meta", {})
    grades = data.get("grades", {})
    if not grades:
        print("[error] grades 为空，无法拆分")
        sys.exit(1)

    src_size = os.path.getsize(src)
    print(f"[info] 源文件: {src} ({src_size/1024:.1f} KB)")
    print(f"[info] meta: {meta.get('name', '-')}")
    print(f"[info] 年级: {list(grades.keys())}")
    print("")

    for gk, terms in grades.items():
        unit_count = sum(len(v) for v in (terms or {}).values())
        sub = {
            "meta": meta,
            "grades": {gk: terms},
        }
        out_path = os.path.join(TEXTBOOK_DIR, f"{args.textbook}_{gk}.json")
        content = json.dumps(sub, ensure_ascii=False, indent=2)
        size_kb = len(content.encode("utf-8")) / 1024
        print(f"  [{gk}] 单元 {unit_count} 个 → {os.path.basename(out_path)} ({size_kb:.1f} KB)")
        if not args.dry_run:
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(content)

    if args.dry_run:
        print("\n[dry-run] 未写入文件。")
    else:
        print("\n[done] 分片生成完成。原 {}.json 保留未动。".format(args.textbook))


if __name__ == "__main__":
    main()
