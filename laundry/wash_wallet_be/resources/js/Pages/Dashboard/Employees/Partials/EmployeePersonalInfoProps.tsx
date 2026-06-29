import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { User, Phone, Mail, MapPin, Calendar, Building } from "lucide-react";
import { EmployeePersonalInfoProps } from "../types";
import { formatDate } from "@/lib/utils";

export default function EmployeePersonalInfo({
    employee,
}: EmployeePersonalInfoProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card variant="elevated" className="p-6">
                    <h3
                        className="text-lg font-semibold mb-6 flex items-center"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <User
                            className="w-5 h-5 mr-2"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                        Informasi Pribadi
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Nama Lengkap
                                </label>
                                <p
                                    className="mt-1"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.name}
                                </p>
                            </div>
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Username
                                </label>
                                <p
                                    className="mt-1"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    @{employee.username}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Telepon
                                </label>
                                <div className="flex items-center mt-1">
                                    <Phone
                                        className="w-4 h-4 mr-2"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <p
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {employee.phone || "Tidak tersedia"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Alamat
                            </label>
                            <div className="flex items-start mt-1">
                                <MapPin
                                    className="w-4 h-4 mr-2 mt-0.5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <p
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.address || "Tidak tersedia"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Tanggal Lahir
                                </label>
                                <div className="flex items-center mt-1">
                                    <Calendar
                                        className="w-4 h-4 mr-2"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <div>
                                        <p
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {employee.dateOfBirth
                                                ? formatDate(
                                                      employee.dateOfBirth,
                                                  )
                                                : "Tidak tersedia"}
                                        </p>
                                        {employee.dateOfBirth && (
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                Usia: {employee.age}
                                                tahun
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Jenis Kelamin
                                </label>
                                <div className="mt-1">
                                    <Badge
                                        variant={
                                            employee.gender === "male"
                                                ? "info"
                                                : "secondary"
                                        }
                                        size="sm"
                                    >
                                        {employee.gender === "male"
                                            ? "Laki-laki"
                                            : employee.gender === "female"
                                              ? "Perempuan"
                                              : "Tidak Diketahui"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Employment Information */}
                <Card variant="elevated" className="p-6">
                    <h3
                        className="text-lg font-semibold mb-6 flex items-center"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <Building
                            className="w-5 h-5 mr-2"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                        Informasi Pekerjaan
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Outlet
                            </label>
                            <p
                                className="mt-1"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {employee.outlet.name}
                            </p>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                {employee.outlet.street}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Tanggal Mulai
                                </label>
                                <div className="flex items-center mt-1">
                                    <Calendar
                                        className="w-4 h-4 mr-2"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <p
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatDate(employee.startDate)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Status
                                </label>
                                <div className="flex items-center mt-1">
                                    <Badge
                                        variant={
                                            employee.isActive
                                                ? "success"
                                                : "error"
                                        }
                                        size="sm"
                                    >
                                        {employee.isActive
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Login Terakhir
                            </label>
                            <div className="flex items-center mt-1">
                                <Calendar
                                    className="w-4 h-4 mr-2"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <p
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {employee.lastLoginAt
                                        ? formatDate(employee.lastLoginAt)
                                        : "Belum pernah login"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
