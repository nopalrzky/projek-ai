import { LaundryService, ServicePackage } from ".";

export interface ServicePackageItem {
    id: number;
    servicePackageId: number;
    laundryServiceId: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    servicePackage: ServicePackage;
    laundryService: LaundryService;
}

export interface ServicePackageItemFilters {
    servicePackageId?: number;
    laundryServiceId?: number;
    minQuantity?: number;
    maxQuantity?: number;
    withRelations?: boolean;
}

export interface ServicePackageItemFormData {
    laundryServiceId: number;
    quantity: number;
}

export interface PackageItemSummary {
    variantName: string;
    serviceName: string;
    quantity: number;
    unit: string;
    price: number;
    totalValue: number;
}
