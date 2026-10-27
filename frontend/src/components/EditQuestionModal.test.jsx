import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EditQuestionModal from "./EditQuestionModal";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                "decision.editQuestion": "Edit Question",
                "common.cancel": "Cancel",
                "common.save": "Save",
            };
            return translations[key] || key;
        },
    }),
}));

describe("EditQuestionModal Component", () => {
    let onSave;
    let onCancel;

    beforeEach(() => {
        onSave = vi.fn();
        onCancel = vi.fn();
    });

    it("renders the modal with default title, input value, and accessible attributes", () => {
        render(
            <EditQuestionModal
                question="What should we do?"
                onSave={onSave}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        const dialog = screen.getByRole("dialog");
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveAttribute("aria-labelledby", "edit-modal-title");

        const titleElement = screen.getByRole("heading", { level: 2 });
        expect(titleElement).toHaveAttribute("id", "edit-modal-title");
        expect(titleElement).toHaveTextContent("Edit Question");

        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute("aria-label", "Edit Question");
        expect(input).toHaveValue("What should we do?");
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("renders with custom title and custom maxLength", () => {
        render(
            <EditQuestionModal
                question="Existing argument text"
                title="Edit Argument"
                maxLength={2000}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Edit Argument");
        const input = screen.getByRole("textbox");
        expect(input).toHaveAttribute("aria-label", "Edit Argument");
        expect(input).toHaveAttribute("maxLength", "2000");
    });

    it("handles undefined or null question gracefully without crashing or warnings", () => {
        render(
            <EditQuestionModal
                question={undefined}
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("");
    });

    it("auto-focuses the input on mount", () => {
        render(
            <EditQuestionModal
                question="Test focus"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole("textbox");
        expect(document.activeElement).toBe(input);
    });

    it("allows typing to update the input value", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "Modified question" } });
        expect(input).toHaveValue("Modified question");
    });

    it("disables Save button when input value is unchanged", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const saveBtn = screen.getByText("Save");
        expect(saveBtn).toBeDisabled();
    });

    it("disables Save button when input value is empty or only whitespace", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "   " } });
        const saveBtn = screen.getByText("Save");
        expect(saveBtn).toBeDisabled();
    });

    it("disables Save button when input only has surrounding whitespace added to original question", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "  Initial question  " } });
        const saveBtn = screen.getByText("Save");
        expect(saveBtn).toBeDisabled();
    });

    it("enables Save button and calls onSave with trimmed value on form submission", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "  Updated question  " } });

        const saveBtn = screen.getByText("Save");
        expect(saveBtn).not.toBeDisabled();
        fireEvent.click(saveBtn);

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith("Updated question");
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("submits form when Enter is pressed in the input", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "Saved via enter" } });
        fireEvent.submit(input.closest("form"));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith("Saved via enter");
    });

    it("calls onCancel when Cancel button is clicked", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        fireEvent.click(screen.getByText("Cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onSave).not.toHaveBeenCalled();
    });

    it("calls onCancel when clicking the overlay backdrop", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const overlay = screen.getByTestId("edit-modal-overlay");
        fireEvent.click(overlay);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not call onCancel when clicking inside the dialog", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        const dialog = screen.getByRole("dialog");
        fireEvent.click(dialog);
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("calls onCancel when Escape key is pressed", () => {
        render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        fireEvent.keyDown(document, { key: "Escape" });
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("removes the Escape key event listener on unmount", () => {
        const { unmount } = render(
            <EditQuestionModal
                question="Initial question"
                onSave={onSave}
                onCancel={onCancel}
            />
        );

        unmount();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onCancel).not.toHaveBeenCalled();
    });

    describe("Loading State", () => {
        it("disables input, cancel button, and save button when isLoading is true", () => {
            render(
                <EditQuestionModal
                    question="Initial question"
                    onSave={onSave}
                    onCancel={onCancel}
                    isLoading={true}
                />
            );

            const input = screen.getByRole("textbox");
            const cancelBtn = screen.getByText("Cancel");
            const saveBtn = screen.getByText("Save");

            expect(input).toBeDisabled();
            expect(cancelBtn).toBeDisabled();
            expect(saveBtn).toBeDisabled();
        });

        it("does not call onCancel on Escape or backdrop click when isLoading is true", () => {
            render(
                <EditQuestionModal
                    question="Initial question"
                    onSave={onSave}
                    onCancel={onCancel}
                    isLoading={true}
                />
            );

            fireEvent.keyDown(document, { key: "Escape" });
            expect(onCancel).not.toHaveBeenCalled();

            const overlay = screen.getByTestId("edit-modal-overlay");
            fireEvent.click(overlay);
            expect(onCancel).not.toHaveBeenCalled();
        });

        it("does not trigger onSave on form submit when isLoading is true", () => {
            render(
                <EditQuestionModal
                    question="Initial question"
                    onSave={onSave}
                    onCancel={onCancel}
                    isLoading={true}
                />
            );

            const input = screen.getByRole("textbox");
            fireEvent.submit(input.closest("form"));
            expect(onSave).not.toHaveBeenCalled();
        });
    });
});
