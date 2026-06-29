import React, { useEffect } from "react";
import { Head } from "@inertiajs/react";
import { Printer } from "lucide-react";
import { Button } from "@/Components/Button";
import { formatCurrency } from "@/lib/utils";
import { Outlet } from "@/types";
import {
    BalanceSheetReport,
    BalanceSheetSection,
    BalanceSheetSections,
} from "@/types/balance_sheet";

interface BalanceSheetPrintProps {
    report: BalanceSheetReport;
    outlet: Outlet;
}

const BalanceSheetPrint = ({ report, outlet }: BalanceSheetPrintProps) => {
    useEffect(() => {
        window.print();
    }, []);

    const renderSections = (sections: BalanceSheetSections) => {
        return Object.entries(sections).map(([sectionName, section]) => (
            <div key={sectionName} className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-slate-100 font-semibold capitalize">
                    {sectionName.replace(/_/g, " ")}
                </div>
                <div className="divide-y">
                    {(section as BalanceSheetSection).items.length > 0 ? (
                        section.items.map((item, index) => (
                            <div
                                key={item.id ?? `${sectionName}-${index}`}
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
                    <span>{formatCurrency(section.total)}</span>
                </div>
            </div>
        ));
    };

    return (
        <>
            <Head title={`Cetak Neraca ${outlet.name}`} />

            <div className="min-h-screen bg-white text-slate-900 p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Laporan Neraca</h1>
                        <p className="text-sm text-slate-600">{outlet.name}</p>
                        <p className="text-sm text-slate-600">
                            Posisi per {report.date}
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
                            Total Aset
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(report.summary.totalAssets)}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs uppercase text-slate-500">
                            Total Liabilitas + Ekuitas
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(
                                report.summary.totalLiabilitiesEquity,
                            )}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs uppercase text-slate-500">
                            Status Neraca
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {report.summary.isBalanced
                                ? "Seimbang"
                                : "Belum Seimbang"}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Aset</h2>
                    {renderSections(report.assets.sections)}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Liabilitas</h2>
                    {renderSections(report.liabilities.sections)}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Ekuitas</h2>
                    {renderSections(report.equity.sections)}
                </div>
            </div>
        </>
    );
};

export default BalanceSheetPrint;
