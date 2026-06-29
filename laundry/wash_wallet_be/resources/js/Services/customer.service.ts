import { router } from "@inertiajs/react";

export const customerService = {
    goToIndex: () => {
        router.visit(route("customers.index"));
    },

    goToCreate: () => {
        router.visit(route("customers.create"));
    },

    goToEdit: (customerId: number) => {
        router.visit(route("customers.edit", customerId));
    },

    goToView: (customerId: number) => {
        router.visit(route("customers.show", customerId));
    },
    async getAll(outletId: number): Promise<any[]> {
        try {
            const params = new URLSearchParams({
                outletId: String(outletId),
            });
            const response = await fetch(
                `${route("api.customers.index")}?${params.toString()}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                },
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success) {
                return result.data || [];
            } else {
                throw new Error(result.message || "Failed to fetch customers");
            }
        } catch (error) {
            console.error("Failed to get customers by outlet:", error);
            throw error;
        }
    },

    goToCreateCustomerSubscription: (customerId: number) => {
        router.visit(
            route("customers.customer-subscriptions.create", customerId),
        );
    },

    goToViewCustomerSubscription: (
        customerId: number,
        subscriptionId: number,
    ) => {
        router.visit(
            route("customers.customer-subscriptions.show", {
                customerId: customerId,
                customerSubscriptionId: subscriptionId,
            }),
        );
    },

    goToEditCustomerSubscription: (
        customerId: number,
        subscriptionId: number,
    ) => {
        router.visit(
            route("customers.customer-subscriptions.edit", {
                customer: customerId,
                subscription: subscriptionId,
            }),
        );
    },

    goToCreateMembershipContract: (customerId: number) => {
        router.visit(
            route("customers.membership-contracts.create", customerId),
        );
    },

    goToViewMembershipContract: (membershipContractId: number) => {
        router.visit(route("membership-contracts.show", membershipContractId));
    },

    goToEditMembershipContract: (
        customerId: number,
        membershipContractId: number,
    ) => {
        router.visit(
            route("customers.membership-contracts.edit", [
                customerId,
                membershipContractId,
            ]),
        );
    },

    goToViewOrder: (customerId: number, orderId: number) => {
        router.visit(
            route("customers.orders.show", {
                customer: customerId,
                order: orderId,
            }),
        );
    },
};
