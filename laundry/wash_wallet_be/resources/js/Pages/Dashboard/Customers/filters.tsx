import { FilterConfig } from "@/Components/Filters";
import { Outlet } from "@/types";

export const createCustomerFilters = (outlets: Outlet[]): FilterConfig[] => [
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
        key: "gender",
        label: "Jenis Kelamin",
        placeholder: "Semua",
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
            { value: "false", label: "Tidak Aktif" },
        ],
        clearable: true,
    },
    {
        type: "daterange",
        key: "createdDate",
        label: "Tanggal Registrasi",
        placeholder: "Pilih rentang tanggal",
    },
    {
        type: "custom",
        key: "phone",
        label: "Nomor Telepon",
        render: (value, onChange) => (
            <input
                type="text"
                placeholder="Cari nomor telepon..."
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm"
                style={{
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                }}
            />
        ),
    },
];
