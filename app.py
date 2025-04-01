from flask import Flask, render_template, request, jsonify
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import logging
import pymysql
import datetime
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration - cPanel email settings
EMAIL_HOST = 'mail.inlinkai.com'  # cPanel mail server (may need adjustment)
EMAIL_PORT = 587  # Common TLS port (or 465 for SSL)
EMAIL_HOST_USER = 'support@inlinkai.com'
EMAIL_HOST_PASSWORD = '@Yourface21'
EMAIL_FROM = 'InlinkAI Support <support@inlinkai.com>'
CHECKLIST_PDF_PATH = 'static/resources/01_LinkedIn_Profile_Audit_Checklist.pdf'  # Path to your checklist PDF

# Database configuration - Update these with your cPanel MySQL credentials
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'inlinkff_admin')  # Replace with your cPanel database username
DB_PASSWORD = os.getenv('DB_PASSWORD', '@Yourface21')  # Replace with your cPanel database password
DB_NAME = os.getenv('DB_NAME', 'inlinkff_leads')  # Replace with your cPanel database name

def get_db_connection():
    """Create a connection to the MySQL database."""
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
        return connection
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        return None

def setup_database():
    """Set up the database tables if they don't exist."""
    try:
        conn = get_db_connection()
        if conn:
            with conn.cursor() as cursor:
                # Create leads table
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
                
                # Create email_logs table to track emails sent
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
                
                logger.info("Database tables set up successfully")
            conn.close()
    except Exception as e:
        logger.error(f"Database setup error: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/contact')
def contact():
    return render_template('base.html')

@app.route('/resources')
def resources():
    return render_template('leadmagnet.html')

@app.route('/submit-lead-magnet', methods=['POST'])
def submit_lead_magnet():
    try:
        # Get form data
        data = request.get_json()
        full_name = data.get('fullName', '')
        email = data.get('email', '')
        company = data.get('company', '')
        linkedin_url = data.get('linkedinUrl', '')
        consent = data.get('consent', False)
        
        # Get additional info
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        
        logger.info(f"Lead magnet form submitted for: {email}")
        
        # Validate required fields
        if not full_name or not email:
            logger.warning("Missing required fields in lead magnet submission")
            return jsonify({'success': False, 'message': 'Name and email are required'}), 400
        
        # Save lead to database
        lead_id = save_lead_to_db(full_name, email, company, linkedin_url, consent, ip_address, user_agent)
        
        if not lead_id:
            logger.error("Failed to save lead to database")
            return jsonify({'success': False, 'message': 'Failed to process your request'}), 500
            
        # Send the checklist via email
        success, error_message = send_checklist_email(lead_id, full_name, email)
        
        # Still log to CSV as backup
        log_new_lead(full_name, email, company, linkedin_url)
        
        if success:
            return jsonify({'success': True, 'message': 'Checklist sent successfully'})
        else:
            return jsonify({'success': False, 'message': 'Failed to send email'}), 500
            
    except Exception as e:
        logger.error(f"Error in lead magnet submission: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

def save_lead_to_db(full_name, email, company, linkedin_url, consent, ip_address, user_agent):
    """Save lead information to the database."""
    try:
        conn = get_db_connection()
        if not conn:
            return None
            
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO leads (full_name, email, company, linkedin_url, consent, ip_address, user_agent)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (full_name, email, company, linkedin_url, consent, ip_address, user_agent))
            lead_id = cursor.lastrowid
            
        conn.close()
        logger.info(f"Lead saved to database with ID: {lead_id}")
        return lead_id
        
    except Exception as e:
        logger.error(f"Error saving lead to database: {str(e)}")
        return None

def send_checklist_email(lead_id, name, email):
    """Send the LinkedIn Profile Audit Checklist to the user's email."""
    try:
        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_FROM
        msg['To'] = email
        msg['Subject'] = 'Your LinkedIn Profile Audit Checklist'
        
        # Email body
        body = f"""
        <html>
        <body>
            <h2>Hello {name},</h2>
            <p>Thank you for requesting our LinkedIn Profile Audit Checklist.</p>
            <p>Attached to this email, you'll find your checklist to help optimize your LinkedIn profile for attracting high-quality leads.</p>
            <p>If you have any questions or need further assistance, feel free to reply to this email.</p>
            <br>
            <p>Best regards,</p>
            <p>InlinkAI Team</p>
        </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))
        
        # Attach the checklist PDF
        if os.path.exists(CHECKLIST_PDF_PATH):
            with open(CHECKLIST_PDF_PATH, 'rb') as file:
                attachment = MIMEApplication(file.read(), _subtype='pdf')
                attachment.add_header('Content-Disposition', 'attachment', filename='LinkedIn_Profile_Audit_Checklist.pdf')
                msg.attach(attachment)
        else:
            error_msg = f"Checklist file not found at: {CHECKLIST_PDF_PATH}"
            logger.error(error_msg)
            log_email_status(lead_id, email, 'Failed', error_msg)
            return False, error_msg
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Checklist sent successfully to: {email}")
        log_email_status(lead_id, email, 'Sent')
        return True, None
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error sending checklist email: {error_msg}")
        log_email_status(lead_id, email, 'Failed', error_msg)
        return False, error_msg

def log_email_status(lead_id, email, status, error_message=None):
    """Log email sending status to database."""
    try:
        conn = get_db_connection()
        if not conn:
            return
            
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO email_logs (lead_id, email_to, email_subject, status, error_message)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (lead_id, email, 'Your LinkedIn Profile Audit Checklist', status, error_message))
            
        conn.close()
        
    except Exception as e:
        logger.error(f"Error logging email status: {str(e)}")

def log_new_lead(name, email, company, linkedin_url):
    """Log new lead information to CSV as backup."""
    try:
        lead_info = {
            'name': name,
            'email': email,
            'company': company,
            'linkedin_url': linkedin_url,
            'timestamp': datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        logger.info(f"New lead logged to CSV: {lead_info}")
        
        # Save to a CSV file
        import csv
        with open('leads.csv', 'a', newline='') as file:
            writer = csv.DictWriter(file, fieldnames=lead_info.keys())
            # Write header if file is empty
            if file.tell() == 0:
                writer.writeheader()
            writer.writerow(lead_info)
        
    except Exception as e:
        logger.error(f"Error logging lead to CSV: {str(e)}")

if __name__ == '__main__':
    # Check if checklist file exists
    if not os.path.exists(CHECKLIST_PDF_PATH):
        logger.warning(f"Checklist PDF not found at {CHECKLIST_PDF_PATH}. Please add the file.")
    
    # Set up database tables
    setup_database()
    
    app.run(debug=True) 