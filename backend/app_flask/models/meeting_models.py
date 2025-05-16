from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Meeting:
    def __init__(self, data):
        self.id_reunion = data.get('id_reunion')
        self.id_proyecto = data.get('id_proyecto')
        self.id_tipo_reunion = data.get('id_tipo_reunion')
        self.correlativo = data.get('correlativo')
        self.fecha = data.get('fecha')
        self.hora_inicio = data.get('hora_inicio')
        self.hora_termino = data.get('hora_termino')
        self.id_estado = data.get('id_estado')
    
    @classmethod
    def create_meeting(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO reuniones(id_proyecto, id_tipo_reunion, fecha, hora_inicio, id_estado)
                VALUES(%(id_proyecto)s, %(id_tipo_reunion)s, %(fecha)s, %(hora_inicio)s, 1)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def delete_meeting(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE reuniones SET id_estado = 3
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_meeting_type(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM tipo_reunion
                """
        return connectToMySQL(DATA_BASE).query_db(query)

    @classmethod
    def select_all(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT reuniones.id_proyecto, reuniones.id_tipo_reunion, reuniones.id_estado, tipo_reunion.descripcion_tipo_reunion FROM reuniones
                JOIN tipo_reunion ON reuniones.id_tipo_reunion = tipo_reunion.id_tipo_reunion
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_all_meetings(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM reuniones
                JOIN tipo_reunion ON reuniones.id_tipo_reunion = tipo_reunion.id_tipo_reunion
                WHERE reuniones.id_estado != 3
                ORDER BY reuniones.fecha DESC, reuniones.hora_inicio DESC;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def close_meeting(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE reuniones SET hora_termino = %(hora_termino)s, id_estado = 2
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_id_proyecto(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT id_proyecto FROM reuniones
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    