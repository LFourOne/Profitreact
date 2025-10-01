import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import apiClient from '../../../services/api';
import styles from './UserManagement.module.css';
import logo from '../../../assets/icon1.png'

export function UserManagement() {

    const navigate = useNavigate();

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit } = useForm();

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedStaff, setSelectedStaff] = useState(null);

    const [showPasswordInput, setShowPasswordInput] = useState(false);

    const [isEditing, setIsEditing] = useState(false);

    const [staff, setStaff] = useState([]);
    const [specialty, setSpecialty] = useState([]);
    const [position, setPosition] = useState([]);
    const [role, setRole] = useState([]);

    const [searchUser, setSearchUser] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [specialtyFilter, setSpecialtyFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('1');

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await apiClient.get('/admin/user-management');
            setStaff(response.data.staff);
            setSpecialty(response.data.specialty);
            setPosition(response.data.position);
            setRole(response.data.role);
        } 
        catch (error) {

            if (error.response && error.response.status === 401) {
                navigate('/');
            }

            if (error.response && error.response.status === 403) {
                navigate('/');
            }

            else {
                navigate('/');
            }
            
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    const handleOpenAddModal = () => {
        setModalType('add');
        setSelectedStaff(null);
        setShowModal(true);
        document.body.style.overflowY = 'hidden';
    };

    const handleOpenViewModal = (staff) => {
        setModalType('view');
        setSelectedStaff(staff);
        setShowModal(true);
        document.body.style.overflowY = 'hidden';
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
        setSelectedStaff(null);
        setIsEditing(false);
        setShowPasswordInput(false);
        resetEdit();
        resetAdd();
        document.body.style.overflowY = 'unset';
    };

    const handleIsEditing = () => {
        setIsEditing(!isEditing);
        setShowPasswordInput(false);
    }

    const onSubmitAdd = async (data) => {
        try {
            const response = await apiClient.post('/admin/user-management/register/process', data);

            setShowModal(false);
            resetAdd();
            fetchApi();
        } 
        catch (error) {

            if (error.response && error.response.status === 401) {
                navigate('/');
            }

            if (error.response && error.response.status === 403) {
                navigate('/');
            }

            else {
                console.error(error);
            }
        }
    }

    const onSubmitEdit = async (data) => {
        try {
            const response = await apiClient.patch(`/admin/user-management/edit/process`, data);

            setShowModal(false);
            setSelectedStaff(null);
            setIsEditing(false);
            setShowPasswordInput(false);
            resetEdit();
            fetchApi();
        }
        catch (error) {

            if (error.response && error.response.status === 401) {
                navigate('/');
            }

            if (error.response && error.response.status === 403) {
                navigate('/');
            }

            else {
                console.error(error);
            }
        }
    };
        
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

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Mantenedor de Personas</h1>
                        <p>Administra y gestiona todos los usuarios de Profit</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['filter-section']}>
                    <header>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                        <h1>Filtrar Usuarios</h1>
                    </header>
                    <div className={styles['content']}>
                        <div className={styles['filter-input']}>
                            <label htmlFor="search">Buscar nombre</label>
                            <input type="text" id="search" placeholder="Buscar nombre y apellidos" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} />
                        </div>
                        <div className={styles['filter-input']}>
                            <label>Rol</label>
                            <select onChange={(e) => setRoleFilter(e.target.value)}>
                                <option value="">Todos</option>
                                {role.map((role) => (
                                    <option key={role.id_rol} value={role.id_rol}>{role.rol}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['filter-input']}>
                            <label>Especialidad</label>
                            <select onChange={(e) => setSpecialtyFilter(e.target.value)}>
                                <option value="">Todas</option>
                                {specialty.map((specialty) => (
                                    <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.especialidad}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['filter-input']}>
                            <label>Estado</label>
                            <select onChange={(e) => setStateFilter(e.target.value)}>
                                <option value="1">Activo</option>
                                <option value="2">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Usuarios</h1>
                        </div>
                        <div>
                            <button onClick={handleOpenAddModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear Usuario
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Usuario</th>
                                    <th>RUT</th>
                                    <th>Iniciales</th>
                                    <th>Rol</th>
                                    <th>Especialidad</th>
                                    <th>Reporta HH</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    staff
                                    .filter((staff) => (roleFilter === "" || staff.id_rol === Number(roleFilter)) && (specialtyFilter === "" || staff.id_especialidad === Number(specialtyFilter)) && (stateFilter === "1" ? staff.estado : !staff.estado) && (searchUser === "" || `${staff.nombres} ${staff.apellido_p} ${staff.apellido_m}`.toLowerCase().includes(searchUser.toLowerCase())))
                                    .map((staff) => (
                                        <tr key={staff.rut_personal} onClick={() => handleOpenViewModal(staff)}>
                                            <td>
                                                <div className={styles['user-info']}>
                                                    <div className={styles['user-avatar']}>
                                                        <span>{staff.iniciales_nombre}</span>
                                                    </div>
                                                    <div className={styles['user-details']}>
                                                        <span>{staff.nombres} {staff.apellido_p} {staff.apellido_m}</span>
                                                        <span className={styles['email']}>{staff.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{staff.rut_personal}-{staff.digito_verificador}</td>
                                            <td>{staff.iniciales_nombre}</td>
                                            <td>{staff.rol}</td>
                                            <td>{staff.especialidad}</td>
                                            <td>
                                                {staff.reporta_hh ? 'Sí' : 'No'}
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <div>
                        {
                            showModal && (
                                <div className={styles['modal-overlay']} onClick={handleCloseModal}>
                                    <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>

                                        {/* Modal de Registro de Usuario */}

                                        {modalType === 'add' && (
                                            <div className={styles['add']}>
                                                <header className={styles['add-header']}>
                                                    <h1>Crear Nuevo Usuario</h1>
                                                    <div>
                                                        <button type='button' onClick={handleCloseModal} className={styles['close-button']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                </header>
                                                <form onSubmit={handleSubmitAdd(onSubmitAdd)} className={styles['add-form']}>
                                                    <div className={styles['add-info-container']}>
                                                        <header className={styles['add-info-header']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                            <h1>Información de Acceso</h1>
                                                        </header>
                                                        <div className={styles['add-info-content']}>
                                                            <div className={styles['add-info-item']}>
                                                                <label>RUT</label>
                                                                <div className={styles['add-rut-container']}>
                                                                    <input type="number" className={styles['add-input']} placeholder='12345678' {...registerAdd('rut_personal', {required: true})} />
                                                                    <input type="text" className={styles['add-input-verificator']} placeholder='0 / K' {...registerAdd('digito_verificador', {required: true})} />
                                                                </div>
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Email</label>
                                                                <input type="email" className={styles['add-input']} placeholder='Ingresar correo electrónico' {...registerAdd('email', {required: true})} />
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Contraseña</label>
                                                                <input type="password" className={styles['add-input']} placeholder='Ingresar contraseña' {...registerAdd('password', {required: true})} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles['add-info-container']}>
                                                        <header className={styles['add-info-header']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                            <h1>Información Personal</h1>
                                                        </header>
                                                        <div className={styles['add-info-content']}>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Nombres</label>
                                                                <input type="text" className={styles['add-input']} placeholder='Ingresar nombres' {...registerAdd('nombres', {required: true})} />
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Apellido Paterno</label>
                                                                <input type="text" className={styles['add-input']} placeholder='Ingresar apellido paterno' {...registerAdd('apellido_p', {required: true})} />
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Apellido Materno</label>
                                                                <input type="text" className={styles['add-input']} placeholder='Ingresar apellido materno' {...registerAdd('apellido_m', {required: true})} />
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Fecha de Nacimiento</label>
                                                                <input type="date" className={styles['add-input']} {...registerAdd('fecha_nacimiento', {required: true})} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={styles['add-info-container']}>
                                                        <header className={styles['add-info-header']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                                            <h1>Información Laboral</h1>
                                                        </header>
                                                        <div className={styles['add-info-content']}>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Rol</label>
                                                                <select className={styles['add-input']} defaultValue="" {...registerAdd('id_rol', {required: true})}>
                                                                    <option value="" disabled>Seleccionar rol</option>
                                                                    {role.map((role) => (
                                                                        <option key={role.id_rol} value={role.id_rol}>{role.rol}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Cargo</label>
                                                                <select className={styles['add-input']} defaultValue="" {...registerAdd('id_cargo', {required: true})}>
                                                                    <option value="" disabled>Seleccionar cargo</option>
                                                                    {
                                                                        position.map((position) =>(
                                                                            <option key={position.id_cargo} value={position.id_cargo}>{position.cargo}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Especialidad</label>
                                                                <select className={styles['add-input']} defaultValue="" {...registerAdd('id_especialidad', {required: true})}>
                                                                    <option value="" disabled>Seleccionar especialidad</option>
                                                                    {specialty.map((specialty) => (
                                                                        <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.especialidad}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Reporta HH</label>
                                                                <select className={styles['add-input']} defaultValue="" {...registerAdd('reporta_hh', {required: true})}>
                                                                    <option value="" disabled>Seleccionar opción</option>
                                                                    <option value="1">Sí</option>
                                                                    <option value="0">No</option>
                                                                </select>
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Iniciales</label>
                                                                <input type="text" className={styles['add-input']} placeholder='Ingresar iniciales' {...registerAdd('iniciales_nombre', {required: true})} />
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Usuario</label>
                                                                <input type="text" className={styles['add-input']} placeholder='Ingresar nombre de usuario' {...registerAdd('usuario', {required: true})} />
                                                            </div>
                                                            <div className={styles['add-info-item']}>
                                                                <label>Fecha de Contratación</label>
                                                                <input type="date" className={styles['add-input']} {...registerAdd('fecha_contratacion', {required: true})} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <footer>
                                                        <button type='submit' className={styles['add-button']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                                            Crear
                                                        </button>
                                                    </footer>
                                                </form>
                                            </div>
                                        )}

                                        {/* Modal de Visualización y Edición */}

                                        {modalType === 'view' && selectedStaff && (
                                            <div className={styles['view']}>
                                                <header className={styles['view-header']}>
                                                    <div className={styles['view-left-container']}>
                                                        <div className={styles['view-user-avatar']}>
                                                            <span>{selectedStaff.iniciales_nombre}</span>
                                                        </div>
                                                        <div className={styles['view-user-details']}>
                                                            <h1>{selectedStaff.nombres} {selectedStaff.apellido_p} {selectedStaff.apellido_m}</h1>
                                                            <span>@{selectedStaff.usuario}</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles['view-right-container']}>
                                                        {
                                                            isEditing ? (
                                                                <div className={styles['view-edit-buttons']}>
                                                                    <button type='submit' form='edit-form' className={styles['view-edit-button-primary']}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                                                        Guardar
                                                                    </button>
                                                                    <button type="button" className={styles['view-edit-button-secondary']} onClick={() => setShowPasswordInput((v) => !v)}>
                                                                        {showPasswordInput ? 'Volver Atrás' : 'Cambiar contraseña'}
                                                                    </button>
                                                                    <button type='button' onClick={handleIsEditing} className={styles['view-edit-button-secondary']}>
                                                                        Cancelar
                                                                    </button>
                                                                </div>
                                                            ) 
                                                            : 
                                                            (
                                                                <button type='button' onClick={handleIsEditing} className={styles['view-edit-button-primary']}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
                                                                    Editar
                                                                </button>
                                                            )
                                                        }
                                                    </div>
                                                </header>
                                                <div className={styles['view-content']}>
                                                    {
                                                        isEditing ?
                                                        (
                                                            <form onSubmit={handleSubmitEdit(onSubmitEdit)} id='edit-form'>
                                                                <div className={styles['view-info-container']}>
                                                                    <header className={styles['view-info-header']}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                                        <h1>Información Personal</h1>
                                                                    </header>
                                                                    <div className={styles['view-info-content']}>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>RUT</label>
                                                                            <div>
                                                                                <input type="number" defaultValue={selectedStaff.rut_personal} className={styles['edit-input']} {...registerEdit('rut_personal', {required: true})} />
                                                                                <input type="text" defaultValue={selectedStaff.digito_verificador} className={styles['edit-input-verificator']} {...registerEdit('digito_verificador', {required: true})} />
                                                                                <input type="hidden" defaultValue={selectedStaff.rut_personal} {...registerEdit('rut_personal_old')} />
                                                                            </div>
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Usuario</label>
                                                                            <input type="text" defaultValue={selectedStaff.usuario} className={styles['edit-input']} {...registerEdit('usuario', {required: true})} />
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Nombres</label>
                                                                            <input type="text" defaultValue={selectedStaff.nombres} className={styles['edit-input']} {...registerEdit('nombres', {required: true})} />
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Apellido Paterno</label>
                                                                            <input type="text" defaultValue={selectedStaff.apellido_p} className={styles['edit-input']} {...registerEdit('apellido_p', {required: true})} />
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Apellido Materno</label>
                                                                            <input type="text" defaultValue={selectedStaff.apellido_m} className={styles['edit-input']} {...registerEdit('apellido_m', {required: true})} />
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Fecha de Nacimiento</label>
                                                                            <input type="date" defaultValue={formatDateForInput(selectedStaff.fecha_nacimiento)} className={styles['edit-input']} {...registerEdit('fecha_nacimiento', {required: true})} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={styles['view-info-container']}>
                                                                    <header className={styles['view-info-header']}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                                        <h1>Información de Contacto</h1>
                                                                    </header>
                                                                    <div className={styles['view-info-content']}>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Email</label>
                                                                            <input type="email" defaultValue={selectedStaff.email} className={styles['edit-input']} {...registerEdit('email', {required: true})} />
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Teléfono</label>
                                                                            <input type="tel" defaultValue={selectedStaff.telefono} className={styles['edit-input']} {...registerEdit('telefono')} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={styles['view-info-container']}>
                                                                    <header className={styles['view-info-header']}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                                                        <h1>Información Laboral</h1>
                                                                    </header>
                                                                    <div className={styles['view-info-content']}>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Rol</label>
                                                                            <select defaultValue={selectedStaff.id_rol} className={styles['edit-input']} {...registerEdit('id_rol', {required: true})}>
                                                                                {role.map((role) => (
                                                                                    <option key={role.id_rol} value={role.id_rol}>{role.rol}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Especialidad</label>
                                                                            <select defaultValue={selectedStaff.id_especialidad} className={styles['edit-input']} {...registerEdit('id_especialidad', {required: true})}>
                                                                                {specialty.map((specialty) => (
                                                                                    <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.especialidad}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Cargo</label>
                                                                            <select defaultValue={selectedStaff.id_cargo ? selectedStaff.id_cargo : ''} className={styles['edit-input']} {...registerEdit('id_cargo', {required: true})}>
                                                                                <option value="">Seleccione un cargo</option>
                                                                                {position.map((position) => (
                                                                                    <option key={position.id_cargo} value={position.id_cargo}>{position.cargo}</option>
                                                                                ))}
                                                                            </select>
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Estado</label>
                                                                            <select defaultValue={selectedStaff.estado} className={styles['edit-input']} {...registerEdit('estado', {required: true})}>
                                                                                <option value="1">Activo</option>
                                                                                <option value="0">Inactivo</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Reporta HH</label>
                                                                            <select defaultValue={selectedStaff.reporta_hh} className={styles['edit-input']} {...registerEdit('reporta_hh', {required: true})}>
                                                                                <option value="1">Sí</option>
                                                                                <option value="0">No</option>
                                                                            </select>
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Iniciales</label>
                                                                            <input type="text" defaultValue={selectedStaff.iniciales_nombre} className={styles['edit-input']} {...registerEdit('iniciales_nombre', {required: true})} />
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Fecha de Contratación</label>
                                                                            <input type="date" defaultValue={formatDateForInput(selectedStaff.fecha_contratacion)} className={styles['edit-input']} {...registerEdit('fecha_contratacion', {required: true})} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className={styles['view-info-container']}>
                                                                    <header className={styles['view-info-header']}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                                                        <h1>Configuración y Metadatos</h1>
                                                                    </header>
                                                                    <div className={styles['view-info-content']}>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Color de Usuario</label>
                                                                            <input type="color" defaultValue={selectedStaff.color} className={styles['edit-input']} {...registerEdit('color', {required: true})} />
                                                                        </div>
                                                                        {showPasswordInput && (
                                                                            <div className={styles['view-info-item']}>
                                                                                <label>Nueva Contraseña</label>
                                                                                <input type="password" className={styles['edit-input']} placeholder="Ingresar contraseña" {...registerEdit('password')} />
                                                                            </div>
                                                                        )}
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Fecha de Creación</label>
                                                                            <span>{formatDate(selectedStaff.creado_en)}</span>
                                                                        </div>
                                                                        <div className={styles['view-info-item']}>
                                                                            <label>Última Actualización</label>
                                                                            <span>{formatDate(selectedStaff.modificado_en)}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        )
                                                        :
                                                        (
                                                            <>
                                                            {/* Modal de Visualización */}
                                                            <div className={styles['view-info-container']}>
                                                                <header className={styles['view-info-header']}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                                    <h1>Información Personal</h1>
                                                                </header>
                                                                <div className={styles['view-info-content']}>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>RUT</label>
                                                                        <span>{selectedStaff.rut_personal}-{selectedStaff.digito_verificador}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Usuario</label>
                                                                        <span>{selectedStaff.usuario}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Nombres</label>
                                                                        <span>{selectedStaff.nombres}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Apellido Paterno</label>
                                                                        <span>{selectedStaff.apellido_p}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Apellido Materno</label>
                                                                        <span>{selectedStaff.apellido_m}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Fecha de Nacimiento</label>
                                                                        <span>{formatDate(selectedStaff.fecha_nacimiento)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={styles['view-info-container']}>
                                                                <header className={styles['view-info-header']}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                                    <h1>Información de Contacto</h1>
                                                                </header>
                                                                <div className={styles['view-info-content']}>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Email</label>
                                                                        <span>{selectedStaff.email}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Teléfono</label>
                                                                        <span>{selectedStaff.telefono}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={styles['view-info-container']}>
                                                                <header className={styles['view-info-header']}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                                                    <h1>Información Laboral</h1>
                                                                </header>
                                                                <div className={styles['view-info-content']}>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Rol</label>
                                                                        <span>{selectedStaff.rol}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Especialidad</label>
                                                                        <span>{selectedStaff.especialidad}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Cargo</label>
                                                                        <span>{selectedStaff.cargo ? selectedStaff.cargo : 'N/A'}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Estado</label>
                                                                        <span>{selectedStaff.estado ? 'Activo' : 'Inactivo'}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Reporta HH</label>  
                                                                        <span>{selectedStaff.reporta_hh ? 'Sí' : 'No'}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Iniciales</label>
                                                                        <span>{selectedStaff.iniciales_nombre}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Fecha de Contratación</label>
                                                                        <span>{formatDate(selectedStaff.fecha_contratacion)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={styles['view-info-container']}>
                                                                <header className={styles['view-info-header']}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                                                    <h1>Configuración y Metadatos</h1>
                                                                </header>
                                                                <div className={styles['view-info-content']}>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Color de Usuario</label>
                                                                        <div>
                                                                            <div style={{width: '20px', height: '20px', backgroundColor: selectedStaff.color}}></div>
                                                                            <span>{selectedStaff.color}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Fecha de Creación</label>
                                                                        <span>{formatDate(selectedStaff.creado_en)}</span>
                                                                    </div>
                                                                    <div className={styles['view-info-item']}>
                                                                        <label>Última Actualización</label>
                                                                        <span>{formatDate(selectedStaff.modificado_en)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </section>
            </main>
        )}
        </>
    )
}