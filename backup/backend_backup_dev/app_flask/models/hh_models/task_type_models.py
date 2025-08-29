from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class TaskType:
    def __init__(self, data):
        self.id_tipo_tarea = data.get('id_tipo_tarea')
        self.tipo_tarea = data.get('tipo_tarea')
    
    @classmethod
    def get_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM tipo_tarea
                """
        return connectToMySQL(DATA_BASE).query_db(query)