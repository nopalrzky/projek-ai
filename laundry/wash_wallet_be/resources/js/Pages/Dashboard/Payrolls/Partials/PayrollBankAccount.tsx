import { Info, CreditCard, Landmark, Calendar, Banknote } from "lucide-react";
import { Card } from "@/Components/Card";
import { PayrollBankAccountProps } from "../types";

export default function PayrollBankAccount({
    payroll,
}: PayrollBankAccountProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Card className="card p-8 md:p-10 rounded-2xl bg-surface">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-surface-muted flex items-center justify-center text-[var(--color-secondary-600)] shadow-sm border border-color shrink-0 transform -rotate-3 transition-transform hover:rotate-0">
                        <CreditCard className="w-10 h-10 md:w-12 md:h-12" />
                    </div>

                    <div className="flex-1 space-y-8 w-full">
                        <div>
                            <h3 className="text-2xl font-bold text-primary tracking-tight text-center md:text-left">
                                Informasi Rekening & Pembayaran
                            </h3>
                            <p className="text-secondary font-medium text-sm text-center md:text-left mt-1.5 opacity-80 uppercase tracking-widest">
                                Sumber Dana Penyaluran Gaji
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 pt-6 border-t border-color">
                            <div className="space-y-6">
                                <div className="group space-y-1.5">
                                    <div className="flex items-center gap-2 text-tertiary font-semibold mb-1 group-hover:text-[var(--color-primary-600)] transition-colors">
                                        <Landmark className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-widest font-bold">
                                            Nama Rekening
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-primary group-hover:translate-x-1 transition-transform">
                                        {payroll.bankAccountName || "-"}
                                    </p>
                                </div>

                                <div className="group space-y-1.5">
                                    <div className="flex items-center gap-2 text-tertiary font-semibold mb-1 group-hover:text-[var(--color-warning-500)] transition-colors">
                                        <Banknote className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-widest font-bold">
                                            Metode Pembayaran
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-primary capitalize group-hover:translate-x-1 transition-transform">
                                            {payroll.paymentMethodLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="group space-y-1.5">
                                    <div className="flex items-center gap-2 text-tertiary font-semibold mb-1 group-hover:text-[var(--color-success-600)] transition-colors">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-xs uppercase tracking-widest font-bold">
                                            Tanggal Pembayaran
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-primary group-hover:translate-x-1 transition-transform">
                                        {payroll.formattedPaymentDate}
                                    </p>
                                </div>

                                {payroll.bankAccount && (
                                    <div className="group space-y-1.5">
                                        <div className="flex items-center gap-2 text-tertiary font-semibold mb-1 group-hover:text-[var(--color-info-600)] transition-colors">
                                            <CreditCard className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-widest font-bold">
                                                Informasi Akun
                                            </span>
                                        </div>
                                        <p className="text-lg font-mono font-bold text-secondary bg-surface-muted inline-block px-3 py-1 rounded-xl group-hover:translate-x-1 transition-transform">
                                            {payroll.bankAccount.code}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Hint Tip */}
            <div className="card flex items-center gap-4 px-6 py-4 rounded-2xl bg-surface-muted text-secondary border-color">
                <Info className="w-5 h-5 shrink-0" />
                <p className="text-xs font-semibold leading-relaxed">
                    Dana disalurkan dari akun aset yang dipilih saat pembuatan
                    payroll. Riwayat transaksi jurnal otomatis tercatat pada
                    akun ini.
                </p>
            </div>
        </div>
    );
}
