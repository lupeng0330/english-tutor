# -*- coding: utf-8 -*-
"""jk 教科版分册补齐共享库（一次写，6 册复用）。

提供两个核心函数，被每册薄入口（如 scripts/g3s/import_textbook.py）调用：
  - import_units(here_dir, grade, term, jk_path=None, write=False)
      把 here_dir 下 u1..uN.json 的单元数据写入 jk.json 的 grades[grade][term]
      自动 .bak 备份 + 原子写入 + 字段顺序对齐
  - merge_examples(here_dir, grade, term, jk_path=None, out_path=None)
      合并 here_dir 下 e1..eN.json → data/examples/jk_grade{N}_{shang|xia}.json
      并对照 jk.json 词表校验 missing/extra

设计约定：
  - here_dir 必须存在 u1.json...uN.json（编号连续，N 自动探测，最多 20）
  - 单元字段顺序：id / title / words / lessons（与既有 grade3.上 / grade6.下 一致）
  - 词字段顺序：word / phonetic / meaning / example
  - 课文字段顺序：page / title / en / cn

不依赖任何第三方库；标准库 json/os/shutil/datetime 即可。
"""
import json
import os
import shutil
import sys
from datetime import datetime

# ---------- 路径常量 ----------
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DEFAULT_JK = os.path.join(ROOT, 'data', 'textbooks', 'jk.json')
DEFAULT_EX_DIR = os.path.join(ROOT, 'data', 'examples')

# ---------- 字段顺序 ----------
UNIT_FIELD_ORDER = ["id", "title", "words", "lessons"]
WORD_FIELD_ORDER = ["word", "phonetic", "meaning", "example"]
LESSON_FIELD_ORDER = ["page", "title", "en", "cn"]

# ---------- 学期 → 文件名后缀 ----------
TERM_SUFFIX = {"上": "shang", "下": "xia"}


def _ordered(d, order):
    """按 order 重排字段；其它非主字段追加到末尾。"""
    out = {}
    for k in order:
        if k in d:
            out[k] = d[k]
    for k, v in d.items():
        if k not in out:
            out[k] = v
    return out


def _scan_unit_files(here_dir, prefix="u", max_n=20):
    """返回 here_dir 下 prefix1.json ~ prefixN.json 的存在文件列表（按编号连续）。"""
    files = []
    for i in range(1, max_n + 1):
        p = os.path.join(here_dir, f"{prefix}{i}.json")
        if os.path.exists(p):
            files.append((i, p))
        else:
            break
    return files


# =============================================================================
# 1) import_units: 把 u1..uN.json 写入 jk.json
# =============================================================================
def import_units(here_dir, grade, term, jk_path=None, write=False):
    """把 here_dir 下 u1..uN.json 9 个单元写入 jk.json[grade][term]。

    Args:
        here_dir: 单元草稿目录（含 u1.json ~ uN.json）
        grade: 'grade3' / 'grade4' / ...
        term: '上' / '下'
        jk_path: jk.json 路径（默认 ROOT/data/textbooks/jk.json）
        write: True 才真正写入 + 自动 .bak 备份；False = dry-run

    Returns:
        (old_units, new_units) 用于打印 diff
    """
    jk_path = jk_path or DEFAULT_JK
    files = _scan_unit_files(here_dir)
    if not files:
        raise RuntimeError(f"[import_units] {here_dir} 下未找到 u1.json")

    new_units = []
    for _, p in files:
        d = json.load(open(p, encoding='utf-8'))
        u = _ordered(d, UNIT_FIELD_ORDER)
        u['words'] = [_ordered(w, WORD_FIELD_ORDER) for w in d.get('words', [])]
        u['lessons'] = [_ordered(ls, LESSON_FIELD_ORDER) for ls in d.get('lessons', [])]
        u.pop('module', None)
        new_units.append(u)

    jk = json.load(open(jk_path, encoding='utf-8'))
    if grade not in jk['grades']:
        raise RuntimeError(f"[import_units] jk.json 无 {grade}")
    if term not in jk['grades'][grade]:
        raise RuntimeError(f"[import_units] jk.json {grade} 无 {term}")
    old_units = jk['grades'][grade].get(term, [])

    # 打印 diff
    print(f"[diff] {grade}.{term}: 旧 {len(old_units)} 单元  →  新 {len(new_units)} 单元")
    print("旧:")
    for u in old_units:
        nw = len(u.get('words', []))
        lk = 'lessons' if 'lessons' in u else ('lesson' if 'lesson' in u else '-')
        print(f"  - {u.get('id','?'):<4} {u.get('title','')[:38]:<40}  词={nw}  键={lk}")
    print("新:")
    for u in new_units:
        nw = len(u.get('words', []))
        nl = len(u.get('lessons', []))
        print(f"  + {u.get('id','?'):<4} {u.get('title','')[:38]:<40}  词={nw}  课文={nl}")

    if not write:
        print("\n[dry-run] 未写入。加 --write 实际执行。")
        return old_units, new_units

    # 备份
    bak = jk_path + f'.bak.{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    shutil.copy2(jk_path, bak)
    print(f"\n[backup] {bak}")

    # 原子写入
    jk['grades'][grade][term] = new_units
    tmp = jk_path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(jk, f, ensure_ascii=False, indent=2)
    os.replace(tmp, jk_path)
    print(f"[write] {jk_path}  ({os.path.getsize(jk_path)} B)")
    return old_units, new_units


# =============================================================================
# 2) merge_examples: 合并 e1..eN.json → jk_grade{N}_{shang|xia}.json
# =============================================================================
def merge_examples(here_dir, grade, term, jk_path=None, out_path=None):
    """合并 here_dir 下 e1..eN.json 为 data/examples/jk_grade{N}_{term}.json，校验词表一致。

    Args:
        here_dir: 例句草稿目录（含 e1.json ~ eN.json）
        grade: 'grade3' / ...
        term: '上' / '下'
        jk_path / out_path: 默认路径
    """
    jk_path = jk_path or DEFAULT_JK
    if out_path is None:
        suffix = TERM_SUFFIX.get(term)
        if not suffix:
            raise RuntimeError(f"[merge_examples] 未知 term: {term}")
        gn = grade.replace("grade", "")
        out_path = os.path.join(DEFAULT_EX_DIR, f'jk_grade{gn}_{suffix}.json')

    files = _scan_unit_files(here_dir, prefix='e')
    if not files:
        raise RuntimeError(f"[merge_examples] {here_dir} 下未找到 e1.json")

    words = {}
    for _, p in files:
        d = json.load(open(p, encoding='utf-8'))
        for k, v in d.items():
            words[k] = v

    # ★ 保留既有 audioFile：若 out_path 已存在，按 (word, en) 键回灌 audioFile，避免合并时把音频字段冲掉
    preserved = 0
    if os.path.exists(out_path):
        try:
            old = json.load(open(out_path, encoding='utf-8'))
            old_words = old.get('words', {})
            for w, arr in words.items():
                old_arr = old_words.get(w, [])
                # 用 en 文本作为稳定 key
                old_map = {(ex.get('en') or '').strip(): ex.get('audioFile') for ex in old_arr}
                for ex in arr:
                    en = (ex.get('en') or '').strip()
                    if en in old_map and old_map[en] and not ex.get('audioFile'):
                        ex['audioFile'] = old_map[en]
                        preserved += 1
            if preserved:
                print(f"[preserve] 从既有 {os.path.basename(out_path)} 回灌 audioFile {preserved} 条")
        except Exception as e:
            print(f"[warn] 读取既有例句文件失败，跳过 audioFile 保留: {e}")

    # 校验 jk.json 词表覆盖
    jk = json.load(open(jk_path, encoding='utf-8'))
    units = jk['grades'][grade][term]
    card_words = []
    for u in units:
        for w in u.get('words', []):
            card_words.append(w['word'])
    missing = [w for w in card_words if w not in words]
    extra = [w for w in words if w not in card_words]

    total_sent = sum(len(v) for v in words.values())
    print(f"词卡总词数: {len(card_words)} | 例句词数: {len(words)} | 总句数: {total_sent}")
    print(f"缺例句的词: {missing}")
    print(f"多出的例句词: {extra}")

    if missing or extra:
        print("\n[WARN] 词表对不上，不写入。请先修正 e*.json 或 u*.json。")
        return False

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    tmp = out_path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump({'words': words}, f, ensure_ascii=False, indent=2)
    os.replace(tmp, out_path)
    print(f"WROTE -> {out_path}  ({os.path.getsize(out_path)} B)")
    return True


# =============================================================================
# 命令行直跑：python scripts/_jk_volume_lib.py import|merge <here_dir> <grade> <term> [--write]
# =============================================================================
def main():
    if len(sys.argv) < 5:
        print(__doc__)
        print("\n用法：")
        print("  python scripts/_jk_volume_lib.py import <here_dir> <grade> <term> [--write]")
        print("  python scripts/_jk_volume_lib.py merge  <here_dir> <grade> <term>")
        sys.exit(1)

    cmd, here_dir, grade, term = sys.argv[1:5]
    write = '--write' in sys.argv

    if cmd == 'import':
        import_units(here_dir, grade, term, write=write)
    elif cmd == 'merge':
        ok = merge_examples(here_dir, grade, term)
        sys.exit(0 if ok else 1)
    else:
        print(f"未知子命令: {cmd}")
        sys.exit(1)


if __name__ == '__main__':
    main()
