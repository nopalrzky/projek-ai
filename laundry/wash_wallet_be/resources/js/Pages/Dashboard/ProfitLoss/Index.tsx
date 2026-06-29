import { useState, useCallback, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Filter,
    Printer,
    Download,
    RotateCcw,
    Calendar,
    AlertCircle,
    DollarSign,
    FileText,
    ExternalLink,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { SelectInput, DateInput } from "@/Components/Input";
import { Badge } from "@/Components/Badge";
import { formatCurrency } from "@/lib/utils";
import profitLossService, {
    ProfitLossFilters,
} from "@/Services/profit_loss.service";
import generalLedgerService from "@/Services/general_ledger.service";
import { ProfitLossPageProps } from "./types";
import { Account } from "@/types";

const ProfitLossIndex = ({
    outlets,
    filters,
    report,
    dateRangeOptions,
}: ProfitLossPageProps) => {
    const [localFilters, setLocalFilters] =
        useState<ProfitLossFilters>(filters);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [showCustomDates, setShowCustomDates] = useState(
        filters.date_range === "custom",
    );

    const handleFilterChange = useCallback(
        (field: keyof ProfitLossFilters, value: any) => {
            setLocalFilters((prev) => {
                const updated = {
                    ...prev,
                    [field]: value,
                };

                if (field === "date_range") {
                    setShowCustomDates(value === "custom");

                    if (value !== "custom") {
                        const dates = profitLossService.parseDateRange(value);
                        updated.start_date = dates.start;
                        updated.end_date = dates.end;
                    }
                }

                return updated;
            });
        },
        [],
    );

    const handleShowReport = useCallback(() => {
        if (!localFilters.outlet_id) {
            alert("Silakan pilih outlet terlebih dahulu");
            return;
        }

        const validation = profitLossService.validateFilters(localFilters);
        if (!validation.isValid) {
            alert(validation.errors.join("\n"));
            return;
        }

        router.get(route("profit-loss.index"), { ...localFilters } as any, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    }, [localFilters]);

    const handleResetFilters = useCallback(() => {
        const defaultFilters = profitLossService.getDefaultFilters();
        setLocalFilters({
            outlet_id: undefined,
            ...defaultFilters,
        });
        setShowCustomDates(false);
    }, []);

    const handlePrint = useCallback(() => {
        if (!report) return;

        profitLossService.printReport({
            outlet_id: filters.outlet_id!,
            start_date: filters.start_date!,
            end_date: filters.end_date!,
        });
    }, [report, filters]);

    const handleExport = useCallback(() => {
        if (!report) return;

        router.post(
            route("profit-loss.export"),
            {
                outlet_id: filters.outlet_id!,
                start_date: filters.start_date!,
                end_date: filters.end_date!,
                format: "excel",
            },
            {
                errorBag: "exportProfitLoss",
                preserveState: true,
                preserveScroll: true,
                onStart: () => setIsExporting(true),
                onSuccess: () => {
                    alert("Export berhasil!");
                },
                onError: (errors) => {
                    alert(
                        "Export gagal: " + (errors?.message || "Unknown error"),
                    );
                },
                onFinish: () => setIsExporting(false),
            },
        );
    }, [report, filters]);

    const handleAccountClick = useCallback(
        (accountId: number) => {
            if (
                !filters.outlet_id ||
                !filters.start_date ||
                !filters.end_date
            ) {
                return;
            }

            generalLedgerService.goToIndex({
                outlet_id: filters.outlet_id,
                account_id: accountId,
                start_date: filters.start_date,
                end_date: filters.end_date,
            });
        },
        [filters],
    );

    const outletOptions = useMemo(
        () => [
            { value: "", label: "Pilih Outlet..." },
            ...(outlets?.map((outlet) => ({
                value: outlet.id.toString(),
                label: outlet.name,
                description: outlet.code,
            })) || []),
        ],
        [outlets],
    );

    const renderAccountList = useCallback(
        (accounts: Account[], type: "positive" | "negative") => {
            if (!accounts || accounts.length === 0) {
                return (
                    <div
                        className="py-2 px-4 text-sm italic"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Tidak ada data
                    </div>
                );
            }

            return accounts.map((account) => (
                <div
                    key={account.id}
                    className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 transition-colors group"
                >
                    <button
                        onClick={() => handleAccountClick(account.id)}
                        className="flex items-center gap-2 text-sm hover:underline text-left flex-1"
                        style={{ color: "var(--color-primary-600)" }}
                    >
                        <span
                            className="font-mono text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {account.code}
                        </span>
                        <span>{account.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <span
                        className="text-sm font-medium tabular-nums"
                        style={{
                            color:
                                type === "positive"
                                    ? "var(--color-success-600)"
                                    : "var(--color-text-primary)",
                        }}
                    >
                        {formatCurrency(account.amount)}
                    </span>
                </div>
            ));
        },
        [handleAccountClick],
    );

    const renderReportSection = useCallback(
        (
            title: string,
            items: Account[],
            total: number,
            type: "positive" | "negative" = "positive",
            showPercentage?: boolean,
            percentage?: number,
        ) => {
            return (
                <div
                    className="border rounded-lg overflow-hidden"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div
                        className="px-4 py-3 font-semibold text-sm flex items-center justify-between"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        <span>{title}</span>
                        {showPercentage && percentage !== undefined && (
                            <Badge
                                variant={percentage >= 0 ? "success" : "error"}
                            >
                                {percentage.toFixed(2)}%
                            </Badge>
                        )}
                    </div>
                    <div className="divide-y">
                        {renderAccountList(items, type)}
                    </div>
                    <div
                        className="px-4 py-3 font-bold text-sm flex items-center justify-between border-t-2"
                        style={{
                            backgroundColor: "var(--color-gray-50)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        <span>Total {title}</span>
                        <span
                            className="tabular-nums"
                            style={{
                                color:
                                    type === "positive"
                                        ? "var(--color-success-600)"
                                        : "var(--color-text-primary)",
                            }}
                        >
                            {formatCurrency(total)}
                        </span>
                    </div>
                </div>
            );
        },
        [renderAccountList],
    );

    const renderSummaryRow = useCallback(
        (
            label: string,
            amount: number,
            variant: "default" | "primary" | "success" | "error" = "default",
            showMargin?: boolean,
            margin?: number,
        ) => {
            const bgColors = {
                default: "var(--color-gray-100)",
                primary: "var(--color-primary-100)",
                success: "var(--color-success-100)",
                error: "var(--color-error-100)",
            };

            const textColors = {
                default: "var(--color-text-primary)",
                primary: "var(--color-primary-700)",
                success: "var(--color-success-700)",
                error: "var(--color-error-700)",
            };

            return (
                <div
                    className="px-6 py-4 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: bgColors[variant] }}
                >
                    <div className="flex items-center gap-3">
                        <span
                            className="text-lg font-bold"
                            style={{ color: textColors[variant] }}
                        >
                            {label}
                        </span>
                        {showMargin && margin !== undefined && (
                            <Badge
                                variant={
                                    variant === "success" ||
                                    variant === "primary"
                                        ? "success"
                                        : "error"
                                }
                            >
                                Margin: {margin.toFixed(2)}%
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className="text-2xl font-bold tabular-nums"
                            style={{ color: textColors[variant] }}
                        >
                            {formatCurrency(amount)}
                        </span>
                        {amount >= 0 ? (
                            <TrendingUp
                                className="w-6 h-6"
                                style={{ color: textColors[variant] }}
                            />
                        ) : (
                            <TrendingDown
                                className="w-6 h-6"
                                style={{ color: textColors[variant] }}
                            />
                        )}
                    </div>
                </div>
            );
        },
        [],
    );

    return (
        <>
            <Head title="Laporan Laba Rugi" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Laporan Laba Rugi
                            </h1>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Profit & Loss Statement - Ringkasan kinerja
                                keuangan
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {report && (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handlePrint}
                                        disabled={isLoading || isExporting}
                                        leftIcon={
                                            <Printer className="w-4 h-4" />
                                        }
                                    >
                                        Cetak
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleExport}
                                        disabled={isLoading || isExporting}
                                        loading={isExporting}
                                        leftIcon={
                                            <Download className="w-4 h-4" />
                                        }
                                    >
                                        Export
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Filter Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-6">
                            <div className="space-y-6">
                                <div
                                    className="flex items-center gap-3 pb-4 border-b"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Filter
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-primary-600)",
                                        }}
                                    />
                                    <h2
                                        className="text-lg font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Filter Laporan
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <SelectInput
                                        label="Outlet"
                                        placeholder="Pilih outlet..."
                                        value={
                                            localFilters.outlet_id?.toString() ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "outlet_id",
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            )
                                        }
                                        options={outletOptions}
                                        required
                                        searchable
                                        disabled={isLoading}
                                    />

                                    <SelectInput
                                        label="Periode"
                                        placeholder="Pilih periode..."
                                        value={
                                            localFilters.date_range ||
                                            "this_month"
                                        }
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "date_range",
                                                e.target.value,
                                            )
                                        }
                                        options={dateRangeOptions}
                                        required
                                        disabled={isLoading}
                                    />

                                    {showCustomDates && (
                                        <>
                                            <DateInput
                                                label="Dari Tanggal"
                                                value={
                                                    localFilters.start_date ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "start_date",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                disabled={isLoading}
                                                leftIcon={
                                                    <Calendar className="w-4 h-4" />
                                                }
                                            />

                                            <DateInput
                                                label="Sampai Tanggal"
                                                value={
                                                    localFilters.end_date || ""
                                                }
                                                onChange={(e) =>
                                                    handleFilterChange(
                                                        "end_date",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                disabled={isLoading}
                                                leftIcon={
                                                    <Calendar className="w-4 h-4" />
                                                }
                                                min={localFilters.start_date}
                                            />
                                        </>
                                    )}
                                </div>

                                <div
                                    className="flex items-center justify-end gap-3 pt-4 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        variant="outline"
                                        onClick={handleResetFilters}
                                        disabled={isLoading}
                                        leftIcon={
                                            <RotateCcw className="w-4 h-4" />
                                        }
                                    >
                                        Reset
                                    </Button>

                                    <Button
                                        variant="primary"
                                        onClick={handleShowReport}
                                        disabled={isLoading}
                                        loading={isLoading}
                                        leftIcon={
                                            <FileText className="w-4 h-4" />
                                        }
                                    >
                                        Tampilkan Laporan
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Report Section */}
                    {report ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Report Header */}
                            <Card className="p-6">
                                <div className="text-center space-y-2">
                                    <h2
                                        className="text-2xl font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        LAPORAN LABA RUGI
                                    </h2>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Periode:{" "}
                                        {profitLossService.formatDateRange(
                                            report.period.start,
                                            report.period.end,
                                        )}
                                    </p>
                                </div>
                            </Card>

                            {/* Report Body */}
                            <Card className="p-6 space-y-6">
                                {/* Revenues */}
                                {renderReportSection(
                                    "Pendapatan",
                                    report.revenues.items,
                                    report.revenues.total,
                                    "positive",
                                )}

                                {/* COGS */}
                                {renderReportSection(
                                    "Harga Pokok Penjualan (HPP)",
                                    report.cogs.items,
                                    report.cogs.total,
                                    "negative",
                                )}

                                {/* Gross Profit */}
                                {renderSummaryRow(
                                    "LABA KOTOR",
                                    report.grossProfit,
                                    "primary",
                                    true,
                                    report.grossMargin,
                                )}

                                {/* Operating Expenses */}
                                {renderReportSection(
                                    "Beban Operasional",
                                    report.operatingExpenses.items,
                                    report.operatingExpenses.total,
                                    "negative",
                                )}

                                {/* Operating Profit */}
                                {renderSummaryRow(
                                    "LABA OPERASIONAL",
                                    report.operatingProfit,
                                    "default",
                                    true,
                                    report.operatingMargin,
                                )}

                                {/* Other Revenues */}
                                {report.otherRevenues.total > 0 &&
                                    renderReportSection(
                                        "Pendapatan Lain-lain",
                                        report.otherRevenues.items,
                                        report.otherRevenues.total,
                                        "positive",
                                    )}

                                {/* Other Expenses */}
                                {report.otherExpenses.total > 0 &&
                                    renderReportSection(
                                        "Beban Lain-lain",
                                        report.otherExpenses.items,
                                        report.otherExpenses.total,
                                        "negative",
                                    )}

                                {/* Net Profit */}
                                <div className="pt-6">
                                    {renderSummaryRow(
                                        "LABA BERSIH",
                                        report.netProfit,
                                        report.netProfit >= 0
                                            ? "success"
                                            : "error",
                                        true,
                                        report.netMargin,
                                    )}
                                </div>
                            </Card>

                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Total Pendapatan
                                            </p>
                                            <p
                                                className="text-2xl font-bold mt-1"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    report.totalRevenue,
                                                )}
                                            </p>
                                        </div>
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-success-100)",
                                            }}
                                        >
                                            <TrendingUp
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Total Beban
                                            </p>
                                            <p
                                                className="text-2xl font-bold mt-1"
                                                style={{
                                                    color: "var(--color-error-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    report.totalExpense,
                                                )}
                                            </p>
                                        </div>
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-error-100)",
                                            }}
                                        >
                                            <TrendingDown
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-error-600)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p
                                                className="text-sm font-medium"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Net Profit Margin
                                            </p>
                                            <p
                                                className="text-2xl font-bold mt-1"
                                                style={{
                                                    color:
                                                        report.netMargin >= 0
                                                            ? "var(--color-success-600)"
                                                            : "var(--color-error-600)",
                                                }}
                                            >
                                                {report.netMargin.toFixed(2)}%
                                            </p>
                                        </div>
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    report.netMargin >= 0
                                                        ? "var(--color-success-100)"
                                                        : "var(--color-error-100)",
                                            }}
                                        >
                                            <DollarSign
                                                className="w-5 h-5"
                                                style={{
                                                    color:
                                                        report.netMargin >= 0
                                                            ? "var(--color-success-600)"
                                                            : "var(--color-error-600)",
                                                }}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Card className="p-12">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div
                                        className="p-4 rounded-full mb-4"
                                        style={{
                                            backgroundColor:
                                                "var(--color-info-100)",
                                        }}
                                    >
                                        <AlertCircle
                                            className="w-12 h-12"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        />
                                    </div>
                                    <h3
                                        className="text-lg font-semibold mb-2"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Pilih Filter untuk Menampilkan Laporan
                                    </h3>
                                    <p
                                        className="text-sm max-w-md"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Silakan pilih outlet dan periode pada
                                        filter di atas, kemudian klik tombol
                                        "Tampilkan Laporan" untuk melihat
                                        laporan laba rugi.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
};

ProfitLossIndex.layout = (page: any) =>
    withAuthenticatedLayout({
        title: "Laporan Laba Rugi",
        breadcrumbs: [
            { label: "Akuntansi", href: "#" },
            { label: "Laporan", href: "#" },
            { label: "Laba Rugi" },
        ],
    })(page);

export default ProfitLossIndex;
