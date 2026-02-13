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

    return (
        <div className="container">
            <h1>{t(titleKey)}</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-lg)' }}>
                {t('legal.placeholder')}
            </p>
            <Link to="/" style={{ marginTop: 'var(--space-lg)', display: 'inline-block' }}>
                {t('common.back')}
            </Link>
        </div>
    );
}
