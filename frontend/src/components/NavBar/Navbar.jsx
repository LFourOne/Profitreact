import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import apiClient from '../../services/api';
import logo from '../../assets/solutiva-logo-solo.png'
import styles from './NavBar.module.css';

export function NavBar() {

  const [activeDropdown, setActiveDropdown] = useState(null);

  const navigate = useNavigate();

  const [role, setRole] = useState([]);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  useEffect(() => {

    const fetchApi = async () => {
      try {
          const response = await apiClient.get('/navbar');
          setRole(response.data.role);
      }
      catch (error) {
        if (error.response && error.response.status === 401) {
          navigate('/');
        }
        else {
          console.error('Error inesperado:', error);
        }
      }
  
      }

    fetchApi();

    const handleClickOutside = (event) => {
      if (!event.target.closest(`.${styles['dropdown']}`)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav className={styles['navbar']}>
        <div className={styles['navbar-logo']}>
            <NavLink to="/index"><img src={logo} alt="SOLUTIVA Logo" id={styles['solutiva-logo']} draggable="false" /></NavLink>
        </div>
        <div className={styles['navbar-links']}>
            <NavLink to="/index" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Dashboard</NavLink>
            <div className={styles['dropdown']}>
                <button onClick={() => toggleDropdown('gantt')} className={`${styles['dropdown-button']} ${['/gantt', '/gantt/delivery'].includes(window.location.pathname) ? styles['selected-link'] : ''}`}>
                    Gantt
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className={`${styles['dropdown-content']} ${activeDropdown === 'gantt' ? styles['open'] : ''}`}>
                    <NavLink to="/gantt" onClick={() => setActiveDropdown(null)}>Planificación</NavLink>
                    <NavLink to="/gantt/delivery" onClick={() => setActiveDropdown(null)}>Entregas</NavLink>
                </div>
            </div>
            <NavLink to="/hh-register" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Registro HH</NavLink>
            <div className={styles['dropdown']}>
                <button onClick={() => toggleDropdown('resources')} className={`${styles['dropdown-button']} ${['/meeting', '/meeting/minute/', '/training'].includes(window.location.pathname) ? styles['selected-link'] : ''}`}>
                    Recursos
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className={`${styles['dropdown-content']} ${activeDropdown === 'resources' ? styles['open'] : ''}`}>
                    {
                      (role === 1 || role === 2 || role === 3 || role === 4 || role === 5 || role === 6 || role === 7) && (
                        <NavLink to="/meeting" onClick={() => setActiveDropdown(null)} className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Reuniones</NavLink>
                      )
                    }
                    <NavLink to="/training" onClick={() => setActiveDropdown(null)} className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Capacitaciones</NavLink>
                    <NavLink to="/request" onClick={() => setActiveDropdown(null)} className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Solicitudes</NavLink>
                </div>
            </div>
            {
              (role === 1 || role === 2 || role === 3) && (
                <div className={styles['dropdown']}>
                    <button onClick={() => toggleDropdown('admin')} className={`${styles['dropdown-button']} ${['/admin', '/admin/user-management', '/admin/hh-management'].includes(window.location.pathname) ? styles['selected-link'] : ''}`}>
                        Gestión
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <div className={`${styles['dropdown-content']} ${activeDropdown === 'admin' ? styles['open'] : ''}`}>
                        <NavLink to="/admin/user-management" onClick={() => setActiveDropdown(null)} className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Mantenedor Personas</NavLink>
                        <NavLink to="/admin/project-report-task" onClick={() => setActiveDropdown(null)} className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Mantenedor HH</NavLink>
                    </div>
                </div>
              )
            }
        </div>
        <div className={styles['navbar-user']}></div>
    </nav>
  );
}