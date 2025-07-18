from app_flask.config.mysqlconnections import connectToMySQL
from flask import flash, session

class Staff:
    def __init__(self, data):
        self.rut_personal = data.get('rut_personal')
        self.digito_verificador = data.get('digito_verificador')
        self.nombres = data.get('nombres')
        self.apellido_p = data.get('apellido_p')
        self.apellido_m = data.get('apellido_m')
        self.iniciales_nombre = data.get('iniciales_nombre')
        self.profesion = data.get('profesion')
        self.email = data.get('email')
        self.telefono = data.get('telefono')
        self.fecha_nacimiento = data.get('fecha_nacimiento')
        self.fecha_contratacion = data.get('fecha_contratacion')
        self.estado = data.get('estado')
        self.color = data.get('color')
        self.id_especialidad = data.get('id_especialidad')
        self.reporta_hh = data.get('reporta_hh') 

    @classmethod
    def obtain_name_and_last_name(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT rut_personal, nombres, apellido_p, apellido_m, iniciales_nombre FROM maestro_personal
                WHERE estado = 1;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def obtain_staff_rut(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT rut_personal FROM maestro_personal
                WHERE iniciales_nombre = %(iniciales_nombre)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def obtain_all_with_rut(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT nombres, apellido_p, apellido_m, id_especialidad, iniciales_nombre FROM maestro_personal
                WHERE rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def obtain_boss(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT jefe_especialidad FROM especialidades
                WHERE id_especialidad = %(id_especialidad)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def obtain_team(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT maestro_personal.rut_personal, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, maestro_personal.iniciales_nombre, maestro_personal.id_especialidad, especialidades.especialidad FROM maestro_personal
                JOIN especialidades ON maestro_personal.id_especialidad = especialidades.id_especialidad
                WHERE maestro_personal.id_especialidad = %(id_especialidad)s AND maestro_personal.estado = 1
                ORDER BY maestro_personal.apellido_p DESC;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def get_profile(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT maestro_personal.rut_personal, maestro_personal.usuario, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, maestro_personal.iniciales_nombre, maestro_personal.email, maestro_personal.fecha_nacimiento, maestro_personal.fecha_contratacion, maestro_personal.estado, maestro_personal.color, especialidades.especialidad, roles.rol FROM maestro_personal
                JOIN especialidades ON maestro_personal.id_especialidad = especialidades.id_especialidad
                JOIN roles ON maestro_personal.id_rol = roles.id_rol
                WHERE maestro_personal.rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    # Los siguientes classmethod se usan para la Gantt

    @classmethod
    def get_staff(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT rut_personal, nombres, apellido_p, apellido_m, id_especialidad, color FROM maestro_personal
                WHERE estado = 1
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def get_specialty_staff_by_rut(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT id_especialidad FROM maestro_personal
                WHERE rut_personal = %(rut_personal)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_color_by_rut(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT color FROM maestro_personal
                WHERE rut_personal = %(rut_personal)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_color_by_rut(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE maestro_personal SET color = %(color)s
                WHERE rut_personal = %(rut_personal)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)