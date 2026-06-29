import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Building2, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { FineOutletProps } from "../types";

const FineOutlet: React.FC<FineOutletProps> = ({ fine }) => {
    if (!fine.outlet) {
        return (
            <Card className="p-8 text-center">
                <Building2
                    className="w-12 h-12 mx-auto mb-4"
                    style={{ color: "var(--color-text-tertiary)" }}
                />
                <p
                    className="text-lg font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Tidak ada outlet terkait
                </p>
            </Card>
        );
    }

    const outlet = fine.outlet;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <Card className="p-6">
                <div className="flex items-start gap-4">
                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: "var(--color-primary-100)",
                        }}
                    >
                        <Building2
                            className="w-8 h-8"
                            style={{ color: "var(--color-primary-600)" }}
                        />
                    </div>

                    <div className="flex-1">
                        <h2
                            className="text-2xl font-bold mb-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            {outlet.name}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2">
                            {outlet.isActive ? (
                                <Badge variant="success">Aktif</Badge>
                            ) : (
                                <Badge variant="secondary">Nonaktif</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Informasi Kontak
                </h3>

                <div className="space-y-4">
                    {outlet.phone && (
                        <div className="flex items-center gap-3">
                            <Phone
                                className="w-5 h-5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Telepon
                                </p>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.phone}
                                </p>
                            </div>
                        </div>
                    )}

                    {outlet.email && (
                        <div className="flex items-center gap-3">
                            <Mail
                                className="w-5 h-5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Email
                                </p>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.email}
                                </p>
                            </div>
                        </div>
                    )}

                    {outlet.street && (
                        <div className="flex items-start gap-3">
                            <MapPin
                                className="w-5 h-5 mt-0.5"
                                style={{ color: "var(--color-text-tertiary)" }}
                            />
                            <div>
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Alamat
                                </p>
                                <p
                                    className="font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.street}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            <Card className="p-6">
                <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Informasi Tambahan
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Calendar
                            className="w-5 h-5"
                            style={{ color: "var(--color-text-tertiary)" }}
                        />
                        <div>
                            <p
                                className="text-sm"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Dibuat Pada
                            </p>
                            <p
                                className="font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {formatDate(outlet.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default FineOutlet;
