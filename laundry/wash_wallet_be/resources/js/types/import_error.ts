import { ImportLog } from ".";

export interface ImportError {
    id: number;
    importLogId: number;
    rowNumber: number;
    data: Record<string, any>;
    errors: string[];
    createdAt: string;
    updatedAt: string;

    // Computed
    formattedErrors: string;
    hasMultipleErrors: boolean;
    errorCount: number;

    // Formatted
    formattedRowNumber: string;
    firstError: string | null;
    errorSummary: string;

    // Relationships
    importLog?: ImportLog;
}
