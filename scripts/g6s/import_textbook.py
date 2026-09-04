# -*- coding: utf-8 -*-
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _jk_volume_lib import import_units  # noqa: E402
HERE = os.path.dirname(os.path.abspath(__file__))
if __name__ == '__main__':
    import_units(HERE, grade='grade6', term='上', write=('--write' in sys.argv))
