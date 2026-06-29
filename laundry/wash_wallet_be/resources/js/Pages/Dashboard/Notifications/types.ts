import { AppNotification, PaginationMeta } from "@/types";

export interface NotificationMetaRaw {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface NotificationFilters {
    search?: string;
    filter?: string;
    type?: string;
    page?: number;
    perPage?: number;
}

export interface NotificationsIndexProps {
    notifications: {
        data: AppNotification[];
        meta: NotificationMetaRaw | null;
    };
    unread_count: number;
    filters: NotificationFilters;
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface NotificationTableData {
    data: AppNotification[];
    meta: PaginationMeta;
}
