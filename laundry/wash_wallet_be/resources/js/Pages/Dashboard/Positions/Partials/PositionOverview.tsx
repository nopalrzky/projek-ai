import React, { useMemo } from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    Users,
    UserCheck,
    UserX,
    Activity,
    Briefcase,
    Building2,
    Calendar,
    FileText,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { PositionOverviewProps } from "../types";

const PositionOverview: React.FC<PositionOverviewProps> = ({ position }) => {
    // Calculate employee statistics
    const employeeStats = useMemo(() => {
        const employeePositions = position.employeePositions || [];
        const total = employeePositions.length;
        const active = employeePositions.filter(
            (ep) => ep.employee?.isActive,
        ).length;
        const inactive = total - active;

        return { total, active, inactive };
    }, [position.employeePositions]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Karyawan
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {employeeStats.total}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Users
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Karyawan Aktif
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {employeeStats.active}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <UserCheck
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Karyawan Nonaktif
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {employeeStats.inactive}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-gray-100)",
                            }}
                        >
                            <UserX
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-gray-500)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Status Posisi
                            </p>
                            <p
                                className="text-lg font-semibold mt-1"
                                style={{
                                    color: position.isActive
                                        ? "var(--color-success-600)"
                                        : "var(--color-gray-500)",
                                }}
                            >
                                {position.isActive ? "Aktif" : "Tidak Aktif"}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: position.isActive
                                    ? "var(--color-success-100)"
                                    : "var(--color-gray-100)",
                            }}
                        >
                            <Activity
                                className="w-6 h-6"
                                style={{
                                    color: position.isActive
                                        ? "var(--color-success-600)"
                                        : "var(--color-gray-500)",
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            <Card variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-6">
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
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Informasi Posisi
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Nama Posisi
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {position.name}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Status
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <Badge
                                    variant={
                                        position.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {position.isActive
                                        ? "Aktif"
                                        : "Tidak Aktif"}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Karyawan
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Users
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <p
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {employeeStats.total} orang
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Deskripsi
                            </label>
                            <div
                                className="p-3 rounded-lg min-h-[100px]"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                {position.description ? (
                                    <div className="flex items-start gap-2">
                                        <FileText
                                            className="w-4 h-4 mt-0.5"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <p
                                            className="leading-relaxed"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {position.description}
                                        </p>
                                    </div>
                                ) : (
                                    <p
                                        className="italic"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tidak ada deskripsi
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Dibuat
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <p
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatDate(position.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Terakhir Diupdate
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <p
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatDate(position.updatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {position.permissions && position.permissions.length > 0 && (
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Activity
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <h3
                            className="text-lg font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Hak Akses / Izin (Permissions)
                        </h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {position.permissions.map((perm) => (
                            <Badge key={perm} variant="warning">
                                {perm}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}

            <Card variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-info-100)",
                        }}
                    >
                        <Building2
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
                        Informasi Outlet
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Nama Outlet
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {position.outlet.name}
                                </p>
                                {position.outlet.code && (
                                    <p
                                        className="text-xs font-mono mt-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {position.outlet.code}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Status Outlet
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <Badge
                                    variant={
                                        position.outlet.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {position.outlet.isActive
                                        ? "Aktif"
                                        : "Tidak Aktif"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {(position.outlet.street ||
                            position.outlet.cityName) && (
                                <div>
                                    <label
                                        className="text-sm font-medium block mb-2"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Lokasi
                                    </label>
                                    <div
                                        className="p-3 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-surface-secondary)",
                                        }}
                                    >
                                        {position.outlet.street && (
                                            <p
                                                className="mb-1"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {position.outlet.street}
                                            </p>
                                        )}
                                        {position.outlet.cityName && (
                                            <p
                                                className="text-sm"
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
            </Card>

            <Card variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-success-100)",
                        }}
                    >
                        <Users
                            className="w-5 h-5"
                            style={{
                                color: "var(--color-success-600)",
                            }}
                        />
                    </div>
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Statistik Karyawan
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Karyawan
                            </span>
                            <span
                                className="text-xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {employeeStats.total}
                            </span>
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-success-50)",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-success-700)",
                                }}
                            >
                                Karyawan Aktif
                            </span>
                            <span
                                className="text-xl font-bold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                {employeeStats.active}
                            </span>
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-gray-50)",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="text-sm"
                                style={{
                                    color: "var(--color-gray-700)",
                                }}
                            >
                                Karyawan Nonaktif
                            </span>
                            <span
                                className="text-xl font-bold"
                                style={{
                                    color: "var(--color-gray-600)",
                                }}
                            >
                                {employeeStats.inactive}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PositionOverview;
