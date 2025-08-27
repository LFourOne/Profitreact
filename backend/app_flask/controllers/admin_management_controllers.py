from app_flask import app
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from app_flask.models.user_models import User
from app_flask.models.specialty_models import Specialty
from app_flask.models.role_models import Role
from app_flask.models.project_models import Project
from app_flask.models.report_models import Report
from app_flask.models.hh_models.task_type_models import TaskType
from app_flask.models.hh_models.task_models import Task
from app_flask.models.hh_models.project_report_models import ProjectReport
from app_flask.models.hh_models.project_task_models import ProjectTask
from app_flask.models.client_models import Clients
from app_flask.models.region_models import Regions
from app_flask.models.staff_models import Staff
from app_flask.models.study_type_models import Study_type
from app_flask.models.meeting_type_models import MeetingType 
from app_flask.models.task_type_models import TaskType

bcrypt = Bcrypt(app)

# User Management Endpoints

@app.route('/admin/user-management')
def user_management():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    staff = User.get_all()

    specialty = Specialty.get_specialities()

    role = Role.get_all()

    return jsonify({
        'staff' : staff,
        'specialty': specialty,
        'role': role
    }), 200

@app.route('/admin/user-management/register/process', methods=['POST'])
def register_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    encrypted_password = bcrypt.generate_password_hash(data['password'])

    user_data = {
        'rut_personal': data['rut_personal'],
        'digito_verificador': data['digito_verificador'],
        'usuario': data['usuario'],
        'contraseña': encrypted_password,
        'nombres': data['nombres'],
        'apellido_p': data['apellido_p'],
        'apellido_m': data['apellido_m'],
        'iniciales_nombre': data['iniciales_nombre'],
        'email': data['email'],
        'fecha_nacimiento': data['fecha_nacimiento'],
        'fecha_contratacion': data['fecha_contratacion'],
        'estado': 1,
        'id_especialidad': data['id_especialidad'],
        'id_rol': data['id_rol'],
        'reporta_hh': data['reporta_hh'],
    }

    User.create_one(user_data)

    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/admin/user-management/edit/process', methods=['PATCH'])
def edit_user_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    data = request.get_json()

    user_data = {
        'rut_personal_old': data.get('rut_personal_old'),
        'rut_personal': data.get('rut_personal'),
        'digito_verificador': data.get('digito_verificador'),
        'usuario': data.get('usuario'),
        'nombres': data.get('nombres'),
        'apellido_p': data.get('apellido_p'),
        'apellido_m': data.get('apellido_m'),
        'iniciales_nombre': data.get('iniciales_nombre'),
        'email': data.get('email'),
        'telefono': data.get('telefono'),
        'fecha_nacimiento': data.get('fecha_nacimiento'),
        'fecha_contratacion': data.get('fecha_contratacion'),
        'estado': data.get('estado'),
        'id_especialidad': data.get('id_especialidad'),
        'id_rol': data.get('id_rol'),
        'reporta_hh': data.get('reporta_hh'),
        'color': data.get('color')
    }

    if data.get('password'):
        user_data['contraseña'] = bcrypt.generate_password_hash(data['password'])
        User.edit_user_with_password(user_data)
    else:
        User.edit_user(user_data)
    
    return jsonify({
        'status': 'success',
        'message': 'Usuario actualizado correctamente',
    }), 200

# HH Management Endpoints

@app.route('/admin/project-report-task')
def project_report_task():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    project = Project.select_projects_by_state()

    report = Report.select_reports()

    project_report = ProjectReport.get_all()

    project_task = ProjectTask.get_all()

    task = Task.get_all()

    return jsonify({
        'project': project,
        'report': report,
        'project-report': project_report,
        'project-task': project_task,
        'task': task
    }), 200

@app.route('/admin/project-report-task/add/process', methods=['POST'])
def create_project_report_task_process():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    data = request.get_json()
    
    current_report_version = ProjectReport.select_max_current_report_version({'id_proyecto': data.get('id-project'), 'id_informe': data.get('id-report')})

    if not current_report_version:
        current_report_version = 1

    project_report_data = {
        'id_proyecto': data.get('id-project'),
        'id_informe': data.get('id-report'),
        'id_version': current_report_version
    }

    project_task_data = {
        'id_proyecto': data.get('id-project'),
        'id_informe': data.get('id-report'),
        'id_tarea': data.get('id-task'),
        'alias_tarea': data.get('task-alias'),
        'id_estado': 1
    }

    ProjectReport.create(project_report_data)

    ProjectTask.create(project_task_data)

    return jsonify({
        'status': 'success',
        'message': 'Tarea del proyecto creada correctamente'
    }), 200

@app.route('/admin/project-report-task/edit/process', methods=['PATCH'])
def edit_project_report_task_process():
    return jsonify({'status': 'error', 'message': 'Endpoint no implementado'}), 501

@app.route('/admin/project-report-task/delete/process', methods=['DELETE'])
def delete_project_report_task_process():
    return jsonify({'status': 'error', 'message': 'Endpoint no implementado'}), 501

@app.route('/admin/project-report-task/add-report-version/process', methods=['POST'])
def add_report_version_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    data = request.get_json()

    current_report_version = ProjectReport.select_max_current_report_version({'id_proyecto': data.get('id-project'), 'id_informe': data.get('id-report')})

    project_report_data = {
        'id_proyecto': data.get('id-project'),
        'id_informe': data.get('id-report'),
        'id_version': current_report_version + 1
    }

    ProjectReport.create(project_report_data)

    return jsonify({
        'status': 'success',
        'message': 'Versión del informe del proyecto creada correctamente'
    }), 200

@app.route('/admin/task')
def task():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    tasks = Task.get_all()

    task_types = TaskType.get_all()

    return jsonify({
        'tasks': tasks,
        'task_types': task_types,
    }), 200

@app.route('/admin/task/add/process', methods=['POST'])
def create_task_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    task_data = {
        'nivel_1': data.get('task-level-1'),
        'nivel_2': data.get('task-level-2'),
        'nivel_3': data.get('task-level-3'),
        'nombre': data.get('task-name'),
        'id_tipo_tarea': data.get('task-type')
    }

    Task.create_task(task_data)

    return jsonify({'status': 'success', 'message': 'Tarea creada correctamente'}), 200

@app.route('/admin/task/edit/process', methods=['PATCH'])
def edit_task_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    task_data = {
        'id_tarea': data.get('task-id'),
        'nivel_1': data.get('task-level-1'),
        'nivel_2': data.get('task-level-2'),
        'nivel_3': data.get('task-level-3'),
        'nombre': data.get('task-name'),
        'id_tipo_tarea': data.get('task-type')
    }

    Task.edit_task(task_data)

    return jsonify({'status': 'success', 'message': 'Tarea actualizada correctamente'}), 200

@app.route('/admin/task/delete/process', methods=['DELETE'])
def delete_task_process():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    task_data = {
        'id_tarea': data.get('data')
    }

    Task.delete_task(task_data)

    return jsonify({'status': 'success', 'message': 'Tarea eliminada correctamente'}), 200

@app.route('/admin/clients-management')
def clients_management():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    clients = Clients.select_all()

    regions = Regions.select_all()

    return jsonify({
        'clients': clients,
        'regions': regions
    }), 200

@app.route('/admin/clients-management/add/process', methods=['POST'])
def add_client_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    if data.get('rut_mandante') is None:
        return jsonify({'status': 'error', 'message': 'Falta el RUT del mandante'}), 400

    client_data = {
        'rut_mandante': data.get('rut_mandante'),
        'digito_verificador_mandante': data.get('digito_verificador_mandante'),
        'nombre_mandante': data.get('nombre_mandante'),
        'direccion': data.get('direccion'),
        'id_region': data.get('id_region'),
        'comuna': data.get('comuna'),
        'giro': data.get('giro'),
        'telefono': data.get('telefono'),
        'email': data.get('email'),
        'sitio_web': data.get('sitio_web'),
        'nombre_contacto': data.get('nombre_contacto'),
        'telefono_contacto': data.get('telefono_contacto'),
        'email_contacto': data.get('email_contacto'),
    }

    Clients.create(client_data)

    return jsonify({'status': 'success', 'message': 'Cliente creado correctamente'}), 200

@app.route('/admin/clients-management/edit/process', methods=['PATCH'])
def edit_client_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    client_data = {
        'rut_mandante': data.get('rut_mandante'),
        'digito_verificador_mandante': data.get('digito_verificador_mandante'),
        'nombre_mandante': data.get('nombre_mandante'),
        'direccion': data.get('direccion'),
        'id_region': data.get('id_region'),
        'comuna': data.get('comuna'),
        'giro': data.get('giro'),
        'telefono': data.get('telefono'),
        'email': data.get('email'),
        'sitio_web': data.get('sitio_web'),
        'nombre_contacto': data.get('nombre_contacto'),
        'telefono_contacto': data.get('telefono_contacto'),
        'email_contacto': data.get('email_contacto'),
    }

    Clients.update(client_data)

    return jsonify({'status': 'success', 'message': 'Cliente actualizado correctamente'}), 200

@app.route('/admin/projects-management')
def projects_management():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    projects = Project.select_all()

    staff = Staff.obtain_name_and_last_name()

    study_types = Study_type.select_all()

    clients = Clients.select_all_rut_and_name()

    return jsonify({
        'projects': projects,
        'staff': staff,
        'study_types': study_types,
        'clients': clients
    }), 200

@app.route('/admin/projects-management/add/process', methods=['POST'])
def add_project_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    project_data = {
        'id_proyecto': data.get('id_proyecto'),
        'nombre': data.get('nombre'),
        'id_tipo_estudio': data.get('id_tipo_estudio'),
        'jefe_proyectos': data.get('jefe_proyectos'),
        'fecha_inicio': data.get('fecha_inicio'),
        'fecha_termino': data.get('fecha_termino'),
        'id_ot': data.get('id_ot'),
        'estado': data.get('estado'),
        'rut_mandante': data.get('rut_mandante')
    }

    Project.create(project_data)

    return jsonify({'status': 'success', 'message': 'Proyecto creado correctamente'}), 200

@app.route('/admin/projects-management/edit/process', methods=['PATCH'])
def edit_project_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    project_data = {
        'original_id_proyecto': data.get('original_id_proyecto'),
        'id_proyecto': data.get('id_proyecto'),
        'nombre': data.get('nombre'),
        'id_tipo_estudio': data.get('id_tipo_estudio'),
        'jefe_proyectos': data.get('jefe_proyectos'),
        'fecha_inicio': data.get('fecha_inicio'),
        'fecha_termino': data.get('fecha_termino'),
        'id_ot': data.get('id_ot'),
        'estado': data.get('estado'),
        'rut_mandante': data.get('rut_mandante')
    }

    Project.update(project_data)

    return jsonify({'status': 'success', 'message': 'Proyecto actualizado correctamente'}), 200

@app.route('/admin/specialty-management')
def specialty_management():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    specialties = Specialty.get_specialities()

    staff = Staff.get_staff()

    return jsonify({
        'specialties': specialties,
        'staff': staff
    }), 200

@app.route('/admin/specialty-management/update', methods=['PATCH'])
def specialty_management_update():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    if data.get('jefe_especialidad') == 'NA':
        data['jefe_especialidad'] = None

    specialty_data = {
        'id_especialidad': data.get('id_especialidad'),
        'especialidad': data.get('especialidad'),
        'color_especialidad': data.get('color_especialidad'),
        'jefe_especialidad': data.get('jefe_especialidad')
    }

    Specialty.update(specialty_data)

    return jsonify({'status': 'success', 'message': 'Especialidad actualizada correctamente'}), 200

@app.route('/admin/specialty-management/add', methods=['POST'])
def specialty_management_add():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    if data.get('jefe_especialidad') == 'NA':
        data['jefe_especialidad'] = None

    specialty_data = {
        'especialidad': data.get('especialidad'),
        'color_especialidad': data.get('color_especialidad'),
        'jefe_especialidad': data.get('jefe_especialidad')
    }

    Specialty.create(specialty_data)

    return jsonify({'status': 'success', 'message': 'Especialidad creada correctamente'}), 200

@app.route('/admin/meeting-type-management')
def meeting_type_management():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    meeting_types = MeetingType.select_all()

    return jsonify({
        'meeting_type': meeting_types
    }), 200

@app.route('/admin/meeting-type-management/add', methods=['POST'])
def meeting_type_management_add():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    meeting_type_data = {
        'descripcion_tipo_reunion': data.get('descripcion_tipo_reunion')
    }

    MeetingType.create(meeting_type_data)

    return jsonify({'status': 'success', 'message': 'Tipo de reunión creado correctamente'}), 200

@app.route('/admin/meeting-type-management/update', methods=['PATCH'])
def meeting_type_management_update():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    meeting_type_data = {
        'id_tipo_reunion': data.get('id_tipo_reunion'),
        'descripcion_tipo_reunion': data.get('descripcion_tipo_reunion')
    }

    MeetingType.update(meeting_type_data)

    return jsonify({'status': 'success', 'message': 'Tipo de reunión actualizado correctamente'}), 200

@app.route('/admin/task-type-management')
def task_type_management():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    task_types = TaskType.select_all()

    return jsonify({
        'taskType': task_types
    }), 200

@app.route('/admin/task-type-management/add', methods=['POST'])
def task_type_management_add():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    task_type_data = {
        'tipo_tarea': data.get('tipo_tarea')
    }

    TaskType.create(task_type_data)

    return jsonify({'status': 'success', 'message': 'Tipo de tarea creado correctamente'}), 200

@app.route('/admin/task-type-management/update', methods=['PATCH'])
def task_type_management_update():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    task_type_data = {
        'id_tipo_tarea': data.get('id_tipo_tarea'),
        'tipo_tarea': data.get('tipo_tarea')
    }

    TaskType.update(task_type_data)

    return jsonify({'status': 'success', 'message': 'Tipo de tarea actualizado correctamente'}), 200