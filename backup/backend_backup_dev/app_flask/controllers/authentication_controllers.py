from app_flask import app
from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from app_flask.models.user_models import User
from app_flask.models.specialty_models import Specialty

bcrypt = Bcrypt(app)

@app.route('/')
def company_select():
    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/company/process', methods=['POST'])
def company_process():
    
    data = request.get_json()

    company_id = data

    if company_id is None:
        return jsonify({'status': 'error', 'message': 'error'}), 400
    
    if company_id == 1:
        session['data_base'] = 'profit2'
    elif company_id == 2:
        session['data_base'] = 'profit2_sistemas'
    else:
        return jsonify({'status': 'error', 'message': 'error'}), 400
    
    return jsonify({'status': 'success', 'message': 'success'}), 200


@app.route('/login')
def login():

    if 'data_base' not in session:
        return jsonify({'status': 'error', 'message': 'error'}), 401

    data_base = session['data_base']

    if data_base == None:
        return jsonify({'status': 'error', 'message': 'error'}), 401
    
    if data_base == 'profit2':
        data_base = 1
    elif data_base == 'profit2_sistemas':
        data_base = 2

    return jsonify({
        'company': data_base
    }), 200

@app.route('/login/process', methods=['POST'])
def login_process():

    # Obtenemos el usuario que intenta logearse
    user_login = User.obtain_one(request.form)

    data_base = session.get('data_base')

    # Si no se encuentra el usuario, retornamos un error
    if user_login == None:
        return jsonify({'status': 'error', 'message': 'error'}), 401
    
    # Si la contraseña no coincide, retornamos un error
    if not bcrypt.check_password_hash(user_login.contraseña, request.form['password']):
        return jsonify({'status': 'error', 'message': 'error'}), 401
    
    # Si el usuario no está activo, retornamos un error
    if user_login.estado == 0:
        return jsonify({'status': 'error', 'message': 'error'}), 401

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
    session['id_rol'] = user_login.id_rol
    session['color'] = user_login.color
    session['data_base'] = data_base
    session.permanent = True

    # Retornamos un mensaje de éxito
    return jsonify({'status': 'success', 'message': 'success'}), 200

@app.route('/logout', methods=['POST'])
def logout():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    session.clear()
    
    return jsonify({'status': 'success', 'message': 'success'}), 200 