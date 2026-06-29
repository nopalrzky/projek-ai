import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Users,
    Plus,
    Edit,
    Trash2,
    Phone,
    Mail,
    User,
    Upload,
    Download,
} from "lucide-react";
import { Customer } from "@/types";
import DeleteCustomerModal from "./Partials/DeleteCustomerModal";
import { OutletCustomersProps } from "./types";
import { outletService } from "@/Services/outlet.service";

const OutletCustomersIndex: React.FC<OutletCustomersProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        customer?: Customer;
        isLoading: boolean;
    }>({
        isOpen: false,
        customer: undefined,
        isLoading: false,
    });

    const handleCreateCustomer = () => {
        outletService.goToCreateCustomer(outlet.id);
    };

    const handleImport = () => {
        outletService.goToImportCustomers(outlet.id);
    };

    const handleExport = () => {
        // outletService.exportCustomers(outlet.id);
    };

    const handleEditCustomer = (customerId: number) => {
        outletService.goToEditCustomer(outlet.id, customerId);
    };

    const handleDeleteCustomer = (customer: Customer) => {
        setDeleteModal({
            isOpen: true,
            customer,
            isLoading: false,
        });
    };

    const handleConfirmDelete = async (customer: Customer) => {
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    };

    const handleCloseDeleteModal = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                customer: undefined,
                isLoading: false,
            });
        }
    };

    const handleViewCustomer = (customerId: number) => {
        outletService.goToShowCustomer(outlet.id, customerId);
    };

    const columns: ColumnDef<Customer>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Nama Pelanggan",
                cell: ({ row }) => {
                    const customer = row.original;
                    return (
                        <div className="space-y-1">
                            <div
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {customer.name || ` ${customer.name}`.trim()}
                            </div>

                            {customer.gender && (
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {customer.gender}
                                </div>
                            )}
                        </div>
                    );
                },
                size: 300,
            },
            {
                accessorKey: "contact",
                header: "Kontak",
                cell: ({ row }) => {
                    const customer = row.original;
                    return (
                        <div className="space-y-1">
                            {customer.phone && (
                                <div
                                    className="text-sm flex items-center gap-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Phone className="w-3 h-3" />
                                    <span>{customer.phone}</span>
                                </div>
                            )}
                            {customer.email && (
                                <div
                                    className="text-sm flex items-center gap-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Mail className="w-3 h-3" />
                                    <span>{customer.email}</span>
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "address",
                header: "Alamat",
                cell: ({ row }) => {
                    const address = row.original.address;
                    return address ? (
                        <div
                            className="text-sm flex items-start gap-1 max-w-xs"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            <span className="line-clamp-2">{address}</span>
                        </div>
                    ) : (
                        <span
                            className="text-sm italic"
                            style={{
                                color: "var(--color-text-tertiary)",
                            }}
                        >
                            Tidak ada alamat
                        </span>
                    );
                },
                size: 250,
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.original.isActive;
                    const statusLabel = row.original.statusLabel;

                    return (
                        <Badge variant={isActive ? "success" : "secondary"}>
                            <div className="flex items-center gap-1">
                                {statusLabel}
                            </div>
                        </Badge>
                    );
                },
                size: 120,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const customer = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewCustomer(customer.id)}
                                className="px-2"
                                title="Lihat Detail"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <User className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCustomer(customer.id)}
                                className="px-2"
                                title="Edit"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCustomer(customer)}
                                className="px-2"
                                title="Hapus"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 160,
            },
        ],
        [outlet.id],
    );

    return (
        <>
            <div className="space-y-6">
                {/* Main Table */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Users
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
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
                                    Daftar Pelanggan (
                                    {outlet.customers?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola pelanggan di outlet {outlet.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Export Button */}
                            <Button
                                variant="outline"
                                onClick={handleExport}
                                className="flex items-center gap-2"
                                leftIcon={<Download className="w-4 h-4" />}
                                title="Export Customer ke Excel"
                                disabled={
                                    !outlet.customers ||
                                    outlet.customers.length === 0
                                }
                            >
                                Export
                            </Button>

                            {/* Import Button */}
                            <Button
                                variant="secondary"
                                onClick={handleImport}
                                className="flex items-center gap-2"
                                leftIcon={<Upload className="w-4 h-4" />}
                                title="Import Customer dari Excel"
                            >
                                Import
                            </Button>

                            {/* Add Customer Button */}
                            <Button
                                variant="primary"
                                onClick={handleCreateCustomer}
                                className="flex items-center gap-2"
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Tambah Pelanggan
                            </Button>
                        </div>
                    </div>

                    {/* Table */}
                    <Table
                        data={outlet.customers || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada pelanggan yang terdaftar di outlet ini. Tambahkan pelanggan pertama untuk mulai membangun database pelanggan."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            {/* Delete Customer Modal */}
            <DeleteCustomerModal
                isOpen={deleteModal.isOpen}
                customer={deleteModal.customer}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={deleteModal.isLoading}
            />
        </>
    );
};

export default OutletCustomersIndex;
