import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/Components/Badge";
import { User as UserIcon, Phone, Mail, Calendar } from "lucide-react";
import { User } from "@/types";

const STATUS_STYLES: Record<
    User["status"],
    {
        badge: "success" | "error" | "warning" | "info";
        label: string;
        iconBackground: string;
        iconColor: string;
    }
> = {
    active: {
        badge: "success",
        label: "Aktif",
        iconBackground: "var(--color-success-100)",
        iconColor: "var(--color-success-600)",
    },
    inactive: {
        badge: "error",
        label: "Tidak Aktif",
        iconBackground: "var(--color-error-100)",
        iconColor: "var(--color-error-600)",
    },
    pending: {
        badge: "warning",
        label: "Pending",
        iconBackground: "var(--color-warning-100)",
        iconColor: "var(--color-warning-600)",
    },
    suspended: {
        badge: "info",
        label: "Suspended",
        iconBackground: "var(--color-info-100)",
        iconColor: "var(--color-info-600)",
    },
};

export const createAffiliateColumns = (): ColumnDef<User>[] => [
    {
        accessorKey: "name",
        header: "Nama Referral",
        cell: ({ row }) => {
            const status = STATUS_STYLES[row.original.status];

            return (
                <div className="flex items-start gap-3">
                    <div
                        className="p-2 rounded-full flex-shrink-0"
                        style={{
                            backgroundColor: status.iconBackground,
                        }}
                    >
                        <UserIcon
                            className="w-4 h-4"
                            style={{
                                color: status.iconColor,
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {row.original.name}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <Mail
                                className="w-3 h-3"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <span
                                className="text-xs"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                {row.original.email || "-"}
                            </span>
                        </div>
                    </div>
                </div>
            );
        },
        enableSorting: true,
    },
    {
        accessorKey: "phone",
        header: "Nomor HP",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Phone
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-sm font-medium font-mono"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.phone || "-"}
                </span>
            </div>
        ),
        enableSorting: false,
    },
    {
        accessorKey: "createdAt",
        header: "Tanggal Bergabung",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Calendar
                    className="w-4 h-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <span
                    className="text-sm"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    {row.original.createdAt}
                </span>
            </div>
        ),
        enableSorting: true,
    },

    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = STATUS_STYLES[row.original.status];

            return (
                <Badge variant={status.badge} size="sm">
                    {status.label}
                </Badge>
            );
        },
        enableSorting: false,
    },
];
