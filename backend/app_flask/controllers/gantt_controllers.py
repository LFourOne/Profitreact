from app_flask import app
from flask import Flask, request, jsonify
from flask import session
from app_flask.models.project_models import Project
from app_flask.models.staff_models import Staff
from app_flask.models.specialty_models import Specialty
from app_flask.models.planning_models import Assigned
from app_flask.models.planning_models import Planning
from app_flask.models.delivery_models import Delivery
from app_flask.models.delivery_models import Delivery_Type
from app_flask.models.report_models import Report
from app_flask.models.report_models import Version
from app_flask.models.ot_models import Ot
from app_flask.models.ot_models import Ot_Proyecto

@app.route('/gantt')
def gantt():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    projects = Project.get_projects()

    project_list = []

    for project in projects:
        project_list.append(
            {
                'id_proyecto' : project['id_proyecto'],
                'rut_personal' : project['rut_personal'],
                'nombres' : project['nombres'],
                'apellido_p' : project['apellido_p'],
                'apellido_m' : project['apellido_m'],
            }
        )

    staff = Staff.get_staff()

    staff_list = []

    for person in staff:
        staff_list.append(
            {
                'rut_personal' : person['rut_personal'],
                'nombres' : person['nombres'],
                'apellido_p' : person['apellido_p'],
                'apellido_m' : person['apellido_m'],
                'id_especialidad' : person['id_especialidad'],
                'color' : person['color']
            }
        )

    specialty = Specialty.get_specialities()

    specialty_list = []

    for specialty in specialty:
        specialty_list.append(
            {
                'id_especialidad' : specialty['id_especialidad'],
                'especialidad' : specialty['especialidad'],
                'jefe_especialidad' : specialty['jefe_especialidad'],
                'color_especialidad' : specialty['color_especialidad']
            }
        )

    base_planification = Planning.select_planning()

    grouped_planification = {}
    for plan in base_planification:
        plan_id = plan['id_planificacion']
        if plan_id not in grouped_planification:
            grouped_planification[plan_id] = {
                'id_planificacion': plan_id,
                'id_proyecto': plan['id_proyecto'],
                'fecha': plan['fecha'].strftime('%Y-%m-%d'),
                'id_especialidad': plan['id_especialidad'],
                'especialidad': plan['especialidad'],
                'asignados': []
            }
        grouped_planification[plan_id]['asignados'].append({
            'rut_personal': plan['rut_personal'],
            'iniciales_nombre': plan['iniciales_nombre'],
            'nombres': plan['nombres'],
            'apellido_p': plan['apellido_p'],
            'apellido_m': plan['apellido_m'],
            'color': plan['color']
        })

    consolidated_planification = list(grouped_planification.values())

    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_empresa': session['id_empresa'], 
        'color' : session['color']
    }

    # Todo el código para abajo corresponde al código para renderizar posteriormente la entrega

    reports = Report.select_reports()

    versions = Version.select_versions()

    base_delivery = Delivery.select_delivery()

    ots = Ot.select_ot()

    delivery_type = Delivery_Type.select_delivery_type()

    grouped_delivery = {}

    for delivery in base_delivery:

        delivery_id = delivery['id_entrega']

        grouped_ots = Ot_Proyecto.select_ot_proyecto({'id_gantt_entrega': delivery_id})


        if delivery_id not in grouped_delivery:
            grouped_delivery[delivery_id] = {
                'id_entrega': delivery_id,
                'id_proyecto': delivery['id_proyecto'],
                'id_informe': delivery['id_informe'],
                'id_version': delivery['id_version'],
                'adenda': delivery['adenda'],
                'id_especialidad': delivery['id_especialidad'],
                'especialidad': delivery['especialidad'],
                'color_especialidad': delivery['color_especialidad'],
                'id_empresa': delivery['id_empresa'],
                'comentarios': delivery['comentarios'],
                'id_ot': delivery['id_ot'],
                'fecha': delivery['fecha'].strftime('%Y-%m-%d'),
                'estado': delivery['estado'],
                'ot': []
            }
            grouped_delivery[delivery_id]['ot'] = grouped_ots
    
    consolidated_delivery = list(grouped_delivery.values())

    return jsonify(
        {
            'projects': project_list,
            'staff': staff_list,
            'specialty': specialty_list,
            'planification': consolidated_planification,
            'session': response_data,
            'delivery': consolidated_delivery,
            'report': reports,
            'version': versions,
            'delivery_type': delivery_type,
            'ot': ots
         }
    )

@app.route('/gantt/planificacion', methods=['POST'])
def planification():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    date_parts = data['date'].split('/')
    formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

    planning_data = {
        'id_proyecto' : data['project'],
        'fecha' : formatted_date,
        'rut_personal' : data['staff'],
        'id_especialidad' : data['specialty']
    }
    
    planning_id = Planning.insert_planning(planning_data)

    for staff in data['staff']:

        assigned_data = {
            'id_planificacion' : planning_id,
            'rut_personal' : staff,
            'id_especialidad' : data['specialty']
        }

        Assigned.insert_assigned(assigned_data)

    updated_planification = Planning.select_planning()

    for plan in updated_planification:
        plan['fecha'] = plan['fecha'].strftime('%Y-%m-%d')

    return jsonify({
        'message': 'success',
        'planification': updated_planification
    })

@app.route('/gantt/editar', methods=['POST'])
def edit_planification():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    # Almacenamos los datos entregados desde el front
    data = request.get_json()

    new_staff = data['staff']

    # Formateamos la fecha a Año/Mes/Día
    date_parts = data['date'].split('/')
    formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

    # Asignamos datos a una variable para encontrar la planificación necesaria
    data_to_planification = {
        'id_proyecto': data['project'],
        'fecha': formatted_date
    }

    # Obtenemos el id de la planificación
    planification_id = Planning.select_planning_id(data_to_planification)
    planification_id = planification_id[0]['id_planificacion']
    
    # Obtenemos los asignados actuales de la planificación
    current_assigned = Assigned.select_assigned_by_planification({'id_planificacion': planification_id})
    current_staff_ruts = [str(assigned['rut_personal']) for assigned in current_assigned]

    # Convertimos los ruts de los asignados actuales y nuevos a sets para facilitar las comparaciones

    current_set = set(current_staff_ruts)
    new_set = set(new_staff)

    to_remove_staff = current_set - new_set
    for staff in to_remove_staff:
        Assigned.remove_assigned({'id_planificacion': planification_id, 'rut_personal': staff})

    to_add_staff = new_set - current_set
    for staff in to_add_staff:
        specialty = Staff.get_specialty_staff_by_rut({'rut_personal': staff})
        formatted_specialty = specialty[0]['id_especialidad']
        assigned_data = {
            'id_planificacion': planification_id,
            'rut_personal': staff,
            'id_especialidad': formatted_specialty
        }
        Assigned.insert_assigned(assigned_data)


    return jsonify({
        'message': 'success'
    })

@app.route('/gantt/eliminar', methods=['POST'])
def delete_planification():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    # Almacenamos los datos entregados desde el front
    data = request.get_json()

    # Formateamos la fecha a Año/Mes/Día

    date_parts = data['date'].split('/')
    formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

    # Asignamos datos a una variable para encontrar la planificación necesaria
    data_to_planification = {
        'id_proyecto': data['project'],
        'fecha': formatted_date
    }

    # Obtenemos el id de la planificación
    planification_id = Planning.select_planning_id(data_to_planification)
    planification_id = planification_id[0]['id_planificacion']
    

    # Primero partimos eliminando los asignados de la planificación para no tener problemas con las llaves foráneas

    # Eliminamos todos los asignados de la planificación
    Assigned.remove_assigned_by_planification({'id_planificacion': planification_id})

    # Eliminamos la planificación
    Planning.delete_planning({'id_planificacion': planification_id})

    return jsonify({
        'message': 'success'
    })

@app.route('/gantt/customize', methods=['POST'])
def customize_user():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    data = request.get_json()

    for key, user in data.items():
        color = user['color']
        rut_personal = user['rut_personal']

        current_color = Staff.select_color_by_rut({'rut_personal': rut_personal})

        if current_color[0]['color'] == color:
            pass
        else:
            Staff.update_color_by_rut({'rut_personal': rut_personal, 'color': color})
    
    return jsonify({
        'message': 'success'
    })

# <------------ Para arriba corresponde a la Gantt de Planificación ------------>

# <------------ Para abajo corresponde a la Gantt de Entregas ------------>


@app.route('/gantt/delivery')
def gantt_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    projects = Project.get_projects()

    project_list = []

    for project in projects:
        project_list.append(
            {
                'id_proyecto' : project['id_proyecto'],
                'rut_personal' : project['rut_personal'],
                'nombres' : project['nombres'],
                'apellido_p' : project['apellido_p'],
                'apellido_m' : project['apellido_m'],
                'id_ot' : project['id_ot']
            }
        )

    reports = Report.select_reports()

    versions = Version.select_versions()

    base_delivery = Delivery.select_delivery()

    ots = Ot.select_ot()

    specialty = Specialty.get_specialities()

    delivery_type = Delivery_Type.select_delivery_type()

    grouped_delivery = {}

    for delivery in base_delivery:

        delivery_id = delivery['id_entrega']

        grouped_ots = Ot_Proyecto.select_ot_proyecto({'id_gantt_entrega': delivery_id})


        if delivery_id not in grouped_delivery:
            grouped_delivery[delivery_id] = {
                'id_entrega': delivery_id,
                'id_proyecto': delivery['id_proyecto'],
                'id_informe': delivery['id_informe'],
                'id_version': delivery['id_version'],
                'adenda' : delivery['adenda'],
                'id_especialidad': delivery['id_especialidad'],
                'especialidad': delivery['especialidad'],
                'color_especialidad': delivery['color_especialidad'],
                'id_empresa': delivery['id_empresa'],
                'comentarios': delivery['comentarios'],
                'id_ot': delivery['id_ot'],
                'fecha': delivery['fecha'].strftime('%Y-%m-%d'),
                'estado': delivery['estado'],
                'ot': []
            }
            grouped_delivery[delivery_id]['ot'] = grouped_ots
    
    consolidated_delivery = list(grouped_delivery.values())

    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_empresa': session['id_empresa'] 
    }

    return jsonify(
        {
            'projects': project_list,
            'planification': consolidated_delivery,
            'session': response_data,
            'report': reports,
            'version': versions,
            'specialty': specialty,
            'delivery_type': delivery_type,
            'ot': ots
        }
    )

@app.route('/gantt/delivery/insert', methods=['POST'])
def insert_delivery():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()

    date_parts = data['date'].split('/')
    formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

    if data['adenda'] == True :
        data['adenda'] = 1
    else:
        data['adenda'] = 0

    delivery_data = {
        'id_proyecto': data['project'],
        'id_informe': data['informe'],
        'id_empresa': data['empresa'],
        'id_version': data.get('version'),
        'adenda': data['adenda'],
        'id_especialidad': data['especialidad'],
        'comentarios': data.get('comentarios'),
        'fecha': formatted_date,
        'estado': data['estado']
    }

    id_delivery = Delivery.insert_delivery(delivery_data)

    if data.get('ot'):

        for ot in data['ot']:

            gantt_ot_proyecto_data = {
                'id_gantt_entrega': id_delivery,
                'id_numero_ot': ot['value'],
            }

            Ot_Proyecto.insert_ot_proyecto(gantt_ot_proyecto_data)

    updated_delivery = Delivery.select_delivery()

    for delivery in updated_delivery:
        delivery['fecha'] = delivery['fecha'].strftime('%Y-%m-%d')
    
    return jsonify(
        {
            'planification': updated_delivery
        }
    )


@app.route('/gantt/delivery/editar', methods=['POST'])
def edit_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    # Almacenamos los datos entregados desde el front
    data = request.get_json()

    date_parts = data['newData']['date'].split('/')
    formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

    new_ot = []

    data_to_delivery = {
        'id_proyecto': data['newData']['project'],
        'fecha': formatted_date
    }

    # Obtenemos el id de la entrega
    delivery_id = Delivery.select_delivery_by_project_date(data_to_delivery)
    delivery_id = delivery_id[0]['id_entrega']

    # Obtenemos las OT actuales de la entrega

    current_ots = Ot_Proyecto.select_ot_proyecto({'id_gantt_entrega': delivery_id})
    current_ots = [str(ot['id_numero_ot']) for ot in current_ots if 'id_numero_ot' in ot]

    # Obtenemos las OT nuevas de la entrega

    new_ot = data['newData']['ot']
    new_ot = [str(ot) for ot in new_ot]

    current_ots.sort()
    new_ot.sort()

    current_set = set(current_ots)
    new_set = set(new_ot)

    # Obtenemos las OT a remover de la entrega
    to_remove_ot = current_set - new_set
    for ot in to_remove_ot:
        Ot_Proyecto.remove_ot_proyecto({'id_gantt_entrega': delivery_id, 'id_numero_ot': ot})
    
    # Obtenemos las OT para agregar a la entrega
    to_add_ot = new_set - current_set

    # Agregamos las nuevas OT a la entrega
    for ot in to_add_ot:
        gantt_ot_proyecto_data = {
            'id_gantt_entrega': delivery_id,
            'id_numero_ot': ot
        }
        Ot_Proyecto.insert_ot_proyecto(gantt_ot_proyecto_data)

    # Obtenemos el id_informe de la entrega
    current_report = data['oldData']['id_informe']
    new_report = data['newData']['informe']

    if current_report and new_report != None:
        if current_report != new_report:
            # Actualizamos los informes de la entrega
            Delivery.update_delivery_report({'id_entrega': delivery_id, 'id_informe': new_report})

    # Obtenemos el id_version de la entrega
    current_version = data.get('oldData', {}).get('id_version')
    new_version = data.get('newData', {}).get('version')

    if current_version and new_version != None:
        if current_version != new_version:
            # Actualizamos las versiones de la entrega
            Delivery.update_delivery_version({'id_entrega': delivery_id, 'id_version': new_version})

    # Obtenemos la adenda de la entrega
    current_adenda = data.get('oldData', {}).get('adenda')
    new_adenda = data.get('newData', {}).get('adenda')

    if current_adenda  != new_adenda:
        # Actualizamos la adenda de la entrega
        Delivery.update_delivery_adenda({'id_entrega': delivery_id, 'adenda': new_adenda})

    # Obtenemos la/las especialidades involucradas en la entrega
    current_specialty = data.get('oldData', {}).get('id_especialidad')
    new_specialty = data.get('newData', {}).get('especialidad')

    if current_specialty != new_specialty:
        # Actualizamos la especialidad de la entrega
        Delivery.update_delivery_specialty({'id_entrega': delivery_id, 'id_especialidad': new_specialty})

    # Obtenemos los comentarios de la entrega
    current_comments = data.get('oldData', {}).get('comentarios')
    new_comments = data.get('newData', {}).get('comentarios')
    
    # Convertimos los comentarios a set para compararlos

    if current_comments and new_comments != None:
        current_set = set(current_comments)
        new_set = set(new_comments)

        # Obtenemos los comentarios a actualizar de la entrega
        to_update_comments = new_set - current_set
        if to_update_comments:
            # Actualizamos los comentarios de la entrega
            Delivery.update_delivery_comment({'id_entrega': delivery_id, 'comentarios': new_comments})

    return jsonify({
        'message': 'success'
    })

@app.route('/gantt/delivery/eliminar', methods=['POST'])
def delete_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    # Almacenamos los datos entregados desde el front
    data = request.get_json()

    # Formateamos la fecha a Año/Mes/Día

    date_parts = data['date'].split('/')
    formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

    # Asignamos datos a una variable para encontrar la entrega necesaria
    data_to_delivery = {
        'id_proyecto': data['project'],
        'fecha': formatted_date
    }

    # Obtenemos el id de la entrega
    delivery_id = Delivery.select_delivery_by_project_date(data_to_delivery)
    delivery_id = delivery_id[0]['id_entrega']
    
    # Primero partimos eliminando las OT de la entrega para no tener problemas con las llaves foráneas

    # Eliminamos todas las OT de la entrega
    Ot_Proyecto.remove_all_ot_proyecto({'id_gantt_entrega': delivery_id})

    # Eliminamos la entrega
    Delivery.delete_delivery({'id_entrega': delivery_id})

    return jsonify({
        'message': 'success'
    })

@app.route('/gantt/delivery/completar', methods=['POST'])
def complete_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    specialty_list = Specialty.get_specialty_bosses()

    if not (any(session['rut_personal'] == specialty['jefe_especialidad'] for specialty in specialty_list) or session['rut_personal'] == 21674304):
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    # Almacenamos los datos entregados desde el front
    data = request.get_json()

    # Formateamos la fecha a Año/Mes/Día

    date_parts = data['date'].split('/')
    formatted_date = f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"

    # Asignamos datos a una variable para encontrar la entrega necesaria
    data_to_delivery = {
        'id_proyecto': data['project'],
        'fecha': formatted_date
    }

    # Obtenemos el id de la entrega
    delivery_id = Delivery.select_delivery_by_project_date(data_to_delivery)
    delivery_id = delivery_id[0]['id_entrega']

    # Completamos la entrega
    Delivery.complete_delivery({'id_entrega': delivery_id})

    return jsonify({
        'message': 'success'
    })

@app.route('/gantt/delivery/customize', methods=['POST'])
def customize_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['rut_personal'] != 21674304:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    data = request.get_json()
    
    # Iterar sobre la lista de especialidades
    for specialty in data.get('specialty', []):
        color = specialty['color_especialidad']
        id_especialidad = specialty['id_especialidad']

        # Obtener el color actual de la base de datos
        current_color = Specialty.select_specialty_color_by_id({'id_especialidad': id_especialidad})

        # Actualizar solo si el color es diferente
        if current_color[0]['color_especialidad'] != color:
            Specialty.update_specialty_color_by_id({'id_especialidad': id_especialidad, 'color_especialidad': color})

    # Iterar sobre la lista de delivery types
    for delivery_type in data.get('delivery_type', []):
        color = delivery_type['color_servicio']
        id_gantt_tipo_entrega = delivery_type['id_gantt_tipo_entrega']

        # Obtener el color actual de la base de datos
        current_color = Delivery_Type.select_delivery_type_color_by_id({'id_gantt_tipo_entrega': id_gantt_tipo_entrega})

        # Actualizar solo si el color es diferente
        if current_color[0]['color'] != color:
            Delivery_Type.update_delivery_type_color_by_id({'id_gantt_tipo_entrega': id_gantt_tipo_entrega, 'color': color})

    return jsonify({
        'message': 'success'
    })