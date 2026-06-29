import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, UserPlus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import PageStats from "@/Components/Page/PageStats";
import { Employee } from "@/types";
import { EmployeeIndexProps } from "./types";
import { createEmployeeColumns } from "./columns";
import { createEmployeeFilters } from "./filters";
import DeleteEmployeeModal from "./Partials/DeleteEmployeeModal";
import employeeService from "@/Services/employee.service";

function EmployeesIndex({
    employees,
    stats,
    filterOptions,
    filters: serverFilters,
    flash,
}: EmployeeIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        employee?: Employee;
    }>({
        show: false,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleViewEmployee = useCallback((employee: Employee) => {
        employeeService.goToView(employee.id);
    }, []);

    const handleEditEmployee = useCallback((employee: Employee) => {
        employeeService.goToEdit(employee.id);
    }, []);

    const handleDeleteEmployee = useCallback((employee: Employee) => {
        setDeleteModal({ show: true, employee });
    }, []);

    const handleConfirmDelete = useCallback((employee: Employee) => {
        setIsDeleting(true);
        router.delete(route("employees.destroy", employee.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
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
        () =>
            createEmployeeColumns(
                handleViewEmployee,
                handleEditEmployee,
                handleDeleteEmployee,
            ),
        [handleViewEmployee, handleEditEmployee, handleDeleteEmployee],
    );

    const filters = useMemo(
        () =>
            createEmployeeFilters(
                filterOptions.outlets,
                filterOptions.positions,
            ),
        [filterOptions.outlets, filterOptions.positions],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        positionId: serverFilters?.positionId,
        gender: serverFilters?.gender,
        isActive: serverFilters?.isActive,
        sortBy: serverFilters?.sortBy || "createdAt",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Karyawan" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Manajemen Karyawan"
                        subtitle={`Kelola dan pantau seluruh data karyawan Anda (${employees.meta.total} karyawan)`}
                        icon={UserPlus}
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

                    <PageStats stats={stats} columns={3} animate={true} />

                    <DataView
                        route={route("employees.index")}
                        actionButton={{
                            label: "Tambah Karyawan",
                            href: route("employees.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={employees.data}
                        meta={employees.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={processedInitialFilters.perPage}
                        emptyTitle="Belum ada karyawan"
                        emptyMessage="Belum ada karyawan yang terdaftar dalam sistem"
                        searchPlaceholder="Cari nama, username, atau email karyawan..."
                    />
                </div>
            </motion.div>

            <DeleteEmployeeModal
                isOpen={deleteModal.show}
                employee={deleteModal.employee}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

EmployeesIndex.layout = withAuthenticatedLayout({
    title: "Manajemen Karyawan",
    searchable: true,
    breadcrumbs: [{ label: "Karyawan", href: route("employees.index") }],
});

export default EmployeesIndex;
