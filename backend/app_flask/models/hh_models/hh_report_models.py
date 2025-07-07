from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class HH_Report:
    def __init__(self, data):
        self.id_registro_hh = data.get('id_registro_hh')
        self.id_proyecto = data.get('id_proyecto')
        self.id_informe = data.get('id_informe')
        self.id_tarea = data.get('id_tarea')
        self.inicio = data.get('inicio')
        self.fin = data.get('fin')
        self.rut_personal = data.get('rut_personal')
        self.id_especialidad = data.get('id_especialidad')
        self.fecha = data.get('fecha')
        self.horas = data.get('horas')

    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO registro_hh (id_proyecto, id_informe, id_tarea, inicio, fin, rut_personal, id_especialidad, fecha, horas)
                VALUES (%(id_proyecto)s, %(id_informe)s, %(id_tarea)s, %(inicio)s, %(fin)s, %(rut_personal)s, %(id_especialidad)s, %(fecha)s, %(horas)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_all(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM registro_hh
                WHERE fecha = %(fecha)s AND rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)