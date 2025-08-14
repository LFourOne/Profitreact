import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import apiClient from '../../services/api';
import styles from './Meeting.module.css';

export function Meeting() {

    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState({});
    const [meetingData, setMeetingData] = useState([]);
    const [meetingType, setMeetingType] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectFilter, setProjectFilter] = useState("");
    const [meetingTypeFilter, setMeetingTypeFilter] = useState("");
    const [loading, setLoading] = useState(true);
    
    const fetchApi = async () => {

        try {

            const response = await apiClient.get('/meeting');

            setSessionData(response.data.session);
            setMeetingData(response.data.meetings);
            setProjects(response.data.projects);
            setMeetingType(response.data.meeting_type);

            console.log(response.data);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
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

        const confirmed = window.confirm('¿Estás seguro que deseas eliminar esta reunión? (No podrás volver a recuperarla)');
        if (!confirmed) {
            return;
        }

        const response = await apiClient.delete('/meeting/delete-meeting', {
            data: { id_reunion },
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

    const rolePermissions = {
        1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        2: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        3: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        4: [3, 4, 5, 6, 7, 8, 9, 10],
        5: [3, 4, 5, 6, 7, 8, 9, 10],
        6: [4, 5, 6, 7, 8, 9, 10],
        7: [4, 5, 6, 7, 8, 9, 10],
        8: [],
    }

    const filteredMeetings = meetingData.filter((meeting) => {
        const matchesProject = projectFilter === "" || meeting.id_proyecto === projectFilter;
        const matchesType = meetingTypeFilter === "" || meeting.id_tipo_reunion === parseInt(meetingTypeFilter);

        const allowedTypes = rolePermissions[sessionData.id_rol] || [];
        const canViewMeeting = allowedTypes.includes(meeting.id_tipo_reunion);

        return matchesProject && matchesType && canViewMeeting;
    });

    return(
        <>
        {loading ? <p>Cargando...</p> : (
            <main id={styles['main']}>
                <section id={styles['top-section']}>
                    <div id={styles['top-section-left-container']}>
                        <div>
                            <h1 id={styles['top-section-left-container-h1']}>Reuniones</h1>
                            <h2 id={styles['top-section-left-container-h2']}>Gestiona y visualiza todas las reuniones realizadas en la empresa</h2>
                        </div>
                    </div>
                    <div id={styles['top-section-right-container']}>
                        {(sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4) && (
                            <button id={styles['top-section-right-container-btn']} onClick={() => navigate('/meeting/create-meeting')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear Reunión
                            </button>
                        )}
                    </div>
                </section>
                <section id={styles['middle-section']}>
                    <div className={styles['filter-container']}>
                        <div>
                            <label className={styles['filter-select-label']} htmlFor='meeting-type-filter-select'>Filtrar por tipo de reunión: </label>
                            <select className={styles['filter-select']} name="meeting-type-filter-select" onChange={(e) => setMeetingTypeFilter(e.target.value)}>
                                <option value="">Todos</option>
                                {meetingType.map((type) => (
                                    <option value={type.id_tipo_reunion} key={type.id_tipo_reunion}>{type.descripcion_tipo_reunion}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={styles['filter-select-label']} htmlFor='project-filter-select'>Filtrar por proyecto: </label>
                            <select className={styles['filter-select']} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                                <option value="">Todos</option>
                                {projects.map((project) => (
                                    <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles['table-container']}>
                        <table id={styles['table']}>
                            <thead id={styles['thead']}>
                                <tr>
                                    <th className={styles['th']} id={styles['th-meeting']}>Reunión</th>
                                    <th className={styles['th']}>Proyecto</th>
                                    <th className={styles['th']}>Fecha</th>
                                    <th className={styles['th']}>Hora Inicio</th>
                                    <th className={styles['th']}>Hora Término</th>
                                    {(sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3) && (
                                        <th className={styles['th']}>Eliminar Reunión</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMeetings.map((meeting) => (
                                <tr key={meeting.id_reunion} onClick={() => navigate(`/meeting/minute/${meeting.id_reunion}`)} id={styles['meeting-tr']}>
                                    <td className={styles['td']} id={styles['tipo_reunion_td']}>{meeting.descripcion_tipo_reunion}</td>
                                    <td className={styles['td']}>
                                        <div id={styles['td-project']}>
                                            {meeting.id_proyecto}
                                        </div>
                                    </td>
                                    <td className={styles['td']}>
                                        <div id={styles['td-date']}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            {formatDate(meeting.fecha)}
                                        </div>
                                    </td>
                                    <td className={styles['td']}>{meeting.hora_inicio}</td>
                                    {
                                        meeting.hora_termino === null ? (
                                            <td className={styles['td']}>-</td>
                                        ) 
                                        :
                                        (
                                            <td className={styles['td']}>{meeting.hora_termino}</td>
                                        )
                                    }
                                    {(sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3) && (
                                        <td className={styles['td']}>
                                            <form onSubmit={(e) => onSubmitDelete(e, meeting.id_reunion)}>
                                                <button type='submit' onClick={(e) => e.stopPropagation()} id={styles['delete-button']}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </form>
                                        </td>
                                    )}
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        )}
        </>
    )
}