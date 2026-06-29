import { Customer, CustomerSubscription, ServicePackage } from "@/types";

export interface CustomerSubscriptionsIndexProps {
    customer: Customer;
}

export interface CustomerSubscriptionCreateProps {
    customer: Customer;
    servicePackages: ServicePackage[];
}

export interface CustomerSubscriptionShowProps {
    customer: Customer;
    customerSubscription: CustomerSubscription;
}
