import {
    AlertCircle,
    ArrowRightLeft,
    Banknote,
    Briefcase,
    Calculator,
    CheckCircle2,
    Clock,
    DollarSign,
    FileText,
    Receipt,
    ShieldCheck,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";

export const hrPayrollData = {
    hero: {
        badge: "HR & Payroll",
        headline: "Payroll Laundry yang Terhubung dari ",
        headlineHighlight: "Karyawan sampai Jurnal",
        subheadline:
            "Kelola employee, position & permission, salary component, process commission, fine, loan, payroll preview single/bulk, dan accounting journal dalam satu alur yang rapi.",
        highlights: [
            "Employee & position permission",
            "Salary component & employee salary",
            "Process commission & work logs",
            "Fine dan loan deduction",
            "Payroll preview single/bulk",
        ],
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        accentStrongColor: "var(--color-warning-600)",
        orbColor: "var(--color-warning-400)",
    },

    painPoints: {
        badge: "Masalah yang Diselesaikan",
        headline: "Gaji, Komisi, dan Potongan Masih Direkap Manual",
        subheadline:
            "Tantangan HR payroll yang sering muncul saat data karyawan, komisi produksi, dan potongan gaji belum tersambung.",
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        items: [
            {
                icon: <Users className="h-6 w-6" />,
                title: "Akses Karyawan Tidak Terkontrol",
                description:
                    "Posisi dan permission masih dicatat terpisah, sehingga akses mobile app mudah salah buka dan sulit diaudit per outlet.",
            },
            {
                icon: <Calculator className="h-6 w-6" />,
                title: "Komisi Produksi Dihitung Manual",
                description:
                    "Komisi proses pengerjaan harus dijumlah satu-satu padahal work log bisa jadi sumber data utama payroll.",
            },
            {
                icon: <AlertCircle className="h-6 w-6" />,
                title: "Kasbon & Denda Sering Tidak Sinkron",
                description:
                    "Loan dan fine log terpisah dari payroll bulanan, jadi potongan gaji sering perlu dicek ulang sebelum dibayarkan.",
            },
            {
                icon: <Wallet className="h-6 w-6" />,
                title: "Payroll Bulanan Lambat",
                description:
                    "Owner harus rekap total gaji, komisi, dan potongan secara manual sebelum menyimpan payroll paid dan jurnal akuntansi.",
            },
        ],
    },

    highlights: {
        badge: "Fitur Unggulan",
        headline: "Payroll yang Siap Dipakai Operasional",
        subheadline:
            "Semua yang dibutuhkan untuk mengelola gaji karyawan laundry secara terstruktur dan bisa ditelusuri.",
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        items: [
            {
                icon: <Users className="h-6 w-6" />,
                title: "Employee, Position, dan Permission",
                description:
                    "Karyawan dikelola per outlet dengan posisi aktif, default permission, dan akses mobile sesuai otorisasi.",
                color: "var(--color-warning-500)",
            },
            {
                icon: <Briefcase className="h-6 w-6" />,
                title: "Salary Component & Employee Salary",
                description:
                    "Master salary component dan relasi employee salary jadi dasar perhitungan payroll yang konsisten.",
                color: "var(--color-warning-600)",
            },
            {
                icon: <Calculator className="h-6 w-6" />,
                title: "Process Commission & Work Logs",
                description:
                    "Komisi per item, per kg, persentase, atau flat terkumpul dari work log yang terbentuk saat proses selesai.",
                color: "var(--color-warning-500)",
            },
            {
                icon: <Receipt className="h-6 w-6" />,
                title: "Fine & Loan Deduction",
                description:
                    "Potongan denda dan kasbon tersambung ke payroll sehingga total bersih tidak dihitung manual lagi.",
                color: "var(--color-warning-600)",
            },
            {
                icon: <DollarSign className="h-6 w-6" />,
                title: "Payroll Preview Single/Bulk",
                description:
                    "Preview payroll bisa untuk satu karyawan atau seluruh karyawan aktif outlet sebelum data disimpan.",
                color: "var(--color-warning-500)",
            },
            {
                icon: <FileText className="h-6 w-6" />,
                title: "Payroll Accounting Journal",
                description:
                    "Payroll paid langsung memanggil accounting journal agar gaji tercatat rapi di laporan finansial.",
                color: "var(--color-warning-600)",
            },
        ],
    },

    detailedSections: {
        badge: "Detail Arsitektur Fitur",
        headline: "Dari Data Karyawan Sampai Payroll Paid",
        subheadline:
            "Setiap komponen payroll tersambung ke struktur data yang jelas, jadi owner bisa menelusuri alasan di balik angka gaji.",
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        sections: [
            {
                icon: <Users className="h-8 w-8" />,
                title: "Employee, Position, dan Permission",
                description:
                    "Setiap employee tersimpan per outlet dengan posisi yang menentukan akses mobile app, status aktif, dan struktur kerja yang aman.",
                features: [
                    "Employee per outlet dengan data kontak dan status aktif",
                    "Position default dan permission list per outlet",
                    "Route mobile dibatasi middleware position.permission",
                    "Sanctum token dan FCM token tersedia untuk akses aplikasi",
                ],
                color: "var(--color-warning-500)",
                bgColor: "var(--color-warning-50)",
            },
            {
                icon: <Briefcase className="h-8 w-8" />,
                title: "Salary Component dan Employee Salary",
                description:
                    "Komponen gaji membentuk base salary, allowance, dan aturan payroll yang bisa dikaitkan ke tiap employee.",
                features: [
                    "Salary master dengan name, type, amount, dan active flag",
                    "Employee salary dengan tanggal effective dan nilai komponen",
                    "Preview payroll membaca base salary dan allowance bulanan",
                    "Struktur ini memudahkan update gaji tanpa hitung ulang manual",
                ],
                color: "var(--color-warning-600)",
                bgColor: "var(--color-warning-50)",
            },
            {
                icon: <Calculator className="h-8 w-8" />,
                title: "Work Logs, Fine, Loan, dan Payroll Preview",
                description:
                    "Komisi proses, fine log, dan loan repayment terkumpul di preview sebelum payroll disimpan sebagai paid.",
                features: [
                    "Work log menyimpan commission rule, total amount, dan period",
                    "Fine log dan loan log dapat menjadi deduction payroll",
                    "Preview payroll mendukung single employee atau seluruh employee aktif",
                    "Payroll items dibagi menjadi salary, allowance, commission, fine, loan, atau other",
                ],
                color: "var(--color-warning-500)",
                bgColor: "var(--color-warning-50)",
            },
        ],
    },

    useCases: [
        {
            persona: "Owner Laundry",
            scenario:
                "Menyiapkan akses karyawan dan struktur gaji per outlet sebelum payroll berjalan",
            outcome:
                "Position, permission, dan salary component terkunci rapi sehingga akses operasional dan payroll lebih aman.",
            accentColor: "var(--color-warning-500)",
        },
        {
            persona: "Tim Produksi",
            scenario:
                "Menyelesaikan proses order item yang memicu work log komisi",
            outcome:
                "Komisi produksi terkumpul otomatis dari work log sehingga insentif karyawan tidak perlu dihitung manual.",
            accentColor: "var(--color-warning-600)",
        },
        {
            persona: "Admin Payroll",
            scenario:
                "Melakukan preview payroll bulk, memeriksa fine dan loan deduction, lalu menyimpan payroll paid",
            outcome:
                "Payroll tersimpan bersama item detail dan journal accounting tanpa rekap spreadsheet terpisah.",
            accentColor: "var(--color-warning-500)",
        },
    ],

    benefits: {
        badge: "Outcome yang Terukur",
        headline: "Dampak Payroll yang Lebih Tertib",
        subheadline:
            "Payroll menjadi cepat, transparan, dan tetap tersambung ke akuntansi.",
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        items: [
            {
                icon: <Clock className="h-6 w-6" />,
                title: "Payroll Lebih Cepat",
                description: "Preview dan pembayaran gaji tidak perlu rekap manual dari nol.",
                benefits: [
                    "Waktu persiapan payroll turun drastis",
                    "Admin fokus ke validasi, bukan input ulang",
                ],
            },
            {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Komisi Lebih Adil",
                description:
                    "Work log memastikan komisi proses diambil dari aktivitas nyata yang selesai.",
                benefits: [
                    "Tidak ada komisi yang terlewat",
                    "Skema insentif lebih konsisten antar outlet",
                ],
            },
            {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Akses Lebih Aman",
                description:
                    "Position dan permission membatasi menu yang bisa dibuka karyawan.",
                benefits: [
                    "Menu mobile sesuai peran karyawan",
                    "Kontrol akses per outlet lebih jelas",
                ],
            },
            {
                icon: <Banknote className="h-6 w-6" />,
                title: "Potongan Lebih Tertib",
                description:
                    "Fine dan loan deduction terikat ke payroll, bukan dicatat di tempat lain.",
                benefits: [
                    "Kasbon tidak hilang dari perhitungan gaji",
                    "Denda tercatat sebelum payroll dibayar",
                ],
            },
            {
                icon: <FileText className="h-6 w-6" />,
                title: "Slip dan Item Payroll Rapi",
                description:
                    "Setiap payroll punya detail item earning dan deduction yang jelas.",
                benefits: [
                    "Bisa ditelusuri per komponen",
                    "Memudahkan review internal dan audit",
                ],
            },
            {
                icon: <Wallet className="h-6 w-6" />,
                title: "Accounting Sinkron",
                description:
                    "Payroll paid langsung tercatat ke jurnal akuntansi tanpa langkah tambahan.",
                benefits: [
                    "Laporan keuangan tetap konsisten",
                    "Gaji tidak berhenti di slip saja",
                ],
            },
        ],
    },

    comparison: {
        badge: "Perbandingan Metode",
        headline: "Payroll Manual vs WashWallet",
        subheadline:
            "Bandingkan cara lama yang rekapnya terpisah dengan alur payroll terhubung di WashWallet.",
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        rows: [
            {
                aspect: "Data Karyawan",
                manual: "Disimpan di spreadsheet terpisah dan aksesnya sulit dikontrol.",
                washwallet:
                    "Employee, position, dan permission tersimpan per outlet dengan akses yang jelas.",
            },
            {
                aspect: "Komisi Produksi",
                manual: "Dihitung manual dari catatan proses yang tersebar.",
                washwallet:
                    "Work log otomatis mengumpulkan komisi dari proses yang selesai.",
            },
            {
                aspect: "Kasbon & Denda",
                manual: "Potongan gaji sering perlu dicek ulang dari catatan lain.",
                washwallet:
                    "Fine dan loan log tersambung langsung ke payroll preview.",
            },
            {
                aspect: "Preview Payroll",
                manual: "Harus rekap satu per satu sebelum gaji dibayar.",
                washwallet:
                    "Preview bisa single employee atau bulk untuk seluruh employee aktif.",
            },
            {
                aspect: "Payroll Paid",
                manual: "Slip gaji dibuat terpisah dari pencatatan accounting.",
                washwallet:
                    "Payroll saved dengan payroll items dan jurnal accounting sekaligus.",
            },
            {
                aspect: "Audit & Penelusuran",
                manual: "Sulit menelusuri asal angka ketika ada selisih payroll.",
                washwallet:
                    "Setiap komponen payroll bisa ditelusuri dari data employee, work log, fine, dan loan.",
            },
        ],
    },

    faqs: {
        badge: "Pertanyaan Umum",
        headline: "FAQ HR & Payroll",
        subheadline:
            "Jawaban singkat mengenai cakupan yang benar-benar tersedia di codebase.",
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        items: [
            {
                question: "Apakah HR & Payroll sudah pakai absensi aktif end-to-end?",
                answer:
                    "Belum. Model attendance memang ada, tetapi alur aktif end-to-end seperti fingerprint, GPS, atau shift management tidak dijual sebagai fitur inti pada page ini.",
            },
            {
                question: "Apakah payroll bisa dipreview sebelum disimpan?",
                answer:
                    "Bisa. Preview tersedia untuk satu employee maupun seluruh employee aktif per outlet sebelum payroll disimpan sebagai paid.",
            },
            {
                question: "Apakah komisi produksi dihitung otomatis?",
                answer:
                    "Ya. Komisi dibentuk dari work log ketika proses order item selesai dan dapat masuk ke payroll item commission.",
            },
            {
                question: "Apakah fine dan kasbon memotong gaji otomatis?",
                answer:
                    "Ya. Fine log dan loan log dapat menjadi deduction payroll selama data tersebut masih terkait dengan periode payroll yang sedang diproses.",
            },
            {
                question: "Apakah payroll otomatis transfer ke bank?",
                answer:
                    "Tidak. WashWallet menyediakan bank account dan payment method source, tetapi transfer otomatis ke bank tidak dijanjikan. Payroll disimpan dan jurnalnya tercatat, sementara proses pembayaran tetap mengikuti alur sistem yang ada.",
            },
        ],
    },

    ctaFinal: {
        badge: "Penawaran Spesial",
        headline: "Rapikan HR & Payroll Tanpa Spreadsheet Berantakan",
        subheadline:
            "Kelola karyawan, komisi, potongan, dan payroll dalam satu alur yang siap dipakai operasional.",
        accentColor: "var(--color-warning-500)",
        accentBg: "var(--color-warning-50)",
        accentBorder: "var(--color-warning-200)",
        primaryCtaText: "Mulai Free Trial",
        primaryCtaHref: "/register",
        secondaryCtaText: "Chat via WhatsApp",
        whatsappNumber: "6281234567890",
        whatsappMessage:
            "Halo, saya tertarik mencoba fitur HR & Payroll di WashWallet.",
    },
};
