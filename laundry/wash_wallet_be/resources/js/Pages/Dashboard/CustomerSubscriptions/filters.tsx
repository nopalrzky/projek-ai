import { FilterConfig } from "@/Components/Filters";

export const createCustomerSubscriptionFilters = (
    customers: Array<{ value: number; label: string }> = [],
    servicePackages: Array<{ value: number; label: string }> = [],
    statusOptions: Array<{ value: string; label: string }> = [],
): FilterConfig[] => [
    {
        type: "select",
        key: "customerId",
        label: "Customer",
        placeholder: "Semua Customer",
        options: customers || [],
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "servicePackageId",
        label: "Paket Layanan",
        placeholder: "Semua Paket",
        options: servicePackages || [],
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Semua Status",
        options: statusOptions || [],
        clearable: true,
    },
    {
        type: "daterange",
        key: "purchaseDate",
        label: "Tanggal Pembelian",
        placeholder: "Pilih rentang tanggal",
    },
    {
        type: "daterange",
        key: "expiredAt",
        label: "Tanggal Kadaluarsa",
        placeholder: "Pilih rentang tanggal",
    },
];
