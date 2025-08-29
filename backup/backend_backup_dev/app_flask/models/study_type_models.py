from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Study_type:
    def __init__(self, data):
        self.id_tipo_estudio = data.get('id_tipo_estudio')
        self.descripcion_tipo_estudio = data.get('descripcion_tipo_estudio')

    @classmethod
    def select_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM tipos_estudio
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE tipos_estudio SET descripcion_tipo_estudio = %(descripcion_tipo_estudio)s
                WHERE id_tipo_estudio = %(id_tipo_estudio)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO tipos_estudio (descripcion_tipo_estudio)
                VALUES (%(descripcion_tipo_estudio)s)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)