from app_flask.config.mysqlconnections import connectToMySQL
from app_flask import DATA_BASE

class Meeting:
    def __init__(self, data):
        self.id_reunion = data.get('id_reunion')
        self.id_proyecto = data.get('id_proyecto')
        self.id_tipo_reunion = data.get('id_tipo_reunion')
        self.correlativo = data.get('correlativo')
        self.fecha = data.get('fecha')
        self.hora_inicio = data.get('hora_inicio')
        self.hora_termino = data.get('hora_termino')
        self.estado = data.get('estado')
    
    @classmethod
    def create_meeting(cls, data):
        query = """
                INSERT INTO reunion(id_proyecto, id_tipo_reunion, fecha, hora_inicio, estado)
                VALUES(%(id_proyecto)s, %(id_tipo_reunion)s, %(fecha)s, %(hora_inicio)s, 0)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def delete_meeting(cls, data):
        query = """
                UPDATE reunion SET estado = 1
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_meeting_type(cls):
        query = """
                SELECT * FROM tipo_reunion
                """
        return connectToMySQL(DATA_BASE).query_db(query)

    @classmethod
    def select_all(cls, data):
        query = """
                SELECT id_proyecto, id_tipo_reunion, hora_termino FROM reunion
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_all_meetings(cls):
        query = """
                SELECT * FROM reunion
                JOIN tipo_reunion ON reunion.id_tipo_reunion = tipo_reunion.id_tipo_reunion
                WHERE reunion.estado = 0
                ORDER BY reunion.fecha DESC, reunion.hora_inicio DESC;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def close_meeting(cls, data):
        query = """
                UPDATE reunion SET hora_termino = %(hora_termino)s
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_id_proyecto(cls, data):
        query = """
                SELECT id_proyecto FROM reunion
                WHERE id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    