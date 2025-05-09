import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { data, useNavigate, useParams } from 'react-router';
import axios from 'axios';
import Modal from 'react-modal';
import styles from './Minute.module.css';

export function Minute() {

    Modal.setAppElement('#root');

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, control: controlAdd, formState: { errors : errorsAdd } } = useForm();
    const { register: registerComplete, handleSubmit: handleSubmitComplete, reset: resetComplete, control: controlComplete, formState: { errors : errorsComplete } } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, control: controlEdit, formState: { errors : errorsEdit } } = useForm();
    const { register: registerDelete, handleSubmit: handleSubmitDelete, reset: resetDelete, control: controlDelete, formState: { errors : errorsDelete } } = useForm();
    const { register: registerAgreement, handleSubmit: handleSubmitAgreement, reset: resetAgreement, control: controlAgreement, formState: { errors : errorsAgreement } } = useForm();
    const { register: registerTopic, handleSubmit: handleSubmitTopic, reset: resetTopic, control: controlTopic, formState: { errors : errorsTopic } } = useForm();

    const navigate = useNavigate();
    
    const [sessionData, setSessionData] = useState({});
    const [staffInfo, setStaffInfo] = useState([]);
    const [projects, setProjects] = useState([]);
    const [meetingData, setMeetingData] = useState([]);
    const [projectChiefName, setProjectChiefName] = useState([]);
    const [commitments, setCommitments] = useState([]);
    const [agreements, setAgreements] = useState([]);
    const [topics, setTopics] = useState([]);

    const [editingCommitment, setEditingCommitment] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);

    const { id_reunion } = useParams();
    
    const [stateFilter, setStateFilter] = useState(1);
    const [projectFilter, setProjectFilter] = useState("");

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {

        try {

            const response = await axios.get(`http://localhost:5500/reports/minute/${id_reunion}`, { withCredentials: true });
            
            setSessionData(response.data.session);
            setStaffInfo(response.data.name_and_last_name);
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

    const onSubmitAdd = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas añadir este compromiso?');
        if (!confirmed) {
            return;
        }

        const response = await axios.post('http://localhost:5500/reports/minute/add-commitment', data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

        await fetchApi();
        resetAdd();
    }

    const onSubmitComplete = async (event, id_compromiso) => {

        event.preventDefault();

        const confirmed = window.confirm('¿Estás segur@ que deseas completar este compromiso?');
        if (!confirmed) {
            return;
        }

        const response = await axios.post('http://localhost:5500/reports/minute/complete-commitment', {id_compromiso}, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

        await fetchApi();
        resetComplete();
    }

    const onSubmitEdit = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas editar este compromiso?');
        if (!confirmed) {
            return;
        }

        const response = await axios.post('http://localhost:5500/reports/minute/edit-commitment', data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
        await fetchApi();
        closeModal();
    }

    const onSubmitDelete = async (event, id_compromiso) => {
        
        event.preventDefault();

        const confirmed = window.confirm('¿Estás segur@ que deseas eliminar este compromiso?');
        if (!confirmed) {
            return;
        }

        const response = await axios.delete('http://localhost:5500/reports/minute/delete-commitment', {
            data: {id_compromiso},
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

        await fetchApi();
        resetDelete();
    }

    const onSubmitAddAgreement = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas agregar este acuerdo?');
        if (!confirmed) {
            return;
        }

        data.id_reunion = id_reunion;

        const response = await axios.post('http://localhost:5500/reports/minute/add-agreement', data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

        await fetchApi();
        resetAgreement();
    }

    const onSubmitAddTopic = async (data) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas agregar este tema tratado?');
        if (!confirmed) {
            return;
        }

        data.id_reunion = id_reunion;

        const response = await axios.post('http://localhost:5500/reports/minute/add-topic', data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

        await fetchApi();
        resetTopic();
    }

    const closeMeeting = async (event) => {

        const confirmed = window.confirm('¿Estás segur@ que deseas cerrar la reunión? (No podrás agregar más compromisos en esta reunión)');
        if (!confirmed) {
            return;
        }
        
        event.preventDefault();

        const response = await axios.patch('http://localhost:5500/reports/minute/close-meeting', {id_reunion}, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })

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

    return(
        <>
        {loading ? <p>Cargando...</p> : (
            <>
            <section id={styles['main-section']}>
                <section id={styles['filters-section']}>
                    <div id={styles['state-filter']}>
                        <label htmlFor="state-filter-select">Filtrar por estado:</label>
                        <select id="state-filter-select" value={stateFilter} onChange={(e) => setStateFilter(Number(e.target.value))}>
                            <option value={1}>Vigente</option>
                            <option value={2}>Completado</option>
                            <option value={3}>Eliminado</option>
                            <option value={0}>Todos</option>
                        </select>
                    </div>
                    <div id={styles['project-filter']}>
                        <label htmlFor="project-filter-select">Filtrar por proyecto:</label>
                        <select id="project-filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                            <option value="">Todos</option>
                            {projects.map((project) => (
                                <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                            ))}
                        </select>
                    </div>
                </section>
                <section className={styles['commitment-section']}>
                    <form onSubmit={handleSubmitAdd(onSubmitAdd)}>
                        <table className={styles['top-table']}>
                            <thead id={styles['thead-commitment']}>
                                <tr id={styles['tr-table-head']}>                                
                                    <th className={styles['th-head']}>Proyecto</th>
                                    {(meetingData.length > 0 && (meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3)) && (
                                        <th className={styles['th-head']}>Jefe de Proyecto</th>
                                    )}
                                    <th className={styles['th-large-head']}>Responsable</th>
                                    <th id={styles['th-commitment-data']}><label htmlFor="commitment-date">Fecha de Compromiso</label></th>
                                    <th className={styles['th-head']}><label htmlFor="commitment-text">Compromiso</label></th>
                                    <th className={styles['th-head']}>Prioridad</th>
                                    <th className={styles['th-head']}>Agregar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={styles['body-tr']}>
                                    <td className={styles['td']}>
                                        {(meetingData.length > 0 && (meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3)) ? 
                                        (
                                            <select name="project-select" id={styles['project-select']} defaultValue="" {...registerAdd("project_id", {required: true})}>
                                                <option value="" disabled>PXXX-EJE</option>
                                                {projects.map((project) => (
                                                    <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                                                ))}
                                            </select>
                                        )
                                        :
                                        (
                                        <>
                                            {meetingData.length > 0 && (
                                                <>
                                                <span>{meetingData[0].id_proyecto}</span>
                                                <input type="hidden" value={meetingData[0].id_proyecto} {...registerAdd("project_id", {required: true})} />
                                                </>
                                            )
                                            }
                                        </>
                                        )
                                        }
                                    </td>
                                    {(meetingData.length > 0 && (meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3)) && (
                                        <td className={styles['td']}>{projectChiefName.length > 0 && `${projectChiefName[0].nombres} ${projectChiefName[0].apellido_p} ${projectChiefName[0].apellido_m}`}</td>
                                    )}
                                    <td className={styles['td']}>
                                        <select name="name_and_last_name_form" id={styles['name_and_last_name_form']} defaultValue="" {...registerAdd("name_and_last_name_form", {required: true})}>
                                            <option value="" disabled>Selecciona personal</option>
                                            {staffInfo.map((staff) => (
                                                <option value={staff.rut_personal} key={staff.rut_personal}>{staff.nombres} {staff.apellido_p} {staff.apellido_m}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className={styles['td']}>
                                        <input type="date" name="commitment-date" id={styles['commitment-date']} {...registerAdd("commitment-date", {required: true})} />
                                    </td>
                                    <td className={styles['td']} id={styles['td-commitment-text']}>
                                        <input type="text" name="commitment-text" id={styles['commitment-text']} placeholder="Escribe el contenido del compromiso aquí" {...registerAdd("commitment-text", {required: true})} />
                                    </td>
                                    <td className={styles['td']} id={styles['td-priority']}>
                                        <input type="checkbox" name="priority" id={styles['priority']} {...registerAdd("priority")} />
                                    </td>
                                    <td className={styles['td']}>
                                        {meetingData[0].hora_termino === 1 ? (
                                            <span>Reunión Cerrada</span>
                                        )
                                        :
                                        (
                                        <>
                                            <button type="submit" className={styles['pointer']}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                            </button>
                                            <input type="hidden" value={id_reunion} {...registerAdd("id_reunion")} />
                                        </>
                                        )
                                        }
                                        
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>
                </section>
                <section id={styles['commitment-list-section']}>
                    <div id={styles['commitment-list-wrapper']}>
                        <table id={styles['commitment-list-table']}>
                            <thead id={styles['thead-commitment-list']}>
                                <tr id="tr-commitment-list">
                                    <th className={styles['th-short-space-list']}>Proyecto</th>
                                    <th id={styles['th-speciality-list']}>Responsable</th>
                                    <th className={styles['th-short-space-list']}>Fecha</th>
                                    <th id={styles['th-commitment-text-list']}>Compromiso</th>
                                    <th className={styles['th-short-space-list']}>Completar</th>
                                    <th className={styles['th-short-space-list']}>Estado</th>
                                    <td className={styles['th-short-space-list']}>Editar</td>
                                    <td className={styles['th-short-space-list']}>Eliminar</td>
                                </tr>
                            </thead>
                            <tbody className={styles['tbody-list']}>
                                {commitments
                                .filter(commitment => (stateFilter === 0 || commitment.id_estado === stateFilter) && (projectFilter === "" || commitment.id_proyecto === projectFilter))
                                .map((commitment) => (
                                    <tr className={styles['tr-list']} key={commitment.id_compromiso}>
                                        <td className={styles['td']}>{commitment.id_proyecto}</td>
                                        <td className={styles['td']}>{commitment.responsable_nombre}</td>
                                        <td className={styles['td']}>{formatDate(commitment.fecha_comprometida)}</td>
                                            {commitment.prioridad === 1 ? (
                                                <td style={{ fontWeight: 'bold' }} id={styles['td-texto-compromiso']} className={styles['td']}>{commitment.texto_compromiso}</td>
                                            ) 
                                            : 
                                            (
                                                <td id={styles['td-texto-compromiso']} className={styles['td']}>{commitment.texto_compromiso}</td>
                                            )}
                                        <td className={styles['td']}>
                                            {commitment.id_estado === 1 ? (
                                                <button type='submit' className={styles['pointer']} onClick={(e) => onSubmitComplete(e, commitment.id_compromiso)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </button>
                                            )
                                            : 
                                            (
                                            commitment.id_estado === 2 ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#669225" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            )
                                            :
                                            (
                                            commitment.id_estado === 3 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#930000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                            )))
                                            }
                                        </td>
                                        <td className={styles['td']}>
                                            {commitment.id_estado === 1 ? (
                                                <span id={styles['current']}>Vigente</span>
                                            )
                                            :
                                            (
                                            commitment.id_estado === 2 ? (
                                                <span id={styles['completed']}>Completado</span>
                                            )
                                            :
                                            (
                                            commitment.id_estado === 3 && (
                                                <span id={styles['deleted']}>Eliminado</span>
                                            )))}
                                        </td>
                                        <td className={styles['td']}>
                                            {commitment.id_estado === 1 ? (
                                                <button onClick={() => openModal(commitment.id_compromiso)} className={styles['pointer']}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                                                </button>
                                            )
                                            :
                                            (
                                            commitment.id_estado === 2 ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#669225" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                            )
                                            :
                                            (
                                            commitment.id_estado === 3 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#930000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                            )))}
                                        </td>
                                        <td className={styles['td']}>
                                            {commitment.id_estado === 1 ? (
                                                <button type='submit' className={styles['pointer']} onClick={(e) => onSubmitDelete(e, commitment.id_compromiso)}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={styles['pointer']} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>   
                                            )
                                            :
                                            (
                                            commitment.id_estado === 2 ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#669225" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                            )
                                            :
                                            (
                                            commitment.id_estado === 3 && (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#930000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                                            )))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section id={styles['close-meeting-section']}>
                    {meetingData.length > 0 && meetingData[0].id_estado === 1 ? (
                        <button type='submit' className={styles['primary-btn']} onClick={(e) => closeMeeting(e)}>Cerrar Reunión</button>
                    )
                    :
                    (
                        <span>Reunión cerrada</span>
                    )
                    }
                </section>
                <section id={styles['topics-agreements-container']}>
                    <section id={styles['agreements-container']}>
                        <div className={styles['add-agreement-container']}>
                            <form onSubmit={handleSubmitAgreement(onSubmitAddAgreement)} className={styles['topic-agreement-form']}>
                                <div className={styles['topic-agreement-input']}>
                                    <label htmlFor="agreements">Acuerdos</label>
                                    <input type="text" name='agreements' id={styles['agreements']} {...registerAgreement("agreement", {required: true})} />
                                </div>
                                <div>
                                {meetingData.length > 0 && meetingData[0].hora_termino === 0 ? (
                                    <button type='submit' className={styles['primary-btn']}>Añadir Acuerdo</button>
                                ) 
                                : 
                                (
                                    null
                                )}
                                </div>
                            </form>
                        </div>
                        <div className={styles['topic-agreement-table-section']}>
                            <table className={styles['topic-agreement-table']}>
                                <thead>
                                    <tr>
                                        <th className={styles['head-th-agreement-topic-text']}>Texto del Acuerdo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agreements.length > 0 && agreements.map((agreement) => (
                                        <tr key={agreement.id_acuerdo}>
                                            <td className={styles['agreement-topic-text']}>{agreement.texto_acuerdo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section id={styles['topics-container']}>
                        <div className={styles['add-agreement-container']}>
                            <form onSubmit={handleSubmitTopic(onSubmitAddTopic)} className={styles['topic-agreement-form']}>
                                <div className={styles['topic-agreement-input']}>
                                    <label htmlFor="topics_covered">Temas Tratados</label>
                                    <input type="text" name='topics_covered' id={styles['topics-covered']} {...registerTopic("topic", {required: true})} />
                                </div>
                                <div>
                                {meetingData.length > 0 && meetingData[0].hora_termino === 0 ? (
                                    <button type='submit' className={styles['primary-btn']}>Añadir Tema Tratado</button>
                                )
                                :
                                (
                                    null
                                )
                                }
                                </div>
                            </form>
                        </div>
                        <div className={styles['topic-agreement-table-section']}>
                            <table className={styles['topic-agreement-table']}>
                                <thead>
                                    <tr>
                                        <th className={styles['head-th-agreement-topic-text']}>Texto del Tema Tratado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topics.length > 0 && topics.map((topic) => (
                                        <tr key={topic.id_tema}>
                                            <td className={styles['agreement-topic-text']}>{topic.texto_tema_tratado}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </section>
                <section id={styles['modal-section']}>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel='Editar Compromiso'
                    className={styles['modal']}
                >
                    {editingCommitment && (
                        <form onSubmit={handleSubmitEdit(onSubmitEdit)}>
                            <table id={styles['modal-table']}>
                                <thead id={styles['modal-thead']}>
                                    <tr>
                                        <th className={styles['modal-thead-th']}>Proyecto</th>
                                        <th className={styles['modal-thead-th-large']}>Responsable</th>
                                        <th className={styles['modal-thead-th']}>Fecha</th>
                                        <th id={styles['modal-thead-th-commitment-text']}>Compromiso</th>
                                        <th className={styles['modal-thead-th']}>Prioridad</th>
                                    </tr>
                                </thead>
                                <tbody id={styles['modal-tbody']}>
                                    {console.log(editingCommitment)}
                                    <tr>
                                        <td className={styles['modal-td']}>
                                            {meetingData.length > 0 && meetingData[0].id_tipo_reunion === 1 || meetingData[0].id_tipo_reunion === 3 ? (
                                                <select name="project-select" id={styles['project-select']} defaultValue={editingCommitment.id_proyecto} {...registerEdit("project_id", {required: true})}>
                                                    {projects.map((project) => (
                                                        <option value={project.id_proyecto} key={project.id_proyecto}>{project.id_proyecto}</option>
                                                    ))}
                                                </select>
                                            )
                                            :
                                            (
                                                <span>{editingCommitment.id_proyecto}</span>
                                            )}
                                        </td>
                                        <td className={styles['modal-td']}>
                                            <select name="name_and_last_name_form" id={styles['name_and_last_name_form']} defaultValue={editingCommitment.responsable} {...registerEdit("name_and_last_name_form", {required: true})}>
                                                {staffInfo.map((staff) => (
                                                    <option value={staff.rut_personal} key={staff.rut_personal}>{staff.nombres} {staff.apellido_p} {staff.apellido_m}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={styles['modal-td']}>
                                            <input type="date" name="commitment-date" id={styles['commitment-date']} defaultValue={formatDateForInput(editingCommitment.fecha_comprometida)} {...registerEdit("commitment-date", {required: true})} />
                                        </td>
                                        <td className={styles['modal-td']}>
                                            <input type="text" name="commitment-text" id={styles['commitment-text']} defaultValue={editingCommitment.texto_compromiso} {...registerEdit("commitment-text", {required: true})} />
                                        </td>
                                        <td className={styles['modal-td']}>
                                            <input type="checkbox" name="priority" id={styles['priority']} defaultChecked={editingCommitment.prioridad} {...registerEdit("priority")} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <input type="hidden" value={editingCommitment.id_compromiso} {...registerEdit("id_commitment")} />
                            <input type="hidden" value={meetingData[0].id_tipo_reunion} {...registerEdit("id_meeting_type")} />
                            <div id={styles['modal-buttons']}>
                                <button id={styles['secondary-btn']} onClick={closeModal}>Cancelar</button>
                                <button type='submit' className={styles['primary-btn']}>Guardar Cambios</button>
                            </div>
                        </form>
                    )}
                </Modal>
                </section>
            </section>
            </>
        )}
        </>
    )
}