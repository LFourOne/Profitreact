from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Position:
    def __init__(self, data):
        self.id_cargo = data.get('id_cargo')
        self.cargo = data.get('cargo')

    @classmethod
    def select_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM cargos;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO cargos (cargo) 
                VALUES (%(cargo)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE cargos 
                SET cargo = %(cargo)s
                WHERE id_cargo = %(id_cargo)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)