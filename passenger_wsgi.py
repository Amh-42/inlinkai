import sys
import os

INTERP = "/home/inlinkff/virtualenv/inlinkai/3.11/bin/python"
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

sys.path.insert(0, '/home/inlinkff/inlinkai')

from app import app as application