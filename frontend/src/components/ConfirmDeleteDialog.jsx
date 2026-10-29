import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./ConfirmDeleteDialog.module.css";

export default function ConfirmDeleteDialog({ question, onConfirm, onCancel, isLoading }) {
    const { t } = useTranslation();

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && !isLoading) {
                onCancel?.();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onCancel, isLoading]);

    const handleOverlayClick = () => {
        if (!isLoading) {
            onCancel?.();
        }
    };

    const handleCancelClick = () => {
        if (!isLoading) {
            onCancel?.();
        }
    };

    const handleConfirmClick = () => {
        if (!isLoading) {
            onConfirm?.();
        }
    };

    return (
        <div
            className={styles.overlay}
            onClick={handleOverlayClick}
            data-testid="confirm-delete-overlay"
        >
            <div
                className={styles.dialog}
                onClick={(e) => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-delete-title"
                aria-describedby="confirm-delete-message"
                aria-busy={isLoading || undefined}
            >
                <h2 id="confirm-delete-title" className={styles.title}>
                    {t("decision.deleteConfirmTitle")}
                </h2>
                <p id="confirm-delete-message" className={styles.message}>
                    {t("decision.deleteConfirmMessage")}
                </p>
                {question ? (
                    <div className={styles.questionPreview}>{question}</div>
                ) : null}
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.btnCancel}
                        onClick={handleCancelClick}
                        disabled={isLoading}
                    >
                        {t("common.cancel")}
                    </button>
                    <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={handleConfirmClick}
                        disabled={isLoading}
                    >
                        {t("common.delete")}
                    </button>
                </div>
            </div>
        </div>
    );
}
