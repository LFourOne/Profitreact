from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Commune:
    def __init__(self, data):
        self.id_comuna = data.get('id_comuna')
        self.comuna = data.get('comuna')
        self.id_provincia = data.get('id_provincia')
    
    @classmethod
    def select_by_province(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM comunas
                WHERE id_provincia = %(id_provincia)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)