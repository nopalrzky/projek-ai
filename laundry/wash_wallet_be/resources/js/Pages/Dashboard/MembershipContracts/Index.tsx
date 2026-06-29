import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { Plus, CreditCard } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { MembershipContract } from "@/types";
import { MembershipContractIndexProps } from "./types";
import { createMembershipContractColumns } from "./columns";
import { createMembershipContractFilters } from "./filters";
import membershipContractService from "@/Services/membership_contract.service";
import DeleteMembershipContractModal from "./Partials/DeleteMembershipContractModal";

function MembershipContractsIndex({
    membershipContracts,
    filterOptions,
    filters: serverFilters,
    flash,
}: MembershipContractIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        membershipContract?: MembershipContract;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((contract: MembershipContract) => {
        membershipContractService.goToView(contract.id);
    }, []);

    const handleDelete = useCallback((contract: MembershipContract) => {
        setIsDeleting(true);

        router.delete(route("membership-contracts.destroy", contract.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete contract error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const columns = useMemo(
        () =>
            createMembershipContractColumns(handleView, (contract) => {
                setDeleteModal({
                    show: true,
                    membershipContract: contract,
                });
            }),
        [handleView],
    );

    const filters = useMemo(
        () =>
            createMembershipContractFilters(
                filterOptions.outlets,
                filterOptions.customers,
                filterOptions.membershipPlans,
            ),
        [
            filterOptions.outlets,
            filterOptions.customers,
            filterOptions.membershipPlans,
        ],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        customerId: serverFilters?.customerId,
        membershipPlanId: serverFilters?.membershipPlanId,
        status: serverFilters?.status,
        startDateRange: {
            from: serverFilters?.startDateFrom
                ? new Date(serverFilters.startDateFrom)
                : undefined,
            to: serverFilters?.startDateTo
                ? new Date(serverFilters.startDateTo)
                : undefined,
        },
        expiredDateRange: {
            from: serverFilters?.expiredDateFrom
                ? new Date(serverFilters.expiredDateFrom)
                : undefined,
            to: serverFilters?.expiredDateTo
                ? new Date(serverFilters.expiredDateTo)
                : undefined,
        },
        sortBy: serverFilters?.sortBy || "created_at",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Manajemen Kontrak Membership" />

            <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="mx-auto  space-y-6">
                    <PageHeader
                        title="Manajemen Kontrak Membership"
                        subtitle={`Kelola semua kontrak membership (${membershipContracts.meta.total} kontrak)`}
                        icon={CreditCard}
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

                    <DataView<MembershipContract>
                        route={route("membership-contracts.index")}
                        actionButton={{
                            label: "Tambah Kontrak",
                            href: route("membership-contracts.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={membershipContracts.data}
                        meta={membershipContracts.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada kontrak membership"
                        emptyMessage="Mulai dengan membuat kontrak membership pertama"
                        searchPlaceholder="Cari customer, plan, atau nomor kontrak..."
                    />
                </div>
            </motion.div>

            <DeleteMembershipContractModal
                isOpen={deleteModal.show}
                membershipContract={deleteModal.membershipContract}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModal({ show: false });
                    }
                }}
                onConfirm={() => {
                    if (deleteModal.membershipContract) {
                        handleDelete(deleteModal.membershipContract);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
}

MembershipContractsIndex.layout = withAuthenticatedLayout({
    title: "Kontrak Membership",
    searchable: true,
    breadcrumbs: [
        {
            label: "Kontrak Membership",
            href: route("membership-contracts.index"),
        },
    ],
});

export default MembershipContractsIndex;
