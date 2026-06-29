import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import Table from "@/Components/Table/Table";
import { Card } from "@/Components/Card";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { JournalDetail, JournalEntry } from "@/types";

interface JournalEntryDetailsIndexProps {
    journalEntry: JournalEntry;
    journalDetails: JournalDetail[];
    isLoading?: boolean;
}

const JournalEntryDetailsIndex: React.FC<JournalEntryDetailsIndexProps> = ({
    journalEntry,
    journalDetails = [],
    isLoading = false,
}) => {
    const columns: ColumnDef<JournalDetail>[] = useMemo(
        () => [
            {
                accessorKey: "account.code",
                header: "Kode Akun",
                cell: ({ row }) => (
                    <span
                        className="font-mono text-sm"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.account?.code || "-"}
                    </span>
                ),
                size: 120,
            },
            {
                accessorKey: "account.name",
                header: "Nama Akun",
                cell: ({ row }) => (
                    <div className="space-y-1">
                        <div
                            className="font-medium"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {row.original.account?.name || "-"}
                        </div>
                    </div>
                ),
                size: 250,
            },
            {
                accessorKey: "debit",
                header: "Debit",
                cell: ({ row }) => {
                    const amount = row.original.debit || 0;
                    return amount > 0 ? (
                        <div className="flex items-center gap-2">
                            <TrendingDown
                                className="w-4 h-4"
                                style={{ color: "var(--color-error-600)" }}
                            />
                            <span
                                className="font-semibold"
                                style={{ color: "var(--color-error-600)" }}
                            >
                                {formatCurrency(amount)}
                            </span>
                        </div>
                    ) : (
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            -
                        </span>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "credit",
                header: "Kredit",
                cell: ({ row }) => {
                    const amount = row.original.credit || 0;
                    return amount > 0 ? (
                        <div className="flex items-center gap-2">
                            <TrendingUp
                                className="w-4 h-4"
                                style={{ color: "var(--color-success-600)" }}
                            />
                            <span
                                className="font-semibold"
                                style={{ color: "var(--color-success-600)" }}
                            >
                                {formatCurrency(amount)}
                            </span>
                        </div>
                    ) : (
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            -
                        </span>
                    );
                },
                size: 150,
            },
        ],
        []
    );

    const totalDebit = journalDetails.reduce(
        (sum, detail) => sum + (detail.debit || 0),
        0
    );
    const totalCredit = journalDetails.reduce(
        (sum, detail) => sum + (detail.credit || 0),
        0
    );

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <FileText
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                Detail Jurnal ({journalDetails.length})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Daftar akun dalam jurnal{" "}
                                {journalEntry.transactionNumber}
                            </p>
                        </div>
                    </div>
                </div>

                <Table
                    data={journalDetails}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={false}
                    enablePagination={true}
                    emptyMessage="Belum ada detail jurnal"
                    pageSize={10}
                />

                {/* Total Summary */}
                <div
                    className="mt-6 pt-6 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-error-50)",
                            }}
                        >
                            <p
                                className="text-sm font-medium mb-1"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Debit
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-error-700)",
                                }}
                            >
                                {formatCurrency(totalDebit)}
                            </p>
                        </div>
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-50)",
                            }}
                        >
                            <p
                                className="text-sm font-medium mb-1"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Kredit
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-success-700)",
                                }}
                            >
                                {formatCurrency(totalCredit)}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default JournalEntryDetailsIndex;
