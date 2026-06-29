import React from "react";
import { ArrowRight, Play, CheckCircle, Sparkles } from "lucide-react";
import SectionBackground from "@/Components/SectionBackground";

const Hero: React.FC = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-8">
            <SectionBackground variant="dark" />

            <div className="relative z-10 container mx-auto px-4 py-16">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="text-center lg:text-left space-y-8 animate-fadeInUp">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                borderColor: "var(--color-primary-200)",
                            }}
                        >
                            <CheckCircle
                                className="w-4 h-4"
                                style={{
                                    color: "var(--color-success-500)",
                                }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-primary-700)" }}
                            >
                                All-in-One Platform untuk Laundry Indonesia
                            </span>
                        </div>

                        <div className="space-y-6">
                            <h1
                                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Kelola Semua Outlet Laundry{" "}
                                <span className="relative inline-block">
                                    <span
                                        className="relative z-10 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent"
                                        style={{
                                            backgroundImage: `linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-500))`,
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        dari 1 Dashboard
                                    </span>
                                    <svg
                                        className="absolute -bottom-2 left-0 w-full h-3 lg:h-4"
                                        viewBox="0 0 300 12"
                                        fill="none"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M2 8C50 3 100 1 150 6C200 11 250 5 298 8"
                                            stroke="var(--color-accent-500)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            className="animate-pulse-slow"
                                        />
                                    </svg>
                                </span>{" "}
                                Tanpa Ribet & Tanpa Biaya Bulanan
                            </h1>

                            <p
                                className="text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-2xl mx-auto lg:mx-0"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Platform all-in-one untuk{" "}
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    POS, Operasional, Keuangan, HR, Membership
                                </span>
                                {". "}
                                Bayar sesuai pakai dengan sistem koin yang
                                fleksibel. Gratis 14 hari untuk dicoba.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            {[
                                "Setup 5 Menit",
                                "Gratis Trial 14 Hari",
                                "Support 24/7",
                            ].map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border"
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <CheckCircle
                                        className="w-4 h-4 flex-shrink-0"
                                        style={{
                                            color: "var(--color-success-500)",
                                        }}
                                    />
                                    <span
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <a
                                href="/register"
                                className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
                                style={{
                                    backgroundColor: "var(--color-primary-500)",
                                    color: "#ffffff",
                                }}
                            >
                                <div
                                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                                    style={{
                                        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                                    }}
                                />
                                <span className="relative flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Daftar Gratis Sekarang
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </a>

                            <a
                                href="#how-it-works"
                                className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                style={{
                                    borderColor: "var(--color-primary-500)",
                                    color: "var(--color-primary-600)",
                                    backgroundColor: "var(--color-surface)",
                                }}
                            >
                                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Lihat Cara Kerjanya
                            </a>
                        </div>

                        <div className="pt-8 space-y-4">
                            <p
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                ✓ Tidak perlu kartu kredit • Tidak ada komitmen
                                • Data aman 100%
                            </p>
                        </div>
                    </div>

                    <div
                        className="relative lg:scale-110 animate-fadeInUp"
                        style={{ animationDelay: "200ms" }}
                    >
                        <div className="relative z-10">
                            <div
                                className="relative rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md border transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <div
                                    className="px-6 py-4 border-b flex items-center justify-between"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{
                                                background: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))`,
                                            }}
                                        >
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3
                                                className="text-sm font-bold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                WashWallet Dashboard
                                            </h3>
                                            <p
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Real-time Analytics
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        i === 1
                                                            ? "var(--color-error-500)"
                                                            : i === 2
                                                              ? "var(--color-warning-500)"
                                                              : "var(--color-success-500)",
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            {
                                                label: "Pendapatan Hari Ini",
                                                value: "Rp 12,5jt",
                                                change: "+23%",
                                                color: "var(--color-success-500)",
                                            },
                                            {
                                                label: "Total Pesanan",
                                                value: "156",
                                                change: "+12%",
                                                color: "var(--color-primary-500)",
                                            },
                                            {
                                                label: "Pelanggan Aktif",
                                                value: "892",
                                                change: "+8%",
                                                color: "var(--color-secondary-500)",
                                            },
                                            {
                                                label: "Rata-rata Rating",
                                                value: "4.8",
                                                change: "+5%",
                                                color: "var(--color-accent-500)",
                                            },
                                        ].map((stat, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                                                style={{
                                                    backgroundColor:
                                                        "var(--color-background)",
                                                    borderColor:
                                                        "var(--color-border)",
                                                }}
                                            >
                                                <p
                                                    className="text-xs mb-2"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {stat.label}
                                                </p>
                                                <div className="flex items-end justify-between">
                                                    <p
                                                        className="text-2xl font-bold"
                                                        style={{
                                                            color: stat.color,
                                                        }}
                                                    >
                                                        {stat.value}
                                                    </p>
                                                    <span
                                                        className="text-xs font-semibold px-2 py-1 rounded-full"
                                                        style={{
                                                            backgroundColor: `${stat.color}20`,
                                                            color: stat.color,
                                                        }}
                                                    >
                                                        {stat.change}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div
                                        className="h-32 rounded-xl border flex items-end justify-around p-4 gap-2"
                                        style={{
                                            backgroundColor:
                                                "var(--color-background)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        {[40, 60, 45, 75, 55, 85, 70].map(
                                            (height, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex-1 rounded-t-lg transition-all duration-500 hover:opacity-80"
                                                    style={{
                                                        height: `${height}%`,
                                                        backgroundColor: `var(--color-primary-${
                                                            idx === 6
                                                                ? "500"
                                                                : "300"
                                                        })`,
                                                        animationDelay: `${
                                                            idx * 100
                                                        }ms`,
                                                    }}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md border animate-pulse-slow"
                            style={{
                                backgroundColor: "var(--color-primary-500)",
                                borderColor: "rgba(255,255,255,0.2)",
                                animationDelay: "1s",
                            }}
                        >
                            <p className="text-white font-bold text-lg">
                                🚀 +50%
                            </p>
                            <p className="text-xs text-white/90">
                                Efisiensi Meningkat
                            </p>
                        </div>

                        <div
                            className="absolute inset-0 -z-10 blur-3xl opacity-30"
                            style={{
                                background: `radial-gradient(circle at center, var(--color-primary-300), transparent 70%)`,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div
                className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                style={{
                    background: `linear-gradient(to bottom, transparent, var(--color-background))`,
                }}
            />
        </section>
    );
};

export default Hero;
