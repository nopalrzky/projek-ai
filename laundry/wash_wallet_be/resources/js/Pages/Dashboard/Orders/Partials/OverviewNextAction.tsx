import { Order } from "@/types";
import { Card, CardContent } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { resolveNextAction, resolveOrderAlerts } from "../utils/orderOverviewUtils";
import {
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    Info,
    Sparkles,
} from "lucide-react";

interface Props {
    order: Order;
    onNavigateTab: (index: number) => void;
}

export default function OverviewNextAction({ order, onNavigateTab }: Props) {
    const nextAction = resolveNextAction(order);
    const alerts = resolveOrderAlerts(order);

    const getSeverityClasses = (severity: string) => {
        switch (severity) {
            case "danger":
                return {
                    panel: "border-[var(--color-error-200)] bg-[var(--color-error-50)] text-[var(--color-error-800)]",
                    icon: "bg-[var(--color-error-100)] text-[var(--color-error-600)]",
                };
            case "warning":
                return {
                    panel: "border-[var(--color-warning-200)] bg-[var(--color-warning-50)] text-[var(--color-warning-800)]",
                    icon: "bg-[var(--color-warning-100)] text-[var(--color-warning-600)]",
                };
            case "success":
                return {
                    panel: "border-[var(--color-success-200)] bg-[var(--color-success-50)] text-[var(--color-success-800)]",
                    icon: "bg-[var(--color-success-100)] text-[var(--color-success-600)]",
                };
            case "info":
            default:
                return {
                    panel: "border-[var(--color-info-200)] bg-[var(--color-info-50)] text-[var(--color-info-800)]",
                    icon: "bg-[var(--color-info-100)] text-[var(--color-info-600)]",
                };
        }
    };

    const getSeverityIcon = (severity: string, className = "w-5 h-5") => {
        switch (severity) {
            case "danger":
                return <AlertCircle className={className} />;
            case "warning":
                return <AlertTriangle className={className} />;
            case "success":
                return <CheckCircle2 className={className} />;
            case "info":
            default:
                return <Info className={className} />;
        }
    };

    return (
        <Card className="overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <CardContent className="p-0">
                <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-100)] text-[var(--color-primary-600)]">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        <div>
                            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                Prioritas Owner
                            </h3>
                            <p className="text-xs text-[var(--color-text-secondary)]">
                                Tindakan dan risiko paling penting untuk order ini.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-5">
                    {nextAction ? (
                        <div
                            className={`rounded-[var(--radius-lg)] border p-4 ${
                                getSeverityClasses(nextAction.severity).panel
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
                                        getSeverityClasses(nextAction.severity).icon
                                    }`}
                                >
                                    {getSeverityIcon(nextAction.severity)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-sm">
                                        {nextAction.label}
                                    </h4>
                                    <p className="mt-1 text-xs leading-relaxed opacity-90">
                                        {nextAction.description}
                                    </p>
                                    {nextAction.ctaLabel &&
                                        nextAction.tabIndex !== undefined && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 border-current bg-[var(--color-surface)] text-inherit hover:bg-[var(--color-surface-muted)]"
                                                rightIcon={
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                }
                                                onClick={() =>
                                                    onNavigateTab(
                                                        nextAction.tabIndex!,
                                                    )
                                                }
                                            >
                                                {nextAction.ctaLabel}
                                            </Button>
                                        )}
                                </div>
                            </div>
                        </div>
                    ) : alerts.length === 0 ? (
                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-success-200)] bg-[var(--color-success-50)] p-4 text-[var(--color-success-800)]">
                            <div className="flex gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-success-100)] text-[var(--color-success-600)]">
                                    <CheckCircle2 className="h-5 w-5" />
                                </span>
                                <div>
                                    <h4 className="font-semibold text-sm">
                                        Semua Terkendali
                                    </h4>
                                    <p className="mt-1 text-xs opacity-90">
                                        Tidak ada tindakan mendesak untuk order ini.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {alerts.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                                Alert
                            </p>
                            {alerts.map((alert, idx) => {
                                const classes = getSeverityClasses(alert.severity);

                                return (
                                    <div
                                        key={alert.key + idx}
                                        className={`flex items-start gap-2 rounded-[var(--radius-md)] border p-3 text-xs ${classes.panel}`}
                                    >
                                        <span className="mt-0.5 shrink-0">
                                            {getSeverityIcon(
                                                alert.severity,
                                                "w-4 h-4",
                                            )}
                                        </span>
                                        <span className="font-medium leading-relaxed">
                                            {alert.message}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
