import { router } from "@inertiajs/react";

export const expenseService = {
    goToIndex: () => {
        router.visit(route("expenses.index"));
    },

    goToCreate: () => {
        router.visit(route("expenses.create"));
    },

    goToEdit: (expenseId: number) => {
        router.visit(route("expenses.edit", expenseId));
    },

    goToView: (expenseId: number) => {
        router.visit(route("expenses.show", expenseId));
    },
};

export default expenseService;
