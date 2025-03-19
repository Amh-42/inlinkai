import sys
import os

# Add the app directory to the Python path
INTERP = os.path.join(os.getcwd(), 'venv', 'bin', 'python3')
if sys.executable != INTERP:
    os.execl(INTERP, INTERP, *sys.argv)

sys.path.append(os.getcwd())

from app import app as application 