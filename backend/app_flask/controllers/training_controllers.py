from app_flask import app
from flask import Flask, request, jsonify, session
from app_flask.models.staff_models import Staff
from app_flask.models.training_models.training_models import Training

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
    
    training_data = {
        'nombre_capacitacion': data['name'],
        'fecha': data['date'],
        'id_modalidad': data['format'],
        'hora_inicio': data['start-duration'],
        'hora_termino': data['end-duration'],
        'rut_instructor': data['instructor']['value'],
        'objetivos': data['objectives'],
        'contenido': data['content']
    }

    Training.create_training(training_data)

    return jsonify({'status': 'success', 'message': 'Capacitación creada exitosamente'}), 200