import React from "react";
import { Calendar, Edit, Trash2, FolderOpen } from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { CategoryPageHeaderProps } from "../types";
import { formatDate } from "@/lib/utils";

const CategoryPageHeader: React.FC<CategoryPageHeaderProps> = ({
    category,
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
                            <div className="space-y-2">
                                <h1
                                    className="text-2xl lg:text-3xl font-bold leading-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {category.name}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={
                                            category.isActive
                                                ? "success"
                                                : "error"
                                        }
                                        className="font-semibold"
                                    >
                                        {category.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </Badge>
                                    <span
                                        className="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {category.slug}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {category.description && (
                        <div className="space-y-2">
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Deskripsi
                            </p>
                            <p
                                className="text-sm leading-relaxed"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {category.description}
                            </p>
                        </div>
                    )}

                    {/* Outlet Info */}
                    {category.outlet && (
                        <div className="space-y-2">
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Outlet
                            </p>
                            <div className="flex items-center gap-2">
                                <FolderOpen
                                    className="w-4 h-4"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {category.outlet.name}
                                </span>
                                <span
                                    className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    {category.outlet.code}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Informasi Tambahan */}
                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3">
                            <Calendar
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <span
                                className="text-xs"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Dibuat: {formatDate(category.createdAt)}
                            </span>
                            {category.updatedAt !== category.createdAt && (
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
                                        {formatDate(category.updatedAt)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Category tidak aktif warning */}
            {!category.isActive && (
                <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-800 text-xs font-bold">
                                !
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Kategori Tidak Aktif
                            </h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                Kategori ini saat ini tidak aktif dan tidak
                                dapat digunakan untuk layanan baru.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CategoryPageHeader;
