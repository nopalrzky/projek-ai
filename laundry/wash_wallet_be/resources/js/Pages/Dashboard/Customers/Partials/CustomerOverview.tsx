import React from "react";
import { Card } from "@/Components/Card";
import {
    ShoppingCart,
    Activity,
    Star,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Calendar,
} from "lucide-react";
import { formatDate, getGenderIcon, getGenderLabel } from "@/lib/utils";
import { CustomerOverviewProps } from "../types";

const CustomerOverview: React.FC<CustomerOverviewProps> = ({ customer }) => {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Orders */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Total Pesanan
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {customer.ordersCount || 0}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <ShoppingCart
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Subscriptions */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Langganan Aktif
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {customer.subscriptionsCount || 0}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-success-100)",
                            }}
                        >
                            <Star
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Contracts */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Kontrak Member
                            </p>
                            <p
                                className="text-2xl font-bold mt-1"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {customer.membershipContractsCount || 0}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: "var(--color-warning-100)",
                            }}
                        >
                            <FileText
                                className="w-6 h-6"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Status */}
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Status Akun
                            </p>
                            <p
                                className="text-lg font-semibold mt-1"
                                style={{
                                    color: customer.isActive
                                        ? "var(--color-success-600)"
                                        : "var(--color-gray-500)",
                                }}
                            >
                                {customer.isActive ? "Aktif" : "Tidak Aktif"}
                            </p>
                        </div>
                        <div
                            className="p-3 rounded-full"
                            style={{
                                backgroundColor: customer.isActive
                                    ? "var(--color-success-100)"
                                    : "var(--color-gray-100)",
                            }}
                        >
                            <Activity
                                className="w-6 h-6"
                                style={{
                                    color: customer.isActive
                                        ? "var(--color-success-600)"
                                        : "var(--color-gray-500)",
                                }}
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Customer Information Card */}
            <Card variant="elevated" className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-primary-100)",
                        }}
                    >
                        <User
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
                        Informasi Pelanggan
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Nama Lengkap
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
                                    {customer.name}
                                </p>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Email
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                {customer.email ? (
                                    <div className="flex items-center gap-2">
                                        <Mail
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                        <p
                                            className="break-all"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            {customer.email}
                                        </p>
                                    </div>
                                ) : (
                                    <p
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tidak ada email
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Nomor Telepon
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                {customer.phone ? (
                                    <div className="flex items-center gap-2">
                                        <Phone
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
                                            {customer.phone}
                                        </p>
                                    </div>
                                ) : (
                                    <p
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tidak ada nomor telepon
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Gender */}
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Jenis Kelamin
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                <p
                                    className="flex items-center gap-2"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    <span className="text-lg">
                                        {getGenderIcon(customer.gender)}
                                    </span>
                                    {getGenderLabel(customer.gender)}
                                </p>
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Alamat
                            </label>
                            <div
                                className="p-3 rounded-lg"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-secondary)",
                                }}
                            >
                                {customer.address ? (
                                    <div className="flex items-start gap-2">
                                        <MapPin
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
                                            {customer.address}
                                        </p>
                                    </div>
                                ) : (
                                    <p
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        Tidak ada alamat
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Member Since */}
                        <div>
                            <label
                                className="text-sm font-medium block mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Member Sejak
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
                                        {formatDate(customer.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CustomerOverview;
