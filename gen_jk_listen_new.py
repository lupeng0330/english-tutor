#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
jk 教科版「新听力三题型」音频生成器
- 目标题型：listen_fill / listen_judge / listen_pic
- 读取 data/questions/jk_listen_*.json
- 对每道题 audioText 生成 MP3（多角色 W:/M: + 童声语速稍慢）
- 用法：python gen_jk_listen_new.py [--dry-run] [--limit N] [--force]
"""
import os, sys, json, re, asyncio

ROOT = os.path.dirname(os.path.abspath(__file__))
AUDIO_DIR = os.path.join(ROOT, 'audio')

# 与 gen_jk_listening.py 一致：W=Aria、M=Guy；语速 -10%（童声感）
VOICE_W = 'en-US-AriaNeural'
VOICE_M = 'en-US-GuyNeural'
VOICE_N = 'en-US-JennyNeural'
RATE = '-10%'

# 三个目标题库（本次新听力三题型）
TARGET_JSON = [
    os.path.join(ROOT, 'data', 'questions', 'jk_listen_fill.json'),
    os.path.join(ROOT, 'data', 'questions', 'jk_listen_judge.json'),
    os.path.join(ROOT, 'data', 'questions', 'jk_listen_pic.json'),
]

try:
    import edge_tts
except ImportError:
    print('需要 edge-tts：pip install edge-tts')
    sys.exit(1)


def parse_voice(audio_text):
    """从 'M: xxx.' / 'W: xxx.' 解析出声部与文本（单声部）。"""
    m = re.match(r'^\s*([WM])\s*:\s*(.+?)\s*$', audio_text, flags=re.S)
    if m:
        spk = m.group(1)
        seg = m.group(2).strip()
        voice = VOICE_W if spk == 'W' else VOICE_M
        return voice, seg
    return VOICE_N, audio_text.strip()


async def synth_one(text, voice, out_path):
    """单声部直接出 MP3。"""
    communicate = edge_tts.Communicate(text, voice, rate=RATE)
    await communicate.save(out_path)


def collect_targets(force=False):
    """收集所有待生成的 (audioFile, voice, seg) 元组。"""
    todo = []
    for jf in TARGET_JSON:
        if not os.path.exists(jf):
            print('跳过（文件不存在）: {}'.format(jf))
            continue
        data = json.load(open(jf, encoding='utf-8'))
        for q in data:
            af = q.get('audioFile', '')
            at = q.get('audioText', '')
            if not af or not at:
                continue
            out_path = os.path.join(AUDIO_DIR, af)
            if (not force) and os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
                continue  # 已存在且非空（>1KB 视为有效）
            voice, seg = parse_voice(at)
            todo.append((af, voice, seg, out_path))
    return todo


async def run_all(todo, limit=None):
    if limit:
        todo = todo[:limit]
    ok, fail = 0, 0
    for af, voice, seg, out_path in todo:
        try:
            await synth_one(seg, voice, out_path)
            ok += 1
            print('  OK  {:32s}  voice={:18s}  seg={!r}'.format(af, voice, seg))
        except Exception as e:
            fail += 1
            print('  FAIL {:32s}  -> {}'.format(af, e))
    return ok, fail


def main():
    args = sys.argv[1:]
    dry = '--dry-run' in args
    force = '--force' in args
    limit = None
    if '--limit' in args:
        try:
            limit = int(args[args.index('--limit') + 1])
        except (ValueError, IndexError):
            pass
    todo = collect_targets(force=force)
    print('待生成 {} 个新听力 MP3'.format(len(todo)))
    if dry:
        for af, voice, seg, _ in todo[:20]:
            print('  - {:32s}  voice={:18s}  seg={!r}'.format(af, voice, seg))
        return
    if not todo:
        print('无需生成（文件已存在）。如需强制重生成，请加 --force。')
        return
    ok, fail = asyncio.run(run_all(todo, limit=limit))
    print('完成 OK={}  FAIL={}'.format(ok, fail))
    if fail > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()
