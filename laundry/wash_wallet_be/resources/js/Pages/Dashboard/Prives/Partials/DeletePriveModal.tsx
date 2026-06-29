import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { DeletePriveModalProps } from "../types";

const DeletePriveModal: React.FC<DeletePriveModalProps> = ({
    isOpen,
    prive,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const handleConfirm = () => {
        if (prive && !isLoading) {
            onConfirm(prive);
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
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <p
                                    className="leading-relaxed mb-4"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Apakah Anda yakin ingin menghapus prive
                                    sejumlah{" "}
                                    <span
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                    >
                                        {prive?.formattedAmount}
                                    </span>{" "}
                                    pada tanggal{" "}
                                    <span
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {prive?.formattedDate}
                                    </span>
                                    ?
                                </p>

                                <div
                                    className="p-3 rounded-lg text-left"
                                    style={{
                                        backgroundColor:
                                            "var(--color-warning-50)",
                                        border: "1px solid var(--color-warning-200)",
                                    }}
                                >
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle
                                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                                            style={{
                                                color: "var(--color-warning-600)",
                                            }}
                                        />
                                        <div>
                                            <p
                                                className="text-xs font-medium mb-1"
                                                style={{
                                                    color: "var(--color-warning-700)",
                                                }}
                                            >
                                                Yang akan terjadi:
                                            </p>
                                            <ul
                                                className="text-xs space-y-0.5"
                                                style={{
                                                    color: "var(--color-warning-600)",
                                                }}
                                            >
                                                <li>
                                                    • Data prive akan dihapus
                                                    (soft delete)
                                                </li>
                                                <li>
                                                    • Jurnal akuntansi akan
                                                    dihapus
                                                </li>
                                                <li>
                                                    • Saldo akun akan
                                                    disesuaikan
                                                </li>
                                                <li>
                                                    • Data dapat dipulihkan dari
                                                    menu restore
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

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

export default DeletePriveModal;
