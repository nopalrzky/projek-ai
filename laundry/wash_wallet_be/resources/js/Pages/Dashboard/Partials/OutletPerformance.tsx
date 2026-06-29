import React from "react";
import { Link } from "@inertiajs/react";
import { Store, AlertTriangle, ArrowUpRight } from "lucide-react";
import { OwnerDashboardOutletSummary } from "../types";

interface OutletPerformanceProps {
    summary: OwnerDashboardOutletSummary;
}

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const OutletPerformance: React.FC<OutletPerformanceProps> = ({ summary }) => {
    return (
        <div className="card h-full flex flex-col">
            <div className="card-header border-b border-[var(--color-border)] flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                    <Store className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Performa Outlet
                </h3>
                <Link href="/dashboard/outlets" className="text-xs font-medium text-[var(--color-primary-600)] hover:underline flex items-center">
                    Kelola <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </Link>
            </div>
            
            <div className="card-body p-0 flex-1 overflow-y-auto max-h-[400px]">
                {summary.riskyOutletsCount > 0 && (
                    <div className="m-4 bg-[var(--color-error-50)] border border-[var(--color-error-200)] rounded-lg p-3">
                        <div className="flex items-center gap-2 text-[var(--color-error-700)] font-semibold text-sm mb-2">
                            <AlertTriangle className="w-4 h-4" />
                            {summary.riskyOutletsCount} Outlet Butuh Perhatian
                        </div>
                        <div className="space-y-2">
                            {summary.riskyOutlets.map((ro) => (
                                <div key={ro.id} className="text-xs flex justify-between items-center bg-white dark:bg-[var(--color-surface)] p-2 rounded border border-[var(--color-error-100)]">
                                    <div>
                                        <span className="font-medium text-[var(--color-text-primary)]">{ro.name}</span>
                                        <div className="text-[var(--color-error-600)] mt-0.5">
                                            {ro.reasons.join(", ")}
                                        </div>
                                    </div>
                                    <Link href={ro.actionHref} className="text-[var(--color-primary-600)] hover:underline px-2 py-1 bg-[var(--color-primary-50)] rounded font-medium">Setup</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-xs font-semibold text-[var(--color-text-secondary)] grid grid-cols-12 gap-2">
                    <div className="col-span-5">Outlet</div>
                    <div className="col-span-4 text-right">Pendapatan</div>
                    <div className="col-span-3 text-right">Pesanan</div>
                </div>

                <div className="divide-y divide-[var(--color-border)]">
                    {summary.topOutlets.length > 0 ? (
                        summary.topOutlets.map((outlet, idx) => (
                            <Link 
                                key={outlet.id} 
                                href={`/dashboard/outlets/${outlet.id}`}
                                className="block px-4 py-3 hover:bg-[var(--color-surface-muted)] transition-colors"
                            >
                                <div className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-5 flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            idx === 0 ? 'bg-[var(--color-warning-100)] text-[var(--color-warning-700)]' :
                                            idx === 1 ? 'bg-[var(--color-gray-200)] text-[var(--color-gray-700)]' :
                                            idx === 2 ? 'bg-[#fcd34d] text-[#92400e]' :
                                            'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                                        }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                                            {outlet.name}
                                            {outlet.readinessStatus !== 'ok' && (
                                                <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-error-500)] ml-2" title="Incomplete Setup" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-4 text-right">
                                        <div className="text-sm font-bold text-[var(--color-text-primary)]">{formatRupiah(outlet.revenue)}</div>
                                        {outlet.outstandingAmount > 0 && (
                                            <div className="text-[10px] text-[var(--color-warning-600)]">Belum lunas: {formatRupiah(outlet.outstandingAmount)}</div>
                                        )}
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <div className="text-sm font-medium text-[var(--color-text-primary)]">{outlet.ordersCount}</div>
                                        <div className="text-[10px] text-[var(--color-text-tertiary)]">{outlet.activeOrdersCount} aktif</div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="p-8 text-center text-[var(--color-text-tertiary)] text-sm">
                            Belum ada transaksi di outlet manapun.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OutletPerformance;
