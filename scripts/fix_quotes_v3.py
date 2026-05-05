# -*- coding: utf-8 -*-
"""修复 hj.json 中文字段里误用的半角直引号（最终稳健版）。

算法：
  1. 先对 (中文/标点) "xxx含中文" (中文/标点) 这种成对模式替换为弯引号。
  2. 再逐行精修剩余奇数残留：
     - 仅处理以 "cn"/"en"/"example"/"meaning"/"title"/"module" 开头的值行。
     - 对 value 部分（去掉首尾合法双引号后的字符串），
       逐字符扫描，跳过合法转义 \\"；遇到未转义的 " 时按序交替替换为 " 和 "。
  3. json.loads 校验后写回。
"""
import re, sys, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, "data", "textbooks", "hj.json")
LOG  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_fixv3.log")

def main():
    with open(PATH, "r", encoding="utf-8") as f:
        src = f.read()

    CH = r'[\u4e00-\u9fa5，。！？：；、——()（）]'
    pair_pat = re.compile(r'(' + CH + r')"([^"\n\r]{1,60}?)"(' + CH + r')')

    def looks_chinese_content(inner):
        return bool(re.search(r'[\u4e00-\u9fa5]', inner))

    def pair_repl(m):
        before, inner, after = m.group(1), m.group(2), m.group(3)
        if not looks_chinese_content(inner):
            return m.group(0)
        return before + "\u201c" + inner + "\u201d" + after

    stage1 = src
    for _ in range(8):
        nxt = pair_pat.sub(pair_repl, stage1)
        if nxt == stage1:
            break
        stage1 = nxt

    key_line_pat = re.compile(
        r'^(\s*"(?:cn|en|example|meaning|title|module)"\s*:\s*")(.*)("\s*,?\s*)$'
    )

    def fix_body(body):
        # 扫描 body，跳过 \" 这样的合法转义，把未转义的 " 交替替换成 " "
        result_chars = []
        i = 0
        toggle = 0  # 下一个未转义 " 的位置用哪个符号
        n = len(body)
        while i < n:
            ch = body[i]
            if ch == '\\':
                # 保留转义序列（至少 1 个字符）
                result_chars.append(ch)
                if i + 1 < n:
                    result_chars.append(body[i + 1])
                    i += 2
                else:
                    i += 1
                continue
            if ch == '"':
                # 未转义的 " — 错误引号
                if toggle % 2 == 0:
                    result_chars.append('\u201c')
                else:
                    result_chars.append('\u201d')
                toggle += 1
                i += 1
                continue
            result_chars.append(ch)
            i += 1
        return ''.join(result_chars), toggle

    stage2_lines = []
    fixed_line_count = 0
    total_replace = 0
    for line in stage1.splitlines(keepends=True):
        raw = line.rstrip('\n').rstrip('\r')
        nl = line[len(raw):]
        m = key_line_pat.match(raw)
        if not m:
            stage2_lines.append(line)
            continue
        head, body, tail = m.group(1), m.group(2), m.group(3)
        # 只有 body 里含裸 " 才需处理；裸 " 即非 \" 的那些
        bare = re.findall(r'(?<!\\)"', body)
        if not bare:
            stage2_lines.append(line)
            continue
        new_body, cnt = fix_body(body)
        fixed_line_count += 1
        total_replace += cnt
        stage2_lines.append(head + new_body + tail + nl)

    stage2 = ''.join(stage2_lines)

    with open(LOG, 'w', encoding='utf-8') as lf:
        lf.write(f"stage1 diff: {len(stage1) - len(src)} bytes\n")
        lf.write(f"stage2 fixed_line_count: {fixed_line_count}\n")
        lf.write(f"stage2 total_replace: {total_replace}\n")
        try:
            json.loads(stage2)
            lf.write("[final] JSON valid.\n")
        except json.JSONDecodeError as e:
            lf.write(f"[final] ERR {e.msg} line {e.lineno} col {e.colno} pos {e.pos}\n")
            lf.write("ctx: " + repr(stage2[max(0,e.pos-100):e.pos+100]) + "\n")
            with open(PATH + ".bak3", 'w', encoding='utf-8') as f:
                f.write(stage2)
            return 1

    if stage2 != src:
        with open(PATH, 'w', encoding='utf-8') as f:
            f.write(stage2)
    return 0

if __name__ == '__main__':
    sys.exit(main())
