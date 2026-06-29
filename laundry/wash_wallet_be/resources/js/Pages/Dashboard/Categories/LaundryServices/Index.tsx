import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/Components/Table/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Package,
    Plus,
    Edit,
    Trash2,
    Eye,
    Upload,
    Download,
    FileSpreadsheet,
} from "lucide-react";
import { LaundryService } from "@/types";
import { categoryService } from "@/Services/category.service";
import DeleteLaundryServiceModal from "./Partials/DeleteLaundryServiceModal";
import { CategoryLaundryServicesIndexProps } from "./type";

const CategoryLaundryServicesIndex: React.FC<
    CategoryLaundryServicesIndexProps
> = ({ category, laundryServices = [], isLoading = false }) => {
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        service: LaundryService | null;
        isLoading: boolean;
    }>({
        isOpen: false,
        service: null,
        isLoading: false,
    });

    const handleCreate = () => {
        categoryService.goToCreateLaundryService(category.id);
    };

    const handleImport = () => {
        categoryService.goToImportLaundryServices(category.id);
    };

    const handleExport = () => {
        categoryService.exportLaundryServices(category.id);
    };

    const handleEdit = (categoryId: number, laundryServiceId: number) => {
        categoryService.goToEditLaundryService(categoryId, laundryServiceId);
    };

    const handleView = (serviceId: number) => {
        categoryService.goToViewLaundryService(serviceId);
    };

    const handleDelete = (service: LaundryService) => {
        setDeleteModal({
            isOpen: true,
            service: service,
            isLoading: false,
        });
    };

    const handleConfirmDelete = async (service: LaundryService) => {
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        try {
        } catch (error) {
            setDeleteModal((prev) => ({ ...prev, isLoading: false }));
        }
    };

    const handleCloseDeleteModal = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                service: null,
                isLoading: false,
            });
        }
    };

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
                                className="font-medium cursor-pointer hover:underline"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                                onClick={() => handleView(service.id)}
                            >
                                {service.name}
                            </div>
                            {service.description && (
                                <div
                                    className="text-sm line-clamp-1"
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
                accessorKey: "unit",
                header: "Satuan",
                cell: ({ row }) => {
                    const unit = row.original.unit;
                    return unit ? (
                        <Badge variant="secondary" size="sm">
                            {unit.symbol} - {unit.name}
                        </Badge>
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
                size: 150,
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    return (
                        <Badge
                            variant={
                                row.original.isActive ? "success" : "secondary"
                            }
                        >
                            {row.original.isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                    );
                },
                size: 100,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const service = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleView(service.id)}
                                className="px-2"
                                title="Lihat"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() =>
                                    handleEdit(category.id, service.id)
                                }
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(service)}
                                className="px-2"
                                title="Hapus"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 130,
            },
        ],
        [category.id],
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
                                    Daftar Layanan ({laundryServices.length})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola layanan dalam kategori{" "}
                                    {category.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {laundryServices.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleExport}
                                    leftIcon={<Download className="w-4 h-4" />}
                                    title="Export data layanan ke Excel"
                                >
                                    <span className="hidden sm:inline">
                                        Export
                                    </span>
                                </Button>
                            )}

                            <Button
                                variant="secondary"
                                onClick={handleImport}
                                leftIcon={<Upload className="w-4 h-4" />}
                                title="Import layanan dari Excel"
                            >
                                <span className="hidden sm:inline">Import</span>
                            </Button>

                            <Button
                                variant="primary"
                                onClick={handleCreate}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                <span className="hidden sm:inline">
                                    Tambah Layanan
                                </span>
                                <span className="sm:hidden">Tambah</span>
                            </Button>
                        </div>
                    </div>

                    {laundryServices.length === 0 && (
                        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-start gap-3">
                                <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                        💡 Import Data Layanan
                                    </h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                                        Belum ada layanan? Anda bisa menambahkan
                                        layanan secara massal menggunakan fitur
                                        import Excel.
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleImport}
                                        leftIcon={
                                            <Upload className="w-4 h-4" />
                                        }
                                        className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
                                    >
                                        Import Layanan Sekarang
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    <Table
                        data={laundryServices}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada layanan laundry dalam kategori ini. Tambahkan layanan pertama atau gunakan fitur import untuk menambahkan data secara massal."
                        pageSize={10}
                    />
                </Card>
            </div>

            {deleteModal.isOpen && deleteModal.service && (
                <DeleteLaundryServiceModal
                    isOpen={deleteModal.isOpen}
                    laundryService={deleteModal.service}
                    categoryName={category.name}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                    isLoading={deleteModal.isLoading}
                />
            )}
        </>
    );
};

export default CategoryLaundryServicesIndex;
