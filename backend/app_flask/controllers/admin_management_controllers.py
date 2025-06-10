from app_flask import app
from flask import Flask, request, jsonify, session
from app_flask.models.user_models import User
from app_flask.models.specialty_models import Specialty
from app_flask.models.role_models import Role

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

@app.route('/admin/user-management/edit/process', methods=['PATCH'])
def edit_user_process():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
    data = request.get_json()

    data = {
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

    User.edit_user(data)
    
    return jsonify({
        'status': 'success',
        'message': 'Usuario actualizado correctamente',
    }), 200