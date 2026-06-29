import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { DeleteMembershipPlanModalProps } from "../types";

const DeleteMembershipPlanModal: React.FC<DeleteMembershipPlanModalProps> = ({
    isOpen,
    membershipPlan,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const handleConfirm = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    return (
        <Modal
            title=""
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            className="overflow-hidden"
            loading={isLoading}
            preventClose={isLoading}
            closeOnOverlayClick={!isLoading}
            closeOnEscape={!isLoading}
        >
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="p-6"
                    >
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
                                style={{ color: "var(--color-error-500)" }}
                            />
                        </motion.div>

                        <div className="text-center mb-8">
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
                                Apakah Anda yakin ingin menghapus paket
                                membership{" "}
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipPlan?.name}
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </motion.p>
                            {membershipPlan?.membershipContractsCount &&
                                membershipPlan.membershipContractsCount > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="mt-4 p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-warning-100)",
                                        }}
                                    >
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-warning-700)",
                                            }}
                                        >
                                            ⚠️ Terdapat{" "}
                                            {
                                                membershipPlan.membershipContractsCount
                                            }{" "}
                                            pelanggan aktif menggunakan paket
                                            ini.
                                        </p>
                                    </motion.div>
                                )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
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
                                disabled={isLoading}
                                loading={isLoading}
                                leftIcon={
                                    isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    )
                                }
                            >
                                {isLoading ? "Menghapus..." : "Hapus"}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
};

export default DeleteMembershipPlanModal;
