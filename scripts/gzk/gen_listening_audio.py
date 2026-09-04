# -*- coding: utf-8 -*-
"""
生成 gzk 听力题的 MP3。
复用 scripts/gen_listening_audio.py 的 gen_one（Edge Neural TTS + 角色音色映射），
读取 data/questions/gzk_listening.json 的每条 audioText 生成对应 audioFile。

文件已存在且大小 > 1KB 时自动跳过（hash 增量复用）。

运行：python scripts/gzk/gen_listening_audio.py
"""
import asyncio
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, 'scripts'))

# 复用 jk 听力音频生成器
from gen_listening_audio import gen_one  # noqa: E402
from gen_audio_v2 import OUT_DIR, TMP_DIR  # noqa: E402

QB_PATH = os.path.join(ROOT, 'data', 'questions', 'gzk_listening.json')


async def main():
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)

    with open(QB_PATH, 'r', encoding='utf-8') as f:
        qs = json.load(f)

    targets = [q for q in qs if q.get('audioFile') and q.get('audioText')]
    print(f'[info] gzk 听力 MP3 目标: {len(targets)} 个')

    ok, skip, fail = 0, 0, 0
    for i, q in enumerate(targets, 1):
        fname = q['audioFile']
        text = q.get('audioText', '')
        try:
            status, detail = await gen_one(fname, text)
            if status == 'skip':
                skip += 1
                print(f'  [{i:>3}/{len(targets)}] skip   {fname}')
            elif status == 'empty':
                print(f'  [{i:>3}/{len(targets)}] empty  {fname}')
            else:
                ok += 1
                detail_str = ', '.join(detail or []) if detail else '-'
                kb = os.path.getsize(os.path.join(OUT_DIR, fname)) // 1024
                print(f'  [{i:>3}/{len(targets)}] ok     {fname}  [{kb} KB]  {detail_str}')
        except Exception as e:
            fail += 1
            print(f'  [{i:>3}/{len(targets)}] FAIL   {fname}  :: {e}')

    # 清 tmp
    try:
        if os.path.exists(TMP_DIR):
            for f in os.listdir(TMP_DIR):
                try:
                    os.remove(os.path.join(TMP_DIR, f))
                except Exception:
                    pass
            try:
                os.rmdir(TMP_DIR)
            except Exception:
                pass
    except Exception:
        pass

    print(f'\n[done] ok={ok} skip={skip} fail={fail}')


if __name__ == '__main__':
    asyncio.run(main())
