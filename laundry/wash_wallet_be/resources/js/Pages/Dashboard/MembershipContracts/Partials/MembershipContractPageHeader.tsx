import React from "react";
import { motion } from "framer-motion";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { router } from "@inertiajs/react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MembershipContractPageHeaderProps } from "../types";

const MembershipContractPageHeader: React.FC<
    MembershipContractPageHeaderProps
> = ({ membershipContract, isLoading = false }) => {
    const handleBack = () => {
        router.visit(route("membership-contracts.index"));
    };

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
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <CreditCard
                                className="w-8 h-8"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h1
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipContract.membershipPlan.name}
                                </h1>
                                <Badge
                                    variant={getStatusVariant(
                                        membershipContract.status,
                                    )}
                                >
                                    {getStatusLabel(membershipContract.status)}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-sm flex-wrap">
                                <span
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {membershipContract.customer.name}
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    •
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {membershipContract.outlet.name}
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    •
                                </span>
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {formatCurrency(
                                        membershipContract.totalPaid,
                                    )}
                                </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2 text-sm flex-wrap">
                                <span
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {formatDate(membershipContract.startAt)}
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    -
                                </span>
                                <span
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {membershipContract.expiredAt
                                        ? formatDate(
                                              membershipContract.expiredAt,
                                          )
                                        : "Selamanya"}
                                </span>
                                {membershipContract.daysRemaining !== null && (
                                    <>
                                        <span
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            •
                                        </span>
                                        <span
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
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                        <Button
                            variant="outline"
                            size="md"
                            onClick={handleBack}
                            leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                            Kembali
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default MembershipContractPageHeader;
