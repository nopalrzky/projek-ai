import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { DeleteOutletModalProps } from "../types";

const DeleteOutletModal: React.FC<DeleteOutletModalProps> = ({
    isOpen,
    outlet,
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
                                style={{ color: "var(--color-error-500)" }}
                            />
                        </motion.div>

                        {/* Content */}
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
                                Apakah Anda yakin ingin menghapus outlet{" "}
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet?.name}
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan dan semua
                                akun terkait akan dinonaktifkan.
                            </motion.p>
                        </div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
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

export default DeleteOutletModal;
