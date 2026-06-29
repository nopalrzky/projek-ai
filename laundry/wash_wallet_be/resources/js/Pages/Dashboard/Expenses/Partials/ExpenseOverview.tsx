import React from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    Calendar,
    Building2,
    User,
    FileText,
    Wallet,
    TrendingUp,
    Receipt,
    Paperclip,
    Download,
} from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { ExpenseOverviewProps } from "../types";

const ExpenseOverview: React.FC<ExpenseOverviewProps> = ({ expense }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleDownloadAttachment = () => {
        if (expense.attachmentUrl) {
            window.open(expense.attachmentUrl, "_blank");
        }
    };

    return (
        <div className="space-y-6">
            {/* Main Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card variant="elevated" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amount Section */}
                        <div
                            className="p-6 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-error-50)",
                                border: "2px solid var(--color-error-200)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                    >
                                        Total Pengeluaran
                                    </p>
                                    <p
                                        className="text-3xl font-bold mt-1"
                                        style={{
                                            color: "var(--color-error-700)",
                                        }}
                                    >
                                        {formatCurrency(expense.amount)}
                                    </p>
                                </div>
                                <div
                                    className="p-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            "var(--color-error-100)",
                                    }}
                                >
                                    <Receipt
                                        className="w-8 h-8"
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <TrendingUp
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-error-500)",
                                    }}
                                />
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                >
                                    Pengeluaran Operasional
                                </span>
                            </div>
                        </div>

                        {/* Date & Status */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Calendar
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Tanggal Pengeluaran
                                    </p>
                                </div>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.formattedDate}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Building2
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Outlet
                                    </p>
                                </div>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.outletName}
                                </p>
                                {expense.outlet?.code && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Kode: {expense.outlet.code}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Description Card */}
            {expense.description && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start space-x-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <FileText
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className="text-lg font-semibold mb-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Deskripsi
                                </h3>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {expense.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Accounts Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Expense Account */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-start space-x-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-error-100)",
                            }}
                        >
                            <DollarSign
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-error-600)",
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <p
                                className="text-sm font-medium mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Akun Beban
                            </p>
                            <h3
                                className="text-lg font-semibold mb-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {expense.expenseAccountName}
                            </h3>
                            {expense.expenseAccount?.code && (
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Kode: {expense.expenseAccount.code}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Source Account */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-start space-x-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <Wallet
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                        <div className="flex-1">
                            <p
                                className="text-sm font-medium mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Sumber Dana
                            </p>
                            <h3
                                className="text-lg font-semibold mb-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {expense.sourceAccountName}
                            </h3>
                            {expense.sourceAccount?.code && (
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Kode: {expense.sourceAccount.code}
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Creator & Attachment Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
            >
                <Card variant="elevated" className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Creator Info */}
                        <div>
                            <div className="flex items-center space-x-2 mb-3">
                                <User
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Dibuat Oleh
                                </p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {expense.creatorName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div>
                                    <p
                                        className="font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {expense.creatorName}
                                    </p>
                                    <Badge
                                        variant={
                                            expense.creatorType === "employee"
                                                ? "primary"
                                                : "secondary"
                                        }
                                        size="sm"
                                    >
                                        {expense.creatorType === "employee"
                                            ? "Karyawan"
                                            : expense.creatorType === "user"
                                              ? "Owner"
                                              : "Unknown"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Attachment Info */}
                        <div>
                            <div className="flex items-center space-x-2 mb-3">
                                <Paperclip
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Lampiran
                                </p>
                            </div>
                            {expense.hasAttachment ? (
                                <button
                                    onClick={handleDownloadAttachment}
                                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors w-full"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-success-100)",
                                        }}
                                    >
                                        <Paperclip
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-success-600)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            File Lampiran Tersedia
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Klik untuk melihat
                                        </p>
                                    </div>
                                    <Download
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                </button>
                            ) : (
                                <div
                                    className="p-3 rounded-lg text-center"
                                    style={{
                                        backgroundColor:
                                            "var(--color-surface-secondary)",
                                    }}
                                >
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tidak ada lampiran
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Timestamp Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <Card variant="outlined" className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p
                                className="font-medium mb-1"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Dibuat Pada
                            </p>
                            <p
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {new Date(expense.createdAt).toLocaleString(
                                    "id-ID",
                                    {
                                        dateStyle: "long",
                                        timeStyle: "short",
                                    },
                                )}
                            </p>
                        </div>
                        <div>
                            <p
                                className="font-medium mb-1"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Terakhir Diupdate
                            </p>
                            <p
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {new Date(expense.updatedAt).toLocaleString(
                                    "id-ID",
                                    {
                                        dateStyle: "long",
                                        timeStyle: "short",
                                    },
                                )}
                            </p>
                        </div>
                        {expense.deletedAt && (
                            <div>
                                <p
                                    className="font-medium mb-1"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                >
                                    Dihapus Pada
                                </p>
                                <p
                                    style={{
                                        color: "var(--color-error-500)",
                                    }}
                                >
                                    {new Date(expense.deletedAt).toLocaleString(
                                        "id-ID",
                                        {
                                            dateStyle: "long",
                                            timeStyle: "short",
                                        },
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default ExpenseOverview;
