import { useNavigate } from 'react-router';
import apiClient from '../../services/api';
import styles from './Index.module.css';
import logo from '../../assets/icon1.png'
import { useState, useEffect } from 'react';

export function Index() {

    const navigate = useNavigate();

    const [session, setSession] = useState([]);
    const [commitments, setCommitments] = useState([]);
    const [team, setTeam] = useState([]);
    const [planification, setPlanification] = useState([]);
    const [HHRecords, setHHRecords] = useState([]);
    const [projects, setProjects] = useState([]);
    const [meetingType, setMeetingType] = useState([]);

    const [projectFilter, setProjectFilter] = useState("");
    const [meetingTypeFilter, setMeetingTypeFilter] = useState("");
    
    const [loading, setLoading] = useState(true);
    
    const fetchApi = async () => {

        try {

        const response = await apiClient.get('/index');

        setCommitments(response.data.commitments);
        setTeam(response.data.team);
        setPlanification(response.data.planification);
        setHHRecords(response.data.HHRecords);
        setProjects(response.data.projects);
        setMeetingType(response.data.meeting_type);
        setSession(response.data.session);
        console.log(response.data)

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {

        const confirmed = window.confirm('¿Estás seguro que deseas cerrar sesión?');
        if (!confirmed) {
            return;
        }

        try {
            await apiClient.post('/logout', {});
        }
        catch (error) {
            console.error('Error al cerrar sesión:', error);
        } 
        finally {
            navigate('/');
        }
    }
    
    useEffect(() => {
        fetchApi();
    }, []);

    // This function formats the date from YYYY-MM-DD to DD/MM/YYYY

    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0 a 11
        const year = date.getUTCFullYear();
    
        return `${day}/${month}/${year}`;
    };

    // This function determines the commitment class base on the date difference

    const getCommitmentDateClass = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffTime = date - now;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays <= 7) {
            return styles['commitment-date-soon'];
        } else if (diffDays > 7 && diffDays <= 14) {
            return styles['commitment-date-medium'];
        } else if (diffDays > 14) {
            return styles['commitment-date-far'];
        } 
    };

    function getSpanishDayName(dateString) {
        let date = new Date(dateString);

        if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0) {
            date = new Date(date.getTime() + 12 * 60 * 60 * 1000);
        }

        const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
        return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }

    function getDayNumber(dateString) {
        let date = new Date(dateString);
        if (date.getUTCHours() === 0 && date.getUTCMinutes() === 0) {
            date = new Date(date.getTime() + 12 * 60 * 60 * 1000);
        }
        return date.getDate();
    }

    return (
        <>
        {loading ? <p>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['welcome-section']}>
                    <div className={styles['welcome-section-text-container']}>
                        <h1>¡Bienvenido/a, {session.nombres}!</h1>
                        <p>Gestiona tu planificación semanal, compromisos y más desde Profit</p>
                        <button onClick={() => navigate(`/profile/${session.rut_personal}`)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Mi Perfil
                        </button>
                    </div>
                    <div className={styles['welcome-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['buttons-container']}>
                    <button className={styles['my-commitment-button']}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                        Mis Compromisos
                    </button>
                    <button className={styles['my-planification-button']} onClick={() => navigate('/gantt')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        Mi Planificación
                    </button>
                    {
                        (session.id_rol === 1 || session.id_rol === 2 || session.id_rol === 3 || session.id_rol === 4 || session.id_rol === 5) && (
                            <a href="https://patotorres.pythonanywhere.com/" target="_blank" rel="noopener noreferrer" className={styles['my-planification-button']}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/></svg>
                                Licitaciones
                            </a>
                        )
                    }
                    <button className={styles['logout-button']} onClick={logout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M19.8 12H9"/></svg>
                        Cerrar Sesión
                    </button>
                </section>
                <div className={styles['content-container']}>
                    <div className={styles['content-container-left']}>
                        {/* Weekly Planning Section */}
                        <section className={styles['weekly-planning']}>
                            <div className={styles['weekly-planning-header']}>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <h1>Planificación Semanal</h1>
                                </div>
                                <button onClick={() => navigate('/gantt')}>
                                    Ver Planificación Completa
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                            </div>
                            <div className={styles['weekly-planning-content']}>
                                {planification.length > 0 ? (
                                    planification.map((day) => (
                                    <div key={day.date} className={styles['weekly-planning-item']}>
                                        <div className={styles['weekly-planning-item-header']}>
                                            <span className={styles['weekly-planning-item-day-string']}>
                                                {getSpanishDayName(day.date)}
                                            </span>
                                            <span className={styles['weekly-planning-item-day-number']}>
                                                {getDayNumber(day.date)}
                                            </span>
                                        </div>
                                        <div className={styles['weekly-planning-item-content']}>
                                            {day.planification.length > 0 ? (
                                                day.planification.map((planification) => (
                                                    <div key={planification.id_planificacion}>
                                                        <span className={styles['weekly-planning-item-project']}>
                                                            {planification.id_proyecto}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className={styles['weekly-planning-item-project']}>
                                                    No hay planificaciones para este día.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    )
                                )) : (
                                    <p>No tienes planificaciones para esta semana.</p>
                                )}
                            </div>
                        </section>
                        {/* Weekly HH Section */}
                        <section className={styles['weekly-hh']}>
                            <div className={styles['weekly-hh-header']}>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    <h1>Registro HH Semanal</h1>
                                </div>
                                <button onClick={() => navigate('/hh-register')}>
                                    Ver Registro HH
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                            </div>
                            <div className={styles['weekly-hh-content']}>
                                {HHRecords.length > 0 ? (
                                    HHRecords.map((day) => (
                                    <div key={day.date} className={styles['weekly-hh-item']}>
                                        <div className={styles['weekly-hh-item-header']}>
                                            <span className={styles['weekly-hh-item-day-string']}>
                                                {getSpanishDayName(day.date)}
                                            </span>
                                            <span className={styles['weekly-hh-item-day-number']}>
                                                {getDayNumber(day.date)}
                                            </span>
                                        </div>
                                        <div className={styles['weekly-hh-item-content']}>
                                            {day.hh_records.length > 0 ? (
                                                day.hh_records.map((hh_record, idx) => (
                                                    <div key={idx}>
                                                        <span className={styles['weekly-hh-item-project']}>
                                                            {hh_record.total_horas} horas registradas
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className={styles['weekly-hh-item-project']}>
                                                    0 horas registradas
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    )
                                )) : (
                                    <p>No tienes planificaciones para esta semana.</p>
                                )}
                            </div>
                        </section>
                        {/* Commitment Section */}
                        <section className={styles['my-commitments']}>
                            <div className={styles['my-commitments-header']}>
                                <div className={styles['my-commitments-header-left']}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                                    <h1>Mis Compromisos</h1>
                                </div>
                                <div className={styles['my-commitments-header-right']}>
                                    <div>
                                        <label>Proyecto:</label>
                                        <select className={styles['filter-select']} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                                            <option value="">Todos</option>
                                            {projects.map((project) => (
                                                <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label>Tipo de Reunión:</label>
                                        <select className={styles['filter-select']} value={meetingTypeFilter} onChange={(e) => setMeetingTypeFilter(e.target.value)}>
                                            <option value="">Todos</option>
                                            {meetingType.map((type) => (
                                                <option value={type.id_tipo_reunion} key={type.id_tipo_reunion}>{type.descripcion_tipo_reunion}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Commitment List */}
                            <div className={styles['my-commitments-list']}>
                                {
                                    commitments.length > 0 ? (
                                        commitments
                                        .filter((commitment) => (projectFilter === "" || commitment.id_proyecto === projectFilter) && (meetingTypeFilter === "" || commitment.id_tipo_reunion === Number(meetingTypeFilter)))
                                        .map((commitment) => (
                                            <div key={commitment.id_compromiso} className={styles['commitment-item']}>
                                                <div className={styles['commitment-item-header']}>
                                                    <div className={styles['commitment-item-header-left']}>
                                                        <span className={getCommitmentDateClass(commitment.fecha_comprometida)}>
                                                            Fecha Comprometida: {formatDate(commitment.fecha_comprometida)}
                                                        </span>
                                                        {
                                                            commitment.prioridad === 0 ?
                                                            (
                                                                <span className={styles['commitment-item-priority-low']}>Prioridad Normal</span>
                                                            )
                                                            :
                                                            (
                                                                <span className={styles['commitment-item-priority-high']}>Prioridad Alta</span>
                                                            )
                                                        }
                                                    </div>
                                                    <div className={styles['commitment-item-header-right']}>
                                                        <span>{commitment.descripcion_tipo_reunion}</span>
                                                        <span>{commitment.id_proyecto} | {formatDate(commitment.fecha)}</span>
                                                    </div>
                                                </div>
                                                <div className={styles['commitment-item-content']}>
                                                    <p>{commitment.texto_compromiso}</p>
                                                </div>
                                                <div className={styles['commitment-item-footer']}>
                                                    <button onClick={() => navigate(`/meeting/minute/${commitment.id_reunion}`)}>
                                                        Ir a reunión
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )
                                    :
                                    (
                                        <p>No tienes compromisos pendientes.</p>
                                    )
                                }
                            </div>
                        </section>
                    </div>
                    <div className={styles['content-container-right']}>
                        {/* Team Section */}
                        <section className={styles['my-team']}>
                            <div className={styles['my-team-header']}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                <h1>Mi Equipo</h1>
                            </div>
                            <div className={styles['my-team-list']}>
                                {team.length > 0 ? (
                                    team.map((team) => (
                                        <div key={team.rut_personal} className={styles['team-member']} onClick={() => navigate(`/profile/${team.rut_personal}`)}>
                                            <div className={styles['team-member-avatar']}>
                                                <span>{team.iniciales_nombre}</span>
                                            </div>
                                            <div className={styles['team-member-info']}>
                                                <span>{team.nombres} {team.apellido_p} {team.apellido_m}</span>
                                                <span className={styles['team-member-info-specialty']}>{team.especialidad}</span>
                                            </div>
                                        </div>
                                    ))
                                )
                                :
                                (
                                    <p>No hay miembros en tu equipo.</p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        )}
        </>
    )
}