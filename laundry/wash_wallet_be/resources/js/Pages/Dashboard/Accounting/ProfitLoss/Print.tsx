import React, { useEffect } from "react";
import { Head } from "@inertiajs/react";
import { Printer } from "lucide-react";
import { Button } from "@/Components/Button";
import { formatCurrency } from "@/lib/utils";
import { Outlet } from "@/types";
import { ProfitLossReport } from "@/types/profit_loss";

interface ProfitLossPrintProps {
    report: ProfitLossReport;
    outlet: Outlet;
}

const ProfitLossPrint = ({ report, outlet }: ProfitLossPrintProps) => {
    useEffect(() => {
        window.print();
    }, []);

    const renderSection = (
        title: string,
        items: Array<{ id: number; code: string; name: string; amount: number }>,
        total: number,
    ) => (
        <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-slate-100 font-semibold">{title}</div>
            <div className="divide-y">
                {items.length > 0 ? (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="px-4 py-3 flex items-center justify-between gap-4 text-sm"
                        >
                            <span>
                                {item.code} - {item.name}
                            </span>
                            <span className="font-medium">
                                {formatCurrency(item.amount)}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                        Tidak ada data.
                    </div>
                )}
            </div>
            <div className="px-4 py-3 bg-slate-50 border-t flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
            </div>
        </div>
    );

    return (
        <>
            <Head title={`Cetak Laba Rugi ${outlet.name}`} />

            <div className="min-h-screen bg-white text-slate-900 p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Laporan Laba Rugi</h1>
                        <p className="text-sm text-slate-600">{outlet.name}</p>
                        <p className="text-sm text-slate-600">
                            Periode {report.period.start} s/d {report.period.end}
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        leftIcon={<Printer className="w-4 h-4" />}
                        onClick={() => window.print()}
                    >
                        Cetak
                    </Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                        <p className="text-xs uppercase text-slate-500">
                            Total Pendapatan
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(report.totalRevenue)}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs uppercase text-slate-500">
                            Total Beban
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(report.totalExpense)}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs uppercase text-slate-500">
                            Laba Bersih
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(report.netProfit)}
                        </p>
                    </div>
                </div>

                {renderSection(
                    "Pendapatan",
                    report.revenues.items,
                    report.revenues.total,
                )}
                {renderSection("Harga Pokok", report.cogs.items, report.cogs.total)}
                {renderSection(
                    "Beban Operasional",
                    report.operatingExpenses.items,
                    report.operatingExpenses.total,
                )}
                {renderSection(
                    "Pendapatan Lain-lain",
                    report.otherRevenues.items,
                    report.otherRevenues.total,
                )}
                {renderSection(
                    "Beban Lain-lain",
                    report.otherExpenses.items,
                    report.otherExpenses.total,
                )}
            </div>
        </>
    );
};

export default ProfitLossPrint;
