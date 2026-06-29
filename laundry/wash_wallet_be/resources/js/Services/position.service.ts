import { InertiaOptions } from "@/types";
import { router } from "@inertiajs/react";
import axios from "axios";

/**
 * Position service for handling global position-related operations using Inertia.js
 */
export const positionService = {
    goToIndex(): void {
        router.visit(route("positions.index"));
    },
    /**
     * Get all positions with filters
     */
    async getPositions(
        filters: Record<string, any> = {},
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            router.get(
                route("positions.index"),
                { ...filters },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ["positions"],
                    onSuccess: (page) => {
                        console.log("Fetched positions successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Error fetching positions:", errors);
                        options.onError?.(errors);
                        resolve();
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    },
    async getPositionsByOutletId(
        outletId: number,
        activeOnly: boolean = true,
    ): Promise<any[]> {
        try {
            const response = await axios.get(
                route("api.positions.by-outlet", { outletId }),
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                },
            );

            if (response.data.success) {
                return response.data.data || [];
            } else {
                console.error("API Error:", response.data.message);
                return [];
            }
        } catch (error: any) {
            console.error("Error fetching positions by outlet:", error);

            if (error.response?.status === 404) {
                console.warn(`No positions found for outlet ${outletId}`);
                return [];
            }

            if (error.response?.status === 403) {
                console.error("Access denied to fetch positions");
                throw new Error("Akses ditolak untuk mengambil data posisi");
            }

            throw new Error(
                error.response?.data?.message ||
                    "Gagal mengambil data posisi dari outlet",
            );
        }
    },

    /**
     * Navigate to create position page
     */
    goToCreate(): void {
        router.visit(route("positions.create"));
    },

    /**
     * Navigate to position detail page
     */
    goToShow(id: number): void {
        router.visit(route("positions.show", id));
    },

    /**
     * Navigate to edit position page
     */
    goToEdit(id: number): void {
        router.visit(route("positions.edit", id));
    },
};

export default positionService;
