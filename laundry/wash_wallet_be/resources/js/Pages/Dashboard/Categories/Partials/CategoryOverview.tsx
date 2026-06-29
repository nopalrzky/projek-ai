import React from "react";
import { router } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Package,
    Calendar,
    Activity,
    Users,
    Building2,
    ExternalLink,
    Layers,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CategoryOverviewProps } from "../types";

const CategoryOverview: React.FC<CategoryOverviewProps> = ({
    category,
    laundryServices,
}) => {
    const activeServicesCount =
        laundryServices?.filter((service) => service.isActive).length || 0;

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
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
                                Total Layanan
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {laundryServices?.length || 0}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Package
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
                                Layanan Aktif
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {activeServicesCount}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <Activity
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
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-info-100)",
                            }}
                        >
                            <Users
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-info-600)",
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
                                Status
                            </p>
                            <p
                                className="text-lg font-semibold"
                                style={{
                                    color: category.isActive
                                        ? "var(--color-success-600)"
                                        : "var(--color-error-600)",
                                }}
                            >
                                {category.isActive ? "Aktif" : "Nonaktif"}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: category.isActive
                                    ? "var(--color-success-100)"
                                    : "var(--color-error-100)",
                            }}
                        >
                            <Activity
                                className="w-6 h-6"
                                style={{
                                    color: category.isActive
                                        ? "var(--color-success-600)"
                                        : "var(--color-error-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Information Card */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <Layers
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
                            Informasi Kategori
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Nama Kategori
                            </label>
                            <p
                                className="mt-1 font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {category.name}
                            </p>
                        </div>

                        <div>
                            <label
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Slug
                            </label>
                            <p
                                className="mt-1 font-mono text-sm"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {category.slug}
                            </p>
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
                            <div className="mt-1">
                                <Badge
                                    variant={
                                        category.isActive ? "success" : "error"
                                    }
                                >
                                    {category.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                            </div>
                        </div>

                        {category.description && (
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Deskripsi
                                </label>
                                <p
                                    className="mt-1 text-sm leading-relaxed"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {category.description}
                                </p>
                            </div>
                        )}

                        {category.outlet && (
                            <div>
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Outlet
                                </label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Building2
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <span
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {category.outlet.name}
                                    </span>
                                    <span
                                        className="text-xs px-2 py-0.5 rounded bg-gray-100"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {category.outlet.code}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Dibuat
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                                <Calendar
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatDate(category.createdAt)}
                                </span>
                            </div>
                        </div>

                        {category.outlet && (
                            <div
                                className="pt-4 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                "outlets.show",
                                                category.outlet!.id
                                            )
                                        )
                                    }
                                    rightIcon={
                                        <ExternalLink className="w-4 h-4" />
                                    }
                                    fullWidth
                                >
                                    Lihat Detail Outlet
                                </Button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Laundry Services List */}
                <Card variant="elevated" className="p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className="p-2 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Package
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
                                Layanan Laundry ({laundryServices?.length || 0})
                            </h3>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                router.visit(
                                    route("laundry-services.index", {
                                        categoryId: category.id,
                                    })
                                )
                            }
                            rightIcon={<ExternalLink className="w-4 h-4" />}
                        >
                            Lihat Semua
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {laundryServices && laundryServices.length > 0 ? (
                            laundryServices.slice(0, 6).map((service) => (
                                <div
                                    key={service.id}
                                    className="flex items-center justify-between p-4 rounded-lg hover:shadow-sm transition-all duration-150 cursor-pointer"
                                    style={{
                                        backgroundColor:
                                            "var(--color-surface-secondary)",
                                    }}
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                "laundry-services.show",
                                                service.id
                                            )
                                        )
                                    }
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p
                                                className="font-medium text-sm"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                {service.name}
                                            </p>
                                            <Badge
                                                variant={
                                                    service.isActive
                                                        ? "success"
                                                        : "secondary"
                                                }
                                                size="sm"
                                            >
                                                {service.isActive
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </Badge>
                                        </div>
                                        {service.description && (
                                            <p
                                                className="text-xs line-clamp-1"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                {service.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            {service.unit && (
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-gray-100)",
                                                        color: "var(--color-text-tertiary)",
                                                    }}
                                                >
                                                    {service.unit.symbol}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                    style={{
                                        backgroundColor:
                                            "var(--color-surface-secondary)",
                                    }}
                                >
                                    <Package
                                        className="w-8 h-8"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                </div>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Belum ada layanan
                                </p>
                                <p
                                    className="text-sm mt-1"
                                    style={{
                                        color: "var(--color-text-quaternary)",
                                    }}
                                >
                                    Kategori ini belum memiliki layanan laundry
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CategoryOverview;
