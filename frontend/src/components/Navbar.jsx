import { NavLink } from 'react-router-dom';
import logo from '../assets/solutiva-logo-solo.png'
import styles from '../css/navbar.module.css';

export function Navbar() {
  return (
    <nav className={styles['navbar']}>
      <NavLink to="/index"><img src={logo} alt="SOLUTIVA Logo" id={styles['solutiva-logo']} draggable="false" /></NavLink>
      <div className={styles['navbar-links']}>
        <NavLink to="/index" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Inicio</NavLink>
        <NavLink to="/meeting" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Reuniones</NavLink>
        <NavLink to="/reports" className={({ isActive }) => (isActive ? styles['selected-link'] : "")}>Reportes</NavLink>
      </div>
    </nav>
  );
}