import pymysql
from dotenv import load_dotenv
import os
import sys

# Load environment variables
load_dotenv()

# Database configuration
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'inlinkai_admin')
DB_PASSWORD = os.getenv('DB_PASSWORD', '@Yourface21')
DB_NAME = os.getenv('DB_NAME', 'inlinkai_leads')

def test_connection():
    """Test connection to MySQL database."""
    try:
        print(f"Connecting to MySQL database: {DB_NAME} on {DB_HOST} as {DB_USER}")
        
        # Create a connection
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        print("✅ Connection successful!")
        
        # Test creating the tables
        with connection.cursor() as cursor:
            # Test creating leads table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                linkedin_url VARCHAR(255),
                consent BOOLEAN DEFAULT TRUE,
                lead_source VARCHAR(100) DEFAULT 'LinkedIn Audit Checklist',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address VARCHAR(45),
                user_agent TEXT
            )
            """)
            
            # Test creating email_logs table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS email_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lead_id INT,
                email_to VARCHAR(255) NOT NULL,
                email_subject VARCHAR(255),
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50),
                error_message TEXT,
                FOREIGN KEY (lead_id) REFERENCES leads(id)
            )
            """)
            
            print("✅ Tables created successfully!")
            
            # Test inserting a test record and retrieving it
            cursor.execute("""
            INSERT INTO leads (full_name, email, company, linkedin_url)
            VALUES ('Test User', 'test@example.com', 'Test Company', 'https://linkedin.com/in/testuser')
            """)
            connection.commit()
            
            print("✅ Test record inserted!")
            
            # Fetch the test record
            cursor.execute("SELECT * FROM leads WHERE email = 'test@example.com'")
            result = cursor.fetchone()
            
            if result:
                print(f"✅ Test record retrieved: {result}")
            else:
                print("❌ Failed to retrieve test record")
                
            # Clean up the test record
            cursor.execute("DELETE FROM leads WHERE email = 'test@example.com'")
            connection.commit()
            print("✅ Test record cleaned up!")
        
        connection.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_connection()
    if success:
        print("\n🎉 Database connection and setup tests passed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Database connection and setup tests failed!")
        print("\nTroubleshooting tips:")
        print("1. Check if your MySQL server is running")
        print("2. Verify your database credentials in the .env file")
        print("3. Make sure the database exists on your server")
        print("4. Check if your user has the necessary permissions")
        sys.exit(1) 