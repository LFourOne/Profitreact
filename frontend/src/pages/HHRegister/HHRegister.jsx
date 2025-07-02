import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import styles from './HHRegister.module.css';
import logo from '../../assets/icon1.png'

export function HHRegister() {

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
                <form className={styles['form']}>
                    <header>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        <h1>Registro de Tarea</h1>
                    </header>
                    <div className={styles['content']}>
                        <div className={styles['content-fields']}>
                            <fieldset>
                                <label>Proyecto</label>
                                {
                                    project.length > 0 && (
                                        <select name="" id="" onChange={handleProjectChange} value={selectedProject}>
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
                                                    <select name="" id="" onChange={(e) => {const found = reports.find(report => Number(report.id_informe) === Number(e.target.value)); setSelectedReport(found || null)}} value={selectedReport ? selectedReport.id_informe : ''}>
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
                                                    <span className={styles['version']}>{selectedReport.id_version}</span>
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
                                <input type="date" className={styles['date-time-input']} />
                            </fieldset>
                            <fieldset>
                                <label>Hora Inicio</label>
                                <input type="time" className={styles['date-time-input']} />
                            </fieldset>
                            <fieldset>
                                <label>Hora Término</label>
                                <input type="time" className={styles['date-time-input']} />
                            </fieldset>
                        </div>
                    </div>
                    <footer>
                        <button type="submit" className={styles['add-task-button']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Agregar Tarea
                        </button>
                        <button type="button" className={styles['close-day-button']}>
                            Cerrar Día
                        </button>
                    </footer>
                </form>
            </main>
        )}
        </>
    )
}