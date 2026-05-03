# -*- coding: utf-8 -*-
"""
乐学英语 - 音频生成脚本
使用 Microsoft Edge 的免费 Neural TTS 生成所有需要朗读的英文 MP3：
  1) 课文朗读：audio/grade{N}_{unitId}.mp3
  2) 听力题：audio/listening_{XX}.mp3 (两位数序号，对应 questionBank.js 中 listening 数组的 index+1)
"""
import asyncio
import os
import edge_tts

# 语音：Aria 是 Microsoft 最自然的美式女声 Neural TTS（免费、质量接近真人）
VOICE = "en-US-AriaNeural"
RATE = "-10%"   # 稍放慢给小学生听
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")

# ==================== 课文朗读（与 app.js 完全对应）====================
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

# ==================== 听力题（与 questionBank.js 的 listening 数组一一对应）====================
# 注意：顺序必须和 questionBank.js 中 listening 数组完全一致！
# 对话预处理：W:/M: 前缀转成 Woman says / Man says，数字时间转英文
LISTENING = [
    # 1 - 3A_U1
    "Woman: Hello, I'm Amy. Man: Hi, Amy.",
    # 2 - 3B_U4
    "Man: I get up at seven o'clock.",
    # 3 - 4A_U6
    "Woman: There is a big playground in our school.",
    # 4 - 4B_U3
    "Man: I like bananas. They're sweet.",
    # 5 - 5A_U2
    "Woman: My father is a doctor. He works in a hospital.",
    # 6 - 5B_U7
    "Man: We should plant more trees.",
    # 7 - 6A_U3
    "Woman: I will go to Beijing this holiday.",
    # 8 - 6B_U5
    "Man: I usually go to school by bus.",
    # 9 - 7A_U4
    "Woman: The movie is very interesting.",
    # 10 - 9A_U1
    "Man: I have learned English for 5 years.",
]


async def gen_one(fname, text):
    fpath = os.path.join(OUT_DIR, fname)
    if os.path.exists(fpath) and os.path.getsize(fpath) > 1024:
        print(f"[skip] {fname} (already exists)")
        return
    print(f"[gen]  {fname} ...", end=" ", flush=True)
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE)
    await communicate.save(fpath)
    size = os.path.getsize(fpath)
    print(f"OK ({size // 1024} KB)")


async def main():
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
    print(f"[info] Voice: {VOICE}, Rate: {RATE}")
    print(f"[info] Output: {OUT_DIR}")
    print(f"[info] Lessons: {len(LESSONS)}, Listenings: {len(LISTENING)}\n")

    print("---- 课文朗读 ----")
    for grade, uid, text in LESSONS:
        try:
            await gen_one(f"{grade}_{uid}.mp3", text)
        except Exception as e:
            print(f"FAIL: {e}")

    print("\n---- 听力题 ----")
    for i, text in enumerate(LISTENING, start=1):
        try:
            await gen_one(f"listening_{i:02d}.mp3", text)
        except Exception as e:
            print(f"FAIL: {e}")

    print("\n[done] All audio files generated.")


if __name__ == "__main__":
    asyncio.run(main())
