import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Briefcase,
    Users,
    Plus,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Position } from "@/types";
import DeletePositionModal from "./Partials/DeletePositionModal";
import { OutletPositionIndexProps } from "./types";
import { outletService } from "@/Services/outlet.service";
import { router } from "@inertiajs/react";

const OutletPositionIndex: React.FC<OutletPositionIndexProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        position?: Position;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreatePosition = () => {
        outletService.goToCreatePosition(outlet.id);
    };

    const handleEditPosition = (positionId: number) => {
        outletService.goToEditPosition(outlet.id, positionId);
    };

    const handleViewPosition = (position: Position) => {
        outletService.goToShowPosition(outlet.id, position.id);
    };

    const handleDeleteClick = useCallback((position: Position) => {
        setDeleteModal({ show: true, position });
    }, []);

    const handleConfirmDelete = useCallback(
        async (position: Position) => {
            try {
                setIsDeleting(true);

                router.delete(
                    route("outlets.positions.destroy", [
                        outlet.id,
                        position.id,
                    ]),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setDeleteModal({ show: false });
                            setIsDeleting(false);
                        },
                        onError: (errors) => {
                            console.error("Delete position error:", errors);
                            setIsDeleting(false);
                        },
                        onFinish: () => {
                            setIsDeleting(false);
                        },
                    },
                );
            } catch (error) {
                console.error("Delete position error:", error);
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

    const columns: ColumnDef<Position>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nama Posisi",
                cell: ({ row }) => {
                    const position = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {position.name}
                            </div>
                            {position.description && (
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {position.description}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 300,
            },
            {
                accessorKey: "employeesCount",
                header: "Jumlah Karyawan",
                cell: ({ row }) => {
                    const count = row.original.employeesCount || 0;

                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Users
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <span
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {count} orang
                                </span>
                            </div>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.original.isActive;

                    return (
                        <Badge variant={isActive ? "success" : "warning"}>
                            <div className="flex items-center gap-1">
                                {isActive ? (
                                    <UserCheck className="w-3 h-3" />
                                ) : (
                                    <UserX className="w-3 h-3" />
                                )}
                                <span>{isActive ? "Aktif" : "Nonaktif"}</span>
                            </div>
                        </Badge>
                    );
                },
                size: 120,
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
                    const position = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditPosition(position.id)}
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(position)}
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
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Briefcase
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
                                    Daftar Posisi (
                                    {outlet.positions?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola posisi dan jabatan di outlet{" "}
                                    {outlet.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreatePosition}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Posisi
                        </Button>
                    </div>

                    <Table
                        data={outlet.positions || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada posisi yang terdaftar di outlet ini. Tambahkan posisi pertama untuk mulai mengelola struktur organisasi outlet."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <DeletePositionModal
                isOpen={deleteModal.show}
                position={deleteModal.position}
                onClose={handleCloseDeleteModal}
                onConfirm={() => {
                    if (deleteModal.position) {
                        handleConfirmDelete(deleteModal.position);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

export default OutletPositionIndex;
