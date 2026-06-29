import React, { useState } from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { TextAreaInput } from "@/Components/Input";
import { RejectDepositModalProps } from "../types";
import { XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const RejectDepositModal: React.FC<RejectDepositModalProps> = ({
    isOpen,
    deposit,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleConfirm = () => {
        if (!reason.trim()) {
            setError("Alasan penolakan wajib diisi");
            return;
        }
        if (reason.length > 500) {
            setError("Alasan penolakan maksimal 500 karakter");
            return;
        }
        setError("");
        onConfirm(deposit!, reason);
    };

    const handleClose = () => {
        setReason("");
        setError("");
        onClose();
    };

    if (!deposit) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Tolak Setoran"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="info"
                    title="Informasi"
                    description="Alasan penolakan akan dikirimkan ke kasir sebagai catatan."
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
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatCurrency(deposit.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="reason"
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Alasan Penolakan <span className="text-red-500">*</span>
                    </label>
                    <TextAreaInput
                        id="reason"
                        value={reason}
                        onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                        ) => {
                            setReason(e.target.value);
                            setError("");
                        }}
                        placeholder="Masukkan alasan penolakan setoran..."
                        rows={4}
                        maxLength={500}
                        disabled={isLoading}
                        error={error}
                    />
                    <div className="flex justify-between items-center text-xs">
                        {error ? (
                            <span className="text-red-500">{error}</span>
                        ) : (
                            <span
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Wajib diisi
                            </span>
                        )}
                        <span style={{ color: "var(--color-text-tertiary)" }}>
                            {reason.length}/500
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button
                    variant="outline"
                    onClick={handleClose}
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
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak Setoran
                </Button>
            </div>
        </Modal>
    );
};

export default RejectDepositModal;
