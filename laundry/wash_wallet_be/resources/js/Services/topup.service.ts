import { router } from "@inertiajs/react";

export const topupService = {
    goToIndex: () => {
        router.visit(route("topups.index"));
    },

    goToCreate: () => {
        router.visit(route("topups.create"));
    },

    goToView: (id: number) => {
        router.visit(route("topups.show", id));
    },

    show: (id: number) => {
        router.visit(route("topups.show", id));
    },

    goToOutletTopups: (outletId: number) => {
        router.visit(route("outlets.topups.index", outletId));
    },
};
