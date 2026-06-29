import { Head } from "@inertiajs/react";
import { motion } from "framer-motion";
import PageHeader from "@/Components/Page/PageHeader";
import {
    Receipt,
    Calendar,
    Building2,
    FileText,
    Paperclip,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    BookOpen,
    ExternalLink,
    Download,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Alert } from "@/Components/Alert";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { router } from "@inertiajs/react";
import { ExpenseShowProps } from "./types";
import { formatCurrency } from "@/lib/utils";
import { useState, useCallback } from "react";
import ApproveExpenseModal from "./Partials/ApproveExpenseModal";
import RejectExpenseModal from "./Partials/RejectExpenseModal";
import { Button } from "@/Components/Button";
import { CheckCircle2, XCircle } from "lucide-react";

function ExpenseShow({ expense, sourceAccounts, flash }: ExpenseShowProps) {
    const [approveModal, setApproveModal] = useState(false);
    const [rejectModal, setRejectModal] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const attachmentUrl = expense.attachmentUrl ?? expense.attachment;

    const handleConfirmApprove = useCallback(
        async (exp: any, sourceAccountId?: number) => {
            setIsApproving(true);
            router.post(
                route("expenses.approve", expense.id),
                { sourceAccountId },
                {
                    preserveScroll: true,
                    onSuccess: () => setApproveModal(false),
                    onFinish: () => setIsApproving(false),
                },
            );
        },
        [expense.id],
    );

    const handleConfirmReject = useCallback(
        async (exp: any, reason: string) => {
            setIsRejecting(true);
            router.post(
                route("expenses.reject", expense.id),
                { rejectionReason: reason },
                {
                    preserveScroll: true,
                    onSuccess: () => setRejectModal(false),
                    onFinish: () => setIsRejecting(false),
                },
            );
        },
        [expense.id],
    );
    return (
        <>
            <Head title={`Detail Pengeluaran - ${expense.formattedDate}`} />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto">
                    <PageHeader
                        title="Detail Pengeluaran"
                        subtitle={`Informasi lengkap pengeluaran tanggal ${expense.formattedDate}`}
                        icon={
                            <Receipt
                                className="w-6 h-6"
                                style={{ color: "var(--color-error-600)" }}
                            />
                        }
                        badges={
                            expense.deletedAt
                                ? [
                                      <Badge key="deleted" variant="error">
                                          Dihapus
                                      </Badge>,
                                  ]
                                : undefined
                        }
                        actions={
                            expense.status === "pending" ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setRejectModal(true)}
                                        leftIcon={
                                            <XCircle className="w-4 h-4" />
                                        }
                                    >
                                        Tolak
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => setApproveModal(true)}
                                        leftIcon={
                                            <CheckCircle2 className="w-4 h-4" />
                                        }
                                    >
                                        Setujui
                                    </Button>
                                </>
                            ) : undefined
                        }
                    >
                        {expense.deletedAt && (
                            <Alert
                                variant="warning"
                                title="Pengeluaran Terhapus"
                                description="Pengeluaran ini telah dihapus. Anda dapat memulihkannya dengan klik tombol 'Pulihkan' di atas."
                                className="mb-4"
                            />
                        )}

                        {flash?.success && (
                            <Alert
                                variant="success"
                                title="Berhasil"
                                description={flash.success}
                                className="mb-4"
                            />
                        )}

                        {flash?.error && (
                            <Alert
                                variant="error"
                                title="Error"
                                description={flash.error}
                                className="mb-4"
                            />
                        )}
                    </PageHeader>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <Card variant="elevated" className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-1">
                                        <div
                                            className="p-6 rounded-lg h-full"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-error-50)",
                                                border: "2px solid var(--color-error-200)",
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <p
                                                        className="text-sm font-medium mb-2"
                                                        style={{
                                                            color: "var(--color-error-600)",
                                                        }}
                                                    >
                                                        Total Pengeluaran
                                                    </p>
                                                    <p
                                                        className="text-3xl font-bold"
                                                        style={{
                                                            color: "var(--color-error-700)",
                                                        }}
                                                    >
                                                        {formatCurrency(
                                                            expense.amount,
                                                        )}
                                                    </p>
                                                </div>
                                                <div
                                                    className="p-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-error-100)",
                                                    }}
                                                >
                                                    <Receipt
                                                        className="w-6 h-6"
                                                        style={{
                                                            color: "var(--color-error-600)",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <TrendingUp
                                                    className="w-4 h-4"
                                                    style={{
                                                        color: "var(--color-error-500)",
                                                    }}
                                                />
                                                <span
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-error-600)",
                                                    }}
                                                >
                                                    Pengeluaran Operasional
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-2 space-y-4">
                                        {/* Date */}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Calendar
                                                    className="w-4 h-4"
                                                    style={{
                                                        color: "var(--color-text-quaternary)",
                                                    }}
                                                />
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Tanggal Pengeluaran
                                                </p>
                                            </div>
                                            <p
                                                className="text-lg font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {expense.formattedDate}
                                            </p>
                                        </div>

                                        {/* Outlet */}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Building2
                                                    className="w-4 h-4"
                                                    style={{
                                                        color: "var(--color-text-quaternary)",
                                                    }}
                                                />
                                                <p
                                                    className="text-sm font-medium"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    Outlet
                                                </p>
                                            </div>
                                            <p
                                                className="text-lg font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {expense.outletName}
                                            </p>
                                            {expense.outlet?.code && (
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    Kode: {expense.outlet.code}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>

                        {expense.description && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                            >
                                <Card variant="elevated" className="p-6">
                                    <div className="flex items-start space-x-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-primary-100)",
                                            }}
                                        >
                                            <FileText
                                                className="w-5 h-5"
                                                style={{
                                                    color: "var(--color-primary-600)",
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3
                                                className="text-lg font-semibold mb-2"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Deskripsi
                                            </h3>
                                            <p
                                                className="text-sm leading-relaxed"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {expense.description}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <Card variant="elevated" className="p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary-100)",
                                        }}
                                    >
                                        <BookOpen
                                            className="w-6 h-6"
                                            style={{
                                                color: "var(--color-primary-600)",
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
                                            Informasi Akuntansi
                                        </h3>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Pencatatan jurnal dalam sistem
                                            akuntansi
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-error-50)",
                                            borderColor:
                                                "var(--color-error-200)",
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <TrendingUp
                                                    className="w-5 h-5"
                                                    style={{
                                                        color: "var(--color-error-600)",
                                                    }}
                                                />
                                                <Badge variant="error">
                                                    DEBIT
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <p
                                                className="text-xs font-medium mb-1"
                                                style={{
                                                    color: "var(--color-error-600)",
                                                }}
                                            >
                                                Akun Beban
                                            </p>
                                            <p
                                                className="font-semibold mb-1"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {expense.expenseAccountName}
                                            </p>
                                            {expense.expenseAccount?.code && (
                                                <p
                                                    className="text-xs mb-2"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {
                                                        expense.expenseAccount
                                                            .code
                                                    }
                                                </p>
                                            )}
                                            <p
                                                className="text-lg font-bold"
                                                style={{
                                                    color: "var(--color-error-700)",
                                                }}
                                            >
                                                {formatCurrency(expense.amount)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <ArrowRight
                                            className="w-8 h-8 hidden lg:block"
                                            style={{
                                                color: "var(--color-text-quaternary)",
                                            }}
                                        />
                                        <div
                                            className="w-full h-px lg:hidden"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-border)",
                                            }}
                                        />
                                    </div>

                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-success-50)",
                                            borderColor:
                                                "var(--color-success-200)",
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                                <TrendingDown
                                                    className="w-5 h-5"
                                                    style={{
                                                        color: "var(--color-success-600)",
                                                    }}
                                                />
                                                <Badge variant="success">
                                                    KREDIT
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <p
                                                className="text-xs font-medium mb-1"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            >
                                                Sumber Dana
                                            </p>
                                            <p
                                                className="font-semibold mb-1"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {expense.sourceAccountName}
                                            </p>
                                            {expense.sourceAccount?.code && (
                                                <p
                                                    className="text-xs mb-2"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {expense.sourceAccount.code}
                                                </p>
                                            )}
                                            <p
                                                className="text-lg font-bold"
                                                style={{
                                                    color: "var(--color-success-700)",
                                                }}
                                            >
                                                {formatCurrency(expense.amount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="mt-4 p-3 rounded-lg"
                                    style={{
                                        backgroundColor: "var(--color-info-50)",
                                        border: "1px solid var(--color-info-200)",
                                    }}
                                >
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-info-700)",
                                        }}
                                    >
                                        Jurnal ini mencatat penambahan beban dan
                                        pengurangan saldo sumber dana secara
                                        otomatis
                                    </p>
                                </div>

                                {expense.journalEntry && (
                                    <div className="mt-4 p-3 rounded-lg bg-[var(--color-info-50)] border border-[var(--color-info-200)] text-[var(--color-info-700)] text-xs flex gap-2 items-start">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                        <span>
                                            Transaksi ini telah dicatat dalam
                                            jurnal akuntansi dengan nomor
                                            referensi{" "}
                                            <strong>
                                                {expense.journalEntry
                                                    .transactionNumber || "-"}
                                            </strong>
                                        </span>
                                    </div>
                                )}
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 }}
                        >
                            <Card variant="elevated" className="p-6">
                                <div className="flex items-center space-x-2 mb-4">
                                    <Paperclip
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                    <h3
                                        className="text-lg font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Lampiran
                                    </h3>
                                </div>

                                {attachmentUrl ? (
                                    <div className="space-y-4">
                                        <div className="relative group rounded-lg overflow-hidden max-h-96 bg-[var(--color-gray-100)] flex items-center justify-center">
                                            <img
                                                src={attachmentUrl}
                                                alt="Lampiran pengeluaran"
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                            <a
                                                href={attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                                            >
                                                <div className="text-white text-center">
                                                    <div className="flex justify-center mb-2">
                                                        <ExternalLink className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        Buka Fullscreen
                                                    </span>
                                                </div>
                                            </a>
                                        </div>
                                        <div className="flex justify-end">
                                            <a
                                                href={attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-primary-100)",
                                                    color: "var(--color-primary-600)",
                                                }}
                                            >
                                                <Download className="w-4 h-4" />
                                                Unduh Lampiran
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="p-6 rounded-lg text-center"
                                        style={{
                                            backgroundColor:
                                                "var(--color-gray-50)",
                                            border: "2px dashed var(--color-border)",
                                        }}
                                    >
                                        <div className="flex justify-center mb-3">
                                            <Paperclip
                                                className="w-8 h-8"
                                                style={{
                                                    color: "var(--color-text-quaternary)",
                                                }}
                                            />
                                        </div>
                                        <p
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Tidak ada lampiran untuk pengeluaran
                                            ini
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                        >
                            <Card variant="outlined" className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p
                                            className="font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Dibuat Pada
                                        </p>
                                        <p
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {new Date(
                                                expense.createdAt,
                                            ).toLocaleString("id-ID", {
                                                dateStyle: "long",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <p
                                            className="font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Terakhir Diupdate
                                        </p>
                                        <p
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {new Date(
                                                expense.updatedAt,
                                            ).toLocaleString("id-ID", {
                                                dateStyle: "long",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>
                                    {expense.deletedAt && (
                                        <div>
                                            <p
                                                className="font-medium mb-1"
                                                style={{
                                                    color: "var(--color-error-600)",
                                                }}
                                            >
                                                Dihapus Pada
                                            </p>
                                            <p
                                                style={{
                                                    color: "var(--color-error-500)",
                                                }}
                                            >
                                                {new Date(
                                                    expense.deletedAt,
                                                ).toLocaleString("id-ID", {
                                                    dateStyle: "long",
                                                    timeStyle: "short",
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>

            <ApproveExpenseModal
                isOpen={approveModal}
                expense={expense}
                accounts={sourceAccounts}
                onClose={() => setApproveModal(false)}
                onConfirm={handleConfirmApprove}
                isLoading={isApproving}
            />

            <RejectExpenseModal
                isOpen={rejectModal}
                expense={expense}
                onClose={() => setRejectModal(false)}
                onConfirm={handleConfirmReject}
                isLoading={isRejecting}
            />
        </>
    );
}

ExpenseShow.layout = withAuthenticatedLayout({
    title: "Detail Pengeluaran",
    searchable: false,
    breadcrumbs: [
        { label: "Pengeluaran", href: route("expenses.index") },
        { label: "Detail", href: "#" },
    ],
});

export default ExpenseShow;
