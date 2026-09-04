#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量为 data/textbooks/jk.json 中每个单元的 lesson 生成中文翻译 → lessonCN 字段。
用 MyMemory 免费翻译 API（无需 Key，5000 字符/天）。
"""
import io, json, os, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEXTBOOK = os.path.join(ROOT, 'data', 'textbooks', 'jk.json')

API = 'https://api.mymemory.translated.net/get'

def translate(text, src='en', dst='zh-CN'):
    q = urllib.parse.urlencode({'q': text, 'langpair': f'{src}|{dst}'})
    url = API + '?' + q
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read().decode('utf-8'))
        return data.get('responseData', {}).get('translatedText') or ''
    except Exception as e:
        print('  [err]', e)
        return ''

def main():
    with io.open(TEXTBOOK, 'r', encoding='utf-8') as f:
        tb = json.load(f)
    changed = 0
    total = 0
    for gkey, terms in tb.get('grades', {}).items():
        for term_name, units in (terms or {}).items():
            for u in (units or []):
                total += 1
                if u.get('lessonCN') and len(u['lessonCN']) > 2:
                    continue
                en = u.get('lesson') or ''
                if not en.strip():
                    continue
                print(f'[{gkey} {term_name} {u.get("id")}]', en[:50], '...', flush=True)
                cn = translate(en)
                if cn:
                    u['lessonCN'] = cn.strip()
                    changed += 1
                    print('  →', cn[:60])
                else:
                    print('  (跳过 - 翻译为空)')
                time.sleep(0.5)  # 避免触发速率限制
    # 写回
    with io.open(TEXTBOOK, 'w', encoding='utf-8') as f:
        json.dump(tb, f, ensure_ascii=False, indent=2)
    print('')
    print(f'[done] 总单元 {total}，新增翻译 {changed}，写入 {TEXTBOOK}')

if __name__ == '__main__':
    main()
