import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import PageStats from "@/Components/Page/PageStats";
import { Button } from "@/Components/Button";
import { Setting } from "@/types";
import { SettingIndexProps } from "./types";
import { createSettingColumns } from "./columns";
import { createSettingFilters } from "./filters";
import DeleteSettingModal from "./Partials/DeleteSettingModal";

const SettingsIndex = ({
    settings,
    filters: serverFilters,
    flash,
}: SettingIndexProps) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        setting?: Setting;
    }>({ show: false });

    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((setting: Setting) => {
        router.get(route("settings.show", setting.id));
    }, []);

    const handleEdit = useCallback((setting: Setting) => {
        router.get(route("settings.edit", setting.id));
    }, []);

    const handleDelete = useCallback((setting: Setting) => {
        setDeleteModal({ show: true, setting });
    }, []);

    const handleConfirmDelete = useCallback((setting: Setting) => {
        setIsDeleting(true);
        router.delete(route("settings.destroy", setting.id), {
            onSuccess: () => {
                setIsDeleting(false);
                setDeleteModal({ show: false });
            },
            onError: () => {
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
        () => createSettingColumns(handleView, handleEdit, handleDelete),
        [handleView, handleEdit, handleDelete],
    );

    const filters = useMemo(() => createSettingFilters(), []);

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Pengaturan Sistem" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <PageHeader
                            title="Pengaturan Sistem"
                            subtitle="Kelola pengaturan sistem yang berlaku untuk semua outlet"
                        />
                        <Button
                            href={route("settings.create")}
                            leftIcon={<Plus className="w-" />}
                            className="whitespace-nowrap"
                        >
                            Tambah Pengaturan
                        </Button>
                    </div>

                    {flash?.success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Alert
                                variant="success"
                                title="Berhasil"
                                description={flash.success}
                            />
                        </motion.div>
                    )}

                    {flash?.error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <Alert
                                variant="error"
                                title="Gagal"
                                description={flash.error}
                            />
                        </motion.div>
                    )}

                    <DataView
                        route={route("settings.index")}
                        data={settings.data}
                        meta={settings.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                    />
                </div>
            </motion.div>

            {/* Delete Modal */}
            <DeleteSettingModal
                isOpen={deleteModal.show}
                setting={deleteModal.setting}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
};

SettingsIndex.layout = withAuthenticatedLayout({
    title: "Pengaturan Sistem",
    breadcrumbs: [
        { label: "Pengaturan Sistem", href: route("settings.index") },
    ],
});

export default SettingsIndex;
