import React, { useEffect } from "react";
import { Head } from "@inertiajs/react";
import { Printer } from "lucide-react";
import { Button } from "@/Components/Button";
import { formatCurrency } from "@/lib/utils";
import { Outlet } from "@/types";
import { GeneralLedgerData } from "@/types/general_ledger";

interface GeneralLedgerPrintProps {
    ledger: GeneralLedgerData & {
        outlet?: Outlet;
    };
}

const GeneralLedgerPrint = ({ ledger }: GeneralLedgerPrintProps) => {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <>
            <Head title={`Cetak Buku Besar ${ledger.account.name}`} />

            <div className="min-h-screen bg-white text-slate-900 p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Buku Besar</h1>
                        <p className="text-sm text-slate-600">
                            {ledger.outlet?.name || "-"} • {ledger.account.code} -{" "}
                            {ledger.account.name}
                        </p>
                        <p className="text-sm text-slate-600">
                            Periode {ledger.period.start} s/d {ledger.period.end}
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
                            Saldo Awal
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(ledger.openingBalance)}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs uppercase text-slate-500">
                            Total Mutasi
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(
                                ledger.closingBalance - ledger.openingBalance,
                            )}
                        </p>
                    </div>
                    <div className="border rounded-lg p-4">
                        <p className="text-xs uppercase text-slate-500">
                            Saldo Akhir
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                            {formatCurrency(ledger.closingBalance)}
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="px-3 py-2 text-left">Tanggal</th>
                                <th className="px-3 py-2 text-left">No. Transaksi</th>
                                <th className="px-3 py-2 text-left">Keterangan</th>
                                <th className="px-3 py-2 text-right">Debit</th>
                                <th className="px-3 py-2 text-right">Kredit</th>
                                <th className="px-3 py-2 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledger.transactions.map((transaction) => (
                                <tr key={transaction.id} className="border-t">
                                    <td className="px-3 py-2">{transaction.date}</td>
                                    <td className="px-3 py-2">
                                        {transaction.transactionNumber}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div>{transaction.description}</div>
                                        {transaction.memo && (
                                            <div className="text-xs text-slate-500">
                                                {transaction.memo}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {formatCurrency(transaction.debit)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {formatCurrency(transaction.credit)}
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium">
                                        {formatCurrency(
                                            transaction.runningBalance,
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default GeneralLedgerPrint;
