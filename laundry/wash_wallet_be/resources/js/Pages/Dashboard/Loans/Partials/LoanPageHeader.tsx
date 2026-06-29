import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, DollarSign, Calendar, User } from "lucide-react";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { Loan } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface LoanPageHeaderProps {
    loan: Loan;
    onEdit?: () => void;
    onDelete?: () => void;
    isLoading?: boolean;
}

const LoanPageHeader: React.FC<LoanPageHeaderProps> = ({
    loan,
    onEdit,
    onDelete,
    isLoading = false,
}) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case "ongoing":
                return {
                    variant: "warning" as const,
                    label: "Berjalan",
                };
            case "paid":
                return {
                    variant: "success" as const,
                    label: "Lunas",
                };
            case "bad_debt":
                return {
                    variant: "error" as const,
                    label: "Macet",
                };
            default:
                return {
                    variant: "default" as const,
                    label: status,
                };
        }
    };

    const getRepaymentTypeConfig = (type: string) => {
        switch (type) {
            case "full":
                return {
                    variant: "info" as const,
                    label: "Sekaligus",
                };
            case "installment":
                return {
                    variant: "warning" as const,
                    label: "Cicilan",
                };
            default:
                return {
                    variant: "default" as const,
                    label: type,
                };
        }
    };

    const statusConfig = getStatusConfig(loan.status);
    const repaymentConfig = getRepaymentTypeConfig(loan.repaymentType);

    const canEdit = loan.status === "ongoing";
    const canDelete =
        loan.status === "ongoing" && loan.remainingAmount >= loan.amount;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Left Section - Main Info */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <DollarSign
                                    className="w-8 h-8"
                                    style={{
                                        color: "var(--color-primary-600)",
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
                                        {formatCurrency(loan.amount)}
                                    </h1>
                                    <Badge
                                        variant={statusConfig.variant}
                                        size="md"
                                    >
                                        {statusConfig.label}
                                    </Badge>
                                    <Badge
                                        variant={repaymentConfig.variant}
                                        size="md"
                                    >
                                        {repaymentConfig.label}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User
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
                                            {loan.employee?.name || "N/A"}
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
                                                loan.loanDate,
                                                "DD MMMM YYYY"
                                            )}
                                        </span>
                                    </div>

                                    {loan.outlet && (
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                📍 {loan.outlet.name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary Cards */}
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
                                    Total Kasbon
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {formatCurrency(loan.amount)}
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
                                    Sudah Dibayar
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(
                                        loan.amount - loan.remainingAmount
                                    )}
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
                                    Sisa Kasbon
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color:
                                            loan.remainingAmount > 0
                                                ? "var(--color-warning-600)"
                                                : "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(loan.remainingAmount)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex lg:flex-col gap-3">
                        {onEdit && (
                            <Button
                                variant="outline"
                                onClick={onEdit}
                                disabled={isLoading || !canEdit}
                                leftIcon={<Edit className="w-4 h-4" />}
                                title={
                                    !canEdit
                                        ? "Hanya kasbon yang berjalan dapat diedit"
                                        : "Edit kasbon"
                                }
                            >
                                Edit
                            </Button>
                        )}

                        {onDelete && (
                            <Button
                                variant="outline"
                                onClick={onDelete}
                                disabled={isLoading || !canDelete}
                                leftIcon={<Trash2 className="w-4 h-4" />}
                                className="text-red-600 hover:text-red-700 hover:border-red-600"
                                title={
                                    !canDelete
                                        ? "Tidak dapat menghapus kasbon yang sudah memiliki pembayaran"
                                        : "Hapus kasbon"
                                }
                            >
                                Hapus
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default LoanPageHeader;