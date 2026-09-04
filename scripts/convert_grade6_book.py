# -*- coding: utf-8 -*-
"""
把用户提供的 book_grade6_english.json 转换为 jk.json 中 grade6.下 需要的结构，
只替换 grade6.下，其他年级/学期保持不变。

目标结构（每个 unit）：
{
  "id": "u1",
  "title": "Unit 1 Slow and steady wins the race",
  "pageRange": "",
  "topic": "...",
  "grammar": ["...", "..."],
  "words": [ {word, phonetic, meaning, example}, ... ],
  "lessons": [
    { "page": "Let's talk", "title": "对话 · Why are you in such a hurry?", "en": "...", "cn": "..." },
    { "page": "Story",      "title": "The tortoise and the hare",         "en": "...", "cn": "..." }
  ]
}
"""
import json
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = r"C:\\Users\\penglu\\Documents\\book_grade6_english.json"
DST  = os.path.join(ROOT, "data", "textbooks", "jk.json")

# -------- 人工翻译对照（对话 & 故事按课本风格翻译，不用机器） --------
# key: (unit_id, dialogue_or_story, index)
TRANSLATIONS = {
    # ========== U1 Slow and steady wins the race ==========
    ("U1", "D1"): (
        "Janet：你为什么这么匆忙？\n"
        "Jiamin：我要去图书馆还一本书。\n"
        "Janet：你真像那只傻兔子。\n"
        "Jiamin：兔子？什么意思？\n"
        "Xiaoling：你知道的……关于乌龟和兔子的那个老故事。\n"
        "Janet：对！从前，乌龟和兔子赛跑。兔子以为自己肯定赢，就停下来休息。它太骄傲又太大意了。\n"
        "Xiaoling：缓慢但认真的乌龟赢了比赛。\n"
        "Jiamin：啊，我明白了。如果我想把事情做好，就必须耐心细致。慢而稳，才能赢！"
    ),
    ("U1", "S1"): (
        "一天，乌龟和兔子决定赛跑。兔子觉得自己比乌龟快得多，就嘲笑乌龟。比赛中，兔子跑得飞快，然后在树下打起了盹儿。"
        "乌龟一步步缓慢而坚定地走着，从不停下。兔子醒来时，乌龟已经快到终点线了。兔子拼命跑，但为时已晚。"
        "最后乌龟赢了。兔子得到了一个教训：慢而稳，才能赢。"
    ),
    # ========== U2 Waiting for another hare ==========
    ("U2", "D1"): (
        "Tom：你在看什么？\n"
        "Amy：我在看一个关于一个农夫的故事。\n"
        "Tom：他发生了什么事？\n"
        "Amy：有一天，一只兔子撞到了一棵树上死了。农夫把它捡起来带回家。\n"
        "Tom：那多容易啊！他后来又得到兔子了吗？\n"
        "Amy：没有。从那以后，他就不去田里干活了，只等着另一只兔子再撞上那棵树。可是再也没有兔子来。他的庄稼全都死了。\n"
        "Tom：哎！这可真是个坏主意，他应该努力干活才对。\n"
        "Amy：是啊。我们不能光等着好运上门，应该为梦想而努力。"
    ),
    ("U2", "S1"): (
        "从前有一个农夫。一天，他正在田里干活，突然一只兔子飞快地跑过来，撞到一棵大树上死了。"
        "农夫捡起那只兔子带回家，非常高兴：“弄到食物真容易啊！”他想。从那以后，他就不再下田干活，每天坐在那棵树下等下一只兔子。"
        "可是再也没有兔子来了。庄稼因为没人照料全都死了。农夫得到了一个教训：好运不会再来，我们必须努力才能得到想要的东西。"
    ),
    # ========== U3 What animal is it? ==========
    ("U3", "D1"): (
        "Lily：这是什么动物？\n"
        "Mike：是熊猫。它是黑白相间的，生活在中国。\n"
        "Lily：它是濒危动物吗？\n"
        "Mike：是的。熊猫是濒危动物，野外剩下的熊猫不多了。\n"
        "Lily：那大象呢？\n"
        "Mike：大象也是濒危动物。它们是陆地上最大的动物，有长长的鼻子。\n"
        "Lily：我们怎样才能帮助它们？\n"
        "Mike：我们可以保护它们的家园，不买用它们身体部分做成的东西。"
    ),
    # ========== U4 We can save the animals ==========
    ("U4", "D1"): (
        "Tom：很多动物都处于危险之中，我们能做点什么？\n"
        "Amy：我们可以拯救它们。首先，我们可以保护它们的家园。\n"
        "Tom：家园？像森林和河流那样的地方？\n"
        "Amy：对。人们砍伐森林、污染河流，动物就失去了家园。\n"
        "Tom：我们还能做什么？\n"
        "Amy：我们可以不买象牙、皮毛这些用动物身体部分做成的东西。\n"
        "Tom：没错。我们还可以告诉朋友们一起帮忙。\n"
        "Amy：对！每一个小小的行动都能帮助拯救动物。"
    ),
    # ========== U5 Dr Sun Yatsen ==========
    ("U5", "D1"): (
        "Jiamin：你知道孙中山先生吗？\n"
        "Xiaoling：知道，他是中国伟大的领袖。\n"
        "Jiamin：他是什么时候出生的？\n"
        "Xiaoling：他 1866 年出生在广东。\n"
        "Jiamin：他做了什么？\n"
        "Xiaoling：他深爱中国人民，努力改变中国，解放人民。\n"
        "Jiamin：他在全世界都非常有名。\n"
        "Xiaoling：是的，很多街道、公园和学校都以他的名字命名。"
    ),
    ("U5", "S1"): (
        "孙中山先生是中国历史上最伟大的领袖之一。他 1866 年出生在广东翠亨村。他非常热爱中国人民。"
        "那时普通百姓生活很苦，孙中山先生想要改变中国。他努力解放人民，建立新中国。人们非常尊敬他。"
        "今天，全国各地的许多街道、公园和学校都以他的名字命名。"
    ),
    # ========== U6 Early years of Deng Jiaxian ==========
    ("U6", "D1"): (
        "Janet：你知道邓稼先吗？\n"
        "Ben：知道，他是中国一位伟大的科学家。\n"
        "Janet：他小时候是什么样的？\n"
        "Ben：他非常聪明、勤奋。\n"
        "Janet：他在学校努力学习吗？\n"
        "Ben：是的，他喜欢阅读，喜欢学习新东西。\n"
        "Janet：他后来做了什么？\n"
        "Ben：他为我们国家工作，为中国做出了巨大的贡献。"
    ),
    ("U6", "S1"): (
        "邓稼先是中国著名的大科学家。小时候，他就安静、聪明、爱思考，非常喜欢读书，在学校学习刻苦。"
        "他常常提出好问题，喜欢动脑筋。他从小就热爱祖国。后来他学习科学，一生为中国工作，永远活在人们心中。"
    ),
    # ========== U7 It's the polite thing to do ==========
    ("U7", "D1"): (
        "Xiaoling：Jiamin，看，不要插队。\n"
        "Jiamin：对不起，那我该怎么做？\n"
        "Xiaoling：你应该排队，这样才礼貌。\n"
        "Jiamin：我们还应该做哪些礼貌的事？\n"
        "Xiaoling：在图书馆里我们应该小声说话，不应该大声喧哗。\n"
        "Jiamin：我懂了。良好的礼仪让生活更美好。"
    ),
    # ========== U8 The magic words ==========
    ("U8", "D1"): (
        "Ben：可以请你把那本书递给我吗？\n"
        "Tom：当然可以，给你。\n"
        "Ben：非常感谢。\n"
        "Tom：不客气，这些都是魔法词汇。\n"
        "Ben：魔法词汇？\n"
        "Tom：对。“请”“谢谢”和“对不起”，它们能让人开心。"
    ),
    # ========== U9 Where will you go? ==========
    ("U9", "D1"): (
        "Xiaoling：暑假快到了，你要去哪里？\n"
        "Janet：我和父母一起去北京。\n"
        "Xiaoling：你们怎么去？\n"
        "Janet：我们坐飞机去，比较快。\n"
        "Xiaoling：你们在那儿要做什么？\n"
        "Janet：我们要去参观长城和颐和园。"
    ),
    # ========== U10 I can't wait to see you ==========
    ("U10", "D1"): (
        "Jiamin：这个假期我要回家乡。\n"
        "Ben：太好了！你会见到老朋友吗？\n"
        "Jiamin：会的，我迫不及待想见他们。\n"
        "Ben：你会给我写邮件吗？\n"
        "Jiamin：当然会，我还会给你发一些照片。\n"
        "Ben：祝你玩得开心！"
    ),
}


def to_unit_id(uid_src):
    # "U1" -> "u1"
    return uid_src.lower()


def build_unit(u):
    uid = to_unit_id(u["unit_id"])
    title = "Unit {} {}".format(uid[1:], u["unit_name"])

    # 词表：只保留 word / phonetic / meaning / example 四个标准字段
    words = []
    for w in u.get("vocab_list", []):
        words.append({
            "word": w["word"],
            "phonetic": w.get("phonetic", ""),
            "meaning": w.get("meaning", ""),
            "example": w.get("example", "")
        })

    # 课文：对话 + 故事
    lessons = []
    for d in u.get("dialogues", []):
        en = "\n".join(d["text"])
        key_title = d["text"][0] if d["text"] else d.get("title", "对话")
        # 句首取第一句话中前 30 字作副标题
        short = key_title.split(":", 1)[-1].strip()
        if len(short) > 34:
            short = short[:32] + "…"
        cn = TRANSLATIONS.get((u["unit_id"], d["dialogue_id"]), "")
        lessons.append({
            "page": "Let's talk",
            "title": "对话 · " + short,
            "en": en,
            "cn": cn
        })
    for s in u.get("stories", []):
        en = s["text"]
        cn = TRANSLATIONS.get((u["unit_id"], s["story_id"]), "")
        lessons.append({
            "page": "Story",
            "title": "故事 · " + s.get("title", ""),
            "en": en,
            "cn": cn
        })

    unit = {
        "id": uid,
        "title": title,
        "topic": u.get("topic", ""),
        "grammar": u.get("grammar_points", []),
        "words": words,
        "lessons": lessons
    }
    return unit


def main():
    with open(SRC, "r", encoding="utf-8") as f:
        src = json.load(f)
    with open(DST, "r", encoding="utf-8") as f:
        jk = json.load(f)

    new_units = []
    for m in src.get("modules", []):
        if "units" in m:
            for u in m["units"]:
                new_units.append(build_unit(u))

    if "grade6" not in jk["grades"]:
        jk["grades"]["grade6"] = {"上": [], "下": []}
    jk["grades"]["grade6"]["下"] = new_units

    jk["meta"]["note_grade6_xia"] = (
        "六年级下册已切换为《义务教育教科书 英语（三年级起点）六年级下册》"
        "(教育科学出版社, 2013)，5 个模块 10 个单元 · 内容按官方教材整理"
    )

    with open(DST, "w", encoding="utf-8") as f:
        json.dump(jk, f, ensure_ascii=False, indent=2)

    total_words = sum(len(u["words"]) for u in new_units)
    total_lessons = sum(len(u["lessons"]) for u in new_units)
    print("OK. grade6.下: {} units, {} words, {} lessons".format(
        len(new_units), total_words, total_lessons))
    for u in new_units:
        print("  - {} {}: {} words, {} lessons".format(
            u['id'], u['title'], len(u['words']), len(u['lessons'])))


if __name__ == "__main__":
    main()
