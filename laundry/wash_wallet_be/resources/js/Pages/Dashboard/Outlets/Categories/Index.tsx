import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Layers,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Category } from "@/types/category";
import DeleteCategoryModal from "./Partials/DeleteCategoryModal";
import { outletService } from "@/Services/outlet.service";
import { OutletCategoryIndexProps } from "./types";
import { router } from "@inertiajs/react";

const OutletCategoriesIndex: React.FC<OutletCategoryIndexProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        category?: Category;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateCategory = () => {
        outletService.goToCreateCategory(outlet.id);
    };

    const handleEditCategory = (categoryId: number) => {
        outletService.goToEditCategory(outlet.id, categoryId);
    };

    const handleDeleteClick = useCallback((category: Category) => {
        setDeleteModal({ show: true, category });
    }, []);

    const handleConfirmDelete = useCallback(
        async (category: Category) => {
            try {
                setIsDeleting(true);

                router.delete(
                    route("outlets.categories.destroy", [
                        outlet.id,
                        category.id,
                    ]),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setDeleteModal({ show: false });
                            setIsDeleting(false);
                        },
                        onError: (errors) => {
                            console.error("Delete category error:", errors);
                            setIsDeleting(false);
                        },
                        onFinish: () => {
                            setIsDeleting(false);
                        },
                    },
                );
            } catch (error) {
                console.error("Delete category error:", error);
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

    const columns: ColumnDef<Category>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nama Kategori",
                cell: ({ row }) => {
                    const category = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {category.name}
                            </div>
                            {category.description && (
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {category.description}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 500,
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
                                    <CheckCircle className="w-3 h-3" />
                                ) : (
                                    <XCircle className="w-3 h-3" />
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
                    const category = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditCategory(category.id)}
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(category)}
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
                                    backgroundColor: "var(--color-warning-100)",
                                }}
                            >
                                <Layers
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
                                    Daftar Kategori (
                                    {outlet.categories?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola kategori produk di outlet{" "}
                                    {outlet.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreateCategory}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Kategori
                        </Button>
                    </div>

                    <Table
                        data={outlet.categories || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada kategori yang terdaftar di outlet ini. Tambahkan kategori pertama untuk mulai mengorganisir produk."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <DeleteCategoryModal
                isOpen={deleteModal.show}
                category={deleteModal.category}
                onClose={handleCloseDeleteModal}
                onConfirm={() => {
                    if (deleteModal.category) {
                        handleConfirmDelete(deleteModal.category);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

export default OutletCategoriesIndex;
