from app_flask.config.mysqlconnections import connectToMySQL
from flask import flash
from app_flask import DATA_BASE

class Staff:
    def __init__(self, data):
        self.rut_personal = data.get('rut_personal')
        self.digito_verificador = data.get('digito_verificador')
        self.nombres = data.get('nombres')
        self.apellido_p = data.get('apellido_p')
        self.apellido_m = data.get('apellido_m')
        self.iniciales_nombre = data.get('iniciales_nombre')
        self.cargo = data.get('cargo')
        self.profesion = data.get('profesion')
        self.mail = data.get('mail')
        self.telefono = data.get('telefono')
        self.fecha_nacimiento = data.get('fecha_nacimiento')
        self.fecha_contratacion = data.get('fecha_contratacion')
        self.estado = data.get('estado')
        self.jefe_especialidad = data.get('jefe_especialidad')
        self.reporta_hh = data.get('reporta_hh') 

    @classmethod
    def obtain_name_and_last_name(cls):
        query = """
                SELECT rut_personal, nombres, apellido_p, apellido_m, iniciales_nombre FROM maestro_personal
                WHERE estado = 1;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def obtain_staff_rut(cls, data):
        query = """
                SELECT rut_personal FROM maestro_personal
                WHERE iniciales_nombre = %(iniciales_nombre)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def obtain_all_with_rut(cls, data):
        query = """
                SELECT nombres, apellido_p, apellido_m, id_especialidad, iniciales_nombre FROM maestro_personal
                WHERE rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def obtain_boss(cls, data):
        query = """
                SELECT jefe_especialidad FROM especialidades
                WHERE id_especialidad = %(id_especialidad)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)