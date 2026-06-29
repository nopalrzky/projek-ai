import { User, Building2, Smartphone, MapPin } from "lucide-react";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { PayrollEmployeeProps } from "../types";
import { resolveStorageUrl } from "@/lib/utils";

export default function PayrollEmployee({ payroll }: PayrollEmployeeProps) {
    const avatarUrl = resolveStorageUrl(payroll.employee?.avatar);

    if (!payroll.employeeName) {
        return (
            <Card className="p-12 text-center text-sm font-medium border-[var(--color-border)] shadow-sm rounded-2xl flex flex-col items-center gap-4 bg-[var(--color-surface-muted)]/50">
                <div className="w-16 h-16 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                    <User className="w-10 h-10" />
                </div>
                <p className="text-[var(--color-text-tertiary)]">
                    Data karyawan tidak tersedia.
                </p>
            </Card>
        );
    }

    return (
        <Card className="p-8 border-[var(--color-border)] shadow-sm rounded-2xl md:p-10 lg:p-12 space-y-10 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex flex-col md:flex-row items-center gap-8 group">
                <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary-100 border-4 border-white shadow-xl flex items-center justify-center text-primary-600 transition-transform duration-500 group-hover:scale-105 overflow-hidden">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={payroll.employeeName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-12 h-12 md:w-16 md:h-16" />
                        )}
                    </div>
                </div>

                <div className="text-center md:text-left space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                        <h3 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">
                            {payroll.employeeName}
                        </h3>
                        {payroll.employee && (
                            <Badge
                                variant={
                                    payroll.employee.isActive
                                        ? "success"
                                        : "error"
                                }
                                className="w-fit mx-auto md:mx-0 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider"
                            >
                                {payroll.employee.isActive
                                    ? "Aktif"
                                    : "Non-Aktif"}
                            </Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-[var(--color-text-secondary)] font-medium text-sm">
                        <span className="bg-[var(--color-surface-muted)] px-3 py-1 rounded-lg text-[var(--color-text-secondary)] font-bold border border-[var(--color-border)]">
                            ID: {payroll.employeeCode}
                        </span>
                        <div className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                            <Building2 className="w-4 h-4" />
                            <span>{payroll.outletName}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-[var(--color-border)]">
                <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] hover:border-primary-200 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] font-semibold mb-2">
                        <User className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-bold">
                            Profil
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)]">
                                Nama Lengkap
                            </span>
                            <span className="font-bold text-[var(--color-text-primary)]">
                                {payroll.employeeName}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)]">
                                ID Karyawan
                            </span>
                            <span className="font-mono font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-muted)] px-2 py-0.5 rounded text-xs truncate max-w-[120px]">
                                {payroll.employeeCode}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 p-4 rounded-2xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] hover:border-primary-200 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] font-semibold mb-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-bold">
                            Kontak
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)]">
                                Telepon
                            </span>
                            <span className="font-bold text-[var(--color-text-primary)]">
                                {payroll.employee?.phone || "-"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)] text-xs">
                                Username
                            </span>
                            <span className="font-bold text-[var(--color-text-secondary)] truncate max-w-[120px]">
                                @{payroll.employee?.username || "-"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 lg:col-span-1 space-y-1.5 p-4 rounded-2xl bg-[var(--color-surface-muted)]/50 border border-[var(--color-border)] hover:border-primary-200 transition-colors duration-300">
                    <div className="flex items-center gap-2 text-[var(--color-text-tertiary)] font-semibold mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-widest font-bold">
                            Lokasi Kerja
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)]">
                                Outlet Utama
                            </span>
                            <span className="font-bold text-[var(--color-text-primary)]">
                                {payroll.outletName}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[var(--color-text-secondary)]">
                                Alamat
                            </span>
                            <span className="font-medium text-[var(--color-text-secondary)] text-xs truncate max-w-[150px]">
                                {payroll.employee?.address || "-"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
