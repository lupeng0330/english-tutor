# -*- coding: utf-8 -*-
"""
乐学英语 · 课文音频生成 V2（分篇 + 角色多音色 + 增量校验）
================================================================
新特性：
  1. 按 unit.lessons[] 逐篇生成 MP3，文件名：{grade}{A|B}_{uid}_L{i}.mp3
  2. 对话行（"Name: ..."）按角色名自动分配不同男女声，同一说话人音色稳定
  3. 故事段落（非对话）用默认女声
  4. 兼容旧的 unit.lesson 单字符串（生成 1 个 L0 文件）
  5. 🆕 篇级增量校验：基于 audio/.manifest.json 记录每篇 MP3 的课文文本 hash。
       - 文本未变 → skip
       - 文本已变 → 自动重生成（无需 --force）
       - manifest 里没记录的老文件 → 首次运行回填 hash，不重跑音频
  6. 🆕🆕 句级增量：每篇按"说话人/叙述句"切分，对每句计算
       hash(句文本 + 分配到的音色 + 语速)，并把单句音频持久化到
       audio/_sent/{篇base}/{hash}.mp3。重生成一篇时只对 hash 变化的句子
       重跑 TTS，未变句直接复用缓存，再按顺序二进制拼接成整篇。
       manifest 里每篇额外记录 sentences:[{idx,hash,speaker,voice}] 拼接顺序。
       —— 改一个字也只重念那一句，整篇其余句零开销。
  7. --force 强制全量重生（忽略句缓存，逐句重跑）
  8. 🆕 --dry-run 只报告"哪些课文变了 / 需要重生成 + 句级 复用/重跑 统计"，不实际跑 TTS
  9. 🆕 --stale-only 只重跑 hash 不匹配的课文（首次启用后 = 默认增量模式）

依赖：pip install edge-tts

用法：
  python gen_audio_v2.py                                  # 教科版 grade6.下（增量）
  python gen_audio_v2.py --all                            # 教科版所有年级（增量）
  python gen_audio_v2.py --grade grade6 --term 下
  python gen_audio_v2.py --force                          # 已存在也覆盖
  python gen_audio_v2.py --dry-run --all                  # 只看变更，不真跑
  python gen_audio_v2.py --stale-only --all               # 只跑 hash 变更的
  python gen_audio_v2.py --textbook hj --grade grade7 --term 上   # 沪教版七上
  python gen_audio_v2.py --textbook hj --all              # 沪教版所有年级
"""
import asyncio
import argparse
import datetime
import json
import os
import re
import hashlib
try:
    import edge_tts  # 只在真跑 TTS 时需要，dry-run / 增量检查可缺席
except ImportError:
    edge_tts = None

ROOT     = os.path.dirname(os.path.abspath(__file__))
OUT_DIR  = os.path.join(ROOT, "audio")
TEXTBOOK_DIR = os.path.join(ROOT, "data", "textbooks")
TMP_DIR  = os.path.join(OUT_DIR, "_tmp")
# 🆕 句级增量：持久化的单句音频缓存目录 audio/_sent/{篇base}/{句hash}.mp3
SENT_DIR = os.path.join(OUT_DIR, "_sent")

# 🆕 增量校验用的 manifest 文件：
#   { "<mp3_filename>": {
#       "text_hash": "md5",                # 整篇文本 hash（篇级快速 skip）
#       "textbook": "jk",
#       "generated_at": "2026-05-05T...",
#       "sentences": [                     # 🆕 句级：拼接顺序 + 每句缓存键
#         {"idx": 0, "hash": "md5", "speaker": "Tom", "voice": "en-US-GuyNeural"},
#         ...
#       ]
#     }, ... }
MANIFEST_PATH = os.path.join(OUT_DIR, ".manifest.json")


def load_manifest():
    """读取 manifest。不存在或损坏时返回空 dict。"""
    if not os.path.exists(MANIFEST_PATH):
        return {}
    try:
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception as e:
        print("[warn] manifest 读取失败，将重建: {}".format(e))
        return {}


def save_manifest(manifest):
    """原子写：先写 .tmp 再 rename，避免中断时损坏。"""
    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)
    tmp = MANIFEST_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2, sort_keys=True)
    os.replace(tmp, MANIFEST_PATH)


# 🆕 韵律/性别映射版本号：改动 NAME_GENDER / analyze_prosody / 声音池 时 +1，
#   使旧 manifest 的 text_hash 全部失效 → 课文判为 stale 重新进入生成流程，
#   届时句级缓存仍按 sentence_hash 复用未变句、只重跑受影响句（增量、高效）。
PROSODY_VERSION = "2"


def text_hash(text):
    """为课文英文文本计算稳定 hash（预处理后 + 韵律版本号）。
    版本号纳入：调整性别/韵律规则时整体判 stale，触发增量重生成。"""
    s = preprocess(text or "").strip()
    return hashlib.md5(("v" + PROSODY_VERSION + "|" + s).encode("utf-8")).hexdigest()


def sentence_hash(content, voice, rate=None, pitch=None, volume=None):
    """单句缓存键 = md5(句文本 + 音色 + 语速 + 音高 + 音量)。
    音色/语速/音高/音量全部纳入键：任一韵律参数变化时缓存自然失效，保证正确性
    （🆕 新增情感韵律后，旧缓存键自动失效 → 触发重生成，无需手动清缓存）。
    各参数默认在调用时解析（避免定义期常量尚未声明的顺序问题）。"""
    if rate is None:
        rate = RATE
    if pitch is None:
        pitch = PITCH_BASE
    if volume is None:
        volume = VOLUME_BASE
    raw = "{}|{}|{}|{}|{}".format((content or "").strip(), voice, rate, pitch, volume)
    return hashlib.md5(raw.encode("utf-8")).hexdigest()


def sent_cache_path(base, h):
    """单句音频缓存路径：audio/_sent/{篇base}/{句hash}.mp3"""
    return os.path.join(SENT_DIR, base, h + ".mp3")


def plan_sentences(en_text, seed_salt):
    """把一篇课文规划成有序句列表（不跑 TTS）：
    [{idx, speaker, content, voice, hash}, ...]
    voice 由 VoiceAllocator 按"篇内说话人出现顺序"稳定分配，故须整篇一次性规划。"""
    en_text_clean = preprocess(en_text).strip()
    parts = split_dialogue(en_text_clean)
    allocator = VoiceAllocator(seed_salt=seed_salt)
    plan = []
    for i, (speaker, content) in enumerate(parts):
        voice = allocator.voice_for_speaker(speaker)
        rate, pitch, volume = analyze_prosody(content, speaker, voice)
        plan.append({
            "idx": i,
            "speaker": speaker,
            "content": content,
            "voice": voice,
            "rate": rate,
            "pitch": pitch,
            "volume": volume,
            "hash": sentence_hash(content, voice, rate, pitch, volume),
        })
    return plan

# 教材 → 文件名前缀 映射
#   教科版 jk 覆盖 grade1~grade6；沪教版 hj 覆盖 grade7~grade9，
#   因两者年级不重叠，直接共用 audio/ 目录无前缀也不会撞名：
#     jk grade6 下 → audio/grade6B_u1_L0.mp3
#     hj grade7 上 → audio/grade7A_u1_L0.mp3
#   将来若出现同年级冲突（如 hj 也做 grade6），把对应教材前缀改为 "hj_" 即可。
TEXTBOOK_PREFIX = {
    "jk": "",
    "hj": "",
}

# 语速（给小学生听稍慢）
RATE = "-8%"

# 🆕 韵律情感基准（在 edge-tts 免费端用 rate/pitch/volume 近似"情感色彩"）
RATE_BASE_PCT = -8      # 与 RATE 一致的数值形式，便于叠加增量
PITCH_BASE  = "+0Hz"
VOLUME_BASE = "+0%"

# 童声音色集合：命中时再抬高音高/略快，听感更天真活泼
CHILD_VOICES = {"en-US-AnaNeural", "en-US-BrandonNeural"}

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
# 来源：课本里 Success with English / 教科版 / 沪教牛津版常见角色
NAME_GENDER = {
    # 女孩 / 女老师 / 女性角色
    "amy": "F", "lily": "F", "janet": "F", "xiaoling": "F", "mum": "F",
    "ms": "F", "miss": "F", "mrs": "F", "sue": "F", "ann": "F",
    "emma": "F", "jenny": "F", "mary": "F", "kate": "F", "lucy": "F",
    "anna": "F", "tina": "F", "nina": "F", "betty": "F", "daisy": "F",
    "alice": "F", "grace": "F", "rose": "F", "helen": "F", "linda": "F",
    "susan": "F", "nancy": "F", "sally": "F", "jane": "F", "anne": "F",
    "fiona": "F", "cindy": "F", "wendy": "F", "eva": "F", "julia": "F",
    "laura": "F", "sophie": "F", "ella": "F", "gina": "F", "may": "F",
    # 男孩 / 男老师 / 男性角色
    "tom": "M", "mike": "M", "ben": "M", "jiamin": "M", "andy": "M",
    "dad": "M", "mr": "M", "sir": "M", "jack": "M", "bob": "M",
    "john": "M", "peter": "M", "david": "M", "sam": "M",
    "jim": "M", "jimmy": "M", "marco": "M", "edison": "M", "eddie": "M",
    "tony": "M", "tim": "M", "joe": "M", "james": "M", "henry": "M",
    "eric": "M", "frank": "M", "daniel": "M", "bill": "M", "paul": "M",
    "george": "M", "kevin": "M", "leo": "M", "max": "M", "alan": "M",
    "simon": "M", "harry": "M", "danny": "M", "tony": "M", "victor": "M",
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


# 句首激动/呼语词：命中则轻微抬高音高+音量，让语气更生动
EXCITE_OPENERS = re.compile(
    r"^\s*(wow|oh|oops|hi|hey|hello|hooray|hurray|great|good|yeah|yay|yes|no|"
    r"look|listen|come on|let's|let us|help|sorry|thanks|thank you|please|"
    r"happy|merry|welcome|cheers|bravo|well done)\b",
    re.I,
)


def analyze_prosody(content, speaker=None, voice=None):
    """按句子语气返回 (rate, pitch, volume) 三元组 —— 免费 edge-tts 的"近似情感"层。

    规则（叠加在全局 RATE 基准 -8% 之上）：
      - 疑问句 (?)  : 音高抬高、语速略放慢 → 上扬询问感
      - 感叹句 (!)  : 语速略快、音量加大、音高抬高 → 激动/强调
      - 激动开头词  : 音高/音量轻微抬高 → 生动
      - 陈述句      : 基准（仅全局放慢）
      - 童声角色    : 在上述基础上再抬高音高、略快 → 天真活泼
    返回的 rate 是"最终值"（已含全局 -8% 基准）。
    """
    text = (content or "").strip()
    rate_pct = RATE_BASE_PCT
    pitch_hz = 0
    vol_pct  = 0

    # 末尾标点判断语气（剥掉尾部引号/括号等再看）
    tail = text.rstrip('"\'”’）)】」』 \t')
    is_question = tail.endswith("?") or tail.endswith("？")
    is_exclaim  = tail.endswith("!") or tail.endswith("！")

    if is_question:
        pitch_hz += 12
        rate_pct -= 2          # 略慢，留出询问停顿感
    elif is_exclaim:
        pitch_hz += 10
        rate_pct += 6          # 略快
        vol_pct  += 12
    elif EXCITE_OPENERS.match(text):
        pitch_hz += 6
        vol_pct  += 6

    # 童声角色更高更活泼
    if voice in CHILD_VOICES:
        pitch_hz += 12
        rate_pct += 3

    return ("{:+d}%".format(rate_pct),
            "{:+d}Hz".format(pitch_hz),
            "{:+d}%".format(vol_pct))


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


async def tts_to_file(text, voice, fpath, rate=RATE, pitch=PITCH_BASE, volume=VOLUME_BASE):
    if edge_tts is None:
        raise RuntimeError("需要 TTS 但未安装 edge_tts。请：pip install edge-tts")
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, volume=volume)
    await communicate.save(fpath)


async def tts_with_retry(text, voice, fpath, gender_pool,
                         rate=RATE, pitch=PITCH_BASE, volume=VOLUME_BASE):
    """edge-tts 偶尔对某把声音返回空音频 → 自动换一把同性别声音重试。
    韵律参数 rate/pitch/volume 在重试时一并沿用，保持情感一致。"""
    # 首次尝试
    last_err = None
    try:
        await tts_to_file(text, voice, fpath, rate=rate, pitch=pitch, volume=volume)
        if os.path.exists(fpath) and os.path.getsize(fpath) > 256:
            return voice
    except Exception as e:
        last_err = e

    # 换同性别池里的其它声音依次重试
    for alt in gender_pool:
        if alt == voice:
            continue
        try:
            await tts_to_file(text, alt, fpath, rate=rate, pitch=pitch, volume=volume)
            if os.path.exists(fpath) and os.path.getsize(fpath) > 256:
                return alt
        except Exception as e:
            last_err = e
            continue
    # 都不行 → 抛原错
    raise last_err if last_err else RuntimeError("tts empty for: " + text[:40])


def _sent_cached(base, h):
    """该句缓存文件是否已存在且有效（>256B）。"""
    p = sent_cache_path(base, h)
    return os.path.exists(p) and os.path.getsize(p) > 256


async def gen_lesson_audio(fpath, en_text, seed_salt,
                           force=False, dry_run=False,
                           stale_only=False,
                           expected_hash=None, manifest_entry=None):
    """
    把一篇课文（含对话+叙述）生成一个 MP3。
    🆕 句级增量：按句切分，仅对"无缓存/已变化"的句子跑 TTS，未变句复用
    audio/_sent/ 里的缓存，再按顺序二进制拼接成整篇。

    返回 (status, info)，info 为 dict 或 None。status 取值：
      - "skip-fresh"   : 文件存在 + manifest 整篇 hash 匹配 → 跳过
      - "skip-legacy"  : 文件存在但 manifest 无记录 → 跳过并回填 hash
      - "skip-nofile"  : 文件不存在但 stale_only=True → 跳过（仅检查变更模式）
      - "dry-stale"    : dry-run，已存在但需重生成（info 带句级 reuse/regen 统计）
      - "dry-new"      : dry-run，全新文件待生成（info 带句级统计）
      - "empty"        : 课文为空
      - "ok"           : 正常生成完成（info 带 detail / sentences / reuse / regen）
    """
    file_exists = os.path.exists(fpath) and os.path.getsize(fpath) > 1024

    # 1) 强制模式 / 已确定需要生成 → 跳过所有判断直接往下走
    if not force:
        # 2) manifest 有记录 + hash 匹配 → 最理想的 skip（篇级快速路径，行为不变）
        if file_exists and manifest_entry and expected_hash \
                and manifest_entry.get("text_hash") == expected_hash:
            return "skip-fresh", None

        # 3) 文件存在但 manifest 无记录（老文件 / 首次启用增量）→ 保留音频，只回填 hash
        if file_exists and not manifest_entry:
            return "skip-legacy", None

        # 4) stale-only 模式下，对于不存在的新文件也跳过（只关心变更的）
        if not file_exists and stale_only:
            return "skip-nofile", None

    # === 到这里说明需要"生成"或"报告要生成" ===
    base = os.path.splitext(os.path.basename(fpath))[0]
    plan = plan_sentences(en_text, seed_salt)
    if not plan:
        return "empty", None

    # 标记每句是否命中缓存（--force 时忽略缓存，强制逐句重跑）
    use_cache = not force
    for s in plan:
        s["cached"] = use_cache and _sent_cached(base, s["hash"])
    reuse = sum(1 for s in plan if s["cached"])
    regen = len(plan) - reuse
    info = {"reuse": reuse, "regen": regen, "total": len(plan)}

    # dry-run：只报告、不真跑 TTS
    if dry_run:
        return ("dry-stale" if file_exists else "dry-new"), info

    # 真生成：逐句复用/重跑 → 原子写入持久缓存 → 按序拼接
    sdir = os.path.join(SENT_DIR, base)
    if not os.path.exists(sdir):
        os.makedirs(sdir)

    detail = []
    for s in plan:
        cpath = sent_cache_path(base, s["hash"])
        if s["cached"]:
            detail.append("{}=cache".format(s["speaker"] or "narr"))
            continue
        voice = s["voice"]
        pool = FEMALE_VOICES if voice in FEMALE_VOICES else MALE_VOICES
        part_tmp = cpath + ".part"
        actual_voice = await tts_with_retry(
            s["content"], voice, part_tmp, pool,
            rate=s.get("rate", RATE),
            pitch=s.get("pitch", PITCH_BASE),
            volume=s.get("volume", VOLUME_BASE))
        os.replace(part_tmp, cpath)  # 原子落盘，避免中断留下半截缓存
        short_voice = actual_voice.split("-")[-1].replace("Neural", "")
        detail.append("{}→{}".format(s["speaker"] or "narr", short_voice))

    # 按顺序二进制拼接成整篇
    with open(fpath, "wb") as out:
        for s in plan:
            with open(sent_cache_path(base, s["hash"]), "rb") as f:
                out.write(f.read())

    info["detail"] = detail
    info["sentences"] = [{"idx": s["idx"], "hash": s["hash"],
                          "speaker": s["speaker"], "voice": s["voice"],
                          "rate": s.get("rate"), "pitch": s.get("pitch"),
                          "volume": s.get("volume")} for s in plan]
    return "ok", info


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
    parser.add_argument("--grade", default="grade6", help="年级 key，如 grade6/grade7（默认 grade6）")
    parser.add_argument("--term", default="下", help="学期：上/下（默认：下）")
    parser.add_argument("--force", action="store_true", help="已存在也覆盖（忽略 hash 比对）")
    parser.add_argument("--dry-run", action="store_true",
                        help="🆕 只报告哪些文件需要生成/重生成，不实际跑 TTS")
    parser.add_argument("--stale-only", action="store_true",
                        help="🆕 只重跑 hash 不匹配的课文（跳过全新待生成的）")
    parser.add_argument("--textbook", default="jk",
                        help="教材 ID：jk=广州教科版（默认），hj=沪教牛津版")
    args = parser.parse_args()

    if not os.path.exists(OUT_DIR):
        os.makedirs(OUT_DIR)

    tb_id = args.textbook.lower()
    if tb_id not in TEXTBOOK_PREFIX:
        print("[error] 未知教材 ID: {}（支持：{}）".format(
            tb_id, ", ".join(TEXTBOOK_PREFIX.keys())))
        return
    textbook_path = os.path.join(TEXTBOOK_DIR, "{}.json".format(tb_id))
    if not os.path.exists(textbook_path):
        print("[error] 找不到教材数据文件: {}".format(textbook_path))
        return
    prefix = TEXTBOOK_PREFIX[tb_id]

    with open(textbook_path, "r", encoding="utf-8") as f:
        textbook = json.load(f)

    if args.all:
        only_grade = None
        only_term  = None
    else:
        only_grade = args.grade
        only_term  = args.term

    # 🆕 加载 manifest（增量校验的核心）
    manifest = load_manifest()
    manifest_dirty = False

    # 汇总任务：多附加一个 text_hash 字段
    tasks = []  # (fname, en, seed_salt, label, expected_hash)
    for grade_key, term_name, term_ab, u in iter_target_units(textbook, only_grade, only_term):
        lessons = get_lessons(u)
        for i, (label, en) in enumerate(lessons):
            fname = "{}{}{}_{}_L{}.mp3".format(prefix, grade_key, term_ab, u["id"], i)
            seed_salt = "{}|{}|{}".format(tb_id, grade_key, u["id"])
            expected_hash = text_hash(en)
            tasks.append((fname, en, seed_salt, label, expected_hash))

    print("[info] Textbook: {} ({})".format(tb_id, textbook.get("meta", {}).get("name", "-")))
    print("[info] Rate: {} (情感韵律层已启用：疑问↑音高 / 感叹↑语速音量 / 童声更活泼)".format(RATE))
    print("[info] Female pool: {} voices".format(len(FEMALE_VOICES)))
    print("[info] Male   pool: {} voices".format(len(MALE_VOICES)))
    print("[info] Tasks: {}".format(len(tasks)))
    if only_grade or only_term:
        print("[info] Filter: grade={}, term={}".format(only_grade or "ALL", only_term or "ALL"))
    print("[info] Force     : {}".format(args.force))
    print("[info] Dry-run   : {}".format(args.dry_run))
    print("[info] Stale-only: {}".format(args.stale_only))
    print("[info] Manifest  : {} entries".format(len(manifest)))
    print("")

    ok_count = 0
    skip_fresh = 0     # hash 匹配的跳过
    skip_legacy = 0    # 老文件补登记
    skip_nofile = 0    # stale-only 模式下跳过的新文件
    empty_count = 0
    fail_count = 0
    dry_stale = 0      # dry-run 报告需要重生成
    dry_new = 0        # dry-run 报告全新待生成
    sent_reuse = 0     # 🆕 句级：累计复用句数
    sent_regen = 0     # 🆕 句级：累计重跑句数

    for i, (fname, en, seed_salt, label, expected_hash) in enumerate(tasks, 1):
        fpath = os.path.join(OUT_DIR, fname)
        manifest_entry = manifest.get(fname)
        try:
            status, info = await gen_lesson_audio(
                fpath, en, seed_salt,
                force=args.force,
                dry_run=args.dry_run,
                stale_only=args.stale_only,
                expected_hash=expected_hash,
                manifest_entry=manifest_entry,
            )
            if status == "skip-fresh":
                skip_fresh += 1
                # 静默跳过（量大时刷屏无意义），只在 -v 时可考虑打印
            elif status == "skip-legacy":
                skip_legacy += 1
                if args.dry_run:
                    # dry-run 不做副作用，只报告
                    print("  [{:>3}/{}] legacy {}  ({})  首次运行将回填 hash".format(
                        i, len(tasks), fname, label))
                else:
                    # 回填 manifest hash，但不重跑音频
                    manifest[fname] = {
                        "text_hash": expected_hash,
                        "textbook": tb_id,
                        "generated_at": (manifest_entry or {}).get("generated_at")
                                        or datetime.datetime.utcnow().isoformat() + "Z",
                        "legacy_import": True,
                    }
                    manifest_dirty = True
                    print("  [{:>3}/{}] legacy {}  ({})  回填 hash".format(
                        i, len(tasks), fname, label))
            elif status == "skip-nofile":
                skip_nofile += 1
            elif status == "empty":
                empty_count += 1
                print("  [{:>3}/{}] empty  {}  (no content)".format(i, len(tasks), fname))
            elif status == "dry-stale":
                dry_stale += 1
                sent_reuse += (info or {}).get("reuse", 0)
                sent_regen += (info or {}).get("regen", 0)
                old_hash = (manifest_entry or {}).get("text_hash", "-")[:8]
                print("  [{:>3}/{}] STALE  {}  ({})  hash {}...→{}...  (句 复用{}/重跑{}/共{})".format(
                    i, len(tasks), fname, label,
                    old_hash, expected_hash[:8],
                    (info or {}).get("reuse", 0), (info or {}).get("regen", 0),
                    (info or {}).get("total", 0)))
            elif status == "dry-new":
                dry_new += 1
                sent_reuse += (info or {}).get("reuse", 0)
                sent_regen += (info or {}).get("regen", 0)
                print("  [{:>3}/{}] NEW    {}  ({})  (句 复用{}/重跑{}/共{})".format(
                    i, len(tasks), fname, label,
                    (info or {}).get("reuse", 0), (info or {}).get("regen", 0),
                    (info or {}).get("total", 0)))
            elif status == "ok":
                ok_count += 1
                info = info or {}
                sent_reuse += info.get("reuse", 0)
                sent_regen += info.get("regen", 0)
                detail = info.get("detail") or []
                detail_str = ", ".join(detail) if detail else "-"
                size_kb = os.path.getsize(fpath) // 1024
                print("  [{:>3}/{}] ok     {}  [{}]  ({} KB)  句复用{}/重跑{}  {}".format(
                    i, len(tasks), fname, label, size_kb,
                    info.get("reuse", 0), info.get("regen", 0), detail_str))
                # 🆕 写入 manifest（含句级拼接顺序，供下次增量比对）
                manifest[fname] = {
                    "text_hash": expected_hash,
                    "textbook": tb_id,
                    "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
                    "sentences": info.get("sentences") or [],
                }
                manifest_dirty = True
        except Exception as e:
            fail_count += 1
            print("  [{:>3}/{}] FAIL   {}  ({})  :: {}".format(i, len(tasks), fname, label, e))

    # 清理临时目录
    try:
        if os.path.exists(TMP_DIR):
            for f in os.listdir(TMP_DIR):
                try: os.remove(os.path.join(TMP_DIR, f))
                except Exception: pass
            try: os.rmdir(TMP_DIR)
            except Exception: pass
    except Exception:
        pass

    # 🆕 回写 manifest
    if manifest_dirty and not args.dry_run:
        save_manifest(manifest)
        print("")
        print("[info] manifest 已更新: {}".format(MANIFEST_PATH))

    print("")
    if args.dry_run:
        print("[dry-run] stale={} (hash 不匹配需重生成), new={} (全新待生成), "
              "fresh-skip={}, legacy-skip={}, empty={}".format(
              dry_stale, dry_new, skip_fresh, skip_legacy, empty_count))
        print("[dry-run] 句级：将复用 {} 句缓存、重跑 {} 句 TTS（共 {} 句）".format(
              sent_reuse, sent_regen, sent_reuse + sent_regen))
    else:
        print("[done] ok={}, skip-fresh={}, skip-legacy={}, skip-nofile={}, "
              "empty={}, fail={}".format(
              ok_count, skip_fresh, skip_legacy, skip_nofile, empty_count, fail_count))
        print("[done] 句级：复用 {} 句缓存、重跑 {} 句 TTS（共 {} 句）".format(
              sent_reuse, sent_regen, sent_reuse + sent_regen))


if __name__ == "__main__":
    # 兼容 Python 3.6（asyncio.run 是 3.7+ 新增）
    if hasattr(asyncio, "run"):
        asyncio.run(main())
    else:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main())
