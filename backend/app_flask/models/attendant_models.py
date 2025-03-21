from app_flask.config.mysqlconnections import connectToMySQL
from flask import flash
from app_flask import DATA_BASE

class Attendant:
    def __init__(self, data):
        self.id_asistente = data.get('id_asistente')
        self.id_reunion = data.get('id_reunion')
        self.rut_personal = data.get('rut_personal')

    @classmethod
    def create_attendant(cls, data):
        query = """
                INSERT INTO asistentes(id_reunion, rut_personal)
                VALUES(%(id_reunion)s, %(rut_personal)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)