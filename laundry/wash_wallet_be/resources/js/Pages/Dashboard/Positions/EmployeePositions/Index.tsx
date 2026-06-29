import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Users, User, Phone, Mail, Eye } from "lucide-react";
import { router } from "@inertiajs/react";
import { EmployeePosition } from "@/types";
import { formatDate } from "@/lib/utils";
import { PositionEmployeesIndexProps } from "./types";

const PositionEmployeesIndex: React.FC<PositionEmployeesIndexProps> = ({
    position,
}) => {
    const handleViewEmployee = (employeeId: number) => {
        router.visit(route("employees.show", employeeId));
    };

    const columns: ColumnDef<EmployeePosition>[] = useMemo(
        () => [
            {
                accessorKey: "employee",
                header: "Karyawan",
                cell: ({ row }) => {
                    const employeePosition = row.original;
                    const employee = employeePosition.employee;

                    return (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold"
                                style={{
                                    backgroundColor: "var(--color-primary-500)",
                                }}
                            >
                                {employee?.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="space-y-1">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee?.name || "Unknown"}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    @{employee?.username || "-"}
                                </div>
                            </div>
                        </div>
                    );
                },
                size: 250,
            },

            {
                accessorKey: "contact",
                header: "Kontak",
                cell: ({ row }) => {
                    const employee = row.original.employee;
                    return (
                        <div className="space-y-1">
                            {employee?.phone && (
                                <div
                                    className="text-sm flex items-center gap-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    <Phone className="w-3 h-3" />
                                    <span>{employee.phone}</span>
                                </div>
                            )}
                            {!employee?.phone && (
                                <span
                                    className="text-sm italic"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tidak ada telepon
                                </span>
                            )}
                        </div>
                    );
                },
                size: 180,
            },

            {
                accessorKey: "employee.isActive",
                header: "Status Karyawan",
                cell: ({ row }) => {
                    const employee = row.original.employee;
                    return (
                        <Badge
                            variant={
                                employee?.isActive ? "success" : "secondary"
                            }
                        >
                            {employee?.isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                    );
                },
                size: 150,
            },

            {
                accessorKey: "isActive",
                header: "Status Posisi",
                cell: ({ row }) => {
                    const isActive = row.original.isActive;
                    return (
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? "Aktif" : "Tidak Aktif"}
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
                        <div
                            className="text-sm"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {formatDate(row.original.createdAt)}
                        </div>
                    );
                },
                size: 150,
            },

            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const employee = row.original.employee;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewEmployee(employee?.id)}
                                className="px-2"
                                title="Lihat Detail Karyawan"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 100,
            },
        ],
        [],
    );

    const employeePositions = position.employeePositions || [];
    const activeCount = employeePositions.filter((ep) => ep.isActive).length;

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
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
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Karyawan
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {employeePositions.length}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <User
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Posisi Aktif
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {activeCount}
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-gray-100)",
                            }}
                        >
                            <User
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-gray-600)",
                                }}
                            />
                        </div>
                        <div>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Posisi Nonaktif
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {employeePositions.length - activeCount}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table Card */}
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
                                Daftar Karyawan ({employeePositions.length})
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Karyawan yang memegang posisi {position.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <Table
                    data={employeePositions}
                    columns={columns}
                    isLoading={false}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada karyawan yang memegang posisi ini."
                    pageSize={10}
                    rows={5}
                    className="w-full"
                />
            </Card>
        </div>
    );
};

export default PositionEmployeesIndex;
