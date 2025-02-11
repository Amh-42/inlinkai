from flask import Flask, render_template, redirect, url_for, request
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired

app = Flask(__name__)
app.config['SECRET_KEY'] = 'supersecretkey'

login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

# Dummy user database
class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Register')

@app.route('/', methods=['GET', 'POST'])
@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User(id=form.username.data)
        login_user(user)
        return redirect(url_for('dashboard'))
    return render_template('login.html', form=form)

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        user = User(id=form.username.data)
        login_user(user)
        return redirect(url_for('dashboard'))
    return render_template('register.html', form=form)


@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/profile_optimization')
@login_required
def profile_optimization():
    return render_template('profile_optimization.html')

@app.route('/content_curation')
@login_required
def content_curation():
    return render_template('content_curation.html')

@app.route('/lead_generation')
@login_required
def lead_generation():
    return render_template('lead_generation.html')

@app.route('/content_calendar')
@login_required
def content_calendar():
    return render_template('content_calendar.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
