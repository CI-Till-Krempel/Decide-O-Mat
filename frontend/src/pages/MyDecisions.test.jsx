import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import MyDecisions from './MyDecisions';
import { useUser } from '../contexts/UserContext';
import * as firebaseService from '../services/firebase';
import * as EncryptionServiceModule from '../services/EncryptionService';

// Mock dependencies
vi.mock('../services/firebase', () => ({
    getUserDecisions: vi.fn(),
}));

vi.mock('../services/EncryptionService', () => ({
    default: {
        getStoredKey: vi.fn(),
        getStoredKeyString: vi.fn(),
        decrypt: vi.fn(),
    }
}));

vi.mock('../contexts/UserContext', () => ({
    useUser: vi.fn(),
}));

const mockUser = {
    userId: 'test-user-id',
    displayName: 'Test User'
};

describe('MyDecisions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useUser.mockReturnValue({ user: mockUser });
    });

    it('renders owner badge for decisions created by user', async () => {
        const mockDecisions = [
            { id: '1', question: 'My Decision', role: 'owner', createdAt: new Date() }
        ];
        firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

        render(
            <BrowserRouter>
                <MyDecisions />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('My Decision')).toBeInTheDocument();
        });

        const badge = screen.getByText('Owner');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('badge');
    });

    it('renders invitee badge for decisions where user is participant', async () => {
        const mockDecisions = [
            { id: '2', question: 'Other Decision', role: 'participant', createdAt: new Date() }
        ];
        firebaseService.getUserDecisions.mockResolvedValue(mockDecisions);

        render(
            <BrowserRouter>
                <MyDecisions />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Other Decision')).toBeInTheDocument();
        });

        const badge = screen.getByText('Invitee');
        expect(badge).toBeInTheDocument();
        const ownerBadge = screen.queryByText('Owner');
        expect(ownerBadge).not.toBeInTheDocument();
    });
});
