import os
import pymysql
import traceback
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'inlinkff_leadmanager')  # Note the different username from app.py
DB_PASSWORD = os.getenv('DB_PASSWORD', 'iKc5I77O8mne')
DB_NAME = os.getenv('DB_NAME', 'inlinkff_leads')

print(f"Attempting database connection to {DB_NAME} on {DB_HOST} as {DB_USER}")

try:
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    print("Database connection successful!")
    
    # Check if tables exist
    with connection.cursor() as cursor:
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print("Database tables:")
        for table in tables:
            print(f"  - {list(table.values())[0]}")
    
    connection.close()
    
except Exception as e:
    print(f"Database connection error: {str(e)}")
    print(traceback.format_exc()) 