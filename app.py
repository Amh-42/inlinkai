from flask import Flask, render_template, request, jsonify
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import logging
import pymysql
import datetime
import traceback
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

app = Flask(__name__)

# Configure logging - more detailed for debugging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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
DB_USER = os.getenv('DB_USER', 'inlinkff_leadman')  # Match .env file
DB_PASSWORD = os.getenv('DB_PASSWORD', '@Yourface21')
DB_NAME = os.getenv('DB_NAME', 'inlinkff_leads')  # Match .env file

def get_db_connection():
    """Create a connection to the MySQL database."""
    try:
        # Log connection attempt
        logger.debug(f"Attempting database connection to {DB_NAME} on {DB_HOST} as {DB_USER}")
        
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        logger.debug("Database connection successful")
        return connection
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        logger.error(traceback.format_exc())
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
        logger.error(traceback.format_exc())

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/resources')
def resources():
    return render_template('leadmagnet.html')

@app.route('/submit-lead-magnet', methods=['POST'])
def submit_lead_magnet():
    try:
        # Log the raw request for debugging
        logger.debug(f"Received form submission: Method={request.method}, ContentType={request.content_type}")
        
        # Get form data - handle both JSON and form data
        if request.is_json:
            logger.debug("Processing JSON data")
            data = request.get_json()
        else:
            logger.debug("Processing form data")
            data = request.form.to_dict()
        
        logger.debug(f"Form data: {data}")
        
        full_name = data.get('fullName', '')
        email = data.get('email', '')
        company = data.get('company', '')
        linkedin_url = data.get('linkedinUrl', '')
        consent = True  # Default to True since checkbox is required in form
        
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
            logger.error(f"Email sending failed: {error_message}")
            return jsonify({'success': False, 'message': 'Failed to send email: ' + error_message}), 500
            
    except Exception as e:
        logger.error(f"Error in lead magnet submission: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'success': False, 'message': str(e)}), 500

def save_lead_to_db(full_name, email, company, linkedin_url, consent, ip_address, user_agent):
    """Save lead information to the database."""
    try:
        logger.debug(f"Attempting to save lead: {email}")
        
        conn = get_db_connection()
        if not conn:
            logger.error("Database connection failed when saving lead")
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
        logger.error(traceback.format_exc())
        return None

def get_professional_email_template(name):
    """Returns a professional HTML email template with the recipient's name."""
    # Placeholders for the dynamic content
    recipient_name = name # Replace with the actual recipient's name
    checklist_link = 'https://inlinkai.com/resources' # Replace with the actual link

    # Create a minimal HTML template with centered text and bold name
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your LinkedIn Profile Audit Checklist</title>
        <style>
            body {{
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <p>Hi <strong>{recipient_name}</strong>,</p>
        
        <p>Thank you for your interest in optimizing your LinkedIn profile! As promised, here's your free LinkedIn Profile Audit Checklist to help you generate more leads through LinkedIn.</p>
        
        <p><a href="{checklist_link}">Get more resources</a></p>
        
        <p>This checklist will help you optimize your LinkedIn profile to attract and generate inbound leads, specifically tailored for financial advisors.</p>
        
        <p>Here's what you'll get:</p>
        <p>- Comprehensive Audit Framework: A step-by-step checklist covering all critical elements of your LinkedIn profile, from your photo to engagement strategies.</p>
        <p>- Industry-Specific Guidance: Tailored specifically for financial advisors looking to attract high-quality leads through LinkedIn.</p>
        <p>- Actionable Tips & Best Practices: Practical advice you can implement immediately to enhance your profile's effectiveness.</p>
        
        <p>We're confident this checklist will be a valuable resource for transforming your LinkedIn profile into a 24/7 lead generation engine.</p>
        
        <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
        
        <p>Best regards,<br>The InlinkAI Team</p>
        
        <p>You are receiving this email because you requested this resource or interacted with our content.</p>
    </body>
    </html>
    """

    return html_template

def send_checklist_email(lead_id, name, email):
    """Send the LinkedIn Profile Audit Checklist to the user's email."""
    try:
        logger.debug(f"Preparing to send email to: {email}")
        
        # Check if checklist exists first
        if not os.path.exists(CHECKLIST_PDF_PATH):
            error_msg = f"Checklist file not found at: {CHECKLIST_PDF_PATH}"
            logger.error(error_msg)
            log_email_status(lead_id, email, 'Failed', error_msg)
            return False, error_msg
            
        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = EMAIL_FROM
        msg['To'] = email
        msg['Subject'] = 'Your LinkedIn Profile Audit Checklist'
        
        # Get professional HTML email template
        html_body = get_professional_email_template(name)
        msg.attach(MIMEText(html_body, 'html'))
        
        # Attach the checklist PDF
        with open(CHECKLIST_PDF_PATH, 'rb') as file:
            attachment = MIMEApplication(file.read(), _subtype='pdf')
            attachment.add_header('Content-Disposition', 'attachment', filename='LinkedIn_Profile_Audit_Checklist.pdf')
            msg.attach(attachment)
        
        logger.debug(f"Connecting to email server: {EMAIL_HOST}:{EMAIL_PORT}")
        
        # Connect to SMTP server and send email
        try:
            with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
                server.set_debuglevel(1)  # Enable debug output
                server.starttls()
                logger.debug(f"Logging into email server as: {EMAIL_HOST_USER}")
                server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
                logger.debug(f"Sending email to: {email}")
                server.send_message(msg)
                
            logger.info(f"Checklist sent successfully to: {email}")
            log_email_status(lead_id, email, 'Sent')
            return True, None
        except smtplib.SMTPException as smtp_error:
            error_msg = f"SMTP error: {str(smtp_error)}"
            logger.error(error_msg)
            log_email_status(lead_id, email, 'Failed', error_msg)
            return False, error_msg
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error sending checklist email: {error_msg}")
        logger.error(traceback.format_exc())
        log_email_status(lead_id, email, 'Failed', error_msg)
        return False, error_msg

def log_email_status(lead_id, email, status, error_message=None):
    """Log email sending status to database."""
    try:
        conn = get_db_connection()
        if not conn:
            logger.error("Database connection failed when logging email status")
            return
            
        with conn.cursor() as cursor:
            sql = """
            INSERT INTO email_logs (lead_id, email_to, email_subject, status, error_message)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (lead_id, email, 'Your LinkedIn Profile Audit Checklist', status, error_message))
            
        conn.close()
        logger.debug(f"Email status logged: {status} for {email}")
        
    except Exception as e:
        logger.error(f"Error logging email status: {str(e)}")
        logger.error(traceback.format_exc())

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
        logger.error(traceback.format_exc())

if __name__ == '__main__':
    # Check if checklist file exists
    if not os.path.exists(CHECKLIST_PDF_PATH):
        logger.warning(f"Checklist PDF not found at {CHECKLIST_PDF_PATH}. Please add the file.")
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(CHECKLIST_PDF_PATH), exist_ok=True)
        logger.info(f"Created directory: {os.path.dirname(CHECKLIST_PDF_PATH)}")
    
    # Set up database tables
    setup_database()
    
    app.run(debug=True) 