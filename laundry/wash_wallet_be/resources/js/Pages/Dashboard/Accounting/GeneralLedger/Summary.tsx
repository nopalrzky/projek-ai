import { useCallback, useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Filter,
    RotateCcw,
    Calendar,
    FileText,
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { SelectInput, DateInput } from "@/Components/Input";
import { Badge } from "@/Components/Badge";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";

interface LedgerSummary {
    outlet: any;
    period: {
        start: string;
        end: string;
    };
    summary: Array<{
        account: {
            id: number;
            code: string;
            name: string;
            type: string;
        };
        opening_balance: number;
        debit: number;
        credit: number;
        mutation: number;
        closing_balance: number;
    }>;
}

interface SummaryProps {
    summary: LedgerSummary | null;
    outlets: Array<{ id: number; name: string; code: string }>;
    filters: {
        outletId: number | null;
        accountType: string | null;
        startDate: string;
        endDate: string;
    };
    accountTypes: Array<{ value: string; label: string }>;
}

function GeneralLedgerSummary({
    summary,
    outlets,
    filters,
    accountTypes,
}: SummaryProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = useCallback(
        (field: keyof typeof filters, value: unknown) => {
            setLocalFilters((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const handleShowReport = useCallback(() => {
        router.get(
            route("general-ledger.summary"),
            {
                outletId: localFilters.outletId,
                accountType: localFilters.accountType,
                startDate: localFilters.startDate,
                endDate: localFilters.endDate,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, [localFilters]);

    const handleResetFilters = useCallback(() => {
        router.get(route("general-ledger.summary"));
    }, []);

    const outletOptions = [
        { value: "", label: "Pilih Outlet..." },
        ...(outlets?.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
            description: outlet.code,
        })) || []),
    ];

    const canSubmitFilters = Boolean(
        localFilters.outletId && localFilters.startDate && localFilters.endDate,
    );

    const totals = useMemo(() => {
        if (!summary) {
            return {
                openingBalance: 0,
                debit: 0,
                credit: 0,
                mutation: 0,
                closingBalance: 0,
            };
        }

        return summary.summary.reduce(
            (accumulator, row) => ({
                openingBalance:
                    accumulator.openingBalance + row.opening_balance,
                debit: accumulator.debit + row.debit,
                credit: accumulator.credit + row.credit,
                mutation: accumulator.mutation + row.mutation,
                closingBalance:
                    accumulator.closingBalance + row.closing_balance,
            }),
            {
                openingBalance: 0,
                debit: 0,
                credit: 0,
                mutation: 0,
                closingBalance: 0,
            },
        );
    }, [summary]);

    const formatDateRange = (startDate: string, endDate: string) => {
        const formatDateString = (dateStr: string) =>
            new Date(dateStr).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        return `${formatDateString(startDate)} - ${formatDateString(endDate)}`;
    };

    return (
        <>
            <Head title="Ringkasan Buku Besar" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Ringkasan Buku Besar"
                        subtitle="Ringkasan saldo dan mutasi untuk semua akun"
                        icon={LayoutDashboard}
                        variant="default"
                    />

                    <Card className="card p-6">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-color pb-4">
                                <Filter className="w-5 h-5 text-[var(--color-primary-600)]" />
                                <h2 className="text-lg font-semibold text-primary">
                                    Filter Laporan
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <SelectInput
                                    label="Outlet"
                                    placeholder="Pilih outlet..."
                                    value={
                                        localFilters.outletId?.toString() || ""
                                    }
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "outletId",
                                            e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        )
                                    }
                                    options={outletOptions}
                                    required
                                />

                                <SelectInput
                                    label="Tipe Akun"
                                    value={localFilters.accountType || ""}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "accountType",
                                            e.target.value || null,
                                        )
                                    }
                                    options={accountTypes}
                                />

                                <DateInput
                                    label="Dari Tanggal"
                                    value={localFilters.startDate || ""}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "startDate",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    leftIcon={<Calendar className="w-4 h-4" />}
                                />

                                <DateInput
                                    label="Sampai Tanggal"
                                    value={localFilters.endDate || ""}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "endDate",
                                            e.target.value,
                                        )
                                    }
                                    required
                                    leftIcon={<Calendar className="w-4 h-4" />}
                                    min={localFilters.startDate}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 border-t border-color pt-4">
                                <Button
                                    variant="outline"
                                    onClick={handleResetFilters}
                                    leftIcon={<RotateCcw className="w-4 h-4" />}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleShowReport}
                                    disabled={!canSubmitFilters}
                                    leftIcon={<FileText className="w-4 h-4" />}
                                >
                                    Tampilkan Laporan
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {summary ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-6"
                        >
                            <Card className="card p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-primary">
                                            Laporan Ringkasan Buku Besar
                                        </h2>
                                        <p className="mt-1 text-sm text-secondary">
                                            Outlet:{" "}
                                            <span className="font-semibold">
                                                {summary.outlet.name}
                                            </span>{" "}
                                            | Periode:{" "}
                                            {formatDateRange(
                                                summary.period.start,
                                                summary.period.end,
                                            )}
                                        </p>
                                    </div>
                                    <Badge variant="info">
                                        {summary.summary.length} Akun
                                    </Badge>
                                </div>
                            </Card>

                            <Card className="card overflow-hidden bg-surface">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-surface-muted border-color">
                                                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Akun
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Saldo Awal
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Debit
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Kredit
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Mutasi
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Saldo Akhir
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y border-color">
                                            {summary.summary.map(
                                                (row, index) => (
                                                    <tr
                                                        key={row.account.id}
                                                        className={
                                                            index % 2 === 0
                                                                ? "bg-background"
                                                                : "bg-surface"
                                                        }
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex flex-col">
                                                                <div className="text-sm font-bold text-primary">
                                                                    {
                                                                        row
                                                                            .account
                                                                            .code
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-secondary">
                                                                    {
                                                                        row
                                                                            .account
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className="mt-1">
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="text-[10px] uppercase"
                                                                    >
                                                                        {
                                                                            row
                                                                                .account
                                                                                .type
                                                                        }
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-primary">
                                                            {formatCurrency(
                                                                row.opening_balance,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[var(--color-success-600)]">
                                                            {row.debit > 0
                                                                ? formatCurrency(
                                                                      row.debit,
                                                                  )
                                                                : "-"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-[var(--color-error-600)]">
                                                            {row.credit > 0
                                                                ? formatCurrency(
                                                                      row.credit,
                                                                  )
                                                                : "-"}
                                                        </td>
                                                        <td
                                                            className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${row.mutation >= 0 ? "text-[var(--color-success-600)]" : "text-[var(--color-error-600)]"}`}
                                                        >
                                                            {row.mutation >= 0
                                                                ? "+"
                                                                : ""}
                                                            {formatCurrency(
                                                                row.mutation,
                                                            )}
                                                        </td>
                                                        <td
                                                            className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${row.closing_balance >= 0 ? "text-[var(--color-primary-700)]" : "text-[var(--color-error-600)]"}`}
                                                        >
                                                            {formatCurrency(
                                                                row.closing_balance,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                        {summary.summary.length > 0 && (
                                            <tfoot className="bg-surface-muted">
                                                <tr className="font-bold">
                                                    <td className="px-6 py-4 text-sm text-primary">
                                                        TOTAL
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-primary">
                                                        {formatCurrency(
                                                            totals.openingBalance,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-[var(--color-success-600)]">
                                                        {formatCurrency(
                                                            totals.debit,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-[var(--color-error-600)]">
                                                        {formatCurrency(
                                                            totals.credit,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-[var(--color-success-600)]">
                                                        {formatCurrency(
                                                            totals.mutation,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm text-[var(--color-primary-700)]">
                                                        {formatCurrency(
                                                            totals.closingBalance,
                                                        )}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <Card className="card p-12 text-center bg-surface">
                            <div className="flex flex-col items-center justify-center opacity-50">
                                <LayoutDashboard className="w-16 h-16 mb-4" />
                                <p className="text-lg font-medium text-primary">
                                    Silakan pilih outlet dan periode untuk
                                    melihat ringkasan
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </motion.div>
        </>
    );
}

GeneralLedgerSummary.layout = withAuthenticatedLayout({
    title: "Ringkasan Buku Besar",
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Buku Besar", href: route("general-ledger.index") },
        { label: "Ringkasan", href: route("general-ledger.summary") },
    ],
});

export default GeneralLedgerSummary;
