import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    Wallet,
    Building2,
    User,
    Calendar,
    Coins,
    DollarSign,
    TrendingUp,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TopupOverviewProps } from "../types";

const TopupOverview: React.FC<TopupOverviewProps> = ({ topup }) => {
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
        <div className="flex items-start gap-4 p-4 rounded-lg  transition-colors">
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
                    className="text-base font-semibold truncate"
                    style={{ color: valueColor || "var(--color-text-primary)" }}
                >
                    {value}
                </p>
            </div>
        </div>
    );

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
            {/* Informasi Dasar */}
            <motion.div variants={itemVariants}>
                <Card className="p-6">
                    <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <Wallet className="w-5 h-5" />
                        Informasi Topup
                    </h3>

                    <div className="space-y-2">
                        <InfoRow
                            icon={topup.isMasterTopup ? Wallet : Building2}
                            label="Jenis Topup"
                            value={
                                <Badge
                                    variant={
                                        topup.isMasterTopup ? "primary" : "info"
                                    }
                                >
                                    {topup.topupTypeLabel}
                                </Badge>
                            }
                        />

                        <InfoRow
                            icon={DollarSign}
                            label="Jumlah Uang"
                            value={formatCurrency(topup.amountMoney)}
                            valueColor="var(--color-success-600)"
                        />

                        <InfoRow
                            icon={Coins}
                            label="Coin Diterima"
                            value={`${topup.coinReceived.toLocaleString("id-ID")} Coin`}
                            valueColor="var(--color-warning-600)"
                        />

                        {topup.user && (
                            <InfoRow
                                icon={User}
                                label="Pengguna"
                                value={topup.user.name}
                            />
                        )}
                    </div>
                </Card>
            </motion.div>

            {/* Detail Outlet (jika ada) */}
            {topup.outlet && (
                <motion.div variants={itemVariants}>
                    <Card className="p-6">
                        <h3
                            className="text-lg font-semibold mb-4 flex items-center gap-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <Building2 className="w-5 h-5" />
                            Informasi Outlet
                        </h3>

                        <div className="space-y-2">
                            <InfoRow
                                icon={Building2}
                                label="Nama Outlet"
                                value={topup.outlet.name}
                            />

                            <InfoRow
                                icon={TrendingUp}
                                label="Kode Outlet"
                                value={topup.outlet.code}
                            />

                            {topup.outlet.email && (
                                <InfoRow
                                    icon={User}
                                    label="Email"
                                    value={topup.outlet.email}
                                />
                            )}

                            {topup.outlet.phone && (
                                <InfoRow
                                    icon={User}
                                    label="Telepon"
                                    value={topup.outlet.phone}
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
                            value={formatDate(topup.createdAt)}
                        />

                        <InfoRow
                            icon={Calendar}
                            label="Terakhir Diperbarui"
                            value={formatDate(topup.updatedAt)}
                        />
                    </div>
                </Card>
            </motion.div>

            {/* Statistik */}
            <motion.div variants={itemVariants}>
                <Card className="p-6">
                    <h3
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        <TrendingUp className="w-5 h-5" />
                        Ringkasan
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div
                            className="p-4 rounded-lg text-center"
                            style={{
                                backgroundColor: "var(--color-success-50)",
                            }}
                        >
                            <p
                                className="text-sm font-medium mb-2"
                                style={{ color: "var(--color-success-700)" }}
                            >
                                Jumlah Uang
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-success-600)" }}
                            >
                                {formatCurrency(topup.amountMoney)}
                            </p>
                        </div>

                        <div
                            className="p-4 rounded-lg text-center"
                            style={{
                                backgroundColor: "var(--color-warning-50)",
                            }}
                        >
                            <p
                                className="text-sm font-medium mb-2"
                                style={{ color: "var(--color-warning-700)" }}
                            >
                                Coin Diterima
                            </p>
                            <p
                                className="text-2xl font-bold"
                                style={{ color: "var(--color-warning-600)" }}
                            >
                                {topup.coinReceived.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
};

export default TopupOverview;
