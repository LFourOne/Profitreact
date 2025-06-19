import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import styles from './ProjectReportTask.module.css';
import logo from '../../../../assets/icon1.png'

export function ProjectTaskReport() {

    const navigate = useNavigate();

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [projectReportTask, setSelectedTask] = useState(null);

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await axios.get('http://localhost:5500/admin/project-report-task', { withCredentials: true });
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

    const handleOpenAddModal = () => {
        setModalType('add');
        setShowModal(true);
    };
    
    const handleCloseAddModal = () => {
        setModalType('');
        setShowModal(false);
        resetAdd();
    }

    const handleOpenEditModal = (projectReportTask) => {
        setModalType('edit');
        setShowModal(true);
        setSelectedTask(projectReportTask);
    };

    const handleCloseEditModal = () => {
        setModalType('');
        setShowModal(false);
        setSelectedTask(null);
        resetEdit();
    };

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
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear Proyecto / Informe / Tarea
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Proyecto</th>
                                    <th>Informe</th>
                                    <th>Alias Tarea</th>
                                    <th>Tarea Pool</th>
                                    <th>Reporta HH</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span>a</span></td>
                                    <td><span>a</span></td>
                                    <td><span>a</span></td>
                                    <td><span>a</span></td>
                                    <td><span>a</span></td>
                                    <td>
                                        <div className={styles['action-btns']}>
                                            <button className={styles['action-btn-edit']}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                                            </button>
                                            <button className={styles['action-btn-delete']}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
                {
                    showModal && (
                        modalType === 'add' ? (
                            <div className={styles['modal-overlay']} onClick={handleCloseAddModal}>
                                <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                                    <header>
                                        <h2>Agregar Tarea</h2>
                                        <button onClick={handleCloseAddModal}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </header>
                                    <form onSubmit={handleSubmitAdd(onSubmitAdd)} id='add-task-form'>
                                        <fieldset>
                                            <label htmlFor="task-name">Nombre de la Tarea</label>
                                            <input type="text" id="task-name" {...registerAdd('task-name', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-level">Nivel de la Tarea | 1</label>
                                            <input type="number" id="task-level-1" {...registerAdd('task-level-1', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-level">Nivel de la Tarea | 2</label>
                                            <input type="number" id="task-level-2" {...registerAdd('task-level-2', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-level">Nivel de la Tarea | 3</label>
                                            <input type="number" id="task-level-3" {...registerAdd('task-level-3', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-type">Tipo de la Tarea</label>
                                            <select id="task-type" {...registerAdd('task-type', {required: true})} required>
                                                {
                                                    tasksTypes.map((taskType) => (
                                                        <option key={taskType.id_tipo_tarea} value={taskType.id_tipo_tarea}>
                                                            {taskType.tipo_tarea}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </fieldset>
                                    </form>
                                    <footer>
                                        <button onClick={handleCloseAddModal} className={styles['secundary-btn']}>Cancelar</button>
                                        <button form='add-task-form'  className={styles['primary-btn']}>Agregar</button>
                                    </footer>
                                </div>
                            </div>
                        )
                        :
                        (
                            <div className={styles['modal-overlay']} onClick={handleCloseEditModal}>
                                <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
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