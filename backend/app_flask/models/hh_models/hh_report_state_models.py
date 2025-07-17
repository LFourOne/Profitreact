from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class HH_Report_State:
    def __init__(self, data):
        self.id_estado_registro_hh = data.get('id_estado_registro_hh')
        self.id_estado = data.get('estado')
    
    @classmethod
    def select(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT id_estado FROM estado_registro_hh;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE estado_registro_hh 
                SET id_estado = %(id_estado)s 
                WHERE id_estado_registro_hh = 1;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)