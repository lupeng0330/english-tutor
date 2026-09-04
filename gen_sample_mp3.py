#!/usr/bin/env python3
"""生成 listen_pic 样例 MP3"""
import sys
sys.path.insert(0, 'scripts')
try:
    from gen_listening_audio import gen_mp3
except ImportError:
    import subprocess, os
    # 直接用 edge-tts 生成
    texts = [
        ('audio/listen_pic_01.mp3', 'M: It\'s sunny today.'),
        ('audio/listen_pic_02.mp3', 'W: I like cats.'),
    ]
    for path, text in texts:
        if os.path.exists(path):
            print(f'[SKIP] {path} 已存在')
            continue
        cmd = f'edge-tts --text "{text}" --write-media {path}'
        print(f'[GEN] {path}')
        os.system(cmd)
    print('完成')
else:
    print('gen_mp3 可用')
