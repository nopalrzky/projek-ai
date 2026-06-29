import { BaseFilters, Employee, Fine, Outlet, Payroll } from ".";

export interface FineLog {
    id: number;
    employeeId: number;
    fineId: number;
    outletId: number;
    payrollId: number | null;
    date: string;
    amount: number;
    reason: string | null;
    attachment: string | null;
    status: "unpaid" | "paid" | "cancelled";
    attachmentUrl: string | null;
    hasAttachment: boolean;
    attachmentSize: string | null;
    attachmentExtension: string | null;
    isAttachmentImage: boolean;
    employee: Employee;
    fine: Fine;
    outlet: Outlet;
    payroll: Payroll | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isPaid: boolean;
    isUnpaid: boolean;
    isCancelled: boolean;
    canBeUpdated: boolean;
    canBeDeleted: boolean;
}

export interface FineLogFormData {
    employeeId: number | "";
    fineId: number | "";
    outletId: number | "";
    date: string;
    amount: number | "";
    reason?: string;
    attachment?: File | null;
}

export interface FineLogFilters extends BaseFilters {
    search?: string;
    employeeId?: number;
    outletId?: number;
    fineId?: number;
    status?: "unpaid" | "paid" | "cancelled";
    dateFrom?: string;
    dateTo?: string;
    minAmount?: number;
    maxAmount?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
}

export interface UnpaidFinesResponse {
    fines: FineLog[];
    total: number;
    count: number;
}
