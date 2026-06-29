import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { Link } from "@inertiajs/react";
import {
    User,
    Phone,
    Mail,
    MapPin,
    Calendar,
    ShoppingBag,
    Package,
} from "lucide-react";
import { Badge } from "@/Components/Badge";
import { OrderCustomerProps } from "../types";

const OrderCustomer: React.FC<OrderCustomerProps> = ({ order }) => {
    const customer = order.customer;

    if (!customer) {
        return (
            <Card className="p-6 text-center text-[var(--color-text-tertiary)]">
                Data customer tidak ditemukan.
            </Card>
        );
    }

    const quotaUsedItems = (order.orderItems || []).filter(
        (item) => item.quotaUsageLog,
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <h2
                            className="text-lg font-semibold flex items-center gap-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <User className="w-5 h-5 text-[var(--color-primary-500)]" />
                            Profil Customer
                        </h2>
                        <Badge
                            variant={customer.isActive ? "success" : "default"}
                        >
                            {customer.isActive ? "Aktif" : "Non-aktif"}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-600)] flex items-center justify-center text-2xl font-bold border-2 border-[var(--color-primary-200)]">
                            {customer.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <Link
                                href={route("customers.show", customer.id)}
                                className="text-xl font-bold hover:text-[var(--color-primary-600)] transition-colors border-b-2 border-transparent hover:border-[var(--color-primary-600)] pb-0.5"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {customer.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-secondary)]">
                                <span>
                                    {customer.gender === "male"
                                        ? "Laki-laki"
                                        : customer.gender === "female"
                                          ? "Perempuan"
                                          : "-"}
                                </span>
                                {customer.dateOfBirth && (
                                    <>
                                        <span className="text-[var(--color-text-tertiary)]">
                                            •
                                        </span>
                                        <span>{customer.dateOfBirth}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {customer.phone && (
                            <div className="flex items-start gap-3">
                                <Phone className="w-4 h-4 mt-0.5 text-[var(--color-text-tertiary)]" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {customer.phone}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        Nomor Telepon
                                    </p>
                                </div>
                            </div>
                        )}

                        {customer.email && (
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 mt-0.5 text-[var(--color-text-tertiary)]" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                        {customer.email}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        Email
                                    </p>
                                </div>
                            </div>
                        )}

                        {customer.address && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 mt-0.5 text-[var(--color-text-tertiary)]" />
                                <div>
                                    <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
                                        {customer.address}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        Alamat
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h2
                            className="text-lg font-semibold mb-6 flex items-center gap-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <ShoppingBag className="w-5 h-5 text-[var(--color-primary-500)]" />
                            Statistik Order
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-[var(--color-gray-50)] p-4 rounded-xl border border-[var(--color-border-light)]">
                                <div className="text-[var(--color-text-tertiary)] mb-1">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                                    {customer.ordersCount || 0}
                                </div>
                                <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
                                    Total Order
                                </div>
                            </div>

                            <div className="bg-[var(--color-gray-50)] p-4 rounded-xl border border-[var(--color-border-light)]">
                                <div className="text-[var(--color-text-tertiary)] mb-1">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="text-lg font-bold text-[var(--color-text-primary)] mt-1 truncate">
                                    {customer.createdAt
                                        ? new Date(
                                              customer.createdAt,
                                          ).toLocaleDateString("id-ID", {
                                              month: "short",
                                              year: "numeric",
                                          })
                                        : "-"}
                                </div>
                                <div className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
                                    Bergabung Sejak
                                </div>
                            </div>
                        </div>
                    </Card>

                    {quotaUsedItems.length > 0 && (
                        <Card className="p-6 border-[var(--color-primary-200)] bg-[var(--color-primary-25)]">
                            <h2
                                className="text-lg font-semibold mb-4 flex items-center gap-2"
                                style={{ color: "var(--color-primary-700)" }}
                            >
                                <Package className="w-5 h-5" />
                                Kuota Digunakan
                            </h2>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                                Rincian kuota paket langganan yang dipakai untuk
                                pesanan ini:
                            </p>

                            <div className="space-y-3">
                                {quotaUsedItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-[var(--color-primary-100)]"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium text-[var(--color-text-primary)] text-sm">
                                                {item.laundryServiceName ||
                                                    item.laundryService?.name}
                                            </p>
                                            {item.quotaUsageLog
                                                ?.customerSubscriptionId && (
                                                <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                                                    ID Langganan: #
                                                    {
                                                        item.quotaUsageLog
                                                            .customerSubscriptionId
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <Badge
                                                variant="primary"
                                                className="font-bold"
                                            >
                                                -
                                                {item.quotaUsageLog?.amountUsed}{" "}
                                                {item.unitName || "item"}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default OrderCustomer;
