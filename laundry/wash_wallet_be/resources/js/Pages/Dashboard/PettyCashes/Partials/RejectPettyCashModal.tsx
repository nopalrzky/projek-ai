import React, { useState } from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { TextAreaInput } from "@/Components/Input";
import { RejectPettyCashModalProps } from "../types";
import { XCircle, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const RejectPettyCashModal: React.FC<RejectPettyCashModalProps> = ({
    isOpen,
    pettyCash,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const [reason, setReason] = useState("");

    if (!pettyCash) return null;

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(reason);
    };

    const handleClose = () => {
        setReason("");
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tolak Permintaan Kas Kecil"
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
                    title="Alasan Penolakan"
                    description="Berikan alasan yang jelas mengapa permintaan ini ditolak."
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
                                Kode Permintaan
                            </span>
                            <span
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {pettyCash.code}
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
                                {pettyCash.outlet?.name}
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
                                {pettyCash.cashier?.name}
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
                                    Jumlah
                                </span>
                                <span
                                    className="text-lg font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatCurrency(pettyCash.amount)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Deskripsi
                            </span>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {pettyCash.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Alasan Penolakan <span className="text-red-500">*</span>
                    </label>
                    <TextAreaInput
                        value={reason}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setReason(e.target.value)
                        }
                        placeholder="Masukkan alasan penolakan..."
                        rows={4}
                        maxLength={500}
                        disabled={isLoading}
                    />
                    <div className="flex justify-between items-center">
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Alasan ini akan dikirimkan ke kasir
                        </p>
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {reason.length}/500
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Batal
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={isLoading || !reason.trim()}
                    loading={isLoading}
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak
                </Button>
            </div>
        </Modal>
    );
};

export default RejectPettyCashModal;
