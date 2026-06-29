import { useState, useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, Zap } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import { Button } from "@/Components/Button";
import PageHeader from "@/Components/Page/PageHeader";
import { FeatureIndexProps } from "./types";
import { Feature } from "@/types";
import { createFeatureColumns } from "./columns";
import { createFeatureFilters } from "./filters";
import DeleteFeatureModal from "./Partials/DeleteFeatureModal";

function FeaturesIndex({
    features,
    filters: serverFilters,
    flash,
}: FeatureIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        feature?: Feature;
    }>({ show: false });

    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = useCallback((feature: Feature) => {
        router.get(route("features.edit", feature.id));
    }, []);

    const handleDelete = useCallback((feature: Feature) => {
        setIsDeleting(true);

        router.delete(route("features.destroy", feature.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const handleCreateClick = useCallback(() => {
        router.get(route("features.create"));
    }, []);

    const columns = useMemo(
        () =>
            createFeatureColumns(handleEdit, (feature) =>
                setDeleteModal({ show: true, feature }),
            ),
        [handleEdit],
    );

    const filters = useMemo(() => createFeatureFilters(), []);

    return (
        <>
            <Head title="Katalog Fitur" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Katalog Fitur"
                        subtitle={`Kelola daftar fitur dan pengaturan harga coin (${features.meta.total} fitur)`}
                        icon={Zap}
                        animate={true}
                        actions={
                            <Button
                                onClick={handleCreateClick}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Tambah Fitur
                            </Button>
                        }
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

                    <DataView<Feature>
                        route={route("features.index")}
                        data={features.data}
                        meta={features.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={{
                            search: serverFilters?.search || "",
                            isActive: serverFilters?.isActive,
                            sortBy: serverFilters?.sortBy || "sort_order",
                            sortDirection:
                                serverFilters?.sortDirection || "asc",
                            page: serverFilters?.page || 1,
                            perPage: serverFilters?.perPage || 15,
                        }}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        filterLayout="grid"
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada fitur"
                        emptyMessage="Daftar fitur sistem akan muncul di sini"
                        searchPlaceholder="Cari nama atau key fitur..."
                    />
                </div>
            </motion.div>

            <DeleteFeatureModal
                isOpen={deleteModal.show}
                feature={deleteModal.feature}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModal({ show: false });
                    }
                }}
                onConfirm={() => {
                    if (deleteModal.feature) {
                        handleDelete(deleteModal.feature);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
}

FeaturesIndex.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Fitur",
        searchable: true,
        breadcrumbs: [{ label: "Fitur", href: route("features.index") }],
    })(page);

export default FeaturesIndex;
