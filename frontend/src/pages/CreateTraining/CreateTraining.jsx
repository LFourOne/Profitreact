import styles from './CreateTraining.module.css';
import { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select'
import axios from 'axios';

export function CreateTraining() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    
    const [staff, setStaff] = useState([]);
    
    const { register, handleSubmit, formState: { errors }, reset, control } = useForm()

    const fetchApi = async () => {
        try {
            const response = await axios.get('http://localhost:5500/training', { withCredentials: true });
            setStaff(response.data.staff);
            console.log(response.data);
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
        setLoading(true);
        fetchApi();
    }, []);

    const onSubmit = async (data) => {

        const confirmed = window.confirm('¿Estás seguro que deseas crear una reunión?');
        if (!confirmed) {
            return;
        }
        
        const response = await axios.post('http://localhost:5500//training/create/process', data, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true 
        });

        reset();
        navigate('/training');

    }

    const staffList = staff.map((staff) => ({
        value: staff.rut_personal,
        label: `${staff.nombres} ${staff.apellido_p} ${staff.apellido_m}`
    }));

    return(
        <>
            {loading ? <p>Cargando</p> : (
                <main id={styles['main']}>
                    <section id={styles['previous-page-container']}>
                        <button id={styles['previous-page-btn']} onClick={() => navigate(-1)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H6M12 5l-7 7 7 7"/></svg>
                            Volver atrás
                        </button>
                    </section>
                    <form onSubmit={handleSubmit(onSubmit)} id={styles['form']}>
                        <section id={styles['form-top-container']}>
                            <h1 id={styles['form-top-container-h1']}>Registro de Capacitación</h1>
                            <h2 id={styles['form-top-container-h2']}>Completa el formulario para registrar una nueva capacitación.</h2>
                        </section>
                        <section id={styles['form-middle-container']}>
                            <fieldset className={styles['fieldset']}>
                                <label htmlFor="name" className={styles['fieldset-label']}> Nombre de Capacitación</label>
                                <input type="text" id={styles['name-input']} placeholder='Escriba aquí el nombre de la capacitación' {...register('name', {required: true})}/>
                            </fieldset>
                            <fieldset className={styles['fieldset']}>
                                <label htmlFor="date" className={styles['fieldset-label']}>Fecha</label>
                                <input type="date" id={styles['date-input']} {...register('date', {required: true})}/>
                            </fieldset>
                            <fieldset className={styles['fieldset']}>
                                <label htmlFor="format" className={styles['fieldset-label']}> Modalidad</label>
                                <div id={styles['format-container']}>
                                    <label className={styles['format-label']}>
                                        <input type="radio" name='format' value={1} {...register('format', {required: true})} />
                                        Presencial
                                    </label>
                                    <label className={styles['format-label']}>
                                        <input type="radio" name='format' value={2} {...register('format', {required: true})} />
                                        Telemática
                                    </label>
                                </div>
                            </fieldset>
                            <fieldset className={styles['fieldset']}>
                                <label htmlFor="duration" className={styles['fieldset-label']}>Duración</label>
                                <div id={styles['duration-container']}>
                                    <div className={styles['duration-input-container']}>
                                        <label className={styles['fieldset-label']}>Hora de Inicio</label>
                                        <input type="time" id={styles['start-duration-input']} {...register('start-duration', {required: true})}/>
                                    </div>
                                    <div className={styles['duration-input-container']}>
                                        <label className={styles['fieldset-label']}>Hora de Término</label>
                                        <input type="time" id={styles['end-duration-input']} {...register('end-duration', {required: true})}/>
                                    </div>
                                </div>
                            </fieldset>
                            <fieldset className={styles['fieldset']}>
                                <label className={styles['fieldset-label']}>Instructor de la Capacitación</label>
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
                            </fieldset>
                            <fieldset className={styles['fieldset']}>
                                <label htmlFor="objective" className={styles['fieldset-label']}>Objetivos de la Capacitación</label>
                                <textarea id={styles['objective-input']} {...register('objectives', {required: true})} maxLength={800}/>
                            </fieldset>
                            <fieldset className={styles['fieldset']}>
                                <label htmlFor="content" className={styles['fieldset-label']}>Contenido de la Capacitación</label>
                                <textarea id={styles['content-input']} {...register('content', {required: true})} maxLength={800}/>
                            </fieldset>
                        </section>
                        <section id={styles['form-bottom-container']}>
                            <button id={styles['submit-btn']}>Crear capacitación</button>
                        </section>
                    </form>
                </main>
            )
            }
        </>
        
    )
}