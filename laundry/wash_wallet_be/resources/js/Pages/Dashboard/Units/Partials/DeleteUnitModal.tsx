import React from "react";
import { Package, Hash } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { DeleteUnitModalProps } from "../types";

const DeleteUnitModal: React.FC<DeleteUnitModalProps> = ({
    isOpen,
    unit,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!unit) return null;

    const hasServices =
        (unit.laundryServicesCount ?? 0) > 0 ||
        (unit.laundryServices?.length ?? 0) > 0;

    const handleConfirm = () => {
        if (!isLoading && !hasServices) {
            onConfirm(unit);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Hapus Unit"
            size="md"
            variant="danger"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <div className="space-y-4">
                {hasServices ? (
                    <Alert
                        variant="error"
                        title="Tidak dapat menghapus unit"
                        description={`Unit ini masih digunakan oleh ${unit.laundryServicesCount ?? 0} layanan laundry. Hapus atau ubah layanan tersebut terlebih dahulu sebelum menghapus unit ini.`}
                    />
                ) : (
                    <Alert
                        variant="warning"
                        title="Peringatan"
                        description="Tindakan ini tidak dapat dibatalkan. Unit yang dihapus akan hilang secara permanen dari sistem."
                    />
                )}

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
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Package
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {unit.name}
                            </h4>

                            <div className="flex items-center gap-1.5 mt-1">
                                <Hash
                                    className="w-3.5 h-3.5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <span
                                    className="text-sm font-mono"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {unit.symbol}
                                </span>
                            </div>

                            {unit.description && (
                                <p
                                    className="text-sm mt-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {unit.description}
                                </p>
                            )}

                            <p
                                className="text-xs mt-2"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                Dipakai oleh{" "}
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {unit.laundryServicesCount || 0} layanan
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-sm">
                    <p
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {hasServices
                            ? "Unit ini tidak dapat dihapus karena masih digunakan."
                            : (
                                  <>
                                      Apakah Anda yakin ingin menghapus unit{" "}
                                      <strong
                                          style={{
                                              color: "var(--color-text-primary)",
                                          }}
                                      >
                                          {unit.name}
                                      </strong>
                                      ?
                                  </>
                              )}
                    </p>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Batal
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={hasServices || isLoading}
                    loading={isLoading}
                >
                    Ya, Hapus
                </Button>
            </div>
        </Modal>
    );
};

export default DeleteUnitModal;
