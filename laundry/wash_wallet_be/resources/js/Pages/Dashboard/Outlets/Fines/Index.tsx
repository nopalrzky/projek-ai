import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    DollarSign,
    Plus,
    Edit,
    Trash2,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Fine } from "@/types";
import DeleteFineModal from "./Partials/DeleteFineModal";
import { OutletFinesProps } from "./types";
import outletService from "@/Services/outlet.service";
import { router } from "@inertiajs/react";

const OutletFinesIndex: React.FC<OutletFinesProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        fine?: Fine;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateFine = () => {
        outletService.goToCreateFine(outlet.id);
    };

    const handleEditFine = (fineId: number) => {
        outletService.goToEditFine(outlet.id, fineId);
    };

    const handleDeleteClick = useCallback((fine: Fine) => {
        setDeleteModal({ show: true, fine });
    }, []);

    const handleConfirmDelete = useCallback(
        async (fine: Fine) => {
            try {
                setIsDeleting(true);

                router.delete(
                    route("outlets.fines.destroy", [outlet.id, fine.id]),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setDeleteModal({ show: false });
                            setIsDeleting(false);
                        },
                        onError: (errors) => {
                            console.error("Delete fine error:", errors);
                            setIsDeleting(false);
                        },
                        onFinish: () => {
                            setIsDeleting(false);
                        },
                    },
                );
            } catch (error) {
                console.error("Delete fine error:", error);
                setIsDeleting(false);
            }
        },
        [outlet.id],
    );

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const columns: ColumnDef<Fine>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nama Denda",
                cell: ({ row }) => {
                    const fine = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {fine.name}
                            </div>
                            {fine.description && (
                                <div
                                    className="text-sm line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {fine.description}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 300,
            },
            {
                accessorKey: "amount",
                header: "Jumlah",
                cell: ({ row }) => {
                    const amount = row.original.amount;
                    return (
                        <div className="flex items-center gap-2">
                            <DollarSign
                                className="w-4 h-4"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--color-error-600)",
                                }}
                            >
                                {formatCurrency(amount)}
                            </span>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "createdAt",
                header: "Dibuat",
                cell: ({ row }) => {
                    const date = row.original.createdAt;
                    return (
                        <div
                            className="text-sm flex items-center gap-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            <Clock className="w-3 h-3" />
                            {formatDate(date)}
                        </div>
                    );
                },
                size: 150,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const fine = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditFine(fine.id)}
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(fine)}
                                className="px-2"
                                title="Hapus"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 160,
            },
        ],
        [outlet.id, handleDeleteClick],
    );

    return (
        <>
            <div className="space-y-6">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-error-100)",
                                }}
                            >
                                <DollarSign
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
                                    Daftar Denda ({outlet.fines?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola jenis denda karyawan di outlet{" "}
                                    {outlet.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreateFine}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Denda
                        </Button>
                    </div>

                    <Table
                        data={outlet.fines || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada denda yang terdaftar di outlet ini. Tambahkan denda pertama untuk mulai mengelola sanksi karyawan."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <DeleteFineModal
                isOpen={deleteModal.show}
                fine={deleteModal.fine}
                onClose={handleCloseDeleteModal}
                onConfirm={() => {
                    if (deleteModal.fine) {
                        handleConfirmDelete(deleteModal.fine);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

export default OutletFinesIndex;
