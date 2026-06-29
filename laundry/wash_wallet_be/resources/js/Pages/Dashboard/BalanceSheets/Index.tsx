import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Scale,
    Filter,
    Printer,
    Download,
    RotateCcw,
    Calendar,
    AlertCircle,
    CheckCircle,
    XCircle,
    ExternalLink,
    Building2,
    Landmark,
    Wallet,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { SelectInput, DateInput } from "@/Components/Input";
import { Badge } from "@/Components/Badge";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";
import balanceSheetService, {
    BalanceSheetFilters,
} from "@/Services/balance_sheet.service";
import generalLedgerService from "@/Services/general_ledger.service";
import { BalanceSheetAccount, BalanceSheetSection } from "@/types";
import { BalanceSheetPageProps } from "./types";

const BalanceSheetIndex = ({
    outlets,
    filters,
    report,
}: BalanceSheetPageProps) => {
    const [localFilters, setLocalFilters] =
        useState<BalanceSheetFilters>(filters);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = useCallback(
        (field: keyof BalanceSheetFilters, value: any) => {
            setLocalFilters((prev) => ({
                ...prev,
                [field]: value,
            }));
        },
        [],
    );

    const handleShowReport = useCallback(() => {
        if (!localFilters.outlet_id) {
            alert("Silakan pilih outlet terlebih dahulu");
            return;
        }

        const validation = balanceSheetService.validateFilters(localFilters);
        if (!validation.isValid) {
            alert(validation.errors.join("\n"));
            return;
        }

        setIsLoading(true);
        balanceSheetService.goToIndex(localFilters);

        setTimeout(() => setIsLoading(false), 500);
    }, [localFilters]);

    const handleResetFilters = useCallback(() => {
        const defaultFilters = balanceSheetService.getDefaultFilters();
        setLocalFilters({
            outlet_id: undefined,
            ...defaultFilters,
        });
    }, []);

    const handlePrint = useCallback(() => {
        if (!report) return;

        balanceSheetService.printReport({
            outlet_id: filters.outlet_id!,
            date: filters.date!,
        });
    }, [report, filters]);

    const handleExport = useCallback(() => {
        if (!report) return;

        router.post(
            route("balance-sheet.export"),
            {
                outlet_id: filters.outlet_id!,
                date: filters.date!,
                format: "excel",
            },
            {
                errorBag: "exportBalanceSheet",
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    alert("Export berhasil!");
                },
                onError: (errors) => {
                    alert(
                        "Export gagal: " + (errors?.message || "Unknown error"),
                    );
                },
            },
        );
    }, [report, filters]);

    const handleAccountClick = useCallback(
        (accountId: number | null) => {
            if (!accountId || !filters.outlet_id || !filters.date) {
                return;
            }
            const dateObj = new Date(filters.date);
            const startOfYear = new Date(dateObj.getFullYear(), 0, 1);

            generalLedgerService.goToIndex({
                outlet_id: filters.outlet_id,
                account_id: accountId,
                start_date: startOfYear.toISOString().split("T")[0],
                end_date: filters.date,
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
        (accounts: BalanceSheetAccount[]) => {
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

            return accounts.map((account, index) => (
                <div
                    key={account.id || `virtual-${index}`}
                    className={`flex items-center justify-between py-2 px-4 transition-colors group ${
                        account.isVirtual ? "bg-yellow-50" : "hover:bg-gray-50"
                    }`}
                >
                    {account.isVirtual ? (
                        <div className="flex items-center gap-2 text-sm flex-1">
                            <span
                                className="font-mono text-xs"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                {account.code}
                            </span>
                            <span className="font-semibold">
                                {account.name}
                            </span>
                            <Badge variant="warning" size="sm">
                                Calculated
                            </Badge>
                        </div>
                    ) : (
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
                    )}
                    <span
                        className="text-sm font-medium tabular-nums"
                        style={{
                            color: account.isVirtual
                                ? "var(--color-warning-700)"
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

    const renderSection = useCallback(
        (title: string, section: BalanceSheetSection) => {
            return (
                <div
                    className="border rounded-lg overflow-hidden"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div
                        className="px-4 py-3 font-semibold text-sm"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        {title}
                    </div>
                    <div className="divide-y divide-border">
                        {renderAccountList(section.items)}
                    </div>
                    <div
                        className="px-4 py-3 font-bold text-sm flex items-center justify-between border-t-2"
                        style={{
                            backgroundColor: "var(--color-gray-50)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    >
                        <span>Subtotal {title}</span>
                        <span className="tabular-nums">
                            {formatCurrency(section.total)}
                        </span>
                    </div>
                </div>
            );
        },
        [renderAccountList],
    );

    const renderTotalCard = useCallback(
        (
            title: string,
            amount: number,
            icon: ReactNode,
            variant: "primary" | "success" = "primary",
        ) => {
            const bgColor =
                variant === "primary"
                    ? "var(--color-primary-100)"
                    : "var(--color-success-100)";
            const textColor =
                variant === "primary"
                    ? "var(--color-primary-700)"
                    : "var(--color-success-700)";

            return (
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "white",
                                    color: textColor,
                                }}
                            >
                                {icon}
                            </div>
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: textColor }}
                                >
                                    {title}
                                </p>
                                <p
                                    className="text-3xl font-bold mt-1 tabular-nums"
                                    style={{ color: textColor }}
                                >
                                    {formatCurrency(amount)}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            );
        },
        [],
    );

    return (
        <>
            <Head title="Laporan Neraca" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Laporan Neraca"
                        subtitle="Posisi keuangan perusahaan per tanggal tertentu"
                        icon={Scale}
                        animate={true}
                        variant="default"
                        actions={
                            report ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={handlePrint}
                                        leftIcon={
                                            <Printer className="w-4 h-4" />
                                        }
                                    >
                                        Cetak
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleExport}
                                        leftIcon={
                                            <Download className="w-4 h-4" />
                                        }
                                    >
                                        Export
                                    </Button>
                                </>
                            ) : null
                        }
                    />

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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                    <DateInput
                                        label="Per Tanggal"
                                        value={localFilters.date || ""}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "date",
                                                e.target.value,
                                            )
                                        }
                                        required
                                        disabled={isLoading}
                                        leftIcon={
                                            <Calendar className="w-4 h-4" />
                                        }
                                        max={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                    />
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
                                        leftIcon={<Scale className="w-4 h-4" />}
                                    >
                                        Tampilkan Laporan
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {report ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <Card className="p-6">
                                <div className="text-center space-y-2">
                                    <h2
                                        className="text-2xl font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        LAPORAN NERACA
                                    </h2>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Per Tanggal:{" "}
                                        {balanceSheetService.formatDate(
                                            report.date,
                                        )}
                                    </p>
                                </div>
                            </Card>

                            {/* Balance Sheet Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Left Column: Assets */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Building2
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        />
                                        <h3
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            ASET
                                        </h3>
                                    </div>

                                    {Object.entries(report.assets.sections).map(
                                        ([subtype, section]) => (
                                            <div key={subtype}>
                                                {renderSection(
                                                    balanceSheetService.getSectionLabel(
                                                        subtype,
                                                    ),
                                                    section,
                                                )}
                                            </div>
                                        ),
                                    )}

                                    {renderTotalCard(
                                        "TOTAL ASET",
                                        report.assets.total,
                                        <Building2 className="w-6 h-6" />,
                                        "primary",
                                    )}
                                </div>

                                {/* Right Column: Liabilities & Equity */}
                                <div className="space-y-4">
                                    {/* Liabilities Section */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <Landmark
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                        />
                                        <h3
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            KEWAJIBAN
                                        </h3>
                                    </div>

                                    {Object.entries(
                                        report.liabilities.sections,
                                    ).map(([subtype, section]) => (
                                        <div key={subtype}>
                                            {renderSection(
                                                balanceSheetService.getSectionLabel(
                                                    subtype,
                                                ),
                                                section,
                                            )}
                                        </div>
                                    ))}

                                    <Card className="p-4 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">
                                                Total Kewajiban
                                            </span>
                                            <span
                                                className="text-lg font-bold tabular-nums"
                                                style={{
                                                    color: "var(--color-error-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    report.liabilities.total,
                                                )}
                                            </span>
                                        </div>
                                    </Card>

                                    {/* Divider */}
                                    <div
                                        className="border-t-2 my-6"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    />

                                    {/* Equity Section */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <Wallet
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-success-600)",
                                            }}
                                        />
                                        <h3
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            MODAL
                                        </h3>
                                    </div>

                                    {Object.entries(report.equity.sections).map(
                                        ([subtype, section]) => (
                                            <div key={subtype}>
                                                {renderSection(
                                                    balanceSheetService.getSectionLabel(
                                                        subtype,
                                                    ),
                                                    section,
                                                )}
                                            </div>
                                        ),
                                    )}

                                    <Card className="p-4 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">
                                                Total Modal
                                            </span>
                                            <span
                                                className="text-lg font-bold tabular-nums"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    report.equity.total,
                                                )}
                                            </span>
                                        </div>
                                    </Card>

                                    {renderTotalCard(
                                        "TOTAL KEWAJIBAN & MODAL",
                                        report.summary.totalLiabilitiesEquity,
                                        <Scale className="w-6 h-6" />,
                                        "success",
                                    )}
                                </div>
                            </div>

                            {/* Balance Indicator */}
                            <Card className="p-6">
                                {report.summary.isBalanced ? (
                                    <Alert variant="success" className="mb-0">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg mb-1">
                                                    Neraca Seimbang (Balanced)
                                                </h4>
                                                <p className="text-sm">
                                                    Total Aset = Total Kewajiban
                                                    + Modal
                                                </p>
                                                <div className="mt-2 flex items-center gap-6 text-sm">
                                                    <span>
                                                        Aset:{" "}
                                                        <strong>
                                                            {formatCurrency(
                                                                report.summary
                                                                    .totalAssets,
                                                            )}
                                                        </strong>
                                                    </span>
                                                    <span>=</span>
                                                    <span>
                                                        Kewajiban + Modal:{" "}
                                                        <strong>
                                                            {formatCurrency(
                                                                report.summary
                                                                    .totalLiabilitiesEquity,
                                                            )}
                                                        </strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Alert>
                                ) : (
                                    <Alert variant="error" className="mb-0">
                                        <div className="flex items-center gap-3">
                                            <XCircle className="w-6 h-6" />
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg mb-1">
                                                    Neraca Tidak Seimbang!
                                                </h4>
                                                <p className="text-sm mb-2">
                                                    Terdapat selisih antara Aset
                                                    dengan Kewajiban & Modal
                                                </p>
                                                <div className="flex flex-col gap-2 text-sm">
                                                    <div className="flex items-center gap-6">
                                                        <span>
                                                            Aset:{" "}
                                                            <strong>
                                                                {formatCurrency(
                                                                    report
                                                                        .summary
                                                                        .totalAssets,
                                                                )}
                                                            </strong>
                                                        </span>
                                                        <span>≠</span>
                                                        <span>
                                                            Kewajiban + Modal:{" "}
                                                            <strong>
                                                                {formatCurrency(
                                                                    report
                                                                        .summary
                                                                        .totalLiabilitiesEquity,
                                                                )}
                                                            </strong>
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Badge variant="error">
                                                            Selisih:{" "}
                                                            {formatCurrency(
                                                                report.summary
                                                                    .difference,
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Alert>
                                )}
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
                                                Total Aset
                                            </p>
                                            <p
                                                className="text-2xl font-bold mt-1"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    report.summary.totalAssets,
                                                )}
                                            </p>
                                        </div>
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <Building2
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-primary-600)",
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
                                                Total Kewajiban
                                            </p>
                                            <p
                                                className="text-2xl font-bold mt-1"
                                                style={{
                                                    color: "var(--color-error-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    report.liabilities.total,
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
                                            <Landmark
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
                                                Total Modal
                                            </p>
                                            <p
                                                className="text-2xl font-bold mt-1"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    report.equity.total,
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
                                            <Wallet
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-success-600)",
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
                                        Silakan pilih outlet dan tanggal pada
                                        filter di atas, kemudian klik tombol
                                        "Tampilkan Laporan" untuk melihat
                                        laporan neraca.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

BalanceSheetIndex.layout = withAuthenticatedLayout({
    title: "Laporan Neraca",
    searchable: true,
    breadcrumbs: [
        { label: "Laporan Neraca", href: route("balance-sheet.index") },
    ],
});

export default BalanceSheetIndex;
