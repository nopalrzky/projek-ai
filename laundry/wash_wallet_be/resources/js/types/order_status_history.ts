import { Employee } from ".";

export interface OrderStatusHistory {
    id: number;
    orderId: number;
    employeeId: number | null;
    actorType: "employee" | "system" | string;
    actorLabel: string | null;
    fromStatus: string | null;
    fromStatusLabel: string | null;
    toStatus: string;
    toStatusLabel: string;
    notes: string | null;
    metadata: any;
    description: string;
    employee?: Employee;
    createdAt: string;
    formattedCreatedAt: string;
    timeAgo: string;
}
