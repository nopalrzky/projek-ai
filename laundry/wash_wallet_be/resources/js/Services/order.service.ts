import { router } from "@inertiajs/react";

export const orderService = {
    goToIndex: () => {
        router.visit(route("orders.index"));
    },

    goToView: (orderId: number) => {
        router.visit(route("orders.show", orderId));
    },
};

export default orderService;
