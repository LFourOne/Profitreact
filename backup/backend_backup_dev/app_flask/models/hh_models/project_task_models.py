from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class ProjectTask:
    def __init__(self, data):
        self.id_proyecto_tarea = data.get('id_proyecto_tarea')
        self.id_proyecto = data.get('id_proyecto')
        self.id_informe = data.get('id_informe')
        self.id_tarea = data.get('id_tarea')
        self.alias_tarea = data.get('alias_tarea')
        self.id_estado = data.get('id_estado')
        self.creado_en = data.get('creado_en')

    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO proyecto_tarea (id_proyecto, id_informe, id_tarea, alias_tarea, id_estado)
                VALUES (%(id_proyecto)s, %(id_informe)s, %(id_tarea)s, %(alias_tarea)s, %(id_estado)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def get_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT proyecto_tarea.*, tareas.nombre AS nombre_tarea, tareas.nivel_1, tareas.nivel_2, tareas.nivel_3, informes.nombre AS nombre_informe FROM proyecto_tarea
                JOIN tareas ON proyecto_tarea.id_tarea = tareas.id_tarea
                JOIN informes ON proyecto_tarea.id_informe = informes.id_informe
                ORDER BY proyecto_tarea.id_informe ASC, tareas.nivel_1 ASC;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def get_all_by_project(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM proyecto_tarea
                WHERE id_proyecto = %(id_proyecto)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)