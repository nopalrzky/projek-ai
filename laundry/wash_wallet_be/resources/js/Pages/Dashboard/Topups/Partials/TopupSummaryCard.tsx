import React from "react";
import { CreditCard, Save } from "lucide-react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import SummaryItem from "./SummaryItem";
import { formatCurrency } from "@/lib/utils";
import { TopupFormData } from "@/types/topup";

const BANK_CHANNELS = [
    { id: "bca", name: "BCA" },
    { id: "bni", name: "BNI" },
    { id: "bri", name: "BRI" },
    { id: "cimb", name: "CIMB Niaga" },
    { id: "mandiri", name: "Mandiri" },
    { id: "permata", name: "Permata" },
];

function resolvePaymentLabel(data: TopupFormData): string {
    if (data.paymentMethod === "gopay") return "GoPay / QRIS";
    if (data.paymentMethod === "cstore") {
        if (data.cstoreType === "alfamart") return "Alfamart";
        if (data.cstoreType === "indomaret") return "Indomaret";
        return "Over the Counter";
    }
    if (data.paymentMethod === "akulaku") return "Akulaku Cicilan";
    if (data.paymentMethod === "kredivo") return "Kredivo Paylater";
    return (
        BANK_CHANNELS.find((b) => b.id === data.bankCode)?.name || "-"
    );
}

interface Outlet {
    id: number;
    name: string;
}

interface TopupSummaryCardProps {
    data: TopupFormData;
    topupMode: "master" | "outlet";
    selectedOutlet: Outlet | null;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
}

const TopupSummaryCard = ({
    data,
    topupMode,
    selectedOutlet,
    processing,
    onSubmit,
}: TopupSummaryCardProps) => {
    const isDisabled =
        processing ||
        !data.amountMoney ||
        (topupMode === "outlet" && !data.outletId) ||
        !data.paymentMethod;

    return (
        <Card className="p-6 space-y-6">
            <h3
                className="text-lg font-bold flex items-center gap-2"
                style={{ color: "var(--color-text-primary)" }}
            >
                <CreditCard className="w-5 h-5" />
                Ringkasan Topup
            </h3>

            <div className="space-y-1">
                <SummaryItem
                    label="Tujuan"
                    value={
                        topupMode === "master"
                            ? "Master Wallet"
                            : selectedOutlet?.name || "Pilih Outlet..."
                    }
                />
                <SummaryItem
                    label="Jumlah Coin"
                    value={`${formatCurrency(data.amountMoney || 0)} Coin`}
                />
                <SummaryItem
                    label="Metode"
                    value={resolvePaymentLabel(data)}
                />

                <div
                    className="pt-4 border-t mt-2"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <div className="flex justify-between items-end">
                        <span
                            className="text-sm font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Total Bayar
                        </span>
                        <span
                            className="text-2xl font-bold"
                            style={{ color: "var(--color-primary-600)" }}
                        >
                            {formatCurrency(data.amountMoney)}
                        </span>
                    </div>
                </div>
            </div>

            <Button
                onClick={onSubmit}
                variant="primary"
                size="lg"
                className="w-full"
                loading={processing}
                disabled={isDisabled}
                leftIcon={<Save className="w-5 h-5" />}
            >
                {processing ? "Memproses..." : "Bayar Sekarang"}
            </Button>

            <p
                className="text-xs text-center"
                style={{ color: "var(--color-text-tertiary)" }}
            >
                Dengan melanjutkan, Anda menyetujui syarat &amp; ketentuan
                layanan kami.
            </p>
        </Card>
    );
};

export default TopupSummaryCard;
