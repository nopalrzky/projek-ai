import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, FolderOpen } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { Category } from "@/types";
import { CategoryIndexProps } from "./types";
import { createCategoryColumns } from "./columns";
import { createCategoryFilters } from "./filters";
import { categoryService } from "@/Services/category.service";
import DeleteCategoryModal from "./Partials/DeleteCategoryModal";

function CategoriesIndex({
    categories,
    filterOptions,
    filters: serverFilters,
    flash,
}: CategoryIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        category?: Category;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((category: Category) => {
        categoryService.goToView(category.id);
    }, []);

    const handleEdit = useCallback((category: Category) => {
        categoryService.goToEdit(category.id);
    }, []);

    const handleDelete = useCallback((category: Category) => {
        setDeleteModal({ show: true, category });
    }, []);

    const handleConfirmDelete = useCallback((category: Category) => {
        setIsDeleting(true);

        router.delete(route("categories.destroy", category.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete category error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const columns = useMemo(
        () => createCategoryColumns(handleView, handleEdit, handleDelete),
        [handleView, handleEdit, handleDelete],
    );

    const filters = useMemo(
        () => createCategoryFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        isActive:
            serverFilters?.isActive !== undefined ? serverFilters.isActive : "",
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Kategori" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Kategori"
                        subtitle={`Kelola kategori layanan laundry (${categories.meta.total} kategori)`}
                        icon={FolderOpen}
                        animate={true}
                        variant="default"
                    />

                    {flash?.success && (
                        <Alert
                            variant="success"
                            title="Berhasil"
                            description={flash.success}
                        />
                    )}

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    <DataView<Category>
                        route={route("categories.index")}
                        actionButton={{
                            label: "Tambah Kategori",
                            href: route("categories.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={categories.data}
                        meta={categories.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={15}
                        emptyTitle="Belum ada kategori"
                        emptyMessage="Mulai dengan menambahkan kategori pertama untuk mengorganisir layanan laundry Anda"
                        searchPlaceholder="Cari nama kategori atau deskripsi..."
                    />
                </div>
            </motion.div>

            <DeleteCategoryModal
                isOpen={deleteModal.show}
                category={deleteModal.category}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

CategoriesIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Kategori",
    searchable: true,
    breadcrumbs: [{ label: "Kategori", href: route("categories.index") }],
});

export default CategoriesIndex;
