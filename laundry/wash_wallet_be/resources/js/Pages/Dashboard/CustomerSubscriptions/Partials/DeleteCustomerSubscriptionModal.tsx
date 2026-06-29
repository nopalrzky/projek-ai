import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { AlertTriangle } from "lucide-react";
import { DeleteCustomerSubscriptionModalProps } from "../types";

export default function DeleteCustomerSubscriptionModal({
    isOpen,
    subscription,
    onClose,
    onConfirm,
    isLoading = false,
}: DeleteCustomerSubscriptionModalProps) {
    if (!subscription) return null;

    const isBlocked = subscription.status === "active";
    const isActionDisabled = isLoading || isBlocked;

    const handleConfirm = () => {
        if (isActionDisabled) {
            return;
        }

        onConfirm(subscription);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="md"
            variant="danger"
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
            preventClose={isLoading}
            title="Hapus Langganan Pelanggan"
            loading={isLoading}
        >
            <div className="space-y-4">
                <Alert
                    variant="error"
                    title="Peringatan"
                    description="Tindakan ini tidak dapat dibatalkan. Data subscription dan kuota terkait akan dihapus permanen."
                    icon={<AlertTriangle className="w-5 h-5" />}
                />

                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Anda yakin ingin menghapus langganan{" "}
                        <span
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {subscription.subscriptionCode}
                        </span>{" "}
                        untuk customer{" "}
                        <span
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {subscription.customer?.name || "-"}
                        </span>
                        ?
                    </p>
                </div>

                {isBlocked && (
                    <Alert
                        variant="warning"
                        title="Langganan Masih Aktif"
                        description="Langganan yang masih aktif tidak dapat dihapus. Ubah status atau tunggu hingga tidak aktif."
                    />
                )}

                <div className="flex justify-end gap-2 pt-2">
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
                        disabled={isActionDisabled}
                        loading={isLoading}
                    >
                        Hapus Langganan
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
