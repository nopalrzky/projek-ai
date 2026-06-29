import React, { useState, FormEvent } from "react";
import { Modal, ModalBody, ModalFooter } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Form } from "@/Components/Form";
import { TextAreaInput } from "@/Components/Input";
import { RejectWithdrawalModalProps } from "../types";

export const RejectWithdrawalModal: React.FC<RejectWithdrawalModalProps> = ({
    isOpen,
    withdrawal,
    onClose,
    onConfirm,
    isLoading,
}) => {
    const [reason, setReason] = useState("");

    if (!withdrawal) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;
        onConfirm(withdrawal, { reason });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tolak Penarikan Dana"
            variant="danger"
            centered
        >
            <Form onSubmit={handleSubmit} loading={isLoading}>
                <ModalBody className="space-y-4">
                    <Alert
                        variant="warning"
                        title="Konfirmasi Penolakan"
                        description={`Pengajuan ${withdrawal.code} milik ${withdrawal.user?.name ?? "owner"} akan ditolak dan saldo withdrawal akan dikembalikan ke wallet balance owner.`}
                    />

                    <TextAreaInput
                        label="Alasan Penolakan"
                        required
                        disabled={isLoading}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Tulis alasan penolakan secara jelas agar owner dapat membacanya..."
                        rows={4}
                        minRows={4}
                        maxRows={8}
                        autoResize
                        maxLength={1000}
                        showCharacterCount
                    />
                </ModalBody>
                <ModalFooter justify="end" className="gap-2">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="danger"
                        disabled={isLoading || !reason.trim()}
                        loading={isLoading}
                    >
                        Ya, Tolak Penarikan
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};
