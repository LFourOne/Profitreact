import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import apiClient from '../../../../services/api';
import styles from './ProjectReportTask.module.css';
import logo from '../../../../assets/icon1.png'

export function ProjectTaskReport() {

    const navigate = useNavigate();

    const { register: registerAddTask, handleSubmit: handleSubmitAddTask, reset: resetAddTask } = useForm();
    const { register: registerEditTask, handleSubmit: handleSubmitEditTask, reset: resetEditTask } = useForm();
    const { register: registerAddReportVersion, handleSubmit: handleSubmitAddReportVersion, reset: resetAddReportVersion } = useForm();

    const [project, setProject] = useState([]);
    const [report, setReport] = useState([]);
    const [projectTask, setProjectTask] = useState([]);
    const [projectReport, setProjectReport] = useState([]);
    const [task, setTask] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);

    const [projectFilter, setProjectFilter] = useState('');
    const [reportFilter, setReportFilter] = useState('');

    const [selectedProjectReportVersion, setSelectedProjectReportVersion] = useState('');

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {

            const response = await apiClient.get('/admin/project-report-task');

            setProject(response.data.project);
            setReport(response.data.report);
            setProjectReport(response.data['project-report']);
            setProjectTask(response.data['project-task']);
            setTask(response.data.task);
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

    useEffect(() => {
        if (project.length > 0) {
            setProjectFilter(project[0].id_proyecto);
        }
    }, [project]);

    const handleOpenAddTaskModal = () => {
        setModalType('add-task');
        setShowModal(true);
    };

    const handleCloseAddTaskModal = () => {
        setModalType('');
        setShowModal(false);
        resetAddTask();
    }

    const handleOpenAddReportVersionModal = () => {
        setModalType('add-report-version');
        setShowModal(true);
        resetAddReportVersion();
    };

    const handleCloseAddReportVersionModal = () => {
        setModalType('');
        setShowModal(false);
        resetAddReportVersion();
    };

    const handleOpenEditTaskModal = (projectReportTask) => {
        setModalType('edit-task');
        setShowModal(true);
        setSelectedTask(projectReportTask);
    };

    const handleCloseEditTaskModal = () => {
        setModalType('');
        setShowModal(false);
        setSelectedTask(null);
        resetEditTask();
    };

    const onSubmitAddTask = async (data) => {

        const confirmed = window.confirm('¿Estás seguro que deseas añadir este Proyecto | Informe | Tarea?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiClient.post('/admin/project-report-task/add/process', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
             });

        } catch (error) {
            console.error('Error al agregar tarea:', error);
        }
        finally {
            resetAddTask();
            handleCloseAddTaskModal();
            fetchApi();
            setProjectFilter(data['id-project']);
        }
    }

    const onSubmitAddReportVersion = async (data) => {

        const confirmed = window.confirm('¿Estás seguro que deseas añadir la siguiente versión del informe?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiClient.post('/admin/project-report-task/add-report-version/process', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        } catch (error) {
            console.error('Error al agregar versión de informe:', error);
        }
        finally {
            resetAddReportVersion();
            handleCloseAddReportVersionModal();
            fetchApi();
            setProjectFilter(data['id-project']);
        }
    }

    return(
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Mantenedor de Proyecto / Informe / Tarea</h1>
                        <p>Administra y gestiona las tareas e informes para cada proyecto</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['filter-section']}>
                    <header>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                        <h1>Filtrar Proyecto / Informe / Tarea</h1>
                    </header>
                    <div className={styles['content']}>
                        <div className={styles['filter-input']}>
                            <label htmlFor="project-select">Filtrar por Proyecto:</label>
                            <select id="project-select" onChange={(e) => setProjectFilter(e.target.value)}>
                                {project
                                .filter(project => project.id_proyecto !== 'JE')
                                .map((project) => (
                                    <option key={project.id_proyecto} value={project.id_proyecto}>
                                        {project.id_proyecto}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['filter-input']}>
                            <label htmlFor="report-select">Filtrar por Informe:</label>
                            <select id="report-select" onChange={(e) => setReportFilter(e.target.value)}>
                                <option value="">Todos</option>
                                {report
                                .filter(report => report.id_informe !== 12)
                                .map((report) => (
                                    <option key={report.id_informe} value={report.id_informe}>
                                        {report.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Proyecto / Informe / Tarea</h1>
                        </div>
                        <div className={styles['header-buttons']}>
                            <button onClick={() => navigate('/admin/task')} className={styles['navigate-btn']}>
                                Ver Tareas
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                            <button onClick={handleOpenAddReportVersionModal} className={styles['add-report-version-btn']}>
                                Crear Versión de Informe
                            </button>
                            <button onClick={handleOpenAddTaskModal} className={styles['add-project-report-task-btn']}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear Proyecto / Informe / Tarea
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th className={styles['project']}>Proyecto</th>
                                    <th className={styles['report']}>Informe</th>
                                    <th className={styles['task-alias']}>Alias Tarea</th>
                                    <th className={styles['task-pool']}>Tarea Pool</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    projectTask
                                    .filter((projectTask) => (projectTask.id_proyecto === projectFilter) && (reportFilter === "" || projectTask.id_informe === Number(reportFilter)))
                                    .map((projectTask) => (
                                        <tr key={projectTask.id_proyecto_tarea}>
                                            <td>{projectTask.id_proyecto}</td>
                                            <td>{projectTask.nombre_informe}</td>
                                            <td>{projectTask.alias_tarea}</td>
                                            <td>{projectTask.nombre_tarea}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </section>
                {
                    showModal && (
                        // Modal para agregar tarea
                        modalType === 'add-task' ? (
                            <div className={styles['modal-overlay']} onClick={handleCloseAddTaskModal}>
                                <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                                    <header>
                                        <h2>Agregar Proyecto / Informe / Tarea</h2>
                                        <button onClick={handleCloseAddTaskModal}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </header>
                                    <form onSubmit={handleSubmitAddTask(onSubmitAddTask)} id='add-task-form'>
                                        {
                                            project.length > 0 && (
                                                <fieldset>
                                                    <label>Proyecto:</label>
                                                    <select id="id-project" defaultValue={(projectFilter || '')} {...registerAddTask('id-project', { required: true })}>
                                                        {project
                                                        .filter(project => project.id_proyecto !== 'JE')
                                                        .map((project) => (
                                                            <option key={project.id_proyecto} value={project.id_proyecto}>
                                                                {project.id_proyecto}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </fieldset>
                                            )
                                        }
                                        {
                                            report.length > 0 && (
                                                <fieldset>
                                                    <label>Informe:</label>
                                                    <select id="id-report" {...registerAddTask('id-report', { required: true })}>
                                                        <option value="">Seleccione un informe</option>
                                                        {report
                                                        .filter(report => report.id_informe !== 12)
                                                        .map((report) => (
                                                            <option key={report.id_informe} value={report.id_informe}>
                                                                {report.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </fieldset>
                                            )
                                        }
                                        <fieldset>
                                            <label>Alias Tarea:</label>
                                            <input type="text" id="task-alias" {...registerAddTask('task-alias', { required: true })} />
                                        </fieldset>
                                        {
                                            task.length > 0 && (
                                                <fieldset>
                                                    <label>Tarea Pool:</label>
                                                    <select id="task-pool" {...registerAddTask('id-task', { required: true })}>
                                                        <option value="">Seleccione una tarea</option>
                                                        {Object.entries(
                                                            task.reduce((acc, t) => {
                                                                acc[t.nivel_1] = acc[t.nivel_1] || [];
                                                                acc[t.nivel_1].push(t);
                                                                return acc;
                                                            }, {})
                                                        ).map(([nivel_1, tareas]) => (
                                                            <optgroup key={nivel_1} label={`Nivel 1: ${nivel_1}`}>
                                                                {tareas.map((t) => (
                                                                    <option key={t.id_tarea} value={t.id_tarea}>
                                                                        {`[ Nivel 2: ${t.nivel_2} ] - [ Nivel 3: ${t.nivel_3} ] `} - {t.nombre}
                                                                    </option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                </fieldset>
                                            )
                                        }
                                    </form>
                                    <footer>
                                        <button onClick={handleCloseAddTaskModal} className={styles['secundary-btn']}>Cancelar</button>
                                        <button form='add-task-form'  className={styles['primary-btn']}>Agregar</button>
                                    </footer>
                                </div>
                            </div>
                        )
                        :
                        // Modal para agregar versión de informe
                        modalType === 'add-report-version' && (
                            <div className={styles['modal-overlay']} onClick={handleCloseAddReportVersionModal}>
                                <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                                    <header>
                                        <h2>Agregar Versión de Informe</h2>
                                        <button onClick={handleCloseAddReportVersionModal}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </header>
                                    <form id='add-report-version-form' onSubmit={handleSubmitAddReportVersion(onSubmitAddReportVersion)}>
                                        {
                                            project.length > 0 && (
                                                <fieldset>
                                                    <label>Proyecto:</label>
                                                    <select id="id-project" defaultValue={(projectFilter || '')} {...registerAddReportVersion('id-project', { required: true })} onChange={(e) => setSelectedProjectReportVersion(e.target.value)}>
                                                        {project
                                                        .filter(project => project.id_proyecto !== 'JE')
                                                        .map((project) => (
                                                            <option key={project.id_proyecto} value={project.id_proyecto}>
                                                                {project.id_proyecto}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </fieldset>
                                            )
                                        }
                                        <fieldset>
                                            <label>Informe:</label>
                                            <select id="id-report" defaultValue="" {...registerAddReportVersion('id-report', { required: true })}>
                                                <option value="" disabled>Seleccione un informe</option>
                                                {[...new Map(
                                                    projectReport
                                                    .filter(report => report.id_proyecto === projectFilter || report.id_proyecto === selectedProjectReportVersion)
                                                    .map(report => [report.id_informe, report])
                                                ).values()].map(report => (
                                                    <option key={report.id_informe} value={report.id_informe}>
                                                        {report.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </fieldset>
                                        <fieldset>
                                            <label>Versión del Informe:</label>
                                            <span className={styles['version-info']}>Al presionar "Agregar" se creará la siguiente versión del informe</span>
                                        </fieldset>
                                    </form>
                                    <footer>
                                        <button onClick={handleCloseAddReportVersionModal} className={styles['secundary-btn']}>Cancelar</button>
                                        <button form='add-report-version-form' className={styles['primary-btn']}>Agregar</button>
                                    </footer>
                                </div>
                            </div>
                        )
                    )
                }
            </main>
        )}
        </>
    )
}