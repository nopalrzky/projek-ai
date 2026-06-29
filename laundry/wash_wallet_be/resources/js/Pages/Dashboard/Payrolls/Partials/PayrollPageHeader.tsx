import { Wallet, ArrowLeft, Edit2 } from "lucide-react";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { PayrollPageHeaderProps } from "../types";

export default function PayrollPageHeader({ payroll }: PayrollPageHeaderProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0 shadow-sm">
                    <Wallet className="w-6 h-6" />
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
                            Payroll — {payroll.employeeName}
                        </h1>
                        <Badge
                            variant={payroll.statusColor}
                            className="text-xs uppercase tracking-wider px-2.5 py-0.5 rounded-lg font-bold"
                        >
                            {payroll.statusLabel}
                        </Badge>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] font-medium mt-1">
                        {payroll.transactionNumber}{" "}
                        <span className="mx-1.5 text-[var(--color-text-tertiary)]">
                            •
                        </span>{" "}
                        {payroll.periodLabel}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {payroll.canBeUpdated && (
                    <Button
                        href={route("payrolls.edit", payroll.id)}
                        variant="warning"
                        size="sm"
                        className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                    >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                    </Button>
                )}
                <Button
                    href={route("payrolls.index")}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-all duration-200"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
            </div>
        </div>
    );
}
