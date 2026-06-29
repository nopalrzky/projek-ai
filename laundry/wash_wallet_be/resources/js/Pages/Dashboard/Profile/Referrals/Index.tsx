import React from "react";
import { ReferralCodeCard } from "./Partials/ReferralCodeCard";
import { ReferralStatsCard } from "./Partials/ReferralStatsCard";
import { ReferralListCard } from "./Partials/ReferralListCard";
import type { ProfileReferralSummary } from "../types";

interface ReferralsTabProps {
    referralSummary: ProfileReferralSummary;
}

const ReferralsTab: React.FC<ReferralsTabProps> = ({ referralSummary }) => {
    return (
        <div className="space-y-6">
            <ReferralCodeCard referralCode={referralSummary.referralCode} />
            <ReferralStatsCard referral={referralSummary} />
            <ReferralListCard referrals={referralSummary.recentReferrals} />
        </div>
    );
};

export default ReferralsTab;
