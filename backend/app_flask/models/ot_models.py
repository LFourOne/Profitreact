from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Ot:
    def __init__(self, data):
        self.id_ot = data.get('id_ot')
        self.numero_ot = data.get('numero_ot')

    @classmethod
    def select_ot(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM numero_ot
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
class Ot_Proyecto:
    def __init__(self, data):
        self.id_gantt_ot_proyecto = data.get('id_gantt_ot_proyecto')
        self.id_gantt_entrega = data.get('id_gantt_entrega')
        self.id_numero_ot = data.get('id_numero_ot')
    
    @classmethod
    def insert_ot_proyecto(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO gantt_ot_proyecto (id_gantt_entrega, id_numero_ot)
                VALUES (%(id_gantt_entrega)s, %(id_numero_ot)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_ot_proyecto(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT gantt_ot_proyecto.*, numero_ot.numero_ot FROM gantt_ot_proyecto
                JOIN numero_ot ON gantt_ot_proyecto.id_numero_ot = numero_ot.id_numero_ot
                WHERE gantt_ot_proyecto.id_gantt_entrega = %(id_gantt_entrega)s
                ORDER BY numero_ot.numero_ot ASC
                """
        results = connectToMySQL(DATA_BASE).query_db(query, data)
        
        ot_proyecto = []

        if not results:
            print("No results found or query failed.")
            return []

        for result in results:
            ot_proyecto.append(result)
        
        return ot_proyecto
    
    @classmethod
    def remove_ot_proyecto(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM gantt_ot_proyecto
                WHERE id_numero_ot = %(id_numero_ot)s AND id_gantt_entrega = %(id_gantt_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def remove_all_ot_proyecto(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM gantt_ot_proyecto
                WHERE id_gantt_entrega = %(id_gantt_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)