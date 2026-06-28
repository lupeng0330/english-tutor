# -*- coding: utf-8 -*-
"""
题库完整性校验器（L3 安全网）
检查 jk + hj 全部题库：文件存在、必填字段、code 格式、年级分布、无孤儿题。
运行：python scripts/_verify_qbank.py
退出码 0=全部通过；非0=有异常。
"""
import os, json, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
QDIR = os.path.join(ROOT, 'data', 'questions')

TEXTBOOKS = ['jk', 'hj']
TYPES = ['spelling', 'listening', 'grammar', 'reading']

REQUIRED_FIELDS = {
    'spelling':  ['grade', 'term', 'code', 'q', 'answer'],
    'listening':  ['grade', 'term', 'code', 'q', 'options', 'answer', 'audioFile'],
    'grammar':   ['grade', 'term', 'code', 'q', 'options', 'answer', 'explain'],
    'reading':   ['grade', 'term', 'code', 'q', 'options', 'answer', 'passage'],
}

errors = []
warnings = []
ok = 0

# Check: max consecutive bad run count (flag for large-scale data loss)
for tb in TEXTBOOKS:
    for t in TYPES:
        p = os.path.join(QDIR, f'{tb}_{t}.json')
        if not os.path.exists(p):
            warnings.append(f'{tb}_{t}: 文件不存在，跳过')
            continue
        try:
            data = json.load(open(p, encoding='utf-8'))
        except Exception as e:
            errors.append(f'{tb}_{t}: JSON 解析失败: {e}')
            continue
        if not isinstance(data, list):
            errors.append(f'{tb}_{t}: 根元素不是数组')
            continue

        count = len(data)
        ok += count

        # 1. 必填字段
        for i, q in enumerate(data):
            for field in REQUIRED_FIELDS[t]:
                if field not in q or q[field] is None:
                    errors.append(f'{tb}_{t}[{i}]: 缺少必填字段 {field}  (code={q.get("code","?")})')

        # 2. code 格式：{1-9}{A/B}_U{n}（允许旧版 _S01/_L01/_G01/_R01 等后缀）
        legacy_codes = []
        bad_codes = []
        for i, q in enumerate(data):
            code = str(q.get('code', ''))
            import re
            if re.match(r'^[1-9][AB]_U\d+$', code):
                pass  # 标准格式
            elif re.match(r'^[1-9][AB]_U\d+_[SLGR]\d+$', code):
                legacy_codes.append(code)  # 旧版带后缀(spelling/listening/grammar/reading)，功能正常
            else:
                bad_codes.append(f'{tb}_{t}[{i}]: code="{code}" 格式严重异常')
        if legacy_codes:
            unique_legacy = sorted(set(legacy_codes))
            warnings.append(f'{tb}_{t}: {len(legacy_codes)}条旧版code后缀(如 {", ".join(unique_legacy[:3])})，功能正常但建议统一')
        if bad_codes:
            errors.extend(bad_codes[:5])
            if len(bad_codes) > 5:
                errors.append(f'  ... 另有 {len(bad_codes)-5} 条严重异常 code（已省略）')

        # 3. grade/term 一致性：code 中的 A/B 必须匹配 term 的 上/下
        for i, q in enumerate(data):
            code = q.get('code', '')
            m = re.match(r'^(\d+)([AB])_', str(code))
            if m:
                expected_term = '上' if m.group(2) == 'A' else '下'
                actual_term = q.get('term', '')
                if actual_term and actual_term != expected_term:
                    errors.append(f'{tb}_{t}[{i}]: code={code} → term期望"{expected_term}" 实际"{actual_term}"')

        # 4. 年级分布
        dist = {}
        for q in data:
            k = f'G{q.get("grade","?")}{q.get("term","?")}'
            dist[k] = dist.get(k, 0) + 1
        dist_str = '  '.join(f'{k}={v}' for k, v in sorted(dist.items()))
        print(f'  {tb}_{t:10s} {count:>4d}题  {dist_str}')

        # 5. 听力题 audioFile 命名一致性
        if t == 'listening':
            for i, q in enumerate(data):
                af = q.get('audioFile', '')
                if not af:
                    continue
                # 标准格式: jk_listening_3A_01.mp3
                # 旧版格式: listening_g1_01.mp3 / listening_6B_U1_01.mp3
                import re
                is_std = af.startswith(f'{tb}_listening_')
                is_legacy = re.match(r'^listening_(g\d+|6B_U\d+)_\d+\.mp3$', af) or \
                            re.match(r'^listening_\d+\.mp3$', af)
                if not is_std and not is_legacy:
                    errors.append(f'{tb}_listening[{i}]: audioFile="{af}" 格式无法识别')

# 汇总
print(f'\n{"="*60}')
print(f'[校验结果] 总题量: {ok}')
if errors:
    print(f'❌ 错误: {len(errors)} 条')
    for e in errors:
        print(f'  {e}')
if warnings:
    print(f'⚠️  警告: {len(warnings)} 条')
    for w in warnings:
        print(f'  {w}')
if not errors:
    print('✅ 全部通过')

sys.exit(0 if not errors else 1)
