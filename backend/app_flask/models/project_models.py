from app_flask.config.mysqlconnections import connectToMySQL
from app_flask import DATA_BASE

class Project:
    def __init__(self, data):
        self.id_proyecto = data.get('id_proyecto')
        self.nombre = data.get('nombre')
        self.id_tipo_estudio = data.get('id_tipo_estudio')
        self.rut_mandante = data.get('rut_mandante')
        self.coordinador = data.get('coordinador')
        self.fecha_inicio = data.get('fecha_inicio')
        self.fecha_termino = data.get('fecha_termino')
        self.estado = data.get('estado')

    @classmethod
    def select_projects_by_state(cls):
        query = """
                SELECT id_proyecto FROM proyectos
                WHERE estado = 1;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def get_projects(cls):
        query = """
                SELECT proyectos.id_proyecto, proyectos.jefe_proyectos, proyectos.id_ot, maestro_personal.rut_personal, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m FROM proyectos
                JOIN maestro_personal ON proyectos.jefe_proyectos = maestro_personal.rut_personal
                WHERE proyectos.estado = 1 AND proyectos.id_proyecto != "JE"
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def select_rut_jefe_proyecto(cls, data):
        query = """
                SELECT jefe_proyectos FROM proyectos
                WHERE id_proyecto = %(id_proyecto)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def get_projects_for_commitments(cls):
        query = """
                SELECT id_proyecto, estado FROM proyectos
                WHERE estado = 1 AND id_proyecto != "JE"
                """
        return connectToMySQL(DATA_BASE).query_db(query)