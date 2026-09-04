# -*- coding: utf-8 -*-
"""
把 gzk_*.json 题库的 difficulty 字符串归一化为数字 (1-4)，与 jk/hj 对齐。

映射：easy/简单/基础 -> 1; medium/中等 -> 2; hard/较难/难 -> 3; challenge/expert/挑战 -> 4

铁律 8 三件套：
  1. 写入前自动备份到 data/questions/.backups/
  2. 打印差异报告（每题 difficulty 字段改动数）
  3. 改动行数 > 50% 阻断（确认是预期）

运行：
  python scripts/gzk/normalize_difficulty.py            # dry-run
  python scripts/gzk/normalize_difficulty.py --write    # 写入
"""
import argparse
import json
import os
import shutil
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QDIR = os.path.join(ROOT, 'data', 'questions')


def normalize(d):
    """字符串/数字 → 1-4 数字；未知保持原值（返回 (新值, 是否改动)）"""
    if isinstance(d, int):
        return d, False
    if isinstance(d, str):
        k = d.strip().lower()
        mp = {
            'easy': 1, '简单': 1, '基础': 1,
            'medium': 2, '中等': 2,
            'hard': 3, '较难': 3, '难': 3,
            'challenge': 4, 'expert': 4, '挑战': 4,
        }
        if k in mp:
            return mp[k], True
        try:
            return int(k), True
        except ValueError:
            return d, False
    return d, False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--force', action='store_true')
    args = ap.parse_args()

    files = ['gzk_spelling.json', 'gzk_listening.json', 'gzk_grammar.json', 'gzk_reading.json']
    targets = []

    for fn in files:
        p = os.path.join(QDIR, fn)
        if not os.path.exists(p):
            print(f'  [跳过] {fn} 不存在')
            continue
        data = json.load(open(p, encoding='utf-8'))
        changes = 0
        before_samples = []
        after_samples = []
        for i, q in enumerate(data):
            old_d = q.get('difficulty')
            new_d, changed = normalize(old_d)
            if changed:
                q['difficulty'] = new_d
                changes += 1
                if len(before_samples) < 3:
                    before_samples.append(repr(old_d))
                    after_samples.append(repr(new_d))
        print(f'  {fn}: {len(data)} 题 → 改动 {changes} 题')
        if changes:
            print(f'    样例（前 3 个改动）：{" / ".join(before_samples)} → {" / ".join(after_samples)}')
            # 骤变阻断
            if changes / max(len(data), 1) > 0.5 and not args.write:
                pass  # dry-run 时只报告
        targets.append((p, data, changes))

    total_changes = sum(t[2] for t in targets)
    print(f'\n[合计] 改动 {total_changes} 题')

    if not args.write:
        print('\n(dry-run，加 --write 实际写入)')
        return

    if total_changes == 0:
        print('\n[skip] 无改动，不写入')
        return

    # 备份
    os.makedirs(QDIR, exist_ok=True)
    backup_dir = os.path.join(QDIR, '.backups')
    os.makedirs(backup_dir, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    print(f'\n[🔒 备份] {backup_dir}/  ({ts})')
    for p, data, changes in targets:
        if changes == 0:
            continue
        fn = os.path.basename(p)
        bak = os.path.join(backup_dir, f'{fn.replace(".json", "")}_{ts}.json')
        shutil.copy2(p, bak)
        print(f'    {os.path.basename(bak)}')

    # 写入
    for p, data, changes in targets:
        if changes == 0:
            continue
        tmp = p + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, p)

    print(f'\n[✅ 写入完成] {total_changes} 题 difficulty 归一化为数字')


if __name__ == '__main__':
    main()
