import React, { useState, useMemo, useCallback } from "react";
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
    UserCheck,
    UserX,
    Phone,
    MapPin,
    Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Employee } from "@/types";
import DeleteEmployeeModal from "./Partials/DeleteEmployeeModal";
import { OutletEmployeesProps } from "./types";
import outletService from "@/Services/outlet.service";
import { router } from "@inertiajs/react";

const OutletEmployeesIndex: React.FC<OutletEmployeesProps> = ({
    outlet,
    isLoading = false,
}) => {
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        employee?: Employee;
    }>({ show: false });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCreateEmployee = () => {
        outletService.goToCreateEmployee(outlet.id);
    };

    const handleEditEmployee = (employeeId: number) => {
        outletService.goToEditEmployee(outlet.id, employeeId);
    };

    const handleShowEmployee = (employeeId: number) => {
        outletService.goToShowEmployee(outlet.id, employeeId);
    };

    const handleDeleteClick = useCallback((employee: Employee) => {
        setDeleteModal({ show: true, employee });
    }, []);

    const handleConfirmDelete = useCallback(
        async (employee: Employee) => {
            try {
                setIsDeleting(true);

                router.delete(
                    route("outlets.employees.destroy", [
                        outlet.id,
                        employee.id,
                    ]),
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setDeleteModal({ show: false });
                            setIsDeleting(false);
                        },
                        onError: (errors) => {
                            console.error("Delete employee error:", errors);
                            setIsDeleting(false);
                        },
                        onFinish: () => {
                            setIsDeleting(false);
                        },
                    },
                );
            } catch (error) {
                console.error("Delete employee error:", error);
                setIsDeleting(false);
            }
        },
        [outlet.id],
    );

    const handleCloseDeleteModal = useCallback(() => {
        if (!isDeleting) {
            setDeleteModal({ show: false });
        }
    }, [isDeleting]);

    const columns: ColumnDef<Employee>[] = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Karyawan",
                cell: ({ row }) => {
                    const employee = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-1">
                                <div
                                    className="font-medium cursor-pointer hover:underline"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                    onClick={() =>
                                        handleShowEmployee(employee.id)
                                    }
                                >
                                    {employee.name}
                                </div>
                                <div
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    @{employee.username}
                                </div>
                            </div>
                        </div>
                    );
                },
                size: 250,
            },
            {
                accessorKey: "phone",
                header: "Kontak",
                cell: ({ row }) => {
                    const employee = row.original;
                    return (
                        <div className="space-y-1.5">
                            {employee.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone
                                        className="w-3.5 h-3.5"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                    <span
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {employee.phone}
                                    </span>
                                </div>
                            )}
                            {employee.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin
                                        className="w-3.5 h-3.5"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                    <span
                                        className="text-sm truncate max-w-[200px]"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                        title={employee.address}
                                    >
                                        {employee.address}
                                    </span>
                                </div>
                            )}
                            {!employee.phone && !employee.address && (
                                <span
                                    className="text-sm italic"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tidak ada kontak
                                </span>
                            )}
                        </div>
                    );
                },
                size: 220,
            },
            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.original.isActive;
                    return (
                        <Badge variant={isActive ? "success" : "error"}>
                            <div className="flex items-center gap-1">
                                {isActive ? "Aktif" : "Nonaktif"}
                            </div>
                        </Badge>
                    );
                },
                size: 120,
            },
            {
                accessorKey: "startDate",
                header: "Bergabung",
                cell: ({ row }) => {
                    const date = row.original.startDate;
                    return (
                        <div
                            className="text-sm flex items-center gap-1"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            <Clock className="w-3 h-3" />
                            {formatDate(date)}
                        </div>
                    );
                },
                size: 150,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const employee = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditEmployee(employee.id)}
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteClick(employee)}
                                className="px-2"
                                title="Hapus"
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
        [outlet.id, handleDeleteClick],
    );

    return (
        <>
            <div className="space-y-6">
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
                                    Daftar Karyawan (
                                    {outlet.employees?.length || 0})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola karyawan di outlet {outlet.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleCreateEmployee}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Karyawan
                        </Button>
                    </div>

                    <Table
                        data={outlet.employees || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        emptyMessage="Belum ada karyawan yang terdaftar di outlet ini. Tambahkan karyawan pertama untuk mulai mengelola tim outlet."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <DeleteEmployeeModal
                isOpen={deleteModal.show}
                employee={deleteModal.employee}
                onClose={handleCloseDeleteModal}
                onConfirm={() => {
                    if (deleteModal.employee) {
                        handleConfirmDelete(deleteModal.employee);
                    }
                }}
                isLoading={isDeleting}
            />
        </>
    );
};

export default OutletEmployeesIndex;
