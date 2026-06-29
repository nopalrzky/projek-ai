import React from "react";
import { Modal, ModalBody, ModalFooter } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { formatCurrency } from "@/lib/utils";
import { ProcessWithdrawalModalProps } from "../types";

export const ProcessWithdrawalModal: React.FC<ProcessWithdrawalModalProps> = ({
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
            title="Proses Penarikan Dana"
            variant="info"
            centered
        >
            <ModalBody>
                <div className="space-y-3">
                    <p style={{ color: "var(--color-text-secondary)" }} className="text-sm leading-relaxed">
                        Apakah Anda yakin ingin memproses penarikan dengan kode{" "}
                        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {withdrawal.code}
                        </span>{" "}
                        milik{" "}
                        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {withdrawal.user?.name}
                        </span>
                        ?
                    </p>
                    <p style={{ color: "var(--color-text-tertiary)" }} className="text-xs">
                        Nominal bersih yang harus ditransfer adalah{" "}
                        <span className="font-bold text-green-600" style={{ color: "var(--color-primary-600)" }}>
                            {formatCurrency(withdrawal.netAmount)}
                        </span>{" "}
                        ke rekening{" "}
                        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {withdrawal.bankName} - {withdrawal.accountNumber} ({withdrawal.accountHolderName})
                        </span>
                        . Status akan berubah menjadi "Diproses".
                    </p>
                </div>
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
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    loading={isLoading}
                >
                    Ya, Proses Penarikan
                </Button>
            </ModalFooter>
        </Modal>
    );
};
