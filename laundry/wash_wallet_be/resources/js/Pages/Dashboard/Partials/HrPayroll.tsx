import React from "react";
import { Link } from "@inertiajs/react";
import { Briefcase, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";
import { OwnerDashboardHrPayrollSummary } from "../types";

interface HrPayrollProps {
    hrPayroll: OwnerDashboardHrPayrollSummary;
}

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const HrPayroll: React.FC<HrPayrollProps> = ({ hrPayroll }) => {
    return (
        <div className="card h-full flex flex-col">
            <div className="card-header border-b border-[var(--color-border)] flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                    <Briefcase className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Karyawan & Penggajian
                </h3>
                <Link href="/dashboard/hr/employees" className="text-xs font-medium text-[var(--color-primary-600)] hover:underline flex items-center">
                    Kelola <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </Link>
            </div>
            
            <div className="card-body flex-1 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4 bg-[var(--color-surface-muted)] p-4 rounded-xl border border-[var(--color-border)]">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-[var(--color-primary-600)]" />
                    </div>
                    <div>
                        <div className="text-sm font-medium text-[var(--color-text-secondary)]">Karyawan Aktif</div>
                        <div className="text-2xl font-bold text-[var(--color-text-primary)]">{hrPayroll.activeEmployeesCount} Orang</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="border border-[var(--color-border)] p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium text-[var(--color-text-secondary)]">Gaji Terbayar<br/><span className="text-[10px]">(Bulan Ini)</span></div>
                            <CheckCircle2 className="w-5 h-5 text-[var(--color-success-500)]" />
                        </div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">{formatRupiah(hrPayroll.payrollPaidAmount)}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)] mt-1">{hrPayroll.payrollPaidCount} Karyawan</div>
                    </div>

                    <div className="border border-[var(--color-border)] p-4 rounded-xl bg-[var(--color-warning-50)] border-[var(--color-warning-200)]">
                        <div className="flex justify-between items-start mb-2">
                            <div className="text-sm font-medium text-[var(--color-warning-700)]">Komisi Belum Dibayar</div>
                            <AlertCircle className="w-5 h-5 text-[var(--color-warning-500)]" />
                        </div>
                        <div className="text-lg font-bold text-[var(--color-warning-800)]">{formatRupiah(hrPayroll.unpaidCommissionAmount)}</div>
                        <Link href="/dashboard/hr/commissions" className="text-xs text-[var(--color-warning-700)] hover:underline mt-1 block font-medium">Bayarkan Sekarang</Link>
                    </div>
                </div>

                <div className="mt-auto">
                    <h5 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Kasbon & Denda Karyawan</h5>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm border-b border-[var(--color-border)] pb-2">
                            <span className="text-[var(--color-text-secondary)]">Total Kasbon Berjalan</span>
                            <span className="font-semibold text-[var(--color-text-primary)]">{formatRupiah(hrPayroll.activeLoanAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-b border-[var(--color-border)] pb-2">
                            <span className="text-[var(--color-text-secondary)]">Denda Potongan Bulan Ini</span>
                            <span className="font-semibold text-[var(--color-error-600)]">{formatRupiah(hrPayroll.fineDeductionAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HrPayroll;
