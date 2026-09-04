# -*- coding: utf-8 -*-
"""g3s 薄入口：导入 u1-u9.json 到 jk.json grade3.上。
共享逻辑在 scripts/_jk_volume_lib.py（详见 §3.1 模板化）。

用法：
  python scripts/g3s/import_textbook.py          # dry-run
  python scripts/g3s/import_textbook.py --write  # 实际写入 + 自动 .bak
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _jk_volume_lib import import_units  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))

if __name__ == '__main__':
    import_units(HERE, grade='grade3', term='上', write=('--write' in sys.argv))
