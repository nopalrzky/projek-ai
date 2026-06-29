import React from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    Building2,
    Users,
    CreditCard,
    Calendar,
    Clock,
    FileText,
    Award,
    DollarSign,
    TrendingUp,
    ArrowRight,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { router } from "@inertiajs/react";
import { MembershipContractOverviewProps } from "../types";

const MembershipContractOverview: React.FC<MembershipContractOverviewProps> = ({
    membershipContract,
}) => {
    const getStatusVariant = (
        status: string,
    ): "success" | "warning" | "error" | "secondary" => {
        switch (status) {
            case "active":
                return "success";
            case "expired":
                return "error";
            case "replaced":
                return "warning";
            case "cancelled":
                return "secondary";
            default:
                return "secondary";
        }
    };

    const getStatusLabel = (status: string): string => {
        switch (status) {
            case "active":
                return "Aktif";
            case "expired":
                return "Kadaluarsa";
            case "replaced":
                return "Diganti";
            case "cancelled":
                return "Dibatalkan";
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3
                            className="text-xl font-semibold mb-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Informasi Kontrak
                        </h3>
                        <p style={{ color: "var(--color-text-secondary)" }}>
                            Detail lengkap tentang kontrak membership ini
                        </p>
                    </div>
                    <Badge
                        variant={getStatusVariant(membershipContract.status)}
                    >
                        {getStatusLabel(membershipContract.status)}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Users
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Pelanggan
                                </p>
                                <p
                                    className="text-base font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipContract.customer.name}
                                </p>
                                {membershipContract.customer.email && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {membershipContract.customer.email}
                                    </p>
                                )}
                                {membershipContract.customer.phone && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {membershipContract.customer.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Building2
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet
                                </p>
                                <p
                                    className="text-base font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipContract.outlet.name}
                                </p>
                                {membershipContract.outlet.code && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {membershipContract.outlet.code}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Award
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Paket Membership
                                </p>
                                <p
                                    className="text-base font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipContract.membershipPlan.name}
                                </p>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Level{" "}
                                    {membershipContract.membershipPlan.level}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Tanggal Mulai
                                </p>
                                <p
                                    className="text-base font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(membershipContract.startAt)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Tanggal Berakhir
                                </p>
                                <p
                                    className="text-base font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipContract.expiredAt
                                        ? formatDate(
                                              membershipContract.expiredAt,
                                          )
                                        : "Selamanya"}
                                </p>
                                {membershipContract.daysRemaining !== null && (
                                    <p
                                        className="text-sm"
                                        style={{
                                            color:
                                                membershipContract.daysRemaining &&
                                                membershipContract.daysRemaining >
                                                    0
                                                    ? "var(--color-success-600)"
                                                    : "var(--color-error-600)",
                                        }}
                                    >
                                        {membershipContract.daysRemaining &&
                                        membershipContract.daysRemaining > 0
                                            ? `${membershipContract.daysRemaining} hari tersisa`
                                            : "Sudah expired"}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <DollarSign
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Dibayar
                                </p>
                                <p
                                    className="text-base font-semibold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(
                                        membershipContract.totalPaid,
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Dibuat
                                </p>
                                <p
                                    className="text-base"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(membershipContract.createdAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {membershipContract.membershipPlan.description && (
                    <div
                        className="mt-6 pt-6 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <FileText
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Deskripsi Paket
                            </p>
                        </div>
                        <p
                            className="leading-relaxed"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {membershipContract.membershipPlan.description}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default MembershipContractOverview;
