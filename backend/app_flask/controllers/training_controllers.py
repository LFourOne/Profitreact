from app_flask import app
from flask import Flask, request, jsonify, session, send_from_directory
from app_flask.models.staff_models import Staff
from app_flask.models.training_models.training_models import Training
from app_flask.models.training_models.training_models import TrainingAssistant
from datetime import datetime
from werkzeug.utils import secure_filename
import os

@app.route('/training')
def training():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    trainings = Training.get_all_trainings()

    session_data = {
        'id_rol' : session['id_rol']
    }

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
        'trainings': trainings,
        'session': session_data
    }), 200

@app.route('/training/create')
def create_training():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
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
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
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

    session_data = {
        'rut_personal': session['rut_personal'],
        'id_rol' : session['id_rol'],
    }

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

    print(f"ESTA ES LA DATA: {data}")
    
    verificator = TrainingAssistant.select_attendant_by_rut({'id_capacitacion': data['id_capacitacion'], 'rut_asistente': data['session']['rut_personal']})

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

@app.route('/training/edit/<int:id_capacitacion>', methods=['PATCH'])
def edit_training(id_capacitacion):
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    training_data = {
        'id_capacitacion': id_capacitacion,
        'nombre_capacitacion': data['title'],
        'fecha': data['date'],
        'id_modalidad': data['format'],
        'hora_inicio': data['start-duration'],
        'hora_termino': data['end-duration'],
        'rut_instructor': data['instructor']['value'],
        'objetivos': data['objectives'],
        'contenido': data['content']
    }

    Training.update_training(training_data)

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
    }), 200

@app.route('/training/complete/<int:id_capacitacion>', methods=['PATCH'])
def complete_training(id_capacitacion):
    
        if 'rut_personal' not in session:
            return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
        
        if session['id_rol'] not in [1, 2, 3]:
            return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
        data = {
            'id_capacitacion': id_capacitacion,
        }
    
        Training.complete_training(data)
    
        return jsonify({
            'status': 'success', 
            'message': 'Usuario autorizado',
        }), 200

@app.route('/training/delete/<int:id_capacitacion>', methods=['DELETE'])
def delete_training(id_capacitacion):

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    TrainingAssistant.delete_attendance({'id_capacitacion': id_capacitacion})

    Training.delete_training({'id_capacitacion': id_capacitacion})

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
    }), 200

@app.route('/training/remove-attendance', methods=['DELETE'])
def remove_attendance():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    data = request.get_json()

    attendance_data = {
        'id_capacitacion': data['id_capacitacion'],
        'rut_asistente': data['rut_assistant']
    }

    TrainingAssistant.remove_assistant(attendance_data)

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
    }), 200
    

@app.route('/training/upload-file', methods=['PATCH'])
def upload_file():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    if 'file' not in request.files:
        print('No se envió ningún archivo')
        return jsonify({'error': 'No se envió ningún archivo'}), 400
    
    file = request.files['file']

    if not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Solo se permiten archivos PDF'}), 400
    
    if file.mimetype != 'application/pdf':
        return jsonify({'error': 'El archivo no es un PDF válido'}), 400

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    id_capacitacion = request.form.get('id_capacitacion')

    original_filename = secure_filename(file.filename)
    filename, file_extension = os.path.splitext(original_filename)
    new_filename = f"{filename}_{id_capacitacion}{file_extension}"

    file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
    file.save(file_path)

    Training.insert_path({'ruta': new_filename, 'id_capacitacion': id_capacitacion})

    return jsonify({'status': 'success', 'message': 'Archivo subido exitosamente'}), 200

@app.route('/training/files/<filename>')
def get_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)
    except FileNotFoundError:
        return jsonify({'error': 'Archivo no encontrado'}), 404
    
@app.route('/training/get-staff')
def get_staff():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    staff = Staff.get_staff()

    return jsonify({
        'status': 'success', 
        'message': 'Usuario autorizado',
        'staff': staff
        }), 200