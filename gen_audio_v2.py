# -*- coding: utf-8 -*-
"""
乐学英语 · 课文音频生成 V2（分篇 + 角色多音色）
==============================================
新特性：
  1. 按 unit.lessons[] 逐篇生成 MP3，文件名：{grade}{A|B}_{uid}_L{i}.mp3
  2. 对话行（"Name: ..."）按角色名自动分配不同男女声，同一说话人音色稳定
  3. 故事段落（非对话）用默认女声
  4. 兼容旧的 unit.lesson 单字符串（生成 1 个 L0 文件）
  5. 已存在且非空的文件默认跳过，用 --force 强制重生

依赖：pip install edge-tts

用法：
  python gen_audio_v2.py                  # 只处理 grade6.下
  python gen_audio_v2.py --all            # 处理所有年级所有学期
  python gen_audio_v2.py --grade grade6 --term 下
  python gen_audio_v2.py --force          # 已存在也覆盖
"""
import asyncio
import argparse
import json
import os
import re
import hashlib
import edge_tts

ROOT     = os.path.dirname(os.path.abspath(__file__))
OUT_DIR  = os.path.join(ROOT, "audio")
TEXTBOOK = os.path.join(ROOT, "data", "textbooks", "jk.json")
TMP_DIR  = os.path.join(OUT_DIR, "_tmp")

# 语速（给小学生听稍慢）
RATE = "-8%"

# 声音池：按语气 / 年龄层分组，用于角色自动分配
FEMALE_VOICES = [
    "en-US-AriaNeural",        # 知性女声（默认叙述）
    "en-US-JennyNeural",       # 活泼成年女声
    "en-US-AnaNeural",         # 童声（女童/小女孩）
    "en-US-EmmaNeural",        # 年轻女声
    "en-GB-SoniaNeural",       # 英式女声（老师 / 英国角色）
]
MALE_VOICES = [
    "en-US-GuyNeural",         # 成熟男声（默认叙述）
    "en-US-DavisNeural",       # 年轻男声
    "en-US-ChristopherNeural", # 沉稳男声
    "en-US-BrandonNeural",     # 童声（男童 / 小男孩）
    "en-GB-RyanNeural",        # 英式男声
]

NARRATOR_VOICE = "en-US-AriaNeural"   # 故事叙述默认
TEACHER_VOICE  = "en-GB-SoniaNeural"  # 老师默认

# 常见英文名 → 性别（用于自动猜说话人性别）
# 来源：课本里 Success with English / 教科版常见角色
NAME_GENDER = {
    # 女孩 / 女老师
    "amy": "F", "lily": "F", "janet": "F", "xiaoling": "F", "mum": "F",
    "ms": "F", "miss": "F", "mrs": "F", "sue": "F", "ann": "F",
    "emma": "F", "jenny": "F", "mary": "F", "kate": "F", "lucy": "F",
    # 男孩 / 男老师
    "tom": "M", "mike": "M", "ben": "M", "jiamin": "M", "andy": "M",
    "dad": "M", "mr": "M", "sir": "M", "jack": "M", "bob": "M",
    "john": "M", "peter": "M", "david": "M", "sam": "M",
}

# 一些约定俗成：名字里含这些关键词直接定性
FEMALE_HINTS = ["grandma", "mother", "sister", "teacher", "girl", "ms", "mrs", "miss"]
MALE_HINTS   = ["grandpa", "father", "brother", "boy", "mr", "sir"]


def preprocess(text):
    """把时间 7:00 转成 seven o'clock，避免 TTS 念成 7 冒号 0。"""
    num_words = ['zero','one','two','three','four','five','six','seven',
                 'eight','nine','ten','eleven','twelve']
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


def guess_gender(name):
    """根据说话人名字猜男女。返回 'F'/'M'/None（None=未知）。"""
    key = name.strip().lower().rstrip(".")
    if key in NAME_GENDER:
        return NAME_GENDER[key]
    for h in FEMALE_HINTS:
        if h in key: return "F"
    for h in MALE_HINTS:
        if h in key: return "M"
    return None


def split_dialogue(text):
    """
    把课文拆成 [(speaker, content), ...]。
    speaker=None 代表叙述段（故事）。
    能识别 'Tom: Hi.' 'Ms Li: ...' 'Xiaoling：...' （中英冒号都支持）
    """
    result = []
    if not text:
        return result
    # 把整段按行拆，然后合并连续的非对话行为一个叙述块
    lines = [ln.strip() for ln in re.split(r"\r?\n", text) if ln.strip()]
    narration_buf = []

    # 匹配行首 "Name:" 或 "Name：" ，Name 可含空格（如 "Ms Li"）
    speaker_pat = re.compile(r"^([A-Za-z][A-Za-z .'\-]{0,24}?)\s*[:：]\s*(.*)$")

    def flush_narration():
        if narration_buf:
            result.append((None, " ".join(narration_buf).strip()))
            narration_buf.clear()

    for ln in lines:
        m = speaker_pat.match(ln)
        if m:
            flush_narration()
            speaker = m.group(1).strip()
            content = m.group(2).strip()
            if content:
                result.append((speaker, content))
        else:
            narration_buf.append(ln)
    flush_narration()
    return result


def stable_hash_int(s):
    """根据字符串生成一个稳定的正整数。"""
    h = hashlib.md5(s.encode("utf-8")).hexdigest()
    return int(h[:8], 16)


class VoiceAllocator:
    """
    为一个课文篇内的所有说话人分配稳定的声音。
    同一说话人 → 同一音色；不同说话人尽量用不同音色。
    """
    def __init__(self, seed_salt=""):
        self.seed_salt = seed_salt
        self.assigned = {}  # speaker_lower -> voice

    def voice_for_speaker(self, speaker):
        if not speaker:
            return NARRATOR_VOICE
        key = speaker.strip().lower()
        if key in self.assigned:
            return self.assigned[key]
        gender = guess_gender(speaker)
        # 根据哈希在对应性别池里选一个
        seed = stable_hash_int(self.seed_salt + "|" + key)
        if gender == "F":
            pool = FEMALE_VOICES
        elif gender == "M":
            pool = MALE_VOICES
        else:
            # 未知性别：偶数哈希取女、奇数取男（保持在同一篇课文里一致）
            pool = FEMALE_VOICES if (seed % 2 == 0) else MALE_VOICES
        # 避免同篇里多个角色撞同一把声音：优先挑尚未用过的
        used = set(self.assigned.values())
        # 按哈希偏移遍历池，挑第一个没用过的
        start = seed % len(pool)
        chosen = None
        for i in range(len(pool)):
            cand = pool[(start + i) % len(pool)]
            if cand not in used:
                chosen = cand
                break
        if chosen is None:
            chosen = pool[start]
        self.assigned[key] = chosen
        return chosen


async def tts_to_file(text, voice, fpath, rate=RATE):
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    await communicate.save(fpath)


async def tts_with_retry(text, voice, fpath, gender_pool, rate=RATE):
    """edge-tts 偶尔对某把声音返回空音频 → 自动换一把同性别声音重试。"""
    # 首次尝试
    last_err = None
    try:
        await tts_to_file(text, voice, fpath, rate=rate)
        if os.path.exists(fpath) and os.path.getsize(fpath) > 256:
            return voice
    except Exception as e:
        last_err = e

    # 换同性别池里的其它声音依次重试
    for alt in gender_pool:
        if alt == voice:
            continue
        try:
            await tts_to_file(text, alt, fpath, rate=rate)
            if os.path.exists(fpath) and os.path.getsize(fpath) > 256:
                return alt
        except Exception as e:
            last_err = e
            continue
    # 都不行 → 抛原错
    raise last_err if last_err else RuntimeError("tts empty for: " + text[:40])


async def gen_lesson_audio(fpath, en_text, seed_salt, force=False):
    """
    把一篇课文（含对话+叙述）生成一个 MP3。
    内部按说话人分片 TTS，再二进制拼接。
    """
    if (not force) and os.path.exists(fpath) and os.path.getsize(fpath) > 1024:
        return "skip", None

    en_text = preprocess(en_text).strip()
    parts = split_dialogue(en_text)
    if not parts:
        return "empty", None

    allocator = VoiceAllocator(seed_salt=seed_salt)

    if not os.path.exists(TMP_DIR):
        os.makedirs(TMP_DIR)

    base = os.path.splitext(os.path.basename(fpath))[0]
    tmp_files = []
    detail = []
    for i, (speaker, content) in enumerate(parts):
        voice = allocator.voice_for_speaker(speaker)
        # 同性别池，用于失败重试
        pool = FEMALE_VOICES if voice in FEMALE_VOICES else MALE_VOICES
        tmp_path = os.path.join(TMP_DIR, "{}_{}.mp3".format(base, i))
        actual_voice = await tts_with_retry(content, voice, tmp_path, pool)
        tmp_files.append(tmp_path)
        short_voice = actual_voice.split("-")[-1].replace("Neural", "")
        detail.append("{}→{}".format(speaker or "narr", short_voice))

    # 二进制拼接
    with open(fpath, "wb") as out:
        for tmp in tmp_files:
            with open(tmp, "rb") as f:
                out.write(f.read())
    # 清临时
    for tmp in tmp_files:
        try: os.remove(tmp)
        except Exception: pass

    return "ok", detail


def iter_target_units(textbook, only_grade=None, only_term=None):
    """遍历要生成音频的单元，返回 (grade_key, term_name, term_ab, unit) 元组。"""
    for grade_key, terms in textbook["grades"].items():
        if only_grade and grade_key != only_grade:
            continue
        for term_name, units in terms.items():
            if only_term and term_name != only_term:
                continue
            term_ab = "A" if term_name == "上" else "B"
            for u in units:
                yield grade_key, term_name, term_ab, u


def get_lessons(unit):
    """规整化：优先 lessons[]，否则 lesson/lessonCN 兜底为单篇。返回 [(title, en), ...]。"""
    arr = unit.get("lessons")
    if isinstance(arr, list) and arr:
        out = []
        for ls in arr:
            en = (ls.get("en") or "").strip()
            if en:
                page = (ls.get("page") or "").strip()
                title = (ls.get("title") or "").strip()
                label = " · ".join([x for x in [page, title] if x])
                out.append((label or "lesson", en))
        return out
    # 旧格式
    legacy = (unit.get("lesson") or "").strip()
    if legacy:
        return [("lesson", legacy)]
    return []


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--all", action="store_true", help="处理所有年级所有学期")
    parser.add_argument("--grade", default="grade6", help="年级 key，如 grade6（默认）")
    parser.add_argument("--term", default="下", help="学期：上/下（默认：下）")
    parser.add_argument("--force", action="store_true", help="已存在也覆盖")
    args = parser.parse_args()

    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)

    with open(TEXTBOOK, "r", encoding="utf-8") as f:
        textbook = json.load(f)

    if args.all:
        only_grade = None
        only_term  = None
    else:
        only_grade = args.grade
        only_term  = args.term

    # 汇总任务
    tasks = []  # (fname, en, seed_salt, label)
    for grade_key, term_name, term_ab, u in iter_target_units(textbook, only_grade, only_term):
        lessons = get_lessons(u)
        for i, (label, en) in enumerate(lessons):
            fname = "{}{}_{}_L{}.mp3".format(grade_key, term_ab, u["id"], i)
            seed_salt = "{}|{}".format(grade_key, u["id"])
            tasks.append((fname, en, seed_salt, label))

    print("[info] Rate: {}".format(RATE))
    print("[info] Female pool: {} voices".format(len(FEMALE_VOICES)))
    print("[info] Male   pool: {} voices".format(len(MALE_VOICES)))
    print("[info] Tasks: {}".format(len(tasks)))
    if only_grade or only_term:
        print("[info] Filter: grade={}, term={}".format(only_grade or "ALL", only_term or "ALL"))
    print("[info] Force : {}".format(args.force))
    print("")

    ok_count, skip_count, fail_count = 0, 0, 0
    for i, (fname, en, seed_salt, label) in enumerate(tasks, 1):
        fpath = os.path.join(OUT_DIR, fname)
        try:
            status, detail = await gen_lesson_audio(fpath, en, seed_salt, force=args.force)
            if status == "skip":
                skip_count += 1
                print("  [{:>3}/{}] skip  {}  ({})".format(i, len(tasks), fname, label))
            elif status == "empty":
                print("  [{:>3}/{}] empty {}  (no content)".format(i, len(tasks), fname))
            else:
                ok_count += 1
                detail_str = ", ".join(detail or []) if detail else "-"
                size_kb = os.path.getsize(fpath) // 1024
                print("  [{:>3}/{}] ok    {}  [{}]  ({} KB)  {}".format(
                    i, len(tasks), fname, label, size_kb, detail_str))
        except Exception as e:
            fail_count += 1
            print("  [{:>3}/{}] FAIL  {}  ({})  :: {}".format(i, len(tasks), fname, label, e))

    # 清理
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
