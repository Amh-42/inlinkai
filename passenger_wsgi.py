import os
import sys

# Add your app directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import your Flask app
from app import app as application

# The variable named 'application' is important - passenger looks for this 