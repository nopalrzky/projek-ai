export * from "./account";
export * from "./attendance";
export * from "./auth";
export * from "./balance_sheet";
export * from "./category";
export * from "./coin_transaction";
export * from "./customer";
export * from "./customer_quota";
export * from "./customer_subscription";
export * from "./courier_schedule";
export * from "./courier_setting";
export * from "./courier_pricing_tier";
export * from "./courier_pricing_zone";
export * from "./discount";
export * from "./deposit";
export * from "./employee_position";
export * from "./employee_process_commission";
export * from "./employee_process";
export * from "./employee_salary";
export * from "./employee";
export * from "./expense";
export * from "./feature";
export * from "./fine_log";
export * from "./fine";
export * from "./import_error";
export * from "./import_log";
export * from "./filters";
export * from "./form_data";
export * from "./journal_detail";
export * from "./journal_entry";
export * from "./laundry_service_process";
export * from "./laundry_service";
export * from "./loan";
export * from "./loan_log";
export * from "./membership_plan";
export * from "./membership_contract";
export * from "./operational_day";
export * from "./order";
export * from "./order_discount";
export * from "./order_item";
export * from "./order_item_process";
export * from "./order_status_history";
export * from "./outlet";
export * from "./outlet_feature";
export * from "./outlet_setting";
export * from "./pagination";
export * from "./payroll";
export * from "./payroll_detail";
export * from "./permission";
export * from "./prive";
export * from "./process";
export * from "./profit_loss";
export * from "./position";
export * from "./quota_usage_log";
export * from "./referral_log";
export * from "./salary";
export * from "./service_package";
export * from "./service_package_item";
export * from "./service_process";
export * from "./setting";
export * from "./sort_options";
export * from "./petty_cash";
export * from "./topup";
export * from "./unit";
export * from "./user";
export * from "./wallet_transaction";
export * from "./withdrawal_bank";
export * from "./owner_bank_account";
export * from "./wallet_withdrawal";

export interface InertiaOptions {
    onBefore?: () => boolean | void;
    onStart?: () => void;
    onProgress?: (progress: any) => void;
    onSuccess?: (page: any) => void;
    onError?: (errors: any) => void;
    onFinish?: () => void;
    preserveState?: boolean;
    preserveScroll?: boolean;
    replace?: boolean;
    only?: string[];
    except?: string[];
    errorBag?: string;
    forceFormData?: boolean;
}

export interface AppNotification {
    id: string;
    data: {
        type: string;
        title: string;
        message: string;
        amount: number;
        code: string;
        outlet_name: string;
        cashier_name: string;
        request_id: number;
        request_type: "deposit" | "expense" | "petty_cash" | "wallet_withdrawal";
        url: string;
        description?: string;
    };
    read_at: string | null;
    created_at: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        message?: string;
        error?: string;
        success?: string;
        warning?: string;
        info?: string;
    };
    errors?: Record<string, string>;
    notifications?: {
        unread_count: number;
        pending_actions?: {
            deposits_count: number;
            petty_cash_count: number;
            expenses_count: number;
        };
    };
};
