import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ParticipantList from './ParticipantList';

vi.mock('react-i18next', () => {
    const translations = {
        'participantList.empty': 'No participants yet.',
        'participantList.unknown': 'Unknown',
        'participantList.statusAnonymous': 'Anonymous',
        'participantList.statusVerified': 'Verified',
        'participantList.helpAnonymous': 'Anonymous accounts are temporary.',
        'participantList.helpVerified': 'Verified accounts are permanent.',
        'userSettings.buttonClose': 'Close',
    };
    const t = (key, opts) => {
        if (key === 'participantList.title') return `Participants (${opts?.count ?? 0})`;
        return translations[key] || key;
    };
    return { useTranslation: () => ({ t }) };
});

describe('ParticipantList', () => {
    const mockClose = vi.fn();

    const makeMap = (entries) => {
        const map = new Map();
        entries.forEach(([id, data]) => map.set(id, data));
        return map;
    };

    it('applies closed class when not open', () => {
        const { container } = render(
            <ParticipantList
                participantMap={new Map()}
                isOpen={false}
                onClose={mockClose}
                ownerId="owner-1"
            />
        );
        // Overlay is rendered with closed class, no backdrop
        const overlay = container.querySelector('[class*="overlay"]');
        expect(overlay.className).toMatch(/overlayClosed/);
        expect(container.querySelector('[class*="backdrop"]')).not.toBeInTheDocument();
    });

    it('shows empty state when open with no participants', () => {
        render(
            <ParticipantList
                participantMap={new Map()}
                isOpen={true}
                onClose={mockClose}
                ownerId="owner-1"
            />
        );
        expect(screen.getByText('Participants (0)')).toBeInTheDocument();
        expect(screen.getByText('No participants yet.')).toBeInTheDocument();
    });

    it('renders participants with names and status', () => {
        const map = makeMap([
            ['user-1', { name: 'Alice', isAnonymous: false }],
            ['user-2', { name: 'Bob', isAnonymous: true }],
        ]);

        render(
            <ParticipantList
                participantMap={map}
                isOpen={true}
                onClose={mockClose}
                ownerId="user-1"
            />
        );

        expect(screen.getByText('Participants (2)')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });

    it('shows "Unknown" for participants without name', () => {
        const map = makeMap([
            ['user-1', { isAnonymous: true }],
        ]);

        render(
            <ParticipantList
                participantMap={map}
                isOpen={true}
                onClose={mockClose}
                ownerId="other"
            />
        );

        expect(screen.getByText('Unknown')).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <ParticipantList
                participantMap={new Map()}
                isOpen={true}
                onClose={onClose}
                ownerId="owner-1"
            />
        );

        await user.click(screen.getByLabelText('Close'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        const { container } = render(
            <ParticipantList
                participantMap={new Map()}
                isOpen={true}
                onClose={onClose}
                ownerId="owner-1"
            />
        );

        // Click the backdrop (first child element)
        const backdrop = container.querySelector('[class*="backdrop"]');
        await user.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <ParticipantList
                participantMap={new Map()}
                isOpen={true}
                onClose={onClose}
                ownerId="owner-1"
            />
        );

        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('has dialog role and aria-labelledby', () => {
        render(
            <ParticipantList
                participantMap={new Map()}
                isOpen={true}
                onClose={mockClose}
                ownerId="owner-1"
            />
        );

        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby', 'participant-list-title');
    });

    it('renders help text', () => {
        render(
            <ParticipantList
                participantMap={new Map()}
                isOpen={true}
                onClose={mockClose}
                ownerId="owner-1"
            />
        );

        expect(screen.getByText(/Anonymous accounts are temporary/)).toBeInTheDocument();
        expect(screen.getByText(/Verified accounts are permanent/)).toBeInTheDocument();
    });

    it('handles undefined participantMap gracefully', () => {
        render(
            <ParticipantList
                participantMap={undefined}
                isOpen={true}
                onClose={mockClose}
                ownerId="owner-1"
            />
        );

        expect(screen.getByText('Participants (0)')).toBeInTheDocument();
        expect(screen.getByText('No participants yet.')).toBeInTheDocument();
    });
});
