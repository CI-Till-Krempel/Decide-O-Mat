import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "./EditQuestionModal.module.css";

export default function EditQuestionModal({ question = "", onSave, onCancel, isLoading = false, title, maxLength = 1000 }) {
    const { t } = useTranslation();
    const [value, setValue] = useState(question ?? "");
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && !isLoading) {
                onCancel?.();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [onCancel, isLoading]);

    const modalTitle = title || t("decision.editQuestion");

    const handleBackdropClick = () => {
        if (!isLoading) {
            onCancel?.();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLoading) return;
        const trimmed = value.trim();
        if (trimmed && trimmed !== (question || "").trim()) {
            onSave?.(trimmed);
        }
    };

    const isSaveDisabled = isLoading || !value.trim() || value.trim() === (question || "").trim();

    return (
        <div className={styles.overlay} onClick={handleBackdropClick} data-testid="edit-modal-overlay">
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="edit-modal-title"
            >
                <h2 id="edit-modal-title" className={styles.title}>{modalTitle}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        className={styles.input}
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        maxLength={maxLength}
                        disabled={isLoading}
                        aria-label={modalTitle}
                    />
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.btnCancel}
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            {t("common.cancel")}
                        </button>
                        <button
                            type="submit"
                            className={styles.btnSave}
                            disabled={isSaveDisabled}
                        >
                            {t("common.save")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
