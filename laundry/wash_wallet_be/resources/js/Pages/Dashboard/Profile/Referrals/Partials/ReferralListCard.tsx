import React from "react";
import { Card } from "@/Components/Card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { UserCheck } from "lucide-react";
import type { ProfileReferralItem } from "../../types";

interface ReferralListCardProps {
    referrals: ProfileReferralItem[];
}

export const ReferralListCard: React.FC<ReferralListCardProps> = ({ referrals }) => {
    const formatDateString = (dateString: string) => {
        try {
            return format(new Date(dateString), "dd MMM yyyy", { locale: id });
        } catch {
            return dateString;
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h3 className="text-base font-semibold text-primary mb-4">
                    Referral Terdaftar Baru
                </h3>

                {referrals.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-color rounded-lg bg-surface-muted">
                        <p className="text-xs text-secondary">Belum ada pengguna terdaftar lewat kode Anda</p>
                    </div>
                ) : (
                    <div className="divide-y divide-color">
                        {referrals.map((ref) => (
                            <div
                                key={ref.id}
                                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded bg-info-50 text-info-600 dark:bg-info-950/20 dark:text-info-400">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-primary">
                                            {ref.name}
                                        </p>
                                        <p className="text-[10px] text-secondary mt-0.5">
                                            Bergabung pada {formatDateString(ref.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
};
