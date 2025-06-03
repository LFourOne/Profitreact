from app_flask.controllers import controllers, training_controllers, gantt_controllers, authentication_controllers, profile_controllers
from waitress import serve
from app_flask import app

if __name__ == "__main__":
    app.run(debug=True, port=5500)