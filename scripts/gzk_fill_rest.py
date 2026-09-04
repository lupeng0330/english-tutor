# -*- coding: utf-8 -*-
"""gzk 广州口语 · 剩余 16 单元填充（批次 2-4：grade1下6 / grade2上6 / grade2下4）
对齐参考单元结构；话题对齐官方大纲，课文/例句全部原创改编。对话用"说话人:"前缀触发多角色男女声。
grade2上 u3 官方标题缺失 → 拟定 "At the Zoo"（动物），标题后加（待核对）。
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data", "textbooks", "gzk.json")

def W(w, p, m, e): return {"word": w, "phonetic": p, "meaning": m, "example": e}
def L(page, title, en, cn): return {"page": page, "title": title, "en": en, "cn": cn}

# title_override: 若需要修改单元标题（如 grade2上 u3），填此项
DATA = {
 ("grade1","下"): {
  "u1": {"pageRange":"P1-P10","words":[
     W("family","/ˈfæməli/","家庭","I love my family."),
     W("dad","/dæd/","爸爸","This is my dad."),
     W("mum","/mʌm/","妈妈","My mum is kind."),
     W("brother","/ˈbrʌðə(r)/","哥哥；弟弟","I have a brother."),
     W("sister","/ˈsɪstə(r)/","姐姐；妹妹","She is my sister."),
     W("grandpa","/ˈɡrænpɑː/","爷爷；外公","Grandpa is old."),
     W("grandma","/ˈɡrænmɑː/","奶奶；外婆","I love grandma."),
     W("baby","/ˈbeɪbi/","婴儿","The baby is cute."),
     W("love","/lʌv/","爱","I love you."),
     W("happy","/ˈhæpi/","开心的","We are happy."),
    ],"lessons":[
     L("P2","Let's Learn","dad    mum    brother    sister\ngrandpa    grandma    baby","爸爸  妈妈  哥哥/弟弟  姐姐/妹妹\n爷爷  奶奶  婴儿"),
     L("P4","Let's Talk","Andy: This is my family.\nLily: Who is he?\nAndy: He is my dad. And she is my mum.\nLily: Is this your sister?\nAndy: Yes. And this is my baby brother.\nLily: What a happy family!","安迪：这是我的家庭。\n莉莉：他是谁？\n安迪：他是我爸爸，她是我妈妈。\n莉莉：这是你姐姐吗？\n安迪：是的。这是我的小弟弟。\n莉莉：多幸福的一家人！"),
     L("P6","Let's Chant — My Family","Daddy, mummy, I love you,\nGrandpa, grandma, love you too.\nSister, brother, baby small,\nOne big family — love them all!","爸爸，妈妈，我爱你，\n爷爷，奶奶，也爱你。\n姐姐，弟弟，小宝宝，\n一个大家——都爱你！"),
    ]},
  "u2": {"pageRange":"P11-P20","words":[
     W("house","/haʊs/","房子","Come to my house."),
     W("home","/həʊm/","家","Welcome to my home."),
     W("door","/dɔː(r)/","门","Open the door."),
     W("window","/ˈwɪndəʊ/","窗户","Close the window."),
     W("come","/kʌm/","来","Come in, please."),
     W("welcome","/ˈwelkəm/","欢迎","Welcome!"),
     W("sofa","/ˈsəʊfə/","沙发","Sit on the sofa."),
     W("in","/ɪn/","进；在……里","Come in."),
     W("please","/pliːz/","请","Sit down, please."),
     W("big","/bɪɡ/","大的","It's a big house."),
    ],"lessons":[
     L("P12","Let's Learn","house    home    door    window\ncome in    welcome    sofa","房子  家  门  窗户\n进来  欢迎  沙发"),
     L("P14","Let's Talk","Andy: Come to my house, Lily.\nLily: Wow, it's a big house!\nAndy: Come in, please.\nLily: Thank you.\nAndy: Sit on the sofa.\nLily: Your home is so nice!","安迪：来我家吧，莉莉。\n莉莉：哇，好大的房子！\n安迪：请进。\n莉莉：谢谢。\n安迪：坐在沙发上吧。\n莉莉：你家真漂亮！"),
     L("P16","Let's Chant — Come In","Knock, knock, open the door,\nWelcome, welcome, come on in!\nSit, sit, on the sofa,\nMy sweet home — let's begin!","咚，咚，把门打开，\n欢迎，欢迎，快进来！\n坐，坐，沙发上坐，\n我的家——开始啦！"),
    ]},
  "u3": {"pageRange":"P21-P30","words":[
     W("room","/ruːm/","房间","This is my room."),
     W("bed","/bed/","床","The bed is soft."),
     W("desk","/desk/","书桌","My desk is white."),
     W("chair","/tʃeə(r)/","椅子","Sit on the chair."),
     W("lamp","/læmp/","台灯","Turn on the lamp."),
     W("clock","/klɒk/","钟","The clock is round."),
     W("box","/bɒks/","盒子；箱子","My toy box."),
     W("on","/ɒn/","在……上","The book is on the desk."),
     W("my","/maɪ/","我的","This is my room."),
     W("tidy","/ˈtaɪdi/","整洁的","My room is tidy."),
    ],"lessons":[
     L("P22","Let's Learn","room    bed    desk    chair\nlamp    clock    toy box","房间  床  书桌  椅子\n台灯  钟  玩具箱"),
     L("P24","Let's Talk","Lily: This is my room.\nAndy: It's so tidy!\nLily: My bed is here. My desk is there.\nAndy: What's on the desk?\nLily: A lamp and a clock.\nAndy: I like your room!","莉莉：这是我的房间。\n安迪：真整洁！\n莉莉：我的床在这儿，书桌在那儿。\n安迪：书桌上有什么？\n莉莉：一盏台灯和一个钟。\n安迪：我喜欢你的房间！"),
     L("P26","Let's Chant — My Room","Bed, bed, time for bed,\nDesk, desk, books are read.\nLamp, lamp, shining bright,\nMy tidy room — good night!","床，床，睡觉啦，\n桌，桌，读读书。\n灯，灯，亮晶晶，\n整洁房间——晚安喽！"),
    ]},
  "u4": {"pageRange":"P31-P40","words":[
     W("see","/siː/","看见","What do you see?"),
     W("bird","/bɜːd/","鸟","I see a bird."),
     W("tree","/triː/","树","A big tree."),
     W("flower","/ˈflaʊə(r)/","花","Pretty flowers."),
     W("sun","/sʌn/","太阳","The sun is bright."),
     W("cloud","/klaʊd/","云","White clouds."),
     W("fish","/fɪʃ/","鱼","Fish in the water."),
     W("look","/lʊk/","看","Look at the bird!"),
     W("what","/wɒt/","什么","What do you see?"),
     W("pretty","/ˈprɪti/","漂亮的","Pretty flowers!"),
    ],"lessons":[
     L("P32","Let's Learn","bird    tree    flower    fish\nsun    cloud","鸟  树  花  鱼\n太阳  云"),
     L("P34","Let's Talk","Andy: Look! What do you see?\nLily: I see a bird in the tree.\nAndy: I see pretty flowers.\nLily: I see the sun and white clouds.\nAndy: What a beautiful day!","安迪：看！你看见了什么？\n莉莉：我看见树上有一只鸟。\n安迪：我看见漂亮的花。\n莉莉：我看见太阳和白云。\n安迪：多美的一天！"),
     L("P36","Let's Chant — I Can See","Look, look, what do you see?\nA little bird in the tree!\nLook, look, up in the sky,\nThe sun, the clouds, way up high!","看，看，你看见啥？\n树上一只小小鸟！\n看，看，天上瞧，\n太阳白云高又高！"),
    ]},
  "u5": {"pageRange":"P41-P50","words":[
     W("pet","/pet/","宠物","I want a pet."),
     W("dog","/dɒɡ/","狗","The dog is friendly."),
     W("cat","/kæt/","猫","My cat is white."),
     W("rabbit","/ˈræbɪt/","兔子","The rabbit hops."),
     W("fish","/fɪʃ/","鱼","A gold fish."),
     W("turtle","/ˈtɜːtl/","乌龟","The turtle is slow."),
     W("want","/wɒnt/","想要","I want a dog."),
     W("cute","/kjuːt/","可爱的","So cute!"),
     W("little","/ˈlɪtl/","小的","A little cat."),
     W("can","/kæn/","可以","Can I have a pet?"),
    ],"lessons":[
     L("P42","Let's Learn","pet    dog    cat    rabbit\nfish    turtle","宠物  狗  猫  兔子\n鱼  乌龟"),
     L("P44","Let's Talk","Lily: I want a pet.\nMum: What pet do you want?\nLily: I want a little rabbit. It's so cute.\nMum: OK. Let's take care of it.\nLily: Thank you, mum!","莉莉：我想要一只宠物。\n妈妈：你想要什么宠物？\n莉莉：我想要一只小兔子，太可爱了。\n妈妈：好的，我们一起照顾它。\n莉莉：谢谢妈妈！"),
     L("P46","Let's Chant — My Pet","Dog, dog, woof woof woof,\nCat, cat, on the roof.\nRabbit, rabbit, hop hop hop,\nI love pets — they never stop!","狗，狗，汪汪汪，\n猫，猫，房顶上。\n兔，兔，蹦蹦跳，\n我爱宠物——停不了！"),
    ]},
  "u6": {"pageRange":"P51-P60","words":[
     W("ice-cream","/ˈaɪs kriːm/","冰淇淋","I want ice-cream!"),
     W("cake","/keɪk/","蛋糕","A birthday cake."),
     W("candy","/ˈkændi/","糖果","Sweet candy."),
     W("juice","/dʒuːs/","果汁","Orange juice, please."),
     W("milk","/mɪlk/","牛奶","Drink milk."),
     W("bread","/bred/","面包","I eat bread."),
     W("apple","/ˈæpl/","苹果","A red apple."),
     W("water","/ˈwɔːtə(r)/","水","Some water, please."),
     W("yummy","/ˈjʌmi/","好吃的","Yummy!"),
     W("want","/wɒnt/","想要","I want some cake."),
    ],"lessons":[
     L("P52","Let's Learn","ice-cream    cake    candy    juice\nmilk    bread    apple","冰淇淋  蛋糕  糖果  果汁\n牛奶  面包  苹果"),
     L("P54","Let's Talk","Andy: I want ice-cream!\nMum: Here you are.\nAndy: Yummy! Can I have some cake?\nMum: Sure. And drink some milk.\nAndy: Thank you, mum. It's yummy!","安迪：我想要冰淇淋！\n妈妈：给你。\n安迪：好吃！我能吃点蛋糕吗？\n妈妈：当然，再喝点牛奶。\n安迪：谢谢妈妈，真好吃！"),
     L("P56","Let's Chant — Yummy Food","Ice-cream, ice-cream, cold and sweet,\nCake and candy, what a treat!\nMilk and juice, yummy, yum,\nClap your hands and rub your tum!","冰淇淋，冰淇淋，又凉又甜，\n蛋糕糖果，真过瘾！\n牛奶果汁，香又甜，\n拍拍手来摸摸肚！"),
    ]},
 },
 ("grade2","上"): {
  "u1": {"pageRange":"P1-P10","words":[
     W("can","/kæn/","能；会","What can you do?"),
     W("sing","/sɪŋ/","唱歌","I can sing."),
     W("dance","/dɑːns/","跳舞","She can dance."),
     W("draw","/drɔː/","画画","I can draw a cat."),
     W("swim","/swɪm/","游泳","Can you swim?"),
     W("skate","/skeɪt/","滑冰","He can skate."),
     W("ride","/raɪd/","骑","I can ride a bike."),
     W("play","/pleɪ/","玩；演奏","I can play the piano."),
     W("well","/wel/","好地","She sings well."),
     W("too","/tuː/","也","Me too!"),
    ],"lessons":[
     L("P2","Let's Learn","sing    dance    draw    swim\nskate    ride    play","唱歌  跳舞  画画  游泳\n滑冰  骑  玩/演奏"),
     L("P4","Let's Talk","Andy: What can you do, Lily?\nLily: I can dance and draw. What about you?\nAndy: I can swim and ride a bike.\nBen: I can play football!\nLily: Wow, we can do many things!","安迪：你会做什么，莉莉？\n莉莉：我会跳舞和画画。你呢？\n安迪：我会游泳和骑车。\n本：我会踢足球！\n莉莉：哇，我们会做好多事！"),
     L("P6","Let's Chant — I Can","I can sing, I can dance,\nI can draw, give me a chance!\nI can swim, I can ride,\nLook at me — I try with pride!","我会唱，我会跳，\n我会画，给我机会瞧！\n我会游，我会骑，\n看看我——真神气！"),
    ]},
  "u2": {"pageRange":"P11-P20","words":[
     W("dinner","/ˈdɪnə(r)/","晚饭","What's for dinner?"),
     W("rice","/raɪs/","米饭","I eat rice."),
     W("noodles","/ˈnuːdlz/","面条","Hot noodles."),
     W("soup","/suːp/","汤","Egg soup."),
     W("fish","/fɪʃ/","鱼","Fish is yummy."),
     W("chicken","/ˈtʃɪkɪn/","鸡肉","I like chicken."),
     W("egg","/eɡ/","鸡蛋","Two eggs."),
     W("vegetable","/ˈvedʒtəbl/","蔬菜","Eat your vegetables."),
     W("hungry","/ˈhʌŋɡri/","饿的","I'm hungry."),
     W("eat","/iːt/","吃","Let's eat!"),
    ],"lessons":[
     L("P12","Let's Learn","rice    noodles    soup    fish\nchicken    egg    vegetable","米饭  面条  汤  鱼\n鸡肉  鸡蛋  蔬菜"),
     L("P14","Let's Talk","Andy: Mum, I'm hungry. What's for dinner?\nMum: Rice, fish and vegetables.\nAndy: Yummy! I like fish.\nMum: Eat your vegetables, too.\nAndy: OK. Let's eat!","安迪：妈妈，我饿了。晚饭吃什么？\n妈妈：米饭、鱼和蔬菜。\n安迪：好吃！我喜欢鱼。\n妈妈：也要吃蔬菜哦。\n安迪：好的，开吃！"),
     L("P16","Let's Chant — Dinner Time","Rice and fish, on my dish,\nSoup and noodles, what a wish!\nVegetables green, good for you,\nDinner time — yummy, too!","米饭和鱼，盘中餐，\n汤和面条，多美满！\n绿色蔬菜，身体好，\n晚饭时间——真叫妙！"),
    ]},
  "u3": {"title":"Unit 3 At the Zoo（待核对）","pageRange":"P21-P30","words":[
     W("zoo","/zuː/","动物园","Let's go to the zoo."),
     W("animal","/ˈænɪml/","动物","I like animals."),
     W("lion","/ˈlaɪən/","狮子","The lion is strong."),
     W("tiger","/ˈtaɪɡə(r)/","老虎","A big tiger."),
     W("monkey","/ˈmʌŋki/","猴子","The monkey jumps."),
     W("elephant","/ˈelɪfənt/","大象","The elephant is big."),
     W("panda","/ˈpændə/","熊猫","Pandas are cute."),
     W("bear","/beə(r)/","熊","A brown bear."),
     W("big","/bɪɡ/","大的","A big elephant."),
     W("see","/siː/","看","I can see a panda."),
    ],"lessons":[
     L("P22","Let's Learn","lion    tiger    monkey    elephant\npanda    bear","狮子  老虎  猴子  大象\n熊猫  熊"),
     L("P24","Let's Talk","Andy: Let's go to the zoo!\nLily: Great! Look, a big elephant.\nAndy: I can see two pandas. They're cute.\nBen: Look at the monkey. It jumps!\nLily: I love the zoo!","安迪：我们去动物园吧！\n莉莉：太好了！看，一头大象。\n安迪：我看见两只熊猫，好可爱。\n本：看那只猴子，它在跳！\n莉莉：我爱动物园！"),
     L("P26","Let's Chant — At the Zoo","Lion, lion, big and strong,\nMonkey, monkey, jump along.\nPanda, panda, black and white,\nAt the zoo — what a sight!","狮子，狮子，强又壮，\n猴子，猴子，蹦蹦跳。\n熊猫，熊猫，黑又白，\n动物园里——真好看！"),
    ]},
  "u4": {"pageRange":"P31-P40","words":[
     W("time","/taɪm/","时间","What time is it?"),
     W("clock","/klɒk/","钟","Look at the clock."),
     W("o'clock","/əˈklɒk/","……点钟","It's seven o'clock."),
     W("morning","/ˈmɔːnɪŋ/","早晨","Good morning!"),
     W("noon","/nuːn/","中午","It's noon."),
     W("afternoon","/ˌɑːftəˈnuːn/","下午","Good afternoon."),
     W("evening","/ˈiːvnɪŋ/","傍晚","In the evening."),
     W("night","/naɪt/","夜晚","Good night!"),
     W("get up","/ɡet ʌp/","起床","I get up at seven."),
     W("now","/naʊ/","现在","What time is it now?"),
    ],"lessons":[
     L("P32","Let's Learn","morning    noon    afternoon\nevening    night    o'clock","早晨  中午  下午\n傍晚  夜晚  ……点钟"),
     L("P34","Let's Talk","Andy: What time is it now?\nLily: It's seven o'clock.\nAndy: Time to get up!\nLily: It's twelve o'clock. Time for lunch.\nAndy: It's nine o'clock at night. Good night!","安迪：现在几点了？\n莉莉：七点钟。\n安迪：该起床啦！\n莉莉：十二点了，该吃午饭。\n安迪：晚上九点了，晚安！"),
     L("P36","Let's Chant — What Time","Tick-tock, tick-tock, what time now?\nSeven o'clock, get up — wow!\nTwelve o'clock, time to eat,\nNine at night, sleep so sweet!","滴答，滴答，几点啦？\n七点钟，快起床——哇！\n十二点，吃饭喽，\n夜里九点，睡好觉！"),
    ]},
  "u5": {"pageRange":"P41-P50","words":[
     W("skate","/skeɪt/","滑冰","I'm skating."),
     W("run","/rʌn/","跑","He is running."),
     W("jump","/dʒʌmp/","跳","She is jumping."),
     W("swim","/swɪm/","游泳","They are swimming."),
     W("ride","/raɪd/","骑","I'm riding a bike."),
     W("play","/pleɪ/","玩","We are playing."),
     W("ball","/bɔːl/","球","Play with a ball."),
     W("park","/pɑːk/","公园","In the park."),
     W("now","/naʊ/","现在","I'm skating now."),
     W("fun","/fʌn/","有趣","It's fun!"),
    ],"lessons":[
     L("P42","Let's Learn","skating    running    jumping\nswimming    riding    playing","滑冰  跑步  跳\n游泳  骑车  玩"),
     L("P44","Let's Talk","Lily: Where are you, Andy?\nAndy: I'm in the park. I'm skating!\nLily: That's fun! Ben is running.\nAndy: Look, the girls are jumping.\nLily: Let's play together!","莉莉：你在哪儿，安迪？\n安迪：我在公园，我在滑冰！\n莉莉：真好玩！本在跑步。\n安迪：看，女孩们在跳。\n莉莉：我们一起玩吧！"),
     L("P46","Let's Chant — In the Park","Skating, skating, round we go,\nRunning, running, fast not slow.\nJumping, jumping, high and free,\nIn the park — come play with me!","滑冰，滑冰，转圈圈，\n跑步，跑步，快如箭。\n跳跃，跳跃，又高又欢，\n公园里——来玩耍！"),
    ]},
  "u6": {"pageRange":"P51-P60","words":[
     W("wash","/wɒʃ/","洗","Mum's washing up."),
     W("cook","/kʊk/","做饭","Dad is cooking."),
     W("clean","/kliːn/","打扫","Clean the room."),
     W("read","/riːd/","读","I'm reading a book."),
     W("write","/raɪt/","写","She is writing."),
     W("watch","/wɒtʃ/","看","Watch TV."),
     W("help","/help/","帮助","Can I help you?"),
     W("busy","/ˈbɪzi/","忙碌的","Mum is busy."),
     W("do","/duː/","做","What are you doing?"),
     W("now","/naʊ/","现在","She is cooking now."),
    ],"lessons":[
     L("P52","Let's Learn","washing    cooking    cleaning\nreading    writing    watching TV","洗  做饭  打扫\n读书  写字  看电视"),
     L("P54","Let's Talk","Andy: What are you doing, mum?\nMum: I'm washing up. Dad is cooking.\nAndy: Can I help you?\nMum: Yes! Please clean the table.\nAndy: OK, mum. We're a busy family!","安迪：妈妈，你在做什么？\n妈妈：我在洗碗，爸爸在做饭。\n安迪：我能帮忙吗？\n妈妈：好呀！请擦擦桌子。\n安迪：好的妈妈，我们一家真忙！"),
     L("P56","Let's Chant — Busy Day","Mum is washing, dad can cook,\nSister's reading a big book.\nClean and help, one, two, three,\nA busy family — you and me!","妈妈洗碗，爸爸做饭，\n姐姐读着大书本。\n打扫帮忙，一二三，\n忙碌一家——你和我！"),
    ]},
 },
 ("grade2","下"): {
  "u2": {"pageRange":"P13-P24","words":[
     W("bus","/bʌs/","公交车","I go to school by bus."),
     W("car","/kɑː(r)/","小汽车","Dad's car is red."),
     W("bike","/baɪk/","自行车","I ride a bike."),
     W("taxi","/ˈtæksi/","出租车","Take a taxi."),
     W("train","/treɪn/","火车","A fast train."),
     W("on foot","/ɒn fʊt/","步行","I go on foot."),
     W("by","/baɪ/","乘（交通工具）","by bus"),
     W("go","/ɡəʊ/","去","I go to school."),
     W("fast","/fɑːst/","快的","The train is fast."),
     W("school","/skuːl/","学校","Go to school."),
    ],"lessons":[
     L("P14","Let's Learn","bus    car    bike    taxi\ntrain    on foot","公交车  小汽车  自行车  出租车\n火车  步行"),
     L("P16","Let's Talk","Andy: How do you go to school?\nLily: I go to school by bus. And you?\nAndy: I go by bike. It's fast.\nBen: I go on foot. My home is near.\nLily: Cool!","安迪：你怎么去上学？\n莉莉：我坐公交车上学。你呢？\n安迪：我骑自行车，很快。\n本：我走路，我家很近。\n莉莉：真棒！"),
     L("P18","Let's Chant — Go to School","Bus, bus, beep beep beep,\nBike, bike, fast not slow.\nTrain, train, choo choo choo,\nGo to school — off we go!","公交，公交，嘀嘀嘀，\n单车，单车，快快骑。\n火车，火车，呜呜呜，\n去上学——出发咯！"),
    ]},
  "u3": {"pageRange":"P25-P36","words":[
     W("teacher","/ˈtiːtʃə(r)/","老师","I want to be a teacher."),
     W("doctor","/ˈdɒktə(r)/","医生","She is a doctor."),
     W("nurse","/nɜːs/","护士","A kind nurse."),
     W("cook","/kʊk/","厨师","He is a cook."),
     W("driver","/ˈdraɪvə(r)/","司机","A bus driver."),
     W("farmer","/ˈfɑːmə(r)/","农民","The farmer works hard."),
     W("police","/pəˈliːs/","警察","A police officer."),
     W("want","/wɒnt/","想要","I want to be a doctor."),
     W("be","/biː/","成为","be a teacher"),
     W("job","/dʒɒb/","工作","A good job."),
    ],"lessons":[
     L("P26","Let's Learn","teacher    doctor    nurse\ncook    driver    farmer    police","老师  医生  护士\n厨师  司机  农民  警察"),
     L("P28","Let's Talk","Andy: What do you want to be, Lily?\nLily: I want to be a teacher. And you?\nAndy: I want to be a doctor. I can help people.\nBen: I want to be a driver!\nLily: Great jobs!","安迪：你想成为什么，莉莉？\n莉莉：我想当老师。你呢？\n安迪：我想当医生，可以帮助别人。\n本：我想当司机！\n莉莉：都是好工作！"),
     L("P30","Let's Chant — My Dream","Teacher, doctor, nurse and cook,\nFarmer, driver, take a look!\nWhat do you want to be one day?\nA happy job — hip hip hooray!","老师，医生，护士，厨师，\n农民，司机，快来看！\n将来你想做什么？\n快乐工作——耶耶耶！"),
    ]},
  "u4": {"pageRange":"P37-P48","words":[
     W("park","/pɑːk/","公园","Take me to the park."),
     W("zoo","/zuː/","动物园","Go to the zoo."),
     W("shop","/ʃɒp/","商店","A toy shop."),
     W("library","/ˈlaɪbrəri/","图书馆","Read in the library."),
     W("school","/skuːl/","学校","Go to school."),
     W("please","/pliːz/","请","Take me, please."),
     W("take","/teɪk/","带；送","Take me to the park."),
     W("go","/ɡəʊ/","去","Let's go!"),
     W("where","/weə(r)/","哪里","Where do you go?"),
     W("happy","/ˈhæpi/","开心的","I'm so happy!"),
    ],"lessons":[
     L("P38","Let's Learn","park    zoo    shop\nlibrary    school","公园  动物园  商店\n图书馆  学校"),
     L("P40","Let's Talk","Lily: Dad, please take me to the park.\nDad: OK. Let's go now.\nLily: Can we go to the zoo, too?\nDad: Sure. There are pandas.\nLily: Yeah! I'm so happy!","莉莉：爸爸，请带我去公园。\n爸爸：好的，我们现在就去。\n莉莉：我们也能去动物园吗？\n爸爸：当然，那里有熊猫。\n莉莉：耶！我太开心了！"),
     L("P42","Let's Chant — Let's Go","To the park, to the zoo,\nTo the shop, me and you!\nTake me, take me, off we go,\nHappy, happy — yo ho ho!","去公园，去动物园，\n去商店，你和我！\n带我去，带我去，出发啦，\n开心，开心——哟嗬嗬！"),
    ]},
  "u5": {"pageRange":"P49-P60","words":[
     W("Monday","/ˈmʌndeɪ/","星期一","My favourite day is Monday."),
     W("Tuesday","/ˈtjuːzdeɪ/","星期二","See you on Tuesday."),
     W("Wednesday","/ˈwenzdeɪ/","星期三","It's Wednesday."),
     W("Thursday","/ˈθɜːzdeɪ/","星期四","On Thursday."),
     W("Friday","/ˈfraɪdeɪ/","星期五","Happy Friday!"),
     W("Saturday","/ˈsætədeɪ/","星期六","Play on Saturday."),
     W("Sunday","/ˈsʌndeɪ/","星期日","Rest on Sunday."),
     W("day","/deɪ/","天","What day is it?"),
     W("week","/wiːk/","星期","Seven days a week."),
     W("favourite","/ˈfeɪvərɪt/","最喜欢的","My favourite day."),
    ],"lessons":[
     L("P50","Let's Learn","Monday    Tuesday    Wednesday\nThursday    Friday    Saturday    Sunday","星期一  星期二  星期三\n星期四  星期五  星期六  星期日"),
     L("P52","Let's Talk","Andy: What day is it today?\nLily: It's Monday. My favourite day!\nAndy: Why Monday?\nLily: We have music and art.\nAndy: I like Saturday. I can play all day!","安迪：今天星期几？\n莉莉：星期一，我最喜欢的一天！\n安迪：为什么是星期一？\n莉莉：我们有音乐课和美术课。\n安迪：我喜欢星期六，可以玩一整天！"),
     L("P54","Let's Chant — Days of the Week","Monday, Tuesday, off we go,\nWednesday, Thursday, in a row.\nFriday, Saturday, Sunday fun,\nSeven days — and then we're done!","星期一，星期二，走起来，\n星期三，星期四，排排排。\n星期五，星期六，星期日玩，\n七天过——一周满！"),
    ]},
 },
}

def main():
    d = json.load(open(PATH, encoding="utf-8"))
    filled = 0
    for (gk, tn), units_map in DATA.items():
        arr = d["grades"][gk][tn]
        by_id = {u["id"]: u for u in arr}
        for uid, payload in units_map.items():
            u = by_id.get(uid)
            if not u:
                print("[warn] 未找到", gk, tn, uid); continue
            if "title" in payload:
                u["title"] = payload["title"]
            u["pageRange"] = payload["pageRange"]
            u["words"] = payload["words"]
            u["lessons"] = payload["lessons"]
            for k in ("placeholder", "lesson", "lessonCN"):
                u.pop(k, None)
            filled += 1
    tmp = PATH + ".tmp"
    json.dump(d, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PATH)
    remain = sum(1 for gk in d["grades"] for tn in d["grades"][gk]
                 for u in d["grades"][gk][tn] if u.get("placeholder"))
    print(f"[done] 本批填充 {filled} 个单元；剩余占位：{remain}")

if __name__ == "__main__":
    main()
