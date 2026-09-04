# -*- coding: utf-8 -*-
"""
单词卡发音音频生成器
======================
为 data/textbooks/*.json 里所有单词（grades.*.[上/下][*].words[*].word）
生成本地 MP3，让单词卡「🔊 发音 / ✓ 认识」可离线、稳定发音，不再 100% 依赖
有道在线接口（前端 speak() 改为「本地 MP3 优先 → 有道 → 浏览器 TTS」）。

命名策略：确定性文件名（前端可用同样规则拼出路径，无需 hash 库）
  key = word.strip().lower() 后，把非 [a-z0-9] 连续段替换为 '_'，去掉首尾 '_'
  文件 = audio/word_{key}.mp3
  例：apple → word_apple.mp3   "get up" → word_get_up.mp3

音色：单一清晰女声 en-US-AriaNeural（与例句一致），语速沿用 RATE(-8%)，
      适合小学生跟读。

依赖：pip install edge-tts

用法：
  python gen_word_audio.py            # 增量生成（已存在跳过）
  python gen_word_audio.py --force    # 强制覆盖所有 MP3
  python gen_word_audio.py --dry-run  # 只统计需要生成多少，不真跑 TTS
  python gen_word_audio.py --limit 100  # 单次最多生成 100 个新 MP3（分批）
"""
import asyncio
import argparse
import glob
import json
import os
import re

# 复用 gen_audio_v2 里的 TTS / 预处理逻辑，保持声音风格一致
from gen_audio_v2 import (
    FEMALE_VOICES, RATE, tts_with_retry, preprocess,
)

ROOT         = os.path.dirname(os.path.abspath(__file__))
OUT_DIR      = os.path.join(ROOT, "audio")
TEXTBOOK_DIR = os.path.join(ROOT, "data", "textbooks")

# 单词固定单一清晰女声
WORD_VOICE = "en-US-AriaNeural"


def word_key(word):
    """单词 → 确定性文件名 key（与前端 _wordAudioKey 规则保持一致）。"""
    s = (word or "").strip().lower()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    s = re.sub(r"^_+|_+$", "", s)
    return s


def collect_words():
    """遍历所有教材 JSON，收集去重单词。返回 {key: word_original}。
    key 冲突时保留首个，并打印告警。"""
    result = {}
    collisions = []
    for f in sorted(glob.glob(os.path.join(TEXTBOOK_DIR, "*.json"))):
        # 跳过例句文件 / 题库等非教材（教材含 grades 键）
        try:
            data = json.load(open(f, "r", encoding="utf-8"))
        except Exception:
            continue
        grades = data.get("grades")
        if not isinstance(grades, dict):
            continue
        for gk, terms in grades.items():
            if not isinstance(terms, dict):
                continue
            for tn, units in terms.items():
                if not isinstance(units, list):
                    continue
                for u in units:
                    for w in (u.get("words") or []):
                        if not isinstance(w, dict):
                            continue
                        wd = (w.get("word") or "").strip()
                        if not wd:
                            continue
                        k = word_key(wd)
                        if not k:
                            continue
                        if k in result and result[k].lower() != wd.lower():
                            collisions.append((k, result[k], wd))
                            continue
                        result.setdefault(k, wd)
    if collisions:
        print("[warn] {} 个 key 冲突（不同单词清洗后同名，已保留首个）:".format(len(collisions)))
        for k, a, b in collisions[:10]:
            print("        key={} : '{}' vs '{}'".format(k, a, b))
    return result


async def gen_one(fpath, word, force=False):
    """生成单条单词 MP3。返回 'ok' | 'skip' | 'empty'。"""
    if not (word or "").strip():
        return "empty"
    if (not force) and os.path.exists(fpath) and os.path.getsize(fpath) > 256:
        return "skip"
    text = preprocess(word).strip()
    await tts_with_retry(text, WORD_VOICE, fpath, FEMALE_VOICES, rate=RATE)
    return "ok"


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="已存在的 MP3 也覆盖重生成")
    parser.add_argument("--dry-run", action="store_true", help="只统计，不真跑 TTS")
    parser.add_argument("--limit", type=int, default=0, help="单次最多生成多少个新 MP3（0=无限制），便于分批")
    args = parser.parse_args()

    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)

    words = collect_words()
    print("[info] Voice : {}".format(WORD_VOICE))
    print("[info] Rate  : {}".format(RATE))
    print("[info] Force : {}".format(args.force))
    print("[info] Dry   : {}".format(args.dry_run))
    print("[info] 去重单词数: {}".format(len(words)))
    print("")

    ok_count = skip_count = empty_count = fail_count = 0
    for i, (k, wd) in enumerate(sorted(words.items()), 1):
        fname = "word_{}.mp3".format(k)
        fpath = os.path.join(OUT_DIR, fname)

        if args.dry_run:
            if os.path.exists(fpath) and os.path.getsize(fpath) > 256:
                skip_count += 1
            else:
                ok_count += 1  # dry-run 下 ok 表示"将要生成"
            continue

        try:
            status = await gen_one(fpath, wd, force=args.force)
            if status == "ok":
                ok_count += 1
                if ok_count % 25 == 0:
                    print("  [{:>4}/{}] generated {} new, skip {} ...".format(
                        i, len(words), ok_count, skip_count))
            elif status == "skip":
                skip_count += 1
            elif status == "empty":
                empty_count += 1
        except Exception as e:
            fail_count += 1
            print("  [FAIL] {} :: {} :: {}".format(fname, wd[:30], e))

        if args.limit and ok_count >= args.limit:
            print("  [limit] 已生成 {} 个达到上限，提前结束本次运行".format(ok_count))
            break

    print("")
    if args.dry_run:
        print("[dry-run] 将生成 {} 个新 MP3，已存在跳过 {} 个（共 {} 个单词）".format(
            ok_count, skip_count, len(words)))
    else:
        print("[done] MP3: ok(new)={}, skip(exist)={}, empty={}, fail={}".format(
            ok_count, skip_count, empty_count, fail_count))


if __name__ == "__main__":
    if hasattr(asyncio, "run"):
        asyncio.run(main())
    else:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
