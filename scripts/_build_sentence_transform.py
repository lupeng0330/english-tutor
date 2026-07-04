# -*- coding: utf-8 -*-
"""
构建 jk_sentence_transform.json —— 句型转换题库（P6-B）
形式：给出原句 + 转换要求，学生输入改写后的句子。
字段：grade/term/code/type/difficulty/original/target/answer/answers(多可接受答案)/explain
判分：_normText 标准化后与 answer 或 answers 中任一匹配即算对。
中国元素优先，紧扣广州教科版小学句型难度递进。
"""
import json, os

# 每条：(grade, term, code, original, target, answer, [其它可接受答案], explain)
DATA = [
    # ===== 三年级上（基础：be动词否定/一般疑问）=====
    (3,'上','3A_U1',"I am a student.","改为否定句","I am not a student.",[], "be 动词后加 not"),
    (3,'上','3A_U2',"She is my friend.","改为否定句","She is not my friend.",["She isn't my friend."], "is 后加 not，可缩写 isn't"),
    (3,'上','3A_U3',"He is tall.","改为一般疑问句","Is he tall?",[], "be 动词 is 提到句首，句末用问号"),
    (3,'上','3A_U4',"They are happy.","改为一般疑问句","Are they happy?",[], "are 提到句首"),
    (3,'上','3A_U5',"This is a book.","改为复数句","These are books.",[], "this→these, is→are, 名词变复数"),
    # ===== 三年级下 =====
    (3,'下','3B_U1',"I can swim.","改为否定句","I can not swim.",["I cannot swim.","I can't swim."], "情态动词 can 后加 not"),
    (3,'下','3B_U2',"You like apples.","改为一般疑问句","Do you like apples?",[], "实义动词句用 Do 提问"),
    (3,'下','3B_U3',"It is a cat.","改为一般疑问句","Is it a cat?",[], "is 提到句首"),
    (3,'下','3B_U4',"We are in China.","改为否定句","We are not in China.",["We aren't in China."], "are 后加 not"),
    (3,'下','3B_U5',"She has a pen.","改为否定句","She does not have a pen.",["She doesn't have a pen."], "第三人称否定用 does not + 动词原形"),
    # ===== 四年级上 =====
    (4,'上','4A_U1',"I have a nice bag.","改为一般疑问句","Do you have a nice bag?",[], "have 用 Do 提问，I 变 you"),
    (4,'上','4A_U2',"There is a park.","改为否定句","There is not a park.",["There isn't a park."], "There be 句否定在 be 后加 not"),
    (4,'上','4A_U3',"He goes to school.","改为否定句","He does not go to school.",["He doesn't go to school."], "第三人称否定 does not + 动词原形"),
    (4,'上','4A_U4',"The apples are red.","对画线部分提问(red)","What colour are the apples?",["What color are the apples?"], "问颜色用 What colour"),
    (4,'上','4A_U5',"My mother is a teacher.","改为一般疑问句","Is your mother a teacher?",[], "is 提前，my 变 your"),
    # ===== 四年级下 =====
    (4,'下','4B_U1',"I want to be a doctor.","改为一般疑问句","Do you want to be a doctor?",[], "want 用 Do 提问"),
    (4,'下','4B_U2',"She likes reading books.","改为否定句","She does not like reading books.",["She doesn't like reading books."], "第三人称否定 does not + 原形"),
    (4,'下','4B_U3',"They play football on Sunday.","对画线部分提问(on Sunday)","When do they play football?",[], "问时间用 When"),
    (4,'下','4B_U4',"It is my ruler.","改为复数句","They are my rulers.",[], "it→they, is→are, 名词变复数"),
    (4,'下','4B_U5',"We have English on Monday.","改为一般疑问句","Do you have English on Monday?",[], "have 用 Do 提问"),
    # ===== 五年级上 =====
    (5,'上','5A_U1',"Lily is watching TV.","改为否定句","Lily is not watching TV.",["Lily isn't watching TV."], "现在进行时否定在 be 后加 not"),
    (5,'上','5A_U2',"They are playing games.","改为一般疑问句","Are they playing games?",[], "现在进行时 be 提前"),
    (5,'上','5A_U3',"He can play the piano.","改为否定句","He cannot play the piano.",["He can not play the piano.","He can't play the piano."], "can 后加 not"),
    (5,'上','5A_U4',"I get up at six.","对画线部分提问(at six)","What time do you get up?",["When do you get up?"], "问时间用 What time/When"),
    (5,'上','5A_U5',"There are five books.","对画线部分提问(five)","How many books are there?",[], "问数量用 How many + 复数名词"),
    # ===== 五年级下 =====
    (5,'下','5B_U1',"She went to Beijing last week.","改为一般疑问句","Did she go to Beijing last week?",[], "一般过去时用 Did 提问，动词还原"),
    (5,'下','5B_U2',"I visited my grandpa yesterday.","改为否定句","I did not visit my grandpa yesterday.",["I didn't visit my grandpa yesterday."], "过去时否定用 did not + 原形"),
    (5,'下','5B_U3',"He is taller than me.","改为一般疑问句","Is he taller than me?",[], "is 提前"),
    (5,'下','5B_U4',"They will go hiking tomorrow.","改为否定句","They will not go hiking tomorrow.",["They won't go hiking tomorrow."], "一般将来时否定 will not/won't"),
    (5,'下','5B_U5',"We saw pandas in the zoo.","对画线部分提问(pandas)","What did you see in the zoo?",[], "问事物用 What，过去时用 did"),
    # ===== 六年级上 =====
    (6,'上','6A_U1',"Yang Liwei is a great hero.","改为一般疑问句","Is Yang Liwei a great hero?",[], "is 提前（介绍中国航天英雄杨利伟）"),
    (6,'上','6A_U2',"I am going to Guangzhou.","改为一般疑问句","Are you going to Guangzhou?",[], "现在进行时/将来 be 提前，I 变 you"),
    (6,'上','6A_U3',"She teaches us English.","改为否定句","She does not teach us English.",["She doesn't teach us English."], "第三人称否定 does not + 原形"),
    (6,'上','6A_U4',"He runs fastest in his class.","改为一般疑问句","Does he run fastest in his class?",[], "第三人称用 Does 提问，动词还原"),
    (6,'上','6A_U5',"The Great Wall is very long.","改为感叹句","How long the Great Wall is!",[], "How + 形容词 + 主语 + 谓语（长城）"),
    # ===== 六年级下 =====
    (6,'下','6B_U1',"Zhong Nanshan helped many people.","改为一般疑问句","Did Zhong Nanshan help many people?",[], "过去时用 Did 提问（钟南山）"),
    (6,'下','6B_U2',"I will study harder next term.","改为否定句","I will not study harder next term.",["I won't study harder next term."], "将来时否定 will not/won't"),
    (6,'下','6B_U3',"They are cleaning the classroom.","改为否定句","They are not cleaning the classroom.",["They aren't cleaning the classroom."], "进行时否定 be 后加 not"),
    (6,'下','6B_U4',"Yuan Longping grew rice.","改为一般疑问句","Did Yuan Longping grow rice?",[], "过去时用 Did，动词还原（袁隆平）"),
    (6,'下','6B_U5',"This book is more interesting.","改为一般疑问句","Is this book more interesting?",[], "is 提前"),
]

def norm_answers(ans, extra):
    seen = []
    for a in [ans] + list(extra):
        if a not in seen:
            seen.append(a)
    return seen

out = []
for (g, term, code, original, target, answer, extra, explain) in DATA:
    diff = 1 if g <= 3 else (2 if g <= 5 else 3)
    out.append({
        "grade": g, "term": term, "code": code,
        "type": "sentence_transform", "difficulty": diff,
        "original": original, "target": target,
        "answer": answer,
        "answers": norm_answers(answer, extra),
        "explain": explain
    })

path = "data/questions/jk_sentence_transform.json"
json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"✅ 写入 {path}: {len(out)} 题")
from collections import Counter
gt = Counter(f"{i['grade']}{i['term']}" for i in out)
print("年级分布:", dict(sorted(gt.items())))
