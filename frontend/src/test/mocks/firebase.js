import { vi } from 'vitest';

// Mock Firebase functions
export const mockCreateDecision = vi.fn();
export const mockAddArgument = vi.fn();
export const mockVoteArgument = vi.fn();
export const mockToggleDecisionStatus = vi.fn();
export const mockVoteDecision = vi.fn();
export const mockSubscribeToDecision = vi.fn();
export const mockGetDecision = vi.fn();
export const mockSubscribeToArguments = vi.fn();

// Mock implementations
export const createDecision = mockCreateDecision;
export const addArgument = mockAddArgument;
export const voteArgument = mockVoteArgument;
export const toggleDecisionStatus = mockToggleDecisionStatus;
export const voteDecision = mockVoteDecision;
export const subscribeToDecision = mockSubscribeToDecision;
export const getDecision = mockGetDecision;
export const subscribeToArguments = mockSubscribeToArguments;

// Mock Firebase modules
export const db = {};
export const functions = {};

// Helper to reset all mocks
export const resetAllMocks = () => {
    mockCreateDecision.mockReset();
    mockAddArgument.mockReset();
    mockVoteArgument.mockReset();
    mockToggleDecisionStatus.mockReset();
    mockVoteDecision.mockReset();
    mockSubscribeToDecision.mockReset();
    mockGetDecision.mockReset();
    mockSubscribeToArguments.mockReset();
};

// Default mock implementations
mockCreateDecision.mockResolvedValue('test-decision-id');
mockAddArgument.mockResolvedValue('test-argument-id');
mockVoteArgument.mockResolvedValue({ success: true });
mockToggleDecisionStatus.mockResolvedValue({ success: true });
mockVoteDecision.mockResolvedValue({ success: true });
mockSubscribeToDecision.mockImplementation((id, callback) => {
    // Return unsubscribe function
    return () => { };
});
mockSubscribeToArguments.mockImplementation((id, callback) => {
    // Return unsubscribe function
    return () => { };
});
