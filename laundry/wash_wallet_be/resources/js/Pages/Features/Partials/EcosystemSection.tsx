import React from "react";
import { Zap, CheckCircle2, Globe, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/Components/Card/Card";
import Badge from "@/Components/Badge/Badge";
import type { EcosystemSectionProps } from "./types";

const EcosystemSection: React.FC<EcosystemSectionProps> = ({ data }) => {
    const accentColor = data.accentColor ?? "var(--color-primary-600)";
    const accentBg = data.accentBg ?? "var(--color-primary-50)";
    const accentBorder = data.accentBorder ?? "var(--color-primary-200)";

    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            <div
                className="absolute top-0 inset-x-0 h-px"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, var(--color-border), transparent)",
                }}
            />

            <div
                className="pointer-events-none absolute left-0 top-1/3 h-[600px] w-[600px] rounded-full blur-[150px] opacity-12 -translate-x-1/3"
                style={{ backgroundColor: accentColor }}
            />
            <div
                className="pointer-events-none absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full blur-[130px] opacity-10 translate-x-1/4"
                style={{ backgroundColor: "var(--color-secondary-400)" }}
            />

            <div className="container-fluid relative z-10">
                <div className="mx-auto mb-20 max-w-3xl text-center animate-fadeInUp lg:mb-24">
                    <div
                        className="mb-5 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 backdrop-blur-sm"
                        style={{
                            backgroundColor: accentBg,
                            borderColor: accentBorder,
                            color: accentColor,
                        }}
                    >
                        <Zap className="h-3.5 w-3.5" />
                        <span className="text-xs font-bold uppercase tracking-widest">
                            {data.badge}
                        </span>
                    </div>

                    <h2
                        className="mb-4 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {data.headline}
                    </h2>

                    <p
                        className="text-base leading-relaxed opacity-80 sm:text-lg"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        {data.subheadline}
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
                    {data.platforms.map((platform, index) => (
                        <Card
                            key={index}
                            hoverable
                            className="group relative overflow-hidden border animate-fadeInUp"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background: `linear-gradient(135deg, ${accentBg} 0%, transparent 60%)`,
                                }}
                            />

                            <div
                                className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-25"
                                style={{ backgroundColor: accentColor }}
                            />

                            <CardContent className="relative z-10 space-y-6 p-8 lg:p-10">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3"
                                                style={{
                                                    backgroundColor: accentBg,
                                                    color: accentColor,
                                                    border: `1.5px solid ${accentBorder}`,
                                                }}
                                            >
                                                {platform.device ===
                                                "desktop" ? (
                                                    <Globe className="h-5 w-5" />
                                                ) : (
                                                    <Smartphone className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div>
                                                <h3
                                                    className="text-lg font-bold tracking-tight"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {platform.platform}
                                                </h3>
                                                <p
                                                    className="text-xs font-medium"
                                                    style={{
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {platform.target}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Badge
                                        variant={
                                            platform.status === "Tersedia"
                                                ? "success"
                                                : "info"
                                        }
                                        size="sm"
                                    >
                                        {platform.status}
                                    </Badge>
                                </div>

                                <div className="space-y-3 border-t border-[var(--color-border)] pt-6">
                                    {platform.features.map((feature, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-start gap-2.5 animate-fadeInUp"
                                            style={{
                                                animationDelay: `${index * 100 + idx * 50}ms`,
                                            }}
                                        >
                                            <CheckCircle2
                                                className="h-4 w-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110 mt-0.5"
                                                style={{ color: accentColor }}
                                            />
                                            <span
                                                className="text-sm leading-relaxed"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EcosystemSection;
