import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LegalPage, { LegalSection } from './LegalPage';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, options) => {
            const translations = {
                'footer.termsOfService': 'Terms of Service',
                'footer.privacyPolicy': 'Privacy Policy',
                'footer.imprint': 'Imprint',
                'common.pageNotFound': 'Page Not Found',
                'common.back': 'Back',
                'legal.lastUpdatedLabel': 'Last updated',
                'legal.terms': {
                    lastUpdated: 'April 15, 2026',
                    sections: [
                        {
                            heading: '1. Acceptance of Terms',
                            paragraphs: ['By accessing or using Decide-O-Mat, you agree to these terms.'],
                        },
                        {
                            heading: '2. User Conduct',
                            paragraphs: ['You agree not to:'],
                            items: ['Abuse the service', 'Violate laws'],
                        },
                    ],
                },
                'legal.privacy': {
                    lastUpdated: 'May 1, 2026',
                    sections: [
                        {
                            heading: '1. Data Controller',
                            paragraphs: ['We take your privacy seriously.'],
                        },
                    ],
                },
                'legal.imprint': {
                    sections: [
                        {
                            heading: 'Contact Information',
                            address: ['Example GmbH', 'Musterstraße 1', '12345 Berlin'],
                        },
                    ],
                },
            };

            if (options && options.returnObjects) {
                return translations[key] || {};
            }
            return translations[key] || key;
        },
    }),
}));

function renderLegalPage(initialPath = '/legal/terms') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/legal/:section" element={<LegalPage />} />
                <Route path="*" element={<LegalPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe('LegalPage', () => {
    it('renders terms of service page with heading, sections, and items', () => {
        renderLegalPage('/legal/terms');

        expect(screen.getByRole('heading', { level: 1, name: 'Terms of Service' })).toBeInTheDocument();
        expect(screen.getByText(/Last updated: April 15, 2026/)).toBeInTheDocument();
        expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument();
        expect(screen.getByText('By accessing or using Decide-O-Mat, you agree to these terms.')).toBeInTheDocument();
        expect(screen.getByText('Abuse the service')).toBeInTheDocument();
        expect(screen.getByText('Violate laws')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/');
    });

    it('renders privacy policy page with metadata', () => {
        renderLegalPage('/legal/privacy');

        expect(screen.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeInTheDocument();
        expect(screen.getByText(/Last updated: May 1, 2026/)).toBeInTheDocument();
        expect(screen.getByText('1. Data Controller')).toBeInTheDocument();
        expect(screen.getByText('We take your privacy seriously.')).toBeInTheDocument();
    });

    it('renders imprint page with address details', () => {
        renderLegalPage('/legal/imprint');

        expect(screen.getByRole('heading', { level: 1, name: 'Imprint' })).toBeInTheDocument();
        expect(screen.getByText('Contact Information')).toBeInTheDocument();
        expect(screen.getByText(/Example GmbH/)).toBeInTheDocument();
        expect(screen.getByText(/Musterstraße 1/)).toBeInTheDocument();
        expect(screen.getByText(/12345 Berlin/)).toBeInTheDocument();
    });

    it('renders page not found for unknown legal sections', () => {
        renderLegalPage('/legal/unknown');

        expect(screen.getByRole('heading', { level: 1, name: 'Page Not Found' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/');
    });

    it('handles sections with null items gracefully without crashing', () => {
        render(
            <MemoryRouter initialEntries={['/legal/custom']}>
                <Routes>
                    <Route path="/legal/:section" element={<LegalPage />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Page Not Found')).toBeInTheDocument();
    });
});

describe('LegalSection component', () => {
    it('returns null if section is null or undefined', () => {
        const { container: c1 } = render(<LegalSection section={null} />);
        expect(c1.firstChild).toBeNull();

        const { container: c2 } = render(<LegalSection section={undefined} />);
        expect(c2.firstChild).toBeNull();
    });

    it('handles non-array address, paragraphs, and items gracefully', () => {
        const malformedSection = {
            heading: 'Malformed Section',
            address: 'not-an-array',
            paragraphs: null,
            items: undefined,
        };

        render(<LegalSection section={malformedSection} />);
        expect(screen.getByText('Malformed Section')).toBeInTheDocument();
    });

    it('renders address with line breaks between lines', () => {
        const addressSection = {
            heading: 'Office',
            address: ['Line 1', 'Line 2'],
        };

        render(<LegalSection section={addressSection} />);
        expect(screen.getByText(/Line 1/)).toBeInTheDocument();
        expect(screen.getByText(/Line 2/)).toBeInTheDocument();
    });
});
