from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Task:
    def __init__(self, data):
        self.id_tarea = data.get('id_tarea')
        self.nivel_1 = data.get('nivel_1')
        self.nivel_2 = data.get('nivel_2')
        self.nivel_3 = data.get('nivel_3')
        self.nombre = data.get('nombre')
        self.id_tipo_tarea = data.get('id_tipo_tarea')
        self.creado_en = data.get('creado_en')

    @classmethod
    def get_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT tareas.*, tipo_tarea.tipo_tarea FROM tareas
                JOIN tipo_tarea ON tareas.id_tipo_tarea = tipo_tarea.id_tipo_tarea
                ORDER BY nivel_1 ASC, nivel_2 ASC, nivel_3 ASC;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def create_task(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO tareas (nivel_1, nivel_2, nivel_3, nombre, id_tipo_tarea)
                VALUES (%(nivel_1)s, %(nivel_2)s, %(nivel_3)s, %(nombre)s, %(id_tipo_tarea)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def edit_task(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE tareas
                SET nivel_1 = %(nivel_1)s, nivel_2 = %(nivel_2)s, nivel_3 = %(nivel_3)s, nombre = %(nombre)s, id_tipo_tarea = %(id_tipo_tarea)s
                WHERE id_tarea = %(id_tarea)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def delete_task(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM tareas
                WHERE id_tarea = %(id_tarea)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)