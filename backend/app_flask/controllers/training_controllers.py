from app_flask import app
from flask import Flask, request, jsonify, session
from app_flask.models.staff_models import Staff
from app_flask.models.training_models.training_models import Training
from app_flask.models.training_models.training_models import TrainingAssistant
from datetime import datetime

@app.route('/training')
def training():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    trainings = Training.get_all_trainings()

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
        'trainings': trainings
        }), 200

@app.route('/training/create')
def create_training():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    staff = Staff.get_staff()

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
        'staff': staff
        }), 200

@app.route('/training/create/process', methods=['POST'])
def create_training_process():

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

@app.route('/training/<int:id_capacitacion>')
def training_details(id_capacitacion):

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    training = Training.get_training_by_id({'id_capacitacion': id_capacitacion})

    assistants = TrainingAssistant.select_attendance({'id_capacitacion': id_capacitacion})

    session_data = session['rut_personal']

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
        'trainings': training,
        'assistants': assistants,
        'session': session_data
        }), 200

@app.route('/training/register-attendance', methods=['POST'])
def register_attendance():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    data = request.get_json()

    verificator = TrainingAssistant.select_attendant_by_rut({'id_capacitacion': data['id_capacitacion'], 'rut_asistente': data['session']})

    if verificator == True:
        return jsonify({'status': 'error', 'message': 'Ya has registrado asistencia en esta capacitación'}), 409
    
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    attendance_data = {
        'id_capacitacion': data['id_capacitacion'],
        'rut_asistente': session['rut_personal'],
        'fecha': date
    }

    TrainingAssistant.register_attendance(attendance_data)
    
    return jsonify({'status': 'success', 'message': 'Asistencia registrada exitosamente'}), 200