import { LaundryServiceFilters } from "@/types";
import { router } from "@inertiajs/react";

export const laundryServiceService = {
    goToIndex: (filters?: LaundryServiceFilters) => {
        const params = filters
            ? new URLSearchParams(filters as any).toString()
            : "";
        const url = params
            ? `${route("laundry-services.index")}?${params}`
            : route("laundry-services.index");
        router.visit(url);
    },

    goToCreate: () => {
        router.visit(route("laundry-services.create"));
    },

    goToEdit: (laundryServiceId: number) => {
        router.visit(route("laundry-services.edit", laundryServiceId));
    },

    goToView: (laundryServiceId: number) => {
        router.visit(route("laundry-services.show", laundryServiceId));
    },

    async getLaundryServicesByOutletId(outletId: number): Promise<any[]> {
        try {
            const params = new URLSearchParams({
                outletId: String(outletId),
            });
            const response = await fetch(
                `${route("api.laundry-services.index")}?${params.toString()}`,
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
                throw new Error(
                    result.message || "Failed to fetch laundry services",
                );
            }
        } catch (error) {
            console.error("Failed to get laundry services by outlet:", error);
            throw error;
        }
    },

    async getLaundryServiceByUnitId(unitId: number): Promise<any> {
        try {
            const params = new URLSearchParams({
                unitId: String(unitId),
            });
            const response = await fetch(
                `${route("api.laundry-services.index")}?${params.toString()}`,
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
                return result.data;
            } else {
                throw new Error(
                    result.message || "Failed to fetch laundry service",
                );
            }
        } catch (error) {
            console.error("Failed to get laundry service by unit:", error);
            throw error;
        }
    },
};

export default laundryServiceService;
