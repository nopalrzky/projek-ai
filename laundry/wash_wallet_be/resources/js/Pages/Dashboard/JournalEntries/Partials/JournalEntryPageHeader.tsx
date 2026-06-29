import React from "react";
import {
    Building2,
    Calendar,
    FileText,
    Hash,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatDate } from "@/lib/utils";
import { JournalEntryPageHeaderProps } from "../types";

const JournalEntryPageHeader: React.FC<JournalEntryPageHeaderProps> = ({
    journalEntry,
    isLoading = false,
}) => {
    const isBalanced = () => {
        const details = journalEntry.journalDetails || [];
        const totalDebit = details.reduce(
            (sum, detail) => sum + (detail.debit || 0),
            0
        );
        const totalCredit = details.reduce(
            (sum, detail) => sum + (detail.credit || 0),
            0
        );
        return totalDebit === totalCredit;
    };

    return (
        <Card
            variant="elevated"
            className="p-6 mb-6 backdrop-blur-sm border-border/50"
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-2">
                                <h1
                                    className="text-2xl lg:text-3xl font-bold leading-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {journalEntry.transactionNumber}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={
                                            journalEntry.isManual
                                                ? "info"
                                                : "success"
                                        }
                                        className="font-semibold"
                                    >
                                        {journalEntry.isManual
                                            ? "Manual"
                                            : "Otomatis"}
                                    </Badge>
                                    <Badge
                                        variant={
                                            isBalanced() ? "success" : "error"
                                        }
                                        className="font-semibold"
                                    >
                                        {isBalanced() ? (
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Seimbang
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1">
                                                <XCircle className="w-3 h-3" />
                                                Tidak Seimbang
                                            </div>
                                        )}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journal Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Description */}
                        {journalEntry.description && (
                            <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <FileText
                                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-sm font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Deskripsi
                                        </p>
                                        <p
                                            className="text-sm leading-relaxed"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {journalEntry.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Date & Outlet */}
                        <div className="space-y-3">
                            {/* Date */}
                            <div className="flex items-center gap-3">
                                <Calendar
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Tanggal Transaksi
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatDate(journalEntry.date)}
                                    </p>
                                </div>
                            </div>

                            {/* Outlet */}
                            {journalEntry.outlet && (
                                <div className="flex items-center gap-3">
                                    <Building2
                                        className="w-5 h-5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Outlet
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {journalEntry.outlet.name}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reference Info */}
                    {journalEntry.referenceType && (
                        <div
                            className="flex items-center gap-3 pt-4 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <Hash
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <span
                                className="text-xs"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Referensi: {journalEntry.referenceType}
                                {journalEntry.referenceId &&
                                    ` #${journalEntry.referenceId}`}
                            </span>
                        </div>
                    )}

                    {/* Additional Information */}
                    <div
                        className="pt-4 border-t"
                        style={{ borderColor: "var(--color-border)" }}
                    >
                        <div className="flex items-center gap-3">
                            <Calendar
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <span
                                className="text-xs"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Dibuat: {formatDate(journalEntry.createdAt)}
                            </span>
                            {journalEntry.updatedAt !==
                                journalEntry.createdAt && (
                                <>
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        •
                                    </span>
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Diperbarui:{" "}
                                        {formatDate(journalEntry.updatedAt)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Warning for automatic entries */}
            {!journalEntry.isManual && (
                <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-blue-800 text-xs font-bold">
                                i
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
                                Jurnal Otomatis
                            </h4>
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Jurnal ini dibuat secara otomatis oleh sistem
                                dan tidak dapat diubah atau dihapus secara
                                manual.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning for unbalanced entries */}
            {!isBalanced() && (
                <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-red-800 text-xs font-bold">
                                !
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                                Jurnal Tidak Seimbang
                            </h4>
                            <p className="text-xs text-red-700 dark:text-red-300">
                                Total debit dan kredit tidak sama. Silakan
                                periksa kembali detail jurnal.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default JournalEntryPageHeader;
