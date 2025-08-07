import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import styles from './Training.module.css';
import { TrainingCard } from '../../components/TrainingCard/TrainingCard';

export function Training() {

    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState(0);

    const navigate = useNavigate();

    const [training, setTraining] = useState([]);
    const [rol, setRol] = useState([]);

    const fetchApi = async () => {
        try {
            const response = await apiClient.get('/training');
            setTraining(response.data.trainings);
            setRol(response.data.session);
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formatter = new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
        return formatter.format(date);
    };

    const handleFilterChange = (filterType) => {
        setFilter(filterType);
    };
    
    const filteredTraining = training.filter((training) => {
        if (filter === 0) return true;
        if (filter === 2) return training.estado === "Completado";
        if (filter === 1) return training.estado === "Vigente";
        return false;
    });

    return(
        <>
        {loading ? <p>Cargando</p> : (
            <main id={styles['main']}>
                <section id={styles['top-section']}>
                    <section id={styles['top-section-left-container']}>
                        <div>
                            <h1 id={styles['top-section-left-container-h1']}>Capacitaciones</h1>
                            <h2 id={styles['top-section-left-container-h2']}>Gestiona y visualiza todas las capacitaciones realizadas en la empresa</h2>
                        </div>
                    </section>
                    <section id={styles['top-section-right-container']}>
                        <div id={styles['top-section-right-container-btn-container']}>
                            {(rol.id_rol === 1 || rol.id_rol === 2 || rol.id_rol === 3 || rol.id_rol === 4 || rol.id_rol === 5 || rol.id_rol === 6) && (
                                <button id={styles['top-section-right-container-btn']} onClick={() => navigate('/training/create')}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Nueva Capacitación
                                </button>
                            )}
                        </div>
                        <div id={styles['top-section-right-container-filter-container']}>
                            <button className={styles['top-section-right-container-filter-button']} id={`${filter === 0 ? styles['selected-filter'] : ''}`} onClick={() => handleFilterChange(0)}>Todas</button>
                            <button className={styles['top-section-right-container-filter-button']} id={`${filter === 2 ? styles['selected-filter'] : ''}`} onClick={() => handleFilterChange(2)}>Completadas</button>
                            <button className={styles['top-section-right-container-filter-button']} id={`${filter === 1 ? styles['selected-filter'] : ''}`} onClick={() => handleFilterChange(1)}>Vigentes</button>
                        </div>
                    </section>
                </section>
                <section id={styles['bottom-section']}>
                        {filteredTraining.length > 0 ? (
                            filteredTraining.map((training) => (
                                <TrainingCard
                                    key={training.id_capacitacion}
                                    title={training.nombre_capacitacion}
                                    date={formatDate(training.fecha)}
                                    instructor={`${training.nombres} ${training.apellido_p} ${training.apellido_m}`}
                                    format={training.modalidad}
                                    length={`${training.hora_inicio} - ${training.hora_termino}`}
                                    state={training.estado}
                                    onClick={() => navigate(`/training/${training.id_capacitacion}`)}
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