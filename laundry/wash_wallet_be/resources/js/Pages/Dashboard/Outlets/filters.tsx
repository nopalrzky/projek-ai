import { FilterConfig } from "@/Components/Filters/types";
import { OutletFilterOptions } from "./types";

export const createOutletFilters = (
    filterOptions: OutletFilterOptions,
): FilterConfig[] => [
    {
        type: "select",
        key: "isActive",
        label: "Status",
        placeholder: "Semua Status",
        options: filterOptions.statusOptions.map((status) => ({
            value: String(status.value),
            label: status.label,
        })),
        clearable: true,
    },
    {
        type: "select",
        key: "provinceId",
        label: "Provinsi",
        placeholder: "Semua Provinsi",
        options: filterOptions.provinces.map((province) => ({
            value: province.id,
            label: province.name,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "cityId",
        label: "Kota/Kabupaten",
        placeholder: "Semua Kota",
        options: filterOptions.cities.map((city) => ({
            value: city.id,
            label: city.name,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "districtId",
        label: "Kecamatan",
        placeholder: "Semua Kecamatan",
        options: filterOptions.districts.map((district) => ({
            value: district.id,
            label: district.name,
        })),
        clearable: true,
        searchable: true,
    },
];
