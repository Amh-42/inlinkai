# InLinkAI Flask Application

## Setup Instructions

### Local Development
1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

### cPanel Deployment
1. Upload all files to your cPanel hosting via FTP or File Manager.

2. Create a Python application in cPanel:
   - Go to Software > Setup Python App
   - Set Python version to 3.8 or higher
   - Set application root to your domain or subdomain
   - Set application URL to your domain or subdomain
   - Set application startup file to passenger_wsgi.py

3. Install dependencies:
   - In the Terminal, navigate to your application directory
   - Run: `pip install -r requirements.txt`

4. Restart the application in cPanel. 