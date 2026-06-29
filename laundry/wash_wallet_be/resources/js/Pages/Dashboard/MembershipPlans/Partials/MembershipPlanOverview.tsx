import React from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    Crown,
    Calendar,
    DollarSign,
    Percent,
    Users,
    Info,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MembershipPlanOverviewProps } from "../types";

const MembershipPlanOverview: React.FC<MembershipPlanOverviewProps> = ({
    membershipPlan,
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Info
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Informasi Paket
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Crown
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Nama Paket
                                </p>
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipPlan.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <DollarSign
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Harga
                                </p>
                                <p
                                    className="text-lg font-bold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(membershipPlan.price)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Durasi
                                </p>
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipPlan.durationDays
                                        ? `${membershipPlan.durationDays} hari`
                                        : "Unlimited"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Percent
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Diskon
                                </p>
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {membershipPlan.discountPercentage}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Users
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Member
                                </p>
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipPlan.membershipContractsCount ||
                                        0}{" "}
                                    Member
                                </p>
                            </div>
                        </div>

                        {membershipPlan.description && (
                            <div
                                className="pt-4 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <p
                                    className="text-sm font-medium mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Deskripsi
                                </p>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {membershipPlan.description}
                                </p>
                            </div>
                        )}

                        <div
                            className="flex items-center justify-between pt-4 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Status:
                            </span>
                            <Badge
                                variant={
                                    membershipPlan.isActive
                                        ? "success"
                                        : "secondary"
                                }
                            >
                                {membershipPlan.isActive ? "Aktif" : "Nonaktif"}
                            </Badge>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <Calendar
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            />
                        </div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Statistik Member
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-success-100)",
                                    }}
                                >
                                    <CheckCircle2
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-success-600)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Member Aktif
                                    </p>
                                    <p
                                        className="text-xl font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {membershipPlan.activeMembershipContractsCount ||
                                            0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-100)",
                                    }}
                                >
                                    <Users
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Total Member
                                    </p>
                                    <p
                                        className="text-xl font-bold"
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

                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-warning-100)",
                                    }}
                                >
                                    <DollarSign
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-warning-600)",
                                        }}
                                    />
                                </div>
                                <div>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Harga Paket
                                    </p>
                                    <p
                                        className="text-xl font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatCurrency(membershipPlan.price)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor: membershipPlan.isActive
                                            ? "var(--color-success-100)"
                                            : "var(--color-error-100)",
                                    }}
                                >
                                    {membershipPlan.isActive ? (
                                        <CheckCircle2
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-success-600)",
                                            }}
                                        />
                                    ) : (
                                        <XCircle
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Status Paket
                                    </p>
                                    <p
                                        className="text-lg font-bold"
                                        style={{
                                            color: membershipPlan.isActive
                                                ? "var(--color-success-600)"
                                                : "var(--color-error-600)",
                                        }}
                                    >
                                        {membershipPlan.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className="pt-4 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div className="flex items-center gap-3 text-xs">
                            <Calendar
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <span
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Dibuat: {formatDate(membershipPlan.createdAt)}
                            </span>
                            {membershipPlan.updatedAt !==
                                membershipPlan.createdAt && (
                                <>
                                    <span
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        •
                                    </span>
                                    <span
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Diperbarui:{" "}
                                        {formatDate(membershipPlan.updatedAt)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {!membershipPlan.isActive && (
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-warning-50)",
                        borderColor: "var(--color-warning-200)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <XCircle
                                className="w-4 h-4"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h4
                                className="text-sm font-semibold mb-1"
                                style={{
                                    color: "var(--color-warning-700)",
                                }}
                            >
                                Paket Membership Tidak Aktif
                            </h4>
                            <p
                                className="text-xs"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            >
                                Paket ini saat ini tidak aktif. Member baru
                                tidak dapat mendaftar paket ini sampai
                                diaktifkan kembali.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipPlanOverview;
