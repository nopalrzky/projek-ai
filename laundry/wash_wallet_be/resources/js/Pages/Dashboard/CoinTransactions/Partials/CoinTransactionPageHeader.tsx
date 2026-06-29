import React from "react";
import { ArrowLeft, Receipt, TrendingUp, TrendingDown } from "lucide-react";
import PageHeader from "@/Components/Page/PageHeader";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { coinTransactionService } from "@/Services/coin_transaction.service";
import { CoinTransactionPageHeaderProps } from "../types";

const CoinTransactionPageHeader: React.FC<CoinTransactionPageHeaderProps> = ({
    transaction,
}) => {
    const getTypeBadge = () => {
        const typeConfig = {
            topup: {
                variant: "success" as const,
                label: "Topup",
            },
            commission: {
                variant: "info" as const,
                label: "Komisi",
            },
            transfer_to_outlet: {
                variant: "warning" as const,
                label: "Transfer ke Outlet",
            },
            outlet_spending: {
                variant: "error" as const,
                label: "Pengeluaran Outlet",
            },
            withdrawal: {
                variant: "error" as const,
                label: "Penarikan",
            },
            deduction: {
                variant: "error" as const,
                label: "Pengurangan",
            },
            refund: {
                variant: "success" as const,
                label: "Refund",
            },
            auto_fallback: {
                variant: "info" as const,
                label: "Auto Fallback",
            },
        };

        const config = typeConfig[
            transaction.type as keyof typeof typeConfig
        ] || {
            variant: "primary" as const,
            label: transaction.typeLabel,
            icon: Receipt,
        };

        return (
            <Badge
                variant={config.variant}
                className="flex items-center gap-1.5"
            >
                {config.label}
            </Badge>
        );
    };

    const actions = (
        <Button
            variant="outline"
            onClick={() => coinTransactionService.goToIndex()}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
            Kembali
        </Button>
    );

    return (
        <PageHeader
            icon={Receipt}
            title={
                transaction.transactionNumber || `Transaksi #${transaction.id}`
            }
            subtitle={
                <div className="flex items-center gap-3 mt-2">
                    {getTypeBadge()}
                    {transaction.outlet && (
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {transaction.outlet.name}
                        </span>
                    )}
                </div>
            }
            actions={actions}
        />
    );
};

export default CoinTransactionPageHeader;
