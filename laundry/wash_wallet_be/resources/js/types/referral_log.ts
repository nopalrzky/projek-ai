import { Topup, User } from ".";

export interface ReferralLog {
    id: number;
    referrerId: number;
    referredUserId: number;
    topupId: number;
    commissionCoin: number;
    referrer: User;
    referredUser: User;
    topup: Topup;
    createdAt: string;
    updatedAt: string;
}
