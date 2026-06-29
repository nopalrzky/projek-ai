export interface PayrollDetail {
    id: number;
    payrollId: number;
    name: string;
    type: "earning" | "deduction";
    amount: number;
    referenceType?: string;
    referenceId?: number;
    createdAt: string;
    updatedAt: string;
    formattedAmount: string;
    typeLabel: string;
    typeColor: "success" | "error" | "default";
    referenceLabel?: string;
    isEarning: boolean;
    isDeduction: boolean;
    category: "salary" | "allowance" | "commission" | "fine" | "loan" | "other";
    categoryLabel: string;
}
