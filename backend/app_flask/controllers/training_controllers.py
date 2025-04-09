from app_flask import app
from flask import Flask, request, jsonify, session

@app.route('/training')
def training():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    

    return jsonify({'status': 'success', 'message': 'Usuario autorizado'}), 200