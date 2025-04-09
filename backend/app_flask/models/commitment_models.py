from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Commitment:
    def __init__(self, data):
        self.id_compromiso = data.get('id_compromiso')
        self.id_reunion = data.get('id_reunion')
        self.id_proyecto = data.get('id_proyecto')
        self.texto_compromiso = data.get('texto_compromiso')
        self.fecha_comprometida = data.get('fecha_comprometida')
        self.fecha_cumplimiento = data.get('fecha_cumplimiento')
        self.responsable = data.get('responsable')
        self.id_estado_compromiso = data.get('id_estado_compromiso')
        self.modificado_en = data.get('modificado_en')

    @classmethod
    def create_commitment(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO compromiso(id_reunion, id_proyecto, texto_compromiso, fecha_comprometida, responsable, prioridad, id_estado_compromiso)
                VALUES(%(id_reunion)s, %(id_proyecto)s, %(texto_compromiso)s, %(fecha_comprometida)s, %(responsable)s, %(prioridad)s, %(id_estado_compromiso)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_all(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM compromiso WHERE id_reunion = %(id_reunion)s
                ORDER BY prioridad DESC, fecha_comprometida ASC;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def complete_commitment(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE compromiso
                SET id_estado_compromiso = 2, fecha_cumplimiento = %(fecha_cumplimiento)s
                WHERE id_compromiso = %(id_compromiso)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def delete_commitment(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE compromiso
                SET id_estado_compromiso = 3
                WHERE id_compromiso = %(id_compromiso)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_one_commitment(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM compromiso
                WHERE id_compromiso = %(id_compromiso)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_commitment(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE compromiso
                SET texto_compromiso = %(texto_compromiso)s, fecha_comprometida = %(fecha_comprometida)s, responsable = %(responsable)s, prioridad = %(prioridad)s
                WHERE id_compromiso = %(id_compromiso)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_commitment_by_meeting_type(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE compromiso
                SET texto_compromiso = %(texto_compromiso)s, id_proyecto = %(id_proyecto)s, fecha_comprometida = %(fecha_comprometida)s, responsable = %(responsable)s, prioridad = %(prioridad)s
                WHERE id_compromiso = %(id_compromiso)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_all_and_previous(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT compromiso.*, reunion.id_tipo_reunion FROM compromiso 
                JOIN reunion ON compromiso.id_reunion = reunion.id_reunion
                WHERE reunion.id_tipo_reunion = %(id_tipo_reunion)s
                ORDER BY compromiso.id_proyecto DESC, compromiso.prioridad DESC, compromiso.fecha_comprometida DESC;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)