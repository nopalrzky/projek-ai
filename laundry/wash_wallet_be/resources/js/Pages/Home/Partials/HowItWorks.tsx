import React from "react";
import {
    Rocket,
    CheckCircle,
    ArrowRight,
    Store,
    Users,
    ShoppingBag,
    LineChart,
} from "lucide-react";
import SectionBackground from "@/Components/SectionBackground";

const HowItWorks: React.FC = () => {
    const steps = [
        {
            number: 1,
            icon: <Rocket className="w-7 h-7" />,
            title: "Daftar Gratis",
            description:
                "Buat akun dalam 5 menit, verifikasi nomor HP, lalu langsung akses dashboard WashWallet.",
            color: "var(--color-primary-500)",
            bgColor: "var(--color-primary-50)",
            gradientFrom: "var(--color-primary-500)",
            gradientTo: "var(--color-primary-600)",
        },
        {
            number: 2,
            icon: <Store className="w-7 h-7" />,
            title: "Aktifkan Outlet (One-time)",
            description:
                "Bayar aktivasi outlet sekali untuk unlock fitur. Layanan seperti cetak struk memakai koin yang bisa top up kapan saja.",
            color: "var(--color-secondary-500)",
            bgColor: "var(--color-secondary-50)",
            gradientFrom: "var(--color-secondary-500)",
            gradientTo: "var(--color-secondary-600)",
        },
        {
            number: 3,
            icon: <Users className="w-7 h-7" />,
            title: "Setup Tim & Layanan",
            description:
                "Invite kasir atau manager, atur peran, lalu input layanan dan harga dalam waktu sekitar 10 menit.",
            color: "var(--color-accent-500)",
            bgColor: "var(--color-accent-50)",
            gradientFrom: "var(--color-accent-500)",
            gradientTo: "var(--color-accent-600)",
        },
        {
            number: 4,
            icon: <ShoppingBag className="w-7 h-7" />,
            title: "Mulai Operasional",
            description:
                "Input pesanan, pantau status laundry secara real-time, dan layani pelanggan lebih cepat tanpa alur manual.",
            color: "var(--color-info-500)",
            bgColor: "var(--color-info-50)",
            gradientFrom: "var(--color-info-500)",
            gradientTo: "var(--color-info-600)",
        },
        {
            number: 5,
            icon: <LineChart className="w-7 h-7" />,
            title: "Analisa & Kembangkan",
            description:
                "Pantau laporan otomatis, optimalkan payroll, jalankan afiliasi, dan tingkatkan loyalty pelanggan dari satu dashboard.",
            color: "var(--color-success-500)",
            bgColor: "var(--color-success-50)",
            gradientFrom: "var(--color-success-500)",
            gradientTo: "var(--color-success-600)",
        },
    ];

    return (
        <section
            id="how-it-works"
            className="py-20 px-4 relative overflow-hidden"
        >
            <SectionBackground variant="alternate" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: "var(--color-secondary-50)",
                            borderColor: "var(--color-secondary-200)",
                            color: "var(--color-secondary-700)",
                        }}
                    >
                        <Rocket className="w-4 h-4 mr-2" />
                        Cara Kerja
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Mulai Hanya dalam{" "}
                        <span className="relative inline-block">
                            <span
                                style={{
                                    background: `linear-gradient(135deg, var(--color-secondary-600), var(--color-primary-600))`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                5 Langkah Mudah
                            </span>
                            <div
                                className="absolute -bottom-2 left-0 right-0 h-1 rounded-full opacity-50"
                                style={{
                                    backgroundColor:
                                        "var(--color-secondary-400)",
                                }}
                            />
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Alur implementasi sederhana untuk owner laundry, dari
                        daftar akun sampai bisnis berjalan dan terukur.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto">
                    <div className="hidden lg:block relative">
                        <div
                            className="absolute top-10 left-[10%] right-[10%] h-1 rounded-full opacity-20"
                            style={{
                                background: `linear-gradient(90deg,
                                    var(--color-primary-400) 0%,
                                    var(--color-secondary-400) 25%,
                                    var(--color-accent-400) 50%,
                                    var(--color-info-400) 75%,
                                    var(--color-success-400) 100%)`,
                            }}
                        />

                        <div className="grid lg:grid-cols-5 gap-6">
                            {steps.map((step) => (
                                <div
                                    key={step.number}
                                    className="relative group"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div
                                            className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                background: `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`,
                                            }}
                                        >
                                            {step.number}
                                        </div>

                                        <div
                                            className="w-16 h-16 rounded-xl flex items-center justify-center mt-6 mb-4 transition-transform duration-300 group-hover:scale-110"
                                            style={{
                                                backgroundColor: step.bgColor,
                                                border: `2px solid ${step.color}20`,
                                            }}
                                        >
                                            <div style={{ color: step.color }}>
                                                {step.icon}
                                            </div>
                                        </div>

                                        <h3
                                            className="text-lg font-bold leading-tight min-h-[3.5rem]"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {step.title}
                                        </h3>

                                        <p
                                            className="text-sm leading-relaxed mt-3"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:hidden space-y-6">
                        {steps.map((step, index) => (
                            <div
                                key={step.number}
                                className="relative rounded-2xl p-6 border backdrop-blur-sm"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-12 h-12 rounded-full text-white font-bold text-lg flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${step.gradientFrom}, ${step.gradientTo})`,
                                        }}
                                    >
                                        {step.number}
                                    </div>

                                    <div className="flex-1">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                                            style={{
                                                backgroundColor: step.bgColor,
                                                border: `2px solid ${step.color}20`,
                                            }}
                                        >
                                            <div style={{ color: step.color }}>
                                                {step.icon}
                                            </div>
                                        </div>
                                        <h3
                                            className="text-lg font-bold leading-tight"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {step.title}
                                        </h3>
                                        <p
                                            className="text-sm leading-relaxed mt-2"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className="flex justify-center mt-5">
                                        <div
                                            className="w-1 h-8 rounded-full"
                                            style={{
                                                backgroundColor: step.color,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-20 space-y-6">
                    <div
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border backdrop-blur-sm"
                        style={{
                            backgroundColor: "var(--color-success-50)",
                            borderColor: "var(--color-success-200)",
                        }}
                    >
                        <CheckCircle
                            className="w-5 h-5"
                            style={{ color: "var(--color-success-600)" }}
                        />
                        <span
                            className="font-semibold"
                            style={{ color: "var(--color-success-700)" }}
                        >
                            Setup awal bisa selesai dalam 5 menit
                        </span>
                    </div>

                    <p
                        className="text-lg"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Siap untuk mengubah cara Anda mengelola laundry?
                    </p>

                    <a
                        href="/register"
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl text-white overflow-hidden relative"
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))`,
                        }}
                    >
                        <div
                            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                            style={{
                                background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                            }}
                        />
                        <span className="relative flex items-center gap-2">
                            Mulai Gratis Sekarang
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
