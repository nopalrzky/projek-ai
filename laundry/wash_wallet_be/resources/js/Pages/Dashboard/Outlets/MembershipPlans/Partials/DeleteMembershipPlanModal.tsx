import React from "react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { CreditCard } from "lucide-react";
import { OutletMembershipPlanDeleteModalProps } from "../types";

const DeleteMembershipPlanModal: React.FC<
    OutletMembershipPlanDeleteModalProps
> = ({ isOpen, membershipPlan, onClose, onConfirm, isLoading = false }) => {
    if (!membershipPlan) return null;

    const handleConfirm = () => {
        onConfirm(membershipPlan);
    };

    const hasContracts = (membershipPlan.membershipContractsCount || 0) > 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Paket Membership"
            size="md"
            variant="danger"
            loading={false}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="warning"
                    title="Peringatan"
                    description="Tindakan ini tidak dapat dibatalkan. Paket membership yang dihapus akan hilang permanen."
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <CreditCard
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {membershipPlan.name}
                            </h4>
                            {membershipPlan.outlet && (
                                <p
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet: {membershipPlan.outlet.name} (
                                    {membershipPlan.outlet.code})
                                </p>
                            )}
                            {membershipPlan.description && (
                                <p
                                    className="text-sm mt-1 line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {membershipPlan.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Status:{" "}
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: membershipPlan.isActive
                                                ? "var(--color-success-600)"
                                                : "var(--color-error-600)",
                                        }}
                                    >
                                        {membershipPlan.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </span>
                                </p>
                                {membershipPlan.price && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Harga:{" "}
                                        <span className="font-medium">
                                            Rp{" "}
                                            {membershipPlan.price.toLocaleString(
                                                "id-ID",
                                            )}
                                        </span>
                                    </p>
                                )}
                                {hasContracts && (
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Kontrak:{" "}
                                        {
                                            membershipPlan.membershipContractsCount
                                        }
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {hasContracts && (
                    <Alert
                        variant="error"
                        title="Perhatian!"
                        description={`Paket ini memiliki ${membershipPlan.membershipContractsCount} kontrak aktif. Pastikan Anda telah menyelesaikan atau memindahkan kontrak tersebut terlebih dahulu.`}
                    />
                )}

                <div
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Apakah Anda yakin ingin menghapus paket membership{" "}
                    <span
                        className="font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        "{membershipPlan.name}"
                    </span>
                    ?{" "}
                    {hasContracts && (
                        <span style={{ color: "var(--color-error-600)" }}>
                            Paket ini memiliki{" "}
                            {membershipPlan.membershipContractsCount} kontrak
                            yang akan terpengaruh.
                        </span>
                    )}
                </div>

                <div
                    className="flex items-center justify-end gap-3 pt-4 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                >
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
                        loading={isLoading}
                        disabled={isLoading || hasContracts}
                    >
                        {isLoading ? "Menghapus..." : "Hapus Paket"}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteMembershipPlanModal;
