import { LayoutDashboard, TrendingUp, Zap, Heart } from "lucide-react";
import { BenefitCard, ComparisonRow } from "./types";

export const benefits: BenefitCard[] = [
    {
        icon: <LayoutDashboard className="w-8 h-8" />,
        title: "Satu Platform, Semua Terkontrol",
        description:
            "Kelola outlet, layanan, karyawan, stok, dan proses laundry dari satu dashboard. Tidak perlu lagi aplikasi yang bertebaran.",
        benefit: "Operasional Terintegrasi",
        color: "var(--color-primary-500)",
        bgColor: "var(--color-primary-100)",
    },
    {
        icon: <TrendingUp className="w-8 h-8" />,
        title: "Profit Jelas Tiap Hari",
        description:
            "Laporan keuangan real-time, analisis margin per layanan, dan prediksi profit yang akurat. Ambil keputusan bisnis yang lebih baik.",
        benefit: "Financial Clarity",
        color: "var(--color-success-500)",
        bgColor: "var(--color-success-100)",
    },
    {
        icon: <Zap className="w-8 h-8" />,
        title: "Karyawan Produktif, Owner Tenang",
        description:
            "Shift management otomatis, payroll yang akurat, dan tracking performance real-time. Kelola tim dengan mudah dari mana saja.",
        benefit: "HR Management Made Easy",
        color: "var(--color-warning-500)",
        bgColor: "var(--color-warning-100)",
    },
    {
        icon: <Heart className="w-8 h-8" />,
        title: "Customers Loyal, Bisnis Tumbuh",
        description:
            "Program membership otomatis, point rewards yang fleksibel, dan komunikasi customer yang personal. Tingkatkan repeat business.",
        benefit: "Customer Loyalty",
        color: "var(--color-accent-500)",
        bgColor: "var(--color-accent-100)",
    },
];

export const rows: ComparisonRow[] = [
    {
        aspect: "Setup awal",
        manual: "1-2 minggu",
        washWallet: "5 menit",
    },
    {
        aspect: "Input pesanan",
        manual: "Tulis tangan / spreadsheet",
        washWallet: "Digital real-time",
    },
    {
        aspect: "Tracking inventory",
        manual: "Excel / cek fisik",
        washWallet: "Auto sync tiap transaksi",
    },
    {
        aspect: "Laporan keuangan",
        manual: "Rekap akhir bulan manual",
        washWallet: "Real-time, 1 klik",
    },
    {
        aspect: "Kelola multi-outlet",
        manual: "Sistem berbeda tiap outlet",
        washWallet: "1 dashboard semua outlet",
    },
    {
        aspect: "Gaji karyawan",
        manual: "Hitung manual / spreadsheet",
        washWallet: "Payroll otomatis",
    },
    {
        aspect: "Program loyalty",
        manual: "Kartu cap / manual",
        washWallet: "Digital poin otomatis",
    },
    {
        aspect: "Biaya",
        manual: "Software berbeda-beda (Rp 200rb-2jt/bulan)",
        washWallet: "Koin pay-per-use",
    },
];
