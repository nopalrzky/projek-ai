import { router } from "@inertiajs/react";
import {
    InertiaOptions,
    OutletFilters,
    OutletUploadImportFormData,
    OutletCategoryUploadImportFormData,
    OutletCustomerUploadImportFormData,
} from "@/types";

export class OutletService {
    async getOutlets(
        filters: OutletFilters = {},
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve) => {
            router.get(
                route("outlets.index"),
                { ...filters },
                {
                    preserveState: options.preserveState ?? true,
                    preserveScroll: options.preserveScroll ?? true,
                    onSuccess: (page) => {
                        console.log("Fetched outlets successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Error fetching outlets:", errors);
                        options.onError?.(errors);
                        resolve();
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }

    goToIndex(): void {
        router.visit(route("outlets.index"));
    }

    goToCreate(): void {
        router.visit(route("outlets.create"));
    }

    goToEdit(id: number): void {
        router.visit(route("outlets.edit", id));
    }

    goToView(id: number): void {
        router.visit(route("outlets.show", id));
    }

    goToImport(outletId?: number): void {
        if (outletId) {
            router.visit(route("outlets.import.index", outletId));
        } else {
            router.visit(route("outlets.import.index"));
        }
    }

    downloadTemplate(): void {
        window.location.href = route("outlets.import.template", "outlet");
    }

    async uploadImportFile(
        data: OutletUploadImportFormData,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.import.upload"),
                { ...data },
                {
                    forceFormData: true,
                    errorBag: "uploadImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log("Import file uploaded successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Upload import file error:", errors);
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }

    goToImportPreview(importId: number, outletId?: number): void {
        const params = outletId ? { outletId, importId } : { importId };
        router.visit(route("outlets.import.preview", params));
    }

    async confirm(options: InertiaOptions = {}): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.import.confirm"),
                {},
                {
                    errorBag: "confirmImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log("Import confirmed successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Confirm import error:", errors);
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }

    goToImportResult(importId: number, outletId?: number): void {
        const params = outletId ? { outletId, importId } : { importId };
        router.visit(route("outlets.import.result", params));
    }

    downloadImportErrors(importId: number, outletId?: number): void {
        const params = outletId ? { outletId, importId } : { importId };
        window.location.href = route("outlets.import.errors.download", params);
    }

    async cancelImport(
        importId: number,
        outletId?: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const cancelRoute = outletId
                ? route("outlets.import.cancel", { outletId, importId })
                : route("outlets.import.cancel", importId);

            router.delete(cancelRoute, {
                errorBag: "cancelImport",
                preserveState: false,
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log("Import cancelled successfully");
                    options.onSuccess?.(page);
                    resolve();
                },
                onError: (errors) => {
                    console.error("Cancel import error:", errors);
                    options.onError?.(errors);
                    reject(errors);
                },
                onFinish: () => {
                    options.onFinish?.();
                },
            });
        });
    }

    goToCreateCategory(outletId: number): void {
        router.visit(route("outlets.categories.create", outletId));
    }

    goToShowCategory(outletId: number, categoryId: number): void {
        router.visit(
            route("outlets.categories.show", {
                outletId: outletId,
                categoryId: categoryId,
            }),
        );
    }

    goToEditCategory(outletId: number, categoryId: number): void {
        router.visit(
            route("outlets.categories.edit", {
                outletId: outletId,
                categoryId: categoryId,
            }),
        );
    }

    goToImportCategories(outletId: number): void {
        router.visit(route("outlets.categories.import.create", outletId));
    }

    downloadCategoryTemplate(outletId: number): void {
        window.location.href = route(
            "outlets.categories.import.template",
            outletId,
        );
    }

    async uploadCategoryImportFile(
        outletId: number,
        data: OutletCategoryUploadImportFormData,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.categories.import.upload", outletId),
                { ...data },
                {
                    forceFormData: true,
                    errorBag: "uploadCategoryImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log(
                            "Category import file uploaded successfully",
                        );
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error(
                            "Upload category import file error:",
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
    }

    async confirmCategoryImport(
        outletId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.categories.import.confirm", outletId),
                {},
                {
                    errorBag: "confirmCategoryImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log("Category import confirmed successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Confirm category import error:", errors);
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }

    goToCategoryImportResult(outletId: number, importId: string): void {
        router.visit(
            route("outlets.categories.import.result", {
                outletId: outletId,
                importId: importId,
            }),
        );
    }

    downloadCategoryImportErrors(outletId: number, importId: number): void {
        window.location.href = route(
            "outlets.categories.import.errors.download",
            {
                outletId: outletId,
                importId: importId,
            },
        );
    }

    async cancelCategoryImport(
        outletId: number,
        importId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.delete(
                route("outlets.categories.import.cancel", {
                    outletId: outletId,
                    importId: importId,
                }),
                {
                    errorBag: "cancelCategoryImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log("Category import cancelled successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Cancel category import error:", errors);
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }

    goToCreateCustomer(outletId: number): void {
        router.visit(route("outlets.customers.create", outletId));
    }

    goToShowCustomer(outletId: number, customerId: number): void {
        router.visit(route("outlets.customers.show", { outletId, customerId }));
    }

    goToEditCustomer(outletId: number, customerId: number): void {
        router.visit(route("outlets.customers.edit", { outletId, customerId }));
    }

    goToImportCustomers(outletId: number): void {
        router.visit(route("outlets.customers.import.create", outletId));
    }

    downloadCustomerTemplate(outletId: number): void {
        window.location.href = route(
            "outlets.customers.import.template",
            outletId,
        );
    }

    async uploadCustomerImportFile(
        outletId: number,
        data: OutletCustomerUploadImportFormData,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.customers.import.upload", outletId),
                { ...data },
                {
                    forceFormData: true,
                    errorBag: "uploadCustomerImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log(
                            "Customer import file uploaded successfully",
                        );
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error(
                            "Upload customer import file error:",
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
    }

    async confirmCustomerImport(
        outletId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.customers.import.confirm", outletId),
                {},
                {
                    errorBag: "confirmCustomerImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log("Customer import confirmed successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Confirm customer import error:", errors);
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }

    goToCustomerImportResult(outletId: number, importId: string): void {
        router.visit(
            route("outlets.customers.import.result", {
                outletId: outletId,
                importId: importId,
            }),
        );
    }

    downloadCustomerImportErrors(outletId: number, importId: number): void {
        window.location.href = route(
            "outlets.customers.import.errors.download",
            {
                outletId: outletId,
                importId: importId,
            },
        );
    }

    async cancelCustomerImport(
        outletId: number,
        importId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.delete(
                route("outlets.customers.import.cancel", {
                    outletId: outletId,
                    importId: importId,
                }),
                {
                    errorBag: "cancelCustomerImport",
                    preserveState: false,
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log("Customer import cancelled successfully");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Cancel customer import error:", errors);
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }

    goToCreateEmployee(outletId: number): void {
        router.visit(route("outlets.employees.create", outletId));
    }

    goToEditEmployee(outletId: number, employeeId: number): void {
        router.visit(
            route("outlets.employees.edit", {
                outletId: outletId,
                employeeId: employeeId,
            }),
        );
    }

    goToShowEmployee(outletId: number, employeeId: number): void {
        router.visit(
            route("outlets.employees.show", {
                outletId: outletId,
                employeeId: employeeId,
            }),
        );
    }

    goToCreateFine(outletId: number): void {
        router.visit(route("outlets.fines.create", outletId));
    }

    goToShowFine(outletId: number, fineId: number): void {
        router.visit(
            route("outlets.fines.show", {
                outletId: outletId,
                fineId: fineId,
            }),
        );
    }

    goToEditFine(outletId: number, fineId: number): void {
        router.visit(
            route("outlets.fines.edit", {
                outletId: outletId,
                fineId: fineId,
            }),
        );
    }

    goToCreateLaundryService(outletId: number): void {
        router.visit(route("outlets.laundry-services.create", outletId));
    }

    goToShowLaundryService(outletId: number, laundryServiceId: number): void {
        router.visit(
            route("outlets.laundry-services.show", {
                outletId: outletId,
                laundryServiceId: laundryServiceId,
            }),
        );
    }

    goToEditLaundryService(outletId: number, laundryServiceId: number): void {
        router.visit(
            route("outlets.laundry-services.edit", {
                outletId: outletId,
                laundryServiceId: laundryServiceId,
            }),
        );
    }

    goToCreateMembershipPlan(outletId: number): void {
        router.visit(route("outlets.membership-plans.create", outletId));
    }

    goToEditMembershipPlan(outletId: number, membershipPlanId: number): void {
        router.visit(
            route("outlets.membership-plans.edit", {
                outletId: outletId,
                membershipPlanId: membershipPlanId,
            }),
        );
    }

    goToCreateOperationalDay(outletId: number): void {
        router.visit(route("outlets.operational-days.create", outletId));
    }

    goToEditOperationalDay(outletId: number, operationalDayId: number): void {
        router.visit(
            route("outlets.operational-days.edit", {
                outlet: outletId,
                operationalDay: operationalDayId,
            }),
        );
    }

    goToCreatePosition(outletId: number): void {
        router.visit(route("outlets.positions.create", outletId));
    }

    goToEditPosition(outletId: number, positionId: number): void {
        router.visit(
            route("outlets.positions.edit", {
                outletId: outletId,
                positionId: positionId,
            }),
        );
    }

    goToShowPosition(outletId: number, positionId: number): void {
        router.visit(
            route("outlets.positions.show", {
                outletId: outletId,
                positionId: positionId,
            }),
        );
    }

    goToCreateServicePackage(outletId: number): void {
        router.visit(route("outlets.service-packages.create", outletId));
    }

    goToEditServicePackage(outletId: number, packageId: number): void {
        router.visit(
            route("outlets.service-packages.edit", {
                outletId: outletId,
                packageId: packageId,
            }),
        );
    }

    goToCreateFeature(outletId: number): void {
        router.visit(route("outlets.features.create", outletId));
    }

    async storeFeature(
        outletId: number,
        featureId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.features.store", outletId),
                { featureId },
                {
                    onSuccess: (page) => {
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        options.onError?.(errors);
                        reject(errors);
                    },
                },
            );
        });
    }

    goToCreateCourierSchedule(outletId: number): void {
        router.visit(route("outlets.courier-schedules.create", outletId));
    }

    goToEditCourierSchedule(outletId: number, scheduleId: number): void {
        router.visit(
            route("outlets.courier-schedules.edit", {
                outletId: outletId,
                scheduleId: scheduleId,
            }),
        );
    }

    async destroyCourierSchedule(
        outletId: number,
        scheduleId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
                router.delete(
                    route("outlets.courier-schedules.destroy", {
                        outletId,
                        scheduleId,
                    }),
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess: (page) => {
                            options.onSuccess?.(page);
                            resolve();
                        },
                        onError: (errors) => {
                            options.onError?.(errors);
                            reject(errors);
                        },
                    },
                );
            } else {
                resolve();
            }
        });
    }

    async activateCourierFeature(
        outletId: number,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                route("outlets.features.activate-courier", outletId),
                {},
                {
                    onSuccess: (page) => {
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        options.onError?.(errors);
                        reject(errors);
                    },
                },
            );
        });
    }

    async updateCourierDisabledDays(
        outletId: number,
        disabledDays: string[],
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.put(
                route("outlets.courier-settings.disabled-days.update", outletId),
                { disabledDays },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        options.onError?.(errors);
                        reject(errors);
                    },
                    onFinish: () => {
                        options.onFinish?.();
                    },
                },
            );
        });
    }
}

export const outletService = new OutletService();
export default outletService;
