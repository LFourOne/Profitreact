import apiClient from '../../../services/api';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useForm} from 'react-hook-form';
import styles from './MeetingTypeManagement.module.css';
import logo from '../../../assets/icon1.png'

export function MeetingTypeManagement() {

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, setValue: setValueAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit } = useForm();

    const [meetingTypes, setMeetingTypes] = useState([]);

    const [showModal, setShowModal] = useState(false);

    const [toggleEdit, setToggleEdit] = useState(false);
    const [selectedMeetingType, setSelectedMeetingType] = useState(null);

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await apiClient.get('/admin/meeting-type-management');

            setMeetingTypes(response.data.meeting_type);

            setLoading(false);
        } catch (error) {
            console.error('Error inesperado:', error);
        }
    }   

    const handleToggleEdit = (meeting_type) => {
        setToggleEdit(!toggleEdit);
        if (toggleEdit) {
            setSelectedMeetingType(null);
            setValueEdit("descripcion_tipo_reunion", "")
            setValueEdit("id_tipo_reunion", "")
        } else {
            setSelectedMeetingType(meeting_type);
            setValueEdit("descripcion_tipo_reunion", meeting_type.descripcion_tipo_reunion);
            setValueEdit("id_tipo_reunion", meeting_type.id_tipo_reunion);
        }
    }

    const handleOpenModal = () => {
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
        resetAdd();
    }

    useEffect(() => {
        fetchApi();
    }, []);

    const onSubmitAdd = async (data) => {

        const confirmed = window.confirm('¿Estás seguro de que deseas crear un nuevo tipo de reunión?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiClient.post('/admin/meeting-type-management/add', data);
            resetAdd();
            setShowModal(false);
            fetchApi();
        } catch (error) {
            console.error('Error inesperado:', error);
        }
    }

    const onSubmitEdit = async (data) => {

        const confirmed = window.confirm('¿Estás seguro de que deseas actualizar el tipo de reunión?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiClient.patch('/admin/meeting-type-management/update', data);
            resetEdit();
            setToggleEdit(false);
            fetchApi();
        } catch (error) {
            console.error('Error inesperado:', error);
        }
    }

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Mantenedor de Tipos de Reunión</h1>
                        <p>Administra y gestiona todos los tipos de reunión de Profit</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Tipos de Reunión</h1>
                        </div>
                        <div>
                            <button className={styles['meeting-type-button']} onClick={handleOpenModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear tipo de reunión
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Tipo de Reunión</th>
                                    <th>Editar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    meetingTypes.map((meetingType) => (
                                        <tr key={meetingType.id_tipo_reunion}>
                                            {
                                                toggleEdit && meetingType.id_tipo_reunion === selectedMeetingType.id_tipo_reunion ? (
                                                    <td>
                                                        <form onSubmit={handleSubmitEdit(onSubmitEdit)} id='update-form'>
                                                            <input type="text" {...registerEdit("descripcion_tipo_reunion")} />
                                                            <input type="hidden" value={selectedMeetingType.id_tipo_reunion} {...registerEdit("id_tipo_reunion")} />
                                                        </form>
                                                    </td>
                                                ) : (
                                                    <td>{meetingType.descripcion_tipo_reunion}</td>
                                                )
                                            }
                                            <td>
                                                <div>
                                                    {
                                                        toggleEdit && meetingType.id_tipo_reunion === selectedMeetingType.id_tipo_reunion && (
                                                            <button type="submit" form="update-form">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </button>
                                                        )
                                                    }
                                                    {
                                                        toggleEdit && meetingType.id_tipo_reunion === selectedMeetingType.id_tipo_reunion ? (
                                                            <button onClick={() => handleToggleEdit(meetingType)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                            </button>
                                                        ) 
                                                        : 
                                                        toggleEdit && meetingType.id_tipo_reunion !== selectedMeetingType.id_tipo_reunion ? (
                                                            null
                                                        )
                                                        :
                                                        (
                                                            <button onClick={() => handleToggleEdit(meetingType)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="16 3 21 8 8 21 3 21 3 16 16 3"></polygon></svg>
                                                            </button>
                                                        )
                                                    }
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
                        <div className={styles['modal-overlay']} onClick={handleCloseModal}>
                            <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                                <header>
                                    <h1>Crear tipo de reunión</h1>
                                </header>
                                <form onSubmit={handleSubmitAdd(onSubmitAdd)} id='add-form'>
                                    <fieldset>
                                        <label>Nombre del tipo de reunión</label>
                                        <input type="text" {...registerAdd('descripcion_tipo_reunion', {required: true})} />
                                    </fieldset>
                                </form>
                                <footer>
                                    <button type="submit" form='add-form'>
                                        Crear
                                    </button>
                                </footer>
                            </div>
                        </div>
                    )
                }
                
            </main>
        )}
        </>
    )
}