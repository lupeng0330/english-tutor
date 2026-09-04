# -*- coding: utf-8 -*-
"""
扩展教材：给 data/textbooks/jk.json 追加各年级缺失的单元。
参考广州教科版英语教材大纲。
"""
import json
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data", "textbooks", "jk.json")

# =========================================================================
# 新增单元（追加到现有 jk.json 里）
# 结构：(grade_key, term, unit_dict)
# =========================================================================
NEW_UNITS = [
    # ----------- grade1 -----------
    ("grade1", "上", {
        "id": "u3", "title": "Unit 3 My Body",
        "words": [
            { "word": "face", "phonetic": "/feɪs/", "meaning": "脸", "example": "My face is round." },
            { "word": "nose", "phonetic": "/nəʊz/", "meaning": "鼻子", "example": "Touch your nose." },
            { "word": "mouth", "phonetic": "/maʊθ/", "meaning": "嘴", "example": "Open your mouth." },
            { "word": "eye", "phonetic": "/aɪ/", "meaning": "眼睛", "example": "Close your eyes." },
            { "word": "hair", "phonetic": "/heə/", "meaning": "头发", "example": "Her hair is long." }
        ],
        "lesson": "Look at me! This is my face. I have two eyes and one nose. I have a small mouth. My hair is black."
    }),
    ("grade1", "上", {
        "id": "u4", "title": "Unit 4 My Toys",
        "words": [
            { "word": "toy", "phonetic": "/tɔɪ/", "meaning": "玩具", "example": "A new toy." },
            { "word": "car", "phonetic": "/kɑː/", "meaning": "小汽车", "example": "A red car." },
            { "word": "doll", "phonetic": "/dɒl/", "meaning": "洋娃娃", "example": "A cute doll." },
            { "word": "ball", "phonetic": "/bɔːl/", "meaning": "球", "example": "Kick the ball." },
            { "word": "teddy", "phonetic": "/ˈtedi/", "meaning": "泰迪熊", "example": "My teddy bear." }
        ],
        "lesson": "I have many toys. I have a red car and a blue ball. My sister has a doll. We play with our toys every day."
    }),
    ("grade1", "上", {
        "id": "u5", "title": "Unit 5 Good Morning",
        "words": [
            { "word": "good", "phonetic": "/ɡʊd/", "meaning": "好的", "example": "Good morning!" },
            { "word": "morning", "phonetic": "/ˈmɔːnɪŋ/", "meaning": "早晨", "example": "Have a nice morning." },
            { "word": "night", "phonetic": "/naɪt/", "meaning": "夜晚", "example": "Good night!" },
            { "word": "bye", "phonetic": "/baɪ/", "meaning": "再见", "example": "Bye-bye!" },
            { "word": "thanks", "phonetic": "/θæŋks/", "meaning": "谢谢", "example": "Thanks a lot." }
        ],
        "lesson": "Good morning, Miss Li! Good morning, class! Good afternoon, Tom! Good night, mum! Bye-bye! See you tomorrow!"
    }),
    ("grade1", "下", {
        "id": "u3", "title": "Unit 3 Classroom Things",
        "words": [
            { "word": "book", "phonetic": "/bʊk/", "meaning": "书", "example": "Open your book." },
            { "word": "bag", "phonetic": "/bæɡ/", "meaning": "书包", "example": "My bag is blue." },
            { "word": "pen", "phonetic": "/pen/", "meaning": "钢笔", "example": "A red pen." },
            { "word": "desk", "phonetic": "/desk/", "meaning": "课桌", "example": "On the desk." },
            { "word": "chair", "phonetic": "/tʃeə/", "meaning": "椅子", "example": "Sit on the chair." }
        ],
        "lesson": "Look at my bag! I have a book, a pen and a pencil in it. This is my desk. That is my chair. I like my classroom."
    }),
    ("grade1", "下", {
        "id": "u4", "title": "Unit 4 I Can Sing",
        "words": [
            { "word": "sing", "phonetic": "/sɪŋ/", "meaning": "唱歌", "example": "I can sing." },
            { "word": "dance", "phonetic": "/dɑːns/", "meaning": "跳舞", "example": "She can dance." },
            { "word": "run", "phonetic": "/rʌn/", "meaning": "跑", "example": "I can run fast." },
            { "word": "jump", "phonetic": "/dʒʌmp/", "meaning": "跳", "example": "Jump high!" },
            { "word": "swim", "phonetic": "/swɪm/", "meaning": "游泳", "example": "I can swim." }
        ],
        "lesson": "I can sing and dance. I can run and jump. Can you swim? Yes, I can! My friends and I can do many things."
    }),
    ("grade1", "下", {
        "id": "u5", "title": "Unit 5 On the Farm",
        "words": [
            { "word": "cow", "phonetic": "/kaʊ/", "meaning": "奶牛", "example": "A big cow." },
            { "word": "pig", "phonetic": "/pɪɡ/", "meaning": "猪", "example": "A pink pig." },
            { "word": "duck", "phonetic": "/dʌk/", "meaning": "鸭子", "example": "A yellow duck." },
            { "word": "horse", "phonetic": "/hɔːs/", "meaning": "马", "example": "A white horse." },
            { "word": "sheep", "phonetic": "/ʃiːp/", "meaning": "绵羊", "example": "Many sheep." }
        ],
        "lesson": "Let's go to the farm! I can see cows and horses. I can see ducks in the water. Look! The pig is eating. I love the farm."
    }),

    # ----------- grade2 -----------
    ("grade2", "上", {
        "id": "u3", "title": "Unit 3 My Friends",
        "words": [
            { "word": "friend", "phonetic": "/frend/", "meaning": "朋友", "example": "My good friend." },
            { "word": "boy", "phonetic": "/bɔɪ/", "meaning": "男孩", "example": "A tall boy." },
            { "word": "girl", "phonetic": "/ɡɜːl/", "meaning": "女孩", "example": "A nice girl." },
            { "word": "happy", "phonetic": "/ˈhæpi/", "meaning": "开心的", "example": "I am happy." },
            { "word": "play", "phonetic": "/pleɪ/", "meaning": "玩", "example": "Play together." }
        ],
        "lesson": "I have many friends. Tom is a tall boy. Amy is a nice girl. We play together every day. We are very happy."
    }),
    ("grade2", "上", {
        "id": "u4", "title": "Unit 4 In the Park",
        "words": [
            { "word": "park", "phonetic": "/pɑːk/", "meaning": "公园", "example": "Go to the park." },
            { "word": "tree", "phonetic": "/triː/", "meaning": "树", "example": "A big tree." },
            { "word": "flower", "phonetic": "/ˈflaʊə/", "meaning": "花", "example": "Red flowers." },
            { "word": "bench", "phonetic": "/bentʃ/", "meaning": "长椅", "example": "Sit on the bench." },
            { "word": "kite", "phonetic": "/kaɪt/", "meaning": "风筝", "example": "Fly a kite." }
        ],
        "lesson": "Today is Sunday. We are in the park. I see many trees and colorful flowers. My brother is flying a kite. Mum is sitting on the bench."
    }),
    ("grade2", "上", {
        "id": "u5", "title": "Unit 5 My Birthday",
        "words": [
            { "word": "birthday", "phonetic": "/ˈbɜːθdeɪ/", "meaning": "生日", "example": "Happy birthday!" },
            { "word": "cake", "phonetic": "/keɪk/", "meaning": "蛋糕", "example": "A big cake." },
            { "word": "gift", "phonetic": "/ɡɪft/", "meaning": "礼物", "example": "A nice gift." },
            { "word": "candle", "phonetic": "/ˈkændl/", "meaning": "蜡烛", "example": "Light the candles." },
            { "word": "party", "phonetic": "/ˈpɑːti/", "meaning": "派对", "example": "A birthday party." }
        ],
        "lesson": "Today is my birthday. I have a big cake with eight candles. My friends come to my party. They bring me many gifts. I am very happy."
    }),
    ("grade2", "下", {
        "id": "u3", "title": "Unit 3 My Pet",
        "words": [
            { "word": "pet", "phonetic": "/pet/", "meaning": "宠物", "example": "My pet dog." },
            { "word": "cute", "phonetic": "/kjuːt/", "meaning": "可爱的", "example": "A cute cat." },
            { "word": "little", "phonetic": "/ˈlɪtl/", "meaning": "小的", "example": "A little bird." },
            { "word": "feed", "phonetic": "/fiːd/", "meaning": "喂养", "example": "Feed the fish." },
            { "word": "name", "phonetic": "/neɪm/", "meaning": "名字", "example": "Its name is Lucky." }
        ],
        "lesson": "I have a little pet. It is a cute rabbit. Its name is Snow. It is white and soft. I feed it every day. I love my pet very much."
    }),
    ("grade2", "下", {
        "id": "u4", "title": "Unit 4 My Day",
        "words": [
            { "word": "morning", "phonetic": "/ˈmɔːnɪŋ/", "meaning": "早上", "example": "In the morning." },
            { "word": "afternoon", "phonetic": "/ˌɑːftəˈnuːn/", "meaning": "下午", "example": "In the afternoon." },
            { "word": "evening", "phonetic": "/ˈiːvnɪŋ/", "meaning": "傍晚", "example": "In the evening." },
            { "word": "eat", "phonetic": "/iːt/", "meaning": "吃", "example": "Eat breakfast." },
            { "word": "sleep", "phonetic": "/sliːp/", "meaning": "睡觉", "example": "Sleep at night." }
        ],
        "lesson": "In the morning I eat breakfast and go to school. In the afternoon I have lunch and study. In the evening I play with my sister. At night I go to sleep."
    }),
    ("grade2", "下", {
        "id": "u5", "title": "Unit 5 Shopping",
        "words": [
            { "word": "shop", "phonetic": "/ʃɒp/", "meaning": "商店", "example": "Go to the shop." },
            { "word": "buy", "phonetic": "/baɪ/", "meaning": "买", "example": "Buy some bread." },
            { "word": "money", "phonetic": "/ˈmʌni/", "meaning": "钱", "example": "I have money." },
            { "word": "nice", "phonetic": "/naɪs/", "meaning": "好的", "example": "A nice hat." },
            { "word": "please", "phonetic": "/pliːz/", "meaning": "请", "example": "Please help me." }
        ],
        "lesson": "Let's go shopping! I want to buy a new hat. The shop is big. I see many nice things. I pay the money. Thank you very much!"
    }),

    # ----------- grade3 -----------
    ("grade3", "上", {
        "id": "u3", "title": "Unit 3 My Family",
        "words": [
            { "word": "father", "phonetic": "/ˈfɑːðə/", "meaning": "爸爸", "example": "My father is tall." },
            { "word": "mother", "phonetic": "/ˈmʌðə/", "meaning": "妈妈", "example": "My mother is kind." },
            { "word": "brother", "phonetic": "/ˈbrʌðə/", "meaning": "哥哥/弟弟", "example": "My brother is six." },
            { "word": "sister", "phonetic": "/ˈsɪstə/", "meaning": "姐姐/妹妹", "example": "My sister is ten." },
            { "word": "grandpa", "phonetic": "/ˈɡrænpɑː/", "meaning": "爷爷", "example": "My grandpa is old." }
        ],
        "lesson": "This is my family. My father is a teacher. My mother is a doctor. I have one brother and one sister. We live with our grandpa and grandma. I love my family."
    }),
    ("grade3", "上", {
        "id": "u4", "title": "Unit 4 Numbers and Time",
        "words": [
            { "word": "number", "phonetic": "/ˈnʌmbə/", "meaning": "数字", "example": "My number is 7." },
            { "word": "hour", "phonetic": "/aʊə/", "meaning": "小时", "example": "One hour." },
            { "word": "minute", "phonetic": "/ˈmɪnɪt/", "meaning": "分钟", "example": "Ten minutes." },
            { "word": "clock", "phonetic": "/klɒk/", "meaning": "时钟", "example": "A big clock." },
            { "word": "o'clock", "phonetic": "/əˈklɒk/", "meaning": "...点", "example": "7 o'clock." }
        ],
        "lesson": "Look at the clock. It is seven o'clock. Time to get up! It is twelve o'clock now. Time for lunch. What time is it? It is nine fifteen."
    }),
    ("grade3", "上", {
        "id": "u5", "title": "Unit 5 Animals at the Zoo",
        "words": [
            { "word": "zoo", "phonetic": "/zuː/", "meaning": "动物园", "example": "Go to the zoo." },
            { "word": "elephant", "phonetic": "/ˈelɪfənt/", "meaning": "大象", "example": "A big elephant." },
            { "word": "monkey", "phonetic": "/ˈmʌŋki/", "meaning": "猴子", "example": "Clever monkey." },
            { "word": "tiger", "phonetic": "/ˈtaɪɡə/", "meaning": "老虎", "example": "Strong tiger." },
            { "word": "panda", "phonetic": "/ˈpændə/", "meaning": "熊猫", "example": "Cute panda." }
        ],
        "lesson": "Welcome to the zoo! I can see a big elephant. Look at the funny monkeys. The tiger is very strong. The panda is eating bamboo. I love animals."
    }),
    ("grade3", "下", {
        "id": "u3", "title": "Unit 3 At School",
        "words": [
            { "word": "playground", "phonetic": "/ˈpleɪɡraʊnd/", "meaning": "操场", "example": "Big playground." },
            { "word": "library", "phonetic": "/ˈlaɪbrəri/", "meaning": "图书馆", "example": "School library." },
            { "word": "music", "phonetic": "/ˈmjuːzɪk/", "meaning": "音乐", "example": "I love music." },
            { "word": "art", "phonetic": "/ɑːt/", "meaning": "美术", "example": "Art class." },
            { "word": "PE", "phonetic": "/piː iː/", "meaning": "体育", "example": "PE lesson." }
        ],
        "lesson": "Our school is big and beautiful. There is a large playground and a library. We have many lessons: Chinese, math, English, music, art and PE. I love my school."
    }),
    ("grade3", "下", {
        "id": "u4", "title": "Unit 4 Buying Things",
        "words": [
            { "word": "buy", "phonetic": "/baɪ/", "meaning": "买", "example": "Buy a book." },
            { "word": "cost", "phonetic": "/kɒst/", "meaning": "花费", "example": "How much does it cost?" },
            { "word": "yuan", "phonetic": "/jwen/", "meaning": "元", "example": "Ten yuan." },
            { "word": "shop", "phonetic": "/ʃɒp/", "meaning": "商店", "example": "A book shop." },
            { "word": "expensive", "phonetic": "/ɪkˈspensɪv/", "meaning": "贵的", "example": "Too expensive." }
        ],
        "lesson": "Can I help you? Yes, I want to buy this book. How much is it? It is 20 yuan. That's not expensive. Here is the money. Thank you!"
    }),
    ("grade3", "下", {
        "id": "u5", "title": "Unit 5 Let's Eat",
        "words": [
            { "word": "hungry", "phonetic": "/ˈhʌŋɡri/", "meaning": "饿的", "example": "I am hungry." },
            { "word": "thirsty", "phonetic": "/ˈθɜːsti/", "meaning": "渴的", "example": "I am thirsty." },
            { "word": "egg", "phonetic": "/eɡ/", "meaning": "鸡蛋", "example": "Two eggs." },
            { "word": "milk", "phonetic": "/mɪlk/", "meaning": "牛奶", "example": "A cup of milk." },
            { "word": "juice", "phonetic": "/dʒuːs/", "meaning": "果汁", "example": "Apple juice." }
        ],
        "lesson": "I am hungry. Can I have some bread? Yes, here you are. Thank you! I am thirsty too. Would you like milk or juice? Juice, please. Yum, it's delicious!"
    }),

    # ----------- grade4 -----------
    ("grade4", "上", {
        "id": "u3", "title": "Unit 3 Weather",
        "words": [
            { "word": "weather", "phonetic": "/ˈweðə/", "meaning": "天气", "example": "Nice weather." },
            { "word": "sunny", "phonetic": "/ˈsʌni/", "meaning": "晴朗的", "example": "A sunny day." },
            { "word": "cloudy", "phonetic": "/ˈklaʊdi/", "meaning": "多云的", "example": "Cloudy weather." },
            { "word": "snowy", "phonetic": "/ˈsnəʊi/", "meaning": "下雪的", "example": "Snowy winter." },
            { "word": "hot", "phonetic": "/hɒt/", "meaning": "热的", "example": "Very hot today." }
        ],
        "lesson": "What's the weather like today? It is sunny and hot. Yesterday was cloudy and cool. Tomorrow will be rainy. I like sunny days because I can play outside."
    }),
    ("grade4", "上", {
        "id": "u4", "title": "Unit 4 Jobs",
        "words": [
            { "word": "doctor", "phonetic": "/ˈdɒktə/", "meaning": "医生", "example": "A kind doctor." },
            { "word": "nurse", "phonetic": "/nɜːs/", "meaning": "护士", "example": "A nurse helps people." },
            { "word": "driver", "phonetic": "/ˈdraɪvə/", "meaning": "司机", "example": "Bus driver." },
            { "word": "cook", "phonetic": "/kʊk/", "meaning": "厨师", "example": "Good cook." },
            { "word": "farmer", "phonetic": "/ˈfɑːmə/", "meaning": "农民", "example": "My uncle is a farmer." }
        ],
        "lesson": "There are many jobs. My mother is a nurse. She helps sick people. My father is a driver. My uncle is a farmer. He grows vegetables. All jobs are important."
    }),
    ("grade4", "上", {
        "id": "u5", "title": "Unit 5 My Home",
        "words": [
            { "word": "home", "phonetic": "/həʊm/", "meaning": "家", "example": "Sweet home." },
            { "word": "kitchen", "phonetic": "/ˈkɪtʃən/", "meaning": "厨房", "example": "In the kitchen." },
            { "word": "bathroom", "phonetic": "/ˈbɑːθruːm/", "meaning": "浴室", "example": "The bathroom is clean." },
            { "word": "garden", "phonetic": "/ˈɡɑːdn/", "meaning": "花园", "example": "A small garden." },
            { "word": "sofa", "phonetic": "/ˈsəʊfə/", "meaning": "沙发", "example": "Sit on the sofa." }
        ],
        "lesson": "My home is on the third floor. It has two bedrooms, a kitchen, a bathroom and a living room with a big sofa. We also have a small garden. I love my home."
    }),
    ("grade4", "下", {
        "id": "u3", "title": "Unit 3 Shopping for Clothes",
        "words": [
            { "word": "size", "phonetic": "/saɪz/", "meaning": "尺寸", "example": "What size?" },
            { "word": "color", "phonetic": "/ˈkʌlə/", "meaning": "颜色", "example": "My favorite color." },
            { "word": "price", "phonetic": "/praɪs/", "meaning": "价格", "example": "A good price." },
            { "word": "try", "phonetic": "/traɪ/", "meaning": "尝试", "example": "Try it on." },
            { "word": "wear", "phonetic": "/weə/", "meaning": "穿", "example": "Wear a coat." }
        ],
        "lesson": "Welcome! Can I help you? I want a blue shirt. What size? Medium please. Here you are. Can I try it on? Of course. How much is it? 120 yuan. Good price!"
    }),
    ("grade4", "下", {
        "id": "u4", "title": "Unit 4 At the Restaurant",
        "words": [
            { "word": "menu", "phonetic": "/ˈmenjuː/", "meaning": "菜单", "example": "Read the menu." },
            { "word": "order", "phonetic": "/ˈɔːdə/", "meaning": "点（菜）", "example": "Order food." },
            { "word": "soup", "phonetic": "/suːp/", "meaning": "汤", "example": "Hot soup." },
            { "word": "salad", "phonetic": "/ˈsæləd/", "meaning": "沙拉", "example": "Fresh salad." },
            { "word": "delicious", "phonetic": "/dɪˈlɪʃəs/", "meaning": "美味的", "example": "Delicious food." }
        ],
        "lesson": "Welcome to our restaurant. Here is the menu. I would like some soup and a salad please. Would you like something to drink? Orange juice, thanks. The food is delicious!"
    }),
    ("grade4", "下", {
        "id": "u5", "title": "Unit 5 My Holiday",
        "words": [
            { "word": "holiday", "phonetic": "/ˈhɒlədeɪ/", "meaning": "假期", "example": "Summer holiday." },
            { "word": "beach", "phonetic": "/biːtʃ/", "meaning": "海滩", "example": "Go to the beach." },
            { "word": "mountain", "phonetic": "/ˈmaʊntən/", "meaning": "山", "example": "Climb a mountain." },
            { "word": "travel", "phonetic": "/ˈtrævl/", "meaning": "旅行", "example": "Travel by train." },
            { "word": "photo", "phonetic": "/ˈfəʊtəʊ/", "meaning": "照片", "example": "Take a photo." }
        ],
        "lesson": "Last summer holiday I went to the beach with my family. We played in the sand and swam in the sea. We also climbed a mountain. I took many beautiful photos."
    }),

    # ----------- grade5 -----------
    ("grade5", "上", {
        "id": "u3", "title": "Unit 3 My Weekend",
        "words": [
            { "word": "weekend", "phonetic": "/ˈwiːkend/", "meaning": "周末", "example": "Have a nice weekend." },
            { "word": "park", "phonetic": "/pɑːk/", "meaning": "公园", "example": "Go to the park." },
            { "word": "movie", "phonetic": "/ˈmuːvi/", "meaning": "电影", "example": "Watch a movie." },
            { "word": "shopping", "phonetic": "/ˈʃɒpɪŋ/", "meaning": "购物", "example": "Go shopping." },
            { "word": "relax", "phonetic": "/rɪˈlæks/", "meaning": "放松", "example": "Relax at home." }
        ],
        "lesson": "On weekends I do many things. On Saturday morning I go to the park with my friends. In the afternoon we watch a movie. On Sunday I go shopping with my mum. I also relax at home."
    }),
    ("grade5", "上", {
        "id": "u4", "title": "Unit 4 Our Country",
        "words": [
            { "word": "country", "phonetic": "/ˈkʌntri/", "meaning": "国家", "example": "Our country is beautiful." },
            { "word": "capital", "phonetic": "/ˈkæpɪtl/", "meaning": "首都", "example": "Beijing is the capital." },
            { "word": "flag", "phonetic": "/flæɡ/", "meaning": "旗帜", "example": "Our flag." },
            { "word": "proud", "phonetic": "/praʊd/", "meaning": "自豪的", "example": "I am proud." },
            { "word": "people", "phonetic": "/ˈpiːpl/", "meaning": "人们", "example": "Many people." }
        ],
        "lesson": "China is a great country with a long history. Beijing is our capital. Our flag is red with five yellow stars. Chinese people are hardworking and kind. I am proud to be Chinese."
    }),
    ("grade5", "上", {
        "id": "u5", "title": "Unit 5 Healthy Life",
        "words": [
            { "word": "healthy", "phonetic": "/ˈhelθi/", "meaning": "健康的", "example": "Stay healthy." },
            { "word": "vegetable", "phonetic": "/ˈvedʒtəbl/", "meaning": "蔬菜", "example": "Eat vegetables." },
            { "word": "sleep", "phonetic": "/sliːp/", "meaning": "睡觉", "example": "Enough sleep." },
            { "word": "exercise", "phonetic": "/ˈeksəsaɪz/", "meaning": "运动", "example": "Do exercise." },
            { "word": "water", "phonetic": "/ˈwɔːtə/", "meaning": "水", "example": "Drink water." }
        ],
        "lesson": "How do we stay healthy? We should eat many vegetables and fruit. We should drink enough water. We should sleep well every night. We should also do exercise every day."
    }),
    ("grade5", "下", {
        "id": "u3", "title": "Unit 3 Friends Around the World",
        "words": [
            { "word": "world", "phonetic": "/wɜːld/", "meaning": "世界", "example": "Around the world." },
            { "word": "language", "phonetic": "/ˈlæŋɡwɪdʒ/", "meaning": "语言", "example": "Many languages." },
            { "word": "America", "phonetic": "/əˈmerɪkə/", "meaning": "美国", "example": "From America." },
            { "word": "Japan", "phonetic": "/dʒəˈpæn/", "meaning": "日本", "example": "Visit Japan." },
            { "word": "pen pal", "phonetic": "/pen pæl/", "meaning": "笔友", "example": "My pen pal." }
        ],
        "lesson": "I have pen pals from around the world. Lisa lives in America. She speaks English. Kenji is from Japan. He speaks Japanese. We write emails and share our lives. The world is big and wonderful."
    }),
    ("grade5", "下", {
        "id": "u4", "title": "Unit 4 Chinese Culture",
        "words": [
            { "word": "culture", "phonetic": "/ˈkʌltʃə/", "meaning": "文化", "example": "Chinese culture." },
            { "word": "tea", "phonetic": "/tiː/", "meaning": "茶", "example": "Drink tea." },
            { "word": "paper", "phonetic": "/ˈpeɪpə/", "meaning": "纸", "example": "Paper cutting." },
            { "word": "kung fu", "phonetic": "/kʊŋ fuː/", "meaning": "功夫", "example": "Learn kung fu." },
            { "word": "tradition", "phonetic": "/trəˈdɪʃn/", "meaning": "传统", "example": "Old tradition." }
        ],
        "lesson": "Chinese culture has a long history. We drink tea and practice kung fu. Paper cutting is a beautiful art. Chinese calligraphy shows the beauty of words. I love my country's rich traditions."
    }),
    ("grade5", "下", {
        "id": "u5", "title": "Unit 5 Amazing Nature",
        "words": [
            { "word": "nature", "phonetic": "/ˈneɪtʃə/", "meaning": "自然", "example": "Love nature." },
            { "word": "river", "phonetic": "/ˈrɪvə/", "meaning": "河流", "example": "A long river." },
            { "word": "ocean", "phonetic": "/ˈəʊʃn/", "meaning": "海洋", "example": "Deep ocean." },
            { "word": "forest", "phonetic": "/ˈfɒrɪst/", "meaning": "森林", "example": "Green forest." },
            { "word": "amazing", "phonetic": "/əˈmeɪzɪŋ/", "meaning": "惊人的", "example": "Amazing view." }
        ],
        "lesson": "Nature is amazing. Rivers flow through mountains. Oceans are deep and blue. Forests are full of trees and animals. We should protect nature so our planet stays beautiful."
    }),

    # ----------- grade6 -----------
    ("grade6", "上", {
        "id": "u4", "title": "Unit 4 Going Places",
        "words": [
            { "word": "bike", "phonetic": "/baɪk/", "meaning": "自行车", "example": "Ride a bike." },
            { "word": "subway", "phonetic": "/ˈsʌbweɪ/", "meaning": "地铁", "example": "Take the subway." },
            { "word": "car", "phonetic": "/kɑː/", "meaning": "汽车", "example": "By car." },
            { "word": "airport", "phonetic": "/ˈeəpɔːt/", "meaning": "机场", "example": "At the airport." },
            { "word": "station", "phonetic": "/ˈsteɪʃn/", "meaning": "车站", "example": "Train station." }
        ],
        "lesson": "How do you go to school? I go by bike. My friend takes the subway. On weekends we often go to the station or airport to travel. Public transport is convenient in our city."
    }),
    ("grade6", "上", {
        "id": "u5", "title": "Unit 5 Science Fair",
        "words": [
            { "word": "science", "phonetic": "/ˈsaɪəns/", "meaning": "科学", "example": "Science class." },
            { "word": "experiment", "phonetic": "/ɪkˈsperɪmənt/", "meaning": "实验", "example": "Do an experiment." },
            { "word": "interesting", "phonetic": "/ˈɪntrəstɪŋ/", "meaning": "有趣的", "example": "Very interesting." },
            { "word": "project", "phonetic": "/ˈprɒdʒekt/", "meaning": "项目", "example": "School project." },
            { "word": "learn", "phonetic": "/lɜːn/", "meaning": "学习", "example": "Learn new things." }
        ],
        "lesson": "Last week we had a science fair at school. My classmate did an interesting experiment with magnets. I made a small windmill. The teacher said our projects were great. I learned many new things."
    }),
    ("grade6", "下", {
        "id": "u3", "title": "Unit 3 My Best Friend",
        "words": [
            { "word": "kind", "phonetic": "/kaɪnd/", "meaning": "善良的", "example": "A kind person." },
            { "word": "funny", "phonetic": "/ˈfʌni/", "meaning": "有趣的", "example": "A funny story." },
            { "word": "helpful", "phonetic": "/ˈhelpfl/", "meaning": "乐于助人的", "example": "Very helpful." },
            { "word": "share", "phonetic": "/ʃeə/", "meaning": "分享", "example": "Share food." },
            { "word": "always", "phonetic": "/ˈɔːlweɪz/", "meaning": "总是", "example": "Always happy." }
        ],
        "lesson": "My best friend is Lisa. She is kind, funny and helpful. We always study together and share our snacks. When I have problems, she helps me. A good friend is a real treasure."
    }),
    ("grade6", "下", {
        "id": "u4", "title": "Unit 4 Saving Water",
        "words": [
            { "word": "water", "phonetic": "/ˈwɔːtə/", "meaning": "水", "example": "Clean water." },
            { "word": "save", "phonetic": "/seɪv/", "meaning": "节约", "example": "Save water." },
            { "word": "waste", "phonetic": "/weɪst/", "meaning": "浪费", "example": "Don't waste." },
            { "word": "tap", "phonetic": "/tæp/", "meaning": "水龙头", "example": "Close the tap." },
            { "word": "precious", "phonetic": "/ˈpreʃəs/", "meaning": "珍贵的", "example": "Precious water." }
        ],
        "lesson": "Water is very precious. Without water no life can exist. We should not waste water. Close the tap when you brush your teeth. Take short showers. Every drop counts."
    }),

    # ----------- grade7 -----------
    ("grade7", "上", {
        "id": "u3", "title": "Unit 3 Making Friends",
        "words": [
            { "word": "classmate", "phonetic": "/ˈklɑːsmeɪt/", "meaning": "同学", "example": "New classmate." },
            { "word": "introduce", "phonetic": "/ˌɪntrəˈdjuːs/", "meaning": "介绍", "example": "Introduce myself." },
            { "word": "communicate", "phonetic": "/kəˈmjuːnɪkeɪt/", "meaning": "交流", "example": "Communicate well." },
            { "word": "confident", "phonetic": "/ˈkɒnfɪdənt/", "meaning": "自信的", "example": "Be confident." },
            { "word": "friendship", "phonetic": "/ˈfrendʃɪp/", "meaning": "友谊", "example": "Long friendship." }
        ],
        "lesson": "Starting junior high, I met many new classmates. We introduced ourselves and shared our hobbies. Making friends is not hard. Just be kind, confident and ready to communicate. A good friendship lasts a lifetime."
    }),
    ("grade7", "上", {
        "id": "u4", "title": "Unit 4 Healthy Lifestyle",
        "words": [
            { "word": "lifestyle", "phonetic": "/ˈlaɪfstaɪl/", "meaning": "生活方式", "example": "Healthy lifestyle." },
            { "word": "habit", "phonetic": "/ˈhæbɪt/", "meaning": "习惯", "example": "Good habit." },
            { "word": "junk food", "phonetic": "/dʒʌŋk fuːd/", "meaning": "垃圾食品", "example": "Avoid junk food." },
            { "word": "regular", "phonetic": "/ˈreɡjələ/", "meaning": "规律的", "example": "Regular exercise." },
            { "word": "fit", "phonetic": "/fɪt/", "meaning": "健康的", "example": "Keep fit." }
        ],
        "lesson": "A healthy lifestyle is important for teenagers. We should avoid too much junk food and eat balanced meals. Regular exercise keeps us fit. Going to bed early and getting up early are good habits. Health comes first."
    }),
    ("grade7", "下", {
        "id": "u3", "title": "Unit 3 Learning English",
        "words": [
            { "word": "grammar", "phonetic": "/ˈɡræmə/", "meaning": "语法", "example": "English grammar." },
            { "word": "vocabulary", "phonetic": "/vəˈkæbjələri/", "meaning": "词汇", "example": "Big vocabulary." },
            { "word": "practice", "phonetic": "/ˈpræktɪs/", "meaning": "练习", "example": "Daily practice." },
            { "word": "mistake", "phonetic": "/mɪˈsteɪk/", "meaning": "错误", "example": "Learn from mistakes." },
            { "word": "improve", "phonetic": "/ɪmˈpruːv/", "meaning": "提高", "example": "Improve English." }
        ],
        "lesson": "Learning English needs time and practice. Grammar helps us make correct sentences. A big vocabulary helps us express ideas. Don't be afraid of making mistakes. Every mistake is a chance to improve."
    }),
    ("grade7", "下", {
        "id": "u4", "title": "Unit 4 Online Safety",
        "words": [
            { "word": "online", "phonetic": "/ˌɒnˈlaɪn/", "meaning": "在线的", "example": "Online game." },
            { "word": "password", "phonetic": "/ˈpɑːswɜːd/", "meaning": "密码", "example": "Strong password." },
            { "word": "stranger", "phonetic": "/ˈstreɪndʒə/", "meaning": "陌生人", "example": "Stranger online." },
            { "word": "safe", "phonetic": "/seɪf/", "meaning": "安全的", "example": "Stay safe." },
            { "word": "personal", "phonetic": "/ˈpɜːsənl/", "meaning": "个人的", "example": "Personal info." }
        ],
        "lesson": "The internet is useful but we must stay safe. Don't share your password. Don't tell strangers your personal information. Tell your parents if something strange happens online. Be smart and stay safe."
    }),

    # ----------- grade8 -----------
    ("grade8", "上", {
        "id": "u3", "title": "Unit 3 Books I Love",
        "words": [
            { "word": "novel", "phonetic": "/ˈnɒvl/", "meaning": "小说", "example": "A good novel." },
            { "word": "author", "phonetic": "/ˈɔːθə/", "meaning": "作者", "example": "Famous author." },
            { "word": "character", "phonetic": "/ˈkærəktə/", "meaning": "人物", "example": "Main character." },
            { "word": "imagination", "phonetic": "/ɪˌmædʒɪˈneɪʃn/", "meaning": "想象力", "example": "Rich imagination." },
            { "word": "recommend", "phonetic": "/ˌrekəˈmend/", "meaning": "推荐", "example": "Recommend a book." }
        ],
        "lesson": "My favorite book is 'Harry Potter'. J.K. Rowling is the author. The main character Harry is brave and kind. The story takes us to a magical world. I recommend it to everyone who loves imagination."
    }),
    ("grade8", "上", {
        "id": "u4", "title": "Unit 4 Social Manners",
        "words": [
            { "word": "manners", "phonetic": "/ˈmænəz/", "meaning": "礼貌", "example": "Good manners." },
            { "word": "respect", "phonetic": "/rɪˈspekt/", "meaning": "尊重", "example": "Respect others." },
            { "word": "queue", "phonetic": "/kjuː/", "meaning": "排队", "example": "Queue up." },
            { "word": "apologize", "phonetic": "/əˈpɒlədʒaɪz/", "meaning": "道歉", "example": "Apologize sincerely." },
            { "word": "behavior", "phonetic": "/bɪˈheɪvjə/", "meaning": "行为", "example": "Good behavior." }
        ],
        "lesson": "Good manners show our respect for others. We should say please and thank you. We should queue up in public places. If we make mistakes, we should apologize. Good behavior makes our society more pleasant."
    }),
    ("grade8", "下", {
        "id": "u3", "title": "Unit 3 My School Life",
        "words": [
            { "word": "classroom", "phonetic": "/ˈklɑːsruːm/", "meaning": "教室", "example": "Big classroom." },
            { "word": "classmate", "phonetic": "/ˈklɑːsmeɪt/", "meaning": "同学", "example": "Kind classmate." },
            { "word": "uniform", "phonetic": "/ˈjuːnɪfɔːm/", "meaning": "校服", "example": "School uniform." },
            { "word": "canteen", "phonetic": "/kænˈtiːn/", "meaning": "食堂", "example": "School canteen." },
            { "word": "activity", "phonetic": "/ækˈtɪvəti/", "meaning": "活动", "example": "After-school activity." }
        ],
        "lesson": "I love my school life. Every morning we wear our uniforms and have classes together with our classmates. We have lunch at the canteen. After school, I join the music club. School life is busy but full of fun."
    }),
    ("grade8", "下", {
        "id": "u4", "title": "Unit 4 Kindness Matters",
        "words": [
            { "word": "kindness", "phonetic": "/ˈkaɪndnəs/", "meaning": "善良", "example": "Show kindness." },
            { "word": "donate", "phonetic": "/dəʊˈneɪt/", "meaning": "捐赠", "example": "Donate books." },
            { "word": "orphan", "phonetic": "/ˈɔːfn/", "meaning": "孤儿", "example": "Help orphans." },
            { "word": "hope", "phonetic": "/həʊp/", "meaning": "希望", "example": "Give hope." },
            { "word": "change", "phonetic": "/tʃeɪndʒ/", "meaning": "改变", "example": "Change the world." }
        ],
        "lesson": "Small kindness can change the world. Last month our class donated clothes and books to an orphanage. The children there were happy and grateful. Kindness gives people hope. Let's be kind to everyone we meet."
    }),

    # ----------- grade9 -----------
    ("grade9", "上", {
        "id": "u3", "title": "Unit 3 Music and Life",
        "words": [
            { "word": "music", "phonetic": "/ˈmjuːzɪk/", "meaning": "音乐", "example": "Classical music." },
            { "word": "instrument", "phonetic": "/ˈɪnstrəmənt/", "meaning": "乐器", "example": "Musical instrument." },
            { "word": "piano", "phonetic": "/piˈænəʊ/", "meaning": "钢琴", "example": "Play the piano." },
            { "word": "concert", "phonetic": "/ˈkɒnsət/", "meaning": "音乐会", "example": "Attend a concert." },
            { "word": "emotion", "phonetic": "/ɪˈməʊʃn/", "meaning": "情感", "example": "Express emotion." }
        ],
        "lesson": "Music plays an important role in our lives. It expresses different emotions and connects people from all over the world. Many students learn instruments like the piano or violin. Going to concerts is also a wonderful experience."
    }),
    ("grade9", "上", {
        "id": "u4", "title": "Unit 4 Chinese Heritage",
        "words": [
            { "word": "heritage", "phonetic": "/ˈherɪtɪdʒ/", "meaning": "遗产", "example": "Cultural heritage." },
            { "word": "temple", "phonetic": "/ˈtempl/", "meaning": "寺庙", "example": "Old temple." },
            { "word": "palace", "phonetic": "/ˈpæləs/", "meaning": "宫殿", "example": "Royal palace." },
            { "word": "protect", "phonetic": "/prəˈtekt/", "meaning": "保护", "example": "Protect heritage." },
            { "word": "treasure", "phonetic": "/ˈtreʒə/", "meaning": "珍宝", "example": "National treasure." }
        ],
        "lesson": "China has a rich cultural heritage. The Forbidden City, the Great Wall and ancient temples are treasures that tell our long history. They belong not only to China, but also to the world. We must protect them for future generations."
    }),
    ("grade9", "下", {
        "id": "u3", "title": "Unit 3 Environmental Action",
        "words": [
            { "word": "environment", "phonetic": "/ɪnˈvaɪrənmənt/", "meaning": "环境", "example": "Protect environment." },
            { "word": "pollution", "phonetic": "/pəˈluːʃn/", "meaning": "污染", "example": "Reduce pollution." },
            { "word": "recycle", "phonetic": "/ˌriːˈsaɪkl/", "meaning": "回收", "example": "Recycle paper." },
            { "word": "renewable", "phonetic": "/rɪˈnjuːəbl/", "meaning": "可再生的", "example": "Renewable energy." },
            { "word": "responsibility", "phonetic": "/rɪˌspɒnsəˈbɪləti/", "meaning": "责任", "example": "Our responsibility." }
        ],
        "lesson": "Protecting the environment is everyone's responsibility. We should reduce pollution and recycle waste. Using renewable energy like solar power is a great idea. Small actions in daily life, like saving electricity, can make a big difference."
    }),
    ("grade9", "下", {
        "id": "u4", "title": "Unit 4 Science and Technology",
        "words": [
            { "word": "technology", "phonetic": "/tekˈnɒlədʒi/", "meaning": "科技", "example": "Modern technology." },
            { "word": "artificial", "phonetic": "/ˌɑːtɪˈfɪʃl/", "meaning": "人工的", "example": "Artificial intelligence." },
            { "word": "robot", "phonetic": "/ˈrəʊbɒt/", "meaning": "机器人", "example": "Smart robot." },
            { "word": "space", "phonetic": "/speɪs/", "meaning": "太空", "example": "Explore space." },
            { "word": "benefit", "phonetic": "/ˈbenɪfɪt/", "meaning": "益处", "example": "Great benefits." }
        ],
        "lesson": "Science and technology are changing our lives quickly. Artificial intelligence and robots help us in many ways. We explore space and make new discoveries every year. Technology brings great benefits, but we must use it wisely."
    }),
]


def main():
    with io.open(PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    added = 0
    for gkey, term, unit in NEW_UNITS:
        arr = data['grades'].setdefault(gkey, {}).setdefault(term, [])
        existing_ids = {u['id'] for u in arr}
        if unit['id'] in existing_ids:
            print(f"  [skip] {gkey} {term} {unit['id']} already exists")
            continue
        arr.append(unit)
        added += 1
        print(f"  [add ] {gkey} {term} {unit['id']}: {unit['title']}")

    # 写回
    with io.open(PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # 统计
    total = 0
    for gkey, terms in data['grades'].items():
        for term, units in terms.items():
            total += len(units)
            print(f"  {gkey} {term}: {len(units)} units")
    print(f"\n[done] 新增 {added} 个单元，现总计 {total} 个单元")


if __name__ == '__main__':
    main()
