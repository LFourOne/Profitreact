import styles from './TrainingCard.module.css';

export function TrainingCard ({ title, date, instructor, format, length, state, onClick}) {
    return (
        <article className={styles['card-container']}>
            <section className={styles['card-top-subcontainer']}>
                <h1 className={styles['card-top-subcontainer-h1']}>{title}</h1>
                <h2 className={styles['card-top-subcontainer-h2']}>{date}</h2>
            </section>
            <section className={styles['card-middle-subcontainer']}>
                <div className={styles['card-middle-subcontainer-content']}>
                    <span className={styles['card-middle-subcontainer-h3']}>Instructor:</span>
                    <span className={styles['card-middle-subcontainer-span']}>{instructor}</span>
                </div>
                <div className={styles['card-middle-subcontainer-content']}>
                    <span className={styles['card-middle-subcontainer-h3']}>Modalidad:</span>
                    <span className={styles['card-middle-subcontainer-span']}>{format}</span>
                </div>
                <div className={styles['card-middle-subcontainer-content']}>
                    <span className={styles['card-middle-subcontainer-h3']}>Duración:</span>
                    <span className={styles['card-middle-subcontainer-span']}>{length}</span>
                </div>
            </section>
            <section className={styles['card-bottom-subcontainer']}>
                {
                    state === 'Vigente' ? 
                    (
                        <span className={styles['card-bottom-subcontainer-state-current']}>{state}</span>
                    )
                    :
                    state === 'Completado' &&
                    (
                        <span className={styles['card-bottom-subcontainer-state-complete']}>{state}</span>
                    )
                }
                <button className={styles['card-bottom-subcontainer-details-btn']} onClick={onClick}>Ver Detalles</button>
            </section>
        </article>
    )
}