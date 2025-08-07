import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import apiClient from '../../services/api';
import styles from './CreateMeeting.module.css';

export function CreateMeeting() {

    const { register, handleSubmit, reset, control, formState: { errors }, watch, setValue } = useForm();

    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [meetingData, setMeetingData] = useState([]);
    const [staff, setStaff] = useState([]);

    const [loading, setLoading] = useState(true);

    const [isProjectDisabled, setIsProjectDisabled] = useState(false);
    const meetingType = watch("meeting_type");

    useEffect(() => {
        if (meetingType === "3") {
            setValue("project", "JE");
            setIsProjectDisabled(true);
        } else {
            setIsProjectDisabled(false);
            setValue("project", "");
        }
    }, [meetingType, setValue]);

    const fetchApi = async () => {

        try {

        const response = await apiClient.get('/meeting/create-meeting');
        
        setProjects(response.data.projects);
        setMeetingData(response.data.meetings);
        setStaff(response.data.staff);
        console.log(response.data);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
            else if (error.response && error.response.status === 403) {
                navigate('/index');
            }
            else {
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

        const confirmed = window.confirm('¿Estás seguro que deseas crear una reunión?');
        if (!confirmed) {
            return;
        }

        const response = await apiClient.post('/meeting/create-meeting/process', data);
        await fetchApi();
        
        navigate(`/meeting/minute/${response.data.meeting}`)

        reset();
    };
    
    
    const staffList = staff.map((staff) => ({
        value: staff.rut_personal,
        label: `${staff.nombres} ${staff.apellido_p} ${staff.apellido_m}`
    }));

    return(
        <>
        {loading ? <p id={styles['loading-page']}>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['main-section']}>
                    <section className={styles['top-section']}>
                        <h1>Crear Reunión</h1>
                        <p>Completa el formulario para crear una nueva reunión</p>
                    </section>
                    <form onSubmit={handleSubmit(onSubmitAdd)} className={styles['form']} id='form'>
                        <div className={styles['input-container']}>
                            <label htmlFor="meeting_type">Reunión</label>
                            <select type="text" name="meeting_type" id={styles['meeting_type']} className={styles['select-input']} defaultValue="" {...register("meeting_type", {required: true})}>
                                <option value="" disabled>Selecciona una opción</option>
                                {meetingData.map((meeting) => (
                                    <option key={meeting.id_tipo_reunion} value={meeting.id_tipo_reunion}>{meeting.descripcion_tipo_reunion}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['input-container']}>
                            <label htmlFor="project">Proyectos</label>
                            <select name="project" id={styles['project']} className={styles['select-input']} defaultValue="" disabled={isProjectDisabled} {...register("project", {required: true})}>
                                <option value="" disabled>Selecciona una opción</option>
                                {projects.map((project) => (
                                    <option key={project.id_proyecto} value={project.id_proyecto}>{project.id_proyecto}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['input-container']}>
                            <label htmlFor="name_and_last_name_form">Asistentes SOLUTIVA</label>
                            <Controller
                                name="name_and_last_name_form"
                                control={control}
                                rules={{ required: "Debes seleccionar mínimo un asistente" }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Selecciona asistentes"
                                        closeMenuOnSelect={false}
                                        isMulti
                                        options={staffList}
                                        id={styles['name_and_last_name_form']}
                                        className={styles['name_and_last_name_form']}
                                    />
                                )}
                            />
                        </div>
                    </form>
                    <section className={styles['bottom-section']}>
                            <div>
                                <button onClick={() => navigate(-1)} className={styles['secondary-btn']}>Cancelar</button>
                            </div>
                            <div>
                                <button type='submit' form='form' className={styles['submit-btn']}>Agregar Reunión</button>
                            </div>
                        </section>
                </section>
            </main>
        )}
        </>
    )

}