import React, { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Table } from "@/Components/Table";
import {
    Cog,
    DollarSign,
    Edit,
    Eye,
    Plus,
    Trash2,
    Workflow,
    Lock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { EmployeeProcess } from "@/types";
import { router } from "@inertiajs/react";
import { employeeService } from "@/Services/employee.service";
import { EmployeeProcessesIndexProps } from "./types";
import DeleteEmployeeProcessModal from "./Partials/DeleteEmployeeProcessModal";
import ShowEmployeeProcessModal from "./Partials/ShowEmployeeProcessModal";

const getCommissionTypeLabel = (type?: string) => {
    const labels: Record<string, string> = {
        per_item: "Per Item",
        per_kg: "Per Kg",
        percentage: "Persentase",
        flat: "Nominal Tetap",
    };

    return labels[type || ""] || "Tanpa Komisi";
};

const EmployeeProcessesIndex: React.FC<EmployeeProcessesIndexProps> = ({
    employee,
    isLoading = false,
}) => {
    const [showModal, setShowModal] = useState<{
        isOpen: boolean;
        employeeProcess?: EmployeeProcess;
    }>({
        isOpen: false,
        employeeProcess: undefined,
    });

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        employeeProcess?: EmployeeProcess;
        isLoading: boolean;
    }>({
        isOpen: false,
        employeeProcess: undefined,
        isLoading: false,
    });

    const handleEditProcess = (employeeProcess: EmployeeProcess) => {
        employeeService.goToEditEmployeeProcess(
            employee.id,
            employeeProcess.id,
        );
    };

    const handleShowProcess = (employeeProcess: EmployeeProcess) => {
        setShowModal({
            isOpen: true,
            employeeProcess,
        });
    };

    const handleDeleteProcess = (employeeProcess: EmployeeProcess) => {
        setDeleteModal({ isOpen: true, employeeProcess, isLoading: false });
    };

    const handleConfirmDelete = (employeeProcess: EmployeeProcess) => {
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            route("employees.employee-processes.destroy", {
                employeeId: employee.id,
                employeeProcessId: employeeProcess.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal({
                        isOpen: false,
                        employeeProcess: undefined,
                        isLoading: false,
                    });
                },
                onError: () => {
                    setDeleteModal((prev) => ({ ...prev, isLoading: false }));
                },
            },
        );
    };

    const handleCloseDeleteModal = () => {
        if (!deleteModal.isLoading) {
            setDeleteModal({
                isOpen: false,
                employeeProcess: undefined,
                isLoading: false,
            });
        }
    };

    const activeProcessesCount = useMemo(
        () =>
            (employee.employeeProcesses || []).filter((item) => item.isActive)
                .length,
        [employee.employeeProcesses],
    );

    const processesWithCommissionCount = useMemo(
        () =>
            (employee.employeeProcesses || []).filter(
                (item) => !!item.commission,
            ).length,
        [employee.employeeProcesses],
    );

    const columns: ColumnDef<EmployeeProcess>[] = useMemo(
        () => [
            {
                accessorKey: "process",
                header: "Proses",
                cell: ({ row }) => {
                    const employeeProcess = row.original;
                    const process = employeeProcess.process;

                    return (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Workflow
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
                                    {process?.name || "Unknown"}
                                </div>
                                <div
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    ID: {process?.id || "-"}
                                </div>
                            </div>
                        </div>
                    );
                },
                size: 280,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const isActive = row.original.isActive;
                    return (
                        <Badge variant={isActive ? "success" : "secondary"}>
                            {isActive ? "Aktif" : "Tidak Aktif"}
                        </Badge>
                    );
                },
                size: 140,
            },
            {
                accessorKey: "commission",
                header: "Komisi",
                cell: ({ row }) => {
                    const commission = row.original.commission;

                    if (!commission) {
                        return (
                            <span
                                className="text-sm italic"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                Belum diatur
                            </span>
                        );
                    }

                    return (
                        <div className="space-y-1">
                            <Badge variant="info" size="sm">
                                {getCommissionTypeLabel(
                                    commission.commissionType,
                                )}
                            </Badge>
                            <div
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {commission.commissionType === "percentage"
                                    ? `${commission.commissionValue}%`
                                    : formatCurrency(
                                          commission.commissionValue || 0,
                                      )}
                            </div>
                        </div>
                    );
                },
                size: 220,
            },
            {
                accessorKey: "assignedAt",
                header: "Ditambahkan",
                cell: ({ row }) => {
                    const assignedAt = row.original.assignedAt;
                    if (!assignedAt) {
                        return (
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                -
                            </span>
                        );
                    }

                    const date = new Date(assignedAt);
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
                    const employeeProcess = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    handleShowProcess(employeeProcess)
                                }
                                className="px-2"
                                title="Lihat"
                            >
                                <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() =>
                                    handleEditProcess(employeeProcess)
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
                                    handleDeleteProcess(employeeProcess)
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
        [],
    );

    if (employee.isEligibleForProduction === false) {
        return (
            <div className="space-y-6">
                <Card variant="elevated" className="border-2 border-dashed p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                        <div
                            className="rounded-full p-4"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                                color: "var(--color-warning-600)",
                            }}
                        >
                            <Lock className="h-12 w-12" />
                        </div>
                        <div className="space-y-2">
                            <h3
                                className="text-xl font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Proses Produksi Terkunci
                            </h3>
                            <p
                                className="mx-auto max-w-md text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Karyawan ini tidak memiliki posisi Produksi aktif. Silakan tambahkan posisi Produksi di tab Posisi terlebih dahulu untuk dapat mengatur proses kerjanya.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p
                                className="text-sm mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Proses
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                {employee.employeeProcessesCount || 0}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Workflow
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
                                Proses Aktif
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {activeProcessesCount}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <Cog
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-success-600)",
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
                                Komisi Terpasang
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            >
                                {processesWithCommissionCount}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <DollarSign
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-info-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Workflow
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
                                Daftar Proses Karyawan
                            </h3>
                            <p
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Proses kerja yang bisa ditangani oleh{" "}
                                {employee.name}
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() =>
                            router.get(
                                route("employees.employee-processes.setting", {
                                    employeeId: employee.id,
                                }),
                            )
                        }
                        leftIcon={<Cog className="w-4 h-4" />}
                    >
                        Setting Proses
                    </Button>
                </div>

                <Table
                    data={employee.employeeProcesses || []}
                    columns={columns}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    enableRowSelection={false}
                    emptyMessage="Belum ada proses yang ditugaskan untuk karyawan ini."
                    pageSize={10}
                    className="w-full"
                />
            </Card>

            <DeleteEmployeeProcessModal
                isOpen={deleteModal.isOpen}
                employee={employee}
                employeeProcess={deleteModal.employeeProcess}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={deleteModal.isLoading}
            />

            <ShowEmployeeProcessModal
                isOpen={showModal.isOpen}
                employee={employee}
                employeeProcess={showModal.employeeProcess}
                onClose={() =>
                    setShowModal({
                        isOpen: false,
                        employeeProcess: undefined,
                    })
                }
            />
        </div>
    );
};

export default EmployeeProcessesIndex;
