# -*- coding: utf-8 -*-
"""
生成听力题的 MP3（audioFile 字段对应）。
复用 gen_audio_v2.py 里的角色→音色映射（Janet→Ana、Jiamin→Ryan……），
读取 data/questions/jk_listening.json，给每一条 audioText 生成 audioFile 对应的 MP3。
"""
import asyncio
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

# 复用 gen_audio_v2 的 TTS 逻辑
from gen_audio_v2 import (
    VoiceAllocator,
    split_dialogue,
    preprocess,
    tts_with_retry,
    FEMALE_VOICES,
    MALE_VOICES,
    TMP_DIR,
    OUT_DIR,
)

QB_PATH = os.path.join(ROOT, "data", "questions", "jk_listening.json")


async def gen_one(fname, raw_text, force=False):
    fpath = os.path.join(OUT_DIR, fname)
    if (not force) and os.path.exists(fpath) and os.path.getsize(fpath) > 1024:
        return "skip", None

    raw_text = preprocess(raw_text).strip()
    parts = split_dialogue(raw_text)
    if not parts:
        return "empty", None

    # 每题一个独立 allocator（同题里同说话人用同音色）
    allocator = VoiceAllocator(seed_salt=fname)

    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR)

    base = os.path.splitext(fname)[0]
    tmp_files = []
    detail = []
    for i, (speaker, content) in enumerate(parts):
        voice = allocator.voice_for_speaker(speaker)
        pool = FEMALE_VOICES if voice in FEMALE_VOICES else MALE_VOICES
        tmp_path = os.path.join(TMP_DIR, "{}_{}.mp3".format(base, i))
        actual = await tts_with_retry(content, voice, tmp_path, pool)
        tmp_files.append(tmp_path)
        short = actual.split("-")[-1].replace("Neural", "")
        detail.append("{}→{}".format(speaker or "narr", short))

    with open(fpath, "wb") as out:
        for tmp in tmp_files:
            with open(tmp, "rb") as f:
                out.write(f.read())
    for tmp in tmp_files:
        try: os.remove(tmp)
        except Exception: pass
    return "ok", detail


async def main():
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
    with open(QB_PATH, "r", encoding="utf-8") as f:
        qs = json.load(f)

    # 只处理 grade6 下册
    targets = [q for q in qs if q.get("grade") == 6 and q.get("term") == "下" and q.get("audioFile")]
    print(f"[info] Targets (grade6 下): {len(targets)} listening MP3s")

    ok, skip, fail = 0, 0, 0
    for i, q in enumerate(targets, 1):
        fname = q["audioFile"]
        text  = q.get("audioText", "")
        try:
            status, detail = await gen_one(fname, text)
            if status == "skip":
                skip += 1
                print(f"  [{i:>3}/{len(targets)}] skip   {fname}")
            elif status == "empty":
                print(f"  [{i:>3}/{len(targets)}] empty  {fname}")
            else:
                ok += 1
                detail_str = ", ".join(detail or []) if detail else "-"
                kb = os.path.getsize(os.path.join(OUT_DIR, fname)) // 1024
                print(f"  [{i:>3}/{len(targets)}] ok     {fname}  [{kb} KB]  {detail_str}")
        except Exception as e:
            fail += 1
            print(f"  [{i:>3}/{len(targets)}] FAIL   {fname}  :: {e}")

    # 清 tmp
    try:
        if os.path.exists(TMP_DIR):
            for f in os.listdir(TMP_DIR):
                try: os.remove(os.path.join(TMP_DIR, f))
                except Exception: pass
            try: os.rmdir(TMP_DIR)
            except Exception: pass
    except Exception:
        pass

    print(f"\n[done] ok={ok} skip={skip} fail={fail}")


if __name__ == "__main__":
    asyncio.run(main())
