import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import apiClient from '../../services/api'
import styles from './Feedback.module.css';

export function Feedback() {
    return (
        <>
            <main className={styles['main']}>
                <section className={styles['content-section']}>
                    <header>
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </div>
                        <h1>Retroalimentación Profit</h1>
                        <p>¿Tienes alguna sugerencia o comentario sobre nuestra plataforma? Completa nuestro formulario de retroalimentación.</p>
                    </header>
                    <div>
                        <a href="https://forms.office.com/r/n40y99Ebvz" target='_blank' referrerPolicy='no-referrer'>Abrir formulario</a>
                    </div>
                </section>
            </main>
        </>
    )
}