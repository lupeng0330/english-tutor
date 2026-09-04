#!/usr/bin/env python3
import json
grammar=[]

def add(id,title,titleEn,cat,lvl,grs,jk,hj,dfn,rules,exs,errs,kws,tips=""):
    grammar.append({"id":id,"title":title,"titleEn":titleEn,"category":cat,"level":lvl,"grades":grs,"relatedUnits":{"jk":jk,"hj":hj},"definition":dfn,"rules":rules,"examples":exs,"commonErrors":errs,"keywords":kws,"tips":tips})

# === I. Parts of Speech 20 ===
add("g001","名词：可数/不可数","Countable & Uncountable Nouns","parts_of_speech","basic",["G3","G4"],["3A_U1","3A_U2"],["7A_U1","7A_U3"],"可数名词有单复数形式；不可数名词没有复数。",[{"rule":"可数复数+s/es","note":"book→books"},{"rule":"不可数用some/much","note":"some water"}],[{"en":"I have an apple.","cn":"我有一个苹果。"},{"en":"There is some water.","cn":"有一些水。"}],[{"wrong":"two waters","correct":"two bottles of water","note":"water不可数"}],["名词","可数","不可数","a/an","复数"],"不可数配量词最合适")

add("g002","名词：复数规则","Plural Nouns","parts_of_speech","basic",["G3","G4"],["3A_U3"],["7A_U1"],"英语名词复数的六条规则。",[{"rule":"一般+s","note":"book→books"},{"rule":"s/x/sh/ch+es","note":"box→boxes"},{"rule":"辅音+y变i+es","note":"baby→babies"},{"rule":"f/fe变v+es","note":"knife→knives"},{"rule":"o有生命+es","note":"tomato→tomatoes"},{"rule":"不规则","note":"child→children"}],[{"en":"Two cats.","cn":"两只猫。"},{"en":"The children.","cn":"孩子们。"}],[{"wrong":"two childs","correct":"two children","note":"child不规则"}],["名词","复数","规则","不规则"],"s/x/sh/ch配es最常见")

add("g003","名词：所有格","Possessive Nouns","parts_of_speech","basic",["G4"],["4A_U2"],["7A_U2"],"用's或of表示所属。",[{"rule":"单数名词+'s","note":"Tom's book"},{"rule":"复数+'","note":"students' books"},{"rule":"无生命of","note":"the door of the room"}],[{"en":"Lily's bag.","cn":"莉莉的包。"},{"en":"The name of the book.","cn":"书名。"}],[{"wrong":"Tom book","correct":"Tom's book","note":"漏了's"}],["名词","所有格","'s","of"],"有生命's, 无生命of")

add("g004","人称代词","Personal Pronouns","parts_of_speech","basic",["G3","G4"],["3A_U2"],["7A_U1"],"主格作主语, 宾格作宾语。",[{"rule":"主格I/you/he/she/it/we/they","note":"作主语"},{"rule":"宾格me/you/him/her/it/us/them","note":"作宾语"}],[{"en":"I like her.","cn":"我喜欢她。"},{"en":"He gives me a pen.","cn":"他给我笔。"}],[{"wrong":"Me like apples.","correct":"I like apples.","note":"主语用I"}],["代词","主格","宾格"],"主语主格宾语宾格")

add("g005","物主代词","Possessive Pronouns","parts_of_speech","basic",["G3","G4"],["3A_U7"],["7A_U1"],"形物代后接名词, 名物代独立用。",[{"rule":"形物代my/your/his/her/its/our/their","note":"后跟名词"},{"rule":"名物代mine/yours/his/hers/ours/theirs","note":"独立使用"}],[{"en":"This is my book.","cn":"我的书。"},{"en":"This book is mine.","cn":"这书是我的。"}],[{"wrong":"mine book","correct":"my book","note":"my跟名词"}],["代词","物主","my","mine"],"形物+名词, 名物独立站")

add("g006","反身代词","Reflexive Pronouns","parts_of_speech","intermediate",["G6"],["6A_U1"],["7B_U4"],"表示某人自己。",[{"rule":"单数-self","note":"myself/yourself/himself/herself/itself"},{"rule":"复数-selves","note":"ourselves/yourselves/themselves"}],[{"en":"I did it myself.","cn":"我自己做的。"},{"en":"Help yourself.","cn":"请自便。"}],[{"wrong":"hisself","correct":"himself","note":"不是hisself"}],["代词","反身","self"],"单self复selves")

add("g007","指示代词","Demonstratives","parts_of_speech","basic",["G3","G4"],["3A_U4"],["7A_U1"],"this/these近指, that/those远指。",[{"rule":"单数this/that","note":"this is"},{"rule":"复数these/those","note":"those are"}],[{"en":"This is a cat.","cn":"这是猫。"},{"en":"Those are dogs.","cn":"那些是狗。"}],[{"wrong":"This are...","correct":"These are...","note":"复数用these"}],["代词","this","that","these"],"近this远that")

add("g008","不定代词","Indefinite Pronouns","parts_of_speech","intermediate",["G5","G6"],["5A_U3"],["7B_U3"],"some/any/no/every复合词。",[{"rule":"some肯定, any否/疑","note":"some apples"},{"rule":"-one人, -thing物","note":"someone, something"}],[{"en":"Someone is here.","cn":"有人。"},{"en":"Anything else?","cn":"还有吗?"}],[{"wrong":"I don't have some.","correct":"I don't have any.","note":"否定用any"}],["代词","不定","some","any"],"some肯定any否")

add("g009","冠词：定冠词 the","Definite Article","parts_of_speech","basic",["G4","G5"],["4A_U1"],["7A_U2"],"特指某人某物。独一、序数、最高、乐器前。",[{"rule":"特指上文","note":"I saw a dog. The dog..."},{"rule":"独一事物","note":"the sun, the moon"},{"rule":"序数/最高/乐器","note":"the first, the best"}],[{"en":"The sun rises.","cn":"太阳升起。"},{"en":"He is the tallest.","cn":"他是最高的。"}],[{"wrong":"Sun is bright.","correct":"The sun...","note":"独一加the"}],["冠词","the","定冠词"],"特指用the")

add("g010","冠词：不定冠词 a/an","Indefinite Article","parts_of_speech","basic",["G3","G4"],["3A_U1"],["7A_U1"],"单数可数名词泛指。",[{"rule":"辅音开头→a","note":"a book, a university"},{"rule":"元音开头→an","note":"an apple, an hour"}],[{"en":"I have a pen.","cn":"我有笔。"},{"en":"An orange.","cn":"一个橙子。"}],[{"wrong":"a apple","correct":"an apple","note":"元音用an"}],["冠词","a","an"],"a辅an元看音标")

add("g011","数词：基数词","Cardinal Numbers","parts_of_speech","basic",["G3","G4"],["3A_U6"],["7A_U2"],"1-100数字表达。",[{"rule":"1-12单独记忆","note":"one→twelve"},{"rule":"13-19加teen","note":"thirteen"},{"rule":"20-90加ty","note":"twenty, forty"}],[{"en":"twenty-five","cn":"25"},{"en":"forty-two","cn":"42"}],[{"wrong":"fourty","correct":"forty","note":"没有u"}],["数词","基数","数字"],"1-12硬记")

add("g012","数词：序数词","Ordinal Numbers","parts_of_speech","basic",["G4","G5"],["4A_U2"],["7A_U2"],"表顺序: first, second...",[{"rule":"基数+th","note":"four→fourth"},{"rule":"特殊:第一二三","note":"first, second, third"}],[{"en":"I am first.","cn":"我第一。"},{"en":"Third floor.","cn":"三楼。"}],[{"wrong":"twoth","correct":"second","note":"二是second"}],["数词","序数","first"],"一二三特殊记")

add("g013","形容词：用法与位置","Adjectives","parts_of_speech","basic",["G4","G5"],["4A_U5"],["7A_U3"],"描述名词。名前或be后。",[{"rule":"名词前","note":"a beautiful flower"},{"rule":"be动词后","note":"The flower is beautiful."}],[{"en":"A smart girl.","cn":"聪明女孩。"},{"en":"The weather is nice.","cn":"天气好。"}],[{"wrong":"a red big apple","correct":"a big red apple","note":"大小先于颜色"}],["形容词","描述","beautiful"],"名前表语后")

add("g014","副词：方式副词","Adverbs of Manner","parts_of_speech","intermediate",["G5","G6"],["5A_U4"],["7B_U5"],"修饰动词, 常ly结尾。",[{"rule":"adj+ly=adv","note":"quick→quickly"},{"rule":"特殊:well, fast, hard","note":"good→well"}],[{"en":"She runs quickly.","cn":"她跑得快。"},{"en":"He speaks well.","cn":"他说得好。"}],[{"wrong":"He runs quick.","correct":"He runs quickly.","note":"动词用副词"}],["副词","ly","quickly"],"动作用副词")

add("g015","副词：频度副词","Adverbs of Frequency","parts_of_speech","basic",["G4","G5"],["4A_U4"],["7A_U4"],"发生频率: always→never。",[{"rule":"always>usually>often>sometimes>never","note":"频率递减"},{"rule":"be/助/情后,实义动词前","note":"He is always late."}],[{"en":"I often swim.","cn":"我经常游泳。"},{"en":"She never eats junk.","cn":"她从不吃垃圾食品。"}],[{"wrong":"I go always.","correct":"I always go.","note":"副词放动词前"}],["副词","always","often","never"],"频度在实义动词前")

add("g016","介词：时间介词","Prepositions of Time","parts_of_speech","basic",["G4","G5"],["4B_U3"],["7A_U4"],"at时刻, on天, in月年。",[{"rule":"at+时刻","note":"at 7:00, at noon"},{"rule":"on+某天","note":"on Monday"},{"rule":"in+月/年/季节","note":"in May, in summer"}],[{"en":"I get up at 7.","cn":"7点起。"},{"en":"We go on weekdays.","cn":"工作日去。"}],[{"wrong":"on 2010","correct":"in 2010","note":"年用in"}],["介词","时间","at","on","in"],"at时刻on天in月年")

add("g017","介词：地点介词","Prepositions of Place","parts_of_speech","basic",["G3","G4"],["3B_U2"],["7A_U3"],"位置关系: in里on上under下。",[{"rule":"in里on上under下","note":"in the box"},{"rule":"behind后between之间next to旁","note":"between A and B"}],[{"en":"The cat is under the chair.","cn":"猫在椅子下。"},{"en":"School next to park.","cn":"学校在公园旁。"}],[{"wrong":"The book is in the desk.","correct":"on the desk","note":"桌面上用on"}],["介词","地点","in","on","under"],"in里on上under下")

add("g018","连词","Conjunctions","parts_of_speech","intermediate",["G5","G6"],["5A_U6"],["7B_U6"],"连接词/短语/句子。",[{"rule":"and/but/or","note":"并列"},{"rule":"because/so","note":"因果不同时"}],[{"en":"I like apples and bananas.","cn":"我喜欢苹果和香蕉。"},{"en":"He was late because he missed the bus.","cn":"迟了因错过车。"}],[{"wrong":"Because ... so ...","correct":"Because ... , ...","note":"because和so不同用"}],["连词","and","but","because"],"because和so不共存")

add("g019","感叹词","Interjections","parts_of_speech","basic",["G3"],["3A_U8"],["7A_U1"],"Oh, Wow, Oops等。",[{"rule":"表达强烈感情","note":"Wow! Oops! Hooray!"}],[{"en":"Wow! Amazing!","cn":"哇! 太棒了!"}],[],["感叹词","oh","wow"],"口语表达最常用")

add("g020","量词","Quantifiers","parts_of_speech","intermediate",["G5"],["5B_U3"],["7A_U5"],"不可数名词用量词。",[{"rule":"a cup/glass/bottle of","note":"液体"},{"rule":"a piece/pair/loaf of","note":"常用"}],[{"en":"A glass of water.","cn":"一杯水。"},{"en":"A pair of shoes.","cn":"一双鞋。"}],[{"wrong":"two bread","correct":"two pieces of bread","note":"bread不可数"}],["量词","cup","piece"],"不可数配量词")

# === II. Tenses 16 ===
add("g021","一般现在时","Simple Present","tenses","basic",["G3","G4","G5"],["3A_U5","4A_U3"],["7A_U2"],"经常性动作或习惯。",[{"rule":"主语+动词原形(s/es)","note":"三单加s"},{"rule":"否定: don't/doesn't+原形","note":"I don't know"},{"rule":"疑问: Do/Does...","note":"Do you like?"}],[{"en":"I go to school every day.","cn":"我每天上学。"},{"en":"She likes apples.","cn":"她喜欢苹果。"}],[{"wrong":"She like apples.","correct":"She likes apples.","note":"三单加s"}],["时态","一般现在时","三单"],"I/You/We/They原形,He/She/It加s")

add("g022","现在进行时","Present Continuous","tenses","basic",["G4","G5"],["4A_U6"],["7A_U5"],"此刻正在进行的动作。",[{"rule":"am/is/are+动词ing","note":"I am reading"},{"rule":"否定: am/is/are+not+ing","note":"He is not sleeping"}],[{"en":"I am reading.","cn":"我正在读书。"},{"en":"They are playing.","cn":"他们在玩。"}],[{"wrong":"He is read.","correct":"He is reading.","note":"进行时加ing"}],["时态","进行时","ing"],"be+doing正进行")

add("g023","一般过去时(规则)","Simple Past Regular","tenses","intermediate",["G5","G6"],["5A_U2"],["7B_U1"],"规则动词加ed。",[{"rule":"一般+ed","note":"play→played"},{"rule":"e结尾+d","note":"live→lived"},{"rule":"辅y变i+ed","note":"study→studied"},{"rule":"重读闭音节双写+ed","note":"stop→stopped"}],[{"en":"I played football.","cn":"我踢了足球。"},{"en":"She studied English.","cn":"她学了英语。"}],[{"wrong":"studyed","correct":"studied","note":"y变i+ed"}],["时态","过去时","ed"],"一般ed, e加d, 辅y变i加ed")

add("g024","一般过去时(不规则)","Simple Past Irregular","tenses","intermediate",["G5","G6"],["5A_U2"],["7B_U1"],"不规则动词过去式。",[{"rule":"常见: go→went, see→saw, eat→ate","note":"需单独记忆"}],[{"en":"I went to the park.","cn":"我去了公园。"},{"en":"She bought a dress.","cn":"她买了裙子。"}],[{"wrong":"I goed.","correct":"I went.","note":"go→went"}],["时态","过去时","不规则"],"不规则需死记")

add("g025","过去进行时","Past Continuous","tenses","advanced",["G8"],["7B_U3"],["8A_U3"],"过去某一时刻正在进行的动作。",[{"rule":"was/were+动词ing","note":"I was reading at 8pm."},{"rule":"while连接","note":"While I was reading..."}],[{"en":"I was watching TV at 7pm.","cn":"7点我在看电视。"}],[{"wrong":"I was watch.","correct":"I was watching.","note":"was后加ing"}],["时态","过去进行","was/were"],"was/were+doing")

add("g026","一般将来时 will","Future will","tenses","intermediate",["G5","G6"],["5B_U1"],["7B_U2"],"will+动词原形。",[{"rule":"主语+will+原形","note":"I will go"},{"rule":"否定won't","note":"He won't come"}],[{"en":"I will visit Beijing.","cn":"我将去北京。"},{"en":"It will rain tomorrow.","cn":"明天会下雨。"}],[{"wrong":"I will to go.","correct":"I will go.","note":"will后原形"}],["时态","将来","will"],"will跟原形")

add("g027","一般将来时 be going to","Future be going to","tenses","intermediate",["G6"],["6A_U1"],["7B_U2"],"be going to+原形, 表打算或预测。",[{"rule":"am/is/are going to+原形","note":"I am going to play"},{"rule":"will临时/going to计划","note":"I will help you. vs I am going to study."}],[{"en":"I am going to study hard.","cn":"我打算努力学习。"}],[{"wrong":"I going to sleep.","correct":"I am going to sleep.","note":"be动词不能丢"}],["时态","be going to","打算"],"be going to表计划")

add("g028","现在完成时(1)","Present Perfect 1","tenses","advanced",["G8"],["8B_U2"],["8B_U2"],"have/has+过去分词。过去对现在的影响。",[{"rule":"have/has+过去分词","note":"I have finished"}],[{"en":"I have finished homework.","cn":"作业已完成。"},{"en":"She has lived here 5 years.","cn":"她住这5年了。"}],[{"wrong":"I have finish.","correct":"I have finished.","note":"have后用过去分词"}],["时态","完成时","have","has"],"have/has+过分词")

add("g029","现在完成时(2): since/for","Present Perfect 2","tenses","advanced",["G8","G9"],["8B_U2"],["8B_U2"],"since+时间点, for+时间段。",[{"rule":"since+过去点","note":"since 2020"},{"rule":"for+一段","note":"for 5 years"}],[{"en":"I have known him since 2018.","cn":"从2018年认识。"},{"en":"I have studied for 6 years.","cn":"学了6年。"}],[{"wrong":"since 5 years","correct":"for 5 years","note":"since接时间点"}],["时态","since","for"],"since点for段")

add("g030","现在完成时(3): already/yet","Present Perfect 3","tenses","advanced",["G9"],["9A_U1"],["9A_U1"],"already(已/肯定), yet(还/否疑)。",[{"rule":"already肯定句","note":"I have already done it."},{"rule":"yet否定/疑问","note":"Have you done it yet?"}],[{"en":"I have already eaten.","cn":"我已吃过。"},{"en":"Have you finished yet?","cn":"做完了吗?"}],[{"wrong":"I have yet done.","correct":"I have already done.","note":"肯定用already"}],["时态","already","yet"],"already肯定yet否疑")

add("g031","过去完成时","Past Perfect","tenses","advanced",["G9"],["9B_U3"],["9B_U3"],"had+过去分词。过去的过去。",[{"rule":"had+过去分词","note":"I had finished before he arrived."}],[{"en":"The movie had started.","cn":"电影已开始。"}],[{"wrong":"I had went.","correct":"I had gone.","note":"had后过分词"}],["时态","过去完成","had"],"had+过分表过去的过去")

add("g032","过去将来时","Past Future","tenses","advanced",["G9"],["9B_U5"],["9B_U5"],"would+原形。从过去看将来。",[{"rule":"would+原形","note":"He said he would come."}],[{"en":"He said he would call.","cn":"他说会来电。"}],[{"wrong":"He said he will.","correct":"He said he would.","note":"主过从过"}],["时态","过去将来","would"],"would跟原形")

add("g033","现在完成进行时","Present Perfect Continuous","tenses","advanced",["G9"],["9B_U6"],["9B_U6"],"have been doing 从过去持续到现在。",[{"rule":"have/has been+doing","note":"I have been waiting."}],[{"en":"I have been studying 3 hours.","cn":"已学3小时。"}],[],["时态","完成进行","been doing"],"have been doing持续中")

add("g034","过去时 vs 完成时","Past vs Perfect","tenses","advanced",["G9"],["9A_U1"],["9A_U1"],"有具体时间用过去, 无时间影响现在用完成。",[{"rule":"过去: 具体时间","note":"yesterday, last week"},{"rule":"完成: 无时间或持续","note":"already, ever, never"}],[{"en":"I went yesterday.","cn":"昨天去了。"},{"en":"I have been there.","cn":"我去过。"}],[{"wrong":"I have gone yesterday.","correct":"I went yesterday.","note":"有具体时间用过去"}],["时态","对比"],"有具体时间=过去时")

add("g035","be动词时态","Be Verb Tenses","tenses","basic",["G3","G4"],["3A_U2"],["7A_U1"],"am/is/are→was/were→will be。",[{"rule":"现在am/is/are","note":"I am, You are"},{"rule":"过去was/were","note":"I was, They were"},{"rule":"将来will be","note":"I will be"}],[{"en":"I am a student.","cn":"我是学生。"},{"en":"They were late.","cn":"他们迟到过。"}],[{"wrong":"They was...","correct":"They were...","note":"复数were"}],["be动词","am","is","are","was"],"am/is/are现在, was/were过去")

add("g036","have/has got","Have Got","tenses","basic",["G3","G4"],["3B_U1"],["7A_U1"],"表示拥有的口语句型。",[{"rule":"I/You/We/They have got","note":"I've got a pen"},{"rule":"He/She/It has got","note":"She's got a cat"}],[{"en":"I have got a bike.","cn":"我有自行车。"}],[{"wrong":"I have get...","correct":"I have got...","note":"have后got"}],["have got","has got","拥有"],"口语表拥有")

with open("data/grammar/grammar_knowledge.json","w",encoding="utf-8") as f:
    json.dump(grammar, f, ensure_ascii=False, indent=2)
print(f"✅ 第1批: 词性20 + 时态16 = {len(grammar)} 条")
