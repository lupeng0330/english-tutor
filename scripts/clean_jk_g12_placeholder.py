# -*- coding: utf-8 -*-
"""
清空 jk.json grade1/grade2 占位段，保留 {上:[], 下:[]} 空容器。

背景：教科版广州小学英语为「三年级起点」教材，1-2 年级只有 gzk「英语口语」版。
jk 1-2 占位段是项目早期建数据结构时的历史遗留，与现实教材不符。

铁律 8 数据安全三件套：
  1. 自动备份到 data/textbooks/.backups/jk_{时间戳}.json
  2. 打印差异报告（清理前 → 清理后）
  3. 原子写入（写 .tmp 再 rename）

用法：
  python scripts/clean_jk_g12_placeholder.py            # dry-run（只打印差异）
  python scripts/clean_jk_g12_placeholder.py --write    # 实际写入 + 备份
"""
import json
import os
import sys
import shutil
import argparse
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JK_PATH = os.path.join(ROOT, 'data', 'textbooks', 'jk.json')
BACKUP_DIR = os.path.join(ROOT, 'data', 'textbooks', '.backups')

sys.stdout.reconfigure(encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true', help='实际写入（否则仅 dry-run 打印差异）')
    args = parser.parse_args()

    # 读
    with open(JK_PATH, encoding='utf-8') as f:
        d = json.load(f)

    print('=== 清理前现状 ===\n')
    diff = []
    for grade in ['grade1', 'grade2']:
        gd = d.get('grades', {}).get(grade, {})
        for term in ['上', '下']:
            units = gd.get(term, [])
            words = sum(len(u.get('words', [])) for u in units)
            lessons = sum(len(u.get('lessons', [])) for u in units)
            diff.append((grade, term, len(units), words, lessons))
            print(f'  {grade} {term}: {len(units)} 单元 / {words} 词 / {lessons} 课文')

    # 总数变化
    total_before = sum(
        len(d['grades'][g].get(t, [])) for g in d['grades'] for t in ['上', '下']
    )
    print(f'\n  jk 总单元数（清理前）: {total_before}')

    # 清理动作
    print('\n=== 待清理动作 ===\n')
    print('  grade1.上  → []')
    print('  grade1.下  → []')
    print('  grade2.上  → []')
    print('  grade2.下  → []')
    print('  3-6 年级数据：保持不变')

    # 模拟清理后
    cleaned_units = sum(units for _, _, units, _, _ in diff)
    cleaned_words = sum(words for _, _, _, words, _ in diff)
    print(f'\n  将清空 {cleaned_units} 个占位单元 / {cleaned_words} 个占位词')
    print(f'  jk 总单元数（清理后）: {total_before - cleaned_units}')

    if not args.write:
        print('\n[dry-run] 未实际写入。加 --write 实际执行。')
        return

    # 铁律 8.1 备份
    os.makedirs(BACKUP_DIR, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    bak_path = os.path.join(BACKUP_DIR, f'jk_{ts}.json')
    shutil.copy2(JK_PATH, bak_path)
    print(f'\n[backup] 旧 jk.json 已备份到: {os.path.relpath(bak_path, ROOT)}')

    # 实际清理
    for grade in ['grade1', 'grade2']:
        if grade not in d['grades']:
            d['grades'][grade] = {}
        for term in ['上', '下']:
            d['grades'][grade][term] = []

    # 铁律 8.3 原子写入
    tmp_path = JK_PATH + '.tmp'
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, JK_PATH)
    print(f'[write] 已写入 {os.path.relpath(JK_PATH, ROOT)}')

    # 读盘验证（铁律 6 真实落盘验证）
    print('\n=== 写入后读盘验证 ===\n')
    with open(JK_PATH, encoding='utf-8') as f:
        d2 = json.load(f)
    for grade in ['grade1', 'grade2']:
        for term in ['上', '下']:
            units = d2['grades'][grade].get(term, [])
            status = '✅ 已清空' if len(units) == 0 else f'❌ 残留 {len(units)} 单元'
            print(f'  {grade} {term}: {status}')

    total_after = sum(
        len(d2['grades'][g].get(t, [])) for g in d2['grades'] for t in ['上', '下']
    )
    print(f'\n  jk 总单元数: {total_before} → {total_after}（净 -{total_before - total_after}）')

    # G3-6 数据完整性快速核
    print('\n=== G3-6 真实数据完整性核查（不应改动）===\n')
    for grade in ['grade3', 'grade4', 'grade5', 'grade6']:
        for term in ['上', '下']:
            units = d2['grades'][grade].get(term, [])
            words = sum(len(u.get('words', [])) for u in units)
            print(f'  {grade} {term}: {len(units)} 单元 / {words} 词')


if __name__ == '__main__':
    main()
