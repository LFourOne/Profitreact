from flask import Flask
from flask_cors import CORS
from datetime import timedelta
import re

app = Flask(__name__)
app.secret_key = "Shhh"
app.permanent_session_lifetime = timedelta(hours=2)
app.config['SESSION_COOKIE_SECURE'] = False
app.config["SESSION_COOKIE_SAMESITE"] = "None"
app.config["SESSION_COOKIE_SECURE"] = True
cors = CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

DATA_BASE = "profit2"
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+-]+@[a-zA-Z0-9._-]+.[a-zA-Z]+$')