import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router';
import Select from 'react-select';
import axios from 'axios';
import image from '../../assets/schedule.png';
import styles from './Meeting.module.css';

export function Meeting() {

    const { register, handleSubmit, reset, control, formState: { errors }, watch, setValue } = useForm();

    const navigate = useNavigate();

    const [sessionData, setSessionData] = useState({});
    const [projects, setProjects] = useState([]);
    const [meetingData, setMeetingData] = useState([]);
    const [staff, setStaff] = useState([]);

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

        const response = await axios.get('http://localhost:5500/meeting', { withCredentials: true });
        
        setSessionData(response.data.session);
        setProjects(response.data.projects);
        setMeetingData(response.data.meetings);
        setStaff(response.data.staff);
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

    const onSubmitAdd = async (data) => {

        const confirmed = window.confirm('¿Estás seguro que deseas crear una reunión?');
        if (!confirmed) {
            return;
        }

        const response = await axios.post('http://localhost:5500/meetings/insert', data, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });
        await fetchApi();
        
        navigate(`/reports/minute/${response.data.meeting}`)

        reset();
    };
    
    
    const staffList = staff.map((staff) => ({
        value: staff.rut_personal,
        label: `${staff.nombres} ${staff.apellido_p} ${staff.apellido_m}`
    }));

    return(
        <>
            <main id={styles['main']}>
                <section id={styles['main-section']}>
                    <form onSubmit={handleSubmit(onSubmitAdd)} id={styles['form']}>
                        <div className={styles['input-container']}>
                            <label htmlFor="meeting_type">Reunión</label>
                            <select type="text" name="meeting_type" id={styles['meeting_type']} className={styles['select-input']} defaultValue="" {...register("meeting_type", {required: true})}>
                                <option value="" disabled>Selecciona una opción</option>
                                {meetingData.map((meeting) => (
                                    <option key={meeting.id_tipo_reunion} value={meeting.id_tipo_reunion}>{meeting.descripcion_tipo_reunion}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles['input-container']} id={styles['input-project']}>
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
                                        id={styles['name_and_last_name_form_toki']}
                                    />
                                )}
                            />
                        </div>
                        <div id={styles['btn-container']}>
                            <button type="submit" id={styles['btn']}>Agregar Reunión</button>
                        </div>
                    </form>
                    <div>
                        <img src={image} alt="Imagen de Reunión" id={styles['reunion-imagen']} draggable="false" />
                    </div>
                </section>
            </main>
        </>
    )

}