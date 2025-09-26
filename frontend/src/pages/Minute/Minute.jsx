import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import Select from 'react-select'
import apiClient from '../../services/api';
import Modal from 'react-modal';
import styles from './Minute.module.css';

export function Minute() {

    Modal.setAppElement('#root');

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, control: controlAdd, formState: { errors : errorsAdd }, control, setValue: setValueAdd } = useForm();
    const { register: registerComplete, handleSubmit: handleSubmitComplete, reset: resetComplete, control: controlComplete, formState: { errors : errorsComplete } } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, control: controlEdit, formState: { errors : errorsEdit } } = useForm();
    const { register: registerDelete, handleSubmit: handleSubmitDelete, reset: resetDelete, control: controlDelete, formState: { errors : errorsDelete } } = useForm();
    const { register: registerAgreement, handleSubmit: handleSubmitAgreement, reset: resetAgreement, control: controlAgreement, formState: { errors : errorsAgreement } } = useForm();
    const { register: registerTopic, handleSubmit: handleSubmitTopic, reset: resetTopic, control: controlTopic, formState: { errors : errorsTopic } } = useForm();

    const navigate = useNavigate();
    
    const [sessionData, setSessionData] = useState({});
    const [staff, setStaff] = useState([]);
    const [projects, setProjects] = useState([]);
    const [meetingData, setMeetingData] = useState([]);
    const [projectChiefName, setProjectChiefName] = useState([]);
    const [commitments, setCommitments] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [topics, setTopics] = useState([]);

    const [editingCommitment, setEditingCommitment] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { id_reunion } = useParams();

    const [changeTopicAgreementView, setChangeTopicAgreementView] = useState(false);
    
    const [stateFilter, setStateFilter] = useState(1);
    const [projectFilter, setProjectFilter] = useState("");

    const [selectKey, setSelectKey] = useState(0);

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {

        try {

            const response = await apiClient.get(`/reports/minute/${id_reunion}`);

            setSessionData(response.data.session);
            setStaff(response.data.name_and_last_name);
            setProjects(response.data.projects);
            setMeetingData(response.data.meeting_data);
            setProjectChiefName(response.data.project_chief_name);
            setCommitments(response.data.commitments);
            setAgreements(response.data.agreements);
            setTopics(response.data.topics);

            console.log(response.data);
            
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } 
            else if (error.response && error.response.status === 403) {
                navigate('/meeting');
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    const onSubmitAdd = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas añadir este compromiso?');
        if (!confirmed) {
            return;
        }

        data.id_reunion = id_reunion;

        const projectToKeep = data.project_id;

        const response = await apiClient.post('/meetings/minute/add-commitment', data);

        await fetchApi();
        setSelectKey(prev => prev + 1);
        resetAdd();
        setValueAdd('project_id', projectToKeep);
    }

    const onSubmitComplete = async (event, id_compromiso) => {

        event.preventDefault();

        const confirmed = window.confirm('¿Estás segur@ que deseas completar este compromiso?');
        if (!confirmed) {
            return;
        }

        const response = await apiClient.post('/meetings/minute/complete-commitment', {id_compromiso});

        await fetchApi();
        resetComplete();
    }

    const onSubmitEdit = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas editar este compromiso?');
        if (!confirmed) {
            return;
        }

        const response = await apiClient.patch('/meetings/minute/edit-commitment', data);

        await fetchApi();
        closeModal();
    }

    const onSubmitDelete = async (event, id_compromiso) => {
        
        event.preventDefault();

        const confirmed = window.confirm('¿Estás segur@ que deseas eliminar este compromiso?');
        if (!confirmed) {
            return;
        }

        const response = await apiClient.delete('/meetings/minute/delete-commitment', {
            data: {id_compromiso}
        });

        await fetchApi();
        resetDelete();
    }

    const onSubmitAddAgreement = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas agregar este acuerdo?');
        if (!confirmed) {
            return;
        }

        data.id_reunion = id_reunion;

        const response = await apiClient.post('/meetings/minute/add-agreement', data);

        await fetchApi();
        resetAgreement();
    }

    const onSubmitAddTopic = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas agregar este tema tratado?');
        if (!confirmed) {
            return;
        }

        data.id_reunion = id_reunion;

        const response = await apiClient.post('/meetings/minute/add-topic', data);

        await fetchApi();
        resetTopic();
    }

    const closeMeeting = async (event) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas cerrar la reunión? (No podrás agregar más compromisos en esta reunión)');
        if (!confirmed) {
            return;
        }
        
        event.preventDefault();

        const response = await apiClient.patch('/meetings/minute/close-meeting', {id_reunion});

        await fetchApi();
        
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0 a 11
        const year = date.getUTCFullYear();
    
        return `${day}/${month}/${year}`;
    };

    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0 a 11
        const year = date.getUTCFullYear();
        
        return `${year}-${month}-${day}`;
    };

    const openModal = (id_compromiso) => {
        const commitmentToEdit = commitments.find(commitment => commitment.id_compromiso === id_compromiso);
        setEditingCommitment(commitmentToEdit);
        setModalIsOpen(true);
    }

    const closeModal = () => {
        resetEdit();
        setEditingCommitment(null);
        setModalIsOpen(false);
    }

    const changeTopicAgreementViewHandler = () => {
        setChangeTopicAgreementView(!changeTopicAgreementView);
    }

    const staffList = staff.map((staff) => ({
        value: staff.rut_personal,
        label: `${staff.nombres} ${staff.apellido_p} ${staff.apellido_m}`
    }));

    return(
        <>
        {loading ? <p>Cargando...</p> : (
            <>
            <section id={styles['main-section']}>
                <section className={styles['commitment-header-section']}>
                    <div className={styles['commitment-title-container']}>
                        {
                            meetingData[0].id_tipo_reunion === 1 ? (
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                                    <h1>{meetingData[0].descripcion_tipo_reunion}</h1>
                                    {
                                        meetingData[0].id_estado === 1 ? (
                                            <p className={styles['state-active']}>En curso</p>
                                        )
                                        :
                                        (
                                            <p className={styles['state-closed']}>Finalizada</p>
                                        )
                                    }
                                </div>
                            )
                            :
                            meetingData[0].id_tipo_reunion === 3 ? (
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                                    <h1>{meetingData[0].descripcion_tipo_reunion}</h1>
                                    {
                                        meetingData[0].id_estado === 1 ? (
                                            <p className={styles['state-active']}>En curso</p>
                                        )
                                        :
                                        (
                                            <p className={styles['state-closed']}>Finalizada</p>
                                        )
                                    }
                                </div>
                            )
                            :
                            (
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                                    <h1>{meetingData[0].descripcion_tipo_reunion} - {meetingData[0].id_proyecto}</h1>
                                    {
                                        meetingData[0].id_estado === 1 ? (
                                            <p className={styles['state-active']}>En curso</p>
                                        )
                                        :
                                        (
                                            <p className={styles['state-closed']}>Finalizada</p>
                                        )
                                    }
                                </div>
                            )
                        }
                    </div>
                    <div className={styles['close-meeting-section']}>
                        {((meetingData[0].id_estado === 1) && (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5 || sessionData.id_rol === 6)) ? (
                            <button type='submit' className={styles['close-meeting-btn']} onClick={(e) => closeMeeting(e)}>Cerrar Reunión</button>
                        )
                        :
                        ( meetingData[0].id_estado === 2 ? (
                            <span className={styles['close-meeting-btn-disabled']}>Reunión cerrada</span>
                        )
                        :
                        (
                            <span className={styles['close-meeting-btn-disabled']}>Cerrar Reunión</span>
                        ))}
                    </div>
                </section>
                {((sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5 || sessionData.id_rol === 6) && (meetingData[0].id_estado === 1)) && (
                    <section className={styles['add-commitment-section']}>
                        <form onSubmit={handleSubmitAdd(onSubmitAdd)}>
                            <section>
                                {meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3 ? (
                                    <fieldset>
                                        <label>Proyecto</label>
                                        <select name="project-select" className={styles['add-commitment-select']} {...registerAdd('project_id', {required: true})}>
                                            {projects.map((project) => (
                                                <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                                            ))}
                                        </select>
                                    </fieldset>
                                    )
                                    :
                                    (
                                    <fieldset>
                                        <label>Proyecto</label>
                                        <span className={styles['add-commitment-select']}>{meetingData[0].id_proyecto}</span>
                                        <input type="hidden" value={meetingData[0].id_proyecto} {...registerAdd('project_id')} />
                                    </fieldset>
                                    )
                                }
                                <fieldset className={styles['add-commitment-fieldset-responsible']}>
                                    <label>Responsable</label>
                                    <Controller
                                        key={selectKey}
                                        name="name_and_last_name_form"
                                        control={control}
                                        rules={{ required: true }}
                                        className={styles['name_and_last_name_form']}
                                        classNamePrefix="react-select"
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                placeholder="Seleccione el responsable..."
                                                options={staffList}
                                                className={styles['name_and_last_name_form']}
                                                styles={{
                                                    control: (base) => ({
                                                        ...base,
                                                        minWidth: '100%',
                                                        minWidth: 0,
                                                        height: 48,
                                                        borderRadius: 4,
                                                        border: '1px solid #d1d5db',
                                                        backgroundColor: 'white',
                                                        color: 'black',
                                                        fontSize: 16,
                                                        boxSizing: 'border-box',
                                                        paddingLeft: 8,
                                                    }),
                                                    menu: (base) => ({
                                                        ...base,
                                                        zIndex: 9999,
                                                    }),
                                                    option: (base, state) => ({
                                                        ...base,
                                                        backgroundColor: state.isSelected ? '#15803d' : 'white',
                                                        color: state.isSelected ? 'white' : 'black',
                                                        '&:hover': {
                                                            backgroundColor: '#f3f4f6',
                                                            color: 'black',
                                                        },
                                                    }),
                                                }}
                                            />
                                        )}
                                    />
                                </fieldset>
                                <fieldset>
                                    <label>Fecha</label>
                                    <input type="date" id={styles['commitment-date']} className={styles['add-commitment-select']} {...registerAdd('commitment-date', {required: true})} />
                                </fieldset>
                                <fieldset>
                                    <label>Prioridad</label>
                                    <input type="checkbox" className={styles['priority']} {...registerAdd('priority')} />
                                </fieldset>
                            </section>
                            <section>
                                <fieldset>
                                    <label>Compromiso</label>
                                    <textarea type="text" id={styles['commitment-text']} {...registerAdd('commitment-text', {required: true})} placeholder='Escribe el contenido del compromiso aquí'></textarea>
                                </fieldset>
                            </section>
                            <section className={styles['add-commitment-btn-container']}>
                                <button type="submit" className={styles['add-commitment-btn']} onClick={handleSubmitAdd(onSubmitAdd)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                    Agregar Compromiso
                                </button>
                            </section>
                        </form>
                    </section>
                )}
                <section className={styles['commitment-title-section']}>
                    <div>
                        <h1>Compromisos</h1>
                        <p>Administra los compromisos de la reunión</p>
                    </div>
                </section>
                <section className={styles['filters-section']}>
                    <div className={styles['filter-container']}>
                        <label>Filtrar por estado:</label>
                        <select className={styles['filter-select']} value={stateFilter} onChange={(e) => setStateFilter(Number(e.target.value))}>
                            <option value={1}>Vigente</option>
                            <option value={2}>Completado</option>
                            <option value={3}>Eliminado</option>
                            <option value={0}>Todos</option>
                        </select>
                    </div>
                    <div className={styles['filter-container']}>
                        <label>Filtrar por proyecto:</label>
                        <select className={styles['filter-select']} value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                            <option value="">Todos</option>
                            {projects.map((project) => (
                                <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                            ))}
                        </select>
                    </div>
                </section>
                <section className={styles['commitment-section']}>
                    <table>
                        <thead>
                            <tr>
                                {
                                    (meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3) ? (
                                        <th>Proyecto</th>
                                    )
                                    :
                                    (
                                        null
                                    )
                                }
                                <th>Responsable</th>
                                <th>Fecha</th>
                                <th>Compromiso</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commitments
                            .filter(commitment => (stateFilter === 0 || commitment.id_estado === stateFilter) && (projectFilter === "" || commitment.id_proyecto === projectFilter))
                            .map((commitment) => (
                                <tr key={commitment.id_compromiso}>
                                    {
                                        (meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3) ? (
                                            <td>{commitment.id_proyecto}</td>
                                        )
                                        :
                                        (
                                            null
                                        )
                                    }
                                    <td onClick={() => navigate(`/profile/${commitment.responsable}`)} className={styles['td-rut']}>{commitment.responsable_nombre}</td>
                                    <td>
                                        <div className={styles['td-svg']}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            {formatDate(commitment.fecha_comprometida)}
                                        </div>
                                    </td>
                                        {commitment.prioridad === 1 ? (
                                            <td style={{ fontWeight: 'bold' }} className={styles['commitment-text']}>{commitment.texto_compromiso}</td>
                                        ) 
                                        : 
                                        (
                                            <td className={styles['commitment-text']}>{commitment.texto_compromiso}</td>
                                        )}
                                    <td>
                                        {commitment.id_estado === 1 ? (
                                            <span className={styles['state-current']}>Vigente</span>
                                        )
                                        :
                                        (
                                        commitment.id_estado === 2 ? (
                                            <span className={styles['state-completed']}>Completado</span>
                                        )
                                        :
                                        (
                                        commitment.id_estado === 3 && (
                                            <span className={styles['state-deleted']}>Eliminado</span>
                                        )))}
                                    </td>
                                    <td>
                                        <div className={styles['action-btns-container']}>
                                            {/* Completar compromiso */}
                                            {commitment.id_estado === 1 ? (
                                                (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5 || sessionData.id_rol === 6) ? (
                                                    <button type='submit' className={styles['action-btn-complete']} onClick={(e) => onSubmitComplete(e, commitment.id_compromiso)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    </button>
                                                )
                                                :
                                                (
                                                    <span>Denegado</span>
                                                )
                                            )
                                            : 
                                            (
                                            commitment.id_estado === 2 && (
                                                null
                                            ))}
                                            {/* Editar compromiso */}
                                            {commitment.id_estado === 1 ? (
                                                (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5 || sessionData.id_rol === 6) ? (
                                                <button onClick={() => openModal(commitment.id_compromiso)} className={styles['action-btn-edit']}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                                                </button>
                                                )
                                                :
                                                (
                                                    <span>Denegado</span>
                                                )
                                            )
                                            :
                                            (
                                            commitment.id_estado !== 1 && (
                                                null
                                            ))}
                                            {/* Eliminar compromiso */}
                                            {commitment.id_estado === 1 ? (
                                                (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5 ) ? (
                                                    <button type='submit' className={styles['action-btn-delete']} onClick={(e) => onSubmitDelete(e, commitment.id_compromiso)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    </button>
                                                )
                                                :
                                                (
                                                    <span>Eliminado</span>
                                                )
                                            )
                                            :
                                            (
                                            commitment.id_estado !== 1 && (
                                                null
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
                <section className={styles['topic-agreement-section']}>
                    <div className={styles['topic-agreement-title']}>
                        {changeTopicAgreementView === false ? (
                            <>
                                <h1>Acuerdos</h1>
                                <p>Registra los acuerdos de la reunión</p>
                            </>
                        )
                        :
                        (
                            <>
                                <h1>Temas Tratados</h1>
                                <p>Registra los temas tratados de la reunión</p>
                            </>
                        )}
                    </div>
                    <section className={styles['change-view-section']}>
                        <button className={`${changeTopicAgreementView === false ? styles['change-view-btn-selected'] : styles['change-view-btn'] }`} onClick={changeTopicAgreementViewHandler}>
                            Acuerdos
                        </button>
                        <button className={`${changeTopicAgreementView === true ? styles['change-view-btn-selected'] : styles['change-view-btn'] }`} onClick={changeTopicAgreementViewHandler}>
                            Temas Tratados
                        </button>
                    </section>
                    {changeTopicAgreementView === false ? (
                        <section className={styles['agreement-section']}>
                            <form className={styles['agreement-form']} onSubmit={handleSubmitAgreement(onSubmitAddAgreement)}>
                                <input type="text" placeholder='Ingresa un nuevo acuerdo' {...registerAgreement('agreement', {required: true})} />                                        
                                    {((meetingData[0].id_estado === 1) && (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5 || sessionData.id_rol === 6)) ? (
                                        <button type="submit" className={styles['add-agreement-topic-btn']}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            Añadir Acuerdo
                                        </button>
                                    )
                                    :
                                    (
                                        null
                                    )}
                            </form>
                            <div className={styles['agreement-table-container']}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Texto del Acuerdo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agreements.map((agreement) => (
                                            <tr key={agreement.id_acuerdo}>
                                                <td>{agreement.texto_acuerdo}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )
                    :
                    (
                        <section className={styles['topic-section']}>
                            <form className={styles['topic-form']} onSubmit={handleSubmitTopic(onSubmitAddTopic)}>
                                <input type="text" placeholder='Ingresa un nuevo tema tratado' {...registerTopic('topic', {required: true})} />
                                {((meetingData[0].id_estado === 1) && (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5 || sessionData.id_rol === 6)) ? (
                                    <button type="submit" className={styles['add-agreement-topic-btn']}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                        Añadir Tema Tratado
                                    </button>
                                )
                                :
                                (
                                    null
                                )}
                            </form>
                            <table className={styles['topic-table']}>
                                <thead>
                                    <tr>
                                        <th>Texto del Tema Tratado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topics.map((topic) => (
                                        <tr key={topic.id_tema_tratado}>
                                            <td>{topic.texto_tema_tratado}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </section>
                    )
                    }
                </section>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel='Editar Compromiso'
                    className={styles['modal']}
                >
                    {editingCommitment && (
                        <>
                        <section className={styles['modal-header']}>
                            <div>
                                <h1>Editar compromiso</h1>
                                <p>Modifica los detalles del compromiso</p>
                            </div>
                            <button onClick={closeModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </section>
                        <form onSubmit={handleSubmitEdit(onSubmitEdit)} className={styles['modal-form']} id='modal-form'>
                            <fieldset>
                                <label>Proyecto</label>
                                {
                                    (meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3) ? (
                                        <select name="project-select" className={styles['add-commitment-select']} defaultValue={editingCommitment.id_proyecto} {...registerEdit('project_id', {required: true})}>
                                            {projects.map((project) => (
                                                <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                                            ))}
                                        </select>
                                    )
                                    :
                                    (
                                        <span className={styles['add-commitment-select']}>{meetingData[0].id_proyecto}</span>
                                    )
                                }
                            </fieldset>
                            <fieldset>
                                <label>Responsable</label>
                                <Controller
                                    name="name_and_last_name_form"
                                    control={controlEdit}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            placeholder="Seleccione el responsable"
                                            options={staffList}
                                            className={styles['name_and_last_name_form']}
                                            styles={{
                                                control: (base) => ({
                                                    ...base,
                                                    width: 472,
                                                    height: 48,
                                                    borderRadius: 4,
                                                    border: '1px solid #d1d5db',
                                                    backgroundColor: 'white',
                                                    color: 'black',
                                                    fontSize: 16,
                                                    boxSizing: 'border-box',
                                                    paddingLeft: 4,
                                                }),
                                                menu: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                }),
                                                option: (base, state) => ({
                                                    ...base,
                                                    backgroundColor: state.isSelected ? '#15803d' : 'white',
                                                    color: state.isSelected ? 'white' : 'black',
                                                    '&:hover': {
                                                        backgroundColor: '#f3f4f6',
                                                        color: 'black',
                                                    },
                                                }),
                                            }}
                                        />
                                    )}
                                />
                            </fieldset>
                            <fieldset>
                                <label>Fecha</label>
                                <input type="date" id={styles['commitment-date']} className={styles['add-commitment-select']} defaultValue={formatDateForInput(editingCommitment.fecha_comprometida)} {...registerEdit('commitment-date', {required: true})} />
                            </fieldset>
                            <fieldset>
                                <label>Prioridad</label>
                                <input type="checkbox" id={styles['priority']} defaultChecked={editingCommitment.prioridad === 1} {...registerEdit('priority')} />
                            </fieldset>
                            <fieldset>
                                <label>Compromiso</label>
                                <textarea type="text" id={styles['commitment-text']} defaultValue={editingCommitment.texto_compromiso} {...registerEdit('commitment-text', {required: true})} placeholder='Escribe el contenido del compromiso aquí'></textarea>
                            </fieldset>
                            <input type="hidden" value={editingCommitment.id_tipo_reunion} {...registerEdit('id_meeting_type')} />
                            <input type="hidden" value={editingCommitment.id_compromiso} {...registerEdit('id_commitment')} />
                        </form>
                        <section className={styles['modal-footer']}>
                            <button className={styles['modal-btn-cancel']} onClick={closeModal}>Cancelar</button>
                            <button className={styles['modal-btn-save']} onClick={handleSubmitEdit(onSubmitEdit)} form='modal-form'>Guardar Cambios</button>
                        </section>
                        </>
                    )}
                </Modal>
            </section>
            </>
        )}
        </>
    )
}