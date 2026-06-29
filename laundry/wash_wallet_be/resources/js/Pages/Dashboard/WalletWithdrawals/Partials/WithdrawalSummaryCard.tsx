import React from "react";
import { formatCurrency } from "@/lib/utils";
import { WithdrawalSummaryCardProps } from "../types";

export const WithdrawalSummaryCard: React.FC<WithdrawalSummaryCardProps> = ({
    availableBalance,
    requestedAmount,
    adminFee,
    netAmount,
}) => {
    return (
        <div
            className="p-4 rounded-xl border space-y-3"
            style={{
                backgroundColor: "var(--color-background)",
                borderColor: "var(--color-border)",
            }}
        >
            <h4 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Ringkasan Penarikan
            </h4>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>Saldo Tersedia</span>
                    <span style={{ color: "var(--color-text-primary)" }} className="font-medium">
                        {formatCurrency(availableBalance)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>Nominal Penarikan</span>
                    <span style={{ color: "var(--color-text-primary)" }} className="font-medium">
                        {formatCurrency(requestedAmount || 0)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span style={{ color: "var(--color-text-secondary)" }}>Biaya Admin Bank</span>
                    <span className="text-red-500 font-medium">
                        -{formatCurrency(adminFee || 0)}
                    </span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: "var(--color-border)" }}>
                    <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        Estimasi Dana Diterima (Net)
                    </span>
                    <span className="font-bold text-lg text-green-600" style={{ color: "var(--color-primary-600)" }}>
                        {formatCurrency(netAmount > 0 ? netAmount : 0)}
                    </span>
                </div>
            </div>
        </div>
    );
};
