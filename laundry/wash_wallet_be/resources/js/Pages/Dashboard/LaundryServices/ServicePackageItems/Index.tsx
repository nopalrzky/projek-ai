import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Package } from "lucide-react";
import { LaundryServicePackageItemsIndexProps } from "./types";
import { ServicePackageItem } from "@/types";
import { formatDate } from "@/lib/utils";

const LaundryServicePackageItemsIndex: React.FC<LaundryServicePackageItemsIndexProps> = ({
    laundryService,
    isLoading = false,
}) => {
    const items = laundryService.servicePackageItems || [];

    const columns: ColumnDef<ServicePackageItem>[] = useMemo(
        () => [
            {
                accessorKey: "servicePackage.name",
                header: "Nama Paket",
                cell: ({ row }) => {
                    const item = row.original;
                    const packageName = item.servicePackage?.name || "-";
                    const outletName = item.servicePackage?.outlet?.name;

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {packageName}
                            </div>
                            {outletName && (
                                <div
                                    className="text-xs"
                                    style={{ color: "var(--color-text-tertiary)" }}
                                >
                                    Outlet: {outletName}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 300,
            },
            {
                accessorKey: "quantity",
                header: "Kuantitas",
                cell: ({ row }) => {
                    const quantity = row.original.quantity;
                    const unitSymbol = laundryService.unit?.symbol || "";
                    
                    return (
                        <div
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {quantity} {unitSymbol}
                        </div>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "servicePackage.isActive",
                header: "Status Paket",
                cell: ({ row }) => {
                    const isActive = row.original.servicePackage?.isActive;
                    return (
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? "Aktif" : "Nonaktif"}
                        </Badge>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "createdAt",
                header: "Ditambahkan",
                cell: ({ row }) => {
                    return (
                        <span style={{ color: "var(--color-text-secondary)" }}>
                            {formatDate(row.original.createdAt)}
                        </span>
                    );
                },
                size: 150,
            },
        ],
        [laundryService.unit?.symbol]
    );

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <Package
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                Paket Layanan ({laundryService.servicePackageItemsCount ?? items.length})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Daftar paket layanan yang memasukkan layanan ini
                            </p>
                        </div>
                    </div>
                </div>

                <Table
                    data={items}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Layanan ini belum digunakan dalam paket layanan mana pun."
                    pageSize={10}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default LaundryServicePackageItemsIndex;
