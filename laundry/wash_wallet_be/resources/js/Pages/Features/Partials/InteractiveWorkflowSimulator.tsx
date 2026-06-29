import React, { useState } from "react";
import { 
    Play, Check, Info, ShieldCheck, CheckCircle2,
    Smartphone, User, Database, Receipt, PlusCircle, Activity, MapPin, Users
} from "lucide-react";
import FeatureSectionHeader from "./FeatureSectionHeader";

interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    role: string;
    roleIcon: React.ReactNode;
    features: string[];
    authority: string;
    actionLabel: string;
    simulatorState: {
        badgeText: string;
        badgeType: "info" | "warning" | "success" | "accent" | "primary";
        cardTitle: string;
        cardSubtitle: string;
        items: { name: string; qty: string; status: string }[];
    };
}

const InteractiveWorkflowSimulator: React.FC = () => {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [actionExecuted, setActionExecuted] = useState<Record<string, boolean>>({});

    const steps: WorkflowStep[] = [
        {
            id: "intake",
            title: "Penerimaan Order",
            icon: <PlusCircle className="h-5 w-5" />,
            description: "Kasir membuat order baru dari aplikasi kasir di outlet, atau pelanggan memesan penjemputan sendiri langsung lewat aplikasi pelanggan.",
            role: "Kasir / Pelanggan",
            roleIcon: <Smartphone className="h-4 w-4" />,
            features: [
                "Pencatatan order instan via HP/Tablet",
                "Pemesanan mandiri dari aplikasi pelanggan",
                "Pemberitahuan masuk ke dashboard owner"
            ],
            authority: "Bisa diakses oleh Kasir, Owner, dan Pelanggan",
            actionLabel: "Simulasikan: Terima Order",
            simulatorState: {
                badgeText: "Order Masuk",
                badgeType: "info",
                cardTitle: "Nota Digital #WW-9081",
                cardSubtitle: "Pelanggan: Budi Santoso | Sumber: Aplikasi Kasir",
                items: [
                    { name: "Kemeja Lengan Panjang", qty: "3 pcs", status: "pending" },
                    { name: "Celana Jeans", qty: "2 pcs", status: "pending" }
                ]
            }
        },
        {
            id: "weighing",
            title: "Timbangan & Layanan",
            icon: <Activity className="h-5 w-5" />,
            description: "Kasir menimbang berat pakaian di outlet untuk menentukan tarif laundry kiloan secara akurat, memastikan tidak ada kesalahan input harga.",
            role: "Kasir Outlet",
            roleIcon: <User className="h-4 w-4" />,
            features: [
                "Input timbangan berat cucian riil",
                "Perhitungan harga kiloan & satuan otomatis",
                "Verifikasi item sebelum diproses produksi"
            ],
            authority: "Terbatas hanya untuk staf Kasir dan Owner",
            actionLabel: "Simulasikan: Simpan Hasil Timbang",
            simulatorState: {
                badgeText: "Proses Timbang",
                badgeType: "warning",
                cardTitle: "Penimbangan Berat #WW-9081",
                cardSubtitle: "Layanan: Laundry Kiloan + Satuan",
                items: [
                    { name: "Total Berat Laundry Kiloan", qty: "4.8 Kg", status: "weighing" }
                ]
            }
        },
        {
            id: "production",
            title: "Proses Produksi",
            icon: <Users className="h-5 w-5" />,
            description: "Tim produksi memproses cucian per item (cuci, kering, setrika). Setiap proses pengerjaan terekam beserta foto bukti pengerjaan agar cucian tidak tertukar.",
            role: "Staf Produksi",
            roleIcon: <Users className="h-4 w-4" />,
            features: [
                "Pelacakan pengerjaan per item pakaian",
                "Unggah foto bukti hasil setrika/lipat",
                "Penghitungan otomatis komisi kerja staf"
            ],
            authority: "Hanya untuk staf Produksi dan Supervisor",
            actionLabel: "Simulasikan: Selesaikan Pengerjaan",
            simulatorState: {
                badgeText: "Sedang Dicuci",
                badgeType: "primary",
                cardTitle: "Status Pengerjaan Item",
                cardSubtitle: "Petugas: Ahmad Salim | Bukti Foto Terunggah",
                items: [
                    { name: "Kemeja Lengan Panjang (Cuci)", qty: "3 pcs", status: "done" },
                    { name: "Celana Jeans (Setrika)", qty: "2 pcs", status: "processing" }
                ]
            }
        },
        {
            id: "courier",
            title: "Pengantaran Kurir",
            icon: <MapPin className="h-5 w-5" />,
            description: "Kurir laundry internal mengantar pakaian bersih ke rumah pelanggan. Tarif kurir dihitung otomatis berdasarkan zona jarak yang diatur owner.",
            role: "Kurir Outlet",
            roleIcon: <User className="h-4 w-4" />,
            features: [
                "Rute jemput & antar terjadwal di aplikasi kurir",
                "Hitung ongkir otomatis berdasarkan zona/jarak",
                "Konfirmasi pengambilan & pakaian sampai tujuan"
            ],
            authority: "Hanya untuk Kurir yang ditugaskan",
            actionLabel: "Simulasikan: Kirim Pakaian",
            simulatorState: {
                badgeText: "Sedang Diantar",
                badgeType: "accent",
                cardTitle: "Rute Pengantaran Kurir",
                cardSubtitle: "Jarak: 3.2 Km | Ongkir: Rp 10.000",
                items: [
                    { name: "Alamat Penerima", qty: "Tebet Barat VII No. 12", status: "delivering" }
                ]
            }
        },
        {
            id: "notifications",
            title: "WhatsApp & Cetak Struk",
            icon: <Receipt className="h-5 w-5" />,
            description: "Sistem mengirimkan notifikasi nota otomatis ke WhatsApp pelanggan, serta mencetak struk kasir dan label barcode pakaian secara instan.",
            role: "Sistem Otomatis",
            roleIcon: <Database className="h-4 w-4" />,
            features: [
                "Notifikasi WhatsApp otomatis saat cucian selesai",
                "Cetak struk kasir & struk rincian pakaian",
                "Cetak label barcode anti air untuk baju"
            ],
            authority: "Berjalan otomatis menggunakan saldo koin outlet",
            actionLabel: "Simulasikan: Kirim WhatsApp & Cetak",
            simulatorState: {
                badgeText: "Selesai",
                badgeType: "success",
                cardTitle: "Cetak Nota & Notifikasi WA",
                cardSubtitle: "Biaya: -2 Koin Saldo Outlet | Status: completed",
                items: [
                    { name: "Pemberitahuan WA Budi", qty: "Terkirim", status: "done" },
                    { name: "Cetak Tag Label Barcode", qty: "Tercetak", status: "done" }
                ]
            }
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
            {/* Consistent Grid and Glow Orbs */}
            <div className="absolute inset-0 membership-simulator-grid opacity-30 pointer-events-none" />
            <div className="glow-orb glow-orb-primary glow-top-left" />
            <div className="glow-orb glow-orb-secondary glow-bottom-right" />

            <div className="container mx-auto px-4 relative z-10 max-w-7xl">
                {/* Unified Section Header styled consistently via CSS Variables Override */}
                <div style={{ "--color-text-primary": "#ffffff", "--color-text-secondary": "var(--color-gray-400)" } as React.CSSProperties}>
                    <FeatureSectionHeader
                        badge="ALUR OPERASIONAL OUTLET"
                        headline="Simulasi Alur Kerja Laundry"
                        subheadline="Klik setiap tahapan di bawah untuk mensimulasikan bagaimana WashWallet mempermudah operasional outlet laundry Anda dari saat baju kotor masuk hingga diantar bersih ke pelanggan."
                        accentColor="var(--color-primary-500)"
                        accentBg="var(--color-primary-50)"
                        accentBorder="var(--color-primary-200)"
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
                                    ? "border-primary-500/30 text-primary-300 bg-primary-500/10 shadow-[0_0_15px_rgba(25,138,106,0.15)]"
                                    : "membership-simulator-button"
                            }`}
                        >
                            <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] ${
                                activeStepIndex === idx
                                    ? "bg-primary-500 text-white"
                                    : "membership-simulator-step-number"
                            }`}>
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
                                <div className="h-9 w-9 flex items-center justify-center rounded-xl border border-primary-500/20 text-primary-400 bg-primary-500/10">
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
                                        {currentStep.roleIcon}
                                        {currentStep.role}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Kelebihan Fitur</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {currentStep.features.map((feature, fIdx) => (
                                            <div key={fIdx} className="flex items-center gap-2 p-2 rounded border membership-simulator-row">
                                                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-primary-400" />
                                                <span className="text-xs font-medium text-slate-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Batasan & Keamanan Akses</span>
                                    <div className="flex items-center gap-2 text-xs font-sans bg-amber-500/5 border border-amber-500/10 p-2.5 rounded text-amber-400">
                                        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                        <span>Keamanan: {currentStep.authority}</span>
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
                                        : "bg-primary-600 hover:bg-primary-500 text-white border-primary-500/20 shadow-md shadow-primary-500/10"
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
                                washwallet-client://mobile-app
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
                                    {currentStep.simulatorState.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex justify-between items-center p-3 rounded-lg border membership-simulator-row">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-1.5 w-1.5 rounded-full ${
                                                    isExecuted ? "bg-emerald-500" :
                                                    item.status === "pending" ? "bg-slate-600" :
                                                    item.status === "processing" ? "bg-purple-500" :
                                                    item.status === "weighing" ? "bg-amber-500" :
                                                    item.status === "delivering" ? "bg-indigo-500" :
                                                    "bg-emerald-500"
                                                }`} />
                                                <span className="text-slate-300 text-xs font-semibold">{item.name}</span>
                                            </div>
                                            <span className="text-slate-500 text-xs">{item.qty}</span>
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
                                            {currentStep.id === "intake" && "Order #WW-9081 berhasil diterima dan terdaftar di dashboard Kasir."}
                                            {currentStep.id === "weighing" && "Hasil berat pakaian 4.8 Kg berhasil dimasukkan. Harga diperbarui otomatis."}
                                            {currentStep.id === "production" && "Pengerjaan setrika oleh staf Ahmad selesai. Notifikasi siap dikirim ke kasir."}
                                            {currentStep.id === "courier" && "Kurir mengonfirmasi pakaian sudah diserahkan kepada pelanggan Budi Santoso."}
                                            {currentStep.id === "notifications" && "Pesan WhatsApp rincian struk otomatis terkirim dan struk kasir tercetak."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Hint */}
                        <div className="flex items-center gap-2 mt-5 p-3 rounded-xl text-[11px] border membership-simulator-row">
                            <Info className="h-3.5 w-3.5 flex-shrink-0 text-primary-400" />
                            <span className="text-slate-400">Setiap alur berjalan real-time untuk menyinkronkan status di aplikasi kasir, kurir, dan pelanggan.</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InteractiveWorkflowSimulator;
