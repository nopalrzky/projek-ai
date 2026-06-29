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
import { hrPayrollData } from "@/Data/Features/HrPayroll";
import type { InteractiveSimulatorData } from "./Partials/InteractiveSimulator";
import {
    ArrowRightLeft,
    Banknote,
    Briefcase,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Receipt,
    ShieldCheck,
    Users,
    Wallet,
} from "lucide-react";

const hrPayrollSimulatorData: InteractiveSimulatorData = {
    badge: "Alur Payroll",
    headline: "Simulasi Payroll dari Komisi sampai Jurnal",
    subheadline:
        "Klik tahapan di bawah untuk melihat bagaimana WashWallet menghubungkan employee, work log, fine, loan, dan payroll paid dalam satu alur yang rapi.",
    accentColor: "var(--color-warning-500)",
    accentStrongColor: "var(--color-warning-600)",
    glowSecondaryColor: "var(--color-warning-600)",
    headerLayout: "split",
    insightTone: "warning",
    completedTone: "warning",
    browserUrl: "washwallet-client://hr-payroll/dashboard",
    hint: "Payroll yang sudah disimpan ikut tercatat ke accounting journal, jadi angka gaji tetap sinkron dengan laporan keuangan.",
    steps: [
        {
            id: "employee",
            title: "Atur Employee",
            icon: <Users className="h-5 w-5" />,
            description:
                "Owner membuat employee baru untuk outlet, lalu menautkan posisi dan permission agar akses mobile app sesuai peran karyawan.",
            actor: "Owner / HR",
            actorIcon: <ShieldCheck className="h-4 w-4" />,
            features: [
                "Employee tersimpan per outlet",
                "Position dan permission list aktif",
                "Akses mobile dibatasi per role",
            ],
            insight:
                "Menu yang dibuka karyawan jadi relevan dengan tugasnya, bukan semua fitur sekaligus.",
            actionLabel: "Simulasikan: Buat Employee",
            successMessage:
                "Employee berhasil dibuat dan permission role sudah terpasang. Akses mobile kini sesuai posisi karyawan.",
            simulatorState: {
                badgeText: "Akses Terbentuk",
                badgeType: "warning",
                cardTitle: "Employee: Rani",
                cardSubtitle: "Outlet: Tebet Raya | Position: Admin Outlet",
                details: [
                    { label: "Status Employee", value: "Active" },
                    { label: "Permission", value: "Payroll & Operasional" },
                    { label: "Login Device", value: "FCM + Sanctum Ready" },
                ],
            },
        },
        {
            id: "salary",
            title: "Set Salary",
            icon: <Briefcase className="h-5 w-5" />,
            description:
                "Tim HR menyiapkan salary master lalu mengikatnya ke employee salary agar base salary dan allowance terbaca konsisten saat payroll dipreview.",
            actor: "Tim HR",
            actorIcon: <DollarSign className="h-4 w-4" />,
            features: [
                "Salary master per komponen",
                "Employee salary dengan effective date",
                "Base salary dan allowance terbaca otomatis",
            ],
            insight:
                "Nominal payroll tidak perlu dihitung ulang dari awal setiap bulan.",
            actionLabel: "Simulasikan: Pasang Salary",
            successMessage:
                "Salary component dan employee salary berhasil dihubungkan. Perhitungan payroll sekarang memakai data master.",
            simulatorState: {
                badgeText: "Salary Aktif",
                badgeType: "warning",
                cardTitle: "Komponen Gaji Rani",
                cardSubtitle: "Base Salary + Allowance Bulanan",
                details: [
                    { label: "Gaji Pokok", value: "Rp 2.800.000" },
                    { label: "Allowance", value: "Rp 450.000" },
                    { label: "Effective", value: "1 Juni 2026" },
                ],
            },
        },
        {
            id: "commission",
            title: "Komisi Produksi",
            icon: <ArrowRightLeft className="h-5 w-5" />,
            description:
                "Saat proses order item selesai, system membuat work log sehingga komisi per item, per kg, persentase, atau flat dapat masuk ke payroll otomatis.",
            actor: "Tim Produksi",
            actorIcon: <CheckCircle2 className="h-4 w-4" />,
            features: [
                "Work log terbentuk dari proses selesai",
                "Commission rule bisa per item, kg, persen, atau flat",
                "Unpaid work log masuk ke preview payroll",
            ],
            insight:
                "Komisi produksi terkumpul dari aktivitas kerja nyata, bukan catatan terpisah.",
            actionLabel: "Simulasikan: Catat Work Log",
            successMessage:
                "Work log komisi berhasil terbentuk dan siap masuk ke perhitungan payroll bulan ini.",
            simulatorState: {
                badgeText: "Work Log Masuk",
                badgeType: "warning",
                cardTitle: "Komisi Proses #WL-224",
                cardSubtitle: "Order Item: Setrika 12 Kg",
                details: [
                    { label: "Commission Rule", value: "Rp 350 / Kg" },
                    { label: "Jumlah", value: "12 Kg" },
                    { label: "Total Komisi", value: "Rp 4.200", highlight: true },
                ],
            },
        },
        {
            id: "deduction",
            title: "Potongan Payroll",
            icon: <Receipt className="h-5 w-5" />,
            description:
                "Fine log dan loan repayment ikut dibawa ke preview payroll sehingga potongan gaji tidak tercecer dari perhitungan bulanan.",
            actor: "Admin Payroll",
            actorIcon: <Banknote className="h-4 w-4" />,
            features: [
                "Fine log dapat menjadi deduction",
                "Loan log ikut dipotong dari payroll",
                "Net salary terbaca sebelum paid",
            ],
            insight:
                "Potongan gaji terhitung jelas sebelum payroll disimpan, jadi review lebih aman.",
            actionLabel: "Simulasikan: Cek Potongan",
            successMessage:
                "Potongan fine dan loan berhasil terbaca di preview payroll. Total bersih sekarang siap dibayarkan.",
            simulatorState: {
                badgeText: "Deduction Siap",
                badgeType: "warning",
                cardTitle: "Preview Deduction Rani",
                cardSubtitle: "Fine + Kasbon Bulan Berjalan",
                details: [
                    { label: "Fine Log", value: "Rp 75.000" },
                    { label: "Loan Deduction", value: "Rp 150.000" },
                    { label: "Net Salary", value: "Rp 3.025.000", highlight: true },
                ],
            },
        },
        {
            id: "payroll",
            title: "Payroll Paid",
            icon: <Wallet className="h-5 w-5" />,
            description:
                "Preview payroll bisa disimpan untuk satu employee atau seluruh employee aktif, lalu payroll paid ikut memanggil accounting journal.",
            actor: "Owner / Finance",
            actorIcon: <FileText className="h-4 w-4" />,
            features: [
                "Preview single employee atau bulk",
                "Payroll items tersimpan per earning/deduction",
                "Accounting journal ikut terbentuk saat paid",
            ],
            insight:
                "Gaji sudah rapi di payroll sekaligus aman di pencatatan akuntansi.",
            actionLabel: "Simulasikan: Simpan Payroll",
            successMessage:
                "Payroll berhasil disimpan sebagai paid dan jurnal accounting ikut tercatat otomatis.",
            simulatorState: {
                badgeText: "Payroll Paid",
                badgeType: "warning",
                cardTitle: "Payroll Bulan Juni 2026",
                cardSubtitle: "Type: Bulk | Employee: 8 Orang",
                details: [
                    { label: "Gross Salary", value: "Rp 24.300.000" },
                    { label: "Total Deduction", value: "Rp 1.275.000" },
                    { label: "Total Paid", value: "Rp 23.025.000", highlight: true },
                ],
            },
        },
    ],
};

const HrPayroll: React.FC = () => {
    const pageBackground = {
        background: `
            radial-gradient(ellipse 80% 45% at 0% 0%, color-mix(in srgb, var(--color-warning-500) 16%, transparent) 0%, transparent 60%),
            radial-gradient(ellipse 70% 40% at 100% 12%, color-mix(in srgb, var(--color-warning-600) 14%, transparent) 0%, transparent 58%),
            linear-gradient(180deg, var(--color-background) 0%, var(--color-gray-50) 42%, var(--color-background) 100%)
        `,
    };

    return (
        <>
            <Head title="HR & Payroll - WashWallet | Employee, Komisi, dan Payroll" />

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
                            <div className="glow-orb glow-orb-orange-primary glow-top-left" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-right" />
                            <FeatureHero
                                data={hrPayrollData.hero}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-right" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-left" />
                            <FeaturePainPoints
                                data={hrPayrollData.painPoints}
                                hideGlow={true}
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-left" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-right" />
                            <FeatureHighlights
                                data={hrPayrollData.highlights}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-right" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-left" />
                            <InteractiveSimulator data={hrPayrollSimulatorData} />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-left" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-right" />
                            <DetailedSections
                                data={hrPayrollData.detailedSections}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-right" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-left" />
                            <UseCases
                                data={{
                                    badge: "Studi Kasus",
                                    headline: "Skenario HR & Payroll Riil",
                                    subheadline:
                                        "Bagaimana WashWallet menghubungkan employee, komisi produksi, dan payroll paid dalam proses yang rapi.",
                                    accentColor: "var(--color-warning-500)",
                                    accentBg: "var(--color-warning-50)",
                                    accentBorder: "var(--color-warning-200)",
                                    cases: hrPayrollData.useCases,
                                }}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-left" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-right" />
                            <FeatureBenefits
                                data={hrPayrollData.benefits}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-right" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-left" />
                            <FeatureComparison
                                data={hrPayrollData.comparison}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-left" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-right" />
                            <FeatureFAQ
                                data={hrPayrollData.faqs}
                                hideGlow={true}
                                headerLayout="split"
                            />
                        </div>

                        <div className="glow-section-wrapper">
                            <div className="glow-orb glow-orb-orange-primary glow-top-right" />
                            <div className="glow-orb glow-orb-orange-secondary glow-bottom-left" />
                            <FeatureCTAFinal
                                data={hrPayrollData.ctaFinal}
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

export default HrPayroll;
