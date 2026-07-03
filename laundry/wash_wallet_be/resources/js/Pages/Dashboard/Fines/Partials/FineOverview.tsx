import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import {
    DollarSign,
    Building2,
    Calendar,
    FileText,
    AlertCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FineOverviewProps } from "../types";

const FineOverview: React.FC<FineOverviewProps> = ({ fine }) => {
    const statistics = useMemo(() => {
        const logs = fine.fineLogs || [];
        const totalLogs = logs.length;
        const paidLogs = logs.filter((log) => log.status === "paid").length;
        const unpaidLogs = logs.filter((log) => log.status === "unpaid").length;
        const totalAmount = logs.reduce((sum, log) => sum + log.amount, 0);
        const paidAmount = logs
            .filter((log) => log.status === "paid")
            .reduce((sum, log) => sum + log.amount, 0);
        const unpaidAmount = logs
            .filter((log) => log.status === "unpaid")
            .reduce((sum, log) => sum + log.amount, 0);

        return {
            totalLogs,
            paidLogs,
            unpaidLogs,
            totalAmount,
            paidAmount,
            unpaidAmount,
        };
    }, [fine.fineLogs]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Statistics Summary */}
            <Card className="p-6">
                <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Ringkasan Statistik
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Total Logs */}
                    <div
                        className="p-4 rounded-lg border"
                        style={{
                            borderColor: "var(--color-border)",
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <FileText
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Total Catatan
                            </p>
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {statistics.totalLogs}
                        </p>
                    </div>

                    {/* Paid Logs */}
                    <div
                        className="p-4 rounded-lg border"
                        style={{
                            borderColor: "var(--color-success-200)",
                            backgroundColor: "var(--color-success-50)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <DollarSign
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-success-700)" }}
                            >
                                Sudah Dibayar
                            </p>
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-success-700)" }}
                        >
                            {statistics.paidLogs}
                        </p>
                    </div>

                    {/* Unpaid Logs */}
                    <div
                        className="p-4 rounded-lg border"
                        style={{
                            borderColor: "var(--color-error-200)",
                            backgroundColor: "var(--color-error-50)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-error-100)",
                                }}
                            >
                                <AlertCircle
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-error-600)" }}
                                />
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-error-700)" }}
                            >
                                Belum Dibayar
                            </p>
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-error-700)" }}
                        >
                            {statistics.unpaidLogs}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {/* Total Amount */}
                    <div
                        className="p-4 rounded-lg border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p
                            className="text-sm mb-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Total Nominal
                        </p>
                        <p
                            className="text-xl font-bold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {formatCurrency(statistics.totalAmount)}
                        </p>
                    </div>

                    {/* Paid Amount */}
                    <div
                        className="p-4 rounded-lg border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p
                            className="text-sm mb-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Sudah Dibayar
                        </p>
                        <p
                            className="text-xl font-bold"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            {formatCurrency(statistics.paidAmount)}
                        </p>
                    </div>

                    {/* Unpaid Amount */}
                    <div
                        className="p-4 rounded-lg border"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <p
                            className="text-sm mb-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Belum Dibayar
                        </p>
                        <p
                            className="text-xl font-bold"
                            style={{ color: "var(--color-error-600)" }}
                        >
                            {formatCurrency(statistics.unpaidAmount)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Fine Details */}
            <Card className="p-6">
                <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Detail Denda
                </h2>

                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-full"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <DollarSign
                                className="w-5 h-5"
                                style={{ color: "var(--color-warning-600)" }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Nominal Denda
                            </p>
                            <p
                                className="font-medium text-lg"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatCurrency(fine.amount)}
                            </p>
                        </div>
                    </div>

                    {fine.outlet && (
                        <div className="flex items-start gap-4">
                            <div
                                className="flex items-center justify-center w-10 h-10 rounded-full"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Building2
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet
                                </p>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {fine.outlet.name}
                                </p>
                                {fine.outlet.street && (
                                    <p
                                        className="text-sm mt-1"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {fine.outlet.street}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-4">
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-full"
                            style={{ backgroundColor: "var(--color-info-100)" }}
                        >
                            <Calendar
                                className="w-5 h-5"
                                style={{ color: "var(--color-info-600)" }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Dibuat Pada
                            </p>
                            <p
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatDate(fine.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Description */}
            {fine.description && (
                <Card className="p-6">
                    <h2
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Deskripsi
                    </h2>

                    <div className="flex items-start gap-3">
                        <FileText
                            className="w-5 h-5 mt-0.5"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                        <p
                            className="flex-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {fine.description}
                        </p>
                    </div>
                </Card>
            )}
        </motion.div>
    );
};

export default FineOverview;
