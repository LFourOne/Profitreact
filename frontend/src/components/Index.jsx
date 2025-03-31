import { useNavigate } from 'react-router';
import axios from 'axios';
import styles from '../css/index.module.css';
import icon from '../assets/icon1.png'
import { useState, useEffect } from 'react';

export function Index() {

    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState({});
    const [loading, setLoading] = useState(true);
    
    const fetchApi = async () => {

        try {

        const response = await axios.get('http://localhost:5500/index', { withCredentials: true });
        
        setSessionData(response.data.session);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error('No autorizado. Redirigiendo al login.');
                navigate('/'); // Redirige al login
            } else {
                console.error('Error inesperado:', error); // Maneja otros errores
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    return (
        <>
        {loading ? <p>Cargando</p> : (
            <main id={styles['main']}>
                <section className={styles['side-section']}>
                    <article>
                        
                    </article>
                    <article>

                    </article>
                </section>
                <section id={styles['middle-section']}>
                    <div id={styles['welcome-container']}>
                        <div id={styles['top-welcome-subcontainer']}>
                            <span>SOLUTIVA</span>
                            <h1 id={styles['welcome-h1']}>¡Bienvenido {sessionData.nombres}!</h1>
                            <a href="/index" id={styles['btn']}>Mi Perfil</a>
                        </div>
                        <img src={icon} alt="icon" id={styles['icon']} draggable="false" />
                    </div>
                    <div id={styles['provisional-container']}>
                        <div className={styles['info-container']}>

                        </div>
                        <div className={styles['info-container']}>

                        </div>
                        <div className={styles['info-container']}>

                        </div>
                    </div>
                    <div id={styles['last-commitments-container']}>
                        <h2>Lorem ipsum dolor sit amet</h2>
                        <div className={styles['commitments-container']}>

                        </div>
                        <div className={styles['commitments-container']}>

                        </div>
                    </div>
                </section>
                <section className={styles['side-section']}>
                    <article>
                        
                    </article>
                    <article>

                    </article>
                </section>
            </main>
        )}
        </>
    )
}