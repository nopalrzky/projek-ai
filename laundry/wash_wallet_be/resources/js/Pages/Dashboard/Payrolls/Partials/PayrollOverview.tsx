import { ReceiptText, FileText } from "lucide-react";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { PayrollOverviewProps } from "../types";

export default function PayrollOverview({
    payroll,
    flash,
}: PayrollOverviewProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Flash Messages */}
            <div className="space-y-4">
                {flash?.success && (
                    <Alert
                        variant="success"
                        className="rounded-xl shadow-sm"
                        title="Berhasil"
                        description={flash.success}
                    />
                )}
                {flash?.error && (
                    <Alert
                        variant="error"
                        className="rounded-xl shadow-sm"
                        title="Gagal"
                        description={flash.error}
                    />
                )}
                {flash?.warning && (
                    <Alert
                        variant="warning"
                        className="rounded-xl shadow-sm"
                        title="Perhatian"
                        description={flash.warning}
                    />
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5 border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Gaji Kotor
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[var(--color-info-600)] tracking-tight">
                        {payroll.formattedGrossSalary}
                    </p>
                </Card>
                <Card className="p-5 border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Total Potongan
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[var(--color-error-600)] tracking-tight">
                        {payroll.formattedTotalDeduction}
                    </p>
                </Card>
                <Card className="p-5 border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Gaji Bersih
                    </p>
                    <p className="mt-2 text-2xl font-bold text-[var(--color-success-600)] tracking-tight">
                        {payroll.formattedNetSalary}
                    </p>
                </Card>
                <Card className="p-5 border-[var(--color-border)] shadow-sm hover:shadow-md transition-shadow duration-200 rounded-2xl flex flex-col justify-between">
                    <p className="text-sm font-medium text-[var(--color-text-secondary)]">
                        Status
                    </p>
                    <div className="mt-2 text-2xl font-bold tracking-tight">
                        <Badge
                            variant={payroll.statusColor}
                            className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
                        >
                            {payroll.statusLabel}
                        </Badge>
                    </div>
                </Card>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informasi Payroll */}
                <Card className="p-6 border-[var(--color-border)] shadow-sm rounded-2xl space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-info-600)] shadow-sm border border-[var(--color-border)]">
                            <ReceiptText className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                            Informasi Payroll
                        </h3>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Periode
                            </span>
                            <span className="font-semibold text-[var(--color-text-primary)]">
                                {payroll.periodLabel}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Tanggal Bayar
                            </span>
                            <span className="font-semibold text-[var(--color-text-primary)]">
                                {payroll.formattedPaymentDate}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Metode Pembayaran
                            </span>
                            <span className="font-semibold text-[var(--color-text-primary)] capitalize">
                                {payroll.paymentMethodLabel}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                Tipe Payroll
                            </span>
                            <span className="font-semibold text-[var(--color-text-primary)] capitalize">
                                {payroll.typeLabel}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)] font-medium">
                                No. Transaksi
                            </span>
                            <span className="font-mono text-[var(--color-text-secondary)] font-medium">
                                {payroll.transactionNumber}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Catatan & Lampiran */}
                <Card className="p-6 border-[var(--color-border)] shadow-sm rounded-2xl space-y-6 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-success-600)] shadow-sm border border-[var(--color-border)]">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                            Catatan & Lampiran
                        </h3>
                    </div>

                    <div className="flex-1 space-y-6 pt-2">
                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)] font-semibold mb-2">
                                Catatan:
                            </p>
                            <div className="p-4 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] min-h-[80px] leading-relaxed">
                                {payroll.note || "Tidak ada catatan."}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-[var(--color-text-secondary)] font-semibold mb-2">
                                Bukti Pembayaran:
                            </p>
                            {payroll.attachmentUrl ? (
                                <a
                                    href={payroll.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-4 py-2 rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-info-600)] text-sm font-bold border border-[var(--color-border)] hover:opacity-80 transition-all duration-200 shadow-sm"
                                >
                                    Lihat Lampiran{" "}
                                    <span className="ml-2">↗</span>
                                </a>
                            ) : (
                                <p className="text-sm text-[var(--color-text-tertiary)] italic">
                                    Belum ada lampiran bukti pembayaran.
                                </p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
