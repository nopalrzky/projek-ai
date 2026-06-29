import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { ApproveDepositModalProps } from "../types";
import { CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const ApproveDepositModal: React.FC<ApproveDepositModalProps> = ({
    isOpen,
    deposit,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!deposit) return null;

    const handleConfirm = () => {
        onConfirm(deposit);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Setujui Setoran"
            size="md"
            variant="success"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="warning"
                    title="Perhatian"
                    description="Setelah disetujui, kas outlet akan terpotong secara otomatis dan jurnal akan dibuat. Tindakan ini tidak dapat dibatalkan."
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Kode Setoran
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {deposit.code}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Outlet
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {deposit.outlet?.name}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Kasir
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {deposit.cashier?.name}
                            </span>
                        </div>

                        <div
                            className="border-t pt-3 mt-3"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <div className="flex justify-between items-center">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Jumlah Setoran
                                </span>
                                <span
                                    className="text-lg font-bold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(deposit.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
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
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    loading={isLoading}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Ya, Setujui
                </Button>
            </div>
        </Modal>
    );
};

export default ApproveDepositModal;
