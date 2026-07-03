import React from "react";
import { MapPin, Phone, Edit, Trash2, Building2, KeyRound } from "lucide-react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Avatar } from "@/Components/Avatar";
import { EmployeePageHeaderProps } from "../types";

const EmployeePageHeader: React.FC<EmployeePageHeaderProps> = ({
    employee,
    onEdit,
    onChangePassword,
    onDelete,
    isLoading = false,
}) => {
    return (
        <Card
            variant="elevated"
            className="p-6 mb-6 backdrop-blur-sm border-border/50"
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-4 min-w-0">
                                <Avatar
                                    src={employee.avatar}
                                    name={employee.name}
                                    alt={employee.name}
                                    size="xl"
                                    shape="circle"
                                    bordered
                                    className="shrink-0"
                                />
                                <div className="space-y-2 min-w-0">
                                    <h1
                                        className="text-2xl lg:text-3xl font-bold leading-tight truncate"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {employee.name}
                                    </h1>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={
                                                employee.isActive
                                                    ? "success"
                                                    : "secondary"
                                            }
                                            className="font-semibold"
                                        >
                                            {employee.isActive
                                                ? "Aktif"
                                                : "Tidak Aktif"}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Posisi dan Outlet */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Posisi & Outlet */}
                        <div className="space-y-3">
                            {/* Outlet */}
                            {employee.outlet && (
                                <div className="flex items-start gap-3">
                                    <Building2
                                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-sm font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Outlet
                                        </p>
                                        <p
                                            className="text-sm font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {employee.outlet.name}
                                        </p>
                                        {employee.outlet.code && (
                                            <p
                                                className="text-xs font-mono"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                #{employee.outlet.code}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Kontak */}
                        <div className="space-y-3">
                            {/* Telepon */}
                            {employee.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone
                                        className="w-5 h-5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Telepon
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {employee.phone}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alamat */}
                    {employee.address && (
                        <div className="space-y-2">
                            <div className="flex items-start gap-3">
                                <MapPin
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Alamat
                                    </p>
                                    <p
                                        className="text-sm leading-relaxed break-words"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {employee.address}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bagian Kanan - Tombol Aksi */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[200px]">
                    {/* Primary Action - Edit */}
                    {onEdit && (
                        <Button
                            variant="primary"
                            size="md"
                            leftIcon={<Edit className="w-4 h-4" />}
                            onClick={onEdit}
                            disabled={isLoading}
                            fullWidth
                            className="lg:w-full"
                            shadow
                        >
                            Edit Karyawan
                        </Button>
                    )}

                    {/* Secondary Actions */}
                    <div className="flex gap-2 lg:flex-col lg:gap-3">
                        {onChangePassword && (
                            <Button
                                variant="outline"
                                size="md"
                                leftIcon={<KeyRound className="w-4 h-4" />}
                                onClick={onChangePassword}
                                disabled={isLoading || !employee.isActive}
                                className="flex-1 lg:w-full"
                                tooltip={
                                    !employee.isActive
                                        ? "Karyawan tidak aktif"
                                        : undefined
                                }
                            >
                                Ganti Password
                            </Button>
                        )}

                        {onDelete && (
                            <Button
                                variant="danger"
                                size="md"
                                leftIcon={<Trash2 className="w-4 h-4" />}
                                onClick={onDelete}
                                disabled={isLoading || !employee.isActive}
                                className="flex-1 lg:w-full"
                                tooltip={
                                    !employee.isActive
                                        ? "Karyawan sudah tidak aktif"
                                        : undefined
                                }
                            >
                                Hapus
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Karyawan tidak aktif warning */}
            {!employee.isActive && (
                <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-800 text-xs font-bold">
                                !
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Karyawan Tidak Aktif
                            </h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                Karyawan ini saat ini tidak aktif dan tidak
                                dapat menerima tugas baru. Silakan aktifkan
                                kembali jika diperlukan.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default EmployeePageHeader;
