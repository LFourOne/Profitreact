import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Request.module.css';

export function Request() {
    return (
        <>
            <main className={styles['main']}>
                <section className={styles['content-section']}>
                    <header>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                        </div>
                        <h1>Solicitud a Administración</h1>
                        <p>¿Necesitas solicitar recursos, permisos o hacer una petición administrativa? Completa nuestro formulario de solicitudes.</p>
                    </header>
                    <div>
                        <a href="https://forms.office.com/Pages/ResponsePage.aspx?id=3Nzh3jFSK0-7AeiXkSWejFOv_brU-AtDkT4wBIFwrERUNDVQTlMxWlZWNllCTklON0RIOUQ1UjZMUy4u" target='_blank' referrerPolicy='no-referrer'>Abrir formulario</a>
                    </div>
                </section>
            </main>
        </>
    )
}