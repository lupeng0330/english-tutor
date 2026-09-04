# -*- coding: utf-8 -*-
"""
为六年级下册（教科版·三起）生成 4 类题库（spelling / grammar / listening / reading），
每道题带 unit 字段，与 jk.json grade6.下 的单元严格对应。

规则：
  - 删除原 jk_xxx.json 中 grade6.下 的旧题
  - 追加新题；新题 id/code 形如 "6B_U1_S01"（spelling U1 第 01 题）
  - 人工手写，内容契合教材（Unit 1 龟兔赛跑、Unit 2 守株待兔、Unit 3 动物……）
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QB_DIR = os.path.join(ROOT, "data", "questions")


# =========================================================================
# 拼写题：中译英填空（输入完整单词 / 带首字母提示）
# 来自单元词汇表，答案确定
# =========================================================================
SPELLING = [
    # ----- U1 Slow and steady wins the race -----
    ("u1", "野兔", "hare",    "h___"),
    ("u1", "赢；赢得", "win",  "w__"),
    ("u1", "携带；扛", "carry", "c____"),
    ("u1", "稳健的", "steady", "s_____"),
    ("u1", "傻的", "silly",   "s____"),
    # ----- U2 Waiting for another hare -----
    ("u2", "死", "die",         "d__"),
    ("u2", "地面", "ground",    "g_____"),
    ("u2", "出现", "appear",    "a_____"),
    ("u2", "消失；灭绝", "disappear", "d________"),
    ("u2", "永远", "forever",   "f______"),
    # ----- U3 What animal is it? -----
    ("u3", "青蛙", "frog",       "f___"),
    ("u3", "袋鼠", "kangaroo",   "k_______"),
    ("u3", "海星", "starfish",   "s_______"),
    ("u3", "海洋", "ocean",      "o____"),
    ("u3", "大象", "elephant",   "e_______"),
    # ----- U4 We can save the animals -----
    ("u4", "皮毛", "fur",        "f__"),
    ("u4", "处于危险中", "in danger",  "in d_____"),
    ("u4", "森林（填名词）", "forest", "f_____"),
    ("u4", "老虎", "tiger",      "t____"),
    ("u4", "熊猫", "panda",      "p____"),
    # ----- U5 Dr Sun Yatsen -----
    ("u5", "著名的", "famous",     "f_____"),
    ("u5", "历史", "history",     "h______"),
    ("u5", "领袖", "leader",      "l_____"),
    ("u5", "以……命名", "named after", "n____ a____"),
    ("u5", "音乐家", "musician",   "m_______"),
    # ----- U6 Early years of Deng Jiaxian -----
    ("u6", "聪明的", "clever",     "c_____"),
    ("u6", "科学家", "scientist",  "s________"),
    ("u6", "教授", "professor",   "p________"),
    ("u6", "贡献", "contribution","c___________"),
    ("u6", "大学", "university",  "u_________"),
    # ----- U7 It's the polite thing to do -----
    ("u7", "礼貌（复数）", "manners", "m______"),
    ("u7", "座位", "seat",        "s___"),
    ("u7", "队（伍）", "line",     "l___"),
    ("u7", "推", "push",          "p___"),
    ("u7", "没有礼貌的", "impolite", "i_______"),
    # ----- U8 The magic words -----
    ("u8", "神奇的", "magic",       "m____"),
    ("u8", "扔；掉", "throw",       "t____"),
    ("u8", "难过；不安", "upset",    "u____"),
    ("u8", "指引；引路", "lead",     "l___"),
    ("u8", "指示牌", "sign",        "s___"),
    # ----- U9 Where will you go? -----
    ("u9", "在国外", "abroad",      "a_____"),
    ("u9", "大自然", "nature",      "n_____"),
    ("u9", "选择", "choose",       "c_____"),
    ("u9", "歌剧", "opera",        "o____"),
    ("u9", "首都", "capital",      "c______"),
    # ----- U10 I can't wait to see you -----
    ("u10", "护照", "passport",     "p_______"),
    ("u10", "票", "ticket",         "t_____"),
    ("u10", "机场", "airport",      "a______"),
    ("u10", "着陆", "land",         "l___"),
    ("u10", "瀑布", "waterfall",    "w________"),
    # ----- U11 Review -----
    ("u11", "保护（动物）", "protect", "p______"),
    ("u11", "拯救", "save",         "s___"),
    ("u11", "地球", "earth",        "e____"),
    ("u11", "旅行", "travel",       "t_____"),
    ("u11", "家乡", "hometown",     "h_______"),
]


# =========================================================================
# 语法题：单选。主要考点：时态 / 情态动词 / 固定搭配 / 比较级
# =========================================================================
GRAMMAR = [
    # U1 一般过去时 · slow and steady
    ("u1", 'The hare ____ too proud and took a rest.',
     ['was', 'is', 'were'], 0,
     '一般过去时，单数主语用 was。'),
    ("u1", 'Slow and steady ____ the race.',
     ['win', 'wins', 'winning'], 1,
     '谚语：主语 "Slow and steady" 作第三人称单数，动词加 s。'),
    ("u1", 'Jiamin tried to ____ all the books.',
     ['carries', 'carrying', 'carry'], 2,
     'try to + 动词原形。'),

    # U2 一般过去时 / from then on
    ("u2", 'A hare crashed into the tree and ____.',
     ['dies', 'died', 'dying'], 1,
     '一般过去时的不规则动词 die → died。'),
    ("u2", '____ then on, the farmer stopped working.',
     ['From', 'Since', 'On'], 0,
     '固定短语 from then on "从那时起"。'),
    ("u2", 'All his vegetables ____ because he stopped working.',
     ['dies', 'died', 'are dead'], 1,
     '一般过去时：vegetables (复数) + died。'),

    # U3 描述动物特征
    ("u3", 'A kangaroo has two strong back legs and ____ jump far.',
     ['can', 'must', 'should'], 0,
     '"能够" 用 can。'),
    ("u3", 'It looks like a star and it ____ in the ocean.',
     ['live', 'lives', 'lived'], 1,
     '一般现在时第三人称单数：it + lives。'),
    ("u3", 'A lion is also ____ the "King of the Animals".',
     ['call', 'called', 'calling'], 1,
     '被动结构 be called。'),

    # U4 should / if 条件句
    ("u4", 'Many animals are ____ danger.',
     ['on', 'in', 'at'], 1,
     '固定短语 in danger。'),
    ("u4", 'If we don\'t do something, they may ____ disappear.',
     ['all', 'any', 'every'], 0,
     'may all disappear = 可能都消失。'),
    ("u4", 'Don\'t buy things ____ from animal fur.',
     ['make', 'made', 'making'], 1,
     '过去分词作定语：things made from...。'),

    # U5 一般过去时 / was / were
    ("u5", 'When ____ Dr Sun Yatsen born?',
     ['is', 'was', 'were'], 1,
     '"出生" 用过去时 was born。'),
    ("u5", 'Today many roads and schools ____ his name.',
     ['have', 'has', 'having'], 0,
     '主语 roads and schools 复数 + have。'),
    ("u5", 'Helen Keller ____ a famous person in history.',
     ['is', 'was', 'were'], 1,
     '已故人物用过去时 was。'),

    # U6 一般过去时 / hard-working
    ("u6", 'Deng Jiaxian ____ born in Anhui in 1924.',
     ['was', 'were', 'is'], 0,
     '单数主语 + was born。'),
    ("u6", 'He ____ a PhD in only two years.',
     ['get', 'gets', 'got'], 2,
     '一般过去时 get → got。'),
    ("u6", 'Mozart began to ____ music when he was five.',
     ['write', 'wrote', 'writes'], 0,
     'begin to + 动词原形。'),

    # U7 should / shouldn't
    ("u7", 'We ____ always give our seat to people in need.',
     ['shouldn\'t', 'should', 'mustn\'t'], 1,
     'should 表示 "应该"。'),
    ("u7", 'Don\'t ____ in line. It\'s impolite.',
     ['push', 'pushing', 'pushes'], 0,
     '祈使句否定：Don\'t + 动词原形。'),
    ("u7", 'You ____ wait for your turn patiently.',
     ['shouldn\'t', 'should', 'can\'t'], 1,
     'should 建议语气。'),

    # U8 magic words / 礼貌请求
    ("u8", 'Can you help me ____ the book, please?',
     ['pass', 'passes', 'passing'], 0,
     'help sb (to) do：后跟动词原形。'),
    ("u8", '"Please" and "Thank you" ____ magic words.',
     ['is', 'are', 'am'], 1,
     '主语并列视为复数，用 are。'),
    ("u8", 'I ____ busy yesterday, so I didn\'t reply.',
     ['was', 'were', 'am'], 0,
     '一般过去时 I 用 was。'),

    # U9 将来时 will / be going to
    ("u9", 'Where ____ you go, Ben?',
     ['do', 'will', 'are'], 1,
     '一般将来时 Where will you go?'),
    ("u9", 'I will ____ to South Africa to see the nature.',
     ['go', 'going', 'went'], 0,
     'will + 动词原形。'),
    ("u9", 'Jiamin ____ France if he can travel abroad.',
     ['chooses', 'will choose', 'chose'], 1,
     'if + 条件，主将从现：主句用 will。'),

    # U10 can't wait to / will / 一般过去时
    ("u10", 'I can\'t wait ____ see you!',
     ['for', 'to', 'at'], 1,
     '固定短语 can\'t wait to do。'),
    ("u10", 'I ____ my passport last week.',
     ['got', 'get', 'will get'], 0,
     '一般过去时 get → got。'),
    ("u10", 'The plane ____ at 1:00 p.m. next month.',
     ['lands', 'landed', 'will land'], 2,
     '将来时 "下个月" 用 will + 动词原形。'),

    # U11 综合复习
    ("u11", 'If the mouse ____ small, can it help the lion?',
     ['is', 'was', 'are'], 0,
     'If + 一般现在时：is。'),
    ("u11", 'Nelson Mandela ____ the Nobel Peace Prize in 1993.',
     ['win', 'won', 'wins'], 1,
     'in 1993 一般过去时 win → won。'),
    ("u11", 'We should ____ our Earth and protect animals.',
     ['save', 'saves', 'saving'], 0,
     'should + 动词原形。'),
]


# =========================================================================
# 听力题：短对话或独白 + 选择题（audioText 会被 gen_audio_v2 读成 MP3）
# =========================================================================
LISTENING = [
    ("u1",
     "Janet: Why are you in such a hurry, Jiamin? Jiamin: I have to return this book to the library.",
     "listening_6B_U1_01.mp3",
     "Where is Jiamin going?",
     ["The classroom", "The library", "The playground"], 1,
     "Jiamin 说要去图书馆还书。"),
    ("u1",
     "Boy: In the story, the hare took a rest under a tree. The tortoise walked slowly but never stopped.",
     "listening_6B_U1_02.mp3",
     "Who won the race?",
     ["The hare", "The tortoise", "Neither"], 1,
     "龟兔赛跑里乌龟赢了。"),

    ("u2",
     "Teacher: A hare ran and crashed into a tree. It fell to the ground and died.",
     "listening_6B_U2_01.mp3",
     "What happened to the hare?",
     ["It ran away", "It died", "It was hungry"], 1,
     "野兔撞树后死了。"),
    ("u2",
     "Boy: The farmer stopped working. He just sat and waited for another hare. His vegetables died.",
     "listening_6B_U2_02.mp3",
     "Why did his vegetables die?",
     ["He didn\u2019t water them", "He stopped working", "It was too hot"], 1,
     "农夫不再劳作，庄稼枯死。"),

    ("u3",
     "Jiamin: This animal has two strong back legs and it can jump very far.",
     "listening_6B_U3_01.mp3",
     "What animal is Jiamin talking about?",
     ["A frog", "A kangaroo", "A rabbit"], 1,
     "两条强壮后腿 + 跳得很远 → 袋鼠。"),
    ("u3",
     "Janet: It is a very large animal. It has a long nose and two big ears. It likes eating plants.",
     "listening_6B_U3_02.mp3",
     "What is it?",
     ["An elephant", "A tiger", "A lion"], 0,
     "长鼻子大耳朵 + 吃植物 → 大象。"),

    ("u4",
     "Reporter: Pandas, tigers and whales are in danger. We need to save them together.",
     "listening_6B_U4_01.mp3",
     "Which animal is NOT mentioned?",
     ["Panda", "Tiger", "Lion"], 2,
     "只提到了熊猫、老虎、鲸鱼。"),
    ("u4",
     "Amy: People cut down forests and pollute rivers. Animals lose their homes.",
     "listening_6B_U4_02.mp3",
     "What is making animals lose their homes?",
     ["Cutting forests and polluting rivers", "Drought", "Hunting"], 0,
     "砍伐森林 + 污染河流。"),

    ("u5",
     "Xiaoling: Dr Sun Yatsen was born in 1866 in Guangdong. He was a great leader of China.",
     "listening_6B_U5_01.mp3",
     "When was Dr Sun Yatsen born?",
     ["1866", "1876", "1888"], 0,
     "1866 年出生。"),
    ("u5",
     "Ben: Mozart began to play the piano when he was four and write music when he was five.",
     "listening_6B_U5_02.mp3",
     "How old was Mozart when he started writing music?",
     ["Four", "Five", "Six"], 1,
     "五岁开始作曲。"),

    ("u6",
     "Teacher: Deng Jiaxian was the father of Chinese atomic science. He was clever and hard-working.",
     "listening_6B_U6_01.mp3",
     "What was Deng Jiaxian?",
     ["A musician", "A scientist", "A writer"], 1,
     "他是科学家（原子科学之父）。"),
    ("u6",
     "Ben: Deng went to the United States in 1948 to study physics. He finished his PhD in only two years.",
     "listening_6B_U6_02.mp3",
     "How long did Deng take to finish his PhD?",
     ["Four years", "Two years", "One year"], 1,
     "两年完成博士学位。"),

    ("u7",
     "Jiamin: Today on the bus I stood up to give my seat to an old lady. But a young man sat down first.",
     "listening_6B_U7_01.mp3",
     "What did the young man do?",
     ["He gave his seat", "He sat down quickly", "He helped the lady"], 1,
     "年轻人抢坐了。"),
    ("u7",
     "Xiaoling: Yesterday at the supermarket, a girl tried to push in line without saying \u201cExcuse me\u201d.",
     "listening_6B_U7_02.mp3",
     "What did the girl do wrong?",
     ["She was too loud", "She pushed in line", "She ran"], 1,
     "插队。"),

    ("u8",
     "Ted the bear: Can I help you? Can I open the door for you?",
     "listening_6B_U8_01.mp3",
     "What is Ted doing?",
     ["Asking for food", "Offering help", "Playing a game"], 1,
     "礼貌地提供帮助。"),
    ("u8",
     "Boy: Please and thank you are the magic words that make people happy.",
     "listening_6B_U8_02.mp3",
     "What does the boy call magic words?",
     ["Sorry and excuse me", "Please and thank you", "Hello and goodbye"], 1,
     "magic words = please + thank you。"),

    ("u9",
     "Ben: I will go to South Africa. I love nature.",
     "listening_6B_U9_01.mp3",
     "Where will Ben go?",
     ["Japan", "France", "South Africa"], 2,
     "Ben 选南非。"),
    ("u9",
     "Jiamin: If I can travel abroad, I will go to France. Paris is the food capital of the world.",
     "listening_6B_U9_02.mp3",
     "Why does Jiamin want to go to Paris?",
     ["For food", "For clothes", "For music"], 0,
     "巴黎以美食闻名。"),

    ("u10",
     "Li Hua: I will arrive at the airport on June 12th at 1 p.m.",
     "listening_6B_U10_01.mp3",
     "When will Li Hua arrive?",
     ["June 2nd, 1 p.m.", "June 12th, 1 p.m.", "June 12th, 12 p.m."], 1,
     "6 月 12 日下午 1 点。"),
    ("u10",
     "Janet: I live in Milan. It is in the north of Italy and famous for fashion.",
     "listening_6B_U10_02.mp3",
     "Where does Janet live?",
     ["Rome", "Milan", "Paris"], 1,
     "Janet 住在米兰。"),

    ("u11",
     "Teacher: In Africa you can see lions hunt, elephants play and giraffes eat leaves.",
     "listening_6B_U11_01.mp3",
     "Which animal is NOT mentioned?",
     ["Lion", "Panda", "Giraffe"], 1,
     "没提到熊猫。"),
    ("u11",
     "Boy: Nelson Mandela won the Nobel Peace Prize in 1993 and became president in 1994.",
     "listening_6B_U11_02.mp3",
     "When did Mandela become president?",
     ["1993", "1994", "2013"], 1,
     "1994 年成为南非总统。"),
]


# =========================================================================
# 阅读题：短文 + 1-2 道选择题（passage 来自课本或课本改编）
# =========================================================================
READING = [
    ("u1",
     "One day, a tortoise and a hare had a race. The hare was sure he would win, so he took a rest. The slow but careful tortoise won the race.",
     "Why did the hare lose?",
     ["He was slow", "He took a rest", "He was tired"], 1,
     "兔子太骄傲停下休息，所以输了。"),
    ("u1",
     "Jiamin was in a hurry because he had to return a book to the library. Janet said he was like a silly hare.",
     "Why was Jiamin in a hurry?",
     ["He was late for class", "He needed to return a book", "He wanted to win a race"], 1,
     "Jiamin 赶着去还书。"),

    ("u2",
     "A farmer picked up a dead hare and took it home. From then on, he stopped working and waited under the tree. But no hare came again, and his crops died.",
     "What happened to the farmer in the end?",
     ["He became rich", "He had nothing to eat", "He caught many hares"], 1,
     "再没兔子来，庄稼死光，他没东西吃。"),
    ("u2",
     "Aki cried \"Fire\" to trick his friends. The boy told him the story of The Boy Who Cried Wolf and warned him not to tell lies.",
     "What is the lesson of the story?",
     ["Always tell the truth", "Never help friends", "Run from wolves"], 0,
     "寓意：要讲真话。"),

    ("u3",
     "Pandas live in China. They are black and white. They eat bamboo. Pandas are endangered animals.",
     "What do pandas eat?",
     ["Meat", "Bamboo", "Leaves"], 1,
     "熊猫吃竹子。"),
    ("u3",
     "Billy the little bird built a new warm house alone. Then all the other birds came to help him. Billy learned he had many friends.",
     "Why did the birds come to help Billy?",
     ["Because they liked him and saw he was busy", "Because he paid them", "Because he asked"], 0,
     "他们看他很忙，愿意帮他。"),

    ("u4",
     "Many animals are in danger. People cut down forests and pollute rivers. Animals lose their homes. If we work together, we can still save them.",
     "What is one reason animals are in danger?",
     ["There are too many of them", "People cut forests and pollute rivers", "The weather is too cold"], 1,
     "人类砍伐森林、污染河流。"),
    ("u4",
     "Dangerous animals escaped from the zoo. A brown bear is catching fish in the park lake. A tiger is walking on a street. Police are trying to catch them.",
     "Where is the brown bear?",
     ["In a cage", "In the park lake", "On a street"], 1,
     "棕熊在公园湖里。"),

    ("u5",
     "Dr Sun Yatsen was born in 1866 in Guangdong. He was a great leader. He loved the Chinese people and tried to free them. Today many roads and schools have his name.",
     "Where was Dr Sun Yatsen born?",
     ["Beijing", "Guangdong", "Shanghai"], 1,
     "他在广东出生。"),
    ("u5",
     "Mozart was born in Salzburg, Austria, in 1756. He began to play the piano at four and wrote music at five. He was very poor and died at only 35.",
     "How old was Mozart when he died?",
     ["35", "45", "55"], 0,
     "35 岁去世。"),

    ("u6",
     "Deng Jiaxian was born in Anhui in 1924. He wanted to be a teacher, but his father asked him to study science. He finished his PhD in only two years in the US and was called the \"Baby Doctor\".",
     "Why was Deng called the \"Baby Doctor\"?",
     ["He was short", "He was the youngest in his class", "He looked like a baby"], 1,
     "他是班上最年轻的，所以叫“娃娃博士”。"),
    ("u6",
     "J.K. Rowling was born in 1965. Before writing Harry Potter, she was poor and had no job. She wrote in a coffee shop every day. Her book came out in 1997 and became a huge success.",
     "Where did Rowling write the first Harry Potter book?",
     ["At home", "At school", "In a coffee shop"], 2,
     "她在咖啡馆写书。"),

    ("u7",
     "If you see an old lady standing on the bus, you should give her your seat. It is polite. Don't push in line. Wait for your turn.",
     "What is the polite thing to do on a bus?",
     ["Push in line", "Talk loudly", "Give your seat to an old lady"], 2,
     "公交车上礼貌行为 = 给老人让座。"),
    ("u7",
     "In Japan, people bow from the waist. In Italy, people kiss. In India, it's rude to eat with the left hand. Different countries have different manners.",
     "How do people in Japan greet each other?",
     ["By shaking hands", "By bowing", "By kissing"], 1,
     "日本人以鞠躬问候。"),

    ("u8",
     "A boy met a magic tree. He tried many words, but only \"please\" and \"thank you\" worked. The tree opened and showed him a room full of toys and chocolate.",
     "Which words opened the tree?",
     ["Open and hurry", "Please and thank you", "Sorry and excuse me"], 1,
     "“请”和“谢谢”是魔法词。"),
    ("u8",
     "Ted is a polite bear. He wears clean clothes and says hello to friends. He often asks \"Can I help you?\" and carries heavy bags for others.",
     "What makes Ted a polite bear?",
     ["He is strong", "He has good manners and helps others", "He is handsome"], 1,
     "Ted 有礼貌 + 乐于助人。"),

    ("u9",
     "Daniel used to live in a big farm in the country. His family had sheep, cows and two dogs. But there was not much rain, so they moved to Sydney.",
     "Why did Daniel's family move to Sydney?",
     ["For a better school", "Because there was not enough water", "Because of his friends"], 1,
     "没有足够的雨水和水。"),
    ("u9",
     "Mr Brown went to Hawaii with his friends last month. They swam, sunbathed, went boating and watched dances. They will go there again and stay longer.",
     "What did Mr Brown NOT do in Hawaii?",
     ["Swim", "Ski", "Watch dances"], 1,
     "夏威夷他们没滑雪。"),

    ("u10",
     "Li Hua wrote to John. He will travel to Canada next month to visit John\u2019s family. He wants to see lakes and waterfalls, and visit Chinatown in Toronto. His plane lands on June 12th at 1 p.m.",
     "Where does Li Hua plan to visit in Canada?",
     ["Only the lakes", "Lakes, waterfalls and Chinatown in Toronto", "Only Toronto"], 1,
     "湖泊、瀑布和多伦多唐人街都去。"),
    ("u10",
     "Janet sent a postcard from Milan, Italy. Milan is famous for fashion. She tried pasta, pizza and gelato. She will travel to France, Switzerland and Austria in the holiday.",
     "What is Milan famous for?",
     ["Pizza", "Fashion", "Wine"], 1,
     "米兰以时尚闻名。"),

    ("u11",
     "The lion caught a small mouse but let it go. Later the lion was trapped in a hunter\u2019s net. The small mouse came and chewed the net, setting the lion free.",
     "What is the moral of the story?",
     ["The lion is king", "Never look down on anyone", "Mice are stronger than lions"], 1,
     "寓意：不要小看弱小的。"),
    ("u11",
     "Nelson Mandela was born in 1918 in South Africa. He studied law and tried to free black people. He was in prison for 27 years. In 1994 he became president of South Africa.",
     "When did Mandela become president?",
     ["1918", "1993", "1994"], 2,
     "1994 年成为总统。"),
]


def pad(i):
    return str(i).zfill(2)


def build():
    # ---------- spelling ----------
    sp = []
    cnt = {}
    for unit, q_cn, ans, hint in SPELLING:
        cnt[unit] = cnt.get(unit, 0) + 1
        idx = cnt[unit]
        sp.append({
            "grade": 6,
            "term": "下",
            "unit": unit,
            "code": f"6B_U{unit[1:]}_S{pad(idx)}",
            "q": q_cn,
            "answer": ans,
            "hint": hint,
            "difficulty": 2
        })

    # ---------- grammar ----------
    gr = []
    cnt = {}
    for unit, q_en, options, ans_idx, explain in GRAMMAR:
        cnt[unit] = cnt.get(unit, 0) + 1
        idx = cnt[unit]
        gr.append({
            "grade": 6,
            "term": "下",
            "unit": unit,
            "code": f"6B_U{unit[1:]}_G{pad(idx)}",
            "q": q_en,
            "options": options,
            "answer": ans_idx,
            "explain": explain,
            "difficulty": 2
        })

    # ---------- listening ----------
    li = []
    cnt = {}
    for unit, audio_text, audio_file, q, options, ans_idx, explain in LISTENING:
        cnt[unit] = cnt.get(unit, 0) + 1
        idx = cnt[unit]
        li.append({
            "grade": 6,
            "term": "下",
            "unit": unit,
            "code": f"6B_U{unit[1:]}_L{pad(idx)}",
            "audioText": audio_text,
            "audioFile": audio_file,
            "q": q,
            "options": options,
            "answer": ans_idx,
            "explain": explain,
            "difficulty": 2
        })

    # ---------- reading ----------
    rd = []
    cnt = {}
    for unit, passage, q, options, ans_idx, explain in READING:
        cnt[unit] = cnt.get(unit, 0) + 1
        idx = cnt[unit]
        rd.append({
            "grade": 6,
            "term": "下",
            "unit": unit,
            "code": f"6B_U{unit[1:]}_R{pad(idx)}",
            "passage": passage,
            "q": q,
            "options": options,
            "answer": ans_idx,
            "explain": explain,
            "difficulty": 2
        })

    # 写回：保留旧题（其他年级），仅替换 grade6.下
    def merge_write(fname, new_items):
        p = os.path.join(QB_DIR, fname)
        with open(p, "r", encoding="utf-8") as f:
            old = json.load(f)
        kept = [q for q in old if not (q.get("grade") == 6 and q.get("term") == "下")]
        final = kept + new_items
        with open(p, "w", encoding="utf-8") as f:
            json.dump(final, f, ensure_ascii=False, indent=2)
        print(f"  {fname}: kept {len(kept)} + new {len(new_items)} = {len(final)}")

    print("=" * 60)
    print(f"Building grade6.下 题库：")
    merge_write("jk_spelling.json", sp)
    merge_write("jk_grammar.json", gr)
    merge_write("jk_listening.json", li)
    merge_write("jk_reading.json", rd)
    print(f"Totals → spelling={len(sp)}  grammar={len(gr)}  listening={len(li)}  reading={len(rd)}")
    print(f"Total new questions: {len(sp)+len(gr)+len(li)+len(rd)}")

    # 按单元汇总
    print("\nBy unit:")
    for uid in ['u1','u2','u3','u4','u5','u6','u7','u8','u9','u10','u11']:
        ns = sum(1 for q in sp if q['unit']==uid)
        ng = sum(1 for q in gr if q['unit']==uid)
        nl = sum(1 for q in li if q['unit']==uid)
        nr = sum(1 for q in rd if q['unit']==uid)
        print(f"  {uid:>4}: S={ns} G={ng} L={nl} R={nr}  total={ns+ng+nl+nr}")


if __name__ == "__main__":
    build()
