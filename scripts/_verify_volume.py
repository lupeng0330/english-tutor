# -*- coding: utf-8 -*-
"""通用单册校验脚本 · 一次写，每册复用。

校验项（4 项，全 PASS 才算交付）：
  1. jk.json[grade][term] 单元数 / 单元字段完整性（id/title/words/lessons）
  2. 例句文件存在 + 词表与 jk.json 词卡完全对齐（无 missing/extra）
  3. 每个例句 audioFile 字段非空 + 每词三档 level=1/2/3 完整覆盖
  4. 每个 audioFile 对应的 audio/ex_*.mp3 文件落盘（>256 B）

用法：
  python scripts/_verify_volume.py grade3 上
  python scripts/_verify_volume.py grade4 下

退出码：0=全 PASS，1=有失败
"""
import json
import os
import sys

# Windows GBK 控制台兼容：强制 stdout 用 utf-8（>= Py3.7）
try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
JK = os.path.join(ROOT, 'data', 'textbooks', 'jk.json')
AUDIO_DIR = os.path.join(ROOT, 'audio')
EX_DIR = os.path.join(ROOT, 'data', 'examples')

TERM_SUFFIX = {"上": "shang", "下": "xia"}
TERM_ALIAS = {"shang": "上", "xia": "下", "s": "上", "x": "下"}  # 命令行 ASCII 友好别名


def check(name, cond, detail=""):
    flag = "[OK  ]" if cond else "[FAIL]"
    print(f"  {flag} {name}{('  ' + detail) if detail else ''}")
    return bool(cond)


def main():
    if len(sys.argv) < 3:
        print("用法: python scripts/_verify_volume.py <grade> <term>")
        print("示例: python scripts/_verify_volume.py grade3 上")
        sys.exit(2)

    grade, term_in = sys.argv[1], sys.argv[2]
    # 支持 shang/xia/s/x 别名 → 中文 上/下（Windows GBK 控制台传中文易出问题）
    term = TERM_ALIAS.get(term_in.lower(), term_in)
    suffix = TERM_SUFFIX.get(term)
    if not suffix:
        print(f"[ERR] 未知 term: {term_in}（应为 '上'/'下' 或 shang/xia）")
        sys.exit(2)

    gn = grade.replace("grade", "")
    ex_path = os.path.join(EX_DIR, f'jk_grade{gn}_{suffix}.json')

    print(f"\n=== 校验 jk {grade}.{term} ===\n")

    all_pass = True

    # --- 1) jk.json 单元 ---
    print("【1】jk.json 单元数据")
    jk = json.load(open(JK, encoding='utf-8'))
    units = jk['grades'].get(grade, {}).get(term, [])
    all_pass &= check(f"{grade}.{term} 单元数 = {len(units)}", len(units) > 0)
    bad_units = []
    card_words = []
    for u in units:
        for k in ['id', 'title', 'words', 'lessons']:
            if k not in u:
                bad_units.append(f"{u.get('id','?')}-缺{k}")
        for w in u.get('words', []):
            card_words.append(w['word'])
    all_pass &= check(f"单元字段完整（id/title/words/lessons）", not bad_units, f"问题: {bad_units[:3]}" if bad_units else f"词总数 {len(card_words)}")

    # --- 2) 例句文件 + 词表对齐 ---
    print("\n【2】例句文件 + 词表对齐")
    if not os.path.exists(ex_path):
        check(f"例句文件存在 {os.path.basename(ex_path)}", False, "FILE NOT FOUND")
        print("\n[VERIFY] FAIL")
        sys.exit(1)
    check(f"例句文件存在 {os.path.basename(ex_path)}", True, f"{os.path.getsize(ex_path)} B")
    ex_data = json.load(open(ex_path, encoding='utf-8'))
    words_ex = ex_data.get('words', {})
    missing = [w for w in card_words if w not in words_ex]
    extra = [w for w in words_ex if w not in card_words]
    all_pass &= check(f"词表完全对齐", not missing and not extra,
                      f"missing={missing[:3]} extra={extra[:3]}" if (missing or extra) else f"{len(words_ex)} 词")

    # --- 3) audioFile + level 完整 ---
    print("\n【3】audioFile 字段 + level 三档覆盖")
    no_af = []
    no_level = []
    total_sent = 0
    for w, arr in words_ex.items():
        levels = set()
        for ex in arr:
            total_sent += 1
            if not ex.get('audioFile'):
                no_af.append(f"{w}:{(ex.get('en') or '')[:20]}")
            levels.add(ex.get('level'))
        if not ({1, 2, 3} <= levels):
            no_level.append(f"{w}:levels={sorted(levels)}")
    all_pass &= check(f"所有例句 audioFile 非空", not no_af,
                      f"缺 {len(no_af)} 条" if no_af else f"{total_sent} 句全有")
    all_pass &= check(f"每词三档 level=1/2/3 完整", not no_level,
                      f"问题词 {len(no_level)} 个" if no_level else "OK")

    # --- 4) MP3 文件落盘 ---
    print("\n【4】MP3 文件落盘")
    missing_mp3 = []
    small_mp3 = []
    for w, arr in words_ex.items():
        for ex in arr:
            af = ex.get('audioFile')
            if not af:
                continue
            p = os.path.join(AUDIO_DIR, af)
            if not os.path.exists(p):
                missing_mp3.append(af)
            elif os.path.getsize(p) <= 256:
                small_mp3.append(af)
    all_pass &= check(f"audio/ex_*.mp3 全部落盘", not missing_mp3,
                      f"缺 {len(missing_mp3)} 个: {missing_mp3[:3]}" if missing_mp3 else f"{total_sent} 句对应文件 OK")
    all_pass &= check(f"无小尺寸损坏 MP3 (>256 B)", not small_mp3,
                      f"小文件 {len(small_mp3)} 个: {small_mp3[:3]}" if small_mp3 else "OK")

    print(f"\n=== VERIFY: {'PASS' if all_pass else 'FAIL'} ===\n")
    sys.exit(0 if all_pass else 1)


if __name__ == '__main__':
    main()
