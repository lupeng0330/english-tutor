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


SPELLING_FIELD_ORDER = ['grade', 'term', 'code', 'q', 'answer', 'hint', 'difficulty', 'explain', 'source']


def _reorder_spelling(item):
    """按既定字段顺序重排键，便于 JSON 输出与旧题视觉对齐。"""
    return {k: item[k] for k in SPELLING_FIELD_ORDER if k in item}


def cmd_auto(args, root):
    """原始模式：把全教材按 4 种题型生成到 *_auto.json，不动主题库。"""
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


def cmd_merge_spelling(args, root):
    """v01.11 沪教版专用：去重后把缺失的拼写题直接 append 到主题库。

    流程：
      1. 读教材 → 生成全量候选拼写题
      2. 读主题库 → 建已存 (code, answer.lower()) 集合 S
      3. 候选过滤：(code, answer.lower()) 已在 S 中则跳过
      4. 新题打 source 标签、字段重排
      5. dry-run 仅打印统计；--write 时原子写回主题库（先 .tmp 再 rename）
    """
    tb_path = os.path.join(root, 'data', 'textbooks', f'{args.textbook}.json')
    bank_path = os.path.join(root, 'data', 'questions', f'{args.textbook}_spelling.json')

    if not os.path.exists(tb_path):
        print(f"[错误] 教材不存在: {tb_path}")
        sys.exit(1)
    if not os.path.exists(bank_path):
        print(f"[错误] 主题库不存在: {bank_path}（请先创建空数组 [] 文件）")
        sys.exit(1)

    textbook = load_textbook(tb_path)
    with open(bank_path, 'r', encoding='utf-8') as f:
        old_items = json.load(f)
    if not isinstance(old_items, list):
        print(f"[错误] 主题库根节点应为数组，实际是 {type(old_items).__name__}")
        sys.exit(1)

    # 已存 (code, answer.lower())
    existing = set()
    for it in old_items:
        c = it.get('code')
        a = (it.get('answer') or '').lower()
        if c and a:
            existing.add((c, a))

    # 全量候选
    candidates = []
    for gkey, terms in textbook['grades'].items():
        gnum = int(gkey.replace('grade', ''))
        for term, units in terms.items():
            for u in units:
                code = f"{gnum}{'A' if term == '上' else 'B'}_U{u['id'].replace('u','')}"
                words = u.get('words', [])
                candidates.extend(gen_spelling_for_unit(gnum, term, code, words))

    # 过滤 + 打 source 标签
    new_items, skipped = [], 0
    for q in candidates:
        key = (q['code'], q['answer'].lower())
        if key in existing:
            skipped += 1
            continue
        q['source'] = args.source_tag
        new_items.append(_reorder_spelling(q))

    print(f"[merge-spelling] 教材: {os.path.basename(tb_path)}")
    print(f"  候选总数 = {len(candidates)}")
    print(f"  已存数   = {len(existing)} (主题库当前 {len(old_items)} 题)")
    print(f"  跳过(已存) = {skipped}")
    print(f"  新增      = {len(new_items)}  [打 source={args.source_tag}]")
    print(f"  写入后总数 = {len(old_items) + len(new_items)}")

    if not args.write:
        print("\n[dry-run] 未写入。加 --write 实际生效。")
        return

    merged = list(old_items) + new_items  # 旧题在前、原序保留；新题追加
    tmp_path = bank_path + '.tmp'
    with open(tmp_path, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, bank_path)
    print(f"\n[done] 已写入 {bank_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--mode', choices=['auto', 'merge-spelling'], default='auto',
                        help='auto=按 4 题型生成到 *_auto.json；merge-spelling=去重后 append 到 {textbook}_spelling.json 主题库')
    parser.add_argument('--textbook', default='jk')
    parser.add_argument('--grade', type=int, default=0, help='[auto 模式] 指定年级，0=全部')
    parser.add_argument('--out-suffix', default='auto', help='[auto 模式] 输出文件后缀')
    parser.add_argument('--source-tag', default='ai_v01_11', help='[merge-spelling 模式] 新增题的 source 字段值')
    parser.add_argument('--write', action='store_true', help='[merge-spelling 模式] 不加=dry-run；加=实际写入')
    args = parser.parse_args()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if args.mode == 'merge-spelling':
        cmd_merge_spelling(args, root)
    else:
        cmd_auto(args, root)


if __name__ == '__main__':
    main()
