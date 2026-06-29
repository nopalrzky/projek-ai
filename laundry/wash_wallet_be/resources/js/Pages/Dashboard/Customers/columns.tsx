import { ColumnDef } from "@tanstack/react-table";
import { Link } from "@inertiajs/react";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Eye, Edit, Trash2, Phone, Mail, MapPin } from "lucide-react";
import { Customer } from "@/types";

export const createCustomerColumns = (
    onView: (customer: Customer) => void,
    onEdit: (customer: Customer) => void,
    onDelete: (customer: Customer) => void,
): ColumnDef<Customer>[] => [
    {
        accessorKey: "name",
        header: "Nama Customer",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <Link
                    href={route("customers.show", row.original.id)}
                    className="font-medium hover:underline"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    {row.original.name}
                </Link>
                <div className="flex items-center gap-2">
                    <Badge
                        variant={row.original.isActive ? "success" : "error"}
                        size="sm"
                    >
                        {row.original.isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                    {row.original.gender && (
                        <Badge variant="secondary" size="sm">
                            {row.original.gender === "male"
                                ? "Laki-laki"
                                : "Perempuan"}
                        </Badge>
                    )}
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        accessorKey: "phone",
        header: "Kontak",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                {row.original.phone && (
                    <div className="flex items-center gap-2">
                        <Phone
                            className="w-4 h-4"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {row.original.phone}
                        </span>
                    </div>
                )}
                {row.original.email && (
                    <div className="flex items-center gap-2">
                        <Mail
                            className="w-4 h-4"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                        <span
                            className="text-sm"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {row.original.email}
                        </span>
                    </div>
                )}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "outlet.name",
        header: "Outlet",
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.outlet?.name || "-"}
                </span>
                <span
                    className="text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    {row.original.outlet?.code || "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "address",
        header: "Alamat",
        cell: ({ row }) => (
            <div className="max-w-xs">
                {row.original.address ? (
                    <div className="flex items-start gap-2">
                        <MapPin
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                        <p
                            className="text-sm line-clamp-2"
                            style={{ color: "var(--color-text-primary)" }}
                            title={row.original.address}
                        >
                            {row.original.address}
                        </p>
                    </div>
                ) : (
                    <span
                        className="text-sm"
                        style={{ color: "var(--color-text-tertiary)" }}
                    >
                        -
                    </span>
                )}
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "ordersCount",
        header: "Total Order",
        cell: ({ row }) => (
            <div className="text-center">
                <Badge variant="info" size="md">
                    {row.original.ordersCount ?? 0} Order
                </Badge>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Button
                    variant="info"
                    size="sm"
                    onClick={() => onView(row.original)}
                    leftIcon={<Eye className="w-4 h-4" />}
                    title="Lihat detail"
                />
                <Button
                    variant="warning"
                    size="sm"
                    onClick={() => onEdit(row.original)}
                    leftIcon={<Edit className="w-4 h-4" />}
                    title="Edit customer"
                />
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(row.original)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                    title="Hapus customer"
                />
            </div>
        ),
        enableSorting: false,
    },
];
