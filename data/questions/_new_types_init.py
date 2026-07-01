#!/usr/bin/env python3
"""批次 1：创建 6 个新题型题库 JSON 文件（空数组）"""
import json, os

BASE = os.path.join(os.path.dirname(__file__), '..', 'data', 'questions')
os.makedirs(BASE, exist_ok=True)

FILES = [
    'jk_listen_pic.json',
    'jk_listen_judge.json',
    'jk_listen_fill.json',
    'jk_blank_fill.json',
    'jk_sentence_transform.json',
    'jk_sentence_order.json',
]

for fn in FILES:
    path = os.path.join(BASE, fn)
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=2)
        print('[OK] 创建：' + fn)
    else:
        print('[SKIP] 已存在：' + fn)

print('\n完成。')
