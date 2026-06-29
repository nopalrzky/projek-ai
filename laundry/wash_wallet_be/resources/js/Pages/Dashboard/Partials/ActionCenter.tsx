import React from "react";
import { Link } from "@inertiajs/react";
import {
    AlertTriangle,
    Info,
    AlertCircle,
    ChevronRight,
    CheckCircle2,
    Bell,
} from "lucide-react";
import { OwnerDashboardActionItem } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import Empty from "@/Components/State/Empty";
import { cn } from "@/lib/utils";

interface ActionCenterProps {
    actions: OwnerDashboardActionItem[];
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);

type Severity = "critical" | "warning" | "info";

const severityConfig: Record<
    Severity,
    {
        bg: string;
        border: string;
        iconColor: string;
        badgeBg: string;
        badgeColor: string;
        linkColor: string;
        Icon: React.ElementType;
    }
> = {
    critical: {
        bg: "bg-[var(--color-error-50)] dark:bg-[var(--color-error-950)]/30",
        border: "border-[var(--color-error-200)] dark:border-[var(--color-error-800)]",
        iconColor: "text-[var(--color-error-600)] dark:text-[var(--color-error-400)]",
        badgeBg: "bg-[var(--color-error-100)] dark:bg-[var(--color-error-900)]/50",
        badgeColor: "text-[var(--color-error-700)] dark:text-[var(--color-error-300)]",
        linkColor: "text-[var(--color-error-600)] dark:text-[var(--color-error-400)]",
        Icon: AlertTriangle,
    },
    warning: {
        bg: "bg-[var(--color-warning-50)] dark:bg-[var(--color-warning-950)]/30",
        border: "border-[var(--color-warning-200)] dark:border-[var(--color-warning-800)]",
        iconColor: "text-[var(--color-warning-600)] dark:text-[var(--color-warning-400)]",
        badgeBg: "bg-[var(--color-warning-100)] dark:bg-[var(--color-warning-900)]/50",
        badgeColor: "text-[var(--color-warning-700)] dark:text-[var(--color-warning-300)]",
        linkColor: "text-[var(--color-warning-600)] dark:text-[var(--color-warning-400)]",
        Icon: AlertCircle,
    },
    info: {
        bg: "bg-[var(--color-info-50)] dark:bg-[var(--color-info-950)]/30",
        border: "border-[var(--color-info-200)] dark:border-[var(--color-info-800)]",
        iconColor: "text-[var(--color-info-600)] dark:text-[var(--color-info-400)]",
        badgeBg: "bg-[var(--color-info-100)] dark:bg-[var(--color-info-900)]/50",
        badgeColor: "text-[var(--color-info-700)] dark:text-[var(--color-info-300)]",
        linkColor: "text-[var(--color-info-600)] dark:text-[var(--color-info-400)]",
        Icon: Info,
    },
};

const ActionCenter: React.FC<ActionCenterProps> = ({ actions }) => {
    return (
        <Card className="flex flex-col h-full" hoverable>
            <CardHeader className="py-4">
                <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-[var(--color-primary-500)]" />
                        <span className="text-[var(--color-text-primary)]">Pusat Tindakan</span>
                    </div>
                    {actions.length > 0 && (
                        <Badge variant="error" size="sm" rounded="full">
                            {actions.length}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent
                className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-5"
                style={{ maxHeight: "420px" }}
            >
                {actions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-6">
                        <Empty 
                            title="Semua Terkendali 🎉"
                            message="Tidak ada tugas atau peringatan mendesak saat ini."
                            icon={<CheckCircle2 className="w-12 h-12 text-[var(--color-success-500)]" />}
                        />
                    </div>
                ) : (
                    <div className="space-y-3">
                        {actions.map((action) => {
                            const cfg = severityConfig[action.severity] || severityConfig.info;
                            const { Icon } = cfg;

                            return (
                                <div
                                    key={action.key}
                                    className={cn(
                                        "rounded-xl p-4 transition-all hover:shadow-md border",
                                        cfg.bg,
                                        cfg.border
                                    )}
                                >
                                    <div className="flex gap-3">
                                        <div className="mt-0.5 shrink-0">
                                            <Icon className={cn("w-5 h-5", cfg.iconColor)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1.5">
                                                <h4 className="font-semibold text-sm leading-tight text-[var(--color-text-primary)]">
                                                    {action.title}
                                                </h4>
                                                {(action.count !== undefined || action.amount !== undefined) && (
                                                    <Badge 
                                                        size="xs" 
                                                        rounded="full"
                                                        className={cn("shrink-0 border-none", cfg.badgeBg, cfg.badgeColor)}
                                                    >
                                                        {action.count !== undefined
                                                            ? `${action.count} Item`
                                                            : formatRupiah(action.amount || 0)}
                                                    </Badge>
                                                )}
                                            </div>

                                            <p className="text-xs mb-3 leading-relaxed text-[var(--color-text-secondary)]">
                                                {action.message}
                                            </p>

                                            <Link
                                                href={action.actionHref}
                                                className={cn(
                                                    "inline-flex items-center gap-1 text-xs font-semibold transition-all hover:opacity-80 hover:translate-x-0.5 group",
                                                    cfg.linkColor
                                                )}
                                            >
                                                {action.actionLabel}
                                                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ActionCenter;
