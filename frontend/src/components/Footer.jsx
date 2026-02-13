import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.css';

const Footer = () => {
    const { t } = useTranslation();
    const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';

    return (
        <footer className={styles.footer}>
            <nav className={styles.legalLinks}>
                <Link to="/legal/terms" className={styles.legalLink}>
                    {t('footer.termsOfService')}
                </Link>
                <Link to="/legal/privacy" className={styles.legalLink}>
                    {t('footer.privacyPolicy')}
                </Link>
                <Link to="/legal/imprint" className={styles.legalLink}>
                    {t('footer.imprint')}
                </Link>
            </nav>
            <div className={styles.branding}>
                <span>{t('header.appName')}</span>
                <span>v{appVersion}</span>
            </div>
        </footer>
    );
};

export default Footer;
