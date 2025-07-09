from app_flask import app
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from app_flask.models.project_models import Project
from app_flask.models.report_models import Report
from app_flask.models.hh_models.task_models import Task
from app_flask.models.hh_models.project_report_models import ProjectReport
from app_flask.models.hh_models.project_task_models import ProjectTask
from app_flask.models.hh_models.hh_report_models import HH_Report
from datetime import datetime, time, timedelta

@app.route('/hh-register')
def hh_register():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    project = Project.select_projects_by_state()
    
    return jsonify({
        'project': project,

    })

@app.route('/hh-register/api/projects/<string:project_id>', methods=['GET'])
def get_reports_by_project(project_id):

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = {
        'id_proyecto': project_id
    }
    
    project_reports = ProjectReport.select_reports_by_project(data)

    project_tasks = ProjectTask.get_all_by_project(data)

    return jsonify({
        'reports': project_reports,
        'tasks': project_tasks
    })

@app.route('/hh-register/process', methods=['POST'])
def process_hh_register():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    date_str = data.get('date')

    date_obj = datetime.strptime(date_str, "%Y-%m-%d")  # Convertir a objeto datetime
    day_of_week = date_obj.weekday() 

    # 0= Lunes, 1 = Martes, 2 = Miércoles, 3 = Jueves, 4 = Viernes, 5 = Sábado, 6 = Domingo

    if day_of_week in [0, 1, 2]:  # Lunes, Martes, Miércoles
        max_daily_hours = 9
    elif day_of_week in [3, 4]:  # Jueves, Viernes
        max_daily_hours = 8
    else:  # Sábado, Domingo
        max_daily_hours = 0

    # Si es fin de semana, no se pueden registrar horas
    if max_daily_hours == 0:
        return jsonify({'status': 'error', 'message': 'No se pueden registrar horas en fin de semana'}), 400

    # Se recuperan las horas totales ya registradas para el día actual para validar si el registro no excede el máximo permitido
    current_hh = HH_Report.select_all({'fecha': date_str, 'rut_personal': session['rut_personal']})

    total_day_hh = 0

    if current_hh:
        for i in current_hh:
            total_day_hh += i['horas']

    start_str = data.get('start-time')
    end_str = data.get('end-time')

    fmt = "%H:%M"
    start_dt = datetime.strptime(start_str, fmt)
    end_dt = datetime.strptime(end_str, fmt)

    # Validar que la hora de inicio sea menor a la hora de fin
    if start_dt >= end_dt:
        return jsonify({'status': 'error', 'message': 'La hora de inicio debe ser menor a la hora de fin'}), 400

    total_hours = (end_dt - start_dt).total_seconds() / 3600

    lunch_start = datetime.strptime("13:30", fmt)
    lunch_end = datetime.strptime("14:30", fmt)

    if start_dt < lunch_end and end_dt > lunch_start:
        total_hours -= 1

    if (round(total_day_hh + total_hours, 1) > max_daily_hours):
        print("OLAAAAAA", round(total_day_hh + total_hours, 1))
        return jsonify({'status': 'error', 'message': f'No se pueden registrar más de {max_daily_hours} horas en un día'}), 400
    
    hh_data = {
        'id_proyecto': data.get('project'),
        'id_informe': data.get('report'),
        'id_tarea': data.get('task'),
        'inicio': data.get('start-time'),
        'fin': data.get('end-time'),
        'rut_personal': session['rut_personal'],
        'id_especialidad': session['id_especialidad'],
        'fecha': data.get('date'),
        'horas': round(total_hours, 1)
    }

    HH_Report.create(hh_data)

    return jsonify({
        'status': 'success',
        'message': 'Datos procesados correctamente'
    })

@app.route('/hh-register/delete', methods=['DELETE'])
def delete_hh():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    delete_data = {
        'id_registro_hh': data.get('id_registro_hh'),
        'rut_personal': session['rut_personal']
    }

    validation = HH_Report.delete(delete_data)

    if validation == 0 or validation is False:
        return jsonify({'status': 'error', 'message': 'No se pudo eliminar la HH'}), 400

    return jsonify({'status': 'success', 'message': 'HH eliminada correctamente'})

@app.route('/hh-register/api/schedule/<string:date>', methods=['GET'])
def get_schedule(date):

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    schedule_data = {
        'fecha': date,
        'rut_personal': session['rut_personal']
    }

    schedule = HH_Report.select_all(schedule_data)

    if schedule:
        for item in schedule:
            # inicio y fin: timedelta a HH:MM
            total_seconds = int(item['inicio'].total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            item['inicio'] = f"{hours:02d}:{minutes:02d}"

            total_seconds = int(item['fin'].total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            item['fin'] = f"{hours:02d}:{minutes:02d}"

            # fecha: date a string
            item['fecha'] = item['fecha'].isoformat()

            # creado_en: datetime a string
            item['creado_en'] = item['creado_en'].isoformat()
    else:
        schedule = []

    return jsonify({
        'schedule': schedule
    })