from app_flask.config.mysqlconnections import connectToMySQL
from flask import flash
from app_flask import DATA_BASE, EMAIL_REGEX

class User:
    def __init__(self, data):
        self.rut_personal = data.get('rut_personal')
        self.digito_verificador = data.get('digito_verificador')
        self.usuario = data.get('usuario')
        self.contraseña = data.get('contraseña')
        self.nombres = data.get('nombres')
        self.apellido_p = data.get('apellido_p')
        self.apellido_m = data.get('apellido_m')
        self.iniciales_nombre = data.get('iniciales_nombre')
        self.profesion = data.get('profesion')
        self.email = data.get('email')
        self.telefono = data.get('telefono')
        self.fecha_nacimiento = data.get('fecha_nacimiento')
        self.fecha_contratacion = data.get('fecha_contratacion')
        self.estado = data.get('estado')
        self.id_especialidad = data.get('id_especialidad')
        self.id_empresa = data.get('id_empresa')
        self.reporta_hh = data.get('reporta_hh')
        self.creado_en = data.get('creado_en')
        self.modificado_en= data.get('modificado_en')

    @classmethod
    def create_one(cls, data):
        query = """
                INSERT INTO maestro_personal(name, email, contraseña, iniciales_nombre)
                VALUES(%(name)s, %(email)s, %(contraseña)s, %(iniciales_nombre)s);
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def obtain_one(cls, data):
        query = """
                SELECT * FROM maestro_personal
                WHERE email = %(email)s;
                """
        result = connectToMySQL(DATA_BASE).query_db(query, data)
        if len(result) == 0:
            return None
        return cls(result[0])
    
    @classmethod
    def obtain_acronym(cls):
        query = """
                SELECT iniciales_nombre FROM maestro_personal;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def update_password(cls, data):
        query = """
                UPDATE maestro_personal
                SET contraseña = %(password)s
                WHERE email = %(email)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @staticmethod

    def validate_login(data):

        is_valid = True

        if not EMAIL_REGEX.match(data['email']):
            flash('Correo no valido', 'email_error')
            is_valid = False
        
        if len(data['password']) < 5:
            flash('Contraseña no valida', 'password_error')
            is_valid = False

        return is_valid