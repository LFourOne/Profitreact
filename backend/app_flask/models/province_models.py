from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Province:
    def __init__(self, data):
        self.id_provincia = data.get('id_provincia')
        self.provincia = data.get('provincia')
        self.id_region = data.get('id_region')
    
    @classmethod
    def select_by_region(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM provincias
                WHERE id_region = %(id_region)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)