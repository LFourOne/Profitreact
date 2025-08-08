import apiClient from '../../../services/api';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import styles from './ClientManagement.module.css';
import logo from '../../../assets/icon1.png'

export function ClientManagement() {

    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchApi = async () => {
        try {

            const response = await apiClient.get('/admin/clients-management');

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
        fetchApi();
    }, []);

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <section className={styles['header-section']}>
                    <div className={styles['header-section-text-container']}>
                        <h1>Mantenedor de Mandantes</h1>
                        <p>Administra y gestiona todos los mandantes de Profit</p>
                    </div>
                    <div className={styles['header-section-logo-container']}>
                        <img src={logo} className={styles['logo']} alt="Logo de Profit" />
                    </div>
                </section>
                <section className={styles['content-section']}>
                    <header>
                        <div className={styles['header-title']}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            <h1>Lista de Usuarios</h1>
                        </div>
                        <div>
                            <button>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Crear mandante
                            </button>
                        </div>
                    </header>
                    <div className={styles['content']}>
                        <table>
                            <thead>
                                <tr>
                                    <th>RUT</th>
                                    <th>Nombre</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </section>
            </main>
        )}
        </>
    )
}