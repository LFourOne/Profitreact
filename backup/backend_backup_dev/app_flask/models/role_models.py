from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Role:
    def __init__(self, data):
        self.id_rol = data.get('id_rol')
        self.rol = data.get('rol')

    @classmethod
    def get_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM roles
                ORDER BY id_rol ASC;
                """
        return connectToMySQL(DATA_BASE).query_db(query)