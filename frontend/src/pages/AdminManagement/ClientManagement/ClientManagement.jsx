import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { set, useForm } from 'react-hook-form';
import apiClient from '../../../services/api';
import styles from './ClientManagement.module.css';
import logo from '../../../assets/icon1.png'

export function ClientManagement() {

    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, setValue: setValueAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, setValue: setValueEdit } = useForm();
    
    const navigate = useNavigate();
    
    const [clients, setClients] = useState([]);
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [communes, setCommunes] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {

            const response = await apiClient.get('/admin/clients-management');

            setClients(response.data.clients);
            setRegions(response.data.regions);
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
        
        const confirmed = window.confirm('¿Estás seguro de que deseas crear un nuevo mandante?');
        if (!confirmed) {
            return;
        }

        try {

            const response = await apiClient.post('/admin/clients-management/add/process', data);

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

        const confirmed = window.confirm('¿Estás seguro de que deseas editar este mandante?');
        if (!confirmed) {
            return;
        }

        try {
            
            const response = await apiClient.patch('/admin/clients-management/edit/process', data);

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
        setSelectedClient(null);
        setModalType('add');
        setShowModal(true);
    }

    const handleOpenViewModal = (client) => {
        setModalType('view');
        setSelectedClient(client);
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setShowModal(false);
        setModalType('');
        setSelectedClient(null);
        setIsEditing(false);
        resetEdit();
        resetAdd();
        setProvinces([]);
        setCommunes([]);
        setValueAdd('id_provincia', '');
        setValueAdd('id_comuna', '');
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

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Mantenedor de Mandantes</h1>
                        <p>Administra y gestiona todos los mandantes de Profit</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Mandantes</h1>
                        </div>
                        <div>
                            <button className={styles['add-client-button']} onClick={handleOpenAddModal}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear mandante
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th>RUT</th>
                                    <th>Nombre</th>
                                    <th>Dirección</th>
                                    <th>Región</th>
                                    <th>Provincia</th>
                                    <th>Comuna</th>
                                    <th>Giro</th>
                                    <th>Teléfono</th>
                                    <th>E-Mail</th>
                                    <th>Sitio Web</th>
                                    <th>Nombre de Contacto</th>
                                    <th>Teléfono de Contacto</th>
                                    <th>Email de Contacto</th>
                                    <th>Fecha de Creación</th>
                                    <th>Fecha de Modificación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    clients.map((client) => (
                                        <tr key={client.rut_mandante} onClick={() => handleOpenViewModal(client)}>
                                            <td>{client.rut_mandante}-{client.digito_verificador_mandante}</td>
                                            <td>{client.nombre_mandante}</td>
                                            <td>{client.direccion}</td>
                                            <td>{client.region_nombre}</td>
                                            <td>{client.id_provincia ? client.provincia_nombre : 'N/A'}</td>
                                            <td>{client.id_comuna ? client.comuna_nombre : 'N/A'}</td>
                                            <td>{client.giro ? client.giro : 'N/A'}</td>
                                            <td>{client.telefono ? client.telefono : 'N/A'}</td>
                                            <td>{client.email ? client.email : 'N/A'}</td>
                                            <td>{client.sitio_web ? <a href={client.sitio_web} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>{client.sitio_web}</a> : 'N/A'}</td>
                                            <td>{client.nombre_contacto ? client.nombre_contacto : 'N/A'}</td>
                                            <td>{client.telefono_contacto ? client.telefono_contacto : 'N/A'}</td>
                                            <td>{client.email_contacto ? client.email_contacto : 'N/A'}</td>
                                            <td>{formatDate(client.creado_en)}</td>
                                            <td>{formatDate(client.modificado_en)}</td>
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
                                                    <h1>Crear Nuevo Mandante</h1>
                                                    <div>
                                                        <button type='button' onClick={handleCloseModal} className={styles['close-button']}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                        </button>
                                                    </div>
                                                </header>
                                                <form onSubmit={handleSubmitAdd(onSubmitAdd)} id='add-form'>
                                                    <fieldset>
                                                        <label>RUT</label>
                                                        <div className={styles['rut-container']}>
                                                            <input type="text" className={styles['rut']} placeholder='Ingrese el RUT del mandante' {...registerAdd('rut_mandante', {required: true})} />
                                                            <input type="text" className={styles['rut-verificator']} placeholder='Ingrese el dígito verificador' {...registerAdd('digito_verificador_mandante', {required: true})} />
                                                        </div>
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Nombre</label>
                                                        <input type="text" placeholder='Ingrese el nombre del mandante' {...registerAdd('nombre_mandante')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Dirección</label>
                                                        <input type="text" placeholder='Ingrese la dirección del mandante' {...registerAdd('direccion')} />
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
                                                        <label>Giro</label>
                                                        <input type="text" placeholder='Ingrese el giro del mandante' {...registerAdd('giro')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Teléfono</label>
                                                        <input type="text" placeholder='Ingrese el teléfono del mandante' {...registerAdd('telefono')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Email</label>
                                                        <input type="text" placeholder='Ingrese el email del mandante' {...registerAdd('email')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Nombre de Contacto</label>
                                                        <input type="text" placeholder='Ingrese el nombre de contacto' {...registerAdd('nombre_contacto')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Teléfono de Contacto</label>
                                                        <input type="text" placeholder='Ingrese el teléfono de contacto' {...registerAdd('telefono_contacto')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Email de Contacto</label>
                                                        <input type="text" placeholder='Ingrese el email de contacto' {...registerAdd('email_contacto')} />
                                                    </fieldset>
                                                    <fieldset>
                                                        <label>Sitio Web</label>
                                                        <input type="text" placeholder='Ingrese el sitio web' {...registerAdd('sitio_web')} />
                                                    </fieldset>
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
                                        modalType === 'view' && selectedClient && (
                                            <div className={styles['view']}>
                                                <header>
                                                    <div className={styles['view-left-container']}>
                                                            <h1>{selectedClient.nombre_mandante}</h1>
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
                                                                        <label>RUT</label>
                                                                        <span>{selectedClient.rut_mandante}-{selectedClient.digito_verificador_mandante}</span>
                                                                        <input type="hidden" value={selectedClient.rut_mandante} {...registerEdit('rut_mandante', { required: true })} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Nombre</label>
                                                                        <input type="text" defaultValue={selectedClient.nombre_mandante ? selectedClient.nombre_mandante : ''} {...registerEdit('nombre_mandante', { required: true })} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Dirección</label>
                                                                        <input type="text" defaultValue={selectedClient.direccion ? selectedClient.direccion : ''} {...registerEdit('direccion', { required: true })} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Región</label>
                                                                        <select name="region" id="region" defaultValue={selectedClient.id_region ? selectedClient.id_region : ''} {...registerEdit('id_region', { required: true, onChange: handleRegionChange })}>
                                                                            {regions.map(region => (
                                                                                <option key={region.id_region} value={region.id_region}>{region.region}</option>
                                                                            ))}
                                                                        </select>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Provincia</label>
                                                                        {
                                                                            provinces.length > 0 ? (
                                                                                <select name="provincia" id="provincia" defaultValue={selectedClient.id_provincia ? selectedClient.id_provincia : ''} {...registerEdit('id_provincia', { required: true, onChange: handleProvinceChange })}>
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
                                                                                <select name="comuna" id="comuna" defaultValue={selectedClient.id_comuna ? selectedClient.id_comuna : ''} {...registerEdit('id_comuna', { required: true })}>
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
                                                                        <label>Giro</label>
                                                                        <input type="text" defaultValue={selectedClient.giro ? selectedClient.giro : ''} {...registerEdit('giro')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Teléfono</label>
                                                                        <input type="text" defaultValue={selectedClient.telefono ? selectedClient.telefono : ''} {...registerEdit('telefono')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Email</label>
                                                                        <input type="text" defaultValue={selectedClient.email ? selectedClient.email : ''} {...registerEdit('email')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Nombre de Contacto</label>
                                                                        <input type="text" defaultValue={selectedClient.nombre_contacto ? selectedClient.nombre_contacto : ''} {...registerEdit('nombre_contacto')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Teléfono de Contacto</label>
                                                                        <input type="text" defaultValue={selectedClient.telefono_contacto ? selectedClient.telefono_contacto : ''} {...registerEdit('telefono_contacto')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Email de Contacto</label>
                                                                        <input type="text" defaultValue={selectedClient.email_contacto ? selectedClient.email_contacto : ''} {...registerEdit('email_contacto')} />
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Sitio Web</label>
                                                                        <input type="text" defaultValue={selectedClient.sitio_web ? selectedClient.sitio_web : ''} {...registerEdit('sitio_web')} />
                                                                    </fieldset>
                                                                </form>
                                                            )
                                                            :
                                                            (
                                                                <div className={styles['view-info-content']}>
                                                                    <fieldset>
                                                                        <label>RUT</label>
                                                                        <span>{selectedClient.rut_mandante}-{selectedClient.digito_verificador_mandante}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Nombre</label>
                                                                        <span>{selectedClient.nombre_mandante ? selectedClient.nombre_mandante : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Dirección</label>
                                                                        <span>{selectedClient.direccion ? selectedClient.direccion : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Región</label>
                                                                        <span>{selectedClient.region_nombre ? selectedClient.region_nombre : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Provincia</label>
                                                                        <span>{selectedClient.provincia_nombre ? selectedClient.provincia_nombre : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Comuna</label>
                                                                        <span>{selectedClient.comuna_nombre ? selectedClient.comuna_nombre : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Giro</label>
                                                                        <span>{selectedClient.giro ? selectedClient.giro : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Teléfono</label>
                                                                        <span>{selectedClient.telefono ? selectedClient.telefono : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Email</label>
                                                                        <span>{selectedClient.email ? selectedClient.email : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Nombre de Contacto</label>
                                                                        <span>{selectedClient.nombre_contacto ? selectedClient.nombre_contacto : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Teléfono de Contacto</label>
                                                                        <span>{selectedClient.telefono_contacto ? selectedClient.telefono_contacto : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Email de Contacto</label>
                                                                        <span>{selectedClient.email_contacto ? selectedClient.email_contacto : 'N/A'}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Fecha de Creación</label>
                                                                        <span>{formatDate(selectedClient.creado_en)}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Última Modificación</label>
                                                                        <span>{formatDate(selectedClient.modificado_en)}</span>
                                                                    </fieldset>
                                                                    <fieldset>
                                                                        <label>Sitio Web</label>
                                                                        <span>{selectedClient.sitio_web ? <a href={selectedClient.sitio_web} target="_blank" rel="noopener noreferrer">{selectedClient.sitio_web}</a> : 'N/A'}</span>
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