import React from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    FileText,
    Calendar,
    Building2,
    Hash,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Info,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { JournalEntryOverviewProps } from "../types";

const JournalEntryOverview: React.FC<JournalEntryOverviewProps> = ({
    journalEntry,
}) => {
    const details = journalEntry.journalDetails || [];

    const totalDebit = details.reduce(
        (sum, detail) => sum + (detail.debit || 0),
        0
    );
    const totalCredit = details.reduce(
        (sum, detail) => sum + (detail.credit || 0),
        0
    );
    const isBalanced = totalDebit === totalCredit;
    const difference = Math.abs(totalDebit - totalCredit);

    return (
        <div className="space-y-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Journal Information Card */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 rounded-lg"
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
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Informasi Jurnal
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {/* Transaction Number */}
                        <div className="flex items-start gap-3">
                            <Hash
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Nomor Transaksi
                                </p>
                                <p
                                    className="text-sm font-mono font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {journalEntry.transactionNumber}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-3">
                            <Calendar
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            />
                            <div className="flex-1 min-w-0">
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

                        {/* Description */}
                        {journalEntry.description && (
                            <div className="flex items-start gap-3">
                                <Info
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-sm font-medium"
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
                        )}

                        {/* Outlet */}
                        {journalEntry.outlet && (
                            <div className="flex items-start gap-3">
                                <Building2
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Outlet
                                    </p>
                                    <p
                                        className="text-sm font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {journalEntry.outlet.name}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {journalEntry.outlet.code}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Reference */}
                        {journalEntry.referenceType && (
                            <div className="flex items-start gap-3">
                                <FileText
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Referensi
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {journalEntry.referenceType}
                                        {journalEntry.referenceId &&
                                            ` #${journalEntry.referenceId}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Type */}
                        <div
                            className="flex items-center justify-between pt-4 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Tipe:
                            </span>
                            <Badge
                                variant={
                                    journalEntry.isManual ? "info" : "success"
                                }
                            >
                                {journalEntry.isManual ? "Manual" : "Otomatis"}
                            </Badge>
                        </div>

                        {/* Balance Status */}
                        <div
                            className="flex items-center justify-between pt-4 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <span
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Status:
                            </span>
                            <Badge variant={isBalanced ? "success" : "error"}>
                                {isBalanced ? (
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
                </Card>

                {/* Balance Summary Card */}
                <Card variant="elevated" className="p-6 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <DollarSign
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Ringkasan Saldo
                        </h3>
                    </div>

                    {/* Balance Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Total Debit */}
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="p-2 rounded-lg"
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
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Debit
                                </span>
                            </div>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {formatCurrency(totalDebit)}
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {details.filter((d) => d.debit > 0).length}{" "}
                                transaksi
                            </p>
                        </div>

                        {/* Total Credit */}
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="p-2 rounded-lg"
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
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Kredit
                                </span>
                            </div>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {formatCurrency(totalCredit)}
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {details.filter((d) => d.credit > 0).length}{" "}
                                transaksi
                            </p>
                        </div>

                        {/* Difference */}
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: isBalanced
                                    ? "var(--color-success-50)"
                                    : "var(--color-error-50)",
                            }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="p-2 rounded-lg"
                                    style={{
                                        backgroundColor: isBalanced
                                            ? "var(--color-success-100)"
                                            : "var(--color-error-100)",
                                    }}
                                >
                                    {isBalanced ? (
                                        <CheckCircle2
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-success-600)",
                                            }}
                                        />
                                    ) : (
                                        <XCircle
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-error-600)",
                                            }}
                                        />
                                    )}
                                </div>
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Selisih
                                </span>
                            </div>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: isBalanced
                                        ? "var(--color-success-700)"
                                        : "var(--color-error-700)",
                                }}
                            >
                                {formatCurrency(difference)}
                            </p>
                            <p
                                className="text-xs mt-1"
                                style={{
                                    color: isBalanced
                                        ? "var(--color-success-600)"
                                        : "var(--color-error-600)",
                                }}
                            >
                                {isBalanced ? "Seimbang" : "Tidak Seimbang"}
                            </p>
                        </div>
                    </div>

                    {/* Journal Details Summary */}
                    <div className="mt-6">
                        <h4
                            className="text-sm font-semibold mb-3"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Detail Transaksi
                        </h4>
                        <div className="space-y-2">
                            {details.slice(0, 5).map((detail, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-surface-tertiary)",
                                    }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-sm font-medium truncate"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {detail.account?.name || "-"}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {detail.account?.code || "-"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <div className="text-right">
                                            <p
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Debit
                                            </p>
                                            <p
                                                className="text-sm font-semibold"
                                                style={{
                                                    color: "var(--color-error-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    detail.debit || 0
                                                )}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Kredit
                                            </p>
                                            <p
                                                className="text-sm font-semibold"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            >
                                                {formatCurrency(
                                                    detail.credit || 0
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {details.length > 5 && (
                            <p
                                className="text-xs text-center mt-3"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                +{details.length - 5} detail lainnya
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default JournalEntryOverview;
