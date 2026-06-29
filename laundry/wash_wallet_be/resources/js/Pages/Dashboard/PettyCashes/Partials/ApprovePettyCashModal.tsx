import React, { useState, useMemo } from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { SelectInput } from "@/Components/Input";
import { ApprovePettyCashModalProps } from "../types";
import { CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const ApprovePettyCashModal: React.FC<ApprovePettyCashModalProps> = ({
    isOpen,
    pettyCash,
    accounts,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const [sourceAccountId, setSourceAccountId] = useState<number | null>(null);

    // Prepare account options for SelectInput
    const accountOptions = useMemo(() => {
        return [
            { value: "", label: "Pilih akun sumber dana" },
            ...accounts.map((account) => ({
                value: account.id.toString(),
                label: `${account.code} - ${account.name}`,
            })),
        ];
    }, [accounts]);

    if (!pettyCash) return null;

    const handleConfirm = () => {
        if (!sourceAccountId) return;
        onConfirm(sourceAccountId);
    };

    const handleClose = () => {
        if (!isLoading) {
            setSourceAccountId(null);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Setujui Permintaan Kas Kecil"
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
                    title="Konfirmasi"
                    description="Pastikan Anda telah memverifikasi permintaan ini sebelum menyetujui."
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
                    <SelectInput
                        label="Akun Sumber Dana"
                        value={sourceAccountId?.toString() || ""}
                        onChange={(e) =>
                            setSourceAccountId(
                                e.target.value ? Number(e.target.value) : null,
                            )
                        }
                        options={accountOptions}
                        placeholder="Pilih akun sumber dana"
                        disabled={isLoading}
                        required
                        hint="Pilih akun dari mana dana kas kecil akan diambil"
                    />
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
                    variant="success"
                    onClick={handleConfirm}
                    disabled={isLoading || !sourceAccountId}
                    loading={isLoading}
                >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Setujui
                </Button>
            </div>
        </Modal>
    );
};

export default ApprovePettyCashModal;
