# -*- coding: utf-8 -*-
"""
把 deepseek_json_20260504_3c173e.json（三起·六年级下册全册）导入 jk.json grade6.下。
同时提取额外资源：
  - 不规则动词表  → data/extras/jk_grade6_xia_irregular_verbs.json
  - 阅读题 / 语法表 / 选择题 → data/extras/jk_grade6_xia_exercises.json
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = r"C:\Users\penglu\Downloads\deepseek_json_20260504_3c173e.json"
JK   = os.path.join(ROOT, "data", "textbooks", "jk.json")
EXTRAS_DIR = os.path.join(ROOT, "data", "extras")

# 常见单词音标 / 例句兜底 (后续可人工补全)
def make_word_entry(w):
    """从 deepseek 源格式 {单词, 词性, 释义} 生成我们项目的 {word, phonetic, meaning, example}"""
    word = w.get("单词", "").strip()
    pos  = w.get("词性", "").strip()
    meaning_raw = w.get("释义", "").strip()
    # 释义里带词性前缀 / 过去式注释，保留成 meaning
    meaning = meaning_raw
    if pos and pos not in ("短语",):
        meaning_display = f"[{pos}] {meaning}" if meaning else pos
    else:
        meaning_display = meaning
    return {
        "word": word,
        "phonetic": "",            # 先留空，后续可以批量补
        "meaning": meaning_display,
        "example": ""              # 由 data/examples/*.json 承接
    }


def flatten_section_to_lesson(section_name, section_value):
    """
    把一个板块（value 可能是 list 或 dict）转成 0-N 个 lessons。
    返回: (lessons_list, extras_list)
      extras_list: {kind, title, data} 额外结构化资源
    """
    lessons = []
    extras  = []

    def lines_to_en_cn(items):
        """items: [{英文,中文} 或 {说话人,英文,中文} 或 {Scene,说话人,英文,中文}]"""
        en_lines, cn_lines = [], []
        for it in items:
            speaker = it.get("说话人", "")
            en = it.get("英文", "").strip()
            cn = it.get("中文", "").strip()
            if speaker and speaker not in ("Narrator",):
                en_lines.append(f"{speaker}: {en}")
                cn_lines.append(f"{speaker}：{cn}")
            else:
                en_lines.append(en)
                cn_lines.append(cn)
        return "\n".join(en_lines), "\n".join(cn_lines)

    def pure_text_lesson(title_label, items, page):
        en, cn = lines_to_en_cn(items)
        if en.strip():
            lessons.append({
                "page": page,
                "title": title_label,
                "en": en,
                "cn": cn
            })

    if isinstance(section_value, list):
        # 简单列表：直接做一篇
        pure_text_lesson(section_name, section_value, section_name)

    elif isinstance(section_value, dict):
        # 复合结构
        # 1) 短文 + 阅读题（Fun with language / Read and answer / 扩展阅读）
        if "短文内容" in section_value:
            title = section_value.get("短文标题") or section_value.get("标题") or section_name
            short_title = section_name + " · " + title if title and title != section_name else section_name
            items = section_value.get("短文内容", [])
            en, cn = lines_to_en_cn(items)
            if en.strip():
                lessons.append({
                    "page": section_name,
                    "title": short_title,
                    "en": en,
                    "cn": cn
                })
            # 阅读题
            qs = section_value.get("阅读题目") or section_value.get("阅读表格") or []
            if qs:
                extras.append({
                    "kind": "reading_qa",
                    "title": short_title,
                    "data": qs
                })

        elif "内容" in section_value and "标题" in section_value:
            # 扩展阅读（单篇）
            title = section_value.get("标题", section_name)
            items = section_value.get("内容", [])
            en, cn = lines_to_en_cn(items)
            if en.strip():
                lessons.append({
                    "page": section_name,
                    "title": section_name + " · " + title,
                    "en": en,
                    "cn": cn
                })

        elif "内容" in section_value and "类型" in section_value:
            # Unit 10 Let's read: A letter to John
            items = section_value.get("内容", [])
            en, cn = lines_to_en_cn(items)
            typ = section_value.get("类型", "")
            if en.strip():
                lessons.append({
                    "page": section_name,
                    "title": (section_name + " · " + typ) if typ else section_name,
                    "en": en,
                    "cn": cn
                })
            qs = section_value.get("阅读题目") or []
            if qs:
                extras.append({
                    "kind": "reading_qa",
                    "title": section_name + " · " + typ,
                    "data": qs
                })

        elif "对话" in section_value and "语法表格" in section_value:
            # Language focus - Unit 5
            dialogues = section_value.get("对话", [])
            for d in dialogues:
                title = d.get("标题", "")
                items = d.get("内容", [])
                en, cn = lines_to_en_cn(items)
                if en.strip():
                    lessons.append({
                        "page": section_name,
                        "title": section_name + " · " + title,
                        "en": en,
                        "cn": cn
                    })
            extras.append({
                "kind": "grammar_table",
                "title": section_name,
                "data": section_value.get("语法表格", [])
            })

        elif "短文" in section_value and "选择题" in section_value:
            # Language focus - Unit 7
            items = section_value.get("短文", [])
            en, cn = lines_to_en_cn(items)
            if en.strip():
                lessons.append({
                    "page": section_name,
                    "title": section_name + " · 阅读短文",
                    "en": en,
                    "cn": cn
                })
            extras.append({
                "kind": "choice_qa",
                "title": section_name,
                "data": section_value.get("选择题", [])
            })

        elif "Look and say" in section_value:
            # Unit 7 Fun with language - good/bad manners
            look_say = section_value.get("Look and say", {})
            good = look_say.get("好习惯", [])
            bad  = look_say.get("坏习惯", [])
            all_items = [{"英文": "✓ Good manners:", "中文": "✓ 好习惯："}]
            all_items += good
            all_items.append({"英文": "", "中文": ""})
            all_items.append({"英文": "✗ Bad manners:", "中文": "✗ 坏习惯："})
            all_items += bad
            en, cn = lines_to_en_cn(all_items)
            if en.strip():
                lessons.append({
                    "page": section_name,
                    "title": section_name + " · Look and say",
                    "en": en,
                    "cn": cn
                })
            # 内嵌的 Read and answer
            if "Read and answer" in section_value:
                sub_lessons, sub_extras = flatten_section_to_lesson(
                    section_name + " · Read and answer",
                    section_value["Read and answer"]
                )
                lessons.extend(sub_lessons)
                extras.extend(sub_extras)

        elif "步骤" in section_value:
            # Project
            title = section_value.get("标题", section_name)
            steps = section_value.get("步骤", [])
            intro = section_value.get("介绍要点", [])
            content = "\n".join(steps)
            if intro:
                content += "\n\nPoints to include: " + " / ".join(intro)
            lessons.append({
                "page": section_name,
                "title": section_name + " · " + title,
                "en": content,
                "cn": "按上面步骤完成一份海报介绍一位名人。"
            })

    return lessons, extras


def build_unit(u_src, module_name):
    uid_src = u_src.get("单元编号", "").strip()   # "Unit 1"
    unit_num = uid_src.replace("Unit", "").strip()
    # 复合编号 (Unit 11 & 12) → u11
    if "&" in unit_num:
        unit_num = unit_num.split("&")[0].strip()
    uid = "u" + unit_num
    name = u_src.get("单元名称", "")
    title = f"Unit {unit_num} {name}"

    blocks = u_src.get("板块", {})
    lessons_all, extras_all = [], []
    for section_name, section_value in blocks.items():
        ls, ex = flatten_section_to_lesson(section_name, section_value)
        lessons_all.extend(ls)
        extras_all.extend(ex)

    return uid, {
        "id": uid,
        "title": title,
        "module": module_name,
        "words": [],      # 在 main 里按模块词汇批量填入
        "lessons": lessons_all,
        "extras": extras_all if extras_all else []
    }


def build_review_unit(u_src):
    uid = "u11"
    name = u_src.get("单元名称", "Review")
    title = "Unit 11-12 " + name
    blocks = u_src.get("板块", {})
    lessons, extras = [], []

    # 非洲旅行手册
    if "非洲旅行手册" in blocks:
        parks = blocks["非洲旅行手册"]
        en_parts, cn_parts = [], []
        for pname, pdata in parks.items():
            en_parts.append(f"{pname} ({pdata.get('国家','')}): {pdata.get('特点','')}")
            cn_parts.append(f"【{pname}】（{pdata.get('国家','')}）：{pdata.get('特点','')}")
            for item in pdata.get("可以看到", []):
                en_parts.append("  - " + item.get("英文", ""))
                cn_parts.append("  · " + item.get("中文", ""))
            en_parts.append("")
            cn_parts.append("")
        lessons.append({
            "page": "Review",
            "title": "Review · African Safari Brochure",
            "en": "\n".join(en_parts).strip(),
            "cn": "\n".join(cn_parts).strip()
        })

    # 复述寓言
    if "复述寓言" in blocks:
        fab = blocks["复述寓言"]
        story_title = fab.get("故事", "")
        en_parts, cn_parts = [f"{story_title}"], [f"《{story_title}》"]
        for scene in fab.get("情节", []):
            en_parts.append(scene.get("英文情节", ""))
            cn_parts.append(scene.get("中文情节", ""))
        en_parts.append("")
        en_parts.append("Moral: " + fab.get("寓意", ""))
        cn_parts.append("")
        cn_parts.append("寓意：" + fab.get("中文寓意", ""))
        lessons.append({
            "page": "Review",
            "title": "Review · Fable — " + story_title,
            "en": "\n".join(en_parts),
            "cn": "\n".join(cn_parts)
        })

    # 曼德拉
    if "写一写曼德拉" in blocks:
        m = blocks["写一写曼德拉"]
        en_parts = [m.get("人物", "") + ":"]
        cn_parts = [m.get("人物", "") + "："]
        for pt in m.get("生平要点", []):
            en_parts.append("  - " + pt.get("内容", ""))
            cn_parts.append("  · " + pt.get("要点", "") + "：" + pt.get("内容", ""))
        lessons.append({
            "page": "Review",
            "title": "Review · Nelson Mandela",
            "en": "\n".join(en_parts),
            "cn": "\n".join(cn_parts)
        })

    return uid, {
        "id": uid,
        "title": title,
        "module": "Module 6 Let's look back",
        "words": [],
        "lessons": lessons,
        "extras": []
    }


def main():
    with open(SRC, "r", encoding="utf-8") as f:
        src = json.load(f)
    with open(JK, "r", encoding="utf-8") as f:
        jk = json.load(f)

    # 单元词汇 -> 按 Module 索引
    module_vocab = src.get("词汇表", {}).get("单元词汇", {})  # {"Module 1": [...], ...}
    irregular    = src.get("词汇表", {}).get("不规则动词表", [])

    # 构建单元
    all_units = []
    exercises_by_unit = {}   # {uid: {reading_qa|grammar_table|choice_qa: [...]}}

    for module in src.get("模块", []):
        m_name = module.get("模块名称", "")
        m_code = module.get("模块编号", "")   # "Module 1"
        full_module = f"{m_code} {m_name}"
        vocab_list = module_vocab.get(m_code, [])

        if m_code == "Module 6":
            # Review 单元特殊处理
            for u in module.get("单元", []):
                uid, unit = build_review_unit(u)
                all_units.append(unit)
            continue

        units = module.get("单元", [])
        for u in units:
            uid, unit = build_unit(u, full_module)
            all_units.append(unit)

        # 把本模块词汇按"词首次在哪个单元课文出现"分配到对应单元
        # （每模块源数据把词汇合并成一个列表，但实际分属两个单元）
        if vocab_list and units:
            unit_ids = ["u" + u.get("单元编号", "").replace("Unit", "").strip() for u in units]
            # 收集每个单元的课文全文（lowercase，用于关键词匹配）
            unit_texts = {}
            for uid in unit_ids:
                for uu in all_units:
                    if uu["id"] == uid:
                        txt = " \n ".join(l.get("en", "") for l in uu.get("lessons", []))
                        unit_texts[uid] = " " + txt.lower() + " "
                        break

            # 为每个词决定归属
            assigned = {uid: [] for uid in unit_ids}
            for w in vocab_list:
                word = w.get("单词", "").strip()
                # 取主干（去掉 "/...说明"、"(...)"、空格后跟字母的说明词，如 "happen (to)" → "happen"）
                key_word = word.split("(")[0].split("/")[0].strip().lower()
                # 取其变体：短语匹配原样，单词匹配首词
                target = None
                for uid in unit_ids:
                    if key_word and key_word in unit_texts.get(uid, ""):
                        target = uid
                        break
                if target is None:
                    # 没命中 → 放到第一个单元兜底
                    target = unit_ids[0]
                assigned[target].append(make_word_entry(w))

            for uid, ws in assigned.items():
                for unit in all_units:
                    if unit["id"] == uid:
                        unit["words"] = ws
                        break

        # 提取 extras → exercises_by_unit
        for unit in all_units:
            if unit.get("extras"):
                exercises_by_unit[unit["id"]] = unit["extras"]
                del unit["extras"]
            elif "extras" in unit:
                del unit["extras"]

    # 写回 jk.json
    jk["grades"]["grade6"]["下"] = all_units
    jk["meta"]["note_grade6_xia"] = (
        "六年级下册 · 教科版《英语》三年级起点 · 教育科学出版社 "
        "(ISBN 978-7-5041-9216-5, 2014)，6 个模块 12 个单元"
    )

    with open(JK, "w", encoding="utf-8") as f:
        json.dump(jk, f, ensure_ascii=False, indent=2)

    # 写 extras
    os.makedirs(EXTRAS_DIR, exist_ok=True)
    with open(os.path.join(EXTRAS_DIR, "jk_grade6_xia_irregular_verbs.json"), "w", encoding="utf-8") as f:
        json.dump({"verbs": irregular}, f, ensure_ascii=False, indent=2)
    with open(os.path.join(EXTRAS_DIR, "jk_grade6_xia_exercises.json"), "w", encoding="utf-8") as f:
        json.dump({"exercises": exercises_by_unit}, f, ensure_ascii=False, indent=2)

    # 统计
    total_words = sum(len(u["words"]) for u in all_units)
    total_lessons = sum(len(u["lessons"]) for u in all_units)
    total_ex = sum(len(v) for v in exercises_by_unit.values())
    print("=" * 60)
    print(f"Imported: {len(all_units)} units, {total_words} words, "
          f"{total_lessons} lessons, {total_ex} exercise sets")
    print(f"Irregular verbs: {len(irregular)}")
    print("=" * 60)
    for u in all_units:
        mark = " ★" if u["id"] == "u1" else ""
        print(f"  {u['id']:>4}  {u['title']:<48s}  words={len(u['words'])}, lessons={len(u['lessons'])}{mark}")


if __name__ == "__main__":
    main()
