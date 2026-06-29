export interface Feature {
    id: number;
    key: string;
    name: string;
    description: string | null;
    coinPrice: number;
    isPaid: boolean;
    isActive: boolean;
    sortOrder: number;
    durationDays: number | null;
    createdAt: string;
    updatedAt: string;
}

export interface FeatureFilters {
    search?: string;
    isActive?: boolean | null;
    page?: number;
    perPage?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
}

export interface FeatureFormData {
    name: string;
    description?: string | null;
    coinPrice: number;
    isPaid: boolean;
    isActive: boolean;
    sortOrder: number;
    durationDays?: number | null;
}
