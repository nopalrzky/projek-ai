import React from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/Components/Card/Card";
import type { UseCasesProps } from "./types";
import FeatureSectionHeader from "./FeatureSectionHeader";

const UseCases: React.FC<UseCasesProps> = ({
    data,
    headerLayout = "center",
}) => {
    const safeItems = data.cases.slice(0, 3);
    const accentColor = data.accentColor ?? "var(--color-primary-600)";
    const accentBg = data.accentBg ?? "var(--color-primary-50)";
    const accentBorder = data.accentBorder ?? "var(--color-primary-200)";

    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="container-fluid relative z-10">
                <FeatureSectionHeader
                    badge={data.badge}
                    headline={data.headline}
                    subheadline={data.subheadline}
                    accentColor={accentColor}
                    accentBg={accentBg}
                    accentBorder={accentBorder}
                    layout={headerLayout}
                    className="mb-20 lg:mb-24"
                />

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
                    {safeItems.map((useCase, index) => (
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
                                    background: `linear-gradient(135deg, ${useCase.accentColor}08 0%, transparent 60%)`,
                                }}
                            />

                            <div
                                className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-2xl opacity-0 transition-all duration-500 group-hover:opacity-25"
                                style={{ backgroundColor: useCase.accentColor }}
                            />

                            <CardContent className="relative z-10 space-y-6 p-8 lg:p-10">
                                <div className="space-y-2">
                                    <h3
                                        className="text-2xl font-bold tracking-tight"
                                        style={{
                                            color: useCase.accentColor,
                                        }}
                                    >
                                        {useCase.persona}
                                    </h3>
                                    <div
                                        className="h-0.5 w-8 rounded-full"
                                        style={{
                                            backgroundColor:
                                                useCase.accentColor,
                                        }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p
                                            className="mb-2 text-xs font-bold uppercase tracking-widest opacity-70"
                                            style={{
                                                color: useCase.accentColor,
                                            }}
                                        >
                                            Skenario
                                        </p>
                                        <p
                                            className="text-base leading-relaxed"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {useCase.scenario}
                                        </p>
                                    </div>

                                    <div className="border-t border-[var(--color-border)] pt-4">
                                        <p
                                            className="mb-2 text-xs font-bold uppercase tracking-widest opacity-70"
                                            style={{
                                                color: useCase.accentColor,
                                            }}
                                        >
                                            Hasil
                                        </p>
                                        <p
                                            className="text-base leading-relaxed"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {useCase.outcome}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className="flex items-center gap-2 pt-2 text-sm font-semibold opacity-0 transition-all duration-300 group-hover:opacity-100"
                                    style={{ color: useCase.accentColor }}
                                >
                                    Baca selengkapnya
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UseCases;
