import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './LegalPage.module.css';

const sectionKeys = {
    terms: 'footer.termsOfService',
    privacy: 'footer.privacyPolicy',
    imprint: 'footer.imprint',
};

function LegalSection({ section }) {
    return (
        <section className={styles.section}>
            {section.heading && <h2 className={styles.sectionHeading}>{section.heading}</h2>}
            {section.address && (
                <address className={styles.address}>
                    {section.address.map((line, i) => (
                        <span key={i}>{line}{i < section.address.length - 1 && <br />}</span>
                    ))}
                </address>
            )}
            {section.paragraphs && section.paragraphs.map((p, i) => (
                <p key={i} className={styles.paragraph}>{p}</p>
            ))}
            {section.items && (
                <ul className={styles.list}>
                    {section.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
            )}
        </section>
    );
}

export default function LegalPage() {
    const { section } = useParams();
    const { t } = useTranslation();
    const titleKey = sectionKeys[section];

    if (!titleKey) {
        return (
            <div className="container">
                <h1>{t('common.pageNotFound')}</h1>
                <Link to="/" style={{ marginTop: 'var(--space-lg)', display: 'inline-block' }}>
                    {t('common.back')}
                </Link>
            </div>
        );
    }

    const content = t(`legal.${section}`, { returnObjects: true });
    const sections = Array.isArray(content?.sections) ? content.sections : [];

    return (
        <div className="container">
            <Link to="/" className={styles.backLink}>{t('common.back')}</Link>
            <h1 className={styles.title}>{t(titleKey)}</h1>
            {content?.lastUpdated && (
                <p className={styles.meta}>
                    {t('legal.lastUpdatedLabel')}: {content.lastUpdated}
                </p>
            )}
            {sections.map((sec, i) => (
                <LegalSection key={i} section={sec} />
            ))}
        </div>
    );
}
