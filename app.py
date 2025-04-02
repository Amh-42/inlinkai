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
    return '''
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
 <head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>New email template 2025-04-02</title><!--[if (mso 16)]>
    <style type="text/css">
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<noscript>
         <xml>
           <o:OfficeDocumentSettings>
           <o:AllowPNG></o:AllowPNG>
           <o:PixelsPerInch>96</o:PixelsPerInch>
           </o:OfficeDocumentSettings>
         </xml>
      </noscript>
<![endif]--><!--[if !mso]><!-- -->
  <link href="https://fonts.googleapis.com/css2?family=Righteous&display=swap" rel="stylesheet"><!--<![endif]--><!--[if mso]><xml>
    <w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word">
      <w:DontUseAdvancedTypographyReadingMail/>
    </w:WordDocument>
    </xml><![endif]-->
  <style type="text/css">
.rollover:hover .rollover-first {
  max-height:0px!important;
  display:none!important;
}
.rollover:hover .rollover-second {
  max-height:none!important;
  display:block!important;
}
.rollover span {
  font-size:0;
}
u + .body img ~ div div {
  display:none;
}
#outlook a {
  padding:0;
}
span.MsoHyperlink,
span.MsoHyperlinkFollowed {
  color:inherit;
  mso-style-priority:99;
}
a.es-button {
  mso-style-priority:100!important;
  text-decoration:none!important;
}
a[x-apple-data-detectors],
#MessageViewBody a {
  color:inherit!important;
  text-decoration:none!important;
  font-size:inherit!important;
  font-family:inherit!important;
  font-weight:inherit!important;
  line-height:inherit!important;
}
.es-desk-hidden {
  display:none;
  float:left;
  overflow:hidden;
  width:0;
  max-height:0;
  line-height:0;
  mso-hide:all;
}
.es-button-border:hover {
  border-color:#03AA6F #03AA6F #03AA6F #03AA6F!important;
  background:#000000!important;
}
.es-button-border:hover a.es-button,
.es-button-border:hover button.es-button {
  background:#000000!important;
  color:#03AA6F!important;
}
@media only screen and (max-width:600px) {.es-m-p0r { padding-right:0px!important } .es-m-p20b { padding-bottom:20px!important } .es-p-default { } *[class="gmail-fix"] { display:none!important } p, a { line-height:150%!important } h1, h1 a { line-height:120%!important } h2, h2 a { line-height:120%!important } h3, h3 a { line-height:120%!important } h4, h4 a { line-height:120%!important } h5, h5 a { line-height:120%!important } h6, h6 a { line-height:120%!important } .es-header-body p { } .es-content-body p { } .es-footer-body p { } .es-infoblock p { } h1 { font-size:40px!important; text-align:center } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:center } h4 { font-size:24px!important; text-align:left } h5 { font-size:20px!important; text-align:left } h6 { font-size:16px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:40px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body h4 a, .es-content-body h4 a, .es-footer-body h4 a { font-size:24px!important } .es-header-body h5 a, .es-content-body h5 a, .es-footer-body h5 a { font-size:20px!important } .es-header-body h6 a, .es-content-body h6 a, .es-footer-body h6 a { font-size:16px!important } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body a { font-size:14px!important } .es-footer-body p, .es-footer-body a { font-size:12px!important } .es-infoblock p, .es-infoblock a { font-size:12px!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3, .es-m-txt-c h4, .es-m-txt-c h5, .es-m-txt-c h6 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3, .es-m-txt-r h4, .es-m-txt-r h5, .es-m-txt-r h6 { text-align:right!important } .es-m-txt-j, .es-m-txt-j h1, .es-m-txt-j h2, .es-m-txt-j h3, .es-m-txt-j h4, .es-m-txt-j h5, .es-m-txt-j h6 { text-align:justify!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3, .es-m-txt-l h4, .es-m-txt-l h5, .es-m-txt-l h6 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-m-txt-r .rollover:hover .rollover-second, .es-m-txt-c .rollover:hover .rollover-second, .es-m-txt-l .rollover:hover .rollover-second { display:inline!important } .es-m-txt-r .rollover span, .es-m-txt-c .rollover span, .es-m-txt-l .rollover span { line-height:0!important; font-size:0!important; display:block } .es-spacer { display:inline-table } a.es-button, button.es-button { font-size:16px!important; padding:10px 20px 10px 20px!important; line-height:120%!important } a.es-button, button.es-button, .es-button-border { display:inline-block!important } .es-m-fw, .es-m-fw.es-fw, .es-m-fw .es-button { display:block!important } .es-m-il, .es-m-il .es-button, .es-social, .es-social td, .es-menu { display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .adapt-img { width:100%!important; height:auto!important } .es-mobile-hidden, .es-hidden { display:none!important } .es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } .h-auto { height:auto!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
</style>
 </head>
 <body class="body" style="width:100%;height:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#000000"><!--[if gte mso 9]>
			<v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
				<v:fill type="tile" color="#000000"></v:fill>
			</v:background>
		<![endif]-->
   <table width="100%" cellspacing="0" cellpadding="0" class="es-wrapper" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#000000">
     <tr>
      <td valign="top" style="padding:0;Margin:0">
       <table cellpadding="0" cellspacing="0" align="center" class="es-header" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" class="es-header-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000;width:600px">
             <tr>
              <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-right:20px;padding-left:20px">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" class="es-m-p0r" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:14px"><img src="https://futxffq.stripocdn.email/content/guids/CABINET_2c08af9e46abd212569925b240debe0c/images/45481625818189862.png" alt="Logo" title="Logo" height="50" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellspacing="0" cellpadding="0" align="center" class="es-content" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table cellspacing="0" cellpadding="0" bgcolor="#000000" align="center" class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000;width:600px" role="none">
             <tr>
              <td align="left" style="padding:0;Margin:0;padding-top:20px;padding-right:20px;padding-left:20px">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;font-size:0px"><img src="https://futxffq.stripocdn.email/content/guids/CABINET_2c08af9e46abd212569925b240debe0c/images/44391625818311503.png" alt="" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
             <tr>
              <td align="left" style="padding:20px;Margin:0"><!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:85px" valign="top"><![endif]-->
               <table cellpadding="0" cellspacing="0" align="left" class="es-left" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                 <tr>
                  <td align="left" class="es-m-p20b" style="padding:0;Margin:0;width:85px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" class="es-m-txt-c" style="padding:0;Margin:0;font-size:0px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:14px"><img src="https://futxffq.stripocdn.email/content/guids/CABINET_b48f3ccc16d0ef82fadabb1efe452cdc/images/jakenackosif9tk5uykiunsplash_1.png" alt="Madeline Greene " width="85" title="Madeline Greene " style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table><!--[if mso]></td><td style="width:20px"></td><td style="width:455px" valign="top"><![endif]-->
               <table cellpadding="0" cellspacing="0" align="right" class="es-right" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:455px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;padding-top:10px"><h1 style="Margin:0;font-family:Righteous, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:72px;font-style:normal;font-weight:normal;line-height:72px;color:#03aa6f"><b>Hi&nbsp;</b>Arnold!</h1></td>
                     </tr>
                   </table></td>
                 </tr>
               </table><!--[if mso]></td></tr></table><![endif]--></td>
             </tr>
             <tr>
              <td align="left" style="padding:0;Margin:0;padding-right:20px;padding-left:20px;padding-bottom:20px">
               <table width="100%" cellspacing="0" cellpadding="0" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td valign="top" align="center" class="es-m-p0r es-m-p20b" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-bottom:20px;font-size:0px"><img src="https://futxffq.stripocdn.email/content/guids/CABINET_2c08af9e46abd212569925b240debe0c/images/44391625818311503.png" alt="" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td valign="top" align="center" class="es-m-p0r es-m-p20b" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="left" style="padding:0;Margin:0;padding-bottom:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#EFEFEF;font-size:16px">First off, congratulations! We are so glad to have you as part of our growing community. There are close to 2 million marketers, designers, product managers, and engineers using us every day to ideate, design think, and collaborate to build some of the world’s most well-loved products. We can’t wait to see what you build!<br><br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#EFEFEF;font-size:16px">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.<br></p><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:24px;letter-spacing:0;color:#EFEFEF;font-size:16px"><br>As the CEO, my goal is to help you be successful, and to start I wanted to offer some tips to help you get the most out of us.</p></td>
                     </tr>
                     <tr>
                      <td align="left" style="padding:0;Margin:0;padding-bottom:10px;padding-top:40px"><h2 style="Margin:0;font-family:Righteous, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:28.8px;color:#FFFFFF">With best regards!</h2><h2 style="Margin:0;font-family:Righteous, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:24px;font-style:normal;font-weight:normal;line-height:28.8px;color:#FFFFFF">Madeline Greene and the Eona team.</h2></td>
                     </tr>
                   </table></td>
                 </tr>
                 <tr>
                  <td valign="top" align="center" class="es-m-p0r es-m-p20b" style="padding:0;Margin:0;width:560px">
                   <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px"><img src="https://futxffq.stripocdn.email/content/guids/CABINET_2c08af9e46abd212569925b240debe0c/images/44391625818311503.png" alt="" width="560" class="adapt-img" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></td>
                     </tr>
                     <tr>
                      <td align="left" style="padding:0;Margin:0;padding-bottom:10px;padding-top:30px"><h3 style="Margin:0;font-family:Righteous, sans-serif;mso-line-height-rule:exactly;letter-spacing:0;font-size:20px;font-style:normal;font-weight:normal;line-height:24px;color:#FFFFFF">Tell your friends</h3></td>
                     </tr>
                     <tr>
                      <td align="left" class="es-m-txt-c" style="padding:0;Margin:0;font-size:0">
                       <table cellpadding="0" cellspacing="0" class="es-table-not-adapt es-social" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:14px"><img title="Facebook" src="https://futxffq.stripocdn.email/content/assets/img/social-icons/circle-white/facebook-circle-white.png" alt="Fb" width="24" height="24" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:14px"><img title="X" src="https://futxffq.stripocdn.email/content/assets/img/social-icons/circle-white/x-circle-white.png" alt="X" width="24" height="24" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0;padding-right:20px"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:14px"><img title="Instagram" src="https://futxffq.stripocdn.email/content/assets/img/social-icons/circle-white/instagram-circle-white.png" alt="Inst" width="24" height="24" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                          <td align="center" valign="top" style="padding:0;Margin:0"><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:14px"><img title="Youtube" src="https://futxffq.stripocdn.email/content/assets/img/social-icons/circle-white/youtube-circle-white.png" alt="Yt" width="24" height="24" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding="0" cellspacing="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" bgcolor="#000000" style="padding:0;Margin:0;background-color:#000000">
           <table align="center" cellpadding="0" cellspacing="0" bgcolor="#000000" class="es-footer-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000;width:600px" role="none">
             <tr>
              <td align="left" style="Margin:0;padding-right:20px;padding-left:20px;padding-top:30px;padding-bottom:30px">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td style="padding:0;Margin:0">
                       <table cellpadding="0" cellspacing="0" width="100%" class="es-menu" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr class="links">
                          <td align="center" valign="top" width="25%" id="esd-menu-id-0" style="Margin:0;border:0;padding-top:10px;padding-bottom:10px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#ffffff;font-size:12px">About us</a>
                           </div></td>
                          <td align="center" valign="top" width="25%" id="esd-menu-id-1" style="Margin:0;border:0;padding-top:10px;padding-bottom:10px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#ffffff;font-size:12px">News</a>
                           </div></td>
                          <td align="center" valign="top" width="25%" id="esd-menu-id-2" style="Margin:0;border:0;padding-top:10px;padding-bottom:10px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email." style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#ffffff;font-size:12px">Career</a>
                           </div></td>
                          <td align="center" valign="top" width="25%" id="esd-menu-id-2" style="Margin:0;border:0;padding-top:10px;padding-bottom:10px;padding-right:5px;padding-left:5px">
                           <div style="vertical-align:middle;display:block">
                            <a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:none;font-family:arial, 'helvetica neue', helvetica, sans-serif;display:block;color:#ffffff;font-size:12px">The shops</a>
                           </div></td>
                         </tr>
                       </table></td>
                     </tr>
                     <tr>
                      <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:10px"><p style="Margin:0;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;letter-spacing:0;color:#ffffff;font-size:12px">You are receiving this email because you have visited our site or asked us about the regular newsletter. Make sure our messages get to your Inbox (and not your bulk or junk folders).<br><a target="_blank" href="https://viewstripo.email" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:12px">Privacy police</a> | <a target="_blank" style="mso-line-height-rule:exactly;text-decoration:underline;color:#EFEFEF;font-size:12px" href="">Unsubscribe</a></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding="0" cellspacing="0" align="center" class="es-footer" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%;table-layout:fixed !important;background-color:transparent;background-repeat:repeat;background-position:center top">
         <tr>
          <td align="center" style="padding:0;Margin:0">
           <table bgcolor="#ffffff" align="center" cellpadding="0" cellspacing="0" class="es-footer-body" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#000000;width:600px">
             <tr>
              <td align="left" style="Margin:0;padding-top:20px;padding-right:20px;padding-left:20px;padding-bottom:20px">
               <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                 <tr>
                  <td align="left" style="padding:0;Margin:0;width:560px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" class="es-infoblock made_with" style="padding:0;Margin:0;font-size:0"><a target="_blank" href="https://viewstripo.email/?utm_source=templates&utm_medium=email&utm_campaign=non_profit_12&utm_content=look_forward_to_seeing_you_soon" style="mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px"><img src="https://futxffq.stripocdn.email/content/guids/CABINET_09023af45624943febfa123c229a060b/images/7911561025989373.png" alt="" width="125" style="display:block;font-size:14px;border:0;outline:none;text-decoration:none"></a></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
    '''

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