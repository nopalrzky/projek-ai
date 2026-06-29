import { FilterConfig } from "@/Components/Filters";
import { Outlet, Position } from "@/types";

export const createEmployeeFilters = (
    outlets: Outlet[],
    positions: Position[],
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
        key: "positionId",
        label: "Posisi",
        placeholder: "Semua Posisi",
        options: positions.map((position) => ({
            value: position.id,
            label: position.name,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "gender",
        label: "Gender",
        placeholder: "Semua Gender",
        options: [
            { value: "male", label: "Laki-laki" },
            { value: "female", label: "Perempuan" },
        ],
        clearable: true,
    },
    {
        type: "select",
        key: "isActive",
        label: "Status",
        placeholder: "Semua Status",
        options: [
            { value: "true", label: "Aktif" },
            { value: "false", label: "Nonaktif" },
        ],
        clearable: true,
    },
];
