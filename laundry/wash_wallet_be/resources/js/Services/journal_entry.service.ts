import { router } from "@inertiajs/react";

export const journalEntryService = {
    goToIndex: () => {
        router.visit(route("journal-entries.index"));
    },

    goToCreate: () => {
        router.visit(route("journal-entries.create"));
    },

    goToEdit: (journalEntryId: number) => {
        router.visit(route("journal-entries.edit", journalEntryId));
    },

    goToView: (id: number) => {
        router.visit(route("journal-entries.show", id));
    },
};

export default journalEntryService;
