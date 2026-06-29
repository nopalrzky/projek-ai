import React from "react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Card } from "@/Components/Card";
import { Crown, Edit, Trash2, ArrowLeft } from "lucide-react";
import { router } from "@inertiajs/react";
import { MembershipPlanPageHeaderProps } from "../types";
import { formatCurrency } from "@/lib/utils";

const MembershipPlanPageHeader: React.FC<MembershipPlanPageHeaderProps> = ({
    membershipPlan,

    isLoading = false,
}) => {
    return (
        <Card variant="elevated" className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left Section: Info */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Crown
                                className="w-8 h-8"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>

                        {/* Title & Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <h1
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipPlan.name}
                                </h1>
                                <Badge
                                    variant={
                                        membershipPlan.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {membershipPlan.isActive
                                        ? "Aktif"
                                        : "Nonaktif"}
                                </Badge>
                            </div>

                            {membershipPlan.description && (
                                <p
                                    className="text-sm mb-4"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {membershipPlan.description}
                                </p>
                            )}

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Harga
                                    </p>
                                    <p
                                        className="text-lg font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatCurrency(membershipPlan.price)}
                                    </p>
                                </div>

                                <div>
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Durasi
                                    </p>
                                    <p
                                        className="text-lg font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {membershipPlan.durationDays
                                            ? `${membershipPlan.durationDays} hari`
                                            : "Unlimited"}
                                    </p>
                                </div>

                                <div>
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Diskon
                                    </p>
                                    <p
                                        className="text-lg font-bold"
                                        style={{
                                            color: "var(--color-success-600)",
                                        }}
                                    >
                                        {membershipPlan.discountPercentage}%
                                    </p>
                                </div>

                                <div>
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Total Member
                                    </p>
                                    <p
                                        className="text-lg font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {membershipPlan.membershipContractsCount ||
                                            0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex flex-col gap-2 lg:items-end">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.visit(route("membership-plans.index"))
                            }
                            disabled={isLoading}
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                            Kembali
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default MembershipPlanPageHeader;
