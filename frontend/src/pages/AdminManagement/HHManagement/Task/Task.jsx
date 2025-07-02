import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { set, useForm } from 'react-hook-form';
import axios from 'axios';
import styles from './Task.module.css';
import logo from '../../../../assets/icon1.png'

export function Task() {

    const navigate = useNavigate();

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);

    const [tasks, setTasks] = useState([]);
    const [tasksTypes, setTasksTypes] = useState([]);

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await axios.get('http://localhost:5500/admin/task', { withCredentials: true });

            setTasks(response.data.tasks);
            setTasksTypes(response.data.task_types);
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

    const onSubmitAdd = async (data) => {

        const confirmed = window.confirm('¿Estás seguro que deseas añadir esta tarea?');
        if (!confirmed) {
            return;
        }
        
        try {
            const response = await axios.post('http://localhost:5500/admin/task/add/process', data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } 
        catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } 
            if (error.response && error.response.status === 403) {
                navigate('/')
            }
        } 
        finally {
            setShowModal(false);
            resetAdd();
            fetchApi();
        }
    }

    const onSubmitEdit = async (data) => {

        const confirmed = window.confirm('¿Estás seguro que deseas editar esta tarea?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await axios.patch('http://localhost:5500/admin/task/edit/process', data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
            if (error.response && error.response.status === 403) {
                navigate('/')
            }
        }
        finally {
            setShowModal(false);
            resetEdit();
            fetchApi();
        }
    }

    const deleteTask = async (data) => {

        const confirmed = window.confirm('¿Estás seguro que deseas eliminar esta tarea?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await axios.delete('http://localhost:5500/admin/task/delete/process', {
                data: { data },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            fetchApi();

        }
        catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
            if (error.response && error.response.status === 403) {
                navigate('/')
            }
        }
    }
        
    const handleOpenAddModal = () => {
        setModalType('add');
        setShowModal(true);
    };
    
    const handleCloseAddModal = () => {
        setModalType('');
        setShowModal(false);
        resetAdd();
    }

    const handleOpenEditModal = (task) => {
        setModalType('edit');
        setShowModal(true);
        setSelectedTask(task);
    };

    const handleCloseEditModal = () => {
        setModalType('');
        setShowModal(false);
        setSelectedTask(null);
        resetEdit();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0 a 11
        const year = date.getUTCFullYear();
    
        return `${day}/${month}/${year}`;
    };

    return(
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Mantenedor de Tareas</h1>
                        <p>Administra y gestiona las tareas individuales</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Tareas</h1>
                        </div>
                        <div className={styles['header-buttons']}>
                            <button onClick={() => navigate('/admin/project-report-task')} className={styles['navigate-btn']}>
                                Ver Proyecto / Informe / Tarea
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                            <button onClick={handleOpenAddModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear Tarea
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th className={styles['task-level']}>Nivel 1</th>
                                    <th className={styles['task-level']}>Nivel 2</th>
                                    <th className={styles['task-level']}>Nivel 3</th>
                                    <th className={styles['task-name']}>Nombre</th>
                                    <th className={styles['task-type']}>Tipo</th>
                                    <th className={styles['task-created-at']}>Fecha de Creación</th>
                                    <th className={styles['task-actions']}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    tasks.map((task) => (
                                        <tr key={task.id_tarea}>
                                            <td>{task.nivel_1}</td>
                                            <td>{task.nivel_2}</td>
                                            <td>{task.nivel_3}</td>
                                            <td>{task.nombre}</td>
                                            <td>{task.tipo_tarea}</td>
                                            <td>{formatDate(task.creado_en)}</td>
                                            <td>
                                                <div className={styles['action-btns']}>
                                                    <button className={styles['action-btn-edit']} onClick={() => {handleOpenEditModal(task)}}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                                                    </button>
                                                    <button className={styles['action-btn-delete']} onClick={() => deleteTask(task.id_tarea)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
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
                                    <header>
                                        <h2>Editar Tarea</h2>
                                        <button onClick={handleCloseEditModal}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </header>
                                    <form onSubmit={handleSubmitEdit(onSubmitEdit)} id='edit-task-form'>
                                        <fieldset>
                                            {console.log(selectedTask)}
                                            <label htmlFor="task-name">Nombre de la Tarea</label>
                                            <input type="text" id="task-name" defaultValue={selectedTask.nombre} {...registerEdit('task-name', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-level">Nivel de la Tarea | 1</label>
                                            <input type="number" id="task-level-1" defaultValue={selectedTask.nivel_1} {...registerEdit('task-level-1', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-level">Nivel de la Tarea | 2</label>
                                            <input type="number" id="task-level-2" defaultValue={selectedTask.nivel_2} {...registerEdit('task-level-2', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-level">Nivel de la Tarea | 3</label>
                                            <input type="number" id="task-level-3" defaultValue={selectedTask.nivel_3} {...registerEdit('task-level-3', {required: true})} required />
                                        </fieldset>
                                        <fieldset>
                                            <label htmlFor="task-type">Tipo de la Tarea</label>
                                            <select id="task-type" defaultValue={selectedTask.id_tipo_tarea} {...registerEdit('task-type', {required: true})} required>
                                                {
                                                    tasksTypes.map((taskType) => (
                                                        <option key={taskType.id_tipo_tarea} value={taskType.id_tipo_tarea}>
                                                            {taskType.tipo_tarea}
                                                        </option>
                                                    ))
                                                }
                                            </select>
                                        </fieldset>
                                        <input type="hidden" id="task-id" value={selectedTask.id_tarea} {...registerEdit('task-id', {required: true})} required />
                                    </form>
                                    <footer>
                                        <button onClick={handleCloseEditModal} className={styles['secundary-btn']}>Cancelar</button>
                                        <button form='edit-task-form'  className={styles['primary-btn']}>Guardar Cambios</button>
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