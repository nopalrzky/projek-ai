import {
    BaseFilters,
    BaseSortOptions,
    Employee,
    LaundryServiceProcess,
    OrderItem,
} from ".";

export interface OrderItemProcess {
    id: number;
    orderItemId: number;
    serviceProcessId: number;
    employeeId?: number | null;
    qtyProcessed: number;
    startedAt?: string | null;
    completedAt?: string | null;
    evidenceAttachment?: string | null;
    createdAt: string;
    updatedAt: string;
    orderItem?: OrderItem;
    laundryServiceProcess?: LaundryServiceProcess;
    employee?: Employee;
    evidenceUrl?: string | null;
    status?: "pending" | "in_progress" | "completed";
    processingDuration?: number | null;
    commissionAmount?: number | null;
    completionPercentage?: number;
}

/**
 * Order item process filter interface
 */
export interface OrderItemProcessFilters extends BaseFilters {
    orderItemId?: number;
    laundryServiceProcessId?: number;
    employeeId?: number;
    status?: "pending" | "in_progress" | "completed";
    hasEvidence?: boolean;
    startDate?: string;
    endDate?: string;
    startedBetween?: {
        start: string;
        end: string;
    };
    completedBetween?: {
        start: string;
        end: string;
    };
    withRelations?: boolean;
}

/**
 * Order item process sort options
 */
export interface OrderItemProcessSortOptions extends BaseSortOptions {
    column:
        | "qtyProcessed"
        | "startedAt"
        | "completedAt"
        | "createdAt"
        | "updatedAt"
        | "orderItemId"
        | "serviceProcessId"
        | "employeeId"
        | "sequence";
}

/**
 * Order item process form data
 */
export interface OrderItemProcessFormData {
    orderItemId: number;
    serviceProcessId: number;
    employeeId?: number | null;
    qtyProcessed?: number;
    startedAt?: string | null;
    completedAt?: string | null;
    evidenceAttachment?: File | string | null;
}

/**
 * Order item process statistics
 */
export interface OrderItemProcessStatistics {
    totalProcesses: number;
    completed: number;
    inProgress: number;
    pending: number;
    withEvidence: number;
    withoutEvidence: number;
    averageProcessingTime: number;
    totalQtyProcessed: number;
    totalCommission: number;
}

/**
 * Employee performance data
 */
export interface EmployeePerformance {
    employeeId: number;
    employeeName: string;
    totalProcessesCompleted: number;
    totalQtyProcessed: number;
    totalCommission: number;
    averageProcessingTime: number;
    completionRate: number;
    processes: OrderItemProcess[];
}

/**
 * Process timeline item
 */
export interface ProcessTimelineItem {
    id: number;
    processName: string;
    sequence: number;
    status: "pending" | "in_progress" | "completed";
    startedAt?: string | null;
    completedAt?: string | null;
    employeeName?: string | null;
    qtyProcessed: number;
    evidenceUrl?: string | null;
}
