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
        self.ruta = data.get('ruta')
    
    @classmethod
    def create_training(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO capacitaciones (nombre_capacitacion, fecha, id_modalidad, hora_inicio, hora_termino, rut_instructor, objetivos, contenido)
                VALUES (%(nombre_capacitacion)s, %(fecha)s, %(id_modalidad)s, %(hora_inicio)s, %(hora_termino)s, %(rut_instructor)s, %(objetivos)s, %(contenido)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_training(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE capacitaciones SET nombre_capacitacion = %(nombre_capacitacion)s, fecha = %(fecha)s, id_modalidad = %(id_modalidad)s, hora_inicio = %(hora_inicio)s, hora_termino = %(hora_termino)s, rut_instructor = %(rut_instructor)s, objetivos = %(objetivos)s, contenido = %(contenido)s
                WHERE id_capacitacion = %(id_capacitacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def delete_training(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM capacitaciones WHERE id_capacitacion = %(id_capacitacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def get_all_trainings(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT capacitaciones.*, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, modalidad.modalidad FROM capacitaciones
                JOIN maestro_personal ON capacitaciones.rut_instructor = maestro_personal.rut_personal
                JOIN modalidad ON capacitaciones.id_modalidad =  modalidad.id_modalidad
                ORDER BY capacitaciones.fecha DESC;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def insert_path(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE capacitaciones SET ruta = %(ruta)s 
                WHERE id_capacitacion = %(id_capacitacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def get_training_by_id(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT capacitaciones.*, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, modalidad.modalidad FROM capacitaciones 
                JOIN maestro_personal ON capacitaciones.rut_instructor = maestro_personal.rut_personal
                JOIN modalidad ON capacitaciones.id_modalidad = modalidad.id_modalidad
                WHERE capacitaciones.id_capacitacion = %(id_capacitacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
class TrainingAssistant:
    def __init__(self, data):
        self.id_asistente = data.get('id_asistente')
        self.id_capacitacion = data.get('id_capacitacion')
        self.rut_asistente = data.get('rut_asistente')
        self.fecha = data.get('fecha')

    @classmethod
    def register_attendance(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO asistentes_capacitaciones (id_capacitacion, rut_asistente, fecha)
                VALUES (%(id_capacitacion)s, %(rut_asistente)s, %(fecha)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_attendance(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT asistentes_capacitaciones.*, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, maestro_personal.id_especialidad, especialidades.especialidad FROM asistentes_capacitaciones
                JOIN maestro_personal ON asistentes_capacitaciones.rut_asistente = maestro_personal.rut_personal
                JOIN especialidades ON maestro_personal.id_especialidad = especialidades.id_especialidad
                WHERE id_capacitacion = %(id_capacitacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_attendant_by_rut(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT rut_asistente FROM asistentes_capacitaciones
                WHERE id_capacitacion = %(id_capacitacion)s AND rut_asistente = %(rut_asistente)s;
                """
        boolean = connectToMySQL(DATA_BASE).query_db(query, data)

        if boolean:
            return True
        else:
            return False
        
    @classmethod
    def delete_attendance(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM asistentes_capacitaciones
                WHERE id_capacitacion = %(id_capacitacion)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def remove_assistant(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                DELETE FROM asistentes_capacitaciones
                WHERE id_capacitacion = %(id_capacitacion)s AND rut_asistente = %(rut_asistente)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)