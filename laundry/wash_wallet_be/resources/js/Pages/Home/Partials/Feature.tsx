import React, { useState, useEffect } from "react";
import {
    CheckCircle,
    Cpu,
    DollarSign,
    ArrowLeftRight,
    CreditCard,
    UserCog,
    Target,
    ChevronRight,
} from "lucide-react";
import SectionBackground from "@/Components/SectionBackground";

interface FeatureItem {
    key: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
    lightImage: string;
    darkImage: string;
}

const Feature: React.FC = () => {
    const [selectedFeature, setSelectedFeature] = useState(0);
    const [isDark, setIsDark] = useState(false);
    const [imageKey, setImageKey] = useState(0);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mediaQuery.matches);

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    const features: FeatureItem[] = [
        {
            key: "operasional",
            title: "Manajemen Operasional",
            description:
                "Satukan order, status cucian, dan stok dalam satu alur real-time agar operasional tidak lagi tercecer.",
            icon: <Cpu className="w-6 h-6" />,
            color: "var(--color-primary-500)",
            bgColor: "var(--color-primary-50)",
            borderColor: "var(--color-primary-200)",
            lightImage: "/assets/images/operasional_light.webp",
            darkImage: "/assets/images/operasional_dark.webp",
        },
        {
            key: "akuntansi",
            title: "Keuangan & Akuntansi",
            description:
                "Lihat margin dan arus kas harian secara otomatis tanpa rekap manual di akhir bulan.",
            icon: <DollarSign className="w-6 h-6" />,
            color: "var(--color-success-500)",
            bgColor: "var(--color-success-50)",
            borderColor: "var(--color-success-200)",
            lightImage: "/assets/images/akuntansi_light.webp",
            darkImage: "/assets/images/akuntansi_dark.webp",
        },
        {
            key: "afiliasi",
            title: "Program Afiliasi",
            description:
                "Dorong pertumbuhan outlet lewat referral terukur dengan komisi otomatis dan laporan transparan.",
            icon: <ArrowLeftRight className="w-6 h-6" />,
            color: "var(--color-secondary-500)",
            bgColor: "var(--color-secondary-50)",
            borderColor: "var(--color-secondary-200)",
            lightImage: "/assets/images/afiliasi_light.webp",
            darkImage: "/assets/images/afiliasi_dark.webp",
        },
        {
            key: "membership",
            title: "Membership & Loyalty",
            description:
                "Ubah pelanggan sekali datang jadi pelanggan rutin dengan poin dan reward yang berjalan otomatis.",
            icon: <CreditCard className="w-6 h-6" />,
            color: "var(--color-info-500)",
            bgColor: "var(--color-info-50)",
            borderColor: "var(--color-info-200)",
            lightImage: "/assets/images/membership_light.webp",
            darkImage: "/assets/images/membership_dark.webp",
        },
        {
            key: "payroll",
            title: "HR & Payroll",
            description:
                "Sinkronkan jadwal, absensi, dan payroll agar koordinasi tim lebih rapi dan minim salah hitung.",
            icon: <UserCog className="w-6 h-6" />,
            color: "var(--color-warning-500)",
            bgColor: "var(--color-warning-50)",
            borderColor: "var(--color-warning-200)",
            lightImage: "/assets/images/payroll_light.webp",
            darkImage: "/assets/images/payroll_dark.webp",
        },
    ];

    const handleFeatureSelect = (index: number) => {
        setSelectedFeature(index);
        setImageKey((prev) => prev + 1);
    };

    const currentFeature = features[selectedFeature];
    const currentImage = isDark
        ? currentFeature.darkImage
        : currentFeature.lightImage;

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <SectionBackground variant="alternate" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: "var(--color-primary-50)",
                            borderColor: "var(--color-primary-200)",
                            color: "var(--color-primary-700)",
                        }}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Fitur Utama
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Solusi Fitur untuk{" "}
                        <span className="relative inline-block">
                            <span
                                className="relative z-10"
                                style={{
                                    background: `linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-500))`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                Masalah Laundry Harian
                            </span>
                            <svg
                                className="absolute -bottom-2 left-0 w-full h-3"
                                viewBox="0 0 200 12"
                                fill="none"
                                preserveAspectRatio="none"
                            >
                                <path
                                    d="M2 8C50 3 100 1 150 6C175 8.5 190 7 198 8"
                                    stroke="var(--color-accent-500)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    className="animate-pulse-slow"
                                />
                            </svg>
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Pilih area yang paling sering bikin bottleneck, lalu
                        lihat bagaimana WashWallet menyelesaikannya dalam satu
                        platform terintegrasi.
                    </p>
                </div>

                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-7xl mx-auto">
                    <div className="lg:col-span-2 space-y-4">
                        {features.map((feature, index) => (
                            <button
                                key={feature.key}
                                onClick={() => handleFeatureSelect(index)}
                                onMouseEnter={() => handleFeatureSelect(index)}
                                className={`
                                    group w-full text-left p-6 rounded-xl border transition-all duration-300
                                    ${
                                        selectedFeature === index
                                            ? "shadow-xl scale-[1.02]"
                                            : "hover:scale-[1.01] hover:shadow-lg"
                                    }
                                `}
                                style={{
                                    backgroundColor:
                                        selectedFeature === index
                                            ? feature.bgColor
                                            : "var(--color-surface)",
                                    borderColor:
                                        selectedFeature === index
                                            ? feature.borderColor
                                            : "var(--color-border)",
                                    borderLeftWidth:
                                        selectedFeature === index
                                            ? "4px"
                                            : "1px",
                                    borderLeftColor:
                                        selectedFeature === index
                                            ? feature.color
                                            : "var(--color-border)",
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`
                                            flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300
                                            ${
                                                selectedFeature === index
                                                    ? "scale-110"
                                                    : "group-hover:scale-105"
                                            }
                                        `}
                                        style={{
                                            backgroundColor:
                                                selectedFeature === index
                                                    ? feature.color
                                                    : feature.bgColor,
                                            color:
                                                selectedFeature === index
                                                    ? "#ffffff"
                                                    : feature.color,
                                        }}
                                    >
                                        {feature.icon}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3
                                                className={`
                                                    text-lg leading-tight transition-all duration-300
                                                    ${
                                                        selectedFeature ===
                                                        index
                                                            ? "font-bold"
                                                            : "font-semibold"
                                                    }
                                                `}
                                                style={{
                                                    color:
                                                        selectedFeature ===
                                                        index
                                                            ? feature.color
                                                            : "var(--color-text-primary)",
                                                }}
                                            >
                                                {feature.title}
                                            </h3>

                                            <ChevronRight
                                                className={`
                                                    w-5 h-5 flex-shrink-0 transition-all duration-300
                                                    ${
                                                        selectedFeature ===
                                                        index
                                                            ? "translate-x-1 opacity-100"
                                                            : "translate-x-0 opacity-0 group-hover:opacity-50"
                                                    }
                                                `}
                                                style={{
                                                    color: feature.color,
                                                }}
                                            />
                                        </div>

                                        <p
                                            className="text-sm leading-relaxed"
                                            style={{
                                                color:
                                                    selectedFeature === index
                                                        ? "var(--color-text-primary)"
                                                        : "var(--color-text-secondary)",
                                            }}
                                        >
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="lg:col-span-3">
                        <div className="sticky top-8">
                            <div
                                className="relative rounded-2xl overflow-hidden shadow-2xl border backdrop-blur-sm"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <img
                                        key={imageKey}
                                        src={currentImage}
                                        alt={currentFeature.title}
                                        className="w-full h-full object-contain p-8 animate-fadeIn"
                                        style={{
                                            backgroundColor: isDark
                                                ? "var(--color-gray-900)"
                                                : "var(--color-gray-50)",
                                        }}
                                        onError={(e) => {
                                            const target =
                                                e.target as HTMLImageElement;
                                            target.style.display = "none";
                                            target.parentElement!.innerHTML += `
                                                <div class="absolute inset-0 flex items-center justify-center" style="background: linear-gradient(135deg, ${
                                                    currentFeature.bgColor
                                                } 0%, var(--color-background) 100%)">
                                                    <div class="text-center space-y-4">
                                                        <div class="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center" style="background-color: ${
                                                            currentFeature.bgColor
                                                        }; color: ${
                                                            currentFeature.color
                                                        }">
                                                            ${
                                                                target.alt.includes(
                                                                    "Operasional",
                                                                )
                                                                    ? '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>'
                                                                    : ""
                                                            }
                                                        </div>
                                                        <p style="color: var(--color-text-secondary); font-size: 14px">${
                                                            currentFeature.title
                                                        }</p>
                                                    </div>
                                                </div>
                                            `;
                                        }}
                                    />

                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: `linear-gradient(to top, ${currentFeature.color}08 0%, transparent 30%)`,
                                        }}
                                    />
                                </div>

                                <div className="absolute top-6 left-6 z-10">
                                    <div
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl border shadow-xl"
                                        style={{
                                            backgroundColor: isDark
                                                ? `${currentFeature.color}30`
                                                : `${currentFeature.color}20`,
                                            borderColor: isDark
                                                ? `${currentFeature.color}60`
                                                : `${currentFeature.color}40`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                color: isDark
                                                    ? "#ffffff"
                                                    : currentFeature.color,
                                            }}
                                        >
                                            {currentFeature.icon}
                                        </div>
                                        <span
                                            className="font-bold text-sm"
                                            style={{
                                                color: isDark
                                                    ? "#ffffff"
                                                    : currentFeature.color,
                                                textShadow: isDark
                                                    ? "0 1px 2px rgba(0,0,0,0.3)"
                                                    : "none",
                                            }}
                                        >
                                            {currentFeature.title}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    className="absolute bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t"
                                    style={{
                                        backgroundColor: isDark
                                            ? "rgba(15, 23, 42, 0.95)"
                                            : "rgba(255, 255, 255, 0.95)",
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <p
                                        className="text-sm leading-relaxed font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {currentFeature.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-center gap-2 mt-6">
                                {features.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() =>
                                            handleFeatureSelect(index)
                                        }
                                        className={`
                                            h-2 rounded-full transition-all duration-300
                                            ${
                                                selectedFeature === index
                                                    ? "w-12"
                                                    : "w-2 hover:w-6"
                                            }
                                        `}
                                        style={{
                                            backgroundColor:
                                                selectedFeature === index
                                                    ? features[selectedFeature]
                                                          .color
                                                    : "var(--color-border)",
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-20">
                    <p
                        className="text-lg mb-6"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Masih ada lebih banyak fitur yang siap membantu bisnis
                        Anda
                    </p>
                    <a
                        href="/fitur"
                        className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl border-2"
                        style={{
                            borderColor: "var(--color-primary-500)",
                            color: "var(--color-primary-600)",
                            backgroundColor: "var(--color-surface)",
                        }}
                    >
                        Jelajahi Semua Fitur
                        <Target className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Feature;
