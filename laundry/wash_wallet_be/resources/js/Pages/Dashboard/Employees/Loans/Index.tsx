import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Plus,
    Edit,
    Calendar,
    TrendingUp,
    AlertCircle,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
} from "lucide-react";
import { Loan } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { EmployeeLoansIndexProps } from "./types";
import employeeService from "@/Services/employee.service";

const EmployeeLoansIndex: React.FC<EmployeeLoansIndexProps> = ({
    employee,
    isLoading = false,
}) => {
    const handleAddLoan = () => {
        employeeService.goToCreateLoanPage(employee.id);
    };

    const handleViewLoan = (loan: Loan) => {
        employeeService.goToViewLoanPage(employee.id, loan.id);
    };

    const handleEditLoan = (loan: Loan) => {
        employeeService.goToEditLoanPage(employee.id, loan.id);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const variants: Record<
            string,
            { variant: any; label: string; icon: any }
        > = {
            ongoing: {
                variant: "warning",
                label: "Berjalan",
                icon: Clock,
            },
            paid: {
                variant: "success",
                label: "Lunas",
                icon: CheckCircle,
            },
            bad_debt: {
                variant: "danger",
                label: "Macet",
                icon: XCircle,
            },
        };
        return (
            variants[status] || {
                variant: "default",
                label: status,
                icon: AlertCircle,
            }
        );
    };

    const isOverdue = (loan: Loan) => {
        if (loan.status !== "ongoing" || !loan.dueDate) return false;
        return new Date(loan.dueDate) < new Date();
    };

    const calculateProgress = (loan: Loan) => {
        if (loan.amount <= 0) return 0;
        const paid = loan.amount - loan.remainingAmount;
        return Math.round((paid / loan.amount) * 100);
    };

    const columns: ColumnDef<Loan>[] = useMemo(
        () => [
            {
                accessorKey: "loanDate",
                header: "Tanggal Pinjaman",
                cell: ({ row }) => {
                    const loan = row.original;
                    const statusBadge = getStatusBadge(loan.status);
                    const StatusIcon = statusBadge.icon;
                    const overdue = isOverdue(loan);

                    return (
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    overdue ? "bg-red-100" : "bg-primary-100"
                                }`}
                            >
                                <Calendar
                                    className="w-5 h-5"
                                    style={{
                                        color: overdue
                                            ? "var(--color-danger-600)"
                                            : "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {new Date(loan.loanDate).toLocaleDateString(
                                        "id-ID",
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        },
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={statusBadge.variant}
                                        size="sm"
                                    >
                                        <StatusIcon className="w-3 h-3 mr-1" />
                                        {statusBadge.label}
                                    </Badge>
                                    {overdue && (
                                        <Badge variant="warning" size="sm">
                                            Jatuh Tempo
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                },
                size: 220,
            },

            {
                accessorKey: "amount",
                header: "Jumlah Pinjaman",
                cell: ({ row }) => {
                    const loan = row.original;
                    const progress = calculateProgress(loan);

                    return (
                        <div className="space-y-2">
                            <div
                                className="font-bold text-lg"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {formatCurrency(loan.amount)}
                            </div>
                            {/* Progress bar */}
                            <div className="w-full">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Progress
                                    </span>
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {progress}%
                                    </span>
                                </div>
                                <div
                                    className="w-full h-2 rounded-full overflow-hidden"
                                    style={{
                                        backgroundColor:
                                            "var(--color-gray-200)",
                                    }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${progress}%`,
                                            backgroundColor:
                                                progress === 100
                                                    ? "var(--color-success-500)"
                                                    : progress > 50
                                                      ? "var(--color-primary-500)"
                                                      : "var(--color-warning-500)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                },
                size: 200,
            },

            {
                accessorKey: "remainingAmount",
                header: "Sisa Pinjaman",
                cell: ({ row }) => {
                    const loan = row.original;
                    const paidAmount = loan.amount - loan.remainingAmount;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-bold text-lg"
                                style={{
                                    color:
                                        loan.remainingAmount > 0
                                            ? "var(--color-danger-600)"
                                            : "var(--color-success-600)",
                                }}
                            >
                                {formatCurrency(loan.remainingAmount)}
                            </div>
                            <div
                                className="text-xs"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                Terbayar: {formatCurrency(paidAmount)}
                            </div>
                        </div>
                    );
                },
                size: 180,
            },

            {
                accessorKey: "installment",
                header: "Cicilan",
                cell: ({ row }) => {
                    const loan = row.original;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {formatCurrency(loan.installmentAmount)}
                            </div>
                            <div
                                className="text-xs"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {loan.totalInstallments}x cicilan
                            </div>
                            {loan.loanLogs && loan.loanLogs.length > 0 && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {loan.loanLogs.length} pembayaran
                                </div>
                            )}
                        </div>
                    );
                },
                size: 150,
            },

            {
                accessorKey: "dueDate",
                header: "Jatuh Tempo",
                cell: ({ row }) => {
                    const loan = row.original;
                    const overdue = isOverdue(loan);

                    return loan.dueDate ? (
                        <div className="space-y-1">
                            <div
                                className={`font-medium ${
                                    overdue ? "text-red-600" : ""
                                }`}
                                style={{
                                    color: overdue
                                        ? "var(--color-danger-600)"
                                        : "var(--color-text-primary)",
                                }}
                            >
                                {new Date(loan.dueDate).toLocaleDateString(
                                    "id-ID",
                                    {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    },
                                )}
                            </div>
                            {overdue && loan.status === "ongoing" && (
                                <Badge variant="warning" size="sm">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Terlambat
                                </Badge>
                            )}
                        </div>
                    ) : (
                        <span
                            className="text-sm italic"
                            style={{
                                color: "var(--color-text-tertiary)",
                            }}
                        >
                            Tidak ada
                        </span>
                    );
                },
                size: 150,
            },

            {
                accessorKey: "note",
                header: "Catatan",
                cell: ({ row }) => {
                    const loan = row.original;
                    return loan.note ? (
                        <div
                            className="text-sm max-w-xs truncate"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                            title={loan.note}
                        >
                            {loan.note}
                        </div>
                    ) : (
                        <span
                            className="text-sm italic"
                            style={{
                                color: "var(--color-text-tertiary)",
                            }}
                        >
                            -
                        </span>
                    );
                },
                size: 200,
            },

            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const loan = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLoan(loan)}
                                className="px-2"
                                title="Lihat Detail"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            {loan.status === "ongoing" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditLoan(loan)}
                                    className="px-2"
                                    title="Edit"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    <Edit className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
                size: 100,
            },
        ],
        [],
    );

    return (
        <div className="space-y-6">
            {/* Main Table Card */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <TrendingUp
                                className="w-5 h-5"
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
                                Daftar Pinjaman ({employee.loansCount || 0})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Kelola pinjaman untuk {employee.name}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleAddLoan}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Tambah Pinjaman
                    </Button>
                </div>

                {/* Table */}
                <Table
                    data={employee.loans || []}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada pinjaman untuk karyawan ini. Tambahkan pinjaman pertama untuk mulai mengelola hutang karyawan."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default EmployeeLoansIndex;
