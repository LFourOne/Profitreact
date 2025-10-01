from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Attendant:
    def __init__(self, data):
        self.id_asistente = data.get('id_asistente')
        self.id_reunion = data.get('id_reunion')
        self.rut_asistente = data.get('rut_asistente')

    @classmethod
    def create_attendant(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO asistentes_reuniones(id_reunion, rut_asistente)
                VALUES(%(id_reunion)s, %(rut_asistente)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_attendants_by_meeting(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT maestro_personal.rut_personal, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m FROM asistentes_reuniones
                JOIN maestro_personal ON asistentes_reuniones.rut_asistente = maestro_personal.rut_personal 
                WHERE id_reunion = %(id_reunion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
