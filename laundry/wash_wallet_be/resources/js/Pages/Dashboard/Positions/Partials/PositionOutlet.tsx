import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    Store,
    Users,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { PositionOutletProps } from "../types";

const PositionOutlet: React.FC<PositionOutletProps> = ({ position }) => {
    const outlet = position.outlet;

    const formatFullAddress = () => {
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

    const getLocationDetails = () => {
        const details = [];

        if (outlet.villageName) {
            details.push({
                label: "Kelurahan/Desa",
                value: outlet.villageName,
            });
        }

        if (outlet.districtName) {
            details.push({
                label: "Kecamatan",
                value: outlet.districtName,
            });
        }

        if (outlet.cityName) {
            details.push({
                label: "Kota/Kabupaten",
                value: outlet.cityName,
            });
        }

        if (outlet.provinceName) {
            details.push({
                label: "Provinsi",
                value: outlet.provinceName,
            });
        }

        return details;
    };

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <Card variant="elevated" className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                }}
                            >
                                <Store
                                    className="w-8 h-8"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2
                                        className="text-2xl font-bold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {outlet.name}
                                    </h2>
                                    <Badge
                                        variant={
                                            outlet.isActive
                                                ? "success"
                                                : "error"
                                        }
                                        size="sm"
                                    >
                                        {outlet.isActive ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-sm font-medium px-2.5 py-1 rounded-md"
                                        style={{
                                            backgroundColor:
                                                "var(--color-gray-100)",
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Kode: {outlet.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit(route("outlets.show", outlet.id))
                            }
                            rightIcon={<ExternalLink className="w-4 h-4" />}
                        >
                            Lihat Detail Outlet
                        </Button>
                    </div>
                </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card variant="elevated" className="p-6 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="p-2.5 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-success-100)",
                                }}
                            >
                                <Phone
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
                                Informasi Kontak
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {outlet.phone && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50"
                                    style={{
                                        backgroundColor:
                                            "var(--color-background-subtle)",
                                    }}
                                >
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-info-100)",
                                        }}
                                    >
                                        <Phone
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-info-600)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-xs font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Telepon
                                        </p>
                                        <a
                                            href={`tel:${outlet.phone}`}
                                            className="text-sm font-medium hover:underline"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        >
                                            {outlet.phone}
                                        </a>
                                    </div>
                                </motion.div>
                            )}

                            {outlet.email && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-gray-50"
                                    style={{
                                        backgroundColor:
                                            "var(--color-background-subtle)",
                                    }}
                                >
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-warning-100)",
                                        }}
                                    >
                                        <Mail
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-warning-600)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-xs font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Email
                                        </p>
                                        <a
                                            href={`mailto:${outlet.email}`}
                                            className="text-sm font-medium hover:underline break-all"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        >
                                            {outlet.email}
                                        </a>
                                    </div>
                                </motion.div>
                            )}

                            {!outlet.phone && !outlet.email && (
                                <div className="text-center py-8">
                                    <Phone
                                        className="w-12 h-12 mx-auto mb-3"
                                        style={{
                                            color: "var(--color-text-quaternary)",
                                        }}
                                    />
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tidak ada informasi kontak
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Address Information */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card variant="elevated" className="p-6 h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div
                                className="p-2.5 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-error-100)",
                                }}
                            >
                                <MapPin
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-error-600)",
                                    }}
                                />
                            </div>
                            <h3
                                className="text-lg font-semibold"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Alamat Lengkap
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {outlet.street && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex items-start gap-3 p-3 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-background-subtle)",
                                    }}
                                >
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary-100)",
                                        }}
                                    >
                                        <Building2
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="text-xs font-medium mb-1"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Alamat Jalan
                                        </p>
                                        <p
                                            className="text-sm font-medium leading-relaxed"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {outlet.street}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {getLocationDetails().length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="p-3 rounded-lg"
                                    style={{
                                        backgroundColor:
                                            "var(--color-background-subtle)",
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <div
                                            className="p-2 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-success-100)",
                                            }}
                                        >
                                            <MapPin
                                                className="w-4 h-4"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            />
                                        </div>
                                        <p
                                            className="text-xs font-medium"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Detail Wilayah
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 ml-10">
                                        {getLocationDetails().map(
                                            (detail, index) => (
                                                <div key={index}>
                                                    <p
                                                        className="text-xs mb-0.5"
                                                        style={{
                                                            color: "var(--color-text-tertiary)",
                                                        }}
                                                    >
                                                        {detail.label}
                                                    </p>
                                                    <p
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: "var(--color-text-primary)",
                                                        }}
                                                    >
                                                        {detail.value}
                                                    </p>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {!outlet.street &&
                                getLocationDetails().length === 0 && (
                                    <div className="text-center py-8">
                                        <MapPin
                                            className="w-12 h-12 mx-auto mb-3"
                                            style={{
                                                color: "var(--color-text-quaternary)",
                                            }}
                                        />
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Alamat belum diisi
                                        </p>
                                    </div>
                                )}
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Full Address Summary */}
            {(outlet.street || getLocationDetails().length > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 }}
                >
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <MapPin
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-info-600)",
                                    }}
                                />
                            </div>
                            <div className="flex-1">
                                <h4
                                    className="text-sm font-semibold mb-2"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Alamat Lengkap
                                </h4>
                                <p
                                    className="text-base leading-relaxed"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {formatFullAddress()}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Outlet Statistics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div
                            className="p-2.5 rounded-lg"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Users
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
                            Statistik Outlet
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
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
                                    {outlet.employeesCount || 0}
                                </span>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Pelanggan
                                </span>
                                <span
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.customersCount || 0}
                                </span>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-secondary)",
                            }}
                        >
                            <div className="flex items-center justify-between">
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Total Posisi
                                </span>
                                <span
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.positionsCount || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default PositionOutlet;
