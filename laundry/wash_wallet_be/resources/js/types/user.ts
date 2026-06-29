import { ReferralLog, Outlet, Permission } from ".";
import { Role } from "./role";

/**
 * User status constants
 */
export type UserStatus = "active" | "inactive" | "suspended" | "pending";

/**
 * User role constants
 */
export type UserRoleType = "owner" | "super_admin";

/**
 * Base User interface
 */
export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    status: UserStatus;
    avatar?: string | null;
    referralCode: string;
    referredBy?: number | null;
    coinBalance: number;
    walletBalance: number;
    bankAccountName?: string | null;
    bankAccountNumber?: string | null;
    bankName?: string | null;
    lastLoginAt?: string | null;
    createdAt: string;
    updatedAt: string;
    totalCommission?: number;
    deletedAt?: string | null;
    roles?: Role[];
    permissions?: Permission[];
    roleNames?: string[];
    permissionNames?: string[];
    outlets?: Outlet[];
    referrals?: User[];
    referrer?: User | null;
    commissionLogs: ReferralLog[];
    outletsCount?: number;
    referralsCount?: number;
    isOwner?: boolean;
}
