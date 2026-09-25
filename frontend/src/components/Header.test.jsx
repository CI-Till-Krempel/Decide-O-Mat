import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

const mockChangeLanguage = vi.fn();
let currentLanguage = 'en';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'header.appName': 'Decide-O-Mat',
                'header.navDecision': 'Decision',
                'header.navActivities': 'Activities',
                'header.navLogin': 'Log in',
                'header.switchLanguage': 'Switch language',
                'header.mainNavigation': 'Main navigation',
                'header.mobileNavigation': 'Mobile navigation',
                'userSettings.guestLabel': 'Guest',
                'common.edit': 'Edit',
            };
            return translations[key] || key;
        },
        i18n: {
            get language() { return currentLanguage; },
            get resolvedLanguage() { return currentLanguage; },
            changeLanguage: mockChangeLanguage,
        }
    }),
}));

// Mock UserContext
vi.mock('../contexts/UserContext', () => ({
    useUser: vi.fn(() => ({ user: null })),
}));

// Mock EncryptionService
vi.mock('../services/EncryptionService', () => ({
    default: {
        isEnabled: vi.fn(() => false),
        importKey: vi.fn(),
    },
}));

// Mock UserSettings
vi.mock('./UserSettings', () => ({
    default: ({ onClose }) => (
        <div data-testid="user-settings-panel">
            <button onClick={onClose}>Close</button>
        </div>
    ),
}));

import { useUser } from '../contexts/UserContext';

function renderHeader(initialPath = '/') {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Header />
        </MemoryRouter>
    );
}

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useUser.mockReturnValue({ user: null });
    });

    it('renders the logo', () => {
        renderHeader();
        expect(screen.getByText('Decide-O-Mat')).toBeInTheDocument();
    });

    it('provides accessible names for navigation landmarks', () => {
        renderHeader();
        expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    });

    it('renders the Decision nav link', () => {
        renderHeader();
        expect(screen.getByText('Decision')).toBeInTheDocument();
    });

    it('renders Log in link when no user', () => {
        renderHeader();
        expect(screen.getByText('Log in')).toBeInTheDocument();
    });

    it('does not render Activities link when no user', () => {
        renderHeader();
        expect(screen.queryByText('Activities')).not.toBeInTheDocument();
    });

    it('renders Activities link when user is logged in', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Alice', isAnonymous: true },
        });
        renderHeader();
        expect(screen.getByText('Activities')).toBeInTheDocument();
    });

    it('renders user display name when user exists', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Alice', isAnonymous: true },
        });
        renderHeader();
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('renders Guest label when user has no displayName', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: '', isAnonymous: true },
        });
        renderHeader();
        expect(screen.getByText('Guest')).toBeInTheDocument();
    });

    it('closes UserSettings modal when onClose callback is triggered', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Alice', isAnonymous: true },
        });
        renderHeader();
        fireEvent.click(screen.getByTestId('settings-toggle'));
        expect(screen.getByTestId('user-settings-panel')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Close'));
        expect(screen.queryByTestId('user-settings-panel')).not.toBeInTheDocument();
    });

    it('renders the language toggle button with current language', () => {
        renderHeader();
        const langToggle = screen.getByTestId('language-toggle');
        expect(langToggle).toBeInTheDocument();
        expect(langToggle).toHaveTextContent('EN');
    });

    it('toggles language from EN to DE when clicked', () => {
        renderHeader();
        const langToggle = screen.getByTestId('language-toggle');
        fireEvent.click(langToggle);
        expect(mockChangeLanguage).toHaveBeenCalledWith('de');
    });

    it('toggles language from DE to EN when clicked in German mode', () => {
        currentLanguage = 'de';
        renderHeader();
        const langToggle = screen.getByTestId('language-toggle');
        expect(langToggle).toHaveTextContent('DE');
        fireEvent.click(langToggle);
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
        currentLanguage = 'en';
    });

    it('shows Log in link for anonymous user alongside their name', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Alice', isAnonymous: true },
        });
        renderHeader();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Log in')).toBeInTheDocument();
    });

    it('does not show Log in link for authenticated user', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Bob', isAnonymous: false },
        });
        renderHeader();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Log in')).not.toBeInTheDocument();
    });

    it('highlights Decision link as active on home page', () => {
        renderHeader('/');
        const decisionLink = screen.getByText('Decision');
        expect(decisionLink.className).toContain('navLinkActive');
    });

    it('highlights Activities link as active on my-decisions page', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Alice', isAnonymous: true },
        });
        renderHeader('/my-decisions');
        const activitiesLink = screen.getByText('Activities');
        expect(activitiesLink.className).toContain('navLinkActive');
    });

    it('toggles mobile menu drawer open and closed when mobile menu button is clicked', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Alice', isAnonymous: true },
        });
        renderHeader();
        const toggleBtn = screen.getByTestId('mobile-menu-toggle');
        expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();

        fireEvent.click(toggleBtn);
        expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
        expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('Decision');
        expect(screen.getByTestId('mobile-drawer')).toHaveTextContent('Activities');

        fireEvent.click(toggleBtn);
        expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
    });

    it('closes mobile drawer when a mobile link is clicked', () => {
        useUser.mockReturnValue({
            user: { userId: 'u1', displayName: 'Alice', isAnonymous: true },
        });
        renderHeader();
        fireEvent.click(screen.getByTestId('mobile-menu-toggle'));
        expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();

        const decisionLink = screen.getAllByText('Decision')[1];
        fireEvent.click(decisionLink);
        expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();
    });
});
