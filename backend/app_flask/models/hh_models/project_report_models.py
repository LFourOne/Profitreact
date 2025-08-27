from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class ProjectReport:
    def __init__(self, data):
        self.id_proyecto_informe = data.get('id_proyecto_informe')
        self.id_proyecto = data.get('id_proyecto')
        self.id_informe = data.get('id_informe')
        self.id_version = data.get('id_version')

    @classmethod
    def get_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT proyecto_informe.*, informes.nombre FROM proyecto_informe
                JOIN informes ON proyecto_informe.id_informe = informes.id_informe
                """
        return connectToMySQL(DATA_BASE).query_db(query)

    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO proyecto_informe (id_proyecto, id_informe, id_version)
                VALUES (%(id_proyecto)s, %(id_informe)s, %(id_version)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_max_current_report_version(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT MAX(id_version) FROM proyecto_informe
                WHERE id_proyecto = %(id_proyecto)s AND id_informe = %(id_informe)s;
                """
        result = connectToMySQL(DATA_BASE).query_db(query, data)
        return result[0]['MAX(id_version)'] if result else None
    
    @classmethod
    def select_reports_by_project(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT proyecto_informe.id_proyecto, proyecto_informe.id_informe, MAX(proyecto_informe.id_version) AS id_version, informes.nombre FROM proyecto_informe
                JOIN informes ON proyecto_informe.id_informe = informes.id_informe
                WHERE proyecto_informe.id_proyecto = %(id_proyecto)s
                GROUP BY proyecto_informe.id_informe;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_report_by_project_and_report(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM proyecto_informe
                WHERE id_proyecto = %(id_proyecto)s AND id_informe = %(id_informe)s
                ORDER BY id_version DESC;
                """
        result = connectToMySQL(DATA_BASE).query_db(query, data)
        return bool(result)