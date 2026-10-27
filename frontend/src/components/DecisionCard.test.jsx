import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DecisionCard from './DecisionCard';
import styles from './DecisionCard.module.css';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, fallback) => {
            const translations = {
                'myDecisions.roleOwner': 'Owner',
                'myDecisions.roleInvitee': 'Invitee',
                'myDecisions.statusOpen': 'Open',
                'myDecisions.statusClosed': 'Closed',
                'myDecisions.contextMenu.open': 'Options',
                'decision.unknownTitle': 'Decision',
            };
            return translations[key] || fallback || key;
        },
    }),
}));

vi.mock('../utils/relativeTime', () => ({
    relativeTime: vi.fn(() => '5 minutes ago'),
}));

describe('DecisionCard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders null safely when decision prop is null or undefined', () => {
        const { container: c1 } = render(<DecisionCard decision={null} />);
        expect(c1.firstChild).toBeNull();

        const { container: c2 } = render(<DecisionCard decision={undefined} />);
        expect(c2.firstChild).toBeNull();
    });

    it('renders running variant with owner badge, open status, and relative time', () => {
        const decision = {
            id: 'd1',
            question: 'Should we adopt TypeScript?',
            role: 'owner',
            status: 'open',
            createdAt: new Date('2026-09-28T10:00:00Z'),
        };

        const { container } = render(<DecisionCard decision={decision} variant="running" />);

        expect(screen.getByText('Should we adopt TypeScript?')).toBeInTheDocument();
        expect(screen.getByText('Owner')).toBeInTheDocument();
        expect(screen.getByText('Open')).toBeInTheDocument();
        expect(screen.getByText('5 minutes ago')).toBeInTheDocument();
        expect(container.firstChild).toHaveClass(styles.cardRunning);
    });

    it('renders archived variant with invitee badge, closed status, and formatted date', () => {
        const testDate = new Date('2026-09-20T12:00:00Z');
        const decision = {
            id: 'd2',
            question: 'Which framework to choose?',
            role: 'participant',
            status: 'closed',
            createdAt: testDate,
        };

        const { container } = render(<DecisionCard decision={decision} variant="archived" />);

        expect(screen.getByText('Which framework to choose?')).toBeInTheDocument();
        expect(screen.getByText('Invitee')).toBeInTheDocument();
        expect(screen.getByText('Closed')).toBeInTheDocument();
        expect(screen.getByText(testDate.toLocaleDateString())).toBeInTheDocument();
        expect(container.firstChild).toHaveClass(styles.cardArchived);
    });

    it('supports Firestore Timestamp objects having toDate()', () => {
        const testDate = new Date('2026-09-15T12:00:00Z');
        const decision = {
            id: 'd3',
            question: 'Timestamp test',
            role: 'owner',
            status: 'open',
            createdAt: { toDate: () => testDate },
        };

        render(<DecisionCard decision={decision} variant="archived" />);

        expect(screen.getByText(testDate.toLocaleDateString())).toBeInTheDocument();
    });

    it('falls back to decision.text when question is undefined', () => {
        const decision = {
            id: 'd4',
            text: 'Legacy decision text',
            role: 'owner',
            status: 'open',
        };

        render(<DecisionCard decision={decision} />);

        expect(screen.getByText('Legacy decision text')).toBeInTheDocument();
    });

    it('falls back to default title when both question and text are missing', () => {
        const decision = {
            id: 'd5',
            role: 'owner',
            status: 'open',
        };

        render(<DecisionCard decision={decision} />);

        expect(screen.getByText('Decision')).toBeInTheDocument();
    });

    it('gracefully handles missing createdAt without displaying Invalid Date', () => {
        const decision = {
            id: 'd6',
            question: 'No date decision',
            role: 'owner',
            status: 'open',
            createdAt: null,
        };

        render(<DecisionCard decision={decision} variant="archived" />);

        expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
        expect(screen.getByText('No date decision')).toBeInTheDocument();
    });

    it('gracefully handles unparseable createdAt without displaying Invalid Date', () => {
        const decision = {
            id: 'd7',
            question: 'Unparseable timestamp test',
            role: 'owner',
            status: 'open',
            createdAt: 'invalid-date-string',
        };

        render(<DecisionCard decision={decision} variant="archived" />);

        expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
        expect(screen.getByText('Unparseable timestamp test')).toBeInTheDocument();
    });

    it('triggers onClick when the card is clicked', () => {
        const onClick = vi.fn();
        const decision = { id: 'd8', question: 'Click test', role: 'owner', status: 'open' };

        render(<DecisionCard decision={decision} onClick={onClick} />);

        fireEvent.click(screen.getByText('Click test'));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('triggers onContextMenu and prevents default on card right-click', () => {
        const onContextMenu = vi.fn();
        const decision = { id: 'd9', question: 'Context test', role: 'owner', status: 'open' };

        const { container } = render(<DecisionCard decision={decision} onContextMenu={onContextMenu} />);

        const defaultPrevented = !fireEvent.contextMenu(container.firstChild);
        expect(onContextMenu).toHaveBeenCalledTimes(1);
        expect(defaultPrevented).toBe(true);
    });

    it('triggers onContextMenu and stops propagation on options button click', () => {
        const onClick = vi.fn();
        const onContextMenu = vi.fn();
        const decision = { id: 'd10', question: 'Menu button test', role: 'owner', status: 'open' };

        render(<DecisionCard decision={decision} onClick={onClick} onContextMenu={onContextMenu} />);

        const menuButton = screen.getByRole('button', { name: 'Options' });
        fireEvent.click(menuButton);

        expect(onContextMenu).toHaveBeenCalledTimes(1);
        expect(onClick).not.toHaveBeenCalled();
    });

    it('safely handles clicks and right-clicks when callbacks are omitted', () => {
        const decision = { id: 'd11', question: 'No callback test', role: 'owner', status: 'open' };

        const { container } = render(<DecisionCard decision={decision} />);

        const menuButton = screen.getByRole('button', { name: 'Options' });
        expect(() => fireEvent.click(menuButton)).not.toThrow();
        expect(() => fireEvent.click(container.firstChild)).not.toThrow();
        expect(() => fireEvent.contextMenu(container.firstChild)).not.toThrow();
    });
});
