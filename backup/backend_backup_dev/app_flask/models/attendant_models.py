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