from app_flask import app
from flask import Flask, request, jsonify, session
from app_flask.models.staff_models import Staff

@app.route('/profile/<int:rut_personal>')
def profile(rut_personal):

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    profile_data = Staff.get_profile({'rut_personal': rut_personal})

    return jsonify({
        'profile': profile_data[0],
    }), 200