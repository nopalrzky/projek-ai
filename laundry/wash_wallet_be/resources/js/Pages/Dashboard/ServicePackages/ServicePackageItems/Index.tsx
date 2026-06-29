import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Package } from "lucide-react";
import { ServicePackageItemsIndexProps } from "./types";
import { ServicePackageItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

const ServicePackageItemsIndex = ({
    servicePackage,
}: ServicePackageItemsIndexProps) => {
    const columns: ColumnDef<ServicePackageItem>[] = useMemo(
        () => [
            {
                accessorKey: "laundryService.name",
                header: "Layanan",
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium flex items-center space-x-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                <span>{item.laundryService?.name}</span>
                                <Badge variant="info">
                                    {item.laundryService?.name}
                                </Badge>
                            </div>
                            <div
                                className="text-sm"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Kategori: {item.laundryService?.category?.name}
                            </div>
                        </div>
                    );
                },
                size: 400,
            },
            {
                accessorKey: "quantity",
                header: "Kuantitas",
                cell: ({ row }) => {
                    const quantity = row.original.quantity;
                    return (
                        <div
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {quantity}x
                        </div>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "laundryService.price",
                header: "Harga Satuan",
                cell: ({ row }) => {
                    const item = row.original;
                    return (
                        <div
                            className="font-medium"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            {formatCurrency(item.laundryService?.price || 0)}
                        </div>
                    );
                },
                size: 150,
            },
            {
                id: "total",
                header: "Total",
                cell: ({ row }) => {
                    const item = row.original;
                    const total =
                        (item.laundryService?.price || 0) * item.quantity;
                    return (
                        <div
                            className="font-bold"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                            }).format(total)}
                        </div>
                    );
                },
                size: 150,
            },
        ],
        []
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
                                Item Layanan dalam Paket (
                                {servicePackage.servicePackageItems?.length ||
                                    0}
                                )
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Daftar layanan yang termasuk dalam paket ini
                            </p>
                        </div>
                    </div>
                </div>

                <Table
                    data={servicePackage.servicePackageItems || []}
                    columns={columns}
                    isLoading={false}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada item layanan dalam paket ini."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default ServicePackageItemsIndex;
