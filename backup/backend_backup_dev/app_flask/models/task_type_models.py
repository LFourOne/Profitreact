from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class TaskType:
    def __init__(self, data):
        self.id_tipo_tarea = data.get('id_tipo_tarea')
        self.tipo_tarea = data.get('tipo_tarea')

    @classmethod
    def select_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM tipo_tarea
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO tipo_tarea (tipo_tarea)
                VALUES (%(tipo_tarea)s)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE tipo_tarea SET tipo_tarea = %(tipo_tarea)s
                WHERE id_tipo_tarea = %(id_tipo_tarea)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)