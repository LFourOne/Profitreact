import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import apiClient from '../../services/api';
import styles from './Login.module.css';
import logoC from '../../assets/solutiva-consultores-logo.png'
import logoS from '../../assets/solutiva-sistemas-logo.png'

export function Login() {

    const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessages] = useState('');
    const [company, setCompany] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await apiClient.get('/login');
    
            setCompany(response.data.company);
            setLoading(false);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/'); // Redirige al usuario si el servidor devuelve un 401
            } else {
                console.error('Error inesperado:', error);
            }
        }
    };

    useEffect(() => {
        fetchApi();
    }, []);

    const onSubmitLogin = async (data) => {
        try {
            const formData = new URLSearchParams();
            formData.append('email', data.email);
            formData.append('password', data.password);
    
            const response = await apiClient.post('/login/process', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
    
            if (response.status === 200) {
                navigate('/index');
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessages('Ocurrió un error inesperado. Inténtalo de nuevo más tarde.');
                navigate('/');
            }
            if (error.response && error.response.status === 401) {
                setErrorMessages('Por favor, ingrese credenciales válidas.');
            } else {
                setErrorMessages('Ocurrió un error inesperado. Inténtalo de nuevo más tarde.');
            }
        }
    };

    return (
        <>
        {loading ? <main className={styles['background']}></main> : (
            <main className={styles['main']}>
                <section className={styles['background']}>
                    <section className={styles['form-section']}>
                        {
                            (company === 1) ? (
                                <img src={logoC} alt="SOLUTIVA Logo" id={styles['logo']} draggable='false' /> 
                            )
                            :
                            (company === 2) && (
                                <img src={logoS} alt="SOLUTIVA Logo" id={styles['logo']} draggable='false' /> 
                            )
                        }
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
        )}
        </>
    );
}