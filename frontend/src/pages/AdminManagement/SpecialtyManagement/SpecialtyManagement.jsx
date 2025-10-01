import apiClient from '../../../services/api';
import { useState, useEffect } from 'react';
import { useForm} from 'react-hook-form';
import styles from './SpecialtyManagement.module.css';
import logo from '../../../assets/icon1.png'

export function SpecialtyManagement() {

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, setValue: setValueAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit } = useForm();

    const [specialties, setSpecialties] = useState([]);
    const [staff, setStaff] = useState([]);

    const [showModal, setShowModal] = useState(false);

    const [toggleEdit, setToggleEdit] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await apiClient.get('/admin/specialty-management');

            setSpecialties(response.data.specialties);
            setStaff(response.data.staff);

            setLoading(false);
        } catch (error) {
            console.error('Error inesperado:', error);
        }
    }   

    const handleToggleEdit = (specialty) => {
        setToggleEdit(!toggleEdit);
        if (toggleEdit) {
            setSelectedSpecialty(null);
            setValueEdit("especialidad", "")
            setValueEdit("id_especialidad", "")
            setValueEdit("jefe_especialidad", "")
            setValueEdit("color_especialidad", "")
        } else {
            setSelectedSpecialty(specialty);
            setValueEdit("especialidad", specialty.especialidad);
            setValueEdit("id_especialidad", specialty.id_especialidad);
            setValueEdit("jefe_especialidad", specialty.jefe_especialidad);
            setValueEdit("color_especialidad", specialty.color_especialidad);
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

        const confirmed = window.confirm('¿Estás seguro de que deseas crear una nueva especialidad?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiClient.post('/admin/specialty-management/add', data);
            resetAdd();
            setShowModal(false);
            fetchApi();
        } catch (error) {
            console.error('Error inesperado:', error);
        }
    }

    const onSubmitEdit = async (data) => {

        const confirmed = window.confirm('¿Estás seguro de que deseas actualizar la especialidad?');
        if (!confirmed) {
            return;
        }

        try {
            const response = await apiClient.patch('/admin/specialty-management/update', data);
            resetEdit();
            handleToggleEdit();
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
                        <h1>Mantenedor de Especialidades</h1>
                        <p>Administra y gestiona todas las especialidades de Profit</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Especialidades</h1>
                        </div>
                        <div>
                            <button className={styles['meeting-type-button']} onClick={handleOpenModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear especialidad
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Especialidad</th>
                                    <th>Color</th>
                                    <th>Jefe de Especialidad</th>
                                    <th>Editar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    specialties.map((specialty) => (
                                        <tr key={specialty.id_especialidad}>
                                            {
                                                toggleEdit && specialty.id_especialidad === selectedSpecialty.id_especialidad ? (
                                                    <>
                                                    <form onSubmit={handleSubmitEdit(onSubmitEdit)} id='update-form'></form>
                                                        <td>
                                                            <input type="text" form='update-form' {...registerEdit("especialidad")} />
                                                            <input type="hidden" form='update-form' value={selectedSpecialty.id_especialidad} {...registerEdit("id_especialidad")} />
                                                        </td>
                                                        <td>
                                                            <input type="color" form='update-form' className={styles['input-color']} defaultValue={specialty.color_especialidad} {...registerEdit("color_especialidad")} />
                                                        </td>
                                                        <td>
                                                            <select form='update-form' defaultValue={specialty.jefe_especialidad} {...registerEdit("jefe_especialidad")}>
                                                                <option value="" disabled>Selecciona una opción</option>
                                                                <option value="NA">Sin Jefe de Especialidad | N/A</option>
                                                                {
                                                                    staff.map((staff) => (
                                                                        <option key={staff.rut_personal} value={staff.rut_personal}>
                                                                            {staff.nombres} {staff.apellido_p} {staff.apellido_m}
                                                                        </option>
                                                                    ))
                                                                }
                                                            </select>
                                                        </td>
                                                    </>
                                                    
                                                ) : (
                                                    <>
                                                    <td>{specialty.especialidad}</td>
                                                    <td><div style={{ backgroundColor: specialty.color_especialidad, width: '20px', height: '20px' }}></div></td>
                                                    <td>{specialty.nombres} {specialty.apellido_p} {specialty.apellido_m}</td>
                                                    </>
                                                )
                                            }
                                            
                                            <td>
                                                <div>
                                                    {
                                                        toggleEdit && specialty.id_especialidad === selectedSpecialty.id_especialidad && (
                                                            <button type="submit" form="update-form">
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            </button>
                                                        )
                                                    }
                                                    {
                                                        toggleEdit && specialty.id_especialidad === selectedSpecialty.id_especialidad ? (
                                                            <button onClick={() => handleToggleEdit(specialty)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                            </button>
                                                        )
                                                        :
                                                        toggleEdit && specialty.id_especialidad !== selectedSpecialty.id_especialidad ? (
                                                            null
                                                        )
                                                        :
                                                        (
                                                            <button onClick={() => handleToggleEdit(specialty)}>
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
                                    <h1>Crear especialidad</h1>
                                </header>
                                <form onSubmit={handleSubmitAdd(onSubmitAdd)} id='add-form'>
                                    <fieldset>
                                        <label>Nombre de la especialidad</label>
                                        <input type="text" {...registerAdd('especialidad', {required: true})} />
                                    </fieldset>
                                    <fieldset>
                                        <label>Color de la especialidad</label>
                                        <input type="color" {...registerAdd('color_especialidad', {required: true})} />
                                    </fieldset>
                                    <fieldset>
                                        <label>Jefe de la especialidad</label>
                                        <select {...registerAdd('jefe_especialidad', {required: true})}>
                                            <option value="" disabled>Seleccionar jefe de especialidad</option>
                                            <option value="NA">Sin Jefe de Especialidad | N/A</option>
                                            {
                                                staff.map((staff) => (
                                                    <option key={staff.rut_personal} value={staff.rut_personal}>
                                                        {staff.nombres} {staff.apellido_p} {staff.apellido_m}
                                                    </option>
                                                ))
                                            }
                                        </select>
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