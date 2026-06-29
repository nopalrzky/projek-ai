import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { Card, CardContent } from "@/Components/Card/Card";
import type { FeatureComparisonProps } from "./types";
import FeatureSectionHeader from "./FeatureSectionHeader";

const FeatureComparison: React.FC<FeatureComparisonProps> = ({
    data,
    hideGlow = false,
    headerLayout = "center",
}) => {
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

                <Card className="overflow-hidden border animate-fadeInUp">
                    <CardContent noPadding className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr
                                        style={{
                                            backgroundColor:
                                                "var(--color-gray-50)",
                                            borderBottom:
                                                "1px solid var(--color-border)",
                                        }}
                                    >
                                        <th
                                            className="px-6 py-4 text-left text-sm font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Aspek
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-sm font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Cara Manual
                                        </th>
                                        <th
                                            className="px-6 py-4 text-left text-sm font-bold"
                                            style={{
                                                color: accentColor,
                                            }}
                                        >
                                            WashWallet
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="group transition-colors duration-200"
                                            style={{
                                                borderBottom:
                                                    "1px solid var(--color-border)",
                                                backgroundColor:
                                                    index % 2 === 0
                                                        ? "transparent"
                                                        : "var(--color-gray-50)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    "var(--color-gray-50)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor =
                                                    index % 2 === 0
                                                        ? "transparent"
                                                        : "var(--color-gray-50)";
                                            }}
                                        >
                                            <td
                                                className="px-6 py-4 text-sm font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {row.aspect}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <X
                                                        className="h-4 w-4 flex-shrink-0 mt-0.5"
                                                        style={{
                                                            color: "var(--color-error-500)",
                                                        }}
                                                    />
                                                    <p
                                                        className="text-sm leading-relaxed"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        {row.manual}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-3">
                                                    <CheckCircle2
                                                        className="h-4 w-4 flex-shrink-0 mt-0.5"
                                                        style={{
                                                            color: accentColor,
                                                        }}
                                                    />
                                                    <p
                                                        className="text-sm leading-relaxed font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {row.washwallet}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
};

export default FeatureComparison;
