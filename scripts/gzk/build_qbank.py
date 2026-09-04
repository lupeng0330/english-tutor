# -*- coding: utf-8 -*-
"""
gzk（广州口语·教科版 1-2 年级）题库生成器。

设计：
  - 仅生成【拼写 + 听力】两类（一二年级不做语法/阅读，对齐 jk G1-2 题型）
  - 拼写：每词 1 题（按词数 1:1），共 ~244 题
  - 听力：每单元 2 题，共 ~46 题（音频从课文 lessons 里挑短句）
  - code 格式：{1-2}{A/B}_U{N}_{S01/L01}（标准 jk 兼容格式 + _SXX/_LXX 题序后缀）
  - audioFile：gzk_listening_{NN:02d}.mp3（全局递增）

铁律 8 三件套：
  1. 写入前备份到 data/questions/.backups/
  2. 差异报告
  3. 题量骤降 >30% 阻断（gzk 首次写入旧版 0 题，不阻断）

运行：
  python scripts/gzk/build_qbank.py            # dry-run
  python scripts/gzk/build_qbank.py --write    # 写入题库 JSON
"""
import argparse
import json
import os
import random
import re
import shutil
import sys
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QDIR = os.path.join(ROOT, 'data', 'questions')
TB_PATH = os.path.join(ROOT, 'data', 'textbooks', 'gzk.json')

# 固定随机种子，结果可复现
random.seed(42)


# ============================================================
# 辅助
# ============================================================

def term_to_letter(term):
    """上 -> A; 下 -> B"""
    return 'A' if term == '上' else 'B'


def grade_num(grade_key):
    """grade1 -> 1; grade2 -> 2"""
    m = re.match(r'grade(\d+)', grade_key)
    return int(m.group(1)) if m else 0


def unit_num(unit_id):
    """u1 -> 1; u12 -> 12"""
    m = re.match(r'u(\d+)', str(unit_id))
    return int(m.group(1)) if m else 0


# 干扰项词池：从全教材抽词作干扰
def collect_all_words(tb_data):
    pool = []
    for grade_key, terms in tb_data.get('grades', {}).items():
        for term, units in terms.items():
            for u in units:
                for w in u.get('words', []):
                    word = w.get('word', '').strip()
                    if word and word.isascii() and len(word) >= 2:
                        pool.append(word)
    return list(set(pool))


# 🆕 词性分类词池（一二年级常用词，手工分类）
# 用于按词性替换生成干扰句，避免 "Family for night" 这种语义错乱
POS_BUCKETS = {
    # 名词（人/物）：人、动物、玩具、衣物、食物、地点、家具、学习用品
    'noun': {
        'person': ['boy', 'girl', 'teacher', 'friend', 'father', 'mother', 'sister', 'brother',
                   'baby', 'doctor', 'nurse', 'cook', 'farmer', 'driver', 'pupil', 'student',
                   'mum', 'dad', 'grandma', 'grandpa', 'aunt', 'uncle', 'son', 'daughter'],
        'animal': ['cat', 'dog', 'bird', 'fish', 'duck', 'cow', 'pig', 'tiger', 'monkey',
                   'rabbit', 'panda', 'horse', 'lion', 'mouse', 'sheep', 'elephant', 'bear', 'turtle'],
        'toy': ['ball', 'bike', 'kite', 'doll', 'car', 'plane', 'boat', 'train', 'robot', 'scooter'],
        'clothes': ['cap', 'hat', 'coat', 'shirt', 'skirt', 'dress', 'shoe', 'sock', 'sweater', 'jacket',
                    't-shirt', 'T-shirt', 'pants', 'jeans', 'scarf'],
        'food': ['apple', 'cake', 'bread', 'rice', 'meat', 'milk', 'water', 'tea', 'juice', 'egg',
                 'fish', 'soup', 'pear', 'orange', 'banana', 'grape', 'lemon', 'noodle'],
        'place': ['home', 'school', 'park', 'zoo', 'shop', 'farm', 'room', 'house', 'garden', 'library',
                  'classroom', 'kitchen', 'bedroom'],
        'furniture': ['bed', 'desk', 'chair', 'table', 'sofa', 'lamp', 'door', 'window', 'wall'],
        'school': ['book', 'pen', 'pencil', 'bag', 'ruler', 'eraser', 'crayon', 'glue', 'paper',
                   'pencil-case', 'pen-case', 'box', 'notebook'],
        'nature': ['sun', 'moon', 'star', 'sky', 'tree', 'flower', 'leaf', 'cloud', 'rain', 'snow'],
        'body': ['hand', 'foot', 'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'hair', 'arm', 'leg'],
        'color': ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'orange', 'brown', 'purple'],
        'time': ['day', 'night', 'morning', 'afternoon', 'evening', 'today', 'tomorrow', 'yesterday',
                 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        'misc': ['name', 'thing', 'gift', 'box', 'cup', 'bowl', 'plate', 'spoon', 'fork', 'knife',
                 'umbrella', 'clock', 'phone', 'TV', 'picture', 'photo', 'family', 'home',
                 'time', 'thing', 'job', 'work', 'game', 'song', 'story', 'class', 'lesson'],
    },
    # 动词（动作）
    'verb': ['run', 'walk', 'jump', 'swim', 'sing', 'dance', 'play', 'read', 'write', 'draw',
             'eat', 'drink', 'sleep', 'wake', 'sit', 'stand', 'go', 'come', 'look', 'see',
             'hear', 'speak', 'talk', 'say', 'tell', 'ask', 'help', 'like', 'love', 'want',
             'cook', 'wash', 'clean', 'open', 'close', 'fly', 'climb', 'ride', 'drive',
             'skate', 'paint', 'count', 'meet', 'find'],
    # 形容词（描述）
    'adj': ['big', 'small', 'long', 'short', 'tall', 'fat', 'thin', 'old', 'young', 'new',
            'good', 'bad', 'nice', 'kind', 'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty',
            'hot', 'cold', 'warm', 'cool', 'fast', 'slow', 'pretty', 'cute', 'clever', 'lovely'],
    # 数词
    'num': ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
            'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'twenty'],
    # 介词（与 in/on/at 类同性）—— 干扰可互换
    'prep': ['in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'under', 'over', 'near'],
    # 副词
    'adv': ['now', 'then', 'here', 'there', 'today', 'tomorrow', 'always', 'often', 'sometimes', 'never'],
    # 人名（同性别互换；课本常见角色）
    'name_male': ['Andy', 'Ben', 'Tom', 'Jack', 'Bob', 'Sam', 'Tim', 'Peter'],
    'name_female': ['Lily', 'Sue', 'Mary', 'Anne', 'Kitty', 'Lulu', 'May', 'Amy'],
}


def _build_pos_lookup():
    """构造 word.lower() -> (pos_main, pos_sub) 倒查表"""
    lookup = {}
    for w in POS_BUCKETS['verb']:
        lookup[w.lower()] = ('verb', None)
    for w in POS_BUCKETS['adj']:
        lookup[w.lower()] = ('adj', None)
    for w in POS_BUCKETS['num']:
        lookup[w.lower()] = ('num', None)
    for w in POS_BUCKETS['prep']:
        lookup[w.lower()] = ('prep', None)
    for w in POS_BUCKETS['adv']:
        lookup[w.lower()] = ('adv', None)
    for w in POS_BUCKETS['name_male']:
        lookup[w.lower()] = ('name', 'male')
    for w in POS_BUCKETS['name_female']:
        lookup[w.lower()] = ('name', 'female')
    for sub, words in POS_BUCKETS['noun'].items():
        for w in words:
            lookup[w.lower()] = ('noun', sub)
    return lookup


POS_LOOKUP = _build_pos_lookup()


def _replacement_pool(word):
    """对给定词，找出同词性的可替换词列表（优先同子类，其次同大类）"""
    info = POS_LOOKUP.get(word.lower())
    if not info:
        return []
    pos_main, pos_sub = info
    if pos_main == 'noun' and pos_sub:
        # 优先同子类
        pool = [w for w in POS_BUCKETS['noun'][pos_sub] if w.lower() != word.lower()]
        if pool:
            return pool
        # 退而求其次：所有名词
        return [w for sub_words in POS_BUCKETS['noun'].values() for w in sub_words if w.lower() != word.lower()]
    if pos_main == 'verb':
        return [w for w in POS_BUCKETS['verb'] if w.lower() != word.lower()]
    if pos_main == 'adj':
        return [w for w in POS_BUCKETS['adj'] if w.lower() != word.lower()]
    if pos_main == 'num':
        return [w for w in POS_BUCKETS['num'] if w.lower() != word.lower()]
    if pos_main == 'prep':
        return [w for w in POS_BUCKETS['prep'] if w.lower() != word.lower()]
    if pos_main == 'adv':
        return [w for w in POS_BUCKETS['adv'] if w.lower() != word.lower()]
    if pos_main == 'name':
        # 人名同性别互换（避免 Andy → Mary 这种性别错乱让 TTS 音色串）
        bucket = 'name_' + pos_sub  # name_male / name_female
        return [w for w in POS_BUCKETS[bucket] if w.lower() != word.lower()]
    return []


# ============================================================
# 题目构造
# ============================================================

def make_spelling_q(word_obj, grade_n, term_letter, unit_n, seq):
    """拼写题：给中文+音标+首字母提示，让用户拼出 word"""
    word = word_obj.get('word', '').strip()
    meaning = word_obj.get('meaning', '').strip()
    phonetic = word_obj.get('phonetic', '').strip()
    example = word_obj.get('example', '').strip()

    # 首字母 + 长度提示，比如 "h____" 表示 5 字母 h 开头
    if len(word) >= 2:
        hint_letters = word[0] + '_' * (len(word) - 1)
    else:
        hint_letters = word

    parts = [meaning]
    if phonetic:
        parts.append(phonetic)
    parts.append(f'首字母 {word[0].upper()}·共 {len(word)} 个字母')

    q_text = f'{" ".join(parts)}'
    hint_text = hint_letters

    return {
        'grade': grade_n,
        'term': '上' if term_letter == 'A' else '下',
        'code': f'{grade_n}{term_letter}_U{unit_n}_S{seq:02d}',
        'q': q_text,
        'answer': word.lower() if word[0].isupper() and meaning and not meaning[0].isupper() else word,
        'hint': hint_text,
        'difficulty': 1,  # 一二年级题统一为 1（简单），与 jk/hj 数字规范对齐
        'explain': f'例句：{example}' if example else f'中文：{meaning}',
    }


def make_listening_q(audio_text_en, audio_text_cn, grade_n, term_letter, unit_n, seq, audio_idx, word_pool):
    """听力题：播一句话，问"听到的是哪句"

    audio_text_en: 课文里的英文短句
    audio_text_cn: 对应中文
    word_pool: 用于生成 3 个干扰句
    """
    # 答案就是 audio_text_en
    correct = audio_text_en.strip()
    # 生成 3 个相似但错误的干扰句
    # 策略：用同一句替换 1-2 个关键词
    distractors = generate_distractors(correct, word_pool, n=3)

    options = [correct] + distractors
    random.shuffle(options)
    answer_idx = options.index(correct)
    answer_letter = ['A', 'B', 'C', 'D'][answer_idx]

    return {
        'grade': grade_n,
        'term': '上' if term_letter == 'A' else '下',
        'code': f'{grade_n}{term_letter}_U{unit_n}_L{seq:02d}',
        'audioText': correct,
        'audioFile': f'gzk_listening_{audio_idx:02d}.mp3',
        'q': '听音频，选出听到的句子',
        'options': options,
        'answer': answer_letter,
        'explain': f'中文：{audio_text_cn}' if audio_text_cn else f'听到的是：{correct}',
        'difficulty': 1,  # 一二年级听力统一为 1（简单），与 jk/hj 数字规范对齐
    }


def _case_match(old, new):
    """保持大小写：old 是 'Hello'→ new 转 'World'；old 'hello' → new 转 'world'"""
    if old.isupper():
        return new.upper()
    if old[0].isupper():
        return new.capitalize()
    return new.lower()


def generate_distractors(correct, word_pool, n=3):
    """对正确句生成 n 个干扰句

    🆕 策略：按词性替换（名词→同子类名词 / 动词→动词 / 形容词→形容词 / ...），
    优先同子类（noun.food→noun.food），找不到再退到同大类，再退到原始词池。
    跳过角色标签（句首 "Andy:" / "Lily:" 等），只替换内容部分。
    """
    if not correct:
        return [correct] * n

    # 分离角色标签和内容
    speaker_pat = re.compile(r'^([A-Z][A-Za-z .\'\-]{0,24}?\s*[:：]\s*)')
    m = speaker_pat.match(correct)
    if m:
        prefix = m.group(1)
        content = correct[m.end():]
    else:
        prefix = ''
        content = correct

    # 拆分内容部分（保留标点）
    tokens = re.findall(r"[A-Za-z']+|[^A-Za-z']+", content)

    # 找可替换位置：在词性表中、长度 >= 2、非虚词
    VIRTUAL_WORDS = {'i', "i'm", 'a', 'an', 'is', 'am', 'are', 'the', 'and', 'or',
                     'of', 'my', 'your', 'his', 'her', 'this', 'that', 'it', 'he',
                     'she', 'we', 'you', 'they', 'have', 'has', 'had', 'do', 'does',
                     'did', 'be', 'was', 'were', 'will', 'can', 'may', 'no', 'not',
                     'what', 'who', 'where', 'when', 'how', 'why', "what's", "who's",
                     "where's", "it's", "let's", 'too', 'very', 'so', 'but', 'me',
                     'us', 'them', 'him', 'us', 'our', 'their'}

    replaceable_idx = []
    for i, t in enumerate(tokens):
        if not re.fullmatch(r"[A-Za-z']+", t):
            continue
        if len(t) < 2:
            continue
        if t.lower() in VIRTUAL_WORDS:
            continue
        # 必须在词性表中找得到
        if t.lower() in POS_LOOKUP:
            replaceable_idx.append(i)

    distractors = []
    attempts = 0
    seen = {correct.lower()}
    while len(distractors) < n and attempts < 50:
        attempts += 1
        if not replaceable_idx:
            # 没有可识别词性的实词 → 退化到原始随机替换（避免空选项）
            distractors.append(correct + f' [{len(distractors)+1}]')
            continue

        new_tokens = tokens[:]
        # 随机替换 1-2 个词（优先 1 个，让干扰更细微）
        n_swap = 1 if (random.random() < 0.6 or len(replaceable_idx) < 2) else 2
        n_swap = min(n_swap, len(replaceable_idx))
        swap_positions = random.sample(replaceable_idx, n_swap)
        for pos in swap_positions:
            old = new_tokens[pos]
            repl_pool = _replacement_pool(old)
            if not repl_pool:
                continue
            new_word = random.choice(repl_pool)
            new_tokens[pos] = _case_match(old, new_word)
        cand_content = ''.join(new_tokens)
        cand = prefix + cand_content
        if cand.lower() != correct.lower() and cand.lower() not in seen:
            seen.add(cand.lower())
            distractors.append(cand)

    # 不足则用 word_pool 兜底（极少触发）
    fallback = 0
    while len(distractors) < n and fallback < 10:
        fallback += 1
        new_tokens = tokens[:]
        # 随便挑一个长度 >=2 的字母词替换
        candidates = [i for i, t in enumerate(tokens)
                      if re.fullmatch(r"[A-Za-z']+", t) and len(t) >= 2 and t.lower() not in VIRTUAL_WORDS]
        if not candidates:
            distractors.append(correct + f' [{len(distractors)+1}]')
            continue
        pos = random.choice(candidates)
        old = new_tokens[pos]
        sub_pool = [w for w in word_pool if w.lower() != old.lower() and abs(len(w) - len(old)) <= 2]
        if not sub_pool:
            distractors.append(correct + f' [{len(distractors)+1}]')
            continue
        new_tokens[pos] = _case_match(old, random.choice(sub_pool))
        cand = prefix + ''.join(new_tokens)
        if cand.lower() != correct.lower() and cand.lower() not in seen:
            seen.add(cand.lower())
            distractors.append(cand)

    return distractors[:n]


def extract_listening_sentences(unit):
    """从单元的 lessons 里挑出合适做听力题的英文短句。

    🆕 保留 "Andy:" / "Lily:" 等角色标签（让 TTS 自动按角色分配男女声音色）。
    干扰句生成时会自动剥掉标签部分参与替换；audioText 保留标签。

    挑选标准：
      - 单行（split('\n')）
      - 不含角色标签的纯内容部分 3-12 个英文词
    返回 [(en_with_speaker, cn), ...]
    """
    pairs = []
    speaker_pat = re.compile(r'^([A-Z][A-Za-z .\'\-]{0,24}?)\s*[:：]\s*')
    cn_speaker_pat = re.compile(r'^([\u4e00-\u9fa5][\u4e00-\u9fa5\u3000 ]{0,12}?)\s*[:：]\s*')
    for lesson in unit.get('lessons', []):
        en_lines = (lesson.get('en', '') or '').split('\n')
        cn_lines = (lesson.get('cn', '') or '').split('\n')
        for i, en in enumerate(en_lines):
            en = en.strip()
            if not en:
                continue
            # 检测是否带角色标签（如 "Andy: Hello!"）
            m = speaker_pat.match(en)
            if m:
                speaker = m.group(1).strip()
                content_only = en[m.end():].strip()
            else:
                speaker = None
                content_only = en
            # 内容部分单词数 3-12 才采用
            words = re.findall(r"[A-Za-z']+", content_only)
            if not (3 <= len(words) <= 12):
                continue
            # 保留原 audioText（含角色标签）以便 TTS 分配男女声
            audio_text = en
            cn_raw = cn_lines[i].strip() if i < len(cn_lines) else ''
            # 中文去掉角色名前缀，给 explain 用
            cn = cn_speaker_pat.sub('', cn_raw)
            pairs.append((audio_text, cn))
    return pairs


# ============================================================
# 主流程
# ============================================================

def build():
    """读 gzk.json 生成 spelling + listening 题列表"""
    if not os.path.exists(TB_PATH):
        print(f'❌ 未找到 {TB_PATH}')
        return [], []

    tb_data = json.load(open(TB_PATH, encoding='utf-8'))
    word_pool = collect_all_words(tb_data)
    print(f'[准备] 全教材词池 {len(word_pool)} 词（用于听力干扰项生成）')

    spelling = []
    listening = []
    audio_idx = 0  # 听力 MP3 全局编号

    for grade_key in sorted(tb_data.get('grades', {}).keys()):
        grade_n = grade_num(grade_key)
        for term in ['上', '下']:
            units = tb_data['grades'][grade_key].get(term, [])
            if not units:
                continue
            term_letter = term_to_letter(term)
            for u in units:
                u_n = unit_num(u.get('id'))
                if u_n == 0:
                    print(f'  ⚠ 跳过非法单元 id: {u.get("id")} ({grade_key}/{term})')
                    continue

                # 拼写题：每词 1 道
                for seq, w in enumerate(u.get('words', []), start=1):
                    spelling.append(make_spelling_q(w, grade_n, term_letter, u_n, seq))

                # 听力题：从课文挑短句，每单元 2 道
                sentences = extract_listening_sentences(u)
                if not sentences:
                    print(f'  ⚠ {grade_key}/{term} U{u_n} 无可用短句，跳过听力')
                    continue
                # 优先长度 5-8 的句子
                preferred = [s for s in sentences if 5 <= len(re.findall(r"[A-Za-z']+", s[0])) <= 8]
                pick_from = preferred if len(preferred) >= 2 else sentences
                picks = pick_from[:2] if len(pick_from) >= 2 else pick_from + [sentences[0]] * (2 - len(pick_from))

                for seq, (en, cn) in enumerate(picks[:2], start=1):
                    audio_idx += 1
                    listening.append(make_listening_q(en, cn, grade_n, term_letter, u_n, seq, audio_idx, word_pool))

    return spelling, listening


def load_old(typ):
    p = os.path.join(QDIR, f'gzk_{typ}.json')
    if os.path.exists(p):
        return json.load(open(p, encoding='utf-8'))
    return []


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true', help='实际写入（默认 dry-run）')
    ap.add_argument('--force', action='store_true', help='跳过题量骤降阻断（30 百分比阈值）')
    args = ap.parse_args()

    spelling, listening = build()
    total = len(spelling) + len(listening)
    print(f'\n[gzk 题库 本次精造] 拼写 {len(spelling)} / 听力 {len(listening)} / 共 {total} 题')

    # 听力题 MP3 文件名清单
    if listening:
        print(f'[听力音频] {listening[0]["audioFile"]} ... {listening[-1]["audioFile"]} 共 {len(listening)} 个')

    # 年级分布
    dist = {}
    for q in spelling + listening:
        k = f'G{q["grade"]}{q["term"]}'
        dist[k] = dist.get(k, 0) + 1
    print(f'[年级分布] ' + '  '.join(f'{k}={v}' for k, v in sorted(dist.items())))

    if not args.write or total == 0:
        if not args.write:
            print('\n(dry-run，加 --write 实际写入)')
        return

    # 🔒 备份
    os.makedirs(QDIR, exist_ok=True)
    backup_dir = os.path.join(QDIR, '.backups')
    os.makedirs(backup_dir, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    backed = []
    for typ in ['spelling', 'listening']:
        p = os.path.join(QDIR, f'gzk_{typ}.json')
        if os.path.exists(p):
            bak = os.path.join(backup_dir, f'gzk_{typ}_{ts}.json')
            shutil.copy2(p, bak)
            backed.append((typ, len(load_old(typ))))
    if backed:
        print(f'\n[🔒 备份] {backup_dir}/  ({ts})')
        for typ, cnt in backed:
            print(f'    gzk_{typ}_{ts}.json  ({cnt} 题)')
    else:
        print(f'\n[🔒 备份] 无旧文件，跳过（首次写入）')

    # 📊 差异报告
    print(f'\n[📊 差异报告]')
    for typ, new_data in [('spelling', spelling), ('listening', listening)]:
        old = load_old(typ)
        # gzk 是从 0 建，旧版 0 题，直接全部替换
        merged = list(new_data)
        p = os.path.join(QDIR, f'gzk_{typ}.json')
        print(f'  {typ:10s}: 旧 {len(old)} → 新 {len(new_data)} → 合并 {len(merged)} 题')

        # 🚨 骤降阻断（首次写入旧版 0 题不触发）
        if len(old) > 0 and len(merged) < len(old) * 0.7 and not args.force:
            print(f'\n  ⛔ 安全阻断：{typ} 合并后 ({len(merged)}) 比旧版 ({len(old)}) 减少 {(1-len(merged)/len(old))*100:.0f}%，超过 30%')
            print(f'     如果是预期行为，请用 --force 跳过。')
            return

        tmp = p + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(merged, f, ensure_ascii=False, indent=2)
        os.replace(tmp, p)

    total_merged = sum(len(load_old(t)) for t in ['spelling', 'listening'])
    print(f'\n[✅ 写入完成] gzk 题库总计 {total_merged} 题（spelling+listening）')


if __name__ == '__main__':
    main()
