import React from "react";
import { motion } from "framer-motion";
import {
    DollarSign,
    Calendar,
    CreditCard,
    Wallet,
    FileText,
    TrendingUp,
} from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Loan } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LoanOverviewProps {
    loan: Loan;
}

const LoanOverview: React.FC<LoanOverviewProps> = ({ loan }) => {
    const paymentProgress =
        ((loan.amount - loan.remainingAmount) / loan.amount) * 100;

    return (
        <div className="space-y-6">
            {/* Loan Details */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card className="p-6">
                    <h2
                        className="text-xl font-semibold mb-6"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Detail Kasbon
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amount */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <DollarSign
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Jumlah Kasbon
                                </p>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatCurrency(loan.amount)}
                                </p>
                            </div>
                        </div>

                        {/* Loan Date */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <Calendar
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tanggal Kasbon
                                </p>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(loan.loanDate, "DD MMMM YYYY")}
                                </p>
                            </div>
                        </div>

                        {/* Repayment Type */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-warning-100)",
                                }}
                            >
                                <CreditCard
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-warning-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tipe Pembayaran
                                </p>
                                <Badge
                                    variant={
                                        loan.repaymentType === "full"
                                            ? "info"
                                            : "warning"
                                    }
                                >
                                    {loan.repaymentType === "full"
                                        ? "Sekaligus"
                                        : "Cicilan"}
                                </Badge>
                            </div>
                        </div>

                        {/* Source Account */}
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <Wallet
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Sumber Dana
                                </p>
                                <p
                                    className="text-lg font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {loan.sourceAccount?.name || "N/A"}
                                </p>
                                {loan.sourceAccount?.code && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {loan.sourceAccount.code}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Installment Details (if applicable) */}
            {loan.repaymentType === "installment" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card className="p-6">
                        <h2
                            className="text-xl font-semibold mb-6"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Detail Cicilan
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-4">
                                <div
                                    className="p-3 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                    }}
                                >
                                    <Calendar
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Cicilan per Bulan
                                    </p>
                                    <p
                                        className="text-lg font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatCurrency(
                                            loan.installmentAmount || 0,
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div
                                    className="p-3 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-info-100)",
                                    }}
                                >
                                    <TrendingUp
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-info-600)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Total Cicilan
                                    </p>
                                    <p
                                        className="text-lg font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {loan.totalInstallments || 0} bulan
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div
                                    className="p-3 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-success-100)",
                                    }}
                                >
                                    <Calendar
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-success-600)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Jatuh Tempo
                                    </p>
                                    <p
                                        className="text-lg font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {loan.dueDate
                                            ? formatDate(
                                                  loan.dueDate,
                                                  "DD MMMM YYYY",
                                              )
                                            : "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Payment Progress */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
            >
                <Card className="p-6">
                    <h2
                        className="text-xl font-semibold mb-6"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Progress Pembayaran
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {paymentProgress.toFixed(1)}% terbayar
                            </span>
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {formatCurrency(
                                    loan.amount - loan.remainingAmount,
                                )}{" "}
                                / {formatCurrency(loan.amount)}
                            </span>
                        </div>

                        <div
                            className="w-full h-3 rounded-full overflow-hidden"
                            style={{
                                backgroundColor: "var(--color-border)",
                            }}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${paymentProgress}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="h-full rounded-full"
                                style={{
                                    backgroundColor:
                                        paymentProgress === 100
                                            ? "var(--color-success-500)"
                                            : "var(--color-primary-500)",
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-50)",
                                }}
                            >
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-success-700)",
                                    }}
                                >
                                    Sudah Dibayar
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(
                                        loan.amount - loan.remainingAmount,
                                    )}
                                </p>
                            </div>

                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-warning-50)",
                                }}
                            >
                                <p
                                    className="text-sm font-medium mb-1"
                                    style={{
                                        color: "var(--color-warning-700)",
                                    }}
                                >
                                    Sisa Kasbon
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-warning-600)",
                                    }}
                                >
                                    {formatCurrency(loan.remainingAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Notes */}
            {loan.note && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card className="p-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <FileText
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>
                            <div className="flex-1">
                                <h3
                                    className="text-lg font-semibold mb-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Catatan
                                </h3>
                                <p
                                    className="text-sm leading-relaxed whitespace-pre-wrap"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {loan.note}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default LoanOverview;
