import { router } from "@inertiajs/react";

export const membershipContractService = {
    goToIndex(): void {
        router.get(route("membership-contracts.index"));
    },
    /**
     * Navigate to create membership contract page
     */
    goToCreate(): void {
        router.get(route("membership-contracts.create"));
    },

    /**
     * Navigate to membership contract detail page
     */
    goToView(id: number): void {
        router.get(route("membership-contracts.show", id));
    },
};

export default membershipContractService;
