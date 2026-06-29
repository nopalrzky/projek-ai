import React, { useState } from "react";
import { Monitor, Sparkles } from "lucide-react";
import { Tabs } from "@/Components/Tabs";
import { Card, CardContent } from "@/Components/Card/Card";
import Badge from "@/Components/Badge/Badge";
import type { VisualShowcaseProps } from "./types";

const VisualShowcase: React.FC<VisualShowcaseProps> = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const accentColor = data.accentColor ?? "var(--color-primary-600)";
    const accentBg = data.accentBg ?? "var(--color-primary-50)";
    const accentBorder = data.accentBorder ?? "var(--color-primary-200)";

    const activeTab = data.tabs[activeIndex];

    const tabItems = data.tabs.map((tab) => ({ label: tab.label }));

    return (
        <section
            className="relative overflow-hidden py-24 lg:py-32"
            style={{ backgroundColor: "var(--color-surface)" }}
        >
            <div
                className="absolute left-0 top-0 h-px w-full"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, var(--color-border), transparent)",
                }}
            />
            <div
                className="absolute bottom-0 left-0 h-px w-full"
                style={{
                    background:
                        "linear-gradient(90deg, transparent, var(--color-border), transparent)",
                }}
            />

            <div
                className="pointer-events-none absolute right-0 top-0 h-[700px] w-[700px] translate-x-1/3 -translate-y-1/4 rounded-full blur-[150px] opacity-[0.12]"
                style={{ backgroundColor: accentColor }}
            />
            <div
                className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/4 translate-y-1/4 rounded-full blur-[130px] opacity-[0.08]"
                style={{ backgroundColor: accentColor }}
            />

            <div className="container-fluid relative z-10">
                <div className="mx-auto mb-14 max-w-3xl text-center animate-fadeInUp lg:mb-16">
                    <div
                        className="mb-5 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 backdrop-blur-sm"
                        style={{
                            backgroundColor: accentBg,
                            borderColor: accentBorder,
                            color: accentColor,
                        }}
                    >
                        <Monitor className="h-3.5 w-3.5" />
                        <span className="text-xs font-black uppercase tracking-widest">
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

                <div className="animate-fadeInUp" style={{ animationDelay: "150ms" }}>
                    <Tabs
                        tabs={tabItems}
                        selectedIndex={activeIndex}
                        onChange={setActiveIndex}
                        variant="pills"
                        centered
                        tabListClassName="mb-10"
                        tabPanelsClassName="mt-0"
                    >
                        {data.tabs.map((tab, index) => (
                            <div key={tab.id}>
                                <Card
                                    variant="elevated"
                                    className="overflow-hidden"
                                    style={{ borderColor: "var(--color-border)" }}
                                >
                                    <div
                                        className="flex items-center justify-between border-b px-5 py-3.5"
                                        style={{
                                            backgroundColor: "var(--color-gray-50)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {[
                                                "var(--color-error-400)",
                                                "var(--color-warning-400)",
                                                "var(--color-success-400)",
                                            ].map((color, i) => (
                                                <span
                                                    key={i}
                                                    className="h-3 w-3 rounded-full"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>

                                        <span
                                            className="hidden rounded-md px-3 py-1 font-mono text-xs sm:block"
                                            style={{
                                                backgroundColor: "var(--color-gray-100)",
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            washwallet.id/dashboard
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <Badge variant="success" size="sm" pulse>
                                                Live
                                            </Badge>

                                            <span
                                                className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                                                style={{
                                                    backgroundColor: accentBg,
                                                    borderColor: accentBorder,
                                                    color: accentColor,
                                                }}
                                            >
                                                <Sparkles className="h-3 w-3" />
                                                {tab.label}
                                            </span>
                                        </div>
                                    </div>

                                    <CardContent
                                        noPadding
                                        className="overflow-x-auto p-5 sm:p-7 lg:p-10"
                                    >
                                        <div
                                            className="min-h-[420px] transition-all duration-500 lg:min-h-[520px]"
                                            style={{
                                                opacity: activeIndex === index ? 1 : 0,
                                                transform: activeIndex === index ? "translateY(0)" : "translateY(12px)",
                                            }}
                                        >
                                            {tab.mockup}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </Tabs>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-3 animate-fadeInUp" style={{ animationDelay: "300ms" }}>
                    {data.tabs.map((tab, index) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className="group flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                            style={{
                                backgroundColor:
                                    activeIndex === index
                                        ? accentBg
                                        : "var(--color-surface)",
                                borderColor:
                                    activeIndex === index
                                        ? accentBorder
                                        : "var(--color-border)",
                                color:
                                    activeIndex === index
                                        ? accentColor
                                        : "var(--color-text-secondary)",
                            }}
                        >
                            <span
                                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black transition-all duration-300"
                                style={{
                                    backgroundColor:
                                        activeIndex === index
                                            ? accentColor
                                            : "var(--color-gray-200)",
                                    color:
                                        activeIndex === index
                                            ? "white"
                                            : "var(--color-text-tertiary)",
                                }}
                            >
                                {index + 1}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VisualShowcase;
