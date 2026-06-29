import { Badge } from "@/Components/Badge";
import PageHeader from "@/Components/Page/PageHeader";
import { formatCurrency } from "@/lib/utils";
import { CustomerSubscription } from "@/types";
import { CreditCard } from "lucide-react";

type CustomerSubscriptionPageHeaderProps = {
    subscription: CustomerSubscription;
};

function CustomerSubscriptionPageHeader({
    subscription,
}: CustomerSubscriptionPageHeaderProps) {
    return (
        <PageHeader
            title={subscription.subscriptionCode || "Detail Deposit"}
            subtitle={`Paket ${subscription.servicePackage?.name || "-"} untuk ${subscription.customer?.name || "Pelanggan"}`}
            icon={CreditCard}
        >
            <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={subscription.statusBadgeVariant || "secondary"}>
                    {subscription.statusLabel || subscription.status}
                </Badge>
                <Badge variant="info">
                    {subscription.customer?.name || "-"}
                </Badge>
                <Badge variant="success">
                    {formatCurrency(subscription.pricePaid || 0)}
                </Badge>
            </div>
        </PageHeader>
    );
}

export default CustomerSubscriptionPageHeader;
