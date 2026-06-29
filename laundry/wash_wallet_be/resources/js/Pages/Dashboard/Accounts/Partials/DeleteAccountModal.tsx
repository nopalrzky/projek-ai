import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Lock, Loader2 } from "lucide-react";
import { Modal } from "@/Components/Modal";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { DeleteAccountModalProps } from "../types";

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    isOpen,
    account,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    const handleConfirm = () => {
        if (!account || !canDelete || isLoading) return;
        onConfirm(account);
    };

    if (!account) return null;

    const hasChildren = account.children && account.children.length > 0;
    const canDelete = !account.isSystem && !hasChildren;

    const getTypeVariant = (type: string) => {
        const variants: Record<string, any> = {
            asset: "primary",
            liability: "danger",
            equity: "warning",
            revenue: "success",
            expense: "info",
        };
        return variants[type] || "secondary";
    };

    return (
        <Modal
            title=""
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            className="overflow-hidden"
            preventClose={isLoading}
        >
            <AnimatePresence>
                {isOpen && account && (
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
                                backgroundColor: canDelete
                                    ? "var(--color-error-100)"
                                    : "var(--color-warning-100)",
                            }}
                        >
                            {canDelete ? (
                                <AlertTriangle
                                    className="w-8 h-8"
                                    style={{
                                        color: "var(--color-error-500)",
                                    }}
                                />
                            ) : (
                                <Lock
                                    className="w-8 h-8"
                                    style={{
                                        color: "var(--color-warning-500)",
                                    }}
                                />
                            )}
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
                                {canDelete
                                    ? "Konfirmasi Penghapusan"
                                    : "Tidak Dapat Dihapus"}
                            </motion.h3>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="leading-relaxed mb-4"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {canDelete ? (
                                    <>
                                        Apakah Anda yakin ingin menghapus akun{" "}
                                        <span
                                            className="font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {account.name}
                                        </span>{" "}
                                        ({account.code})? Tindakan ini tidak
                                        dapat dibatalkan.
                                    </>
                                ) : (
                                    <>
                                        Akun{" "}
                                        <span
                                            className="font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {account.name}
                                        </span>{" "}
                                        ({account.code}) tidak dapat dihapus.
                                    </>
                                )}
                            </motion.p>

                            {/* Account Info Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="p-4 rounded-lg border text-left mb-4"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <p
                                    className="font-mono text-xs mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {account.code}
                                </p>
                                <p
                                    className="font-semibold mb-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {account.name}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge
                                        variant={getTypeVariant(account.type)}
                                        size="sm"
                                    >
                                        {account.type}
                                    </Badge>
                                    <Badge variant="secondary" size="sm">
                                        Level {account.level}
                                    </Badge>
                                    {account.isSystem && (
                                        <Badge variant="warning" size="sm">
                                            <Lock className="w-3 h-3 mr-1" />
                                            Sistem
                                        </Badge>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Warning Alert */}
                        {!canDelete && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-6"
                            >
                                {account.isSystem ? (
                                    <Alert
                                        variant="warning"
                                        title="Akun Sistem Terkunci"
                                        description="Akun sistem tidak dapat dihapus karena merupakan bagian penting dari struktur akuntansi."
                                    />
                                ) : (
                                    <Alert
                                        variant="error"
                                        title="Memiliki Sub-Akun"
                                        description={`Akun ini memiliki ${account.children?.length} sub-akun. Hapus atau pindahkan semua sub-akun terlebih dahulu.`}
                                    />
                                )}
                            </motion.div>
                        )}

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: canDelete ? 0.3 : 0.35,
                            }}
                            className="flex justify-center space-x-3"
                        >
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="px-6"
                                disabled={isLoading}
                            >
                                {canDelete ? "Batal" : "Tutup"}
                            </Button>

                            {canDelete && (
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
                                    {isLoading ? "Menghapus..." : "Hapus Akun"}
                                </Button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Modal>
    );
};

export default DeleteAccountModal;
