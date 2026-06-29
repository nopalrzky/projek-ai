import React, { useState, useMemo } from "react";
import { router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Table } from "@/Components/Table";
import {
    DollarSign,
    Plus,
    Edit,
    Trash2,
    Briefcase,
    TrendingUp,
    Info,
    AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { EmployeeSalary } from "@/types";
import employeeService from "@/Services/employee.service";
import DeleteEmployeeSalaryModal from "../EmployeeSalaries/Partials/DeleteEmployeeSalaryModal";
import { EmployeeSalariesIndexProps } from "./types";

const EmployeeSalaries: React.FC<EmployeeSalariesIndexProps> = ({
    employee,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        employeeSalary?: EmployeeSalary;
        isLoading: boolean;
    }>({
        isOpen: false,
        employeeSalary: undefined,
        isLoading: false,
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const handleAddSalary = () => {
        employeeService.goToCreateEmployeeSalary(employee.id);
    };

    const handleEditSalary = (employeeSalary: EmployeeSalary) => {
        employeeService.goToEditEmployeeSalary(employee.id, employeeSalary.id);
    };

    const handleDeleteSalary = (employeeSalary: EmployeeSalary) => {
        setDeleteModal({
            isOpen: true,
            employeeSalary,
            isLoading: false,
        });
    };

    const handleCloseDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            employeeSalary: undefined,
            isLoading: false,
        });
    };

    const handleConfirmDelete = (employeeSalary: EmployeeSalary) => {
        setDeleteModal((prev) => ({ ...prev, isLoading: true }));

        router.delete(
            route("employees.employee-salaries.destroy", {
                employeeId: employee.id,
                employeeSalaryId: employeeSalary.id,
            }),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDeleteModal({
                        isOpen: false,
                        employeeSalary: undefined,
                        isLoading: false,
                    });
                },
                onError: () => {
                    setDeleteModal((prev) => ({ ...prev, isLoading: false }));
                },
            },
        );
    };

    const getSalaryTypeBadge = (type: string) => {
        const variants: Record<
            string,
            {
                variant:
                    | "primary"
                    | "success"
                    | "warning"
                    | "secondary"
                    | "info"
                    | "default";
                label: string;
            }
        > = {
            monthly: { variant: "primary", label: "Bulanan" },
            daily: { variant: "success", label: "Harian" },
            hourly: { variant: "warning", label: "Per Jam" },
            once: { variant: "secondary", label: "Sekali" },
            overtime: { variant: "info", label: "Lembur" },
            allowance: { variant: "default", label: "Tunjangan" },
        };
        return variants[type] || { variant: "default", label: type };
    };

    const totalSalary = useMemo(() => {
        return (employee.employeeSalaries || []).reduce(
            (sum, es) => sum + (es.amount || 0),
            0,
        );
    }, [employee.employeeSalaries]);

    const salaryBreakdown = useMemo(() => {
        const breakdown: Record<string, number> = {};
        (employee.employeeSalaries || []).forEach((es) => {
            const type = es.salary?.type || "other";
            breakdown[type] = (breakdown[type] || 0) + (es.amount || 0);
        });
        return breakdown;
    }, [employee.employeeSalaries]);

    const columns: ColumnDef<EmployeeSalary>[] = useMemo(
        () => [
            {
                accessorKey: "salary",
                header: "Komponen Gaji",
                cell: ({ row }) => {
                    const employeeSalary = row.original;
                    const salary = employeeSalary.salary;
                    const salaryBadge = getSalaryTypeBadge(salary?.type || "");

                    return (
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <DollarSign
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
                                    {salary?.name || "Unknown"}
                                </div>
                                <Badge variant={salaryBadge.variant} size="sm">
                                    {salaryBadge.label}
                                </Badge>
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
                    const salary = row.original.salary;
                    return (
                        <div
                            className="text-sm max-w-xs line-clamp-2"
                            style={{
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            {salary?.description || (
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
                accessorKey: "amount",
                header: "Jumlah",
                cell: ({ row }) => {
                    const amount = row.original.amount;
                    const salaryType = row.original.salary?.type;
                    const salaryBadge = getSalaryTypeBadge(salaryType || "");

                    return (
                        <div className="space-y-1">
                            <div
                                className="font-bold text-lg"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {formatCurrency(amount || 0)}
                            </div>
                            <div
                                className="text-xs"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                Per {salaryBadge.label}
                            </div>
                        </div>
                    );
                },
                size: 180,
            },
            {
                id: "actions",
                header: "Aksi",
                cell: ({ row }) => {
                    const employeeSalary = row.original;

                    return (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="warning"
                                size="sm"
                                onClick={() => handleEditSalary(employeeSalary)}
                                className="px-2"
                                tooltip="Edit"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                    handleDeleteSalary(employeeSalary)
                                }
                                className="px-2"
                                tooltip="Hapus"
                            >
                                <Trash2 className="w-4 h-4" />
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

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <motion.div variants={itemVariants}>
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className="text-sm mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Gaji
                                </p>
                                <p
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                >
                                    {formatCurrency(totalSalary)}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <DollarSign
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className="text-sm mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Komponen Gaji
                                </p>
                                <p
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {employee.employeeSalariesCount || 0}
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
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p
                                    className="text-sm mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Gaji Bulanan
                                </p>
                                <p
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-info-600)",
                                    }}
                                >
                                    {formatCurrency(
                                        salaryBreakdown.monthly || 0,
                                    )}
                                </p>
                            </div>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <TrendingUp
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-info-600)",
                                    }}
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Salary Breakdown */}
            {Object.keys(salaryBreakdown).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <Info
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-info-600)",
                                    }}
                                />
                            </div>
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Breakdown Gaji
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {Object.entries(salaryBreakdown).map(
                                ([type, amount]) => {
                                    const badge = getSalaryTypeBadge(type);
                                    return (
                                        <div
                                            key={type}
                                            className="p-4 rounded-lg border"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                                backgroundColor:
                                                    "var(--color-surface-secondary)",
                                            }}
                                        >
                                            <Badge
                                                variant={badge.variant}
                                                size="sm"
                                                className="mb-2"
                                            >
                                                {badge.label}
                                            </Badge>
                                            <p
                                                className="text-sm font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {formatCurrency(amount)}
                                            </p>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Info Alert */}
            {(!employee.employeeSalaries ||
                employee.employeeSalaries.length === 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card variant="elevated" className="p-4 border-2">
                        <div className="flex items-start gap-3">
                            <div
                                className="p-2 rounded-full"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <AlertCircle
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-info-600)",
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <h4
                                    className="font-semibold mb-1"
                                    style={{
                                        color: "var(--color-info-700)",
                                    }}
                                >
                                    Belum Ada Komponen Gaji
                                </h4>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-info-600)",
                                    }}
                                >
                                    {employee.name} belum memiliki komponen
                                    gaji. Tambahkan komponen gaji untuk mulai
                                    mengelola kompensasi karyawan.
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Main Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg"
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
                                    Daftar Komponen Gaji
                                </h3>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kelola komponen gaji untuk {employee.name}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleAddSalary}
                            leftIcon={<Plus className="w-4 h-4" />}
                        >
                            Tambah Gaji
                        </Button>
                    </div>

                    <Table
                        data={employee.employeeSalaries || []}
                        columns={columns}
                        isLoading={isLoading}
                        enableSorting={true}
                        enablePagination={true}
                        enableRowSelection={false}
                        emptyMessage={`Belum ada komponen gaji untuk ${employee.name}. Tambahkan gaji pertama untuk mulai mengelola kompensasi.`}
                        pageSize={10}
                        className="w-full"
                    />
                </Card>
            </motion.div>

            {/* Delete Modal */}
            <DeleteEmployeeSalaryModal
                isOpen={deleteModal.isOpen}
                employeeSalary={deleteModal.employeeSalary}
                employee={employee}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
                isLoading={deleteModal.isLoading}
            />
        </div>
    );
};

export default EmployeeSalaries;
