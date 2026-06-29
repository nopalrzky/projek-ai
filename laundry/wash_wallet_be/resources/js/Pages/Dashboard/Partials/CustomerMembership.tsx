import React from "react";
import { Link } from "@inertiajs/react";
import { Users, Crown, ChevronRight, UserPlus, Star } from "lucide-react";
import { OwnerDashboardCustomerSummary, OwnerDashboardMembershipSummary } from "../types";

interface CustomerMembershipProps {
    customers: OwnerDashboardCustomerSummary;
    membership: OwnerDashboardMembershipSummary;
}

const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const CustomerMembership: React.FC<CustomerMembershipProps> = ({ customers, membership }) => {
    return (
        <div className="card h-full flex flex-col">
            <div className="card-header border-b border-[var(--color-border)] flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                    <Users className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Pelanggan & Membership
                </h3>
            </div>
            
            <div className="card-body p-0 flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-[var(--color-border)]">
                {/* Customers */}
                <div className="p-6">
                    <h4 className="text-sm font-medium mb-4 flex justify-between items-center text-[var(--color-text-secondary)]">
                        <span>Statistik Pelanggan</span>
                        <Link href="/dashboard/customers" className="text-[var(--color-primary-600)] hover:underline flex items-center">
                            Lihat Semua <ChevronRight className="w-4 h-4" />
                        </Link>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[var(--color-surface-muted)] p-3 rounded-lg border border-[var(--color-border)] text-center">
                            <div className="text-2xl font-bold text-[var(--color-text-primary)]">{customers.totalCustomers}</div>
                            <div className="text-[10px] text-[var(--color-text-tertiary)] uppercase font-semibold">Total</div>
                        </div>
                        <div className="bg-[var(--color-success-50)] border border-[var(--color-success-100)] p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-[var(--color-success-600)]">{customers.newCustomersCount}</div>
                            <div className="text-[10px] text-[var(--color-success-700)] uppercase font-semibold">Baru (Periode ini)</div>
                        </div>
                        <div className="bg-[var(--color-primary-50)] border border-[var(--color-primary-100)] p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-[var(--color-primary-600)]">{customers.repeatCustomersCount}</div>
                            <div className="text-[10px] text-[var(--color-primary-700)] uppercase font-semibold">Repeat Order</div>
                        </div>
                        <div className="bg-[var(--color-gray-50)] border border-[var(--color-gray-200)] p-3 rounded-lg text-center">
                            <div className="text-2xl font-bold text-[var(--color-gray-600)]">{customers.inactiveCustomersCount}</div>
                            <div className="text-[10px] text-[var(--color-gray-500)] uppercase font-semibold">Pasif (90 Hari)</div>
                        </div>
                    </div>

                    <h5 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Top Pelanggan</h5>
                    <div className="space-y-3">
                        {customers.topCustomers.length > 0 ? (
                            customers.topCustomers.map((cust, idx) => (
                                <div key={cust.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center font-bold text-xs shrink-0">
                                            {cust.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-[var(--color-text-primary)] truncate">{cust.name}</span>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <div className="font-semibold text-[var(--color-text-primary)]">{formatRupiah(cust.totalSpent)}</div>
                                        <div className="text-[10px] text-[var(--color-text-tertiary)]">{cust.ordersCount} pesanan</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-[var(--color-text-tertiary)] text-center py-2">Belum ada data transaksi pelanggan.</div>
                        )}
                    </div>
                </div>

                {/* Memberships */}
                <div className="p-6">
                    <h4 className="text-sm font-medium mb-4 flex justify-between items-center text-[var(--color-text-secondary)]">
                        <span className="flex items-center gap-1"><Crown className="w-4 h-4 text-[var(--color-warning-500)]" /> Langganan & Paket</span>
                    </h4>

                    <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center p-3 border rounded-lg bg-white dark:bg-[var(--color-surface)]" style={{ borderColor: "var(--color-border)" }}>
                            <div>
                                <div className="text-sm font-medium text-[var(--color-text-primary)]">Paket Aktif</div>
                                <div className="text-xs text-[var(--color-text-tertiary)]">Berlangganan bulanan</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-[var(--color-primary-600)]">{membership.activeSubscriptionsCount}</div>
                                {membership.expiringSubscriptionsCount > 0 && (
                                    <div className="text-[10px] text-[var(--color-error-600)] font-medium">
                                        {membership.expiringSubscriptionsCount} akan habis
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 border rounded-lg bg-white dark:bg-[var(--color-surface)]" style={{ borderColor: "var(--color-border)" }}>
                            <div>
                                <div className="text-sm font-medium text-[var(--color-text-primary)]">Kontrak Member</div>
                                <div className="text-xs text-[var(--color-text-tertiary)]">Membership prabayar</div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-[var(--color-success-600)]">{membership.activeMembershipContractsCount}</div>
                                {membership.expiringMembershipContractsCount > 0 && (
                                    <div className="text-[10px] text-[var(--color-error-600)] font-medium">
                                        {membership.expiringMembershipContractsCount} akan habis
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <h5 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">Paket Terpopuler</h5>
                    <div className="space-y-3">
                        {membership.topPackages.length > 0 ? (
                            membership.topPackages.map((pkg) => (
                                <div key={pkg.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Star className="w-4 h-4 text-[var(--color-warning-500)] shrink-0" />
                                        <span className="font-medium text-[var(--color-text-primary)] truncate">{pkg.name}</span>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <div className="font-semibold text-[var(--color-text-primary)]">{pkg.soldCount} Terjual</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-xs text-[var(--color-text-tertiary)] text-center py-2">Belum ada paket terjual.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerMembership;
