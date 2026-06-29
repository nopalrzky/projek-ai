import { Account, BaseFilters, Employee, LoanLog, Outlet } from ".";

export interface Loan {
    id: number;
    employeeId: number;
    outletId: number;
    sourceAccountId: number;
    amount: number;
    remainingAmount: number;
    paidAmount: number;
    installmentAmount: number;
    totalInstallments: number;
    remainingInstallments: number;
    loanDate: string;
    dueDate?: string;
    status: "ongoing" | "paid" | "bad_debt";
    repaymentType: "full" | "installment";
    repaymentTypeLabel?: string;
    statusLabel?: string;
    installmentPeriod: number;
    isPaid: boolean;
    progressPercentage: number;
    note?: string;
    employee?: Employee;
    outlet?: Outlet;
    sourceAccount?: Account;
    loanLogs?: LoanLog[];
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface LoanFormData {
    sourceAccountId: number | "";
    outletId: number | "";
    employeeId: number | "";
    amount: number;
    repaymentType: "full" | "installment" | "";
    installmentMode: "auto" | "custom" | "";
    installmentAmount: number | null;
    installmentPeriod: number | null;
    installmentSchedule: Array<{
        month: number;
        year: number;
        amount: number;
    }>;
    loanDate: string;
    dueDate?: string;
    note?: string;
}

export interface LoanFilters extends BaseFilters {
    employeeId?: number;
    outletId?: number;
    status?: "ongoing" | "paid" | "bad_debt" | "";
    repaymentType?: "full" | "installment" | "";
    loanDateFrom?: string;
    loanDateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    minRemainingAmount?: number;
    maxRemainingAmount?: number;
    minInstallmentAmount?: number;
    maxInstallmentAmount?: number;
}
