import { useCallback, useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Columns,
    Filter,
    RotateCcw,
    Calendar,
    FileText,
    TrendingUp,
    TrendingDown,
    Search,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { SelectInput, DateInput, Select } from "@/Components/Input";
import { Badge } from "@/Components/Badge";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";

interface LedgerTransaction {
    id: number;
    date: string;
    transactionNumber: string;
    description: string;
    memo?: string;
    debit: number;
    credit: number;
    mutation: number;
    runningBalance: number;
}

interface LedgerData {
    account: {
        id: number;
        code: string;
        name: string;
        type: string;
    };
    opening_balance: number;
    closing_balance: number;
    transactions: LedgerTransaction[];
}

interface ComparisonData {
    outlet: any;
    period: {
        start: string;
        end: string;
    };
    ledgers: LedgerData[];
}

interface CompareProps {
    comparison: ComparisonData | null;
    accounts: Array<{ id: number; name: string; code: string; type: string }>;
    outlets: Array<{ id: number; name: string; code: string }>;
    filters: {
        outletId: number | null;
        accountIds: number[];
        startDate: string;
        endDate: string;
    };
}

function GeneralLedgerCompare({
    comparison,
    accounts,
    outlets,
    filters,
}: CompareProps) {
    const [localFilters, setLocalFilters] = useState(filters);

    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    const handleFilterChange = useCallback((field: string, value: unknown) => {
        setLocalFilters((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleShowReport = useCallback(() => {
        router.get(
            route("general-ledger.compare"),
            {
                outletId: localFilters.outletId,
                accountIds: localFilters.accountIds,
                startDate: localFilters.startDate,
                endDate: localFilters.endDate,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, [localFilters]);

    const handleResetFilters = useCallback(() => {
        router.get(route("general-ledger.compare"));
    }, []);

    const outletOptions = [
        { value: "", label: "Pilih Outlet..." },
        ...(outlets?.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
            description: outlet.code,
        })) || []),
    ];

    const accountOptions = (accounts || []).map((account) => ({
        value: account.id,
        label: `${account.code} - ${account.name}`,
        group: account.type,
    }));

    const canSubmitFilters = Boolean(
        localFilters.outletId &&
        localFilters.accountIds &&
        localFilters.accountIds.length > 0 &&
        localFilters.startDate &&
        localFilters.endDate,
    );

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
            <Head title="Perbandingan Buku Besar" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Perbandingan Buku Besar"
                        subtitle="Bandingkan riwayat transaksi antar beberapa akun sekaligus"
                        icon={Columns}
                    />

                    {/* Filter Card */}
                    <Card className="p-6">
                        <div className="space-y-6">
                            <div
                                className="flex items-center gap-3 pb-4 border-b"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Filter
                                    className="w-5 h-5 text-primary-600"
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

                                <div className="lg:col-span-1">
                                    <Select
                                        label="Akun (Bisa pilih banyak)"
                                        multiple
                                        placeholder="Pilih akun..."
                                        value={localFilters.accountIds as any}
                                        onChange={(e: any) =>
                                            handleFilterChange(
                                                "accountIds",
                                                e.target.value,
                                            )
                                        }
                                        options={accountOptions}
                                        searchable
                                        groupBy="group"
                                        required
                                    />
                                </div>

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

                            <div
                                className="flex items-center justify-end gap-3 pt-4 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
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
                                    leftIcon={<Search className="w-4 h-4" />}
                                >
                                    Bandingkan
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {comparison ? (
                        <div className="space-y-8">
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Hasil Perbandingan Buku Besar
                                        </h2>
                                        <p
                                            className="text-sm mt-1"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Outlet:{" "}
                                            <span className="font-semibold">
                                                {comparison.outlet.name}
                                            </span>{" "}
                                            | Periode:{" "}
                                            {formatDateRange(
                                                comparison.period.start,
                                                comparison.period.end,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {comparison.ledgers.map((ledger) => (
                                    <motion.div
                                        key={ledger.account.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Card className="overflow-hidden flex flex-col h-full">
                                            <div
                                                className="p-4 border-b bg-gray-50/50 flex items-center justify-between"
                                                style={{
                                                    borderColor:
                                                        "var(--color-border)",
                                                    backgroundColor:
                                                        "var(--color-gray-50)",
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        className="text-sm font-bold"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {ledger.account.code}
                                                    </div>
                                                    <div
                                                        className="text-xs uppercase font-medium"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {ledger.account.name}
                                                    </div>
                                                </div>
                                                <Badge variant="outline">
                                                    {ledger.account.type}
                                                </Badge>
                                            </div>

                                            <div
                                                className="p-4 grid grid-cols-2 gap-4 bg-white"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-surface)",
                                                }}
                                            >
                                                <div
                                                    className="p-3 rounded-lg bg-gray-50 flex flex-col items-center justify-center border"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-gray-50)",
                                                        borderColor:
                                                            "var(--color-border)",
                                                    }}
                                                >
                                                    <span
                                                        className="text-[10px] uppercase font-bold text-gray-500"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    >
                                                        Saldo Awal
                                                    </span>
                                                    <span
                                                        className="text-sm font-bold"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {formatCurrency(
                                                            ledger.opening_balance,
                                                        )}
                                                    </span>
                                                </div>
                                                <div
                                                    className="p-3 rounded-lg bg-gray-50 flex flex-col items-center justify-center border"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-gray-50)",
                                                        borderColor:
                                                            "var(--color-border)",
                                                    }}
                                                >
                                                    <span
                                                        className="text-[10px] uppercase font-bold text-gray-500"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    >
                                                        Saldo Akhir
                                                    </span>
                                                    <span
                                                        className="text-sm font-bold"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {formatCurrency(
                                                            ledger.closing_balance,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-x-auto min-h-[300px] max-h-[400px]">
                                                <table className="w-full text-xs">
                                                    <thead
                                                        className="sticky top-0 bg-white border-b"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--color-surface)",
                                                            borderColor:
                                                                "var(--color-border)",
                                                        }}
                                                    >
                                                        <tr>
                                                            <th className="px-4 py-2 text-left">
                                                                Tgl
                                                            </th>
                                                            <th className="px-4 py-2 text-left">
                                                                Keterangan
                                                            </th>
                                                            <th className="px-4 py-2 text-right">
                                                                Debit
                                                            </th>
                                                            <th className="px-4 py-2 text-right">
                                                                Kredit
                                                            </th>
                                                            <th className="px-4 py-2 text-right">
                                                                Saldo
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody
                                                        className="divide-y"
                                                        style={{
                                                            borderColor:
                                                                "var(--color-border)",
                                                        }}
                                                    >
                                                        {ledger.transactions
                                                            .length > 0 ? (
                                                            ledger.transactions.map(
                                                                (tx) => (
                                                                    <tr
                                                                        key={
                                                                            tx.id
                                                                        }
                                                                    >
                                                                        <td className="px-4 py-2 whitespace-nowrap">
                                                                            {new Date(
                                                                                tx.date,
                                                                            ).toLocaleDateString(
                                                                                "id-ID",
                                                                                {
                                                                                    day: "2-digit",
                                                                                    month: "short",
                                                                                },
                                                                            )}
                                                                        </td>
                                                                        <td className="px-4 py-2">
                                                                            <div
                                                                                className="truncate max-w-[150px]"
                                                                                title={
                                                                                    tx.description
                                                                                }
                                                                            >
                                                                                {
                                                                                    tx.description
                                                                                }
                                                                            </div>
                                                                        </td>
                                                                        <td
                                                                            className="px-4 py-2 text-right text-success-600 font-medium"
                                                                            style={{
                                                                                color:
                                                                                    tx.debit >
                                                                                    0
                                                                                        ? "var(--color-success-600)"
                                                                                        : "var(--color-text-quaternary)",
                                                                            }}
                                                                        >
                                                                            {tx.debit >
                                                                            0
                                                                                ? formatCurrency(
                                                                                      tx.debit,
                                                                                  )
                                                                                : "-"}
                                                                        </td>
                                                                        <td
                                                                            className="px-4 py-2 text-right text-error-600 font-medium"
                                                                            style={{
                                                                                color:
                                                                                    tx.credit >
                                                                                    0
                                                                                        ? "var(--color-error-600)"
                                                                                        : "var(--color-text-quaternary)",
                                                                            }}
                                                                        >
                                                                            {tx.credit >
                                                                            0
                                                                                ? formatCurrency(
                                                                                      tx.credit,
                                                                                  )
                                                                                : "-"}
                                                                        </td>
                                                                        <td
                                                                            className="px-4 py-2 text-right font-bold"
                                                                            style={{
                                                                                color: "var(--color-text-primary)",
                                                                            }}
                                                                        >
                                                                            {formatCurrency(
                                                                                tx.runningBalance,
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )
                                                        ) : (
                                                            <tr>
                                                                <td
                                                                    colSpan={5}
                                                                    className="px-4 py-8 text-center text-gray-400"
                                                                >
                                                                    Tidak ada
                                                                    transaksi
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="p-12 text-center">
                            <div className="flex flex-col items-center justify-center opacity-50">
                                <Columns className="w-16 h-16 mb-4" />
                                <p className="text-lg font-medium">
                                    Silakan pilih outlet, minimal satu akun, dan
                                    periode untuk dibandingkan
                                </p>
                            </div>
                        </Card>
                    )}
                </div>
            </motion.div>
        </>
    );
}

GeneralLedgerCompare.layout = withAuthenticatedLayout({
    title: "Perbandingan Buku Besar",
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Buku Besar", href: route("general-ledger.index") },
        { label: "Bandingkan", href: route("general-ledger.compare") },
    ],
});

export default GeneralLedgerCompare;
