import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { formatCurrency } from "@/lib/utils";
import { DeleteServicePackageModalProps } from "../types";

const DeleteServicePackageModal: React.FC<DeleteServicePackageModalProps> = ({
    isOpen,
    servicePackage,
    onClose,
    onConfirm,
    isLoading,
}) => {
    const handleConfirm = () => {
        if (servicePackage && !isLoading) {
            onConfirm();
        }
    };

    const hasItems = (servicePackage?.servicePackageItemsCount ?? 0) > 0;
    const hasTransactions =
        (servicePackage?.customerSubscriptionsCount ?? 0) > 0;
    const cannotDelete = hasTransactions;

    return (
        <Modal
            title=""
            isOpen={isOpen}
            onClose={isLoading ? () => {} : onClose}
            size="sm"
            className="overflow-hidden"
            preventClose={isLoading}
        >
            <AnimatePresence>
                {isOpen && servicePackage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="p-6"
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: "spring" }}
                            className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full"
                            style={{
                                backgroundColor: "var(--color-error-100)",
                            }}
                        >
                            <AlertTriangle
                                className="w-8 h-8"
                                style={{
                                    color: "var(--color-error-500)",
                                }}
                            />
                        </motion.div>
                        {/* Content */}
                        <div className="text-center mb-6">
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-lg font-semibold mb-3"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Konfirmasi Penghapusan
                            </motion.h3>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="leading-relaxed"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Apakah Anda yakin ingin menghapus paket deposit{" "}
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {servicePackage.name}
                                </span>{" "}
                                dengan harga{" "}
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatCurrency(servicePackage.price)}
                                </span>
                                ?
                                {hasItems && (
                                    <>
                                        {" "}
                                        Paket ini memiliki{" "}
                                        {
                                            servicePackage.servicePackageItemsCount
                                        }{" "}
                                        item layanan.
                                    </>
                                )}
                                {!cannotDelete &&
                                    " Tindakan ini tidak dapat dibatalkan."}
                            </motion.p>
                        </div>

                        {/* Warning Alert */}
                        {cannotDelete && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="mb-6"
                            >
                                <Alert
                                    variant="error"
                                    title="Tidak dapat menghapus"
                                    description={`Paket ini tidak dapat dihapus karena sudah digunakan dalam ${servicePackage.customerSubscriptionsCount} transaksi.`}
                                />
                            </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: cannotDelete ? 0.3 : 0.25 }}
                            className="flex justify-center space-x-3"
                        >
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="px-6"
                                disabled={isLoading}
                            >
                                Batal
                            </Button>

                            <Button
                                variant="danger"
                                onClick={handleConfirm}
                                className="px-6"
                                disabled={cannotDelete || isLoading}
                                loading={isLoading}
                                leftIcon={
                                    isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    )
                                }
                            >
                                {isLoading ? "Menghapus..." : "Hapus Paket"}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
};

export default DeleteServicePackageModal;
