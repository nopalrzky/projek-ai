import React from "react";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/Components/Button";
import type { FeatureCTAFinalProps } from "./types";
import { motion } from "framer-motion";
import FeatureSectionHeader from "./FeatureSectionHeader";

const FeatureCTAFinal: React.FC<FeatureCTAFinalProps> = ({
    data,
    hideGlow = false,
    headerLayout = "center",
}) => {
    const accentColor = data.accentColor ?? "var(--color-primary-600)";
    const accentBg = data.accentBg ?? "var(--color-primary-50)";
    const accentBorder = data.accentBorder ?? "var(--color-primary-200)";

    const handleWhatsApp = () => {
        const message = encodeURIComponent(data.whatsappMessage);
        window.open(`https://wa.me/?text=${message}`, "_blank");
    };

    return (
        <section className="relative overflow-hidden py-24 lg:py-32">
            <div className="container-fluid relative z-10">
                <div
                    className={[
                        "animate-fadeInUp",
                        headerLayout === "split"
                            ? undefined
                            : "mx-auto max-w-3xl text-center",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <FeatureSectionHeader
                        badge={data.badge}
                        headline={data.headline}
                        subheadline={data.subheadline}
                        accentColor={accentColor}
                        accentBg={accentBg}
                        accentBorder={accentBorder}
                        layout={headerLayout}
                        className="mb-12"
                    />
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <a href={data.primaryCtaHref}>
                                <Button
                                    className="w-full sm:w-auto"
                                    style={{
                                        backgroundColor: accentColor,
                                        color: "white",
                                    }}
                                >
                                    {data.primaryCtaText}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </a>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Button
                                onClick={handleWhatsApp}
                                className="w-full sm:w-auto"
                                variant="outline"
                                style={{
                                    borderColor: accentColor,
                                    color: accentColor,
                                }}
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                {data.secondaryCtaText}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureCTAFinal;
