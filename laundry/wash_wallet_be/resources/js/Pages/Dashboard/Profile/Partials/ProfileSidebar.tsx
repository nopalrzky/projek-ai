import React from "react";
import { Avatar } from "@/Components/Avatar";
import { Card } from "@/Components/Card";
import { Building2, Users, Coins, Wallet } from "lucide-react";
import type { ProfileUser, ProfileOverview } from "../types";

interface ProfileSidebarProps {
    user: ProfileUser;
    overview: ProfileOverview;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user, overview }) => {
    const stats = [
        {
            icon: Building2,
            label: "Outlets",
            value: overview.totalOutlets,
            colorClass: "text-info-600 dark:text-info-400",
        },
        {
            icon: Users,
            label: "Referrals",
            value: overview.totalReferrals,
            colorClass: "text-secondary-600 dark:text-secondary-400",
        },
        {
            icon: Coins,
            label: "Coins",
            value: `${user.coinBalance?.toLocaleString("id-ID") || 0} Koin`,
            colorClass: "text-warning-600 dark:text-warning-400",
        },
        {
            icon: Wallet,
            label: "Wallet",
            value: `Rp ${user.walletBalance?.toLocaleString("id-ID") || 0}`,
            colorClass: "text-success-600 dark:text-success-400",
        },
    ];

    return (
        <Card className="sticky top-6">
            <div className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar
                        src={user.avatar || undefined}
                        alt={user.name}
                        name={user.name}
                        size="xl"
                    />

                    <div className="w-full">
                        <h3 className="font-semibold text-lg text-primary">
                            {user.name}
                        </h3>
                        <p className="text-sm text-secondary">
                            @{user.username}
                        </p>
                        {user.referralCode && (
                            <p className="text-xs text-tertiary mt-1">
                                Kode Referral: {user.referralCode}
                            </p>
                        )}
                    </div>

                    <div className="w-full pt-4 border-t border-color space-y-3">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="flex items-center justify-between p-3 bg-surface-muted rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <stat.icon
                                        className={`w-4 h-4 ${stat.colorClass}`}
                                    />
                                    <span className="text-sm text-secondary">
                                        {stat.label}
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-primary">
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ProfileSidebar;
