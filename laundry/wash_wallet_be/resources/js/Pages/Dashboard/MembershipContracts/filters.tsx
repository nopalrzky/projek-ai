import { FilterConfig, FilterGroupConfig } from "@/Components/Filters/types";
import { Outlet, Customer, MembershipPlan } from "@/types";

export const createMembershipContractFilterGroups = (
    outlets: Outlet[],
    customers: Customer[],
    membershipPlans: MembershipPlan[]
): FilterGroupConfig[] => [
    {
        title: "Filter Dasar",
        filters: [
            {
                type: "select",
                key: "outletId",
                label: "Outlet",
                placeholder: "Semua Outlet",
                options: outlets.map((outlet) => ({
                    value: outlet.id,
                    label: `${outlet.name} (${outlet.code})`,
                })),
                clearable: true,
                searchable: true,
            },
            {
                type: "select",
                key: "customerId",
                label: "Customer",
                placeholder: "Semua Customer",
                options: customers.map((customer) => ({
                    value: customer.id,
                    label: `${customer.name} - ${
                        customer.phone || "N/A"
                    }`,
                })),
                clearable: true,
                searchable: true,
            },
            {
                type: "select",
                key: "membershipPlanId",
                label: "Membership Plan",
                placeholder: "Semua Plan",
                options: membershipPlans.map((plan) => ({
                    value: plan.id,
                    label: plan.name,
                })),
                clearable: true,
                searchable: true,
            },
            {
                type: "select",
                key: "status",
                label: "Status",
                placeholder: "Semua Status",
                options: [
                    { value: "active", label: "Aktif" },
                    { value: "expired", label: "Expired" },
                    { value: "replaced", label: "Diganti" },
                ],
                clearable: true,
            },
        ],
        collapsible: false,
    },
    {
        title: "Filter Lanjutan",
        filters: [
            {
                type: "daterange",
                key: "startDateRange",
                label: "Tanggal Mulai",
                placeholder: "Pilih rentang tanggal mulai",
            },
            {
                type: "daterange",
                key: "expiredDateRange",
                label: "Tanggal Expired",
                placeholder: "Pilih rentang tanggal expired",
            },
            {
                type: "daterange",
                key: "createdDate",
                label: "Tanggal Dibuat",
                placeholder: "Pilih rentang tanggal dibuat",
            },
            {
                type: "select",
                key: "isReplaced",
                label: "Status Penggantian",
                placeholder: "Semua",
                options: [
                    { value: true, label: "Sudah Diganti" },
                    { value: false, label: "Belum Diganti" },
                ],
                clearable: true,
            },
            {
                type: "select",
                key: "hasExpiredDate",
                label: "Punya Tanggal Expired",
                placeholder: "Semua",
                options: [
                    { value: true, label: "Ada Expired Date" },
                    { value: false, label: "Tanpa Expired Date" },
                ],
                clearable: true,
            },
            {
                type: "custom",
                key: "expiringSoonDays",
                label: "Akan Expired Dalam (Hari)",
                render: (value, onChange) => (
                    <input
                        type="number"
                        placeholder="Contoh: 30"
                        value={value || ""}
                        onChange={(e) =>
                            onChange(
                                e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined
                            )
                        }
                        min="1"
                        className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-primary)",
                        }}
                    />
                ),
            },
        ],
        collapsible: true,
        defaultCollapsed: true,
    },
];

export const createMembershipContractFilters = (
    outlets: Outlet[],
    customers: Customer[],
    membershipPlans: MembershipPlan[]
): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: outlets.map((outlet) => ({
            value: outlet.id,
            label: `${outlet.name} (${outlet.code})`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "customerId",
        label: "Customer",
        placeholder: "Semua Customer",
        options: customers.map((customer) => ({
            value: customer.id,
            label: `${customer.name} - ${
                customer.phone || "N/A"
            }`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "membershipPlanId",
        label: "Membership Plan",
        placeholder: "Semua Plan",
        options: membershipPlans.map((plan) => ({
            value: plan.id,
            label: plan.name,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "active", label: "Aktif" },
            { value: "expired", label: "Expired" },
            { value: "replaced", label: "Diganti" },
        ],
        clearable: true,
    },
];
