import { Landmark } from "lucide-react";
import { Badge } from "@/Components/Badge";
import { Card } from "@/Components/Card";
import { PayrollItemsIndexProps } from "./types";

export default function PayrollItemsIndex({ payroll }: PayrollItemsIndexProps) {
    const details = payroll.payrollDetails || [];
    const itemCount = details.length;

    const totalEarning = details
        .filter((d) => d.isEarning)
        .reduce((sum, d) => sum + Number(d.amount), 0);
    const totalDeduction = details
        .filter((d) => d.isDeduction)
        .reduce((sum, d) => sum + Number(d.amount), 0);
    const netSalary = totalEarning - totalDeduction;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Card className="card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                        Total Item
                    </p>
                    <p className="mt-1 text-xl font-bold text-primary">
                        {itemCount}
                    </p>
                </Card>

                <Card className="card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                        Total Pemasukan
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--color-success-600)]">
                        {formatCurrency(totalEarning)}
                    </p>
                </Card>

                <Card className="card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">
                        Total Potongan
                    </p>
                    <p className="mt-1 text-lg font-bold text-[var(--color-error-600)]">
                        {formatCurrency(totalDeduction)}
                    </p>
                </Card>
            </div>

            <Card className="card p-0 overflow-hidden rounded-2xl flex flex-col bg-surface">
                <div className="card-header flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-color bg-surface-muted text-[var(--color-primary-600)]">
                            <Landmark className="w-5 h-5" />
                        </div>
                        <h3 className="text-primary text-lg font-bold tracking-tight">
                            Komponen Gaji
                        </h3>
                    </div>
                    {itemCount > 0 && (
                        <Badge
                            variant="default"
                            className="rounded-lg border border-color bg-surface-muted px-2.5 py-1 text-xs font-bold text-secondary"
                        >
                            {itemCount} Item
                        </Badge>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-muted">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-tertiary">
                                    Komponen
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-tertiary">
                                    Kategori
                                </th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-tertiary">
                                    Jenis
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-tertiary">
                                    Nominal
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-color">
                            {details.length > 0 ? (
                                details.map((detail) => (
                                    <tr
                                        key={detail.id}
                                        className="group transition-colors hover:bg-surface-muted"
                                    >
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-secondary transition-colors group-hover:text-primary">
                                                {detail.name}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-semibold uppercase tracking-tighter text-secondary">
                                                {detail.categoryLabel ||
                                                    detail.category ||
                                                    "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                variant={detail.typeColor}
                                                className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                                            >
                                                {detail.typeLabel}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span
                                                className={`text-sm font-bold tabular-nums ${detail.isEarning ? "text-[var(--color-success-600)]" : "text-[var(--color-error-600)]"}`}
                                            >
                                                {detail.isDeduction ? "-" : ""}
                                                {detail.formattedAmount}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-sm font-medium italic text-tertiary"
                                    >
                                        Belum ada komponen payroll yang
                                        tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {itemCount > 0 && (
                            <tfoot>
                                <tr className="bg-surface-muted">
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-secondary"
                                    >
                                        Total Pemasukan
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold tabular-nums text-[var(--color-success-600)]">
                                        {formatCurrency(totalEarning)}
                                    </td>
                                </tr>
                                <tr className="bg-surface-muted">
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-right text-sm font-bold uppercase tracking-wider text-secondary"
                                    >
                                        Total Potongan
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold tabular-nums text-[var(--color-error-600)]">
                                        - {formatCurrency(totalDeduction)}
                                    </td>
                                </tr>
                                <tr className="border-t-2 border-color bg-surface-muted">
                                    <td
                                        colSpan={3}
                                        className="px-6 py-6 text-right text-base font-bold uppercase tracking-widest text-[var(--color-success-600)]"
                                    >
                                        Gaji Bersih
                                    </td>
                                    <td className="px-6 py-6 text-right text-xl font-black tabular-nums text-[var(--color-success-600)]">
                                        {formatCurrency(netSalary)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </Card>

            <div className="card flex gap-4 rounded-2xl border-color bg-surface p-5 text-sm leading-relaxed text-secondary shadow-sm">
                <Landmark className="w-5 h-5 shrink-0 opacity-70" />
                <p className="font-medium tracking-tight">
                    Komponen gaji di atas dihitung berdasarkan pengaturan gaji
                    tetap, tunjangan harian (jika ada), potongan
                    keterlambatan/pinalti, dan cicilan pinjaman pada periode
                    berjalan.
                </p>
            </div>
        </div>
    );
}
