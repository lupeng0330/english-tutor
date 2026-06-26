# -*- coding: utf-8 -*-
"""把 scripts/g3s/u1-u9.json 9 个单元写入 data/textbooks/jk.json 的 grade3.上。

用法：
  python scripts/g3s/import_textbook.py            # dry-run，打印 diff
  python scripts/g3s/import_textbook.py --write    # 实际写入（自动备份 .bak）
"""
import json, os, sys, shutil
from datetime import datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(__file__)
JK = os.path.join(ROOT, 'data', 'textbooks', 'jk.json')

# 单元字段顺序（与旧 grade3.上 一致：id/title/words/lessons，词 word/phonetic/meaning/example）
UNIT_FIELD_ORDER = ["id", "title", "words", "lessons"]
WORD_FIELD_ORDER = ["word", "phonetic", "meaning", "example"]
LESSON_FIELD_ORDER = ["page", "title", "en", "cn"]


def _ordered(d, order):
    out = {}
    for k in order:
        if k in d:
            out[k] = d[k]
    # 保留其它非主字段（如 module 若存在），追加到末尾
    for k, v in d.items():
        if k not in out:
            out[k] = v
    return out


def build_units():
    units = []
    for i in range(1, 10):
        p = os.path.join(HERE, f'u{i}.json')
        d = json.load(open(p, encoding='utf-8'))
        # 重排字段顺序
        u = _ordered(d, UNIT_FIELD_ORDER)
        u['words'] = [_ordered(w, WORD_FIELD_ORDER) for w in d.get('words', [])]
        u['lessons'] = [_ordered(ls, LESSON_FIELD_ORDER) for ls in d.get('lessons', [])]
        # module 字段：u*.json 是 ""，新版没有 module，删掉避免冗余
        u.pop('module', None)
        units.append(u)
    return units


def main():
    write = '--write' in sys.argv
    jk = json.load(open(JK, encoding='utf-8'))
    old_units = jk['grades']['grade3'].get('上', [])
    new_units = build_units()

    print(f"[diff] grade3.上: 旧 {len(old_units)} 单元  →  新 {len(new_units)} 单元")
    print("\n旧单元:")
    for u in old_units:
        print(f"  - {u.get('id'):<4} {u.get('title','')[:36]:<36}  词数={len(u.get('words',[]))}  课文键={'lesson' if 'lesson' in u else 'lessons'}")
    print("\n新单元:")
    for u in new_units:
        print(f"  + {u.get('id'):<4} {u.get('title','')[:36]:<36}  词数={len(u.get('words',[]))}  课文数={len(u.get('lessons',[]))}")

    if not write:
        print("\n[dry-run] 未写入。加 --write 实际执行。")
        return

    # 备份
    bak = JK + f'.bak.{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    shutil.copy2(JK, bak)
    print(f"\n[backup] {bak}")

    jk['grades']['grade3']['上'] = new_units
    tmp = JK + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(jk, f, ensure_ascii=False, indent=2)
    os.replace(tmp, JK)
    print(f"[write] {JK}  ({os.path.getsize(JK)} B)")


if __name__ == '__main__':
    main()
