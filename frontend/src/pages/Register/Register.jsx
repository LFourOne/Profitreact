import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import logo from '../../assets/grupo-solutiva-logo.png'
import styles from './register.module.css';
import axios from 'axios';

export function Register() {

    const {register, handleSubmit, reset} = useForm();
    
    const [specialty, setSpecialty] = useState([]);

    const [errorMessage, setErrorMessages] = useState('');

    const fetchApi = async () => {
        try {
            
            const response = await axios.get('http://localhost:5500/register', { withCredentials: true });
            
            setSpecialty(response.data.specialty);

            console.log(response.data);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/index');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    const onSubmitRegister = async (data) => {
        const response = await axios.post('http://localhost:5500/register/process', data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.data.status !== 'success') {
            setErrorMessages('Por favor, ingrese credenciales válidas.');
        }
        reset();
    }

    return(
        <>
        <main className={styles['main']}>
            <section className={styles['background']}>
                <section className={styles['form-section']}>
                    <img src={logo} alt="SOLUTIVA Logo" id={styles['logo']} draggable='false' />
                    <form onSubmit={handleSubmit(onSubmitRegister)} className={styles['form']}>
                        <div id={styles['rut-email-password-container']}>
                            <div id={styles['rut-container']}>
                                <fieldset className={styles['field-container']}>
                                    <label htmlFor="rut" className={styles['label']}>RUT</label>
                                    <input type="number" name="rut" id={styles['rut']} {...register('rut', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa el RUT' />
                                </fieldset>
                                <fieldset className={styles['field-container']}>
                                    <label htmlFor="verification-digit" className={styles['label']}>D.V</label>
                                    <input type="text" name="verification-digit" id={styles['verification-digit']} {...register('verification_digit', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa el dígito verificador' />
                                </fieldset>
                            </div>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="email" className={styles['label']}>Correo Electrónico</label>
                                <input type="email" name="email" id={styles['email']} className={styles['rut-email-password-input']} setvalue="{{ email }}" {...register('email', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa el correo electrónico' />
                            </fieldset>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="password" className={styles['label']}>Contraseña</label>
                                <input type="password" name="password" id={styles['password']} className={styles['rut-email-password-input']} {...register('password', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa la contraseña' />
                            </fieldset>
                        </div>
                        <div id={styles['name-container']}>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="name" className={styles['label']}>Nombres</label>
                                <input type="text" name="name" id={styles['name']} className={styles['name-container-input']} {...register('names', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa el nombre' />
                            </fieldset>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="last_name_p" className={styles['label']}>Apellido Paterno</label>
                                <input type="text" name="last_name_p" id={styles['last_name_p']} className={styles['name-container-input']} {...register('last_name_p', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa el apellido paterno' />
                            </fieldset>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="last_name_m" className={styles['label']}>Apellido Materno</label>
                                <input type="text" name="last_name_m" id={styles['last_name_m']} className={styles['name-container-input']} {...register('last_name_m', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa el apellido materno' />
                            </fieldset>
                        </div>
                        <div id={styles['user-container']}>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="user" className={styles['label']}>Nombre de Usuario</label>
                                <input type="text" name="user" id={styles['user']} className={styles['user-container-input']} {...register('user', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa el nombre de usuario' />
                            </fieldset>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="initials" className={styles['label']}>Iniciales</label>
                                <input type="text" name="initials" id={styles['initials']} className={styles['user-container-input']} {...register('initials', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa las iniciales del usuario' />
                            </fieldset>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="specialty" className={styles['label']}>Especialidad</label>
                                <select name="specialty" id={styles['specialty']} className={styles['user-container-input']} {...register('specialty', {required: "Ingrese credenciales válidas"})}>
                                    <option value="" disabled>Selecciona una especialidad</option>
                                    {specialty
                                    .filter((specialty) => specialty.id_especialidad !== 10)
                                    .map((specialty) => (
                                        <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.especialidad}</option>
                                    ))}
                                </select>
                            </fieldset>
                        </div>
                        <div id={styles['date-hh-container']}>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="birthdate" className={styles['label']}>Fecha de Nacimiento</label>
                                <input type="date" name="birthdate" id={styles['birthdate']} className={styles['date-input']} {...register('birthdate', {required: "Ingrese credenciales válidas"})} />
                            </fieldset>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="hiring-date" className={styles['label']}>Fecha de Contratación</label>
                                <input type="date" name="hiring-date" id={styles['hiring-date']} className={styles['date-input']} {...register('hiring-date', {required: "Ingrese credenciales válidas"})} />
                            </fieldset>
                            <fieldset className={styles['field-container']}>
                                <label htmlFor="hh" className={styles['label']}>Inputa HH</label>
                                <input type="checkbox" {...register('report_hh')}/>
                            </fieldset>
                        </div>
                        {errorMessage && 
                        <div className={styles['error-container']}>
                                <span>{errorMessage}</span>
                        </div>
                        }
                        <div className={styles['btn-container']}>
                            <input type="submit" name="btn" id={styles['btn']} value="Crear usuario" />
                        </div>
                    </form>
                </section>
            </section>
        </main>
        </>
    )
}