from app_flask import app
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from app_flask.models.user_models import User
from app_flask.models.specialty_models import Specialty
from app_flask.models.role_models import Role
from app_flask.models.hh_models.task_type_models import TaskType
from app_flask.models.hh_models.task_models import Task

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

    return jsonify({
        'status': 'success',
        'message': 'success'
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