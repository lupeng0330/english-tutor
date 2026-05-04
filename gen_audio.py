# -*- coding: utf-8 -*-
"""
⚠️ LEGACY：旧版课文音频生成脚本（整单元一个 MP3、全女声）
已被 gen_audio_v2.py 替代（分篇 + 角色多音色）。
保留本脚本仅用于向后兼容（已有 jk.json 里 lesson 单字符串、无 lessons[] 的单元）。

新项目请使用：
    python gen_audio_v2.py --grade grade6 --term 下

乐学英语 - 音频生成脚本（V3：从 data/*.json 自动读取）
生成内容：
  1) 课文：data/textbooks/jk.json → audio/{grade}_{unitId}.mp3（全部单女声 Aria）
  2) 听力：data/questions/jk_listening.json → audio/{audioFile}（W:→Aria女声, M:→Guy男声）
使用 Microsoft Edge 的免费 Neural TTS（无需 API Key）
"""
import asyncio
import json
import os
import re
import edge_tts

VOICE_FEMALE = "en-US-AriaNeural"   # 女声
VOICE_MALE   = "en-US-GuyNeural"    # 男声
RATE = "-10%"   # 稍放慢给小学生听

ROOT      = os.path.dirname(os.path.abspath(__file__))
OUT_DIR   = os.path.join(ROOT, "audio")
TMP_DIR   = os.path.join(OUT_DIR, "_tmp")
TEXTBOOK  = os.path.join(ROOT, "data", "textbooks",  "jk.json")
LISTENING = os.path.join(ROOT, "data", "questions",  "jk_listening.json")


def preprocess_lesson(text):
    """预处理课文：把数字时间转英文单词，避免 TTS 对 7:00 等格式出错。"""
    num_words = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve']
    def repl(m):
        h = int(m.group(1)); mm = int(m.group(2))
        hw = num_words[h] if 0 <= h <= 12 else str(h)
        if mm == 0:  return hw + " o'clock"
        if mm == 15: return "quarter past " + hw
        if mm == 30: return "half past " + hw
        if mm == 45: return "quarter to " + hw
        if mm < 10:  return hw + " oh " + (num_words[mm] if mm < len(num_words) else str(mm))
        return hw + " " + (num_words[mm] if mm < len(num_words) else str(mm))
    return re.sub(r"(\d{1,2}):(\d{2})", repl, text)


def parse_dialogue(raw):
    """把 'W: ... M: ... W: ...' 切成 [(role, text), ...] 列表。"""
    parts = []
    pattern = re.compile(r'\b([WM]):\s*(.*?)(?=\s+\b[WM]:|\s*$)', re.DOTALL)
    matches = pattern.findall(raw)
    if matches:
        for role, text in matches:
            text = text.strip()
            if text:
                parts.append((role, text))
    else:
        parts.append(('W', raw.strip()))
    return parts


async def tts_to_file(text, voice, fpath):
    communicate = edge_tts.Communicate(text, voice, rate=RATE)
    await communicate.save(fpath)


async def gen_lesson(fname, text):
    fpath = os.path.join(OUT_DIR, fname)
    if os.path.exists(fpath) and os.path.getsize(fpath) > 1024:
        print(f"  [skip]  {fname}")
        return
    print(f"  [gen ]  {fname} ...", end=" ", flush=True)
    await tts_to_file(preprocess_lesson(text), VOICE_FEMALE, fpath)
    print(f"OK ({os.path.getsize(fpath) // 1024} KB)")


async def gen_listening(fname, raw):
    fpath = os.path.join(OUT_DIR, fname)
    if os.path.exists(fpath) and os.path.getsize(fpath) > 1024:
        print(f"  [skip]  {fname}")
        return

    parts = parse_dialogue(preprocess_lesson(raw))
    print(f"  [gen ]  {fname} (" + ", ".join([f"{r}→{'F' if r=='W' else 'M'}" for r, _ in parts]) + ") ...", end=" ", flush=True)

    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR)

    tmp_files = []
    base = os.path.splitext(fname)[0]
    for i, (role, text) in enumerate(parts):
        voice = VOICE_FEMALE if role == 'W' else VOICE_MALE
        tmp_path = os.path.join(TMP_DIR, f"{base}_{i}.mp3")
        await tts_to_file(text, voice, tmp_path)
        tmp_files.append(tmp_path)

    # MP3 二进制拼接
    with open(fpath, 'wb') as out:
        for tmp in tmp_files:
            with open(tmp, 'rb') as f:
                out.write(f.read())

    for tmp in tmp_files:
        try: os.remove(tmp)
        except: pass

    print(f"OK ({os.path.getsize(fpath) // 1024} KB)")


async def main():
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)

    # 读取教材
    with open(TEXTBOOK, 'r', encoding='utf-8') as f:
        textbook = json.load(f)

    # 读取听力题
    with open(LISTENING, 'r', encoding='utf-8') as f:
        listening_qs = json.load(f)

    # 统计
    lesson_tasks = []
    for grade_key, terms in textbook['grades'].items():
        # grade_key: grade1, grade2, ...
        for term_name, units in terms.items():
            # term_name: '上' -> A, '下' -> B（与前端 app.js 命名规则对齐）
            term_ab = 'A' if term_name == '上' else 'B'
            for u in units:
                fname = f"{grade_key}{term_ab}_{u['id']}.mp3"
                lesson_tasks.append((fname, u['lesson']))

    listening_tasks = []
    for q in listening_qs:
        if 'audioFile' in q and 'audioText' in q:
            listening_tasks.append((q['audioFile'], q['audioText']))

    print(f"[info] Female voice: {VOICE_FEMALE}")
    print(f"[info] Male voice:   {VOICE_MALE}")
    print(f"[info] Rate: {RATE}")
    print(f"[info] Lessons:     {len(lesson_tasks)}")
    print(f"[info] Listenings:  {len(listening_tasks)}\n")

    print("---- 课文朗读（全女声）----")
    for fname, text in lesson_tasks:
        try:
            await gen_lesson(fname, text)
        except Exception as e:
            print(f"FAIL: {e}")

    print("\n---- 听力题（W→女声, M→男声）----")
    for fname, text in listening_tasks:
        try:
            await gen_listening(fname, text)
        except Exception as e:
            print(f"FAIL: {e}")

    # 清理 _tmp
    if os.path.exists(TMP_DIR):
        try:
            for f in os.listdir(TMP_DIR):
                os.remove(os.path.join(TMP_DIR, f))
            os.rmdir(TMP_DIR)
        except: pass

    print("\n[done] All audio files generated.")


if __name__ == "__main__":
    asyncio.run(main())
