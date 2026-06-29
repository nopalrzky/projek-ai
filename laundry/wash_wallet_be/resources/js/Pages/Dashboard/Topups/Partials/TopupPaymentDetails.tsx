import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Alert } from "@/Components/Alert";
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Hash,
    Building,
    Smartphone,
    Store,
    Copy,
    ExternalLink,
} from "lucide-react";
import { Button } from "@/Components/Button";
import { TopupPaymentDetailsProps } from "../types";

const TopupPaymentDetails: React.FC<TopupPaymentDetailsProps> = ({ topup }) => {
    const getPaymentStatusConfig = () => {
        const configs = {
            pending: {
                icon: Clock,
                color: "var(--color-warning-600)",
                bgColor: "var(--color-warning-50)",
                borderColor: "var(--color-warning-200)",
                label: "Menunggu Pembayaran",
                description: "Pembayaran belum dikonfirmasi",
            },
            paid: {
                icon: CheckCircle2,
                color: "var(--color-success-600)",
                bgColor: "var(--color-success-50)",
                borderColor: "var(--color-success-200)",
                label: "Pembayaran Berhasil",
                description: "Pembayaran telah dikonfirmasi",
            },
            failed: {
                icon: XCircle,
                color: "var(--color-error-600)",
                bgColor: "var(--color-error-50)",
                borderColor: "var(--color-error-200)",
                label: "Pembayaran Gagal",
                description: "Pembayaran tidak dapat diproses",
            },
            expired: {
                icon: XCircle,
                color: "var(--color-gray-600)",
                bgColor: "var(--color-gray-50)",
                borderColor: "var(--color-gray-200)",
                label: "Pembayaran Kadaluarsa",
                description: "Waktu pembayaran telah habis",
            },
        };

        return (
            configs[topup.paymentStatus as keyof typeof configs] ||
            configs.pending
        );
    };

    const statusConfig = getPaymentStatusConfig();
    const StatusIcon = statusConfig.icon;

    const InfoRow = ({
        icon: Icon,
        label,
        value,
    }: {
        icon: React.ElementType;
        label: string;
        value: React.ReactNode;
    }) => (
        <div className="flex items-start gap-4 p-4 rounded-lg  transition-colors">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--color-primary-100)" }}
            >
                <Icon
                    className="w-5 h-5"
                    style={{ color: "var(--color-primary-600)" }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {label}
                </p>
                <p
                    className="text-base font-semibold break-all"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {value || "-"}
                </p>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <Card className="p-6 border-2">
                <div className="flex items-start gap-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: "white" }}
                    >
                        <StatusIcon
                            className="w-7 h-7"
                            style={{ color: statusConfig.color }}
                        />
                    </div>
                    <div className="flex-1">
                        <h3
                            className="text-xl font-bold mb-1"
                            style={{ color: statusConfig.color }}
                        >
                            {statusConfig.label}
                        </h3>
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {statusConfig.description}
                        </p>
                    </div>
                    <Badge
                        variant={
                            topup.paymentStatus === "paid"
                                ? "success"
                                : topup.paymentStatus === "failed"
                                  ? "error"
                                  : topup.paymentStatus === "expired"
                                    ? "default"
                                    : "warning"
                        }
                    >
                        {topup.paymentStatus.toUpperCase()}
                    </Badge>
                </div>
            </Card>
            {/* Payment Instructions (Only if pending or waiting) */}
            {(topup.paymentStatus === "pending" || topup.paymentStatus === "waiting") && topup.paymentData && (
                <Card className="p-6 overflow-hidden border-2" style={{ borderColor: 'var(--color-primary-200)' }}>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                        <Clock className="w-5 h-5 text-warning-500" />
                        Instruksi Pembayaran
                    </h3>

                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {/* VA Case */}
                        {['bank_transfer', 'echannel', 'permata'].includes(topup.paymentMethod!) && topup.paymentData && (topup.paymentData.va_number || topup.paymentData.bill_key) && (
                            <div className="flex-1 space-y-4 w-full">
                                <div className="p-4 rounded-xl bg-gray-50 border">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nomor Virtual Account ({topup.paymentData.bank || 'Bank'})</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col gap-1">
                                            {topup.paymentData.biller_code && (
                                                <span className="text-sm font-mono font-medium text-gray-600">Company Code: {topup.paymentData.biller_code}</span>
                                            )}
                                            <span className="text-2xl font-mono font-bold text-primary-600 tracking-widest">{topup.paymentData.va_number || topup.paymentData.bill_key}</span>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            navigator.clipboard.writeText(topup.paymentData.va_number || topup.paymentData.bill_key || '');
                                            alert("Nomor VA berhasil disalin");
                                        }}>Salin</Button>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-info-50 border border-info-100">
                                    <p className="text-sm font-medium text-info-800 mb-2">Cara Pembayaran:</p>
                                    <p className="text-sm text-info-700 leading-relaxed">{topup.paymentData.instructions}</p>
                                </div>
                            </div>
                        )}

                        {/* E-Wallet / QRIS Case */}
                        {['gopay', 'qris', 'shopeepay'].includes(topup.paymentMethod!) && (
                            <>
                                {topup.paymentData.qr_url && (
                                    <div className="flex flex-col items-center gap-4 p-4 rounded-2xl bg-white border shadow-sm">
                                        <img src={topup.paymentData.qr_url} alt="QRIS" className="w-48 h-48" />
                                        <Badge variant="success" size="md">SCAN QRIS</Badge>
                                    </div>
                                )}

                                <div className="flex-1 space-y-4 w-full">
                                    {topup.paymentData.deeplink_url && (
                                        <div className="p-6 rounded-2xl bg-primary-50 border border-primary-100 text-center mb-6">
                                            <Smartphone className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                                            <h4 className="text-lg font-bold text-primary-900 mb-2">Buka Aplikasi {topup.paymentMethod?.toUpperCase()}</h4>
                                            <p className="text-sm text-primary-700 mb-6">Klik tombol di bawah untuk membuka aplikasi dan menyelesaikan pembayaran secara otomatis jika Anda menggunakan smartphone.</p>
                                            <a
                                                href={topup.paymentData.deeplink_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-200"
                                            >
                                                Buka Aplikasi Sekarang
                                            </a>
                                        </div>
                                    )}

                                    <div className="p-4 rounded-xl bg-gray-50 border">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Langkah-langkah:</p>
                                        <ul className="text-sm space-y-2 text-gray-600 list-decimal pl-4">
                                            {topup.paymentData.qr_url && (
                                                <>
                                                    <li>Buka aplikasi pembayaran (GoPay, OVO, Dana, ShopeePay, dll).</li>
                                                    <li>Pilih menu <strong>Scan</strong> atau <strong>Bayar</strong>.</li>
                                                    <li>Arahkan kamera ke kode QR yang muncul di layar.</li>
                                                </>
                                            )}
                                            <li>Konfirmasi nominal dan masukkan PIN Anda.</li>
                                            <li>Simpan bukti transaksi jika sudah selesai.</li>
                                        </ul>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Over the Counter (C-Store) Case */}
                        {topup.paymentMethod === 'cstore' && topup.paymentData && topup.paymentData.payment_code && (
                            <div className="flex-1 space-y-4 w-full">
                                <div className="p-4 rounded-xl bg-gray-50 border">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Kode Pembayaran ({topup.paymentData.store})</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-3xl font-mono font-bold text-primary-600 tracking-widest">{topup.paymentData.payment_code}</span>
                                        <Button variant="outline" size="sm" onClick={() => {
                                            navigator.clipboard.writeText(topup.paymentData.payment_code);
                                            alert("Kode pembayaran berhasil disalin");
                                        }} leftIcon={<Copy className="w-4 h-4"/>}>Salin</Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Tunjukkan kode ini ke kasir {topup.paymentData.store.toUpperCase()}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-info-50 border border-info-100">
                                    <p className="text-sm font-medium text-info-800 mb-2">Cara Pembayaran:</p>
                                    <p className="text-sm text-info-700 leading-relaxed">{topup.paymentData.instructions}</p>
                                </div>
                            </div>
                        )}

                        {/* Cardless Credit (Akulaku / Kredivo) Case */}
                        {['akulaku', 'kredivo'].includes(topup.paymentMethod!) && topup.paymentData && topup.paymentData.redirect_url && (
                            <div className="flex-1 space-y-4 w-full">
                                <div className="p-6 rounded-2xl bg-primary-50 border border-primary-100 text-center mb-6">
                                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-primary-600" />
                                    <h4 className="text-lg font-bold text-primary-900 mb-2">Lanjutkan ke {topup.paymentMethod === 'akulaku' ? 'Akulaku' : 'Kredivo'}</h4>
                                    <p className="text-sm text-primary-700 mb-6">
                                        Pilih tombol di bawah untuk diarahkan ke halaman login dan konfirmasi cicilan Anda.
                                    </p>
                                    <a
                                        href={topup.paymentData.redirect_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-200"
                                    >
                                        Lanjutkan Pembayaran <ExternalLink className="w-5 h-5"/>
                                    </a>
                                </div>

                                <div className="p-4 rounded-xl bg-gray-50 border">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Langkah-langkah:</p>
                                    <ul className="text-sm space-y-2 text-gray-600 list-decimal pl-4">
                                        <li>Klik tombol <strong>Lanjutkan Pembayaran</strong> di atas.</li>
                                        <li>Anda akan diarahkan ke halaman {topup.paymentMethod === 'akulaku' ? 'Akulaku' : 'Kredivo'}.</li>
                                        <li>Login menggunakan akun Anda atau daftar jika belum memiliki akun.</li>
                                        <li>Pilih tenor cicilan yang Anda inginkan dan setujui transaksi.</li>
                                        <li>Setelah selesai, status topup Anda akan otomatis berubah.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {topup.expiredAt && (
                        <div className="mt-8 pt-4 border-t flex items-center justify-center gap-2 text-sm font-medium text-error-600">
                            <Clock className="w-4 h-4" />
                            Bayar sebelum {new Date(topup.expiredAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                    )}
                </Card>
            )}

            {/* Detail Pembayaran */}
            <Card className="p-6">
                <h3
                    className="text-lg font-semibold mb-4 flex items-center gap-2"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    <CreditCard className="w-5 h-5" />
                    Detail Pembayaran
                </h3>

                <div className="space-y-2">
                    <InfoRow
                        icon={Building}
                        label="Metode Pembayaran"
                        value={topup.paymentMethod?.toUpperCase() || (topup.paymentProvider || "Belum ditentukan")}
                    />

                    <InfoRow
                        icon={Hash}
                        label="Referensi Pembayaran"
                        value={topup.paymentReference || "Belum ada referensi"}
                    />
                </div>
            </Card>

            {/* Alert berdasarkan status */}
            {topup.paymentStatus === "pending" && (
                <Alert
                    variant="warning"
                    title="Menunggu Pembayaran"
                    description="Silakan selesaikan pembayaran Anda melalui metode yang telah dipilih. Pastikan untuk menyimpan referensi pembayaran Anda."
                />
            )}

            {topup.paymentStatus === "paid" && topup.status === "success" && (
                <Alert
                    variant="success"
                    title="Pembayaran Berhasil"
                    description="Pembayaran Anda telah dikonfirmasi dan coin telah ditambahkan ke saldo Anda."
                />
            )}

            {topup.paymentStatus === "failed" && (
                <Alert
                    variant="error"
                    title="Pembayaran Gagal"
                    description="Pembayaran Anda tidak dapat diproses. Silakan hubungi customer service untuk bantuan lebih lanjut."
                />
            )}

            {topup.paymentStatus === "expired" && (
                <Alert
                    variant="default"
                    title="Pembayaran Kadaluarsa"
                    description="Waktu pembayaran telah habis. Silakan buat topup baru jika Anda masih ingin melakukan topup."
                />
            )}
        </motion.div>
    );
};

export default TopupPaymentDetails;
