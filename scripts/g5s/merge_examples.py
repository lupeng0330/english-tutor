# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _jk_volume_lib import merge_examples  # noqa: E402
HERE = os.path.dirname(os.path.abspath(__file__))
if __name__ == '__main__':
    sys.exit(0 if merge_examples(HERE, grade='grade5', term='上') else 1)
