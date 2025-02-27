from app_flask.config.mysqlconnections import connectToMySQL
from app_flask import DATA_BASE

class Agreements:
    def __init__(self, data):
        self.id_acuerdo = data.get('id_acuerdo')
        self.id_reunion = data.get('id_reunion')
        self.texto_acuerdo = data.get('texto_acuerdo')
        self.creado_en = data.get('creado_en')

    @classmethod
    def create_agreements(cls, data):
        query = """
                INSERT INTO acuerdos(id_reunion, texto_acuerdo)
                VALUES(%(id_reunion)s, %(texto_acuerdo)s)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_agreements(cls, data):
        query = """
                SELECT acuerdos.*, reunion.id_proyecto FROM acuerdos
                JOIN reunion ON acuerdos.id_reunion = reunion.id_reunion
                WHERE acuerdos.id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
class Topics:
    def __init__(self, data):
        self.id_tema = data.get('id_tema')
        self.id_reunion = data.get('id_reunion')
        self.texto_tema_tratado = data.get('texto_tema_tratado')

    @classmethod
    def create_topics(cls, data):
        query = """
                INSERT INTO temas_tratados(id_reunion, texto_tema_tratado)
                VALUES(%(id_reunion)s, %(texto_tema_tratado)s)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_topics(cls, data):
        query = """
                SELECT temas_tratados.*, reunion.id_proyecto FROM temas_tratados
                JOIN reunion ON temas_tratados.id_reunion = reunion.id_reunion
                WHERE temas_tratados.id_reunion = %(id_reunion)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)