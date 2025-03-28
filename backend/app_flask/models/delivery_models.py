from app_flask.config.mysqlconnections import connectToMySQL
from app_flask import DATA_BASE

class Delivery:
    def __init__(self, data):
        self.id_entrega = data.get('id_entrega')
        self.id_proyecto = data.get('id_proyecto')
        self.id_informe = data.get('id_informe')
        self.id_version = data.get('id_version')
        self.adenda = data.get('adenda')
        self.id_especialidad = data.get('id_especialidad')
        self.comentarios = data.get('comentarios')
        self.id_empresa = data.get('id_empresa')
        self.fecha = data.get('fecha')
        self.estado = data.get('estado')

    @classmethod
    def insert_delivery(cls, data):
        query = """
                INSERT INTO gantt_entregas (id_proyecto, id_informe, id_version, adenda, id_especialidad, comentarios, id_empresa, fecha, estado)
                VALUES (%(id_proyecto)s, %(id_informe)s, %(id_version)s, %(adenda)s, %(id_especialidad)s, %(comentarios)s, %(id_empresa)s, %(fecha)s, %(estado)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_delivery(cls):
        query = """
                SELECT gantt_entregas.*, informes.*, proyectos.id_ot, especialidades.especialidad, especialidades.color_especialidad FROM gantt_entregas
                JOIN informes ON gantt_entregas.id_informe = informes.id_informe
                JOIN proyectos ON gantt_entregas.id_proyecto = proyectos.id_proyecto
                JOIN especialidades ON gantt_entregas.id_especialidad = especialidades.id_especialidad
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def select_delivery_by_project_date(cls, data):
        query = """
                SELECT gantt_entregas.*, informes.*, proyectos.id_ot FROM gantt_entregas
                JOIN informes ON gantt_entregas.id_informe = informes.id_informe
                JOIN proyectos ON gantt_entregas.id_proyecto = proyectos.id_proyecto
                WHERE gantt_entregas.id_proyecto = %(id_proyecto)s AND gantt_entregas.fecha = %(fecha)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_delivery_comment(cls, data):
        query = """
                UPDATE gantt_entregas SET comentarios = %(comentarios)s 
                WHERE id_entrega = %(id_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_delivery_report(cls, data):
        query = """
                UPDATE gantt_entregas SET id_informe = %(id_informe)s 
                WHERE id_entrega = %(id_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_delivery_version(cls, data):
        query = """
                UPDATE gantt_entregas SET id_version = %(id_version)s 
                WHERE id_entrega = %(id_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_delivery_adenda(cls, data):
        query = """
                UPDATE gantt_entregas SET adenda = %(adenda)s
                WHERE id_entrega = %(id_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update_delivery_specialty(cls, data):
        query = """
                UPDATE gantt_entregas SET id_especialidad = %(id_especialidad)s
                WHERE id_entrega = %(id_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def delete_delivery(cls, data):
        query = """
                DELETE FROM gantt_entregas
                WHERE id_entrega = %(id_entrega)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def complete_delivery(cls, data):
        query = """
                UPDATE gantt_entregas SET estado = 1 
                WHERE id_entrega = %(id_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

class Delivery_Type:
    def __init__(self, data):
        self.id_gantt_tipo_entrega = data.get('id_gantt_tipo_entrega')
        self.tipo_entrega = data.get('tipo_entrega')
        self.color = data.get('color')

    @classmethod
    def select_delivery_type(cls):
        query = """
                SELECT * FROM gantt_tipo_entrega
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def select_delivery_type_color_by_id(cls, data):
        query = """
                SELECT color FROM gantt_tipo_entrega
                WHERE id_gantt_tipo_entrega = %(id_gantt_tipo_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)

    @classmethod
    def update_delivery_type_color_by_id(cls, data):
        query = """
                UPDATE gantt_tipo_entrega SET color = %(color)s
                WHERE id_gantt_tipo_entrega = %(id_gantt_tipo_entrega)s
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)