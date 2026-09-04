#!/usr/bin/env python3
"""生成 grammar_knowledge.json 完整语法知识库"""
import json

grammar = []

def add(id, title, titleEn, category, level, grades, jk_units, hj_units, definition, rules, examples, commonErrors, keywords, tips=""):
    grammar.append({
        "id": id, "title": title, "titleEn": titleEn,
        "category": category, "level": level, "grades": grades,
        "relatedUnits": {"jk": jk_units, "hj": hj_units},
        "definition": definition, "rules": rules,
        "examples": examples, "commonErrors": commonErrors,
        "keywords": keywords, "tips": tips
    })

# ==================== Ⅰ. 词性 Parts of Speech (20条) ====================

add("g001","名词：可数/不可数","Countable & Uncountable Nouns",
    "parts_of_speech","basic",["G3","G4"],
    ["3A_U1","3A_U2"],["7A_U1","7A_U3"],
    "可数名词有单复数形式，可加a/an或数词；不可数名词没有复数，前不加a/an。",
    [{"rule":"可数名词复数+s/es","note":"book→books, box→boxes"},
     {"rule":"不可数名词前可用some/much/a lot of","note":"some water, much milk"}],
    [{"en":"I have an apple.","cn":"我有一个苹果。"},{"en":"There is some water.","cn":"有一些水。"}],
    [{"wrong":"I have two waters.","correct":"I have two bottles of water.","note":"water不可数，需用量词"}],
    ["名词","可数","不可数","a/an","复数"],"可数前要a/an，不可数需用量词装")

add("g002","名词：复数规则","Plural Nouns Rules",
    "parts_of_speech","basic",["G3","G4"],
    ["3A_U3","3B_U2"],["7A_U1"],
    "英语名词变复数的六条基本规则。",
    [{"rule":"一般+s","note":"book→books"},
     {"rule":"s/x/sh/ch+es","note":"box→boxes, bus→buses"},
     {"rule":"辅音字母+y结尾,变y为i+es","note":"baby→babies"},
     {"rule":"f/fe结尾,变f/fe为v+es","note":"knife→knives"},
     {"rule":"o结尾,有生命+es","note":"tomato→tomatoes, photo→photos"},
     {"rule":"不规则变化","note":"child→children, man→men"}],
    [{"en":"I have two cats.","cn":"我有两只猫。"},{"en":"The children are playing.","cn":"孩子们在玩。"}],
    [{"wrong":"two childs","correct":"two children","note":"child不规则复数"}],
    ["名词","复数","规则","不规则","加s"],"s/x/sh/ch配es，y变i加es最常见")

add("g003","名词：所有格","Possessive Nouns",
    "parts_of_speech","basic",["G4"],
    ["4A_U2","4B_U1"],["7A_U2"],
    "表示"...的"，用's或of短语。",
    [{"rule":"单数名词+'s","note":"Tom's book"},
     {"rule":"复数名词以s结尾+'","note":"students' books"},
     {"rule":"无生命用of","note":"the door of the room"}],
    [{"en":"This is Lily's bag.","cn":"这是莉莉的包。"},{"en":"The name of the book is Harry Potter.","cn":"书名是哈利波特。"}],
    [{"wrong":"Tom book","correct":"Tom's book","note":"漏写了's"}],
    ["名词","所有格","的","'s","of"],"有生命用's，无生命用of")

add("g004","人称代词","Personal Pronouns",
    "parts_of_speech","basic",["G3","G4"],
    ["3A_U2","3A_U3"],["7A_U1"],
    "代替人或事物名称的词。分为主格（作主语）和宾格（作宾语）。",
    [{"rule":"主格:I, you, he, she, it, we, they","note":"作主语"},
     {"rule":"宾格:me, you, him, her, it, us, them","note":"作宾语"}],
    [{"en":"I like her.","cn":"我喜欢她。"},{"en":"He gives me a pen.","cn":"他给我一支笔。"}],
    [{"wrong":"Me like apples.","correct":"I like apples.","note":"主语用主格I而不是me"}],
    ["代词","主格","宾格","I","me","you"],"主语用主格，宾语用宾格")

add("g005","物主代词","Possessive Pronouns",
    "parts_of_speech","basic",["G3","G4"],
    ["3A_U7","4A_U2"],["7A_U1"],
    "表示所属关系的代词。分为形容词性（后接名词）和名词性（独立使用）。",
    [{"rule":"形物代:my, your, his, her, its, our, their","note":"后必须跟名词"},
     {"rule":"名物代:mine, yours, his, hers, its, ours, theirs","note":"独立使用，不跟名词"}],
    [{"en":"This is my book. = This book is mine.","cn":"这是我的书。"},{"en":"Her bag is red.","cn":"她的包是红色的。"}],
    [{"wrong":"This is mine book.","correct":"This is my book.","note":"my后跟名词，mine后不跟"}],
    ["代词","物主代词","my","mine","your","yours"],"形物代像帽子要跟名词, 名物代像衣服独立穿")

add("g006","反身代词","Reflexive Pronouns",
    "parts_of_speech","intermediate",["G6"],
    ["6A_U1"],["7B_U4"],
    "表示"某人自己"，以-self/-selves结尾。",
    [{"rule":"myself/yourself/himself/herself/itself","note":"单数"},
     {"rule":"ourselves/yourselves/themselves","note":"复数"}],
    [{"en":"I can do it myself.","cn":"我能自己做。"},{"en":"Help yourself to some cake.","cn":"请随意吃蛋糕。"}],
    [{"wrong":"He hurt hisself.","correct":"He hurt himself.","note":"himself不是hisself"}],
    ["代词","反身","self","myself","himself"],"单数self复数selves, 自己动手丰衣足食")

add("g007","指示代词","Demonstrative Pronouns",
    "parts_of_speech","basic",["G3","G4"],
    ["3A_U4","3B_U2"],["7A_U1"],
    "this/that指单数, these/those指复数。",
    [{"rule":"this/these:近指","note":"this is, these are"},
     {"rule":"that/those:远指","note":"that is, those are"}],
    [{"en":"This is a cat. Those are dogs.","cn":"这是猫。那些是狗。"},{"en":"I like these flowers.","cn":"我喜欢这些花。"}],
    [{"wrong":"This are my books.","correct":"These are my books.","note":"复数用these不是this"}],
    ["代词","指示","this","that","these","those"],"this/that单数, these/those复数")

add("g008","不定代词","Indefinite Pronouns",
    "parts_of_speech","intermediate",["G5","G6"],
    ["5A_U3","6A_U4"],["7B_U3"],
    "不明确指代特定人或事物的代词：some/any/no/every及其复合词。",
    [{"rule":"some用于肯定句, any用于否定/疑问","note":"some apples, any milk"},
     {"rule":"someone/anyone/no one/everyone","note":"指人"},
     {"rule":"something/anything/nothing/everything","note":"指物"}],
    [{"en":"There is someone at the door.","cn":"门口有人。"},{"en":"Is there anything I can help?","cn":"有什么我能帮忙的吗？"}],
    [{"wrong":"I don't have some money.","correct":"I don't have any money.","note":"否定句用any不用some"}],
    ["代词","不定","some","any","no","every"],"some肯定any否, 请求建议some走")

add("g009","冠词：定冠词 the","Definite Article the",
    "parts_of_speech","basic",["G4","G5"],
    ["4A_U1","5A_U1"],["7A_U2"],
    "用于特指某个或某些人或物。",
    [{"rule":"特指上文提到过的人/物","note":"I saw a dog. The dog was big."},
     {"rule":"独一无二的事物前","note":"the sun, the earth, the moon"},
     {"rule":"序数词/最高级/乐器前","note":"the first, the best, play the piano"}],
    [{"en":"The sun rises in the east.","cn":"太阳从东边升起。"},{"en":"He is the tallest in our class.","cn":"他是我们班最高的。"}],
    [{"wrong":"Sun is bright.","correct":"The sun is bright.","note":"独一无二事物前要加the"}],
    ["冠词","the","定冠词","特指","独一无二"],"特指要用the, 独一无二也配the")

add("g010","冠词：不定冠词 a/an","Indefinite Article a/an",
    "parts_of_speech","basic",["G3","G4"],
    ["3A_U1","4A_U1"],["7A_U1"],
    "用于单数可数名词前，表泛指。",
    [{"rule":"辅音音素开头的词前用a","note":"a book, a dog, a university"},
     {"rule":"元音音素开头的词前用an","note":"an apple, an hour, an honest boy"}],
    [{"en":"I have a pen.","cn":"我有一支笔。"},{"en":"She ate an orange.","cn":"她吃了一个橙子。"}],
    [{"wrong":"a apple","correct":"an apple","note":"apple以元音开头用an"}],
    ["冠词","a","an","不定冠词"],"a配辅音an配元, 看音标不是看字母")

add("g011","数词：基数词 1-100","Cardinal Numbers",
    "parts_of_speech","basic",["G3","G4"],
    ["3A_U6","4A_U2"],["7A_U2"],
    "表示数量的数字，1-100的基本表达。",
    [{"rule":"1-12单独记忆","note":"one→twelve"},
     {"rule":"13-19以teen结尾","note":"thirteen, fourteen, fifteen"},
     {"rule":"20-90整十以ty结尾","note":"twenty, thirty, forty"},
     {"rule":"几十几加连字符","note":"twenty-one, thirty-five"}],
    [{"en":"He is twenty-five years old.","cn":"他25岁。"},{"en":"There are forty-two students.","cn":"有42个学生。"}],
    [{"wrong":"fourty","correct":"forty","note":"40是forty不是fourty"}],
    ["数词","基数","数字","twenty","hundred"],"1-12要硬记, 13-19 teen结尾")

add("g012","数词：序数词","Ordinal Numbers",
    "parts_of_speech","basic",["G4","G5"],
    ["4A_U2","5A_U1"],["7A_U2"],
    "表示顺序的数字：第一、第二、第三...",
    [{"rule":"一般基数词+th","note":"four→fourth, six→sixth"},
     {"rule":"以y结尾变y为ie+th","note":"twenty→twentieth"},
     {"rule":"特殊变化","note":"one→first, two→second, three→third"}],
    [{"en":"I am the first.","cn":"我是第一名。"},{"en":"It's on the third floor.","cn":"在三楼。"}],
    [{"wrong":"He is the twoth.","correct":"He is the second.","note":"二是second不是twoth"}],
    ["数词","序数","first","second","third"],"一二三特殊记, 其余加th")

add("g013","形容词：用法与位置","Adjectives: Usage & Position",
    "parts_of_speech","basic",["G4","G5"],
    ["4A_U5","5A_U3"],["7A_U3"],
    "用来描述名词的特征或性质。",
    [{"rule":"形容词放在名词前","note":"a beautiful flower"},
     {"rule":"形容词放在be动词后（表语）","note":"The flower is beautiful."},
     {"rule":"多个形容词顺序","note":"大小→形状→颜色→国籍→材料"}],
    [{"en":"She is a smart girl.","cn":"她是个聪明的女孩。"},{"en":"The weather is nice today.","cn":"今天天气很好。"}],
    [{"wrong":"It is a red big apple.","correct":"It is a big red apple.","note":"大小在颜色前"}],
    ["形容词","描述","位置","big","beautiful"],"名前表语后, 描述名词最拿手")

add("g014","副词：方式副词","Adverbs of Manner",
    "parts_of_speech","intermediate",["G5","G6"],
    ["5A_U4","6A_U2"],["7B_U5"],
    "修饰动词，表示动作的方式，通常以ly结尾。",
    [{"rule":"形容词+ly→副词","note":"quick→quickly, careful→carefully"},
     {"rule":"特殊变化","note":"good→well, fast→fast, hard→hard"}],
    [{"en":"She runs quickly.","cn":"她跑得快。"},{"en":"He speaks English well.","cn":"他英语说得好。"}],
    [{"wrong":"He runs quick.","correct":"He runs quickly.","note":"修饰动词run用副词quickly"}],
    ["副词","方式","ly","quickly","well"],"动作用副词, ly结尾最常见")

add("g015","副词：频度副词","Adverbs of Frequency",
    "parts_of_speech","basic",["G4","G5"],
    ["4A_U4","5A_U1"],["7A_U4"],
    "表示动作发生的频率。",
    [{"rule":"always(100%)>usually>often>sometimes>seldom>never(0%)","note":"频率从高到低"},
     {"rule":"位于be/助/情态动词后, 实义动词前","note":"He is always late. He always comes late."}],
    [{"en":"I often go swimming.","cn":"我经常游泳。"},{"en":"She never eats junk food.","cn":"她从不吃垃圾食品。"}],
    [{"wrong":"I go always to school.","correct":"I always go to school.","note":"频度副词放动词前"}],
    ["副词","频率","always","often","sometimes","never"],"永远把频度放在实义动词前")

add("g016","介词：时间介词","Prepositions of Time",
    "parts_of_speech","basic",["G4","G5"],
    ["4B_U3","5A_U1"],["7A_U4"],
    "at/in/on表示时间。",
    [{"rule":"at+具体时刻","note":"at 7 o'clock, at noon"},
     {"rule":"on+具体某天/星期","note":"on Monday, on May 1st"},
     {"rule":"in+月/年/季节/上下午","note":"in May, in 2024, in summer, in the morning"}],
    [{"en":"I get up at 7:00.","cn":"我7点起床。"},{"en":"We go to school on weekdays.","cn":"我们工作日上学。"}],
    [{"wrong":"I was born on 2010.","correct":"I was born in 2010.","note":"年份用in不用on"}],
    ["介词","时间","at","on","in"],"at时刻on天in月年, 早中晚归in管")

add("g017","介词：地点介词","Prepositions of Place",
    "parts_of_speech","basic",["G3","G4"],
    ["3B_U2","4A_U1"],["7A_U3"],
    "in/on/under/behind/between/next to表示位置。",
    [{"rule":"in在...里面","note":"in the box"},
     {"rule":"on在...上面(有接触)","note":"on the desk"},
     {"rule":"under在...下面","note":"under the table"}],
    [{"en":"The cat is under the chair.","cn":"猫在椅子下面。"},{"en":"The school is next to the park.","cn":"学校在公园旁边。"}],
    [{"wrong":"The book is in the desk.","correct":"The book is on the desk.","note":"在桌面上用on"}],
    ["介词","地点","in","on","under","behind","between"],"in里on上under下, next to在隔壁")

add("g018","连词","Conjunctions",
    "parts_of_speech","intermediate",["G5","G6"],
    ["5A_U6","6A_U8"],["7B_U6"],
    "连接词、短语或句子的词。",
    [{"rule":"and(和), but(但是), or(或者)","note":"并列连词"},
     {"rule":"because(因为), so(所以)","note":"因果连词"},
     {"rule":"when(当...时), if(如果)","note":"从属连词"}],
    [{"en":"I like apples and bananas.","cn":"我喜欢苹果和香蕉。"},{"en":"He was late because he missed the bus.","cn":"他迟到了因为他错过了公交。"}],
    [{"wrong":"Because he was tired, so he went to bed.","correct":"Because he was tired, he went to bed.","note":"because和so不能同时用"}],
    ["连词","and","but","or","because","so"],"because和so不共存, 因果只选一个")

add("g019","感叹词","Interjections",
    "parts_of_speech","basic",["G3"],
    ["3A_U8"],["7A_U1"],
    "表示强烈感情的词。",
    [{"rule":"Oh! Wow! Oops! Great! Hooray! Ouch!","note":"表达惊喜/失望/疼痛等"}],
    [{"en":"Wow! That's amazing!","cn":"哇！太棒了！"},{"en":"Oops! I dropped it.","cn":"哎呀！我弄掉了。"}],
    [{"wrong":"在正式写作中过度使用感叹词","correct":"感叹词多用于口语和对话","note":""}],
    ["感叹词","oh","wow","oops","great"],"感叹词表情绪, 口语对话最合适")

add("g020","量词","Quantifiers",
    "parts_of_speech","intermediate",["G5"],
    ["5B_U3"],["7A_U5"],
    "表示人、事物数量单位的词。",
    [{"rule":"a cup of / a glass of / a bottle of","note":"不可数名词用量词"},
     {"rule":"a piece of / a pair of / a loaf of","note":"常用量词"}],
    [{"en":"I'd like a glass of water.","cn":"我要一杯水。"},{"en":"She bought a pair of shoes.","cn":"她买了一双鞋。"}],
    [{"wrong":"I want two bread.","correct":"I want two pieces of bread.","note":"bread不可数，用量词piece"}],
    ["量词","cup","piece","pair","不可数"],"不可数配量词, a piece of bread正合适")

with open("data/grammar/grammar_knowledge.json","w",encoding="utf-8") as f:
    json.dump(grammar, f, ensure_ascii=False, indent=2)

print(f"✅ 第1批(词性20条)已写入 data/grammar/grammar_knowledge.json")
print(f"   当前条目数: {len(grammar)}")
