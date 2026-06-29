import React from "react";
import { router } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    Users,
    Package,
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { CategoryOutletProps } from "../types";
import { formatDate } from "@/lib/utils";

const CategoryOutlet: React.FC<CategoryOutletProps> = ({ outlet }) => {
    const handleViewOutlet = () => {
        router.visit(route("outlets.show", outlet.id));
    };

    const handleViewEmployees = () => {
        router.visit(route("outlets.employees.index", outlet.id));
    };

    const handleViewCategories = () => {
        router.visit(
            route("categories.index", {
                outletId: outlet.id,
            })
        );
    };

    return (
        <div className="space-y-6">
            {/* Main Outlet Card */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Building2
                                className="w-8 h-8"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h2
                                className="text-2xl font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {outlet.name}
                            </h2>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        outlet.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                    className="font-semibold"
                                >
                                    {outlet.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                                <span
                                    className="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {outlet.code}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleViewOutlet}
                        rightIcon={<ExternalLink className="w-4 h-4" />}
                    >
                        Lihat Detail Outlet
                    </Button>
                </div>

                {/* Outlet Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <Users
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-info-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Karyawan
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.employeesCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-warning-100)",
                                }}
                            >
                                <Package
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-warning-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Kategori
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.categoriesCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <Activity
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                            </div>
                            <div>
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Layanan
                                </p>
                                <p
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.laundryServicesCount || 0}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: outlet.isActive
                                        ? "var(--color-success-100)"
                                        : "var(--color-error-100)",
                                }}
                            >
                                {outlet.isActive ? (
                                    <CheckCircle2
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-success-600)",
                                        }}
                                    />
                                ) : (
                                    <XCircle
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-error-600)",
                                        }}
                                    />
                                )}
                            </div>
                            <div>
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Status
                                </p>
                                <p
                                    className="text-lg font-bold"
                                    style={{
                                        color: outlet.isActive
                                            ? "var(--color-success-600)"
                                            : "var(--color-error-600)",
                                    }}
                                >
                                    {outlet.isActive ? "Aktif" : "Nonaktif"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div
                    className="border-t pt-6"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Informasi Kontak
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Address */}
                        {outlet.fullAddress && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <label
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Alamat Lengkap
                                    </label>
                                </div>
                                <p
                                    className="text-sm leading-relaxed ml-6"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.fullAddress}
                                </p>
                            </div>
                        )}

                        {/* Phone */}
                        {outlet.phone && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <label
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Telepon
                                    </label>
                                </div>
                                <a
                                    href={`tel:${outlet.phone}`}
                                    className="text-sm ml-6 hover:underline"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {outlet.phone}
                                </a>
                            </div>
                        )}

                        {/* Email */}
                        {outlet.email && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <label
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Email
                                    </label>
                                </div>
                                <a
                                    href={`mailto:${outlet.email}`}
                                    className="text-sm ml-6 hover:underline"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {outlet.email}
                                </a>
                            </div>
                        )}

                        {/* Created At */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Clock
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Dibuat
                                </label>
                            </div>
                            <p
                                className="text-sm ml-6"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {formatDate(outlet.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Warning if Outlet is Inactive */}
            {!outlet.isActive && (
                <div
                    className="p-4 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-warning-50)",
                        borderColor: "var(--color-warning-200)",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <XCircle
                                className="w-4 h-4"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h4
                                className="text-sm font-semibold mb-1"
                                style={{
                                    color: "var(--color-warning-700)",
                                }}
                            >
                                Outlet Tidak Aktif
                            </h4>
                            <p
                                className="text-xs"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            >
                                Outlet ini saat ini tidak aktif. Kategori dan
                                layanan dari outlet ini mungkin tidak tersedia
                                untuk transaksi baru.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryOutlet;
