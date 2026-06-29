import { router } from "@inertiajs/react";

export const customerSubscriptionService = {
    goToView: (id: number) => {
        router.get(route("customer-subscriptions.show", id));
    },

    goToEdit: (id: number) => {
        router.get(route("customer-subscriptions.edit", id));
    },

    goToIndex: () => {
        router.get(route("customer-subscriptions.index"));
    },

    goToCreate: () => {
        router.get(route("customer-subscriptions.create"));
    },
};
