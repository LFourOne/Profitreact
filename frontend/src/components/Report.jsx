import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import axios from 'axios';
import styles from '../css/report.module.css';

export function Report() {

    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState({});
    const [meetingData, setMeetingData] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchApi = async () => {

        try {

        const response = await axios.get('http://localhost:5500/reports', { withCredentials: true });
        
        setSessionData(response.data.session);
        setMeetingData(response.data.meetings);
        console.log(response.data);

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
    
    const onSubmitDelete = async (event, id_reunion) => {
        
        event.preventDefault();

        const response = await axios.post('http://localhost:5500/reports/delete-meeting', { id_reunion }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        await fetchApi();
        resetDelete();
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0 a 11
        const year = date.getUTCFullYear();
    
        return `${day}/${month}/${year}`;
    };

    return(
        <>
        {loading ? <p>Cargando...</p> : (
            <main>
                <section id={styles['section']}>
                    <table id={styles['table']}>
                        <thead>
                            <tr>
                                <th className={styles['th']}>Reunión</th>
                                <th className={styles['th']}>Proyecto</th>
                                <th className={styles['th']}>Fecha</th>
                                <th className={styles['th']}>Hora Inicio</th>
                                <th className={styles['th']}>Hora Término</th>
                                <th className={styles['th']}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {meetingData.map((meeting) => (
                            <tr key={meeting.id_reunion} onClick={() => navigate(`/reports/minute/${meeting.id_reunion}`)} id={styles['meeting-tr']}>
                                <td className={styles['td']} id={styles['tipo_reunion_td']}>{meeting.descripcion_tipo_reunion}</td>
                                <td className={styles['td']}>{meeting.id_proyecto}</td>
                                <td className={styles['td']}>{formatDate(meeting.fecha)}</td>
                                <td className={styles['td']}>{meeting.hora_inicio}</td>
                                <td className={styles['td']}>{meeting.hora_termino}</td>
                                <td className={styles['td']}>
                                    <form onSubmit={(e) => onSubmitDelete(e, meeting.id_reunion)}>
                                        <button type='submit' onClick={(e) => e.stopPropagation()} id={styles['delete-button']}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </main>
        )}
        </>
    )
}