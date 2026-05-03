# -*- coding: utf-8 -*-
"""
乐学英语 - 音频生成脚本（V2：听力题男女声区分）
使用 Microsoft Edge 的免费 Neural TTS：
  - 课文：Aria 女声 (en-US-AriaNeural)
  - 听力对话：W: → Aria 女声；M: → Guy 男声 (en-US-GuyNeural)
    实现方式：拆成多段分别生成 mp3，再按顺序二进制拼接
"""
import asyncio
import os
import re
import edge_tts

VOICE_FEMALE = "en-US-AriaNeural"   # 女声（Aria，最自然的美式女声）
VOICE_MALE   = "en-US-GuyNeural"    # 男声（Guy，标准美式男声）
RATE = "-10%"   # 稍放慢给小学生听
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")
TMP_DIR = os.path.join(OUT_DIR, "_tmp")

# ==================== 课文朗读 ====================
LESSONS = [
    ("grade3", "u1", "Look at my bag. There are books, pens and pencils in it. This is my school bag. I like it very much."),
    ("grade3", "u2", "I get up at seven o'clock. I have breakfast at seven thirty. Then I go to school. I have lunch at twelve o'clock. I go home at five o'clock."),
    ("grade4", "u1", "This is my room. There is a bed, a desk and a chair in it. There is a window near the desk. I like my room very much."),
    ("grade4", "u2", "I like vegetables and fruit. They are healthy. I have rice and noodles too. What's your favorite food?"),
    ("grade5", "u1", "What do you want to be when you grow up? I want to be a scientist. I want to help people. My brother wants to be an engineer."),
    ("grade5", "u2", "The Earth is our home. We should protect it. We should save water and plant more trees. We should not pollute rivers."),
    ("grade6", "u1", "How tall are you, Mike? I'm 165 cm tall. I'm taller than you. How old is your brother? He is 12. He is younger than me."),
    ("grade6", "u2", "What did you do last weekend? I visited my grandparents. I cleaned my room and washed my clothes. It was a busy weekend."),
    ("grade6", "u3", "Being polite is important. We say 'please' when we ask for help. We say 'thank you' when others help us. We say 'sorry' when we make a mistake."),
    ("grade7", "u1", "Today is Sunday. The weather is sunny. I went to the library in the morning. I read books there. In the afternoon, I played basketball with my friends."),
    ("grade8", "u1", "What's the matter, Tom? I have a bad cold and a headache. You should drink hot water and take some medicine. Thank you for your advice."),
    ("grade8", "u2", "Reading is a good hobby. It can help you learn many things. You can read at home, in the library or in the park. Reading makes you smart."),
    ("grade9", "u1", "The Great Wall is one of the most famous places in China. It is about 21196 kilometers long. It is a wonder of the world. Many people visit it every year."),
]

# ==================== 听力题（原始对话文本，保留 W:/M: 前缀）====================
# 注意：顺序严格和 questionBank.js 的 listening 数组对应
LISTENING = [
    "W: Hello, I'm Amy. M: Hi, Amy.",                             # 01 - 3A_U1
    "M: I get up at seven o'clock.",                              # 02 - 3B_U4
    "W: There is a big playground in our school.",                # 03 - 4A_U6
    "M: I like bananas. They're sweet.",                          # 04 - 4B_U10
    "W: My father is a doctor. He works in a hospital.",          # 05 - 5A_U3
    "M: We should plant more trees.",                             # 06 - 5B_U7
    "W: I will go to Beijing this holiday.",                      # 07 - 6A_U9
    "M: I usually go to school by bus.",                          # 08 - 7A_U5
    "W: The movie is very interesting.",                          # 09 - 8A_U2
    "M: I have learned English for 5 years.",                     # 10 - 9A_U4
]


def parse_dialogue(raw):
    """把 'W: ... M: ... W: ...' 切成 [(role, text), ...] 列表。
    role 是 'W' 或 'M'，text 去掉前缀。
    找不到 W:/M: 前缀时，整段默认用 W (女声)。
    """
    parts = []
    # 匹配 W: 或 M: 开头，一直到下一个 W:/M: 前
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
        print(f"[skip] {fname} (already exists)")
        return
    print(f"[gen]  {fname} (female) ...", end=" ", flush=True)
    await tts_to_file(text, VOICE_FEMALE, fpath)
    print(f"OK ({os.path.getsize(fpath) // 1024} KB)")


async def gen_listening(idx, raw):
    """生成一条听力题音频：按 W/M 拆分，分别 TTS 后拼接成 1 个 mp3。"""
    fname = f"listening_{idx:02d}.mp3"
    fpath = os.path.join(OUT_DIR, fname)
    if os.path.exists(fpath) and os.path.getsize(fpath) > 1024:
        # 因为要更新成男女声区分，强制覆盖
        pass

    parts = parse_dialogue(raw)
    print(f"[gen]  {fname} ({len(parts)} segments: " +
          ", ".join([f"{r}→{'F' if r=='W' else 'M'}" for r, _ in parts]) + ") ...",
          end=" ", flush=True)

    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR)

    # 每个片段生成临时 mp3
    tmp_files = []
    for i, (role, text) in enumerate(parts):
        voice = VOICE_FEMALE if role == 'W' else VOICE_MALE
        tmp_path = os.path.join(TMP_DIR, f"listen{idx:02d}_{i}.mp3")
        await tts_to_file(text, voice, tmp_path)
        tmp_files.append(tmp_path)

    # MP3 二进制拼接（MP3 帧是独立的，直接 concat 就能播放）
    with open(fpath, 'wb') as out:
        for tmp in tmp_files:
            with open(tmp, 'rb') as f:
                out.write(f.read())
            # 可以在每段之间加一个静音 placeholder，但为了简单先不加
            # （Aria/Guy 读完都有自然尾音停顿，听感没问题）

    # 清理临时文件
    for tmp in tmp_files:
        try: os.remove(tmp)
        except: pass

    print(f"OK ({os.path.getsize(fpath) // 1024} KB)")


async def main():
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
    print(f"[info] Female voice: {VOICE_FEMALE}")
    print(f"[info] Male voice:   {VOICE_MALE}")
    print(f"[info] Rate: {RATE}, Output: {OUT_DIR}")
    print(f"[info] Lessons: {len(LESSONS)}, Listenings: {len(LISTENING)}\n")

    print("---- 课文朗读（全女声）----")
    for grade, uid, text in LESSONS:
        try:
            await gen_lesson(f"{grade}_{uid}.mp3", text)
        except Exception as e:
            print(f"FAIL: {e}")

    print("\n---- 听力题（男女声区分）----")
    for i, text in enumerate(LISTENING, start=1):
        try:
            await gen_listening(i, text)
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
