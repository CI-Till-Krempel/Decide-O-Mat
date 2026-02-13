import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from './Footer';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'footer.termsOfService': 'Terms of Service',
                'footer.privacyPolicy': 'Privacy Policy',
                'footer.imprint': 'Imprint',
                'header.appName': 'Decide-O-Mat',
            };
            return translations[key] || key;
        },
    }),
}));

function renderFooter() {
    return render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    );
}

describe('Footer Component', () => {
    it('renders legal links', () => {
        renderFooter();
        expect(screen.getByText('Terms of Service')).toBeInTheDocument();
        expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
        expect(screen.getByText('Imprint')).toBeInTheDocument();
    });

    it('renders legal links with correct routes', () => {
        renderFooter();
        expect(screen.getByText('Terms of Service').closest('a')).toHaveAttribute('href', '/legal/terms');
        expect(screen.getByText('Privacy Policy').closest('a')).toHaveAttribute('href', '/legal/privacy');
        expect(screen.getByText('Imprint').closest('a')).toHaveAttribute('href', '/legal/imprint');
    });

    it('renders app name and version', () => {
        renderFooter();
        expect(screen.getByText('Decide-O-Mat')).toBeInTheDocument();
        expect(screen.getByText('v0.0.0')).toBeInTheDocument();
    });
});
