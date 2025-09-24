from app_flask.config.mysqlconnections import connectToMySQL
from flask import session

class Clients:
    def __init__(self, data):
        self.rut_mandante = data.get('rut_mandante')
        self.digito_verificador_mandante = data.get('digito_verificador_mandante')
        self.nombre_mandante = data.get('nombre_mandante')
        self.direccion = data.get('direccion')
        self.id_region = data.get('id_region')
        self.id_provincia = data.get('id_provincia')
        self.id_comuna = data.get('id_comuna')
        self.giro = data.get('giro')
        self.telefono = data.get('telefono')
        self.email = data.get('email')
        self.sitio_web = data.get('sitio_web')
        self.nombre_contacto = data.get('nombre_contacto')
        self.telefono_contacto = data.get('telefono_contacto')
        self.email_contacto = data.get('email_contacto')
    
    @classmethod
    def create(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO mandantes (rut_mandante, digito_verificador_mandante, nombre_mandante, direccion, id_region, id_provincia, id_comuna, giro, telefono, email, sitio_web, nombre_contacto, telefono_contacto, email_contacto)
                VALUES (%(rut_mandante)s, %(digito_verificador_mandante)s, %(nombre_mandante)s, %(direccion)s, %(id_region)s, %(id_provincia)s, %(id_comuna)s, %(giro)s, %(telefono)s, %(email)s, %(sitio_web)s, %(nombre_contacto)s, %(telefono_contacto)s, %(email_contacto)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def update(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE mandantes SET
                    nombre_mandante = %(nombre_mandante)s,
                    direccion = %(direccion)s,
                    id_region = %(id_region)s,
                    id_provincia = %(id_provincia)s,
                    id_comuna = %(id_comuna)s,
                    giro = %(giro)s,
                    telefono = %(telefono)s,
                    email = %(email)s,
                    sitio_web = %(sitio_web)s,
                    nombre_contacto = %(nombre_contacto)s,
                    telefono_contacto = %(telefono_contacto)s,
                    email_contacto = %(email_contacto)s
                WHERE rut_mandante = %(rut_mandante)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def select_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT mandantes.*, regiones.region AS region_nombre, provincias.provincia AS provincia_nombre, comunas.comuna AS comuna_nombre FROM mandantes
                LEFT JOIN regiones ON mandantes.id_region = regiones.id_region
                LEFT JOIN provincias ON mandantes.id_provincia = provincias.id_provincia
                LEFT JOIN comunas ON mandantes.id_comuna = comunas.id_comuna;
                """
        return connectToMySQL(DATA_BASE).query_db(query)

    @classmethod
    def select_all_rut_and_name(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT rut_mandante, nombre_mandante FROM mandantes;
                """
        return connectToMySQL(DATA_BASE).query_db(query)