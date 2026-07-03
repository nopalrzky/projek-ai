import React from "react";
import { Card } from "@/Components/Card";
import { Input } from "@/Components/Input";
import SectionTitle from "./SectionTitle";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

interface TopupAmountSectionProps {
    amountMoney: number;
    onAmountChange: (amount: number) => void;
    amountError?: string;
    processing: boolean;
}

const TopupAmountSection = ({
    amountMoney,
    onAmountChange,
    amountError,
    processing,
}: TopupAmountSectionProps) => {
    return (
        <Card className="p-6">
            <SectionTitle
                number={2}
                title="Masukkan Nominal Topup"
                subtitle="Pilih atau masukkan nominal uang"
                color="var(--color-success-600)"
                bgColor="var(--color-success-100)"
            />

            <div className="mt-6 space-y-4">
                <Input
                    type="number"
                    label="Nominal (Min. Rp 10.000)"
                    placeholder="Min. 10000"
                    value={amountMoney.toString()}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onAmountChange(
                            Math.max(0, parseInt(e.target.value) || 0),
                        )
                    }
                    error={amountError}
                    min={10000}
                    max={10000000}
                    step={1000}
                    disabled={processing}
                    hint={`1 Coin = Rp 1. Anda akan mendapatkan ${formatCurrency(amountMoney || 0)} Coin.`}
                    leftIcon={
                        <span
                            className="font-medium pl-3 text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Rp
                        </span>
                    }
                />

                <div className="flex flex-wrap gap-2 pt-2">
                    {QUICK_AMOUNTS.map((amount) => (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => onAmountChange(amount)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                amountMoney === amount
                                    ? "text-white border-transparent"
                                    : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary-300)] hover:text-[var(--color-primary-600)]",
                            )}
                            style={
                                amountMoney === amount
                                    ? {
                                          backgroundColor:
                                              "var(--color-primary-500)",
                                          borderColor:
                                              "var(--color-primary-500)",
                                      }
                                    : {
                                          backgroundColor:
                                              "var(--color-surface)",
                                      }
                            }
                        >
                            {formatCurrency(amount)}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default TopupAmountSection;
