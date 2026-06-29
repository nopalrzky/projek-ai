"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, Calendar, Hash, LinkIcon } from "lucide-react";
import type { JournalEntry } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const createJournalEntryColumns = (
    onView: (entry: JournalEntry) => void,
    onEdit: (entry: JournalEntry) => void,
    onDelete: (entry: JournalEntry) => void,
): ColumnDef<JournalEntry>[] => [
    {
        accessorKey: "transactionNumber",
        header: "No. Transaksi",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 min-w-[150px]">
                <div className="flex items-center gap-2">
                    <Hash
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--color-primary-600)" }}
                    />
                    <span
                        className="text-sm font-mono font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {row.original.transactionNumber}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar
                        className="w-3 h-3"
                        style={{ color: "var(--color-text-tertiary)" }}
                    />
                    <span
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        {formatDate(row.original.date, "DD MMMM YYYY")}
                    </span>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "outlet.name",
        header: "Outlet",
        cell: ({ row }) => (
            <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {row.original.outlet?.name || "-"}
                    </span>
                    {row.original.outlet?.code && (
                        <span
                            className="text-xs font-mono"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {row.original.outlet.code}
                        </span>
                    )}
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "description",
        header: "Deskripsi",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1 max-w-[300px]">
                <div className="flex items-start gap-2">
                    <span
                        className="text-sm line-clamp-2"
                        style={{ color: "var(--color-text-secondary)" }}
                        title={
                            row.original.description || "Tidak ada deskripsi"
                        }
                    >
                        {row.original.description || "Tidak ada deskripsi"}
                    </span>
                </div>
                {row.original.referenceType && (
                    <div className="flex items-center gap-1 pl-6">
                        <LinkIcon
                            className="w-3 h-3"
                            style={{ color: "var(--color-info-500)" }}
                        />
                        <span
                            className="text-xs"
                            style={{ color: "var(--color-info-600)" }}
                        >
                            Ref: {row.original.referenceType}
                            {row.original.referenceId &&
                                ` #${row.original.referenceId}`}
                        </span>
                    </div>
                )}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "isManual",
        header: "Jenis",
        cell: ({ row }) => (
            <Badge
                variant={row.original.isManual ? "warning" : "info"}
                size="sm"
            >
                <div className="flex items-center gap-1">
                    {row.original.isManual ? <>Manual</> : <>Otomatis</>}
                </div>
            </Badge>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "totalAmount",
        header: "Total Nominal",
        cell: ({ row }) => {
            const journalDetail = row.original.journalDetails || [];
            const totalDebit = journalDetail.reduce(
                (sum, detail) =>
                    sum + (Number.parseFloat(String(detail.debit)) || 0),
                0,
            );

            const totalCredit = journalDetail.reduce(
                (sum, detail) =>
                    sum + (Number.parseFloat(String(detail.credit)) || 0),
                0,
            );
            return (
                <div className="flex flex-col gap-1">
                    <div
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-primary-600)" }}
                    >
                        {formatCurrency(row.original.totalAmount)}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <div
                            className="flex items-center gap-1"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            <span>D: {formatCurrency(totalDebit)}</span>
                        </div>
                        <span style={{ color: "var(--color-text-tertiary)" }}>
                            |
                        </span>
                        <div
                            className="flex items-center gap-1"
                            style={{ color: "var(--color-error-600)" }}
                        >
                            <span>K: {formatCurrency(totalCredit)}</span>
                        </div>
                    </div>
                </div>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "journalDetails",
        header: "Detail Entry",
        cell: ({ row }) => {
            const detailsCount = row.original.journalDetails?.length || 0;
            const accounts =
                row.original.journalDetails
                    ?.map((detail) => detail.account?.name)
                    .filter(Boolean)
                    .slice(0, 2) || [];

            return (
                <div className="flex flex-col gap-1">
                    <Badge variant="secondary" size="sm">
                        {detailsCount} Akun
                    </Badge>
                    {accounts.length > 0 && (
                        <div
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {accounts.join(", ")}
                            {detailsCount > 2 && ` +${detailsCount - 2} lagi`}
                        </div>
                    )}
                </div>
            );
        },
        enableSorting: false,
    },

    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    variant="info"
                    size="sm"
                    onClick={() => onView(row.original)}
                    leftIcon={<Eye className="w-4 h-4" />}
                    title="Lihat detail"
                />
                {row.original.isManual && !row.original.deletedAt && (
                    <>
                        <Button
                            variant="warning"
                            size="sm"
                            onClick={() => onEdit(row.original)}
                            leftIcon={<Edit className="w-4 h-4" />}
                            title="Edit jurnal entry"
                        />
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onDelete(row.original)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                            title="Hapus jurnal entry"
                        />
                    </>
                )}
            </div>
        ),
        enableSorting: false,
    },
];
