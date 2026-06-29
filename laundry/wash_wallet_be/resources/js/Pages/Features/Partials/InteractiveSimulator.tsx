import React, { useState } from "react";
import { Check, CheckCircle2, Info, Play, ShieldCheck } from "lucide-react";

export type InteractiveSimulatorTone =
    | "info"
    | "warning"
    | "success"
    | "rose"
    | "accent"
    | "primary"
    | "muted";

export interface InteractiveSimulatorDetail {
    label: string;
    value: string;
    highlight?: boolean;
    statusType?: InteractiveSimulatorTone;
}

export interface InteractiveSimulatorStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    actor: string;
    actorIcon: React.ReactNode;
    features: string[];
    insight: string;
    actionLabel: string;
    successMessage: string;
    simulatorState: {
        badgeText: string;
        badgeType: InteractiveSimulatorTone;
        cardTitle: string;
        cardSubtitle: string;
        details: InteractiveSimulatorDetail[];
    };
}

export interface InteractiveSimulatorData {
    badge: string;
    headline: string;
    subheadline: string;
    headerLayout?: "center" | "split";
    insightTone?: InteractiveSimulatorTone;
    completedTone?: InteractiveSimulatorTone;
    accentColor?: string;
    accentStrongColor?: string;
    glowSecondaryColor?: string;
    actorLabel?: string;
    featureLabel?: string;
    insightLabel?: string;
    insightPrefix?: string;
    completedLabel?: string;
    successTitle?: string;
    browserUrl: string;
    hint: string;
    steps: InteractiveSimulatorStep[];
}

export interface InteractiveSimulatorProps {
    data: InteractiveSimulatorData;
}

const getToneClass = (tone: InteractiveSimulatorTone) => {
    switch (tone) {
        case "warning":
            return "interactive-simulator-badge-warning";
        case "success":
            return "interactive-simulator-badge-success";
        case "rose":
            return "interactive-simulator-badge-rose";
        case "accent":
            return "interactive-simulator-badge-accent";
        case "primary":
            return "interactive-simulator-badge-primary";
        case "muted":
            return "interactive-simulator-badge-muted";
        case "info":
        default:
            return "interactive-simulator-badge-info";
    }
};

const getStatusClass = (tone: InteractiveSimulatorTone = "muted") => {
    switch (tone) {
        case "warning":
            return "interactive-simulator-status-warning";
        case "success":
            return "interactive-simulator-status-success";
        case "rose":
            return "interactive-simulator-status-rose";
        case "accent":
            return "interactive-simulator-status-accent";
        case "primary":
            return "interactive-simulator-status-primary";
        case "info":
            return "interactive-simulator-status-info";
        case "muted":
        default:
            return "interactive-simulator-status-muted";
    }
};

const InteractiveSimulator: React.FC<InteractiveSimulatorProps> = ({
    data,
}) => {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [actionExecuted, setActionExecuted] = useState<
        Record<string, boolean>
    >({});

    const currentStep = data.steps[activeStepIndex];
    const isExecuted = actionExecuted[currentStep.id];
    const isSplitHeader = data.headerLayout === "split";
    const completedTone = data.completedTone ?? "success";

    const handleExecuteAction = () => {
        setActionExecuted((prev) => ({ ...prev, [currentStep.id]: true }));
    };

    const simulatorStyle = {
        "--interactive-simulator-accent":
            data.accentColor ?? "var(--color-info-500)",
        "--interactive-simulator-accent-strong":
            data.accentStrongColor ?? "var(--color-info-600)",
        "--interactive-simulator-glow-secondary":
            data.glowSecondaryColor ?? "var(--color-success-500)",
    } as React.CSSProperties;

    const headerBadgeStyle = {
        backgroundColor:
            "color-mix(in srgb, var(--interactive-simulator-accent) 12%, transparent)",
        color: "var(--interactive-simulator-accent)",
        borderColor:
            "color-mix(in srgb, var(--interactive-simulator-accent) 24%, transparent)",
    } as React.CSSProperties;

    return (
        <section
            className="relative overflow-hidden py-24 lg:py-32"
            style={simulatorStyle}
        >
            <div className="container relative z-10 mx-auto max-w-7xl px-4">
                <div
                    className={[
                        "mb-14 flex flex-col gap-4 lg:mb-20",
                        isSplitHeader
                            ? "lg:flex-row lg:items-end lg:justify-between"
                            : "mx-auto max-w-3xl text-center",
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <div className={isSplitHeader ? "max-w-2xl" : undefined}>
                        <div
                            className={[
                                "mb-6 flex items-center gap-3",
                                isSplitHeader ? undefined : "justify-center",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                        >
                            <div className="interactive-simulator-accent-line h-0.5 w-8 rounded-full" />
                            <span
                                className="inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 text-[11px] font-black uppercase tracking-wider"
                                style={headerBadgeStyle}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="interactive-simulator-ping absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" />
                                    <span className="interactive-simulator-dot-active relative inline-flex h-2 w-2 rounded-full" />
                                </span>
                                {data.badge}
                            </span>
                        </div>

                        <h2 className="interactive-simulator-title text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl lg:text-5xl">
                            {data.headline}
                        </h2>
                    </div>

                    <p
                        className={[
                            "interactive-simulator-copy-soft text-base leading-relaxed opacity-80 animate-fadeInUp",
                            isSplitHeader
                                ? "max-w-sm lg:text-right"
                                : "mx-auto mt-4 max-w-2xl",
                        ].join(" ")}
                    >
                        {data.subheadline}
                    </p>
                </div>

                <div className="mb-10 flex flex-wrap justify-center gap-2 md:gap-3">
                    {data.steps.map((step, idx) => (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => {
                                setActiveStepIndex(idx);
                            }}
                            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-bold transition-all duration-300 ${
                                activeStepIndex === idx
                                    ? "interactive-simulator-button-active"
                                    : "interactive-simulator-button"
                            }`}
                        >
                            <span className="interactive-simulator-step-number flex h-5 w-5 items-center justify-center rounded text-[10px]">
                                {idx + 1}
                            </span>
                            <span>{step.title}</span>
                        </button>
                    ))}
                </div>

                <div className="grid items-stretch gap-8 lg:grid-cols-12">
                    <div className="interactive-simulator-panel flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm md:p-8 lg:col-span-7">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="interactive-simulator-icon-badge flex h-9 w-9 items-center justify-center rounded-xl border">
                                    {currentStep.icon}
                                </div>
                                <div>
                                    <span className="interactive-simulator-muted block text-[10px] font-bold uppercase tracking-wider">
                                        Tahap Aktif
                                    </span>
                                    <h3 className="interactive-simulator-strong text-lg font-bold leading-tight">
                                        {currentStep.title}
                                    </h3>
                                </div>
                            </div>

                            <p className="interactive-simulator-copy text-sm leading-relaxed">
                                {currentStep.description}
                            </p>

                            <div className="interactive-simulator-divider space-y-4 border-t pt-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="interactive-simulator-copy-soft font-semibold">
                                        {data.actorLabel ??
                                            "Siapa yang Mengakses:"}
                                    </span>
                                    <span className="interactive-simulator-pill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium">
                                        {currentStep.actorIcon}
                                        {currentStep.actor}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <span className="interactive-simulator-muted block text-[10px] font-bold uppercase tracking-wider">
                                        {data.featureLabel ?? "Fitur Utama"}
                                    </span>
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {currentStep.features.map(
                                            (feature, fIdx) => (
                                                <div
                                                    key={fIdx}
                                                    className="interactive-simulator-row flex items-center gap-2 rounded border p-2"
                                                >
                                                    <CheckCircle2 className="interactive-simulator-feature-icon h-3.5 w-3.5 flex-shrink-0" />
                                                    <span className="interactive-simulator-copy text-xs font-medium">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <span className="interactive-simulator-muted block text-[10px] font-bold uppercase tracking-wider">
                                        {data.insightLabel ??
                                            "Dampak bagi Bisnis Laundry"}
                                    </span>
                                    <div
                                        className={`flex items-center gap-2 rounded border p-2.5 font-sans text-xs ${getToneClass(
                                            data.insightTone ?? "warning",
                                        )}`}
                                    >
                                        <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                                        <span>
                                            {data.insightPrefix ?? "Manfaat"}:{" "}
                                            {currentStep.insight}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="interactive-simulator-divider mt-6 border-t pt-4">
                            <button
                                type="button"
                                onClick={handleExecuteAction}
                                disabled={isExecuted}
                                className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-xs font-bold transition-all duration-300 ${
                                    isExecuted
                                        ? `${getToneClass(completedTone)} cursor-not-allowed`
                                        : "interactive-simulator-primary-action active:scale-[0.98]"
                                }`}
                            >
                                {isExecuted ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        {data.completedLabel ??
                                            "Skenario Berhasil Disimulasikan!"}
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-3.5 w-3.5 fill-current" />
                                        {currentStep.actionLabel}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="interactive-simulator-panel-subtle relative flex flex-col overflow-hidden rounded-2xl border p-6 lg:col-span-5">
                        <div className="interactive-simulator-card mb-5 flex items-center justify-between border-b pb-3">
                            <div className="flex items-center gap-1.5">
                                <span className="interactive-simulator-dot h-2 w-2 rounded-full" />
                                <span className="interactive-simulator-dot h-2 w-2 rounded-full" />
                                <span className="interactive-simulator-dot h-2 w-2 rounded-full" />
                            </div>
                            <span className="interactive-simulator-browser-label rounded px-2 py-0.5 font-mono text-[9px]">
                                {data.browserUrl}
                            </span>
                        </div>

                        <div className="flex flex-1 flex-col justify-center">
                            <div className="interactive-simulator-card relative overflow-hidden rounded-xl border p-5">
                                <div className="interactive-simulator-card-orb pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full blur-xl" />

                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div>
                                        <h4 className="interactive-simulator-title text-sm font-bold">
                                            {
                                                currentStep.simulatorState
                                                    .cardTitle
                                            }
                                        </h4>
                                        <p className="interactive-simulator-muted mt-0.5 text-[10px]">
                                            {
                                                currentStep.simulatorState
                                                    .cardSubtitle
                                            }
                                        </p>
                                    </div>
                                    <span
                                    className={`rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${
                                            isExecuted
                                                ? getToneClass(completedTone)
                                                : getToneClass(
                                                      currentStep.simulatorState
                                                          .badgeType,
                                                  )
                                        }`}
                                    >
                                        {isExecuted
                                            ? "Sukses"
                                            : currentStep.simulatorState
                                                  .badgeText}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-2.5">
                                    {currentStep.simulatorState.details.map(
                                        (detail, dIdx) => (
                                            <div
                                                key={dIdx}
                                                className="interactive-simulator-row flex items-center justify-between gap-3 rounded-lg border p-3"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {detail.statusType && (
                                                        <span
                                                            className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                                                isExecuted
                                                                    ? getStatusClass(
                                                                          "success",
                                                                      )
                                                                    : getStatusClass(
                                                                          detail.statusType,
                                                                      )
                                                            }`}
                                                        />
                                                    )}
                                                    <span className="interactive-simulator-copy-soft text-xs">
                                                        {detail.label}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-right text-xs font-semibold ${
                                                        detail.highlight
                                                            ? "interactive-simulator-highlight"
                                                            : "interactive-simulator-strong"
                                                    }`}
                                                >
                                                    {detail.value}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {isExecuted && (
                                    <div
                                        className={`mt-4 space-y-1 rounded-lg border p-3 text-xs animate-fadeInUp ${getToneClass(completedTone)}`}
                                    >
                                        <span className="flex items-center gap-1 font-bold">
                                            <Check className="h-3 w-3" />
                                            {data.successTitle ??
                                                "Update Sistem:"}
                                        </span>
                                        <p className="interactive-simulator-copy font-sans text-[10px]">
                                            {currentStep.successMessage}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="interactive-simulator-row interactive-simulator-muted mt-5 flex items-center gap-2 rounded-xl border p-3 text-[11px]">
                            <Info className="interactive-simulator-feature-icon h-3.5 w-3.5 flex-shrink-0" />
                            <span>{data.hint}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InteractiveSimulator;
