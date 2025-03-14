from app_flask.controllers import controllers, training_controllers
from app_flask import app

if __name__ == "__main__":
    app.run(debug = True, port=5500)