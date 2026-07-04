# -*- coding: utf-8 -*-
"""
构建 jk_cloze_passage.json —— 补全短文（选词填空，P6-D2）
形式：一段短文含 5 个空 ___1___..___5___，给出词池（比空多几个干扰词），学生选词填空。
字段：grade/term/code/topic/passage/blanks[{pos,answer}]/wordbank/explain
判分：每空选对词，按空给分。
中国元素优先，紧扣广州教科版 5-6 年级难度。
"""
import json, re

# 每篇：(grade, term, code, topic, passage含___n___, {pos:answer}, wordbank含干扰词, explain)
DATA = [
    (5,'下','5B_U1',"My Weekend",
     "Last weekend I ___1___ to the park with my family. The weather was ___2___. We ___3___ a lot of flowers. My father ___4___ many photos. We had a ___5___ time.",
     {1:"went",2:"sunny",3:"saw",4:"took",5:"good"},
     ["went","sunny","saw","took","good","rainy","goes"],
     "一般过去时叙述周末活动"),
    (5,'下','5B_U2',"A Trip to Beijing",
     "My family and I ___1___ to Beijing last summer. We visited the ___2___ Wall. It was very ___3___. We also ___4___ many delicious foods. I ___5___ the trip very much.",
     {1:"went",2:"Great",3:"long",4:"ate",5:"enjoyed"},
     ["went","Great","long","ate","enjoyed","short","eat"],
     "过去时游记（北京/长城）"),
    (5,'下','5B_U3',"My Best Friend",
     "Lily is my best ___1___. She is ___2___ than me. She likes ___3___ books. Every day she ___4___ to school by bike. We often play ___5___ after class.",
     {1:"friend",2:"taller",3:"reading",4:"goes",5:"together"},
     ["friend","taller","reading","goes","together","short","go"],
     "描述朋友（比较级/习惯）"),
    # ===== 六年级上 =====
    (6,'上','6A_U1',"Yang Liwei",
     "Yang Liwei is a great ___1___. In 2003 he ___2___ into space. He is the ___3___ Chinese astronaut. All Chinese people are ___4___ of him. He is our ___5___.",
     {1:"hero",2:"went",3:"first",4:"proud",5:"pride"},
     ["hero","went","first","proud","pride","last","go"],
     "介绍中国航天英雄杨利伟"),
    (6,'上','6A_U2',"My Dream Job",
     "I ___1___ to be a doctor when I grow up. Doctors ___2___ sick people. It is a great ___3___. I will study ___4___ to make my dream come ___5___.",
     {1:"want",2:"help",3:"job",4:"hard",5:"true"},
     ["want","help","job","hard","true","easy","wants"],
     "谈理想职业"),
    (6,'上','6A_U3',"Our School",
     "Our school is very ___1___. There are many ___2___ in it. The teachers are ___3___ to us. We ___4___ many things here. I ___5___ my school.",
     {1:"beautiful",2:"trees",3:"kind",4:"learn",5:"love"},
     ["beautiful","trees","kind","learn","love","ugly","learns"],
     "介绍校园"),
    # ===== 六年级下 =====
    (6,'下','6B_U1',"Zhong Nanshan",
     "Zhong Nanshan is a famous ___1___. He ___2___ many people during hard times. He is very ___3___ and brave. People ___4___ him very much. He is a real ___5___.",
     {1:"doctor",2:"helped",3:"kind",4:"respect",5:"hero"},
     ["doctor","helped","kind","respect","hero","teacher","help"],
     "介绍钟南山院士"),
    (6,'下','6B_U2',"Protecting the Environment",
     "We should ___1___ the environment. Please do not ___2___ rubbish everywhere. We can ___3___ more trees. Everyone ___4___ to help. Let's make our world ___5___.",
     {1:"protect",2:"throw",3:"plant",4:"needs",5:"cleaner"},
     ["protect","throw","plant","needs","cleaner","dirty","need"],
     "环保主题"),
    (6,'下','6B_U3',"My Summer Plan",
     "This summer I ___1___ go to the countryside. I will ___2___ my grandparents. I plan to ___3___ swimming and ___4___ books. It will be a ___5___ holiday.",
     {1:"will",2:"visit",3:"go",4:"read",5:"wonderful"},
     ["will","visit","go","read","wonderful","went","visits"],
     "一般将来时暑假计划"),
]

def build_passage_check(passage, blanks):
    for pos in blanks:
        assert f"___{pos}___" in passage, f"缺占位 ___{pos}___"

out = []
for (g, term, code, topic, passage, blanks, wordbank, explain) in DATA:
    build_passage_check(passage, blanks)
    out.append({
        "grade": g, "term": term, "code": code, "topic": topic,
        "type": "cloze_passage", "difficulty": 2 if g <= 5 else 3,
        "passage": passage,
        "blanks": [{"pos": p, "answer": a} for p, a in sorted(blanks.items())],
        "wordbank": wordbank,
        "explain": explain
    })

path = "data/questions/jk_cloze_passage.json"
json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"✅ 写入 {path}: {len(out)} 篇")
from collections import Counter
gt = Counter(f"{i['grade']}{i['term']}" for i in out)
print("年级分布:", dict(sorted(gt.items())))
# 校验：每篇5空、答案在词池中
for i in out:
    assert len(i['blanks']) == 5, f"{i['code']} 非5空"
    for b in i['blanks']:
        assert b['answer'] in i['wordbank'], f"{i['code']} 空{b['pos']}答案不在词池"
print("✅ 每篇5空、答案均在词池中")
