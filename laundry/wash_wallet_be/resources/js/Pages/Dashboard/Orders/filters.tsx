import { FilterConfig } from "@/Components/Filters/types";
import { OrderFilterOptions } from "./types";

export const createOrderFilters = (
    filterOptions: OrderFilterOptions,
): FilterConfig[] => [
    {
        type: "select",
        key: "outletId",
        label: "Outlet",
        placeholder: "Semua Outlet",
        options: filterOptions.outlets.map((outlet) => ({
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
        options: filterOptions.customers.map((customer) => ({
            value: customer.id,
            label: `${customer.name} - ${customer.phone || "-"}`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "employeeId",
        label: "Employee",
        placeholder: "Semua Employee",
        options: filterOptions.employees.map((employee) => ({
            value: employee.id,
            label: `${employee.name} (${employee.outlet?.name || "-"})`,
        })),
        clearable: true,
        searchable: true,
    },
    {
        type: "select",
        key: "status",
        label: "Status Order",
        placeholder: "Semua Status",
        options: filterOptions.statusOptions.map((status) => ({
            value: status.value,
            label: status.label,
        })),
        clearable: true,
    },
    {
        type: "select",
        key: "paymentStatus",
        label: "Status Pembayaran",
        placeholder: "Semua Status",
        options: filterOptions.paymentStatusOptions.map((status) => ({
            value: status.value,
            label: status.label,
        })),
        clearable: true,
    },
    {
        type: "daterange",
        key: "orderDate",
        label: "Tanggal Order",
        placeholder: "Pilih rentang tanggal",
    },
    {
        type: "daterange",
        key: "estimatedCompletion",
        label: "Estimasi Selesai",
        placeholder: "Pilih rentang tanggal",
    },
    {
        type: "custom",
        key: "totalAmount",
        label: "Total Amount",
        render: (value, onChange) => (
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    placeholder="Min"
                    value={value?.min || ""}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            min: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                        })
                    }
                    className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
                <span style={{ color: "var(--color-text-tertiary)" }}>-</span>
                <input
                    type="number"
                    placeholder="Max"
                    value={value?.max || ""}
                    onChange={(e) =>
                        onChange({
                            ...value,
                            max: e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                        })
                    }
                    className="w-full px-3 py-2 rounded-lg border transition-colors duration-200 text-sm"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-primary)",
                    }}
                />
            </div>
        ),
    },
];
