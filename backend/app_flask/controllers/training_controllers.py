from app_flask import app
from flask import Flask, request, jsonify, session
from app_flask.models.staff_models import Staff

@app.route('/training')
def training():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    staff = Staff.get_staff()

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
        'staff': staff
        }), 200

@app.route('/training/create/process', methods=['POST'])
def create_training():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    data = request.get_json()
    
    print(f"Esto es data: {data}")

    print(data['instructor']['value'])

    return jsonify({'status': 'success', 'message': 'Proceso de entrenamiento creado exitosamente'}), 200