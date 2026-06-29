import {
    Attendance,
    BaseFilters,
    EmployeePosition,
    EmployeeProcess,
    EmployeeSalary,
    Expense,
    FineLog,
    Loan,
    Order,
    Outlet,
    Payroll,
} from ".";

export interface Employee {
    id: number;
    outletId: number;
    name: string;
    username: string;
    email?: string | null;
    phone?: string;
    gender: "male" | "female";
    dateOfBirth?: string | null;
    avatar?: string | null;
    address?: string | null;
    startDate: string;
    isActive: boolean;
    cutoffDays: number;
    age?: number | null;
    lastLoginAt?: string | null;
    attendances: Attendance[];
    employeePositions?: EmployeePosition[] | null;
    employeeProcesses?: EmployeeProcess[] | null;
    employeeSalaries: EmployeeSalary[];
    expenses?: Expense[] | null;
    fineLogs: FineLog[];
    loans?: Loan[] | null;
    outlet: Outlet;
    orders?: Order[] | null;
    payrolls: Payroll[];
    employeeProcessesCount?: number;
    employeePositionsCount?: number;
    employeeSalariesCount?: number;
    isEligibleForProduction?: boolean;
    fineLogsCount?: number;
    ordersCount?: number;
    loansCount?: number;
    payrollsCount?: number;
    finesCount?: number;
    expensesCount?: number;
    attendancesCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeCreateFormData {
    outletId: number | undefined;
    name: string;
    username: string;
    password: string;
    passwordConfirmation: string;
    avatar?: File | null;
    phone: string;
    address: string;
    dateOfBirth?: string;
    gender: "male" | "female" | "";
    startDate: string;
    isActive?: boolean;
    cutoffDays: number;
    positionIds?: number[];
    employeeSalaries?: EmployeeSalaryFormItem[];
    employeeProcesses?: EmployeeProcessFormItem[];
    employeeProcessCommissions?: EmployeeProcessCommissionFormItem[];
    [key: string]: any;
}

export interface EmployeeEditFormData {
    name: string;
    username: string;
    avatar?: File | null;
    phone: string;
    address: string;
    gender: "male" | "female" | "";
    startDate: string;
    isActive: boolean;
    cutoffDays: number;
    positionIds?: number[];
    employeeSalaries?: EmployeeSalaryFormItem[];
    employeeProcessCommissions?: EmployeeProcessCommissionFormItem[];
    [key: string]: any;
}

export interface EmployeeSalaryFormItem {
    salaryId: number | null;
    amount: number;
    [key: string]: any;
}

export interface EmployeeProcessFormItem {
    processId: number;
    isActive: boolean;
    [key: string]: any;
}

export interface EmployeeProcessCommissionFormItem {
    processId: number | null;
    commissionType: "per_item" | "per_kg" | "percentage" | "flat";
    commissionValue: number;
    hasTarget: boolean;
    targetThreshold: number;
    bonusAmount: number;
    effectiveDate?: string | null;
    [key: string]: any;
}

export interface EmployeeFilters extends BaseFilters {
    outletId?: number;
    positionId?: number;
    isActive?: "true" | "false";
    gender?: "male" | "female";
}

export interface EmployeeSalaryFormData {
    amount: number;
    salaryId: number;
    [key: string]: any;
}

export interface EmployeePositionFormData {
    positionId: number;
    isActive: boolean;
}

export interface EmployeeProcessCommissionFormData {
    processId: number;
    commissionType: "per_item" | "per_kg" | "percentage" | "flat";
    commissionValue: number;
    hasTarget: boolean;
    targetThreshold?: number;
    bonusAmount?: number;
    effectiveDate?: string | null;
    isActive: boolean;
    [key: string]: any;
}

export interface EmployeeProcessCreateFormData {
    processId: number;
    hasCommission: boolean;
    commissionType: "per_item" | "per_kg" | "percentage" | "flat";
    commissionValue: number;
    hasTarget: boolean;
    targetThreshold: number;
    bonusAmount: number;
}

export interface EmployeeLoanFormData {
    sourceAccountId: number | "";
    amount: number | "";
    installmentAmount: number | "";
    loanDate: string;
    dueDate?: string;
    status: "ongoing" | "paid" | "bad_debt";
    note?: string;
    [key: string]: any;
}
