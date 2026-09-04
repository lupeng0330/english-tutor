# -*- coding: utf-8 -*-
"""
生成考试模块数据（广州考纲 120 分制）
==================================================
产出两份文件：
  1) data/exams/exam_config.json   —— 模拟卷(期中/期末) + 单元测试模板
  2) data/exams/real_papers/index.json —— 各地区历年真题（仿真·固定卷，方案A）

设计要点：
  * 卷面满分 120 分，时间 100 分钟（与广州中考一致）。
  * 自动判分 90 分（听力30+语法15+完形15+阅读30），书面表达 30 分（参考分，不自动判分）。
  * 单元测试为累积式：第 N 单元测试 = 单元 [1, N]（本单元为主 + 复习前面学过的内容），纯自动判分。
  * 真题卷为「固定卷」：每份带稳定 seed，前端用种子化随机生成 → 同一份卷每次题目一致、可重复对答案。
  * 真题题目仍来自现有题库（合规：仿真结构，非照搬版权原卷）。

用法：python scripts/gen_exam_papers.py
"""
import json
import os
import zlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXAM_DIR = os.path.join(ROOT, "data", "exams")
REAL_DIR = os.path.join(EXAM_DIR, "real_papers")

# ---------------------------------------------------------------------------
# 标准 120 分卷题型结构（期中/期末/真题通用）
# 自动判分 90 + 书面表达 30 = 120
# ---------------------------------------------------------------------------
def full_sections(unit_range, prompt, model):
    return [
        {"type": "listening", "title": "一、听力理解", "count": 15, "points": 2,   "unitRange": unit_range},
        {"type": "grammar",   "title": "二、语法选择", "count": 15, "points": 1,   "unitRange": unit_range},
        {"type": "cloze",     "title": "三、完形填空", "count": 10, "points": 1.5, "unitRange": unit_range},
        {"type": "reading",   "title": "四、阅读理解", "count": 15, "points": 2,   "unitRange": unit_range},
        {"type": "writing",   "title": "五、书面表达", "count": 1,  "points": 30,  "unitRange": unit_range,
         "prompts": [prompt], "modelAnswers": [model]},
    ]

# 单元测试结构（纯自动判分，累积式，约 50 分 / 40 分钟）
def unit_test_sections():
    return [
        {"type": "listening", "title": "一、听力理解", "count": 5,  "points": 2},
        {"type": "grammar",   "title": "二、语法选择", "count": 10, "points": 1},
        {"type": "cloze",     "title": "三、完形填空", "count": 5,  "points": 2},
        {"type": "reading",   "title": "四、阅读理解", "count": 10, "points": 2},
    ]

# ---------------------------------------------------------------------------
# 各年级写作题库（题目 + 范文），按年级取用
# ---------------------------------------------------------------------------
WRITING = {
    7: [
        ("请以 'My Best Friend' 为题，写一篇不少于60词的短文。内容包括：1. 朋友的外貌和性格；2. 你们的共同爱好；3. 为什么他/她是你最好的朋友。",
         "My best friend is Li Ming. He is tall and thin with short black hair. He is friendly and helpful. We both like playing basketball and reading books. After school, we often play together. He always helps me with my homework. I think he is the best friend because he is kind and honest."),
        ("请以 'My Daily Life' 为题，写一篇不少于60词的短文。内容包括：1. 你每天的时间安排；2. 你最喜欢的科目或活动；3. 你对日常生活的感受。",
         "I usually get up at 6:30 in the morning. After breakfast, I go to school by bus. My favourite subject is English because it is interesting. In the afternoon, I play sports with my classmates. I go to bed at 9:30. I enjoy my daily life very much."),
        ("请以 'My School' 为题，写一篇不少于70词的短文。内容包括：1. 学校的基本情况；2. 你最喜欢的老师和科目；3. 你在学校的感受。",
         "My school is big and beautiful. There are many trees and flowers. My favourite teacher is Miss Wang because she is patient and kind. I like English very much. I have many good friends at school. We study and play together. I love my school."),
        ("请以 'Protecting the Environment' 为题，写一篇不少于60词的短文，谈谈我们能为保护环境做些什么。",
         "We should protect our environment. First, we can plant more trees. Second, we should not throw rubbish everywhere. Third, we can save water and electricity. If everyone does something, our Earth will be more beautiful."),
    ],
    8: [
        ("请以 'My Hobby' 为题，写一篇不少于80词的短文。内容包括：1. 你的爱好是什么；2. 你是如何发展这个爱好的；3. 这个爱好给你带来了什么。",
         "My hobby is playing the piano. I started learning it when I was seven years old. At first, it was difficult, but I kept practising every day. Now I can play many beautiful songs. Playing the piano makes me feel relaxed and happy. I also made many friends through music. I will never give up this hobby."),
        ("请以 'An Unforgettable Experience' 为题，写一篇不少于80词的短文，描述一次难忘的经历。",
         "Last year, I took part in an English speech competition. I was very nervous at first. But my teacher encouraged me a lot. I practised every evening for two weeks. On the competition day, I did my best and won second prize. It was an unforgettable experience because I learned that hard work pays off."),
        ("请以 'Volunteering' 为题，写一篇不少于80词的短文，谈谈你对志愿服务的看法或经历。",
         "Volunteering is a meaningful activity. Last month, I volunteered at a local library. I helped organise books and taught children to read. It was tiring but rewarding. I learned that helping others makes me feel happy. I plan to do more volunteer work in the future."),
        ("请以 'Good Habits' 为题，写一篇不少于80词的短文。内容包括：1. 你有哪些好习惯；2. 这些习惯给你带来了什么好处。",
         "Good habits are very important in our life. I get up early every day and do morning exercises. I read books for at least 30 minutes before going to bed. I also keep a diary in English. These habits help me stay healthy and improve my English. I believe good habits lead to a better life."),
    ],
    9: [
        ("请以 'The Power of Dreams' 为题，写一篇不少于100词的短文。内容包括：1. 你的梦想是什么；2. 你将如何实现它；3. 梦想对你的意义。",
         "Everyone has dreams. My dream is to become a doctor. I want to help sick people and save lives. To achieve this dream, I study very hard at school, especially science subjects. I also read books about medicine in my free time. Dreams give me motivation and direction. I believe that with hard work and determination, my dream will come true one day."),
        ("请以 'Online Learning' 为题，写一篇不少于100词的短文，谈谈你对在线学习的看法。",
         "Online learning has become very popular. It has both advantages and disadvantages. On the one hand, it is convenient because we can learn anytime and anywhere. On the other hand, it requires strong self-discipline. In my opinion, the best way is to combine online and offline learning. We can use the Internet to find useful materials, but we also need face-to-face communication with teachers and classmates."),
        ("请以 'My Junior High School Life' 为题，写一篇不少于100词的短文，回顾你的初中生活。",
         "My junior high school life is coming to an end. Looking back, I have many wonderful memories. I made good friends who always supported me. My teachers taught me not only knowledge but also how to be a good person. I worked hard and improved a lot. Though there were difficult times, I never gave up. I will always remember these three years."),
        ("请以 'Being a Responsible Teenager' 为题，写一篇不少于100词的短文，谈谈青少年应如何承担责任。",
         "As teenagers, we have responsibilities to ourselves, our families, and society. First, we should study hard to prepare for our future. Second, we should help our parents with housework and show respect to them. Third, we should care about our community. For example, we can volunteer or help those in need. Being responsible helps us grow into better people."),
    ],
}

def pick_writing(grade, salt):
    pool = WRITING[grade]
    return pool[salt % len(pool)]

def seed_of(s):
    return zlib.crc32(s.encode("utf-8")) & 0xFFFFFFFF

# ===========================================================================
# 1) exam_config.json —— 模拟卷 + 单元测试模板
# ===========================================================================
def build_exam_config():
    grades = {}
    for g in (7, 8, 9):
        grades[str(g)] = {}
        for term in ("上", "下"):
            mid_p, mid_m = pick_writing(g, 0)
            fin_p, fin_m = pick_writing(g, 1 if term == "上" else 2)
            final_name = "期末考试 / 中考模拟" if (g == 9 and term == "下") else "期末考试"
            entry = {
                "midterm": {
                    "name": "期中考试", "time": 100, "unitRange": [1, 4],
                    "sections": full_sections([1, 4], mid_p, mid_m),
                    "totalPoints": 120, "autoPoints": 90,
                },
                "final": {
                    "name": final_name, "time": 100, "unitRange": [1, 8],
                    "sections": full_sections([1, 8], fin_p, fin_m),
                    "totalPoints": 120, "autoPoints": 90,
                },
                # 单元测试模板：前端按 maxUnit 展开为 第1~第N单元测试（累积 [1,N]）
                "unitTest": {
                    "namePattern": "第{n}单元测试",
                    "time": 40, "maxUnit": 8, "cumulative": True,
                    "sections": unit_test_sections(),
                },
            }
            grades[str(g)][term] = entry

    return {
        "version": 2,
        "scoreSystem": {"total": 120, "auto": 90, "writing": 30, "time": 100},
        "grades": grades,
        "typeLabels": {"listening": "听力", "spelling": "拼写", "grammar": "语法",
                        "cloze": "完形", "reading": "阅读", "writing": "写作"},
        "typeIcons": {"listening": "👂", "spelling": "📝", "grammar": "🔤",
                       "cloze": "📋", "reading": "📖", "writing": "✍️"},
        "typeOrder": ["listening", "grammar", "cloze", "reading", "writing"],
    }

# ===========================================================================
# 2) real_papers/index.json —— 各地区仿真真题（固定卷）+ 中考卷
# ===========================================================================
# 地区列表（广州各区 + 清远 + 深圳/东莞/佛山）
REGIONS = [
    ("gz_th",  "广州·天河区"),
    ("gz_yx",  "广州·越秀区"),
    ("gz_py",  "广州·番禺区"),
    ("gz_zc",  "广州·增城区"),
    ("gz_ch",  "广州·从化区"),
    ("qy",     "清远市"),
    ("sz",     "深圳市"),
    ("dg",     "东莞市"),
    ("fs",     "佛山市"),
]

# 每地区覆盖：初一/初二/初三（仿真期末）+ 中考卷
YEARS = {7: 2024, 8: 2024, 9: 2024}

def build_real_papers():
    papers = []
    for rid, rname in REGIONS:
        # 初一（7下期末）、初二（8下期末）、初三（9上期末）
        for grade, term, tag in ((7, "下", "初一下学期期末"),
                                 (8, "下", "初二下学期期末"),
                                 (9, "上", "初三上学期期末")):
            pid = f"{rid}_g{grade}_{'a' if term=='上' else 'b'}_final"
            year = YEARS[grade]
            prompt, model = pick_writing(grade, seed_of(pid))
            papers.append({
                "id": pid, "region": rname, "grade": grade, "term": term,
                "year": year, "kind": "final",
                "name": f"{year} {rname} {tag}（仿真）",
                "time": 100, "unitRange": [1, 8], "seed": seed_of(pid), "fixed": True,
                "sections": full_sections([1, 8], prompt, model),
                "totalPoints": 120, "autoPoints": 90,
            })
        # 中考卷（grade 9 下，全册）
        pid = f"{rid}_zhongkao"
        prompt, model = pick_writing(9, seed_of(pid))
        papers.append({
            "id": pid, "region": rname, "grade": 9, "term": "下",
            "year": 2024, "kind": "zhongkao",
            "name": f"2024 {rname} 中考英语（仿真）",
            "time": 100, "unitRange": [1, 8], "seed": seed_of(pid), "fixed": True,
            "sections": full_sections([1, 8], prompt, model),
            "totalPoints": 120, "autoPoints": 90,
        })
    return {
        "version": 1,
        "note": "仿真真题（方案A）：按广东各地区真实卷题型结构组卷，题目来自本项目题库，固定不变、可重复对答案。",
        "regions": [r[1] for r in REGIONS],
        "papers": papers,
    }

def main():
    os.makedirs(REAL_DIR, exist_ok=True)

    cfg = build_exam_config()
    with open(os.path.join(EXAM_DIR, "exam_config.json"), "w", encoding="utf-8") as f:
        json.dump(cfg, f, ensure_ascii=False, indent=2)
    print("[OK] exam_config.json 生成完成")

    real = build_real_papers()
    with open(os.path.join(REAL_DIR, "index.json"), "w", encoding="utf-8") as f:
        json.dump(real, f, ensure_ascii=False, indent=2)
    print(f"[OK] real_papers/index.json 生成完成，共 {len(real['papers'])} 份真题卷")

if __name__ == "__main__":
    main()
