import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidvd4 } from 'uuid';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router';
import styles from './Gantt.module.css';

export function Gantt() {
    
    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd }, setValue: setValueAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit }, watch: watchEdit, setValue: setValueEdit } = useForm();
    const { register: registerDelete, handleSubmit: handleSubmitDelete, reset: resetDelete} = useForm();
    const { register: registerCustomize, handleSubmit: handleSubmitCustomize, reset: resetCustomize, formState: { errors: errorsCustomize }, setValue: setValueCustomize } = useForm();

    const navigate = useNavigate();

    const [array, setArray] = useState([]);
    const [sessionData, setSessionData] = useState([]);
    const [staff, setStaff] = useState([]);
    const [specialty, setSpecialty] = useState([]);
    const [dates, setDates] = useState([]);
    const [planification, setPlanification] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null); 
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [customizeModalIsOpen, setCustomizeModalIsOpen] = useState(false);
    const [staffInputs, setStaffInputs] = useState([{ id: uuidvd4() }]);
    const [isEditing, setIsEditing] = useState(false);
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [Delivery, setDelivery] = useState([]);
    const [reports, setReports] = useState([]);
    const [version, setVersion] = useState([]);
    const [ot, setOt] = useState([]);
    const [deliveryType, setDeliveryType] = useState([]);

    const fetchApi = async () => {
        try {

            const response = await axios.get('http://localhost:5500/gantt', { withCredentials: true });
            
            setArray(response.data.projects);
            setStaff(response.data.staff);
            setSpecialty(response.data.specialty);
            setPlanification(response.data.planification);
            setDelivery(response.data.delivery);
            setReports(response.data.report);
            setVersion(response.data.version);
            setOt(response.data.ot);
            setDeliveryType(response.data.delivery_type);
            setSessionData(response.data.session);
            
            console.log(response.data);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    };

    useEffect(() => {
        fetchApi();
    }, []);

    useEffect(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const generatedDates = generateMonthDates(year, month);
        setDates(generatedDates);
    }, [selectedMonth]);

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handlePreviousMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const newDate = new Date(year, month - 1, 1); 
        newDate.setMonth(newDate.getMonth() - 1);
    
        setSelectedMonth(newDate.toISOString().slice(0, 7));
    };
    
    const handleNextMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const newDate = new Date(year, month - 1, 1);
        newDate.setMonth(newDate.getMonth() + 1);
    
        setSelectedMonth(newDate.toISOString().slice(0, 7));
    };

    function generateMonthDates(year, month) {
        const dates = [];
        const date = new Date(year, month - 1, 1);

        while (date.getMonth() === month - 1) {
            dates.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }

        return dates;
    }

    Modal.setAppElement('#root');

    const openModal = (project, date) => {
        setSelectedProject(project);
        setSelectedDate(date);
        setModalIsOpen(true);
    };

    const openEditModal = (project, date, plan) => {
        setSelectedProject(project);
        setSelectedDate(date);
        setSelectedPlan(plan);
        setEditModalIsOpen(true);

        plan.asignados.forEach(asignado => {
            const id = uuidvd4();
            setStaffInputs(prev => [...prev, { id, rut_personal: asignado.rut_personal }]); // Actualiza el estado local
        });

    };

    const openCustomizeModal = () => {
        setCustomizeModalIsOpen(true);
    };

    const closeModal = () => {
        resetAdd();
        resetEdit();
        resetDelete();
        resetCustomize();
        setModalIsOpen(false);
        setEditModalIsOpen(false);
        setCustomizeModalIsOpen(false);
        setSelectedProject(null);
        setSelectedDate(null);
        setSelectedPlan(null);
        setIsEditing(false);
        setStaffInputs([]);
    };

    const onSubmitAdd = async (data) => {
        const staffArray = Object.values(data.staff).filter(value => value && value !== ""); // Extrae los valores de "staff" como un array
        const formattedData = {
            ...data,
            staff: staffArray, // Cambia "staff" a un array
        };
        const response = await axios.post('http://localhost:5500/gantt/planificacion', formattedData, { withCredentials: true });
        await fetchApi();
        closeModal();
    };

    const editSubmit = async (data) => {
        // Extrae los valores actuales del formulario
        const staffArray = Object.values(data.staff).filter((value) => value && value !== "");

        // Obtén los valores originales de la planificación
        const originalStaff = selectedPlan.asignados.map((asignado) => asignado.rut_personal);

        // Filtra solo los valores nuevos o diferentes
        const updatedStaff = staffArray.filter((rut) => !originalStaff.includes(rut));

        // Prepara el objeto con los datos formateados
        const formattedData = {
            ...data,
            staff: updatedStaff, // Solo las personas nuevas
        };

        // Enviar la solicitud al backend
        const response = await axios.patch('http://localhost:5500/gantt/editar', formattedData, { withCredentials: true });
        await fetchApi(); // Refresca los datos
        closeModal(); // Cierra la modal
        };

    const deleteSubmit = async (data) => {
        const response = await axios.delete('http://localhost:5500/gantt/eliminar', {data, withCredentials: true });
        await fetchApi();
        closeModal();
    };

    const customizeSubmit = async (data) => {
        const response = await axios.patch('http://localhost:5500/gantt/customize', data, { withCredentials: true });
        await fetchApi();
        closeModal();
    };

    {/* Esta función se encarga de sumar personal asignado al planificar presionando un boton para agregar personal */}

    const addStaffInput = () => {
        setStaffInputs([...staffInputs, { id: uuidvd4(), rut_personal: "" }]); // Añade un nuevo índice
    };

    const removeStaffInputAdd = (id) => { 
        setStaffInputs(staffInputs.filter((input) => input.id !== id))

        setValueAdd("staff", (currentValues) => {
            const updatedValues = { ...currentValues };
            delete updatedValues[id]; // Elimina el valor asociado al ID
            return updatedValues;
        });
    };

    const removeStaffInputEdit = (id) => {
        setStaffInputs(staffInputs.filter((input) => input.id !== id))

        setValueEdit("staff", (currentValues) => {
            const updatedValues = { ...currentValues };
            delete updatedValues[id]; // Elimina el valor asociado al ID
            return updatedValues;
        });
    };    

    const switchEdit = () => { 
        if (!isEditing) {
            // Al iniciar edición, inicializar los inputs con los asignados actuales
            const currentStaffInputs = selectedPlan.asignados.map(asignado => ({
                id: uuidvd4(), // Genera un ID único para cada input
                rut_personal: asignado.rut_personal, // Inicializa con el rut actual del asignado
            }));
            setStaffInputs(currentStaffInputs);
        }
        setIsEditing(true); // Cambia el estado de isEditing
    };
    
    const backEdit = () => {
        setIsEditing(false);
    };

    // Maneja el cambio en un select
    const handleSelectChange = useCallback((id, value) => {
        // Actualiza el estado local
        setStaffInputs(prevInputs =>
            prevInputs.map(input =>
                input.id === id ? { ...input, rut_personal: value } : input
            )
        );
    });

    const [selectedSpecialty, setSelectedSpecialty] = useState();

    useEffect(() => {
        if (sessionData?.id_especialidad) {
            setSelectedSpecialty(sessionData.id_especialidad);
        }
    }, [sessionData]);


    // Con esta constante se obtiene la especialidad para filtrar las planificaciones por área.

    const [selectedFilterSpecialty, setSelectedFilterSpecialty] = useState();


    // Este useEffect hace que filtre inicialmente por la especialidad del usuario que inicia sesión.
    useEffect(() => {
        setSelectedFilterSpecialty(sessionData.id_especialidad);
    }, [sessionData]);


    // Esta función se encarga de cambiar la especialidad seleccionada en el select.
    const handleSpecialtyChange = (event) => {
        setSelectedFilterSpecialty(Number(event.target.value)); // Convertir a número por seguridad
    };

    return (
        <>
        <main id={styles['gantt-body-main']}>
            <section className={styles['gantt-header']}>
                <div className={styles['gantt-header-subcontainer']}>
                    <select name="filter-specialty" id={styles['filter-specialty']} value={selectedFilterSpecialty} onChange={handleSpecialtyChange}>
                        <option value="" disabled>Seleccione una especialidad</option>
                        {
                            sessionData.company === 1 ? (
                                specialty
                                .filter((specialty) => (specialty.id_especialidad !== 10 && specialty.id_especialidad !== 8))
                                .map((specialty) => (
                                    <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.especialidad}</option>
                                ))
                            )
                            :
                            sessionData.company === 2 && (
                                specialty
                                .filter((specialty) => specialty.id_especialidad !== 2)
                                .map((specialty) => (
                                    <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.especialidad}</option>
                                ))
                            )
                        }
                    </select>
                </div>
                <div id={styles['date-container']} className={styles['gantt-header-subcontainer']}>
                    <button id={styles['previous-date']} className={styles['date-btn']} onClick={handlePreviousMonth}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"}>
                            <path d="M15 6C15 6 9.00001 10.4189 9 12C8.99999 13.5812 15 18 15 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <input type="month" value={selectedMonth} id={styles['input-month']} onChange={handleMonthChange}/>
                    <button id={styles['next-date']} className={styles['date-btn']} onClick={handleNextMonth}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#000000"} fill={"none"}>
                            <path d="M9.00005 6C9.00005 6 15 10.4189 15 12C15 13.5812 9 18 9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <div className={styles['gantt-header-subcontainer']} id={styles['gantt-header-customize-container']}>
                    {((specialty.some((specialtyItem) => specialtyItem.jefe_especialidad === sessionData.rut_personal) || (sessionData.id_rol == 1 || sessionData.id_rol == 2 || sessionData.id_rol == 3 || sessionData.id_rol == 4))) && (
                        <button id={styles['customize-btn']} onClick={openCustomizeModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} fill={"none"}>
                                <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C12.8417 22 14 22.1163 14 21C14 20.391 13.6832 19.9212 13.3686 19.4544C12.9082 18.7715 12.4523 18.0953 13 17C13.6667 15.6667 14.7778 15.6667 16.4815 15.6667C17.3334 15.6667 18.3334 15.6667 19.5 15.5C21.601 15.1999 22 13.9084 22 12Z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M7 15.002L7.00868 14.9996" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="9.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="16.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>
                    )}
                </div>
            </section>
            <section className={styles['table-container']}>
                <table id={styles['gantt-table']}>
                    <thead id={styles['gantt-thead']}>
                        <tr id={styles['gantt-tr']}>
                            <th id={styles['project-th']}>Proyecto</th>
                            {dates.map((date, index) => (
                                <th key={index} id={date.getDay() === 0 || date.getDay() === 6 ? styles['weekend'] : styles['date-th']} className={styles['gantt-th']}>
                                    {date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {array.map((projects) => (
                            <tr key={projects.id_proyecto}>
                                <td id={styles['gantt-project']}>{projects.id_proyecto}</td>
                                {dates.map((date, index) => {
                                    const dateString = date.toISOString().split('T')[0];

                                    const plan = planification.find(plan => {
                                        const planDate = new Date(plan.fecha);
                                        const formattedPlanDate = planDate.toISOString().split('T')[0];
                                        return (
                                            plan.id_proyecto === projects.id_proyecto &&
                                            formattedPlanDate === dateString &&
                                            plan.id_especialidad === selectedFilterSpecialty
                                        );
                                    });
                                    
                                    const delivery = Delivery.find(delivery => {
                                        const planDate = new Date(delivery.fecha);
                                        const formattedPlanDate = planDate.toISOString().split('T')[0];
                                        return (
                                            delivery.id_proyecto === projects.id_proyecto &&
                                            formattedPlanDate === dateString
                                        );
                                    });

                                    const isPlanned = !!plan; 
                                    const isDelivered = !!delivery;

                                    return (
                                        <td
                                            key={`${projects.id_proyecto}-${index}`}
                                            id={styles['gantt-cell']}
                                            className={`
                                                ${date.getDay() === 0 || date.getDay() === 6 ? styles['weekend'] : styles['']}
                                            `}
                                            onClick={() => isPlanned ? openEditModal(projects, date, plan) : openModal(projects, date)}
                                        >
                                            {isPlanned && (
                                                plan.asignados.map((asignado) => (
                                                    <div className={styles['asignados']} key={asignado.rut_personal} style={{backgroundColor: asignado.color}}>
                                                        <span key={asignado.rut_personal}>{asignado.iniciales_nombre}</span>
                                                    </div>
                                                ))
                                            )}
                                            {isDelivered && (
                                                <>
                                                    {delivery.id_informe === 12 && delivery.adenda === 0 && delivery.estado === 0 ? (
                                                        <div style={{ backgroundColor: deliveryType[1]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 12 && delivery.adenda === 0 && delivery.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 12 && delivery.adenda === 1 && delivery.estado === 0 ? (
                                                        <div style={{ backgroundColor: deliveryType[1]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios / A
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 12 && delivery.adenda === 1 && delivery.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios / A
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.id_ot === 1 && delivery.adenda === 1 && delivery.estado === 0 && delivery.id_especialidad ? (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{delivery.id_version} / A / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.id_ot === 1 && delivery.adenda === 1 && plan.estado === 1 && delivery.id_especialidad ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{delivery.id_version} / A / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.id_ot === 1 && delivery.adenda === 0 && delivery.estado === 0 && delivery.id_especialidad ? (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{delivery.id_version} / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.id_ot === 1 && delivery.adenda === 0 && delivery.estado === 1 && delivery.id_especialidad ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{delivery.id_version} / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.adenda === 1 && delivery.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{delivery.id_version} / A
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.adenda === 1 && delivery.estado === 0 ? (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{delivery.id_version} / A
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.estado === 0 ? (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{delivery.id_version}
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_informe === 11 && delivery.id_version && delivery.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{delivery.id_version}
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_version && delivery.adenda === 1 && delivery.id_ot === 1 && delivery.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} / A / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_version && delivery.adenda === 1 && delivery.id_ot === 1 && delivery.estado === 0 ? (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} / A / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_version && delivery.adenda === 0 && delivery.id_ot === 1 && delivery.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_version && delivery.adenda === 0 && delivery.id_ot === 1 && delivery.estado === 0 ? (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} / OT {
                                                                    delivery.ot.length > 0 && delivery.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < delivery.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {delivery.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_version && delivery.estado === 1 && delivery.adenda === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} / A 
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                        
                                                    )
                                                    :
                                                    delivery.id_version && delivery.estado === 1 && delivery.adenda === 0 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} 
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                        
                                                    )
                                                    :
                                                    delivery.id_version && delivery.estado == 0 && delivery.adenda === 1 ? (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} / A
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    delivery.id_version && delivery.estado == 0 && delivery.adenda === 0 && (
                                                        <div style={{ backgroundColor: delivery.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{delivery.id_informe} / V{delivery.id_version} 
                                                                {delivery.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Detalles de Planificación"
                    className={styles['modal']}
                    style={{overlay: {zIndex:9999}}}
                >
                    {selectedProject && selectedDate && (
                        <>
                            <div id={styles['modal-header-add']}>
                                <h2>{selectedProject.id_proyecto}</h2>
                            </div>
                            <form onSubmit={handleSubmitAdd(onSubmitAdd)}>
                                <div id={styles['modal-body']}>
                                    <span className={styles['span-profile']} onClick={() => navigate(`/profile/${selectedProject.rut_personal}`)}>Jefe de Proyecto: {selectedProject.nombres} {selectedProject.apellido_p} {selectedProject.apellido_m}</span>
                                    <span className={styles['span-block']}>Fecha: {selectedDate.toLocaleDateString('es-ES')}</span>
                                    <span className={styles['span-block']}>Área:</span>
                                    <select name="specialty" id={styles['specialty']} {...registerAdd("specialty", { required: true })} value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                                        <option disabled>Seleccione una especialidad / área</option>
                                        {specialty
                                        .filter((specialty) => specialty.id_especialidad !== 10)
                                        .map((specialty) => (
                                            <option key={specialty.id_especialidad} value={specialty.id_especialidad}>{specialty.especialidad}</option>
                                        ))}
                                    </select>
                                    <div className={styles['staff-top-container']}>
                                        <span className={styles['span-block']}>Asignad@/s:</span>
                                        <button type="button" onClick={() => addStaffInput()} className={styles['add-staff-btn']}>Añadir Encargado</button>
                                    </div>
                                    <div className={styles['staff-input-container-plan']}>
                                        {staffInputs.map((input) => (
                                            <div key={input.id} className={styles['staff-input']}>
                                                <select name={`staff[${input.id}]`} id={`staff-${input.id}`} {...registerAdd(`staff.${input.id}`, { required: "Seleccione un asignado válido" })} className={styles['staff-select']}>
                                                    <option disabled value="">Seleccione un/a asignad@</option>
                                                    {staff.filter((s) => s.id_especialidad === parseInt(selectedSpecialty)).map((filteredStaff) => (
                                                        <option key={filteredStaff.rut_personal} value={filteredStaff.rut_personal}>
                                                            {filteredStaff.nombres} {filteredStaff.apellido_p} {filteredStaff.apellido_m}
                                                        </option>
                                                    ))}
                                                </select>
                                                {staffInputs.length > 1 && (
                                                    <button type="button" onClick={() => removeStaffInputAdd(input.id)} className={styles['remove-staff-btn']}>X</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <input type="hidden" {...registerAdd("date")} value={selectedDate.toLocaleDateString('es-ES')} />
                                    <input type="hidden" {...registerAdd("project")} value={selectedProject.id_proyecto} />
                                    <div id={styles['buttons-container']}>
                                        <button onClick={closeModal} id={styles['secondary-btn']}>Cerrar</button>
                                        {
                                            (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5) && (
                                                <button type='submit' id={styles['primary-btn']}>Agregar</button>
                                            )
                                        }
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                </Modal>
                <Modal
                    isOpen={editModalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Editar Planificación"
                    className={styles['modal']}
                    style={{overlay: {zIndex:9999}}}
                >
                    {selectedProject && selectedDate && selectedPlan && (
                        <>
                            <div id={styles['modal-header-edit']}>
                                <div id={styles['title-container']}>
                                    <h2>{selectedProject.id_proyecto}</h2>
                                </div>
                                <form onSubmit={handleSubmitDelete(deleteSubmit)} id={styles['delete-form']}>
                                    {(sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5) ? (
                                        !isEditing && 
                                        <>
                                            <button type='submit' id={styles['delete-btn']}>
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#ff4d4d"} fill={"none"}>
                                                    <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                    <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                </svg>
                                            </button> 
                                        <input type="hidden" {...registerDelete("date")} value={selectedDate.toLocaleDateString('es-ES')} />
                                        <input type="hidden" {...registerDelete("project")} value={selectedProject.id_proyecto} />
                                        </>
                                    )
                                    :
                                    (
                                        <div style={{marginRight: '40px'}}></div>
                                    )
                                    }
                                </form>
                            </div>
                            <form onSubmit={handleSubmitEdit(editSubmit)}>
                                <div id={styles['modal-body']}>
                                    <span className={styles['span-block']} onClick={() => navigate(`/profile/${selectedProject.rut_personal}`)}>Jefe de Proyecto: {selectedProject.nombres} {selectedProject.apellido_p} {selectedProject.apellido_m}</span>
                                    <span className={styles['span-block']}>Responsable: Sergio Dávila </span>
                                    <span className={styles['span-block']}>Fecha: {selectedDate.toLocaleDateString('es-ES')}</span>
                                    <span className={styles['span-block']}>Área: {selectedPlan.especialidad}</span>
                                    {isEditing ? (
                                        <>
                                            <div className={styles['staff-top-container']}>
                                                <span className={styles['span-block']}>Asignad@/s:</span>
                                                <button type="button" onClick={addStaffInput} className={styles['add-staff-btn']}>Añadir Encargado</button>
                                            </div>
                                            <div className={styles['staff-input-container-plan']}>
                                                {staffInputs.map((input) => (
                                                    <div key={input.id} className={styles['staff-input']}>
                                                        <select name={`staff[${input.id}]`} id={`staff-${input.id}`} value={watchEdit(`staff.${input.id}`) || input.rut_personal || ''} onChange={(e) => handleSelectChange(input.id, e.target.value)} {...registerEdit(`staff.${input.id}`, { required: true })} className={styles['staff-select']}>
                                                            <option value="" disabled>Seleccione un/a asignad@</option>
                                                            {staff
                                                            .filter((s) => s.id_especialidad === selectedPlan.id_especialidad)
                                                            .map((filteredStaff) => (
                                                                <option key={filteredStaff.rut_personal} value={filteredStaff.rut_personal}>
                                                                    {filteredStaff.nombres} {filteredStaff.apellido_p} {filteredStaff.apellido_m}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {staffInputs.length > 1 && (
                                                            <button type="button" onClick={() => removeStaffInputEdit(input.id)} className={styles['remove-staff-btn']}>X</button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className={styles['span-block']}>Asignad@/s:</span>
                                            <div className={styles['staff-input-container']}>
                                                {selectedPlan.asignados.map((asignado) => (
                                                    <div className={styles['staff-input']} key={asignado.rut_personal}>
                                                        <span>{asignado.nombres} {asignado.apellido_p} {asignado.apellido_m}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <input type="hidden" {...registerEdit("date")} value={selectedDate.toLocaleDateString('es-ES')} />
                                    <input type="hidden" {...registerEdit("project")} value={selectedProject.id_proyecto} />
                                </div>
                                <div id={styles['buttons-container']}>
                                    {
                                        isEditing 
                                        ? <button onClick={backEdit} id={styles['secondary-btn']} type='button'>Cancelar</button> 
                                        : <button onClick={closeModal} id={styles['secondary-btn']} type='button'>Cerrar</button>
                                    }
                                    {
                                        (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5)  && (
                                            isEditing
                                            ? <button type='submit' id={styles['primary-btn']}>Aplicar</button>
                                            : <button onClick={(e) => {e.preventDefault(); switchEdit(); }} id={styles['primary-btn']} type='button'>Editar</button>
                                        )
                                    }
                                </div>
                            </form>
                        </>
                    )}
                </Modal>
                <Modal
                    isOpen={customizeModalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Personalizar Planificación"
                    className={styles['modal']}
                    style={{overlay: {zIndex:9999}}}
                >
                    <form onSubmit={handleSubmitCustomize(customizeSubmit)}>
                        {
                            staff
                                .filter((staff) => staff.id_especialidad === sessionData.id_especialidad)
                                .map((staff, index) => (
                                    <div key={staff.rut_personal}>
                                        <label htmlFor="color-input">{`${staff.nombres} ${staff.apellido_p} ${staff.apellido_m}`}</label>
                                        <input type="color" id={styles['color-input']} defaultValue={staff.color} {...registerCustomize(`${index}.color`)} />
                                        <input type="hidden" defaultValue={staff.rut_personal} {...registerCustomize(`${index}.rut_personal`)} />
                                    </div>
                                ))
                        }
                        <button type='submit' className={styles['primary-btn']}>Guardar cambios</button>
                    </form>
                </Modal>
            </section>
        </main>
        </>
    );
}
