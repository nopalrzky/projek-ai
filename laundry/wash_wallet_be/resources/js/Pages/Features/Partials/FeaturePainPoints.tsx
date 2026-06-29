import React from "react";
import { Card, CardContent } from "@/Components/Card/Card";
import { ArrowUpRight } from "lucide-react";
import type { FeaturePainPointsProps } from "./types";
import FeatureSectionHeader from "./FeatureSectionHeader";

const FeaturePainPoints: React.FC<FeaturePainPointsProps> = ({ data, hideGlow = false }) => {
    const safeItems = data.items.slice(0, 4);

    return (
        <section
            className="relative overflow-hidden py-24 lg:py-32"
            style={{ backgroundColor: "transparent" }}
        >
            <div
                className="absolute left-0 top-0 h-px w-full opacity-40"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-border) 60%, transparent), transparent)",
                }}
            />
            <div
                className="absolute bottom-0 left-0 h-px w-full"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, var(--color-border), transparent)",
                }}
            />

            {!hideGlow && (
                <>
                    <div
                        className="pointer-events-none absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full blur-[140px] opacity-20"
                        style={{ backgroundColor: data.accentColor }}
                    />
                    <div
                        className="pointer-events-none absolute -right-28 -top-32 h-[560px] w-[560px] rounded-full blur-[140px]"
                        style={{
                            backgroundColor: "var(--color-secondary-500)",
                            opacity: 0.16,
                        }}
                    />
                    <div
                        className="pointer-events-none absolute right-[8%] top-8 h-[360px] w-[520px] rounded-full blur-[120px] opacity-10"
                        style={{ backgroundColor: data.accentColor }}
                    />
                </>
            )}

            <div className="container-fluid relative z-10">
                <FeatureSectionHeader
                    badge={data.badge}
                    headline={data.headline}
                    subheadline={data.subheadline}
                    accentColor={data.accentColor}
                    accentBg={data.accentBg}
                    accentBorder={data.accentBorder}
                    layout="split"
                />

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {safeItems.map((item, index) => (
                        <Card
                            key={index}
                            hoverable
                            className="group relative overflow-hidden animate-fadeInUp"
                            style={{
                                animationDelay: `${(index + 2) * 100}ms`,
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <div
                                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                                style={{
                                    background: `linear-gradient(145deg, ${data.accentBg} 0%, transparent 60%)`,
                                }}
                            />

                            <div
                                className="absolute -right-3 -top-3 flex h-16 w-16 items-center justify-center rounded-full font-black opacity-[0.06] transition-all duration-500 group-hover:opacity-[0.12] group-hover:scale-110 text-4xl"
                                style={{ color: data.accentColor }}
                            >
                                {index + 1}
                            </div>

                            <CardContent className="relative z-10 p-6 text-inherit">
                                <div className="mb-5 flex items-start justify-between">
                                    <div
                                        className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-lg"
                                        style={{
                                            backgroundColor: data.accentBg,
                                            color: data.accentColor,
                                            border: `1.5px solid ${data.accentBorder}`,
                                        }}
                                    >
                                        {item.icon}
                                    </div>

                                    <ArrowUpRight
                                        className="h-4 w-4 opacity-0 -translate-y-1 translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0"
                                        style={{ color: data.accentColor }}
                                    />
                                </div>

                                <div
                                    className="mb-2 text-xs font-bold uppercase tracking-widest"
                                    style={{ color: data.accentColor }}
                                >
                                    Problem {String(index + 1).padStart(2, "0")}
                                </div>

                                <h3
                                    className="mb-3 text-lg font-bold leading-snug tracking-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {item.title}
                                </h3>

                                <p
                                    className="text-sm leading-relaxed opacity-80"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {item.description}
                                </p>

                                <div
                                    className="mt-5 h-0.5 w-0 rounded-full transition-all duration-500 group-hover:w-full"
                                    style={{
                                        backgroundColor: data.accentColor,
                                    }}
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturePainPoints;
