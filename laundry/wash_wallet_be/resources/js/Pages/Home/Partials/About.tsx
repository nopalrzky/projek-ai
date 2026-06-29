import React from "react";
import { Heart } from "lucide-react";
import { benefits } from "../data";
import SectionBackground from "@/Components/SectionBackground";

const About: React.FC = () => {
    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <SectionBackground />

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
                        <Heart className="w-4 h-4 mr-2" />
                        Mengapa WashWallet?
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Dirancang Khusus untuk{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-500))`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Tantangan Laundry Indonesia
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Bukan sekadar aplikasi, tapi solusi lengkap yang
                        memahami operasional bisnis laundry Anda.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                                    style={{
                                        backgroundColor: benefit.bgColor,
                                        color: benefit.color,
                                    }}
                                >
                                    {benefit.icon}
                                </div>
                                <div className="flex-1">
                                    <h3
                                        className="text-lg font-bold mb-2"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {benefit.title}
                                    </h3>
                                    <p
                                        className="text-sm leading-relaxed mb-3"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {benefit.description}
                                    </p>
                                    <div
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                                        style={{
                                            backgroundColor: benefit.bgColor,
                                            color: benefit.color,
                                        }}
                                    >
                                        ✓ {benefit.benefit}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default About;
