# -*- coding: utf-8 -*-
"""gzk 广州口语 · grade1 上册 6 单元内容填充（批次 1）
对齐参考单元 grade2下U1 结构：words[{word,phonetic,meaning,example}] + lessons[{page,title,en,cn}]。
话题对齐官方大纲，课文/例句全部原创改编（合规）。对话用 "说话人:" 前缀以触发多角色男女声。
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data", "textbooks", "gzk.json")

def W(w, p, m, e): return {"word": w, "phonetic": p, "meaning": m, "example": e}
def L(page, title, en, cn): return {"page": page, "title": title, "en": en, "cn": cn}

UNITS = {
 "u1": {  # Hello, I'm Andy
  "pageRange": "P1-P10",
  "words": [
    W("hello","/həˈləʊ/","你好","Hello! I'm Andy."),
    W("hi","/haɪ/","嗨；你好","Hi! I'm Lily."),
    W("I","/aɪ/","我","I am a pupil."),
    W("am","/æm/","是","I am Andy."),
    W("name","/neɪm/","名字","My name is Lily."),
    W("goodbye","/ˌɡʊdˈbaɪ/","再见","Goodbye, Miss Li!"),
    W("bye","/baɪ/","拜拜","Bye! See you."),
    W("teacher","/ˈtiːtʃə(r)/","老师","She is my teacher."),
    W("friend","/frend/","朋友","You are my friend."),
    W("boy","/bɔɪ/","男孩","Andy is a boy."),
    W("girl","/ɡɜːl/","女孩","Lily is a girl."),
    W("meet","/miːt/","见面","Nice to meet you."),
  ],
  "lessons": [
    L("P2","Let's Learn",
      "hello    hi    goodbye    bye\nI'm Andy.    My name is Lily.",
      "你好  嗨  再见  拜拜\n我是安迪。  我叫莉莉。"),
    L("P4","Let's Talk",
      "Andy: Hello! I'm Andy.\nLily: Hi, Andy! I'm Lily.\nAndy: Nice to meet you.\nLily: Nice to meet you, too.\nMiss Li: Hello, children!\nAndy: Hello, Miss Li!",
      "安迪：你好！我是安迪。\n莉莉：嗨，安迪！我是莉莉。\n安迪：很高兴认识你。\n莉莉：我也很高兴认识你。\n李老师：同学们好！\n安迪：李老师好！"),
    L("P6","Let's Chant — Hello",
      "Hello, hello, hello to you!\nHi, hi, hi, my name is Sue.\nGoodbye, goodbye, see you soon!\nBye-bye, bye-bye, this afternoon.",
      "你好，你好，向你问好！\n嗨，嗨，嗨，我叫苏。\n再见，再见，回头见！\n拜拜，拜拜，下午见。"),
  ],
 },
 "u2": {  # I Have a New Bag
  "pageRange": "P11-P20",
  "words": [
    W("bag","/bæɡ/","书包","I have a new bag."),
    W("pen","/pen/","钢笔","This is my pen."),
    W("pencil","/ˈpensl/","铅笔","Here is a pencil."),
    W("book","/bʊk/","书","Open your book, please."),
    W("ruler","/ˈruːlə(r)/","尺子","I have a long ruler."),
    W("eraser","/ɪˈreɪzə(r)/","橡皮","Where is my eraser?"),
    W("pencil-case","/ˈpensl keɪs/","文具盒","My pencil-case is red."),
    W("crayon","/ˈkreɪən/","蜡笔","I have six crayons."),
    W("new","/njuː/","新的","It is a new bag."),
    W("have","/hæv/","有","I have a pen."),
    W("school","/skuːl/","学校","I go to school."),
    W("this","/ðɪs/","这个","This is my book."),
  ],
  "lessons": [
    L("P12","Let's Learn",
      "a bag    a pen    a pencil    a book\na ruler    an eraser    a pencil-case",
      "一个书包  一支钢笔  一支铅笔  一本书\n一把尺子  一块橡皮  一个文具盒"),
    L("P14","Let's Talk",
      "Andy: I have a new bag.\nLily: Wow! It's nice.\nAndy: This is my pen, and this is my pencil.\nLily: Show me your book, please.\nAndy: Here you are.\nLily: Thank you!",
      "安迪：我有一个新书包。\n莉莉：哇！真好看。\n安迪：这是我的钢笔，这是我的铅笔。\n莉莉：请把你的书给我看看。\n安迪：给你。\n莉莉：谢谢！"),
    L("P16","Let's Chant — My Bag",
      "Bag, bag, a brand-new bag,\nPen, pen, a little red pen.\nBook, book, open the book,\nPencil, pencil, write again!",
      "书包，书包，崭新的书包，\n钢笔，钢笔，小小的红钢笔。\n书本，书本，把书翻开，\n铅笔，铅笔，再写一遍！"),
  ],
 },
 "u3": {  # Count from One to Ten
  "pageRange": "P21-P30",
  "words": [
    W("one","/wʌn/","一","I have one bag."),
    W("two","/tuː/","二","Two pens, please."),
    W("three","/θriː/","三","I see three birds."),
    W("four","/fɔː(r)/","四","Four cats are here."),
    W("five","/faɪv/","五","Give me five!"),
    W("six","/sɪks/","六","I am six."),
    W("seven","/ˈsevn/","七","Seven days a week."),
    W("eight","/eɪt/","八","Eight balls."),
    W("nine","/naɪn/","九","Nine pencils."),
    W("ten","/ten/","十","Ten little fingers."),
    W("count","/kaʊnt/","数数","Let's count together."),
    W("how many","/haʊ ˈmeni/","多少","How many pens?"),
  ],
  "lessons": [
    L("P22","Let's Learn",
      "one    two    three    four    five\nsix    seven    eight    nine    ten",
      "一  二  三  四  五\n六  七  八  九  十"),
    L("P24","Let's Talk",
      "Teacher: Let's count! One, two, three.\nAndy: Four, five, six.\nLily: Seven, eight, nine, ten!\nTeacher: How many pens, Andy?\nAndy: Three pens.\nTeacher: Good job!",
      "老师：我们来数数！一、二、三。\n安迪：四、五、六。\n莉莉：七、八、九、十！\n老师：安迪，有几支钢笔？\n安迪：三支钢笔。\n老师：做得好！"),
    L("P26","Let's Chant — Count with Me",
      "One, two, three, clap with me!\nFour, five, six, pick up sticks!\nSeven, eight, nine, you are fine!\nTen, ten, ten, let's count again!",
      "一、二、三，和我一起拍手！\n四、五、六，把小棒捡起来！\n七、八、九，你真棒！\n十、十、十，我们再数一遍！"),
  ],
 },
 "u4": {  # I Like Green
  "pageRange": "P31-P40",
  "words": [
    W("green","/ɡriːn/","绿色","I like green."),
    W("red","/red/","红色","The apple is red."),
    W("blue","/bluː/","蓝色","The sky is blue."),
    W("yellow","/ˈjeləʊ/","黄色","The sun is yellow."),
    W("orange","/ˈɒrɪndʒ/","橙色","I have an orange crayon."),
    W("purple","/ˈpɜːpl/","紫色","Her dress is purple."),
    W("pink","/pɪŋk/","粉色","Pink is nice."),
    W("black","/blæk/","黑色","A black cat."),
    W("white","/waɪt/","白色","White clouds."),
    W("colour","/ˈkʌlə(r)/","颜色","What colour is it?"),
    W("like","/laɪk/","喜欢","I like blue."),
    W("favourite","/ˈfeɪvərɪt/","最喜欢的","Green is my favourite colour."),
  ],
  "lessons": [
    L("P32","Let's Learn",
      "green    red    blue    yellow\norange    purple    pink    black    white",
      "绿色  红色  蓝色  黄色\n橙色  紫色  粉色  黑色  白色"),
    L("P34","Let's Talk",
      "Andy: I like green. Green is my favourite colour.\nLily: I like red and pink.\nAndy: What colour is your bag?\nLily: It's blue.\nAndy: Blue is nice, too!",
      "安迪：我喜欢绿色。绿色是我最喜欢的颜色。\n莉莉：我喜欢红色和粉色。\n安迪：你的书包是什么颜色？\n莉莉：是蓝色的。\n安迪：蓝色也很好看！"),
    L("P36","Let's Chant — Colours",
      "Green, green, the grass is green.\nRed, red, the apple's red.\nBlue, blue, the sky is blue.\nI like colours — how about you?",
      "绿色，绿色，草儿绿。\n红色，红色，苹果红。\n蓝色，蓝色，天空蓝。\n我喜欢颜色——你呢？"),
  ],
 },
 "u5": {  # Here's My Scooter
  "pageRange": "P41-P50",
  "words": [
    W("scooter","/ˈskuːtə(r)/","滑板车","Here's my scooter."),
    W("bike","/baɪk/","自行车","I can ride a bike."),
    W("ball","/bɔːl/","球","Throw the ball."),
    W("kite","/kaɪt/","风筝","Look at my kite."),
    W("car","/kɑː(r)/","小汽车","A toy car."),
    W("doll","/dɒl/","洋娃娃","She has a doll."),
    W("robot","/ˈrəʊbɒt/","机器人","My robot can walk."),
    W("plane","/pleɪn/","飞机","A toy plane flies high."),
    W("train","/treɪn/","火车","A long train."),
    W("toy","/tɔɪ/","玩具","I love my toys."),
    W("here","/hɪə(r)/","这里；在这儿","Here you are."),
    W("cool","/kuːl/","酷；很棒","It's cool!"),
  ],
  "lessons": [
    L("P42","Let's Learn",
      "a scooter    a bike    a ball    a kite\na car    a doll    a robot    a train",
      "一辆滑板车  一辆自行车  一个球  一只风筝\n一辆小汽车  一个洋娃娃  一个机器人  一列火车"),
    L("P44","Let's Talk",
      "Andy: Here's my scooter. It's cool!\nLily: I have a kite. Look!\nAndy: Wow! Let's play.\nBen: Can I play, too?\nAndy: Sure! Here you are.\nBen: Thank you, Andy!",
      "安迪：这是我的滑板车。它很酷！\n莉莉：我有一只风筝。看！\n安迪：哇！我们一起玩吧。\n本：我也能一起玩吗？\n安迪：当然！给你。\n本：谢谢你，安迪！"),
    L("P46","Let's Chant — My Toys",
      "Scooter, scooter, go, go, go!\nKite, kite, up you fly!\nBall, ball, throw it high!\nToys, toys, let's all play!",
      "滑板车，滑板车，冲冲冲！\n风筝，风筝，飞上天！\n皮球，皮球，抛得高！\n玩具，玩具，一起玩！"),
  ],
 },
 "u6": {  # I Can Jump
  "pageRange": "P51-P60",
  "words": [
    W("jump","/dʒʌmp/","跳","I can jump high."),
    W("run","/rʌn/","跑","I can run fast."),
    W("swim","/swɪm/","游泳","I can swim."),
    W("dance","/dɑːns/","跳舞","Can you dance?"),
    W("sing","/sɪŋ/","唱歌","I like to sing."),
    W("fly","/flaɪ/","飞","Birds can fly."),
    W("walk","/wɔːk/","走","Let's walk to school."),
    W("climb","/klaɪm/","爬","I can climb a tree."),
    W("can","/kæn/","能；会","I can jump."),
    W("can't","/kɑːnt/","不能；不会","I can't swim."),
    W("play","/pleɪ/","玩；做（运动）","Let's play ball."),
    W("great","/ɡreɪt/","棒极了","You're great!"),
  ],
  "lessons": [
    L("P52","Let's Learn",
      "jump    run    swim    dance\nsing    fly    walk    climb",
      "跳  跑  游泳  跳舞\n唱歌  飞  走  爬"),
    L("P54","Let's Talk",
      "Andy: I can jump. Look at me!\nLily: I can dance. Can you dance?\nAndy: Yes, I can. But I can't swim.\nBen: I can swim and run.\nLily: Wow! You're great.",
      "安迪：我会跳。看我！\n莉莉：我会跳舞。你会跳舞吗？\n安迪：会的。但我不会游泳。\n本：我会游泳，也会跑步。\n莉莉：哇！你真棒。"),
    L("P56","Let's Chant — I Can",
      "Jump, jump, I can jump!\nRun, run, run with fun!\nSwim, swim, in we go!\nSing and dance — here we go!",
      "跳，跳，我会跳！\n跑，跑，开心地跑！\n游，游，下水喽！\n又唱又跳——出发啦！"),
  ],
 },
}

def main():
    d = json.load(open(PATH, encoding="utf-8"))
    units = d["grades"]["grade1"]["上"]
    by_id = {u["id"]: u for u in units}
    filled = 0
    for uid, payload in UNITS.items():
        u = by_id.get(uid)
        if not u:
            print("[warn] 未找到单元", uid); continue
        u["pageRange"] = payload["pageRange"]
        u["words"] = payload["words"]
        u["lessons"] = payload["lessons"]
        for k in ("placeholder", "lesson", "lessonCN"):
            u.pop(k, None)
        filled += 1
    tmp = PATH + ".tmp"
    json.dump(d, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    os.replace(tmp, PATH)
    print(f"[done] grade1上 已填充 {filled} 个单元；剩余占位：",
          sum(1 for gk in d["grades"] for tn in d["grades"][gk] for u in d["grades"][gk][tn] if u.get("placeholder")))

if __name__ == "__main__":
    main()
