import React, { useState, useMemo } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import SectionBackground from "@/Components/SectionBackground";

const ROICalculator: React.FC = () => {
    const [outlets, setOutlets] = useState(2);
    const [ordersPerDay, setOrdersPerDay] = useState(50);
    const [adminHours, setAdminHours] = useState(3);

    const calculations = useMemo(() => {
        const totalOrdersPerDay = ordersPerDay * outlets;
        const totalAdminHoursPerDay = adminHours * outlets;
        const timeSavedPerWeek = totalAdminHoursPerDay * 7 * 0.6;

        const extraOrderCapacity = Math.round(
            (timeSavedPerWeek * ordersPerDay) / (adminHours * 7),
        );

        const staffSaving = Math.round(timeSavedPerWeek * 15000);
        const monthlySavings = staffSaving * 4.33; // per bulan
        const estimatedCoinCost = 300000;
        const roiRatio = (monthlySavings / estimatedCoinCost).toFixed(1);

        return {
            totalOrdersPerDay,
            timeSavedPerWeek: Math.round(timeSavedPerWeek * 10) / 10,
            extraOrderCapacity,
            staffSaving,
            monthlySavings: Math.round(monthlySavings),
            estimatedCoinCost,
            roiRatio: parseFloat(roiRatio),
        };
    }, [outlets, ordersPerDay, adminHours]);

    return (
        <section className="py-20 px-4 relative overflow-hidden">
            <SectionBackground />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
                    <div
                        className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                        style={{
                            backgroundColor: "var(--color-secondary-50)",
                            borderColor: "var(--color-secondary-200)",
                            color: "var(--color-secondary-700)",
                        }}
                    >
                        <Calculator className="w-4 h-4 mr-2" />
                        Hitung ROI Anda
                    </div>

                    <h2
                        className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        Berapa Banyak Anda Bisa{" "}
                        <span
                            style={{
                                background: `linear-gradient(135deg, var(--color-secondary-600), var(--color-primary-500))`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Hemat?
                        </span>
                    </h2>

                    <p
                        className="text-lg md:text-xl leading-relaxed"
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Sesuaikan dengan kondisi bisnis Anda dan lihat langsung
                        ROI dari WashWallet.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div
                        className="p-8 rounded-2xl border backdrop-blur-sm"
                        style={{
                            backgroundColor: "var(--color-surface)",
                            borderColor: "var(--color-border)",
                        }}
                    >
                        <h3
                            className="text-xl font-bold mb-6"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Kondisi Bisnis Anda
                        </h3>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Jumlah Outlet
                                </label>
                                <span
                                    className="text-lg font-bold rounded-lg px-3 py-1"
                                    style={{
                                        color: "var(--color-primary-600)",
                                        backgroundColor:
                                            "var(--color-primary-50)",
                                    }}
                                >
                                    {outlets}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={outlets}
                                onChange={(e) =>
                                    setOutlets(Number(e.target.value))
                                }
                                className="w-full h-2 rounded-lg bg-gray-200 appearance-none cursor-pointer"
                                style={{
                                    accentColor: "var(--color-primary-500)",
                                }}
                            />
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Rata-rata Pesanan/Hari
                                </label>
                                <span
                                    className="text-lg font-bold rounded-lg px-3 py-1"
                                    style={{
                                        color: "var(--color-secondary-600)",
                                        backgroundColor:
                                            "var(--color-secondary-50)",
                                    }}
                                >
                                    {ordersPerDay}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={ordersPerDay}
                                onChange={(e) =>
                                    setOrdersPerDay(Number(e.target.value))
                                }
                                className="w-full h-2 rounded-lg bg-gray-200 appearance-none cursor-pointer"
                                style={{
                                    accentColor: "var(--color-secondary-500)",
                                }}
                            />
                            <p
                                className="text-xs mt-2"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Total pesanan semua outlet:{" "}
                                {calculations.totalOrdersPerDay.toLocaleString(
                                    "id-ID",
                                )}
                                /hari
                            </p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <label
                                    className="text-sm font-medium"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Jam Admin/Hari untuk Input Manual
                                </label>
                                <span
                                    className="text-lg font-bold rounded-lg px-3 py-1"
                                    style={{
                                        color: "var(--color-accent-600)",
                                        backgroundColor:
                                            "var(--color-accent-50)",
                                    }}
                                >
                                    {adminHours}h
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="8"
                                value={adminHours}
                                onChange={(e) =>
                                    setAdminHours(Number(e.target.value))
                                }
                                className="w-full h-2 rounded-lg bg-gray-200 appearance-none cursor-pointer"
                                style={{
                                    accentColor: "var(--color-accent-500)",
                                }}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div
                            className="p-6 rounded-2xl border backdrop-blur-sm"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <p
                                className="text-sm mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Waktu Tersimpan Per Minggu
                            </p>
                            <p
                                className="text-4xl font-bold"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                {calculations.timeSavedPerWeek}
                                <span className="text-xl ml-1">jam</span>
                            </p>
                            <p
                                className="text-xs mt-2"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                ✓ Bisa fokus ke hal yang lebih strategic
                            </p>
                        </div>

                        <div
                            className="p-6 rounded-2xl border backdrop-blur-sm"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <p
                                className="text-sm mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Pesanan Tambahan Bisa Dihandle
                            </p>
                            <p
                                className="text-4xl font-bold"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                +{calculations.extraOrderCapacity}
                                <span className="text-xl ml-1">pesanan</span>
                            </p>
                            <p
                                className="text-xs mt-2"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                ✓ Tanpa hire staf tambahan
                            </p>
                        </div>

                        <div
                            className="p-6 rounded-2xl border backdrop-blur-sm"
                            style={{
                                backgroundColor: "var(--color-surface)",
                                borderColor: "var(--color-border)",
                            }}
                        >
                            <p
                                className="text-sm mb-2"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                Penghematan Biaya Admin Per Bulan
                            </p>
                            <p
                                className="text-4xl font-bold"
                                style={{
                                    color: "var(--color-warning-600)",
                                }}
                            >
                                Rp{" "}
                                {calculations.monthlySavings.toLocaleString(
                                    "id-ID",
                                )}
                            </p>
                            <p
                                className="text-xs mt-2"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                ✓ Biaya WashWallet: ~Rp 300rb/bulan
                            </p>
                        </div>

                        <div
                            className="p-6 rounded-2xl border-2"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                borderColor: "var(--color-primary-300)",
                            }}
                        >
                            <p
                                className="text-sm mb-2"
                                style={{
                                    color: "var(--color-primary-700)",
                                }}
                            >
                                ROI Multiplier
                            </p>
                            <p
                                className="text-5xl font-bold"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                {calculations.roiRatio}
                                <span className="text-2xl ml-1">x</span>
                            </p>
                            <p
                                className="text-sm mt-2"
                                style={{
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                Setiap Rp 1 biaya WashWallet menghasilkan Rp{" "}
                                {calculations.roiRatio} penghematan
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12">
                    <a
                        href="/register"
                        className="group inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        style={{
                            backgroundColor: "var(--color-primary-500)",
                            color: "#ffffff",
                        }}
                    >
                        Mulai Trial Gratis — Lihat Sendiri
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ROICalculator;
