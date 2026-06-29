import React from "react";
import { FinanceBalanceCard } from "./Partials/FinanceBalanceCard";
import { FinanceBankAccountsCard } from "./Partials/FinanceBankAccountsCard";
import { FinanceWithdrawalCard } from "./Partials/FinanceWithdrawalCard";
import { FinanceTransactionCard } from "./Partials/FinanceTransactionCard";
import type { ProfileFinanceSummary } from "../types";

interface FinanceTabProps {
    financeSummary: ProfileFinanceSummary;
}

const FinanceTab: React.FC<FinanceTabProps> = ({ financeSummary }) => {
    return (
        <div className="space-y-6">
            <FinanceBalanceCard finance={financeSummary} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <FinanceWithdrawalCard finance={financeSummary} />
                </div>
                <div className="space-y-6">
                    <FinanceBankAccountsCard bankAccounts={financeSummary.bankAccounts} />
                    <FinanceTransactionCard transactions={financeSummary.recentTransactions} />
                </div>
            </div>
        </div>
    );
};

export default FinanceTab;
