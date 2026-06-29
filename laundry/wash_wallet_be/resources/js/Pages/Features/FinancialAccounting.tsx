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
import { financialAccountingData } from "@/Data/Features/FinancialAccounting";
import type { InteractiveSimulatorData } from "./Partials/InteractiveSimulator";
import {
    BookOpen,
    Receipt,
    Wallet,
    FileText,
    CheckCircle,
    ArrowRightLeft,
} from "lucide-react";

const financialSimulatorData: InteractiveSimulatorData = {
    badge: "Auto-Journal System",
    headline: "Simulasi Pembukuan Transaksi Otomatis",
    subheadline:
        "Klik tahapan di bawah ini untuk melihat bagaimana operasional laundry langsung terkonversi menjadi entri jurnal akuntansi tanpa perlu dicatat manual.",
    accentColor: "var(--color-rose-500)",
    accentStrongColor: "var(--color-rose-600)",
    glowSecondaryColor: "var(--color-rose-600)",
    headerLayout: "split",
    completedTone: "rose",
    browserUrl: "washwallet-client://accounting/dashboard",
    hint: "Semua jurnal ini akan bermuara pada laporan buku besar, neraca, dan laba-rugi secara real-time.",
    steps: [
        {
            id: "expense",
            title: "Pengajuan Pengeluaran",
            icon: <Receipt className="h-5 w-5" />,
            description:
                "Kasir membuat pengajuan (expense request) untuk membeli stok deterjen. Sistem menunggu persetujuan (approval) dari owner sebelum uang kas benar-benar dianggap keluar.",
            actor: "Kasir Outlet",
            actorIcon: <CheckCircle className="h-4 w-4" />,
            features: [
                "Form pengajuan pengeluaran terintegrasi",
                "Wajib unggah bukti nota pembelian",
                "Pilihan akun sumber dana (Kas) & beban (Deterjen)",
            ],
            insight:
                "Mencegah uang keluar dari laci tanpa sepengetahuan dan bukti nyata.",
            actionLabel: "Simulasikan: Ajukan Expense",
            successMessage:
                "Pengajuan sukses dibuat! Statusnya kini tertunda (pending), menunggu ACC dari owner.",
            simulatorState: {
                badgeText: "Pending Approval",
                badgeType: "warning",
                cardTitle: "Beli Deterjen 10 Kg",
                cardSubtitle: "Sumber Dana: Kas Outlet Tebet",
                details: [
                    { label: "Nominal", value: "Rp 150.000" },
                    { label: "Lampiran", value: "Nota_Deterjen.jpg" },
                    { label: "Status", value: "Menunggu Owner" },
                ],
            },
        },
        {
            id: "approval",
            title: "Approval Owner",
            icon: <CheckCircle className="h-5 w-5" />,
            description:
                "Owner menerima notifikasi, melihat lampiran nota, dan menekan tombol Approve. Saat itulah, WashWallet otomatis membuat jurnal akuntansi ganda (double-entry).",
            actor: "Owner Laundry",
            actorIcon: <BookOpen className="h-4 w-4" />,
            features: [
                "Approval bisa dilakukan dari mana saja",
                "Sistem otomatis menyusun debit dan kredit",
                "Akun Kas Outlet berkurang otomatis",
            ],
            insight:
                "Keamanan ganda: tidak ada penjurnalan expense tanpa approval final.",
            actionLabel: "Simulasikan: Approve Expense",
            successMessage:
                "Expense di-approve! Jurnal tercatat: Debit Beban Perlengkapan & Kredit Kas Outlet.",
            simulatorState: {
                badgeText: "Jurnal Terbentuk",
                badgeType: "rose",
                cardTitle: "Jurnal Entri #JE-00123",
                cardSubtitle: "Memo: Beli Deterjen 10 Kg",
                details: [
                    {
                        label: "Debit",
                        value: "Beban Perlengkapan (Rp 150.000)",
                    },
                    {
                        label: "Kredit",
                        value: "Kas Outlet Tebet (Rp 150.000)",
                        highlight: true,
                    },
                    { label: "Status Jurnal", value: "Tercatat di Buku Besar" },
                ],
            },
        },
        {
            id: "report",
            title: "Laba Rugi Real-Time",
            icon: <FileText className="h-5 w-5" />,
            description:
                "Owner membuka Laporan Laba Rugi (Profit & Loss). Pengeluaran sebesar Rp 150.000 untuk deterjen tadi sudah otomatis memotong pendapatan operasional bulan ini.",
            actor: "Sistem Akuntansi",
            actorIcon: <FileText className="h-4 w-4" />,
            features: [
                "Laporan Laba Rugi ditarik dari rincian jurnal detail",
                "Saldo laba diperbarui secara real-time",
                "Bisa diekspor ke PDF maupun Excel",
            ],
            insight:
                "Buku besar langsung terintegrasi dengan neraca tanpa harus rekap akhir bulan.",
            actionLabel: "Simulasikan: Cek Laba Rugi",
            successMessage:
                "Laporan Laba Rugi menampilkan pembaruan! Laba bersih bulan ini telah dikurangi otomatis sebesar expense.",
            simulatorState: {
                badgeText: "Laba Rugi Terkini",
                badgeType: "rose",
                cardTitle: "Laporan Profit/Loss Bulan Berjalan",
                cardSubtitle: "Outlet: Tebet Raya",
                details: [
                    { label: "Total Pendapatan", value: "Rp 5.500.000" },
                    {
                        label: "Total Beban (Termasuk Deterjen)",
                        value: "Rp 1.150.000",
                    },
                    {
                        label: "Laba Bersih",
                        value: "Rp 4.350.000",
                        highlight: true,
                    },
                ],
            },
        },
        {
            id: "withdrawal",
            title: "Penarikan Dana Owner",
            icon: <Wallet className="h-5 w-5" />,
            description:
                "Owner ingin menarik keuntungan sebesar Rp 2.000.000 ke rekening pribadinya. Ia menggunakan menu Owner Wallet untuk request withdrawal ke admin pusat.",
            actor: "Owner Laundry",
            actorIcon: <ArrowRightLeft className="h-4 w-4" />,
            features: [
                "Alur withdrawal terpusat via dompet digital (wallet)",
                "Pemisahan uang operasional outlet dan profit owner",
                "Admin menandai telah dibayar jika transfer selesai",
            ],
            insight:
                "Prive owner terstruktur rapi, mencegah kekacauan arus kas outlet.",
            actionLabel: "Simulasikan: Request Withdrawal",
            successMessage:
                "Request withdrawal terkirim! Jurnal penyesuaian akan dieksekusi setelah admin memproses transfer bank.",
            simulatorState: {
                badgeText: "Withdrawal Diproses",
                badgeType: "rose",
                cardTitle: "Status Penarikan: #WD-099",
                cardSubtitle: "Rekening Tujuan: BCA - 123456",
                details: [
                    { label: "Jumlah Ditarik", value: "Rp 2.000.000" },
                    { label: "Sisa Saldo Wallet", value: "Rp 2.350.000" },
                    {
                        label: "Status",
                        value: "Menunggu Admin Transfer",
                        highlight: true,
                    },
                ],
            },
        },
    ],
};

const FinancialAccounting: React.FC = () => {
    const pageBackground = {
        background: `
            radial-gradient(ellipse 80% 45% at 0% 0%, color-mix(in srgb, var(--color-rose-500) 16%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 70% 40% at 100% 12%, color-mix(in srgb, var(--color-rose-600) 14%, transparent) 0%, transparent 58%),
            linear-gradient(180deg, var(--color-background) 0%, var(--color-gray-50) 42%, var(--color-background) 100%)
        `,
    };

    return (
        <>
            <Head title="Akuntansi Keuangan - WashWallet | Jurnal & Laporan Finansial" />

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
                            <div className="glow-orb glow-orb-rose-primary glow-top-left" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-right" />
                            <FeatureHero
                                data={financialAccountingData.hero}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-right" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-left" />
                            <FeaturePainPoints
                                data={financialAccountingData.painPoints}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-left" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-right" />
                            <FeatureHighlights
                                data={financialAccountingData.highlights}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-right" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-left" />
                            <InteractiveSimulator
                                data={financialSimulatorData}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-left" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-right" />
                            <DetailedSections
                                data={financialAccountingData.detailedSections}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-right" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-left" />
                            <UseCases
                                data={{
                                    badge: "Studi Kasus",
                                    headline: "Skenario Penjurnalan Akuntansi",
                                    subheadline:
                                        "Bagaimana WashWallet membukukan transaksi secara real-time tanpa perlu rekap manual.",
                                    accentColor: "var(--color-rose-500)",
                                    accentBg: "var(--color-rose-50)",
                                    accentBorder: "var(--color-rose-200)",
                                    cases: financialAccountingData.useCases,
                                }}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-left" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-right" />
                            <FeatureBenefits
                                data={financialAccountingData.benefits}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-right" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-left" />
                            <FeatureComparison
                                data={financialAccountingData.comparison}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-left" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-right" />
                            <FeatureFAQ
                                data={financialAccountingData.faqs}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-rose-primary glow-top-right" />
                            <div className="glow-orb glow-orb-rose-secondary glow-bottom-left" />
                            <FeatureCTAFinal
                                data={financialAccountingData.ctaFinal}
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

export default FinancialAccounting;
