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
                SELECT registro_hh.*, tareas.nombre, informes.nombre as nombre_informe FROM registro_hh
                JOIN tareas ON registro_hh.id_tarea = tareas.id_tarea
                JOIN informes ON registro_hh.id_informe = informes.id_informe
                WHERE fecha = %(fecha)s AND rut_personal = %(rut_personal)s
                ORDER BY registro_hh.inicio ASC;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_between_hours(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT * FROM registro_hh
                WHERE rut_personal = %(rut_personal)s AND fecha = %(fecha)s AND inicio < %(fin)s AND fin > %(inicio)s
                LIMIT 1;
                """
        results = connectToMySQL(DATA_BASE).query_db(query, data)
        return bool(results)
    
    @classmethod
    def select_weekly(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT fecha, SUM(horas) as total_horas FROM registro_hh
                WHERE fecha BETWEEN %(fecha_inicio)s AND %(fecha_fin)s AND rut_personal = %(rut_personal)s
                GROUP BY fecha
                ORDER BY fecha ASC;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def delete(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM registro_hh 
                WHERE id_registro_hh = %(id_registro_hh)s AND rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)