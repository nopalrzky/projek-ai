import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Package, Plus, Edit, Trash2, Calendar, Layers } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { ServicePackage } from "@/types";
import DeleteServicePackageModal from "./Partials/DeleteServicePackageModal";
import { outletService } from "@/Services/outlet.service";
import { OutletServicePackageIndexProps } from "./types";
import { router } from "@inertiajs/react";

const OutletServicePackagesIndex: React.FC<OutletServicePackageIndexProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        servicePackage?: ServicePackage;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateServicePackage = () => {
        outletService.goToCreateServicePackage(outlet.id);
    };

    const handleEditServicePackage = (packageId: number) => {
        outletService.goToEditServicePackage(outlet.id, packageId);
    };

    const handleDeleteClick = useCallback((servicePackage: ServicePackage) => {
        setDeleteModal({ show: true, servicePackage });
    }, []);

    const handleConfirmDelete = useCallback(
        async (servicePackage: ServicePackage) => {
            try {
                setIsDeleting(true);

                router.delete(
                    route("outlets.service-packages.destroy", [
                        outlet.id,
                        servicePackage.id,
                    ]),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setDeleteModal({ show: false });
                            setIsDeleting(false);
                        },
                        onError: (errors) => {
                            console.error(
                                "Delete service package error:",
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
                console.error("Delete service package error:", error);
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

    const columns: ColumnDef<ServicePackage>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nama Paket",
                cell: ({ row }) => {
                    const pkg = row.original;
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {pkg.name}
                                </div>
                                {pkg.servicePackageItemsCount !== undefined &&
                                    pkg.servicePackageItemsCount > 0 && (
                                        <Badge variant="info" size="sm">
                                            <Layers className="w-3 h-3 mr-1" />
                                            {pkg.servicePackageItemsCount} item
                                        </Badge>
                                    )}
                            </div>
                            {pkg.description && (
                                <div
                                    className="text-sm line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {pkg.description}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 300,
            },
            {
                accessorKey: "price",
                header: "Harga",
                cell: ({ row }) => {
                    const pkg = row.original;
                    return (
                        <div className="flex flex-col">
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {formatCurrency(pkg.price || 0)}
                            </span>
                            {pkg.validityDays && (
                                <span
                                    className="text-xs mt-0.5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    berlaku {pkg.validityDays} hari
                                </span>
                            )}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "validityDays",
                header: "Masa Berlaku",
                cell: ({ row }) => {
                    const days = row.original.validityDays;
                    if (!days) {
                        return (
                            <span
                                className="text-sm italic"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                Tidak terbatas
                            </span>
                        );
                    }

                    const months = Math.floor(days / 30);
                    const remainingDays = days % 30;

                    return (
                        <div className="flex items-center gap-2">
                            <Calendar
                                className="w-4 h-4"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex flex-col">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {days} hari
                                </span>
                                {months > 0 && (
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        ≈ {months} bulan
                                        {remainingDays > 0
                                            ? ` ${remainingDays}h`
                                            : ""}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "customerSubscriptionsCount",
                header: "Langganan",
                cell: ({ row }) => {
                    const count = row.original.customerSubscriptionsCount || 0;
                    return (
                        <div className="flex items-center gap-2">
                            <div
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                    backgroundColor:
                                        count > 0
                                            ? "var(--color-success-100)"
                                            : "var(--color-surface-secondary)",
                                    color:
                                        count > 0
                                            ? "var(--color-success-700)"
                                            : "var(--color-text-tertiary)",
                                }}
                            >
                                {count}
                            </div>
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
                    const pkg = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditServicePackage(pkg.id)}
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(pkg)}
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
                                <Package
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
                                    Paket Deposit (
                                    {outlet.servicePackages?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola paket deposit berlangganan di outlet{" "}
                                    {outlet.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreateServicePackage}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Paket
                        </Button>
                    </div>

                    <Table
                        data={outlet.servicePackages || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada paket layanan yang terdaftar di outlet ini. Tambahkan paket pertama untuk mulai menawarkan layanan berlangganan kepada pelanggan."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <DeleteServicePackageModal
                isOpen={deleteModal.show}
                servicePackage={deleteModal.servicePackage}
                onClose={handleCloseDeleteModal}
                onConfirm={() => {
                    if (deleteModal.servicePackage) {
                        handleConfirmDelete(deleteModal.servicePackage);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

export default OutletServicePackagesIndex;
