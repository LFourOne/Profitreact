from app_flask import app
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from app_flask.models.project_models import Project
from app_flask.models.report_models import Report
from app_flask.models.hh_models.task_models import Task
from app_flask.models.hh_models.project_report_models import ProjectReport
from app_flask.models.hh_models.project_task_models import ProjectTask

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