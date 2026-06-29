import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    Receipt,
    User,
    Building2,
    Calendar,
    Coins,
    TrendingUp,
    TrendingDown,
    FileText,
    Link as LinkIcon,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CoinTransactionOverviewProps } from "../types";

const CoinTransactionOverview: React.FC<CoinTransactionOverviewProps> = ({
    transaction,
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

    const InfoRow = ({
        icon: Icon,
        label,
        value,
        valueColor,
    }: {
        icon: React.ElementType;
        label: string;
        value: React.ReactNode;
        valueColor?: string;
    }) => (
        <div
            className="flex items-start gap-4 p-4 rounded-lg transition-colors"
            style={{
                backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-gray-50)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
            }}
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--color-primary-100)" }}
            >
                <Icon
                    className="w-5 h-5"
                    style={{ color: "var(--color-primary-600)" }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p
                    className="text-sm font-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    {label}
                </p>
                <p
                    className="text-base font-semibold break-words"
                    style={{ color: valueColor || "var(--color-text-primary)" }}
                >
                    {value}
                </p>
            </div>
        </div>
    );

    const isIncoming = [
        "topup",
        "commission",
        "refund",
        "auto_fallback",
    ].includes(transaction.type);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            {/* Informasi Transaksi */}
            <motion.div variants={itemVariants}>
                <Card className="p-6">
                    <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <Receipt className="w-5 h-5" />
                        Informasi Transaksi
                    </h3>

                    <div className="space-y-2">
                        <InfoRow
                            icon={FileText}
                            label="Tipe Transaksi"
                            value={
                                <Badge
                                    variant={isIncoming ? "success" : "error"}
                                >
                                    {transaction.typeLabel}
                                </Badge>
                            }
                        />

                        <InfoRow
                            icon={Coins}
                            label="Jumlah Coin"
                            value={`${transaction.amount.toLocaleString("id-ID")} Coin`}
                            valueColor={
                                isIncoming
                                    ? "var(--color-success-600)"
                                    : "var(--color-error-600)"
                            }
                        />

                        {transaction.description && (
                            <InfoRow
                                icon={FileText}
                                label="Deskripsi"
                                value={transaction.description}
                            />
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Informasi Pengguna & Outlet */}
            <motion.div variants={itemVariants}>
                <Card className="p-6">
                    <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <User className="w-5 h-5" />
                        Informasi Terkait
                    </h3>

                    <div className="space-y-2">
                        {transaction.user && (
                            <>
                                <InfoRow
                                    icon={User}
                                    label="Pengguna"
                                    value={transaction.user.name}
                                />
                                {transaction.user.email && (
                                    <InfoRow
                                        icon={User}
                                        label="Email"
                                        value={transaction.user.email}
                                    />
                                )}
                            </>
                        )}

                        {transaction.outlet && (
                            <>
                                <InfoRow
                                    icon={Building2}
                                    label="Outlet"
                                    value={transaction.outlet.name}
                                />
                                {transaction.outlet.code && (
                                    <InfoRow
                                        icon={Building2}
                                        label="Kode Outlet"
                                        value={transaction.outlet.code}
                                    />
                                )}
                            </>
                        )}

                        {!transaction.outlet && (
                            <div
                                className="p-4 rounded-lg"
                                style={{
                                    backgroundColor: "var(--color-gray-50)",
                                }}
                            >
                                <p
                                    className="text-sm text-center"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Transaksi Master (tidak terkait outlet)
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Referensi */}
            {(transaction.referenceType || transaction.referenceId) && (
                <motion.div variants={itemVariants}>
                    <Card className="p-6">
                        <h3
                            className="text-lg font-semibold mb-4 flex items-center gap-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <LinkIcon className="w-5 h-5" />
                            Referensi
                        </h3>

                        <div className="space-y-2">
                            {transaction.referenceType && (
                                <InfoRow
                                    icon={FileText}
                                    label="Tipe Referensi"
                                    value={transaction.referenceType.replace(
                                        "App\\Models\\",
                                        "",
                                    )}
                                />
                            )}

                            {transaction.referenceId && (
                                <InfoRow
                                    icon={LinkIcon}
                                    label="ID Referensi"
                                    value={`#${transaction.referenceId}`}
                                />
                            )}
                        </div>
                    </Card>
                </motion.div>
            )}

            {/* Informasi Waktu */}
            <motion.div variants={itemVariants}>
                <Card className="p-6">
                    <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <Calendar className="w-5 h-5" />
                        Informasi Waktu
                    </h3>

                    <div className="space-y-2">
                        <InfoRow
                            icon={Calendar}
                            label="Dibuat Pada"
                            value={formatDate(transaction.createdAt)}
                        />

                        <InfoRow
                            icon={Calendar}
                            label="Terakhir Diperbarui"
                            value={formatDate(transaction.updatedAt)}
                        />
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default CoinTransactionOverview;
