import React, { useState } from "react";
import SectionBackground from "@/Components/SectionBackground";
import {
    HelpCircle,
    ChevronDown,
    Info,
    Wallet,
    Coins,
    ShieldCheck,
    Users,
    Building2,
    RefreshCcw,
    LifeBuoy,
    Sparkles,
} from "lucide-react";

type FAQItem = {
    question: string;
    answer: string;
    icon: keyof typeof iconMap;
};

const iconMap = {
    Info,
    Wallet,
    Coins,
    ShieldCheck,
    Users,
    Building2,
    RefreshCcw,
    LifeBuoy,
};

const faqData: FAQItem[] = [
    {
        question: "Apa itu WashWallet?",
        answer: "WashWallet adalah platform all-in-one untuk owner laundry yang menggabungkan POS, operasional, keuangan, HR, membership, dan afiliasi dalam satu dashboard.",
        icon: "Info",
    },
    {
        question: "Apakah ada biaya bulanan?",
        answer: "Tidak ada biaya bulanan. Model kami adalah one-time aktivasi outlet dan koin pay-as-you-go untuk fitur yang benar-benar dipakai.",
        icon: "Wallet",
    },
    {
        question: "Bagaimana sistem koin bekerja?",
        answer: "Setiap layanan memiliki harga koin per penggunaan. Anda bisa top up kapan saja sesuai volume bisnis, dan pemakaian tercatat transparan.",
        icon: "Coins",
    },
    {
        question: "Berapa lama proses setup?",
        answer: "Rata-rata 5-10 menit untuk mulai: buat akun, aktifkan outlet, lalu input layanan dasar. Setelah itu tim Anda bisa langsung operasional.",
        icon: "Users",
    },
    {
        question: "Bisakah saya kelola lebih dari 1 outlet?",
        answer: "Bisa. Anda dapat memantau banyak outlet dari satu dashboard dengan data performa terpisah per outlet dan rekap bisnis secara keseluruhan.",
        icon: "Building2",
    },
    {
        question: "Apa yang terjadi kalau koin saya habis?",
        answer: "Fitur berbasis koin akan berhenti sementara sampai Anda top up. Data bisnis tetap aman dan Anda bisa lanjut operasional setelah saldo terisi.",
        icon: "Coins",
    },
    {
        question: "Apakah data laundry saya aman?",
        answer: "Ya. Data dilindungi dengan enkripsi, kontrol akses, dan praktik keamanan modern agar informasi pelanggan dan transaksi tetap terjaga.",
        icon: "ShieldCheck",
    },
    {
        question: "Bagaimana cara migrasi dari sistem lama?",
        answer: "Tim kami membantu proses transisi bertahap, mulai dari mapping layanan dan pelanggan hingga onboarding tim, supaya pindah sistem tetap lancar.",
        icon: "RefreshCcw",
    },
    {
        question: "Apakah ada dukungan saat onboarding?",
        answer: "Ada. Tim support kami siap mendampingi setup awal dan penggunaan harian sampai alur operasional outlet Anda stabil.",
        icon: "LifeBuoy",
    },
];

const FAQ: React.FC = () => {
    const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

    const toggleItem = (index: number) => {
        setOpenItems((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <section className="relative py-20 px-4 overflow-hidden">
            <SectionBackground />

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="text-center mb-12 space-y-5">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm bg-primary-50 border-primary-200 text-primary-700">
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                            Pusat Bantuan
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-text-primary">
                        Pertanyaan yang{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-br from-primary-600 to-accent-500 bg-clip-text text-transparent">
                                Sering
                            </span>
                        </span>{" "}
                        Diajukan
                    </h2>

                    <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto text-text-secondary">
                        Temukan jawaban cepat seputar WashWallet, mulai dari
                        sistem koin, keamanan, hingga proses setup.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqData.map((item, index) => {
                        const Icon = iconMap[item.icon];
                        const isOpen = !!openItems[index];
                        return (
                            <div
                                key={index}
                                className={`border rounded-xl backdrop-blur-sm transition-all duration-300 hover:shadow-xl bg-surface ${
                                    isOpen
                                        ? "border-primary-300"
                                        : "border-border"
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleItem(index)}
                                    className="w-full flex items-center gap-4 p-5 text-left"
                                >
                                    <div
                                        className={`flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center transition-colors duration-300 border ${
                                            isOpen
                                                ? "bg-primary-50 text-primary-600 border-primary-200"
                                                : "bg-background text-text-secondary border-border"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold transition-colors duration-300 text-text-primary">
                                            {item.question}
                                        </h3>
                                    </div>

                                    <ChevronDown
                                        className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
                                            isOpen
                                                ? "rotate-180 text-primary-600"
                                                : "rotate-0 text-text-tertiary"
                                        }`}
                                    />
                                </button>

                                <div
                                    className={`overflow-hidden transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                                    style={{
                                        maxHeight: isOpen ? "320px" : "0px",
                                    }}
                                >
                                    <div className="px-5 pb-5">
                                        <p className="text-sm leading-relaxed text-text-secondary">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-primary-50 to-surface">
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 md:p-8">
                        <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-1">
                            <h3 className="text-xl font-bold text-text-primary">
                                Masih punya pertanyaan lain?
                            </h3>
                            <p className="text-sm md:text-base text-text-secondary">
                                Tim kami siap membantu Anda kapan saja.
                            </p>
                        </div>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-primary-500 to-primary-600"
                        >
                            Hubungi Kami
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;
