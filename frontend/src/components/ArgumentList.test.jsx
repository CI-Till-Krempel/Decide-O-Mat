import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArgumentList from './ArgumentList';

// Mock ArgumentItem component
vi.mock('./ArgumentItem', () => ({
    default: ({ argument, readOnly }) => (
        <li data-testid="argument-item">
            {argument.text} ({argument.votes || 0})
            {readOnly && <span>(ReadOnly)</span>}
        </li>
    )
}));

describe('ArgumentList Component', () => {
    const mockDecisionId = 'test-decision-123';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders empty state when no arguments', () => {
        render(
            <ArgumentList
                arguments={[]}
                type="pro"
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        expect(screen.getByRole('heading', { name: /pros/i })).toBeInTheDocument();
        expect(screen.getByText(/no pros yet/i)).toBeInTheDocument();
    });

    it('renders list of arguments sorted by votes', () => {
        const mockArgs = [
            { id: '1', text: 'Low votes', votes: 2 },
            { id: '2', text: 'High votes', votes: 10 },
            { id: '3', text: 'Medium votes', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                decisionId={mockDecisionId}
                readOnly={false}
            />
        );

        const items = screen.getAllByTestId('argument-item');
        expect(items).toHaveLength(3);
        expect(items[0]).toHaveTextContent('High votes');
        expect(items[1]).toHaveTextContent('Medium votes');
        expect(items[2]).toHaveTextContent('Low votes');
    });

    it('passes readOnly prop to items', () => {
        const mockArgs = [
            { id: '1', text: 'Arg 1', votes: 5 },
        ];

        render(
            <ArgumentList
                arguments={mockArgs}
                type="pro"
                decisionId={mockDecisionId}
                readOnly={true}
            />
        );

        expect(screen.getByText('(ReadOnly)')).toBeInTheDocument();
    });
});

