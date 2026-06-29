import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createServicePackageFilters = (
    outlets: Outlet[],
): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: [
            { value: "", label: "Semua Outlet" },
            ...outlets.map((outlet) => ({
                value: outlet.id,
                label: `${outlet.name}${
                    outlet.code ? ` (${outlet.code})` : ""
                }`,
            })),
        ],
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "isActive",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "", label: "Semua Status" },
            { value: "1", label: "Aktif" },
            { value: "0", label: "Tidak Aktif" },
        ],
        clearable: true,
    },
    {
        type: "number",
        key: "minPrice",
        label: "Harga Paket",
        placeholder: "Harga minimum",
    },
    {
        type: "number",
        key: "maxPrice",
        label: "Harga Maksimum",
        placeholder: "Harga maksimum",
    },
    {
        type: "number",
        key: "minValidityDays",
        label: "Masa Berlaku Min (Hari)",
        placeholder: "Hari minimum",
    },
    {
        type: "number",
        key: "maxValidityDays",
        label: "Masa Berlaku Max (Hari)",
        placeholder: "Hari maksimum",
    },
];
