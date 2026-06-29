import React, { useMemo, useState } from "react";
import SectionBackground from "@/Components/SectionBackground";
import {
    Coins,
    FileSpreadsheet,
    MessageCircle,
    Receipt,
    Sparkles,
    CheckCircle,
    ArrowRight,
    Store,
} from "lucide-react";

interface PricingItem {
    title: string;
    price: number;
    category: string;
    icon: "Coins" | "FileSpreadsheet" | "MessageCircle" | "Receipt";
    color: string;
    bgColor: string;
    borderColor: string;
}

const Pricing: React.FC = () => {
    const [dailyOrders, setDailyOrders] = useState(80);

    const iconMap = {
        Coins,
        FileSpreadsheet,
        MessageCircle,
        Receipt,
    };

    const pricingData: PricingItem[] = [
        {
            title: "Core Usage",
            price: 100,
            category: "Per Transaksi",
            icon: "Coins",
            color: "var(--color-primary-500)",
            bgColor: "var(--color-primary-50)",
            borderColor: "var(--color-primary-200)",
        },
        {
            title: "Export Laporan Excel",
            price: 500,
            category: "Pelaporan",
            icon: "FileSpreadsheet",
            color: "var(--color-secondary-500)",
            bgColor: "var(--color-secondary-50)",
            borderColor: "var(--color-secondary-200)",
        },
        {
            title: "Kirim WhatsApp",
            price: 75,
            category: "Per Transaksi",
            icon: "MessageCircle",
            color: "var(--color-info-500)",
            bgColor: "var(--color-info-50)",
            borderColor: "var(--color-info-200)",
        },
        {
            title: "Cetak Struk",
            price: 50,
            category: "Per Transaksi",
            icon: "Receipt",
            color: "var(--color-warning-500)",
            bgColor: "var(--color-warning-50)",
            borderColor: "var(--color-warning-200)",
        },
    ];

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID").format(price);
    };

    const estimation = useMemo(() => {
        const monthlyOrders = dailyOrders * 30;
        const averageCoinPerOrder = 225;
        const estimatedCoins = monthlyOrders * averageCoinPerOrder;
        const estimatedCost = estimatedCoins;

        return {
            monthlyOrders,
            estimatedCoins,
            estimatedCost,
        };
    }, [dailyOrders]);

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <SectionBackground />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
                    <div
                        className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold backdrop-blur-xl border shadow-lg transition-all duration-300 hover:scale-105"
                        style={{
                            background: `linear-gradient(135deg, var(--color-accent-50), var(--color-primary-50))`,
                            borderColor: "var(--color-primary-200)",
                            color: "var(--color-primary-700)",
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, var(--color-accent-500), var(--color-primary-500))`,
                            }}
                        >
                            <Coins className="w-4 h-4 text-white" />
                        </div>
                        <span>Skema Harga Transparan</span>
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Skema{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, var(--color-accent-600), var(--color-primary-600))`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            WashWallet
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        One-time aktivasi outlet dan sistem koin pay-as-you-go.
                        Tidak ada biaya tersembunyi, tidak ada kontrak, dan bisa
                        berhenti kapan saja.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-14">
                    <div
                        className="rounded-2xl p-6 border backdrop-blur-sm"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-primary-50)",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                <Store className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Aktivasi Outlet
                                </h3>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Bayar sekali saat aktivasi outlet. Setelah
                                    aktif, seluruh fitur inti outlet terbuka
                                    tanpa biaya bulanan.
                                </p>
                                <p
                                    className="text-xs font-semibold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    One-time activation, berlaku seterusnya
                                </p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="rounded-2xl p-6 border backdrop-blur-sm"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{
                                    backgroundColor:
                                        "var(--color-secondary-50)",
                                    color: "var(--color-secondary-600)",
                                }}
                            >
                                <Coins className="w-6 h-6" />
                            </div>
                            <div className="space-y-2">
                                <h3
                                    className="text-xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Koin untuk Layanan
                                </h3>
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Anda hanya membayar saat fitur digunakan,
                                    seperti transaksi, cetak struk, atau kirim
                                    WhatsApp.
                                </p>
                                <p
                                    className="text-xs font-semibold"
                                    style={{
                                        color: "var(--color-secondary-600)",
                                    }}
                                >
                                    Top up fleksibel sesuai volume operasional
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="max-w-5xl mx-auto rounded-2xl p-6 md:p-8 border mb-14"
                    style={{
                        backgroundColor: "var(--color-surface)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3
                                className="text-xl font-bold mb-4"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Estimasi Kebutuhan Koin Bulanan
                            </h3>
                            <p
                                className="text-sm mb-5"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Geser jumlah pesanan harian untuk melihat
                                estimasi penggunaan koin dan biaya bulanan.
                            </p>

                            <div className="mb-3 flex items-center justify-between">
                                <span
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Pesanan per Hari
                                </span>
                                <span
                                    className="text-lg font-bold px-3 py-1 rounded-lg"
                                    style={{
                                        color: "var(--color-primary-600)",
                                        backgroundColor:
                                            "var(--color-primary-50)",
                                    }}
                                >
                                    {dailyOrders}
                                </span>
                            </div>

                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={dailyOrders}
                                onChange={(e) =>
                                    setDailyOrders(Number(e.target.value))
                                }
                                className="w-full h-2 rounded-lg bg-gray-200 appearance-none cursor-pointer"
                                style={{
                                    accentColor: "var(--color-primary-500)",
                                }}
                            />
                        </div>

                        <div className="space-y-3">
                            <div
                                className="rounded-xl p-4"
                                style={{
                                    backgroundColor: "var(--color-background)",
                                }}
                            >
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Estimasi Pesanan Bulanan
                                </p>
                                <p
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    {estimation.monthlyOrders.toLocaleString(
                                        "id-ID",
                                    )}
                                </p>
                            </div>

                            <div
                                className="rounded-xl p-4"
                                style={{
                                    backgroundColor: "var(--color-background)",
                                }}
                            >
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Estimasi Koin per Bulan
                                </p>
                                <p
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-secondary-600)",
                                    }}
                                >
                                    {estimation.estimatedCoins.toLocaleString(
                                        "id-ID",
                                    )}{" "}
                                    koin
                                </p>
                            </div>

                            <div
                                className="rounded-xl p-4 border"
                                style={{
                                    backgroundColor: "var(--color-primary-50)",
                                    borderColor: "var(--color-primary-200)",
                                }}
                            >
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-primary-700)",
                                    }}
                                >
                                    Estimasi Biaya Bulanan
                                </p>
                                <p
                                    className="text-3xl font-bold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    Rp {formatPrice(estimation.estimatedCost)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                    {[
                        "Tanpa Biaya Bulanan",
                        "Top Up Kapan Saja",
                        "Transparan & Fair",
                        "Tidak Ada Kontrak",
                    ].map((feature, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <CheckCircle
                                className="w-4 h-4 flex-shrink-0"
                                style={{
                                    color: "var(--color-success-500)",
                                }}
                            />
                            <span
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                {feature}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
                    {pricingData.map((item, index) => {
                        const IconComponent = iconMap[item.icon];

                        return (
                            <div
                                key={index}
                                className="group relative rounded-xl p-8 border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-fadeInUp"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                    animationDelay: `${index * 100}ms`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor =
                                        item.borderColor;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor =
                                        "var(--color-border)";
                                }}
                            >
                                <div
                                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"
                                    style={{
                                        background: `linear-gradient(135deg, ${item.bgColor} 0%, transparent 100%)`,
                                    }}
                                />

                                <div className="mb-6">
                                    <div
                                        className="inline-flex w-16 h-16 rounded-xl items-center justify-center group-hover:scale-110 transition-transform duration-300 relative"
                                        style={{
                                            backgroundColor: item.bgColor,
                                            border: `2px solid ${item.borderColor}`,
                                        }}
                                    >
                                        <IconComponent
                                            className="w-8 h-8"
                                            style={{ color: item.color }}
                                        />
                                        <div
                                            className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                                            style={{
                                                backgroundColor: item.color,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div
                                        className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                                        style={{
                                            backgroundColor: item.bgColor,
                                            color: item.color,
                                        }}
                                    >
                                        {item.category}
                                    </div>

                                    <h3
                                        className="text-xl font-bold leading-tight min-h-[3.5rem] flex items-center"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {item.title}
                                    </h3>

                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-2">
                                            <span
                                                className="text-4xl font-bold"
                                                style={{ color: item.color }}
                                            >
                                                Rp{formatPrice(item.price)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Coins
                                                className="w-4 h-4"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            />
                                            <span
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                {formatPrice(item.price)} Koin
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                                    style={{ backgroundColor: item.color }}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="mt-16 max-w-4xl mx-auto">
                    <div
                        className="rounded-2xl p-8 md:p-10 border backdrop-blur-sm shadow-xl"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                            background: `linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-surface) 100%)`,
                        }}
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div
                                className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))`,
                                }}
                            >
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-2">
                                <h3
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Hemat Lebih Banyak dengan Top Up Besar
                                </h3>
                                <p
                                    className="text-base leading-relaxed"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Dapatkan bonus koin hingga 20% untuk setiap
                                    top up di atas Rp 1.000.000. Semakin besar
                                    top up, semakin besar bonus yang Anda
                                    dapatkan.
                                </p>
                            </div>

                            <a
                                href="/topup"
                                className="group flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl text-white"
                                style={{
                                    background: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))`,
                                }}
                            >
                                Top Up Sekarang
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
