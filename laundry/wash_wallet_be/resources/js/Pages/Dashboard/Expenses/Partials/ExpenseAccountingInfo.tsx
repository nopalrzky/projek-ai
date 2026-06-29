import React from "react";
import { motion } from "framer-motion";
import { BookOpen, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { ExpenseAccountingInfoProps } from "../types";

const ExpenseAccountingInfo: React.FC<ExpenseAccountingInfoProps> = ({
    expense,
}) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            {/* Journal Entry Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <BookOpen
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-primary-600)",
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
                                Jurnal Akuntansi
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Pencatatan otomatis dalam sistem akuntansi
                            </p>
                        </div>
                    </div>

                    {/* Journal Entries */}
                    <div className="space-y-4">
                        {/* Debit Entry - Expense Account */}
                        <div
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: "var(--color-error-50)",
                                borderColor: "var(--color-error-200)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <TrendingUp
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                    />
                                    <Badge variant="error">DEBIT</Badge>
                                </div>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-error-700)",
                                    }}
                                >
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>
                            <div
                                className="pl-8 border-l-2"
                                style={{
                                    borderColor: "var(--color-error-300)",
                                }}
                            >
                                <p
                                    className="font-semibold mb-1"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.expenseAccountName}
                                </p>
                                {expense.expenseAccount?.code && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Kode: {expense.expenseAccount.code}
                                    </p>
                                )}
                                <p
                                    className="text-xs mt-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Mencatat penambahan beban operasional
                                </p>
                            </div>
                        </div>

                        {/* Arrow Indicator */}
                        <div className="flex justify-center">
                            <ArrowRight
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                        </div>

                        {/* Credit Entry - Source Account */}
                        <div
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: "var(--color-success-50)",
                                borderColor: "var(--color-success-200)",
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <TrendingDown
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-success-600)",
                                        }}
                                    />
                                    <Badge variant="success">KREDIT</Badge>
                                </div>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-success-700)",
                                    }}
                                >
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>
                            <div
                                className="pl-8 border-l-2"
                                style={{
                                    borderColor: "var(--color-success-300)",
                                }}
                            >
                                <p
                                    className="font-semibold mb-1"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {expense.sourceAccountName}
                                </p>
                                {expense.sourceAccount?.code && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Kode: {expense.sourceAccount.code}
                                    </p>
                                )}
                                <p
                                    className="text-xs mt-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Mencatat pengurangan saldo sumber dana
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Accounting Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Card variant="outlined" className="p-6">
                    <h4
                        className="font-semibold mb-4"
                        style={{
                            color: "var(--color-text-primary)",
                        }}
                    >
                        Ringkasan Pencatatan
                    </h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Tanggal Transaksi
                            </span>
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {expense.formattedDate}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Outlet
                            </span>
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {expense.outletName}
                            </span>
                        </div>
                        <div
                            className="pt-3 border-t"
                            style={{
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Total Pengeluaran
                                </span>
                                <span
                                    className="text-lg font-bold"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                >
                                    {formatCurrency(expense.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Info Box */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-info-50)",
                        borderColor: "var(--color-info-200)",
                    }}
                >
                    <div className="flex items-start space-x-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <span
                                className="text-xs font-bold"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            >
                                i
                            </span>
                        </div>
                        <div>
                            <h4
                                className="text-sm font-medium mb-1"
                                style={{
                                    color: "var(--color-info-700)",
                                }}
                            >
                                Tentang Jurnal Akuntansi
                            </h4>
                            <ul
                                className="text-xs space-y-1"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            >
                                <li>
                                    • Jurnal dibuat otomatis saat pengeluaran
                                    dicatat
                                </li>
                                <li>
                                    • Akun beban (expense) bertambah di sisi
                                    debit
                                </li>
                                <li>
                                    • Sumber dana (asset) berkurang di sisi
                                    kredit
                                </li>
                                <li>• Saldo akun diupdate secara real-time</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ExpenseAccountingInfo;
