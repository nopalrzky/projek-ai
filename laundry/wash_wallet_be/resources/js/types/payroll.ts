import { Account, BaseFilters, Employee, Outlet, PayrollDetail } from ".";

export interface Payroll {
    id: number;
    outletId: number;
    employeeId: number;
    bankAccountId: number;
    month: number;
    year: number;
    startDate?: string;
    endDate?: string;
    paymentDate: string;
    transactionNumber: string;
    paymentMethod: "transfer" | "cash" | "check";
    type: "single" | "bulk";
    baseSalary: number;
    totalAllowance: number;
    totalCommission: number;
    totalOvertime: number;
    totalLoanDeduction: number;
    totalFine: number;
    netSalary: number;
    status: "draft" | "paid" | "cancelled";
    note?: string;
    attachment?: string;
    attachmentUrl?: string;
    hasAttachment: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    grossSalary: number;
    totalDeduction: number;
    formattedBaseSalary: string;
    formattedGrossSalary: string;
    formattedTotalDeduction: string;
    formattedNetSalary: string;
    formattedPaymentDate: string;
    periodLabel: string;
    statusLabel: string;
    statusColor: "warning" | "success" | "error" | "default";
    paymentMethodLabel: string;
    typeLabel: string;
    outlet?: Outlet;
    employee?: Employee;
    bankAccount?: Account;
    payrollDetails?: PayrollDetail[];
    workLogs?: WorkLogSummary[];
    fineLogs?: FineLogSummary[];
    outletName: string;
    employeeName: string;
    employeeCode: string;
    bankAccountName: string;
    isDraft: boolean;
    isPaid: boolean;
    isCancelled: boolean;
    canBeUpdated: boolean;
    canBeDeleted: boolean;
}

export interface WorkLogSummary {
    id: number;
    date: string;
    description?: string;
    amount: number;
    formattedAmount: string;
}

export interface FineLogSummary {
    id: number;
    date: string;
    fineName: string;
    fine?: {
        id: number;
        name: string;
    };
    description?: string;
    reason?: string;
    amount: number;
    formattedAmount: string;
}

export interface CommissionDetailSummary {
    id: number;
    date: string;
    description?: string;
    amount: number;
}

export interface SalaryBreakdownItem {
    id: number;
    name: string;
    type: "monthly";
    amount: number;
    calculatedAmount: number;
    description?: string;
}

export interface AllowanceBreakdownItem {
    id: number;
    name: string;
    type: "daily";
    amount: number;
    workDays: number;
    calculatedAmount: number;
    description?: string;
}

export interface PayrollItemFormData {
    employeeId: number;
    employeeName: string;
    employeeCode: string;
    baseSalary: number;
    totalAllowance: number;
    totalCommission: number;
    totalOvertimeAllowance: number;
    grossSalary: number;
    totalFine: number;
    totalLoanDeduction: number;
    totalDeduction: number;
    netSalary: number;
    loanId?: number;
    loanDeductionAmount: number;
    remainingLoanBalance: number;
    commissionLogIds: number[];
    commissionDetails: CommissionDetailSummary[];
    workLogs?: WorkLogSummary[];
    fineLogIds: number[];
    fineDetails: FineLogSummary[];
    salaryBreakdown?: SalaryBreakdownItem[];
    allowanceBreakdown?: AllowanceBreakdownItem[];
    isAlreadyPaid?: boolean;
    existingPayrollId?: number;
    existingPayrollStatus?: "draft" | "paid";
}

export interface PayrollPreviewItem extends PayrollItemFormData {
    salaryBreakdown: SalaryBreakdownItem[];
    allowanceBreakdown: AllowanceBreakdownItem[];
}

export interface PayrollSummary {
    employee_count: number;
    total_gross_salary: number;
    total_net_salary: number;
    total_deduction: number;
    total_commission: number;
    total_fine: number;
    total_loan_deduction: number;
}

export interface PayrollFormData {
    outletId: number | "";
    bankAccountId: number | "";
    paymentMethod: "transfer" | "cash" | "check" | "";
    paymentDate: string;
    month: number | "";
    year: number | "";
    note?: string;
    attachment?: File | null;
    items: PayrollItemFormData[];
}

export interface PayrollPreviewRequest {
    outletId: number;
    employeeId?: number;
    month: number;
    year: number;
}

export interface PayrollPreviewResponse {
    type: "single" | "bulk";
    outlet: Outlet;
    period: {
        month: string;
        year: string;
    };
    items: PayrollPreviewItem[];
    summary: PayrollSummary;
}

export interface PayrollPreviewData {
    type: "single" | "bulk";
    outlet: Outlet;
    period: {
        month: string;
        year: string;
    };
    items: PayrollPreviewItem[];
    summary: PayrollSummary;
}

export interface PayrollFilters extends BaseFilters {
    outletId?: number;
    employeeId?: number;
    status?: "draft" | "paid" | "cancelled" | "";
    type?: "single" | "bulk" | "";
    paymentMethod?: "transfer" | "cash" | "check" | "";
    month?: number;
    year?: number;
}

export interface PayrollCreateFormData {
    outletId: number | "";
    mode: "single" | "bulk";
    employeeId?: number | "";
    month: number | "";
    year: number | "";
    paymentDate: string;
    paymentMethod: "transfer" | "cash" | "check" | "";
    bankAccountId: number | "";
    note?: string;
    attachment?: File | null;
}

export interface PayrollStorePayload {
    outletId: number;
    bankAccountId: number;
    paymentMethod: "transfer" | "cash" | "check";
    paymentDate: string;
    month: number;
    year: number;
    note?: string;
    attachment?: File | null;
    items: {
        employeeId: number;
        baseSalary: number;
        totalAllowance: number;
        totalCommission: number;
        totalOvertimeAllowance: number;
        totalFine: number;
        totalLoanDeduction: number;
        netSalary: number;
        loanId?: number;
        loanDeductionAmount: number;
        commissionLogIds: number[];
        fineLogIds: number[];
    }[];
}
