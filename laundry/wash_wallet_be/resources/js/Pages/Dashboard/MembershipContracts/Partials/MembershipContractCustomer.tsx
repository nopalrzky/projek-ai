import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import {
    User,
    Mail,
    Phone,
    MapPin,
    ExternalLink,
    Calendar,
    Award,
    Clock,
} from "lucide-react";
import { router } from "@inertiajs/react";
import { formatDate } from "@/lib/utils";
import { MembershipContractCustomerProps } from "../types";

const MembershipContractCustomer: React.FC<MembershipContractCustomerProps> = ({
    customer,
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
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
                                <User
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
                                        {customer.name}
                                    </h2>
                                    <Badge
                                        variant={
                                            customer.isActive
                                                ? "success"
                                                : "error"
                                        }
                                        size="sm"
                                    >
                                        {customer.isActive
                                            ? "Aktif"
                                            : "Nonaktif"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit(
                                    route("customers.show", customer.id),
                                )
                            }
                            rightIcon={<ExternalLink className="w-4 h-4" />}
                        >
                            Lihat Detail Pelanggan
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

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {customer.phone && (
                                <motion.div
                                    variants={itemVariants}
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
                                            href={`tel:${customer.phone}`}
                                            className="text-sm font-medium hover:underline"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        >
                                            {customer.phone}
                                        </a>
                                    </div>
                                </motion.div>
                            )}

                            {customer.email && (
                                <motion.div
                                    variants={itemVariants}
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
                                            href={`mailto:${customer.email}`}
                                            className="text-sm font-medium hover:underline break-all"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        >
                                            {customer.email}
                                        </a>
                                    </div>
                                </motion.div>
                            )}

                            {!customer.phone && !customer.email && (
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
                        </motion.div>
                    </Card>
                </motion.div>

                {/* Customer Details */}
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
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <Award
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
                                Detail Pelanggan
                            </h3>
                        </div>

                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-4"
                        >
                            {customer.createdAt && (
                                <motion.div
                                    variants={itemVariants}
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
                                        <Calendar
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
                                            Terdaftar Sejak
                                        </p>
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {formatDate(customer.createdAt)}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {customer.updatedAt && (
                                <motion.div
                                    variants={itemVariants}
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
                                                "var(--color-success-100)",
                                        }}
                                    >
                                        <Clock
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-success-600)",
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
                                            Terakhir Diperbarui
                                        </p>
                                        <p
                                            className="text-sm font-medium"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {formatDate(customer.updatedAt)}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </Card>
                </motion.div>
            </div>

            {/* Address Information */}
            {customer.address && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card variant="elevated" className="p-6">
                        <div className="flex items-start gap-4">
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-error-100)",
                                }}
                            >
                                <MapPin
                                    className="w-6 h-6"
                                    style={{
                                        color: "var(--color-error-600)",
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
                                    Alamat
                                </h4>
                                <p
                                    className="text-base leading-relaxed"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {customer.address}
                                </p>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default MembershipContractCustomer;
