import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Shirt, Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LaundryService } from "@/types";
import DeleteLaundryServiceModal from "./Partials/DeleteLaundryServiceModal";
import { outletService } from "@/Services/outlet.service";
import { OutletLaundryServiceIndexProps } from "./types";
import { router } from "@inertiajs/react";

const OutletLaundryServicesIndex: React.FC<OutletLaundryServiceIndexProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        laundryService?: LaundryService;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateLaundryService = () => {
        outletService.goToCreateLaundryService(outlet.id);
    };

    const handleEditLaundryService = (laundryServiceId: number) => {
        outletService.goToEditLaundryService(outlet.id, laundryServiceId);
    };

    const handleDeleteClick = useCallback((laundryService: LaundryService) => {
        setDeleteModal({ show: true, laundryService });
    }, []);

    const handleConfirmDelete = useCallback(
        async (laundryService: LaundryService) => {
            try {
                setIsDeleting(true);

                router.delete(
                    route("outlets.laundry-services.destroy", [
                        outlet.id,
                        laundryService.id,
                    ]),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setDeleteModal({ show: false });
                            setIsDeleting(false);
                        },
                        onError: (errors) => {
                            console.error(
                                "Delete laundry service error:",
                                errors,
                            );
                            setIsDeleting(false);
                        },
                        onFinish: () => {
                            setIsDeleting(false);
                        },
                    },
                );
            } catch (error) {
                console.error("Delete laundry service error:", error);
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

    const columns: ColumnDef<LaundryService>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Layanan",
                cell: ({ row }) => {
                    const service = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {service.name}
                            </div>
                            {service.description && (
                                <div
                                    className="text-sm line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {service.description}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 250,
            },
            {
                accessorKey: "category",
                header: "Kategori",
                cell: ({ row }) => {
                    const service = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {service.category?.name || "N/A"}
                            </span>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "unit",
                header: "Unit",
                cell: ({ row }) => {
                    const service = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {service.unit?.name || "N/A"}
                            </span>
                            {service.unit?.symbol && (
                                <Badge variant="secondary" size="sm">
                                    {service.unit.symbol}
                                </Badge>
                            )}
                        </div>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "price",
                header: "Harga",
                cell: ({ row }) => {
                    const service = row.original;
                    return (
                        <div className="flex flex-col">
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {formatCurrency(service.price || 0)}
                            </span>
                            {service.unit?.symbol && (
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    per {service.unit.symbol}
                                </span>
                            )}
                        </div>
                    );
                },
                size: 140,
            },
            {
                accessorKey: "durationHours",
                header: "Durasi",
                cell: ({ row }) => {
                    const service = row.original;
                    const hours = service.durationHours || 24;
                    const days = Math.floor(hours / 24);
                    const remainingHours = hours % 24;

                    return (
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {hours} jam
                                </span>
                                {days > 0 && (
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        ≈ {days} hari
                                        {remainingHours > 0
                                            ? ` ${remainingHours}j`
                                            : ""}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "minQuantity",
                header: "Min. Qty",
                cell: ({ row }) => {
                    const service = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {service.minQuantity || 1}{" "}
                                {service.unit?.symbol || ""}
                            </span>
                        </div>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.original.isActive;

                    return (
                        <Badge variant={isActive ? "success" : "warning"}>
                            <div className="flex items-center gap-1">
                                <span>{isActive ? "Aktif" : "Nonaktif"}</span>
                            </div>
                        </Badge>
                    );
                },
                size: 120,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const service = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() =>
                                    handleEditLaundryService(service.id)
                                }
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(service)}
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
                                <Shirt
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
                                    Daftar Layanan Laundry (
                                    {outlet.laundryServices?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola layanan laundry di outlet{" "}
                                    {outlet.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreateLaundryService}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Layanan
                        </Button>
                    </div>

                    <Table
                        data={outlet.laundryServices || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada layanan laundry yang terdaftar di outlet ini. Tambahkan layanan pertama untuk mulai melayani pelanggan."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <DeleteLaundryServiceModal
                isOpen={deleteModal.show}
                laundryService={deleteModal.laundryService}
                onClose={handleCloseDeleteModal}
                onConfirm={() => {
                    if (deleteModal.laundryService) {
                        handleConfirmDelete(deleteModal.laundryService);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

export default OutletLaundryServicesIndex;
