import { EmployeeProcess } from ".";

export interface EmployeeProcessCommission {
    id: number;
    employeeProcessId: number;
    commissionType?: "per_item" | "per_kg" | "percentage" | "flat";
    commissionValue?: number;
    rateType: "percentage" | "fixed";
    rateValue: number;
    hasTarget: boolean;
    targetThreshold: number | null;
    bonusAmount: number | null;
    isActive: boolean;
    effectiveDate: string | null;
    rules?: string | null;
    employeeProcess?: EmployeeProcess;
    createdAt: string;
    updatedAt: string;
}
