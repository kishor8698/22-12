from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate, current
from flask_login import LoginManager

app=Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database/tumblr.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = "thisisddsecret"

UPLOAD_FOLDER = 'tumblr1/static/'    
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

db = SQLAlchemy(app)
migrate = Migrate(app, db)
login_manager = LoginManager(app)
# login_manager.init_app(app)
from tumblr1 import routes
