import React from "react";
import { Card } from "@/Components/Card";
import { Users, Award } from "lucide-react";
import type { ProfileReferralSummary } from "../../types";

interface ReferralStatsCardProps {
    referral: ProfileReferralSummary;
}

export const ReferralStatsCard: React.FC<ReferralStatsCardProps> = ({ referral }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-info-50 text-info-600 dark:bg-info-950/20 dark:text-info-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary">
                                Total Pengguna Terdaftar
                            </p>
                            <p className="text-2xl font-bold text-primary mt-1">
                                {referral.totalReferrals.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-secondary">
                                Total Komisi Koin Didapat
                            </p>
                            <p className="text-2xl font-bold text-primary mt-1">
                                {referral.totalCommission.toLocaleString("id-ID")} Koin
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
