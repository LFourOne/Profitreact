from app_flask import app
from flask import Flask, request, jsonify, session
from app_flask.models.project_models import Project
from app_flask.models.meeting_models import Meeting
from app_flask.models.staff_models import Staff
from app_flask.models.attendant_models import Attendant
from app_flask.models.commitment_models import Commitment
from app_flask.models.topic_agreement_models import Agreements, Topics 
from app_flask.models.planning_models import Planning
from app_flask.models.hh_models.hh_report_models import HH_Report
from datetime import datetime, timedelta

@app.route('/navbar')
def navbar():
        
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    role = session['id_rol']

    return jsonify({'role' : role}), 200

@app.route('/index')
def index():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    commitments = Commitment.get_all_personal_commitments({'responsable': session['rut_personal']})
    
    team = Staff.obtain_team({'id_especialidad': session['id_especialidad']})

    today = datetime.now()
    bussiness_days = {}

    days_since_monday = today.weekday()

    current_week_monday = today - timedelta(days=days_since_monday)

    current_week_bussiness_days = {}

    for i in range(5):
        day = current_week_monday + timedelta(days=i)
        if day.weekday() < 5:
            date = day.strftime('%Y-%m-%d')
            current_week_bussiness_days[i] = {'date': date}

    hh_records = HH_Report.select_weekly({'fecha_inicio': current_week_bussiness_days[0]['date'], 'fecha_fin': current_week_bussiness_days[4]['date'], 'rut_personal': session['rut_personal']})

    for record in hh_records:
        if isinstance(record['fecha'], (datetime, )):
            record['fecha'] = record['fecha'].strftime('%Y-%m-%d')
        elif isinstance(record['fecha'], (type(datetime.now().date()), )):
            record['fecha'] = record['fecha'].isoformat()

    # Agrupa registros por fecha
    hh_records_by_date = {}

    for record in hh_records:
        fecha = record['fecha']
        if fecha not in hh_records_by_date:
            hh_records_by_date[fecha] = []
        hh_records_by_date[fecha].append(record)

    # Junta días hábiles con sus registros (aunque estén vacíos)
    hh_records_grouped = []
    for idx, day in current_week_bussiness_days.items():
        records = hh_records_by_date.get(day['date'], [])
        hh_records_grouped.append({
            'date': day['date'],
            'hh_records': records
        })

    idx = 0
    i = 0

    while idx < 5:
        day = today + timedelta(days=i)
        if day.weekday() < 5:
            date = day.strftime('%Y-%m-%d')
            bussiness_days[idx] = {'date': date}
            idx += 1
        i += 1

    planification = Planning.select_weekly_planning({'fecha_inicio': bussiness_days[0]['date'], 'fecha_fin': bussiness_days[4]['date'], 'rut_personal': session['rut_personal']})

    for p in planification:
        if isinstance(p['fecha'], (datetime, )):
            p['fecha'] = p['fecha'].strftime('%Y-%m-%d')
        elif isinstance(p['fecha'], (type(datetime.now().date()), )):
            p['fecha'] = p['fecha'].isoformat()

    # Agrupa planificaciones por fecha
    planification_by_date = {}
    for p in planification:
        fecha = p['fecha']
        if fecha not in planification_by_date:
            planification_by_date[fecha] = []
        planification_by_date[fecha].append(p)

    # Junta días hábiles con sus planificaciones (aunque estén vacías)
    planification_grouped = []
    for idx, day in bussiness_days.items():
        planifications = planification_by_date.get(day['date'], [])
        planification_grouped.append({
            'date': day['date'],
            'planification': planifications
        })

    projects = Project.get_projects_for_commitments()
    meeting_type = Meeting.select_meeting_type()

    session_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
    }

    return jsonify({
        'commitments' : commitments,
        'team' : team,
        'planification' : planification_grouped,
        'projects' : projects,
        'meeting_type' : meeting_type,
        'HHRecords' : hh_records_grouped,
        'session' : session_data,
        }), 200

@app.route('/meeting')
def meeting():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6, 7]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    session_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_rol': session['id_rol']
    }

    meetings = Meeting.select_all_meetings()

    meeting_type = Meeting.select_meeting_type()

    project_list = Project.get_projects()

    return jsonify({
        'session' : session_data,
        'meetings' : meetings,
        'projects' : project_list,
        'meeting_type' : meeting_type
        }), 200

@app.route('/meeting/create-meeting')
def create_meeting():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    session_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
    }

    projects = Project.select_projects_by_state()
    meetings = Meeting.select_meeting_type()
    staff = Staff.obtain_name_and_last_name()


    return jsonify({
        'session' : session_data,
        'projects' : projects,
        'meetings' : meetings,
        'staff' : staff
        }), 200

@app.route('/meeting/create-meeting/process', methods=['POST'])
def create_meeting_process():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    today_date = datetime.now().strftime('%Y/%m/%d')
    hour_date = datetime.now().strftime('%H:%M:%S')

    meeting_data = {
        'id_proyecto': data['project'],
        'id_tipo_reunion': data['meeting_type'],
        'fecha': today_date,
        'hora_inicio': hour_date
    }

    meeting_id = Meeting.create_meeting(meeting_data)

    for attendant in data['name_and_last_name_form']:

        attendant_data = {
            'id_reunion' : meeting_id,
            'rut_asistente' : attendant['value'],
        }

        Attendant.create_attendant(attendant_data)


    return jsonify({
        'status': 'success', 
        'message': 'success',
        'meeting': meeting_id
        }), 200

@app.route('/meeting/delete-meeting', methods=['DELETE'])
def delete_meeting():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

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
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6, 7]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    role_permissions = {
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        4: [3, 4, 5, 6, 7, 8, 9, 10],
        5: [3, 4, 5, 6, 7, 8, 9, 10],
        6: [4, 5, 6, 7, 8, 9, 10],
        7: [4, 5, 6, 7, 8, 9, 10],
        8: [],
    }

    meeting_data = Meeting.select_all({'id_reunion' : id_reunion})
    
    meeting_type = meeting_data[0]['id_tipo_reunion']
    
    allowed_types = role_permissions[session['id_rol']]
    if meeting_type not in allowed_types:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    session_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_rol': session['id_rol']
    }

    agreements = Agreements.select_agreements({'id_reunion' : id_reunion})

    topics = Topics.select_topics({'id_reunion' : id_reunion})

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
        'session' : session_data,
        'name_and_last_name' : name_and_last_name,
        'project_chief_name' : nombre_jefe_proyecto,
        'meeting_data' : meeting_data,
        'projects' : project_list,
        'commitments' : commitments,
        'agreements' : agreements,
        'topics' : topics
        }), 200

@app.route('/meetings/minute/add-commitment', methods=['POST'])
def add_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
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
        'responsable' : data['name_and_last_name_form']['value'],
        'prioridad': data['priority'],
        'id_estado' : 1
    }

    Commitment.create_commitment(commitment_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/meetings/minute/complete-commitment', methods=['POST'])
def complete_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    today_date = datetime.now().strftime('%Y/%m/%d')

    commitment_data = {
        'id_compromiso' : data['id_compromiso'],
        'fecha_cumplimiento' : today_date
    }

    Commitment.complete_commitment(commitment_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/meetings/minute/edit-commitment', methods=['PATCH'])
def edit_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    if data['priority'] == True:
        data['priority'] = 1
    else:
        data['priority'] = 0

    data['commitment-date'] = datetime.strptime(data['commitment-date'], '%Y-%m-%d').strftime('%Y/%m/%d')

    if data['id_meeting_type'] == '1' or data['id_meeting_type'] == '3':

        commitment_data = {
            'id_compromiso' : data['id_commitment'],
            'id_proyecto' : data['project_id'],
            'texto_compromiso' : data['commitment-text'],
            'fecha_comprometida' : data['commitment-date'],
            'responsable' : data['name_and_last_name_form']['value'],
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

@app.route('/meetings/minute/delete-commitment', methods=['DELETE'])
def delete_commitment():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    commitment_data = {
        'id_compromiso' : data['id_compromiso']
    }

    Commitment.delete_commitment(commitment_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/meetings/minute/close-meeting', methods=['PATCH'])
def close_meeting():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    hour_date = datetime.now().strftime('%H:%M:%S')

    meeting_data = {
        'id_reunion' : data['id_reunion'],
        'hora_termino' : hour_date
    }

    Meeting.close_meeting(meeting_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/meetings/minute/add-agreement', methods=['POST'])
def add_agreement():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    data = request.get_json()

    agreement_data = {
        'id_reunion' : data['id_reunion'],
        'texto_acuerdo' : data['agreement']
    }

    Agreements.create_agreements(agreement_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/meetings/minute/add-topic', methods=['POST'])
def add_topic():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5, 6]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    data = request.get_json()

    topic_data = {
        'id_reunion' : data['id_reunion'],
        'texto_tema_tratado' : data['topic']
    }

    Topics.create_topics(topic_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200