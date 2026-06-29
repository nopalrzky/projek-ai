import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function resolveStorageUrl(path?: string | null): string | null {
    if (!path) return null;

    if (
        /^(https?:)?\/\//.test(path) ||
        path.startsWith("data:") ||
        path.startsWith("blob:") ||
        path.startsWith("/")
    ) {
        return path;
    }

    return `/storage/${path.replace(/^\/+/, "")}`;
}

/**
 * Format date string to localized Indonesian format
 * @param dateString - Date string or Date object
 * @param format - Optional format pattern
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string | Date | null | undefined,
    format?:
        | "DD MMMM YYYY"
        | "DD/MM/YYYY"
        | "MMMM YYYY"
        | "YYYY-MM-DD"
        | "short"
        | "long",
): string => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "-";

        switch (format) {
            case "DD/MM/YYYY":
                return date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });

            case "YYYY-MM-DD":
                return date.toISOString().split("T")[0];

            case "MMMM YYYY":
                return date.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                });
            case "short":
                return date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });

            case "long":
            case "DD MMMM YYYY":
                return date.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                });

            default:
                return date.toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
        }
    } catch (error) {
        console.error("Error formatting date:", error);
        return "-";
    }
};

/**
 * Format date and time string to localized Indonesian format
 * @param dateString - Date string or Date object
 * @param format - Optional format pattern
 * @returns Formatted date time string
 */
export const formatDateTime = (
    dateString: string | Date | null | undefined,
    format?: "short" | "long" | "time-only",
): string => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) return "-";

        switch (format) {
            case "short":
                return date.toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });

            case "time-only":
                return date.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                });

            case "long":
            default:
                return date.toLocaleString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                });
        }
    } catch (error) {
        console.error("Error formatting datetime:", error);
        return "-";
    }
};

/**
 * Format time string (HH:mm:ss or HH:mm)
 * @param time - Time string
 * @param includeSeconds - Include seconds in output
 * @returns Formatted time string
 */
export function formatTime(
    time: string | null | undefined,
    includeSeconds: boolean = false,
): string {
    if (!time) return "-";

    try {
        // Handle different time formats
        const parts = time.split(":");

        if (parts.length < 2) return time;

        const hours = parts[0].padStart(2, "0");
        const minutes = parts[1].padStart(2, "0");

        if (includeSeconds && parts.length >= 3) {
            const seconds = parts[2].padStart(2, "0");
            return `${hours}:${minutes}:${seconds}`;
        }

        return `${hours}:${minutes}`;
    } catch (error) {
        console.error("Error formatting time:", error);
        return time;
    }
}

/**
 * Get relative time string (e.g., "2 jam yang lalu")
 * @param dateString - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (
    dateString: string | Date | null | undefined,
): string => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) return "-";

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);

        if (diffSec < 60) {
            return "Baru saja";
        } else if (diffMin < 60) {
            return `${diffMin} menit yang lalu`;
        } else if (diffHour < 24) {
            return `${diffHour} jam yang lalu`;
        } else if (diffDay < 7) {
            return `${diffDay} hari yang lalu`;
        } else if (diffWeek < 4) {
            return `${diffWeek} minggu yang lalu`;
        } else if (diffMonth < 12) {
            return `${diffMonth} bulan yang lalu`;
        } else {
            return `${diffYear} tahun yang lalu`;
        }
    } catch (error) {
        console.error("Error formatting relative time:", error);
        return "-";
    }
};

/**
 * Get day name from date
 * @param dateString - Date string or Date object
 * @param format - Format: "long" (Senin) or "short" (Sen)
 * @returns Day name
 */
export const formatDayName = (
    dateString: string | Date | null | undefined,
    format: "long" | "short" = "long",
): string => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) return "-";

        return date.toLocaleDateString("id-ID", {
            weekday: format,
        });
    } catch (error) {
        console.error("Error formatting day name:", error);
        return "-";
    }
};

/**
 * Get month name from date
 * @param dateString - Date string or Date object
 * @param format - Format: "long" (Januari) or "short" (Jan)
 * @returns Month name
 */
export const formatMonthName = (
    dateString: string | Date | null | undefined,
    format: "long" | "short" = "long",
): string => {
    if (!dateString) return "-";

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) return "-";

        return date.toLocaleDateString("id-ID", {
            month: format,
        });
    } catch (error) {
        console.error("Error formatting month name:", error);
        return "-";
    }
};

/**
 * Parse date string to Date object
 * @param dateString - Date string in various formats
 * @returns Date object or null
 */
export const parseDate = (
    dateString: string | null | undefined,
): Date | null => {
    if (!dateString) return null;

    try {
        const date = new Date(dateString);

        if (isNaN(date.getTime())) return null;

        return date;
    } catch (error) {
        console.error("Error parsing date:", error);
        return null;
    }
};

/**
 * Check if date is today
 * @param dateString - Date string or Date object
 * @returns Boolean
 */
export const isToday = (
    dateString: string | Date | null | undefined,
): boolean => {
    if (!dateString) return false;

    try {
        const date = new Date(dateString);
        const today = new Date();

        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    } catch (error) {
        return false;
    }
};

/**
 * Check if date is yesterday
 * @param dateString - Date string or Date object
 * @returns Boolean
 */
export const isYesterday = (
    dateString: string | Date | null | undefined,
): boolean => {
    if (!dateString) return false;

    try {
        const date = new Date(dateString);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        return (
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear()
        );
    } catch (error) {
        return false;
    }
};

/**
 * Get date range string
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export const formatDateRange = (
    startDate: string | Date | null | undefined,
    endDate: string | Date | null | undefined,
): string => {
    if (!startDate && !endDate) return "-";

    if (!startDate) return `Sampai ${formatDate(endDate)}`;
    if (!endDate) return `Dari ${formatDate(startDate)}`;

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";

        // Same day
        if (
            start.getDate() === end.getDate() &&
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            return formatDate(startDate);
        }

        // Same month and year
        if (
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear()
        ) {
            return `${start.getDate()} - ${formatDate(endDate)}`;
        }

        // Same year
        if (start.getFullYear() === end.getFullYear()) {
            return `${formatDate(startDate, "short")} - ${formatDate(endDate)}`;
        }

        // Different years
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    } catch (error) {
        console.error("Error formatting date range:", error);
        return "-";
    }
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const getGenderIcon = (gender: string | null) => {
    switch (gender?.toLowerCase()) {
        case "male":
        case "laki-laki":
            return "👨";
        case "female":
        case "perempuan":
            return "👩";
        default:
            return "👤";
    }
};

export const getGenderLabel = (gender: string | null) => {
    switch (gender?.toLowerCase()) {
        case "male":
        case "laki-laki":
            return "Laki-laki";
        case "female":
        case "perempuan":
            return "Perempuan";
        default:
            return "Tidak Diketahui";
    }
};
