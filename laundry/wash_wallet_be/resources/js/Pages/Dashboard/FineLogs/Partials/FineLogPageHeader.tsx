import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, User, Building2 } from "lucide-react";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FineLogPageHeaderProps } from "../types";

const FineLogPageHeader: React.FC<FineLogPageHeaderProps> = ({ fineLog }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "unpaid":
                return {
                    variant: "warning" as const,
                    label: "Belum Dibayar",
                };
            case "paid":
                return {
                    variant: "success" as const,
                    label: "Lunas",
                };
            case "cancelled":
                return {
                    variant: "error" as const,
                    label: "Dibatalkan",
                };
            default:
                return {
                    variant: "default" as const,
                    label: status,
                };
        }
    };

    const statusConfig = getStatusConfig(fineLog.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    backgroundColor: "var(--color-error-100)",
                                }}
                            >
                                <AlertCircle
                                    className="w-8 h-8"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1
                                        className="text-3xl font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatCurrency(fineLog.amount)}
                                    </h1>
                                    <Badge
                                        variant={statusConfig.variant}
                                        size="md"
                                    >
                                        {statusConfig.label}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <span
                                            className="text-lg font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {fineLog.fine?.name || "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <User
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <span
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {fineLog.employee?.name || "N/A"}
                                        </span>
                                    </div>

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
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {formatDate(
                                                fineLog.date,
                                                "DD MMMM YYYY",
                                            )}
                                        </span>
                                    </div>

                                    {fineLog.outlet && (
                                        <div className="flex items-center gap-2">
                                            <Building2
                                                className="w-4 h-4"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            />
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                {fineLog.outlet.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <p
                                    className="text-xs font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Jenis Denda
                                </p>
                                <p
                                    className="text-lg font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {fineLog.fine?.name || "N/A"}
                                </p>
                            </div>

                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <p
                                    className="text-xs font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Jumlah Denda
                                </p>
                                <p
                                    className="text-lg font-bold"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                >
                                    {formatCurrency(fineLog.amount)}
                                </p>
                            </div>

                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <p
                                    className="text-xs font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Status
                                </p>
                                <Badge variant={statusConfig.variant} size="lg">
                                    {statusConfig.label}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default FineLogPageHeader;
