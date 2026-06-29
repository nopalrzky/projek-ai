import React, { useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Card, CardContent } from "@/Components/Card/Card";
import Button from "@/Components/Button/Button";
import {
    HelpCircle,
    ChevronDown,
    Search,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    MessageCircle,
    Shield,
    Zap,
    Users,
    DollarSign,
    Settings,
    Globe,
    Lock,
    FileText,
    Clock,
    TrendingUp,
} from "lucide-react";

const Faq = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [searchQuery, setSearchQuery] = useState("");

    const faqs = [
        {
            question: "Apa itu Washwallet dan untuk siapa?",
            answer: "Washwallet adalah sistem manajemen laundry lengkap yang dirancang khusus untuk owner bisnis laundry di Indonesia. Mulai dari kasir, manajemen operasional, keuangan, HR & Payroll, hingga sistem coin dan affiliate program. Cocok untuk laundry kecil maupun jaringan multi-cabang.",
            category: "Umum",
            icon: <HelpCircle className="w-5 h-5" />,
        },
        {
            question: "Apakah ada trial gratis? Berapa lama?",
            answer: "Ya! Kami menyediakan trial gratis selama 14 hari dengan akses penuh ke semua fitur. Tidak perlu kartu kredit untuk mendaftar trial. Kamu bisa langsung explore semua fitur tanpa batasan.",
            category: "Umum",
            icon: <Sparkles className="w-5 h-5" />,
        },
        {
            question: "Bagaimana cara daftar dan mulai menggunakan Washwallet?",
            answer: "Mudah banget! Klik tombol 'Daftar Sekarang', isi data bisnis laundry kamu, dan langsung bisa akses dashboard. Tidak perlu setup ribet, sistem sudah siap pakai. Tim support kami juga siap bantu proses onboarding kamu.",
            category: "Umum",
            icon: <Users className="w-5 h-5" />,
        },
        {
            question: "Apakah data bisnis saya aman di Washwallet?",
            answer: "Sangat aman! Semua data di-encrypt dengan standar industri, disimpan di server terpercaya, dan ada backup otomatis setiap hari. Kami juga tidak akan pernah membagikan data kamu ke pihak ketiga tanpa izin.",
            category: "Keamanan",
            icon: <Shield className="w-5 h-5" />,
        },
        {
            question:
                "Apakah bisa digunakan untuk banyak cabang (multi-outlet)?",
            answer: "Bisa banget! Washwallet support multi-cabang dengan konsolidasi data otomatis. Kamu bisa lihat laporan per cabang atau gabungan semua cabang. Role & akses juga bisa diatur berbeda untuk setiap outlet.",
            category: "Fitur",
            icon: <Globe className="w-5 h-5" />,
        },
        {
            question:
                "Bagaimana cara migrasi data dari sistem lama ke Washwallet?",
            answer: "Kami menyediakan fitur import data dari Excel atau sistem lain. Tim support kami siap membantu proses migrasi agar data customer, transaksi, dan inventory kamu berpindah dengan aman dan akurat.",
            category: "Migrasi",
            icon: <FileText className="w-5 h-5" />,
        },
        {
            question: "Apa itu Coin System dan bagaimana cara kerjanya?",
            answer: "Coin System adalah program loyalitas untuk customer laundry kamu. Setiap transaksi, customer dapat poin/coin yang bisa ditukar dengan diskon atau hadiah. Sistemnya otomatis, kamu tinggal atur berapa coin per transaksi dan reward apa yang tersedia.",
            category: "Coin System",
            icon: <DollarSign className="w-5 h-5" />,
        },
        {
            question: "Apakah customer bisa cek coin mereka sendiri?",
            answer: "Bisa! Customer bisa cek saldo coin mereka melalui aplikasi mobile Washwallet atau saat kasir menunjukkan di layar. Mereka juga bisa lihat riwayat coin dan reward yang tersedia.",
            category: "Coin System",
            icon: <Sparkles className="w-5 h-5" />,
        },
        {
            question: "Bagaimana cara kerja Affiliate Program?",
            answer: "Affiliate Program memungkinkan kamu membuat jaringan reseller/agen yang promosikan laundry kamu. Setiap agen dapat komisi dari transaksi customer yang mereka referensikan. Sistemnya tracking otomatis dengan kode unik per affiliate.",
            category: "Affiliate",
            icon: <TrendingUp className="w-5 h-5" />,
        },
        {
            question: "Apakah ada sistem penilaian kinerja karyawan?",
            answer: "Ada! Sistem HR & Payroll Washwallet dilengkapi fitur penilaian kinerja. Kamu bisa rating karyawan berdasarkan kehadiran, kualitas kerja, dll. Karyawan yang berprestasi otomatis dapat bonus sesuai pengaturan kamu.",
            category: "HR & Payroll",
            icon: <Users className="w-5 h-5" />,
        },
        {
            question: "Bagaimana cara absensi karyawan?",
            answer: "Karyawan bisa absen via aplikasi mobile Washwallet dengan scan wajah (face recognition). Atau bisa juga pakai device khusus di outlet. Absensi langsung terhubung ke payroll, jadi gaji otomatis dihitung dari hari kerja.",
            category: "HR & Payroll",
            icon: <Clock className="w-5 h-5" />,
        },
        {
            question: "Apakah ada fitur perhitungan pajak dan BPJS?",
            answer: "Saat ini fitur perhitungan pajak dan BPJS belum tersedia. Namun, sistem payroll sudah support semua komponen gaji (kasbon, denda, komisi, dll) yang bisa di-export untuk perhitungan pajak manual atau konsultasi dengan akuntan.",
            category: "HR & Payroll",
            icon: <FileText className="w-5 h-5" />,
        },
        {
            question: "Apa saja jenis laporan keuangan yang tersedia?",
            answer: "Ada 8 jenis laporan lengkap: Laporan Laba Rugi, Laporan Kas, Neraca (Balance Sheet), Laporan Kasbon, Laporan Denda, Laporan Penjualan, Laporan Piutang, dan Laporan Customer. Semua laporan real-time dan bisa di-export ke Excel/PDF.",
            category: "Keuangan",
            icon: <FileText className="w-5 h-5" />,
        },
        {
            question:
                "Apakah laporan keuangan bisa dikonsolidasi untuk semua cabang?",
            answer: "Bisa! Sistem otomatis konsolidasi laporan keuangan dari semua cabang dalam satu klik. Kamu bisa lihat laporan gabungan atau per cabang sesuai kebutuhan.",
            category: "Keuangan",
            icon: <Globe className="w-5 h-5" />,
        },
        {
            question: "Bagaimana cara atur role dan akses untuk karyawan?",
            answer: "Kamu bisa atur role & akses fleksibel per outlet. Outlet kecil bisa satu orang multi-role (kasir + input order). Outlet besar bisa role terpisah dengan akses detail (lihat/edit/hapus) sesuai posisi masing-masing.",
            category: "Pengaturan",
            icon: <Settings className="w-5 h-5" />,
        },
        {
            question: "Apakah bisa kelola inventory/stok barang?",
            answer: "Bisa! Fitur Operational Management include tracking stok deterjen, pewangi, packaging, dll. Ada notifikasi otomatis kalau stok menipis, dan laporan riwayat penggunaan untuk analisis efisiensi.",
            category: "Operasional",
            icon: <Zap className="w-5 h-5" />,
        },
        {
            question: "Bagaimana cara tracking order laundry customer?",
            answer: "Setiap order punya status real-time (diterima, dicuci, dijemur, setrika, siap ambil, selesai). Customer dan kamu bisa tracking progress order kapan saja. Ada notifikasi otomatis saat order selesai.",
            category: "Operasional",
            icon: <CheckCircle2 className="w-5 h-5" />,
        },
        {
            question: "Apakah support tim tersedia 24/7?",
            answer: "Ya! Tim support kami siap bantu kamu kapan saja via chat, email, atau phone. Kami bukan cuma vendor, tapi partner bisnis yang berkomitmen untuk kesuksesan laundry kamu.",
            category: "Support",
            icon: <MessageCircle className="w-5 h-5" />,
        },
        {
            question: "Berapa harga langganan Washwallet?",
            answer: "Harga langganan disesuaikan dengan kebutuhan bisnis kamu (jumlah outlet, fitur yang digunakan, dll). Hubungi tim sales kami untuk penawaran terbaik. Yang pasti, investasi kamu akan sebanding dengan efisiensi dan pertumbuhan bisnis yang didapat!",
            category: "Harga",
            icon: <DollarSign className="w-5 h-5" />,
        },
        {
            question:
                "Apakah bisa request fitur khusus sesuai kebutuhan bisnis saya?",
            answer: "Tentu saja! Kami sangat terbuka untuk mendengar kebutuhan spesifik bisnis laundry kamu. Tim kami akan evaluasi dan usahakan implementasi fitur yang paling bermanfaat untuk semua pengguna Washwallet.",
            category: "Fitur",
            icon: <Sparkles className="w-5 h-5" />,
        },
    ];

    const filteredFaqs = faqs.filter(
        (faq) =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <GuestLayout>
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20 px-4 sm:px-6">
                {/* Dynamic Gradient Background */}
                <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                        background: `
                            radial-gradient(circle at 20% 30%, var(--color-primary-100) 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, var(--color-info-100) 0%, transparent 50%),
                            radial-gradient(circle at 50% 90%, var(--color-success-50) 0%, transparent 40%),
                            linear-gradient(135deg, var(--color-background) 0%, var(--color-gray-50) 100%)
                        `,
                    }}
                />

                {/* Floating Question Marks */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 20 }, (_, i) => (
                        <div
                            key={i}
                            className="absolute animate-twinkle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${4 + Math.random() * 4}s`,
                            }}
                        >
                            <HelpCircle
                                className="w-6 h-6 opacity-10"
                                style={{
                                    color:
                                        i % 2 === 0
                                            ? "var(--color-primary-400)"
                                            : "var(--color-info-400)",
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="relative z-10 container-fluid py-16">
                    <div className="text-center max-w-4xl mx-auto animate-fadeInUp">
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-105 hover:shadow-xl mb-8"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                borderColor: "var(--color-primary-200)",
                                boxShadow: "0 0 20px var(--color-primary-200)",
                            }}
                        >
                            <MessageCircle
                                className="w-5 h-5"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                            <span
                                className="text-sm font-bold"
                                style={{ color: "var(--color-primary-700)" }}
                            >
                                Frequently Asked Questions
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-balance"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Ada Pertanyaan?{" "}
                            <span className="relative inline-block">
                                <span
                                    className="relative z-10"
                                    style={{
                                        backgroundImage: `linear-gradient(135deg, var(--color-primary-500), var(--color-info-500))`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    Kami Jawab!
                                </span>
                                <svg
                                    className="absolute -bottom-2 left-0 w-full h-4"
                                    viewBox="0 0 300 12"
                                    fill="none"
                                    preserveAspectRatio="none"
                                >
                                    <path
                                        d="M5 8 Q75 3, 150 6 T295 8"
                                        stroke="var(--color-primary-400)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        fill="none"
                                        className="animate-pulse-slow"
                                    />
                                </svg>
                            </span>
                        </h1>

                        <p
                            className="text-lg sm:text-xl lg:text-2xl leading-relaxed mb-10 text-balance"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Semua yang perlu kamu tahu tentang{" "}
                            <strong>Washwallet</strong> ada di sini. Kalau masih
                            belum ketemu jawabannya, hubungi tim support kami
                            yang siap bantu 24/7! 💬
                        </p>

                        {/* Search Box */}
                        <div className="max-w-2xl mx-auto mb-8">
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Cari pertanyaan... (misal: 'coin', 'absensi', 'laporan')"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 text-lg transition-all duration-300 focus:outline-none focus:ring-4"
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        borderColor: "var(--color-border)",
                                        color: "var(--color-text-primary)",
                                    }}
                                />
                            </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                            size="xl"
                            variant="primary"
                            gradient
                            shadow
                            href="/register"
                            className="group relative overflow-hidden"
                            rightIcon={
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            }
                        >
                            <span className="relative z-10">
                                Daftar Sekarang - Gratis!
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        </Button>

                        {/* Result Count */}
                        {searchQuery && (
                            <p
                                className="mt-6 text-sm"
                                style={{ color: "var(--color-text-tertiary)" }}
                            >
                                Ditemukan{" "}
                                <span
                                    className="font-bold"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    {filteredFaqs.length}
                                </span>{" "}
                                pertanyaan
                            </p>
                        )}
                    </div>
                </div>

                {/* Bottom Fade */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                    style={{
                        background: `linear-gradient(to bottom, transparent, var(--color-background))`,
                    }}
                />
            </section>

            {/* FAQ List Section */}
            <section className="py-20 sm:py-24 bg-background">
                <div className="container-fluid max-w-4xl">
                    <div className="space-y-4">
                        {filteredFaqs.length === 0 ? (
                            <Card variant="elevated" className="text-center">
                                <CardContent className="py-16">
                                    <HelpCircle
                                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                                        style={{
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    />
                                    <h3
                                        className="text-xl font-bold mb-2"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Tidak ada hasil ditemukan
                                    </h3>
                                    <p
                                        className="mb-6"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Coba kata kunci lain atau hubungi tim
                                        support kami
                                    </p>
                                    <Button
                                        variant="primary"
                                        href="/contact"
                                        rightIcon={
                                            <MessageCircle className="w-4 h-4" />
                                        }
                                    >
                                        Hubungi Support
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredFaqs.map((faq, index) => (
                                <Card
                                    key={index}
                                    variant="elevated"
                                    hoverable
                                    className="overflow-hidden transition-all duration-300 animate-fadeInUp"
                                    style={{
                                        animationDelay: `${index * 50}ms`,
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            setOpenFaq(
                                                openFaq === index
                                                    ? null
                                                    : index,
                                            )
                                        }
                                        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                                    >
                                        <CardContent className="flex items-start justify-between py-6 px-6 gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div
                                                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                                                    style={{
                                                        backgroundColor:
                                                            openFaq === index
                                                                ? "var(--color-primary-500)"
                                                                : "var(--color-primary-100)",
                                                        color:
                                                            openFaq === index
                                                                ? "white"
                                                                : "var(--color-primary-600)",
                                                    }}
                                                >
                                                    {faq.icon}
                                                </div>
                                                <h3 className="font-semibold text-lg flex-1 text-primary pr-4 leading-relaxed">
                                                    {faq.question}
                                                </h3>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 flex-shrink-0 transition-all duration-300 text-secondary ${
                                                    openFaq === index
                                                        ? "rotate-180 text-primary-600"
                                                        : ""
                                                }`}
                                            />
                                        </CardContent>
                                    </button>
                                    <div
                                        className={`overflow-hidden transition-all duration-300 ${
                                            openFaq === index
                                                ? "max-h-96 opacity-100"
                                                : "max-h-0 opacity-0"
                                        }`}
                                    >
                                        <div
                                            className="border-t px-6 py-6 ml-14"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                                backgroundColor:
                                                    "var(--color-primary-50)",
                                            }}
                                        >
                                            <p className="text-secondary leading-relaxed text-lg">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Still Have Questions Section */}
            <section className="py-20 sm:py-24 bg-surface">
                <div className="container-fluid max-w-4xl text-center">
                    <Card
                        variant="elevated"
                        isGlass
                        className="overflow-hidden"
                    >
                        <CardContent className="py-16 px-6">
                            <div
                                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                                style={{
                                    backgroundColor: "var(--color-info-100)",
                                }}
                            >
                                <MessageCircle
                                    className="w-10 h-10"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                            </div>

                            <h2
                                className="text-3xl sm:text-4xl font-bold mb-4 text-balance"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Masih Ada Pertanyaan?
                            </h2>

                            <p
                                className="text-lg mb-8 max-w-2xl mx-auto"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Tim support kami siap bantu kamu 24/7. Jangan
                                ragu untuk menghubungi kami kapan saja!
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    variant="primary"
                                    gradient
                                    shadow
                                    href="/contact"
                                    rightIcon={
                                        <MessageCircle className="w-5 h-5" />
                                    }
                                >
                                    Hubungi Support
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    href="/register"
                                    rightIcon={
                                        <ArrowRight className="w-5 h-5" />
                                    }
                                >
                                    Coba Gratis Sekarang
                                </Button>
                            </div>

                            {/* Support Channels */}
                            <div
                                className="mt-12 pt-8 border-t"
                                style={{ borderColor: "var(--color-border)" }}
                            >
                                <p
                                    className="text-sm font-semibold mb-4"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                >
                                    Atau hubungi kami via:
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-success-500)",
                                            }}
                                        />
                                        <span className="text-secondary">
                                            Live Chat
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-success-500)",
                                            }}
                                        />
                                        <span className="text-secondary">
                                            WhatsApp
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-success-500)",
                                            }}
                                        />
                                        <span className="text-secondary">
                                            Email
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            className="w-4 h-4"
                                            style={{
                                                color: "var(--color-success-500)",
                                            }}
                                        />
                                        <span className="text-secondary">
                                            Phone
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </GuestLayout>
    );
};

export default Faq;
