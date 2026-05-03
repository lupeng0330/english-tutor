# -*- coding: utf-8 -*-
"""
乐学英语 - AI 自动题库生成器

基于 data/textbooks/*.json 里的课文和单词表，自动生成 4 种题型的题目：
  - 单词拼写题：每个生词 1 题
  - 听力题：把课文关键句当作听力材料，加 1 道理解题
  - 语法题：规则生成（简单的冠词/单复数/时态）
  - 阅读题：把课文当短文，自动提问

用法：
  python scripts/ai_generate_questions.py [--textbook jk] [--grade 3] [--out data/questions/auto_X.json]

注：当前版本使用本地规则生成（零依赖）。未来若要接 OpenAI/智谱等，把 CALL_LLM 开关打开。
"""
import argparse
import json
import os
import random
import re
import sys


def load_textbook(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def gen_spelling_for_unit(grade, term, code, words):
    """每个生词 1 道拼写题"""
    out = []
    for w in words:
        word = w['word']
        meaning = w.get('meaning', '').strip()
        if not word or not meaning:
            continue
        # 提示：首尾保留，中间用下划线
        if len(word) <= 2:
            hint = word[0] + '_' * (len(word) - 1)
        else:
            hint = word[0] + '_' * (len(word) - 2) + word[-1]
        out.append({
            'grade': grade, 'term': term, 'code': code,
            'q': meaning, 'answer': word.lower(),
            'hint': hint,
            'difficulty': 1 if grade <= 3 else (2 if grade <= 6 else 3),
            'explain': f"'{meaning}' 的英文是 {word}"
        })
    return out


def gen_grammar_for_unit(grade, term, code, lesson, words):
    """从课文中抽取语法点生成 1-2 道题（简单规则）"""
    out = []
    sentences = [s.strip() for s in re.split(r'[.!?]+', lesson) if s.strip()]
    # 规则 1：找 "There is/are"
    for s in sentences:
        m = re.search(r'\bThere\s+(is|are)\s+([a-z]+)', s, re.IGNORECASE)
        if m:
            verb, noun = m.group(1), m.group(2)
            wrong = 'are' if verb.lower() == 'is' else 'is'
            out.append({
                'grade': grade, 'term': term, 'code': code,
                'q': s.replace(verb, '____', 1) + '.',
                'options': [verb, wrong, 'am'],
                'answer': 0,
                'difficulty': 2,
                'explain': f"根据单复数判断用 {verb}"
            })
            break
    # 规则 2：I/He/She + 动词
    for s in sentences:
        m = re.search(r'\b(He|She)\s+(\w+s)\b', s)
        if m:
            pronoun, verb_s = m.group(1), m.group(2)
            verb_base = verb_s[:-1] if verb_s.endswith('s') else verb_s
            out.append({
                'grade': grade, 'term': term, 'code': code,
                'q': s.replace(verb_s, '____', 1) + '.',
                'options': [verb_base, verb_s, verb_base + 'ing'],
                'answer': 1,
                'difficulty': 2,
                'explain': f"第三人称单数 {pronoun} 后动词要加 -s"
            })
            break
    return out[:2]  # 最多 2 题/单元


def gen_reading_for_unit(grade, term, code, lesson, unit_title):
    """把课文当短文，用第一句作为问题焦点"""
    if grade < 3:
        return []  # 1-2年级不适合
    out = []
    sentences = [s.strip() for s in re.split(r'[.!?]+', lesson) if s.strip() and len(s.strip()) > 5]
    if len(sentences) < 2:
        return []
    # 问 "What is this passage about?"
    title_clean = re.sub(r'Unit \d+\s*', '', unit_title).strip() or 'a topic'
    wrongs = ['Weather', 'Sports', 'Food', 'Animals', 'School', 'Family', 'Travel', 'Festivals']
    random.shuffle(wrongs)
    wrongs = [w for w in wrongs if w.lower() not in title_clean.lower()][:2]
    options = [title_clean] + wrongs
    random.shuffle(options)
    answer_idx = options.index(title_clean)
    out.append({
        'grade': grade, 'term': term, 'code': code,
        'passage': lesson,
        'q': 'What is this passage mainly about?',
        'options': options,
        'answer': answer_idx,
        'difficulty': 2 if grade <= 5 else 3,
        'explain': f"整段围绕 '{title_clean}' 展开"
    })
    return out


def gen_listening_for_unit(grade, term, code, lesson):
    """用课文第一句作为听力材料 + 提问"""
    sentences = [s.strip() for s in re.split(r'[.!?]+', lesson) if s.strip()]
    if not sentences:
        return []
    # 只生成一道基础听力
    audio_text = sentences[0] + '.'
    # 不生成 audioFile，让使用者决定要不要加
    return [{
        'grade': grade, 'term': term, 'code': code,
        'audioText': audio_text,
        'q': 'What did you hear?',
        'options': [audio_text, sentences[-1] + '.' if len(sentences) > 1 else 'I am a student.', 'Good morning!'],
        'answer': 0,
        'difficulty': 2,
        'explain': '仔细听第一句',
        '_need_audio': True   # 标记需要生成 MP3
    }]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--textbook', default='jk')
    parser.add_argument('--grade', type=int, default=0, help='指定年级，0=全部')
    parser.add_argument('--out-suffix', default='auto', help='输出文件后缀')
    args = parser.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    tb_path = os.path.join(root, 'data', 'textbooks', f'{args.textbook}.json')
    if not os.path.exists(tb_path):
        print(f"[错误] 教材不存在: {tb_path}")
        sys.exit(1)

    textbook = load_textbook(tb_path)
    spelling, listening, grammar, reading = [], [], [], []

    for gkey, terms in textbook['grades'].items():
        gnum = int(gkey.replace('grade', ''))
        if args.grade and gnum != args.grade:
            continue
        for term, units in terms.items():
            for u in units:
                code = f"{gnum}{'A' if term == '上' else 'B'}_U{u['id'].replace('u','')}"
                words  = u.get('words', [])
                lesson = u.get('lesson', '')
                title  = u.get('title', '')
                spelling.extend(gen_spelling_for_unit(gnum, term, code, words))
                listening.extend(gen_listening_for_unit(gnum, term, code, lesson))
                grammar.extend(gen_grammar_for_unit(gnum, term, code, lesson, words))
                reading.extend(gen_reading_for_unit(gnum, term, code, lesson, title))

    out_dir = os.path.join(root, 'data', 'questions')
    os.makedirs(out_dir, exist_ok=True)
    suffix = args.out_suffix
    results = {
        'spelling':  spelling,
        'listening': listening,
        'grammar':   grammar,
        'reading':   reading
    }

    for typ, items in results.items():
        out_path = os.path.join(out_dir, f'{args.textbook}_{typ}_{suffix}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(items, f, ensure_ascii=False, indent=2)
        print(f"  [ok] {typ}: {len(items)} 条 -> {out_path}")

    print(f"\n[done] 共生成 {sum(len(v) for v in results.values())} 道题")
    print(f"提示：自动生成的题目保存为 *_{suffix}.json，不会覆盖主题库。")
    print(f"      如要合并到主题库，请用 jq 或 Python 手动 concat。")


if __name__ == '__main__':
    main()
