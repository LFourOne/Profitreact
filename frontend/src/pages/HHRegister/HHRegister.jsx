import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import styles from './HHRegister.module.css';
import logo from '../../assets/icon1.png'

export function HHRegister() {

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const navigate = useNavigate();


    const [role, setRole] = useState([]);
    const [HHReportState, setHHReportState] = useState([]);

    const [project, setProject] = useState([])
    const [reports, setReports] = useState([])
    const [tasks, setTasks] = useState([])

    const [schedule, setSchedule] = useState([]);
    
    const [selectedProject, setSelectedProject] = useState('')
    const [selectedReport, setSelectedReport] = useState(null)
    const [selectedTask, setSelectedTask] = useState('')
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    });

    const totalHours = schedule.reduce((sum, item) => sum + item.horas, 0);
    const getTargetHours = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay(); // 0=domingo, 1=lunes, etc.
        
        // Lunes=1, Martes=2, Miércoles=3 → 9 horas
        // Jueves=4, Viernes=5 → 8 horas
        if (dayOfWeek >= 1 && dayOfWeek <= 3) return 9; // Lunes a Miércoles
        if (dayOfWeek === 4 || dayOfWeek === 5) return 8; // Jueves y Viernes
        return 0; // Fin de semana
    };

    const targetHours = getTargetHours(selectedDate);

    const isComplete = totalHours === targetHours;

    const [loading, setLoading] = useState(true);
    

    const fetchApi = async () => {
        try {

            const response = await axios.get('http://localhost:5500/hh-register', { withCredentials: true });

            setProject(response.data.project);
            setRole(response.data.role);
            setHHReportState(response.data.hh_report_state);
            console.log(response.data);

        }
        catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    const onSubmit = async (data) => {

        const message = totalHours >= targetHours 
        ? 'Has alcanzado el límite de horas para este día. ¿Deseas continuar registrando más horas?'
        : '¿Estás seguro que deseas registrar esta HH?';
    
        const confirmed = window.confirm(message);

        if (!confirmed) {
            return;
        }

        try {
            const response = await axios.post('http://localhost:5500/hh-register/process', data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            }
        }
        finally {
            reset();
            setSelectedProject('');
            setSelectedReport(null);
            setSelectedTask('');
            setReports([]);
            setTasks([]);
            fetchApi();
            fetchSchedule(selectedDate);
            console.log('Datos enviados:', data);
        }
    }

    const deleteHH = async (e, id_registro_hh) => {
        
        e.preventDefault();
        
        const confirmed = window.confirm('¿Estás seguro que deseas eliminar esta HH?');

        if (!confirmed) {
            return;
        }

        try {
            const response = await axios.delete('http://localhost:5500/hh-register/delete', {
                data: {id_registro_hh},
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true 
            });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            }
        } finally {
            fetchSchedule(selectedDate);
        }
    };

    const handleHHReportStateChange = async () => {

        const confirmed = window.confirm('¿Estás seguro que deseas cambiar el estado del día?');
        if (!confirmed) {
            return;
        }
        
        try {
            const response = await axios.put('http://localhost:5500/hh-register/api/hh-report-state', {}, {
                withCredentials: true
            });

            if (response.data?.message) {
                alert(response.data.message);
            }

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
            if (error.response && error.response.status === 403) {
                navigate('/');
            }
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            }
        } finally {
            fetchApi();
        }
    };

    const handleProjectChange = async (event) => {
            const projectID = event.target.value;
            setSelectedProject(projectID);

            if (projectID) {
                try {
                    const response = await axios.get(`http://localhost:5500/hh-register/api/projects/${projectID}`, { withCredentials: true });

                    setReports(response.data.reports);
                    setTasks(response.data.tasks);

                    console.log(response.data);
                    
                } catch (error) {
                    console.error('Error fetching reports:', error);
                }
            }
        }
        
    const fetchSchedule = async (date) => {
        if (date) {
            try {
                const response = await axios.get(`http://localhost:5500/hh-register/api/schedule/${date}`, { withCredentials: true });
                setSchedule(response.data.schedule);
                console.log('Schedule data:', response.data.schedule);
            } catch (error) {
                console.error('Error fetching schedule:', error);
            }
        }
    };

    useEffect(() => {
        fetchSchedule(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        if (reports.length > 0) {
            const maxReport = reports.reduce((max, curr) =>
                Number(curr.id_informe) > Number(max.id_informe) ? curr : max,
                reports[0]
            );
            setSelectedReport(maxReport);
        } else {
            setSelectedReport(null);
        }
    }, [reports]);

     const timeSlots = [
        "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
        "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
        "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
        "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"
    ];

    // Función para saber si un slot está ocupado por 
    // .un registro
    function getScheduleMap(schedule) {
        const map = {};
        timeSlots.forEach(slot => { map[slot] = null; });

        schedule.forEach(reg => {
            // Convierte inicio y fin a minutos
            const [startH, startM] = reg.inicio.split(':').map(Number);
            const [endH, endM] = reg.fin.split(':').map(Number);
            const startMin = startH * 60 + startM;
            const endMin = endH * 60 + endM;

            // Encuentra el primer slot que coincide con el inicio
            let firstSlot = null;
            let slotCount = 0;

            timeSlots.forEach(slot => {
                const [slotH, slotM] = slot.split(':').map(Number);
                const slotMin = slotH * 60 + slotM;
                
                if (slotMin >= startMin && slotMin < endMin) {
                    if (firstSlot === null) {
                        firstSlot = slot;
                    }
                    slotCount++;
                }
            });

            // Solo marca el primer slot con la tarea completa y el número de slots que ocupa
            if (firstSlot) {
                map[firstSlot] = {
                    ...reg,
                    rowSpan: slotCount
                };
                
                // Marca los demás slots como ocupados pero sin contenido
                let foundFirst = false;
                timeSlots.forEach(slot => {
                    const [slotH, slotM] = slot.split(':').map(Number);
                    const slotMin = slotH * 60 + slotM;
                    
                    if (slotMin >= startMin && slotMin < endMin) {
                        if (foundFirst) {
                            map[slot] = 'occupied';
                        } else {
                            foundFirst = true;
                        }
                    }
                });
            }
        });
        
        return map;
    }

    const scheduleMap = getScheduleMap(schedule);

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Reporte de HH</h1>
                        <p>Reporta y visualiza tus horas trabajadas</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <form className={styles['form']} onSubmit={handleSubmit(onSubmit)}>
                    <header>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <h1>Registro de Tarea</h1>
                    </header>
                    <div className={styles['form-content']}>
                        <div className={styles['content-fields']}>
                            <fieldset>
                                <label>Proyecto</label>
                                {
                                    project.length > 0 && (
                                        <select name="project" id="project" {...register('project', { required: true })} onChange={handleProjectChange} value={selectedProject}>
                                            {project
                                            .filter((project) => project.id_proyecto != 'JE')
                                            .map((project) => (
                                                <option key={project.id_proyecto} value={project.id_proyecto}>{project.id_proyecto}</option>
                                            ))}
                                        </select>
                                    )
                                }
                            </fieldset>
                            {
                                selectedProject ? (
                                    <>
                                        <fieldset>
                                            <label>Informe</label>
                                            {
                                                reports.length > 0 ? (
                                                    <select name="report" id="report" {...register('report', { required: true })} onChange={(e) => {const found = reports.find(report => Number(report.id_informe) === Number(e.target.value)); setSelectedReport(found || null)}} value={selectedReport ? selectedReport.id_informe : ''}>
                                                        {reports.map((report) => (
                                                            <option key={report.id_informe} value={report.id_informe}>{report.nombre}</option>
                                                        ))}
                                                    </select>
                                                )
                                                :
                                                (
                                                    <span className={styles['readonly']}></span>
                                                )
                                            }
                                        </fieldset>
                                        <fieldset>
                                            <label>Versión</label>
                                            {
                                                selectedReport ? (
                                                    <>
                                                        <span className={styles['version']}>{selectedReport.id_version}</span>
                                                        <input type="hidden" value={selectedReport.id_version} />
                                                    </>
                                                )
                                                :
                                                (
                                                    <span className={styles['readonly']}></span>
                                                )
                                            }
                                        </fieldset>
                                        <fieldset>
                                            <label>Tarea</label>
                                            {selectedReport && tasks.length > 0 ? (
                                                <select
                                                    name="task"
                                                    id="task"
                                                    {...register('task', { required: true })}
                                                    value={selectedTask}
                                                    onChange={e => setSelectedTask(e.target.value)}
                                                >
                                                    <option value="">Selecciona una tarea</option>
                                                    {tasks
                                                        .filter(task => Number(task.id_informe) === Number(selectedReport.id_informe))
                                                        .map(task => (
                                                            <option key={task.id_proyecto_tarea} value={task.id_tarea}>
                                                                {task.alias_tarea}
                                                            </option>
                                                        ))}
                                                </select>
                                            ) : (
                                                <span className={styles['readonly']}></span>
                                            )}
                                        </fieldset>
                                    </>
                                )
                                :
                                (
                                    <>
                                        <fieldset>
                                            <label>Informe</label>
                                            <span className={styles['readonly']}></span>
                                        </fieldset>
                                        <fieldset>
                                            <label>Versión</label>
                                            <span className={styles['readonly']}></span>
                                        </fieldset>
                                        <fieldset>
                                            <label>Tarea</label>
                                            <span className={styles['readonly']}></span>
                                        </fieldset>
                                    </>
                                )
                            }
                        </div>
                        <div className={styles['content-fields']}>
                            <fieldset>
                                <label>Fecha</label>
                                <input type="date" className={styles['date-time-input']} {...register('date', { required: true })} />
                            </fieldset>
                            <fieldset>
                                <label>Hora Inicio</label>
                                <select className={styles['date-time-input']} defaultValue="" {...register('start-time', { required: true })}>
                                    <option value="" disabled>Selecciona una opción</option>
                                    <option>08:30</option>
                                    <option>09:00</option>
                                    <option>09:30</option>
                                    <option>10:00</option>
                                    <option>10:30</option>
                                    <option>11:00</option>
                                    <option>11:30</option>
                                    <option>12:00</option>
                                    <option>12:30</option>
                                    <option>13:00</option>
                                    <option>13:30</option>
                                    <option>14:00</option>
                                    <option>14:30</option>
                                    <option>15:00</option>
                                    <option>15:30</option>
                                    <option>16:00</option>
                                    <option>16:30</option>
                                    <option>17:00</option>
                                    <option>17:30</option>
                                    <option>18:00</option>
                                    <option>18:30</option>
                                    <option>19:00</option>
                                    <option>19:30</option>
                                    <option>20:00</option>
                                    <option>20:30</option>
                                    <option>21:00</option>
                                    <option>21:30</option>
                                    <option>22:00</option>
                                    <option>22:30</option>
                                    <option>23:00</option>
                                    <option>23:30</option>
                                </select>
                            </fieldset>
                            <fieldset>
                                <label>Hora Término</label>
                                <select className={styles['date-time-input']} defaultValue="" {...register('end-time', { required: true })}>
                                    <option value="" disabled>Selecciona una opción</option>
                                    <option>08:30</option>
                                    <option>09:00</option>
                                    <option>09:30</option>
                                    <option>10:00</option>
                                    <option>10:30</option>
                                    <option>11:00</option>
                                    <option>11:30</option>
                                    <option>12:00</option>
                                    <option>12:30</option>
                                    <option>13:00</option>
                                    <option>13:30</option>
                                    <option>14:00</option>
                                    <option>14:30</option>
                                    <option>15:00</option>
                                    <option>15:30</option>
                                    <option>16:00</option>
                                    <option>16:30</option>
                                    <option>17:00</option>
                                    <option>17:30</option>
                                    <option>18:00</option>
                                    <option>18:30</option>
                                    <option>19:00</option>
                                    <option>19:30</option>
                                    <option>20:00</option>
                                    <option>20:30</option>
                                    <option>21:00</option>
                                    <option>21:30</option>
                                    <option>22:00</option>
                                    <option>22:30</option>
                                    <option>23:00</option>
                                    <option>23:30</option>
                                </select>
                            </fieldset>
                        </div>
                    </div>
                    <footer>
                        {
                            HHReportState[0]['id_estado'] === 4 ? (
                                <button type="submit" className={styles['add-task-button']}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Agregar Tarea
                                </button>
                            )
                            :
                            HHReportState[0]['id_estado'] === 5 && (
                                <span className={styles['add-task-button-disabled']}>Día Cerrado</span>
                            )
                        }
                        {
                        (role === 1 || role === 2 || role === 3) && (
                            <div>
                                {
                                HHReportState[0]['id_estado'] === 4 ? (
                                    <button className={styles['add-task-button']} onClick={handleHHReportStateChange}>Cerrar Día</button>
                                ) 
                                :
                                HHReportState[0]['id_estado'] === 5 && (
                                    <button className={styles['add-task-button']} onClick={handleHHReportStateChange}>Abrir Día</button>
                                )
                                }
                            </div>
                        )}
                    </footer>
                </form>
                <section className={styles['schedule-section']}>
                    <header>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <h1>Cronograma</h1>
                        </div>
                        <div>
                            {
                                targetHours === 0 ? (
                                    null
                                ) 
                                : 
                                (
                                    <span style={{color: isComplete ? '#16a34a' : '#ef4444'}}>
                                        {totalHours}/{targetHours} horas | {(totalHours/targetHours * 100).toFixed(1)}%
                                    </span>
                                )
                            }
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        </div>
                    </header>
                    <div className={styles['schedule-content']}>
                        <table className={styles['schedule-table']}>
                            <tbody>
                            {timeSlots.map(slot => (
                                <tr key={slot} className={styles['schedule-table-tr']}>
                                    <td>{slot}</td>
                                    <td className={styles['td-hh']}>
                                        {
                                            scheduleMap[slot] && scheduleMap[slot] !== 'occupied' ? (
                                                <div
                                                    className={styles['task-block']}
                                                    style={{
                                                        height: `${scheduleMap[slot].rowSpan * 100}%`,
                                                        minHeight: `${scheduleMap[slot].rowSpan * 30}px`
                                                    }}
                                                >
                                                    <div className={styles['task-block-left']}>
                                                        <strong>{scheduleMap[slot].id_proyecto} | Informe {scheduleMap[slot].id_informe} | {scheduleMap[slot].nombre}</strong>
                                                        <div>{scheduleMap[slot].inicio} - {scheduleMap[slot].fin}</div>
                                                    </div>
                                                    <div className={styles['task-block-right']}>
                                                        <button onClick={(e) => deleteHH(e, scheduleMap[slot].id_registro_hh)}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#030712" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                            :
                                            null
                                        }
                                    </td>
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