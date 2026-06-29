import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FeatureFAQProps } from "./types";
import FeatureSectionHeader from "./FeatureSectionHeader";

const FeatureFAQ: React.FC<FeatureFAQProps> = ({
    data,
    hideGlow = false,
    headerLayout = "center",
}) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
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

                <div className="mx-auto max-w-3xl space-y-4 animate-fadeInUp">
                    {data.items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="overflow-hidden rounded-lg border"
                            style={{
                                borderColor: "var(--color-border)",
                                backgroundColor: "var(--color-surface)",
                            }}
                        >
                            <motion.button
                                onClick={() =>
                                    setOpenIndex(
                                        openIndex === index ? null : index,
                                    )
                                }
                                className="w-full px-6 py-4 flex items-center justify-between transition-colors duration-200 hover:bg-[var(--color-gray-50)]"
                                style={{
                                    backgroundColor:
                                        openIndex === index
                                            ? accentBg
                                            : "transparent",
                                }}
                            >
                                <h3
                                    className="text-left text-lg font-bold tracking-tight"
                                    style={{
                                        color:
                                            openIndex === index
                                                ? accentColor
                                                : "var(--color-text-primary)",
                                    }}
                                >
                                    {item.question}
                                </h3>

                                <motion.div
                                    animate={{
                                        rotate: openIndex === index ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-shrink-0 ml-4"
                                >
                                    <ChevronDown
                                        className="h-5 w-5"
                                        style={{
                                            color:
                                                openIndex === index
                                                    ? accentColor
                                                    : "var(--color-text-secondary)",
                                        }}
                                    />
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div
                                            className="px-6 py-4 border-t"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                                backgroundColor:
                                                    "var(--color-background)",
                                            }}
                                        >
                                            <p
                                                className="text-base leading-relaxed"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {item.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeatureFAQ;
