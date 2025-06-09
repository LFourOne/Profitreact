import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import axios from 'axios';
import styles from './Profile.module.css';

export function Profile() {

    const navigate = useNavigate();

    const { id } = useParams();

    const [loading, setLoading] = useState(true);

    const fetchApi = async () => {
        try {
            const response = await axios.get(`/profile/${id}`, {widthCredentials: true});
            console.log(response.data);
        } 
        catch (error) {
            navigate('/');
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchApi();
    }, []);

    return (
        <>
        {loading ? <p id='loading'>Cargando</p> : (
            <main className={styles['main']}>
                <div>
                    
                </div>
            </main>
        )}
        </>
    )
}