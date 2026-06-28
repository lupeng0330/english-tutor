#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
jk 教科版听力题音频生成器
- 读取 data/questions/jk_listening.json（须先由 build_qbank.py --write 生成）
- 对每道题 audioText 生成 MP3（多角色 W:/M: + 童声语速稍慢）
用法：python gen_jk_listening.py [--limit N] [--dry-run]
"""
import os, sys, json, re, asyncio, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
LISTEN_JSON = os.path.join(ROOT, 'data', 'questions', 'jk_listening.json')
AUDIO_DIR = os.path.join(ROOT, 'audio')
VOICE_W = 'en-US-AriaNeural'
VOICE_M = 'en-US-GuyNeural'
VOICE_N = 'en-US-JennyNeural'
RATE = '-10%'

try:
    import edge_tts
except ImportError:
    print('需要 edge-tts：pip install edge-tts')
    sys.exit(1)


def parse_turns(text):
    parts = re.split(r'\b([WM])\s*:\s*', text)
    turns = []
    i = 1
    while i < len(parts) - 1:
        spk = parts[i]
        seg = parts[i + 1].strip()
        if seg:
            voice = VOICE_W if spk == 'W' else VOICE_M
            turns.append((voice, seg))
        i += 2
    if not turns:
        turns = [(VOICE_N, text.strip())]
    return turns


async def synth_segment(text, voice, out_path):
    communicate = edge_tts.Communicate(text, voice, rate=RATE)
    await communicate.save(out_path)


async def gen_one(audio_text, out_path, tmp_dir):
    turns = parse_turns(audio_text)
    seg_files = []
    for idx, (voice, seg) in enumerate(turns):
        sp = os.path.join(tmp_dir, f'seg_{idx}.mp3')
        await synth_segment(seg, voice, sp)
        seg_files.append(sp)
    if len(seg_files) == 1:
        os.replace(seg_files[0], out_path)
        return
    listfile = os.path.join(tmp_dir, 'list.txt')
    with open(listfile, 'w', encoding='utf-8') as f:
        for sp in seg_files:
            f.write(f"file '{sp}'\n")
    try:
        subprocess.run(
            ['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', listfile,
             '-c', 'copy', out_path],
            check=True, capture_output=True
        )
    except Exception:
        os.replace(seg_files[0], out_path)


def main():
    args = sys.argv[1:]
    dry = '--dry-run' in args
    limit = None
    if '--limit' in args:
        try:
            limit = int(args[args.index('--limit') + 1])
        except (ValueError, IndexError):
            pass
    if not os.path.exists(LISTEN_JSON):
        print(f"文件不存在: {LISTEN_JSON}，请先运行 scripts/jk/build_qbank.py --write")
        return
    data = json.load(open(LISTEN_JSON, encoding='utf-8'))
    todo = []
    for q in data:
        af = q.get('audioFile', '')
        if not af:
            continue
        out_path = os.path.join(AUDIO_DIR, af)
        if not os.path.exists(out_path):
            todo.append((q, out_path))
    print(f"待生成 {len(todo)} 个 jk 听力 MP3")
    if dry:
        for q, p in todo[:20]:
            print('  ', os.path.basename(p), '<=', q['audioText'][:50])
        return
    if limit:
        todo = todo[:limit]
    tmp_dir = os.path.join(AUDIO_DIR, '_tmp_jk_listen')
    os.makedirs(tmp_dir, exist_ok=True)

    async def run():
        ok = 0
        for q, out_path in todo:
            try:
                await gen_one(q['audioText'], out_path, tmp_dir)
                ok += 1
                print(f"  OK {os.path.basename(out_path)}")
            except Exception as e:
                print(f"  FAIL {os.path.basename(out_path)}: {e}")
        return ok
    ok = asyncio.run(run())
    print(f"完成 {ok}/{len(todo)}")


if __name__ == '__main__':
    main()
