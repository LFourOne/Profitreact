from app_flask import app
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from app_flask.models.user_models import User
from app_flask.models.project_models import Project
from app_flask.models.meeting_models import Meeting
from app_flask.models.staff_models import Staff
from app_flask.models.attendant_models import Attendant
from app_flask.models.commitment_models import Commitment
from datetime import datetime

bcrypt = Bcrypt(app)

@app.route('/')
def login():

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/login/process', methods=['POST'])
def login_process():

    # Obtenemos el usuario que intenta logearse
    user_login = User.obtain_one(request.form)

    # Si no se encuentra el usuario, retornamos un error
    if user_login == None:
        return jsonify({'status': 'error', 'message': 'error'}), 200
    
    # Si la contraseña no coincide, retornamos un error
    if not bcrypt.check_password_hash(user_login.contraseña, request.form['password']):
        return jsonify({'status': 'error', 'message': 'error'}), 200

    # En caso de que haya una sesión activa, la limpiamos
    if session:
        session.clear()

    # Creamos la sesión con los datos del usuario
    session['rut_personal'] = user_login.rut_personal
    session['nombres'] = user_login.nombres
    session['apellido_p'] = user_login.apellido_p
    session['apellido_m'] = user_login.apellido_m
    session['email'] = user_login.email
    session['id_especialidad'] = user_login.id_especialidad
    session['id_empresa'] = user_login.id_empresa
    session.permanent = True

    # Retornamos un mensaje de éxito
    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/index')
def index():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_empresa': session['id_empresa']
    }

    return jsonify({'session' : response_data}), 200

@app.route('/meeting')
def meeting():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_empresa': session['id_empresa']
    }

    projects = Project.select_projects_by_state()
    meetings = Meeting.select_meeting_type()
    staff = Staff.obtain_name_and_last_name()


    return jsonify({
        'session' : response_data,
        'projects' : projects,
        'meetings' : meetings,
        'staff' : staff
        }), 200

@app.route('/meetings/insert', methods=['POST'])
def insert_meeting():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    print(f"Data: {data}")

    today_date = datetime.now().strftime('%Y/%m/%d')
    hour_date = datetime.now().strftime('%H:%M:%S')

    meeting_data = {
        'id_proyecto': data['project'],
        'id_tipo_reunion': data['meeting_type'],
        'fecha': today_date,
        'hora_inicio': hour_date
    }

    meeting_id = Meeting.create_meeting(meeting_data)

    print(f"Meeting ID: {meeting_id}")

    for attendant in data['name_and_last_name_form']:

        attendant_data = {
            'id_reunion' : meeting_id,
            'rut_personal' : attendant['value'],
        }

        Attendant.create_attendant(attendant_data)


    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/reports')
def reports():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_empresa': session['id_empresa']
    }

    meetings = Meeting.select_all_meetings()

    return jsonify({
        'session' : response_data,
        'meetings' : meetings
        }), 200

@app.route('/reports/delete-meeting', methods=['POST'])
def delete_meeting():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    meeting_data = {
        'id_reunion': data['id_reunion']
    }

    Meeting.delete_meeting(meeting_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/reports/minute/<int:id_reunion>')
def minute(id_reunion):
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_empresa': session['id_empresa']
    }

    meeting_data = Meeting.select_all({'id_reunion' : id_reunion})

    # 0 = Reunión en curso / 1 = Reunión finalizada 
    if meeting_data[0]['hora_termino'] == None:
        meeting_data[0]['hora_termino'] = 0
    elif meeting_data[0]['hora_termino'] != None:
        meeting_data[0]['hora_termino'] = 1

    name_and_last_name = Staff.obtain_name_and_last_name()
    rut_jefe_proyecto = Project.select_rut_jefe_proyecto({'id_proyecto' : meeting_data[0]['id_proyecto']})
    nombre_jefe_proyecto = Staff.obtain_all_with_rut({'rut_personal' : rut_jefe_proyecto[0]['jefe_proyectos']})

    project_list = Project.get_projects_for_commitments()
    
    # De aquí en adelante, obtiene una lista para desplegar los compromisos de la reunión
    if meeting_data[0]['id_tipo_reunion'] == 1 or meeting_data[0]['id_tipo_reunion'] == 3:
        commitments = Commitment.select_all_and_previous({'id_tipo_reunion': meeting_data[0]['id_tipo_reunion']})
    else:
        commitments = Commitment.select_all({'id_reunion' : id_reunion})

    for commitment in commitments:
        # Obtenemos el nombre del responsable del compromiso
        responsable_rut = commitment['responsable']
        responsable_raw = Staff.obtain_all_with_rut({'rut_personal' : responsable_rut})
        commitment['responsable_nombre'] = responsable_raw[0]['nombres'] + ' ' + responsable_raw[0]['apellido_p'] + ' ' + responsable_raw[0]['apellido_m']

    return jsonify({
        'session' : response_data,
        'name_and_last_name' : name_and_last_name,
        'project_chief_name' : nombre_jefe_proyecto,
        'meeting_data' : meeting_data,
        'projects' : project_list,
        'commitments' : commitments
        }), 200

@app.route('/reports/minute/add-commitment', methods=['POST'])
def add_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    data = request.get_json()

    if data['priority'] == True:
        data['priority'] = 1
    else:
        data['priority'] = 0

    commitment_data = {
        'id_reunion' : data['id_reunion'],
        'id_proyecto': data['project_id'],
        'texto_compromiso' : data['commitment-text'],
        'fecha_comprometida' : data['commitment-date'],
        'responsable' : data['name_and_last_name_form'],
        'prioridad': data['priority'],
        'id_estado_compromiso' : 1
    }

    Commitment.create_commitment(commitment_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/reports/minute/complete-commitment', methods=['POST'])
def complete_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    today_date = datetime.now().strftime('%Y/%m/%d')

    commitment_data = {
        'id_compromiso' : data['id_compromiso'],
        'fecha_cumplimiento' : today_date
    }

    Commitment.complete_commitment(commitment_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/reports/minute/edit-commitment', methods=['POST'])
def edit_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    if data['priority'] == True:
        data['priority'] = 1
    else:
        data['priority'] = 0

    data['commitment-date'] = datetime.strptime(data['commitment-date'], '%Y-%m-%d').strftime('%Y/%m/%d')

    if data['id_meeting_type'] == '1' or data['id_meeting_type'] == '3':

        print(f"Esto es meeting type = {data['id_meeting_type']}")

        commitment_data = {
            'id_compromiso' : data['id_commitment'],
            'id_proyecto' : data['project_id'],
            'texto_compromiso' : data['commitment-text'],
            'fecha_comprometida' : data['commitment-date'],
            'responsable' : data['name_and_last_name_form'],
            'prioridad': data['priority']
        }

        Commitment.update_commitment_by_meeting_type(commitment_data)

    else:

        commitment_data = {
            'id_compromiso' : data['id_commitment'],
            'texto_compromiso' : data['commitment-text'],
            'fecha_comprometida' : data['commitment-date'],
            'responsable' : data['name_and_last_name_form'],
            'prioridad': data['priority']
        }

        Commitment.update_commitment(commitment_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/reports/minute/delete-commitment', methods=['POST'])
def delete_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    commitment_data = {
        'id_compromiso' : data['id_compromiso']
    }

    Commitment.delete_commitment(commitment_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200