import { useNavigate } from 'react-router';
import axios from 'axios';
import styles from '../css/training.module.css';
import { useState, useEffect } from 'react';

export function Training() {

    const [loading, setLoading] = useState(true);

    return(
        <>
        {loading ? <p>Cargando</p> : (
            <main>
                
            </main>
        )}
        </>
    )
}