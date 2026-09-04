# -*- coding: utf-8 -*-
"""g3x 薄入口：合并 e1-e9.json 到 data/examples/jk_grade3_xia.json。"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _jk_volume_lib import merge_examples  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))

if __name__ == '__main__':
    ok = merge_examples(HERE, grade='grade3', term='下')
    sys.exit(0 if ok else 1)
