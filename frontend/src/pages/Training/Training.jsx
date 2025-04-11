import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Training.module.css';
import { TrainingCard } from '../../components/TrainingCard/TrainingCard';

export function Training() {

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchApi = async () => {
        try {
            const response = await axios.get('http://localhost:5500/training', { withCredentials: true });
            setLoading(false);
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
                    <TrainingCard
                        title="Ley Karin"
                        date="09/04/2025"
                        instructor="Miguel Borja"
                        participants="38"
                        length="15:00 - 15:30"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Curso de Marketing Digital"
                        date="15/04/2025"
                        instructor="Carlos Martínez"
                        participants="50"
                        length="09:00 - 12:00"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Capacitación en Desarrollo Web"
                        date="10/04/2025"
                        instructor="Laura Gómez"
                        participants="45"
                        length="14:00 - 16:00"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Fundamentos de Python"
                        date="20/04/2025"
                        instructor="Ana Pérez"
                        participants="30"
                        length="16:00 - 18:00"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Gestión de Proyectos Ágiles"
                        date="25/04/2025"
                        instructor="Juan Rodríguez"
                        participants="40"
                        length="10:00 - 13:00"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Seminario sobre Estrategias Avanzadas de Negociación Empresarial"
                        date="16/04/2025"
                        instructor="Alejandro Pérez"
                        participants="60"
                        length="17:30 - 18:30"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Taller de Liderazgo y Gestión de Equipos en el Entorno Empresarial"
                        date="12/04/2025"
                        instructor="Carolina Gómez"
                        participants="40"
                        length="12:00 - 13:30"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Introducción a la IA"
                        date="25/04/2025"
                        instructor="Carlos Gómez"
                        participants="60"
                        length="16:00 - 18:00"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Masterclass de Diseño UX/UI"
                        date="30/04/2025"
                        instructor="Rodrigo Ramírez"
                        participants="60"
                        length="10:00 - 10:30 Horas"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Conferencia Internacional sobre Innovación Empresarial y Tecnológica"
                        date="20/04/2025"
                        instructor="Francisco Rodríguez"
                        participants="200"
                        length="15:00 - 18:30"
                        state="Validado"
                    />
                    <TrainingCard
                        title="Seminario sobre Técnicas Avanzadas de Ventas y Marketing para Empresas"
                        date="30/04/2025"
                        instructor="Sandra Ruiz"
                        participants="120"
                        length="9:00 - 13:30"
                        state="Validado"
                    />
                </section>
            </main>
        )}
        </>
    )
}