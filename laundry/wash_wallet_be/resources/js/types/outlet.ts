import {
    BaseFilters,
    BaseSortOptions,
    Category,
    CourierSchedule,
    CourierSetting,
    Customer,
    Employee,
    Expense,
    Fine,
    JournalEntry,
    LaundryService,
    MembershipPlan,
    OperationalDay,
    OutletFeature,
    OutletSetting,
    Position,
    ServicePackage,
    User,
} from ".";

export interface Outlet {
    id: number;
    ownerId: number;
    name: string;
    code: string;
    email: string;
    provinceId?: number | null;
    provinceName?: string | null;
    cityId?: number | null;
    cityName?: string | null;
    districtId?: number | null;
    districtName?: string | null;
    villageId?: number | null;
    villageName?: string | null;
    street?: string | null;
    phone?: string | null;
    status: "inactive" | "trial" | "active" | "expired";
    statusLabel: string;
    coinBalance: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    fullAddress?: string;
    latitude?: number | null;
    longitude?: number | null;
    categories?: Category[];
    courierSchedules?: CourierSchedule[];
    courierSetting?: CourierSetting;
    customers?: Customer[];
    employees?: Employee[];
    expenses?: Expense[];
    fines?: Fine[];
    journalEntries?: JournalEntry[];
    laundryServices?: LaundryService[];
    membershipPlans?: MembershipPlan[];
    operationalDays: OperationalDay[];
    outletFeatures?: OutletFeature[];
    outletSettings?: OutletSetting[];
    positions?: Position[];
    servicePackages?: ServicePackage[];
    owner: User;
    categoriesCount?: number;
    courierSchedulesCount?: number;
    customersCount?: number;
    employeesCount?: number;
    expensesCount?: number;
    finesCount?: number;
    journalEntriesCount?: number;
    laundryServicesCount?: number;
    membershipPlansCount?: number;
    positionsCount?: number;
    ordersCount?: number;
    outletFeaturesCount?: number;
    servicePackagesCount?: number;
    isActivated?: boolean;
    isActive?: boolean;
    activationStatus?: {
        status: "inactive" | "trial" | "active" | "expired";
        trialStartedAt?: string | null;
        trialExpiresAt?: string | null;
        unlockedAt?: string | null;
        expiresAt?: string | null;
        trialRemainingDays: number;
        trialEligible?: boolean;
        trialEligibilityCode?: string | null;
        trialEligibilityMessage?: string | null;
        trialDurationDays?: number;
    } | null;
    isCourierEnabled?: boolean;
    hasFreeShipping?: boolean;
    hasUnconditionalFreeShipping?: boolean;
}

export interface OutletFilters extends BaseFilters {
    provinceId?: number;
    districtId?: number;
    cityId?: number;
    status?: "active" | "inactive" | "trial" | "expired";
}

export interface OutletSortOptions extends BaseSortOptions {
    column:
        | "name"
        | "code"
        | "email"
        | "createdAt"
        | "updatedAt"
        | "status"
        | "categoriesCount"
        | "employeesCount";
}

export interface OutletFormData {
    name: string;
    email?: string | null;
    phone?: string | null;
    provinceId?: number | null;
    provinceName?: string | null;
    cityId?: number | null;
    cityName?: string | null;
    districtId?: number | null;
    districtName?: string | null;
    villageId?: number | null;
    villageName?: string | null;
    street?: string | null;
    isActive?: boolean | null;
    latitude?: number | null;
    longitude?: number | null;
    [key: string]: any;
}

export interface OutletUploadImportFormData {
    file: File;
    type: "outlet";
    [key: string]: any;
}

export interface OutletCategoryFormData {
    name: string;
    description?: string;
    isActive?: boolean | null;
    [key: string]: any;
}

export interface OutletCategoryUploadImportFormData {
    file: File;
    type: "category";
    [key: string]: any;
}

export interface OutletCommissionFormData {
    unitId: number;
    name: string;
    description?: string;
    [key: string]: any;
}

export interface OutletCustomerFormData {
    name: string;
    email?: string;
    phone?: string;
    gender: "male" | "female" | "";
    address: string;
    isActive?: boolean | null;
    [key: string]: any;
}

export interface OutletCustomerUploadImportFormData {
    file: File;
    type?: string;
    [key: string]: any;
}

export interface EmployeeSalaryFormItem {
    salaryId: number | null;
    type: string;
    status: string;
    amount: number;
    [key: string]: any;
}

export interface EmployeeProcessCommissionFormItem {
    processId: number | null;
    commissionType: "per_item" | "per_kg" | "percentage" | "flat";
    commissionValue: number;
    hasTarget: boolean;
    targetThreshold: number | null;
    bonusAmount: number | null;
    effectiveDate?: string;
    isActive: boolean;
    [key: string]: any;
}

export interface OutletEmployeeCreateFormData {
    name: string;
    username: string;
    password?: string | null;
    passwordConfirmation?: string | null;
    avatar?: File | null;
    phone: string;
    address: string;
    gender: "male" | "female" | "";
    dateOfBirth?: string;
    startDate: string;
    isActive: boolean;
    cutoffDays: number;
    positionIds: number[];
    employeeSalaries: EmployeeSalaryFormItem[];
    employeeProcessCommissions: EmployeeProcessCommissionFormItem[];
    [key: string]: any;
}

export interface OutletEmployeeEditFormData {
    name: string;
    username: string;
    password?: string | null;
    passwordConfirmation?: string | null;
    avatar?: File | null;
    phone: string;
    address: string;
    gender: "male" | "female" | "";
    dateOfBirth?: string;
    startDate: string;
    isActive: boolean;
    cutoffDays: number;
    [key: string]: any;
}

export interface OutletFineFormData {
    name: string;
    amount: number;
    description: string;
    [key: string]: any;
}
export interface OutletLaundryServiceFormData {
    categoryId: number;
    unitId: number;
    name: string;
    description?: string;
    isActive?: boolean | null;
    supportsCourier?: boolean | null;
    price: number;
    durationHours: number;
    minQuantity: number;
    laundryServiceProcesses?: Array<{
        processId: number;
    }>;
    [key: string]: any;
}

export interface OutletMembershipPlanFormData {
    name: string;
    price: number;
    durationDays: number | null;
    discountPercentage: number | null;
    description: string;
    level: number;
    isActive?: boolean | null;
}

export interface OutletOperationalDayFormData {
    dayOfWeek: string;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
    [key: string]: any;
}

export interface OutletPositionFormData {
    name: string;
    description?: string;
    isActive?: boolean | null;
    permissions: string[];
    [key: string]: any;
}

export interface ServicePackageItemFormData {
    laundryServiceId: number;
    quantity: number;
}

export interface OutletServicePackageFormData {
    name: string;
    description: string;
    price: number;
    validityDays: number | null;
    isActive: boolean;
    servicePackageItems: ServicePackageItemFormData[];
}
