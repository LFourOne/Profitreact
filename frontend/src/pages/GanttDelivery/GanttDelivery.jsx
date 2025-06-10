import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { MultiSelect } from "react-multi-select-component";
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router';
import styles from './GanttDelivery.module.css';

export function GanttDelivery() {
    
    const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd }, setValue: setValueAdd, control: controlAdd } = useForm();
    const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit }, watch: watchEdit, setValue: setValueEdit, control: controlEdit } = useForm();
    const { register: registerDelete, handleSubmit: handleSubmitDelete, reset: resetDelete} = useForm();
    const { register: registerComplete, handleSubmit: handleSubmitComplete, reset: resetComplete} = useForm();
    const { register: registerCustomize, handleSubmit: handleSubmitCustomize, reset: resetCustomize, formState: { errors: errorsCustomize }, setValue: setValueCustomize } = useForm();
      
    const navigate = useNavigate();

    const [project, setProject] = useState([]);
    const [sessionData, setSessionData] = useState([]);
    const [dates, setDates] = useState([]);
    const [planification, setPlanification] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [customizeModalIsOpen, setCustomizeModalIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [reports, setReports] = useState([]);
    const [version, setVersion] = useState([]);
    const [specialty, setSpecialty] = useState([]);
    const [ot, setOt] = useState([]);
    const [deliveryType, setDeliveryType] = useState([]);
    const [selectedOts, setSelectedOts] = useState([]);
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);

    const fetchApiDelivery = async () => {
        try {
            
            const response = await axios.get('http://localhost:5500/gantt/delivery', { withCredentials: true });
            
            setProject(response.data.projects);
            setPlanification(response.data.planification);
            setReports(response.data.report);
            setVersion(response.data.version);
            setSpecialty(response.data.specialty);
            setOt(response.data.ot);
            setDeliveryType(response.data.delivery_type);
            setSessionData(response.data.session);

        } catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            } else {
                console.error('Error inesperado:', error);
            }
        }
    };

    useEffect(() => {
        fetchApiDelivery();
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

        // Almacena las OT seleccionadas
        const initialOts = plan.ot.map(ot => ({
            value: ot.id_numero_ot,
            label: ot.numero_ot
        }));

        setSelectedOts(initialOts);

    };

    const openCustomizeModal = () => {
        setCustomizeModalIsOpen(true);
    };

    const closeModal = () => {
        resetAdd();
        resetEdit();
        resetDelete();
        resetComplete();
        resetCustomize();
        setModalIsOpen(false);
        setEditModalIsOpen(false);
        setCustomizeModalIsOpen(false);
        setSelectedProject(null);
        setSelectedDate(null);
        setSelectedPlan(null);
        setIsEditing(false);
    };

    const onSubmitAdd = async (data) => {
        const response = await axios.post('http://localhost:5500/gantt/delivery/insert', data, { withCredentials: true });
        await fetchApiDelivery();
        closeModal();
    };

    const editSubmit = async (data) => {

        const formattedData = {
        newData: {
            ...data,
            ot: selectedOts.map(ot => ot.value) // Agrega las OT seleccionadas
        },
        oldData: {
            id_informe: selectedPlan.id_informe,
            id_version: selectedPlan.id_version,
            adenda: selectedPlan.adenda,
            especialidad: selectedPlan.id_especialidad,
            ot: selectedPlan.ot.map(ot => ot.id_numero_ot),
            comentarios: selectedPlan.comentarios
        } // Incluye los datos antiguos
    };

        // Enviar la solicitud al backend
        const response = await axios.patch('http://localhost:5500/gantt/delivery/editar', formattedData, { withCredentials: true });
        await fetchApiDelivery(); // Refresca los datos
        closeModal(); // Cierra la modal

    };

    const deleteSubmit = async (data) => {
        const response = await axios.delete('http://localhost:5500/gantt/delivery/eliminar', {data, withCredentials: true });
        await fetchApiDelivery();
        closeModal();
    };

    const switchEdit = () => { 
        if (!isEditing) {
        }
        setIsEditing(true); // Cambia el estado de isEditing
    };
    
    const backEdit = () => {
        setIsEditing(false);
    };

    const completeSubmit = async (data) => {
        const response = await axios.patch('http://localhost:5500/gantt/delivery/completar', data, { withCredentials: true });
        await fetchApiDelivery();
        closeModal();
    };

    const customizeSubmit = async (data) => {

        const response = await axios.patch('http://localhost:5500/gantt/delivery/customize', data, { withCredentials: true });
        await fetchApiDelivery();
        closeModal();
    };

    // Almacenamos todas las OT en un array de objetos con la estructura que espera el componente MultiSelect
    const selectOptions = ot.map((ot) => (
        {label: ot.numero_ot, value: ot.id_numero_ot,}
    ));

    return (
        <>
        <main id={styles['gantt-body-main']}>
            <section className={styles['gantt-header']}>
                <div className={styles['gantt-header-subcontainer']}></div>
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
                    {(sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 ) && (
                        <button id={styles['customize-btn']} onClick={openCustomizeModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} fill={"none"}>
                                <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C12.8417 22 14 22.1163 14 21C14 20.391 13.6832 19.9212 13.3686 19.4544C12.9082 18.7715 12.4523 18.0953 13 17C13.6667 15.6667 14.7778 15.6667 16.4815 15.6667C17.3334 15.6667 18.3334 15.6667 19.5 15.5C21.601 15.1999 22 13.9084 22 12Z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M7 15.002L7.00868 14.9996" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="9.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                                <circle cx="16.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        </button>
                        )
                    }
                </div>
            </section>
            <div className={styles['table-container']}>
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
                        {project.map((projects) => (
                            <tr key={projects.id_proyecto}>
                                <td id={styles['gantt-project']}>{projects.id_proyecto}</td>
                                {dates.map((date, index) => {
                                    const dateString = date.toISOString().split('T')[0];

                                    const plan = planification.find(plan => {
                                        const planDate = new Date(plan.fecha);
                                        const formattedPlanDate = planDate.toISOString().split('T')[0];
                                        return (
                                            plan.id_proyecto === projects.id_proyecto &&
                                            formattedPlanDate === dateString
                                        );
                                    });
                    
                                    const isPlanned = !!plan; 

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
                                                <>
                                                    {plan.id_informe === 12 && plan.adenda === 0 && plan.estado === 0 ? (
                                                        <div style={{ backgroundColor: deliveryType[1]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 12 && plan.adenda === 0 && plan.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 12 && plan.adenda === 1 && plan.estado === 0 ? (
                                                        <div style={{ backgroundColor: deliveryType[1]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios / A
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 12 && plan.adenda === 1 && plan.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                Servicios / A
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.id_ot === 1 && plan.adenda === 1 && plan.estado === 0 && plan.id_especialidad ? (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{plan.id_version} / A / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.id_ot === 1 && plan.adenda === 1 && plan.estado === 1 && plan.id_especialidad ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{plan.id_version} / A / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.id_ot === 1 && plan.adenda === 0 && plan.estado === 0 && plan.id_especialidad ? (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{plan.id_version} / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.id_ot === 1 && plan.adenda === 0 && plan.estado === 1 && plan.id_especialidad ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '11px', fontWeight: 'bold' }}>
                                                            <span>
                                                                IF / V{plan.id_version} / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {
                                                                    plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.adenda === 1 && plan.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{plan.id_version} / A
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.adenda === 1 && plan.estado === 0 ? (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{plan.id_version} / A
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.estado === 0 ? (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{plan.id_version}
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_informe === 11 && plan.id_version && plan.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>IF / V{plan.id_version}
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_version && plan.adenda === 1 && plan.id_ot === 1 && plan.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} / A / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_version && plan.adenda === 1 && plan.id_ot === 1 && plan.estado === 0 ? (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} / A / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_version && plan.adenda === 0 && plan.id_ot === 1 && plan.estado === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_version && plan.adenda === 0 && plan.id_ot === 1 && plan.estado === 0 ? (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} / OT {
                                                                    plan.ot.length > 0 && plan.ot.map((ot, index) => (
                                                                        <span key={index}>{ot.id_numero_ot}{index < plan.ot.length - 1 ? '-' : ''}</span>
                                                                    ))
                                                                } {plan.comentarios && 
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                        <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_version && plan.estado === 1 && plan.adenda === 1 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} / A 
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                        
                                                    )
                                                    :
                                                    plan.id_version && plan.estado === 1 && plan.adenda === 0 ? (
                                                        <div style={{ backgroundColor: deliveryType[0]['color'], fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} 
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                        
                                                    )
                                                    :
                                                    plan.id_version && plan.estado == 0 && plan.adenda === 1 ? (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} / A
                                                                {plan.comentarios && 
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={16} height={16} color={"#000000"} fill={"none"}>
                                                                    <path d="M3.49977 18.9853V20.5H5.01449C6.24074 20.5 6.85387 20.5 7.40518 20.2716C7.9565 20.0433 8.39004 19.6097 9.25713 18.7426L19.1211 8.87868C20.0037 7.99612 20.4449 7.55483 20.4937 7.01325C20.5018 6.92372 20.5018 6.83364 20.4937 6.74411C20.4449 6.20253 20.0037 5.76124 19.1211 4.87868C18.2385 3.99612 17.7972 3.55483 17.2557 3.50605C17.1661 3.49798 17.0761 3.49798 16.9865 3.50605C16.4449 3.55483 16.0037 3.99612 15.1211 4.87868L5.25713 14.7426C4.39004 15.6097 3.9565 16.0433 3.72813 16.5946C3.49977 17.1459 3.49977 17.759 3.49977 18.9853Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                    <path d="M13.5 6.5L17.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                    :
                                                    plan.id_version && plan.estado == 0 && plan.adenda === 0 && (
                                                        <div style={{ backgroundColor: plan.color_especialidad, fontSize: '13px', fontWeight: 'bold' }}>
                                                            <span>
                                                                I{plan.id_informe} / V{plan.id_version} 
                                                                {plan.comentarios && 
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
                                    <span className={styles['span-block']}>Tipo de Entrega:</span>
                                    <select name="informe" id="informe" {...registerAdd('informe', {required: true})}>
                                        <option value="" disabled selected>Seleccione un tipo de entrega</option>
                                        {reports.map((report) => (
                                            <option key={report.id_informe} value={report.id_informe}>
                                                {report.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    <span className={styles['span-block']}>Versión:</span>
                                    <select name="version" id="version" {...registerAdd('version', {required: true})}>
                                        <option value="" disabled selected>Seleccione la versión</option>
                                        {version.map((version) => (
                                            <option key={version.id_version} value={version.id_version}>
                                                {version.version}
                                            </option>
                                        ))}
                                    </select>
                                    <div>
                                        <span>Si es una Adenda, marque la casilla:</span>
                                        <input type="checkbox" {...registerAdd('adenda')}/>
                                    </div>
                                    <span>Especialidades Involucradas</span>
                                    <select name="especialidad" id="especialidad" {...registerAdd('especialidad', {required: true})}>
                                        <option value="" disabled selected>Seleccione una especialidad</option>
                                        {specialty.map((specialty) => (
                                            <option key={specialty.id_especialidad} value={specialty.id_especialidad}>
                                                {specialty.especialidad}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedProject.id_ot == 1 && (
                                        <>
                                        <span className={styles['span-block']}>OT:</span>
                                        <Controller
                                            name="ot"
                                            control={controlAdd}
                                            defaultValue={[]} // Valor inicial
                                            rules={{ required: "Debes seleccionar al menos una opción" }}
                                            render={({ field, fieldState: { error } }) => (
                                                <>
                                                    <MultiSelect
                                                        options={selectOptions}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        labelledBy="Selecciona opciones"
                                                        hasSelectAll={false}
                                                        disableSearch={true}
                                                        overrideStrings={{
                                                            "selectSomeItems": "Seleccione el N° de OT",
                                                        }}
                                                    />
                                                    {error && <p className="error">{error.message}</p>}
                                                </>
                                            )}
                                        />
                                        </>
                                    )}
                                    <span className={styles['span-block']}>Comentarios <strong id='strong-commentary'>(Opcional)</strong>:</span>
                                    <textarea name="comentarios" id="comentarios" {...registerAdd('comentarios')}></textarea>
                                    <input type="hidden" {...registerAdd("date")} value={selectedDate.toLocaleDateString('es-ES')} />
                                    <input type="hidden" {...registerAdd("project")} value={selectedProject.id_proyecto} />
                                    <input type="hidden" {...registerAdd("empresa")} value={sessionData.id_empresa} />
                                    <input type="hidden" {...registerAdd("estado")} value='0' />
                                    <div id={styles['buttons-container']}>
                                        <button onClick={closeModal} id={styles['secondary-btn']}>Cerrar</button>
                                        {(sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5) &&
                                            (
                                                <button type='submit' id={styles['complete-btn']}>Agregar</button>
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
                                {
                                    (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5) ? (
                                        <form onSubmit={handleSubmitDelete(deleteSubmit)} id={styles['delete-form']}>
                                            {
                                                !isEditing && 
                                                    <button type='submit' id={styles['delete-btn']}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} color={"#ff4d4d"} fill={"none"}>
                                                            <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                            <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                        </svg>
                                                    </button> 
                                            }
                                            <input type="hidden" {...registerDelete("date")} value={selectedDate.toLocaleDateString('es-ES')} />
                                            <input type="hidden" {...registerDelete("project")} value={selectedProject.id_proyecto} />
                                        </form>
                                    )
                                    :
                                    (
                                        <div style={{marginRight:'40px'}}></div>
                                    )
                                }
                            </div>
                            <form onSubmit={handleSubmitEdit(editSubmit)}>
                                <div id={styles['modal-body']}>
                                    <span className={styles['span-profile']} onClick={() => navigate(`/profile/${selectedProject.rut_personal}`)}>Jefe de Proyecto: {selectedProject.nombres} {selectedProject.apellido_p} {selectedProject.apellido_m}</span>
                                    <span className={styles['span-block']}>Fecha: {selectedDate.toLocaleDateString('es-ES')}</span>
                                    {isEditing ? (
                                        <>
                                        <span className={styles['span-block']}>Tipo de Entrega:</span>
                                        <select name="informe" id="informe" defaultValue={selectedPlan.id_informe} {...registerEdit('informe', {required: true})}>
                                            <option value="" disabled selected>Seleccione un tipo de entrega</option>
                                            {reports.map((report) => (
                                                <option key={report.id_informe} value={report.id_informe}>
                                                    {report.nombre}
                                                </option>
                                            ))}
                                        </select>
                                        <span className={styles['span-block']}>Versión:</span>
                                        <select name="version" id="version" defaultValue={selectedPlan.id_version} {...registerEdit('version', {required: true})}>
                                            <option value="" disabled selected>Seleccione la versión</option>
                                            {version.map((version) => (
                                                <option key={version.id_version} value={version.id_version}>
                                                    {version.version}
                                                </option>
                                            ))}
                                        </select>
                                        <div>
                                            <span>Si es una Adenda, marque la casilla:</span>
                                            <input type="checkbox" {...registerEdit('adenda')} defaultChecked={selectedPlan.adenda === 1 ? true : false}/>
                                        </div>
                                        <span>Especialidades Involucradas</span>
                                        <select name="especialidad" id="especialidad" defaultValue={selectedPlan.id_especialidad} {...registerEdit('especialidad', {required: true})}>
                                            <option value="" disabled selected>Seleccione una especialidad</option>
                                            {specialty.map((specialty) => (
                                                <option key={specialty.id_especialidad} value={specialty.id_especialidad}>
                                                    {specialty.especialidad}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedProject.id_ot == 1 && (
                                            <>
                                            <span className={styles['span-block']}>OT:</span>
                                            <Controller
                                                name="ot"
                                                control={controlEdit}
                                                defaultValue={selectedOts} // Valor inicial
                                                rules={{ required: "Debes seleccionar al menos una opción" }}
                                                render={({ field, fieldState: { error } }) => (
                                                    <>
                                                        <MultiSelect
                                                            options={selectOptions}
                                                            value={selectedOts}
                                                            onChange={(selectedOptions) => {
                                                                setSelectedOts(selectedOptions);
                                                                field.onChange(selectedOptions.map(option => option.value));
                                                            }}
                                                            labelledBy="Selecciona opciones"
                                                            hasSelectAll={false}
                                                            disableSearch={true}
                                                            overrideStrings={{
                                                                "selectSomeItems": "Seleccione el N° de OT",
                                                            }}
                                                        />
                                                        {error && <p className="error">{error.message}</p>}
                                                    </>
                                                )}
                                            />
                                            </>
                                        )}
                                        {selectedPlan.comentarios && (
                                            <>
                                            <span className={styles['span-block']}>Comentarios <strong id='strong-commentary'>(Opcional)</strong>:</span>
                                            <textarea name="comentarios" id="comentarios" {...registerEdit('comentarios')} defaultValue={selectedPlan.comentarios}></textarea>
                                            </>
                                        )}
                                        </>
                                    ) : (
                                        <>
                                        <span className={styles['span-block']}>Tipo de Entrega: Informe {selectedPlan.id_informe}</span>
                                        <span className={styles['span-block']}>Versión: {selectedPlan.id_version}</span>
                                        <span>
                                            {selectedPlan.adenda === 1 ? (
                                                <span>Esta entrega <strong style={{ fontSize: '16px', textDecoration: 'underline' }}>es</strong> una adenda</span>
                                            )
                                            : 
                                            (selectedPlan.adenda === 0 && (
                                                <span>Esta entrega <strong style={{ fontSize: '16px', textDecoration: 'underline' }}>no</strong> es una adenda</span>
                                            ))}
                                        </span>
                                        <span>
                                            {selectedPlan.id_especialidad === 10 ? (
                                                <span>Especialidad/es Involucrada/s: Más de una especialidad</span>
                                            )
                                            :
                                            selectedPlan.id_especialidad !== 10 && (
                                                <span>Especialidad/es Involucrada/s: {selectedPlan.especialidad}</span>
                                            )}
                                        </span>
                                        {selectedProject.id_ot == 1 && (
                                            <>
                                            <span className={styles['span-block']}>OT:</span>
                                            <div className={styles['ot-container']}>
                                            {selectedPlan.ot.map((ot, index) => (
                                                <span key={index}>{ot.numero_ot}</span>
                                            ))}
                                            </div>
                                            </>
                                        )}
                                        {selectedPlan.comentarios && (
                                            <>
                                            <span className={styles['span-block']}>Comentarios <strong id='strong-commentary'>(Opcional)</strong>:</span>
                                            <span>{selectedPlan.comentarios}</span>
                                            </>
                                        )}
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
                                    {(sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5) && (
                                        isEditing
                                        ? <button type='submit' id={styles['complete-btn']}>Aplicar</button>
                                        : <button onClick={(e) => {e.preventDefault(); switchEdit(); }} id={styles['edit-btn']} type='button'>Editar</button>
                                    )
                                    }
                                </div>
                            </form>
                            {
                                (sessionData.id_rol === 1 || sessionData.id_rol === 2 || sessionData.id_rol === 3 || sessionData.id_rol === 4 || sessionData.id_rol === 5) && (
                                    <form onSubmit={handleSubmitComplete(completeSubmit)} id={styles['complete-form']}>
                                        {
                                            isEditing && selectedPlan.estado === 0 || selectedPlan.estado === 1
                                                ? null
                                                : <button type='submit' id={styles['complete-btn']}>Completar</button>
                                        }
                                            <input type="hidden" {...registerComplete("date")} value={selectedDate.toLocaleDateString('es-ES')} />
                                            <input type="hidden" {...registerComplete("project")} value={selectedProject.id_proyecto} />
                                    </form>
                                )
                            }
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
                        <div id={styles['modal-customize-container']}>
                            {
                                sessionData.company === 1 ? (
                                    specialty
                                    .filter((specialty) => specialty.id_especialidad !== 10)
                                    .map((specialty, index) => (
                                        <div key={specialty.id_especialidad} className={styles['customize-item']}>
                                            <label htmlFor={specialty.id_especialidad}>{specialty.especialidad}</label>
                                            <input type="color" id={specialty.id_especialidad} name={specialty.especialidad} defaultValue={specialty.color_especialidad} {...registerCustomize(`specialty.${index}.color_especialidad`)} />
                                            <input type="hidden" defaultValue={specialty.id_especialidad} {...registerCustomize(`specialty.${index}.id_especialidad`)} />
                                        </div>
                                    ))
                                )
                                :
                                sessionData.company === 2 && (
                                    specialty
                                    .filter((specialty) => specialty.id_especialidad !== 2)
                                    .map((specialty, index) => (
                                        <div key={specialty.id_especialidad} className={styles['customize-item']}>
                                            <label htmlFor={specialty.id_especialidad}>{specialty.especialidad}</label>
                                            <input type="color" id={specialty.id_especialidad} name={specialty.especialidad} defaultValue={specialty.color_especialidad} {...registerCustomize(`specialty.${index}.color_especialidad`)} />
                                            <input type="hidden" defaultValue={specialty.id_especialidad} {...registerCustomize(`specialty.${index}.id_especialidad`)} />
                                        </div>
                                    )))
                            }
                            {
                                deliveryType.map((deliveryType, index) => (
                                    <div key={deliveryType.id_gantt_tipo_entrega} className={styles['customize-item']}>
                                        <label htmlFor={deliveryType.id_gantt_tipo_entrega}>{deliveryType.tipo_entrega}</label>
                                        <input type="color" id={deliveryType.id_gantt_tipo_entrega} name={deliveryType.tipo_entrega} defaultValue={deliveryType.color} {...registerCustomize(`delivery_type.${index}.color_servicio`)} />
                                        <input type="hidden" defaultValue={deliveryType.id_gantt_tipo_entrega} {...registerCustomize(`delivery_type.${index}.id_gantt_tipo_entrega`)} />
                                    </div>
                                ))
                            }
                        </div>
                        <button type='submit' className={styles['primary-btn']}>Guardar cambios</button>
                    </form>
                </Modal>
            </div>
        </main>
        </>
    );
}
