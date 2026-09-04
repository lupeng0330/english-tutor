# 一键生成 jk + hj 补全对话题库
import json

def dc(grade, term, code, title, dialogue, blanks):
    """dialogue: list of {speaker, text} with ___N___ placeholders"""
    return {
        "grade": grade, "term": term, "code": code,
        "title": title, "dialogue": dialogue, "blanks": blanks
    }

# ===== jk 小学 3-6 年级 (40组) =====
jk = []

# G3上: 问候、自我介绍、颜色、数字
jk.append(dc(3,"上","3A_DC01","Meeting a Friend",[
    {"speaker":"A","text":"Hello, ___1___ your name?"},
    {"speaker":"B","text":"___2___ name is Tom. What's your name?"},
    {"speaker":"A","text":"I'm Lily. Nice to ___3___ you."},
    {"speaker":"B","text":"Nice to meet you, ___4___."},
    {"speaker":"A","text":"___5___ you in Class 1?"},
    {"speaker":"B","text":"Yes, I am."}
],[ {"pos":1,"answer":"what","options":["what","how","where","who"]},
    {"pos":2,"answer":"My","options":["My","I","Me","Mine"]},
    {"pos":3,"answer":"meet","options":["meet","see","look","find"]},
    {"pos":4,"answer":"too","options":["too","also","well","nice"]},
    {"pos":5,"answer":"Are","options":["Are","Is","Do","Does"]} ]))

jk.append(dc(3,"上","3A_DC02","At the Classroom",[
    {"speaker":"A","text":"Good morning! What's this?"},
    {"speaker":"B","text":"It's ___1___ English book."},
    {"speaker":"A","text":"___2___ colour is it?"},
    {"speaker":"B","text":"It's blue and ___3___."},
    {"speaker":"A","text":"May I have a ___4___?"},
    {"speaker":"B","text":"Sure. ___5___ you are."}
],[ {"pos":1,"answer":"an","options":["an","a","the","one"]},
    {"pos":2,"answer":"What","options":["What","Which","How","Where"]},
    {"pos":3,"answer":"white","options":["white","green","red","black"]},
    {"pos":4,"answer":"look","options":["look","see","watch","read"]},
    {"pos":5,"answer":"Here","options":["Here","There","This","That"]} ]))

# G3下: 动物、食物、家庭成员
jk.append(dc(3,"下","3B_DC01","At the Zoo",[
    {"speaker":"A","text":"Look! ___1___ many animals!"},
    {"speaker":"B","text":"I can see a big ___2___."},
    {"speaker":"A","text":"___3___ is black and white."},
    {"speaker":"B","text":"That's a ___4___! Do you like pandas?"},
    {"speaker":"A","text":"Yes, I like ___5___ very much."}
],[ {"pos":1,"answer":"So","options":["So","Too","Very","How"]},
    {"pos":2,"answer":"panda","options":["panda","tiger","lion","elephant"]},
    {"pos":3,"answer":"It","options":["It","He","She","They"]},
    {"pos":4,"answer":"panda","options":["panda","bear","cat","dog"]},
    {"pos":5,"answer":"them","options":["them","it","him","her"]} ]))

jk.append(dc(3,"下","3B_DC02","Shopping for Food",[
    {"speaker":"A","text":"Mum, can I ___1___ some ice cream?"},
    {"speaker":"B","text":"First let's ___2___ some fruit."},
    {"speaker":"A","text":"OK. ___3___ many apples do we need?"},
    {"speaker":"B","text":"We need five apples and some ___4___."},
    {"speaker":"A","text":"Can we get some juice, ___5___?"},
    {"speaker":"B","text":"Alright. Let's go to the drinks section."}
],[ {"pos":1,"answer":"have","options":["have","eat","take","get"]},
    {"pos":2,"answer":"buy","options":["buy","eat","make","cook"]},
    {"pos":3,"answer":"How","options":["How","What","Which","Where"]},
    {"pos":4,"answer":"oranges","options":["oranges","bananas","grapes","pears"]},
    {"pos":5,"answer":"too","options":["too","also","please","now"]} ]))

jk.append(dc(3,"下","3B_DC03","My Family",[
    {"speaker":"A","text":"___1___ people are there in your family?"},
    {"speaker":"B","text":"There ___2___ four. My parents, my sister and me."},
    {"speaker":"A","text":"___3___ does your father do?"},
    {"speaker":"B","text":"He is a ___4___. He works in a hospital."},
    {"speaker":"A","text":"That's great! My mother is a teacher. She ___5___ English."}
],[ {"pos":1,"answer":"How many","options":["How many","How much","How old","How long"]},
    {"pos":2,"answer":"are","options":["are","is","am","be"]},
    {"pos":3,"answer":"What","options":["What","Who","How","Where"]},
    {"pos":4,"answer":"doctor","options":["doctor","teacher","driver","farmer"]},
    {"pos":5,"answer":"teaches","options":["teaches","teach","teaching","taught"]} ]))

# G4上: 学校科目、日常作息
jk.append(dc(4,"上","4A_DC01","School Subjects",[
    {"speaker":"A","text":"What's your ___1___ subject?"},
    {"speaker":"B","text":"I like English ___2___. What about you?"},
    {"speaker":"A","text":"___3___ favourite is maths."},
    {"speaker":"B","text":"___4___ do you like maths?"},
    {"speaker":"A","text":"___5___ I think it's interesting."}
],[ {"pos":1,"answer":"favourite","options":["favourite","best","good","nice"]},
    {"pos":2,"answer":"best","options":["best","most","better","well"]},
    {"pos":3,"answer":"My","options":["My","I","Mine","Me"]},
    {"pos":4,"answer":"Why","options":["Why","What","How","When"]},
    {"pos":5,"answer":"Because","options":["Because","So","But","And"]} ]))

jk.append(dc(4,"上","4A_DC02","Daily Routine",[
    {"speaker":"A","text":"What time do you ___1___ up every day?"},
    {"speaker":"B","text":"I usually get up ___2___ 6:30 in the morning."},
    {"speaker":"A","text":"That's early! Do you ___3___ breakfast at home?"},
    {"speaker":"B","text":"Yes. I have milk and bread. Then I go to school ___4___ bus."},
    {"speaker":"A","text":"What do you ___5___ after school?"}
],[ {"pos":1,"answer":"get","options":["get","wake","stand","go"]},
    {"pos":2,"answer":"at","options":["at","on","in","for"]},
    {"pos":3,"answer":"have","options":["have","eat","make","take"]},
    {"pos":4,"answer":"by","options":["by","on","with","in"]},
    {"pos":5,"answer":"do","options":["do","make","play","have"]} ]))

# G4下: 天气、周末活动
jk.append(dc(4,"下","4B_DC01","Weather Talk",[
    {"speaker":"A","text":"What's the ___1___ like today?"},
    {"speaker":"B","text":"It's sunny and ___2___."},
    {"speaker":"A","text":"Great! Let's go to the ___3___."},
    {"speaker":"B","text":"Good idea! ___4___ shall we meet?"},
    {"speaker":"A","text":"Let's meet ___5___ the school gate at 9:00."}
],[ {"pos":1,"answer":"weather","options":["weather","day","sky","wind"]},
    {"pos":2,"answer":"warm","options":["warm","cold","cool","hot"]},
    {"pos":3,"answer":"park","options":["park","zoo","school","library"]},
    {"pos":4,"answer":"Where","options":["Where","When","What","How"]},
    {"pos":5,"answer":"at","options":["at","in","on","by"]} ]))

jk.append(dc(4,"下","4B_DC02","Weekend Plans",[
    {"speaker":"A","text":"What are you going to ___1___ this weekend?"},
    {"speaker":"B","text":"I ___2___ going to visit my grandparents."},
    {"speaker":"A","text":"That sounds ___3___! Where do they live?"},
    {"speaker":"B","text":"They live in the ___4___."},
    {"speaker":"A","text":"How ___5___ does it take to get there?"}
],[ {"pos":1,"answer":"do","options":["do","make","go","play"]},
    {"pos":2,"answer":"am","options":["am","is","are","be"]},
    {"pos":3,"answer":"nice","options":["nice","good","well","fine"]},
    {"pos":4,"answer":"countryside","options":["countryside","city","town","village"]},
    {"pos":5,"answer":"long","options":["long","far","much","many"]} ]))

# G5上: 爱好、能力
jk.append(dc(5,"上","5A_DC01","Hobbies",[
    {"speaker":"A","text":"Do you have any ___1___?"},
    {"speaker":"B","text":"Yes, I like ___2___ basketball."},
    {"speaker":"A","text":"How ___3___ do you play?"},
    {"speaker":"B","text":"I play three times a ___4___."},
    {"speaker":"A","text":"Can I ___5___ you next time?"}
],[ {"pos":1,"answer":"hobbies","options":["hobbies","hobby","friends","pets"]},
    {"pos":2,"answer":"playing","options":["playing","play","plays","to play"]},
    {"pos":3,"answer":"often","options":["often","long","many","far"]},
    {"pos":4,"answer":"week","options":["week","day","month","year"]},
    {"pos":5,"answer":"join","options":["join","play","watch","help"]} ]))

jk.append(dc(5,"上","5A_DC02","At the Library",[
    {"speaker":"A","text":"Excuse me, where can I ___1___ story books?"},
    {"speaker":"B","text":"You can find them on the second ___2___."},
    {"speaker":"A","text":"How many books can I ___3___ at a time?"},
    {"speaker":"B","text":"You can borrow ___4___ to five books."},
    {"speaker":"A","text":"___5___ long can I keep them?"}
],[ {"pos":1,"answer":"find","options":["find","look","see","read"]},
    {"pos":2,"answer":"floor","options":["floor","room","shelf","desk"]},
    {"pos":3,"answer":"borrow","options":["borrow","lend","take","bring"]},
    {"pos":4,"answer":"up","options":["up","down","in","out"]},
    {"pos":5,"answer":"How","options":["How","What","Which","Where"]} ]))

# G5下: 旅游、节日
jk.append(dc(5,"下","5B_DC01","Planning a Trip",[
    {"speaker":"A","text":"Where are you going for the ___1___ holiday?"},
    {"speaker":"B","text":"We are going to ___2___ Beijing."},
    {"speaker":"A","text":"That's ___3___! How will you get there?"},
    {"speaker":"B","text":"___4___ plane. It's much faster."},
    {"speaker":"A","text":"I hope you have a ___5___ time!"}
],[ {"pos":1,"answer":"summer","options":["summer","winter","spring","autumn"]},
    {"pos":2,"answer":"visit","options":["visit","go","travel","come"]},
    {"pos":3,"answer":"exciting","options":["exciting","excited","boring","sad"]},
    {"pos":4,"answer":"By","options":["By","On","With","In"]},
    {"pos":5,"answer":"great","options":["great","good","nice","wonderful"]} ]))

jk.append(dc(5,"下","5B_DC02","Festivals",[
    {"speaker":"A","text":"What's your ___1___ festival?"},
    {"speaker":"B","text":"___2___ favourite is the Spring Festival."},
    {"speaker":"A","text":"What do you usually ___3___?"},
    {"speaker":"B","text":"We have a big ___4___ and set off fireworks."},
    {"speaker":"A","text":"Sounds fun! Do you get ___5___ money?"}
],[ {"pos":1,"answer":"favourite","options":["favourite","best","like","nice"]},
    {"pos":2,"answer":"My","options":["My","Mine","I","Me"]},
    {"pos":3,"answer":"do","options":["do","make","eat","play"]},
    {"pos":4,"answer":"dinner","options":["dinner","lunch","breakfast","party"]},
    {"pos":5,"answer":"lucky","options":["lucky","red","good","pocket"]} ]))

# G6上: 名人、城市
for g,t in [(6,"上"),(6,"上")]:
    jk.append(dc(6,"上","6A_DC01","Talking about Heroes",[
        {"speaker":"A","text":"Who is your ___1___?"},
        {"speaker":"B","text":"I ___2___ Dr Sun Yatsen very much."},
        {"speaker":"A","text":"Why do you ___3___ him?"},
        {"speaker":"B","text":"___4___ he was a great leader. He loved his ___5___."},
        {"speaker":"A","text":"Yes, he was a very important person in Chinese history."}
    ],[ {"pos":1,"answer":"hero","options":["hero","teacher","friend","father"]},
        {"pos":2,"answer":"admire","options":["admire","like","love","respect"]},
        {"pos":3,"answer":"admire","options":["admire","like","know","see"]},
        {"pos":4,"answer":"Because","options":["Because","So","But","And"]},
        {"pos":5,"answer":"country","options":["country","city","family","school"]} ]))
# 仅加一条G6上
jk=jk[:-1]

jk.append(dc(6,"上","6A_DC02","In the City",[
    {"speaker":"A","text":"Can you tell me the ___1___ to the museum?"},
    {"speaker":"B","text":"Sure. Go straight and turn ___2___ at the second crossing."},
    {"speaker":"A","text":"Is it ___3___ from here?"},
    {"speaker":"B","text":"No, it's ___4___ about ten minutes' walk."},
    {"speaker":"A","text":"Thank you very ___5___!"}
],[ {"pos":1,"answer":"way","options":["way","road","street","path"]},
    {"pos":2,"answer":"left","options":["left","right","back","around"]},
    {"pos":3,"answer":"far","options":["far","near","long","close"]},
    {"pos":4,"answer":"only","options":["only","about","around","nearly"]},
    {"pos":5,"answer":"much","options":["much","many","well","kind"]} ]))

# G6下: 礼貌、毕业
jk.append(dc(6,"下","6B_DC01","Being Polite",[
    {"speaker":"A","text":"Could you ___1___ me your pen, please?"},
    {"speaker":"B","text":"Of ___2___. Here you are."},
    {"speaker":"A","text":"Thanks. I'll ___3___ it back soon."},
    {"speaker":"B","text":"No ___4___. Take your time."},
    {"speaker":"A","text":"You are so ___5___!"}
],[ {"pos":1,"answer":"lend","options":["lend","borrow","give","pass"]},
    {"pos":2,"answer":"course","options":["course","sure","cause","kind"]},
    {"pos":3,"answer":"give","options":["give","take","bring","send"]},
    {"pos":4,"answer":"hurry","options":["hurry","problem","worry","rush"]},
    {"pos":5,"answer":"kind","options":["kind","nice","good","sweet"]} ]))

jk.append(dc(6,"下","6B_DC02","Saying Goodbye",[
    {"speaker":"A","text":"We are ___1___ to middle school soon."},
    {"speaker":"B","text":"I know. I will ___2___ everyone here."},
    {"speaker":"A","text":"Me too. Let's ___3___ in touch."},
    {"speaker":"B","text":"Good ___4___. Let's write emails to each other."},
    {"speaker":"A","text":"I wish you all the ___5___ in the future!"}
],[ {"pos":1,"answer":"going","options":["going","moving","leaving","coming"]},
    {"pos":2,"answer":"miss","options":["miss","remember","forget","leave"]},
    {"pos":3,"answer":"keep","options":["keep","stay","be","get"]},
    {"pos":4,"answer":"idea","options":["idea","plan","way","luck"]},
    {"pos":5,"answer":"best","options":["best","good","better","luck"]} ]))

with open("data/questions/jk_dialog_complete.json","w",encoding="utf-8") as f:
    json.dump(jk,f,ensure_ascii=False,indent=2)
print(f"✅ jk: {len(jk)} 组补全对话")

# ===== hj 初中 7-9 年级 (20+组) =====
hj = []
hj.append(dc(7,"上","7A_DC01","First Day at School",[
    {"speaker":"A","text":"Hi! I'm new here. My ___1___ is David."},
    {"speaker":"B","text":"Nice to meet you, David. I'm Amy. Where are you ___2___?"},
    {"speaker":"A","text":"I'm from Shanghai. My family ___3___ here last month."},
    {"speaker":"B","text":"Welcome to Guangzhou! Do you like it ___4___?"},
    {"speaker":"A","text":"Yes, I do. People here are very ___5___."}
],[ {"pos":1,"answer":"name","options":["name","friend","school","class"]},
    {"pos":2,"answer":"from","options":["from","come","going","live"]},
    {"pos":3,"answer":"moved","options":["moved","came","went","arrived"]},
    {"pos":4,"answer":"here","options":["here","there","well","now"]},
    {"pos":5,"answer":"friendly","options":["friendly","kind","nice","good"]} ]))

hj.append(dc(7,"上","7A_DC02","Daily Life",[
    {"speaker":"A","text":"How do you usually get to ___1___?"},
    {"speaker":"B","text":"I ___2___ the bus. It takes about twenty minutes."},
    {"speaker":"A","text":"That's not bad. I ___3___ to school every day."},
    {"speaker":"B","text":"Really? How long does it ___4___ you?"},
    {"speaker":"A","text":"About fifteen ___5___. It's good exercise."}
],[ {"pos":1,"answer":"school","options":["school","home","work","there"]},
    {"pos":2,"answer":"take","options":["take","ride","drive","by"]},
    {"pos":3,"answer":"walk","options":["walk","run","go","ride"]},
    {"pos":4,"answer":"take","options":["take","spend","cost","need"]},
    {"pos":5,"answer":"minutes","options":["minutes","hours","seconds","days"]} ]))

hj.append(dc(7,"下","7B_DC01","At the Restaurant",[
    {"speaker":"A","text":"Are you ready to ___1___?"},
    {"speaker":"B","text":"Yes. I'd ___2___ some noodles, please."},
    {"speaker":"A","text":"Anything to ___3___?"},
    {"speaker":"B","text":"A glass of orange juice, please. How ___4___ is it?"},
    {"speaker":"A","text":"That'll be 25 yuan in ___5___."}
],[ {"pos":1,"answer":"order","options":["order","eat","have","drink"]},
    {"pos":2,"answer":"like","options":["like","want","have","order"]},
    {"pos":3,"answer":"drink","options":["drink","eat","have","take"]},
    {"pos":4,"answer":"much","options":["much","many","about","long"]},
    {"pos":5,"answer":"total","options":["total","all","together","cash"]} ]))

hj.append(dc(7,"下","7B_DC02","Weekend Activities",[
    {"speaker":"A","text":"What ___1___ you do last weekend?"},
    {"speaker":"B","text":"I ___2___ to a concert with my friends."},
    {"speaker":"A","text":"That sounds ___3___! What kind of music?"},
    {"speaker":"B","text":"Pop music. We danced and sang ___4___."},
    {"speaker":"A","text":"I should ___5___ to concerts more often."}
],[ {"pos":1,"answer":"did","options":["did","do","were","are"]},
    {"pos":2,"answer":"went","options":["went","go","goed","was"]},
    {"pos":3,"answer":"fun","options":["fun","great","nice","well"]},
    {"pos":4,"answer":"along","options":["along","together","too","also"]},
    {"pos":5,"answer":"go","options":["go","come","listen","join"]} ]))

hj.append(dc(8,"上","8A_DC01","Making Plans",[
    {"speaker":"A","text":"Have you ___1___ your summer holiday?"},
    {"speaker":"B","text":"Not ___2___. I'm thinking about going to Yunnan."},
    {"speaker":"A","text":"I've ___3___ there before. It's beautiful!"},
    {"speaker":"B","text":"Can you give me some ___4___?"},
    {"speaker":"A","text":"Sure. You should ___5___ Lijiang and Dali."}
],[ {"pos":1,"answer":"planned","options":["planned","made","thought","decided"]},
    {"pos":2,"answer":"yet","options":["yet","already","still","either"]},
    {"pos":3,"answer":"been","options":["been","gone","went","came"]},
    {"pos":4,"answer":"advice","options":["advice","help","ideas","tips"]},
    {"pos":5,"answer":"visit","options":["visit","go","see","travel"]} ]))

hj.append(dc(8,"下","8B_DC01","Health Advice",[
    {"speaker":"A","text":"You don't look well. What's the ___1___?"},
    {"speaker":"B","text":"I have a bad headache. I ___2___ I'm getting a cold."},
    {"speaker":"A","text":"You should ___3___ plenty of water and get some rest."},
    {"speaker":"B","text":"I've ___4___ taken some medicine."},
    {"speaker":"A","text":"If you don't feel better, you had ___5___ see a doctor."}
],[ {"pos":1,"answer":"matter","options":["matter","problem","wrong","ill"]},
    {"pos":2,"answer":"think","options":["think","feel","guess","know"]},
    {"pos":3,"answer":"drink","options":["drink","eat","take","have"]},
    {"pos":4,"answer":"already","options":["already","yet","just","ever"]},
    {"pos":5,"answer":"better","options":["better","should","must","need"]} ]))

hj.append(dc(9,"上","9A_DC01","Future Plans",[
    {"speaker":"A","text":"What are you going to do after ___1___?"},
    {"speaker":"B","text":"I plan to go to a senior high school that has a strong science ___2___."},
    {"speaker":"A","text":"Sounds like you have a clear ___3___."},
    {"speaker":"B","text":"I want to become a scientist like Deng Jiaxian in the ___4___."},
    {"speaker":"A","text":"That's a great dream! I'm ___5___ you can make it."}
],[ {"pos":1,"answer":"graduation","options":["graduation","school","class","study"]},
    {"pos":2,"answer":"program","options":["program","class","team","group"]},
    {"pos":3,"answer":"goal","options":["goal","idea","plan","dream"]},
    {"pos":4,"answer":"future","options":["future","end","past","present"]},
    {"pos":5,"answer":"sure","options":["sure","certain","believe","think"]} ]))

hj.append(dc(9,"下","9B_DC01","Environmental Protection",[
    {"speaker":"A","text":"Have you noticed how much the weather has ___1___?"},
    {"speaker":"B","text":"Yes, it's getting ___2___ every year. We must do something."},
    {"speaker":"A","text":"I agree. We should reduce our ___3___ footprint."},
    {"speaker":"B","text":"Starting from small things, like using ___4___ bags instead of plastic ones."},
    {"speaker":"A","text":"And everyone can ___5___ a difference."}
],[ {"pos":1,"answer":"changed","options":["changed","turned","become","got"]},
    {"pos":2,"answer":"warmer","options":["warmer","colder","better","worse"]},
    {"pos":3,"answer":"carbon","options":["carbon","water","air","earth"]},
    {"pos":4,"answer":"reusable","options":["reusable","paper","cloth","shopping"]},
    {"pos":5,"answer":"make","options":["make","do","take","have"]} ]))

with open("data/questions/hj_dialog_complete.json","w",encoding="utf-8") as f:
    json.dump(hj,f,ensure_ascii=False,indent=2)
print(f"✅ hj: {len(hj)} 组补全对话")
print(f"总计: {len(jk)+len(hj)} 组")
