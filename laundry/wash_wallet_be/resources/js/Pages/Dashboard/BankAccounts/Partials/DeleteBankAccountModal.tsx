import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { DeleteBankAccountModalProps } from "../types";
import { Trash } from "lucide-react";

const DeleteBankAccountModal: React.FC<DeleteBankAccountModalProps> = ({
    isOpen,
    account,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!account) return null;

    const handleConfirm = () => {
        onConfirm(account);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Rekening Bank"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="error"
                    title="Peringatan"
                    description="Tindakan ini akan menghapus rekening bank secara permanen dari daftar rekening Anda."
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Nama Bank
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {account.bankName}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Nomor Rekening
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {account.accountNumber}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Nama Pemilik
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {account.accountHolderName}
                            </span>
                        </div>
                    </div>
                </div>

                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus rekening bank ini?
                </p>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button
                    variant="outline"
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
                    <Trash className="w-4 h-4 mr-2" />
                    Ya, Hapus
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteBankAccountModal;
