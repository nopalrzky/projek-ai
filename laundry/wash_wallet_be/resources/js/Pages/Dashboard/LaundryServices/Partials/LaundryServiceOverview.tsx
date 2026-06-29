import React from "react";
import { Card } from "@/Components/Card";
import { Badge } from "@/Components/Badge";
import {
    Building2,
    Tag,
    Ruler,
    Calendar,
    Clock,
    FileText,
    Banknote,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Star,
    ListOrdered
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { LaundryServiceOverviewProps } from "../types";

const LaundryServiceOverview: React.FC<LaundryServiceOverviewProps> = ({
    laundryService,
}) => {
    const processesCount = laundryService.laundryServiceProcessesCount ?? 0;
    const showProcessWarning = laundryService.isActive && processesCount === 0;

    return (
        <div className="space-y-6">
            {showProcessWarning && (
                <Card 
                    className="p-4 border" 
                    style={{ backgroundColor: "var(--color-warning-50)", borderColor: "var(--color-warning-200)" }}
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: "var(--color-warning-600)" }} />
                        <div>
                            <h4 className="font-medium" style={{ color: "var(--color-warning-800)" }}>
                                Perhatian: Proses Produksi Belum Diatur
                            </h4>
                            <p className="text-sm mt-1" style={{ color: "var(--color-warning-700)" }}>
                                Layanan ini aktif tetapi belum memiliki proses produksi. Tambahkan proses di tab Proses Layanan agar layanan ini dapat diproses oleh karyawan.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1: Konfigurasi Komersial */}
                    <Card className="p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3
                                    className="text-xl font-semibold mb-2"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    Informasi & Komersial
                                </h3>
                                <p style={{ color: "var(--color-text-secondary)" }}>
                                    Detail harga dan pengaturan layanan
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Banknote
                                        className="w-5 h-5"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Harga
                                        </p>
                                        <p className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                                            {formatCurrency(laundryService.price)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Package
                                        className="w-5 h-5"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Minimal Kuantitas
                                        </p>
                                        <p style={{ color: "var(--color-text-primary)" }}>
                                            {laundryService.minQuantity} {laundryService.unit?.symbol}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Building2
                                        className="w-5 h-5"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Outlet
                                        </p>
                                        <p style={{ color: "var(--color-text-primary)" }}>
                                            {laundryService.category?.outlet?.name}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Ruler
                                        className="w-5 h-5"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Unit
                                        </p>
                                        <p style={{ color: "var(--color-text-primary)" }}>
                                            {laundryService.unit?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Clock
                                        className="w-5 h-5"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Durasi Pengerjaan
                                        </p>
                                        <p style={{ color: "var(--color-text-primary)" }}>
                                            {laundryService.durationHours} Jam
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Truck
                                        className="w-5 h-5"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Dukungan Kurir
                                        </p>
                                        <p style={{ color: "var(--color-text-primary)" }}>
                                            {laundryService.supportsCourier ? "Tersedia" : "Tidak Tersedia"}
                                        </p>
                                        {laundryService.courierSupportLabel && (
                                            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                                                {laundryService.courierSupportLabel}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Tag
                                        className="w-5 h-5"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
                                            Kategori
                                        </p>
                                        <p style={{ color: "var(--color-text-primary)" }}>
                                            {laundryService.category?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Deskripsi */}
                        {laundryService.description && (
                            <div
                                className="mt-6 pt-6 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText
                                        className="w-4 h-4"
                                        style={{ color: "var(--color-text-tertiary)" }}
                                    />
                                    <p
                                        className="text-sm font-medium"
                                        style={{ color: "var(--color-text-secondary)" }}
                                    >
                                        Deskripsi
                                    </p>
                                </div>
                                <p
                                    className="leading-relaxed text-sm"
                                    style={{ color: "var(--color-text-primary)" }}
                                >
                                    {laundryService.description}
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Section 2: Indikator Kesehatan */}
                    <Card className="p-6">
                        <h3
                            className="font-semibold mb-4"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Status & Indikator
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {laundryService.isActive ? (
                                        <CheckCircle className="w-4 h-4" style={{ color: "var(--color-success-500)" }} />
                                    ) : (
                                        <XCircle className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                                    )}
                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Status Layanan</span>
                                </div>
                                <Badge variant={laundryService.isActive ? "success" : "secondary"}>
                                    {laundryService.isActive ? "Aktif" : "Nonaktif"}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ListOrdered className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Proses Produksi</span>
                                </div>
                                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    {processesCount} proses
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Masuk Paket</span>
                                </div>
                                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    {laundryService.servicePackageItemsCount ?? 0} paket
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Banknote className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Pernah Diorder</span>
                                </div>
                                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                                    {laundryService.orderItemsCount ?? 0} kali
                                </span>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                            <div className="flex justify-between text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                                <span>Dibuat: {formatDate(laundryService.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                                <span>Diupdate: {formatDate(laundryService.updatedAt)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Section 3: Rating & Review */}
                    <Card className="p-6">
                        <h3
                            className="font-semibold mb-4 flex items-center gap-2"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            <Star className="w-4 h-4" />
                            Rating & Ulasan
                        </h3>
                        
                        {laundryService.totalReviews && laundryService.totalReviews > 0 ? (
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                                    {laundryService.averageRating?.toFixed(1) ?? "0.0"}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className="w-4 h-4" 
                                                fill={star <= (laundryService.averageRating ?? 0) ? "var(--color-warning-400)" : "transparent"} 
                                                style={{ color: star <= (laundryService.averageRating ?? 0) ? "var(--color-warning-400)" : "var(--color-text-tertiary)" }}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                                        Dari {laundryService.totalReviews} ulasan
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                                    Belum ada ulasan untuk layanan ini.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LaundryServiceOverview;
