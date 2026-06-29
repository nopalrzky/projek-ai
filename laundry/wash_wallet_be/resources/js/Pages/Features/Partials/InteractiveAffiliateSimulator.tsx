import React, { useState } from "react";
import {
    Play,
    Check,
    Info,
    ShieldCheck,
    CheckCircle2,
    Link,
    Award,
    Wallet,
    PlusCircle,
    Database,
    Receipt,
    Users,
} from "lucide-react";
import FeatureSectionHeader from "./FeatureSectionHeader";

export interface SimulatorStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    actor: string;
    actorIcon: React.ReactNode;
    features: string[];
    benefit: string;
    actionLabel: string;
    simulatorState: {
        badgeText: string;
        badgeType: "info" | "warning" | "success" | "accent" | "primary";
        cardTitle: string;
        cardSubtitle: string;
        details: { label: string; value: string; highlight?: boolean; status?: string }[];
    };
    successMessage: string;
}

const getStatusColor = (status?: string) => {
    switch (status) {
        case "pending":
            return "var(--color-purple-300)";
        case "processing":
            return "var(--color-purple-400)";
        case "weighing":
            return "var(--color-purple-500)";
        case "delivering":
            return "var(--color-purple-600)";
        case "done":
        default:
            return "var(--color-purple-500)";
    }
};

const InteractiveAffiliateSimulator: React.FC = () => {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [actionExecuted, setActionExecuted] = useState<Record<string, boolean>>({});

    const steps: SimulatorStep[] = [
        {
            id: "code",
            title: "Kode Referral",
            icon: <PlusCircle className="h-5 w-5" />,
            description:
                "Sebagai pemilik outlet (owner), Anda otomatis mendapatkan kode referral 8 karakter unik di profil akun Anda (misal: 'WASH88AB'). Kode ini siap dibagikan kepada owner laundry lain.",
            actor: "Referrer (Owner)",
            actorIcon: <Award className="h-4 w-4" />,
            features: [
                "Kode unik 8 karakter otomatis dibuat",
                "Terlihat langsung di dashboard & profil",
                "Bebas dibagikan ke komunitas pengusaha",
            ],
            benefit: "Memulai program kemitraan dengan praktis tanpa syarat rumit.",
            actionLabel: "Simulasikan: Aktifkan Kode",
            simulatorState: {
                badgeText: "Kode Aktif",
                badgeType: "info",
                cardTitle: "Profil Owner: WASH88AB",
                cardSubtitle: "Kode Kemitraan Anda: WASH88AB",
                details: [
                    { label: "Status Kode", value: "Valid & Aktif" },
                    { label: "Partner Terdaftar", value: "0 Owner" },
                    { label: "Total Komisi Koin", value: "0 Koin" },
                ],
            },
            successMessage:
                "Skenario berhasil: Kode referral WASH88AB aktif! Kode ini siap digunakan saat rekan Anda mendaftar akun.",
        },
        {
            id: "register",
            title: "Pendaftaran Teman",
            icon: <Link className="h-5 w-5" />,
            description:
                "Rekan Anda (referred owner) mendaftar akun WashWallet baru dan memasukkan kode referral WASH88AB pada form registrasi. Sistem mendeteksi relasi dan menghubungkan akun mereka.",
            actor: "Partner (Referred Owner)",
            actorIcon: <Users className="h-4 w-4" />,
            features: [
                "Form input kode referral saat mendaftar",
                "Validasi status kode aktif secara instan",
                "Hubungan partner diikat aman di sistem",
            ],
            benefit:
                "Menjamin pencatatan partner terekam rapi di database sejak hari pertama.",
            actionLabel: "Simulasikan: Hubungkan Partner",
            simulatorState: {
                badgeText: "Partner Terhubung",
                badgeType: "info",
                cardTitle: "Mitra Baru: Laundry Berkah",
                cardSubtitle: "Owner Baru Terhubung",
                details: [
                    { label: "Nama Outlet Baru", value: "Laundry Berkah (Tebet)" },
                    { label: "Referral Digunakan", value: "WASH88AB (Owner)" },
                    { label: "Status Hubungan", value: "Terdaftar (1-Tingkat)" },
                ],
            },
            successMessage:
                "Skenario berhasil: Laundry Berkah terhubung! Dashboard afiliasi Anda kini memperlihatkan 1 partner terdaftar.",
        },
        {
            id: "topup",
            title: "Top-up Koin Partner",
            icon: <Wallet className="h-5 w-5" />,
            description:
                "Laundry Berkah melakukan pembelian koin laundry (top-up) sukses untuk operasional mesin & struk mereka. Sistem otomatis mendeteksi relasi kemitraan Anda.",
            actor: "Partner (Laundry Berkah)",
            actorIcon: <Wallet className="h-4 w-4" />,
            features: [
                "Top-up saldo koin operasional laundry",
                "Pembayaran instan cashless via Midtrans",
                "Pemicu komisi berjalan otomatis di sistem",
            ],
            benefit:
                "Memberikan komisi kemitraan secara adil dari aktivitas top-up riil.",
            actionLabel: "Simulasikan: Top-up Koin 100 Pcs",
            simulatorState: {
                badgeText: "Top-up Berhasil",
                badgeType: "info",
                cardTitle: "Transaksi Koin Laundry Berkah",
                cardSubtitle: "Metode: Midtrans Settled",
                details: [
                    { label: "Nilai Top-up", value: "Rp 200.000 (100 Koin)" },
                    { label: "Status Transaksi", value: "Sukses / Settled" },
                ],
            },
            successMessage:
                "Skenario berhasil: Pembayaran top-up partner disetujui! Sistem sekarang mengalokasikan jatah komisi koin Anda.",
        },
        {
            id: "commission",
            title: "Komisi Dialokasikan",
            icon: <Receipt className="h-5 w-5" />,
            description:
                "Sistem membagikan komisi koin sebesar 10% dari nominal top-up partner (10 koin) langsung ke Saldo Reward Anda. Riwayat dicatat dalam log referral.",
            actor: "Sistem WashWallet",
            actorIcon: <Database className="h-4 w-4" />,
            features: [
                "Komisi 10% flat dari total koin top-up partner",
                "Reward koin otomatis bertambah instan",
                "Pencatatan rincian lengkap di Referral Log",
            ],
            benefit: "Mendapat koin gratis tanpa biaya administrasi tersembunyi.",
            actionLabel: "Simulasikan: Terima Komisi Koin",
            simulatorState: {
                badgeText: "Komisi Diterima",
                badgeType: "info",
                cardTitle: "Saldo Reward Anda",
                cardSubtitle: "Sumber: Komisi Koin Laundry Berkah",
                details: [
                    {
                        label: "Koin Diterima",
                        value: "+10 Koin (10% dari 100 koin)",
                        highlight: true,
                    },
                    { label: "Pos Saldo", value: "Reward Balance" },
                    { label: "Status Log", value: "Tercatat di ReferralLog" },
                ],
            },
            successMessage:
                "Skenario berhasil: Komisi +10 Koin masuk ke saldo reward Anda! Koin ini dapat langsung digunakan untuk operasional outlet Anda.",
        },
        {
            id: "accounting",
            title: "Pembukuan Jurnal",
            icon: <Database className="h-5 w-5" />,
            description:
                "Sistem akuntansi merekam transaksi komisi ini secara otomatis ke dalam entri jurnal akuntansi sebagai beban referral dan pendapatan afiliasi.",
            actor: "Sistem Akuntansi",
            actorIcon: <Database className="h-4 w-4" />,
            features: [
                "Jurnal transaksi otomatis dan seimbang (balanced)",
                "Pemisahan alur pencatatan koin komisi",
                "Laporan keuangan outlet Anda tetap rapi & transparan",
            ],
            benefit:
                "Menjaga keakuratan pembukuan outlet Anda tanpa rekap manual.",
            actionLabel: "Simulasikan: Catat Jurnal Keuangan",
            simulatorState: {
                badgeText: "Jurnal Tercatat",
                badgeType: "info",
                cardTitle: "Entri Jurnal Kemitraan",
                cardSubtitle: "Status: Balanced & Terposting",
                details: [
                    { label: "Pos Debet (Beban)", value: "Rp 20.000" },
                    { label: "Pos Kredit (Pendapatan)", value: "Rp 20.000" },
                ],
            },
            successMessage:
                "Skenario berhasil: Pembukuan keuangan selesai! Jurnal penyesuaian tercatat rapi untuk mempermudah audit kas bulanan.",
        },
    ];

    const currentStep = steps[activeStepIndex];
    const isExecuted = actionExecuted[currentStep.id];

    const handleExecuteAction = () => {
        setActionExecuted((prev) => ({ ...prev, [currentStep.id]: true }));
    };

    const simulatorStyle = {
        "--interactive-simulator-accent": "var(--color-purple-500)",
        "--interactive-simulator-accent-strong": "var(--color-purple-600)",
        "--interactive-simulator-glow-secondary": "var(--color-purple-400)",
        "--color-text-primary": "var(--color-interactive-simulator-text-primary)",
        "--color-text-secondary": "var(--color-interactive-simulator-text-secondary)",
    } as React.CSSProperties;

    return (
        <section
            className="relative overflow-hidden py-24 lg:py-32"
            style={simulatorStyle}
        >
            <div className="container mx-auto relative z-10 max-w-7xl px-4">
                <FeatureSectionHeader
                    badge="PROGRAM REFERRAL OWNER"
                    headline="Simulasi Alur Kemitraan & Komisi"
                    subheadline="Klik setiap tahapan di bawah untuk mensimulasikan bagaimana program afiliasi WashWallet bekerja secara riil, mulai dari pembuatan kode rujukan hingga penghitungan komisi dan pembukuan otomatis."
                    accentColor="var(--color-purple-500)"
                    accentBg="var(--color-purple-50)"
                    accentBorder="var(--color-purple-200)"
                />

                <div className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => setActiveStepIndex(idx)}
                            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-bold transition-all duration-300 ${
                                activeStepIndex === idx
                                    ? "interactive-simulator-button-active"
                                    : "interactive-simulator-button"
                            }`}
                        >
                            <span className="interactive-simulator-step-number flex h-5 w-5 items-center justify-center rounded text-[10px]">
                                {idx + 1}
                            </span>
                            <span>{step.title}</span>
                        </button>
                    ))}
                </div>

                <div className="grid items-stretch gap-8 lg:grid-cols-12">
                    <div className="interactive-simulator-panel flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm md:p-8 lg:col-span-7">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="interactive-simulator-icon-badge flex h-9 w-9 items-center justify-center rounded-xl border">
                                    {currentStep.icon}
                                </div>
                                <div>
                                    <span className="interactive-simulator-muted block text-[10px] font-bold uppercase tracking-wider">
                                        Tahap Aktif
                                    </span>
                                    <h3 className="interactive-simulator-strong text-lg font-bold leading-tight">
                                        {currentStep.title}
                                    </h3>
                                </div>
                            </div>

                            <p className="interactive-simulator-copy text-sm leading-relaxed">
                                {currentStep.description}
                            </p>

                            <div className="interactive-simulator-divider space-y-4 border-t pt-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="interactive-simulator-copy-soft font-semibold">
                                        Siapa yang Mengakses:
                                    </span>
                                    <span className="interactive-simulator-pill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium">
                                        {currentStep.actorIcon}
                                        {currentStep.actor}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <span className="interactive-simulator-muted block text-[10px] font-bold uppercase tracking-wider">
                                        Kelebihan Fitur
                                    </span>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {currentStep.features.map((feature, fIdx) => (
                                            <div
                                                key={fIdx}
                                                className="interactive-simulator-row flex items-center gap-2 rounded border p-2"
                                            >
                                                <CheckCircle2 className="interactive-simulator-feature-icon h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="interactive-simulator-copy text-xs font-medium">
                                                    {feature}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="interactive-simulator-muted block text-[10px] font-bold uppercase tracking-wider">
                                        Batasan & Keamanan Akses
                                    </span>
                                    <div className="interactive-simulator-badge-info flex items-center gap-2 rounded border p-2.5 text-xs font-sans">
                                        <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                                        <span>Keamanan: {currentStep.benefit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="interactive-simulator-divider mt-6 border-t pt-4">
                            <button
                                type="button"
                                onClick={handleExecuteAction}
                                disabled={isExecuted}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold transition-all duration-300 ${
                                    isExecuted
                                        ? "interactive-simulator-primary-action cursor-not-allowed opacity-90"
                                        : "interactive-simulator-primary-action active:scale-[0.98]"
                                }`}
                            >
                                {isExecuted ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Tahapan Selesai Mensimulasikan!
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                        {currentStep.actionLabel}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="interactive-simulator-panel-subtle relative flex flex-col overflow-hidden rounded-2xl border p-6 lg:col-span-5">
                        <div className="interactive-simulator-card mb-5 flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-1.5">
                                <span className="interactive-simulator-dot h-2 w-2 rounded-full" />
                                <span className="interactive-simulator-dot h-2 w-2 rounded-full" />
                                <span className="interactive-simulator-dot h-2 w-2 rounded-full" />
                            </div>
                            <span className="interactive-simulator-browser-label rounded px-2 py-0.5 font-mono text-[9px]">
                                washwallet-client://affiliate-dashboard
                            </span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center">
                            <div className="interactive-simulator-card relative overflow-hidden rounded-xl border p-5">
                                <div className="interactive-simulator-card-orb pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full blur-xl" />

                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="interactive-simulator-title text-sm font-bold">
                                            {currentStep.simulatorState.cardTitle}
                                        </h4>
                                        <p className="interactive-simulator-muted mt-0.5 text-[10px]">
                                            {currentStep.simulatorState.cardSubtitle}
                                        </p>
                                    </div>
                                    <span
                                        className={`rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                                            isExecuted
                                                ? "interactive-simulator-badge-info"
                                                : "interactive-simulator-badge-info"
                                        }`}
                                    >
                                        {isExecuted
                                            ? "Sukses"
                                            : currentStep.simulatorState.badgeText}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2.5">
                                    {currentStep.simulatorState.details.map(
                                        (detail, dIdx) => (
                                            <div
                                                key={dIdx}
                                                className="interactive-simulator-row flex items-center justify-between gap-3 rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                                                        style={{
                                                            backgroundColor: getStatusColor(
                                                                detail.status,
                                                            ),
                                                        }}
                                                    />
                                                    <span className="interactive-simulator-copy-soft text-xs">
                                                        {detail.label}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-right text-xs font-semibold ${
                                                        detail.highlight
                                                            ? "interactive-simulator-highlight"
                                                            : "interactive-simulator-strong"
                                                    }`}
                                                >
                                                    {detail.value}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {isExecuted && (
                                    <div className="interactive-simulator-badge-info mt-4 space-y-1 rounded-lg border p-3 text-xs animate-fadeInUp">
                                        <span className="flex items-center gap-1 font-bold">
                                            <Check className="h-3 w-3" />
                                            Update Sistem:
                                        </span>
                                        <p className="interactive-simulator-copy font-sans text-[10px]">
                                            {currentStep.successMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="interactive-simulator-row interactive-simulator-muted mt-5 flex items-center gap-2 rounded-xl border p-3 text-[11px]">
                            <Info className="interactive-simulator-feature-icon h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                                Data referred owner dan log koin komisi
                                terintegrasi secara aman di pembukuan outlet
                                Anda.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InteractiveAffiliateSimulator;
