import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Fine, FineLog } from "@/types";
import { History, Eye, Download, Calendar, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import fineLogService from "@/Services/fine_log.service";

interface FineLogsIndexProps {
    fine: Fine;
    fineLogs?: FineLog[];
    isLoading?: boolean;
}

const FineLogsIndex: React.FC<FineLogsIndexProps> = ({
    fine,
    fineLogs = [],
    isLoading = false,
}) => {
    const handleView = (fineLog: FineLog) => {
        fineLogService.goToView(fineLog.id);
    };

    const handleDownload = (fineLog: FineLog) => {};

    const columns: ColumnDef<FineLog>[] = useMemo(
        () => [
            {
                accessorKey: "employee",
                header: "Karyawan",
                cell: ({ row }) => {
                    const log = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium flex items-center gap-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                <User className="w-4 h-4" />
                                {log.employee?.name || "-"}
                            </div>
                            {log.outlet && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {log.outlet.name}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 200,
            },
            {
                accessorKey: "date",
                header: "Tanggal",
                cell: ({ row }) => {
                    const log = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Calendar
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatDate(log.date)}
                            </span>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "amount",
                header: "Nominal",
                cell: ({ row }) => {
                    const log = row.original;
                    return (
                        <div className="text-right">
                            <span
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-error-600)" }}
                            >
                                {formatCurrency(log.amount)}
                            </span>
                        </div>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "reason",
                header: "Alasan",
                cell: ({ row }) => {
                    const log = row.original;
                    return (
                        <div
                            className="text-sm line-clamp-2"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {log.reason || "-"}
                        </div>
                    );
                },
                size: 250,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const log = row.original;
                    const statusConfig = {
                        paid: { variant: "success" as const, label: "Dibayar" },
                        unpaid: {
                            variant: "error" as const,
                            label: "Belum Dibayar",
                        },
                        cancelled: {
                            variant: "secondary" as const,
                            label: "Dibatalkan",
                        },
                    };

                    const config =
                        statusConfig[log.status] || statusConfig.unpaid;

                    return (
                        <Badge variant={config.variant} size="sm">
                            {config.label}
                        </Badge>
                    );
                },
                size: 120,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const log = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(log)}
                                className="px-2"
                                title="Lihat Detail"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>

                            {log.hasAttachment && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDownload(log)}
                                    className="px-2"
                                    title="Download Lampiran"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    <Download className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
                size: 120,
            },
        ],
        [],
    );

    const totals = useMemo(() => {
        const totalAmount = fineLogs.reduce(
            (sum, log) => sum + (log.amount || 0),
            0,
        );
        const paidAmount = fineLogs
            .filter((log) => log.status === "paid")
            .reduce((sum, log) => sum + (log.amount || 0), 0);
        const unpaidAmount = fineLogs
            .filter((log) => log.status === "unpaid")
            .reduce((sum, log) => sum + (log.amount || 0), 0);

        return {
            totalAmount,
            paidAmount,
            unpaidAmount,
        };
    }, [fineLogs]);

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <History
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-warning-600)",
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
                                Catatan Denda ({fineLogs.length})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Riwayat penerapan denda {fine.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    data={fineLogs}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    emptyMessage="Belum ada catatan denda untuk jenis denda ini."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />

                {/* Summary */}
                {fineLogs.length > 0 && (
                    <div
                        className="mt-6 pt-6 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Total Amount */}
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <p
                                    className="text-xs font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Nominal
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatCurrency(totals.totalAmount)}
                                </p>
                            </div>

                            {/* Paid Amount */}
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-50)",
                                }}
                            >
                                <p
                                    className="text-xs font-medium mb-1"
                                    style={{
                                        color: "var(--color-success-700)",
                                    }}
                                >
                                    Sudah Dibayar
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-success-700)",
                                    }}
                                >
                                    {formatCurrency(totals.paidAmount)}
                                </p>
                            </div>

                            {/* Unpaid Amount */}
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-error-50)",
                                }}
                            >
                                <p
                                    className="text-xs font-medium mb-1"
                                    style={{
                                        color: "var(--color-error-700)",
                                    }}
                                >
                                    Belum Dibayar
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-error-700)",
                                    }}
                                >
                                    {formatCurrency(totals.unpaidAmount)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default FineLogsIndex;
