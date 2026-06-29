import React from "react";
import { router } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { Button } from "@/Components/Button";
import { Badge } from "@/Components/Badge";
import { Building2, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { JournalEntryOutletProps } from "../types";

const JournalEntryOutlet: React.FC<JournalEntryOutletProps> = ({ outlet }) => {
    const handleViewOutlet = () => {
        router.visit(route("outlets.show", outlet.id));
    };

    return (
        <div className="space-y-6">
            <Card variant="elevated" className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                            style={{
                                backgroundColor: "var(--color-primary-100)",
                            }}
                        >
                            <Building2
                                className="w-8 h-8"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            />
                        </div>
                        <div>
                            <h2
                                className="text-2xl font-bold mb-2"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                {outlet.name}
                            </h2>
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant={
                                        outlet.isActive
                                            ? "success"
                                            : "secondary"
                                    }
                                    className="font-semibold"
                                >
                                    {outlet.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                                <span
                                    className="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    {outlet.code}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={handleViewOutlet}
                        rightIcon={<ExternalLink className="w-4 h-4" />}
                    >
                        Lihat Detail Outlet
                    </Button>
                </div>

                {/* Contact Information */}
                <div
                    className="border-t pt-6"
                    style={{ borderColor: "var(--color-border)" }}
                >
                    <h3
                        className="text-lg font-semibold mb-4"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Informasi Kontak
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {outlet.fullAddress && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <MapPin
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <label
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Alamat
                                    </label>
                                </div>
                                <p
                                    className="text-sm leading-relaxed ml-6"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.fullAddress}
                                </p>
                            </div>
                        )}

                        {outlet.phone && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Phone
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <label
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Telepon
                                    </label>
                                </div>
                                <a
                                    href={`tel:${outlet.phone}`}
                                    className="text-sm ml-6 hover:underline"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {outlet.phone}
                                </a>
                            </div>
                        )}

                        {outlet.email && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Mail
                                        className="w-4 h-4"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <label
                                        className="text-sm font-medium"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Email
                                    </label>
                                </div>
                                <a
                                    href={`mailto:${outlet.email}`}
                                    className="text-sm ml-6 hover:underline"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {outlet.email}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default JournalEntryOutlet;
