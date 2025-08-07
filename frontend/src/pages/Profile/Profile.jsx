import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import apiClient from '../../services/api';
import styles from './Profile.module.css';

export function Profile() {

    const navigate = useNavigate();

    const { id } = useParams();

    const [profile, setProfile] = useState([]);
    
    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await apiClient.get(`/profile/${id}`);
            setProfile(response.data.profile);
            console.log(response.data);
        } 
        catch (error) {
            if (error.response && error.response.status === 401) {
                navigate('/');
            }
            else (
                navigate('/')
            );
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0 a 11
        const year = date.getUTCFullYear();
    
        return `${day}/${month}/${year}`;
    };

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <div className={styles['header']}>
                    <div className={styles['left-container']}>
                        <div className={styles['profile-picture']}>
                            <span>{profile.iniciales_nombre}</span>
                        </div>
                    </div>
                    <div className={styles['right-container']}>
                        <h1>{profile.nombres} {profile.apellido_p} {profile.apellido_m}</h1>
                        <h2>{profile.especialidad}</h2>
                        <p>{profile.rol}</p>
                    </div>
                </div>
                <div className={styles['content']}>
                    <div>
                        <label>Correo</label>
                        <span>{profile.email}</span>
                    </div>
                    <div>
                        <label>Estado</label>
                        {
                            profile.estado === 1 ? (
                                <span className={styles['active']}>Activo</span>
                            ) 
                            : 
                            (
                                <span className={styles['inactive']}>Inactivo</span>
                            )
                        }
                    </div>
                    <div>
                        <label>Usuario</label>
                        <span>{profile.usuario}</span>
                    </div>
                    <div>
                        <label>Iniciales</label>
                        <span>{profile.iniciales_nombre}</span>
                    </div>
                    <div>
                        <label>Fecha de Contratación</label>
                        <span>{formatDate(profile.fecha_contratacion)}</span>
                    </div>
                    <div>
                        <label>Fecha de Nacimiento</label>
                        <span>{formatDate(profile.fecha_nacimiento)}</span>
                    </div>
                </div>
            </main>
        )}
        </>
    )
}