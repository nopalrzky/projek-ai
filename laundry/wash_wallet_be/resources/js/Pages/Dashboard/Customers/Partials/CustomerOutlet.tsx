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
    User,
    Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CustomerOutletProps } from "../types";

const CustomerOutlet: React.FC<CustomerOutletProps> = ({ customer }) => {
    if (!customer.outlet) {
        return (
            <Card variant="elevated" className="p-12">
                <div className="text-center">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                        style={{
                            backgroundColor: "var(--color-surface-secondary)",
                        }}
                    >
                        <Building2
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
                        Outlet tidak ditemukan
                    </p>
                    <p
                        className="text-sm mt-1"
                        style={{
                            color: "var(--color-text-quaternary)",
                        }}
                    >
                        Pelanggan ini belum terdaftar di outlet manapun
                    </p>
                </div>
            </Card>
        );
    }

    const outlet = customer.outlet;

    const getFormattedAddress = () => {
        const addressParts = [
            outlet.street,
            outlet.villageName,
            outlet.districtName,
            outlet.cityName,
            outlet.provinceName,
        ].filter(Boolean);

        return addressParts.length > 0
            ? addressParts.join(", ")
            : "Alamat tidak tersedia";
    };

    return (
        <div className="space-y-6">
            {/* Outlet Header Card */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="p-2 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Building2
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Outlet Terdaftar
                            </h3>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Lokasi tempat pelanggan terdaftar
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            router.visit(route("outlets.show", outlet.id))
                        }
                        rightIcon={<ExternalLink className="w-4 h-4" />}
                    >
                        Lihat Detail
                    </Button>
                </div>

                {/* Outlet Main Info */}
                <div
                    className="p-6 rounded-lg border"
                    style={{
                        backgroundColor: "var(--color-surface-secondary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h4
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.name}
                                </h4>
                                <Badge
                                    variant={
                                        outlet.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                >
                                    {outlet.isActive ? "Aktif" : "Tidak Aktif"}
                                </Badge>
                            </div>
                            <p
                                className="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 inline-block"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                {outlet.code}
                            </p>
                        </div>
                    </div>

                    {/* Outlet Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Address */}
                        <div className="space-y-2">
                            <div className="flex items-start gap-3">
                                <MapPin
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Alamat Lengkap
                                    </p>
                                    <p
                                        className="text-sm leading-relaxed break-words"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {getFormattedAddress()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <Mail
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="flex-1 min-w-0">
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
                                        {outlet.email}
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            {outlet.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone
                                        className="w-5 h-5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    />
                                    <div className="flex-1 min-w-0">
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
                                            {outlet.phone}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Created Date */}
                            <div className="flex items-center gap-3">
                                <Calendar
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Terdaftar di Outlet
                                    </p>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {formatDate(outlet.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Owner Info */}
                    {outlet.owner && (
                        <div
                            className="mt-6 pt-6 border-t"
                            style={{ borderColor: "var(--color-border)" }}
                        >
                            <div className="flex items-center gap-3">
                                <User
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <div>
                                    <p
                                        className="text-xs font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Pemilik Outlet
                                    </p>
                                    <p
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {outlet.owner.name}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {outlet.owner.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CustomerOutlet;
