import { useState, useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, DollarSign } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import Alert from "@/Components/Alert";
import { Salary } from "@/types";
import { SalaryIndexProps } from "./types";
import { createSalaryColumns } from "./columns";
import { createSalaryFilters } from "./filters";
import salaryService from "@/Services/salary.service";
import PageHeader from "@/Components/Page/PageHeader";
import DeleteModal from "./Partials/DeleteSalaryModal";

function SalariesIndex({
    salaries,
    filters: serverFilters,
    flash,
}: SalaryIndexProps) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [salaryToDelete, setSalaryToDelete] = useState<Salary | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((salary: Salary) => {
        salaryService.goToView(salary.id);
    }, []);

    const handleEdit = useCallback((salary: Salary) => {
        salaryService.goToEdit(salary.id);
    }, []);

    const handleDelete = useCallback(() => {
        if (!salaryToDelete) return;

        router.delete(route("salaries.destroy", salaryToDelete.id), {
            preserveScroll: true,
            onStart: () => setIsDeleting(true),
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setSalaryToDelete(null);
            },
            onError: (errors) => {
                console.error("Delete salary error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, [salaryToDelete]);

    const handleOpenDeleteModal = useCallback((salary: Salary) => {
        setSalaryToDelete(salary);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (isDeleting) return;

        setIsDeleteModalOpen(false);
        setSalaryToDelete(null);
    }, [isDeleting]);

    const columns = useMemo(
        () =>
            createSalaryColumns(handleView, handleEdit, handleOpenDeleteModal),
        [handleView, handleEdit, handleOpenDeleteModal],
    );

    const filters = useMemo(() => createSalaryFilters(), []);

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        type: serverFilters?.type,
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: salaries.meta.currentPage || 1,
        perPage: salaries.meta.perPage || 15,
    };

    return (
        <>
            <Head title="Komponen Gaji" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Komponen Gaji"
                        subtitle={`Kelola komponen gaji karyawan (${salaries.meta.total} komponen)`}
                        icon={DollarSign}
                        animate={true}
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

                    <DataView<Salary>
                        route={route("salaries.index")}
                        actionButton={{
                            label: "Tambah Komponen Gaji",
                            href: route("salaries.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={salaries.data}
                        meta={salaries.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={
                            serverFilters?.perPage ||
                            salaries.meta.perPage ||
                            15
                        }
                        emptyTitle="Belum ada komponen gaji"
                        emptyMessage="Mulai dengan menambahkan komponen gaji pertama Anda"
                        searchPlaceholder="Cari nama atau deskripsi komponen gaji..."
                    />
                </div>
            </motion.div>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                salary={salaryToDelete || undefined}
                onClose={handleCloseDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

SalariesIndex.layout = withAuthenticatedLayout({
    title: "Komponen Gaji",
    searchable: true,
    breadcrumbs: [{ label: "Komponen Gaji", href: route("salaries.index") }],
});

export default SalariesIndex;
