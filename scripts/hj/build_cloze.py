# -*- coding: utf-8 -*-
"""
hj（沪教牛津 7-9 年级）完形填空题库生成器（P2-C 批次 1）。

设计：
  - 真完形模式：每篇 80-100 词连贯短文 + 5 挖空 + 4 选项
  - 短文话题对齐 hj 教材单元：每册 6 篇覆盖 6 个核心单元
  - code 格式：{7-9}{A/B}_U{N}_C{NN}
  - 数据手工编写，原创内容（话题对齐教材，文字独立创作）

本批进度（含批次 1 + 批次 2）：
  - ✅ 7A：6 篇（U1 Making friends / U2 Daily life / U3 Earth / U4 Seasons / U6 Asia / U7 Clubs）
  - ✅ 7B：6 篇（U1 Friends / U2 Travel / U3 Animals / U4 Trees / U5 Water / U7 Poems）
  - ✅ 8A：6 篇（U1 Encyclopaedias / U2 Numbers / U3 Computers / U4 Inventions / U5 Memory / U6 Ancient stories）
  - ✅ 8B：6 篇（U1 Charity / U2 Body language / U3 Crafts / U4 Robots / U5 Endangered / U8 Green world）
  - ✅ 9A：6 篇（U1 Wise men / U2 Great minds / U3 Environment / U5 Films / U7 Explore / U8 Universe）
  - ✅ 9B：6 篇（U1 Mars / U2 Great people / U3 Asia / U5 Festivals / U6 Culture shock / U8 Literature）
  - 合计：36 篇 / 180 挖空（hj 全册）

运行：
  python scripts/hj/build_cloze.py            # dry-run
  python scripts/hj/build_cloze.py --write    # 实际写入
"""
import argparse
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'scripts'))

from _build_cloze_common import make_cloze, make_blank, write_with_safety, validate_cloze_list  # noqa: E402

QDIR = os.path.join(ROOT, 'data', 'questions')
OUT = os.path.join(QDIR, 'hj_cloze.json')


# ============================================================
# hj 7A · 6 篇
# ============================================================

def hj_7a():
    items = []

    # 1) 7A U1 Making friends
    items.append(make_cloze(
        grade=7, term='上', unit_n=1, seq=1,
        topic='Making friends · My new classmate',
        passage=(
            'Hi! I am Tom. I am twelve years old. I have a new ___1___ at school. Her name is Lily. '
            'She is from Germany, so she ___2___ German very well. Lily is a kind and ___3___ girl. '
            'She often helps me ___4___ my English. We talk about our hobbies after class. '
            'I think we will ___5___ good friends very soon.'
        ),
        blanks=[
            make_blank(1, ['friend', 'family', 'pet', 'job'], 'friend', 'friend 朋友；与下文 talk about our hobbies / good friends 呼应'),
            make_blank(2, ['speaks', 'speak', 'speaking', 'spoke'], 'speaks', '主语 she 第三人称单数现在时'),
            make_blank(3, ['lazy', 'angry', 'patient', 'tired'], 'patient', 'kind and patient 善良且耐心，褒义词搭配'),
            make_blank(4, ['for', 'with', 'about', 'at'], 'with', 'help sb with sth 帮某人做某事，固定搭配'),
            make_blank(5, ['be', 'have', 'do', 'go'], 'be', 'will + 动词原形；be good friends 成为好朋友'),
        ],
        explain='主题：新同学。考查名词、第三人称单数动词、形容词褒贬辨析、help with 搭配、will + be 一般将来时。',
        difficulty=2,
    ))

    # 2) 7A U2 Daily life
    items.append(make_cloze(
        grade=7, term='上', unit_n=2, seq=2,
        topic='Daily life · My school day',
        passage=(
            'My school day starts at half ___1___ seven. I usually ride my bike to school. '
            'Classes begin at eight in the ___2___. I have six lessons every day. '
            'I ___3___ like English best because our teacher is funny. '
            'At noon we have lunch in the canteen. After school, my friends and I often ___4___ basketball on the playground. '
            'I get home at six and finish my homework ___5___ nine o\'clock.'
        ),
        blanks=[
            make_blank(1, ['past', 'to', 'by', 'on'], 'past', 'half past seven 七点半，固定时间表达'),
            make_blank(2, ['evening', 'night', 'morning', 'afternoon'], 'morning', '上午八点上课，与下文 at noon 呼应'),
            make_blank(3, ['hardly', 'really', 'never', 'seldom'], 'really', 'really like 真的喜欢；下文给了正面理由'),
            make_blank(4, ['take', 'make', 'play', 'do'], 'play', 'play basketball 打篮球，固定搭配'),
            make_blank(5, ['before', 'after', 'until', 'since'], 'before', 'finish ... before nine 九点前完成作业'),
        ],
        explain='主题：日常生活。考查时间介词、频率/程度副词、play + 球类、before/after 时间从属词。',
        difficulty=2,
    ))

    # 3) 7A U3 The Earth
    items.append(make_cloze(
        grade=7, term='上', unit_n=3, seq=3,
        topic='The Earth · Save our planet',
        passage=(
            'The Earth is our ___1___. It gives us air, water and food. But people pollute it every day. '
            'Cars give off bad gas. Factories ___2___ dirty water into rivers. Trees are cut down for paper. '
            'We must do ___3___ to protect the Earth. We can ride bikes instead ___4___ taking cars. '
            'We can reuse books and recycle bottles. Every small action ___5___ matter. The Earth needs our help!'
        ),
        blanks=[
            make_blank(1, ['school', 'home', 'club', 'park'], 'home', '地球是我们的家，与下文 air/water/food 呼应'),
            make_blank(2, ['put', 'pour', 'send', 'fall'], 'pour', 'pour ... into rivers 把脏水排入河流，与污染主题呼应'),
            make_blank(3, ['anything', 'everything', 'something', 'nothing'], 'something', 'do something 做点事情；环保号召'),
            make_blank(4, ['of', 'on', 'to', 'for'], 'of', 'instead of doing 而不是做某事，固定搭配'),
            make_blank(5, ['do', 'does', 'doing', 'did'], 'does', '主语 every small action 第三人称单数现在时'),
        ],
        explain='主题：环保。考查名词理解、动词搭配、不定代词、instead of 短语、主谓一致。',
        difficulty=3,
    ))

    # 4) 7A U4 Seasons
    items.append(make_cloze(
        grade=7, term='上', unit_n=4, seq=4,
        topic='Seasons · My favourite season',
        passage=(
            'There are four seasons in a year. My favourite season is ___1___. '
            'In spring, the weather is warm and the flowers ___2___ everywhere. '
            'Birds come back from the south and start ___3___ in the trees. '
            'My family often goes to the park ___4___ a picnic on Sundays. '
            'I like flying a kite with my sister. Spring is a ___5___ time to play outside.'
        ),
        blanks=[
            make_blank(1, ['spring', 'summer', 'autumn', 'winter'], 'spring', '与下文 In spring 直接呼应'),
            make_blank(2, ['open', 'grow', 'bloom', 'fall'], 'bloom', 'flowers bloom 花朵盛开，地道搭配'),
            make_blank(3, ['sing', 'singing', 'to sing', 'sang'], 'singing', 'start doing sth 开始做某事；与下文 flying a kite 平行'),
            make_blank(4, ['in', 'for', 'on', 'at'], 'for', 'go ... for a picnic 去野餐，固定搭配'),
            make_blank(5, ['bad', 'cold', 'great', 'long'], 'great', 'a great time 美好时光，褒义；与全段语境一致'),
        ],
        explain='主题：季节。考查四季词汇、动词搭配、动名词、介词、形容词褒贬。',
        difficulty=2,
    ))

    # 5) 7A U6 Travelling around Asia
    items.append(make_cloze(
        grade=7, term='上', unit_n=6, seq=5,
        topic='Travelling around Asia · A letter from Xi\'an',
        passage=(
            'Dear Tom,\n'
            'I am ___1___ in Xi\'an now. Xi\'an is an ancient city in China. '
            'It is famous ___2___ the Terracotta Army. Yesterday I visited the city wall. '
            'It is over 600 years old and very ___3___. The wall is wide enough to ride a bike on it. '
            'I also tried local food and ___4___ many photos. '
            'I will come back to Shanghai next Monday. I miss you ___5___.\n'
            'Yours, Linda'
        ),
        blanks=[
            make_blank(1, ['running', 'travelling', 'sleeping', 'cooking'], 'travelling', '与全文「西安游记」主题呼应'),
            make_blank(2, ['as', 'for', 'with', 'to'], 'for', 'be famous for sth 以...著称，固定搭配'),
            make_blank(3, ['short', 'new', 'old', 'small'], 'old', 'over 600 years old 与 ancient 呼应；wall is old 形容年代'),
            make_blank(4, ['took', 'made', 'got', 'gave'], 'took', 'take photos 拍照，固定搭配；过去时'),
            make_blank(5, ['few', 'much', 'many', 'little'], 'much', 'miss sb much 非常想念某人；much 修饰动词'),
        ],
        explain='主题：旅游。考查动词时态、be famous for、形容词搭配、take photos、副词修饰。',
        difficulty=3,
    ))

    # 6) 7A U7 School clubs
    items.append(make_cloze(
        grade=7, term='上', unit_n=7, seq=6,
        topic='School clubs · My Robot Club',
        passage=(
            'Our school has many ___1___. I love the Robot Club best. Every Friday afternoon we meet in Lab 3. '
            'Our teacher, Mr Lee, teaches us how to ___2___ small robots. Last week, my team built a robot dog. '
            'It can walk, jump and even bark! All the members ___3___ very excited. '
            '___4___ you also like robots, please come and join us. '
            'I am sure you will have a lot ___5___ fun.'
        ),
        blanks=[
            make_blank(1, ['classes', 'clubs', 'parties', 'shops'], 'clubs', 'school clubs 学校社团，与全文主题呼应'),
            make_blank(2, ['eat', 'sell', 'build', 'open'], 'build', 'build robots 建造机器人；与下文 built a robot dog 呼应'),
            make_blank(3, ['is', 'are', 'was', 'were'], 'were', '主语 all the members 复数；上下文是过去时（last week）'),
            make_blank(4, ['Because', 'Although', 'If', 'When'], 'If', 'if 引导条件状语从句；下文 please come and join'),
            make_blank(5, ['of', 'in', 'with', 'on'], 'of', 'a lot of fun 很多乐趣，固定搭配'),
        ],
        explain='主题：社团。考查名词、动词搭配、主谓一致 + 时态、条件从句连词、a lot of 搭配。',
        difficulty=3,
    ))

    return items


# ============================================================
# hj 7B · 6 篇
# ============================================================

def hj_7b():
    items = []

    # 1) 7B U1 Friends
    items.append(make_cloze(
        grade=7, term='下', unit_n=1, seq=1,
        topic='Friends · A true friend',
        passage=(
            'A true friend is someone you can ___1___. When you are sad, a true friend listens to you. '
            'When you make a mistake, a true friend tells you the ___2___ kindly. '
            'My best friend Anna is ___3___ this. Last week I was ill and stayed at home. '
            'She brought my homework to my house every day. She also ___4___ me funny stories to make me smile. '
            'I am so lucky to ___5___ such a wonderful friend.'
        ),
        blanks=[
            make_blank(1, ['trust', 'hate', 'forget', 'fear'], 'trust', 'trust 信任，与「真朋友」主题一致'),
            make_blank(2, ['lie', 'truth', 'story', 'joke'], 'truth', 'tell sb the truth 实话相告；与下文 kindly 呼应'),
            make_blank(3, ['from', 'after', 'like', 'about'], 'like', 'someone like this 像这样的人'),
            make_blank(4, ['told', 'said', 'spoke', 'asked'], 'told', 'tell sb stories 给某人讲故事，固定搭配'),
            make_blank(5, ['have', 'has', 'having', 'had'], 'have', 'to have such a friend 拥有这样的朋友；不定式'),
        ],
        explain='主题：真朋友。考查动词搭配、名词辨析、介词、tell vs say、不定式。',
        difficulty=2,
    ))

    # 2) 7B U2 Travelling around the world
    items.append(make_cloze(
        grade=7, term='下', unit_n=2, seq=2,
        topic='Travelling around the world · A trip to Japan',
        passage=(
            'Last summer my family ___1___ to Japan for a holiday. We stayed there for ten days. '
            'Tokyo is a big and ___2___ city. We visited many famous places. '
            'I liked Mount Fuji ___3___ of all. It looks like a beautiful painting. '
            'We also tried sushi and other local food. ___4___ I could not speak Japanese, the people were very friendly. '
            'I hope I can ___5___ Japan again one day.'
        ),
        blanks=[
            make_blank(1, ['went', 'goes', 'going', 'gone'], 'went', '上文 Last summer 过去时；go to 的过去式 went'),
            make_blank(2, ['quiet', 'busy', 'empty', 'boring'], 'busy', 'big and busy city 又大又繁忙的城市，褒义并列'),
            make_blank(3, ['well', 'good', 'best', 'better'], 'best', 'like ... best 最喜欢，固定搭配'),
            make_blank(4, ['Because', 'Although', 'So', 'When'], 'Although', '前后让步关系：虽然不会日语但人很友好'),
            make_blank(5, ['leave', 'visit', 'lose', 'sell'], 'visit', 'visit Japan again 再访日本；与全文呼应'),
        ],
        explain='主题：旅行。考查时态、形容词褒贬并列、副词最高级、让步连词、动词搭配。',
        difficulty=2,
    ))

    # 3) 7B U3 Our animal friends
    items.append(make_cloze(
        grade=7, term='下', unit_n=3, seq=3,
        topic='Our animal friends · Save the pandas',
        passage=(
            'The giant panda is a ___1___ animal in the world. Pandas live in the mountains in China. '
            'They eat bamboo all day. Sadly, pandas are ___2___ now because forests are getting smaller. '
            'The government has built many nature reserves ___3___ them. '
            'Scientists also study how to ___4___ panda babies in zoos. '
            'We must work together to ___5___ these lovely animals.'
        ),
        blanks=[
            make_blank(1, ['common', 'cheap', 'rare', 'dirty'], 'rare', 'rare 稀有，与「保护熊猫」主题呼应'),
            make_blank(2, ['safe', 'happy', 'rich', 'endangered'], 'endangered', 'endangered 濒危的；与下文「森林减少」呼应'),
            make_blank(3, ['after', 'for', 'into', 'against'], 'for', 'build ... for them 为它们建...，目的'),
            make_blank(4, ['raise', 'sell', 'lose', 'kill'], 'raise', 'raise babies 养育幼崽，褒义动词'),
            make_blank(5, ['hurt', 'protect', 'forget', 'leave'], 'protect', 'protect 保护；与全文主题呼应'),
        ],
        explain='主题：动物保护。考查形容词辨析、介词、动词褒贬。',
        difficulty=3,
    ))

    # 4) 7B U4 Save the trees
    items.append(make_cloze(
        grade=7, term='下', unit_n=4, seq=4,
        topic='Save the trees · Why trees matter',
        passage=(
            'Trees are very important to us. They give us ___1___ and clean air. '
            'They are also home to many ___2___, such as birds and squirrels. '
            'However, people cut ___3___ too many trees every year. '
            'This makes the air dirty and the weather hotter. We should plant ___4___ trees '
            'and tell others ___5___ the trees, too.'
        ),
        blanks=[
            make_blank(1, ['noise', 'gas', 'oxygen', 'rubbish'], 'oxygen', 'oxygen 氧气；与下文 clean air 并列'),
            make_blank(2, ['animals', 'cars', 'computers', 'classrooms'], 'animals', 'home to ... animals 动物的家'),
            make_blank(3, ['up', 'in', 'down', 'off'], 'down', 'cut down 砍倒（树），固定短语'),
            make_blank(4, ['fewer', 'more', 'less', 'better'], 'more', 'plant more trees 种更多树，与主题呼应'),
            make_blank(5, ['hurt', 'sell', 'cut', 'save'], 'save', 'save the trees 保护树木；与全文呼应'),
        ],
        explain='主题：保护树木。考查名词、短语动词 cut down、比较级、动词褒贬。',
        difficulty=2,
    ))

    # 5) 7B U5 Water
    items.append(make_cloze(
        grade=7, term='下', unit_n=5, seq=5,
        topic='Water · Save every drop',
        passage=(
            'Water is the source of ___1___. Without water, no plant or animal can live. '
            'However, fresh water is not ___2___ on the Earth. Many countries do not have enough water. '
            'We should save water in our daily life. For example, ___3___ off the tap when we brush our teeth. '
            'We can also reuse the water ___4___ washing vegetables to water the flowers. '
            'Every drop ___5___.'
        ),
        blanks=[
            make_blank(1, ['fun', 'life', 'noise', 'money'], 'life', 'source of life 生命之源，固定表达'),
            make_blank(2, ['endless', 'cheap', 'dirty', 'salty'], 'endless', 'not endless 并非取之不尽；与下文「水不够」呼应'),
            make_blank(3, ['turn', 'turning', 'turned', 'to turn'], 'turn', '祈使句以动词原形开头'),
            make_blank(4, ['after', 'before', 'until', 'during'], 'after', 'water after washing 洗菜后的水；时间先后'),
            make_blank(5, ['counts', 'count', 'counted', 'counting'], 'counts', 'every drop counts 每滴水都重要；主语单数'),
        ],
        explain='主题：节约用水。考查名词搭配、形容词辨析、祈使句、时间介词、主谓一致。',
        difficulty=3,
    ))

    # 6) 7B U7 Poems
    items.append(make_cloze(
        grade=7, term='下', unit_n=7, seq=6,
        topic='Poems · I love poetry',
        passage=(
            'Poems are short ___1___ beautiful. Each line has a special rhythm. '
            'Many poems also have ___2___ at the end of lines, which sounds like music. '
            'My favourite poet is Li Bai. He ___3___ poems more than 1,000 years ago. '
            'When I am tired, I read his poems and feel ___4___. '
            'I want to write my ___5___ poem one day.'
        ),
        blanks=[
            make_blank(1, ['or', 'but', 'so', 'and'], 'but', 'short but beautiful 短而美，转折关系'),
            make_blank(2, ['rhymes', 'rules', 'rooms', 'roads'], 'rhymes', 'rhymes 押韵；与下文 sounds like music 呼应'),
            make_blank(3, ['wrote', 'reads', 'taught', 'sang'], 'wrote', '上文是过去时；poet wrote poems 诗人写诗'),
            make_blank(4, ['angry', 'tired', 'sad', 'peaceful'], 'peaceful', 'feel peaceful 感到宁静；与「累时读诗」呼应'),
            make_blank(5, ['friend', 'own', 'family', 'school'], 'own', 'my own poem 自己的诗；my own 固定搭配'),
        ],
        explain='主题：诗歌。考查连词、名词辨析、动词时态、形容词搭配、own 的用法。',
        difficulty=3,
    ))

    return items


# ============================================================
# hj 8A · 6 篇
# ============================================================

def hj_8a():
    items = []

    # 1) 8A U1 Encyclopaedias
    items.append(make_cloze(
        grade=8, term='上', unit_n=1, seq=1,
        topic='Encyclopaedias · A treasure of knowledge',
        passage=(
            'An encyclopaedia is a book that ___1___ a lot of information. '
            'In the past, my grandfather often read paper encyclopaedias to ___2___ new things. '
            'Now most students use online encyclopaedias ___3___ Wikipedia. '
            'They are fast and easy to use. ___4___, we should not believe everything we read. '
            'We need to check the facts ___5___ at least two different sources.'
        ),
        blanks=[
            make_blank(1, ['hides', 'sells', 'contains', 'borrows'], 'contains', 'contains 包含；百科全书包含信息'),
            make_blank(2, ['lose', 'learn', 'forget', 'teach'], 'learn', 'learn new things 学习新东西'),
            make_blank(3, ['such as', 'so that', 'as if', 'instead of'], 'such as', 'such as 例如；后接举例'),
            make_blank(4, ['Luckily', 'However', 'Therefore', 'Suddenly'], 'However', '前句优点，后句风险，转折'),
            make_blank(5, ['from', 'about', 'on', 'with'], 'from', 'check facts from sources 从来源核查事实'),
        ],
        explain='主题：百科全书。考查动词、短语连词 such as、转折词、介词搭配。',
        difficulty=3,
    ))

    # 2) 8A U2 Numbers
    items.append(make_cloze(
        grade=8, term='上', unit_n=2, seq=2,
        topic='Numbers · Numbers in our life',
        passage=(
            'Numbers are everywhere in our daily life. We use them to ___1___ time, money and distance. '
            'In China, the number eight ___2___ lucky because it sounds like the word for "rich". '
            'On the other ___3___, many people in the West think thirteen is unlucky. '
            'These ideas are just culture, ___4___ they often influence our choices. '
            'Without numbers, the world would ___5___ very strange.'
        ),
        blanks=[
            make_blank(1, ['cook', 'measure', 'wash', 'plant'], 'measure', 'measure time/money 测量时间金钱'),
            make_blank(2, ['is', 'are', 'was', 'were'], 'is', '主语 the number eight 单数；一般陈述用 is'),
            make_blank(3, ['side', 'foot', 'arm', 'hand'], 'hand', 'on the other hand 另一方面，固定短语'),
            make_blank(4, ['so', 'but', 'or', 'because'], 'but', '前句「只是文化」后句「但常影响选择」，转折'),
            make_blank(5, ['be', 'is', 'are', 'being'], 'be', 'would + 动词原形；虚拟语气'),
        ],
        explain='主题：数字。考查动词、主谓一致、固定短语 on the other hand、转折连词、情态动词后用原形。',
        difficulty=3,
    ))

    # 3) 8A U3 Computers
    items.append(make_cloze(
        grade=8, term='上', unit_n=3, seq=3,
        topic='Computers · A useful tool',
        passage=(
            'Computers have changed our life in many ___1___. We can write essays, watch films '
            'and chat with friends ___2___ a computer. Many people also do their work online. '
            'My father is a designer. He uses a computer to ___3___ pictures and posters. '
            'However, sitting in front of a screen too long is ___4___ for our eyes. '
            'We should ___5___ a break every hour.'
        ),
        blanks=[
            make_blank(1, ['places', 'ways', 'rooms', 'parts'], 'ways', 'in many ways 在许多方面，固定搭配'),
            make_blank(2, ['on', 'in', 'at', 'with'], 'on', 'do sth on a computer 在电脑上做某事'),
            make_blank(3, ['eat', 'draw', 'wash', 'cut'], 'draw', '设计师用电脑画图'),
            make_blank(4, ['good', 'bad', 'fun', 'safe'], 'bad', '看屏幕太久对眼睛不好；下文「应该休息」呼应'),
            make_blank(5, ['take', 'make', 'do', 'have'], 'take', 'take a break 休息一下，固定搭配'),
        ],
        explain='主题：电脑。考查 in ... ways、介词、动词、形容词褒贬、take a break 固定搭配。',
        difficulty=2,
    ))

    # 4) 8A U4 Inventions
    items.append(make_cloze(
        grade=8, term='上', unit_n=4, seq=4,
        topic='Inventions · The greatest invention',
        passage=(
            'Many inventions have changed the world. ___1___ I think the greatest one is the wheel. '
            'Before the wheel, people had to ___2___ heavy things on their backs. '
            'After the wheel was invented, cars, trains and planes ___3___ possible. '
            'The wheel is simple, ___4___ very powerful. It is also the base of many other inventions. '
            'Inventions make our life ___5___.'
        ),
        blanks=[
            make_blank(1, ['However', 'Personally', 'Besides', 'Finally'], 'Personally', '个人观点：personally 就个人而言'),
            make_blank(2, ['carry', 'sing', 'sell', 'count'], 'carry', 'carry heavy things 搬运重物'),
            make_blank(3, ['become', 'becomes', 'became', 'becoming'], 'became', '上下文是过去时'),
            make_blank(4, ['so', 'but', 'or', 'because'], 'but', 'simple but powerful 简单却强大，转折'),
            make_blank(5, ['worse', 'easier', 'shorter', 'darker'], 'easier', '发明让生活更便捷，褒义'),
        ],
        explain='主题：发明。考查副词、动词、时态、转折连词、比较级。',
        difficulty=3,
    ))

    # 5) 8A U5 Memory
    items.append(make_cloze(
        grade=8, term='上', unit_n=5, seq=5,
        topic='Memory · How to remember better',
        passage=(
            'Have you ever ___1___ where you put your keys? It happens to everyone. '
            'Scientists say there are good ways to ___2___ memory. First, sleep well. '
            'Your brain ___3___ information when you sleep. Second, practise often. '
            'For example, repeat new words ___4___ a few days. Third, stay active. '
            '___5___ helps the blood flow to your brain.'
        ),
        blanks=[
            make_blank(1, ['forgotten', 'remembered', 'found', 'told'], 'forgotten', 'ever forgotten where 是否忘记钥匙位置'),
            make_blank(2, ['lose', 'improve', 'sell', 'cut'], 'improve', 'improve memory 改善记忆'),
            make_blank(3, ['eats', 'sleeps', 'stores', 'shouts'], 'stores', 'brain stores information 大脑存储信息'),
            make_blank(4, ['by', 'for', 'with', 'against'], 'for', 'for a few days 持续几天，时间介词'),
            make_blank(5, ['Reading', 'Exercise', 'Music', 'Sleeping'], 'Exercise', '与下文 helps the blood flow 呼应：运动促进血液流动'),
        ],
        explain='主题：记忆。考查现在完成时、动词搭配、名词、介词、主语推断。',
        difficulty=3,
    ))

    # 6) 8A U6 Ancient stories
    items.append(make_cloze(
        grade=8, term='上', unit_n=6, seq=6,
        topic='Ancient stories · The Monkey King',
        passage=(
            'The Monkey King is a famous ___1___ in Chinese stories. He was born from a magic stone. '
            'He could change into 72 different ___2___ and travel on a cloud. '
            'In the story, he ___3___ his master Tang Sanzang to the West to get holy books. '
            'On the way, they ___4___ many monsters but always won. '
            'The story teaches us to be ___5___ when we face difficulties.'
        ),
        blanks=[
            make_blank(1, ['fruit', 'hero', 'flower', 'river'], 'hero', '主角；与下文「师父/打怪」呼应'),
            make_blank(2, ['shapes', 'songs', 'rooms', 'colours'], 'shapes', '72 变；shape 形状'),
            make_blank(3, ['hurt', 'protected', 'sold', 'forgot'], 'protected', '保护师父；与「西天取经」呼应'),
            make_blank(4, ['won', 'fought', 'sang', 'cooked'], 'fought', '打妖怪；fought monsters'),
            make_blank(5, ['lazy', 'brave', 'angry', 'shy'], 'brave', '面对困难要勇敢；与故事主旨呼应'),
        ],
        explain='主题：古代故事。考查名词、动词时态、形容词褒贬。',
        difficulty=3,
    ))

    return items


# ============================================================
# hj 8B · 6 篇
# ============================================================

def hj_8b():
    items = []

    # 1) 8B U1 Helping those in need
    items.append(make_cloze(
        grade=8, term='下', unit_n=1, seq=1,
        topic='Helping those in need · A warm action',
        passage=(
            'Last winter, my classmates and I joined a ___1___ event. We collected old clothes '
            'for poor children in the mountains. Each of us brought ___2___ jackets and books. '
            'Our teacher Ms. Lin sent the boxes ___3___ a small village school. '
            'A few weeks later, we received a thank-you letter. The children said the clothes ___4___ them warm. '
            'Helping others makes me feel ___5___ proud.'
        ),
        blanks=[
            make_blank(1, ['party', 'charity', 'sports', 'shopping'], 'charity', 'charity event 慈善活动；与「收旧衣帮山区孩子」呼应'),
            make_blank(2, ['no', 'few', 'some', 'any'], 'some', '肯定句用 some 表示「一些」'),
            make_blank(3, ['from', 'to', 'with', 'at'], 'to', 'sent ... to ... 寄到...，固定搭配'),
            make_blank(4, ['kept', 'lost', 'made', 'left'], 'kept', 'kept them warm 让他们保持温暖'),
            make_blank(5, ['few', 'really', 'never', 'badly'], 'really', '真的很自豪；副词修饰形容词'),
        ],
        explain='主题：助人。考查名词、不定代词、介词、动词、副词修饰。',
        difficulty=2,
    ))

    # 2) 8B U2 Body language
    items.append(make_cloze(
        grade=8, term='下', unit_n=2, seq=2,
        topic='Body language · More than words',
        passage=(
            'People talk to each other ___1___ words, but they also use body language. '
            'A friendly smile shows you are ___2___. Nodding means you agree, while shaking your head means "no". '
            'Different countries have different body ___3___. In Japan, people bow to show respect. '
            'In some Western countries, people hug to ___4___ hello. '
            '___5___ body language helps us understand others better.'
        ),
        blanks=[
            make_blank(1, ['under', 'with', 'about', 'after'], 'with', 'talk with words 用语言交流'),
            make_blank(2, ['angry', 'rude', 'happy', 'sad'], 'happy', 'friendly smile 友好微笑表示开心'),
            make_blank(3, ['noises', 'signals', 'songs', 'meals'], 'signals', 'body signals 肢体信号；与 body language 呼应'),
            make_blank(4, ['say', 'sell', 'cut', 'eat'], 'say', 'say hello 打招呼，固定搭配'),
            make_blank(5, ['Refusing', 'Reading', 'Forgetting', 'Hating'], 'Reading', '理解肢体语言；read body language 解读'),
        ],
        explain='主题：肢体语言。考查介词、形容词褒贬、名词、动词搭配、动名词主语。',
        difficulty=3,
    ))

    # 3) 8B U3 Traditional skills
    items.append(make_cloze(
        grade=8, term='下', unit_n=3, seq=3,
        topic='Traditional skills · Paper-cutting',
        passage=(
            'Paper-cutting is a traditional Chinese ___1___. It has a history of more than 1,500 years. '
            'People use scissors to ___2___ red paper into beautiful patterns. '
            'These patterns often show flowers, animals or Chinese ___3___. '
            'Today, fewer young people learn this craft, ___4___ it is still popular at Spring Festival. '
            'We should keep ___5___ alive for future generations.'
        ),
        blanks=[
            make_blank(1, ['food', 'art', 'song', 'sport'], 'art', '剪纸是一种艺术；下文 craft 呼应'),
            make_blank(2, ['cut', 'cook', 'wash', 'sell'], 'cut', '用剪刀剪红纸；cut into patterns'),
            make_blank(3, ['cars', 'characters', 'computers', 'classrooms'], 'characters', '剪纸图案常含汉字；characters 字符/汉字'),
            make_blank(4, ['so', 'or', 'but', 'because'], 'but', '前句「学的人少」后句「春节依然流行」，转折'),
            make_blank(5, ['it', 'them', 'me', 'us'], 'it', '指代上文 paper-cutting / this craft 单数'),
        ],
        explain='主题：传统技艺。考查名词、动词、转折连词、代词指代。',
        difficulty=3,
    ))

    # 4) 8B U4 A world of robots
    items.append(make_cloze(
        grade=8, term='下', unit_n=4, seq=4,
        topic='A world of robots · Robots in our future',
        passage=(
            'Robots are no longer just in science fiction. They are ___1___ part of our daily life. '
            'Some robots clean the floor at home. Others ___2___ heavy boxes in factories. '
            'In hospitals, robot doctors can do simple ___3___ very fast. '
            'Robots can work for many hours ___4___ getting tired. '
            'In the future, will robots ___5___ all our jobs? Nobody knows for sure.'
        ),
        blanks=[
            make_blank(1, ['no', 'so', 'too', 'a'], 'a', 'a part of 一部分，固定搭配'),
            make_blank(2, ['eat', 'sing', 'carry', 'kill'], 'carry', '工厂搬运重箱子'),
            make_blank(3, ['operations', 'songs', 'meals', 'speeches'], 'operations', '医院做简单手术；operation 手术'),
            make_blank(4, ['after', 'with', 'before', 'without'], 'without', 'without getting tired 不会累；without + 动名词'),
            make_blank(5, ['take', 'sell', 'lose', 'buy'], 'take', 'take all our jobs 抢走工作'),
        ],
        explain='主题：机器人。考查冠词、动词搭配、名词、介词 + 动名词、take 多义。',
        difficulty=3,
    ))

    # 5) 8B U5 Save the endangered animals
    items.append(make_cloze(
        grade=8, term='下', unit_n=5, seq=5,
        topic='Save the endangered animals · The tiger',
        passage=(
            'The tiger is one of the most beautiful ___1___ on Earth. It lives mainly in Asian forests. '
            'However, the number of wild tigers is ___2___ every year. People cut down forests, '
            'so tigers ___3___ their homes. Some bad people also kill them for skins and bones. '
            '___4___ we do not act now, future children may only see tigers in books. '
            'We must save ___5___ before it is too late.'
        ),
        blanks=[
            make_blank(1, ['birds', 'fish', 'animals', 'plants'], 'animals', '老虎是动物，与下文「森林」呼应'),
            make_blank(2, ['falling', 'growing', 'singing', 'cooking'], 'falling', '数量下降；falling 下降'),
            make_blank(3, ['build', 'lose', 'sell', 'open'], 'lose', '失去家园；与「砍森林」因果'),
            make_blank(4, ['Although', 'If', 'So', 'When'], 'If', '条件句：如果不行动'),
            make_blank(5, ['it', 'them', 'us', 'me'], 'them', '指代 tigers 复数'),
        ],
        explain='主题：濒危动物。考查名词、动词、连词、代词指代。',
        difficulty=3,
    ))

    # 6) 8B U8 A green world
    items.append(make_cloze(
        grade=8, term='下', unit_n=8, seq=6,
        topic='A green world · Small actions, big change',
        passage=(
            'The Earth is getting hotter every year. ___1___ warming is a serious problem. '
            'Many small actions can ___2___ a difference. For example, turn off the lights '
            'when you ___3___ the room. Bring your own bag when you go shopping. '
            'Take a bus or ride a bike ___4___ of driving a car. '
            'If everyone does ___5___ little, the world will become greener.'
        ),
        blanks=[
            make_blank(1, ['Air', 'Sea', 'Global', 'Local'], 'Global', 'global warming 全球变暖，固定术语'),
            make_blank(2, ['make', 'cook', 'sell', 'eat'], 'make', 'make a difference 起作用，固定搭配'),
            make_blank(3, ['build', 'open', 'leave', 'enter'], 'leave', 'leave the room 离开房间，与「关灯」呼应'),
            make_blank(4, ['instead', 'because', 'after', 'before'], 'instead', 'instead of doing 而不是开车'),
            make_blank(5, ['a', 'no', 'some', 'any'], 'a', 'a little 一点点（数量），固定用法'),
        ],
        explain='主题：环保。考查 global warming、make a difference、动词、instead of、a little。',
        difficulty=3,
    ))

    return items


# ============================================================
# hj 9A · 6 篇
# ============================================================

def hj_9a():
    items = []

    # 1) 9A U1 Wise men in history
    items.append(make_cloze(
        grade=9, term='上', unit_n=1, seq=1,
        topic='Wise men in history · Confucius',
        passage=(
            'Confucius was one of the ___1___ thinkers in Chinese history. He lived more than 2,500 years ago. '
            'His ideas about kindness and respect ___2___ deeply influenced Chinese culture. '
            'He believed everyone could become a better person ___3___ learning. '
            'He taught his students that "Education ___4___ no boundaries". '
            'Today, his words are still ___5___ to people all over the world.'
        ),
        blanks=[
            make_blank(1, ['shortest', 'greatest', 'noisiest', 'busiest'], 'greatest', 'greatest thinkers 最伟大思想家；最高级'),
            make_blank(2, ['has', 'have', 'had', 'having'], 'have', '主语 his ideas 复数；现在完成时 have + 过去分词'),
            make_blank(3, ['by', 'on', 'at', 'from'], 'by', 'by learning 通过学习；by + 动名词表方式'),
            make_blank(4, ['takes', 'has', 'wears', 'puts'], 'has', '教育没有边界；has no boundaries'),
            make_blank(5, ['useless', 'meaningful', 'boring', 'wrong'], 'meaningful', '至今仍有意义；褒义形容词'),
        ],
        explain='主题：智者孔子。考查最高级、主谓一致、介词 + 动名词、动词搭配、形容词褒贬。',
        difficulty=4,
    ))

    # 2) 9A U2 Great minds
    items.append(make_cloze(
        grade=9, term='上', unit_n=2, seq=2,
        topic='Great minds · Curiosity drives discovery',
        passage=(
            'Great minds always have one thing in ___1___: they are curious about the world. '
            'When others see a falling apple, Newton ___2___ why it falls down, not up. '
            'When others use candles, Edison wondered ___3___ a brighter light could be made. '
            'Curiosity ___4___ scientists ask questions and find answers. '
            'Without it, we would not have so many amazing ___5___ today.'
        ),
        blanks=[
            make_blank(1, ['hand', 'time', 'common', 'view'], 'common', 'in common 共同点，固定搭配'),
            make_blank(2, ['asked', 'sang', 'cooked', 'slept'], 'asked', 'asked why ... 问为什么'),
            make_blank(3, ['that', 'if', 'because', 'so'], 'if', 'wondered if ... 想知道是否，引导宾语从句'),
            make_blank(4, ['hurts', 'helps', 'forgets', 'breaks'], 'helps', 'helps scientists ask 帮助科学家提问'),
            make_blank(5, ['noises', 'inventions', 'meals', 'shops'], 'inventions', '与全文「科学家好奇心」呼应：发明'),
        ],
        explain='主题：伟人的好奇心。考查 in common、动词、宾语从句连词、动词搭配、名词。',
        difficulty=4,
    ))

    # 3) 9A U3 The environment
    items.append(make_cloze(
        grade=9, term='上', unit_n=3, seq=3,
        topic='The environment · Air pollution',
        passage=(
            'Air pollution is becoming a serious ___1___ in big cities. Cars give off harmful gas. '
            'Factories release smoke ___2___ the sky. As a result, the air becomes dirty and dangerous. '
            'Many people now ___3___ from asthma and other lung diseases. '
            'The government has taken steps to ___4___ pollution. New laws limit factory emissions, '
            'and electric cars are ___5___ more popular every year.'
        ),
        blanks=[
            make_blank(1, ['game', 'problem', 'song', 'gift'], 'problem', 'serious problem 严重问题'),
            make_blank(2, ['from', 'into', 'over', 'under'], 'into', 'release smoke into the sky 向天空排放'),
            make_blank(3, ['suffer', 'eat', 'cook', 'sing'], 'suffer', 'suffer from 患（病），固定搭配'),
            make_blank(4, ['build', 'reduce', 'sell', 'open'], 'reduce', 'reduce pollution 减少污染'),
            make_blank(5, ['becoming', 'falling', 'leaving', 'losing'], 'becoming', '变得更受欢迎；becoming + 形容词'),
        ],
        explain='主题：空气污染。考查名词、介词、suffer from、reduce + 名词、系动词 becoming。',
        difficulty=3,
    ))

    # 4) 9A U5 Films
    items.append(make_cloze(
        grade=9, term='上', unit_n=5, seq=4,
        topic='Films · A film that moved me',
        passage=(
            'Last weekend I watched a film ___1___ "The Wandering Earth". '
            'It is a Chinese science-fiction film about saving our planet. '
            'The story is full ___2___ adventure and emotion. '
            'I was deeply ___3___ by the bravery of the heroes. '
            'A good film not only entertains us ___4___ also teaches us something. '
            'I would ___5___ recommend it to everyone.'
        ),
        blanks=[
            make_blank(1, ['called', 'sold', 'cooked', 'born'], 'called', 'a film called ... 一部叫...的电影'),
            make_blank(2, ['in', 'on', 'of', 'at'], 'of', 'full of 充满，固定搭配'),
            make_blank(3, ['cooked', 'eaten', 'moved', 'sold'], 'moved', 'be moved by 被...感动'),
            make_blank(4, ['so', 'or', 'but', 'because'], 'but', 'not only ... but also ... 不仅...而且，固定结构'),
            make_blank(5, ['rarely', 'highly', 'badly', 'hardly'], 'highly', 'highly recommend 强烈推荐'),
        ],
        explain='主题：电影。考查过去分词作定语、full of、be moved by、not only but also、副词搭配。',
        difficulty=3,
    ))

    # 5) 9A U7 The unknown world
    items.append(make_cloze(
        grade=9, term='上', unit_n=7, seq=5,
        topic='The unknown world · Deep sea explorers',
        passage=(
            'The deep ocean is one of the most mysterious places on Earth. '
            'Scientists know more about the moon ___1___ they do about the deep sea. '
            'Strange fish live there, ___2___ never see sunlight. '
            'Some have lights on their bodies to ___3___ in the dark. '
            'Today, special submarines help explorers ___4___ this unknown world. '
            'Every trip down brings ___5___ amazing discoveries.'
        ),
        blanks=[
            make_blank(1, ['than', 'as', 'so', 'and'], 'than', 'more ... than ... 比较级'),
            make_blank(2, ['who', 'which', 'where', 'whose'], 'which', '非限定定语从句修饰 fish 用 which'),
            make_blank(3, ['eat', 'sleep', 'see', 'kill'], 'see', '黑暗中靠身上的光看东西'),
            make_blank(4, ['lose', 'reach', 'sell', 'open'], 'reach', 'reach the deep sea 到达；与 explore 主题呼应'),
            make_blank(5, ['few', 'no', 'new', 'old'], 'new', 'new amazing discoveries 新的惊人发现'),
        ],
        explain='主题：深海探索。考查比较级 than、关系代词 which、动词搭配、形容词。',
        difficulty=4,
    ))

    # 6) 9A U8 Surprises in the universe
    items.append(make_cloze(
        grade=9, term='上', unit_n=8, seq=6,
        topic='Surprises in the universe · Black holes',
        passage=(
            'A black hole is one of the strangest things ___1___ the universe. '
            'It has such strong gravity that ___2___ light cannot escape from it. '
            'For a long time, no one knew ___3___ a real black hole looked like. '
            'In 2019, scientists ___4___ the first picture of one. '
            'This great event made many young people ___5___ in space science.'
        ),
        blanks=[
            make_blank(1, ['at', 'in', 'on', 'over'], 'in', 'in the universe 在宇宙中'),
            make_blank(2, ['even', 'only', 'never', 'still'], 'even', 'even light cannot escape 连光都无法逃脱'),
            make_blank(3, ['what', 'why', 'when', 'how'], 'what', 'what ... looked like 是什么样子'),
            make_blank(4, ['took', 'lost', 'cooked', 'broke'], 'took', 'took the first picture 拍下第一张照片'),
            make_blank(5, ['weak', 'lazy', 'interested', 'tired'], 'interested', 'interested in 对...感兴趣'),
        ],
        explain='主题：黑洞。考查介词、副词 even、宾语从句连词 what、动词搭配、interested in。',
        difficulty=4,
    ))

    return items


# ============================================================
# hj 9B · 6 篇
# ============================================================

def hj_9b():
    items = []

    # 1) 9B U1 Life on Mars
    items.append(make_cloze(
        grade=9, term='下', unit_n=1, seq=1,
        topic='Life on Mars · A red planet',
        passage=(
            'Mars is the fourth planet ___1___ the Sun. People call it "the red planet" because its surface '
            'is covered with red dust. For many years, scientists have wondered ___2___ life exists on Mars. '
            'In recent years, robots ___3___ to Mars to collect rocks and take pictures. '
            'They have found signs of ancient water. ___4___, water means there may have been life. '
            'One day, humans may even ___5___ a small base there.'
        ),
        blanks=[
            make_blank(1, ['under', 'from', 'after', 'over'], 'from', '从太阳数起的第四颗行星'),
            make_blank(2, ['that', 'if', 'because', 'when'], 'if', 'wonder if 想知道是否，引导宾语从句'),
            make_blank(3, ['flown', 'sold', 'went', 'have gone'], 'have gone', '现在完成时表示「已经去过」'),
            make_blank(4, ['However', 'On Earth', 'In total', 'Above all'], 'On Earth', '类比地球：在地球上，水意味着生命'),
            make_blank(5, ['eat', 'build', 'forget', 'lose'], 'build', 'build a base 建一个基地'),
        ],
        explain='主题：火星。考查介词、宾语从句、现在完成时、衔接副词、动词搭配。',
        difficulty=4,
    ))

    # 2) 9B U2 Great people
    items.append(make_cloze(
        grade=9, term='下', unit_n=2, seq=2,
        topic='Great people · Helen Keller',
        passage=(
            'Helen Keller could neither see ___1___ hear after she was 19 months old. '
            'Most people thought she would never learn to read or write. However, with the ___2___ of her teacher '
            'Anne Sullivan, Helen learned hand signs and ___3___ to college. '
            'She wrote books and gave speeches around the world. Her life shows that ___4___ '
            'can stop a person who has courage. ___5___ Helen, we should never give up.'
        ),
        blanks=[
            make_blank(1, ['or', 'nor', 'and', 'but'], 'nor', 'neither ... nor ... 既不...也不...'),
            make_blank(2, ['noise', 'help', 'rule', 'door'], 'help', 'with the help of 在...帮助下，固定短语'),
            make_blank(3, ['lost', 'forgot', 'went', 'sold'], 'went', 'went to college 上大学；过去时'),
            make_blank(4, ['anything', 'something', 'nothing', 'everything'], 'nothing', '没有什么能阻止有勇气的人'),
            make_blank(5, ['Without', 'Against', 'Like', 'After'], 'Like', '像海伦一样；like + 人 表示「像」'),
        ],
        explain='主题：伟人海伦凯勒。考查 neither nor、with the help of、时态、不定代词、like + 人。',
        difficulty=4,
    ))

    # 3) 9B U3 Asia, the largest continent
    items.append(make_cloze(
        grade=9, term='下', unit_n=3, seq=3,
        topic='Asia · The largest continent',
        passage=(
            'Asia is the largest continent ___1___ Earth. It covers about one third of all the land. '
            'More than 4 billion people live ___2___, which is over half of the world population. '
            'Asia has many different cultures, ___3___ Chinese, Indian and Japanese. '
            'The food, music and festivals in Asia ___4___ from country to country. '
            'A trip across Asia is like a journey through ___5___.'
        ),
        blanks=[
            make_blank(1, ['under', 'in', 'on', 'after'], 'on', 'on Earth 在地球上'),
            make_blank(2, ['here', 'there', 'where', 'over'], 'there', '指代亚洲；there 在那里'),
            make_blank(3, ['such as', 'so that', 'as if', 'instead of'], 'such as', 'such as 例如；后接举例'),
            make_blank(4, ['stay', 'vary', 'sleep', 'cook'], 'vary', 'vary from country to country 因国而异'),
            make_blank(5, ['games', 'noise', 'history', 'food'], 'history', '穿越历史的旅程；与「文化/食物/音乐」呼应'),
        ],
        explain='主题：亚洲。考查介词、地点副词、举例短语、vary 用法、名词搭配。',
        difficulty=4,
    ))

    # 4) 9B U5 Festivals
    items.append(make_cloze(
        grade=9, term='下', unit_n=5, seq=4,
        topic='Festivals · Spring Festival',
        passage=(
            'The Spring Festival is the most important festival ___1___ Chinese people. '
            'It usually falls in late January or early February. Before the festival, '
            'families clean their houses ___2___ have a big dinner together on New Year\'s Eve. '
            'Children love this time because they can ___3___ red envelopes from their elders. '
            'On the streets, people watch dragon dances and ___4___ off fireworks. '
            'The festival is a time for family love ___5___ new hopes.'
        ),
        blanks=[
            make_blank(1, ['for', 'after', 'against', 'beyond'], 'for', 'important for 对...重要'),
            make_blank(2, ['or', 'but', 'so', 'and'], 'and', 'clean ... and have ... 并列谓语'),
            make_blank(3, ['receive', 'sell', 'lose', 'cook'], 'receive', '收红包；receive red envelopes'),
            make_blank(4, ['cut', 'set', 'sing', 'hang'], 'set', 'set off fireworks 放烟花，固定搭配'),
            make_blank(5, ['from', 'and', 'or', 'so'], 'and', '家庭情 + 新希望，并列'),
        ],
        explain='主题：春节。考查介词、并列连词、动词、set off、并列结构。',
        difficulty=3,
    ))

    # 5) 9B U6 Culture shock
    items.append(make_cloze(
        grade=9, term='下', unit_n=6, seq=5,
        topic='Culture shock · Different but interesting',
        passage=(
            'When you go to a foreign country, you may feel ___1___. Things look strange and people behave differently. '
            'This feeling is called "culture shock". In some countries, ___2___ is polite to tip a waiter. '
            'In others, it is considered rude. ___3___ Western countries, people stand in line quietly, '
            'but in some places, people stand very ___4___ to each other in public. '
            'The key is to keep an open mind and respect ___5___ cultures.'
        ),
        blanks=[
            make_blank(1, ['proud', 'happy', 'uncomfortable', 'rich'], 'uncomfortable', 'culture shock 不适感'),
            make_blank(2, ['it', 'this', 'that', 'one'], 'it', 'it is polite to do 形式主语 it'),
            make_blank(3, ['In', 'On', 'At', 'After'], 'In', 'in countries 在...国家'),
            make_blank(4, ['far', 'close', 'low', 'high'], 'close', 'stand close to 离得近，与「西方排队」对比'),
            make_blank(5, ['few', 'no', 'different', 'wrong'], 'different', '尊重不同文化；与全文呼应'),
        ],
        explain='主题：文化冲击。考查形容词、形式主语 it、介词、形容词对比、形容词褒贬。',
        difficulty=4,
    ))

    # 6) 9B U8 Great literature
    items.append(make_cloze(
        grade=9, term='下', unit_n=8, seq=6,
        topic='Great literature · The power of stories',
        passage=(
            'Great literature has the power to ___1___ minds and touch hearts. '
            'Books like "Pride and Prejudice" and "Journey to the West" have been read ___2___ generations. '
            'A good novel can ___3___ us to other times and places without leaving our chairs. '
            'It also teaches us about human feelings, friendship and ___4___ values. '
            'Reading great books is one of the best ___5___ to grow.'
        ),
        blanks=[
            make_blank(1, ['cook', 'open', 'sell', 'cut'], 'open', 'open minds 开拓思维'),
            make_blank(2, ['for', 'after', 'with', 'against'], 'for', 'for generations 几代人，固定搭配'),
            make_blank(3, ['build', 'take', 'sell', 'kill'], 'take', 'take sb to 带某人到，比喻用法'),
            make_blank(4, ['lazy', 'rude', 'moral', 'angry'], 'moral', 'moral values 道德观；褒义'),
            make_blank(5, ['noises', 'ways', 'meals', 'tools'], 'ways', 'ways to grow 成长的方式'),
        ],
        explain='主题：经典文学。考查动词比喻搭配、介词时间、take to 比喻、形容词褒贬、way to do。',
        difficulty=4,
    ))

    return items


# ============================================================
# 主流程
# ============================================================

def build():
    all_items = []
    all_items.extend(hj_7a())
    all_items.extend(hj_7b())
    all_items.extend(hj_8a())
    all_items.extend(hj_8b())
    all_items.extend(hj_9a())
    all_items.extend(hj_9b())
    return all_items


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true', help='实际写入（默认 dry-run）')
    ap.add_argument('--force', action='store_true', help='跳过题量骤降阻断')
    args = ap.parse_args()

    items = build()
    print(f'[hj 完形填空 本次精造] {len(items)} 篇短文 / {sum(len(it["blanks"]) for it in items)} 挖空')

    # 年级分布
    dist = {}
    for q in items:
        k = f'G{q["grade"]}{q["term"]}'
        dist[k] = dist.get(k, 0) + 1
    print(f'[年级分布] ' + '  '.join(f'{k}={v}篇' for k, v in sorted(dist.items())))

    # schema 预校验（dry-run 也校验）
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

    ok, msg = write_with_safety(OUT, items, force=args.force, type_label='hj_cloze')
    print(msg)
    if not ok:
        sys.exit(1)


if __name__ == '__main__':
    main()
