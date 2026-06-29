import { Loan, Account, Payroll } from ".";

export interface LoanLog {
    id: number;
    loanId: number;
    type: "disbursement" | "repayment";
    source: "cash" | "transfer" | "payroll";
    paymentMethod?: "cash" | "transfer" | "salary_deduction";
    payrollId?: number | null;
    depositAccountId?: number | null;
    amount: number;
    paymentDate: string;
    note?: string;
    loan?: Loan;
    payroll?: Payroll;
    depositAccount?: Account;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}
