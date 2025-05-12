import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import axios from 'axios';
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
          const response = await axios.get('http://localhost:5500/navbar', { withCredentials: true });
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
            <NavLink to="/index" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Inicio</NavLink>
            <div className={styles['dropdown']}>
                <button onClick={() => toggleDropdown('meeting')} className={`${styles['dropdown-button']} ${['/meeting', '/reports'].includes(window.location.pathname) ? styles['selected-link'] : ''}`}>
                    Reuniones
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className={`${styles['dropdown-content']} ${activeDropdown === 'meeting' ? styles['open'] : ''}`}>
                  {
                    (role === 1 || role === 2 || role === 3 || role === 4 || role === 5 || role === 6) && (
                        <NavLink to="/meeting" onClick={() => setActiveDropdown(null)}>Reuniones</NavLink>
                    )
                  }
                    <NavLink to="/reports" onClick={() => setActiveDropdown(null)}>Reportes</NavLink>
                </div>
            </div>
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
            <NavLink to="/training" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Capacitaciones</NavLink>
            {
              (role === 1 || role === 2 || role === 3) && (
                <NavLink to="/register" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Registrar</NavLink>
              )
            }
        </div>
        <div className={styles['navbar-user']}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
    </nav>
  );
}