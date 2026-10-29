import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

// Mock i18next
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) => {
            const translations = {
                "decision.deleteConfirmTitle": "Delete Decision?",
                "decision.deleteConfirmMessage": "Are you sure you want to delete this decision?",
                "common.cancel": "Cancel",
                "common.delete": "Delete",
            };
            return translations[key] || key;
        },
    }),
}));

describe("ConfirmDeleteDialog Component", () => {
    let onConfirm;
    let onCancel;

    beforeEach(() => {
        onConfirm = vi.fn();
        onCancel = vi.fn();
    });

    it("renders the delete dialog with correct texts and question preview", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        expect(screen.getByText("Delete Decision?")).toBeInTheDocument();
        expect(screen.getByText("Are you sure you want to delete this decision?")).toBeInTheDocument();
        expect(screen.getByText("What should we eat?")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("has accessible alertdialog attributes", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        const dialog = screen.getByRole("alertdialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
        expect(dialog).toHaveAttribute("aria-labelledby", "confirm-delete-title");
        expect(dialog).toHaveAttribute("aria-describedby", "confirm-delete-message");
        expect(dialog).not.toHaveAttribute("aria-busy");
    });

    it("sets aria-busy on dialog when isLoading is true", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={true}
            />
        );

        const dialog = screen.getByRole("alertdialog");
        expect(dialog).toHaveAttribute("aria-busy", "true");
    });

    it("calls onCancel when the cancel button is clicked", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        fireEvent.click(screen.getByText("Cancel"));
        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("calls onConfirm when the delete button is clicked", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        fireEvent.click(screen.getByText("Delete"));
        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("calls onCancel when the overlay is clicked", () => {
        const { container } = render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        const overlay = container.firstChild;
        fireEvent.click(overlay);
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("does not call onCancel when the dialog content itself is clicked", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        const dialog = screen.getByRole("alertdialog");
        fireEvent.click(dialog);
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("calls onCancel when the Escape key is pressed", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        fireEvent.keyDown(document, { key: "Escape" });
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it("removes the escape key listener on unmount", () => {
        const { unmount } = render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        unmount();
        fireEvent.keyDown(document, { key: "Escape" });
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("disables action buttons when isLoading is true", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={true}
            />
        );

        const cancelButton = screen.getByText("Cancel");
        const deleteButton = screen.getByText("Delete");

        expect(cancelButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });

    it("does not call onCancel when Escape is pressed while isLoading is true", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={true}
            />
        );

        fireEvent.keyDown(document, { key: "Escape" });
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("does not call onCancel when overlay is clicked while isLoading is true", () => {
        const { container } = render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={true}
            />
        );

        const overlay = container.firstChild;
        fireEvent.click(overlay);
        expect(onCancel).not.toHaveBeenCalled();
    });

    it("does not call onConfirm when delete button is clicked while isLoading is true", () => {
        render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={true}
            />
        );

        fireEvent.click(screen.getByText("Delete"));
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it("handles missing onCancel and onConfirm callbacks without throwing", () => {
        const { container } = render(
            <ConfirmDeleteDialog
                question="What should we eat?"
                isLoading={false}
            />
        );

        expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow();

        const overlay = container.firstChild;
        expect(() => fireEvent.click(overlay)).not.toThrow();

        expect(() => fireEvent.click(screen.getByText("Cancel"))).not.toThrow();
        expect(() => fireEvent.click(screen.getByText("Delete"))).not.toThrow();
    });

    it("handles undefined or empty question gracefully without question preview element", () => {
        render(
            <ConfirmDeleteDialog
                onConfirm={onConfirm}
                onCancel={onCancel}
                isLoading={false}
            />
        );

        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        expect(screen.getByText("Delete Decision?")).toBeInTheDocument();
        expect(screen.queryByText("What should we eat?")).not.toBeInTheDocument();
    });
});
