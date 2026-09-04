# -*- coding: utf-8 -*-
"""
完形填空题库共享库（P2-C）。
提供：
  - cloze 题 schema 校验
  - passage 占位符 ___N___ 解析 / 校验 pos 与 blanks 对齐
  - 铁律 8 三件套：备份 + 差异报告 + 骤降阻断
被 scripts/hj/build_cloze.py + scripts/jk/build_cloze.py 复用。

passage 占位符语法：
  - `___1___` `___2___` ... 用 3 个下划线包住编号
  - blanks[].pos 必须从 1 开始连续整数，与 passage 中出现的占位符一一对应
"""
import os
import re
import json
import shutil
from datetime import datetime


PLACEHOLDER_RE = re.compile(r'___(\d+)___')


# ============================================================
# Schema 校验
# ============================================================

CLOZE_REQUIRED_FIELDS = ['grade', 'term', 'code', 'passage', 'blanks', 'difficulty']
BLANK_REQUIRED_FIELDS = ['pos', 'options', 'answer']


def validate_cloze(item, idx=None):
    """校验一条 cloze 题。返回错误列表（空 = 通过）。"""
    errs = []
    tag = f'[{idx}]' if idx is not None else ''

    # 1. 必填字段
    for f in CLOZE_REQUIRED_FIELDS:
        if f not in item or item[f] is None:
            errs.append(f'cloze{tag}: 缺必填字段 {f}')
    if errs:
        return errs

    # 2. blanks 是数组
    blanks = item.get('blanks')
    if not isinstance(blanks, list) or len(blanks) == 0:
        errs.append(f'cloze{tag} code={item.get("code")}: blanks 必须是非空数组')
        return errs

    # 3. passage 占位符与 blanks pos 一一对应
    passage = item.get('passage', '')
    placeholders_in_passage = [int(m.group(1)) for m in PLACEHOLDER_RE.finditer(passage)]
    blank_positions = []
    for bi, b in enumerate(blanks):
        for f in BLANK_REQUIRED_FIELDS:
            if f not in b or b[f] is None:
                errs.append(f'cloze{tag} code={item.get("code")} blank[{bi}]: 缺字段 {f}')
        if 'pos' in b:
            blank_positions.append(b['pos'])
        # options 必须含 answer
        if 'options' in b and 'answer' in b and b['answer'] not in b['options']:
            errs.append(f'cloze{tag} code={item.get("code")} blank[{bi}] pos={b.get("pos")}: answer "{b["answer"]}" 不在 options 里')

    if sorted(placeholders_in_passage) != sorted(blank_positions):
        errs.append(f'cloze{tag} code={item.get("code")}: passage 占位符 {sorted(placeholders_in_passage)} 与 blanks.pos {sorted(blank_positions)} 不一致')

    # 4. pos 从 1 开始连续
    if blank_positions and sorted(blank_positions) != list(range(1, len(blank_positions) + 1)):
        errs.append(f'cloze{tag} code={item.get("code")}: blanks.pos 必须从 1 开始连续整数')

    # 5. code 格式
    code = item.get('code', '')
    if not re.match(r'^[1-9][AB]_U\d+_C\d{2}$', code):
        errs.append(f'cloze{tag}: code="{code}" 格式应为 {{1-9}}{{A/B}}_U{{N}}_C{{NN}}')

    # 6. difficulty 是数字
    diff = item.get('difficulty')
    if not isinstance(diff, int) or not (1 <= diff <= 4):
        errs.append(f'cloze{tag} code={code}: difficulty 应为 1-4 数字（当前: {diff!r}）')

    return errs


def validate_cloze_list(items):
    """批量校验。返回 (errs, ok_count)"""
    errs = []
    ok = 0
    for i, item in enumerate(items):
        e = validate_cloze(item, idx=i)
        if e:
            errs.extend(e)
        else:
            ok += 1
    return errs, ok


# ============================================================
# 铁律 8 三件套：写入器
# ============================================================

def write_with_safety(target_path, new_data, *, force=False, type_label='cloze'):
    """
    安全写入 cloze JSON。
    - 写前备份旧文件到同目录 .backups/{basename}_{ts}.json
    - 差异报告打印
    - 题量骤降 >30% 阻断（首次写入不触发）
    返回 (ok: bool, msg: str)
    """
    qdir = os.path.dirname(target_path)
    backup_dir = os.path.join(qdir, '.backups')
    os.makedirs(qdir, exist_ok=True)
    os.makedirs(backup_dir, exist_ok=True)

    old_data = []
    if os.path.exists(target_path):
        try:
            old_data = json.load(open(target_path, encoding='utf-8'))
        except Exception as e:
            return False, f'读旧文件失败: {e}'

    # 备份
    fn = os.path.basename(target_path)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    if old_data:
        bak = os.path.join(backup_dir, f'{fn.replace(".json", "")}_{ts}.json')
        shutil.copy2(target_path, bak)
        print(f'[🔒 备份] {bak} ({len(old_data)} 题)')
    else:
        print(f'[🔒 备份] 旧文件不存在或为空，跳过备份（首次写入）')

    # 差异
    print(f'[📊 差异报告] {fn}: 旧 {len(old_data)} → 新 {len(new_data)} → 合并 {len(new_data)}')

    # 骤降阻断（首次写入旧版 0 题不触发）
    if len(old_data) > 0 and len(new_data) < len(old_data) * 0.7 and not force:
        return False, f'⛔ 安全阻断：新 {len(new_data)} 比旧 {len(old_data)} 减少 {(1-len(new_data)/len(old_data))*100:.0f}%，超过 30%。加 --force 跳过'

    # 校验
    errs, ok_count = validate_cloze_list(new_data)
    if errs:
        print(f'❌ schema 校验失败 {len(errs)} 条:')
        for e in errs[:10]:
            print(f'  {e}')
        if len(errs) > 10:
            print(f'  ... 另有 {len(errs)-10} 条（已省略）')
        return False, '校验未通过'

    # 写入
    tmp = target_path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    os.replace(tmp, target_path)
    return True, f'✅ {fn}: {len(new_data)} 题写入完成，schema 全合规'


# ============================================================
# 工具：构造 blank
# ============================================================

def make_blank(pos, options, answer, explain=''):
    """构造单个 blank 字典；自动校验 answer in options"""
    if answer not in options:
        raise ValueError(f'blank pos={pos}: answer "{answer}" 不在 options {options}')
    return {
        'pos': pos,
        'options': options,
        'answer': answer,
        'explain': explain,
    }


def make_cloze(grade, term, unit_n, seq, topic, passage, blanks, explain='', difficulty=2):
    """构造一道完形填空题"""
    term_letter = 'A' if term == '上' else 'B'
    return {
        'grade': grade,
        'term': term,
        'code': f'{grade}{term_letter}_U{unit_n}_C{seq:02d}',
        'topic': topic,
        'passage': passage,
        'blanks': blanks,
        'explain': explain,
        'difficulty': difficulty,
    }
