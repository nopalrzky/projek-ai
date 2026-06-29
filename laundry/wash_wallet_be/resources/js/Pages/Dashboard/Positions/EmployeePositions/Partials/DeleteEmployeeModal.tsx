import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/Components/Button";
import { Avatar } from "@/Components/Avatar";
import {
    X,
    AlertTriangle,
    User,
    Briefcase,
    Building,
    Calendar,
    Trash2,
} from "lucide-react";
import { Employee } from "@/types";
import { formatDate } from "@/lib/utils";

interface DeleteEmployeeModalProps {
    isOpen: boolean;
    employee?: Employee;
    onClose: () => void;
    onConfirm: (employee: Employee) => void;
    isLoading?: boolean;
}

const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
    isOpen,
    employee,
    onClose,
    onConfirm,
    isLoading = false,
}) => {
    if (!employee) return null;

    const handleConfirm = () => {
        onConfirm(employee);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{
                            duration: 0.2,
                            ease: "easeOut",
                        }}
                        className="w-full max-w-md mx-auto rounded-lg shadow-xl overflow-hidden"
                        style={{
                            backgroundColor: "var(--color-surface-primary)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="px-6 py-4 border-b"
                            style={{
                                borderColor: "var(--color-border-light)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{
                                            backgroundColor:
                                                "var(--color-error-100)",
                                        }}
                                    >
                                        <AlertTriangle
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <h3
                                            className="text-lg font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Hapus Karyawan
                                        </h3>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Tindakan ini tidak dapat dibatalkan
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="p-2"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-6">
                            {/* Employee Info Card */}
                            <div
                                className="p-4 rounded-lg border mb-6"
                                style={{
                                    backgroundColor: "var(--color-gray-50)",
                                    borderColor: "var(--color-border-light)",
                                }}
                            >
                                <div className="flex items-start space-x-4">
                                    <Avatar
                                        src={employee.avatar}
                                        alt={employee.name}
                                        name={employee.name}
                                        size="lg"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <h4
                                                className="font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {employee.name}
                                            </h4>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                @{employee.username}
                                            </p>
                                        </div>

                                        <div className="space-y-1">
                                            {employee.outlet && (
                                                <div className="flex items-center text-sm">
                                                    <Building
                                                        className="w-3 h-3 mr-2"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    />
                                                    <span
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {employee.outlet.name}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm">
                                                <Calendar
                                                    className="w-3 h-3 mr-2"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Bergabung{" "}
                                                    {formatDate(
                                                        employee.startDate,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Warning Message */}
                            <div
                                className="p-4 rounded-lg border mb-6"
                                style={{
                                    backgroundColor: "var(--color-error-50)",
                                    borderColor: "var(--color-error-200)",
                                }}
                            >
                                <div className="flex items-start space-x-3">
                                    <AlertTriangle
                                        className="w-5 h-5 mt-0.5"
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                    />
                                    <div>
                                        <h5
                                            className="font-medium mb-2"
                                            style={{
                                                color: "var(--color-error-800)",
                                            }}
                                        >
                                            Peringatan Penting
                                        </h5>
                                        <div
                                            className="text-sm space-y-1"
                                            style={{
                                                color: "var(--color-error-700)",
                                            }}
                                        >
                                            <p>
                                                Dengan menghapus karyawan ini,
                                                maka:
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1">
                                                <li>
                                                    Data karyawan akan dihapus
                                                    permanen
                                                </li>
                                                <li>
                                                    Akses login akan
                                                    dinonaktifkan
                                                </li>
                                                <li>
                                                    Riwayat kerja masih akan
                                                    tersimpan
                                                </li>
                                                <li>
                                                    Tindakan ini tidak dapat
                                                    dibatalkan
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Confirmation Text */}
                            <div className="text-center">
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Apakah Anda yakin ingin menghapus karyawan{" "}
                                    <span
                                        className="font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {employee.name}
                                    </span>
                                    ?
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div
                            className="px-6 py-4 border-t"
                            style={{
                                borderColor: "var(--color-border-light)",
                                backgroundColor: "var(--color-gray-25)",
                            }}
                        >
                            <div className="flex items-center justify-end space-x-3">
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
                                    disabled={isLoading}
                                    leftIcon={
                                        isLoading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            >
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                            </motion.div>
                                        ) : (
                                            <Trash2 />
                                        )
                                    }
                                    className="min-w-[120px]"
                                >
                                    {isLoading ? "Menghapus..." : "Ya, Hapus"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteEmployeeModal;
