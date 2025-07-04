from app_flask import app
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from app_flask.models.project_models import Project
from app_flask.models.report_models import Report
from app_flask.models.hh_models.task_models import Task
from app_flask.models.hh_models.project_report_models import ProjectReport
from app_flask.models.hh_models.project_task_models import ProjectTask
from datetime import datetime, time, timedelta

@app.route('/hh-register')
def hh_register():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    project = Project.select_projects_by_state()
    
    return jsonify({
        'project': project,

    })

@app.route('/hh-register/api/<string:project_id>', methods=['GET'])
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

    data = request.json

    start_str = data.get('start-time')
    end_str = data.get('end-time')

    fmt = "%H:%M"
    start_dt = datetime.strptime(start_str, fmt)
    end_dt = datetime.strptime(end_str, fmt)

    total_hours = (end_dt - start_dt).total_seconds() / 3600

    lunch_start = datetime.strptime("13:30", fmt)
    lunch_end = datetime.strptime("14:30", fmt)

    if start_dt < lunch_end and end_dt > lunch_start:
        total_hours -= 1

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

    print(hh_data)

    return jsonify({
        'status': 'success',
        'message': 'Datos procesados correctamente'
    })