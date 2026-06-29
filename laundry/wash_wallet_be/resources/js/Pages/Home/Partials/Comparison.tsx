import React, { useState } from "react";
import { CheckCircle2, XCircle, ChevronDown, BarChart3 } from "lucide-react";
import { rows } from "../data";
import SectionBackground from "@/Components/SectionBackground";

const Comparison: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <SectionBackground variant="alternate" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-14 space-y-6">
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: "var(--color-primary-50)",
                            borderColor: "var(--color-primary-200)",
                            color: "var(--color-primary-700)",
                        }}
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Perbandingan Praktis
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Perbandingan:{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, var(--color-error-600), var(--color-success-500))`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Manual vs WashWallet
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Lihat perbedaan nyata dari cara kerja harian sampai
                        biaya operasional bisnis laundry Anda.
                    </p>
                </div>

                <div className="hidden md:block max-w-6xl mx-auto overflow-hidden rounded-2xl border backdrop-blur-sm">
                    <table
                        className="w-full border-collapse"
                        style={{ backgroundColor: "var(--color-surface)" }}
                    >
                        <thead>
                            <tr>
                                <th
                                    className="text-left px-6 py-4 text-sm font-semibold border-b"
                                    style={{
                                        color: "var(--color-text-primary)",
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-background)",
                                    }}
                                >
                                    Aspek
                                </th>
                                <th
                                    className="text-left px-6 py-4 text-sm font-semibold border-b"
                                    style={{
                                        color: "var(--color-error-700)",
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-error-50)",
                                    }}
                                >
                                    Cara Manual
                                </th>
                                <th
                                    className="text-left px-6 py-4 text-sm font-semibold border-b"
                                    style={{
                                        color: "var(--color-success-700)",
                                        borderColor: "var(--color-border)",
                                        backgroundColor:
                                            "var(--color-success-50)",
                                    }}
                                >
                                    WashWallet
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.aspect}>
                                    <td
                                        className="px-6 py-4 border-b text-sm font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        {row.aspect}
                                    </td>
                                    <td
                                        className="px-6 py-4 border-b text-sm"
                                        style={{
                                            color: "var(--color-error-700)",
                                            borderColor: "var(--color-border)",
                                            backgroundColor:
                                                "var(--color-error-50)",
                                        }}
                                    >
                                        <span className="inline-flex items-start gap-2">
                                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {row.manual}
                                        </span>
                                    </td>
                                    <td
                                        className="px-6 py-4 border-b text-sm"
                                        style={{
                                            color: "var(--color-success-700)",
                                            borderColor: "var(--color-border)",
                                            backgroundColor:
                                                "var(--color-success-50)",
                                        }}
                                    >
                                        <span className="inline-flex items-start gap-2 font-semibold">
                                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            {row.washWallet}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden max-w-2xl mx-auto space-y-3">
                    {rows.map((row, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <div
                                key={row.aspect}
                                className="rounded-xl border overflow-hidden"
                                style={{
                                    borderColor: "var(--color-border)",
                                    backgroundColor: "var(--color-surface)",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOpenIndex(isOpen ? null : index)
                                    }
                                    className="w-full px-4 py-4 flex items-center justify-between text-left"
                                >
                                    <span
                                        className="text-sm font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {row.aspect}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="px-4 pb-4 space-y-3">
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-error-50)",
                                            }}
                                        >
                                            <p
                                                className="text-xs font-semibold mb-1"
                                                style={{
                                                    color: "var(--color-error-700)",
                                                }}
                                            >
                                                Cara Manual
                                            </p>
                                            <p
                                                className="text-sm inline-flex items-start gap-2"
                                                style={{
                                                    color: "var(--color-error-700)",
                                                }}
                                            >
                                                <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                {row.manual}
                                            </p>
                                        </div>

                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-success-50)",
                                            }}
                                        >
                                            <p
                                                className="text-xs font-semibold mb-1"
                                                style={{
                                                    color: "var(--color-success-700)",
                                                }}
                                            >
                                                WashWallet
                                            </p>
                                            <p
                                                className="text-sm inline-flex items-start gap-2 font-semibold"
                                                style={{
                                                    color: "var(--color-success-700)",
                                                }}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                {row.washWallet}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Comparison;
