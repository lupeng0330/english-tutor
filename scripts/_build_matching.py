# -*- coding: utf-8 -*-
"""
构建 jk_matching.json —— 匹配题（问答配对，P6-D1）
形式：给出 5 个问句 + 打乱的 5 个答句，学生为每个问句选择正确答句。
字段：grade/term/code/type/difficulty/pairs[{q,a}]/explain
判分：每个问句选对答句，全对才算该组正确（考试按对的个数给分）。
渲染：左问句 + 右下拉选答句（选项=本组所有答句）。
中国元素/日常对话优先，紧扣广州教科版 3-4 年级难度。
"""
import json

# 每组：(grade, term, code, [(问句, 答句), ...], explain)
DATA = [
    # ===== 三年级上 =====
    (3,'上','3A_U1',[
        ("What's your name?","My name is Ming."),
        ("How are you?","I'm fine, thank you."),
        ("How old are you?","I'm nine."),
        ("Hello!","Hi!"),
        ("Goodbye!","See you!"),
    ],"日常问候与自我介绍"),
    (3,'上','3A_U2',[
        ("What's this?","It's a pen."),
        ("What colour is it?","It's red."),
        ("Is it a cat?","Yes, it is."),
        ("How many books?","Five books."),
        ("Where is my bag?","It's on the desk."),
    ],"物品与颜色问答"),
    (3,'上','3A_U3',[
        ("Can I have an apple?","Sure, here you are."),
        ("Do you like bananas?","Yes, I do."),
        ("What would you like?","I'd like some milk."),
        ("Is this your book?","No, it isn't."),
        ("Thank you!","You're welcome."),
    ],"食物与礼貌用语"),
    # ===== 三年级下 =====
    (3,'下','3B_U1',[
        ("What day is it today?","It's Monday."),
        ("What's the weather like?","It's sunny."),
        ("What time is it?","It's seven o'clock."),
        ("Where are you from?","I'm from China."),
        ("Who is she?","She is my mother."),
    ],"时间/天气/人物问答"),
    (3,'下','3B_U2',[
        ("Can you swim?","Yes, I can."),
        ("What are you doing?","I'm reading."),
        ("Whose bag is this?","It's mine."),
        ("Where is the dog?","It's under the table."),
        ("Do you have a ruler?","Yes, I do."),
    ],"能力与位置问答"),
    (3,'下','3B_U3',[
        ("Happy birthday!","Thank you!"),
        ("Let's play football.","Great idea!"),
        ("May I come in?","Yes, please."),
        ("How much is it?","Ten yuan."),
        ("What's your favourite fruit?","I like oranges."),
    ],"祝福与日常交流"),
    # ===== 四年级上 =====
    (4,'上','4A_U1',[
        ("What's your father's job?","He is a doctor."),
        ("Where do you live?","I live in Guangzhou."),
        ("What subject do you like?","I like English."),
        ("How do you go to school?","By bus."),
        ("When do you get up?","At six o'clock."),
    ],"职业/地点/日常"),
    (4,'上','4A_U2',[
        ("What's in your bag?","There are some books."),
        ("Is there a park near here?","Yes, there is."),
        ("What are these?","They are apples."),
        ("Whose pen is it?","It's Tom's."),
        ("Can you help me?","Of course."),
    ],"存在句与物品"),
    # ===== 四年级下 =====
    (4,'下','4B_U1',[
        ("What's the date today?","It's May 1st."),
        ("What will you do tomorrow?","I'll go hiking."),
        ("Why do you like spring?","Because it's warm."),
        ("What's your hobby?","I like drawing."),
        ("How's the weather in summer?","It's hot."),
    ],"日期/计划/爱好"),
    (4,'下','4B_U2',[
        ("What did you do yesterday?","I watched TV."),
        ("Where did you go?","I went to the zoo."),
        ("What animals did you see?","I saw pandas."),
        ("Was it fun?","Yes, it was."),
        ("Did you like it?","Yes, very much."),
    ],"过去时问答（游玩）"),
]

out = []
for (g, term, code, pairs, explain) in DATA:
    diff = 1 if g <= 3 else 2
    out.append({
        "grade": g, "term": term, "code": code,
        "type": "matching", "difficulty": diff,
        "pairs": [{"q": q, "a": a} for (q, a) in pairs],
        "explain": explain
    })

path = "data/questions/jk_matching.json"
json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"✅ 写入 {path}: {len(out)} 组")
from collections import Counter
gt = Counter(f"{i['grade']}{i['term']}" for i in out)
print("年级分布:", dict(sorted(gt.items())))
# 校验每组5对、答句唯一
for i in out:
    assert len(i['pairs']) == 5, f"{i['code']} 非5对"
    ans = [p['a'] for p in i['pairs']]
    assert len(set(ans)) == 5, f"{i['code']} 答句有重复"
print("✅ 每组5对、答句唯一")
