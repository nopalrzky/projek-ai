import { Activity, AlertCircle, Calendar } from "lucide-react";
import { Card } from "@/Components/Card";
import { Payroll } from "@/types";

interface Props {
    payroll: Payroll;
}

export default function PayrollLogs({ payroll }: Props) {
    const workLogs = payroll.workLogs || [];
    const fineLogs = payroll.fineLogs || [];

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Card className="card bg-surface p-0 overflow-hidden border-color rounded-2xl flex flex-col">
                <div className="p-6 border-b border-color flex items-center justify-between bg-surface-muted">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-primary tracking-tight">
                            Log Pekerjaan (Komisi)
                        </h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                        {workLogs.length} Item
                    </span>
                </div>

                <div className="divide-y border-color max-h-[500px] overflow-y-auto custom-scrollbar">
                    {workLogs.length > 0 ? (
                        workLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-5 flex items-center justify-between hover:bg-surface-muted transition-colors group"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-primary transition-colors">
                                        {log.description ||
                                            "Komisi Proses Layanan"}
                                    </p>
                                    <div className="flex items-center gap-2 text-tertiary">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">
                                            {log.date}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-emerald-600 tabular-nums bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                                    +{log.formattedAmount}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-tertiary italic text-sm font-medium">
                            Tidak ada log pekerjaan yang terhubung.
                        </div>
                    )}
                </div>
            </Card>

            {/* Fine Logs */}
            <Card className="card bg-surface p-0 overflow-hidden border-color rounded-2xl flex flex-col">
                <div className="p-6 border-b border-color flex items-center justify-between bg-surface-muted">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 border border-rose-100">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-primary tracking-tight">
                            Log Pelanggaran (Denda)
                        </h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-rose-100 text-rose-700">
                        {fineLogs.length} Item
                    </span>
                </div>

                <div className="divide-y border-color max-h-[500px] overflow-y-auto custom-scrollbar">
                    {fineLogs.length > 0 ? (
                        fineLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-5 flex items-center justify-between hover:bg-surface-muted transition-colors group"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-primary transition-colors">
                                        {log.fine?.name || "Pelanggaran Aturan"}
                                    </p>
                                    <div className="flex items-center gap-2 text-tertiary">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">
                                            {log.date}
                                        </span>
                                    </div>
                                    {log.reason && (
                                        <p className="text-[10px] text-tertiary italic leading-tight max-w-[200px] truncate">
                                            "{log.reason}"
                                        </p>
                                    )}
                                </div>
                                <span className="text-sm font-black text-rose-600 tabular-nums bg-rose-50 px-3 py-1 rounded-xl border border-rose-100">
                                    -
                                    {log.formattedAmount ||
                                        `Rp ${new Intl.NumberFormat("id-ID").format(log.amount)}`}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-tertiary italic text-sm font-medium">
                            Tidak ada log denda yang terhubung.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
