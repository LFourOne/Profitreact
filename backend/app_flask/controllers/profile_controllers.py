from app_flask import app
from flask import Flask, request, jsonify, session
from app_flask.models.staff_models import Staff

@app.route('/profile/<int:rut_personal>')
def profile(rut_personal):

    print(rut_personal)

    return jsonify({
        'status': 'success',
        'message': 'Profile endpoint is working',
    }), 200