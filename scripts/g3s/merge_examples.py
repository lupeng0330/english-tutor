# -*- coding: utf-8 -*-
"""合并 e1..e9.json 为 data/examples/jk_grade3_shang.json，并校验 key 与词卡一致。"""
import json, os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(__file__)
OUT = os.path.join(ROOT, 'data', 'examples', 'jk_grade3_shang.json')
JK = os.path.join(ROOT, 'data', 'textbooks', 'jk.json')

words = {}
for i in range(1, 10):
    with open(os.path.join(HERE, f'e{i}.json'), encoding='utf-8') as f:
        d = json.load(f)
    for k, v in d.items():
        words[k] = v

# 校验：词卡里的每个 word 是否都有例句
jk = json.load(open(JK, encoding='utf-8'))
card_words = []
for u in jk['grades']['grade3']['上']:
    for w in u['words']:
        card_words.append(w['word'])

missing = [w for w in card_words if w not in words]
extra = [w for w in words if w not in card_words]
print('词卡总词数:', len(card_words), '| 例句词数:', len(words))
print('缺例句的词:', missing)
print('多出的例句词:', extra)

total_sent = sum(len(v) for v in words.values())
print('例句总句数:', total_sent)

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump({'words': words}, f, ensure_ascii=False, indent=2)
print('WROTE ->', OUT)
