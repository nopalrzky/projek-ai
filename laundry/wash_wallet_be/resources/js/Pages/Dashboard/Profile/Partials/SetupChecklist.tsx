import React from "react";
import { Card } from "@/Components/Card";
import { Progress } from "@/Components/Progress";
import { CheckCircle2, Circle, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";
import type { ProfileSetupChecklist } from "../types";

interface SetupChecklistProps {
    checklist: ProfileSetupChecklist;
}

export const SetupChecklist: React.FC<SetupChecklistProps> = ({ checklist }) => {
    const items = [
        {
            key: "profile",
            label: "Lengkapi data profil utama",
            isDone: checklist.profileComplete,
            description: "Nama, email, telepon, dan alamat wajib terisi.",
            href: route("profile.edit"),
        },
        {
            key: "phone",
            label: "Verifikasi / Tambahkan Nomor Telepon",
            isDone: checklist.hasPhone,
            description: "Nomor telepon aktif memudahkan komunikasi dan koordinasi bisnis.",
            href: route("profile.edit"),
        },
        {
            key: "address",
            label: "Lengkapi Alamat Profil",
            isDone: checklist.hasAddress,
            description: "Alamat lengkap dibutuhkan untuk validasi identitas bisnis.",
            href: route("profile.edit"),
        },
        {
            key: "outlet",
            label: "Buat Outlet Laundry Pertama",
            isDone: checklist.hasOutlet,
            description: "Memiliki minimal satu outlet untuk mulai operasional kasir.",
            href: route("outlets.create"),
        },
        {
            key: "activeOutlet",
            label: "Aktifkan Status Outlet",
            isDone: checklist.hasActiveOutlet,
            description: "Outlet Anda harus dalam status aktif agar kasir dapat login.",
            href: route("outlets.index"),
        },
        {
            key: "bankAccount",
            label: "Hubungkan Rekening Bank Withdrawal",
            isDone: checklist.hasActiveBankAccount,
            description: "Dibutuhkan untuk mencairkan saldo pendapatan laundry Anda.",
            href: route("bank-accounts.create"),
        },
    ];

    const doneCount = items.filter((item) => item.isDone).length;
    const totalCount = items.length;
    const progressPercent = Math.round((doneCount / totalCount) * 100);

    if (progressPercent === 100) {
        return (
            <Card className="border-success-100 bg-success-50/20 dark:border-success-900/30 dark:bg-success-950/5">
                <div className="p-6 text-center space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto" />
                    <h3 className="text-base font-bold text-success-800 dark:text-success-400">
                        Setup Akun Anda Sudah Lengkap! 🎉
                    </h3>
                    <p className="text-xs text-success-700/80 dark:text-success-400/80 max-w-md mx-auto">
                        Semua langkah dasar konfigurasi profil, outlet, dan rekening bank Anda telah terpenuhi dengan baik. Bisnis Anda siap berjalan penuh!
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-base font-semibold text-primary">
                                Setup Kelengkapan Akun
                            </h3>
                            <p className="text-xs text-secondary mt-0.5">
                                Selesaikan setup berikut untuk mengoptimalkan operasional dan penarikan dana bisnis Anda.
                            </p>
                        </div>
                        <div className="text-right sm:text-right shrink-0">
                            <span className="text-sm font-bold text-primary">
                                {doneCount} / {totalCount} Selesai ({progressPercent}%)
                            </span>
                        </div>
                    </div>

                    <Progress
                        value={progressPercent}
                        variant="primary"
                        size="sm"
                        animated
                        className="bg-surface-muted"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {items.map((item) => (
                            <div
                                key={item.key}
                                className={`p-4 border rounded-lg transition-all flex items-start gap-3 ${
                                    item.isDone
                                        ? "border-success-100 bg-success-50/10 dark:border-success-900/10 dark:bg-success-950/5"
                                        : "border-color bg-surface-muted hover:border-border-hover"
                                }`}
                            >
                                <div className="shrink-0 mt-0.5">
                                    {item.isDone ? (
                                        <CheckCircle2 className="w-5 h-5 text-success-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-secondary" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm font-semibold truncate ${
                                            item.isDone
                                                ? "text-success-800 dark:text-success-300"
                                                : "text-primary"
                                        }`}
                                    >
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-secondary mt-0.5 line-clamp-2">
                                        {item.description}
                                    </p>
                                    {!item.isDone && (
                                        <Link
                                            href={item.href}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary mt-2.5"
                                        >
                                            Selesaikan Sekarang
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};
