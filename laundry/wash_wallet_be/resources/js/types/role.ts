import { Permission } from "./permission";

/**
 * Role interface for Spatie role system
 */
export interface Role {
    id: number;
    name: string;
    guardName: string;
    createdAt: string;
    updatedAt: string;
    permissions?: Permission[];
}
