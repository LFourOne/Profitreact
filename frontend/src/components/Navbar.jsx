import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/solutiva-logo-solo.png'
import styles from '../css/navbar.module.css';

export function Navbar() {

  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  useEffect(() => {
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
                <button onClick={() => toggleDropdown('meeting')} className={styles['dropdown-button']}>
                    Reuniones
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className={`${styles['dropdown-content']} ${activeDropdown === 'meeting' ? styles['open'] : ''}`}>
                    <NavLink to="/meeting" onClick={() => setActiveDropdown(null)}>Reuniones</NavLink>
                    <NavLink to="/reports" onClick={() => setActiveDropdown(null)}>Reportes</NavLink>
                </div>
            </div>
            <div className={styles['dropdown']}>
                <button onClick={() => toggleDropdown('gantt')} className={styles['dropdown-button']}>
                    Gantt
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                <div className={`${styles['dropdown-content']} ${activeDropdown === 'gantt' ? styles['open'] : ''}`}>
                    <NavLink to="/gantt" onClick={() => setActiveDropdown(null)}>Planificación</NavLink>
                    <NavLink to="/gantt/delivery" onClick={() => setActiveDropdown(null)}>Entregas</NavLink>
                </div>
            </div>
        </div>
        <div className={styles['navbar-user']}>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
        </div>
    </nav>
  );
}