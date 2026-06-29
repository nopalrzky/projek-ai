import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CreditCard, Plus } from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { DataView } from "@/Components/DataView";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { MembershipPlan } from "@/types";
import { MembershipPlanIndexProps } from "./types";
import { createMembershipPlanColumns } from "./columns";
import { createMembershipPlanFilters } from "./filters";
import DeleteMembershipPlanModal from "./Partials/DeleteMembershipPlanModal";
import { membershipPlanService } from "@/Services/membership_plan.service";

function MembershipPlansIndex({
    membershipPlans,
    filterOptions,
    filters: serverFilters,
    flash,
}: MembershipPlanIndexProps) {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        membershipPlan?: MembershipPlan;
    }>({
        show: false,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleView = useCallback((plan: MembershipPlan) => {
        membershipPlanService.goToView(plan.id);
    }, []);

    const handleEdit = useCallback((plan: MembershipPlan) => {
        membershipPlanService.goToEdit(plan.id);
    }, []);

    const handleDelete = useCallback((plan: MembershipPlan) => {
        setIsDeleting(true);

        router.delete(route("membership-plans.destroy", plan.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteModal({ show: false });
            },
            onError: (errors) => {
                console.error("Delete membership plan error:", errors);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    }, []);

    const columns = useMemo(
        () =>
            createMembershipPlanColumns(handleView, handleEdit, (plan) =>
                setDeleteModal({ show: true, membershipPlan: plan }),
            ),
        [handleView, handleEdit],
    );

    const filters = useMemo(
        () => createMembershipPlanFilters(filterOptions.outlets),
        [filterOptions.outlets],
    );

    const processedInitialFilters = {
        search: serverFilters?.search || "",
        outletId: serverFilters?.outletId,
        isActive: serverFilters?.isActive,
        minPrice: serverFilters?.minPrice,
        maxPrice: serverFilters?.maxPrice,
        minDurationDays: serverFilters?.minDurationDays,
        maxDurationDays: serverFilters?.maxDurationDays,
        minDiscountPercentage: serverFilters?.minDiscountPercentage,
        maxDiscountPercentage: serverFilters?.maxDiscountPercentage,
        sortBy: serverFilters?.sortBy || "createdAt",
        sortDirection: serverFilters?.sortDirection || "desc",
        page: serverFilters?.page || 1,
        perPage: serverFilters?.perPage || 15,
    };

    return (
        <>
            <Head title="Paket Membership" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Paket Membership"
                        subtitle={`Kelola paket langganan dan membership pelanggan (${membershipPlans.meta.total} paket)`}
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

                    <DataView<MembershipPlan>
                        route={route("membership-plans.index")}
                        actionButton={{
                            label: "Tambah Paket",
                            href: route("membership-plans.create"),
                            icon: <Plus className="w-4 h-4" />,
                            variant: "primary",
                        }}
                        data={membershipPlans.data}
                        meta={membershipPlans.meta}
                        columns={columns}
                        filters={filters}
                        initialFilters={processedInitialFilters}
                        enableSorting={true}
                        enablePagination={true}
                        enableFilters={true}
                        showFilterContainer={true}
                        useFilterBar={true}
                        pageSize={serverFilters?.perPage || 15}
                        emptyTitle="Belum ada paket membership"
                        emptyMessage="Mulai dengan menambahkan paket membership pertama Anda"
                        searchPlaceholder="Cari nama paket atau outlet..."
                    />
                </div>
            </motion.div>

            <DeleteMembershipPlanModal
                isOpen={deleteModal.show}
                membershipPlan={deleteModal.membershipPlan}
                onClose={() => {
                    if (!isDeleting) {
                        setDeleteModal({ show: false });
                    }
                }}
                onConfirm={() => {
                    if (deleteModal.membershipPlan) {
                        handleDelete(deleteModal.membershipPlan);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
}

MembershipPlansIndex.layout = withAuthenticatedLayout({
    title: "Paket Membership",
    searchable: true,
    breadcrumbs: [
        { label: "Paket Membership", href: route("membership-plans.index") },
    ],
});

export default MembershipPlansIndex;
