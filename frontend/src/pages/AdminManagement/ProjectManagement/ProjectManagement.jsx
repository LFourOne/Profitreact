import apiClient from '../../../services/api';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useForm} from 'react-hook-form';
import styles from './ProjectManagement.module.css';
import logo from '../../../assets/icon1.png'

export function ProjectManagement() {

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, setValue: setValueAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit } = useForm();

    const navigate = useNavigate();
    
    const [projects, setProjects] = useState([]);
    const [staff, setStaff] = useState([]);
    const [studyTypes, setStudyTypes] = useState([]);
    const [clients, setClients] = useState([]);
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [communes, setCommunes] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {

            const response = await apiClient.get('/admin/projects-management');

            setProjects(response.data.projects);
            setRegions(response.data.regions);
            setStaff(response.data.staff);
            setStudyTypes(response.data.study_types);
            setClients(response.data.clients);
            setLoading(false);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    const onSubmitAdd = async (data) => {
        try {

            const response = await apiClient.post('/admin/projects-management/add/process', data);

            handleCloseModal();
            fetchApi();

        } catch (error) {

            if (error.response && error.response.status === 400) {
                alert('Petición rechazada. Recuerda ingresar el rut del mandante')
            }

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

    const onSubmitEdit = async (data) => {
        try {
            
            const response = await apiClient.patch('/admin/projects-management/edit/process', data);

            handleCloseModal();
            fetchApi();

        } catch (error) {
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

    const handleOpenAddModal = () => {
        setSelectedProject(null);
        setModalType('add');
        setShowModal(true);
    }

    const handleOpenViewModal = (project) => {
        setModalType('view');
        setSelectedProject(project);
        setValueEdit('id_region', project.id_region ? project.id_region : '');
        setValueEdit('id_provincia', project.id_provincia ? project.id_provincia : '');
        setValueEdit('id_comuna', project.id_comuna ? project.id_comuna : '');
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
        setSelectedProject(null);
        setIsEditing(false);
        resetEdit();
        resetAdd();
        setProvinces([]);
        setCommunes([]);
        setValueAdd('id_provincia', '');
        setValueAdd('id_comuna', '');
        setValueEdit('id_provincia', '');
        setValueEdit('id_comuna', '');
    }

    const handleIsEditing = () => {
        setIsEditing(!isEditing);
    }

    const handleRegionChange = async (e) => {
        const regionId = e.target.value;

        if (provinces.length > 0) {
            setProvinces([]);
            setCommunes([]);
            setValueAdd('id_provincia', '');
            setValueAdd('id_comuna', '');
            setValueEdit('id_provincia', '');
            setValueEdit('id_comuna', '');
        }

        if (regionId) {
            try {
                const response = await apiClient.get(`/admin/api/get-provinces/${regionId}`);

                setProvinces(response.data.provinces);

            } catch (error) {
                console.error('Error al cargar las provincias:', error);
            }
        }
    }

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;

        if (communes.length > 0) {
            setCommunes([]);
            setValueAdd('id_comuna', '');
            setValueEdit('id_comuna', '');
        }

        if (provinceId) {
            try {
                const response = await apiClient.get(`/admin/api/get-communes/${provinceId}`);

                setCommunes(response.data.communes);

            } catch (error) {
                console.error('Error al cargar las comunas:', error);
            }
        }
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

    const getSelectValue = (value) => {
        return value !== null && value !== undefined ? String(value) : '';
    };

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Mantenedor de Proyectos</h1>
                        <p>Administra y gestiona todos los proyectos de Profit</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Proyectos</h1>
                        </div>
                        <div>
                            <button className={styles['add-client-button']} onClick={handleOpenAddModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear proyecto
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Proyecto</th>
                                    <th>Nombre</th>
                                    <th>Tipo de Estudio</th>
                                    <th>Jefe de Proyecto</th>
                                    <th>Fecha de Inicio</th>
                                    <th>Fecha de Término</th>
                                    <th>Mandante</th>
                                    <th>OT</th>
                                    <th>Región</th>
                                    <th>Provincia</th>
                                    <th>Comuna</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    projects.map((project) => (
                                        <tr key={project.id_proyecto} onClick={() => handleOpenViewModal(project)}>
                                            <td>{project.id_proyecto}</td>
                                            <td>{project.nombre}</td>
                                            <td>{project.id_tipo_estudio ? project.descripcion_tipo_estudio : 'N/A'}</td>
                                            <td>{project.nombres} {project.apellido_p} {project.apellido_m}</td>
                                            <td>{formatDate(project.fecha_inicio)}</td>
                                            <td>{formatDate(project.fecha_termino)}</td>
                                            <td>{project.nombre_mandante ? project.nombre_mandante : 'N/A'}</td>
                                            <td>{project.id_ot ? (project.id_ot === 1 && <span>Sí</span>) : 'No'}</td>
                                            <td>{project.region_nombre ? project.region_nombre : 'N/A'}</td>
                                            <td>{project.provincia_nombre ? project.provincia_nombre : 'N/A'}</td>
                                            <td>{project.comuna_nombre ? project.comuna_nombre : 'N/A'}</td>
                                            <td>{project.estado ? (project.estado === 1 && <span>Vigente</span>) : <span>Terminado</span>}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    {
                        showModal && (
                            <div className={styles['modal-overlay']} onClick={handleCloseModal}>
                                <div className={styles['modal']} onClick={(e) => e.stopPropagation()}>
                                    {/* Modal de Creación */}
                                    {
                                        modalType === 'add' && (
                                            <div className={styles['add']}>
                                                <header>
                                                    <h1>Crear Nuevo Proyecto</h1>
                                                    <div>
                                                        <button type='button' onClick={handleCloseModal} className={styles['close-button']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                </header>
                                                <form onSubmit={handleSubmitAdd(onSubmitAdd)} id='add-form'>
                                                    <fieldset>
                                                        <label>Proyecto</label>
                                                        <div className={styles['rut-container']}>
                                                            <input type="text" placeholder='Ingrese el código del proyecto' {...registerAdd('id_proyecto', {required: true})} />
                                                        </div>
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Nombre</label>
                                                        <input type="text" placeholder='Ingrese el nombre del proyecto' {...registerAdd('nombre', {required: true})} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Tipo de Estudio</label>
                                                        <select name="study_type" id="study_type" defaultValue='' {...registerAdd('id_tipo_estudio', {required: true})}>
                                                            <option value="" disabled>Seleccione un tipo de estudio</option>
                                                            {studyTypes.map(study => (
                                                                <option key={study.id_tipo_estudio} value={study.id_tipo_estudio}>{study.descripcion_tipo_estudio}</option>
                                                            ))}
                                                        </select>
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Jefe de Proyecto</label>
                                                        <select name="jefe_proyecto" id="jefe_proyecto" defaultValue='' {...registerAdd('jefe_proyectos', {required: true})}>
                                                            <option value="" disabled>Seleccione un jefe de proyecto</option>
                                                            {staff.map(staff => (
                                                                <option key={staff.rut_personal} value={staff.rut_personal}>{staff.nombres} {staff.apellido_p} {staff.apellido_m}</option>
                                                            ))}
                                                        </select>
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Fecha de Inicio</label>
                                                        <input type="date" {...registerAdd('fecha_inicio')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Fecha de Término</label>
                                                        <input type="date" {...registerAdd('fecha_termino')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>OT</label>
                                                        <select name="ot" id="ot" defaultValue='' {...registerAdd('id_ot', {required: true})}>
                                                            <option value="" disabled>Seleccione una opción</option>
                                                            <option value="1">Sí</option>
                                                            <option value="0">No</option>
                                                        </select>
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Región</label>
                                                        <select name="region" id="region" defaultValue='' {...registerAdd('id_region', {required: true, onChange: handleRegionChange})}>
                                                            <option value="" disabled>Seleccione una región</option>
                                                            {regions.map(region => (
                                                                <option key={region.id_region} value={region.id_region}>{region.region}</option>
                                                            ))}
                                                        </select>
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Provincia</label>
                                                        {
                                                            provinces.length > 0 ? (
                                                                <select name="provincia" id="provincia" defaultValue='' {...registerAdd('id_provincia', {required: true, onChange: handleProvinceChange})}>
                                                                    <option value="" disabled>Seleccione una provincia</option>
                                                                    {provinces.map(provincia => (
                                                                        <option key={provincia.id_provincia} value={provincia.id_provincia}>{provincia.provincia}</option>
                                                                    ))}
                                                                </select>
                                                            ) 
                                                            :
                                                            (
                                                                <span className={styles['disabled-input']}></span>
                                                            )}
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Comuna</label>
                                                        {
                                                            communes.length > 0 ? (
                                                                <select name="comuna" id="comuna" defaultValue='' {...registerAdd('id_comuna', {required: true})}>
                                                                    <option value="" disabled>Seleccione una comuna</option>
                                                                    {communes.map(comuna => (
                                                                        <option key={comuna.id_comuna} value={comuna.id_comuna}>{comuna.comuna}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <span className={styles['disabled-input']}></span>
                                                            )}
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Mandante</label>
                                                        <select name="mandante" id="mandante" defaultValue='' {...registerAdd('rut_mandante', {required: true})}>
                                                            <option value="" disabled>Seleccione una opción</option>
                                                            {clients.map(client => (
                                                                <option key={client.rut_mandante} value={client.rut_mandante}>
                                                                    {client.nombre_mandante}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </fieldset>
                                                    <input type="hidden" value="1" {...registerAdd('estado')} />
                                                    <footer>
                                                        <button type='submit' className={styles['add-button']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                                            Crear
                                                        </button>
                                                    </footer>
                                                </form>
                                            </div>
                                        )
                                    }
                                    {/* Modal de Visualización y Edición */}
                                    {
                                        modalType === 'view' && selectedProject && (
                                            <div className={styles['view']}>
                                                <header>
                                                    <div className={styles['view-left-container']}>
                                                            <h1>{selectedProject.id_proyecto}</h1>
                                                    </div>
                                                    <div className={styles['view-right-container']}>
                                                        {
                                                            isEditing ? (
                                                                <div className={styles['view-edit-buttons']}>
                                                                    <button type='submit' form='edit-form' className={styles['view-edit-button-primary']}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                                                        Guardar
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
                                                            isEditing ? (
                                                                <form onSubmit={handleSubmitEdit(onSubmitEdit)} id='edit-form'>
                                                                    <fieldset>
                                                                        <label>Proyecto</label>
                                                                        <input type="text" value={selectedProject.id_proyecto} {...registerEdit('id_proyecto')} />
                                                                        <input type="hidden" value={selectedProject.id_proyecto} {...registerEdit('original_id_proyecto')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Nombre</label>
                                                                        <input type="text" defaultValue={selectedProject.nombre ? selectedProject.nombre : ''} {...registerEdit('nombre')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Tipo de Estudio</label>
                                                                        <select name="study_type" id="study_type" defaultValue={selectedProject.id_tipo_estudio ? selectedProject.id_tipo_estudio : ''} {...registerEdit('id_tipo_estudio', {required: true})}>
                                                                            <option value="" disabled>Seleccione un tipo de estudio</option>
                                                                            {studyTypes.map(study => (
                                                                                <option key={study.id_tipo_estudio} value={study.id_tipo_estudio}>{study.descripcion_tipo_estudio}</option>
                                                                            ))}
                                                                            </select>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Jefe de Proyecto</label>
                                                                        <select name="staff" id="staff" defaultValue={selectedProject.jefe_proyectos ? selectedProject.jefe_proyectos : ''} {...registerEdit('jefe_proyectos', {required: true})}>
                                                                            <option value="" disabled>Seleccione un jefe de proyecto</option>
                                                                            {staff.map(staff => (
                                                                                <option key={staff.rut_personal} value={staff.rut_personal}>{staff.nombres} {staff.apellido_p} {staff.apellido_m}</option>
                                                                            ))}
                                                                        </select>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Fecha de Inicio</label>
                                                                        <input type="date" defaultValue={selectedProject.fecha_inicio ? formatDateForInput(selectedProject.fecha_inicio) : ''} {...registerEdit('fecha_inicio')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Fecha de Término</label>
                                                                        <input type="date" defaultValue={selectedProject.fecha_termino ? formatDateForInput(selectedProject.fecha_termino) : ''} {...registerEdit('fecha_termino')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Mandante</label>
                                                                        <select name="mandante" id="mandante" defaultValue={selectedProject.rut_mandante ? selectedProject.rut_mandante : ''} {...registerEdit('rut_mandante', {required: true})}>
                                                                            <option value="" disabled>Seleccione una opción</option>
                                                                            {clients.map(client => (
                                                                                <option key={client.rut_mandante} value={client.rut_mandante}>
                                                                                    {client.nombre_mandante}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>OT</label>
                                                                        <select name="ot" id="ot" defaultValue={getSelectValue(selectedProject.id_ot)} {...registerEdit('id_ot', {required: true})}>
                                                                            <option value="" disabled>Seleccione una opción</option>
                                                                            <option value="1">Sí</option>
                                                                            <option value="0">No</option>
                                                                        </select>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Región</label>
                                                                        <select name="region" id="region" defaultValue={selectedProject.id_region ? selectedProject.id_region : ''} {...registerEdit('id_region', { required: true, onChange: handleRegionChange })}>
                                                                            {regions.map(region => (
                                                                                <option key={region.id_region} value={region.id_region}>{region.region}</option>
                                                                            ))}
                                                                        </select>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Provincia</label>
                                                                        {
                                                                            provinces.length > 0 ? (
                                                                                <select name="provincia" id="provincia" defaultValue={selectedProject.id_provincia ? selectedProject.id_provincia : ''} {...registerEdit('id_provincia', { required: true, onChange: handleProvinceChange })}>
                                                                                    <option value="" disabled>Seleccione una provincia</option>
                                                                                    {provinces.map(provincia => (
                                                                                        <option key={provincia.id_provincia} value={provincia.id_provincia}>{provincia.provincia}</option>
                                                                                    ))}
                                                                                </select>
                                                                            )
                                                                            :
                                                                            (
                                                                                <span className={styles['disabled-input']}></span>
                                                                            )
                                                                        }
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Comuna</label>
                                                                        {
                                                                            communes.length > 0 ? (
                                                                                <select name="comuna" id="comuna" defaultValue={selectedProject.id_comuna ? selectedProject.id_comuna : ''} {...registerEdit('id_comuna', { required: true })}>
                                                                                    <option value="" disabled>Seleccione una comuna</option>
                                                                                    {communes.map(comuna => (
                                                                                        <option key={comuna.id_comuna} value={comuna.id_comuna}>{comuna.comuna}</option>
                                                                                    ))}
                                                                                </select>
                                                                            )
                                                                            :
                                                                            (
                                                                                <span className={styles['disabled-input']}></span>
                                                                            )
                                                                        }
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Estado</label>
                                                                        <select name="state" id="state" defaultValue={getSelectValue(selectedProject.estado)} {...registerEdit('estado', {required: true})}>
                                                                            <option value="" disabled>Seleccione una opción</option>
                                                                            <option value="1">Vigente</option>
                                                                            <option value="0">Terminado</option>
                                                                        </select>
                                                                    </fieldset>
                                                                </form>
                                                            )
                                                            :
                                                            (
                                                                <div className={styles['view-info-content']}>
                                                                    <fieldset>
                                                                        <label>Proyecto</label>
                                                                        <span>{selectedProject.id_proyecto}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Nombre</label>
                                                                        <span>{selectedProject.nombre ? selectedProject.nombre : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Tipo de Estudio</label>
                                                                        <span>{selectedProject.descripcion_tipo_estudio ? selectedProject.descripcion_tipo_estudio : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Jefe de Proyecto</label>
                                                                        <span>{selectedProject.jefe_proyectos ? `${selectedProject.nombres} ${selectedProject.apellido_p} ${selectedProject.apellido_m}` : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Fecha de Inicio</label>
                                                                        <span>{selectedProject.fecha_inicio ? formatDate(selectedProject.fecha_inicio) : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Fecha de Término</label>
                                                                        <span>{selectedProject.fecha_termino ? formatDate(selectedProject.fecha_termino) : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Mandante</label>
                                                                        <span>{selectedProject.nombre_mandante ? selectedProject.nombre_mandante : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>OT</label>
                                                                        <span>{selectedProject.id_ot && selectedProject.id_ot === 1 ? 'Sí' : 'No'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Región</label>
                                                                        <span>{selectedProject.region_nombre ? selectedProject.region_nombre : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Provincia</label>
                                                                        <span>{selectedProject.provincia_nombre ? selectedProject.provincia_nombre : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Comuna</label>
                                                                        <span>{selectedProject.comuna_nombre ? selectedProject.comuna_nombre : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Estado</label>
                                                                        <span>{selectedProject.estado && selectedProject.estado === 1 ? 'Vigente' : 'Terminado'}</span>
                                                                    </fieldset>
                                                                </div>
                                                            )
                                                        }
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        )
                    }
                </section>
            </main>
        )}
        </>
    )
}