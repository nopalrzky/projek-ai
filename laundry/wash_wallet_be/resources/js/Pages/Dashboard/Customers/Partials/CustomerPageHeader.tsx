import React from "react";
import { Phone, Mail, Calendar, Edit, Trash2 } from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { formatDate, getGenderIcon, getGenderLabel } from "@/lib/utils";
import { CustomerPageHeaderProps } from "../types";

const CustomerPageHeader: React.FC<CustomerPageHeaderProps> = ({
    customer,
    isLoading = false,
}) => {
    return (
        <Card
            variant="elevated"
            className="p-6 mb-6 backdrop-blur-sm border-border/50"
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left Section - Customer Info */}
                <div className="flex-1 space-y-4">
                    {/* Avatar and Name */}
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                                color: "var(--color-primary-600)",
                            }}
                        >
                            {customer.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Name and Basic Info */}
                        <div className="flex-1 min-w-0">
                            <div className="space-y-2">
                                <h1
                                    className="text-2xl lg:text-3xl font-bold leading-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                    
                                    {customer.name}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Badge
                                        variant={
                                            customer.isActive
                                                ? "success"
                                                : "secondary"
                                        }
                                        className="font-semibold"
                                    >
                                        {customer.isActive
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </Badge>
                                    <span
                                        className="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        ID: #{customer.id}
                                    </span>
                                    {customer.gender && (
                                        <span
                                            className="text-sm flex items-center gap-1"
                                            style={{
                                                color: "var(--color-text-secondary)",
                                            }}
                                        >
                                            {getGenderIcon(customer.gender)}
                                            {getGenderLabel(customer.gender)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                        {/* Email */}
                        {customer.email && (
                            <div className="flex items-center gap-3">
                                <Mail
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Email
                                    </p>
                                    <p
                                        className="text-sm break-all"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {customer.email}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Phone */}
                        {customer.phone && (
                            <div className="flex items-center gap-3">
                                <Phone
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-xs font-medium"
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
                                        {customer.phone}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
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
                                    Bergabung: {formatDate(customer.createdAt)}
                                </span>
                            </div>
                            {customer.updatedAt !== customer.createdAt && (
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
                                        {formatDate(customer.updatedAt)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Inactive Warning */}
            {!customer.isActive && (
                <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-800 text-xs font-bold">
                                !
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Pelanggan Tidak Aktif
                            </h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                Pelanggan ini saat ini tidak aktif dan tidak
                                dapat melakukan transaksi baru. Riwayat
                                transaksi tetap tersimpan.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default CustomerPageHeader;
