export interface PermissionCatalogItem {
    key: string;
    label: string;
}
/**
 * Permission interface for Spatie permission system
 */
export interface Permission {
    id: number;
    name: string;
    guardName: string;
    createdAt: string;
    updatedAt: string;
}
