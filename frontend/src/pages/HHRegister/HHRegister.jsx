import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import styles from './HHRegister.module.css';
import logo from '../../assets/icon1.png'

export function HHRegister() {

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const navigate = useNavigate();

    const [project, setProject] = useState([])
    const [reports, setReports] = useState([])
    const [tasks, setTasks] = useState([])
    
    const [selectedProject, setSelectedProject] = useState('')
    const [selectedReport, setSelectedReport] = useState(null)
    const [selectedTask, setSelectedTask] = useState('')

    const [loading, setLoading] = useState(true);

    

    const fetchApi = async () => {
        try {

            const response = await axios.get('http://localhost:5500/hh-register', { withCredentials: true });

            setProject(response.data.project);
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
        try {
            const response = await axios.post('http://localhost:5500/hh-register/process', data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error al procesar los datos:', error);
        }
        finally {
            reset();
            setSelectedProject('');
            setSelectedReport(null);
            setSelectedTask('');
            setReports([]);
            setTasks([]);
            console.log('Datos enviados:', data);
        }
    }

    const handleProjectChange = async (event) => {
            const projectID = event.target.value;
            setSelectedProject(projectID);

            if (projectID) {
                try {
                    const response = await axios.get(`http://localhost:5500/hh-register/api/${projectID}`, { withCredentials: true });

                    setReports(response.data.reports);
                    setTasks(response.data.tasks);

                    console.log(response.data);
                    
                } catch (error) {
                    console.error('Error fetching reports:', error);
                }
            }
        }
        
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
                                    <option>00:00</option>
                                    <option>00:30</option>
                                    <option>01:00</option>
                                    <option>01:30</option>
                                    <option>02:00</option>
                                    <option>02:30</option>
                                    <option>03:00</option>
                                    <option>03:30</option>
                                    <option>04:00</option>
                                    <option>04:30</option>
                                    <option>05:00</option>
                                    <option>05:30</option>
                                    <option>06:00</option>
                                    <option>06:30</option>
                                    <option>07:00</option>
                                    <option>07:30</option>
                                    <option>08:00</option>
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
                                    <option>00:00</option>
                                    <option>00:30</option>
                                    <option>01:00</option>
                                    <option>01:30</option>
                                    <option>02:00</option>
                                    <option>02:30</option>
                                    <option>03:00</option>
                                    <option>03:30</option>
                                    <option>04:00</option>
                                    <option>04:30</option>
                                    <option>05:00</option>
                                    <option>05:30</option>
                                    <option>06:00</option>
                                    <option>06:30</option>
                                    <option>07:00</option>
                                    <option>07:30</option>
                                    <option>08:00</option>
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
                        <button type="submit" className={styles['add-task-button']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Agregar Tarea
                        </button>
                    </footer>
                </form>
                <section className={styles['schedule-section']}>
                    <header>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <h2>Cronograma</h2>
                    </header>
                    <div className={styles['schedule-content']}>
                        <table className={styles['schedule-table']}>
                            <tbody>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>08:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>09:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>09:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>10:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>10:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>11:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>11:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>12:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>12:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>13:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>13:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>14:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>14:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>15:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>15:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>16:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>16:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>17:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>17:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>18:00</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                                <tr className={styles['schedule-table-tr']}>
                                    <td>18:30</td>
                                    <td className={styles['td-hh']}></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        )}
        </>
    )
}