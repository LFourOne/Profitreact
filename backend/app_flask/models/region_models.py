from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Regions:
    def __init__(self, data):
        self.id_region = data.get('id_region')
        self.nombre = data.get('nombre')

    @classmethod
    def select_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM regiones;
                """
        return connectToMySQL(DATA_BASE).query_db(query)