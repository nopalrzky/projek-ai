import { Order } from "@/types";
import OverviewHeroSummary from "./OverviewHeroSummary";
import OverviewNextAction from "./OverviewNextAction";
import OverviewFinancialSummary from "./OverviewFinancialSummary";
import OverviewProductionSummary from "./OverviewProductionSummary";
import OverviewFulfillment from "./OverviewFulfillment";
import OverviewParties from "./OverviewParties";
import OverviewNotes from "./OverviewNotes";
import OverviewRecentActivity from "./OverviewRecentActivity";

interface Props {
    order: Order;
    onNavigateTab: (index: number) => void;
}

export default function OrderOverview({ order, onNavigateTab }: Props) {
    return (
        <div className="animate-fadeIn space-y-5">
            <OverviewHeroSummary order={order} />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(21rem,0.95fr)]">
                <div className="space-y-5">
                    <OverviewFinancialSummary
                        order={order}
                        onNavigateTab={onNavigateTab}
                    />
                    <OverviewProductionSummary
                        order={order}
                        onNavigateTab={onNavigateTab}
                    />
                </div>

                <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
                    <OverviewNextAction
                        order={order}
                        onNavigateTab={onNavigateTab}
                    />
                    <OverviewFulfillment order={order} />
                </aside>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <OverviewParties order={order} onNavigateTab={onNavigateTab} />
                <OverviewRecentActivity
                    order={order}
                    onNavigateTab={onNavigateTab}
                />
            </div>

            <OverviewNotes order={order} />
        </div>
    );
}
