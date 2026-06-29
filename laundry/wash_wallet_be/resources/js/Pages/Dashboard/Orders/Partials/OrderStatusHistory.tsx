import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { OrderStatusHistoryProps } from "../types";

const OrderStatusHistory: React.FC<OrderStatusHistoryProps> = ({ order }) => {
    const histories = order.orderStatusHistories || [];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="p-6">
                <h2
                    className="text-lg font-semibold mb-6"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Riwayat Status
                </h2>

                {histories.length === 0 ? (
                    <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                        Belum ada riwayat perubahan status
                    </div>
                ) : (
                    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[var(--color-primary-200)] before:via-[var(--color-primary-100)] before:to-transparent">
                        {histories.map((history, index) => {
                            const actorLabel =
                                history.actorType === "system"
                                    ? history.actorLabel || "Sistem otomatis"
                                    : history.employee?.name || "System";

                            return (
                                <div
                                    key={history.id}
                                    className="relative flex items-start group"
                                >
                                <div className="absolute left-0 mt-1.5 w-10 h-10 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-primary-500)] flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary-500)]" />
                                </div>
                                <div className="ml-16 bg-[var(--color-gray-50)] rounded-2xl p-4 border border-[var(--color-border-light)] flex-1 hover:shadow-md transition-all duration-300">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[var(--color-text-primary)]">
                                                {history.toStatusLabel}
                                            </span>
                                            {history.fromStatus && (
                                                <>
                                                    <span className="text-[var(--color-text-tertiary)] text-xs">
                                                        dari
                                                    </span>
                                                    <span className="text-[var(--color-text-secondary)] text-sm font-medium">
                                                        {
                                                            history.fromStatusLabel
                                                        }
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-[var(--color-text-tertiary)] bg-[var(--color-surface)] px-2.5 py-1 rounded-full border border-[var(--color-border-light)]">
                                            {history.timeAgo}
                                        </span>
                                    </div>

                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
                                        {history.description}
                                    </p>

                                    {history.notes && (
                                        <div className="bg-[var(--color-surface)] p-3 rounded-xl border border-[var(--color-border-light)] text-sm text-[var(--color-text-primary)] italic mb-3">
                                            "{history.notes}"
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest">
                                        <div className="w-6 h-6 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-600)]">
                                            {actorLabel.charAt(0)}
                                        </div>
                                        <span>
                                            Oleh: {actorLabel}
                                        </span>
                                        <span className="mx-1">•</span>
                                        <span>
                                            {history.formattedCreatedAt}
                                        </span>
                                    </div>
                                </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </motion.div>
    );
};

export default OrderStatusHistory;
