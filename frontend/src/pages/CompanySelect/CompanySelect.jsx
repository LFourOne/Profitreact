import { useNavigate } from 'react-router';
import axios from 'axios';
import styles from './companyselect.module.css';
import groupLogo from '../../assets/icon1.png'


export function CompanySelect(){

    const navigate = useNavigate();

    const onSubmitCompany = async (e, data) => {

        e.preventDefault();

        const response = await axios.post('http://localhost:5500/company/process', data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            navigate('/login');
        }

    }

    return(
        <>
        <main id={styles['main']}>
            <section id={styles['main-section']}>
                <section id={styles['top-section']}>
                    <div id={styles['top-section-logo']}>
                        <img src={groupLogo} alt="SOLUTIVA Logo" id={styles['logo']} draggable='false' />
                    </div>
                    <div id={styles['top-section-title']}>
                        <h1 id={styles['top-section-title-h1']}>¡Bienvenid@ a Profit!</h1>
                        <h2 id={styles['top-section-title-h2']}>Selecciona la empresa a la que perteneces</h2>
                    </div>
                </section>
                <section id={styles['middle-section']}>
                    <div className={styles['middle-section-company-card']}>
                        <div className={styles['middle-section-company-card-title-container']}>
                            <div className={styles['middle-section-company-card-title-svg-container']}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} color={"#ffffff"} fill={"none"}><path d="M3.25195 3V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.252 3V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.75195 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.75195 10V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.75195 17V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M19.6134 13.4393L20.3077 14.1317C20.8951 14.7175 20.8951 15.6672 20.3077 16.253L16.6702 19.9487C16.3841 20.234 16.0181 20.4264 15.6203 20.5005L13.3659 20.9885C13.01 21.0656 12.693 20.7504 12.7692 20.3952L13.2491 18.1599C13.3234 17.7632 13.5163 17.3982 13.8024 17.1129L17.4862 13.4393C18.0736 12.8536 19.026 12.8536 19.6134 13.4393Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <h1>Solutiva Consultores</h1>
                        </div>
                        <div className={styles['btn-container']}>
                            <button type='submit' className={styles['enter-btn']} onClick={(e) => onSubmitCompany(e, 1)}>Ingresar</button>
                        </div>
                    </div>
                    <div className={styles['middle-section-company-card']}>
                        <div className={styles['middle-section-company-card-title-container']}>
                            <div className={styles['middle-section-company-card-title-svg-container']}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={32} height={32} color={"#ffffff"} fill={"none"}><path d="M12 7C6.47715 7 2 7.89543 2 9C2 9.80571 4.38215 10.5001 7.81468 10.8169C8.43288 10.874 8.85702 11.4721 8.92296 12.0894C9.09436 13.6942 10.384 15 12 15C13.616 15 14.9056 13.6942 15.077 12.0894C15.143 11.4721 15.5671 10.874 16.1853 10.8169C19.6179 10.5001 22 9.80571 22 9C22 7.89543 17.5228 7 12 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M11.9998 12H12.0088" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 3H6M8 3H6M6 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16 3H18M20 3H18M18 3V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 21V19.5C5 16.7386 7.23858 14.5 10 14.5M19 21V19.5C19 16.7386 16.7614 14.5 14 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                            <h1>Solutiva Sistemas</h1>
                        </div>
                        <div className={styles['btn-container']}>
                            <button type='submit' className={styles['enter-btn']} onClick={(e) => onSubmitCompany(e, 2)}>Ingresar</button>
                        </div>
                    </div>
                </section>
                <section id={styles['bottom-section']}>
                    <div id={styles['bottom-section-copyright-container']}>
                        <span>© 2025 Grupo SOLUTIVA. Todos los derechos reservados.</span>
                    </div>
                </section>
            </section>
        </main>
        </>
    )
}