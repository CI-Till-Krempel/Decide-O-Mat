import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                'header.appName': 'Decide-O-Mat',
                'header.navDecision': 'Decision',
                'header.navActivities': 'Activities',
                'header.navLogin': 'Log in',
                'userSettings.guestLabel': 'Guest',
                'common.edit': 'Edit',
            };
            return translations[key] || key;
        },
    }),
}));

// Mock UserContext
vi.mock('../contexts/UserContext', async () => {
    const actual = await vi.importActual('../contexts/UserContext');
    return {
        ...actual,
        useUser: vi.fn(() => ({ user: null })),
    };
});

// Mock EncryptionService
vi.mock('../services/EncryptionService', () => ({
    default: {
        isEnabled: vi.fn(() => false),
        importKey: vi.fn(),
    },
}));

// Mock UserSettings
vi.mock('./UserSettings', () => ({
    default: () => <div data-testid="user-settings-panel">UserSettings</div>,
}));

const { useUser } = await import('../contexts/UserContext');

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
});
