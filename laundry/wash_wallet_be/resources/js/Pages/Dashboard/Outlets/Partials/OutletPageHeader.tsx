import React, { useState } from "react";
import { MapPin, Phone, Mail, Calendar, Copy, ExternalLink, Check } from "lucide-react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { OutletPageHeaderProps } from "../types";
import { formatDate } from "@/lib/utils";

const OutletPageHeader: React.FC<OutletPageHeaderProps> = ({ outlet }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!outlet.fullAddress) return;
        navigator.clipboard.writeText(outlet.fullAddress || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenInMaps = () => {
        const { latitude, longitude, fullAddress } = outlet;
        let url = "";

        if (latitude && longitude) {
            url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        } else {
            url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress || "")}`;
        }

        window.open(url, "_blank");
    };

    return (
        <Card
            variant="elevated"
            className="p-6 mb-6 backdrop-blur-sm border-border/50"
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="space-y-2">
                                <h1
                                    className="text-2xl lg:text-3xl font-bold leading-tight"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {outlet.name}
                                </h1>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant={
                                            outlet.status === "active"
                                                ? "success"
                                                : "warning"
                                        }
                                        className="font-semibold"
                                    >
                                        {outlet.status === "active"
                                            ? "Aktif"
                                            : "Tidak Aktif"}
                                    </Badge>
                                    <span
                                        className="text-sm font-mono px-2 py-1 rounded bg-gray-100 dark:bg-gray-800"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        #{outlet.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informasi Kontak dan Lokasi */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Alamat */}
                        <div className="space-y-2">
                            <div className="flex items-start gap-3">
                                <MapPin
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-sm font-medium mb-1"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Alamat
                                    </p>
                                    <p
                                        className="text-sm leading-relaxed break-words"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {outlet.fullAddress}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2">
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={handleCopy}
                                            className="flex items-center gap-1.5 h-7"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-success-500" />
                                                    <span className="text-[10px]">Tersalin</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span className="text-[10px]">Salin</span>
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={handleOpenInMaps}
                                            className="flex items-center gap-1.5 h-7"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span className="text-[10px]">Buka di Maps</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kontak */}
                        <div className="space-y-3">
                            {/* Telepon */}
                            {outlet.phone && (
                                <div className="flex items-center gap-3">
                                    <Phone
                                        className="w-5 h-5 flex-shrink-0"
                                        style={{
                                            color: "var(--color-primary-500)",
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-sm font-medium"
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

                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <Mail
                                    className="w-5 h-5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-primary-500)",
                                    }}
                                />
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-sm font-medium"
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
                        </div>
                    </div>

                    {/* Informasi Tambahan */}
                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-3">
                            <Calendar
                                className="w-4 h-4"
                                style={{ color: "var(--color-text-secondary)" }}
                            />
                            <span
                                className="text-xs"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Dibuat: {formatDate(outlet.createdAt)}
                            </span>
                            {outlet.updatedAt !== outlet.createdAt && (
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
                                        {formatDate(outlet.updatedAt)}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Outlet tidak aktif warning */}
            {outlet.status !== "active" && (
                <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-800 text-xs font-bold">
                                !
                            </span>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                Outlet Tidak Aktif
                            </h4>
                            <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                Outlet ini saat ini tidak aktif dan tidak dapat
                                menerima pesanan. Silakan aktifkan kembali jika
                                diperlukan.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default OutletPageHeader;
