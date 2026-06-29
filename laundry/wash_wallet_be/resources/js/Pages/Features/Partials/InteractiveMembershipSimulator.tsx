import React, { useState } from "react";
import { 
    Play, Check, Info, ShieldCheck, CheckCircle2,
    Gift, Award, CreditCard, PlusCircle, Scale, Activity, MapPin, Users
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
        details: { label: string; value: string; highlight?: boolean }[];
    };
    successMessage: string;
}

const InteractiveMembershipSimulator: React.FC = () => {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [actionExecuted, setActionExecuted] = useState<Record<string, boolean>>({});

    const steps: SimulatorStep[] = [
        {
            id: "config",
            title: "Konfigurasi Paket",
            icon: <PlusCircle className="h-5 w-5" />,
            description: "Sebagai pemilik outlet (owner), Anda membuat paket layanan prabayar di dashboard. Contoh: 'Paket Kiloan Hemat' seharga Rp 80.000 dengan kuota 10 Kg cuci-kering-setrika yang berlaku selama 30 hari.",
            actor: "Owner Laundry",
            actorIcon: <Award className="h-4 w-4" />,
            features: [
                "Bebas tentukan jenis layanan laundry",
                "Atur nominal harga & durasi masa aktif",
                "Otomatisasi pencatatan uang muka di pembukuan"
            ],
            benefit: "Menjamin repeat order dari pelanggan di awal transaksi.",
            actionLabel: "Simulasikan: Rilis Paket Baru",
            simulatorState: {
                badgeText: "Paket Rilis",
                badgeType: "info",
                cardTitle: "Paket Kiloan Hemat",
                cardSubtitle: "Outlet: Tebet Raya | Masa Aktif: 30 Hari",
                details: [
                    { label: "Harga Paket", value: "Rp 80.000" },
                    { label: "Kuota Layanan", value: "10 Kg Cuci-Lipat-Setrika" },
                    { label: "Status Paket", value: "Aktif & Dapat Ditawarkan" }
                ]
            },
            successMessage: "Skenario berhasil: Paket baru dirilis! Kasir Anda di outlet kini bisa langsung menjual paket ini kepada pelanggan."
        },
        {
            id: "purchase",
            title: "Pembelian Paket",
            icon: <Gift className="h-5 w-5" />,
            description: "Pelanggan membeli paket prabayar tersebut. Kasir mendaftarkan langganan pelanggan via aplikasi kasir, dan sistem membuat jatah kuota aktif di akun pelanggan.",
            actor: "Kasir Outlet",
            actorIcon: <Users className="h-4 w-4" />,
            features: [
                "Pendaftaran langganan instan lewat HP kasir",
                "Pembuatan kode kuota pelanggan otomatis",
                "Pilihan pembayaran tunai maupun nontunai"
            ],
            benefit: "Menerima dana prabayar di awal untuk memperkuat cashflow outlet.",
            actionLabel: "Simulasikan: Catat Penjualan Paket",
            simulatorState: {
                badgeText: "Langganan Aktif",
                badgeType: "warning",
                cardTitle: "Langganan Member: Budi Santoso",
                cardSubtitle: "Kode Langganan: #SUB-BUDI-99",
                details: [
                    { label: "Paket Dibeli", value: "Paket Kiloan Hemat" },
                    { label: "Kuota Awal", value: "10 Kg" },
                    { label: "Sisa Kuota Budi", value: "10 Kg", highlight: true }
                ]
            },
            successMessage: "Skenario berhasil: Langganan aktif dibuat! Sisa kuota Budi terekam aman sebanyak 10 Kg di sistem."
        },
        {
            id: "usage",
            title: "Pengurangan Kuota",
            icon: <Activity className="h-5 w-5" />,
            description: "Budi membawa cucian kotor seberat 3 Kg. Kasir mendaftarkan order dan memilih pembayaran potong kuota. Sistem memvalidasi, memotong sisa kuota, dan mencatat log penggunaan.",
            actor: "Kasir & Pelanggan",
            actorIcon: <Scale className="h-4 w-4" />,
            features: [
                "Validasi otomatis sisa kuota pelanggan",
                "Log penggunaan kuota tercatat mendetail",
                "Order otomatis ditandai lunas dengan kuota"
            ],
            benefit: "Kasir tidak perlu mencatat manual di kertas, mencegah manipulasi data.",
            actionLabel: "Simulasikan: Potong Kuota 3 Kg",
            simulatorState: {
                badgeText: "Kuota Terpotong",
                badgeType: "accent",
                cardTitle: "Order Cucian Budi Santoso",
                cardSubtitle: "Metode: Potong Kuota (#SUB-BUDI-99)",
                details: [
                    { label: "Berat Cucian", value: "3 Kg" },
                    { label: "Sisa Kuota Budi", value: "7 Kg", highlight: true },
                    { label: "Konfirmasi WA", value: "Terkirim Otomatis" }
                ]
            },
            successMessage: "Skenario berhasil: Kuota berhasil dipotong! Kuota Budi tersisa 7 Kg dan notifikasi WhatsApp langsung terkirim."
        },
        {
            id: "membership",
            title: "Keuntungan Member",
            icon: <Award className="h-5 w-5" />,
            description: "Selain kuota, Budi terdaftar dalam program keanggotaan (Membership Plan) outlet. Budi otomatis menikmati benefit potongan diskon tambahan serta jatah gratis ongkir pengiriman kurir.",
            actor: "Pelanggan (Member)",
            actorIcon: <MapPin className="h-4 w-4" />,
            features: [
                "Diskon persentase langsung setiap transaksi reguler",
                "Batas kuota gratis ongkir kurir bulanan",
                "Masa berlaku kontrak member otomatis kedaluwarsa"
            ],
            benefit: "Pelanggan betah mencuci jangka panjang dan loyal menggunakan kurir outlet Anda.",
            actionLabel: "Simulasikan: Terapkan Diskon & Ongkir",
            simulatorState: {
                badgeText: "Member VIP Aktif",
                badgeType: "primary",
                cardTitle: "Keanggotaan Member Budi",
                cardSubtitle: "Status Kontrak: Aktif s/d 31 Des 2026",
                details: [
                    { label: "Potongan Diskon", value: "10% Otomatis" },
                    { label: "Jatah Gratis Ongkir", value: "5 kali sebulan" },
                    { label: "Sisa Jatah Ongkir", value: "4 kali", highlight: true }
                ]
            },
            successMessage: "Skenario berhasil: Diskon member dan pemotongan jatah gratis ongkir kurir berhasil diterapkan secara otomatis!"
        },
        {
            id: "topup",
            title: "Top-up Saldo Deposit",
            icon: <CreditCard className="h-5 w-5" />,
            description: "Pelanggan menyimpan deposit saldo di dompet digital outlet laundry Anda. Pelanggan dapat melakukan pengisian saldo (top-up) nontunai mandiri melalui aplikasi via Midtrans.",
            actor: "Pelanggan",
            actorIcon: <CreditCard className="h-4 w-4" />,
            features: [
                "Pengisian saldo instan terintegrasi Midtrans",
                "Dompet digital aman terikat akun pelanggan",
                "Metode transaksi nontunai mempercepat checkout"
            ],
            benefit: "Kasir tidak perlu menyiapkan uang kembalian tunai di outlet.",
            actionLabel: "Simulasikan: Top-up Saldo Rp 50.000",
            simulatorState: {
                badgeText: "Top-up Sukses",
                badgeType: "success",
                cardTitle: "Saldo Deposit Budi Santoso",
                cardSubtitle: "Pembayaran: Midtrans Cashless",
                details: [
                    { label: "Jumlah Top-up", value: "Rp 50.000" },
                    { label: "Saldo Sebelumnya", value: "Rp 100.000" },
                    { label: "Total Saldo Sekarang", value: "Rp 150.000", highlight: true }
                ]
            },
            successMessage: "Skenario berhasil: Top-up sukses! Saldo Budi terupdate menjadi Rp 150.000 dan siap digunakan belanja layanan."
        }
    ];

    const currentStep = steps[activeStepIndex];
    const isExecuted = actionExecuted[currentStep.id];

    const handleExecuteAction = () => {
        setActionExecuted(prev => ({ ...prev, [currentStep.id]: true }));
    };

    const getBadgeClass = (type: string) => {
        switch (type) {
            case "info":
                return "membership-simulator-badge-info";
            case "warning":
                return "membership-simulator-badge-warning";
            case "success":
                return "membership-simulator-badge-success";
            case "accent":
                return "membership-simulator-badge-accent";
            case "primary":
                return "membership-simulator-badge-primary";
            default:
                return "membership-simulator-badge-info";
        }
    };

    return (
        <section className="relative overflow-hidden py-24 lg:py-32 border-t border-b border-color membership-simulator">
            <div className="absolute inset-0 membership-simulator-grid opacity-30 pointer-events-none" />
            <div className="glow-orb glow-orb-blue-primary glow-top-left" />
            <div className="glow-orb glow-orb-blue-secondary glow-bottom-right" />

            <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                {/* Unified Section Header styled consistently via CSS Variables Override */}
                <div style={{ "--color-text-primary": "#ffffff", "--color-text-secondary": "var(--color-gray-400)" } as React.CSSProperties}>
                    <FeatureSectionHeader
                        badge="PROGRAM RETENSI PELANGGAN"
                        headline="Simulasi Langganan & Membership"
                        subheadline="Klik setiap tahapan di bawah untuk mensimulasikan bagaimana WashWallet mengamankan loyalitas pelanggan laundry Anda melalui paket kuota prabayar, membership, dan deposit nontunai."
                        accentColor="var(--color-info-500)"
                        accentBg="var(--color-info-50)"
                        accentBorder="var(--color-info-200)"
                    />
                </div>

                {/* Step Navigation */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10">
                    {steps.map((step, idx) => (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => {
                                setActiveStepIndex(idx);
                            }}
                            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-bold transition-all duration-300 ${
                                activeStepIndex === idx
                                    ? "membership-simulator-button-active"
                                    : "membership-simulator-button"
                            }`}
                        >
                            <span className="membership-simulator-step-number flex h-5 w-5 items-center justify-center rounded text-[10px]">
                                {idx + 1}
                            </span>
                            <span>{step.title}</span>
                        </button>
                    ))}
                </div>

                {/* Simulator Layout */}
                <div className="grid lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left: Explanation & SaaS Info */}
                    <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 rounded-2xl border backdrop-blur-sm membership-simulator-panel">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 flex items-center justify-center rounded-xl border membership-simulator-icon-badge">
                                    {currentStep.icon}
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider block membership-simulator-muted">Tahap Aktif</span>
                                    <h3 className="text-lg font-bold leading-tight membership-simulator-strong">{currentStep.title}</h3>
                                </div>
                            </div>

                            <p className="membership-simulator-copy text-sm leading-relaxed">
                                {currentStep.description}
                            </p>

                            <div className="membership-simulator-divider border-t pt-4 space-y-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="font-semibold text-slate-400">Siapa yang Mengakses:</span>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border membership-simulator-pill">
                                        {currentStep.actorIcon}
                                        {currentStep.actor}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Fitur Utama</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {currentStep.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2 p-2 rounded border membership-simulator-row">
                                                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 membership-simulator-feature-icon" />
                                                <span className="text-xs font-medium text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Dampak bagi Bisnis Laundry</span>
                                    <div className="flex items-center gap-2 text-xs font-sans bg-amber-500/5 border border-amber-500/10 p-2.5 rounded text-amber-400">
                                        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                        <span>Manfaat: {currentStep.benefit}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t membership-simulator-divider">
                            <button
                                type="button"
                                onClick={handleExecuteAction}
                                disabled={isExecuted}
                                className={`w-full py-3 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all duration-300 ${
                                    isExecuted
                                        ? "membership-simulator-badge-success cursor-not-allowed"
                                        : "membership-simulator-primary-action"
                                }`}
                            >
                                {isExecuted ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Skenario Berhasil Disimulasikan!
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

                    {/* Right: Visual Mockup Simulator */}
                    <div className="lg:col-span-5 flex flex-col p-6 rounded-2xl border backdrop-blur-sm membership-simulator-panel">
                        {/* Browser dot top header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-5">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full membership-simulator-dot" />
                                <span className="h-2 w-2 rounded-full membership-simulator-dot" />
                                <span className="h-2 w-2 rounded-full membership-simulator-dot" />
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded">
                                washwallet-client://membership-dashboard
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="border rounded-xl p-5 relative overflow-hidden membership-simulator-card">
                                <div className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full blur-xl pointer-events-none membership-simulator-card-orb" />

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{currentStep.simulatorState.cardTitle}</h4>
                                        <p className="membership-simulator-muted text-[10px] mt-0.5">{currentStep.simulatorState.cardSubtitle}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded border ${
                                        isExecuted 
                                            ? "membership-simulator-badge-success" 
                                            : getBadgeClass(currentStep.simulatorState.badgeType)
                                    }`}>
                                        {isExecuted ? "Sukses" : currentStep.simulatorState.badgeText}
                                    </span>
                                </div>

                                <div className="space-y-2.5 mt-4">
                                    {currentStep.simulatorState.details.map((detail, dIdx) => (
                                        <div key={dIdx} className="flex justify-between items-center p-3 rounded-lg border membership-simulator-row">
                                            <span className="text-slate-400 text-xs">{detail.label}</span>
                                            <span className={`text-xs font-semibold ${detail.highlight ? "membership-simulator-highlight" : "text-slate-200"}`}>
                                                {detail.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {isExecuted && (
                                    <div className="mt-4 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs space-y-1 animate-fadeInUp">
                                        <span className="font-bold flex items-center gap-1">
                                            <Check className="h-3 w-3" />
                                            Update Sistem:
                                        </span>
                                        <p className="text-[10px] text-slate-300 font-sans">
                                            {currentStep.successMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Hint */}
                        <div className="flex items-center gap-2 mt-5 p-3 rounded-xl text-[11px] border membership-simulator-row">
                            <Info className="h-3.5 w-3.5 flex-shrink-0 text-info-500" />
                            <span className="text-slate-400">Data sisa kuota dan langganan aktif tersinkronisasi instan demi kemudahan audit pembukuan outlet.</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InteractiveMembershipSimulator;
