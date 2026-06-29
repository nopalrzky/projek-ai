import { PaginationMeta, Setting } from "@/types";

export interface SettingIndexProps {
    settings: {
        data: Setting[];
        meta: PaginationMeta;
    };
    filters?: {
        search?: string;
        sortBy?: string;
        sortDirection?: string;
        page?: number;
        perPage?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface DeleteSettingModalProps {
    isOpen: boolean;
    setting?: Setting;
    onClose: () => void;
    onConfirm: (setting: Setting) => void;
    isLoading?: boolean;
}
