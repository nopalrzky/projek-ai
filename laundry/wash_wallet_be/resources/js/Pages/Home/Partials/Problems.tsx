import React from "react";
import { AlertTriangle, TrendingDown, Users, Zap } from "lucide-react";
import SectionBackground from "@/Components/SectionBackground";

interface ProblemCard {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    problem: string;
}

const Problems: React.FC = () => {
    const problems: ProblemCard[] = [
        {
            id: "inventory",
            icon: <AlertTriangle className="w-8 h-8" />,
            title: "Inventory Berantakan",
            description:
                "Stok sabun, plastik, hanger dihitung manual. Sering over-stock atau stockout tanpa warning.",
            problem: "2+ jam/hari terbuang untuk cek stok",
        },
        {
            id: "profit",
            icon: <TrendingDown className="w-8 h-8" />,
            title: "Profit Susah Diprediksi",
            description:
                "Tidak tahu layanan mana yang paling profitable. Margin per item tidak jelas. Laporan manual akhir bulan.",
            problem: "Margin bisnis tidak transparan",
        },
        {
            id: "coordination",
            icon: <Users className="w-8 h-8" />,
            title: "Koordinasi Tim Ribet",
            description:
                "Kasir, kurir, dan staf laundry bekerja dengan informasi yang berbeda-beda. Kesalahan order sering terjadi.",
            problem: "Informasi tersebar di berbagai tempat",
        },
        {
            id: "scaling",
            icon: <Zap className="w-8 h-8" />,
            title: "Sulit Ekspansi Outlet",
            description:
                "Setiap outlet baru = setup baru dari nol. Monitoring manual. Laporan terpisah. Skalabilitas terbatas.",
            problem: "Skalabilitas bisnis terhambat",
        },
    ];

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <SectionBackground />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: "var(--color-error-50)",
                            borderColor: "var(--color-error-200)",
                            color: "var(--color-error-700)",
                        }}
                    >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Masalah Yang Dihadapi
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Masih Kelola Laundry dengan{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, var(--color-error-600), var(--color-warning-500))`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Cara Lama?
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Operasional manual berarti waktu terbuang, profit tidak
                        jelas, dan pertumbuhan terhambat.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
                    {problems.map((problem) => (
                        <div
                            key={problem.id}
                            className="group p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                                style={{
                                    background: `linear-gradient(135deg, var(--color-error-100), var(--color-warning-100))`,
                                    color: "var(--color-error-600)",
                                }}
                            >
                                {problem.icon}
                            </div>

                            <h3
                                className="text-xl font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {problem.title}
                            </h3>

                            <p
                                className="text-sm mb-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                {problem.description}
                            </p>

                            <div
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                                style={{
                                    backgroundColor: "var(--color-error-50)",
                                    color: "var(--color-error-700)",
                                    borderColor: "var(--color-error-200)",
                                    border: "1px solid",
                                }}
                            >
                                ⚠️ {problem.problem}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center max-w-2xl mx-auto">
                    <p
                        className="text-lg font-semibold mb-6"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        WashWallet hadir untuk menyelesaikan semua ini,{" "}
                        <span
                            style={{
                                color: "var(--color-primary-600)",
                            }}
                        >
                            dalam satu platform.
                        </span>
                    </p>

                    <div
                        className="h-px w-16 mx-auto"
                        style={{
                            backgroundColor: "var(--color-primary-300)",
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default Problems;
