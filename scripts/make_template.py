# -*- coding: utf-8 -*-
"""生成题库导入 Excel 模板文件

用法：
  python scripts/make_template.py

会生成：scripts/excel_templates/题库导入模板.xlsx
"""
import os
import sys

try:
    import pandas as pd
except ImportError:
    print("需要: pip install pandas openpyxl")
    sys.exit(1)


TEMPLATES = {
    'spelling': {
        'columns': ['grade', 'term', 'code', 'q', 'answer', 'hint', 'difficulty', 'explain'],
        'examples': [
            [3, '上', '3A_U1', '书包', 'bag',  'b_g',  1, '学习用品：书包'],
            [5, '下', '5B_U2', '游泳', 'swim', 's___', 2, '运动：游泳'],
        ]
    },
    'listening': {
        'columns': ['grade', 'term', 'code', 'audioText', 'q', 'optionA', 'optionB', 'optionC', 'optionD', 'answer', 'difficulty', 'explain'],
        'examples': [
            [3, '上', '3A_U1', "W: Hello, I'm Amy. M: Hi, Amy.", "What's the girl's name?", 'Amy', 'Ann', 'Alice', '', 0, 1, "直接听到女孩叫 Amy"],
            [5, '下', '5B_U1', 'M: We should plant more trees.', 'What should we do?', 'Plant trees', 'Cut trees', 'Pollute rivers', '', 0, 2, '种更多树'],
        ]
    },
    'grammar': {
        'columns': ['grade', 'term', 'code', 'q', 'optionA', 'optionB', 'optionC', 'optionD', 'answer', 'difficulty', 'explain'],
        'examples': [
            [3, '上', '3A_U1', 'There ____ a book on the desk.', 'is', 'are', 'am', '', 0, 1, '单数用 is'],
            [6, '上', '6A_U1', 'He is ____ than Tom.', 'tall', 'taller', 'tallest', '', 1, 2, '比较级'],
        ]
    },
    'reading': {
        'columns': ['grade', 'term', 'code', 'passage', 'q', 'optionA', 'optionB', 'optionC', 'optionD', 'answer', 'difficulty', 'explain'],
        'examples': [
            [3, '上', '3A_U1', 'I have a new bag. It is blue. There are 3 books in it.', 'How many books are there?', '2', '3', '4', '', 1, 1, '明确说 3 本书'],
        ]
    }
}

NOTES = {
    'spelling':  '字段说明：\n  grade=1~9年级\n  term=上/下\n  code=单元代码如 3A_U1\n  q=中文释义\n  answer=英文单词\n  hint=提示如 b_g（下划线代表要填的字母）\n  difficulty=1~4\n  explain=解析（可留空）',
    'listening': '字段说明：\n  audioText=听力原文（用 W: / M: 前缀区分男女角色，会自动用不同性别TTS生成MP3）\n  q=听力题目\n  optionA/B/C/D=选项（不够用留空）\n  answer=正确答案索引 0/1/2/3\n  audioFile 字段由脚本自动生成，无需填写',
    'grammar':   '字段说明：\n  q=语法题干（用 ____ 表示空格）\n  options=选项\n  answer=正确答案索引 0/1/2/3',
    'reading':   '字段说明：\n  passage=阅读短文\n  q=提问\n  options=选项\n  answer=正确答案索引 0/1/2/3'
}


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(root, 'scripts', 'excel_templates')
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, '题库导入模板.xlsx')

    with pd.ExcelWriter(out_path, engine='openpyxl') as writer:
        for sheet, cfg in TEMPLATES.items():
            df = pd.DataFrame(cfg['examples'], columns=cfg['columns'])
            df.to_excel(writer, sheet_name=sheet, index=False)
            # 在 sheet 的最后加一行说明
            ws = writer.sheets[sheet]
            last_row = len(df) + 3
            ws.cell(row=last_row, column=1, value='📝 说明：')
            ws.cell(row=last_row + 1, column=1, value=NOTES[sheet])
            # 合并单元格让说明可见
            try:
                ws.merge_cells(start_row=last_row + 1, start_column=1, end_row=last_row + 1, end_column=len(cfg['columns']))
            except Exception:
                pass

    print(f"[done] 模板已生成: {out_path}")
    print(f"用法:")
    print(f"  1) 在 Excel 里打开模板文件，按示例填写题目")
    print(f"  2) 运行: python scripts/import_questions.py \"你的文件.xlsx\"")
    print(f"  3) 如果有新听力题，再运行: python gen_audio.py 生成 MP3")


if __name__ == '__main__':
    main()
