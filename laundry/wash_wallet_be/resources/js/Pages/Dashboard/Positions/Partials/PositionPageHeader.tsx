import React from "react";
import { MapPin, Calendar, Building2, Users, Briefcase } from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatDate } from "@/lib/utils";
import { PositionPageHeaderProps } from "../types";

const PositionPageHeader: React.FC<PositionPageHeaderProps> = ({
    position,
    isLoading = false,
}) => {
    const employeeCount = position.employeePositions?.length || 0;
    const activeEmployees =
        position.employeePositions?.filter((ep) => ep.employee?.isActive)
            .length || 0;

    return (
        <Card
            variant="elevated"
            className="p-6 mb-6 backdrop-blur-sm border-border/50"
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Briefcase
                                className="w-8 h-8"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="space-y-2">
                                <h1
                                    className="text-2xl lg:text-3xl font-bold leading-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {position.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge
                                        variant={
                                            position.isActive
                                                ? "success"
                                                : "secondary"
                                        }
                                        className="font-semibold"
                                    >
                                        {position.isActive
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </Badge>
                                    <span
                                        className="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        ID: #{position.id}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Users
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        />
                                        <span
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {employeeCount} Karyawan
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        <div className="flex items-start gap-3">
                            <Briefcase
                                className="w-5 h-5 mt-0.5 flex-shrink-0"
                                style={{
                                    color: "var(--color-primary-500)",
                                }}
                            />
                            <div className="min-w-0 flex-1">
                                <p
                                    className="text-xs font-medium mb-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Deskripsi Posisi
                                </p>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {position.description ||
                                        "Tidak ada deskripsi"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Building2
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-xs font-medium mb-1"
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
                                        {position.outlet.name}
                                    </p>
                                    {position.outlet.code && (
                                        <p
                                            className="text-xs font-mono"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {position.outlet.code}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {(position.outlet.street ||
                                position.outlet.cityName) && (
                                <div className="flex items-start gap-3">
                                    <MapPin
                                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-xs font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            Lokasi
                                        </p>
                                        {position.outlet.street && (
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {position.outlet.street}
                                            </p>
                                        )}
                                        {position.outlet.cityName && (
                                            <p
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                {position.outlet.cityName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border/50">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Calendar
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                />
                                <span
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Dibuat: {formatDate(position.createdAt)}
                                </span>
                            </div>
                            {position.updatedAt !== position.createdAt && (
                                <>
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        •
                                    </span>
                                    <span
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Diperbarui:{" "}
                                        {formatDate(position.updatedAt)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {!position.isActive && (
                <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-800 text-xs font-bold">
                                !
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Posisi Tidak Aktif
                            </h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                Posisi ini saat ini tidak aktif dan tidak dapat
                                digunakan untuk karyawan baru. Riwayat karyawan
                                yang pernah memegang posisi ini tetap tersimpan.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default PositionPageHeader;
