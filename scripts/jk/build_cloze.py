# -*- coding: utf-8 -*-
"""
jk（教科版 3 上→6 上 7 册）完形填空题库生成器（P2-C 批次 3）。

设计：
  - 3-4 年级：每篇 40-60 词 + 4 挖空（适龄）
  - 5-6 年级：每篇 70-90 词 + 5 挖空（与 hj 标准接近）
  - 难度梯度：3 年级 difficulty=1，4 年级=2，5-6 年级=2-3 混合
  - 短文话题严格对齐 jk 教材单元主题
  - code 格式：{3-6}{A/B}_U{N}_C{NN}（N=单元号，NN=册内序号 01-05）
  - 7 册 × 5 篇 = 35 篇 / 80 + 75 = 155 挖空

运行：
  python scripts/jk/build_cloze.py            # dry-run
  python scripts/jk/build_cloze.py --write    # 实际写入
"""
import argparse
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))

from _build_cloze_common import make_cloze, make_blank, write_with_safety, validate_cloze_list  # noqa: E402

QDIR = os.path.join(ROOT, 'data', 'questions')
OUT = os.path.join(QDIR, 'jk_cloze.json')


# ============================================================
# jk 3A · 5 篇（U2 / U4 / U6 / U7 / U8）· 4 挖空 / 40-60 词 / difficulty=1
# ============================================================

def jk_3a():
    items = []

    # 1) 3A U2 English and Chinese
    items.append(make_cloze(
        grade=3, term='上', unit_n=2, seq=1,
        topic='English and Chinese · I can say hello',
        passage=(
            'Hi! I am Tom. I can ___1___ English. I can say "hello" and "thank you". '
            'My friend Lily can speak ___2___. She is from China. '
            'We learn ___3___ new words every day. We are ___4___ friends!'
        ),
        blanks=[
            make_blank(1, ['speak', 'eat', 'sleep', 'jump'], 'speak', 'speak English 讲英语'),
            make_blank(2, ['Chinese', 'red', 'happy', 'big'], 'Chinese', 'Lily 来自中国，会说中文'),
            make_blank(3, ['few', 'many', 'no', 'old'], 'many', 'many new words 许多新单词'),
            make_blank(4, ['bad', 'tired', 'good', 'angry'], 'good', 'good friends 好朋友，褒义'),
        ],
        explain='主题：中英文。考查动词 speak、语言名词、量词 many、形容词褒贬。',
        difficulty=1,
    ))

    # 2) 3A U4 Colour a Keyboard
    items.append(make_cloze(
        grade=3, term='上', unit_n=4, seq=2,
        topic='Colour a Keyboard · My colourful pens',
        passage=(
            'I have many pens. Look! The ___1___ pen is yellow. The big pen is ___2___. '
            'I like ___3___ best. Red is the colour of apples. '
            'My friend Sam likes ___4___. Blue is the colour of the sky.'
        ),
        blanks=[
            make_blank(1, ['small', 'tall', 'cold', 'fast'], 'small', 'small 小（与下文 big 对比）'),
            make_blank(2, ['noisy', 'red', 'tired', 'hungry'], 'red', '与下文 Red is the colour of apples 呼应'),
            make_blank(3, ['red', 'green', 'pink', 'black'], 'red', 'like red best 最喜欢红色；下文「红色是苹果的颜色」呼应'),
            make_blank(4, ['blue', 'white', 'brown', 'grey'], 'blue', '下文「蓝色是天空的颜色」呼应'),
        ],
        explain='主题：颜色。考查形容词大小对比、颜色词与具体事物的联想。',
        difficulty=1,
    ))

    # 3) 3A U6 I Can Draw
    items.append(make_cloze(
        grade=3, term='上', unit_n=6, seq=3,
        topic='I Can Draw · A pretty picture',
        passage=(
            'I can ___1___ a picture. Look at my picture! There is a big tree. '
            'The tree is ___2___. There are two birds in the tree. '
            'The birds are ___3___. I ___4___ my picture very much!'
        ),
        blanks=[
            make_blank(1, ['eat', 'draw', 'sleep', 'sing'], 'draw', '我能画画；与主题 I Can Draw 呼应'),
            make_blank(2, ['blue', 'green', 'red', 'white'], 'green', 'tree is green 树是绿色的；常识'),
            make_blank(3, ['big', 'sad', 'happy', 'cold'], 'happy', '小鸟很开心；褒义'),
            make_blank(4, ['hate', 'lose', 'like', 'sell'], 'like', 'like ... very much 非常喜欢'),
        ],
        explain='主题：画画。考查动词、颜色常识、形容词褒贬、like ... very much。',
        difficulty=1,
    ))

    # 4) 3A U7 Be a Good Listener
    items.append(make_cloze(
        grade=3, term='上', unit_n=7, seq=4,
        topic='Be a Good Listener · Listen and learn',
        passage=(
            'A good ___1___ is important. We listen with our ___2___. '
            'In class, we listen ___3___ the teacher. '
            'Then we can ___4___ new things every day.'
        ),
        blanks=[
            make_blank(1, ['eater', 'listener', 'driver', 'cook'], 'listener', '与主题 Good Listener 呼应'),
            make_blank(2, ['eyes', 'hands', 'ears', 'feet'], 'ears', '用耳朵听'),
            make_blank(3, ['on', 'to', 'in', 'at'], 'to', 'listen to 听，固定搭配'),
            make_blank(4, ['lose', 'forget', 'learn', 'sell'], 'learn', 'learn new things 学新东西，褒义'),
        ],
        explain='主题：当个好听众。考查名词、身体部位、listen to、动词褒贬。',
        difficulty=1,
    ))

    # 5) 3A U8 It's Time to Exercise
    items.append(make_cloze(
        grade=3, term='上', unit_n=8, seq=5,
        topic='Exercise · Let\'s play',
        passage=(
            'It is ___1___ to exercise! I can run. My sister can ___2___. '
            'My brother can play ___3___. We are all ___4___ and healthy.'
        ),
        blanks=[
            make_blank(1, ['time', 'food', 'home', 'water'], 'time', 'It is time to do 该是做...的时候，固定句型'),
            make_blank(2, ['eat', 'jump', 'sleep', 'cry'], 'jump', '姐姐会跳；运动动作'),
            make_blank(3, ['food', 'rules', 'games', 'lessons'], 'games', 'play games 玩游戏，固定搭配'),
            make_blank(4, ['weak', 'sick', 'strong', 'sad'], 'strong', 'strong and healthy 又强壮又健康，并列褒义'),
        ],
        explain='主题：运动。考查 It is time to、运动动词、play games、形容词褒贬并列。',
        difficulty=1,
    ))

    return items


# ============================================================
# jk 3B · 5 篇（U1 / U2 / U4 / U5 / U7）· 4 挖空 / 40-60 词 / difficulty=1
# ============================================================

def jk_3b():
    items = []

    # 1) 3B U1 Get up
    items.append(make_cloze(
        grade=3, term='下', unit_n=1, seq=1,
        topic='Get up · My morning',
        passage=(
            'I get ___1___ at seven. I wash my ___2___ and brush my teeth. '
            'I eat ___3___ with my family. Then I go to ___4___ by bike.'
        ),
        blanks=[
            make_blank(1, ['up', 'down', 'in', 'on'], 'up', 'get up 起床，固定短语'),
            make_blank(2, ['hands', 'food', 'face', 'bed'], 'face', 'wash face 洗脸；与「刷牙」并列'),
            make_blank(3, ['lunch', 'dinner', 'breakfast', 'snack'], 'breakfast', '早晨吃早餐'),
            make_blank(4, ['bed', 'home', 'school', 'park'], 'school', 'go to school 上学；与「骑车」呼应'),
        ],
        explain='主题：早晨生活。考查 get up、wash face、三餐词、go to school。',
        difficulty=1,
    ))

    # 2) 3B U2 What a Day!
    items.append(make_cloze(
        grade=3, term='下', unit_n=2, seq=2,
        topic='What a Day · A happy day',
        passage=(
            'Today is ___1___! In the morning, I went to the zoo with mum. '
            'I saw many ___2___ animals. In the afternoon, we ___3___ ice cream. '
            'I feel so ___4___ today!'
        ),
        blanks=[
            make_blank(1, ['Monday', 'Saturday', 'cold', 'busy'], 'Saturday', '推断：去动物园吃冰淇淋是周末'),
            make_blank(2, ['few', 'no', 'old', 'cute'], 'cute', 'cute animals 可爱的动物'),
            make_blank(3, ['cooked', 'ate', 'sold', 'lost'], 'ate', 'ate ice cream 吃冰淇淋；过去时'),
            make_blank(4, ['sad', 'tired', 'happy', 'angry'], 'happy', '与主题「快乐的一天」呼应'),
        ],
        explain='主题：开心的一天。考查推断、形容词褒义、动词过去式 ate、心情形容词。',
        difficulty=1,
    ))

    # 3) 3B U4 Come and Join Us
    items.append(make_cloze(
        grade=3, term='下', unit_n=4, seq=3,
        topic='Come and Join Us · A party',
        passage=(
            'It is my birthday today. I ___1___ a party at home. '
            'My friends come and we play ___2___ together. '
            'We sing songs and eat ___3___. We have a lot of ___4___!'
        ),
        blanks=[
            make_blank(1, ['have', 'do', 'sell', 'lose'], 'have', 'have a party 开派对，固定搭配'),
            make_blank(2, ['rules', 'food', 'games', 'lessons'], 'games', 'play games 玩游戏'),
            make_blank(3, ['cake', 'rules', 'pens', 'desks'], 'cake', '生日吃蛋糕'),
            make_blank(4, ['noise', 'work', 'fun', 'rain'], 'fun', 'a lot of fun 很多乐趣，固定搭配'),
        ],
        explain='主题：聚会。考查 have a party、play games、a lot of fun。',
        difficulty=1,
    ))

    # 4) 3B U5 Our Classroom
    items.append(make_cloze(
        grade=3, term='下', unit_n=5, seq=4,
        topic='Our Classroom · A clean room',
        passage=(
            'Our classroom is big and ___1___. There are 40 ___2___ in our class. '
            'We sit at our desks and ___3___ our books. '
            'After class, we clean the ___4___ together.'
        ),
        blanks=[
            make_blank(1, ['dirty', 'tired', 'clean', 'sad'], 'clean', 'big and clean 又大又干净，褒义并列'),
            make_blank(2, ['flowers', 'students', 'books', 'cars'], 'students', '班里有 40 个学生'),
            make_blank(3, ['eat', 'sell', 'cook', 'read'], 'read', 'read books 读书；坐在课桌前读书'),
            make_blank(4, ['bed', 'classroom', 'park', 'shop'], 'classroom', '与全文「教室」主题呼应'),
        ],
        explain='主题：教室。考查形容词褒义并列、名词、动词 read books。',
        difficulty=1,
    ))

    # 5) 3B U7 School Rules
    items.append(make_cloze(
        grade=3, term='下', unit_n=7, seq=5,
        topic='School Rules · Be a good student',
        passage=(
            'Our school has some ___1___. We should be on time. '
            'We should ___2___ to the teacher in class. '
            'We should not ___3___ in the library. '
            'A good student always ___4___ the rules.'
        ),
        blanks=[
            make_blank(1, ['rules', 'cars', 'songs', 'gifts'], 'rules', '与主题 School Rules 呼应'),
            make_blank(2, ['eat', 'cry', 'listen', 'shout'], 'listen', 'listen to the teacher 听老师讲'),
            make_blank(3, ['read', 'sit', 'study', 'run'], 'run', '图书馆里不能跑'),
            make_blank(4, ['breaks', 'hates', 'follows', 'forgets'], 'follows', 'follow the rules 遵守规则'),
        ],
        explain='主题：校规。考查名词、动词、否定行为、follow the rules。',
        difficulty=1,
    ))

    return items


# ============================================================
# jk 4A · 5 篇（U2 / U5 / U6 / U7 / U8）· 4 挖空 / 50-60 词 / difficulty=2
# ============================================================

def jk_4a():
    items = []

    # 1) 4A U2 My Family
    items.append(make_cloze(
        grade=4, term='上', unit_n=2, seq=1,
        topic='My Family · A happy family',
        passage=(
            'I have a happy family. My ___1___ is a doctor. He works in a hospital. '
            'My mother is a ___2___. She teaches English at a school. '
            'My little brother is ___3___ years old. He likes to play with me. '
            'We ___4___ each other very much.'
        ),
        blanks=[
            make_blank(1, ['sister', 'father', 'aunt', 'friend'], 'father', '在医院工作的男医生 → father'),
            make_blank(2, ['driver', 'farmer', 'teacher', 'nurse'], 'teacher', '与下文 teaches English 呼应'),
            make_blank(3, ['five', 'fifty', 'ten cars', 'red'], 'five', '弟弟年龄；5 岁合理'),
            make_blank(4, ['hate', 'sell', 'love', 'lose'], 'love', 'love each other 彼此相爱，褒义'),
        ],
        explain='主题：家人。考查家庭成员、职业、年龄表达、love each other。',
        difficulty=2,
    ))

    # 2) 4A U5 My Hobbies
    items.append(make_cloze(
        grade=4, term='上', unit_n=5, seq=2,
        topic='My Hobbies · I love music',
        passage=(
            'My hobby ___1___ music. I can play the ___2___ very well. '
            'I practise every day after school. My teacher ___3___ I am clever. '
            'I want to be a great ___4___ when I grow up.'
        ),
        blanks=[
            make_blank(1, ['is', 'are', 'am', 'be'], 'is', '主语 my hobby 单数'),
            make_blank(2, ['piano', 'apple', 'rule', 'door'], 'piano', 'play the piano 弹钢琴；the + 乐器'),
            make_blank(3, ['eats', 'says', 'forgets', 'sells'], 'says', 'teacher says ... 老师说'),
            make_blank(4, ['cook', 'farmer', 'musician', 'driver'], 'musician', '热爱音乐 → musician 音乐家；与全文呼应'),
        ],
        explain='主题：爱好。考查主谓一致、play the + 乐器、动词 say、职业名词。',
        difficulty=2,
    ))

    # 3) 4A U6 Animals Around Us
    items.append(make_cloze(
        grade=4, term='上', unit_n=6, seq=3,
        topic='Animals · My pet dog',
        passage=(
            'I have a pet dog. ___1___ name is Lucky. Lucky is two years old. '
            'He has big ___2___ and a long tail. He can run very ___3___. '
            'Every evening, I take Lucky to the park. We are good ___4___.'
        ),
        blanks=[
            make_blank(1, ['My', 'His', 'Its', 'Her'], 'His', '指代狗 Lucky（已用 he 代指）→ His'),
            make_blank(2, ['rules', 'eyes', 'wheels', 'songs'], 'eyes', '大眼睛 + 长尾巴，外貌描述'),
            make_blank(3, ['cold', 'fast', 'few', 'noisy'], 'fast', 'run fast 跑得快'),
            make_blank(4, ['enemies', 'cars', 'friends', 'rooms'], 'friends', 'good friends 好朋友'),
        ],
        explain='主题：宠物狗。考查代词、外貌描写、副词、good friends。',
        difficulty=2,
    ))

    # 4) 4A U7 Our Weekend
    items.append(make_cloze(
        grade=4, term='上', unit_n=7, seq=4,
        topic='Our Weekend · A fun Sunday',
        passage=(
            'On ___1___, I usually get up late. After breakfast, I go to the ___2___ '
            'with my parents. We play football and ride bikes. At noon, we have ___3___ '
            'at a restaurant. The food is ___4___. I love weekends!'
        ),
        blanks=[
            make_blank(1, ['Monday', 'school days', 'Sunday', 'class'], 'Sunday', '与「晚起 + 全家活动」呼应'),
            make_blank(2, ['hospital', 'park', 'office', 'classroom'], 'park', '与「踢球骑车」呼应'),
            make_blank(3, ['breakfast', 'lunch', 'dinner', 'snack'], 'lunch', 'at noon 中午吃午餐'),
            make_blank(4, ['bad', 'cold', 'delicious', 'dirty'], 'delicious', '美味的，褒义'),
        ],
        explain='主题：周末。考查时间词、地点、三餐、形容词褒义。',
        difficulty=2,
    ))

    # 5) 4A U8 Festivals We Love
    items.append(make_cloze(
        grade=4, term='上', unit_n=8, seq=5,
        topic='Festivals · Spring Festival',
        passage=(
            'Spring Festival is the most important ___1___ in China. '
            'On New Year\'s Eve, families have a big dinner ___2___. '
            'Children get red envelopes from ___3___ elders. '
            'On the street, people watch dragon dances. I love this ___4___ very much!'
        ),
        blanks=[
            make_blank(1, ['game', 'festival', 'lesson', 'meal'], 'festival', '与主题 Festivals 呼应'),
            make_blank(2, ['together', 'alone', 'never', 'badly'], 'together', '一家人一起吃年夜饭'),
            make_blank(3, ['my', 'his', 'their', 'our'], 'their', '指代「孩子们」复数 → their'),
            make_blank(4, ['rule', 'food', 'festival', 'job'], 'festival', '与开头 Spring Festival 呼应'),
        ],
        explain='主题：春节。考查名词、副词 together、物主代词、回指。',
        difficulty=2,
    ))

    return items


# ============================================================
# jk 4B · 5 篇（U1 / U3 / U5 / U7 / U8）· 4 挖空 / 50-60 词 / difficulty=2
# ============================================================

def jk_4b():
    items = []

    # 1) 4B U1 Spring Is Here
    items.append(make_cloze(
        grade=4, term='下', unit_n=1, seq=1,
        topic='Spring Is Here · A walk in spring',
        passage=(
            'Spring is my favourite season. The ___1___ is warm and sunny. '
            'Flowers are everywhere. The grass is ___2___ again. '
            'On weekends, my family goes for a ___3___ in the park. '
            'We feel ___4___ and free.'
        ),
        blanks=[
            make_blank(1, ['food', 'weather', 'noise', 'rule'], 'weather', 'weather is warm 天气暖和'),
            make_blank(2, ['cold', 'red', 'green', 'dry'], 'green', '草又绿了，与「春天」呼应'),
            make_blank(3, ['fight', 'rule', 'walk', 'test'], 'walk', 'go for a walk 散步，固定搭配'),
            make_blank(4, ['tired', 'angry', 'happy', 'bored'], 'happy', '褒义心情'),
        ],
        explain='主题：春天。考查名词、颜色、go for a walk、形容词褒义。',
        difficulty=2,
    ))

    # 2) 4B U3 Let\'s Go Shopping
    items.append(make_cloze(
        grade=4, term='下', unit_n=3, seq=2,
        topic='Let\'s Go Shopping · A new pair of shoes',
        passage=(
            'My mum and I go ___1___ today. We are in a big shoe store. '
            'I try on a pair of red ___2___. They are too small. '
            'Then I try a bigger pair. They fit ___3___! '
            'I pay forty yuan and take them ___4___.'
        ),
        blanks=[
            make_blank(1, ['shopping', 'eating', 'sleeping', 'cooking'], 'shopping', 'go shopping 购物，固定搭配'),
            make_blank(2, ['cars', 'shoes', 'flowers', 'books'], 'shoes', '在鞋店试鞋'),
            make_blank(3, ['well', 'badly', 'never', 'sometimes'], 'well', 'fit well 合身'),
            make_blank(4, ['away', 'down', 'home', 'off'], 'home', 'take them home 带回家'),
        ],
        explain='主题：购物。考查 go shopping、名词、副词、take ... home。',
        difficulty=2,
    ))

    # 3) 4B U5 My Favourite Food
    items.append(make_cloze(
        grade=4, term='下', unit_n=5, seq=3,
        topic='My Favourite Food · I love noodles',
        passage=(
            'I have many favourite ___1___. I like noodles best. '
            'My grandma ___2___ noodles for me every Sunday. '
            'The noodles taste ___3___. I also like rice and bread. '
            'But I don\'t like ___4___ food like chips.'
        ),
        blanks=[
            make_blank(1, ['cars', 'foods', 'books', 'lessons'], 'foods', '我最爱的食物（许多种）'),
            make_blank(2, ['cooks', 'sells', 'eats', 'cuts'], 'cooks', '奶奶煮面'),
            make_blank(3, ['bad', 'great', 'cold', 'angry'], 'great', 'taste great 美味；褒义'),
            make_blank(4, ['healthy', 'junk', 'cheap', 'fresh'], 'junk', 'junk food 垃圾食品；薯片是垃圾食品'),
        ],
        explain='主题：食物。考查名词复数、动词 cook、感官系动词 taste、junk food。',
        difficulty=2,
    ))

    # 4) 4B U7 Healthy Habits
    items.append(make_cloze(
        grade=4, term='下', unit_n=7, seq=4,
        topic='Healthy Habits · Stay healthy',
        passage=(
            'To stay ___1___, we need good habits. We should eat lots of ___2___ '
            'and fruits. We should drink ___3___ water every day. '
            'We should also sleep ___4___ at night. Then we will feel strong.'
        ),
        blanks=[
            make_blank(1, ['sick', 'sad', 'healthy', 'lazy'], 'healthy', '与主题 Healthy Habits 呼应'),
            make_blank(2, ['cars', 'vegetables', 'rules', 'pens'], 'vegetables', 'eat vegetables 吃蔬菜；与 fruits 并列'),
            make_blank(3, ['few', 'no', 'enough', 'cold'], 'enough', '每天喝足够的水'),
            make_blank(4, ['little', 'badly', 'shortly', 'early'], 'early', 'sleep early 早睡'),
        ],
        explain='主题：健康。考查形容词、可数名词、enough 修饰、副词 early。',
        difficulty=2,
    ))

    # 5) 4B U8 Let\'s Have a Picnic
    items.append(make_cloze(
        grade=4, term='下', unit_n=8, seq=5,
        topic='Picnic · A picnic in the park',
        passage=(
            'Last Sunday, my class had a ___1___ in the park. '
            'We brought sandwiches, juice and ___2___. '
            'We sat on the grass and ate ___3___. '
            'After lunch, we played games. We had a ___4___ time.'
        ),
        blanks=[
            make_blank(1, ['fight', 'picnic', 'test', 'rule'], 'picnic', '与主题 Picnic 呼应'),
            make_blank(2, ['shoes', 'rules', 'fruit', 'cars'], 'fruit', '带三明治、果汁、水果'),
            make_blank(3, ['noise', 'sadly', 'together', 'badly'], 'together', '坐在草地上一起吃，副词'),
            make_blank(4, ['boring', 'bad', 'tired', 'great'], 'great', 'have a great time 玩得很开心，固定搭配'),
        ],
        explain='主题：野餐。考查名词、可数与不可数、副词、have a great time。',
        difficulty=2,
    ))

    return items


# ============================================================
# jk 5A · 5 篇（U1 / U2 / U5 / U7 / U8）· 5 挖空 / 70-90 词 / difficulty=2
# ============================================================

def jk_5a():
    items = []

    # 1) 5A U1 A New School Year
    items.append(make_cloze(
        grade=5, term='上', unit_n=1, seq=1,
        topic='A New School Year · Meeting new classmates',
        passage=(
            'It is a new school ___1___. I meet many new classmates today. '
            'Our new teacher, Mr Wang, is very ___2___. He smiles a lot. '
            'In the first class, we ___3___ ourselves one by one. '
            'I tell others my name, my hobby and my dream. '
            'Everyone listens to me ___4___. I think this term will be ___5___.'
        ),
        blanks=[
            make_blank(1, ['year', 'cake', 'rule', 'shop'], 'year', 'school year 学年'),
            make_blank(2, ['lazy', 'angry', 'kind', 'tired'], 'kind', '老师友善爱笑'),
            make_blank(3, ['sell', 'lose', 'introduce', 'forget'], 'introduce', 'introduce ourselves 自我介绍'),
            make_blank(4, ['noisily', 'carefully', 'badly', 'sadly'], 'carefully', '认真听'),
            make_blank(5, ['boring', 'bad', 'great', 'short'], 'great', '本学期会很棒，褒义'),
        ],
        explain='主题：新学期。考查名词搭配、形容词褒义、动词 introduce、副词、心情形容词。',
        difficulty=2,
    ))

    # 2) 5A U2 My Subjects
    items.append(make_cloze(
        grade=5, term='上', unit_n=2, seq=2,
        topic='My Subjects · My favourite subject',
        passage=(
            'We have many subjects at school. My favourite ___1___ is science. '
            'Our science teacher always shows us interesting ___2___. '
            'Last week, we learned about plants. We even ___3___ some flowers in pots. '
            'I love science because it makes me ___4___ many things about the world. '
            'I want to be a scientist ___5___ I grow up.'
        ),
        blanks=[
            make_blank(1, ['food', 'song', 'subject', 'rule'], 'subject', '与主题 My Subjects 呼应'),
            make_blank(2, ['noises', 'experiments', 'rules', 'songs'], 'experiments', '科学课展示实验'),
            make_blank(3, ['ate', 'sold', 'planted', 'lost'], 'planted', 'plant flowers 种花；过去时'),
            make_blank(4, ['forget', 'hate', 'understand', 'lose'], 'understand', 'understand things 理解事物'),
            make_blank(5, ['when', 'because', 'before', 'although'], 'when', 'when I grow up 等我长大时'),
        ],
        explain='主题：学科。考查名词、experiment、动词过去式、understand、when 引导时间从句。',
        difficulty=2,
    ))

    # 3) 5A U5 Sports Day
    items.append(make_cloze(
        grade=5, term='上', unit_n=5, seq=3,
        topic='Sports Day · A great race',
        passage=(
            'Last Friday was our Sports ___1___. I joined the 100-metre race. '
            'Before the race, I was very ___2___. My heart beat fast. '
            'When the whistle blew, I ran ___3___ I could. '
            'Although I did not win, I felt ___4___ of myself. '
            'My classmates ___5___ for me all the way.'
        ),
        blanks=[
            make_blank(1, ['Day', 'food', 'rule', 'shop'], 'Day', 'Sports Day 运动日'),
            make_blank(2, ['lazy', 'tired', 'nervous', 'old'], 'nervous', '紧张；与下文「心跳加速」呼应'),
            make_blank(3, ['as fast as', 'so fast as', 'too fast as', 'more fast'], 'as fast as', 'as fast as I could 尽我最快'),
            make_blank(4, ['proud', 'sad', 'sick', 'tired'], 'proud', 'proud of myself 为自己自豪'),
            make_blank(5, ['cried', 'cheered', 'forgot', 'lost'], 'cheered', 'cheer for sb 为某人加油'),
        ],
        explain='主题：运动会。考查 Sports Day、心情形容词、as ... as 比较、proud of、cheer for。',
        difficulty=3,
    ))

    # 4) 5A U7 My Hobby Club
    items.append(make_cloze(
        grade=5, term='上', unit_n=7, seq=4,
        topic='My Hobby Club · The robot club',
        passage=(
            'Our school has many hobby clubs. I joined the ___1___ club. '
            'Every Wednesday afternoon, we meet in the lab. '
            'Mr Lee teaches us how to ___2___ small robots. '
            'My team and I ___3___ a robot dog last week. It can walk and bark. '
            '___4___ you also like robots, come and ___5___ us!'
        ),
        blanks=[
            make_blank(1, ['food', 'cooking', 'robot', 'shopping'], 'robot', '与下文「机器人」呼应'),
            make_blank(2, ['eat', 'sell', 'build', 'lose'], 'build', 'build robots 造机器人'),
            make_blank(3, ['made', 'ate', 'sold', 'lost'], 'made', 'made a robot 做了一个机器人；过去时'),
            make_blank(4, ['Because', 'Although', 'If', 'When'], 'If', '条件句：如果你也喜欢'),
            make_blank(5, ['hate', 'leave', 'join', 'forget'], 'join', 'join us 加入我们'),
        ],
        explain='主题：社团。考查名词、动词 build / make、条件连词 if、join。',
        difficulty=2,
    ))

    # 5) 5A U8 Helping Hands
    items.append(make_cloze(
        grade=5, term='上', unit_n=8, seq=5,
        topic='Helping Hands · A volunteer day',
        passage=(
            'Last Saturday, my class visited an old people\'s ___1___. '
            'We sang songs and told stories to the elderly. '
            'I helped a grandma ___2___ flowers in the garden. '
            'She was very ___3___ and told me about her life. '
            '___4___ the day, we all felt warm inside. '
            'Helping others is the best way to be ___5___.'
        ),
        blanks=[
            make_blank(1, ['shop', 'home', 'park', 'school'], 'home', 'old people\'s home 养老院'),
            make_blank(2, ['cut', 'plant', 'sell', 'lose'], 'plant', 'plant flowers 种花'),
            make_blank(3, ['rude', 'kind', 'angry', 'lazy'], 'kind', '老奶奶很善良'),
            make_blank(4, ['Before', 'After', 'During', 'Without'], 'After', 'After the day 一天结束后'),
            make_blank(5, ['lazy', 'angry', 'happy', 'tired'], 'happy', '帮助他人是变快乐的最好方式'),
        ],
        explain='主题：助人。考查 old people\'s home、plant、形容词褒贬、时间介词。',
        difficulty=3,
    ))

    return items


# ============================================================
# jk 5B · 5 篇（U1 / U3 / U6 / U7 / U8）· 5 挖空 / 70-90 词 / difficulty=2-3
# ============================================================

def jk_5b():
    items = []

    # 1) 5B U1 Trip Plans
    items.append(make_cloze(
        grade=5, term='下', unit_n=1, seq=1,
        topic='Trip Plans · Summer holiday plan',
        passage=(
            'Summer holiday is coming! My family is making a ___1___ trip plan. '
            'We want to go to Hainan ___2___ a week. The weather there is warm '
            'and the beaches are ___3___. We will swim, eat seafood and take photos. '
            'I am ___4___ excited about this trip. '
            'I hope time can ___5___ faster.'
        ),
        blanks=[
            make_blank(1, ['boring', 'wonderful', 'sad', 'cold'], 'wonderful', 'wonderful trip 美妙旅行，褒义'),
            make_blank(2, ['for', 'in', 'by', 'with'], 'for', 'for a week 持续一周'),
            make_blank(3, ['dirty', 'beautiful', 'small', 'tired'], 'beautiful', '海边沙滩很美'),
            make_blank(4, ['few', 'no', 'so', 'never'], 'so', 'so excited 非常兴奋；副词修饰形容词'),
            make_blank(5, ['stop', 'sell', 'fly', 'cook'], 'fly', 'time flies 时光飞逝；比喻用法'),
        ],
        explain='主题：旅行计划。考查形容词褒义、for + 时间、副词 so、time flies。',
        difficulty=2,
    ))

    # 2) 5B U3 Asking the Way
    items.append(make_cloze(
        grade=5, term='下', unit_n=3, seq=2,
        topic='Asking the Way · A kind stranger',
        passage=(
            'Yesterday I lost my ___1___ in a new city. I did not know where to go. '
            'I asked a man, "Excuse me, ___2___ is the train station?" '
            'He said, "Turn ___3___ at the second corner and walk for 10 minutes. '
            'You will see it on your right." I ___4___ him very much. '
            'People in this city are so ___5___.'
        ),
        blanks=[
            make_blank(1, ['way', 'food', 'sock', 'song'], 'way', 'lose one\'s way 迷路'),
            make_blank(2, ['what', 'why', 'where', 'when'], 'where', 'where is ... 询问地点'),
            make_blank(3, ['up', 'left', 'down', 'over'], 'left', '在第二个路口左转'),
            make_blank(4, ['hated', 'thanked', 'lost', 'sold'], 'thanked', 'thank him 感谢他'),
            make_blank(5, ['rude', 'lazy', 'kind', 'angry'], 'kind', '这里的人很友善，褒义'),
        ],
        explain='主题：问路。考查 lose way、where、turn left、动词、形容词褒贬。',
        difficulty=3,
    ))

    # 3) 5B U6 Postcards from a Trip
    items.append(make_cloze(
        grade=5, term='下', unit_n=6, seq=3,
        topic='Postcards · A postcard from Beijing',
        passage=(
            'Dear Mum,\n'
            'I am ___1___ a great time in Beijing. The Great Wall is amazing! '
            'I ___2___ a lot of pictures yesterday. Today we visited the Forbidden City. '
            'It is so big and ___3___. The food here is also delicious. '
            'I will be ___4___ next Friday. I ___5___ you very much.\n'
            'Love, Lily'
        ),
        blanks=[
            make_blank(1, ['making', 'having', 'cooking', 'losing'], 'having', 'have a great time 玩得开心'),
            make_blank(2, ['took', 'ate', 'sold', 'lost'], 'took', 'take pictures 拍照；过去时'),
            make_blank(3, ['boring', 'beautiful', 'sad', 'small'], 'beautiful', '故宫又大又美'),
            make_blank(4, ['back', 'down', 'off', 'up'], 'back', 'be back 返回'),
            make_blank(5, ['hate', 'sell', 'miss', 'forget'], 'miss', 'miss you 想你'),
        ],
        explain='主题：明信片。考查 have a great time、take photos、形容词、be back、miss。',
        difficulty=3,
    ))

    # 4) 5B U7 Different Cultures
    items.append(make_cloze(
        grade=5, term='下', unit_n=7, seq=4,
        topic='Different Cultures · Greetings around the world',
        passage=(
            'People say hello in many different ___1___ around the world. '
            'In China, we usually say "ni hao" with a smile. In France, people give two ___2___ '
            'on the cheek when they meet. In Japan, people ___3___ deeply to show respect. '
            'In some Western countries, people just ___4___ hands politely. '
            '___5___ way is special and lovely in its own culture.'
        ),
        blanks=[
            make_blank(1, ['rules', 'ways', 'foods', 'cars'], 'ways', 'in different ways 用不同方式'),
            make_blank(2, ['noises', 'kisses', 'rules', 'songs'], 'kisses', 'give kisses 行贴面礼'),
            make_blank(3, ['bow', 'eat', 'cry', 'sell'], 'bow', '日本人鞠躬表敬意'),
            make_blank(4, ['lose', 'shake', 'sell', 'eat'], 'shake', 'shake hands 握手'),
            make_blank(5, ['Each', 'No', 'Few', 'Some'], 'Each', '每一种方式都特别可爱'),
        ],
        explain='主题：不同文化。考查 in ways、kiss、bow、shake hands、不定代词 each。',
        difficulty=3,
    ))

    # 5) 5B U8 Safe Travels
    items.append(make_cloze(
        grade=5, term='下', unit_n=8, seq=5,
        topic='Safe Travels · Travel safely',
        passage=(
            'When we travel, safety is the most ___1___ thing. '
            'We should always stay close to our ___2___. We must not talk to ___3___ '
            'or take food from them. If we get lost, we should ___4___ a police officer. '
            '___5___ safe is more important than having fun.'
        ),
        blanks=[
            make_blank(1, ['cheap', 'important', 'small', 'lazy'], 'important', 'most important 最重要的'),
            make_blank(2, ['rules', 'parents', 'cars', 'shops'], 'parents', '紧跟父母'),
            make_blank(3, ['friends', 'teachers', 'strangers', 'classmates'], 'strangers', '不和陌生人说话'),
            make_blank(4, ['hate', 'sell', 'find', 'lose'], 'find', 'find a police officer 找警察'),
            make_blank(5, ['Being', 'Be', 'Are', 'To'], 'Being', '动名词作主语：保持安全更重要'),
        ],
        explain='主题：旅行安全。考查最高级、名词、stranger、动词、动名词主语。',
        difficulty=3,
    ))

    return items


# ============================================================
# jk 6A · 5 篇（U2 / U3 / U6 / U7 / U8）· 5 挖空 / 80-90 词 / difficulty=3
# ============================================================

def jk_6a():
    items = []

    # 1) 6A U2 Dream Jobs
    items.append(make_cloze(
        grade=6, term='上', unit_n=2, seq=1,
        topic='Dream Jobs · I want to be a doctor',
        passage=(
            'Everyone has a dream ___1___. My dream is to be a doctor. '
            'I want to help sick people and ___2___ their lives. '
            'To be a good doctor, I must work ___3___ in school. '
            'I will study science and learn ___4___ the human body. '
            'It will not be easy, ___5___ I will never give up.'
        ),
        blanks=[
            make_blank(1, ['job', 'food', 'shop', 'rule'], 'job', '与主题 Dream Jobs 呼应'),
            make_blank(2, ['lose', 'save', 'sell', 'eat'], 'save', 'save lives 救命'),
            make_blank(3, ['lazily', 'badly', 'hard', 'shortly'], 'hard', 'work hard 努力学习'),
            make_blank(4, ['from', 'about', 'on', 'against'], 'about', 'learn about 学习关于...'),
            make_blank(5, ['so', 'or', 'but', 'because'], 'but', '前句「不易」后句「绝不放弃」，转折'),
        ],
        explain='主题：理想职业。考查名词、save lives、副词 hard、learn about、转折 but。',
        difficulty=3,
    ))

    # 2) 6A U3 Heroes Around Us
    items.append(make_cloze(
        grade=6, term='上', unit_n=3, seq=2,
        topic='Heroes Around Us · A kind firefighter',
        passage=(
            'Heroes are not only in films. Many heroes are ___1___ us. '
            'My uncle is a firefighter. He puts ___2___ fires and saves people. '
            'Last month, he saved a little girl from a burning house. '
            'He was very ___3___, but he kept calm. '
            'When he came home, his hands were ___4___, but his smile was big. '
            'I think he is the ___5___ hero in my life.'
        ),
        blanks=[
            make_blank(1, ['under', 'around', 'after', 'against'], 'around', 'around us 在我们身边'),
            make_blank(2, ['off', 'up', 'out', 'on'], 'out', 'put out fires 灭火，固定短语'),
            make_blank(3, ['brave', 'lazy', 'rude', 'sleepy'], 'brave', 'brave 勇敢；与「保持冷静」呼应'),
            make_blank(4, ['cold', 'dirty', 'rich', 'short'], 'dirty', '灭火后双手很脏，符合现实'),
            make_blank(5, ['shortest', 'cheapest', 'greatest', 'laziest'], 'greatest', 'greatest hero 最伟大的英雄；最高级褒义'),
        ],
        explain='主题：身边的英雄。考查介词、put out、形容词褒贬、最高级。',
        difficulty=3,
    ))

    # 3) 6A U6 Save Our Earth
    items.append(make_cloze(
        grade=6, term='上', unit_n=6, seq=3,
        topic='Save Our Earth · Small actions make a difference',
        passage=(
            'The Earth is getting hotter every year. We must take ___1___ now. '
            'Many small actions can ___2___ a difference. For example, '
            'we should turn off the lights when we ___3___ a room. '
            'We can use bags ___4___ of plastic ones. '
            'If everyone does ___5___ little, the Earth will be greener.'
        ),
        blanks=[
            make_blank(1, ['noise', 'action', 'rest', 'food'], 'action', 'take action 行动'),
            make_blank(2, ['make', 'cook', 'sell', 'eat'], 'make', 'make a difference 起作用，固定搭配'),
            make_blank(3, ['build', 'open', 'leave', 'enter'], 'leave', 'leave a room 离开房间，与「关灯」呼应'),
            make_blank(4, ['because', 'instead', 'after', 'before'], 'instead', 'instead of plastic ones 而不是塑料袋'),
            make_blank(5, ['a', 'no', 'much', 'some'], 'a', 'a little 一点点，固定用法'),
        ],
        explain='主题：保护地球。考查 take action、make a difference、leave、instead of、a little。',
        difficulty=3,
    ))

    # 4) 6A U7 Amazing Inventions
    items.append(make_cloze(
        grade=6, term='上', unit_n=7, seq=4,
        topic='Amazing Inventions · The mobile phone',
        passage=(
            'The mobile phone is one of the most ___1___ inventions in modern life. '
            'It can do many things. We can ___2___ photos, send messages, and watch films. '
            'My grandma uses her phone to ___3___ video calls with me every weekend. '
            '___4___, we should not use phones for too long. '
            'Looking at the screen too much is ___5___ for our eyes.'
        ),
        blanks=[
            make_blank(1, ['boring', 'amazing', 'cheap', 'lazy'], 'amazing', '与主题 Amazing Inventions 呼应'),
            make_blank(2, ['take', 'sell', 'cook', 'eat'], 'take', 'take photos 拍照'),
            make_blank(3, ['lose', 'cut', 'make', 'eat'], 'make', 'make calls 打电话'),
            make_blank(4, ['Luckily', 'However', 'Suddenly', 'Finally'], 'However', '前句优点后句风险，转折'),
            make_blank(5, ['good', 'bad', 'fun', 'great'], 'bad', '盯屏幕太久对眼睛不好'),
        ],
        explain='主题：发明。考查形容词褒义、take photos、make calls、转折 However、形容词褒贬。',
        difficulty=3,
    ))

    # 5) 6A U8 Friendship Forever
    items.append(make_cloze(
        grade=6, term='上', unit_n=8, seq=5,
        topic='Friendship Forever · My best friend',
        passage=(
            'A true ___1___ is like a treasure. My best friend Anna is like this. '
            'When I am sad, she always ___2___ to me. '
            'When I make a mistake, she tells me the ___3___ kindly. '
            'Last week I was ill at home, and she brought my homework to me ___4___. '
            'I am so ___5___ to have such a wonderful friend.'
        ),
        blanks=[
            make_blank(1, ['friend', 'rule', 'shop', 'gift'], 'friend', '与主题 Friendship 呼应'),
            make_blank(2, ['shouts', 'listens', 'cries', 'sleeps'], 'listens', 'listen to 倾听'),
            make_blank(3, ['lie', 'truth', 'story', 'joke'], 'truth', 'tell sb the truth 实话相告'),
            make_blank(4, ['lazily', 'never', 'every day', 'badly'], 'every day', '每天送作业；时间频率'),
            make_blank(5, ['sad', 'angry', 'lucky', 'tired'], 'lucky', 'lucky to have ... 有幸拥有'),
        ],
        explain='主题：友谊。考查名词、listen to、truth、时间频率、lucky to。',
        difficulty=3,
    ))

    return items


# ============================================================
# jk 6B · 5 篇（U1 / U2 / U4 / U5 / U8）· 5 挖空 / 80-90 词 / difficulty=3
# ============================================================

def jk_6b():
    items = []

    # 1) 6B U1 Slow and steady wins the race
    items.append(make_cloze(
        grade=6, term='下', unit_n=1, seq=1,
        topic='Slow and steady wins the race · The tortoise and the hare',
        passage=(
            'Long ago, a hare laughed at a tortoise because the tortoise walked very ___1___. '
            'The angry tortoise asked the hare to ___2___ a race. The hare agreed and started fast. '
            'Soon he was far ahead, so he ___3___ to take a rest under a tree. '
            'He fell asleep. The tortoise ___4___ walked and never stopped. '
            'When the hare woke up, the tortoise had already ___5___ the line.'
        ),
        blanks=[
            make_blank(1, ['fast', 'slowly', 'angrily', 'happily'], 'slowly', '上下文：兔子嘲笑乌龟走得慢'),
            make_blank(2, ['have', 'cook', 'sell', 'eat'], 'have', 'have a race 进行比赛，固定搭配'),
            make_blank(3, ['refused', 'decided', 'forgot', 'failed'], 'decided', '决定休息一会'),
            make_blank(4, ['never', 'badly', 'just', 'angrily'], 'just', 'just walked 只是不停走'),
            make_blank(5, ['lost', 'crossed', 'broken', 'eaten'], 'crossed', 'crossed the line 越过终点线'),
        ],
        explain='主题：龟兔赛跑。考查副词、固定搭配 have a race、动词时态、副词、cross the line。',
        difficulty=3,
    ))

    # 2) 6B U2 Waiting for another hare
    items.append(make_cloze(
        grade=6, term='下', unit_n=2, seq=2,
        topic='Waiting for another hare · The lazy farmer',
        passage=(
            'Long ago, there was a farmer who ___1___ very hard every day. '
            'One day, a hare ran into a tree and ___2___ on the spot. '
            'The farmer was very happy and got a free meal. '
            'After that, he stopped ___3___ in the field. '
            'He just sat by the tree and waited ___4___ another hare. '
            'But no more hares came. His fields ___5___ wild and he lost everything.'
        ),
        blanks=[
            make_blank(1, ['played', 'worked', 'slept', 'sang'], 'worked', '勤劳的农夫；worked hard'),
            make_blank(2, ['ran', 'died', 'grew', 'jumped'], 'died', '兔子撞树而死'),
            make_blank(3, ['working', 'playing', 'eating', 'singing'], 'working', 'stop working 不再干活'),
            make_blank(4, ['from', 'with', 'against', 'for'], 'for', 'wait for 等待，固定搭配'),
            make_blank(5, ['turned', 'cooked', 'sold', 'kept'], 'turned', 'turned wild 变得荒芜'),
        ],
        explain='主题：守株待兔。考查动词时态、stop doing、介词、turn + 形容词。',
        difficulty=3,
    ))

    # 3) 6B U4 We can save the animals
    items.append(make_cloze(
        grade=6, term='下', unit_n=4, seq=3,
        topic='We can save the animals · Save the elephants',
        passage=(
            'Elephants are the largest animals on land. They are ___1___ and gentle. '
            'However, the number of elephants is getting ___2___ every year. '
            'Bad people kill them for their ___3___. '
            'If we do not protect them, our children may ___4___ see real elephants. '
            'We can help by joining clubs and ___5___ the truth to others.'
        ),
        blanks=[
            make_blank(1, ['weak', 'tiny', 'smart', 'angry'], 'smart', 'smart and gentle 聪明又温和，褒义'),
            make_blank(2, ['smaller', 'bigger', 'happier', 'safer'], 'smaller', 'getting smaller 数量减少'),
            make_blank(3, ['songs', 'tusks', 'rooms', 'colours'], 'tusks', 'tusks 象牙；坏人为象牙杀象'),
            make_blank(4, ['only', 'never', 'always', 'often'], 'never', '可能再也见不到真象'),
            make_blank(5, ['hiding', 'telling', 'cutting', 'selling'], 'telling', 'tell the truth 讲出真相'),
        ],
        explain='主题：保护大象。考查形容词褒义、比较级、名词、副词、动词搭配。',
        difficulty=3,
    ))

    # 4) 6B U5 Dr Sun Yatsen
    items.append(make_cloze(
        grade=6, term='下', unit_n=5, seq=4,
        topic='Dr Sun Yatsen · A great leader',
        passage=(
            'Dr Sun Yatsen was one of the greatest leaders in modern Chinese ___1___. '
            'He was born in 1866 in Guangdong. He studied medicine ___2___ Hong Kong. '
            'Later he gave up being a doctor and ___3___ his life to saving China. '
            'He led many people to fight for a ___4___ country. '
            'Today Chinese people still ___5___ him as the father of modern China.'
        ),
        blanks=[
            make_blank(1, ['food', 'history', 'songs', 'shops'], 'history', '中国历史；与「伟大领袖」呼应'),
            make_blank(2, ['under', 'in', 'on', 'against'], 'in', 'in Hong Kong 在香港'),
            make_blank(3, ['gave', 'sold', 'lost', 'forgot'], 'gave', 'gave his life to 为...献身'),
            make_blank(4, ['poor', 'lazy', 'better', 'sad'], 'better', 'better country 更美好的国家'),
            make_blank(5, ['fight', 'remember', 'lose', 'sell'], 'remember', 'remember him 铭记他'),
        ],
        explain='主题：孙中山。考查名词、介词、动词搭配 give one\'s life to、比较级、动词。',
        difficulty=3,
    ))

    # 5) 6B U8 The magic words
    items.append(make_cloze(
        grade=6, term='下', unit_n=8, seq=5,
        topic='The magic words · Please and thank you',
        passage=(
            '"Please" and "thank you" are simple but ___1___ words. We use them every day. '
            'When you ask for help, always say "___2___". '
            'When someone helps you, say "thank you" with a ___3___. '
            'These magic words can make others feel ___4___ and respected. '
            'Good manners cost ___5___, but they bring happiness to everyone.'
        ),
        blanks=[
            make_blank(1, ['useless', 'magic', 'wrong', 'lazy'], 'magic', '与主题 magic words 呼应'),
            make_blank(2, ['no', 'why', 'please', 'how'], 'please', '求人帮忙说 please'),
            make_blank(3, ['fight', 'cry', 'smile', 'lie'], 'smile', '微笑致谢；with a smile'),
            make_blank(4, ['angry', 'tired', 'happy', 'sick'], 'happy', '让他人感到开心'),
            make_blank(5, ['everything', 'much', 'a lot', 'nothing'], 'nothing', 'cost nothing 不花一文，固定表达'),
        ],
        explain='主题：礼貌用语。考查形容词褒义、礼貌用语、with a smile、形容词、固定表达 cost nothing。',
        difficulty=3,
    ))

    return items


# ============================================================
# 主流程
# ============================================================

def build():
    all_items = []
    all_items.extend(jk_3a())
    all_items.extend(jk_3b())
    all_items.extend(jk_4a())
    all_items.extend(jk_4b())
    all_items.extend(jk_5a())
    all_items.extend(jk_5b())
    all_items.extend(jk_6a())
    all_items.extend(jk_6b())
    return all_items


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true', help='实际写入（默认 dry-run）')
    ap.add_argument('--force', action='store_true', help='跳过题量骤降阻断')
    args = ap.parse_args()

    items = build()
    total_blanks = sum(len(it["blanks"]) for it in items)
    print(f'[jk 完形填空 本次精造] {len(items)} 篇短文 / {total_blanks} 挖空')

    # 年级分布
    dist = {}
    for q in items:
        k = f'G{q["grade"]}{q["term"]}'
        dist[k] = dist.get(k, 0) + 1
    print(f'[年级分布] ' + '  '.join(f'{k}={v}篇' for k, v in sorted(dist.items())))

    # 难度分布
    diff_dist = {}
    for q in items:
        d = q.get('difficulty', '?')
        diff_dist[d] = diff_dist.get(d, 0) + 1
    print(f'[难度分布] ' + '  '.join(f'diff{k}={v}篇' for k, v in sorted(diff_dist.items())))

    # schema 预校验
    errs, ok_count = validate_cloze_list(items)
    if errs:
        print(f'\n❌ schema 预校验失败 {len(errs)} 条:')
        for e in errs[:10]:
            print(f'  {e}')
        sys.exit(1)
    print(f'✅ schema 预校验通过：{ok_count}/{len(items)} 条')

    if not args.write:
        print('\n(dry-run，加 --write 实际写入)')
        return

    ok, msg = write_with_safety(OUT, items, force=args.force, type_label='jk_cloze')
    print(msg)
    if not ok:
        sys.exit(1)


if __name__ == '__main__':
    main()
