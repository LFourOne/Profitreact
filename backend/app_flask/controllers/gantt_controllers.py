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
from datetime import datetime
import calendar

@app.route('/gantt')
def gantt():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    projects = Project.get_gantt_projects()

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
                'iniciales_nombre' : person['iniciales_nombre'],
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

    company = session['data_base']
    
    if company == 'profit2':
        company = 1
    elif company == 'profit2_sistemas':
        company = 2

    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_rol' : session['id_rol'],
        'color' : session['color'],
        'company': company
    }

    return jsonify({
            'projects': project_list,
            'staff': staff_list,
            'specialty': specialty_list,
            'planification': [],
            'session': response_data,
            'delivery': [],
            'report': [],
            'version': [],
            'delivery_type': [],
            'ot': []
         }
    )

# Función Fetch para obtener las planificaciones filtradas por especialidad y fecha
@app.route('/gantt/api/get-specialty-date', methods=['GET'])
def get_specialty_by_date():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    specialty_id = request.args.get('specialty_id')
    date = request.args.get('date')

    date_object = datetime.strptime(date, '%Y-%m-%d')
    year = date_object.year
    month = date_object.month

    # Obtener el primer día del mes
    first_day_of_month = datetime(year, month, 1)
    # Obtener el último día del mes
    last_day_of_month = datetime(year, month, calendar.monthrange(year, month)[1])
    # Convertir las fechas a formato de cadena
    first_day_str = first_day_of_month.strftime('%Y-%m-%d')
    last_day_str = last_day_of_month.strftime('%Y-%m-%d')

    # Filtrar las planificaciones por especialidad y rango de fechas
    data = {
        'id_especialidad': specialty_id,
        'fecha_inicio': first_day_str,
        'fecha_fin': last_day_str
    }

    base_planification = Planning.select_planning(data)

    if not base_planification:
        return jsonify({
            'planification': []
        })

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

    return jsonify({
        'planification': consolidated_planification,
    })

# Función Fetch para obtener las entregas filtradas por fecha
@app.route('/gantt/api/get-delivery-date', methods=['GET'])
def get_delivery_by_date():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    date = request.args.get('date')

    date_object = datetime.strptime(date, '%Y-%m-%d')
    year = date_object.year
    month = date_object.month

    # Obtener el primer día del mes
    first_day_of_month = datetime(year, month, 1)
    # Obtener el último día del mes
    last_day_of_month = datetime(year, month, calendar.monthrange(year, month)[1])
    # Convertir las fechas a formato de cadena
    first_day_str = first_day_of_month.strftime('%Y-%m-%d')
    last_day_str = last_day_of_month.strftime('%Y-%m-%d')

    # Filtrar las planificaciones por especialidad y rango de fechas
    data = {
        'fecha_inicio': first_day_str,
        'fecha_fin': last_day_str
    }

    reports = Report.select_reports()

    versions = Version.select_versions()

    ots = Ot.select_ot()

    delivery_type = Delivery_Type.select_delivery_type()

    base_delivery = Delivery.select_delivery(data)

    if not base_delivery:
        return jsonify({
            'delivery': []
        })

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
                'comentarios': delivery['comentarios'],
                'id_ot': delivery['id_ot'],
                'fecha': delivery['fecha'].strftime('%Y-%m-%d'),
                'estado': delivery['estado'],
                'ot': []
            }
            grouped_delivery[delivery_id]['ot'] = grouped_ots
    
    consolidated_delivery = list(grouped_delivery.values())

    print("Consolidated Delivery:", consolidated_delivery)

    return jsonify({
        'delivery': consolidated_delivery,
        'report': reports,
        'version': versions,
        'delivery_type': delivery_type,
        'ot': ots
    })

@app.route('/gantt/planification/process', methods=['POST'])
def planification():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    data = request.get_json()

    print("Received Data:", data)

    data_searching_planning = {
        'id_proyecto' : data['id_proyecto'],
        'fecha' : data['fecha']
    }

    existing_planning = Planning.select_planning_id(data_searching_planning)

    print("Existing Planning:", existing_planning)

    if existing_planning:
        
        assigned = Assigned.select_assigned_by_planitication_and_rut({'id_planificacion': existing_planning[0]['id_planificacion'], 'rut_personal': data['selectedStaff']['rut_personal']})

        if assigned:
            Assigned.remove_assigned({'id_planificacion': existing_planning[0]['id_planificacion'], 'rut_personal': data['selectedStaff']['rut_personal']})
            assigned_exists = Assigned.select_assigned_by_planification({'id_planificacion': existing_planning[0]['id_planificacion']})
            if not assigned_exists:
                Planning.delete_planning({'id_planificacion': existing_planning[0]['id_planificacion']})
        else:
            assigned_data = {
                'id_planificacion' : existing_planning[0]['id_planificacion'],
                'rut_personal' : data['selectedStaff']['rut_personal'],
                'id_especialidad' : data['selectedStaff']['id_especialidad']
            }

            Assigned.insert_assigned(assigned_data)

    else:

        planning_data = {
            'id_proyecto' : data['id_proyecto'],
            'fecha' : data['fecha'],
            'id_especialidad' : data['selectedStaff']['id_especialidad']
        }
    
        planning_id = Planning.insert_planning(planning_data)

        assigned_data = {
            'id_planificacion' : planning_id,
            'rut_personal' : data['selectedStaff']['rut_personal'],
            'id_especialidad' : data['selectedStaff']['id_especialidad']
        }

        Assigned.insert_assigned(assigned_data)

    return jsonify({
        'message': 'success',
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

    company = session['data_base']
    
    if company == 'profit2':
        company = 1
    elif company == 'profit2_sistemas':
        company = 2

    response_data = {
        'rut_personal': session['rut_personal'],
        'nombres': session['nombres'],
        'apellido_p': session['apellido_p'],
        'apellido_m': session['apellido_m'],
        'email': session['email'],
        'id_especialidad': session['id_especialidad'],
        'id_rol' : session['id_rol'],
        'company': company
    }

    return jsonify(
        {
            'projects': project_list,
            'session': response_data,
        }
    )

@app.route('/gantt/delivery/api/get-delivery', methods=['GET'])
def delivery_get_delivery_by_date():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3, 4, 5]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

    date = request.args.get('date')

    date_object = datetime.strptime(date, '%Y-%m-%d')
    year = date_object.year
    month = date_object.month

    # Obtener el primer día del mes
    first_day_of_month = datetime(year, month, 1)
    # Obtener el último día del mes
    last_day_of_month = datetime(year, month, calendar.monthrange(year, month)[1])
    # Convertir las fechas a formato de cadena
    first_day_str = first_day_of_month.strftime('%Y-%m-%d')
    last_day_str = last_day_of_month.strftime('%Y-%m-%d')

    # Filtrar las planificaciones por especialidad y rango de fechas
    data = {
        'fecha_inicio': first_day_str,
        'fecha_fin': last_day_str
    }

    reports = Report.select_reports()

    versions = Version.select_versions()

    ots = Ot.select_ot()

    specialty = Specialty.get_specialities()

    delivery_type = Delivery_Type.select_delivery_type()

    base_delivery = Delivery.select_delivery(data)

    if not base_delivery:
        return jsonify({
            'planification': [],
            'report': reports,
            'version': versions,
            'specialty': specialty,
            'delivery_type': delivery_type,
            'ot': ots
        })

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
                'comentarios': delivery['comentarios'],
                'id_ot': delivery['id_ot'],
                'fecha': delivery['fecha'].strftime('%Y-%m-%d'),
                'estado': delivery['estado'],
                'ot': []
            }
            grouped_delivery[delivery_id]['ot'] = grouped_ots
    
    consolidated_delivery = list(grouped_delivery.values())

    return jsonify({
        'planification': consolidated_delivery,
        'report': reports,
        'version': versions,
        'specialty': specialty,
        'delivery_type': delivery_type,
        'ot': ots
    })

@app.route('/gantt/delivery/insert', methods=['POST'])
def insert_delivery():

    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

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

    
    return jsonify(
        {
            'message': 'success',
        }
    )

@app.route('/gantt/delivery/editar', methods=['PATCH'])
def edit_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3, 4, 5]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

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

    # Hacemos un update de la fecha de la entrega

    date_data = {
        'id_entrega': delivery_id,
        'fecha': data.get('newData', {}).get('fecha')
    }
    Delivery.update_delivery_date(date_data)

    return jsonify({
        'message': 'success'
    })

@app.route('/gantt/delivery/eliminar', methods=['DELETE'])
def delete_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401

    if session['id_rol'] not in [1, 2, 3, 4, 5]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

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

@app.route('/gantt/delivery/completar', methods=['PATCH'])
def complete_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3, 4, 5]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403
    
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

@app.route('/gantt/delivery/customize', methods=['PATCH'])
def customize_delivery():
    
    if 'rut_personal' not in session:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 401
    
    if session['id_rol'] not in [1, 2, 3]:
        return jsonify({'status': 'error', 'message': 'Usuario no autorizado'}), 403

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