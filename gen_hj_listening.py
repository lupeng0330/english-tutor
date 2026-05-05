# -*- coding: utf-8 -*-
"""
沪教版听力题音频生成器
========================
专门处理 data/questions/hj_listening.json 里的听力题，按 audioText 字段
识别 "W: ...", "M: ..." 两人对话，自动分配 女声 / 男声 多角色 TTS。

输入：data/questions/hj_listening.json
输出：audio/hj_listening_g7_01.mp3 ~ audio/hj_listening_g7_32.mp3

依赖：pip install edge-tts

用法：
  python gen_hj_listening.py              # 增量生成（已存在跳过）
  python gen_hj_listening.py --force      # 强制覆盖
  python gen_hj_listening.py --only 3,5,7 # 只重做指定题号
"""
import asyncio
import argparse
import json
import os
import re

# 复用 gen_audio_v2 里的拼接/重试逻辑，保持声音风格一致
from gen_audio_v2 import (
    FEMALE_VOICES, MALE_VOICES, RATE, TMP_DIR,
    tts_with_retry, preprocess,
)

ROOT       = os.path.dirname(os.path.abspath(__file__))
OUT_DIR    = os.path.join(ROOT, "audio")
LISTENING  = os.path.join(ROOT, "data", "questions", "hj_listening.json")

# 听力题固定双人：女声叙述方 / 男声叙述方
# 选择成熟稳定的主播声，便于小学生辨识
FEMALE_VOICE = "en-US-JennyNeural"    # W: 女声
MALE_VOICE   = "en-US-GuyNeural"      # M: 男声


def split_listening_dialogue(text):
    """
    把 'W: ... M: ... W: ...' 拆成 [(speaker, content), ...]
    speaker ∈ {'W', 'M'}；若没有标注则默认 'W'。
    """
    if not text:
        return []
    # 统一中英文冒号，把 W: / M: 作为分段锚点
    t = text.replace("：", ":").strip()
    # 用正则在每个 W:/M: 前切分
    # 保留分隔符：(?=[WM]:) 前瞻
    segs = re.split(r"(?=\b[WMwm]\s*:)", t)
    out = []
    for seg in segs:
        seg = seg.strip()
        if not seg:
            continue
        m = re.match(r"^([WMwm])\s*:\s*(.*)$", seg, re.DOTALL)
        if m:
            spk = m.group(1).upper()
            content = m.group(2).strip()
            if content:
                out.append((spk, content))
        else:
            # 没有 W:/M: 前缀，默认按女声叙述
            out.append(("W", seg))
    return out


async def gen_one_listening(fpath, audio_text, force=False):
    """
    生成一道听力题的完整 MP3（W/M 对话拼接）。
    返回 ('ok'|'skip'|'empty', detail_list or None)
    """
    if (not force) and os.path.exists(fpath) and os.path.getsize(fpath) > 1024:
        return "skip", None

    audio_text = preprocess(audio_text).strip()
    parts = split_listening_dialogue(audio_text)
    if not parts:
        return "empty", None

    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR)

    base = os.path.splitext(os.path.basename(fpath))[0]
    tmp_files = []
    detail = []
    for i, (spk, content) in enumerate(parts):
        if spk == "M":
            voice = MALE_VOICE
            pool  = MALE_VOICES
        else:
            voice = FEMALE_VOICE
            pool  = FEMALE_VOICES
        tmp_path = os.path.join(TMP_DIR, "{}_{}.mp3".format(base, i))
        actual_voice = await tts_with_retry(content, voice, tmp_path, pool, rate=RATE)
        tmp_files.append(tmp_path)
        short = actual_voice.split("-")[-1].replace("Neural", "")
        detail.append("{}→{}".format(spk, short))

    # 二进制拼接
    with open(fpath, "wb") as out:
        for tmp in tmp_files:
            with open(tmp, "rb") as f:
                out.write(f.read())
    for tmp in tmp_files:
        try: os.remove(tmp)
        except Exception: pass

    return "ok", detail


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="已存在也覆盖")
    parser.add_argument("--only",  default="", help="只重做指定题号列表，逗号分隔，例如 3,5,7")
    args = parser.parse_args()

    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
    if not os.path.exists(LISTENING):
        print("[error] 找不到听力题数据: {}".format(LISTENING))
        return

    with open(LISTENING, "r", encoding="utf-8") as f:
        questions = json.load(f)

    only_set = set()
    if args.only.strip():
        for s in args.only.split(","):
            s = s.strip()
            if s.isdigit():
                only_set.add(int(s))

    print("[info] Rate: {}".format(RATE))
    print("[info] Female: {}  Male: {}".format(FEMALE_VOICE, MALE_VOICE))
    print("[info] Tasks: {}".format(len(questions)))
    print("[info] Force : {}".format(args.force))
    if only_set:
        print("[info] Only  : {}".format(sorted(only_set)))
    print("")

    ok_count, skip_count, fail_count = 0, 0, 0
    for idx, q in enumerate(questions, 1):
        if only_set and idx not in only_set:
            continue
        audio_file = q.get("audioFile") or "hj_listening_g7_{:02d}.mp3".format(idx)
        audio_text = q.get("audioText") or ""
        fpath = os.path.join(OUT_DIR, audio_file)

        try:
            status, detail = await gen_one_listening(fpath, audio_text, force=args.force)
            if status == "skip":
                skip_count += 1
                print("  [{:>2}/{}] skip  {}".format(idx, len(questions), audio_file))
            elif status == "empty":
                print("  [{:>2}/{}] empty {}  (no audioText)".format(idx, len(questions), audio_file))
            else:
                ok_count += 1
                size_kb = os.path.getsize(fpath) // 1024
                detail_str = ", ".join(detail or [])
                print("  [{:>2}/{}] ok    {}  ({} KB)  {}".format(
                    idx, len(questions), audio_file, size_kb, detail_str))
        except Exception as e:
            fail_count += 1
            print("  [{:>2}/{}] FAIL  {}  :: {}".format(idx, len(questions), audio_file, e))

    # 清临时目录
    try:
        if os.path.exists(TMP_DIR):
            for f in os.listdir(TMP_DIR):
                try: os.remove(os.path.join(TMP_DIR, f))
                except Exception: pass
            try: os.rmdir(TMP_DIR)
            except Exception: pass
    except Exception:
        pass

    print("")
    print("[done] ok={}, skip={}, fail={}".format(ok_count, skip_count, fail_count))


if __name__ == "__main__":
    asyncio.run(main())
