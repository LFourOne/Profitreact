import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import axios from 'axios';
import styles from '../css/login.module.css';
import logo from '../assets/grupo-solutiva-logo.png'

export function Login() {

    const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessages] = useState('');

    const onSubmitLogin = async (data) => {
        const formData = new URLSearchParams();
        formData.append('email', data.email);
        formData.append('password', data.password);

        const response = await axios.post('http://localhost:5500/login/process', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.data.status === 'success') {
            navigate('/index');
        } else {
            setErrorMessages('Por favor, ingrese credenciales válidas.');
        }
    }

    return (
        <main className={styles['main']}>
            <section className={styles['background']}>
                <section className={styles['form-section']}>
                    <img src={logo} alt="SOLUTIVA Logo" id={styles['logo']} draggable='false' />
                    <form onSubmit={handleSubmitLogin(onSubmitLogin)} className={styles['form']}>
                        <div className={styles['field-container']}>
                            <label htmlFor="email" className={styles['label']}>Correo Electrónico</label>
                            <input type="email" name="email" id={styles['email']} className={styles['input']} setvalue="{{ email }}" {...registerLogin('email', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa tu correo electrónico' />
                        </div>
                        <div className={styles['field-container']}>
                            <label htmlFor="password" className={styles['label']}>Contraseña</label>
                            <input type="password" name="password" id={styles['password']} className={styles['input']} {...registerLogin('password', {required: "Ingrese credenciales válidas"})} placeholder='Ingresa tu contraseña' />
                        </div>
                        {errorMessage && 
                        <div className={styles['error-container']}>
                                <span>{errorMessage}</span>
                        </div>
                        }
                        <div className={styles['btn-container']}>
                            <input type="submit" name="btn" id={styles['btn']} value="Iniciar Sesión" />
                        </div>
                    </form>
                </section>
            </section>
            
        </main>
    );
}