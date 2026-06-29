import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { CreditCard, Plus, Edit, Trash2, Clock } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { MembershipPlan } from "@/types";
import DeleteMembershipPlanModal from "./Partials/DeleteMembershipPlanModal";
import { outletService } from "@/Services/outlet.service";
import { OutletMembershipPlanIndexProps } from "./types";
import { router } from "@inertiajs/react";

const OutletMembershipPlansIndex: React.FC<OutletMembershipPlanIndexProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        membershipPlan?: MembershipPlan;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateMembershipPlan = () => {
        outletService.goToCreateMembershipPlan(outlet.id);
    };

    const handleEditMembershipPlan = (planId: number) => {
        outletService.goToEditMembershipPlan(outlet.id, planId);
    };

    const handleDeleteClick = useCallback((membershipPlan: MembershipPlan) => {
        setDeleteModal({ show: true, membershipPlan });
    }, []);

    const handleConfirmDelete = useCallback(
        async (membershipPlan: MembershipPlan) => {
            try {
                setIsDeleting(true);

                router.delete(
                    route("outlets.membership-plans.destroy", [
                        outlet.id,
                        membershipPlan.id,
                    ]),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setDeleteModal({ show: false });
                            setIsDeleting(false);
                        },
                        onError: (errors) => {
                            console.error(
                                "Delete membership plan error:",
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
                console.error("Delete membership plan error:", error);
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

    const columns: ColumnDef<MembershipPlan>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nama Paket",
                cell: ({ row }) => {
                    const plan = row.original;
                    return (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {plan.name}
                                </div>
                                {plan.level && (
                                    <Badge variant="info" size="sm">
                                        Level {plan.level}
                                    </Badge>
                                )}
                            </div>
                            {plan.description && (
                                <div
                                    className="text-sm line-clamp-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {plan.description}
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
                    const plan = row.original;
                    return (
                        <div className="flex flex-col">
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {formatCurrency(plan.price || 0)}
                            </span>
                            {plan.durationDays && (
                                <span
                                    className="text-xs mt-0.5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    untuk {plan.durationDays} hari
                                </span>
                            )}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "durationDays",
                header: "Durasi",
                cell: ({ row }) => {
                    const days = row.original.durationDays;
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
                accessorKey: "discountPercentage",
                header: "Diskon",
                cell: ({ row }) => {
                    const discount = row.original.discountPercentage;
                    if (!discount) {
                        return (
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                -
                            </span>
                        );
                    }

                    return (
                        <div className="flex items-center gap-2">
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            >
                                {discount}%
                            </span>
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
                    const plan = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() =>
                                    handleEditMembershipPlan(plan.id)
                                }
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(plan)}
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
                                <CreditCard
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
                                    Paket Membership (
                                    {outlet.membershipPlans?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola paket membership di outlet{" "}
                                    {outlet.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreateMembershipPlan}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Paket
                        </Button>
                    </div>

                    <Table
                        data={outlet.membershipPlans || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada paket membership yang terdaftar di outlet ini. Tambahkan paket pertama untuk mulai menawarkan membership kepada pelanggan."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <DeleteMembershipPlanModal
                isOpen={deleteModal.show}
                membershipPlan={deleteModal.membershipPlan}
                onClose={handleCloseDeleteModal}
                onConfirm={() => {
                    if (deleteModal.membershipPlan) {
                        handleConfirmDelete(deleteModal.membershipPlan);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

export default OutletMembershipPlansIndex;
