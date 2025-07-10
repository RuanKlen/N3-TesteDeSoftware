from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS # Para permitir que o frontend se conecte
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Inicializa o SQLAlchemy e o Migrate
db = SQLAlchemy(app)
migrate = Migrate(app, db)

CORS(app)

from routes import *

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)