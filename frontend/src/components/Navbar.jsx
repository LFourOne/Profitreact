import { NavLink } from 'react-router-dom';
import logo from '../assets/solutiva-logo-solo.png'
import styles from '../css/navbar.module.css';

export function Navbar() {
  return (
    <nav className={styles['navbar']}>
      <NavLink to="/index"><img src={logo} alt="SOLUTIVA Logo" id={styles['solutiva-logo']} draggable="false" /></NavLink>
      <div className={styles['navbar-links']}>
        <NavLink to="/index" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Inicio</NavLink>
        <div className={styles['dropdown']}>
          <NavLink to="/meeting" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Reuniones</NavLink>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          <div className={styles['dropdown-content']}> 
            <NavLink to="/meeting" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Reuniones</NavLink>
            <NavLink to="/reports" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Reportes</NavLink>
          </div>
        </div>
        <div className={styles['dropdown']}>
          <NavLink to="/gantt" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Gantt</NavLink>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          <div className={styles['dropdown-content']}>
            <NavLink to="/gantt" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Planificación</NavLink>
            <NavLink to="/gantt/delivery" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Entregas</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}