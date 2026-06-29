import { ImportError, User } from ".";

export interface ImportLog {
    id: number;
    userId: number;
    type: string;
    fileName: string;
    filePath: string;
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    totalRows: number;
    successCount: number;
    errorCount: number;
    context: Record<string, any>;
    errorMessage: string | null;
    startedAt: string | null;
    completedAt: string | null;
    createdAt: string;
    updatedAt: string;

    // Computed
    progressPercentage: number;
    durationInSeconds: number | null;
    hasErrors: boolean;
    isCompleted: boolean;
    isFailed: boolean;
    isProcessing: boolean;
    isPending: boolean;

    // Formatted
    formattedStatus: string;
    formattedDuration: string | null;
    formattedProgress: string;

    // Relationships
    user?: User;
    errors?: ImportError[];
    errorsCount?: number;
}
