import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Training.module.css';
import { TrainingCard } from '../../components/TrainingCard/TrainingCard';

export function Training() {

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const [training, setTraining] = useState([]);

    const fetchApi = async () => {
        try {
            const response = await axios.get('http://localhost:5500/training', { withCredentials: true });
            setTraining(response.data.trainings);
            setLoading(false);
            console.log(response.data);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    return(
        <>
        {loading ? <p>Cargando</p> : (
            <main id={styles['main']}>
                <section id={styles['top-section']}>
                    <section id={styles['top-section-left-container']}>
                        <div>
                            <h1>Capacitaciones</h1>
                            <h2 id={styles['top-section-left-container-h2']}>Gestiona y visualiza todas las capacitaciones realizadas en la empresa</h2>
                        </div>
                    </section>
                    <section id={styles['top-section-right-container']}>
                        <div id={styles['top-section-right-container-btn-container']}>
                            <button id={styles['top-section-right-container-btn']} onClick={() => navigate('/training/create')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Nueva Capacitación
                            </button>
                        </div>
                        <div id={styles['top-section-right-container-filter-container']}>
                            <button className={styles['top-section-right-container-filter-button']} id={styles['selected-filter']}>Todas</button>
                            <button className={styles['top-section-right-container-filter-button']}>Validados</button>
                            <button className={styles['top-section-right-container-filter-button']}>Vigentes</button>
                        </div>
                    </section>
                </section>
                <section id={styles['bottom-section']}>
                        {training.length > 0 ? (
                            training.map((training) => (
                                <TrainingCard
                                    key={training.id_capacitacion}
                                    title={training.nombre_capacitacion}
                                    date={training.fecha}
                                    instructor={training.rut_instructor}
                                    participants={1}
                                    length={`${training.hora_inicio} - ${training.hora_termino}`}
                                    state="Validado"
                                />
                            ))
                        ) : (
                            <p>No hay capacitaciones disponibles.</p>
                        )}
                    </section>
            </main>
        )}
        </>
    )
}