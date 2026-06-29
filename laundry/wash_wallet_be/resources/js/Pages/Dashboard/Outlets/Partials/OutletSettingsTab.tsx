import React from "react";
import { router } from "@inertiajs/react";
import { Card } from "@/Components/Card";
import { ToggleSwitch } from "@/Components/Input";
import {
    MessageSquare,
    BellRing,
    AlertCircle,
    CheckCircle2,
    ShoppingBag,
    Scale,
    Loader2,
    PackageCheck,
    Truck,
    XCircle,
    Info,
    Coins,
    Wallet,
    Clock,
} from "lucide-react";
import { Outlet } from "@/types/outlet";

interface OutletSettingsTabProps {
    outlet: Outlet;
}

const OutletSettingsTab: React.FC<OutletSettingsTabProps> = ({ outlet }) => {
    const statusBadgeStyle = {
        backgroundColor: "var(--color-success-50)",
        borderColor: "color-mix(in srgb, var(--color-success-500) 24%, transparent)",
        color: "var(--color-success-600)",
    };
    const inactiveBadgeStyle = {
        backgroundColor: "var(--color-surface-muted)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-secondary)",
    };
    const successBannerStyle = {
        background:
            "linear-gradient(90deg, var(--color-success-500), var(--color-success-600))",
        boxShadow:
            "0 12px 24px -12px color-mix(in srgb, var(--color-success-500) 35%, transparent)",
    };
    const successBannerIconStyle = {
        backgroundColor: "color-mix(in srgb, var(--color-surface) 20%, transparent)",
        color: "var(--color-surface)",
    };
    const successBannerTextStyle = {
        color: "var(--color-surface)",
    };
    const successBannerSubtextStyle = {
        color: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
    };
    const successBannerShapeStyle = {
        backgroundColor: "color-mix(in srgb, var(--color-surface) 10%, transparent)",
    };

    const handleToggle = (key: string, value: boolean) => {
        router.put(
            route("outlets.settings.update", outlet.id),
            {
                key,
                value: value ? "true" : "false",
            },
            {
                preserveScroll: true,
            },
        );
    };

    const handleSetting = (key: string, value: string) => {
        router.put(
            route("outlets.settings.update", outlet.id),
            { key, value },
            { preserveScroll: true }
        );
    };

    const getSettingValue = (key: string) => {
        return outlet.outletSettings?.find((s) => s.setting?.key === key)?.value;
    };

    const isAutoWaEnabled = getSettingValue("auto_wa_notification") === "true";
    const isCodEnabled = getSettingValue("cod_enabled") === "true";
    const isAutoAcceptEnabled = getSettingValue("auto_accept_order") === "true";
    const autoAcceptLeadTimeMinutes = getSettingValue("auto_accept_lead_time_minutes") ?? "0";
    const autoAcceptMaxDistanceKm = getSettingValue("auto_accept_max_distance_km") ?? "0";

    const leadTimeOptions = [
        { value: "0", label: "Fallback 24 jam", desc: "Order belum diterima selama 24 jam sejak dibuat" },
        { value: "30", label: "30 menit sebelum pickup", desc: "Auto accept 30 menit sebelum jadwal pickup kurir" },
        { value: "60", label: "1 jam sebelum pickup", desc: "Auto accept 1 jam sebelum jadwal pickup kurir" },
        { value: "120", label: "2 jam sebelum pickup", desc: "Auto accept 2 jam sebelum jadwal pickup kurir" },
    ];

    const maxDistanceOptions = [
        { value: "0", label: "Tanpa batas jarak", desc: "Semua order eligible tanpa filter jarak" },
        { value: "5", label: "Maksimal 5 km", desc: "Order lebih dari 5 km tidak auto accepted" },
        { value: "10", label: "Maksimal 10 km", desc: "Order lebih dari 10 km tidak auto accepted" },
        { value: "15", label: "Maksimal 15 km", desc: "Order lebih dari 15 km tidak auto accepted" },
        { value: "20", label: "Maksimal 20 km", desc: "Order lebih dari 20 km tidak auto accepted" },
    ];

    const notificationStatuses = [
        {
            label: "Pesanan Diterima",
            desc: "Saat order masuk & di-acc oleh admin/sistem",
            icon: ShoppingBag,
            color: "text-info-600",
            bgColor: "bg-info-50",
        },
        {
            label: "Pesanan Ditimbang",
            desc: "Saat harga & detail timbangan ditentukan",
            icon: Scale,
            color: "text-warning-600",
            bgColor: "bg-warning-50",
        },
        {
            label: "Sedang Diproses",
            desc: "Saat cucian mulai diproses atau dikerjakan",
            icon: Loader2,
            iconClassName: "animate-spin-slow",
            color: "text-primary-600",
            bgColor: "bg-primary-50",
        },
        {
            label: "Siap Diambil",
            desc: "Saat pesanan selesai & siap diserahkan",
            icon: PackageCheck,
            color: "text-success-600",
            bgColor: "bg-success-50",
        },
        {
            label: "Sudah Diantar",
            desc: "Saat kurir selesai mengantarkan pesanan",
            icon: Truck,
            color: "text-secondary-600",
            bgColor: "bg-secondary-50",
        },
        {
            label: "Dibatalkan",
            desc: "Saat pesanan dibatalkan oleh admin/sistem",
            icon: XCircle,
            color: "text-error-600",
            bgColor: "bg-error-50",
        },
    ];

    const importantNotes = [
        "Pastikan saldo coin outlet atau owner mencukupi.",
        "Notifikasi hanya akan dikirim jika nomor telepon customer valid.",
        "Anda tetap dapat mengirim notifikasi manual melalui tombol 'Kirim WA' di detail order.",
        "Auto Accept Order hanya berlaku untuk order dari aplikasi customer.",
        "Lead time pickup hanya berlaku untuk order yang memiliki jadwal jemput kurir.",
        "Order tanpa jadwal pickup tetap menggunakan aturan 24 jam jika lead time pickup dipilih.",
        "Jarak dihitung dari alamat pickup customer ke lokasi outlet (garis lurus).",
        "Order yang jaraknya tidak dapat dihitung tidak akan auto accepted jika batas jarak diaktifkan.",
        "Order self drop-off tidak terpengaruh Auto Accept Order.",
        "Riwayat order akan menampilkan perubahan otomatis sebagai 'Sistem otomatis'.",
        "Menonaktifkan Auto Accept Order tidak mengembalikan order yang sudah terlanjur diterima otomatis.",
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <Card
                    isGlass
                    className="lg:col-span-2 overflow-hidden border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                    <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/15 via-primary-500/5 to-transparent p-6 sm:p-8 border-b border-border/40">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 p-4 bg-primary-50 border border-primary-100/50 rounded-2xl shadow-sm transition-transform duration-300 hover:scale-105">
                                    <MessageSquare className="w-7 h-7 text-primary-600" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
                                            Notifikasi WhatsApp Otomatis
                                        </h3>
                                        {isAutoWaEnabled ? (
                                            <div
                                                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
                                                style={statusBadgeStyle}
                                            >
                                                <span className="relative flex h-2 w-2">
                                                    <span
                                                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--color-success-500)",
                                                        }}
                                                    ></span>
                                                    <span
                                                        className="relative inline-flex rounded-full h-2 w-2"
                                                        style={{
                                                            backgroundColor:
                                                                "var(--color-success-500)",
                                                        }}
                                                    ></span>
                                                </span>
                                                <span
                                                    className="text-[10px] font-bold uppercase tracking-wider"
                                                    style={{
                                                        color: "var(--color-success-600)",
                                                    }}
                                                >
                                                    Aktif
                                                </span>
                                            </div>
                                        ) : (
                                            <div
                                                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border"
                                                style={inactiveBadgeStyle}
                                            >
                                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                                    Nonaktif
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
                                        Kirim notifikasi WhatsApp otomatis ke
                                        customer setiap kali status pesanan
                                        berubah. Tingkatkan transparansi dan
                                        pengalaman belanja pelanggan Anda.
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary-50/50 text-primary-700 border border-primary-100/50 shadow-sm">
                                        <Coins className="w-3.5 h-3.5" />
                                        <span>
                                            Biaya: 1 coin per notifikasi
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-shrink-0 self-start sm:self-center">
                                <ToggleSwitch
                                    checked={isAutoWaEnabled}
                                    colorScheme="green"
                                    size="lg"
                                    onChange={(checked) =>
                                        handleToggle(
                                            "auto_wa_notification",
                                            checked,
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                                    <BellRing className="w-5 h-5 text-primary-500" />
                                    Alur Notifikasi Otomatis
                                </h4>
                                <p className="text-xs sm:text-sm text-text-tertiary">
                                    Notifikasi akan terkirim saat pesanan berada
                                    pada status berikut
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {notificationStatuses.map((item, i) => (
                                <div
                                    key={i}
                                    className="group relative overflow-hidden flex flex-col p-4 rounded-xl bg-surface border border-border/60 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-primary-500/30"
                                >
                                    <div className="flex items-center gap-3.5 mb-2">
                                        <div
                                            className={`p-2.5 rounded-lg ${item.bgColor} ${item.color} transition-colors duration-300 group-hover:bg-primary-500 group-hover:text-white`}
                                        >
                                            <item.icon
                                                className={`w-5 h-5 ${(item as any).iconClassName || ""}`}
                                            />
                                        </div>
                                        <h5 className="font-bold text-sm sm:text-base text-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {item.label}
                                        </h5>
                                    </div>
                                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                                        {item.desc}
                                    </p>

                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-500/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col gap-6">
                    <Card
                        isGlass
                        className="overflow-hidden border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="relative p-6 bg-gradient-to-br from-success-500/10 via-transparent to-transparent">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-shrink-0 p-3 bg-success-50 border border-success-100/50 rounded-xl">
                                    <Wallet className="w-6 h-6 text-success-600" />
                                </div>
                                <ToggleSwitch
                                    checked={isCodEnabled}
                                    colorScheme="green"
                                    size="md"
                                    onChange={(checked) =>
                                        handleToggle("cod_enabled", checked)
                                    }
                                />
                            </div>
                            <div className="mt-4 space-y-2">
                                <h4 className="text-lg font-bold text-text-primary">
                                    Pembayaran COD
                                </h4>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    Aktifkan opsi pembayaran tunai di tempat
                                    saat pesanan diterima oleh pelanggan.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        isGlass
                        className="overflow-hidden border border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="relative p-6 bg-gradient-to-br from-warning-500/10 via-transparent to-transparent">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-shrink-0 p-3 bg-warning-50 border border-warning-100/50 rounded-xl">
                                    <Clock className="w-6 h-6 text-warning-600" />
                                </div>
                                <ToggleSwitch
                                    checked={isAutoAcceptEnabled}
                                    colorScheme="yellow"
                                    size="md"
                                    onChange={(checked) =>
                                        handleToggle(
                                            "auto_accept_order",
                                            checked,
                                        )
                                    }
                                />
                            </div>
                            <div className="mt-4 space-y-2">
                                <h4 className="text-lg font-bold text-text-primary">
                                    Auto Accept Order
                                </h4>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    Tentukan kapan order customer yang belum
                                    diterima akan disetujui otomatis. Pilih
                                    window waktu sebelum pickup dan batas jarak
                                    maksimal agar hanya order yang relevan
                                    secara operasional yang diterima otomatis.
                                </p>
                                <div
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-sm mt-1"
                                    style={{
                                        backgroundColor:
                                            "var(--color-warning-50)",
                                        borderColor:
                                            "color-mix(in srgb, var(--color-warning-500) 24%, transparent)",
                                        color: "var(--color-warning-600)",
                                    }}
                                >
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>Riwayat: Sistem otomatis</span>
                                </div>
                            </div>
                        </div>

                        {isAutoAcceptEnabled && (
                            <div className="p-6 border-t border-border/40 space-y-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-text-primary">
                                        Waktu Auto Accept
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {leadTimeOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() =>
                                                    handleSetting(
                                                        "auto_accept_lead_time_minutes",
                                                        option.value,
                                                    )
                                                }
                                                className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                                                    autoAcceptLeadTimeMinutes ===
                                                    option.value
                                                        ? "border-warning-500 bg-warning-50"
                                                        : "border-border/60 bg-surface hover:border-warning-300 hover:bg-warning-50/50"
                                                }`}
                                            >
                                                <div className="font-semibold text-sm text-text-primary">
                                                    {option.label}
                                                </div>
                                                <div className="text-xs text-text-secondary mt-0.5">
                                                    {option.desc}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-text-primary">
                                        Batas Jarak Maksimal
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {maxDistanceOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() =>
                                                    handleSetting(
                                                        "auto_accept_max_distance_km",
                                                        option.value,
                                                    )
                                                }
                                                className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                                                    autoAcceptMaxDistanceKm ===
                                                    option.value
                                                        ? "border-warning-500 bg-warning-50"
                                                        : "border-border/60 bg-surface hover:border-warning-300 hover:bg-warning-50/50"
                                                }`}
                                            >
                                                <div className="font-semibold text-sm text-text-primary">
                                                    {option.label}
                                                </div>
                                                <div className="text-xs text-text-secondary mt-0.5">
                                                    {option.desc}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Card
                isGlass
                className="overflow-hidden border-none shadow-lg border-l-4"
                style={{ borderLeftColor: "var(--color-info-500)" }}
            >
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col md:flex-row gap-5">
                        <div
                            className="flex-shrink-0 p-3 rounded-xl shadow-sm self-start"
                            style={{
                                backgroundColor: "var(--color-info-50)",
                                border: "1px solid color-mix(in srgb, var(--color-info-500) 16%, transparent)",
                            }}
                        >
                            <Info className="w-6 h-6 text-info-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4
                                className="text-lg font-bold mb-4"
                                style={{ color: "var(--color-info-600)" }}
                            >
                                Informasi Penting
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {importantNotes.map((note, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 text-sm leading-relaxed p-3 rounded-lg border"
                                        style={{
                                            color: "var(--color-info-600)",
                                            backgroundColor:
                                                "color-mix(in srgb, var(--color-info-50) 72%, transparent)",
                                            borderColor:
                                                "color-mix(in srgb, var(--color-info-500) 10%, transparent)",
                                        }}
                                    >
                                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-info-600 mt-0.5" />
                                        <span>{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>

            {isAutoWaEnabled && (
                <div
                    className="relative overflow-hidden rounded-2xl p-5 animate-fade-in-up"
                    style={successBannerStyle}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 relative z-10">
                            <div
                                className="p-2.5 rounded-lg backdrop-blur-md"
                                style={successBannerIconStyle}
                            >
                                <CheckCircle2
                                    className="w-6 h-6"
                                    style={successBannerTextStyle}
                                />
                            </div>
                            <div>
                                <p
                                    className="font-bold text-lg"
                                    style={successBannerTextStyle}
                                >
                                    Notifikasi WhatsApp Siap Dikirim!
                                </p>
                                <p
                                    className="text-sm"
                                    style={successBannerSubtextStyle}
                                >
                                    Fitur ini akan secara otomatis mengirimkan
                                    pembaruan status ke pelanggan Anda.
                                </p>
                            </div>
                        </div>
                        <div
                            className="absolute right-0 top-0 bottom-0 w-1/2 -skew-x-12 translate-x-1/2 pointer-events-none"
                            style={successBannerShapeStyle}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutletSettingsTab;
