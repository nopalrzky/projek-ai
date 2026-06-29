import React from "react";
import { OwnerDashboardFinance } from "../types";
import { BarChart3 } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import dayjs from "dayjs";

interface RevenueExpenseTrendProps {
    finance: OwnerDashboardFinance;
    period: string;
}

const formatRupiah = (value: number) => {
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)}JT`;
    if (value >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
    return `Rp ${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-lg shadow-lg text-sm">
                <p className="font-semibold text-[var(--color-text-primary)] mb-2">{dayjs(label).format("DD MMM YYYY")}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                        <span className="text-[var(--color-text-secondary)]">{entry.name}:</span>
                        <span className="font-bold text-[var(--color-text-primary)] ml-auto">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(entry.value)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const RevenueExpenseTrend: React.FC<RevenueExpenseTrendProps> = ({ finance, period }) => {
    // Determine interval for XAxis ticks based on data length
    const dataLength = finance.revenueExpenseTrend.length;
    let tickFormatter = (tick: string) => dayjs(tick).format("DD/MM");
    
    if (period === '90d') {
        tickFormatter = (tick: string) => dayjs(tick).format("MMM YY");
    }

    return (
        <div className="card h-full flex flex-col">
            <div className="card-header border-b border-[var(--color-border)] flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                    <BarChart3 className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Tren Keuangan
                </h3>
            </div>
            
            <div className="card-body flex-1 min-h-[300px]">
                {finance.revenueExpenseTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={finance.revenueExpenseTrend}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-success-500)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-success-500)" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-error-500)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--color-error-500)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={tickFormatter}
                                stroke="var(--color-text-tertiary)"
                                fontSize={12}
                                tickMargin={10}
                                minTickGap={dataLength > 30 ? 30 : 5}
                            />
                            <YAxis 
                                tickFormatter={formatRupiah} 
                                stroke="var(--color-text-tertiary)"
                                fontSize={12}
                                width={70}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />
                            <Area 
                                type="monotone" 
                                dataKey="revenue" 
                                name="Pendapatan" 
                                stroke="var(--color-success-500)" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorRevenue)" 
                            />
                            <Area 
                                type="monotone" 
                                dataKey="expense" 
                                name="Pengeluaran" 
                                stroke="var(--color-error-500)" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorExpense)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-[var(--color-text-tertiary)] text-sm">
                        Tidak ada data keuangan untuk periode ini.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RevenueExpenseTrend;
