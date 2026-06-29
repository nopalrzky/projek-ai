import React, { useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    AlertCircle,
    Eye,
    Edit,
    Trash2,
    FileText,
    CheckCircle,
    Clock,
} from "lucide-react";
import { FineLog } from "@/types";
import { EmployeeFineLogsIndexProps } from "./types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { employeeService } from "@/Services/employee.service";

const EmployeeFineLogsIndex: React.FC<EmployeeFineLogsIndexProps> = ({
    employee,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        fineLog?: FineLog;
        isLoading: boolean;
    }>({
        isOpen: false,
        fineLog: undefined,
        isLoading: false,
    });

    const handleView = (fineLog: FineLog) => {
        employeeService.goToViewFineLog(employee.id, fineLog.id);
    };

    const handleEdit = (fineLog: FineLog) => {
        if (!fineLog.canBeUpdated) {
            alert("Denda yang sudah lunas tidak dapat diedit");
            return;
        }
        employeeService.goToEditFineLog(employee.id, fineLog.id);
    };

    const handleDelete = (fineLog: FineLog) => {
        if (!fineLog.canBeDeleted) {
            alert("Tidak dapat menghapus denda yang sudah dibayar");
            return;
        }

        setDeleteModal({
            isOpen: true,
            fineLog,
            isLoading: false,
        });
    };

    const handleConfirmDelete = (fineLog: FineLog) => {
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(route("fine-logs.destroy", fineLog.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({
                    isOpen: false,
                    fineLog: undefined,
                    isLoading: false,
                });
            },
            onError: () => {
                setDeleteModal((prev) => ({ ...prev, isLoading: false }));
            },
        });
    };

    const handleCloseDeleteModal = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                fineLog: undefined,
                isLoading: false,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "unpaid":
                return {
                    variant: "warning" as const,
                    label: "Belum Dibayar",
                    icon: Clock,
                };
            case "paid":
                return {
                    variant: "success" as const,
                    label: "Lunas",
                    icon: CheckCircle,
                };
            case "cancelled":
                return {
                    variant: "error" as const,
                    label: "Dibatalkan",
                    icon: AlertCircle,
                };
            default:
                return {
                    variant: "default" as const,
                    label: status,
                    icon: AlertCircle,
                };
        }
    };

    const columns: ColumnDef<FineLog>[] = useMemo(
        () => [
            {
                accessorKey: "fine",
                header: "Jenis Denda",
                cell: ({ row }) => {
                    const fineLog = row.original;
                    const fine = fineLog.fine;
                    const statusBadge = getStatusBadge(fineLog.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                        <div className="flex items-center gap-3">
                            <div className="space-y-1">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {fine?.name || "Unknown"}
                                </div>
                                <Badge variant={statusBadge.variant} size="sm">
                                    {statusBadge.label}
                                </Badge>
                            </div>
                        </div>
                    );
                },
                size: 250,
            },

            {
                accessorKey: "date",
                header: "Tanggal",
                cell: ({ row }) => {
                    const fineLog = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {formatDate(fineLog.date, "DD MMMM YYYY")}
                            </span>
                        </div>
                    );
                },
                size: 150,
            },

            {
                accessorKey: "amount",
                header: "Jumlah",
                cell: ({ row }) => {
                    const fineLog = row.original;

                    return (
                        <div
                            className="font-semibold text-lg"
                            style={{
                                color: "var(--color-error-600)",
                            }}
                        >
                            {formatCurrency(fineLog.amount)}
                        </div>
                    );
                },
                size: 150,
            },

            {
                accessorKey: "reason",
                header: "Alasan",
                cell: ({ row }) => {
                    const fineLog = row.original;

                    return fineLog.reason ? (
                        <div
                            className="text-sm max-w-xs truncate"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                            title={fineLog.reason}
                        >
                            {fineLog.reason}
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
                accessorKey: "payroll",
                header: "Dipotong Dari",
                cell: ({ row }) => {
                    const fineLog = row.original;

                    return fineLog.payroll ? (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <FileText
                                    className="w-3 h-3"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {fineLog.payroll.periodLabel}
                                </span>
                            </div>
                            <span
                                className="text-xs"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                Gaji bulan{" "}
                                {formatDate(
                                    fineLog.payroll.startDate,
                                    "DD MMMM YYYY",
                                )}
                            </span>
                        </div>
                    ) : (
                        <span
                            className="text-sm italic"
                            style={{
                                color: "var(--color-text-tertiary)",
                            }}
                        >
                            Belum dipotong
                        </span>
                    );
                },
                size: 180,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const fineLog = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(fineLog)}
                                className="px-2"
                                title="Lihat detail"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(fineLog)}
                                className="px-2"
                                title={
                                    !fineLog.canBeUpdated
                                        ? "Denda yang sudah lunas tidak dapat diedit"
                                        : "Edit denda"
                                }
                                disabled={!fineLog.canBeUpdated}
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(fineLog)}
                                className="px-2"
                                title={
                                    !fineLog.canBeDeleted
                                        ? "Tidak dapat menghapus denda yang sudah dibayar"
                                        : "Hapus denda"
                                }
                                disabled={!fineLog.canBeDeleted}
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 140,
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
                                backgroundColor: "var(--color-error-100)",
                            }}
                        >
                            <AlertCircle
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
                                Daftar Denda ({employee.fineLogsCount || 0})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Riwayat denda untuk {employee.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    data={employee.fineLogs || []}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada catatan denda untuk karyawan ini."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />
            </Card>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && deleteModal.fineLog && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={handleCloseDeleteModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Konfirmasi Hapus Denda
                        </h3>
                        <div className="mb-6 space-y-3">
                            <p style={{ color: "var(--color-text-secondary)" }}>
                                Apakah Anda yakin ingin menghapus denda berikut?
                            </p>
                            <div
                                className="p-4 rounded-lg border"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Jenis Denda:
                                        </span>
                                        <span
                                            className="font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {deleteModal.fineLog.fine?.name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Jumlah:
                                        </span>
                                        <span
                                            className="font-semibold"
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                        >
                                            {formatCurrency(
                                                deleteModal.fineLog.amount,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Tanggal:
                                        </span>
                                        <span
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {formatDate(
                                                deleteModal.fineLog.date,
                                                "DD MMMM YYYY",
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCloseDeleteModal}
                                disabled={deleteModal.isLoading}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() =>
                                    handleConfirmDelete(deleteModal.fineLog!)
                                }
                                disabled={deleteModal.isLoading}
                                loading={deleteModal.isLoading}
                            >
                                {deleteModal.isLoading
                                    ? "Menghapus..."
                                    : "Hapus"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeFineLogsIndex;
