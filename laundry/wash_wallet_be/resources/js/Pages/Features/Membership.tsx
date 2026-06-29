import React from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import FeatureHero from "./Partials/FeatureHero";
import FeaturePainPoints from "./Partials/FeaturePainPoints";
import FeatureHighlights from "./Partials/FeatureHighlights";
import InteractiveSimulator from "./Partials/InteractiveSimulator";
import DetailedSections from "./Partials/DetailedSections";
import UseCases from "./Partials/UseCases";
import FeatureBenefits from "./Partials/FeatureBenefits";
import FeatureComparison from "./Partials/FeatureComparison";
import FeatureFAQ from "./Partials/FeatureFAQ";
import FeatureCTAFinal from "./Partials/FeatureCTAFinal";
import { membershipData } from "@/Data/Features/Membership";
import type { InteractiveSimulatorData } from "./Partials/InteractiveSimulator";
import {
    Activity,
    Award,
    CreditCard,
    Gift,
    MapPin,
    PlusCircle,
    Scale,
    Users,
} from "lucide-react";

const membershipSimulatorData: InteractiveSimulatorData = {
    badge: "Program Retensi Pelanggan",
    headline: "Simulasi Langganan & Membership",
    subheadline:
        "Klik setiap tahapan di bawah untuk mensimulasikan bagaimana WashWallet mengamankan loyalitas pelanggan laundry Anda melalui paket kuota prabayar, membership, dan deposit nontunai.",
    accentColor: "var(--color-info-500)",
    accentStrongColor: "var(--color-info-600)",
    glowSecondaryColor: "var(--color-info-600)",
    headerLayout: "split",
    completedTone: "info",
    browserUrl: "washwallet-client://membership-dashboard",
    hint: "Data sisa kuota dan langganan aktif tersinkronisasi instan demi kemudahan audit pembukuan outlet.",
    steps: [
        {
            id: "config",
            title: "Konfigurasi Paket",
            icon: <PlusCircle className="h-5 w-5" />,
            description:
                "Sebagai pemilik outlet (owner), Anda membuat paket layanan prabayar di dashboard. Contoh: 'Paket Kiloan Hemat' seharga Rp 80.000 dengan kuota 10 Kg cuci-kering-setrika yang berlaku selama 30 hari.",
            actor: "Owner Laundry",
            actorIcon: <Award className="h-4 w-4" />,
            features: [
                "Bebas tentukan jenis layanan laundry",
                "Atur nominal harga & durasi masa aktif",
                "Otomatisasi pencatatan uang muka di pembukuan",
            ],
            insight: "Menjamin repeat order dari pelanggan di awal transaksi.",
            actionLabel: "Simulasikan: Rilis Paket Baru",
            successMessage:
                "Skenario berhasil: Paket baru dirilis! Kasir Anda di outlet kini bisa langsung menjual paket ini kepada pelanggan.",
            simulatorState: {
                badgeText: "Paket Rilis",
                badgeType: "info",
                cardTitle: "Paket Kiloan Hemat",
                cardSubtitle: "Outlet: Tebet Raya | Masa Aktif: 30 Hari",
                details: [
                    { label: "Harga Paket", value: "Rp 80.000" },
                    {
                        label: "Kuota Layanan",
                        value: "10 Kg Cuci-Lipat-Setrika",
                    },
                    {
                        label: "Status Paket",
                        value: "Aktif & Dapat Ditawarkan",
                    },
                ],
            },
        },
        {
            id: "purchase",
            title: "Pembelian Paket",
            icon: <Gift className="h-5 w-5" />,
            description:
                "Pelanggan membeli paket prabayar tersebut. Kasir mendaftarkan langganan pelanggan via aplikasi kasir, dan sistem membuat jatah kuota aktif di akun pelanggan.",
            actor: "Kasir Outlet",
            actorIcon: <Users className="h-4 w-4" />,
            features: [
                "Pendaftaran langganan instan lewat HP kasir",
                "Pembuatan kode kuota pelanggan otomatis",
                "Pilihan pembayaran tunai maupun nontunai",
            ],
            insight:
                "Menerima dana prabayar di awal untuk memperkuat cashflow outlet.",
            actionLabel: "Simulasikan: Catat Penjualan Paket",
            successMessage:
                "Skenario berhasil: Langganan aktif dibuat! Sisa kuota Budi terekam aman sebanyak 10 Kg di sistem.",
            simulatorState: {
                badgeText: "Langganan Aktif",
                badgeType: "info",
                cardTitle: "Langganan Member: Budi Santoso",
                cardSubtitle: "Kode Langganan: #SUB-BUDI-99",
                details: [
                    { label: "Paket Dibeli", value: "Paket Kiloan Hemat" },
                    { label: "Kuota Awal", value: "10 Kg" },
                    {
                        label: "Sisa Kuota Budi",
                        value: "10 Kg",
                        highlight: true,
                    },
                ],
            },
        },
        {
            id: "usage",
            title: "Pengurangan Kuota",
            icon: <Activity className="h-5 w-5" />,
            description:
                "Budi membawa cucian kotor seberat 3 Kg. Kasir mendaftarkan order dan memilih pembayaran potong kuota. Sistem memvalidasi, memotong sisa kuota, dan mencatat log penggunaan.",
            actor: "Kasir & Pelanggan",
            actorIcon: <Scale className="h-4 w-4" />,
            features: [
                "Validasi otomatis sisa kuota pelanggan",
                "Log penggunaan kuota tercatat mendetail",
                "Order otomatis ditandai lunas dengan kuota",
            ],
            insight:
                "Kasir tidak perlu mencatat manual di kertas, mencegah manipulasi data.",
            actionLabel: "Simulasikan: Potong Kuota 3 Kg",
            successMessage:
                "Skenario berhasil: Kuota berhasil dipotong! Kuota Budi tersisa 7 Kg dan notifikasi WhatsApp langsung terkirim.",
            simulatorState: {
                badgeText: "Kuota Terpotong",
                badgeType: "info",
                cardTitle: "Order Cucian Budi Santoso",
                cardSubtitle: "Metode: Potong Kuota (#SUB-BUDI-99)",
                details: [
                    { label: "Berat Cucian", value: "3 Kg" },
                    {
                        label: "Sisa Kuota Budi",
                        value: "7 Kg",
                        highlight: true,
                    },
                    { label: "Konfirmasi WA", value: "Terkirim Otomatis" },
                ],
            },
        },
        {
            id: "membership",
            title: "Keuntungan Member",
            icon: <Award className="h-5 w-5" />,
            description:
                "Selain kuota, Budi terdaftar dalam program keanggotaan (Membership Plan) outlet. Budi otomatis menikmati benefit potongan diskon tambahan serta jatah gratis ongkir pengiriman kurir.",
            actor: "Pelanggan (Member)",
            actorIcon: <MapPin className="h-4 w-4" />,
            features: [
                "Diskon persentase langsung setiap transaksi reguler",
                "Batas kuota gratis ongkir kurir bulanan",
                "Masa berlaku kontrak member otomatis kedaluwarsa",
            ],
            insight:
                "Pelanggan betah mencuci jangka panjang dan loyal menggunakan kurir outlet Anda.",
            actionLabel: "Simulasikan: Terapkan Diskon & Ongkir",
            successMessage:
                "Skenario berhasil: Diskon member dan pemotongan jatah gratis ongkir kurir berhasil diterapkan secara otomatis!",
            simulatorState: {
                badgeText: "Member VIP Aktif",
                badgeType: "info",
                cardTitle: "Keanggotaan Member Budi",
                cardSubtitle: "Status Kontrak: Aktif s/d 31 Des 2026",
                details: [
                    { label: "Potongan Diskon", value: "10% Otomatis" },
                    { label: "Jatah Gratis Ongkir", value: "5 kali sebulan" },
                    {
                        label: "Sisa Jatah Ongkir",
                        value: "4 kali",
                        highlight: true,
                    },
                ],
            },
        },
        {
            id: "topup",
            title: "Top-up Saldo Deposit",
            icon: <CreditCard className="h-5 w-5" />,
            description:
                "Pelanggan menyimpan deposit saldo di dompet digital outlet laundry Anda. Pelanggan dapat melakukan pengisian saldo (top-up) nontunai mandiri melalui aplikasi via Midtrans.",
            actor: "Pelanggan",
            actorIcon: <CreditCard className="h-4 w-4" />,
            features: [
                "Pengisian saldo instan terintegrasi Midtrans",
                "Dompet digital aman terikat akun pelanggan",
                "Metode transaksi nontunai mempercepat checkout",
            ],
            insight:
                "Kasir tidak perlu menyiapkan uang kembalian tunai di outlet.",
            actionLabel: "Simulasikan: Top-up Saldo Rp 50.000",
            successMessage:
                "Skenario berhasil: Top-up sukses! Saldo Budi terupdate menjadi Rp 150.000 dan siap digunakan belanja layanan.",
            simulatorState: {
                badgeText: "Top-up Sukses",
                badgeType: "info",
                cardTitle: "Saldo Deposit Budi Santoso",
                cardSubtitle: "Pembayaran: Midtrans Cashless",
                details: [
                    { label: "Jumlah Top-up", value: "Rp 50.000" },
                    { label: "Saldo Sebelumnya", value: "Rp 100.000" },
                    {
                        label: "Total Saldo Sekarang",
                        value: "Rp 150.000",
                        highlight: true,
                    },
                ],
            },
        },
    ],
};

const Membership: React.FC = () => {
    const pageBackground = {
        background: `
            radial-gradient(ellipse 80% 45% at 0% 0%, color-mix(in srgb, var(--color-info-500) 16%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 70% 40% at 100% 12%, color-mix(in srgb, var(--color-info-600) 14%, transparent) 0%, transparent 58%),
            linear-gradient(180deg, var(--color-background) 0%, var(--color-gray-50) 42%, var(--color-background) 100%)
        `,
    };

    return (
        <>
            <Head title="Paket & Membership - WashWallet | Kelola Kuota dan Langganan Pelanggan" />

            <GuestLayout
                showNavigation={true}
                showFooter={true}
                isFullWidth={true}
            >
                <div
                    className="relative w-full overflow-hidden"
                    style={pageBackground}
                >
                    <div className="relative z-10">
                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-left" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-right" />
                            <FeatureHero
                                data={membershipData.hero}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-right" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-left" />
                            <FeaturePainPoints
                                data={membershipData.painPoints}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-left" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-right" />
                            <FeatureHighlights
                                data={membershipData.highlights}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-right" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-left" />
                            <InteractiveSimulator data={membershipSimulatorData} />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-left" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-right" />
                            <DetailedSections
                                data={membershipData.detailedSections}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-right" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-left" />
                            <UseCases
                                data={{
                                    badge: "Studi Kasus",
                                    headline:
                                        "Skenario Pemanfaatan Paket & Member",
                                    subheadline:
                                        "Bagaimana laundry memanfaatkan sistem paket prabayar dan keanggotaan untuk menjaga loyalitas",
                                    accentColor: "var(--color-info-500)",
                                    accentBg: "var(--color-info-50)",
                                    accentBorder: "var(--color-info-200)",
                                    cases: membershipData.useCases,
                                }}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-left" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-right" />
                            <FeatureBenefits
                                data={membershipData.benefits}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-right" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-left" />
                            <FeatureComparison
                                data={membershipData.comparison}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-left" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-right" />
                            <FeatureFAQ
                                data={membershipData.faqs}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-blue-primary glow-top-right" />
                            <div className="glow-orb glow-orb-blue-secondary glow-bottom-left" />
                            <FeatureCTAFinal
                                data={membershipData.ctaFinal}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>
                    </div>
                </div>
            </GuestLayout>
        </>
    );
};

export default Membership;
