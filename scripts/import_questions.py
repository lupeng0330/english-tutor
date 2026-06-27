# -*- coding: utf-8 -*-
"""
乐学英语 - 题库人工导入工具

用法：
  python scripts/import_questions.py <excel文件路径> [--textbook jk] [--mode append|replace]

Excel 格式：
  需要 4 个 sheet（任意缺失则跳过该题型）：
    - spelling:  grade | term | code | q       | answer  | hint        | difficulty | explain
    - listening: grade | term | code | audioText | q      | optionA | optionB | optionC | answer | difficulty | explain
    - grammar:   grade | term | code | q       | optionA | optionB | optionC | optionD | answer | difficulty | explain
    - reading:   grade | term | code | passage | q       | optionA | optionB | optionC | answer | difficulty | explain

  字段说明：
    - grade:      1~9
    - term:       '上' / '下'
    - code:       题目代码，如 3A_U1（3年级上册第1单元）
    - q:          题干
    - answer:     正确答案；spelling 填英文单词；其他填 0/1/2/3 对应选项序号
    - options:    有几个就填几列，空列忽略
    - hint:       spelling 的提示（b__）
    - audioText:  听力对话文本（W: ... M: ...）
    - passage:    阅读短文
    - difficulty: 1~4
    - explain:    解析（可留空）

依赖：pip install pandas openpyxl
"""
import argparse
import json
import os
import sys


def die(msg, code=1):
    print(f"[错误] {msg}", file=sys.stderr)
    sys.exit(code)


def load_pandas():
    try:
        import pandas as pd
        return pd
    except ImportError:
        die("需要 pandas + openpyxl：\n  pip install pandas openpyxl")


def slug_listening(code, idx):
    """生成听力 MP3 文件名（顺序编号）"""
    return f"listening_{code.lower().replace('_','-')}_{idx:02d}.mp3"


def parse_sheet(pd, excel_path, sheet_name, required_fields):
    try:
        df = pd.read_excel(excel_path, sheet_name=sheet_name, dtype=str, keep_default_na=False)
    except Exception as e:
        print(f"  [skip] sheet '{sheet_name}' 不存在或无法读取: {e}")
        return None

    # 验证必需字段
    missing = [f for f in required_fields if f not in df.columns]
    if missing:
        print(f"  [warn] sheet '{sheet_name}' 缺少字段: {missing}，跳过")
        return None

    return df


def parse_spelling(df):
    out = []
    for _, row in df.iterrows():
        if not row.get('q') or not row.get('answer'):
            continue
        out.append({
            'grade':      int(row['grade']),
            'term':       row['term'],
            'code':       row['code'],
            'q':          row['q'],
            'answer':     row['answer'].strip().lower(),
            'hint':       row.get('hint', ''),
            'difficulty': int(row.get('difficulty', 1) or 1),
            'explain':    row.get('explain', '')
        })
    return out


def parse_listening(df):
    out = []
    for i, row in enumerate(df.iterrows(), start=1):
        _, row = row
        if not row.get('audioText') or not row.get('q'):
            continue
        options = [row[k] for k in ['optionA','optionB','optionC','optionD'] if k in row and row[k]]
        out.append({
            'grade':      int(row['grade']),
            'term':       row['term'],
            'code':       row['code'],
            'audioText':  row['audioText'],
            'audioFile':  slug_listening(row['code'], i),
            'q':          row['q'],
            'options':    options,
            'answer':     int(row['answer']),
            'difficulty': int(row.get('difficulty', 1) or 1),
            'explain':    row.get('explain', '')
        })
    return out


def parse_grammar(df):
    out = []
    for _, row in df.iterrows():
        if not row.get('q'):
            continue
        options = [row[k] for k in ['optionA','optionB','optionC','optionD'] if k in row and row[k]]
        out.append({
            'grade':      int(row['grade']),
            'term':       row['term'],
            'code':       row['code'],
            'q':          row['q'],
            'options':    options,
            'answer':     int(row['answer']),
            'difficulty': int(row.get('difficulty', 1) or 1),
            'explain':    row.get('explain', '')
        })
    return out


def parse_reading(df):
    out = []
    for _, row in df.iterrows():
        if not row.get('passage') or not row.get('q'):
            continue
        options = [row[k] for k in ['optionA','optionB','optionC','optionD'] if k in row and row[k]]
        out.append({
            'grade':      int(row['grade']),
            'term':       row['term'],
            'code':       row['code'],
            'passage':    row['passage'],
            'q':          row['q'],
            'options':    options,
            'answer':     int(row['answer']),
            'difficulty': int(row.get('difficulty', 1) or 1),
            'explain':    row.get('explain', '')
        })
    return out


def merge_save(out_path, new_items, mode):
    existing = []
    if os.path.exists(out_path) and mode == 'append':
        with open(out_path, 'r', encoding='utf-8') as f:
            existing = json.load(f)
    merged = existing + new_items if mode == 'append' else new_items
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print(f"  -> 写入 {out_path} (原 {len(existing)} 条 + 新 {len(new_items)} 条 = 总 {len(merged)} 条)")


def main():
    parser = argparse.ArgumentParser(description='乐学英语题库 Excel 导入工具')
    parser.add_argument('excel', help='Excel 文件路径')
    parser.add_argument('--textbook', default='jk', help='教材 id，默认 jk（广州教科版）')
    parser.add_argument('--mode', default='append', choices=['append', 'replace'], help='append=追加, replace=全量替换')
    args = parser.parse_args()

    if not os.path.exists(args.excel):
        die(f"文件不存在: {args.excel}")

    pd = load_pandas()

    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_dir = os.path.join(root, 'data', 'questions')
    os.makedirs(out_dir, exist_ok=True)

    print(f"[info] 读取: {args.excel}")
    print(f"[info] 教材: {args.textbook}")
    print(f"[info] 模式: {args.mode}")
    print()

    tasks = [
        ('spelling',  ['grade','term','code','q','answer'],                    parse_spelling),
        ('listening', ['grade','term','code','audioText','q','answer'],        parse_listening),
        ('grammar',   ['grade','term','code','q','answer'],                    parse_grammar),
        ('reading',   ['grade','term','code','passage','q','answer'],          parse_reading),
    ]

    for sheet, required, parser_fn in tasks:
        print(f"---- {sheet} ----")
        df = parse_sheet(pd, args.excel, sheet, required)
        if df is None:
            continue
        items = parser_fn(df)
        print(f"  解析 {len(items)} 条")
        out_path = os.path.join(out_dir, f"{args.textbook}_{sheet}.json")
        merge_save(out_path, items, args.mode)

    print("\n[done] 导入完成。建议运行 gen_hj_listening.py 为新增听力题生成 MP3（课文音频见 gen_audio_v2.py）。")


if __name__ == '__main__':
    main()
