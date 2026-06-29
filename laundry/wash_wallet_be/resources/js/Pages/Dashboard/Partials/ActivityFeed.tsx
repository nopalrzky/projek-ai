import React from "react";
import { Link } from "@inertiajs/react";
import { Activity, ShoppingBag, Wallet, Download } from "lucide-react";
import { OwnerDashboardActivityItem } from "../types";
import dayjs from "dayjs";

interface ActivityFeedProps {
    activities: OwnerDashboardActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
    return (
        <div className="card">
            <div className="card-header border-b border-[var(--color-border)] flex justify-between items-center">
                <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                    <Activity className="w-5 h-5 text-[var(--color-primary-500)]" />
                    Aktivitas Terbaru
                </h3>
            </div>
            
            <div className="card-body p-6">
                {activities.length > 0 ? (
                    <div className="relative border-l-2 border-[var(--color-border)] ml-3 space-y-6">
                        {activities.map((activity) => {
                            let Icon = Activity;
                            let bgColor = "bg-[var(--color-gray-100)]";
                            let iconColor = "text-[var(--color-gray-600)]";

                            if (activity.type === 'order') {
                                Icon = ShoppingBag;
                                bgColor = "bg-[var(--color-primary-100)]";
                                iconColor = "text-[var(--color-primary-600)]";
                            } else if (activity.type === 'wallet') {
                                Icon = Wallet;
                                bgColor = "bg-[var(--color-info-100)]";
                                iconColor = "text-[var(--color-info-600)]";
                            } else if (activity.type === 'withdrawal') {
                                Icon = Download;
                                bgColor = "bg-[var(--color-success-100)]";
                                iconColor = "text-[var(--color-success-600)]";
                            }

                            return (
                                <div key={activity.id} className="relative pl-6">
                                    <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-[3px] border-[var(--color-surface)] flex items-center justify-center ${bgColor}`}>
                                        <Icon className={`w-4 h-4 ${iconColor}`} />
                                    </div>
                                    <div className="bg-white dark:bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                                                {activity.title}
                                            </h4>
                                            <span className="text-xs text-[var(--color-text-tertiary)] shrink-0 ml-2">
                                                {dayjs(activity.timestamp).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                                            {activity.description}
                                        </p>
                                        {activity.href && (
                                            <Link href={activity.href} className="text-xs font-medium text-[var(--color-primary-600)] hover:underline inline-flex items-center">
                                                Lihat Detail
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-[var(--color-text-tertiary)] text-sm">
                        Belum ada aktivitas tercatat.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;
