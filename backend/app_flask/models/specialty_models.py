from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Specialty:
    def __init__(self, data):
        self.id_especialidad = data.get('id_especialidad')
        self.especialidad = data.get('especialidad')
        self.jefe_especialidad = data.get('jefe_especialidad')
        self.color_especialidad = data.get('color_especialidad')

    @classmethod
    def get_specialities(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT especialidades.id_especialidad, especialidades.especialidad, especialidades.color_especialidad, especialidades.jefe_especialidad, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m FROM especialidades
                LEFT JOIN maestro_personal ON especialidades.jefe_especialidad = maestro_personal.rut_personal
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def get_specialty_bosses(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT jefe_especialidad FROM especialidades
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def select_specialty_color_by_id(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT color_especialidad FROM especialidades
                WHERE id_especialidad = %(id_especialidad)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def update_specialty_color_by_id(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE especialidades SET color_especialidad = %(color_especialidad)s
                WHERE id_especialidad = %(id_especialidad)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO especialidades (especialidad, jefe_especialidad, color_especialidad) 
                VALUES (%(especialidad)s, %(jefe_especialidad)s, %(color_especialidad)s)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE especialidades SET especialidad = %(especialidad)s, jefe_especialidad = %(jefe_especialidad)s, color_especialidad = %(color_especialidad)s
                WHERE id_especialidad = %(id_especialidad)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)