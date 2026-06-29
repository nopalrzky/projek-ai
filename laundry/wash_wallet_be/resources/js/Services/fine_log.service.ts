import { router } from "@inertiajs/react";

export const fineLogService = {
    goToIndex: () => {
        router.visit(route("fine-logs.index"));
    },

    goToCreate: () => {
        router.visit(route("fine-logs.create"));
    },

    goToEdit: (fineLogId: number) => {
        router.visit(route("fine-logs.edit", fineLogId));
    },

    goToView: (fineLogId: number) => {
        router.visit(route("fine-logs.show", fineLogId));
    },
};

export default fineLogService;
