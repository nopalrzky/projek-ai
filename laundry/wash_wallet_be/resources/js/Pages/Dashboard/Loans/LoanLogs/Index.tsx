import React from "react";
import { motion } from "framer-motion";
import { Plus, Calendar, DollarSign, FileText } from "lucide-react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LoanLogsIndexProps } from "./types";

const LoanLogsIndex: React.FC<LoanLogsIndexProps> = ({ loan, loanLogs }) => {
    const handleAddPayment = () => {
        alert("Fitur tambah pembayaran akan segera hadir");
    };

    if (!loanLogs || loanLogs.length === 0) {
        return (
            <Card className="p-8">
                <div className="text-center">
                    <div
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                        style={{
                            backgroundColor: "var(--color-primary-100)",
                        }}
                    >
                        <DollarSign
                            className="w-8 h-8"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                    </div>
                    <h3
                        className="text-lg font-semibold mb-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Belum ada pembayaran
                    </h3>
                    <p
                        className="mb-6"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Belum ada pembayaran yang tercatat untuk kasbon ini
                    </p>
                    {loan.status === "ongoing" && (
                        <Button
                            variant="primary"
                            onClick={handleAddPayment}
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Tambah Pembayaran
                        </Button>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {loan.status === "ongoing" && (
                <div className="flex justify-end">
                    <Button
                        variant="primary"
                        onClick={handleAddPayment}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Tambah Pembayaran
                    </Button>
                </div>
            )}

            <div className="space-y-4">
                {loanLogs.map((payment, index) => (
                    <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <Card className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4 flex-1">
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-success-100)",
                                        }}
                                    >
                                        <DollarSign
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-success-600)",
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3
                                                className="text-xl font-bold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {formatCurrency(payment.amount)}
                                            </h3>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar
                                                    className="w-4 h-4"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                />
                                                <span
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {formatDate(
                                                        payment.paymentDate,
                                                        "DD MMMM YYYY",
                                                    )}
                                                </span>
                                            </div>

                                            {payment.note && (
                                                <div className="flex items-start gap-2 mt-2">
                                                    <FileText
                                                        className="w-4 h-4 mt-0.5"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    />
                                                    <p
                                                        className="text-sm"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    >
                                                        {payment.note}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default LoanLogsIndex;
