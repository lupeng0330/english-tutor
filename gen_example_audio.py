# -*- coding: utf-8 -*-
"""
单词卡例句音频生成器
======================
为 data/examples/*.json 里的每条例句（words[word][i].en）生成本地 MP3，
并把文件名写回该例句对象的 audioFile 字段，让前端例句 🔊 可以
"本地 MP3 优先"播放（离线、单文件、不依赖有道在线接口）。

命名策略：内容哈希去重  ex_{md5(预处理后英文句子)[:10]}.mp3
  - 相同句子（跨文件 / 同文件重复）复用同一个 MP3，省空间。
音色：单一女声 en-US-AriaNeural（自然清晰，适合小学生例句）。

输入：data/examples/{hj_grade7_shang, hj_grade7_xia, hj_grade8_shang,
       hj_grade8_xia, hj_grade9_shang, hj_grade9_xia, jk_grade6_xia}.json
输出：audio/ex_xxxxxxxxxx.mp3 （去重后约 2.5k 个）
     + 回写各 examples 文件里每条例句的 audioFile 字段

依赖：pip install edge-tts

用法：
  python gen_example_audio.py            # 增量生成（已存在跳过），并回写 audioFile
  python gen_example_audio.py --force    # 强制覆盖所有 MP3
  python gen_example_audio.py --dry-run  # 只统计需要生成多少，不真跑 TTS
"""
import asyncio
import argparse
import hashlib
import json
import os

# 复用 gen_audio_v2 里的 TTS / 预处理逻辑，保持声音风格一致
from gen_audio_v2 import (
    FEMALE_VOICES, RATE, tts_with_retry, preprocess,
)

ROOT    = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(ROOT, "audio")
EX_DIR  = os.path.join(ROOT, "data", "examples")

# 例句固定单一女声
EXAMPLE_VOICE = "en-US-AriaNeural"

# 处理顺序固定，便于阅读日志（缺失文件自动跳过）
EX_FILES = [
    "hj_grade7_shang.json",
    "hj_grade7_xia.json",
    "hj_grade8_shang.json",
    "hj_grade8_xia.json",
    "hj_grade9_shang.json",
    "hj_grade9_xia.json",
    "jk_grade6_xia.json",
]


def example_hash(en):
    """例句 → 稳定的 10 位哈希（基于预处理后的英文文本，做内容去重）。"""
    s = preprocess(en or "").strip()
    return hashlib.md5(s.encode("utf-8")).hexdigest()[:10]


def iter_examples(data):
    """遍历一个 examples 文件里的所有例句对象，逐个 yield (word, ex)。"""
    words = (data or {}).get("words")
    if not isinstance(words, dict):
        return
    for word, arr in words.items():
        if not isinstance(arr, list):
            continue
        for ex in arr:
            if isinstance(ex, dict):
                yield word, ex


async def gen_one(fpath, en, force=False):
    """生成单条例句 MP3。返回 'ok' | 'skip' | 'empty'。"""
    if not (en or "").strip():
        return "empty"
    if (not force) and os.path.exists(fpath) and os.path.getsize(fpath) > 256:
        return "skip"
    text = preprocess(en).strip()
    await tts_with_retry(text, EXAMPLE_VOICE, fpath, FEMALE_VOICES, rate=RATE)
    return "ok"


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="已存在的 MP3 也覆盖重生成")
    parser.add_argument("--dry-run", action="store_true", help="只统计，不真跑 TTS / 不写回 JSON")
    args = parser.parse_args()

    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)

    print("[info] Voice : {}".format(EXAMPLE_VOICE))
    print("[info] Rate  : {}".format(RATE))
    print("[info] Force : {}".format(args.force))
    print("[info] Dry   : {}".format(args.dry_run))
    print("")

    # 全局去重：同一句（同 hash）只生成一次，跨文件复用
    generated = set()   # 已确认存在/已生成的 hash
    total_ex = 0        # 例句总数（含重复）
    uniq_set = set()    # 唯一句 hash 集合
    ok_count = skip_count = empty_count = fail_count = 0
    field_written = 0   # 回写 audioFile 字段的例句条数

    for fname in EX_FILES:
        fpath = os.path.join(EX_DIR, fname)
        if not os.path.exists(fpath):
            print("[warn] 缺失文件，跳过: {}".format(fname))
            continue
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)

        dirty = False
        file_ex = 0
        for word, ex in iter_examples(data):
            en = (ex.get("en") or "").strip()
            if not en:
                empty_count += 1
                continue
            total_ex += 1
            file_ex += 1
            h = example_hash(en)
            uniq_set.add(h)
            audio_file = "ex_{}.mp3".format(h)
            mp3_path = os.path.join(OUT_DIR, audio_file)

            # 回写 audioFile 字段（即便 MP3 已存在也要确保字段在）
            if ex.get("audioFile") != audio_file:
                if not args.dry_run:
                    ex["audioFile"] = audio_file
                    dirty = True
                field_written += 1

            # 生成 MP3（同 hash 在本次运行内只处理一次）
            if h in generated:
                continue
            if args.dry_run:
                if os.path.exists(mp3_path) and os.path.getsize(mp3_path) > 256:
                    skip_count += 1
                else:
                    ok_count += 1  # dry-run 下 ok_count 表示"将要生成"
                generated.add(h)
                continue
            try:
                status = await gen_one(mp3_path, en, force=args.force)
                if status == "ok":
                    ok_count += 1
                    if ok_count % 50 == 0:
                        print("  [{}] generated {} new, skip {} ...".format(
                            fname, ok_count, skip_count))
                elif status == "skip":
                    skip_count += 1
                elif status == "empty":
                    empty_count += 1
                generated.add(h)
            except Exception as e:
                fail_count += 1
                print("  [FAIL] {} :: {} :: {}".format(audio_file, en[:40], e))

        # 原子写回 JSON
        if dirty and not args.dry_run:
            tmp = fpath + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            os.replace(tmp, fpath)
            print("[info] {}  例句 {} 条，已回写 audioFile".format(fname, file_ex))
        else:
            print("[info] {}  例句 {} 条".format(fname, file_ex))

    print("")
    print("[done] 例句总数(含重复)={}  唯一句={}".format(total_ex, len(uniq_set)))
    print("[done] MP3: ok(new)={}, skip(exist)={}, empty={}, fail={}".format(
        ok_count, skip_count, empty_count, fail_count))
    print("[done] 回写 audioFile 字段 {} 条".format(field_written))


if __name__ == "__main__":
    if hasattr(asyncio, "run"):
        asyncio.run(main())
    else:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
