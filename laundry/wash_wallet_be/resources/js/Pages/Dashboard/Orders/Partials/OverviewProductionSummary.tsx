import { Order } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Card";
import { Progress } from "@/Components/Progress";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Box,
    ChevronRight,
    Hammer,
    Package,
    PlayCircle,
} from "lucide-react";

interface Props {
    order: Order;
    onNavigateTab: (index: number) => void;
}

export default function OverviewProductionSummary({ order, onNavigateTab }: Props) {
    const items = order.orderItems || [];
    const totalItems = items.length;

    const normalizeStatus = (status?: string | null) => {
        if (status === "done" || status === "completed") {
            return "done";
        }

        if (status === "processing" || status === "in_progress") {
            return "processing";
        }

        return "pending";
    };

    const summary = items.reduce(
        (acc, item) => {
            const processes = item.orderItemProcesses || [];
            const itemStatus = normalizeStatus(item.status);

            if (itemStatus === "done") {
                acc.itemsDone += 1;
            } else if (itemStatus === "processing") {
                acc.itemsProcessing += 1;
            } else if (processes.some((process) => normalizeStatus(process.status) === "processing")) {
                acc.itemsProcessing += 1;
            } else {
                acc.itemsPending += 1;
            }

            processes.forEach((process) => {
                const processStatus = normalizeStatus(process.status);
                const typedProcess = process as typeof process & {
                    processName?: string | null;
                    employeeName?: string | null;
                };

                acc.totalProcesses += 1;

                if (processStatus === "done") {
                    acc.processesDone += 1;
                } else if (processStatus === "processing") {
                    acc.processesRunning += 1;

                    if (!acc.activeProcessName) {
                        acc.activeProcessName =
                            typedProcess.processName ||
                            process.laundryServiceProcess?.process?.name ||
                            "Proses berjalan";
                        acc.activeProcessEmployee =
                            typedProcess.employeeName ||
                            process.employee?.name ||
                            "Belum ditentukan";
                    }
                } else {
                    acc.processesPending += 1;
                }
            });

            return acc;
        },
        {
            itemsDone: 0,
            itemsProcessing: 0,
            itemsPending: 0,
            totalProcesses: 0,
            processesDone: 0,
            processesRunning: 0,
            processesPending: 0,
            activeProcessName: "",
            activeProcessEmployee: "",
        },
    );

    const displayItems = items.slice(0, 4);
    const hasMoreItems = totalItems > 4;
    const processProgress =
        summary.totalProcesses > 0
            ? (summary.processesDone / summary.totalProcesses) * 100
            : order.completionPercentage || 0;
    const normalizedProcessProgress = Math.max(
        0,
        Math.min(100, processProgress),
    );

    return (
        <Card className="h-full overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)]">
            <CardHeader className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] pb-4">
                <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2 text-[var(--color-text-primary)]">
                        <Hammer className="h-4 w-4 text-[var(--color-primary-600)]" />
                        Ringkasan Produksi
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs text-[var(--color-primary-600)]"
                        onClick={() => onNavigateTab(1)}
                        rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                    >
                        Items
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-1 divide-y divide-[var(--color-border)] lg:grid-cols-[minmax(0,0.9fr)_minmax(18rem,1.1fr)] lg:divide-x lg:divide-y-0">
                    <div className="space-y-5 p-5">
                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary-700)]">
                                        Penyelesaian Produksi
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-[var(--color-primary-800)]">
                                        {Math.round(normalizedProcessProgress)}%
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-primary-100)] text-[var(--color-primary-700)]">
                                    <Hammer className="h-6 w-6" />
                                </span>
                            </div>
                            <Progress
                                value={normalizedProcessProgress}
                                variant={
                                    normalizedProcessProgress >= 100
                                        ? "success"
                                        : "primary"
                                }
                                size="sm"
                                className="mt-4"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3">
                                <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                                    {totalItems}
                                </p>
                                <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">
                                    Item
                                </p>
                            </div>
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-success-200)] bg-[var(--color-success-50)] p-3">
                                <p className="text-lg font-semibold text-[var(--color-success-700)]">
                                    {summary.itemsDone}
                                </p>
                                <p className="text-[10px] uppercase tracking-wide text-[var(--color-success-700)]">
                                    Selesai
                                </p>
                            </div>
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-warning-200)] bg-[var(--color-warning-50)] p-3">
                                <p className="text-lg font-semibold text-[var(--color-warning-700)]">
                                    {summary.itemsProcessing}
                                </p>
                                <p className="text-[10px] uppercase tracking-wide text-[var(--color-warning-700)]">
                                    Diproses
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3">
                                <p className="text-lg font-semibold text-[var(--color-text-primary)]">
                                    {summary.totalProcesses}
                                </p>
                                <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)]">
                                    Proses
                                </p>
                            </div>
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-success-200)] p-3">
                                <p className="text-lg font-semibold text-[var(--color-success-700)]">
                                    {summary.processesDone}
                                </p>
                                <p className="text-[10px] uppercase tracking-wide text-[var(--color-success-700)]">
                                    Done
                                </p>
                            </div>
                            <div className="rounded-[var(--radius-md)] border border-[var(--color-info-200)] p-3">
                                <p className="text-lg font-semibold text-[var(--color-info-700)]">
                                    {summary.processesRunning}
                                </p>
                                <p className="text-[10px] uppercase tracking-wide text-[var(--color-info-700)]">
                                    Aktif
                                </p>
                            </div>
                        </div>

                        {summary.processesRunning > 0 &&
                            summary.activeProcessName && (
                                <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-primary-200)] bg-[var(--color-primary-50)] p-3 text-xs text-[var(--color-primary-800)]">
                                    <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-600)]" />
                                    <div>
                                        <span className="font-semibold">
                                            {summary.activeProcessName}
                                        </span>{" "}
                                        sedang dikerjakan oleh{" "}
                                        <span className="font-semibold">
                                            {summary.activeProcessEmployee}
                                        </span>
                                    </div>
                                </div>
                            )}
                    </div>

                    <div className="flex h-full flex-col p-5">
                        <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                            Isi Pesanan
                        </h4>

                        {totalItems === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-10 text-center">
                                <Box className="mb-3 h-10 w-10 text-[var(--color-text-tertiary)]" />
                                <p className="font-semibold text-[var(--color-text-primary)]">
                                    Belum Ada Item
                                </p>
                                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                                    Tambahkan item layanan untuk pesanan ini.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {displayItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                                                <Package className="h-4 w-4 text-[var(--color-text-secondary)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                                                    {item.laundryServiceName ||
                                                        item.laundryService?.name ||
                                                        "Layanan"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                                        {item.quantity}{" "}
                                                        {item.unitName ||
                                                            item.laundryService?.unit?.name ||
                                                            "unit"}
                                                    </span>
                                                    {item.quotaUsageLog && (
                                                        <Badge
                                                            variant="primary"
                                                            size="xs"
                                                        >
                                                            Kuota
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ml-2 shrink-0 text-right">
                                            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                                                {item.formattedTotalAmount ||
                                                    item.formattedSubtotal}
                                            </p>
                                            <Badge
                                                variant={
                                                    normalizeStatus(item.status) ===
                                                    "done"
                                                        ? "success"
                                                        : normalizeStatus(
                                                                item.status,
                                                            ) === "processing"
                                                          ? "warning"
                                                          : "secondary"
                                                }
                                                size="xs"
                                                className="mt-1"
                                            >
                                                {normalizeStatus(item.status) ===
                                                "done"
                                                    ? "Selesai"
                                                    : normalizeStatus(
                                                            item.status,
                                                        ) === "processing"
                                                      ? "Diproses"
                                                      : "Pending"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}

                                {hasMoreItems && (
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        className="mt-2 text-xs text-[var(--color-text-secondary)]"
                                        size="sm"
                                        onClick={() => onNavigateTab(1)}
                                        rightIcon={
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        }
                                    >
                                        + {totalItems - 4} item lainnya
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
