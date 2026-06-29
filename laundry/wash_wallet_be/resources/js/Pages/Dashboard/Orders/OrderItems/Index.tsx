import React, { useMemo } from "react";
import { Package, TrendingUp, Tag } from "lucide-react";
import { Card } from "@/Components/Card";
import { formatCurrency } from "@/lib/utils";
import { OrderItemsIndexProps } from "./types";
import OrderItemCard from "./Partials/OrderItemCard";

const OrderItemsIndex: React.FC<OrderItemsIndexProps> = ({
    order,
    orderItems = [],
    isLoading = false,
}) => {
    const totals = useMemo(() => {
        const totalQuantity = orderItems.reduce(
            (sum, item) => sum + (item.quantity || 0),
            0
        );
        const totalSubtotal = orderItems.reduce(
            (sum, item) => sum + (item.subtotal || 0),
            0
        );
        const totalDiscount = orderItems.reduce(
            (sum, item) => sum + (item.discountAmount || 0),
            0
        );
        const totalAmount = orderItems.reduce(
            (sum, item) => sum + (item.totalAmount || 0),
            0
        );

        return {
            totalQuantity,
            totalSubtotal,
            totalDiscount,
            totalAmount,
        };
    }, [orderItems]);

    return (
        <div className="space-y-8 animate-fadeIn">
            <Card variant="elevated" className="overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] shadow-xl">
                <div className="p-8 border-b border-[var(--color-border-light)] bg-gradient-to-r from-[var(--color-primary-50)] to-transparent">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--color-primary-500)] text-white shadow-lg shadow-[var(--color-primary-500)]/20">
                                <Package className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                                    Item Pesanan 
                                    <span className="ml-3 px-3 py-1 rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] text-sm font-bold border border-[var(--color-primary-100)]">
                                        {orderItems.length}
                                    </span>
                                </h3>
                                <p className="text-sm text-[var(--color-text-tertiary)] flex items-center gap-2">
                                    Daftar layanan dan rincian proses produksi untuk order 
                                    <span className="font-bold text-[var(--color-primary-600)]">{order.orderNumber}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="space-y-5">
                        {orderItems.map((item: any) => (
                            <OrderItemCard key={item.id} item={item} />
                        ))}

                        {orderItems.length === 0 && !isLoading && (
                            <div className="py-24 text-center border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-5 bg-[var(--color-background)] border-[var(--color-border)]">
                                <div className="p-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-sm">
                                    <Package className="w-12 h-12 text-[var(--color-text-tertiary)] opacity-30" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-lg text-[var(--color-text-primary)]">
                                        Data Item Kosong
                                    </h4>
                                    <p className="text-sm text-[var(--color-text-tertiary)] max-w-sm mx-auto">
                                        Belum ada item yang ditambahkan ke order ini atau data gagal dimuat.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="space-y-5">
                                {[1, 2, 3].map((n) => (
                                    <div
                                        key={n}
                                        className="h-28 bg-[var(--color-gray-50)] rounded-2xl animate-pulse"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {orderItems.length > 0 && (
                        <div className="mt-10 pt-10 border-t border-[var(--color-border-light)]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <SummaryBadge 
                                    icon={<Package className="w-5 h-5" />}
                                    label="Total Kuantitas"
                                    value={totals.totalQuantity}
                                    variant="gray"
                                />
                                <SummaryBadge 
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    label="Subtotal"
                                    value={formatCurrency(totals.totalSubtotal)}
                                    variant="blue"
                                />
                                <SummaryBadge 
                                    icon={<Tag className="w-5 h-5" />}
                                    label="Potongan Diskon"
                                    value={formatCurrency(totals.totalDiscount)}
                                    variant="red"
                                />
                                <SummaryBadge 
                                    icon={<TrendingUp className="w-5 h-5" />}
                                    label="Total Akhir"
                                    value={formatCurrency(totals.totalAmount)}
                                    variant="green"
                                    highlight
                                />
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

interface SummaryBadgeProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    variant: 'gray' | 'blue' | 'red' | 'green';
    highlight?: boolean;
}

const SummaryBadge: React.FC<SummaryBadgeProps> = ({ icon, label, value, variant, highlight }) => {
    const variants = {
        gray: "bg-[var(--color-gray-50)] text-[var(--color-gray-700)] border-[var(--color-gray-200)]",
        blue: "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/20",
        red: "bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-300 border-red-100 dark:border-red-900/20",
        green: "bg-[var(--color-success-50)] text-[var(--color-success-700)] border-[var(--color-success-100)]",
    };

    return (
        <div className={`p-5 rounded-2xl border transition-all ${variants[variant]} ${highlight ? 'shadow-lg shadow-[var(--color-success-500)]/5 scale-[1.02]' : ''}`}>
            <div className="flex items-center gap-3 mb-2.5 opacity-80">
                <div className="p-1.5 rounded-lg bg-white/50 dark:bg-black/20 border border-white/20">
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                    {label}
                </span>
            </div>
            <p className={`text-2xl font-black tracking-tight ${highlight ? 'text-balance' : ''}`}>
                {value}
            </p>
        </div>
    );
};

export default OrderItemsIndex;
