# InLinkAI cPanel Deployment Guide

## Setup for cPanel with inlinkai folder

### 1. File Structure
Your application should be structured as follows in your cPanel:
```
inlinkai/
├── app.py
├── passenger_wsgi.py
├── .htaccess
├── requirements.txt
├── .env
├── static/
│   ├── css/
│   ├── js/
│   └── resources/
├── templates/
└── venv/
```

### 2. cPanel Configuration

#### Python App Setup:
1. Go to cPanel → "Setup Python App"
2. Create a new Python app:
   - **Python version**: 3.11
   - **Application root**: `/home/inlinkff/inlinkai`
   - **Application URL**: `yourdomain.com/inlinkai` or `yourdomain.com`
   - **Application startup file**: `passenger_wsgi.py`

#### Domain/Subdomain Setup:
- If using a subdomain: Point it to `/home/inlinkff/inlinkai`
- If using main domain: Point it to `/home/inlinkff/inlinkai`

### 3. Environment Variables
Make sure your `.env` file contains:
```env
DB_HOST=localhost
DB_USER=inlinkff_leadman
DB_PASSWORD=your_password
DB_NAME=inlinkff_leads
```

### 4. Database Setup
1. Create MySQL database in cPanel
2. Import your database schema
3. Update `.env` file with correct credentials

### 5. File Permissions
Set proper permissions:
```bash
chmod 644 .htaccess
chmod 644 passenger_wsgi.py
chmod 644 app.py
chmod 755 static/
chmod 755 templates/
```

### 6. Virtual Environment
If using virtual environment:
```bash
cd /home/inlinkff/inlinkai
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 7. Testing
1. Visit your domain to test the application
2. Check error logs in cPanel → "Error Logs"
3. Test form submissions and database connections

### 8. Troubleshooting

#### Common Issues:
1. **500 Error**: Check `passenger_wsgi.py` path and Python version
2. **Database Connection**: Verify credentials in `.env`
3. **Static Files**: Ensure `.htaccess` is properly configured
4. **Permissions**: Check file permissions

#### Log Locations:
- cPanel Error Logs: `/home/inlinkff/logs/`
- Application Logs: Check your app.py logging configuration

### 9. SSL/HTTPS
If you have SSL certificate:
1. Uncomment HTTPS redirect in `.htaccess`
2. Update Content Security Policy headers

### 10. Performance
The `.htaccess` file includes:
- Gzip compression
- Browser caching
- Security headers
- Static file handling

### 11. Backup
Regular backups:
- Database: Use cPanel → "Backup Wizard"
- Files: Download via File Manager or FTP
- Code: Use version control (Git)

### 12. Monitoring
- Set up uptime monitoring
- Monitor error logs
- Track application performance 