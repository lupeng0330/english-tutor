# -*- coding: utf-8 -*-
"""
jk 教科版题库构建器（AI 精造，单一数据源、可重建、按册扩展）
- 题型：拼写(每词1题) / 语法句型(2-3/单元) / 听力(1-2/单元，配 MP3) / 阅读(1-2/单元，grade3+)
- 输出：data/questions/jk_{spelling,grammar,listening,reading}.json（全量重建）
- code 规则：{1-6}{A/B}_U{n}，与 matchUnit 按 _U{n} 匹配完全兼容
- 听力 audioFile：jk_listening_{book}_{NN}.mp3（由 gen_jk_listening.py 生成）
运行：python scripts/jk/build_qbank.py --write    (写入题库 JSON)
"""
import os, json, argparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
QDIR = os.path.join(ROOT, 'data', 'questions')


def hint_of(word):
    w = word
    if len(w) <= 2:
        return w[0] + '_' * (len(w) - 1)
    return w[0] + '_' * (len(w) - 2) + w[-1]


# ============ 数据源（按册，精造后填入）============
BOOKS = {
    # grade3上 - 9单元 70词（主力区，待精造）
    '3A': {'grade': 3, 'term': '上', 'units': [
                {
                    'code': "3A_U1",
                    'words': [
                        ("letter", "字母；信"),
                        ("big letter", "大写字母"),
                        ("small letter", "小写字母"),
                        ("alphabet", "字母表"),
                        ("sign", "标志；招牌"),
                        ("bus", "公共汽车"),
                        ("name", "名字"),
                        ("life", "生活"),
                    ],
                    'grammar': [
                        {"q": "There ____ letters on the sign.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 letters 后用 are"},
                        {"q": "I can see a big ____ B.", "options": ["letter", "letters", "the letter"], "answer": 0, "explain": "a 后面跟单数名词 letter"},
                    ],
                    'listening': [
                        {"audioText": "W: Look! There are letters on the sign. M: Yes! I can see a big letter B.", "q": "What does the boy see?", "options": ["A big letter B", "A bus", "A book"], "answer": 0, "explain": "男孩说 I can see a big letter B"},
                    ],
                    'reading': [
                        {"passage": "We have 26 letters in the alphabet. Some letters are big, and some are small. We see them on signs, on a bus, and in books.", "q": "How many letters are in the alphabet?", "options": ["26", "20", "30"], "answer": 0, "explain": "文中明确说 26 letters"},
                    ],
                },
                {
                    'code': "3A_U2",
                    'words': [
                        ("English", "英语"),
                        ("Chinese", "汉语；中文"),
                        ("word", "单词"),
                        ("say", "说"),
                        ("mean", "意思是"),
                        ("same", "相同的"),
                        ("different", "不同的"),
                        ("read", "读"),
                    ],
                    'grammar': [
                        {"q": "English words ____ be different from Chinese words.", "options": ["can", "cans", "is"], "answer": 0, "explain": "can 后面跟动词原形 be"},
                        {"q": "We say \"hello\" ____ English.", "options": ["in", "on", "at"], "answer": 0, "explain": "用某种语言说用 in"},
                    ],
                    'listening': [
                        {"audioText": "W: How do you say \"book\" in Chinese? M: We say \"shu\". It means the same thing.", "q": "What does \"book\" mean in Chinese?", "options": ["shu", "bi", "chi"], "answer": 0, "explain": "回答 We say \"shu\""},
                    ],
                    'reading': [
                        {"passage": "English and Chinese are two languages. The words look different, but some things are the same. We say \"hello\" in English. We say \"ni hao\" in Chinese.", "q": "What is the same between English and Chinese?", "options": ["They both can say hello", "Words look the same", "They are one language"], "answer": 0, "explain": "hello 和 ni hao 都表示友好的问候"},
                    ],
                },
                {
                    'code': "3A_U3",
                    'words': [
                        ("who", "谁"),
                        ("he", "他"),
                        ("she", "她"),
                        ("friend", "朋友"),
                        ("teacher", "老师"),
                        ("classmate", "同学"),
                        ("boy", "男孩"),
                        ("girl", "女孩"),
                    ],
                    'grammar': [
                        {"q": "Who ____ he? He ____ my friend.", "options": ["is / is", "is / am", "are / is"], "answer": 0, "explain": "第三人称单数 he 后用 is"},
                        {"q": "____ is she? She is Lily.", "options": ["Who", "What", "How"], "answer": 0, "explain": "问人用 Who"},
                    ],
                    'listening': [
                        {"audioText": "W: Look at the photo. Who is he? M: He is my friend, Tom.", "q": "Who is the boy in the photo?", "options": ["Tom", "Lily", "Sam"], "answer": 0, "explain": "回答 He is my friend, Tom"},
                    ],
                    'reading': [
                        {"passage": "I have many friends at school. He is Tom. He is a happy boy. She is Lily. She is a kind girl. Miss Wang is our teacher.", "q": "Who is the teacher?", "options": ["Miss Wang", "Tom", "Lily"], "answer": 0, "explain": "文中说 Miss Wang is our teacher"},
                    ],
                },
                {
                    'code': "3A_U4",
                    'words': [
                        ("colour", "颜色；上色"),
                        ("red", "红色的"),
                        ("blue", "蓝色的"),
                        ("yellow", "黄色的"),
                        ("green", "绿色的"),
                        ("keyboard", "键盘"),
                        ("key", "按键"),
                        ("click", "点击"),
                    ],
                    'grammar': [
                        {"q": "What colour ____ this key? It ____ blue.", "options": ["is / is", "are / is", "is / are"], "answer": 0, "explain": "单数 key 用 is"},
                        {"q": "Colour ____ red, please.", "options": ["it", "they", "he"], "answer": 0, "explain": "指代单数物品用 it"},
                    ],
                    'listening': [
                        {"audioText": "M: What colour is this key? W: Colour it red, please.", "q": "What colour is the key?", "options": ["Red", "Blue", "Yellow"], "answer": 0, "explain": "老师说 Colour it red"},
                    ],
                    'reading': [
                        {"passage": "I have a keyboard with many keys. This key is red. That key is blue. Here is a yellow key, and there is a green one.", "q": "How many colours are on the keyboard?", "options": ["Four", "Two", "Six"], "answer": 0, "explain": "文中提到 red, blue, yellow, green 四种颜色"},
                    ],
                },
                {
                    'code': "3A_U5",
                    'words': [
                        ("password", "密码"),
                        ("number", "数字；号码"),
                        ("set", "设置"),
                        ("secret", "秘密（的）"),
                        ("safe", "安全的"),
                        ("remember", "记住"),
                        ("type", "输入；打字"),
                        ("ten", "十"),
                    ],
                    'grammar': [
                        {"q": "How many ____ do we need?", "options": ["numbers", "number", "a number"], "answer": 0, "explain": "How many 后用可数名词复数"},
                        {"q": "Don't tell your password ____ others.", "options": ["to", "for", "at"], "answer": 0, "explain": "tell... to 是固定搭配"},
                    ],
                    'listening': [
                        {"audioText": "W: Let's set a password. How many numbers do we need? M: Pick four numbers, from one to ten.", "q": "How many numbers for the password?", "options": ["Four", "Ten", "Two"], "answer": 0, "explain": "回答 Pick four numbers"},
                    ],
                    'reading': [
                        {"passage": "A password is a special secret. It is made of numbers, like 2, 5, 8, 0. We type the password to keep things safe. Don't tell your password to others.", "q": "What should we NOT do with a password?", "options": ["Tell it to others", "Remember it", "Keep it safe"], "answer": 0, "explain": "文中说 Don't tell your password to others"},
                    ],
                },
                {
                    'code': "3A_U6",
                    'words': [
                        ("draw", "画"),
                        ("can", "能；会"),
                        ("picture", "图画"),
                        ("line", "线"),
                        ("circle", "圆"),
                        ("paint", "用颜料画"),
                        ("pen", "笔"),
                        ("nice", "漂亮的；好的"),
                    ],
                    'grammar': [
                        {"q": "I ____ draw a picture.", "options": ["can", "cans", "am"], "answer": 0, "explain": "can 后跟动词原形，不随人称变化"},
                        {"q": "Can you ____ it?", "options": ["paint", "paints", "painting"], "answer": 0, "explain": "Can 后面动词用原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Look, I can draw a circle for the sun! M: Wow! It is so nice.", "q": "What did the girl draw?", "options": ["A circle", "A flower", "A star"], "answer": 0, "explain": "女孩说 I can draw a circle"},
                    ],
                    'reading': [
                        {"passage": "I like to draw with my pen. First, I draw a circle. It is the sun. Then I draw two lines. They are the road. I paint the picture with red and green.", "q": "What does the circle become?", "options": ["The sun", "The road", "A ball"], "answer": 0, "explain": "文中说 It is the sun"},
                    ],
                },
                {
                    'code': "3A_U7",
                    'words': [
                        ("listen", "听"),
                        ("listener", "倾听者"),
                        ("hear", "听见"),
                        ("ear", "耳朵"),
                        ("quiet", "安静的"),
                        ("good", "好的"),
                        ("careful", "仔细的"),
                        ("please", "请"),
                    ],
                    'grammar': [
                        {"q": "Please ____ quiet.", "options": ["be", "is", "are"], "answer": 0, "explain": "祈使句 Please 后用动词原形 be"},
                        {"q": "Be a good ____, and you have more friends.", "options": ["listener", "listen", "listening"], "answer": 0, "explain": "good 后接名词 listener"},
                    ],
                    'listening': [
                        {"audioText": "M: Class, please be quiet. I will listen now. W: Good! A good listener learns a lot.", "q": "What makes a good listener?", "options": ["Being quiet", "Talking loudly", "Running fast"], "answer": 0, "explain": "老师说 Please be quiet"},
                    ],
                    'reading': [
                        {"passage": "A good listener is quiet and careful. We listen with our ears, not our mouths. When a friend talks, we hear every word. Be a good listener, and you have more friends.", "q": "How do we become a good listener?", "options": ["Be quiet and careful", "Talk more", "Run and jump"], "answer": 0, "explain": "文中说 A good listener is quiet and careful"},
                    ],
                },
                {
                    'code': "3A_U8",
                    'words': [
                        ("exercise", "锻炼"),
                        ("time", "时间"),
                        ("run", "跑"),
                        ("jump", "跳"),
                        ("swim", "游泳"),
                        ("play", "玩；做（运动）"),
                        ("sport", "运动"),
                        ("healthy", "健康的"),
                    ],
                    'grammar': [
                        {"q": "It's time ____ exercise!", "options": ["to", "for", "at"], "answer": 0, "explain": "It's time to + 动词原形"},
                        {"q": "Sport ____ us healthy.", "options": ["makes", "make", "making"], "answer": 0, "explain": "Sport 是第三人称单数，动词加 -s"},
                    ],
                    'listening': [
                        {"audioText": "M: It's time to exercise! We can run, jump and play ball. W: I love exercise!", "q": "What can they do for exercise?", "options": ["Run and jump", "Read books", "Draw pictures"], "answer": 0, "explain": "老师说 We can run, jump and play ball"},
                    ],
                    'reading': [
                        {"passage": "Exercise is good for us every day. In the morning, I run and jump. In summer, I like to swim. After school, my friends and I play ball. We do sports and stay healthy and happy!", "q": "Why do we exercise?", "options": ["To stay healthy and happy", "To read books", "To eat food"], "answer": 0, "explain": "文中说 We do sports and stay healthy and happy!"},
                    ],
                },
                {
                    'code': "3A_U9",
                    'words': [
                        ("music", "音乐"),
                        ("show", "表演；展示"),
                        ("sing", "唱"),
                        ("song", "歌曲"),
                        ("dance", "跳舞"),
                        ("stage", "舞台"),
                    ],
                    'grammar': [
                        {"q": "Let's ____ a music show.", "options": ["have", "has", "having"], "answer": 0, "explain": "Let's 后跟动词原形"},
                        {"q": "I can ____ an English song.", "options": ["sing", "sings", "singing"], "answer": 0, "explain": "can 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Let's have a music show! Who can sing an English song? M: I can!", "q": "Who can sing an English song?", "options": ["The boy", "Lily", "Miss Wang"], "answer": 0, "explain": "男孩回答 I can"},
                    ],
                    'reading': [
                        {"passage": "This term we learned so much. We know letters, words, colours and numbers. We can draw, listen, exercise and play. Now we sing and dance in our music show.", "q": "What do they do in the music show?", "options": ["Sing and dance", "Draw pictures", "Type words"], "answer": 0, "explain": "文中说 We sing and dance in our music show"},
                    ],
                },
            ]},
    # grade3下 - 9单元 70词（待精造）
    '3B': {'grade': 3, 'term': '下', 'units': [None]*9},
    # grade4上 - 9单元 70词（待精造）
    '4A': {'grade': 4, 'term': '上', 'units': [None]*9},
    # grade4下 - 9单元 70词（待精造）
    '4B': {'grade': 4, 'term': '下', 'units': [None]*9},
    # grade5上 - 9单元 70词（待精造）
    '5A': {'grade': 5, 'term': '上', 'units': [None]*9},
    # grade5下 - 9单元 70词（待精造）
    '5B': {'grade': 5, 'term': '下', 'units': [None]*9},
    # grade6上 - 9单元 70词（待精造）
    '6A': {'grade': 6, 'term': '上', 'units': [None]*9},
    # grade1上 - 2单元 10词（无课文，待精造）
    '1A': {'grade': 1, 'term': '上', 'units': [None]*2},
    # grade1下 - 2单元 10词
    '1B': {'grade': 1, 'term': '下', 'units': [None]*2},
    # grade2上 - 2单元 10词
    '2A': {'grade': 2, 'term': '上', 'units': [None]*2},
    # grade2下 - 2单元 10词
    '2B': {'grade': 2, 'term': '下', 'units': [None]*2},
    # grade6下 - 11单元（2014旧版，已有基础题，按需补充）
    '6B': {'grade': 6, 'term': '下', 'units': [None]*11},
}


def build():
    spelling, grammar, listening, reading = [], [], [], []
    for book, meta in BOOKS.items():
        grade, term = meta['grade'], meta['term']
        units = meta.get('units', [])
        lcount = 0
        for i, u in enumerate(units):
            if u is None:
                continue
            code = u['code']
            # 拼写
            for en, cn in u.get('words', []):
                spelling.append({
                    'grade': grade, 'term': term, 'code': code,
                    'q': cn, 'answer': en.lower(), 'hint': hint_of(en),
                    'difficulty': 1 if grade <= 3 else 2,
                    'explain': f"'{cn}' 的英文是 {en}", 'source': 'ai_jk_v2',
                })
            # 语法
            for g in u.get('grammar', []):
                grammar.append({
                    'grade': grade, 'term': term, 'code': code,
                    'q': g['q'], 'options': g['options'], 'answer': g['answer'],
                    'explain': g['explain'], 'difficulty': g.get('difficulty', 1),
                    'source': 'ai_jk_v2',
                })
            # 听力
            for ls in u.get('listening', []):
                lcount += 1
                af = f"jk_listening_{book}_{lcount:02d}.mp3"
                listening.append({
                    'grade': grade, 'term': term, 'code': code,
                    'audioText': ls['audioText'], 'audioFile': af,
                    'q': ls['q'], 'options': ls['options'], 'answer': ls['answer'],
                    'explain': ls['explain'], 'difficulty': ls.get('difficulty', 1),
                    'source': 'ai_jk_v2',
                })
            # 阅读（grade3+）
            if grade >= 3:
                for rd in u.get('reading', []):
                    reading.append({
                        'grade': grade, 'term': term, 'code': code,
                        'passage': rd['passage'],
                        'q': rd['q'], 'options': rd['options'], 'answer': rd['answer'],
                        'explain': rd['explain'], 'difficulty': rd.get('difficulty', 1),
                        'source': 'ai_jk_v2',
                    })
    return spelling, grammar, listening, reading


def load_old(typ):
    """读取现有题库文件，不存在则返回 []"""
    p = os.path.join(QDIR, f'jk_{typ}.json')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    return []


def _grade_term_label(g, t):
    """年级/学期 → 可读标签"""
    return f"G{g}{'上' if t == '上' else '下'}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--force', action='store_true',
                    help='跳过安全确认，直接写入')
    args = ap.parse_args()
    spelling, grammar, listening, reading = build()
    total = len(spelling)+len(grammar)+len(listening)+len(reading)
    print(f"[jk题库 本次精造] 拼写{len(spelling)} / 语法{len(grammar)} / 听力{len(listening)} / 阅读{len(reading)} / 共{total}题")
    if listening:
        print(f"[听力音频] " + ", ".join(q['audioFile'] for q in listening[:5]) +
              (f"... 共{len(listening)}个" if len(listening) > 5 else ""))

    if not args.write or total == 0:
        if not args.write:
            print("(dry-run，加 --write 实际写入)")
        else:
            print("  (无题目数据，未写入)")
        return

    # 需要重建的 (grade, term) 集合（仅包含实际填充了数据的册）
    rebuild_keys = set()
    for meta in BOOKS.values():
        units = meta.get('units', [])
        if any(u is not None for u in units):
            rebuild_keys.add((meta['grade'], meta['term']))

    # 🔒 L2 安全网：写入前先备份旧文件
    os.makedirs(QDIR, exist_ok=True)
    backup_dir = os.path.join(QDIR, '.backups')
    os.makedirs(backup_dir, exist_ok=True)
    from datetime import datetime
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    backed_up = []
    for typ in ['spelling', 'grammar', 'listening', 'reading']:
        p = os.path.join(QDIR, f'jk_{typ}.json')
        if os.path.exists(p):
            bak = os.path.join(backup_dir, f'jk_{typ}_{ts}.json')
            import shutil
            shutil.copy2(p, bak)
            backed_up.append((typ, len(load_old(typ))))
    if backed_up:
        print(f"[🔒 备份] {backup_dir}/  ({ts})")
        for typ, cnt in backed_up:
            print(f"    jk_{typ}_{ts}.json  ({cnt}题)")

    # 📊 差异报告
    print(f"\n[📊 差异报告] 本次重建范围: {', '.join(_grade_term_label(g,t) for g,t in sorted(rebuild_keys))}")
    for typ, new_data in [('spelling', spelling), ('grammar', grammar),
                           ('listening', listening), ('reading', reading)]:
        old = load_old(typ)
        removed = [q for q in old if (q.get('grade'), q.get('term')) in rebuild_keys]
        kept = [q for q in old if (q.get('grade'), q.get('term')) not in rebuild_keys]
        merged = kept + new_data
        p = os.path.join(QDIR, f'jk_{typ}.json')
        print(f"  {typ:9s}: 旧{len(old)} → 保留{len(kept)} + 新{len(new_data)} → 合并{len(merged)}题  |  替换{len(removed)}条旧题")
        # 🚨 如果合并后题量骤降 30% 以上且非 --force，中断并提示
        if len(old) > 0 and len(merged) < len(old) * 0.7 and not args.force:
            print(f"\n  ⛔ 安全阻断：{typ} 合并后 ({len(merged)}) 比旧版 ({len(old)}) 减少 {(1 - len(merged)/len(old))*100:.0f}%，超过 30% 阈值")
            print(f"     如果是预期行为，请用 --force 跳过。旧题已备份于 {backup_dir}/")
            return
        tmp = p + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(merged, f, ensure_ascii=False, indent=2)
        os.replace(tmp, p)
    total_merged = sum(
        len(load_old(t)) for t in ['spelling','grammar','listening','reading']
    )
    print(f"\n[✅ 写入完成] 题库合并后总计 {total_merged} 题\n")


if __name__ == '__main__':
    main()
