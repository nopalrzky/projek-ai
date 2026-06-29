import { router } from "@inertiajs/react";

export const servicePackageService = {
    goToIndex: () => {
        router.visit(route("service-packages.index"));
    },

    goToCreate: () => {
        router.visit(route("service-packages.create"));
    },

    goToEdit: (packageId: number) => {
        router.visit(route("service-packages.edit", packageId));
    },

    goToView: (packageId: number) => {
        router.visit(route("service-packages.show", packageId));
    },

    async getAll(outletId: number): Promise<any[]> {
        try {
            const params = new URLSearchParams({
                outletId: String(outletId),
            });

            const response = await fetch(
                `${route("api.service-packages.index")}?${params.toString()}`,
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
            }

            throw new Error(
                result.message || "Failed to fetch service packages",
            );
        } catch (error) {
            console.error("Failed to get service packages by outlet:", error);
            throw error;
        }
    },
};

export default servicePackageService;
