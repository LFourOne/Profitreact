import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidvd4 } from 'uuid';
import Modal from 'react-modal';
import { data, useNavigate } from 'react-router';
import styles from './Gantt.module.css';
import apiClient from '../../services/api';

export function Gantt() {

    const navigate = useNavigate();

    const [array, setArray] = useState([]);
    const [sessionData, setSessionData] = useState([]);
    const [staff, setStaff] = useState([]);
    const [specialty, setSpecialty] = useState([]);
    const [dates, setDates] = useState([]);
    const [planification, setPlanification] = useState([]);
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [Delivery, setDelivery] = useState([]);
    const [reports, setReports] = useState([]);
    const [version, setVersion] = useState([]);
    const [ot, setOt] = useState([]);
    const [deliveryType, setDeliveryType] = useState([]);
    
    const [selectedStaff, setSelectedStaff] = useState([]);

    const fetchApi = async () => {
        try {

            const response = await apiClient.get('/gantt');
            
            setArray(response.data.projects);
            setStaff(response.data.staff);
            setSpecialty(response.data.specialty);
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

    const onSubmit = async (data) => {

        console.log('Datos a enviar:', data);

        if (!data.selectedStaff || data.selectedStaff === undefined || data.selectedStaff.length === 0) {
            alert('Por favor, seleccione un miembro del personal antes de asignar o eliminar.');
            return;
        }

        try {
            const response = await apiClient.post('/gantt/planification/process', data);
            console.log('Respuesta del servidor:', response.data);
            await fetchApi();
        } catch (error) {
            console.error('Error al enviar datos:', error);
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

    const handleStaffSelect = (staff) => {
        setSelectedStaff(staff);
    };

    const handleMonthChange = (event) => {
        const newMonth = event.target.value;
        setSelectedMonth(newMonth);
        
        // Cargar datos filtrados
        if (selectedFilterSpecialty && newMonth) {
            const dateStr = `${newMonth}-01`;
            fetchFilteredPlanifications(selectedFilterSpecialty, dateStr);
        }

        // Cargar entregas filtradas
        fetchFilteredDelivery(`${newMonth}-01`);
    };

    const handlePreviousMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const newDate = new Date(year, month - 1, 1); 
        newDate.setMonth(newDate.getMonth() - 1);
        
        const newMonth = newDate.toISOString().slice(0, 7);
        setSelectedMonth(newMonth);
        
        // Cargar datos filtrados
        if (selectedFilterSpecialty && newMonth) {
            const dateStr = `${newMonth}-01`;
            fetchFilteredPlanifications(selectedFilterSpecialty, dateStr);
        }

        // Cargar entregas filtradas
        fetchFilteredDelivery(`${newMonth}-01`);
    };
    
    const handleNextMonth = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const newDate = new Date(year, month - 1, 1);
        newDate.setMonth(newDate.getMonth() + 1);
        
        const newMonth = newDate.toISOString().slice(0, 7);
        setSelectedMonth(newMonth);
        
        // Cargar datos filtrados
        if (selectedFilterSpecialty && newMonth) {
            const dateStr = `${newMonth}-01`;
            fetchFilteredPlanifications(selectedFilterSpecialty, dateStr);
        }

        // Cargar entregas filtradas
        fetchFilteredDelivery(`${newMonth}-01`);
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
        // Solo establecer la especialidad inicial si no hay una ya seleccionada
        if (sessionData.id_especialidad && !selectedFilterSpecialty) {
            setSelectedFilterSpecialty(sessionData.id_especialidad);
            fetchFilteredPlanifications(sessionData.id_especialidad, `${selectedMonth}-01`);
            fetchFilteredDelivery(`${selectedMonth}-01`);
        }
        // Si ya hay una especialidad seleccionada, mantenerla y solo actualizar los datos
        else if (selectedFilterSpecialty && selectedMonth) {
            fetchFilteredPlanifications(selectedFilterSpecialty, `${selectedMonth}-01`);
        }
    }, [sessionData, selectedMonth]);

    const handleSpecialtyChange = (event) => {
        const newSpecialty = Number(event.target.value);
        setSelectedFilterSpecialty(newSpecialty);
        setSelectedStaff([]); // Limpiar el staff seleccionado al cambiar la especialidad
        
        // Cargar datos filtrados inmediatamente
        if (newSpecialty && selectedMonth) {
            const dateStr = `${selectedMonth}-01`;
            fetchFilteredPlanifications(newSpecialty, dateStr);
        }
    };

    // Esta función se encarga de filtrar las planificaciones por especialidad y mes.
    const fetchFilteredPlanifications = async (specialtyId, date) => {
        try {
            const response = await apiClient.get(`/gantt/api/get-specialty-date`, {
                params: {
                    specialty_id: specialtyId,
                    date: date
                }
            });
            
            if (response.data.planification) {
                setPlanification(response.data.planification);
            }

            console.log('Planificaciones filtradas:', response.data.planification);
        } catch (error) {
            console.error('Error al cargar planificaciones filtradas:', error);
        }
    };

    const fetchFilteredDelivery = async (date) => {
        try {
            const response = await apiClient.get(`/gantt/api/get-delivery-date`, {
                params: {
                    date: date
                }
            });

            if (response.data.delivery) {
                setDelivery(response.data.delivery);
                setReports(response.data.report);
                setVersion(response.data.version);
                setOt(response.data.ot);
                setDeliveryType(response.data.delivery_type);
            }
            console.log('Entregas filtradas:', response.data);
        } catch (error) {
            console.error('Error al cargar entregas filtradas:', error);
        }
    };

    return (
        <>
        <main className={styles['main']}>
            <section className={styles['gantt-header']}>
                <div className={styles['gantt-header-left-subcontainer']}>
                    <select name="filter-specialty" id={styles['filter-specialty']} value={selectedFilterSpecialty} onChange={handleSpecialtyChange}>
                        <option value="" disabled>Seleccione una especialidad</option>
                        {
                            sessionData.company === 1 ? (
                                specialty
                                .filter((specialty) => (specialty.id_especialidad !== 1 && specialty.id_especialidad !== 2 && specialty.id_especialidad !== 8  && specialty.id_especialidad !== 10))
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
                    <div className={styles['staff-container']}>
                    {
                        selectedFilterSpecialty && (
                            staff
                            .filter((staff) => staff.id_especialidad === selectedFilterSpecialty)
                            .map((staff) => (
                                <button key={staff.rut_personal} 
                                className={selectedStaff.rut_personal === staff.rut_personal ? styles['staff-button-selected'] : styles['staff-button']} 
                                style={{ backgroundColor: staff.color, color: '#ffffff'}} 
                                onClick={() => handleStaffSelect(staff)}>
                                            {staff.iniciales_nombre}
                                    </button>
                                ))
                            )
                        }
                    </div>
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
                                            onClick={() => onSubmit({ id_proyecto: projects.id_proyecto, fecha: date.toISOString().split('T')[0], selectedStaff })}
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
            </section>
        </main>
        </>
    );
}
