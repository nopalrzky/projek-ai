import { useCallback, useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    BookOpen,
    Filter,
    Printer,
    Download,
    RotateCcw,
    TrendingUp,
    TrendingDown,
    Minus,
    Calendar,
    FileText,
    AlertCircle,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { SelectInput, DateInput } from "@/Components/Input";
import { Badge } from "@/Components/Badge";
import { Alert } from "@/Components/Alert";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { GeneralLedgerIndexProps } from "@/types/general_ledger";

function GeneralLedgerIndex({
    outlets,
    accounts,
    filters,
    ledger,
    flash,
}: GeneralLedgerIndexProps) {
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
            route("general-ledger.index"),
            {
                outletId: localFilters.outletId,
                accountId: localFilters.accountId,
                startDate: localFilters.startDate,
                endDate: localFilters.endDate,
            },
            { preserveState: true, preserveScroll: true },
        );
    }, [localFilters]);

    const handleResetFilters = useCallback(() => {
        setLocalFilters({
            outletId: undefined,
            accountId: undefined,
            startDate: "",
            endDate: "",
        });
        router.get(route("general-ledger.index"));
    }, []);

    const handlePrint = useCallback(() => {
        router.get(route("general-ledger.print"), {
            outletId: localFilters.outletId,
            accountId: localFilters.accountId,
            startDate: localFilters.startDate,
            endDate: localFilters.endDate,
        });
    }, [localFilters]);

    const handleExport = useCallback(() => {
        router.post(
            route("general-ledger.export"),
            {
                outletId: localFilters.outletId,
                accountId: localFilters.accountId,
                startDate: localFilters.startDate,
                endDate: localFilters.endDate,
                format: "excel",
            },
            { preserveState: true, preserveScroll: true },
        );
    }, [localFilters]);

    const outletOptions = [
        { value: "", label: "Pilih Outlet..." },
        ...(outlets?.map((outlet) => ({
            value: outlet.id.toString(),
            label: outlet.name,
            description: outlet.code,
        })) || []),
    ];

    const accountOptions = [
        { value: "", label: "Pilih Akun..." },
        ...(accounts?.map((account) => ({
            value: account.id.toString(),
            label: `${account.code} - ${account.name}`,
            description: account.type,
        })) || []),
    ];

    const netChange = ledger
        ? ledger.closingBalance - ledger.openingBalance
        : 0;

    const canSubmitFilters = useMemo(
        () =>
            Boolean(
                localFilters.outletId &&
                localFilters.accountId &&
                localFilters.startDate &&
                localFilters.endDate,
            ),
        [localFilters],
    );

    const formatDateRange = (startDate: string, endDate: string) => {
        const formatDate = (date: Date) =>
            date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        return `${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))}`;
    };

    return (
        <>
            <Head title="Buku Besar" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-6"
            >
                <div className=" mx-auto space-y-6">
                    <PageHeader
                        title="Buku Besar"
                        subtitle="Lihat riwayat transaksi dan saldo akun"
                        icon={BookOpen}
                        variant="default"
                    />

                    {flash?.success && (
                        <Alert
                            variant="success"
                            title="Berhasil"
                            description={flash.success}
                        />
                    )}

                    {flash?.error && (
                        <Alert
                            variant="error"
                            title="Error"
                            description={flash.error}
                        />
                    )}

                    {/* Filter Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
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
                                            localFilters.outletId?.toString() ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "outletId",
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            )
                                        }
                                        options={outletOptions}
                                        required
                                        searchable
                                    />

                                    <SelectInput
                                        label="Akun"
                                        placeholder="Pilih akun..."
                                        value={
                                            localFilters.accountId?.toString() ||
                                            ""
                                        }
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "accountId",
                                                e.target.value
                                                    ? parseInt(e.target.value)
                                                    : undefined,
                                            )
                                        }
                                        options={accountOptions}
                                        required
                                        searchable
                                        renderOption={(option) => (
                                            <div className="flex flex-col">
                                                <div className="font-medium">
                                                    {option.label}
                                                </div>
                                                {option.description && (
                                                    <div className="text-xs text-tertiary">
                                                        {option.description}
                                                    </div>
                                                )}
                                            </div>
                                        )}
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
                                        leftIcon={
                                            <Calendar className="w-4 h-4" />
                                        }
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
                                        leftIcon={
                                            <Calendar className="w-4 h-4" />
                                        }
                                        min={localFilters.startDate}
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 border-t border-color pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleResetFilters}
                                        leftIcon={
                                            <RotateCcw className="w-4 h-4" />
                                        }
                                    >
                                        Reset
                                    </Button>

                                    <Button
                                        variant="primary"
                                        onClick={handleShowReport}
                                        disabled={!canSubmitFilters}
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

                    {ledger ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Account header + actions */}
                            <Card className="card p-6">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-primary">
                                            {ledger.account.code} -{" "}
                                            {ledger.account.name}
                                        </h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Badge variant="info">
                                                {ledger.account.type}
                                            </Badge>
                                            <span className="text-sm text-secondary">
                                                Periode:{" "}
                                                {formatDateRange(
                                                    ledger.period.start,
                                                    ledger.period.end,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={handlePrint}
                                            disabled={!canSubmitFilters}
                                            leftIcon={
                                                <Printer className="w-4 h-4" />
                                            }
                                        >
                                            Cetak
                                        </Button>
                                        {/* Export button hidden until backend fully implemented */}
                                    </div>
                                </div>
                            </Card>

                            {/* Summary stat cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="card p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-secondary">
                                                Saldo Awal
                                            </p>
                                            <p className="text-2xl font-bold mt-1 text-primary">
                                                {formatCurrency(
                                                    ledger.openingBalance,
                                                )}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-surface-muted">
                                            <Minus className="w-5 h-5 text-tertiary" />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-secondary">
                                                Perubahan Bersih
                                            </p>
                                            <p
                                                className={`text-2xl font-bold mt-1 ${netChange >= 0 ? "text-[var(--color-success-600)]" : "text-[var(--color-error-600)]"}`}
                                            >
                                                {netChange >= 0 ? "+" : ""}
                                                {formatCurrency(netChange)}
                                            </p>
                                        </div>
                                        <div
                                            className={`p-3 rounded-lg ${netChange >= 0 ? "bg-success-50" : "bg-error-50"}`}
                                        >
                                            {netChange >= 0 ? (
                                                <TrendingUp className="w-5 h-5 text-[var(--color-success-600)]" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-[var(--color-error-600)]" />
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-secondary">
                                                Saldo Akhir
                                            </p>
                                            <p
                                                className={`text-2xl font-bold mt-1 ${ledger.closingBalance >= 0 ? "text-[var(--color-success-600)]" : "text-[var(--color-error-600)]"}`}
                                            >
                                                {formatCurrency(
                                                    ledger.closingBalance,
                                                )}
                                            </p>
                                        </div>
                                        <div
                                            className={`p-3 rounded-lg ${ledger.closingBalance >= 0 ? "bg-success-50" : "bg-error-50"}`}
                                        >
                                            {ledger.closingBalance >= 0 ? (
                                                <TrendingUp className="w-5 h-5 text-[var(--color-success-600)]" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-[var(--color-error-600)]" />
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Transactions table */}
                            <Card className="card overflow-hidden bg-surface">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-surface-muted border-color">
                                                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Tanggal
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary">
                                                    No. Referensi
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Keterangan
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Debit
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Kredit
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-secondary">
                                                    Saldo
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            <tr className="bg-[var(--color-primary-50)]">
                                                <td
                                                    colSpan={3}
                                                    className="px-6 py-4 font-semibold text-[var(--color-primary-700)]"
                                                >
                                                    Saldo Awal
                                                </td>
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4 text-right font-bold text-[var(--color-primary-700)]">
                                                    {formatCurrency(
                                                        ledger.openingBalance,
                                                    )}
                                                </td>
                                            </tr>

                                            {ledger.transactions.length > 0 ? (
                                                ledger.transactions.map(
                                                    (transaction, index) => (
                                                        <tr
                                                            key={transaction.id}
                                                            className={
                                                                index % 2 === 0
                                                                    ? "bg-background"
                                                                    : "bg-surface"
                                                            }
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">
                                                                {new Date(
                                                                    transaction.date,
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    },
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-secondary">
                                                                {
                                                                    transaction.transactionNumber
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-primary">
                                                                <div>
                                                                    {
                                                                        transaction.description
                                                                    }
                                                                </div>
                                                                {transaction.memo && (
                                                                    <div className="text-xs mt-1 text-tertiary">
                                                                        {
                                                                            transaction.memo
                                                                        }
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td
                                                                className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.debit > 0 ? "text-[var(--color-success-600)]" : "text-quaternary"}`}
                                                            >
                                                                {transaction.debit >
                                                                0
                                                                    ? formatCurrency(
                                                                          transaction.debit,
                                                                      )
                                                                    : "-"}
                                                            </td>
                                                            <td
                                                                className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${transaction.credit > 0 ? "text-[var(--color-error-600)]" : "text-quaternary"}`}
                                                            >
                                                                {transaction.credit >
                                                                0
                                                                    ? formatCurrency(
                                                                          transaction.credit,
                                                                      )
                                                                    : "-"}
                                                            </td>
                                                            <td
                                                                className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${transaction.runningBalance >= 0 ? "text-primary" : "text-[var(--color-error-600)]"}`}
                                                            >
                                                                {formatCurrency(
                                                                    transaction.runningBalance,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={6}
                                                        className="px-6 py-8 text-center"
                                                    >
                                                        <div className="flex flex-col items-center justify-center">
                                                            <FileText className="w-12 h-12 mb-3 text-quaternary" />
                                                            <p className="text-sm text-secondary">
                                                                Tidak ada
                                                                transaksi pada
                                                                periode ini
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                            <tr className="bg-[var(--color-primary-50)]">
                                                <td
                                                    colSpan={3}
                                                    className="px-6 py-4 font-semibold text-[var(--color-primary-700)]"
                                                >
                                                    Saldo Akhir
                                                </td>
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4" />
                                                <td className="px-6 py-4 text-right font-bold text-[var(--color-primary-700)]">
                                                    {formatCurrency(
                                                        ledger.closingBalance,
                                                    )}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <Card className="card p-12 bg-surface">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <div className="p-4 rounded-full mb-4 bg-info-50">
                                        <AlertCircle className="w-12 h-12 text-info-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-primary">
                                        Pilih Filter untuk Menampilkan Laporan
                                    </h3>
                                    <p className="text-sm max-w-md text-secondary">
                                        Silakan pilih outlet, akun, dan periode
                                        tanggal pada filter di atas, kemudian
                                        klik tombol "Tampilkan Laporan" untuk
                                        melihat buku besar.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </>
    );
}

GeneralLedgerIndex.layout = withAuthenticatedLayout({
    title: "Buku Besar",
    searchable: true,
    breadcrumbs: [{ label: "Buku Besar", href: route("general-ledger.index") }],
});

export default GeneralLedgerIndex;
