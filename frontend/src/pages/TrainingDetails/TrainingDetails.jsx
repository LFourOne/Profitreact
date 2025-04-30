import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import Select from 'react-select'
import styles from './TrainingDetails.module.css';

export function TrainingDetails() {

    const navigate = useNavigate();

    const { register, handleSubmit } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, control } = useForm();

    const [loading, setLoading] = useState(true);
    const [training, setTraining] = useState([]);
    const [assistant, setAssistant] = useState([]);
    const [sessionData, setSessionData] = useState([]);
    const [staff, setStaff] = useState([]);

    const [isEditing, setIsEditing] = useState(false);
    const [fileName, setFileName] = useState("Seleccionar archivo PDF");


    const { id_capacitacion } = useParams();

    const fetchApi = async () => {
        try {
            const response = await axios.get(`http://localhost:5500/training/${id_capacitacion}`, { withCredentials: true });

            setTraining(response.data.trainings);
            setAssistant(response.data.assistants);
            setSessionData(response.data.session);
            setLoading(false);

            console.log(response.data);
            
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formatter = new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        });
        return formatter.format(date);
    };

    const formatDateEdit = (dateString) => {
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Mes en formato 2 dígitos
        const day = String(date.getUTCDate()).padStart(2, '0'); // Día en formato 2 dígitos
        return `${year}-${month}-${day}`; // Formato "YYYY-MM-DD"
    };

    const switchEdit = async () => {
        if (!staff.length) {
            const response = await axios.get('http://localhost:5500/training/get-staff', { withCredentials: true });
            setStaff(response.data.staff);
            console.log(response.data.staff);
        }
        setIsEditing(true);
        console.log("Verdadero");
    };

    const onSubmitEdit = async (data) => {
        try {
            console.log(data);
            const response = await axios.patch(`http://localhost:5500/training/edit/${id_capacitacion}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true 
            });

            setIsEditing(false);
            await fetchApi();
        }
        catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }

    const onSubmitDelete = async (e) => {
        e.preventDefault();
        const confirmed = window.confirm('¿Estás seguro que deseas eliminar la capacitación?');

        if (!confirmed) {
            return;
        }
        try {
            const response = await axios.delete(`http://localhost:5500/training/delete/${id_capacitacion}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            });
            navigate('/training');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }
        
    const backEdit = () => {

        setIsEditing(false);
        console.log("Falso");
        
    };

    const staffList = staff.length
        ? staff.map((staff) => ({
              value: staff.rut_personal,
              label: `${staff.nombres} ${staff.apellido_p} ${staff.apellido_m}`,
          }))
        : [];

    const onSubmitAttendance = async (e, id_capacitacion, session) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:5500/training/register-attendance`, {id_capacitacion, session}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true });
                
                await fetchApi();

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }

    const removeAttendance = async (e, rut_assistant) => {
        e.preventDefault();

        const confirmed = window.confirm('¿Estás seguro que deseas remover al participante de la capacitación?');

        if (!confirmed) {
            return;
        };
        
        try {
            const response = await axios.delete(`http://localhost:5500/training/remove-attendance`, {
                data: {id_capacitacion, rut_assistant},
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true 
            });
                await fetchApi();
            
        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    }

    const onSubmitFile = async (data) => {

        const file = data.file[0];

        if (!file) {
            alert('Por favor, selecciona un archivo PDF.');
            return;
        }

        if (file.type !== 'application/pdf') {
            alert('Solo se permiten archivos PDF.');
            return;
        }

        const formData = new FormData();
        formData.append('file', data.file[0]);
        formData.append('id_capacitacion', id_capacitacion);

        try {
            const response = await axios.post('http://localhost:5500/training/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            await fetchApi();
        } catch (error) {
            console.error('Error al subir el archivo:', error);
        }
    };

    return(
        <>
        {loading ? <p>Cargando</p> : (
            <main id={styles['main']}>
                <section id={styles['previous-page-container']}>
                    <button id={styles['previous-page-btn']} onClick={() => navigate(-1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H6M12 5l-7 7 7 7"/></svg>
                        Volver a capacitaciones
                    </button>
                    {isEditing ? 
                    (   <>
                        <div>
                            <button id={styles['edit-btn']} onClick={(e) => {e.preventDefault(); backEdit();}}>
                                Desactivar Edición
                            </button>
                            <button type='submit' form='edit-form'>Confirmar Cambios</button>
                        </div>
                        <div>
                            <button id={styles['delete-btn']} onClick={(e) => {onSubmitDelete(e);}}>
                                Eliminar Capacitación
                            </button>
                        </div>
                        </>
                    ) 
                    : 
                    (
                        <button id={styles['edit-btn']} onClick={(e) => {e.preventDefault(); switchEdit();}}>
                            Activar Edición
                        </button>
                    )}
                </section>
                <section id={styles['training-container']}>
                    { isEditing ?
                    (
                    <section id={styles['left-section']}>
                        <form id='edit-form' onSubmit={handleSubmitEdit(onSubmitEdit)}>
                            <section id={styles['top-section']}>
                                <div>
                                    <input type="text" id={styles['top-section-title-input']} defaultValue={training[0].nombre_capacitacion} {...registerEdit('title', {required: true})} />
                                    <div id={styles['top-section-date-state-container']}>
                                        <div>
                                            <input type="date" defaultValue={formatDateEdit(training[0].fecha)} {...registerEdit('date', {required: true})} />
                                        </div>
                                        <div>
                                            <span id={styles['state']}>Completado</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section id={styles['middle-section']}>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Instructor:</label>
                                    <Controller
                                        name="instructor"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Select
                                                {...field}
                                                placeholder="Seleccione el instructor"
                                                options={staffList}
                                                id={styles['instructor']}
                                            />
                                        )}
                                    />
                                </div>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Modalidad:</label>
                                    <select defaultValue={training[0].id_modalidad} {...registerEdit('format', {required: true})}>
                                        <option value={1}>Presencial</option>
                                        <option value={2}>Telemático</option>
                                    </select>
                                </div>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Hora de Inicio:</label>
                                    <input type="time" defaultValue={training[0].hora_inicio} {...registerEdit('start-duration', {required: true})} />
                                </div>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Hora de Termino:</label>
                                    <input type="time" defaultValue={training[0].hora_termino} {...registerEdit('end-duration', {required: true})} />
                                </div>
                            </section>
                            <section id={styles['bottom-section']}>
                                <div id={styles['objectives-container']}>
                                    <label className={styles['label']}>Objetivos:</label>
                                    <textarea id={styles['objectives']} defaultValue={training[0].objetivos} {...registerEdit('objectives', {required: true})}></textarea>
                                </div>
                                <div id={styles['content-container']}>
                                    <label className={styles['label']}>Contenido:</label>
                                    <textarea id={styles['content']} defaultValue={training[0].contenido} {...registerEdit('content', {required: true})}></textarea>
                                </div>
                            </section>
                        </form>
                        <section id={styles['file-section']}>
                                <div id={styles['file-container']}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    <label className={styles['label']}>
                                        Archivo PDF:
                                    </label>
                                </div>
                                <form onSubmit={handleSubmit(onSubmitFile)} id={styles['file-attach-container']}>
                                    <label htmlFor="file-input" id={styles['file-label']}>
                                        {fileName}
                                        <input 
                                            type="file" 
                                            accept="application/pdf" 
                                            id={'file-input'} 
                                            className={styles['file-input']} 
                                            {...register('file', {
                                                onChange: (e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFileName(file.name);
                                                    } else {
                                                        setFileName('Seleccionar archivo PDF');
                                                    }
                                                },
                                            })}
                                            />
                                    </label>
                                    <button type="submit" id={styles['file-attach-btn']}>Adjuntar</button>
                                </form>
                            </section>
                    </section>
                    )
                    :
                    (
                        <section id={styles['left-section']}>
                            <section id={styles['top-section']}>
                                <div>
                                    <h1 id={styles['title']}>{training[0].nombre_capacitacion}</h1>
                                    <div id={styles['top-section-date-state-container']}>
                                        <div>
                                            <h2>{formatDate(training[0].fecha)}</h2>
                                        </div>
                                        <div>
                                            <span id={styles['state']}>Completado</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <section id={styles['middle-section']}>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Instructor:</label>
                                    <span>{training[0].nombres} {training[0].apellido_p} {training[0].apellido_m}</span>
                                </div>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Modalidad:</label>
                                    <span>{training[0].modalidad}</span>
                                </div>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Hora de Inicio:</label>
                                    <span>{training[0].hora_inicio}</span>
                                </div>
                                <div className={styles['top-info']}>
                                    <label className={styles['label']}>Hora de Termino:</label>
                                    <span>{training[0].hora_termino}</span>
                                </div>
                            </section>
                            <section id={styles['bottom-section']}>
                                <div id={styles['objectives-container']}>
                                    <label className={styles['label']}>Objetivos:</label>
                                    <p id={styles['objectives']}>{training[0].objetivos}</p>
                                </div>
                                <div id={styles['content-container']}>
                                    <label className={styles['label']}>Contenido:</label>
                                    <p id={styles['content']}>{training[0].contenido}</p>
                                </div>
                            </section>
                            <section id={styles['file-section']}>
                                <div id={styles['file-container']}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    <label className={styles['label']}>
                                        Archivo PDF:
                                    </label>
                                </div>
                                {training[0].ruta ? (
                                    <div id={styles['file-attach-container']}>
                                        <a
                                            href={`http://localhost:5500/training/files/${training[0].ruta}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            id={styles['file-attach']}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" id={styles['file-attach-svg']} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#444444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9l-7-7z"/><path d="M13 3v6h6"/></svg>
                                            {training[0].ruta}
                                        </a>
                                    </div>
                                    ) 
                                    : 
                                    (
                                    <form onSubmit={handleSubmit(onSubmitFile)} id={styles['file-attach-container']}>
                                        <label htmlFor="file-input" id={styles['file-label']}>
                                            {fileName}
                                            <input 
                                                type="file" 
                                                accept="application/pdf" 
                                                id={'file-input'} 
                                                className={styles['file-input']} 
                                                {...register('file', {
                                                    onChange: (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setFileName(file.name);
                                                        } else {
                                                            setFileName('Seleccionar archivo PDF');
                                                        }
                                                    },
                                                })}
                                                />
                                        </label>
                                        <button type="submit" id={styles['file-attach-btn']}>Adjuntar</button>
                                    </form>
                                    )}
                            </section>
                        </section>
                    )
                    }
                    <section id={styles['right-section']}>
                        <section id={styles['right-top-section']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Participantes</h1>
                        </section>
                        <section id={styles['right-middle-section']}>
                            {
                                assistant.map((assistant) => (
                                    <div className={styles['right-middle-participant-card']} key={assistant.id_asistente}>
                                        <div className={styles['right-middle-participant-card-top-subcontainer']}>
                                            <label className={styles['right-middle-participant-card-top-subcontainer-staff']}>{assistant.nombres} {assistant.apellido_p} {assistant.apellido_m}</label>
                                            <span className={styles['right-middle-participany-card-top-subcontainer-specialty']}>{assistant.especialidad}</span>
                                            <label className={styles['right-middle-participany-card-top-subcontainer-date']}>Se registró: {formatDate(assistant.fecha)}</label>
                                        </div>
                                        <div>
                                            <span className={styles['attendance']}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0c4d0c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                Asistió
                                            </span>
                                        </div>
                                        <div id={styles['right-middle-participant-card-remove-subcontainer']}>
                                            <button onClick={(e => {removeAttendance(e, assistant.rut_asistente)})} id={styles['right-middle-participant-card-remove-btn']}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a70000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </section>
                        <section id={styles['right-bottom-section']}>
                            {!assistant.some((assistant) => assistant.rut_asistente === sessionData) ? (
                                <button type="submit" onClick={(e) => onSubmitAttendance(e, id_capacitacion, sessionData)} id={styles['right-bottom-btn']}>Registrar asistencia</button>
                            )
                            : 
                            (
                                <button type="submit" disabled id={styles['right-bottom-btn-disabled']}>¡Ya estás registrado!</button>
                            )}
                        </section>
                    </section>
                </section>
            </main>
        )
        }
        </>
    )
}