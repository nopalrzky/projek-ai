import React from "react";
import { ShieldCheck, BadgeCheck, Headset, ArrowRight } from "lucide-react";
import SectionBackground from "@/Components/SectionBackground";

interface GuaranteeItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    borderColor: string;
}

const RiskReversal: React.FC = () => {
    const guarantees: GuaranteeItem[] = [
        {
            title: "Gratis 14 Hari",
            description:
                "Coba semua fitur tanpa kartu kredit dan tanpa auto-charge di akhir periode trial.",
            icon: <BadgeCheck className="w-7 h-7" />,
            color: "var(--color-primary-600)",
            bgColor: "var(--color-primary-50)",
            borderColor: "var(--color-primary-200)",
        },
        {
            title: "Data Aman",
            description:
                "Data bisnis Anda diproses aman dengan enkripsi dan kontrol akses yang ketat.",
            icon: <ShieldCheck className="w-7 h-7" />,
            color: "var(--color-success-600)",
            bgColor: "var(--color-success-50)",
            borderColor: "var(--color-success-200)",
        },
        {
            title: "Support Nyata",
            description:
                "Tim support berbahasa Indonesia siap bantu onboarding dan kendala operasional via WhatsApp.",
            icon: <Headset className="w-7 h-7" />,
            color: "var(--color-secondary-600)",
            bgColor: "var(--color-secondary-50)",
            borderColor: "var(--color-secondary-200)",
        },
    ];

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <SectionBackground />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-6">
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: "var(--color-success-50)",
                            borderColor: "var(--color-success-200)",
                            color: "var(--color-success-700)",
                        }}
                    >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Tanpa Risiko
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Coba 14 Hari Gratis.{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, var(--color-success-600), var(--color-primary-600))`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Tidak Ada Risiko.
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Kami turunkan hambatan di awal agar Anda bisa evaluasi
                        WashWallet dengan tenang sebelum memutuskan lanjut.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12">
                    {guarantees.map((item) => (
                        <div
                            key={item.title}
                            className="group p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                                style={{
                                    backgroundColor: item.bgColor,
                                    color: item.color,
                                    border: `1px solid ${item.borderColor}`,
                                }}
                            >
                                {item.icon}
                            </div>

                            <h3
                                className="text-xl font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {item.title}
                            </h3>

                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="text-center space-y-4">
                    <a
                        href="/register"
                        className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        style={{
                            backgroundColor: "var(--color-primary-500)",
                            color: "#ffffff",
                        }}
                    >
                        Mulai Trial Gratis Sekarang
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <p
                        className="text-sm"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        Sudah siap tapi masih ada pertanyaan? Chat kami di
                        WhatsApp: +62 812-3456-7890
                    </p>
                </div>
            </div>
        </section>
    );
};

export default RiskReversal;
