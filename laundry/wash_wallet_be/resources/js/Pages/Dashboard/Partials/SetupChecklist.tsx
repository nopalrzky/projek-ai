import React from "react";
import { Link } from "@inertiajs/react";
import { CheckCircle2, Circle, ArrowRight, Rocket } from "lucide-react";
import { OwnerDashboardSetupItem } from "../types";

interface SetupChecklistProps {
    items: OwnerDashboardSetupItem[];
}

const SetupChecklist: React.FC<SetupChecklistProps> = ({ items }) => {
    const doneCount = items.filter((i) => i.status === "done").length;
    const progress = Math.round((doneCount / items.length) * 100);

    return (
        <div
            className="card relative overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-surface) 60%)",
                borderColor: "var(--color-primary-100)",
            }}
        >
            {/* Accent circle */}
            <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, var(--color-primary-400), transparent 70%)",
                    opacity: 0.06,
                }}
            />

            <div className="card-body p-5 md:p-6 flex flex-col md:flex-row gap-5 items-start md:items-center">
                {/* Left: info block */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{
                                background: "var(--color-primary-100)",
                            }}
                        >
                            <Rocket
                                className="w-4 h-4"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                        </div>
                        <h3
                            className="font-bold text-base"
                            style={{ color: "var(--color-primary-900)" }}
                        >
                            Selamat datang di Wash Wallet!
                        </h3>
                    </div>
                    <p
                        className="text-sm mb-4 max-w-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Selesaikan langkah-langkah berikut untuk memulai menerima pesanan
                        pertama Anda.
                    </p>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3">
                        <div
                            className="h-2 flex-1 max-w-[220px] rounded-full overflow-hidden"
                            style={{ background: "var(--color-border)" }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${progress}%`,
                                    background:
                                        progress === 100
                                            ? "var(--color-success-500)"
                                            : "var(--color-primary-500)",
                                }}
                            />
                        </div>
                        <span
                            className="text-xs font-bold"
                            style={{
                                color:
                                    progress === 100
                                        ? "var(--color-success-600)"
                                        : "var(--color-primary-600)",
                            }}
                        >
                            {doneCount}/{items.length} Selesai
                        </span>
                    </div>
                </div>

                {/* Right: checklist */}
                <div
                    className="w-full md:w-auto min-w-[280px] rounded-xl p-4"
                    style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        boxShadow: "var(--shadow-sm)",
                    }}
                >
                    <div className="space-y-2.5">
                        {items.map((item) => (
                            <div
                                key={item.key}
                                className="flex justify-between items-center gap-3 group"
                            >
                                <div className="flex items-center gap-2.5 text-sm min-w-0">
                                    {item.status === "done" ? (
                                        <CheckCircle2
                                            className="w-4 h-4 shrink-0"
                                            style={{ color: "var(--color-success-500)" }}
                                        />
                                    ) : (
                                        <Circle
                                            className="w-4 h-4 shrink-0"
                                            style={{ color: "var(--color-border-hover)" }}
                                        />
                                    )}
                                    <span
                                        className={`truncate ${
                                            item.status === "done"
                                                ? "line-through"
                                                : "font-medium"
                                        }`}
                                        style={{
                                            color:
                                                item.status === "done"
                                                    ? "var(--color-text-tertiary)"
                                                    : "var(--color-text-primary)",
                                        }}
                                    >
                                        {item.label}
                                    </span>
                                </div>

                                {item.status === "pending" && item.actionHref && (
                                    <Link
                                        href={item.actionHref}
                                        className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-semibold transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 hover:-translate-y-px"
                                        style={{
                                            background: "var(--color-primary-50)",
                                            color: "var(--color-primary-700)",
                                            border: "1px solid var(--color-primary-100)",
                                        }}
                                    >
                                        {item.actionLabel || "Mulai"}
                                        <ArrowRight className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupChecklist;
