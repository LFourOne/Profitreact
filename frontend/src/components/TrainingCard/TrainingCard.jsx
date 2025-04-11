import styles from './TrainingCard.module.css';

export function TrainingCard ({ title, date, instructor, participants, length, state}) {
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
                    <span className={styles['card-middle-subcontainer-h3']}>Participantes:</span>
                    <span className={styles['card-middle-subcontainer-span']}>{participants}</span>
                </div>
                <div className={styles['card-middle-subcontainer-content']}>
                    <span className={styles['card-middle-subcontainer-h3']}>Duración:</span>
                    <span className={styles['card-middle-subcontainer-span']}>{length}</span>
                </div>
            </section>
            <section className={styles['card-bottom-subcontainer']}>
                <span className={styles['card-bottom-subcontainer-state']}>{state}</span>
                <button className={styles['card-bottom-subcontainer-details-btn']}>Ver Detalles</button>
            </section>
        </article>
    )
}