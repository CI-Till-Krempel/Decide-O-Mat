import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as firebaseService from './services/firebase';

vi.mock('./services/firebase', () => ({
    ensureAppCheck: vi.fn(),
}));

vi.mock('./contexts/UserContext', () => ({
    UserProvider: ({ children }) => <div data-testid="user-provider">{children}</div>,
}));

vi.mock('./components/Header', () => ({
    default: () => <header data-testid="app-header">Header</header>,
}));

vi.mock('./components/Footer', () => ({
    default: () => <footer data-testid="app-footer">Footer</footer>,
}));

vi.mock('./components/CookieConsent', () => ({
    default: () => <div data-testid="app-cookie-consent">CookieConsent</div>,
}));

vi.mock('./pages/Home', () => ({
    default: () => <main data-testid="home-page">Home Page Content</main>,
}));

describe('App Component', () => {
    let originalTitle;

    beforeEach(() => {
        vi.clearAllMocks();
        originalTitle = document.title;
    });

    afterEach(() => {
        document.title = originalTitle;
    });

    it('renders "Initializing Security..." while ensureAppCheck is pending', () => {
        // Return a promise that never resolves during this check
        firebaseService.ensureAppCheck.mockImplementation(() => new Promise(() => {}));

        render(<App />);

        expect(screen.getByTestId('security-initializing')).toBeInTheDocument();
        expect(screen.getByText('Initializing Security...')).toBeInTheDocument();
        expect(screen.queryByTestId('app-header')).not.toBeInTheDocument();
        expect(screen.queryByTestId('home-page')).not.toBeInTheDocument();
        expect(screen.queryByTestId('app-footer')).not.toBeInTheDocument();
    });

    it('renders the complete layout when ensureAppCheck resolves successfully', async () => {
        firebaseService.ensureAppCheck.mockResolvedValue(true);

        render(<App />);

        await waitFor(() => {
            expect(screen.getByTestId('app-header')).toBeInTheDocument();
        });

        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByTestId('app-footer')).toBeInTheDocument();
        expect(screen.getByTestId('app-cookie-consent')).toBeInTheDocument();
        expect(screen.getByTestId('user-provider')).toBeInTheDocument();
        expect(screen.queryByTestId('security-initializing')).not.toBeInTheDocument();
    });

    it('recovers gracefully and displays application if ensureAppCheck rejects with error', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        firebaseService.ensureAppCheck.mockRejectedValue(new Error('App Check failed'));

        render(<App />);

        await waitFor(() => {
            expect(screen.getByTestId('app-header')).toBeInTheDocument();
        });

        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByTestId('app-footer')).toBeInTheDocument();
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    it('sets the document title on mount', async () => {
        firebaseService.ensureAppCheck.mockResolvedValue(true);

        render(<App />);

        await waitFor(() => {
            expect(screen.getByTestId('app-header')).toBeInTheDocument();
        });

        expect(document.title).toContain('Decide-O-Mat:');
        expect(document.title).toContain('Group decisions made easy!');
    });
});
