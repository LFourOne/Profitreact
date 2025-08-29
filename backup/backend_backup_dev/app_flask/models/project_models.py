from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Project:
    def __init__(self, data):
        self.id_proyecto = data.get('id_proyecto')
        self.nombre = data.get('nombre')
        self.id_tipo_estudio = data.get('id_tipo_estudio')
        self.rut_mandante = data.get('rut_mandante')
        self.jefe_proyectos = data.get('jefe_proyectos')
        self.fecha_inicio = data.get('fecha_inicio')
        self.fecha_termino = data.get('fecha_termino')
        self.id_ot = data.get('id_ot')
        self.estado = data.get('estado')

    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO proyectos (id_proyecto, nombre, id_tipo_estudio, rut_mandante, jefe_proyectos, fecha_inicio, fecha_termino, id_ot, estado)
                VALUES (%(id_proyecto)s, %(nombre)s, %(id_tipo_estudio)s, %(rut_mandante)s, %(jefe_proyectos)s, %(fecha_inicio)s, %(fecha_termino)s, %(id_ot)s, %(estado)s)
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE proyectos
                SET id_proyecto = %(id_proyecto)s, nombre = %(nombre)s, id_tipo_estudio = %(id_tipo_estudio)s, rut_mandante = %(rut_mandante)s, jefe_proyectos = %(jefe_proyectos)s, fecha_inicio = %(fecha_inicio)s, fecha_termino = %(fecha_termino)s, id_ot = %(id_ot)s, estado = %(estado)s
                WHERE id_proyecto = %(original_id_proyecto)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def select_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT proyectos.*, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, tipos_estudio.descripcion_tipo_estudio, mandantes.nombre_mandante FROM proyectos
                JOIN maestro_personal ON proyectos.jefe_proyectos = maestro_personal.rut_personal
                JOIN mandantes ON proyectos.rut_mandante = mandantes.rut_mandante
                LEFT JOIN tipos_estudio ON proyectos.id_tipo_estudio = tipos_estudio.id_tipo_estudio
                """
        return connectToMySQL(DATA_BASE).query_db(query)

    @classmethod
    def select_projects_by_state(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT id_proyecto FROM proyectos
                WHERE estado = 1;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def select_all_id_projects(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT id_proyecto FROM proyectos
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def get_projects(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT proyectos.id_proyecto, proyectos.jefe_proyectos, proyectos.id_ot, maestro_personal.rut_personal, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m FROM proyectos
                JOIN maestro_personal ON proyectos.jefe_proyectos = maestro_personal.rut_personal
                WHERE proyectos.estado = 1 AND proyectos.id_proyecto != "JE"
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def select_rut_jefe_proyecto(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT jefe_proyectos FROM proyectos
                WHERE id_proyecto = %(id_proyecto)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def get_projects_for_commitments(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT id_proyecto, estado FROM proyectos
                WHERE estado = 1 AND id_proyecto != "JE"
                """
        return connectToMySQL(DATA_BASE).query_db(query)