from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Planning:
    def __init__(self, data):
        self.id_planificacion = data.get('id_planificacion')
        self.id_proyecto = data.get('id_proyecto')
        self.fecha = data.get('fecha')
        self.id_especialidad = data.get('id_especialidad')
    
    @classmethod
    def insert_planning(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO gantt_planificacion (id_proyecto, fecha, id_especialidad)
                VALUES (%(id_proyecto)s, %(fecha)s, %(id_especialidad)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def select_planning(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT gantt_planificacion.*, gantt_asignados.id_planificacion, gantt_asignados.rut_personal, maestro_personal.iniciales_nombre, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, maestro_personal.color, especialidades.especialidad FROM gantt_planificacion
                JOIN gantt_asignados ON gantt_planificacion.id_planificacion = gantt_asignados.id_planificacion
                JOIN maestro_personal ON gantt_asignados.rut_personal = maestro_personal.rut_personal
                JOIN especialidades ON gantt_planificacion.id_especialidad = especialidades.id_especialidad
                WHERE gantt_planificacion.id_especialidad = %(id_especialidad)s
                AND gantt_planificacion.fecha BETWEEN %(fecha_inicio)s AND %(fecha_fin)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def select_planning_id(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT id_planificacion FROM gantt_planificacion 
                WHERE id_proyecto = %(id_proyecto)s AND fecha = %(fecha)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def delete_planning(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM gantt_planificacion
                WHERE id_planificacion = %(id_planificacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_weekly_planning(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT gantt_planificacion.id_planificacion, gantt_planificacion.id_proyecto, gantt_planificacion.fecha, gantt_asignados.rut_personal, gantt_asignados.id_asignado FROM gantt_planificacion
                JOIN gantt_asignados ON gantt_planificacion.id_planificacion = gantt_asignados.id_planificacion
                WHERE gantt_planificacion.fecha BETWEEN %(fecha_inicio)s AND %(fecha_fin)s AND gantt_asignados.rut_personal = %(rut_personal)s
                ORDER BY gantt_planificacion.fecha;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)


class Assigned:
    def __init__(self, data):
        self.id_asignado = data.get('id_asignado')
        self.id_planificacion = data.get('id_planificacion')
        self.rut_personal = data.get('rut_personal')
        self.id_especialidad = data.get('id_especialidad')
    
    @classmethod
    def insert_assigned(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO gantt_asignados (id_planificacion, rut_personal, id_especialidad)
                VALUES (%(id_planificacion)s, %(rut_personal)s, %(id_especialidad)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_assigned_by_planification(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM gantt_asignados
                WHERE id_planificacion = %(id_planificacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def remove_assigned(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM gantt_asignados
                WHERE id_planificacion = %(id_planificacion)s AND rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def remove_assigned_by_planification(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM gantt_asignados
                WHERE id_planificacion = %(id_planificacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)