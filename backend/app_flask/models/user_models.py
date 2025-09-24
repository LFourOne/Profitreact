from app_flask.config.mysqlconnections import connectToMySQL
from flask import flash, session
from app_flask import EMAIL_REGEX

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
        self.id_cargo = data.get('id_cargo')
        self.id_especialidad = data.get('id_especialidad')
        self.id_rol = data.get('id_rol')
        self.reporta_hh = data.get('reporta_hh')
        self.color = data.get('color')
        self.creado_en = data.get('creado_en')
        self.modificado_en= data.get('modificado_en')

    @classmethod
    def get_all(cls):
        DATA_BASE = session.get('data_base')
        query = """
                SELECT maestro_personal.rut_personal, maestro_personal.digito_verificador, maestro_personal.usuario, maestro_personal.nombres, maestro_personal.apellido_p, maestro_personal.apellido_m, 
                maestro_personal.iniciales_nombre, maestro_personal.email, maestro_personal.telefono, maestro_personal.fecha_nacimiento, maestro_personal.fecha_contratacion, maestro_personal.estado, 
                maestro_personal.id_cargo, maestro_personal.id_especialidad, maestro_personal.id_rol, maestro_personal.reporta_hh, maestro_personal.color, maestro_personal.creado_en, maestro_personal.modificado_en, 
                especialidades.especialidad, roles.rol, cargos.cargo FROM maestro_personal
                JOIN especialidades ON maestro_personal.id_especialidad = especialidades.id_especialidad
                LEFT JOIN cargos ON maestro_personal.id_cargo = cargos.id_cargo
                JOIN roles ON maestro_personal.id_rol = roles.id_rol
                ORDER BY maestro_personal.estado DESC, maestro_personal.id_rol ASC, maestro_personal.id_especialidad ASC;
                """
        return connectToMySQL(DATA_BASE).query_db(query)

    @classmethod
    def create_one(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                INSERT INTO maestro_personal(rut_personal, digito_verificador, usuario, contraseña, nombres, apellido_p, apellido_m, iniciales_nombre, email, fecha_nacimiento, fecha_contratacion, estado, id_cargo, id_especialidad, id_rol, reporta_hh, color)
                VALUES (%(rut_personal)s, %(digito_verificador)s, %(usuario)s, %(contraseña)s, %(nombres)s, %(apellido_p)s, %(apellido_m)s, %(iniciales_nombre)s, %(email)s, %(fecha_nacimiento)s, %(fecha_contratacion)s, 1, %(id_cargo)s, %(id_especialidad)s, %(id_rol)s, %(reporta_hh)s, '#000000');
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def edit_user(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE maestro_personal
                SET rut_personal = %(rut_personal)s, digito_verificador = %(digito_verificador)s, usuario = %(usuario)s, nombres = %(nombres)s, apellido_p = %(apellido_p)s, 
                apellido_m = %(apellido_m)s, iniciales_nombre = %(iniciales_nombre)s, email = %(email)s, telefono = %(telefono)s, fecha_nacimiento = %(fecha_nacimiento)s, 
                fecha_contratacion = %(fecha_contratacion)s, estado = %(estado)s, id_cargo = %(id_cargo)s, id_especialidad = %(id_especialidad)s, id_rol = %(id_rol)s, reporta_hh = %(reporta_hh)s, color = %(color)s
                WHERE rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def edit_user_with_password(cls, data):
        DATA_BASE = session.get('data_base')
        query = """
                UPDATE maestro_personal
                SET rut_personal = %(rut_personal)s, digito_verificador = %(digito_verificador)s, usuario = %(usuario)s, contraseña = %(contraseña)s, nombres = %(nombres)s, apellido_p = %(apellido_p)s, 
                apellido_m = %(apellido_m)s, iniciales_nombre = %(iniciales_nombre)s, email = %(email)s, telefono = %(telefono)s, fecha_nacimiento = %(fecha_nacimiento)s, 
                fecha_contratacion = %(fecha_contratacion)s, estado = %(estado)s, id_cargo = %(id_cargo)s, id_especialidad = %(id_especialidad)s, id_rol = %(id_rol)s, reporta_hh = %(reporta_hh)s, color = %(color)s
                WHERE rut_personal = %(rut_personal)s;
                """
        return connectToMySQL(DATA_BASE).query_db(query, data)
    
    @classmethod
    def obtain_one(cls, data):
        DATA_BASE = session.get('data_base')
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
        DATA_BASE = session.get('data_base')
        query = """
                SELECT iniciales_nombre FROM maestro_personal;
                """
        return connectToMySQL(DATA_BASE).query_db(query)
    
    @classmethod
    def update_password(cls, data):
        DATA_BASE = session.get('data_base')
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