import React from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft, Wallet, Building2, Edit, Trash2 } from "lucide-react";
import PageHeader from "@/Components/Page/PageHeader";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { topupService } from "@/Services/topup.service";
import { TopupPageHeaderProps } from "../types";

const TopupPageHeader: React.FC<TopupPageHeaderProps> = ({ topup }) => {
    const handleEdit = () => {
        router.visit(route("topups.edit", topup.id));
    };

    const handleDelete = () => {
        if (
            confirm(
                "Apakah Anda yakin ingin menghapus topup ini? Tindakan ini tidak dapat dibatalkan.",
            )
        ) {
            router.delete(route("topups.destroy", topup.id), {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit(route("topups.index"));
                },
            });
        }
    };

    const getStatusBadge = () => {
        const statusConfig = {
            pending: { variant: "warning" as const, label: "Pending" },
            success: { variant: "success" as const, label: "Success" },
            failed: { variant: "error" as const, label: "Failed" },
        };

        const config = statusConfig[
            topup.status as keyof typeof statusConfig
        ] || {
            variant: "default" as const,
            label: topup.status,
        };

        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getPaymentStatusBadge = () => {
        const statusConfig = {
            pending: { variant: "warning" as const, label: "Belum Dibayar" },
            paid: { variant: "success" as const, label: "Sudah Dibayar" },
            failed: { variant: "error" as const, label: "Gagal" },
            expired: { variant: "default" as const, label: "Kadaluarsa" },
        };

        const config = statusConfig[
            topup.paymentStatus as keyof typeof statusConfig
        ] || {
            variant: "default" as const,
            label: topup.paymentStatus,
        };

        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const actions = (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                onClick={() => topupService.goToIndex()}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
                Kembali
            </Button>

            {topup.status === "pending" && (
                <>
                    <Button
                        variant="outline"
                        onClick={handleEdit}
                        leftIcon={<Edit className="w-4 h-4" />}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        leftIcon={<Trash2 className="w-4 h-4" />}
                        className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                    >
                        Hapus
                    </Button>
                </>
            )}
        </div>
    );

    const icon = topup.isMasterTopup ? Wallet : Building2;

    return (
        <PageHeader
            icon={icon}
            title={topup.formattedAmountMoney}
            subtitle={
                <div className="flex items-center gap-3 mt-2">
                    <Badge variant={topup.isMasterTopup ? "primary" : "info"}>
                        {topup.topupTypeLabel}
                    </Badge>
                    {getStatusBadge()}
                    {getPaymentStatusBadge()}
                    {topup.outlet && (
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {topup.outlet.name}
                        </span>
                    )}
                </div>
            }
            actions={actions}
        />
    );
};

export default TopupPageHeader;
