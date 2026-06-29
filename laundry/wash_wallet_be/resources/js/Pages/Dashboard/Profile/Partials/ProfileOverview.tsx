import React from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    Users,
    Coins,
    Calendar,
    Clock,
    CheckCircle2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { SetupChecklist } from "./SetupChecklist";
import { QuickActionsCard } from "./QuickActionsCard";
import type { ProfileOverview as ProfileOverviewType, ProfileSetupChecklist } from "../types";

interface ProfileOverviewProps {
    overview: ProfileOverviewType;
    setupChecklist: ProfileSetupChecklist;
}

const ProfileOverview: React.FC<ProfileOverviewProps> = ({ overview, setupChecklist }) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return "-";
        try {
            return formatDistanceToNow(new Date(dateString), {
                addSuffix: true,
                locale: id,
            });
        } catch {
            return "-";
        }
    };

    const stats = [
        {
            label: "Active Outlets",
            value: overview.activeOutlets,
            icon: CheckCircle2,
            colorClass: "text-success-600 dark:text-success-400",
            bgClass: "bg-success-50 dark:bg-success-950/20",
        },
        {
            label: "Total Referrals",
            value: overview.totalReferrals,
            icon: Users,
            colorClass: "text-info-600 dark:text-info-400",
            bgClass: "bg-info-50 dark:bg-info-950/20",
        },
        {
            label: "Total Commission",
            value: `${overview.totalCommission.toLocaleString("id-ID")} Koin`,
            icon: Coins,
            colorClass: "text-warning-600 dark:text-warning-400",
            bgClass: "bg-warning-50 dark:bg-warning-950/20",
        },
    ];

    return (
        <div className="space-y-6">
            <SetupChecklist checklist={setupChecklist} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <div className="p-6">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`p-3 rounded-lg ${stat.bgClass}`}
                                >
                                    <stat.icon
                                        className={`w-6 h-6 ${stat.colorClass}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-secondary">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-primary mt-1">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <QuickActionsCard checklist={setupChecklist} />

            <Card>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-primary mb-4">
                        Account Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-color">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-surface-muted">
                                    <Calendar className="w-4 h-4 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary">
                                        Member Since
                                    </p>
                                    <p className="text-sm text-secondary">
                                        {formatDate(overview.memberSince)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-color">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-surface-muted">
                                    <Clock className="w-4 h-4 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary">
                                        Last Login
                                    </p>
                                    <p className="text-sm text-secondary">
                                        {formatDate(overview.lastLoginAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-surface-muted">
                                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-primary">
                                        Account Status
                                    </p>
                                    <div className="mt-1">
                                        <Badge
                                            variant={
                                                overview.status === "active"
                                                    ? "success"
                                                    : "secondary"
                                            }
                                            size="sm"
                                        >
                                            {overview.status === "active"
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProfileOverview;
