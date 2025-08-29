from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class MeetingType:
    def __init__(self, data):
        self.id_tipo_reunion = data.get('id_tipo_reunion')
        self.descripcion_tipo_reunion = data.get('descripcion_tipo_reunion')

    @classmethod
    def select_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM tipo_reunion
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO tipo_reunion (descripcion_tipo_reunion)
                VALUES (%(descripcion_tipo_reunion)s) 
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE tipo_reunion
                SET descripcion_tipo_reunion = %(descripcion_tipo_reunion)s
                WHERE id_tipo_reunion = %(id_tipo_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)