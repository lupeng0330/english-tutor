# -*- coding: utf-8 -*-
"""
hj（沪教牛津 7-9 年级）完形填空题库生成器（P2-C 批次 1）。

设计：
  - 真完形模式：每篇 80-100 词连贯短文 + 5 挖空 + 4 选项
  - 短文话题对齐 hj 教材单元：每册 6 篇覆盖 6 个核心单元
  - code 格式：{7-9}{A/B}_U{N}_C{NN}
  - 数据手工编写，原创内容（话题对齐教材，文字独立创作）

本批进度：
  - ✅ 7A：6 篇（U1 Making friends / U2 Daily life / U3 Earth / U4 Seasons / U6 Asia / U7 Clubs）
  - ⏳ 7B / 8A / 8B / 9A / 9B 各 6 篇待补（下次会话）

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
# 主流程
# ============================================================

def build():
    all_items = []
    all_items.extend(hj_7a())
    # 7B / 8A / 8B / 9A / 9B 待补（下次会话）
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
