import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const sectionKeys = {
    terms: 'footer.termsOfService',
    privacy: 'footer.privacyPolicy',
    imprint: 'footer.imprint',
};

export default function LegalPage() {
    const { section } = useParams();
    const { t } = useTranslation();
    const titleKey = sectionKeys[section];
    const title = titleKey ? t(titleKey) : section;

    return (
        <div className="container">
            <h1>{title}</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-lg)' }}>
                {t('legal.placeholder')}
            </p>
            <Link to="/" style={{ marginTop: 'var(--space-lg)', display: 'inline-block' }}>
                {t('common.back')}
            </Link>
        </div>
    );
}
