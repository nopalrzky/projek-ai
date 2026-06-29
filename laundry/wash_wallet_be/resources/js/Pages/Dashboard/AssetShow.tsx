import { Head, Link } from "@inertiajs/react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import {
    ArrowLeft,
    Wallet,
    TrendingUp,
    TrendingDown,
    Building2,
    Hash,
} from "lucide-react";
import Table from "@/Components/Table/Table";
import { ColumnDef } from "@tanstack/react-table";
import { AssetShowProps, TransactionalAccount } from "./types";

function AssetShow({
    account,
    transactionalAccounts,
    summary,
}: AssetShowProps) {
    const columns: ColumnDef<TransactionalAccount>[] = [
        {
            accessorKey: "code",
            header: "Kode Akun",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Hash
                        className="w-4 h-4"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-sm font-mono font-medium"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.code}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: "Nama Akun",
            cell: ({ row }) => (
                <div>
                    <p
                        className="text-sm font-medium mb-1"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.name}
                    </p>
                    <div className="flex items-center gap-2">
                        <Building2
                            className="w-3 h-3"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {row.original.transactionCount} Transaksi
                        </p>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "totalDebit",
            header: "Total Debit",
            cell: ({ row }) => (
                <p
                    className="text-sm font-bold text-right"
                    style={{ color: "var(--color-success-600)" }}
                >
                    {row.original.formattedDebit}
                </p>
            ),
        },
        {
            accessorKey: "totalCredit",
            header: "Total Kredit",
            cell: ({ row }) => (
                <p
                    className="text-sm font-bold text-right"
                    style={{ color: "var(--color-error-600)" }}
                >
                    {row.original.formattedCredit}
                </p>
            ),
        },
        {
            accessorKey: "balance",
            header: "Saldo",
            cell: ({ row }) => (
                <p
                    className="text-sm font-bold text-right"
                    style={{
                        color:
                            row.original.balance >= 0
                                ? "var(--color-primary-600)"
                                : "var(--color-error-600)",
                    }}
                >
                    {row.original.formattedBalance}
                </p>
            ),
        },
    ];

    return (
        <>
            <Head title={`Detail ${account.name}`} />

            <div
                className="p-4 sm:p-6 lg:p-8 space-y-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 hover:shadow-md"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <ArrowLeft
                            className="w-5 h-5"
                            style={{ color: "var(--color-text-secondary)" }}
                        />
                    </Link>

                    <div>
                        <h1
                            className="text-2xl font-bold mb-1"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {account.name}
                        </h1>
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Kode Akun: {account.code} • {summary.totalAccounts}{" "}
                            Akun Transaksional
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        className="rounded-xl p-6"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-success-50)",
                                }}
                            >
                                <TrendingUp
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Total Debit
                            </p>
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            {summary.formattedDebit}
                        </p>
                    </div>

                    <div
                        className="rounded-xl p-6"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-error-50)",
                                }}
                            >
                                <TrendingDown
                                    className="w-5 h-5"
                                    style={{ color: "var(--color-error-600)" }}
                                />
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Total Kredit
                            </p>
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-error-600)" }}
                        >
                            {summary.formattedCredit}
                        </p>
                    </div>

                    <div
                        className="rounded-xl p-6"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            border: "1px solid var(--color-border)",
                        }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-50)",
                                }}
                            >
                                <Wallet
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Total Saldo
                            </p>
                        </div>
                        <p
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-primary-600)" }}
                        >
                            {summary.formattedBalance}
                        </p>
                    </div>
                </div>

                {/* Transactional Accounts Table */}
                <div
                    className="rounded-xl p-6"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                    }}
                >
                    <h3
                        className="text-lg font-bold mb-6"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Daftar Akun Transaksional
                    </h3>

                    {transactionalAccounts.length > 0 ? (
                        <Table
                            data={transactionalAccounts}
                            columns={columns}
                            enablePagination={false}
                            enableSorting={true}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Belum ada akun transaksional di bawah kategori
                                ini
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

AssetShow.layout = withAuthenticatedLayout({
    title: "Detail Aset",
    searchable: false,
});

export default AssetShow;
