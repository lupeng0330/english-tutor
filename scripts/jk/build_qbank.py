# -*- coding: utf-8 -*-
"""
jk 教科版题库构建器（AI 精造，单一数据源、可重建、按册扩展）
- 题型：拼写(每词1题) / 语法句型(2-3/单元) / 听力(1-2/单元，配 MP3) / 阅读(1-2/单元，grade3+)
- 输出：data/questions/jk_{spelling,grammar,listening,reading}.json（全量重建）
- code 规则：{1-6}{A/B}_U{n}，与 matchUnit 按 _U{n} 匹配完全兼容
- 听力 audioFile：jk_listening_{book}_{NN}.mp3（由 gen_jk_listening.py 生成）
运行：python scripts/jk/build_qbank.py --write    (写入题库 JSON)
"""
import os, json, argparse

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
QDIR = os.path.join(ROOT, 'data', 'questions')


def hint_of(word):
    w = word
    if len(w) <= 2:
        return w[0] + '_' * (len(w) - 1)
    return w[0] + '_' * (len(w) - 2) + w[-1]


# ============ 数据源（按册，精造后填入）============
BOOKS = {
    # grade3上 - 9单元 70词（主力区，待精造）
    '3A': {'grade': 3, 'term': '上', 'units': [
                {
                    'code': "3A_U1",
                    'words': [
                        ("letter", "字母；信"),
                        ("big letter", "大写字母"),
                        ("small letter", "小写字母"),
                        ("alphabet", "字母表"),
                        ("sign", "标志；招牌"),
                        ("bus", "公共汽车"),
                        ("name", "名字"),
                        ("life", "生活"),
                    ],
                    'grammar': [
                        {"q": "There ____ letters on the sign.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 letters 后用 are"},
                        {"q": "I can see a big ____ B.", "options": ["letter", "letters", "the letter"], "answer": 0, "explain": "a 后面跟单数名词 letter"},
                    ],
                    'listening': [
                        {"audioText": "W: Look! There are letters on the sign. M: Yes! I can see a big letter B.", "q": "What does the boy see?", "options": ["A big letter B", "A bus", "A book"], "answer": 0, "explain": "男孩说 I can see a big letter B"},
                    ],
                    'reading': [
                        {"passage": "We have 26 letters in the alphabet. Some letters are big, and some are small. We see them on signs, on a bus, and in books.", "q": "How many letters are in the alphabet?", "options": ["26", "20", "30"], "answer": 0, "explain": "文中明确说 26 letters"},
                    ],
                },
                {
                    'code': "3A_U2",
                    'words': [
                        ("English", "英语"),
                        ("Chinese", "汉语；中文"),
                        ("word", "单词"),
                        ("say", "说"),
                        ("mean", "意思是"),
                        ("same", "相同的"),
                        ("different", "不同的"),
                        ("read", "读"),
                    ],
                    'grammar': [
                        {"q": "English words ____ be different from Chinese words.", "options": ["can", "cans", "is"], "answer": 0, "explain": "can 后面跟动词原形 be"},
                        {"q": "We say \"hello\" ____ English.", "options": ["in", "on", "at"], "answer": 0, "explain": "用某种语言说用 in"},
                        {"q": "\"Book\" and \"look\" ____ the same.", "options": ["sound", "sounds", "sounding"], "answer": 0, "explain": "复数主语用 sound"},
                        {"q": "____ colour is your English book?", "options": ["What", "Where", "Who"], "answer": 0, "explain": "问颜色用 What colour"},
                    ],
                    'listening': [
                        {"audioText": "W: How do you say \"book\" in Chinese? M: We say \"shu\". It means the same thing.", "q": "What does \"book\" mean in Chinese?", "options": ["shu", "bi", "chi"], "answer": 0, "explain": "回答 We say \"shu\""},
                        {"audioText": "M: Can you read this English word? W: Yes, I can. It is \"apple\". W: What does it mean? M: It means a kind of fruit.", "q": "What does the word \"apple\" mean?", "options": ["A kind of fruit", "A colour", "A name"], "answer": 0, "explain": "M 说 It means a kind of fruit"},
                    ],
                    'reading': [
                        {"passage": "English and Chinese are two languages. The words look different, but some things are the same. We say \"hello\" in English. We say \"ni hao\" in Chinese.", "q": "What is the same between English and Chinese?", "options": ["They both can say hello", "Words look the same", "They are one language"], "answer": 0, "explain": "hello 和 ni hao 都表示友好的问候"},
                    ],
                },
                {
                    'code': "3A_U3",
                    'words': [
                        ("who", "谁"),
                        ("he", "他"),
                        ("she", "她"),
                        ("friend", "朋友"),
                        ("teacher", "老师"),
                        ("classmate", "同学"),
                        ("boy", "男孩"),
                        ("girl", "女孩"),
                    ],
                    'grammar': [
                        {"q": "Who ____ he? He ____ my friend.", "options": ["is / is", "is / am", "are / is"], "answer": 0, "explain": "第三人称单数 he 后用 is"},
                        {"q": "____ is she? She is Lily.", "options": ["Who", "What", "How"], "answer": 0, "explain": "问人用 Who"},
                    ],
                    'listening': [
                        {"audioText": "W: Look at the photo. Who is he? M: He is my friend, Tom.", "q": "Who is the boy in the photo?", "options": ["Tom", "Lily", "Sam"], "answer": 0, "explain": "回答 He is my friend, Tom"},
                    ],
                    'reading': [
                        {"passage": "I have many friends at school. He is Tom. He is a happy boy. She is Lily. She is a kind girl. Miss Wang is our teacher.", "q": "Who is the teacher?", "options": ["Miss Wang", "Tom", "Lily"], "answer": 0, "explain": "文中说 Miss Wang is our teacher"},
                    ],
                },
                {
                    'code': "3A_U4",
                    'words': [
                        ("colour", "颜色；上色"),
                        ("red", "红色的"),
                        ("blue", "蓝色的"),
                        ("yellow", "黄色的"),
                        ("green", "绿色的"),
                        ("keyboard", "键盘"),
                        ("key", "按键"),
                        ("click", "点击"),
                    ],
                    'grammar': [
                        {"q": "What colour ____ this key? It ____ blue.", "options": ["is / is", "are / is", "is / are"], "answer": 0, "explain": "单数 key 用 is"},
                        {"q": "Colour ____ red, please.", "options": ["it", "they", "he"], "answer": 0, "explain": "指代单数物品用 it"},
                    ],
                    'listening': [
                        {"audioText": "M: What colour is this key? W: Colour it red, please.", "q": "What colour is the key?", "options": ["Red", "Blue", "Yellow"], "answer": 0, "explain": "老师说 Colour it red"},
                    ],
                    'reading': [
                        {"passage": "I have a keyboard with many keys. This key is red. That key is blue. Here is a yellow key, and there is a green one.", "q": "How many colours are on the keyboard?", "options": ["Four", "Two", "Six"], "answer": 0, "explain": "文中提到 red, blue, yellow, green 四种颜色"},
                    ],
                },
                {
                    'code': "3A_U5",
                    'words': [
                        ("password", "密码"),
                        ("number", "数字；号码"),
                        ("set", "设置"),
                        ("secret", "秘密（的）"),
                        ("safe", "安全的"),
                        ("remember", "记住"),
                        ("type", "输入；打字"),
                        ("ten", "十"),
                    ],
                    'grammar': [
                        {"q": "How many ____ do we need?", "options": ["numbers", "number", "a number"], "answer": 0, "explain": "How many 后用可数名词复数"},
                        {"q": "Don't tell your password ____ others.", "options": ["to", "for", "at"], "answer": 0, "explain": "tell... to 是固定搭配"},
                    ],
                    'listening': [
                        {"audioText": "W: Let's set a password. How many numbers do we need? M: Pick four numbers, from one to ten.", "q": "How many numbers for the password?", "options": ["Four", "Ten", "Two"], "answer": 0, "explain": "回答 Pick four numbers"},
                    ],
                    'reading': [
                        {"passage": "A password is a special secret. It is made of numbers, like 2, 5, 8, 0. We type the password to keep things safe. Don't tell your password to others.", "q": "What should we NOT do with a password?", "options": ["Tell it to others", "Remember it", "Keep it safe"], "answer": 0, "explain": "文中说 Don't tell your password to others"},
                    ],
                },
                {
                    'code': "3A_U6",
                    'words': [
                        ("draw", "画"),
                        ("can", "能；会"),
                        ("picture", "图画"),
                        ("line", "线"),
                        ("circle", "圆"),
                        ("paint", "用颜料画"),
                        ("pen", "笔"),
                        ("nice", "漂亮的；好的"),
                    ],
                    'grammar': [
                        {"q": "I ____ draw a picture.", "options": ["can", "cans", "am"], "answer": 0, "explain": "can 后跟动词原形，不随人称变化"},
                        {"q": "Can you ____ it?", "options": ["paint", "paints", "painting"], "answer": 0, "explain": "Can 后面动词用原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Look, I can draw a circle for the sun! M: Wow! It is so nice.", "q": "What did the girl draw?", "options": ["A circle", "A flower", "A star"], "answer": 0, "explain": "女孩说 I can draw a circle"},
                    ],
                    'reading': [
                        {"passage": "I like to draw with my pen. First, I draw a circle. It is the sun. Then I draw two lines. They are the road. I paint the picture with red and green.", "q": "What does the circle become?", "options": ["The sun", "The road", "A ball"], "answer": 0, "explain": "文中说 It is the sun"},
                    ],
                },
                {
                    'code': "3A_U7",
                    'words': [
                        ("listen", "听"),
                        ("listener", "倾听者"),
                        ("hear", "听见"),
                        ("ear", "耳朵"),
                        ("quiet", "安静的"),
                        ("good", "好的"),
                        ("careful", "仔细的"),
                        ("please", "请"),
                    ],
                    'grammar': [
                        {"q": "Please ____ quiet.", "options": ["be", "is", "are"], "answer": 0, "explain": "祈使句 Please 后用动词原形 be"},
                        {"q": "Be a good ____, and you have more friends.", "options": ["listener", "listen", "listening"], "answer": 0, "explain": "good 后接名词 listener"},
                    ],
                    'listening': [
                        {"audioText": "M: Class, please be quiet. I will listen now. W: Good! A good listener learns a lot.", "q": "What makes a good listener?", "options": ["Being quiet", "Talking loudly", "Running fast"], "answer": 0, "explain": "老师说 Please be quiet"},
                    ],
                    'reading': [
                        {"passage": "A good listener is quiet and careful. We listen with our ears, not our mouths. When a friend talks, we hear every word. Be a good listener, and you have more friends.", "q": "How do we become a good listener?", "options": ["Be quiet and careful", "Talk more", "Run and jump"], "answer": 0, "explain": "文中说 A good listener is quiet and careful"},
                    ],
                },
                {
                    'code': "3A_U8",
                    'words': [
                        ("exercise", "锻炼"),
                        ("time", "时间"),
                        ("run", "跑"),
                        ("jump", "跳"),
                        ("swim", "游泳"),
                        ("play", "玩；做（运动）"),
                        ("sport", "运动"),
                        ("healthy", "健康的"),
                    ],
                    'grammar': [
                        {"q": "It's time ____ exercise!", "options": ["to", "for", "at"], "answer": 0, "explain": "It's time to + 动词原形"},
                        {"q": "Sport ____ us healthy.", "options": ["makes", "make", "making"], "answer": 0, "explain": "Sport 是第三人称单数，动词加 -s"},
                    ],
                    'listening': [
                        {"audioText": "M: It's time to exercise! We can run, jump and play ball. W: I love exercise!", "q": "What can they do for exercise?", "options": ["Run and jump", "Read books", "Draw pictures"], "answer": 0, "explain": "老师说 We can run, jump and play ball"},
                    ],
                    'reading': [
                        {"passage": "Exercise is good for us every day. In the morning, I run and jump. In summer, I like to swim. After school, my friends and I play ball. We do sports and stay healthy and happy!", "q": "Why do we exercise?", "options": ["To stay healthy and happy", "To read books", "To eat food"], "answer": 0, "explain": "文中说 We do sports and stay healthy and happy!"},
                    ],
                },
                {
                    'code': "3A_U9",
                    'words': [
                        ("music", "音乐"),
                        ("show", "表演；展示"),
                        ("sing", "唱"),
                        ("song", "歌曲"),
                        ("dance", "跳舞"),
                        ("stage", "舞台"),
                    ],
                    'grammar': [
                        {"q": "Let's ____ a music show.", "options": ["have", "has", "having"], "answer": 0, "explain": "Let's 后跟动词原形"},
                        {"q": "I can ____ an English song.", "options": ["sing", "sings", "singing"], "answer": 0, "explain": "can 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Let's have a music show! Who can sing an English song? M: I can!", "q": "Who can sing an English song?", "options": ["The boy", "Lily", "Miss Wang"], "answer": 0, "explain": "男孩回答 I can"},
                    ],
                    'reading': [
                        {"passage": "This term we learned so much. We know letters, words, colours and numbers. We can draw, listen, exercise and play. Now we sing and dance in our music show.", "q": "What do they do in the music show?", "options": ["Sing and dance", "Draw pictures", "Type words"], "answer": 0, "explain": "文中说 We sing and dance in our music show"},
                    ],
                },
            ]},
    # grade3下 - 9单元 70词
    '3B': {'grade': 3, 'term': '下', 'units': [
                {
                    'code': "3B_U1",
                    'words': [
                        ("get up", "起床"),
                        ("morning", "早晨"),
                        ("breakfast", "早餐"),
                        ("wash", "洗"),
                        ("face", "脸"),
                        ("brush", "刷"),
                        ("tooth", "牙齿"),
                        ("ready", "准备好的"),
                    ],
                    'grammar': [
                        {"q": "It's time to ____ up.", "options": ["get", "gets", "getting"], "answer": 0, "explain": "It's time to 后跟动词原形"},
                        {"q": "I brush my ____ every morning.", "options": ["teeth", "tooth", "tooths"], "answer": 0, "explain": "tooth 的复数是 teeth"},
                    ],
                    'listening': [
                        {"audioText": "W: Anna, it's seven o'clock. Get up! M: OK, Mum. Wash my face and brush my teeth.", "q": "What does Anna do first?", "options": ["Wash her face", "Eat breakfast", "Go to school"], "answer": 0, "explain": "妈妈说 Wash your face and brush your teeth"},
                    ],
                    'reading': [
                        {"passage": "I get up at seven every morning. First I wash my face. Then I brush my teeth. I eat breakfast with my family. At seven thirty, I am ready for school.", "q": "What time does the child get up?", "options": ["Seven o'clock", "Eight o'clock", "Six o'clock"], "answer": 0, "explain": "文中说 I get up at seven"},
                    ],
                },
                {
                    'code': "3B_U2",
                    'words': [
                        ("day", "一天；日子"),
                        ("fun", "乐趣；好玩的"),
                        ("happy", "高兴的"),
                        ("tired", "累的"),
                        ("busy", "忙碌的"),
                        ("school", "学校"),
                        ("home", "家"),
                        ("great", "极好的"),
                    ],
                    'grammar': [
                        {"q": "How ____ your day?", "options": ["was", "is", "were"], "answer": 0, "explain": "问已经过去的一天用过去式 was"},
                        {"q": "We ____ games at school.", "options": ["played", "play", "plays"], "answer": 0, "explain": "已经发生的事用过去式 played"},
                        {"q": "I ____ very happy today.", "options": ["am", "is", "are"], "answer": 0, "explain": "I 后用 am"},
                        {"q": "I like ____ school.", "options": ["my", "me", "I"], "answer": 0, "explain": "my + 名词"},
                    ],
                    'listening': [
                        {"audioText": "M: Hi, Anna! How was your day? W: Great! We played games at school. I am very happy but tired.", "q": "How does Anna feel?", "options": ["Happy but tired", "Sad and angry", "Busy and hungry"], "answer": 0, "explain": "Anna 说 I am very happy but tired"},
                        {"audioText": "W: What a busy day! M: Yes. We had four classes and ran on the playground. W: I am so hungry now. Let's go home.", "q": "Why are they so hungry?", "options": ["They had classes and ran a lot", "They forgot to eat", "They cooked too much"], "answer": 0, "explain": "他们上了四节课还在操场跑步，所以很饿"},
                    ],
                    'reading': [
                        {"passage": "Today is a busy day. In the morning I went to school. We sang songs and played games. After school I helped Mum at home. At night I read a book in bed. I was tired but happy. What a great day!", "q": "What did the child do after school?", "options": ["Helped Mum", "Played more games", "Went to a party"], "answer": 0, "explain": "文中说 After school I helped Mum at home"},
                    ],
                },
                {
                    'code': "3B_U3",
                    'words': [
                        ("plan", "计划"),
                        ("time", "时间"),
                        ("clock", "钟"),
                        ("first", "首先"),
                        ("then", "然后"),
                        ("next", "接下来"),
                        ("finish", "完成"),
                        ("homework", "家庭作业"),
                    ],
                    'grammar': [
                        {"q": "____ I read a book, ____ I play.", "options": ["First / then", "Then / first", "Next / first"], "answer": 0, "explain": "顺序词 First...then... 表示先后"},
                        {"q": "I will ____ my homework after school.", "options": ["finish", "finishes", "finishing"], "answer": 0, "explain": "will 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Look at my plan for Saturday! M: Cool! What will you do first? W: First I'll read a book. Then I'll play with my dog.", "q": "What will she do first on Saturday?", "options": ["Read a book", "Play with her dog", "Do homework"], "answer": 0, "explain": "Anna 说 First I'll read a book"},
                    ],
                    'reading': [
                        {"passage": "There is a big clock on the wall. It tells me the time. At seven, I get up. At eight, I am at school. At four, school is over. I finish my homework at seven. Time flies fast — make a good plan every day!", "q": "When does school finish?", "options": ["At four o'clock", "At seven o'clock", "At twelve o'clock"], "answer": 0, "explain": "文中说 At four, school is over"},
                    ],
                },
                {
                    'code': "3B_U4",
                    'words': [
                        ("come", "来"),
                        ("join", "加入"),
                        ("game", "游戏"),
                        ("party", "聚会"),
                        ("together", "一起"),
                        ("welcome", "欢迎"),
                        ("friend", "朋友"),
                        ("sure", "当然"),
                    ],
                    'grammar': [
                        {"q": "Come and ____ us!", "options": ["join", "joins", "joining"], "answer": 0, "explain": "祈使句用动词原形"},
                        {"q": "We'll ____ games and sing songs.", "options": ["play", "plays", "played"], "answer": 0, "explain": "We'll = We will，后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, I have a party on Sunday. Come and join us! M: Sure! We'll play games and sing songs together.", "q": "What will they do at the party?", "options": ["Play games and sing songs", "Read books", "Do homework"], "answer": 0, "explain": "Ben 说 We'll play games and sing songs"},
                    ],
                    'reading': [
                        {"passage": "On Sunday, my friends came to my home. We had a party. We played games and ate cakes. We sang songs together. Ben said, \"Thank you, Anna. I am so happy today.\" Friends make us smile!", "q": "How did Ben feel at the party?", "options": ["Happy", "Tired", "Hungry"], "answer": 0, "explain": "Ben 说 I am so happy today"},
                    ],
                },
                {
                    'code': "3B_U5",
                    'words': [
                        ("classroom", "教室"),
                        ("desk", "课桌"),
                        ("chair", "椅子"),
                        ("clean", "干净的；打扫"),
                        ("tidy", "整洁的"),
                        ("poster", "海报"),
                        ("rule", "规则"),
                        ("call", "呼唤；号召"),
                    ],
                    'grammar': [
                        {"q": "There ____ a big poster on the wall.", "options": ["is", "are", "am"], "answer": 0, "explain": "There be 句型中单数 poster 用 is"},
                        {"q": "Our classroom ____ small but warm.", "options": ["is", "are", "am"], "answer": 0, "explain": "单数 classroom 后用 is"},
                    ],
                    'listening': [
                        {"audioText": "M: Look at our new classroom! W: Wow, it's so clean and tidy. M: There is a big poster on the wall. It's our class call.", "q": "What is on the wall?", "options": ["A big poster", "A clock", "A picture"], "answer": 0, "explain": "Ben 说 There is a big poster on the wall"},
                    ],
                    'reading': [
                        {"passage": "Our classroom is small but warm. Each desk and chair has a name on it. We have three class rules: keep clean, keep tidy, and help each other. Our class call is \"One team, one dream!\" We love our class!", "q": "How many class rules do they have?", "options": ["Three", "Two", "Five"], "answer": 0, "explain": "文中说 We have three class rules"},
                    ],
                },
                {
                    'code': "3B_U6",
                    'words': [
                        ("duty", "职责；值日"),
                        ("water", "浇水；水"),
                        ("plant", "植物"),
                        ("wipe", "擦"),
                        ("window", "窗户"),
                        ("sweep", "扫"),
                        ("floor", "地板"),
                        ("help", "帮助"),
                    ],
                    'grammar': [
                        {"q": "I ____ on duty today.", "options": ["am", "is", "are"], "answer": 0, "explain": "I 后用 am"},
                        {"q": "Ben helps me ____ the windows.", "options": ["clean", "cleans", "cleaning"], "answer": 0, "explain": "help someone + 动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: I'm on duty today. What should I do? M: First, sweep the floor. Then wipe the windows and water the plants.", "q": "What should she do first?", "options": ["Sweep the floor", "Water the plants", "Wipe the windows"], "answer": 0, "explain": "Ben 说 First, sweep the floor"},
                    ],
                    'reading': [
                        {"passage": "Today is my duty day. After class, I sweep the floor and wipe the desks. Ben helps me clean the windows. The little plants by the window look thirsty, so I water them. Now our classroom is clean and bright. Helping is fun!", "q": "Why does she water the plants?", "options": ["They look thirsty", "The teacher tells her", "She likes playing with water"], "answer": 0, "explain": "文中说 The little plants look thirsty"},
                    ],
                },
                {
                    'code': "3B_U7",
                    'words': [
                        ("rule", "规则"),
                        ("don't", "不要"),
                        ("should", "应该"),
                        ("run", "跑"),
                        ("shout", "喊；大声叫"),
                        ("walk", "走"),
                        ("hall", "走廊；大厅"),
                        ("safe", "安全的"),
                    ],
                    'grammar': [
                        {"q": "____ run in the hall.", "options": ["Don't", "Not", "No"], "answer": 0, "explain": "祈使句否定用 Don't + 动词原形"},
                        {"q": "You ____ walk, not run.", "options": ["should", "shoulds", "shoulding"], "answer": 0, "explain": "should 后跟动词原形，表示建议"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, don't run in the hall! M: Sorry, I'm late for class. W: You should walk, not run. It's safer.", "q": "Why should Ben walk?", "options": ["It's safer", "It's faster", "It's funnier"], "answer": 0, "explain": "Anna 说 It's safer"},
                    ],
                    'reading': [
                        {"passage": "Our school has some easy rules. Don't run in the hall. Don't shout in class. We should walk slowly and speak quietly. We should be kind to friends and listen to the teacher. Rules keep us safe and happy.", "q": "Why do we have school rules?", "options": ["To keep us safe and happy", "To make us run faster", "To give us homework"], "answer": 0, "explain": "文中说 Rules keep us safe and happy"},
                    ],
                },
                {
                    'code': "3B_U8",
                    'words': [
                        ("polite", "有礼貌的"),
                        ("please", "请"),
                        ("thanks", "谢谢"),
                        ("sorry", "抱歉"),
                        ("excuse", "请原谅"),
                        ("greet", "问候"),
                        ("smile", "微笑"),
                        ("kind", "友善的"),
                    ],
                    'grammar': [
                        {"q": "Excuse ____, may I borrow your pen?", "options": ["me", "I", "my"], "answer": 0, "explain": "Excuse me 是固定搭配"},
                        {"q": "A polite person ____ many friends.", "options": ["has", "have", "having"], "answer": 0, "explain": "第三人称单数 person 后用 has"},
                    ],
                    'listening': [
                        {"audioText": "M: Excuse me, may I borrow your pen? W: Sure, here you are. M: Thanks a lot! W: You're welcome.", "q": "What does the boy want to borrow?", "options": ["A pen", "A book", "A ruler"], "answer": 0, "explain": "男孩说 May I borrow your pen"},
                    ],
                    'reading': [
                        {"passage": "\"Please\", \"thanks\", and \"sorry\" are magic words. When we want something, we say \"please\". When others help us, we say \"thanks\". When we make a mistake, we say \"sorry\". A kind smile and a polite word can warm a cold day. Be polite and you will have many friends!", "q": "What are the three magic words?", "options": ["Please, thanks, sorry", "Hello, goodbye, yes", "Run, jump, play"], "answer": 0, "explain": "文中说 Please, thanks, and sorry are magic words"},
                    ],
                },
                {
                    'code': "3B_U9",
                    'words': [
                        ("road", "路"),
                        ("help", "帮助"),
                        ("light", "灯"),
                        ("stop", "停"),
                        ("go", "走"),
                        ("wait", "等"),
                    ],
                    'grammar': [
                        {"q": "Red light means ____.", "options": ["stop", "go", "run"], "answer": 0, "explain": "红灯停是交通规则"},
                        {"q": "Be ____ on the road.", "options": ["safe", "safely", "safety"], "answer": 0, "explain": "Be + 形容词，safe 是形容词"},
                    ],
                    'listening': [
                        {"audioText": "W: Today is Road Helper Day! I help kids cross the road. M: What do you say? W: Red light, stop! Green light, go!", "q": "What does green light mean?", "options": ["Go", "Stop", "Wait"], "answer": 0, "explain": "Anna 说 Green light, go"},
                    ],
                    'reading': [
                        {"passage": "Every Friday is our Road Helper Day. We stand by the road. When the light is red, we say \"Stop and wait\". When the light is green, we say \"Now you can go\". The children smile and say \"Thanks\". Helping others is a great way to start the day!", "q": "What day is Road Helper Day?", "options": ["Friday", "Monday", "Sunday"], "answer": 0, "explain": "文中说 Every Friday is our Road Helper Day"},
                    ],
                },
            ]},
    # grade4上 - 9单元 70词
    '4A': {'grade': 4, 'term': '上', 'units': [
                {
                    'code': "4A_U1",
                    'words': [
                        ("welcome", "欢迎"),
                        ("come in", "进来"),
                        ("house", "房子"),
                        ("living room", "客厅"),
                        ("kitchen", "厨房"),
                        ("bedroom", "卧室"),
                        ("sofa", "沙发"),
                        ("beautiful", "漂亮的"),
                    ],
                    'grammar': [
                        {"q": "Welcome ____ my home!", "options": ["to", "in", "at"], "answer": 0, "explain": "Welcome to 是固定搭配"},
                        {"q": "There ____ a soft sofa in the living room.", "options": ["is", "are", "am"], "answer": 0, "explain": "There be 句型中单数 sofa 用 is"},
                    ],
                    'listening': [
                        {"audioText": "W: Hi, Ben! Welcome to my home. M: Wow, what a beautiful house! W: Come in, please. This is our living room.", "q": "Where are they?", "options": ["At Anna's home", "At school", "At the zoo"], "answer": 0, "explain": "Anna 说 Welcome to my home"},
                    ],
                    'reading': [
                        {"passage": "I have a new home. It is small but very beautiful. There is a soft sofa in the living room. The kitchen is white and clean. My bedroom has a small bed and a desk. Welcome to my home — come in and have a look!", "q": "What colour is the kitchen?", "options": ["White", "Black", "Blue"], "answer": 0, "explain": "文中说 The kitchen is white and clean"},
                    ],
                },
                {
                    'code': "4A_U2",
                    'words': [
                        ("family", "家庭"),
                        ("father", "父亲"),
                        ("mother", "母亲"),
                        ("brother", "兄弟"),
                        ("sister", "姐妹"),
                        ("grandpa", "爷爷"),
                        ("grandma", "奶奶"),
                        ("love", "爱"),
                    ],
                    'grammar': [
                        {"q": "Who ____ the man with glasses?", "options": ["is", "are", "am"], "answer": 0, "explain": "单数 the man 后用 is"},
                        {"q": "There ____ six people in my family.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 six people 后用 are"},
                        {"q": "My ____ is a teacher.", "options": ["mother", "fathers", "mothers"], "answer": 0, "explain": "mother 单数"},
                        {"q": "I ____ a big family.", "options": ["have", "has", "am"], "answer": 0, "explain": "I 后用 have"},
                    ],
                    'listening': [
                        {"audioText": "W: Look, Ben. This is my family photo. M: Who is the man with glasses? W: He's my father. The kind lady is my mother.", "q": "Who is the man with glasses?", "options": ["Her father", "Her brother", "Her grandpa"], "answer": 0, "explain": "Anna 说 He's my father"},
                        {"audioText": "M: How many people in your family? W: Five — grandpa, grandma, father, mother and me. M: That's a warm family!", "q": "How many people in Anna's family?", "options": ["Five", "Four", "Six"], "answer": 0, "explain": "Anna 说 Five"},
                    ],
                    'reading': [
                        {"passage": "There are six people in my family. My father is a doctor. My mother is a teacher. I have one brother and one sister. Grandpa and Grandma live with us. After dinner, we talk together. We love each other very much.", "q": "What does the mother do?", "options": ["She is a teacher", "She is a doctor", "She is a cook"], "answer": 0, "explain": "文中说 My mother is a teacher"},
                    ],
                },
                {
                    'code': "4A_U3",
                    'words': [
                        ("study", "书房；学习"),
                        ("bathroom", "浴室"),
                        ("table", "桌子"),
                        ("lamp", "灯"),
                        ("bed", "床"),
                        ("door", "门"),
                        ("garden", "花园"),
                        ("upstairs", "在楼上"),
                    ],
                    'grammar': [
                        {"q": "My bedroom is ____.", "options": ["upstairs", "downstairs", "outside"], "answer": 0, "explain": "课文说卧室在楼上"},
                        {"q": "I do my homework at the ____.", "options": ["desk", "bed", "sofa"], "answer": 0, "explain": "在书桌前做作业"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, can you show me your house? W: Sure! This is the kitchen, and that is the study. My bedroom is upstairs.", "q": "Where is the bedroom?", "options": ["Upstairs", "Downstairs", "In the garden"], "answer": 0, "explain": "Anna 说 My bedroom is upstairs"},
                    ],
                    'reading': [
                        {"passage": "My favourite room is my bedroom. It is upstairs near the bathroom. There is a small bed, a desk and a lamp. I do my homework at the desk. At night, the lamp is bright and warm. I read storybooks in bed until Mum says, \"Time for bed!\"", "q": "Where does the child do homework?", "options": ["At the desk", "On the bed", "In the kitchen"], "answer": 0, "explain": "文中说 I do my homework at the desk"},
                    ],
                },
                {
                    'code': "4A_U4",
                    'words': [
                        ("do", "做"),
                        ("read", "读"),
                        ("write", "写"),
                        ("study", "学习"),
                        ("draw", "画画"),
                        ("watch", "看"),
                        ("TV", "电视"),
                        ("every day", "每天"),
                    ],
                    'grammar': [
                        {"q": "What ____ you do at home?", "options": ["do", "does", "doing"], "answer": 0, "explain": "What do you... 问对方日常活动"},
                        {"q": "I write a diary ____ day.", "options": ["every", "one", "some"], "answer": 0, "explain": "every day 表示每天"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, what do you do at home? W: I read books and draw pictures. I watch TV only on weekends.", "q": "When does Anna watch TV?", "options": ["Only on weekends", "Every day", "Never"], "answer": 0, "explain": "Anna 说 only on weekends"},
                    ],
                    'reading': [
                        {"passage": "Every day I do many things. In the morning, I go to school and study with my friends. After school, I do my homework at the desk. Then I read a story or draw a picture. After dinner, I watch TV for a while with my family. A full day, a happy day!", "q": "What does the child do after dinner?", "options": ["Watch TV with family", "Do homework", "Go to bed"], "answer": 0, "explain": "文中说 After dinner, I watch TV with my family"},
                    ],
                },
                {
                    'code': "4A_U5",
                    'words': [
                        ("hobby", "爱好"),
                        ("music", "音乐"),
                        ("piano", "钢琴"),
                        ("guitar", "吉他"),
                        ("dance", "跳舞"),
                        ("swim", "游泳"),
                        ("cook", "做饭"),
                        ("favourite", "最喜爱的"),
                    ],
                    'grammar': [
                        {"q": "What's ____ hobby?", "options": ["your", "you", "yours"], "answer": 0, "explain": "your 是形容词性物主代词，后接名词"},
                        {"q": "My hobby ____ music.", "options": ["is", "are", "am"], "answer": 0, "explain": "单数 hobby 后用 is"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, what's your hobby? M: My hobby is music. I play the piano. W: Cool! I love dance. I can also swim.", "q": "What is Ben's hobby?", "options": ["Playing the piano", "Swimming", "Dancing"], "answer": 0, "explain": "Ben 说 I play the piano"},
                    ],
                    'reading': [
                        {"passage": "Everyone in my class has a hobby. Tom plays the guitar. Lily likes to dance. Ben plays the piano very well. Anna loves swimming. I like cooking with Mum on weekends. My favourite hobby is reading storybooks. Hobbies are like good friends — they stay with you all life!", "q": "What can Tom do?", "options": ["Play the guitar", "Play the piano", "Swim"], "answer": 0, "explain": "文中说 Tom plays the guitar"},
                    ],
                },
                {
                    'code': "4A_U6",
                    'words': [
                        ("animal", "动物"),
                        ("dog", "狗"),
                        ("cat", "猫"),
                        ("bird", "鸟"),
                        ("fish", "鱼"),
                        ("rabbit", "兔子"),
                        ("panda", "熊猫"),
                        ("zoo", "动物园"),
                    ],
                    'grammar': [
                        {"q": "Pandas ____ black and white.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 Pandas 后用 are"},
                        {"q": "There ____ many animals in the zoo.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 animals 后用 are"},
                    ],
                    'listening': [
                        {"audioText": "M: Look at the pandas! They're so cute. W: I love their black and white fur. M: There are birds, rabbits and even a tiger here.", "q": "What animals do they see first?", "options": ["Pandas", "Birds", "Rabbits"], "answer": 0, "explain": "Ben 先说 Look at the pandas"},
                    ],
                    'reading': [
                        {"passage": "My favourite animal is the panda. Pandas live in the mountains of China. They are black and white. They eat bamboo all day. Pandas look slow but they can climb trees fast. I want to see a real panda one day. Animals are our friends — let's care for them!", "q": "What do pandas eat?", "options": ["Bamboo", "Fish", "Meat"], "answer": 0, "explain": "文中说 They eat bamboo all day"},
                    ],
                },
                {
                    'code': "4A_U7",
                    'words': [
                        ("weekend", "周末"),
                        ("Saturday", "星期六"),
                        ("Sunday", "星期天"),
                        ("park", "公园"),
                        ("shop", "购物；商店"),
                        ("movie", "电影"),
                        ("picnic", "野餐"),
                        ("fun", "乐趣"),
                    ],
                    'grammar': [
                        {"q": "What ____ you do this weekend?", "options": ["will", "do", "are"], "answer": 0, "explain": "将来时用 will + 动词原形"},
                        {"q": "We'll have a picnic ____ the park.", "options": ["in", "on", "at"], "answer": 0, "explain": "在公园里用 in the park"},
                    ],
                    'listening': [
                        {"audioText": "M: What will you do this weekend, Anna? W: On Saturday, my family will have a picnic in the park. On Sunday, we'll go shopping and watch a movie.", "q": "What will Anna do on Saturday?", "options": ["Have a picnic", "Watch a movie", "Go shopping"], "answer": 0, "explain": "Anna 说 we'll have a picnic in the park on Saturday"},
                    ],
                    'reading': [
                        {"passage": "I love weekends. On Saturday, I usually visit the park with my family. We bring sandwiches and have a picnic on the grass. On Sunday morning, I do my homework. In the afternoon, I watch a fun movie with my friends. Weekends are short but full of joy and love!", "q": "What do they bring to the picnic?", "options": ["Sandwiches", "Noodles", "Cakes"], "answer": 0, "explain": "文中说 We bring sandwiches"},
                    ],
                },
                {
                    'code': "4A_U8",
                    'words': [
                        ("festival", "节日"),
                        ("Christmas", "圣诞节"),
                        ("Spring Festival", "春节"),
                        ("gift", "礼物"),
                        ("tree", "树"),
                        ("card", "卡片"),
                        ("dinner", "晚餐；正餐"),
                        ("happy", "高兴的"),
                    ],
                    'grammar': [
                        {"q": "Merry ____!", "options": ["Christmas", "Happy", "New"], "answer": 0, "explain": "圣诞祝福语 Merry Christmas"},
                        {"q": "At Spring Festival, we ____ dumplings.", "options": ["eat", "eats", "eating"], "answer": 0, "explain": "一般现在时 we 后用动词原形"},
                    ],
                    'listening': [
                        {"audioText": "M: Merry Christmas, Anna! W: Merry Christmas, Ben! Look at our Christmas tree. I made a card for Mum and Dad.", "q": "What did Anna make?", "options": ["A card", "A gift", "A cake"], "answer": 0, "explain": "Anna 说 I made a card"},
                    ],
                    'reading': [
                        {"passage": "My family loves festivals. At Spring Festival, we eat dumplings and visit our grandparents. We get red envelopes — that's so much fun! At Christmas, we decorate the tree and sing songs. We make cards for our friends. Festivals bring our family closer and make each year warm and bright!", "q": "What do they eat at Spring Festival?", "options": ["Dumplings", "Cakes", "Bread"], "answer": 0, "explain": "文中说 At Spring Festival, we eat dumplings"},
                    ],
                },
                {
                    'code': "4A_U9",
                    'words': [
                        ("new", "新的"),
                        ("year", "年"),
                        ("wish", "祝愿"),
                        ("share", "分享"),
                        ("thank", "感谢"),
                        ("smile", "微笑"),
                    ],
                    'grammar': [
                        {"q": "Happy ____ Year!", "options": ["New", "Old", "Good"], "answer": 0, "explain": "新年快乐是 Happy New Year"},
                        {"q": "I wish ____ learn more English.", "options": ["to", "for", "at"], "answer": 0, "explain": "wish to do 表示愿望"},
                    ],
                    'listening': [
                        {"audioText": "M: Happy New Year, Anna! W: Happy New Year, Ben! I wish to learn more English and make new friends.", "q": "What does Anna wish for?", "options": ["Learn more English", "Get more gifts", "Travel to China"], "answer": 0, "explain": "Anna 说 I wish to learn more English"},
                    ],
                    'reading': [
                        {"passage": "A new year has come! I have many new wishes. I wish to study hard and read more storybooks. I wish to help Mum at home and share with my friends. Most of all, I wish a year full of smiles for my family and all my friends. Happy New Year to everyone!", "q": "What does the child wish to do at home?", "options": ["Help Mum", "Watch TV", "Play games"], "answer": 0, "explain": "文中说 I wish to help Mum at home"},
                    ],
                },
            ]},
    # grade4下 - 9单元 70词
    '4B': {'grade': 4, 'term': '下', 'units': [
                {
                    'code': "4B_U1",
                    'words': [("spring", "春天"),("warm", "温暖的"),("flower", "花"),("grass", "草"),("tree", "树"),("wind", "风"),("rain", "雨"),("kite", "风筝")],
                    'grammar': [
                        {"q": "Spring ____ here. It's so warm.", "options": ["is", "are", "am"], "answer": 0, "explain": "Spring 是单数，用 is"},
                        {"q": "The trees ____ green again.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 trees 后用 are"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, look! The trees are green again. M: Yes! Spring is here. Many flowers are out. W: Let's fly a kite!", "q": "What do they want to do?", "options": ["Fly a kite", "Plant a tree", "Pick flowers"], "answer": 0, "explain": "Anna 说 Let's fly a kite"},
                    ],
                    'reading': [
                        {"passage": "It is a warm spring day. The sun is bright and the wind is soft. Pink and yellow flowers grow on the grass. The trees wear new green leaves. Children run in the park and fly kites. Spring is the season of new life!", "q": "What season is it?", "options": ["Spring", "Summer", "Autumn"], "answer": 0, "explain": "文中多次提到 spring"},
                    ],
                },
                {
                    'code': "4B_U2",
                    'words': [("clothes", "衣服"),("shirt", "衬衫"),("T-shirt", "T恤"),("skirt", "裙子"),("trousers", "裤子"),("shoes", "鞋"),("hat", "帽子"),("wear", "穿")],
                    'grammar': [
                        {"q": "What will you ____ to the party?", "options": ["wear", "wears", "wearing"], "answer": 0, "explain": "will 后跟动词原形"},
                        {"q": "I'll wear a white ____ and blue trousers.", "options": ["shirt", "skirt", "hat"], "answer": 0, "explain": "shirt 搭配 trousers 更常见"},
                        {"q": "These shoes ____ very nice.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 shoes 后用 are"},
                        {"q": "____ T-shirt is red.", "options": ["My", "Me", "I"], "answer": 0, "explain": "My + 名词"},
                    ],
                    'listening': [
                        {"audioText": "W: What will you wear to the party, Ben? M: I'll wear a white shirt and blue trousers. W: Cool! I'll wear a new skirt.", "q": "What will Ben wear?", "options": ["A white shirt and blue trousers", "A T-shirt and shorts", "A jacket"], "answer": 0, "explain": "Ben 说 a white shirt and blue trousers"},
                        {"audioText": "W: Mum, I need new clothes for school. M: Let's go shopping. W: I want a blue hat and blue shoes. M: Blue is your favourite colour!", "q": "What does the child want?", "options": ["A blue hat and blue shoes", "A red shirt", "A green skirt"], "answer": 0, "explain": "孩子说 I want a blue hat and blue shoes"},
                    ],
                    'reading': [
                        {"passage": "I have many clothes in my closet. I wear T-shirts and shorts in summer. In spring, I like a light shirt and a skirt. In winter, I wear warm trousers and shoes. A hat keeps my head warm. Clothes make every season comfortable!", "q": "What does she wear in summer?", "options": ["T-shirts and shorts", "A shirt and trousers", "A jacket"], "answer": 0, "explain": "文中说 I wear T-shirts and shorts in summer"},
                    ],
                },
                {
                    'code': "4B_U3",
                    'words': [("shopping", "购物"),("buy", "买"),("store", "商店"),("money", "钱"),("price", "价格"),("cheap", "便宜的"),("expensive", "贵的"),("yuan", "元")],
                    'grammar': [
                        {"q": "How ____ is this T-shirt?", "options": ["much", "many", "old"], "answer": 0, "explain": "问价格用 How much"},
                        {"q": "It's only twenty ____.", "options": ["yuan", "yuans", "dollar"], "answer": 0, "explain": "人民币单位 yuan 不加 s"},
                    ],
                    'listening': [
                        {"audioText": "W: Mum, look at this red T-shirt. How much is it? M: It's only twenty yuan. W: That's cheap! Let's buy it.", "q": "How much is the T-shirt?", "options": ["Twenty yuan", "Thirty yuan", "Fifty yuan"], "answer": 0, "explain": "妈妈说 It's only twenty yuan"},
                    ],
                    'reading': [
                        {"passage": "On Saturday, Mum and I went to a big store. We saw many shirts and shoes. The blue skirt was eighty yuan — too expensive! The white hat was only fifteen yuan — very cheap. I bought the hat with my own money. Shopping is fun!", "q": "What was expensive?", "options": ["The blue skirt", "The white hat", "The shirt"], "answer": 0, "explain": "文中说 The blue skirt was eighty yuan — too expensive"},
                    ],
                },
                {
                    'code': "4B_U4",
                    'words': [("number", "数字"),("twenty", "二十"),("thirty", "三十"),("fifty", "五十"),("hundred", "百"),("how much", "多少钱"),("count", "数"),("total", "总计")],
                    'grammar': [
                        {"q": "How much is the ____?", "options": ["total", "totals", "totalling"], "answer": 0, "explain": "total 在这里是名词"},
                        {"q": "The book is thirty yuan ____ the pen is twenty.", "options": ["and", "but", "or"], "answer": 0, "explain": "并列表述用 and"},
                    ],
                    'listening': [
                        {"audioText": "W: I want a book and a pen. M: The book is thirty yuan, the pen is twenty. W: How much in total? M: Fifty yuan.", "q": "How much in total?", "options": ["Fifty yuan", "Thirty yuan", "Twenty yuan"], "answer": 0, "explain": "30+20=50"},
                    ],
                    'reading': [
                        {"passage": "Numbers help us in many ways. We count money, count days, and count steps. At the store, we add prices to find the total. A book is thirty yuan, a pen is twenty — the total is fifty yuan. Numbers are everywhere!", "q": "What is thirty plus twenty?", "options": ["Fifty", "Forty", "Sixty"], "answer": 0, "explain": "30+20=50"},
                    ],
                },
                {
                    'code': "4B_U5",
                    'words': [("food", "食物"),("rice", "米饭"),("noodle", "面条"),("bread", "面包"),("meat", "肉"),("vegetable", "蔬菜"),("tasty", "美味的"),("sweet", "甜的")],
                    'grammar': [
                        {"q": "What's ____ favourite food?", "options": ["your", "you", "yours"], "answer": 0, "explain": "your + 名词"},
                        {"q": "I love noodles ____ dumplings.", "options": ["and", "but", "or"], "answer": 0, "explain": "并列用 and"},
                    ],
                    'listening': [
                        {"audioText": "M: What's your favourite food, Anna? W: I love noodles and dumplings. M: I prefer rice and meat. W: Vegetables are tasty too!", "q": "What does Ben prefer?", "options": ["Rice and meat", "Noodles and dumplings", "Bread and milk"], "answer": 0, "explain": "Ben 说 I prefer rice and meat"},
                    ],
                    'reading': [
                        {"passage": "My grandma is a great cook. She makes tasty rice, soft noodles, and warm bread. Her vegetable soup is the best. I love sweet cakes after dinner. Good food keeps us strong and happy!", "q": "Who is a great cook?", "options": ["Grandma", "Mum", "Dad"], "answer": 0, "explain": "文中说 My grandma is a great cook"},
                    ],
                },
                {
                    'code': "4B_U6",
                    'words': [("cook", "做饭"),("egg", "鸡蛋"),("milk", "牛奶"),("fruit", "水果"),("knife", "刀"),("fork", "叉"),("spoon", "勺子"),("wash", "洗")],
                    'grammar': [
                        {"q": "Please ____ the fruit first.", "options": ["wash", "washes", "washing"], "answer": 0, "explain": "祈使句用动词原形"},
                        {"q": "We eat with a ____ and a spoon.", "options": ["fork", "knife", "plate"], "answer": 0, "explain": "fork and spoon 是常见搭配"},
                    ],
                    'listening': [
                        {"audioText": "W: Anna, will you help me in the kitchen? M: Sure, Mum. What can I do? W: Please wash the fruit and get two eggs.", "q": "What does Mum ask Anna to do?", "options": ["Wash the fruit and get eggs", "Cook the dinner", "Set the table"], "answer": 0, "explain": "妈妈说 wash the fruit and get two eggs"},
                    ],
                    'reading': [
                        {"passage": "Today I am a small chef. First, I wash my hands. Then I break two eggs into a bowl. I wash the fruit and put it on a plate. I set the table with a knife, fork and spoon. Cooking with Mum is so much fun!", "q": "How many eggs does she use?", "options": ["Two", "Three", "One"], "answer": 0, "explain": "文中说 I break two eggs"},
                    ],
                },
                {
                    'code': "4B_U7",
                    'words': [("healthy", "健康的"),("habit", "习惯"),("exercise", "锻炼"),("sleep", "睡觉"),("water", "水"),("sweet", "甜的"),("fresh", "新鲜的"),("strong", "强壮的")],
                    'grammar': [
                        {"q": "I ____ healthy habits.", "options": ["have", "has", "am"], "answer": 0, "explain": "I 后用 have"},
                        {"q": "We should drink more ____.", "options": ["water", "waters", "sweets"], "answer": 0, "explain": "water 不可数，后不加 s"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, why are you so strong? W: I have healthy habits. I exercise every morning and sleep early. M: I should try that too!", "q": "Why is Anna strong?", "options": ["She has healthy habits", "She eats a lot", "She runs fast"], "answer": 0, "explain": "Anna 说 I have healthy habits"},
                    ],
                    'reading': [
                        {"passage": "A healthy day starts with a good breakfast. We should drink water and eat fresh fruit. Sweets are tasty but not so healthy. Exercise makes us strong. Good sleep gives us energy. Small habits make a big difference!", "q": "What makes us strong?", "options": ["Exercise", "Sweets", "Sleeping late"], "answer": 0, "explain": "文中说 Exercise makes us strong"},
                    ],
                },
                {
                    'code': "4B_U8",
                    'words': [("picnic", "野餐"),("basket", "篮子"),("sandwich", "三明治"),("juice", "果汁"),("lake", "湖"),("sunny", "晴朗的"),("share", "分享"),("enjoy", "享受")],
                    'grammar': [
                        {"q": "Let's ____ a picnic by the lake.", "options": ["have", "has", "having"], "answer": 0, "explain": "Let's 后跟动词原形"},
                        {"q": "What a ____ day for a picnic!", "options": ["sunny", "rain", "wind"], "answer": 0, "explain": "晴朗的日子适合野餐"},
                    ],
                    'listening': [
                        {"audioText": "W: It's a sunny Saturday! Let's have a picnic. M: Great! I'll bring sandwiches and juice. W: I have a big basket and we can sit by the lake.", "q": "Where will they have the picnic?", "options": ["By the lake", "In the park", "At home"], "answer": 0, "explain": "Anna 提到 by the lake"},
                    ],
                    'reading': [
                        {"passage": "Last Sunday we had a wonderful picnic by the lake. The sun was warm and the water was blue. We put a big mat on the grass. We shared sandwiches, fruit and juice. After eating, we walked by the lake. It was a perfect day!", "q": "What did they do after eating?", "options": ["Walked by the lake", "Went home", "Went swimming"], "answer": 0, "explain": "文中说 After eating, we walked by the lake"},
                    ],
                },
                {
                    'code': "4B_U9",
                    'words': [("lovely", "可爱的"),("remember", "记住"),("diary", "日记"),("friend", "朋友"),("thank", "感谢"),("spring", "春天")],
                    'grammar': [
                        {"q": "This spring was so ____.", "options": ["lovely", "lovelys", "love"], "answer": 0, "explain": "lovely 是形容词"},
                        {"q": "I will ____ this spring forever.", "options": ["remember", "remembers", "remembering"], "answer": 0, "explain": "will 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: This spring was so lovely. We flew kites and had a picnic. M: I wrote it all in my diary. W: I'll remember it forever. Thank you, spring!", "q": "Where did Ben write about spring?", "options": ["In his diary", "On a card", "In a book"], "answer": 0, "explain": "Ben 说 I wrote it all in my diary"},
                    ],
                    'reading': [
                        {"passage": "Spring is almost over. In my diary I wrote about every weekend. We flew kites in the park, learned to cook with Mum, and had a picnic by the lake. Spring brought us warm days and happy times. Thank you, lovely spring!", "q": "What did they do in the park?", "options": ["Flew kites", "Had a picnic", "Played football"], "answer": 0, "explain": "文中说 We flew kites in the park"},
                    ],
                },
            ]},
    # grade5上 - 9单元 70词
    '5A': {'grade': 5, 'term': '上', 'units': [
                {
                    'code': "5A_U1",
                    'words': [("new", "新的"),("term", "学期"),("classmate", "同学"),("introduce", "介绍"),("hope", "希望"),("grade", "年级"),("schedule", "课程表"),("exciting", "令人兴奋的")],
                    'grammar': [
                        {"q": "I'm so ____ for the new term.", "options": ["excited", "exciting", "excite"], "answer": 0, "explain": "人作主语用 excited"},
                        {"q": "Let me ____ my new classmate.", "options": ["introduce", "introduces", "introducing"], "answer": 0, "explain": "Let me 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, welcome back! How was your summer? W: Great! I'm so excited for the new term. I hope to make new friends.", "q": "How does Anna feel?", "options": ["Excited", "Sad", "Tired"], "answer": 0, "explain": "Anna 说 I'm so excited"},
                    ],
                    'reading': [
                        {"passage": "A new term has started! I am in Grade 5 now. My new schedule is busy but exciting. I have new classmates and new teachers. I hope to study hard and make many friends this term. Let's have a great year together!", "q": "What grade is the child in?", "options": ["Grade 5", "Grade 4", "Grade 6"], "answer": 0, "explain": "文中说 I am in Grade 5 now"},
                    ],
                },
                {
                    'code': "5A_U2",
                    'words': [("subject", "科目"),("English", "英语"),("Maths", "数学"),("science", "科学"),("PE", "体育"),("art", "美术"),("difficult", "困难的"),("easy", "容易的")],
                    'grammar': [
                        {"q": "What's ____ favourite subject?", "options": ["your", "you", "yours"], "answer": 0, "explain": "your + 名词"},
                        {"q": "Maths is difficult ____ English is easy.", "options": ["but", "and", "or"], "answer": 0, "explain": "转折用 but"},
                        {"q": "____ is your English teacher?", "options": ["Who", "What", "Where"], "answer": 0, "explain": "问人用 Who"},
                        {"q": "We have English ____ Monday and Friday.", "options": ["on", "in", "at"], "answer": 0, "explain": "星期前用 on"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, what's your favourite subject? W: I love English and art. They are easy for me. M: I like science and PE. Maths is a little difficult.", "q": "What subject does Ben find difficult?", "options": ["Maths", "English", "Art"], "answer": 0, "explain": "Ben 说 Maths is a little difficult"},
                        {"audioText": "M: Anna, do you like PE? W: Yes! I love sports. We run, jump and play ball games. M: My favourite is football. W: Me too! Let's play after school.", "q": "What sport do they both like?", "options": ["Football", "Basketball", "Swimming"], "answer": 0, "explain": "Ben 说 My favourite is football, Anna 说 Me too"},
                    ],
                    'reading': [
                        {"passage": "We have many subjects at school. English is my favourite — it's easy and fun. Maths is a little difficult, but I try hard. Science teaches us about the world. PE keeps us strong. Art lets us create. Every subject is special in its own way!", "q": "Why does the child like English?", "options": ["It's easy and fun", "It's difficult", "It has no homework"], "answer": 0, "explain": "文中说 English is easy and fun"},
                        {"passage": "School subjects are like colours in a rainbow. English opens the world. Maths trains our minds. Science shows us how things work. PE makes us strong. Art brings beauty. Every subject adds a colour to our rainbow!", "q": "What does Maths do according to the passage?", "options": ["Trains our minds", "Opens the world", "Makes us strong"], "answer": 0, "explain": "文中说 Maths trains our minds"},
                    ],
                },
                {
                    'code': "5A_U3",
                    'words': [("talent", "才能"),("sing", "唱"),("dance", "跳舞"),("draw", "画画"),("speak", "说"),("story", "故事"),("stage", "舞台"),("proud", "自豪的")],
                    'grammar': [
                        {"q": "I can ____ songs in English.", "options": ["sing", "sings", "singing"], "answer": 0, "explain": "can 后跟动词原形"},
                        {"q": "My parents are ____ of me.", "options": ["proud", "pride", "prouds"], "answer": 0, "explain": "be proud of 是固定搭配"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, what's your talent? W: I can sing songs in English. What about you? M: I can tell stories on stage. W: Your parents must be proud!", "q": "What is Ben's talent?", "options": ["Telling stories", "Singing", "Dancing"], "answer": 0, "explain": "Ben 说 I can tell stories on stage"},
                    ],
                    'reading': [
                        {"passage": "Everyone has a talent. Tom can dance very well. Lily draws beautiful pictures. I can speak English and tell stories. On the school stage, we show our talents. Our teachers and parents are so proud. A talent is a gift — share it with the world!", "q": "What can Lily do?", "options": ["Draw pictures", "Dance", "Sing"], "answer": 0, "explain": "文中说 Lily draws beautiful pictures"},
                    ],
                },
                {
                    'code': "5A_U4",
                    'words': [("library", "图书馆"),("borrow", "借"),("return", "归还"),("quiet", "安静的"),("shelf", "书架"),("magazine", "杂志"),("card", "卡片"),("page", "页")],
                    'grammar': [
                        {"q": "Please be ____ in the library.", "options": ["quiet", "loud", "fast"], "answer": 0, "explain": "图书馆需要安静"},
                        {"q": "You can ____ books with a library card.", "options": ["borrow", "borrows", "borrowing"], "answer": 0, "explain": "can 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: I want to borrow a story book. Where is it? M: It's on the shelf by the window. W: Thanks! Don't forget to return it next week.", "q": "Where is the story book?", "options": ["On the shelf by the window", "On the desk", "In the bag"], "answer": 0, "explain": "Ben 说 It's on the shelf by the window"},
                    ],
                    'reading': [
                        {"passage": "Our school library is a quiet and wonderful place. There are many books on the shelves — storybooks, magazines, and science books. We use a library card to borrow books. We must return them on time. Every book opens a new world!", "q": "What do they use to borrow books?", "options": ["A library card", "Money", "A phone"], "answer": 0, "explain": "文中说 We use a library card to borrow books"},
                    ],
                },
                {
                    'code': "5A_U5",
                    'words': [("sport", "运动"),("race", "赛跑"),("team", "团队"),("win", "赢"),("lose", "输"),("jump", "跳"),("throw", "扔"),("cheer", "欢呼")],
                    'grammar': [
                        {"q": "Our team will ____ the race!", "options": ["win", "wins", "won"], "answer": 0, "explain": "will 后跟动词原形"},
                        {"q": "Let's ____ for our team!", "options": ["cheer", "cheers", "cheering"], "answer": 0, "explain": "Let's 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, today is Sports Day. Are you ready? W: Yes! I'll run the 100-metre race. M: Good luck! I'll cheer for you!", "q": "What will Anna do on Sports Day?", "options": ["Run the 100-metre race", "Jump high", "Throw a ball"], "answer": 0, "explain": "Anna 说 I'll run the 100-metre race"},
                    ],
                    'reading': [
                        {"passage": "It's Sports Day! The sun is bright and everyone is excited. Tom runs fast in the race. Lily jumps very high. Our team wins the relay race. We cheer and hug each other. Winning is great, but having fun together is even better!", "q": "What is more important than winning?", "options": ["Having fun together", "Winning the race", "Getting a prize"], "answer": 0, "explain": "文中说 having fun together is even better"},
                    ],
                },
                {
                    'code': "5A_U6",
                    'words': [("festival", "节日"),("world", "世界"),("Halloween", "万圣节"),("Thanksgiving", "感恩节"),("Mid-Autumn", "中秋"),("moon cake", "月饼"),("tradition", "传统"),("celebrate", "庆祝")],
                    'grammar': [
                        {"q": "People ____ Mid-Autumn Festival with moon cakes.", "options": ["celebrate", "celebrates", "celebrating"], "answer": 0, "explain": "People 是复数，动词用原形"},
                        {"q": "Thanksgiving is a ____ in America.", "options": ["tradition", "traditional", "traditionally"], "answer": 0, "explain": "tradition 是名词"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, what festivals do you celebrate? M: I love Spring Festival and Mid-Autumn. We eat moon cakes and watch the moon. W: In America, they have Thanksgiving and Halloween.", "q": "What do they eat at Mid-Autumn?", "options": ["Moon cakes", "Turkey", "Candy"], "answer": 0, "explain": "Ben 说 We eat moon cakes"},
                    ],
                    'reading': [
                        {"passage": "Festivals around the world are amazing! In China, we celebrate Mid-Autumn with moon cakes and family dinners. Americans have Thanksgiving with turkey. Halloween means costumes and candy. Each festival has its own tradition. They all bring people together!", "q": "What do Americans eat at Thanksgiving?", "options": ["Turkey", "Moon cakes", "Dumplings"], "answer": 0, "explain": "文中说 Americans have Thanksgiving with turkey"},
                    ],
                },
                {
                    'code': "5A_U7",
                    'words': [("club", "俱乐部"),("join", "加入"),("robot", "机器人"),("chess", "国际象棋"),("photo", "照片"),("drama", "戏剧"),("meet", "见面"),("interest", "兴趣")],
                    'grammar': [
                        {"q": "Which club will you ____ this year?", "options": ["join", "joins", "joining"], "answer": 0, "explain": "will 后跟动词原形"},
                        {"q": "I have a strong ____ in taking photos.", "options": ["interest", "interests", "interesting"], "answer": 0, "explain": "interest 是名词"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, which club will you join? W: I want to join the photo club. I love taking pictures. M: Cool! I'll join the robot club.", "q": "Which club does Anna want to join?", "options": ["Photo club", "Robot club", "Drama club"], "answer": 0, "explain": "Anna 说 I want to join the photo club"},
                    ],
                    'reading': [
                        {"passage": "This year, our school has many new clubs. The robot club builds amazing machines. The chess club teaches smart moves. The photo club captures beautiful moments. The drama club puts on great shows. Follow your interest and join a club today!", "q": "What does the robot club do?", "options": ["Build machines", "Take photos", "Put on shows"], "answer": 0, "explain": "文中说 The robot club builds amazing machines"},
                    ],
                },
                {
                    'code': "5A_U8",
                    'words': [("help", "帮助"),("volunteer", "志愿者"),("elderly", "年长的"),("kind", "友善的"),("smile", "微笑"),("share", "分享"),("neighbour", "邻居"),("warm", "温暖的")],
                    'grammar': [
                        {"q": "A small act of ____ can bring big love.", "options": ["kindness", "kind", "kindly"], "answer": 0, "explain": "of 后接名词 kindness"},
                        {"q": "We should help ____ elderly neighbours.", "options": ["our", "us", "we"], "answer": 0, "explain": "our 是形容词性物主代词"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, the elderly man next door looks sad. M: Let's help him carry his bags. W: Good idea! A small act can make a big difference.", "q": "What do they want to do?", "options": ["Help the elderly man", "Go to the park", "Buy food"], "answer": 0, "explain": "Ben 说 Let's help him carry his bags"},
                    ],
                    'reading': [
                        {"passage": "Last weekend, our class volunteered at the city park. We picked up rubbish, planted flowers, and helped elderly people cross the road. Their warm smiles made us so happy. Helping hands and kind hearts make the world a better place!", "q": "What did they do at the park?", "options": ["Picked up rubbish and planted flowers", "Played games", "Had a picnic"], "answer": 0, "explain": "文中说 We picked up rubbish, planted flowers"},
                    ],
                },
                {
                    'code': "5A_U9",
                    'words': [("show", "表演"),("prepare", "准备"),("act", "表演"),("audience", "观众"),("clap", "鼓掌"),("remember", "记住")],
                    'grammar': [
                        {"q": "I have ____ for weeks for the show.", "options": ["prepared", "prepare", "prepares"], "answer": 0, "explain": "have + 过去分词表示完成"},
                        {"q": "The ____ clapped loudly.", "options": ["audience", "audiences", "audiencing"], "answer": 0, "explain": "audience 是名词"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, our school show is tomorrow! M: Yes! I've prepared for weeks. I'll sing and act. W: I'll dance. The audience will love it!", "q": "What will Ben do at the show?", "options": ["Sing and act", "Dance", "Play the piano"], "answer": 0, "explain": "Ben 说 I'll sing and act"},
                    ],
                    'reading': [
                        {"passage": "Last Friday our school had a big Show Time. Each class prepared one act. We sang songs in English, danced to popular music, and told funny stories. The audience clapped and cheered. It was a show to remember forever!", "q": "What did the audience do?", "options": ["Clapped and cheered", "Left early", "Read books"], "answer": 0, "explain": "文中说 The audience clapped and cheered"},
                    ],
                },
            ]},
    # grade5下 - 9单元 70词
    '5B': {'grade': 5, 'term': '下', 'units': [
                {
                    'code': "5B_U1",
                    'words': [("trip", "旅行"),("plan", "计划"),("summer", "夏天"),("holiday", "假期"),("beach", "海滩"),("mountain", "山"),("discuss", "讨论"),("idea", "想法")],
                    'grammar': [
                        {"q": "Summer holiday ____ coming!", "options": ["is", "are", "am"], "answer": 0, "explain": "单数 holiday 后用 is"},
                        {"q": "How ____ going to the beach?", "options": ["about", "much", "many"], "answer": 0, "explain": "How about 表示提议"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, summer holiday is coming! Where shall we go? W: How about the beach? M: Or the mountains? Let's discuss with our families.", "q": "What does Anna suggest?", "options": ["Going to the beach", "Going to the mountains", "Staying home"], "answer": 0, "explain": "Anna 说 How about the beach"},
                    ],
                    'reading': [
                        {"passage": "Summer holiday is coming! My family is planning a trip. Dad wants to go to the mountains. Mum likes the beach. I think both are great ideas. We sit together and discuss our plan. A good trip starts with a good plan!", "q": "What does Dad want to do?", "options": ["Go to the mountains", "Go to the beach", "Stay home"], "answer": 0, "explain": "文中说 Dad wants to go to the mountains"},
                    ],
                },
                {
                    'code': "5B_U2",
                    'words': [("travel", "旅行"),("train", "火车"),("plane", "飞机"),("bus", "公共汽车"),("subway", "地铁"),("bike", "自行车"),("ticket", "票"),("fast", "快的")],
                    'grammar': [
                        {"q": "How shall we ____ to Beijing?", "options": ["go", "goes", "going"], "answer": 0, "explain": "shall 后跟动词原形"},
                        {"q": "By plane is ____, but the train is cheaper.", "options": ["fast", "fastly", "fasting"], "answer": 0, "explain": "fast 本身就是副词"},
                        {"q": "The train ____ at 8 o'clock.", "options": ["leaves", "leave", "leaving"], "answer": 0, "explain": "单数 the train 后用 leaves"},
                        {"q": "It ____ about two hours to get there.", "options": ["takes", "take", "taking"], "answer": 0, "explain": "It takes... 表示花费时间"},
                    ],
                    'listening': [
                        {"audioText": "M: How shall we go to Beijing? W: By plane is fast, but the train is cheaper. M: Let's take the train and enjoy the view.", "q": "How will they travel?", "options": ["By train", "By plane", "By bus"], "answer": 0, "explain": "Ben 说 Let's take the train"},
                        {"audioText": "W: How do you go to school, Ben? M: I take the school bus. It's safe and fun. W: I walk to school. It's only 10 minutes. M: That's good exercise!", "q": "How does Ben go to school?", "options": ["By school bus", "On foot", "By bike"], "answer": 0, "explain": "Ben 说 I take the school bus"},
                    ],
                    'reading': [
                        {"passage": "There are many ways to travel. A plane is the fastest but expensive. A train lets you see beautiful views. A bus is cheap but slow. In the city, the subway is quick. For short trips, I love riding my bike. How will you travel this summer?", "q": "What is the fastest way to travel?", "options": ["By plane", "By train", "By bus"], "answer": 0, "explain": "文中说 A plane is the fastest"},
                        {"passage": "Travelling is a big part of life. Some people love the speed of a plane. Others enjoy the view from a train. Buses are good for short trips. In the city, the subway is the fastest way. What about you? How do you like to travel?", "q": "What is the fastest way in the city?", "options": ["The subway", "The bus", "Walking"], "answer": 0, "explain": "文中说 the subway is the fastest way"},
                    ],
                },
                {
                    'code': "5B_U3",
                    'words': [("way", "路"),("turn", "转弯"),("left", "左边"),("right", "右边"),("straight", "直的"),("crossroads", "十字路口"),("map", "地图"),("lost", "迷路的")],
                    'grammar': [
                        {"q": "Turn ____ at the crossroads.", "options": ["left", "the left", "to left"], "answer": 0, "explain": "Turn left 是固定表达"},
                        {"q": "Go ____ and you'll see it.", "options": ["straight", "straightly", "the straight"], "answer": 0, "explain": "go straight 表示直走"},
                    ],
                    'listening': [
                        {"audioText": "W: Excuse me, can you show me the way to the museum? M: Sure. Go straight, then turn right at the crossroads. W: Thank you so much!", "q": "Where should the tourist turn?", "options": ["Right at the crossroads", "Left at the park", "Go straight"], "answer": 0, "explain": "指路说 turn right at the crossroads"},
                    ],
                    'reading': [
                        {"passage": "Asking the way is an important skill. First, say \"Excuse me\". Then tell where you want to go. Listen carefully: go straight, turn left or right. A map can help you. If you get lost, don't worry — just ask a kind person for help!", "q": "What should you say first when asking the way?", "options": ["Excuse me", "Hello", "Sorry"], "answer": 0, "explain": "文中说 First, say Excuse me"},
                    ],
                },
                {
                    'code': "5B_U4",
                    'words': [("tourist", "游客"),("spot", "景点"),("city", "城市"),("country", "国家"),("Great Wall", "长城"),("park", "公园"),("museum", "博物馆"),("famous", "著名的")],
                    'grammar': [
                        {"q": "The Great Wall is very ____.", "options": ["famous", "famously", "fame"], "answer": 0, "explain": "famous 是形容词"},
                        {"q": "Which tourist ____ do you want to see?", "options": ["spot", "spots", "spotting"], "answer": 0, "explain": "which 后接单数名词"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, which tourist spot do you want to see most? W: I want to visit the Great Wall. It's famous all over the world. M: Me too!", "q": "What does Anna want to visit?", "options": ["The Great Wall", "A museum", "A park"], "answer": 0, "explain": "Anna 说 I want to visit the Great Wall"},
                    ],
                    'reading': [
                        {"passage": "China has many famous tourist spots. The Great Wall is known all over the world. Beijing has beautiful parks and great museums. Every city has its own special places. Travel opens our eyes to the beauty of our country!", "q": "What is known all over the world?", "options": ["The Great Wall", "The parks", "The museums"], "answer": 0, "explain": "文中说 The Great Wall is known all over the world"},
                    ],
                },
                {
                    'code': "5B_U5",
                    'words': [("souvenir", "纪念品"),("shop", "商店"),("gift", "礼物"),("size", "尺寸"),("colour", "颜色"),("try on", "试穿"),("pay", "付款"),("receipt", "收据")],
                    'grammar': [
                        {"q": "Can I ____ this scarf on?", "options": ["try", "tries", "trying"], "answer": 0, "explain": "Can I 后跟动词原形"},
                        {"q": "What ____ do you prefer?", "options": ["colour", "colours", "colouring"], "answer": 0, "explain": "What colour 问颜色"},
                    ],
                    'listening': [
                        {"audioText": "W: This silk scarf is so beautiful! What colour do you prefer? M: I'll take the blue one. W: Good choice! Let's pay and get a receipt.", "q": "What colour scarf does Ben choose?", "options": ["Blue", "Red", "Yellow"], "answer": 0, "explain": "Ben 说 I'll take the blue one"},
                    ],
                    'reading': [
                        {"passage": "Buying souvenirs is part of every trip. In the gift shop, we saw many beautiful things — scarves, fans, and key rings. I tried on a silk scarf. Mum said the colour was perfect. We paid and got a receipt. A small gift carries big memories!", "q": "What did she try on?", "options": ["A silk scarf", "A fan", "A key ring"], "answer": 0, "explain": "文中说 I tried on a silk scarf"},
                    ],
                },
                {
                    'code': "5B_U6",
                    'words': [("postcard", "明信片"),("send", "寄"),("write", "写"),("address", "地址"),("stamp", "邮票"),("miss", "想念"),("weather", "天气"),("wish", "祝愿")],
                    'grammar': [
                        {"q": "I got a postcard ____ Beijing.", "options": ["from", "to", "at"], "answer": 0, "explain": "from 表示来源"},
                        {"q": "Don't forget to put a ____ on the postcard.", "options": ["stamp", "stamps", "stamping"], "answer": 0, "explain": "一张邮票用单数 stamp"},
                    ],
                    'listening': [
                        {"audioText": "W: Look, Ben! I got a postcard from Beijing. M: Wow! Who sent it? W: My cousin. She says the weather is great and she misses me.", "q": "Who sent the postcard?", "options": ["Anna's cousin", "Ben's friend", "Her teacher"], "answer": 0, "explain": "Anna 说 My cousin sent it"},
                    ],
                    'reading': [
                        {"passage": "Sending postcards is a sweet tradition. You write about your trip — the weather, the food, the fun. You put on a stamp and write the address. When your friend gets it, they feel your love from far away. I miss you — wish you were here!", "q": "What do you need to send a postcard?", "options": ["A stamp and an address", "A gift", "A photo"], "answer": 0, "explain": "文中说 put on a stamp and write the address"},
                    ],
                },
                {
                    'code': "5B_U7",
                    'words': [("culture", "文化"),("language", "语言"),("country", "国家"),("food", "食物"),("chopsticks", "筷子"),("respect", "尊重"),("amazing", "令人惊叹的"),("learn", "学习")],
                    'grammar': [
                        {"q": "Different countries have different ____.", "options": ["cultures", "culture", "cultural"], "answer": 0, "explain": "different 后接复数"},
                        {"q": "We should ____ each other's culture.", "options": ["respect", "respects", "respecting"], "answer": 0, "explain": "should 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, I met a foreign student. She speaks three languages! M: Amazing! W: She eats with chopsticks and loves Chinese food.", "q": "What does the foreign student use to eat?", "options": ["Chopsticks", "A fork", "A spoon"], "answer": 0, "explain": "Anna 说 She eats with chopsticks"},
                    ],
                    'reading': [
                        {"passage": "The world has many different cultures. Some people speak English, others speak Chinese or other languages. Some eat with chopsticks, others with forks. Different foods, different ways — but all are amazing. We should respect and learn from each other!", "q": "Why is the world's culture amazing?", "options": ["Because people are different but special", "Because everyone is the same", "Because there is only one language"], "answer": 0, "explain": "文中说 all are amazing, should respect each other"},
                    ],
                },
                {
                    'code': "5B_U8",
                    'words': [("safe", "安全的"),("danger", "危险"),("warning", "警告"),("rule", "规则"),("follow", "遵守"),("careful", "小心的"),("phone", "电话"),("remember", "记住")],
                    'grammar': [
                        {"q": "Always ____ the safety rules.", "options": ["follow", "follows", "following"], "answer": 0, "explain": "祈使句用动词原形"},
                        {"q": "Be ____ when you cross the road.", "options": ["careful", "carefully", "care"], "answer": 0, "explain": "Be + 形容词"},
                    ],
                    'listening': [
                        {"audioText": "W: Anna, you and Ben will travel alone. Be safe! M: Don't worry, Mum. We'll follow the rules and keep our phones ready.", "q": "What will they do to stay safe?", "options": ["Follow rules and keep phones ready", "Run fast", "Go alone"], "answer": 0, "explain": "他们说 follow rules and keep phones ready"},
                    ],
                    'reading': [
                        {"passage": "Safe travels start with good habits. Always follow the rules on the road. Watch for danger signs and warnings. Stay with your group. Keep a phone with you. Be careful but not afraid. Remember — safety first, fun second!", "q": "What comes first when travelling?", "options": ["Safety", "Fun", "Food"], "answer": 0, "explain": "文中说 safety first, fun second"},
                    ],
                },
                {
                    'code': "5B_U9",
                    'words': [("journey", "旅程"),("memory", "记忆"),("diary", "日记"),("wonderful", "精彩的"),("share", "分享"),("thank", "感谢")],
                    'grammar': [
                        {"q": "This journey was ____!", "options": ["wonderful", "wonderfully", "wonder"], "answer": 0, "explain": "wonderful 是形容词"},
                        {"q": "Let's ____ our memories with friends.", "options": ["share", "shares", "sharing"], "answer": 0, "explain": "Let's 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, this summer journey was wonderful! M: Yes. The beach, the mountains, the food. W: I'll write everything in my diary. Thank you for the memories!", "q": "What will Anna do with the memories?", "options": ["Write in her diary", "Tell a story", "Draw a picture"], "answer": 0, "explain": "Anna 说 I'll write everything in my diary"},
                    ],
                    'reading': [
                        {"passage": "A journey ends, but memories stay forever. We visited amazing places, met kind people, and tried new foods. I wrote every day in my travel diary. Now I can share the stories with my friends. Every journey teaches us something new. Thank you, wonderful summer!", "q": "What did the child do every day?", "options": ["Wrote in the travel diary", "Took photos", "Swam in the sea"], "answer": 0, "explain": "文中说 I wrote every day in my travel diary"},
                    ],
                },
            ]},
    # grade6上 - 9单元 70词
    '6A': {'grade': 6, 'term': '上', 'units': [
                {
                    'code': "6A_U1",
                    'words': [("junior", "初中"),("graduate", "毕业"),("primary", "小学"),("memory", "记忆"),("future", "未来"),("challenge", "挑战"),("ready", "准备好的"),("confident", "自信的")],
                    'grammar': [
                        {"q": "Soon we'll ____ from primary school.", "options": ["graduate", "graduates", "graduating"], "answer": 0, "explain": "will 后跟动词原形"},
                        {"q": "Six years ____ so fast.", "options": ["pass", "passes", "passed"], "answer": 0, "explain": "复数 years 后用动词原形 pass"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, soon we'll graduate from primary school. M: I know. Six years passed so fast. W: I'll miss our school, but I'm ready for the future!", "q": "How does Anna feel about graduation?", "options": ["She'll miss school but is ready", "She is scared", "She wants to stay"], "answer": 0, "explain": "Anna 说 I'll miss our school, but I'm ready"},
                    ],
                    'reading': [
                        {"passage": "Six years in primary school are almost over. We came as little children and will leave as confident students. There were challenges, but we grew stronger. The future is bright, and junior school is waiting. We are ready!", "q": "What comes after primary school?", "options": ["Junior school", "Work", "Stay at home"], "answer": 0, "explain": "文中说 junior school is waiting"},
                    ],
                },
                {
                    'code': "6A_U2",
                    'words': [("dream", "梦想"),("job", "工作"),("doctor", "医生"),("teacher", "老师"),("engineer", "工程师"),("scientist", "科学家"),("writer", "作家"),("work hard", "努力工作")],
                    'grammar': [
                        {"q": "I want to ____ a doctor.", "options": ["be", "am", "is"], "answer": 0, "explain": "want to 后跟动词原形 be"},
                        {"q": "If you ____ hard, your dream will come true.", "options": ["work", "works", "working"], "answer": 0, "explain": "条件状语从句用一般现在时"},
                        {"q": "She ____ to be a writer.", "options": ["wants", "want", "wanting"], "answer": 0, "explain": "She 后用 wants"},
                        {"q": "I will ____ hard for my dream.", "options": ["study", "studies", "studying"], "answer": 0, "explain": "will 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, what's your dream job? M: I want to be a doctor and help people. W: I want to be a teacher like my mum. M: Let's work hard for our dreams!", "q": "What is Ben's dream job?", "options": ["Doctor", "Teacher", "Scientist"], "answer": 0, "explain": "Ben 说 I want to be a doctor"},
                        {"audioText": "M: Anna, do you think doctors are great? W: Yes! They save lives every day. M: I want to be a doctor too. W: Then let's study hard together! M: Deal!", "q": "What do they both want to be?", "options": ["Doctors", "Teachers", "Writers"], "answer": 0, "explain": "Anna 说 doctors are great, Ben 说 I want to be a doctor too"},
                    ],
                    'reading': [
                        {"passage": "Everyone has a dream job. Tom wants to be a scientist to find new cures. Lily dreams of being a writer to tell amazing stories. I want to be an engineer to build great bridges. No dream is too big if you work hard. What's your dream?", "q": "What does Lily want to be?", "options": ["A writer", "A scientist", "An engineer"], "answer": 0, "explain": "文中说 Lily dreams of being a writer"},
                        {"passage": "Dreams give us power. A dream is not just a wish — it is a goal. To make it come true, we must study hard, learn new things, and never give up. Many great people started with a small dream. What's your dream? Go for it!", "q": "What is a dream according to the passage?", "options": ["A goal, not just a wish", "A wish only", "A game"], "answer": 0, "explain": "文中说 A dream is not just a wish — it is a goal"},
                    ],
                },
                {
                    'code': "6A_U3",
                    'words': [("hero", "英雄"),("brave", "勇敢的"),("save", "拯救"),("help", "帮助"),("fire", "火"),("fighter", "战士"),("police", "警察"),("great", "伟大的")],
                    'grammar': [
                        {"q": "My grandpa is a ____ man.", "options": ["brave", "bravely", "bravery"], "answer": 0, "explain": "brave 是形容词修饰名词"},
                        {"q": "He saved a child ____ a fire.", "options": ["from", "to", "at"], "answer": 0, "explain": "save...from 表示从...中救出"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, who is your hero? M: My grandpa. He saved a child from a fire. W: Wow! He is so brave and great.", "q": "What did Ben's grandpa do?", "options": ["Saved a child from a fire", "Caught a thief", "Built a house"], "answer": 0, "explain": "Ben 说 He saved a child from a fire"},
                    ],
                    'reading': [
                        {"passage": "Real heroes are all around us. A firefighter runs into a burning building to save strangers. A teacher stays late to help a student. A police officer keeps our streets safe. Heroes don't wear capes — they wear brave hearts.", "q": "What does a firefighter do?", "options": ["Runs into fire to save people", "Teaches students", "Drives a bus"], "answer": 0, "explain": "文中说 A firefighter runs into a burning building"},
                    ],
                },
                {
                    'code': "6A_U4",
                    'words': [("sport", "运动"),("football", "足球"),("basketball", "篮球"),("swimming", "游泳"),("running", "跑步"),("match", "比赛"),("champion", "冠军"),("energy", "能量")],
                    'grammar': [
                        {"q": "Are you ready ____ the football match?", "options": ["for", "to", "at"], "answer": 0, "explain": "be ready for 是固定搭配"},
                        {"q": "Sport gives us ____ and health.", "options": ["energy", "energies", "energetic"], "answer": 0, "explain": "energy 是不可数名词"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, are you ready for the football match? M: Of course! Our team has practised for two weeks. W: Good luck! I'll cheer for you.", "q": "How long has the team practised?", "options": ["Two weeks", "One week", "Three days"], "answer": 0, "explain": "Ben 说 for two weeks"},
                    ],
                    'reading': [
                        {"passage": "Sport is more than a game. Football and basketball teach us teamwork. Swimming and running build strong bodies. Every match is a chance to learn — winning is great, losing teaches us to try harder. A true champion never gives up!", "q": "What does sport teach us?", "options": ["Teamwork and persistence", "Only winning", "How to rest"], "answer": 0, "explain": "文中说 teach us teamwork, never gives up"},
                    ],
                },
                {
                    'code': "6A_U5",
                    'words': [("eat", "吃"),("healthy", "健康的"),("vegetable", "蔬菜"),("junk food", "垃圾食品"),("vitamin", "维生素"),("fat", "脂肪"),("energy", "能量"),("balance", "平衡")],
                    'grammar': [
                        {"q": "Fresh vegetables have many ____.", "options": ["vitamins", "vitamin", "fat"], "answer": 0, "explain": "many 后接可数名词复数"},
                        {"q": "You are ____ you eat.", "options": ["what", "who", "how"], "answer": 0, "explain": "You are what you eat 是谚语"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, eat more vegetables. They have vitamins. W: Can I have some chips too? M: A little is OK, but junk food has too much fat.", "q": "Why should Anna eat vegetables?", "options": ["They have vitamins", "They taste good", "They are cheap"], "answer": 0, "explain": "妈妈说 They have vitamins"},
                    ],
                    'reading': [
                        {"passage": "Doctors say, \"You are what you eat.\" If we eat too much junk food, we get tired and weak. Fresh vegetables and fruit give us vitamins and energy. A balanced plate has rice, meat, vegetables and fruit. Eat smart, stay strong!", "q": "What happens if we eat too much junk food?", "options": ["We get tired and weak", "We get stronger", "We feel happier"], "answer": 0, "explain": "文中说 we get tired and weak"},
                    ],
                },
                {
                    'code': "6A_U6",
                    'words': [("Earth", "地球"),("pollution", "污染"),("recycle", "回收"),("plastic", "塑料"),("tree", "树"),("river", "河流"),("protect", "保护"),("save", "拯救")],
                    'grammar': [
                        {"q": "We must ____ our Earth.", "options": ["protect", "protects", "protecting"], "answer": 0, "explain": "must 后跟动词原形"},
                        {"q": "Let's start ____ small.", "options": ["from", "to", "at"], "answer": 0, "explain": "start from 表示从...开始"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, pollution is so bad. We must do something. M: Let's recycle paper and plastic. W: And plant more trees. Every little bit helps!", "q": "What do they want to recycle?", "options": ["Paper and plastic", "Food and water", "Clothes and shoes"], "answer": 0, "explain": "Ben 说 recycle paper and plastic"},
                    ],
                    'reading': [
                        {"passage": "Earth is our only home. Air and river pollution hurt people, animals and plants. Plastic stays in the Earth for hundreds of years. But we can help — recycle, plant trees, use less plastic. Small actions can save our beautiful planet!", "q": "How long does plastic stay in the Earth?", "options": ["Hundreds of years", "One year", "Ten years"], "answer": 0, "explain": "文中说 Plastic stays for hundreds of years"},
                    ],
                },
                {
                    'code': "6A_U7",
                    'words': [("invention", "发明"),("invent", "发明"),("phone", "电话"),("computer", "电脑"),("internet", "互联网"),("robot", "机器人"),("change", "改变"),("future", "未来")],
                    'grammar': [
                        {"q": "What ____ do you love most?", "options": ["invention", "inventions", "inventing"], "answer": 0, "explain": "Which 后接单数名词"},
                        {"q": "Inventions ____ our world.", "options": ["change", "changes", "changing"], "answer": 0, "explain": "复数 Inventions 后用动词原形"},
                    ],
                    'listening': [
                        {"audioText": "M: Anna, what invention do you love most? W: The phone, because I can talk to Grandma far away. M: I love the computer. It helps me learn.", "q": "Why does Anna love the phone?", "options": ["She can talk to Grandma", "It's cheap", "It's new"], "answer": 0, "explain": "Anna 说 I can talk to Grandma far away"},
                    ],
                    'reading': [
                        {"passage": "Some inventions changed the world forever. Paper helped knowledge travel far. The light bulb turned night into day. The phone brought voices across oceans. The internet connected the whole world. What will the next great invention be?", "q": "What did the light bulb do?", "options": ["Turned night into day", "Connected the world", "Helped knowledge travel"], "answer": 0, "explain": "文中说 The light bulb turned night into day"},
                    ],
                },
                {
                    'code': "6A_U8",
                    'words': [("friendship", "友谊"),("trust", "信任"),("kind", "友善的"),("help", "帮助"),("share", "分享"),("forgive", "原谅"),("miss", "想念"),("forever", "永远")],
                    'grammar': [
                        {"q": "True friendship lasts ____.", "options": ["forever", "forevers", "foreverly"], "answer": 0, "explain": "forever 是副词"},
                        {"q": "A true friend is someone you can ____.", "options": ["trust", "trusts", "trusting"], "answer": 0, "explain": "情态动词 can 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, we've been friends for six years. I'll miss you in junior high. M: Don't worry — true friendship lasts forever. W: Promise we'll stay in touch?", "q": "How long have they been friends?", "options": ["Six years", "Three years", "One year"], "answer": 0, "explain": "Anna 说 we've been friends for six years"},
                    ],
                    'reading': [
                        {"passage": "What makes a true friend? First, trust — we tell our secrets to a friend we trust. Second, kindness — a friend helps without being asked. Third, forgiveness — friends make mistakes but forgive. True friends share joy and sadness. Friendship is a treasure forever!", "q": "What is the first thing in friendship?", "options": ["Trust", "Kindness", "Forgiveness"], "answer": 0, "explain": "文中说 First, trust"},
                    ],
                },
                {
                    'code': "6A_U9",
                    'words': [("future", "未来"),("bright", "光明的"),("goal", "目标"),("believe", "相信"),("thank", "感谢"),("goodbye", "再见")],
                    'grammar': [
                        {"q": "The future is ____.", "options": ["bright", "brightly", "brightness"], "answer": 0, "explain": "bright 是形容词，作表语"},
                        {"q": "____ you, primary school!", "options": ["Thank", "Thanks", "Thanking"], "answer": 0, "explain": "感叹句型 Thank you 的简化"},
                    ],
                    'listening': [
                        {"audioText": "W: Ben, six years are over. It's time to say goodbye. M: Goodbye to primary, hello to junior! W: Believe in yourself. Our future is bright!", "q": "What does Ben look forward to?", "options": ["Junior school", "Summer holiday", "Staying in primary"], "answer": 0, "explain": "Ben 说 hello to junior"},
                    ],
                    'reading': [
                        {"passage": "Today we say goodbye to primary school. Six years gave us knowledge, courage and good friends. Believe in your dreams and set big goals. The future is bright for those who work hard. Thank you, teachers. Thank you, friends. The best is yet to come!", "q": "What did primary school give them?", "options": ["Knowledge, courage and friends", "Money and toys", "Games and fun"], "answer": 0, "explain": "文中说 Six years gave us knowledge, courage and good friends"},
                    ],
                },
            ]},
    # grade1上 - 2单元 10词（无课文，仅拼写+语法+听力）
    '1A': {'grade': 1, 'term': '上', 'units': [
                {
                    'code': "1A_U1",
                    'words': [("hello", "你好"),("hi", "嗨"),("I", "我"),("you", "你"),("name", "名字")],
                    'grammar': [
                        {"q": "Hello! I ____ Tom.", "options": ["am", "is", "are"], "answer": 0, "explain": "I 后用 am"},
                        {"q": "What's ____ name?", "options": ["your", "you", "yours"], "answer": 0, "explain": "your + 名词"},
                    ],
                    'listening': [
                        {"audioText": "M: Hello! I'm Tom. What's your name? W: Hi, Tom. My name is Amy. Nice to meet you!", "q": "What is the girl's name?", "options": ["Amy", "Tom", "Anna"], "answer": 0, "explain": "女孩说 My name is Amy"},
                    ],
                },
                {
                    'code': "1A_U2",
                    'words': [("one", "一"),("two", "二"),("three", "三"),("four", "四"),("five", "五")],
                    'grammar': [
                        {"q": "I have ____ fingers on one hand.", "options": ["five", "four", "three"], "answer": 0, "explain": "一只手有五根手指"},
                        {"q": "Let's ____ together!", "options": ["count", "counts", "counting"], "answer": 0, "explain": "Let's 后跟动词原形"},
                    ],
                    'listening': [
                        {"audioText": "M: Let's count! One, two, three, four, five. W: I have five fingers on my hand. M: Can you count with me?", "q": "How many fingers on one hand?", "options": ["Five", "Four", "Three"], "answer": 0, "explain": "一只手有五根手指"},
                    ],
                },
            ]},
    # grade1下 - 2单元 10词
    '1B': {'grade': 1, 'term': '下', 'units': [
                {
                    'code': "1B_U1",
                    'words': [("red", "红色"),("blue", "蓝色"),("yellow", "黄色"),("green", "绿色"),("black", "黑色")],
                    'grammar': [
                        {"q": "I like ____.", "options": ["green", "greens", "greening"], "answer": 0, "explain": "颜色词是名词"},
                        {"q": "What colour ____ you like?", "options": ["do", "does", "is"], "answer": 0, "explain": "问你喜欢什么颜色用 do"},
                    ],
                    'listening': [
                        {"audioText": "W: Look at the rainbow! I see red, yellow and blue. M: I like green. What colour do you like? W: I like black.", "q": "What colour does the boy like?", "options": ["Green", "Red", "Yellow"], "answer": 0, "explain": "男孩说 I like green"},
                    ],
                },
                {
                    'code': "1B_U2",
                    'words': [("mum", "妈妈"),("dad", "爸爸"),("baby", "婴儿"),("love", "爱"),("family", "家庭")],
                    'grammar': [
                        {"q": "This is ____ mum.", "options": ["my", "I", "me"], "answer": 0, "explain": "my 是形容词性物主代词"},
                        {"q": "I ____ my family.", "options": ["love", "loves", "loving"], "answer": 0, "explain": "I 后用动词原形"},
                    ],
                    'listening': [
                        {"audioText": "W: This is my family. M: Who is she? W: She is my mum. And this is my dad. M: I love my family too!", "q": "Who is the first person in the photo?", "options": ["Mum", "Dad", "Baby"], "answer": 0, "explain": "女孩先说 She is my mum"},
                    ],
                },
            ]},
    # grade2上 - 2单元 10词
    '2A': {'grade': 2, 'term': '上', 'units': [
                {
                    'code': "2A_U1",
                    'words': [("cat", "猫"),("dog", "狗"),("bird", "鸟"),("fish", "鱼"),("rabbit", "兔子")],
                    'grammar': [
                        {"q": "I have a ____ and a dog.", "options": ["cat", "cats", "the cat"], "answer": 0, "explain": "a 后接单数名词"},
                        {"q": "They ____ my good friends.", "options": ["are", "is", "am"], "answer": 0, "explain": "复数 They 后用 are"},
                    ],
                    'listening': [
                        {"audioText": "M: I have many pets. I have a cat and a dog. W: What colour is your cat? M: My cat is black and my dog is white.", "q": "What colour is the cat?", "options": ["Black", "White", "Brown"], "answer": 0, "explain": "男孩说 My cat is black"},
                    ],
                },
                {
                    'code': "2A_U2",
                    'words': [("head", "头"),("hand", "手"),("foot", "脚"),("eye", "眼睛"),("ear", "耳朵")],
                    'grammar': [
                        {"q": "I have two ____.", "options": ["eyes", "eye", "head"], "answer": 0, "explain": "two 后接复数 eyes"},
                        {"q": "I see with my ____.", "options": ["eyes", "ears", "hands"], "answer": 0, "explain": "用眼睛看"},
                    ],
                    'listening': [
                        {"audioText": "M: This is my body. I have two eyes and two ears. W: I see with my eyes and hear with my ears. M: Touch your head!", "q": "What do we use to hear?", "options": ["Ears", "Eyes", "Hands"], "answer": 0, "explain": "女孩说 hear with my ears"},
                    ],
                },
            ]},
    # grade2下 - 2单元 10词
    '2B': {'grade': 2, 'term': '下', 'units': [
                {
                    'code': "2B_U1",
                    'words': [("apple", "苹果"),("banana", "香蕉"),("orange", "橙子"),("pear", "梨"),("grape", "葡萄")],
                    'grammar': [
                        {"q": "I like apples ____ bananas.", "options": ["and", "but", "or"], "answer": 0, "explain": "并列用 and"},
                        {"q": "Fruit is ____ and healthy.", "options": ["sweet", "sweetly", "sweets"], "answer": 0, "explain": "sweet 是形容词"},
                    ],
                    'listening': [
                        {"audioText": "W: I like apples and bananas. M: My mum likes oranges. W: My dad likes grapes. Fruit is sweet and healthy.", "q": "What does Mum like?", "options": ["Oranges", "Apples", "Bananas"], "answer": 0, "explain": "男孩说 My mum likes oranges"},
                    ],
                },
                {
                    'code': "2B_U2",
                    'words': [("sunny", "晴朗的"),("rainy", "下雨的"),("windy", "有风的"),("hot", "热的"),("cold", "冷的")],
                    'grammar': [
                        {"q": "Today is ____. I am happy.", "options": ["sunny", "rain", "wind"], "answer": 0, "explain": "sunny 是形容词描述天气"},
                        {"q": "Yesterday was ____ and cold.", "options": ["rainy", "rain", "raining"], "answer": 0, "explain": "rainy 是形容词"},
                    ],
                    'listening': [
                        {"audioText": "W: Today is sunny. I am happy. M: Yesterday was rainy and cold. W: Tomorrow will be windy. I like sunny days.", "q": "What was the weather yesterday?", "options": ["Rainy and cold", "Sunny and warm", "Windy and hot"], "answer": 0, "explain": "男孩说 Yesterday was rainy and cold"},
                    ],
                },
            ]},
    # grade6下 - 11单元（2014旧版，已有基础题，按需补充）
    '6B': {'grade': 6, 'term': '下', 'units': [None]*11},
}


def build():
    spelling, grammar, listening, reading = [], [], [], []
    for book, meta in BOOKS.items():
        grade, term = meta['grade'], meta['term']
        units = meta.get('units', [])
        lcount = 0
        for i, u in enumerate(units):
            if u is None:
                continue
            code = u['code']
            # 拼写
            for en, cn in u.get('words', []):
                spelling.append({
                    'grade': grade, 'term': term, 'code': code,
                    'q': cn, 'answer': en.lower(), 'hint': hint_of(en),
                    'difficulty': 1 if grade <= 3 else 2,
                    'explain': f"'{cn}' 的英文是 {en}", 'source': 'ai_jk_v2',
                })
            # 语法
            for g in u.get('grammar', []):
                grammar.append({
                    'grade': grade, 'term': term, 'code': code,
                    'q': g['q'], 'options': g['options'], 'answer': g['answer'],
                    'explain': g['explain'], 'difficulty': g.get('difficulty', 1),
                    'source': 'ai_jk_v2',
                })
            # 听力
            for ls in u.get('listening', []):
                lcount += 1
                af = f"jk_listening_{book}_{lcount:02d}.mp3"
                listening.append({
                    'grade': grade, 'term': term, 'code': code,
                    'audioText': ls['audioText'], 'audioFile': af,
                    'q': ls['q'], 'options': ls['options'], 'answer': ls['answer'],
                    'explain': ls['explain'], 'difficulty': ls.get('difficulty', 1),
                    'source': 'ai_jk_v2',
                })
            # 阅读（grade3+）
            if grade >= 3:
                for rd in u.get('reading', []):
                    reading.append({
                        'grade': grade, 'term': term, 'code': code,
                        'passage': rd['passage'],
                        'q': rd['q'], 'options': rd['options'], 'answer': rd['answer'],
                        'explain': rd['explain'], 'difficulty': rd.get('difficulty', 1),
                        'source': 'ai_jk_v2',
                    })
    return spelling, grammar, listening, reading


def load_old(typ):
    """读取现有题库文件，不存在则返回 []"""
    p = os.path.join(QDIR, f'jk_{typ}.json')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    return []


def _grade_term_label(g, t):
    """年级/学期 → 可读标签"""
    return f"G{g}{'上' if t == '上' else '下'}"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--force', action='store_true',
                    help='跳过安全确认，直接写入')
    args = ap.parse_args()
    spelling, grammar, listening, reading = build()
    total = len(spelling)+len(grammar)+len(listening)+len(reading)
    print(f"[jk题库 本次精造] 拼写{len(spelling)} / 语法{len(grammar)} / 听力{len(listening)} / 阅读{len(reading)} / 共{total}题")
    if listening:
        print(f"[听力音频] " + ", ".join(q['audioFile'] for q in listening[:5]) +
              (f"... 共{len(listening)}个" if len(listening) > 5 else ""))

    if not args.write or total == 0:
        if not args.write:
            print("(dry-run，加 --write 实际写入)")
        else:
            print("  (无题目数据，未写入)")
        return

    # 需要重建的 (grade, term) 集合（仅包含实际填充了数据的册）
    rebuild_keys = set()
    for meta in BOOKS.values():
        units = meta.get('units', [])
        if any(u is not None for u in units):
            rebuild_keys.add((meta['grade'], meta['term']))

    # 🔒 L2 安全网：写入前先备份旧文件
    os.makedirs(QDIR, exist_ok=True)
    backup_dir = os.path.join(QDIR, '.backups')
    os.makedirs(backup_dir, exist_ok=True)
    from datetime import datetime
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    backed_up = []
    for typ in ['spelling', 'grammar', 'listening', 'reading']:
        p = os.path.join(QDIR, f'jk_{typ}.json')
        if os.path.exists(p):
            bak = os.path.join(backup_dir, f'jk_{typ}_{ts}.json')
            import shutil
            shutil.copy2(p, bak)
            backed_up.append((typ, len(load_old(typ))))
    if backed_up:
        print(f"[🔒 备份] {backup_dir}/  ({ts})")
        for typ, cnt in backed_up:
            print(f"    jk_{typ}_{ts}.json  ({cnt}题)")

    # 📊 差异报告
    print(f"\n[📊 差异报告] 本次重建范围: {', '.join(_grade_term_label(g,t) for g,t in sorted(rebuild_keys))}")
    for typ, new_data in [('spelling', spelling), ('grammar', grammar),
                           ('listening', listening), ('reading', reading)]:
        old = load_old(typ)
        removed = [q for q in old if (q.get('grade'), q.get('term')) in rebuild_keys]
        kept = [q for q in old if (q.get('grade'), q.get('term')) not in rebuild_keys]
        merged = kept + new_data
        p = os.path.join(QDIR, f'jk_{typ}.json')
        print(f"  {typ:9s}: 旧{len(old)} → 保留{len(kept)} + 新{len(new_data)} → 合并{len(merged)}题  |  替换{len(removed)}条旧题")
        # 🚨 如果合并后题量骤降 30% 以上且非 --force，中断并提示
        if len(old) > 0 and len(merged) < len(old) * 0.7 and not args.force:
            print(f"\n  ⛔ 安全阻断：{typ} 合并后 ({len(merged)}) 比旧版 ({len(old)}) 减少 {(1 - len(merged)/len(old))*100:.0f}%，超过 30% 阈值")
            print(f"     如果是预期行为，请用 --force 跳过。旧题已备份于 {backup_dir}/")
            return
        tmp = p + '.tmp'
        with open(tmp, 'w', encoding='utf-8') as f:
            json.dump(merged, f, ensure_ascii=False, indent=2)
        os.replace(tmp, p)
    total_merged = sum(
        len(load_old(t)) for t in ['spelling','grammar','listening','reading']
    )
    print(f"\n[✅ 写入完成] 题库合并后总计 {total_merged} 题\n")


if __name__ == '__main__':
    main()
