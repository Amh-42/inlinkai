from flask import Flask, render_template, request, jsonify
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import logging
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pymysql

# Use PyMySQL to connect to MySQL
pymysql.install_as_MySQLdb()

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

# Database Configuration
DB_USER = os.environ.get('DB_USER', 'inlinkff_leadman')  # Default value, replace with your cPanel DB username
DB_PASSWORD = os.environ.get('DB_PASSWORD', '@Yourface21')  # Replace with your actual DB password
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_NAME = os.environ.get('DB_NAME', 'inlinkff_leads')  # Default name, adjust as needed

# Configure SQLAlchemy with PyMySQL
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define Lead model for database storage
class Lead(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    company = db.Column(db.String(100))
    linkedin_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resource_requested = db.Column(db.String(100), default="LinkedIn Profile Audit Checklist")
    consent = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Lead {self.email}>'

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
        
        logger.info(f"Lead magnet form submitted for: {email}")
        
        # Validate required fields
        if not full_name or not email:
            logger.warning("Missing required fields in lead magnet submission")
            return jsonify({'success': False, 'message': 'Name and email are required'}), 400
            
        # Send the checklist via email
        success = send_checklist_email(full_name, email)
        
        # Log new lead for your CRM or marketing purposes
        log_new_lead(full_name, email, company, linkedin_url, consent)
        
        if success:
            return jsonify({'success': True, 'message': 'Checklist sent successfully'})
        else:
            return jsonify({'success': False, 'message': 'Failed to send email'}), 500
            
    except Exception as e:
        logger.error(f"Error in lead magnet submission: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

def send_checklist_email(name, email):
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
            logger.error(f"Checklist file not found at: {CHECKLIST_PDF_PATH}")
            return False
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_HOST_USER, EMAIL_HOST_PASSWORD)
            server.send_message(msg)
            
        logger.info(f"Checklist sent successfully to: {email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending checklist email: {str(e)}")
        return False

def log_new_lead(name, email, company, linkedin_url, consent=True):
    """Log new lead information to the database and backup to CSV."""
    try:
        # Save to database
        try:
            # Check if lead with this email already exists
            existing_lead = Lead.query.filter_by(email=email).first()
            
            if existing_lead:
                # Update existing lead information
                existing_lead.name = name
                existing_lead.company = company
                existing_lead.linkedin_url = linkedin_url
                existing_lead.consent = consent
                existing_lead.created_at = datetime.utcnow()  # Update timestamp
                
                logger.info(f"Updated existing lead: {email}")
            else:
                # Create new lead
                new_lead = Lead(
                    name=name,
                    email=email,
                    company=company,
                    linkedin_url=linkedin_url,
                    consent=consent
                )
                db.session.add(new_lead)
                
                logger.info(f"Added new lead to database: {email}")
            
            # Commit the changes
            db.session.commit()
            
        except Exception as db_error:
            db.session.rollback()
            logger.error(f"Database error: {str(db_error)}")
            
            # Fallback to CSV if database fails
            lead_info = {
                'name': name,
                'email': email,
                'company': company,
                'linkedin_url': linkedin_url,
                'consent': consent,
                'date': datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            }
            
            # Save to CSV file as backup
            import csv
            with open('leads.csv', 'a', newline='') as file:
                writer = csv.DictWriter(file, fieldnames=lead_info.keys())
                # Write header if file is empty
                if file.tell() == 0:
                    writer.writeheader()
                writer.writerow(lead_info)
            
            logger.info(f"Saved lead to CSV file (database failed): {email}")
        
    except Exception as e:
        logger.error(f"Error logging lead: {str(e)}")

if __name__ == '__main__':
    # Create the database tables
    with app.app_context():
        db.create_all()
        logger.info("Database tables created (if they didn't exist)")
    
    # Check if checklist file exists
    if not os.path.exists(CHECKLIST_PDF_PATH):
        logger.warning(f"Checklist PDF not found at {CHECKLIST_PDF_PATH}. Please add the file.")
    
    app.run(debug=True) 