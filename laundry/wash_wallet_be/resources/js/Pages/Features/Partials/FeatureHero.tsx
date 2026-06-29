import React from "react";
import {
    ArrowRight,
    CheckCircle2,
    Sparkles,
    BarChart3,
    Activity,
    Clock3,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Card, CardHeader, CardContent } from "@/Components/Card";
import { FeatureHeroProps } from "./types";

const FeatureHero: React.FC<FeatureHeroProps> = ({
    data,
    primaryCtaText = "Coba Gratis 14 Hari",
    primaryCtaHref = "/register",
    secondaryCtaText = "Lihat Detail Fitur",
    secondaryCtaHref = "#feature-highlights",
    hideGlow = false,
}) => {
    return (
        <section className="relative overflow-visible px-4 pb-28 pt-24 sm:px-6 lg:px-8">
            {!hideGlow && (
                <>
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `
                                radial-gradient(ellipse 70% 60% at 5% 10%, ${data.accentBg} 0%, transparent 55%),
                                radial-gradient(ellipse 60% 50% at 95% 90%, ${data.accentBg} 0%, transparent 50%)
                            `,
                        }}
                    />

                    <div
                        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full blur-[130px] opacity-25 pointer-events-none"
                        style={{ backgroundColor: data.accentColor }}
                    />
                    <div
                        className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/2 h-[620px] w-[620px] rounded-full blur-[150px] opacity-20 pointer-events-none animate-pulse-slow"
                        style={{
                            backgroundColor:
                                data.orbColor ??
                                data.accentStrongColor ??
                                data.accentColor,
                        }}
                    />
                </>
            )}

            <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:gap-20 lg:grid-cols-2">
                <div className="space-y-8 animate-fadeInUp">
                    <div className="space-y-3">
                        <div
                            className="inline-flex items-center gap-2.5 rounded-full border px-4 py-2 backdrop-blur-sm shadow-sm"
                            style={{
                                backgroundColor: data.accentBg,
                                borderColor: data.accentBorder,
                            }}
                        >
                            <Sparkles
                                className="h-4 w-4"
                                style={{ color: data.accentColor }}
                            />
                            <span
                                className="text-sm font-bold tracking-wider uppercase"
                                style={{ color: data.accentColor }}
                            >
                                {data.badge}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                            <span
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {data.headline}{" "}
                            </span>
                            <span
                                className="relative"
                                style={{
                                    backgroundImage: `linear-gradient(135deg, ${data.accentColor} 0%, ${data.accentStrongColor ?? data.accentColor} 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                {data.headlineHighlight}
                            </span>
                        </h1>

                        <p
                            className="max-w-xl text-lg leading-relaxed sm:text-xl opacity-90"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {data.subheadline}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                        {data.highlights.map((item) => (
                            <div
                                key={item}
                                className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 backdrop-blur-sm"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <CheckCircle2
                                    className="h-4 w-4 flex-shrink-0"
                                    style={{ color: data.accentColor }}
                                />
                                <span
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Button
                            href={primaryCtaHref}
                            size="xl"
                            shape="pill"
                            shadow
                            rightIcon={
                                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                            }
                            className="group font-bold"
                            style={{
                                backgroundColor: data.accentColor,
                                borderColor: "transparent",
                            }}
                        >
                            {primaryCtaText}
                        </Button>

                        <Button
                            href={secondaryCtaHref}
                            size="xl"
                            shape="pill"
                            variant="ghost"
                            className="font-semibold"
                            style={{
                                color: data.accentColor,
                                border: `1.5px solid ${data.accentBorder}`,
                            }}
                        >
                            {secondaryCtaText}
                        </Button>
                    </div>
                </div>

                <div
                    className="relative lg:pl-6 animate-fadeInUp"
                    style={{ animationDelay: "200ms" }}
                >
                    <Card
                        variant="elevated"
                        className="overflow-hidden"
                        style={{ borderColor: data.accentBorder }}
                    >
                        <CardHeader
                            className="!flex-row !items-center !justify-between py-4 px-5"
                            style={{
                                background: "var(--color-gray-50)",
                                borderBottomColor: "var(--color-border)",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                {[
                                    data.accentBg,
                                    data.accentColor,
                                    data.accentStrongColor ?? data.accentColor,
                                ].map((color, i) => (
                                    <span
                                        key={i}
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>

                            <span
                                className="text-xs font-mono px-3 py-1 rounded-full"
                                style={{
                                    backgroundColor: "var(--color-gray-100)",
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                washwallet.id/dashboard
                            </span>

                            <Badge
                                size="sm"
                                pulse
                                className="shrink-0 border"
                                style={{
                                    backgroundColor: data.accentBg,
                                    color: data.accentColor,
                                    borderColor: data.accentBorder,
                                }}
                            >
                                Live
                            </Badge>
                        </CardHeader>

                        <CardContent noPadding className="p-5 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        icon: <BarChart3 className="h-4 w-4" />,
                                        label: "Order Aktif",
                                        value: "124",
                                        delta: "+12%",
                                    },
                                    {
                                        icon: <Activity className="h-4 w-4" />,
                                        label: "Selesai Hari Ini",
                                        value: "87%",
                                        delta: "+5%",
                                    },
                                    {
                                        icon: <Clock3 className="h-4 w-4" />,
                                        label: "Avg Waktu",
                                        value: "1j 45m",
                                        delta: "-8m",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border p-4 flex flex-col gap-2"
                                        style={{
                                            backgroundColor:
                                                "var(--color-background)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="flex items-center justify-center h-8 w-8 rounded-lg"
                                            style={{
                                                backgroundColor: data.accentBg,
                                                color: data.accentColor,
                                            }}
                                        >
                                            {item.icon}
                                        </div>
                                        <p
                                            className="text-[11px]"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {item.label}
                                        </p>
                                        <p
                                            className="text-xl font-bold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {item.value}
                                        </p>
                                        <span
                                            className="inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                                            style={{
                                                backgroundColor: data.accentBg,
                                                color: data.accentColor,
                                            }}
                                        >
                                            {item.delta}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="rounded-2xl border p-4"
                                style={{
                                    backgroundColor: "var(--color-background)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <p
                                        className="text-sm font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Trend Mingguan
                                    </p>
                                    <div className="flex items-center gap-1.5">
                                        <TrendingUp
                                            className="h-3.5 w-3.5"
                                            style={{
                                                color: data.accentColor,
                                            }}
                                        />
                                        <span
                                            className="text-xs font-bold"
                                            style={{
                                                color:
                                                    data.accentStrongColor ??
                                                    data.accentColor,
                                            }}
                                        >
                                            +18%
                                        </span>
                                    </div>
                                </div>

                                <div className="relative h-24 flex items-end gap-1.5">
                                    {[36, 44, 55, 52, 67, 74, 82].map(
                                        (height, index) => (
                                            <div
                                                key={index}
                                                className="flex-1 rounded-t-md transition-all duration-300 hover:brightness-110"
                                                style={{
                                                    height: `${height}%`,
                                                        backgroundColor:
                                                            index === 6
                                                                ? data.accentColor
                                                                : data.accentBg,
                                                    }}
                                                />
                                        ),
                                    )}

                                    <div
                                        className="absolute bottom-0 left-0 right-0 h-px"
                                        style={{
                                            backgroundColor:
                                                "var(--color-border)",
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between mt-2">
                                    {[
                                        "Sen",
                                        "Sel",
                                        "Rab",
                                        "Kam",
                                        "Jum",
                                        "Sab",
                                        "Min",
                                    ].map((day) => (
                                        <span
                                            key={day}
                                            className="text-[10px]"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div
                        className="absolute -bottom-5 -left-5 rounded-2xl border px-5 py-3.5 shadow-2xl backdrop-blur-md animate-fadeInUp"
                        style={{
                            animationDelay: "500ms",
                            backgroundColor: "var(--color-surface)",
                            borderColor: data.accentBorder,
                        }}
                    >
                        <p
                            className="text-xs mb-0.5"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Efisiensi Operasional
                        </p>
                            <p
                                className="text-2xl font-extrabold"
                                style={{ color: data.accentColor }}
                            >
                            +27.4%
                        </p>
                        <p
                            className="text-[11px]"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            dibanding bulan lalu
                        </p>
                    </div>

                    <div
                        className="absolute -top-4 -right-4 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md animate-fadeInUp"
                        style={{
                            animationDelay: "600ms",
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <p
                            className="text-xs mb-1"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            Update terakhir
                        </p>
                        <div className="flex items-center gap-2">
                            <span
                                className="h-2 w-2 rounded-full animate-pulse"
                                style={{
                                    backgroundColor:
                                        data.accentStrongColor ??
                                        data.accentColor,
                                }}
                            />
                            <p
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Baru saja
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeatureHero;
