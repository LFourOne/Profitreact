import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import styles from './TrainingDetails.module.css';

export function TrainingDetails() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState([]);
    const [assistant, setAssistant] = useState([]);
    const [sessionData, setSessionData] = useState([]);

    const [isEditing, setIsEditing] = useState(false);

    const { id_capacitacion } = useParams();

    const fetchApi = async () => {
        try {
            const response = await axios.get(`http://localhost:5500/training/${id_capacitacion}`, { withCredentials: true });

            setTraining(response.data.trainings);
            setAssistant(response.data.assistants);
            setSessionData(response.data.session);
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

    const switchEdit = () => { 
        
        setIsEditing(true);

    };
        
    const backEdit = () => {

        setIsEditing(false);
        
    };

    const onSubmitAttendance = async (e, id_capacitacion, session) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:5500/training/register-attendance`, {id_capacitacion, session}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true });
                
                await fetchApi();

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }

    return(
        <>
        {loading ? <p>Cargando</p> : (
            <main id={styles['main']}>
                <section id={styles['previous-page-container']}>
                    <button id={styles['previous-page-btn']} onClick={() => navigate(-1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H6M12 5l-7 7 7 7"/></svg>
                        Volver a capacitaciones
                    </button>
                </section>
                <section id={styles['training-container']}>
                    <section id={styles['left-section']}>
                        <section id={styles['top-section']}>
                            <div>
                                <h1 id={styles['title']}>{training[0].nombre_capacitacion}</h1>
                                <div id={styles['top-section-date-state-container']}>
                                    <div>
                                        <h2>{formatDate(training[0].fecha)}</h2>
                                    </div>
                                    <div>
                                        <span id={styles['state']}>Completado</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id={styles['middle-section']}>
                            <div className={styles['top-info']}>
                                <label className={styles['label']}>Instructor:</label>
                                <span>{training[0].nombres} {training[0].apellido_p} {training[0].apellido_m}</span>
                            </div>
                            <div className={styles['top-info']}>
                                <label className={styles['label']}>Modalidad:</label>
                                <span>{training[0].modalidad}</span>
                            </div>
                            <div className={styles['top-info']}>
                                <label className={styles['label']}>Hora de Inicio:</label>
                                <span>{training[0].hora_inicio}</span>
                            </div>
                            <div className={styles['top-info']}>
                                <label className={styles['label']}>Hora de Termino:</label>
                                <span>{training[0].hora_termino}</span>
                            </div>
                        </section>
                        <section id={styles['bottom-section']}>
                            <div id={styles['objectives-container']}>
                                <label className={styles['label']}>Objetivos:</label>
                                <p id={styles['objectives']}>{training[0].objetivos}</p>
                            </div>
                            <div id={styles['content-container']}>
                                <label className={styles['label']}>Contenido:</label>
                                <p id={styles['content']}>{training[0].contenido}</p>
                            </div>
                        </section>
                    </section>
                    <section id={styles['right-section']}>
                        <section id={styles['right-top-section']}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Participantes</h1>
                        </section>
                        <section id={styles['right-middle-section']}>
                            {
                                assistant.map((assistant) => (
                                    <div className={styles['right-middle-participant-card']} key={assistant.id_asistente}>
                                        <div className={styles['right-middle-participant-card-top-subcontainer']}>
                                            <label className={styles['right-middle-participant-card-top-subcontainer-staff']}>{assistant.nombres} {assistant.apellido_p} {assistant.apellido_m}</label>
                                            <span className={styles['right-middle-participany-card-top-subcontainer-specialty']}>{assistant.especialidad}</span>
                                            <label className={styles['right-middle-participany-card-top-subcontainer-date']}>Se registró: {formatDate(assistant.fecha)}</label>
                                        </div>
                                        <div>
                                            <span className={styles['attendance']}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c4d0c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                Asistió
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                        </section>
                        <section id={styles['right-bottom-section']}>
                            {!assistant.some((assistant) => assistant.rut_asistente === sessionData) ? ( // Verifica si no hay coincidencia
                                <button type="submit" onClick={(e) => onSubmitAttendance(e, id_capacitacion, sessionData)} id={styles['right-bottom-btn']}>Registrar asistencia</button>
                            )
                            : 
                            (
                                <button type="submit" disabled id={styles['right-bottom-btn-disabled']}>¡Ya estás registrado!</button>
                            )}
                        </section>
                    </section>
                </section>
            </main>
        )
        }
        </>
    )
}