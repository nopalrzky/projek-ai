import React from "react";
import { Modal, ModalBody, ModalFooter } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { formatCurrency } from "@/lib/utils";
import { CancelWithdrawalModalProps } from "../types";

export const CancelWithdrawalModal: React.FC<CancelWithdrawalModalProps> = ({
    isOpen,
    withdrawal,
    onClose,
    onConfirm,
    isLoading,
}) => {
    if (!withdrawal) return null;

    const handleConfirm = () => {
        onConfirm(withdrawal);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Batalkan Penarikan Saldo"
            variant="danger"
            centered
        >
            <ModalBody>
                <div className="space-y-3">
                    <p style={{ color: "var(--color-text-secondary)" }} className="text-sm leading-relaxed">
                        Apakah Anda yakin ingin membatalkan penarikan saldo dengan kode{" "}
                        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {withdrawal.code}
                        </span>{" "}
                        sebesar{" "}
                        <span className="font-bold text-red-500">
                            {formatCurrency(withdrawal.requestedAmount)}
                        </span>
                        ?
                    </p>
                    <p style={{ color: "var(--color-text-tertiary)" }} className="text-xs">
                        Tindakan ini tidak dapat dibatalkan. Saldo yang telah dikurangi akan segera dikembalikan ke wallet balance Anda setelah penarikan berhasil dibatalkan.
                    </p>
                </div>
            </ModalBody>
            <ModalFooter justify="end" className="gap-2">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isLoading}
                >
                    Kembali
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    loading={isLoading}
                >
                    Ya, Batalkan Penarikan
                </Button>
            </ModalFooter>
        </Modal>
    );
};
