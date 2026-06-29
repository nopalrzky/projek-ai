import React, { useState, useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Table } from "@/Components/Table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Briefcase, Plus, Edit, Trash2 } from "lucide-react";
import { router } from "@inertiajs/react";
import { EmployeePosition } from "@/types";
import { EmployeePositionsIndexProps } from "./types";
import CreateEmployeePositionModal from "./Partials/CreateEmployeePositionModal";
import EditEmployeePositionModal from "./Partials/EditEmployeePositionModal";
import DeleteEmployeePositionModal from "./Partials/DeleteEmployeePositionModal";

const EmployeePositionsIndex: React.FC<EmployeePositionsIndexProps> = ({
    employee,
    positions,
    isLoading = false,
}) => {
    const [createModal, setCreateModal] = useState(false);

    const [editModal, setEditModal] = useState<{
        isOpen: boolean;
        employeePosition?: EmployeePosition;
    }>({
        isOpen: false,
        employeePosition: undefined,
    });

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        employeePosition?: EmployeePosition;
        isLoading: boolean;
    }>({
        isOpen: false,
        employeePosition: undefined,
        isLoading: false,
    });

    const employeePositions = useMemo(
        () => employee.employeePositions || [],
        [employee.employeePositions],
    );

    const activePositionsCount = useMemo(
        () => employeePositions.filter((item) => item.isActive).length,
        [employeePositions],
    );

    const handleAddPosition = useCallback(() => {
        setCreateModal(true);
    }, []);

    const handleEditPosition = useCallback(
        (employeePosition: EmployeePosition) => {
            setEditModal({
                isOpen: true,
                employeePosition,
            });
        },
        [],
    );

    const handleDeletePosition = useCallback(
        (employeePosition: EmployeePosition) => {
            setDeleteModal({
                isOpen: true,
                employeePosition,
                isLoading: false,
            });
        },
        [],
    );

    const handleConfirmDelete = useCallback(
        (employeePosition: EmployeePosition) => {
            setDeleteModal((prev) => ({ ...prev, isLoading: true }));

            router.delete(
                route("employees.employee-positions.destroy", {
                    employeeId: employee.id,
                    employeePositionId: employeePosition.id,
                }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setDeleteModal({
                            isOpen: false,
                            employeePosition: undefined,
                            isLoading: false,
                        });
                    },
                    onError: () => {
                        setDeleteModal((prev) => ({
                            ...prev,
                            isLoading: false,
                        }));
                    },
                },
            );
        },
        [employee.id],
    );

    const handleCloseDeleteModal = useCallback(() => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                employeePosition: undefined,
                isLoading: false,
            });
        }
    }, [deleteModal.isLoading]);

    const handleSuccess = useCallback(() => {
        router.reload();
    }, []);

    const columns: ColumnDef<EmployeePosition>[] = useMemo(
        () => [
            {
                accessorKey: "position",
                header: "Posisi",
                cell: ({ row }) => {
                    const employeePosition = row.original;
                    const position = employeePosition.position;

                    return (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Briefcase
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div className="space-y-1">
                                <div
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {position?.name || "Unknown"}
                                    {position?.outlet && (
                                        <span className="text-xs font-normal ml-1.5 opacity-70">
                                            ({position.outlet.name})
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    ID: {position?.id || "-"}
                                </div>
                            </div>
                        </div>
                    );
                },
                size: 250,
            },

            {
                accessorKey: "description",
                header: "Deskripsi",
                cell: ({ row }) => {
                    const position = row.original.position;
                    return (
                        <div
                            className="text-sm max-w-xs"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {position?.description || (
                                <span
                                    className="italic"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Tidak ada deskripsi
                                </span>
                            )}
                        </div>
                    );
                },
                size: 300,
            },

            {
                accessorKey: "isActive",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.original.isActive;
                    return (
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                    );
                },
                size: 120,
            },

            {
                accessorKey: "createdAt",
                header: "Ditambahkan",
                cell: ({ row }) => {
                    const date = new Date(row.original.createdAt);
                    return (
                        <div
                            className="text-sm"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {date.toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            })}
                        </div>
                    );
                },
                size: 150,
            },

            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const employeePosition = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() =>
                                    handleEditPosition(employeePosition)
                                }
                                className="px-2"
                                title="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                    handleDeletePosition(employeePosition)
                                }
                                className="px-2"
                                title="Hapus"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
                size: 130,
            },
        ],
        [handleDeletePosition, handleEditPosition],
    );

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className="text-sm mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Posisi
                                </p>
                                <p
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {employeePositions.length}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Briefcase
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className="text-sm mb-2"
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
                                    {activePositionsCount}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <Briefcase
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
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
                                <Briefcase
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
                                    Daftar Posisi ({employeePositions.length})
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola posisi untuk {employee.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleAddPosition}
                            className="flex items-center gap-2"
                            leftIcon={<Plus />}
                        >
                            Tambah Posisi
                        </Button>
                    </div>

                    {/* Table */}
                    <Table
                        data={employeePositions}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        enableRowSelection={false}
                        emptyMessage="Belum ada posisi untuk karyawan ini. Tambahkan posisi pertama untuk mulai mengelola tugas karyawan."
                        pageSize={10}
                        rows={5}
                        className="w-full"
                    />
                </Card>
            </div>

            <CreateEmployeePositionModal
                isOpen={createModal}
                employee={employee}
                positions={positions}
                onClose={() => setCreateModal(false)}
                onSuccess={handleSuccess}
            />

            {editModal.employeePosition && (
                <EditEmployeePositionModal
                    isOpen={editModal.isOpen}
                    employee={employee}
                    employeePosition={editModal.employeePosition}
                    positions={positions}
                    onClose={() =>
                        setEditModal({
                            isOpen: false,
                            employeePosition: undefined,
                        })
                    }
                    onSuccess={handleSuccess}
                />
            )}

            <DeleteEmployeePositionModal
                isOpen={deleteModal.isOpen}
                employee={employee}
                employeePosition={deleteModal.employeePosition}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={deleteModal.isLoading}
            />
        </>
    );
};

export default EmployeePositionsIndex;
