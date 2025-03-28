from app_flask.config.mysqlconnections import connectToMySQL
from app_flask import DATA_BASE

class Report:
    def __init__(self, data):
        self.id_informe = data.get('id_informe')
        self.nombre = data.get('nombre')

    @classmethod
    def select_reports(cls):
        query = """
                SELECT * FROM informes
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
class Version:
    def __init__(self, data):
        self.id_version= data.get('id_version')
        self.version = data.get('version')

    @classmethod
    def select_versions(cls):
        query = """
                SELECT * FROM informes_versiones
                """
        return connectToMySQL(DATA_BASE).query_db(query)