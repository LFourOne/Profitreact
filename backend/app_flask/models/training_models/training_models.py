from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Training:
    def __init__(self, data):
        self.id_capacitacion = data.get('id_capacitacion')
        self.nombre_capacitacion = data.get('nombre_capacitacion')
        self.fecha = data.get('fecha')
        self.id_modalidad = data.get('id_modalidad')
        self.hora_inicio = data.get('hora_inicio')
        self.hora_termino = data.get('hora_termino')
        self.rut_instructor = data.get('rut_instructor')
        self.objetivos = data.get('objetivos')
        self.contenido = data.get('contenido')
    
    @classmethod
    def create_training(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO capacitaciones (nombre_capacitacion, fecha, id_modalidad, hora_inicio, hora_termino, rut_instructor, objetivos, contenido)
                VALUES (%(nombre_capacitacion)s, %(fecha)s, %(id_modalidad)s, %(hora_inicio)s, %(hora_termino)s, %(rut_instructor)s, %(objetivos)s, %(contenido)s);
                """
        result = connectToMySQL(DATA_BASE).query_db(query, data)
        return result