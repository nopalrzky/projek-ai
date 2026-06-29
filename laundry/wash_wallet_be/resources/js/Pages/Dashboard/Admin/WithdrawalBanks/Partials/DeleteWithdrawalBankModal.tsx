import React from "react";
import { Modal, ModalBody, ModalFooter } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { DeleteWithdrawalBankModalProps } from "../types";

export const DeleteWithdrawalBankModal: React.FC<DeleteWithdrawalBankModalProps> = ({
    isOpen,
    bank,
    onClose,
    onConfirm,
    isLoading,
}) => {
    if (!bank) return null;

    const handleConfirm = () => {
        onConfirm(bank);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Bank Master"
            variant="danger"
            centered
        >
            <ModalBody>
                <div className="space-y-3">
                    <p style={{ color: "var(--color-text-secondary)" }} className="text-sm leading-relaxed">
                        Apakah Anda yakin ingin menghapus bank master{" "}
                        <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                            {bank.bankName}
                        </span>{" "}
                        dari daftar?
                    </p>
                    <p style={{ color: "var(--color-text-tertiary)" }} className="text-xs">
                        Tindakan ini akan menghapus bank secara soft delete. Owner tidak akan dapat mendaftarkan rekening bank baru dengan menggunakan bank ini. Rekening bank owner yang sudah ada yang menggunakan bank ini akan tetap tersimpan tetapi tidak bisa digunakan untuk pengajuan penarikan baru jika dinonaktifkan.
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
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    loading={isLoading}
                >
                    Ya, Hapus
                </Button>
            </ModalFooter>
        </Modal>
    );
};
