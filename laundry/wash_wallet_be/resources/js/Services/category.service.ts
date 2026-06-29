import { InertiaOptions } from "@/types";
import { router } from "@inertiajs/react";

export const categoryService = {
    goToIndex: () => {
        router.visit(route("categories.index"));
    },

    goToCreate: () => {
        router.visit(route("categories.create"));
    },

    goToEdit: (categoryId: number) => {
        router.visit(route("categories.edit", categoryId));
    },

    goToView: (categoryId: number) => {
        router.visit(route("categories.show", categoryId));
    },

    async getAll(outletId: number): Promise<any[]> {
        try {
            const params = new URLSearchParams({
                outletId: String(outletId),
            });
            const response = await fetch(
                `${route("api.categories.index")}?${params.toString()}`,
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
                throw new Error(result.message || "Failed to fetch categories");
            }
        } catch (error) {
            console.error("Failed to get categories by outlet:", error);
            throw error;
        }
    },

    // ==================== Laundry Service Management ====================

    /**
     * Navigate to create laundry service page
     */
    goToCreateLaundryService: (categoryId: number) => {
        router.visit(route("categories.laundry-services.create", categoryId));
    },

    /**
     * Navigate to edit laundry service page
     */
    goToEditLaundryService: (categoryId: number, laundryServiceId: number) => {
        router.visit(
            route("categories.laundry-services.edit", {
                categoryId: categoryId,
                laundryServiceId: laundryServiceId,
            }),
        );
    },

    /**
     * Navigate to view laundry service detail
     */
    goToViewLaundryService: (laundryServiceId: number) => {
        router.visit(route("laundry-services.show", laundryServiceId));
    },

    /**
     * Navigate to import laundry services page
     */
    goToImportLaundryServices(categoryId: number): void {
        router.visit(
            route("categories.laundry-services.import.create", categoryId),
        );
    },

    /**
     * Download laundry service import template
     */
    downloadLaundryServiceTemplate(categoryId: number): void {
        window.location.href = route(
            "categories.laundry-services.import.template",
            categoryId,
        );
    },

    /**
     * Upload laundry service import file
     */
    async uploadLaundryServiceImportFile(
        categoryId: number,
        data: { file: File; type?: string },
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("categories.laundry-services.import.upload", categoryId),
                { ...data },
                {
                    forceFormData: true,
                    errorBag: "uploadLaundryServiceImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log(
                            "Laundry service import file uploaded successfully",
                        );
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error(
                            "Upload laundry service import file error:",
                            errors,
                        );
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    },

    /**
     * Confirm laundry service import after preview
     */
    async confirmLaundryServiceImport(
        categoryId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("categories.laundry-services.import.confirm", categoryId),
                {},
                {
                    errorBag: "confirmLaundryServiceImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log(
                            "Laundry service import confirmed successfully",
                        );
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error(
                            "Confirm laundry service import error:",
                            errors,
                        );
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    },

    /**
     * Navigate to laundry service import result page
     */
    goToLaundryServiceImportResult(categoryId: number, importId: string): void {
        router.visit(
            route("categories.laundry-services.import.result", {
                categoryId: categoryId,
                importId: importId,
            }),
        );
    },

    /**
     * Download laundry service import errors
     */
    downloadLaundryServiceImportErrors(
        categoryId: number,
        importId: number,
    ): void {
        window.location.href = route(
            "categories.laundry-services.import.errors.download",
            {
                categoryId: categoryId,
                importId: importId,
            },
        );
    },

    /**
     * Cancel laundry service import
     */
    async cancelLaundryServiceImport(
        categoryId: number,
        importId: string,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.delete(
                route("categories.laundry-services.import.cancel", {
                    categoryId: categoryId,
                    importId: importId,
                }),
                {
                    errorBag: "cancelLaundryServiceImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log(
                            "Laundry service import cancelled successfully",
                        );
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error(
                            "Cancel laundry service import error:",
                            errors,
                        );
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    },

    /**
     * Export laundry services to Excel
     */
    exportLaundryServices(categoryId: number): void {
        window.location.href = route(
            "categories.laundry-services.export",
            categoryId,
        );
    },
};
