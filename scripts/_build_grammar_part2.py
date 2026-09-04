#!/usr/bin/env python3
import json
with open("data/grammar/grammar_knowledge.json","r",encoding="utf-8") as f:
    grammar=json.load(f)

def add(*args):
    grammar.append({"id":args[0],"title":args[1],"titleEn":args[2],"category":args[3],"level":args[4],"grades":args[5],"relatedUnits":{"jk":args[6],"hj":args[7]},"definition":args[8],"rules":args[9],"examples":args[10],"commonErrors":args[11],"keywords":args[12],"tips":args[13] if len(args)>13 else ""})

# === III. Verb Forms 10 ===
add("g037","情态动词 can/can't","Modal Can","verb_forms","basic",["G3","G4"],["3A_U6","4A_U6"],["7A_U5"],"can+原形。表能力/许可。",[{"rule":"can+原形","note":"I can swim."},{"rule":"can't=不能","note":"He can't fly."}],[{"en":"I can swim.","cn":"我会游泳。"},{"en":"Can you help me?","cn":"能帮我吗?"}],[{"wrong":"I can to swim.","correct":"I can swim.","note":"can后原形"}],["情态动词","can","can't","能力"],"can后跟原形")

add("g038","情态动词 must/have to","Modal Must","verb_forms","intermediate",["G5","G6"],["5A_U7"],["7B_U4"],"must主观(必须), have to客观(不得不)。",[{"rule":"must+原形","note":"I must go now."},{"rule":"don't have to=不必","note":"You don't have to come."}],[{"en":"I must finish this.","cn":"我必须完成。"},{"en":"I have to get up early.","cn":"不得不早起。"}],[{"wrong":"I must to go.","correct":"I must go.","note":"must后原形"}],["情态动词","must","have to"],"must主观, have to客观")

add("g039","情态动词 should","Modal Should","verb_forms","intermediate",["G6"],["6B_U7"],["7B_U7"],"should+原形 表建议/应该。",[{"rule":"should/shouldn't+原形","note":"You should sleep."}],[{"en":"You should drink water.","cn":"你该多喝水。"},{"en":"You shouldn't smoke.","cn":"不该抽烟。"}],[],["情态动词","should","建议"],"should建议, 人人平等")

add("g040","情态动词 may/might","Modal May","verb_forms","intermediate",["G6"],["6A_U4"],["8A_U1"],"may表许可/可能, might更不确定。",[{"rule":"may+原形","note":"May I come in?"}],[{"en":"May I use your pen?","cn":"能用你的笔吗?"},{"en":"It might rain.","cn":"可能要下雨。"}],[],["情态动词","may","might"],"May I... 问许可, might表可能")

add("g041","情态动词 would/could","Modal Would","verb_forms","advanced",["G8"],["8A_U4"],["8A_U4"],"would委婉请求, could礼貌询问。",[{"rule":"Would you like...","note":"委婉"},{"rule":"Could you please...","note":"礼貌"}],[{"en":"Would you like some tea?","cn":"要来点茶吗?"},{"en":"Could you help me?","cn":"能帮我吗?"}],[],["情态动词","would","could","委婉"],"would/could更礼貌")

add("g042","情态动词 need/dare","Modal Need","verb_forms","advanced",["G9"],["9A_U3"],["9A_U3"],"need可作情态/实义动词。",[{"rule":"need+原形(情态)","note":"You need not go."},{"rule":"need to do(实义)","note":"You need to go."},{"rule":"dare+原形","note":"How dare you!"}],[{"en":"You needn't worry.","cn":"不必担心。"}],[],["情态动词","need","dare"],"need情态原形, 实义to")

add("g043","不定式 to do","Infinitive","verb_forms","advanced",["G8"],["8A_U5"],["8A_U5"],"to+原形作目的状语或宾语。",[{"rule":"目的状语","note":"I go to school to study."},{"rule":"作宾语","note":"I want to go."}],[{"en":"I came to see you.","cn":"我来见你。"},{"en":"He wants to be a doctor.","cn":"他想当医生。"}],[{"wrong":"I want go.","correct":"I want to go.","note":"want后接to do"}],["不定式","to","目的"],"want/hope/decide+to do")

add("g044","动名词 doing","Gerund","verb_forms","advanced",["G8"],["8B_U4"],["8B_U4"],"动词ing作名词用。",[{"rule":"作主语","note":"Swimming is fun."},{"rule":"作宾语","note":"I enjoy swimming."}],[{"en":"Running is good for health.","cn":"跑步有益健康。"},{"en":"I like reading.","cn":"我喜欢阅读。"}],[],["动名词","doing","ing"],"动词ing当名词")

add("g045","使役动词","Causative Verbs","verb_forms","advanced",["G9"],["9A_U4"],["9A_U4"],"make/let/have+宾+原形。",[{"rule":"make sb do","note":"He made me laugh."},{"rule":"let sb do","note":"Let me help you."},{"rule":"have sb do","note":"I had him fix it."}],[{"en":"The joke made me laugh.","cn":"笑话让我笑了。"},{"en":"Let me try.","cn":"让我试试。"}],[{"wrong":"He made me to laugh.","correct":"He made me laugh.","note":"make后原形"}],["使役","make","let"],"make/let/have+sb+原形")

add("g046","感官动词","Sensory Verbs","verb_forms","advanced",["G9"],["9B_U2"],["9B_U2"],"see/hear/watch+宾+do/doing。",[{"rule":"see sb do(全过程)","note":"I saw him cross the road."},{"rule":"see sb doing(正在)","note":"I saw him crossing the road."}],[{"en":"I heard her sing.","cn":"我听她唱歌了。"},{"en":"I saw him running.","cn":"我看见他在跑。"}],[],["感官","see","hear","watch"],"do全过程, doing正在进行")

# === IV. Sentence 15 ===
add("g047","陈述句","Statement","sentence","basic",["G3"],["3A_U1"],["7A_U1"],"肯定句:主语+谓语。否定句:主语+don't/doesn't/didn't+谓语。",[{"rule":"肯定: S+V","note":"I am a student."},{"rule":"否定: S+助动词not+V","note":"I don't like it."}],[{"en":"I am happy.","cn":"我开心。"},{"en":"I don't like snakes.","cn":"我不喜欢蛇。"}],[],["句子","陈述","肯定","否定"],"肯定正常说, 否定加not")

add("g048","一般疑问句","Yes/No Questions","sentence","basic",["G3","G4"],["3A_U4"],["7A_U2"],"将be/助/情态动词提前。Yes/No回答。",[{"rule":"be提前","note":"Are you a student?"},{"rule":"do/does/did提前","note":"Do you like apples?"}],[{"en":"Are you OK? Yes, I am.","cn":"你好吗?"},{"en":"Do you like music? No, I don't.","cn":"喜欢音乐吗?"}],[{"wrong":"You are happy?","correct":"Are you happy?","note":"主语和be交换"}],["句子","疑问","一般疑问"],"be/助/情提前, Yes/No来答")

add("g049","特殊疑问句","Wh-Questions","sentence","basic",["G4","G5"],["4A_U1"],["7A_U2"],"What, Who, Where, When, Why, How提问。",[{"rule":"Wh词+一般疑问句","note":"What do you like?"}],[{"en":"What is your name?","cn":"你叫什么?"},{"en":"Where do you live?","cn":"你住哪?"}],[{"wrong":"What you like?","correct":"What do you like?","note":"Wh后+疑问语序"}],["句子","疑问","Wh","What"],"Wh疑问词打头阵")

add("g050","选择疑问句","Or-Questions","sentence","intermediate",["G5"],["5A_U5"],["7B_U3"],"用or连接两个选项。",[{"rule":"... A or B?","note":"Do you like tea or coffee?"}],[{"en":"Is he tall or short?","cn":"他高还是矮?"},{"en":"Tea or coffee?","cn":"茶还是咖啡?"}],[],["句子","选择","or"],"or表选择")

add("g051","反意疑问句","Tag Questions","sentence","advanced",["G8"],["8B_U5"],["8B_U5"],"前肯后否, 前否后肯。",[{"rule":"肯+否: It's nice, isn't it?","note":""},{"rule":"否+肯: You don't like it, do you?","note":""}],[{"en":"It's a nice day, isn't it?","cn":"好天, 不是吗?"},{"en":"You can swim, can't you?","cn":"会游泳, 对吧?"}],[{"wrong":"You are a student, isn't you?","correct":"You are a student, aren't you?","note":"代词和助动词要对"}],["句子","反意疑问","tag"],"前肯后否, 代词对应")

add("g052","祈使句","Imperative","sentence","basic",["G3","G4"],["3B_U7"],["7A_U3"],"动词原形开头, 无主语。否定: Don't+原形。",[{"rule":"肯定: 动词原形","note":"Open the door."},{"rule":"否定: Don't+原形","note":"Don't run."},{"rule":"Let's+原形","note":"Let's go!"}],[{"en":"Sit down, please.","cn":"请坐。"},{"en":"Don't be late.","cn":"别迟到。"}],[],["句子","祈使","Don't","Let's"],"原形开头下命令, Don't否定拦路")

add("g053","感叹句 What/How","Exclamatory","sentence","intermediate",["G6"],["6A_U8"],["8A_U2"],"What(+a/an)+名词! How+形容词/副词!",[{"rule":"What a nice day!","note":"What+(a/an)+名"},{"rule":"How beautiful!","note":"How+形/副"}],[{"en":"What a beautiful flower!","cn":"多美的花!"},{"en":"How fast he runs!","cn":"他跑得好快!"}],[{"wrong":"How a nice day!","correct":"What a nice day!","note":"有名词用What"}],["句子","感叹","What","How"],"What接名How接形, 感叹句中有区别")

add("g054","There be 句型(1)","There Be 1","sentence","basic",["G3","G4"],["3B_U2"],["7A_U3"],"There is/are+物+地点。存在有。",[{"rule":"There is+单数/不可数","note":"There is a book."},{"rule":"There are+复数","note":"There are two books."}],[{"en":"There is a cat on the chair.","cn":"椅子上有只猫。"},{"en":"There are many students.","cn":"有很多学生。"}],[{"wrong":"There have a book.","correct":"There is a book.","note":"不是have"}],["There be","存在"],"There is/are表存在")

add("g055","There be 句型(2)","There Be 2","sentence","intermediate",["G5","G6"],["5A_U1"],["7B_U4"],"There be的过去时和将来时。",[{"rule":"过去: There was/were","note":"There was a party."},{"rule":"将来: There will be","note":"There will be a show."}],[{"en":"There was a storm yesterday.","cn":"昨天有暴风雨。"},{"en":"There will be a test.","cn":"将有一次测验。"}],[],["There be","过去","将来"],"过去was/were, 将来will be")

add("g056","主谓一致(1)","Subject-Verb 1","sentence","basic",["G4","G5"],["4A_U3"],["7A_U3"],"主语和谓语在人称和数上一致。",[{"rule":"单数主语+单数谓语","note":"He is/He likes"},{"rule":"复数主语+复数谓语","note":"They are/They like"}],[{"en":"He likes apples.","cn":"他喜欢苹果。"},{"en":"They like apples.","cn":"他们喜欢苹果。"}],[{"wrong":"He like apples.","correct":"He likes apples.","note":"三单忘加s"}],["主谓一致","三单"],"I/You/We/They原形, He/She/It加s")

add("g057","主谓一致(2)","Subject-Verb 2","sentence","intermediate",["G6"],["6A_U3"],["8A_U5"],"特殊主语的主谓一致。",[{"rule":"Everyone/Someone+单数","note":"Everyone is here."},{"rule":"Neither/Either...or+就近","note":"Neither he nor I am..."},{"rule":"A number of+复数","note":"A number of students are..."}],[{"en":"Everyone is here.","cn":"所有人都在。"},{"en":"Either you or he is wrong.","cn":"你或他有一个错了。"}],[],["主谓一致","特殊"],"Everyone单数, 就近原则记")

add("g058","倒装句","Inversion","sentence","advanced",["G9"],["9A_U5"],["9A_U5"],"so/neither/nor放句首倒装。",[{"rule":"So+助/be/情+主","note":"So do I."},{"rule":"Neither/Nor+助/be/情+主","note":"Neither can I."}],[{"en":"I like music. So does she.","cn":"我喜欢音乐, 她也一样。"},{"en":"I can't swim. Neither can he.","cn":"我不会游, 他也不会。"}],[],["倒装","so","neither"],"So/Neither+助动+主, 倒装呼应")

add("g059","强调句","Emphatic","sentence","advanced",["G9"],["9B_U4"],["9B_U4"],"It is/was...that/who...强调结构。",[{"rule":"It is/was+被强调部分+that/who...","note":"It was Tom who broke it."}],[{"en":"It was yesterday that I met him.","cn":"是昨天我遇见他的。"},{"en":"It is she who helps me.","cn":"是她帮我。"}],[],["强调","It is that"],"It is...that/who框架")

add("g060","并列句","Compound Sentence","sentence","intermediate",["G5","G6"],["5A_U6"],["8A_U3"],"两个简单句用并列连词连接。",[{"rule":"and/but/or/so连接","note":"I like apples, and she likes bananas."}],[{"en":"I was tired, so I went to bed.","cn":"我累了, 所以睡了。"},{"en":"I called, but nobody answered.","cn":"我打了, 但没人接。"}],[],["句子","并列","and","but","so"],"连词连句表关系")

add("g061","复合句概述","Complex Sentence","sentence","advanced",["G8"],["8A_U6"],["8A_U6"],"主句+从句。从句有主语+谓语。",[{"rule":"主句+连词+从句","note":"I know that he is right."}],[{"en":"I think that she is smart.","cn":"我觉得她很聪明。"},{"en":"When it rains, I stay home.","cn":"下雨时我待在家。"}],[],["复合句","从句"],"主句统领, 从句补充")

# === V. Clauses 8 ===
add("g062","宾语从句(1): that","Object Clause 1","clauses","advanced",["G8"],["8B_U6"],["8B_U6"],"that引导, that可省略。",[{"rule":"主+动+that+从句","note":"I think (that) he is right."}],[{"en":"I know (that) you are honest.","cn":"我知道你诚实。"},{"en":"She said that she was tired.","cn":"她说她累了。"}],[],["从句","宾语","that"],"that可省略, 从句正常语序")

add("g063","宾语从句(2): if/whether","Object Clause 2","clauses","advanced",["G9"],["9A_U2"],["9A_U2"],"if/whether表是否。",[{"rule":"I wonder if/whether...","note":"I wonder if he will come."}],[{"en":"I don't know if she likes it.","cn":"我不知道她是否喜欢。"},{"en":"He asked whether I could swim.","cn":"他问我是否会游泳。"}],[{"wrong":"I don't know that if he comes.","correct":"I don't know if he comes.","note":"不要that+if"}],["从句","宾语","if","whether"],"if/whether表是否")

add("g064","宾语从句(3): wh-词","Object Clause 3","clauses","advanced",["G9"],["9A_U2"],["9A_U2"],"what/where/when/why/how引导。",[{"rule":"疑问词+主+谓(陈述语序)","note":"I know what you want."}],[{"en":"Tell me what you did.","cn":"告诉我你做了什么。"},{"en":"I wonder where he lives.","cn":"我想知道他住哪。"}],[{"wrong":"I know what do you want.","correct":"I know what you want.","note":"从句陈述语序"}],["从句","宾语","wh-","语序"],"从句语序: 疑问词+主+谓")

add("g065","定语从句(1): 关系代词","Relative Clause 1","clauses","advanced",["G9"],["9A_U6"],["9A_U6"],"who(人)/which(物)/that(通用)。",[{"rule":"who指人","note":"The man who is talking..."},{"rule":"which指物","note":"The book which I bought..."},{"rule":"that通用","note":"The car that is red..."}],[{"en":"The girl who is singing is my sister.","cn":"唱歌的女孩是我妹妹。"},{"en":"The book which I read was great.","cn":"我读的书很棒。"}],[],["从句","定语","who","which","that"],"who人which物that通用")

add("g066","定语从句(2): 关系副词","Relative Clause 2","clauses","advanced",["G9"],["9B_U1"],["9B_U1"],"when(时间)/where(地点)/why(原因)。",[{"rule":"when=in/on which","note":"the day when we met"},{"rule":"where=in/at which","note":"the place where I was born"}],[{"en":"I remember the day when we first met.","cn":"我记得我们初见的那天。"},{"en":"This is the school where I studied.","cn":"这是我上过的学校。"}],[],["从句","定语","when","where","why"],"when时间where地点why原因")

add("g067","状语从句: 时间","Adverbial: Time","clauses","advanced",["G8"],["8A_U6"],["8A_U6"],"when/while/as/before/after/until。",[{"rule":"when某刻/while持续","note":"When I arrived... / While I was..."},{"rule":"until直到","note":"I will wait until you come."}],[{"en":"When it rains, I stay home.","cn":"下雨时我待在家。"},{"en":"I studied before the exam.","cn":"考前我学习了。"}],[],["从句","状语","when","while","until"],"时间状语: 动作的钟表")

add("g068","状语从句: 条件","Adverbial: Condition","clauses","advanced",["G8"],["8B_U3"],["8B_U3"],"if(如果)/unless(除非)。主将从现!",[{"rule":"if+一般现在, 主句will","note":"If it rains, I will stay."},{"rule":"unless=if not","note":"Unless you hurry, you will be late."}],[{"en":"If you study hard, you will pass.","cn":"努力学就会过。"},{"en":"Unless it rains, we will go.","cn":"除非下雨, 我们会去。"}],[{"wrong":"If it will rain, I will stay.","correct":"If it rains, I will stay.","note":"条件从句用现在时"}],["从句","状语","条件","if","unless"],"主将从现: if后用现在时")

add("g069","状语从句: 原因/目的/结果","Adverbial: Others","clauses","advanced",["G9"],["9B_U7"],["9B_U7"],"because原因, so that目的, so...that结果。",[{"rule":"because+原因","note":"because it rained"},{"rule":"so that+目的","note":"so that I can pass"},{"rule":"so...that结果","note":"so tired that I fell asleep"}],[{"en":"I stayed home because it rained.","cn":"因为下雨我待在家。"},{"en":"He is so tired that he can't walk.","cn":"太累了走不动。"}],[],["从句","状语","because","so that"],"because原因so that目的")

# === VI. Voice 4 ===
add("g070","被动语态(1): 一般现在/过去","Passive Voice 1","voice","advanced",["G8"],["8B_U7"],["8B_U7"],"be+过去分词。主语是动作承受者。",[{"rule":"一般现在: am/is/are+过分","note":"The book is read by many."},{"rule":"一般过去: was/were+过分","note":"The book was read."}],[{"en":"The classroom is cleaned every day.","cn":"教室每天被清扫。"},{"en":"The letter was written by Tom.","cn":"信是Tom写的。"}],[],["语态","被动","be+过分"],"被动: be+过分, by引出施动者")

add("g071","被动语态(2): 含情态动词","Passive Voice 2","voice","advanced",["G9"],["9A_U7"],["9A_U7"],"情态动词+be+过去分词。",[{"rule":"can/must/should+be+过分","note":"The work must be done."}],[{"en":"The work should be finished today.","cn":"工作该今天完成。"},{"en":"Books can be borrowed.","cn":"书可以被借。"}],[],["语态","被动","情态"],"情动+be+过分")

add("g072","被动语态(3): 完成/将来","Passive Voice 3","voice","advanced",["G9"],["9B_U8"],["9B_U8"],"不同时态的被动语态。",[{"rule":"现在完成: have/has been done","note":"The work has been done."},{"rule":"将来: will be done","note":"The work will be done."}],[{"en":"The homework has been finished.","cn":"作业已被完成。"},{"en":"The meeting will be held tomorrow.","cn":"会议将于明天举行。"}],[],["语态","被动","完成","将来"],"时态变在前, 被动结构跟在后")

add("g073","主动 vs 被动","Active vs Passive","voice","advanced",["G8"],["8B_U7"],["8B_U7"],"主动强调施动者, 被动强调承受者。",[{"rule":"主动→被动: 宾变主, 加be+过分","note":"Tom wrote the letter → The letter was written by Tom."}],[{"en":"Tom wrote the letter. (主动)","cn":"Tom写了信。"},{"en":"The letter was written by Tom. (被动)","cn":"信是Tom写的。"}],[],["语态","主动","被动","对比"],"主动强调谁做的, 被动强调被怎样")

# === VII. Structures 7 ===
add("g074","used to do","Used To","structures","advanced",["G8"],["8B_U4"],["8B_U4"],"used to do过去常常。be used to doing习惯于。",[{"rule":"used to+原形","note":"I used to swim."},{"rule":"be used to+doing","note":"I am used to getting up early."}],[{"en":"I used to live in Beijing.","cn":"我曾在京住。"},{"en":"I am used to the weather.","cn":"我已习惯这天气。"}],[{"wrong":"I used to swimming.","correct":"I used to swim.","note":"used to+原形"}],["used to","be used to","习惯"],"used to do过去常, be used to doing习惯")

add("g075","It is + adj + to do","It is adj to do","structures","advanced",["G8"],["8A_U5"],["8A_U5"],"It is+形容词+(for/of sb)+to do。",[{"rule":"It is+adj+for sb+to do","note":"It is important for you to study."},{"rule":"It is+adj+of sb+to do(polite/kind)","note":"It is kind of you to help."}],[{"en":"It is important to learn English.","cn":"学英语很重要。"},{"en":"It is kind of you to say so.","cn":"你这样说真好。"}],[],["句型","It is","to do"],"It + is + adj + to do, 形式主语开头站")

add("g076","so...that / such...that","So That","structures","advanced",["G9"],["9A_U8"],["9A_U8"],"如此...以至于...",[{"rule":"so+形/副+that","note":"so tired that I slept"},{"rule":"such+名+that","note":"such a nice day that"}],[{"en":"He is so tall that he can reach it.","cn":"他太高了能够到。"},{"en":"It is such a good book that I read it twice.","cn":"书太好了我读了两遍。"}],[],["句型","so that","such that"],"so接形副, such接名词")

add("g077","比较级和最高级","Comparative & Superlative","structures","intermediate",["G5","G6"],["6A_U5"],["7B_U6"],"比较级: -er/more。最高级: -est/most。",[{"rule":"单音节-er/-est","note":"tall→taller→tallest"},{"rule":"多音节more/most","note":"beautiful→more beautiful→most beautiful"},{"rule":"不规则","note":"good→better→best, bad→worse→worst"}],[{"en":"Tom is taller than Jerry.","cn":"Tom比Jerry高。"},{"en":"She is the best student.","cn":"她是最好的学生。"}],[],["比较级","最高级","-er","-est"],"短词-er/-est, 长词more/most")

add("g078","直接引语→间接引语","Reported Speech","structures","advanced",["G9"],["9A_U1"],["9A_U1"],"转述别人的话, 时态向后退一步。",[{"rule":"时态后退","note":"am→was, will→would"},{"rule":"人称/时间/地点变化","note":"now→then, today→that day"}],[{"en":"He said, 'I am happy.' → He said he was happy.","cn":"他说他很开心。"}],[{"wrong":"He said he is happy.","correct":"He said he was happy.","note":"主句过去, 从句时态后退"}],["间接引语","转述"],"时态后退, 人称相应变")

add("g079","条件句: if+现在, will","Conditional 1","structures","advanced",["G8"],["8B_U3"],["8B_U3"],"真实条件: if+一般现在, 主句will+原形。",[{"rule":"If it rains, I will stay.","note":"条件从句永远用现在时"}],[{"en":"If it is sunny, we will go to the park.","cn":"如果天晴我们就去公园。"}],[{"wrong":"If it will rain, I will stay.","correct":"If it rains, I will stay.","note":"if从句不用will"}],["条件","if","主将从现"],"主将从现: if从句永远现在时")

add("g080","祈使句+and/or","Imperative+and/or","structures","advanced",["G9"],["9B_U7"],["9B_U7"],"祈使句+and/or+陈述句(表条件结果)。",[{"rule":"Do...and you will...","note":"Work hard and you will succeed."},{"rule":"Do...or you will...","note":"Hurry up or you will be late."}],[{"en":"Study hard and you will pass.","cn":"努力学习你就会过。"},{"en":"Hurry up or you will be late.","cn":"快点否则会迟到。"}],[],["句型","祈使","and","or"],"and则成功, or否则失败")

with open("data/grammar/grammar_knowledge.json","w",encoding="utf-8") as f:
    json.dump(grammar, f, ensure_ascii=False, indent=2)
print(f"✅ 全部80条已写入! 总计: {len(grammar)} 条")
