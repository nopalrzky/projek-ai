import {
    BookOpen,
    FileSpreadsheet,
    Wallet,
    Receipt,
    CreditCard,
    BarChart3,
    FileText,
    ArrowRightLeft,
    TrendingUp,
    ShieldCheck,
    Banknote,
    Scale,
    PieChart,
    Briefcase
} from "lucide-react";

export const financialAccountingData = {
    hero: {
        badge: "Financial Accounting",
        headline: "Akuntansi Laundry yang Terhubung dari ",
        headlineHighlight: "Transaksi Sampai Laporan",
        subheadline:
            "Sistem akuntansi laundry komprehensif. Pantau chart of accounts, jurnal otomatis, buku besar, laba rugi, neraca, dan approval keuangan secara real-time langsung dari operasional.",
        highlights: [
            "Chart of accounts & Jurnal lengkap",
            "Auto-journal dari transaksi",
            "Manajemen expense & petty cash",
            "Dompet owner & withdrawal",
        ],
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        accentStrongColor: "var(--color-rose-600)",
        orbColor: "var(--color-rose-400)",
    },

    painPoints: {
        badge: "Masalah yang Diselesaikan",
        headline: "Pencatatan Keuangan Tercecer & Laporan Manual",
        subheadline:
            "Tantangan akuntansi yang dialami laundry tanpa sistem terintegrasi",
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        items: [
            {
                icon: <FileSpreadsheet className="h-6 w-6" />,
                title: "Rekap Laporan Manual",
                description:
                    "Order, paket, payroll, dan expense tersebar. Harus menyalin ulang transaksi ke Excel untuk membuat buku besar dan laba rugi bulanan.",
            },
            {
                icon: <Receipt className="h-6 w-6" />,
                title: "Pengeluaran Tidak Terkontrol",
                description:
                    "Pencatatan uang kas untuk belanja operasional dan petty cash tidak jelas. Seringkali pengeluaran terjadi tanpa approval owner.",
            },
            {
                icon: <Briefcase className="h-6 w-6" />,
                title: "Posisi Keuangan Tidak Akurat",
                description:
                    "Punya catatan kas masuk namun tidak tahu piutang dari member atau beban yang belum dibayar. Tidak ada neraca yang jelas.",
            },
            {
                icon: <Wallet className="h-6 w-6" />,
                title: "Penarikan Dana Outlet Berantakan",
                description:
                    "Tidak ada pemisahan jelas antara uang operasional dan uang pribadi owner. Penarikan kas (withdrawal/prive) sering tidak tercatat.",
            },
        ],
    },

    highlights: {
        badge: "Fitur Unggulan",
        headline: "Pencatatan Jurnal & Laporan Tanpa Repot",
        subheadline:
            "Fitur akuntansi untuk memberikan visibilitas finansial menyeluruh",
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        items: [
            {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Chart of Accounts Lengkap",
                description:
                    "Daftar akun standar hingga custom untuk setiap outlet. Kelola akun aset, kewajiban, ekuitas, pendapatan, dan beban.",
                color: "var(--color-rose-500)",
            },
            {
                icon: <ArrowRightLeft className="h-6 w-6" />,
                title: "Auto-Journal Transaksi",
                description:
                    "Payroll, paket langganan, order, fine, dan loan otomatis tercatat ke dalam jurnal akuntansi tanpa input ganda.",
                color: "var(--color-rose-600)",
            },
            {
                icon: <CreditCard className="h-6 w-6" />,
                title: "Expense, Deposit & Petty Cash",
                description:
                    "Alur persetujuan terstruktur. Catat pengeluaran, deposit, dan kas kecil lengkap dengan lampiran bukti nota, siap diapprove owner.",
                color: "var(--color-rose-500)",
            },
            {
                icon: <PieChart className="h-6 w-6" />,
                title: "Laba Rugi & Neraca",
                description:
                    "Laporan keuangan akurat terbangun dari jurnal detail. Print atau ekspor PDF/Excel untuk periode akuntansi yang sedang berjalan.",
                color: "var(--color-rose-600)",
            },
            {
                icon: <Briefcase className="h-6 w-6" />,
                title: "Buku Besar (Ledger)",
                description:
                    "Telusuri saldo setiap akun. Cek balance berjalan (running balance) dan histori mutasi harian secara mendetail.",
                color: "var(--color-rose-500)",
            },
            {
                icon: <Wallet className="h-6 w-6" />,
                title: "Owner Wallet & Withdrawal",
                description:
                    "Dompet digital owner yang merekap saldo pendapatan, serta alur pengajuan withdrawal ke rekening bank melalui persetujuan admin.",
                color: "var(--color-rose-600)",
            },
        ],
    },

    detailedSections: {
        badge: "Detail Arsitektur Fitur",
        headline: "Dari Jurnal Sampai Laporan Keuangan",
        subheadline:
            "Setiap transaksi operasional dipetakan ke jurnal, buku besar, dan laporan finansial yang siap dipantau owner.",
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        sections: [
            {
                icon: <BookOpen className="h-8 w-8" />,
                title: "Chart of Accounts, Journal, dan Period",
                description:
                    "Owner memiliki sistem akuntansi berbasis double-entry yang solid, dilengkapi dengan pengaturan periode akuntansi per outlet.",
                features: [
                    "Sistem Chart of Accounts (CoA) dinamis untuk setiap outlet",
                    "Jurnal manual (debit/kredit) yang dilengkapi detail reference",
                    "Tutup periode akuntansi (closing) untuk mengunci data bulanan",
                    "Laporan General Ledger (Buku Besar) per akun dengan saldo berjalan",
                ],
                color: "var(--color-rose-500)",
                bgColor: "var(--color-rose-50)",
            },
            {
                icon: <ArrowRightLeft className="h-8 w-8" />,
                title: "Auto-Journal: Operasional Langsung Jadi Laporan",
                description:
                    "Tidak perlu mengentri ulang pembukuan. WashWallet otomatis memetakan transaksi dari fitur lainnya ke dalam jurnal akuntansi.",
                features: [
                    "Auto-journal untuk pembayaran order, paket, dan topup member",
                    "Jurnal penggajian karyawan (payroll), denda (fine), dan pinjaman (loan)",
                    "Jurnal penggunaan kuota, kadaluarsa paket, serta referral commission",
                    "Jurnal expense, deposit, petty cash, dan prive owner",
                ],
                color: "var(--color-rose-600)",
                bgColor: "var(--color-rose-50)",
            },
            {
                icon: <FileText className="h-8 w-8" />,
                title: "Laporan Finansial yang Siap Diprint",
                description:
                    "Owner melihat dampak setiap transaksi terhadap Laba Rugi, Neraca, dan general ledger tanpa rekap manual.",
                features: [
                    "Laporan Laba Rugi (Profit Loss) dari akun revenue dan expense",
                    "Laporan Neraca (Balance Sheet) menampilkan aset, kewajiban, ekuitas",
                    "Fitur print dan ekspor laporan ke format PDF dan Excel",
                    "Bandingkan (comparative report) performa keuangan periode lalu",
                ],
                color: "var(--color-rose-500)",
                bgColor: "var(--color-rose-50)",
            },
        ],
    },

    useCases: [
        {
            persona: "Kasir Outlet",
            scenario:
                "Mengajukan expense atau petty cash untuk kebutuhan operasional mendadak",
            outcome:
                "Owner dapat approve atau reject pengeluaran, dan jurnal kas keluar tercatat rapi tanpa input manual.",
            accentColor: "var(--color-rose-500)",
        },
        {
            persona: "Owner Laundry",
            scenario:
                "Membayar payroll, order payment, package sale, topup, dan referral tanpa penjurnalan terpisah",
            outcome:
                "Semua auto-journal langsung masuk ledger sehingga buku besar dan laporan keuangan tetap sinkron.",
            accentColor: "var(--color-rose-600)",
        },
        {
            persona: "Admin Operasional",
            scenario:
                "Memproses withdrawal owner wallet ke bank account yang sudah ditentukan",
            outcome:
                "Status request, reject, cancel, dan mark paid tercatat jelas sebelum saldo owner berpindah.",
            accentColor: "var(--color-rose-500)",
        },
    ],

    benefits: {
        badge: "Outcome yang Terukur",
        headline: "Dampak Sistem Akuntansi ke Bisnis Anda",
        subheadline: "Lebih dari sekadar pencatatan transaksi kasir",
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        items: [
            {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Transparansi Penuh",
                description: "Semua uang masuk dan keluar memiliki jejak jurnal detail",
                benefits: [
                    "Owner bisa melihat asal-muasal tiap transaksi",
                    "Mencegah kecurangan dalam pelaporan kasir",
                ],
            },
            {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Kontrol Pengeluaran",
                description: "Sistem approval expense membuat uang kas tidak mudah bocor",
                benefits: [
                    "Tidak ada pengeluaran tanpa bukti/nota",
                    "Memastikan batas anggaran (budget) petty cash terjaga",
                ],
            },
            {
                icon: <Scale className="h-6 w-6" />,
                title: "Neraca Seimbang",
                description: "Penerapan double-entry menjamin perhitungan laba-rugi & aset stabil",
                benefits: [
                    "Akurasi perhitungan ekuitas vs kewajiban",
                    "Mengetahui nilai sesungguhnya (net worth) outlet",
                ],
            },
            {
                icon: <FileSpreadsheet className="h-6 w-6" />,
                title: "Export & Print Ready",
                description: "Data keuangan siap ditarik dalam bentuk PDF dan Excel",
                benefits: [
                    "Mudah untuk keperluan audit atau pelaporan internal",
                    "Menghemat puluhan jam rekap manual bulanan",
                ],
            },
            {
                icon: <Banknote className="h-6 w-6" />,
                title: "Pemisahan Keuangan",
                description: "Uang kasir/outlet terpisah dengan pencatatan prive owner",
                benefits: [
                    "Alur withdrawal memperjelas hak keuangan owner",
                    "Menghindari saldo minus yang tidak terjelaskan",
                ],
            },
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Manajemen Multi-Periode",
                description: "Sistem periode akuntansi mengunci laporan dari perubahan tak disengaja",
                benefits: [
                    "Tutup buku (closing) yang aman secara bulanan",
                    "Kredibilitas laporan finansial jangka panjang",
                ],
            },
        ],
    },

    comparison: {
        badge: "Perbandingan Metode",
        headline: "Pencatatan Konvensional vs WashWallet",
        subheadline: "Bagaimana WashWallet mengubah cara Anda melihat angka",
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        rows: [
            {
                aspect: "Pembuatan Jurnal",
                manual: "Harus rekap nota satu-persatu dan input manual ke Excel/Software Akuntansi eksternal.",
                washwallet: "Auto-journal dari transaksi laundry (order, paket, payroll).",
            },
            {
                aspect: "Laporan Keuangan",
                manual: "Dikerjakan setiap akhir bulan dengan risiko human error saat menjumlahkan saldo.",
                washwallet: "Buku besar, Laba Rugi, dan Neraca terbentuk secara real-time.",
            },
            {
                aspect: "Pengeluaran (Expense)",
                manual: "Kasir sering ambil uang laci tanpa nota yang jelas dan dilaporkan belakangan.",
                washwallet: "Fitur expense request & approval dengan wajib lampiran nota digital.",
            },
            {
                aspect: "Tutup Buku (Closing)",
                manual: "Data rentan diubah/dihapus kembali setelah bulan berlalu tanpa ketahuan.",
                washwallet: "Fitur Accounting Period bisa di-close untuk mengamankan riwayat jurnal.",
            },
            {
                aspect: "Penarikan Dana Owner",
                manual: "Owner ambil uang laci seenaknya (prive), membuat selisih pada omzet kasir.",
                washwallet: "Alur Wallet Withdrawal rapi dengan pencatatan status request hingga mark paid.",
            },
        ],
    },

    faqs: {
        badge: "Pertanyaan Umum",
        headline: "FAQ Financial Accounting",
        subheadline: "Jawaban terkait modul akuntansi WashWallet",
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        items: [
            {
                question: "Apakah laporan WashWallet bisa diekspor?",
                answer: "Tentu. General Ledger, Profit Loss (Laba Rugi), dan Balance Sheet (Neraca) bisa langsung dicetak atau diekspor ke PDF maupun Excel untuk dokumentasi Anda.",
            },
            {
                question: "Apakah sistem menyediakan laporan SPT Pajak otomatis?",
                answer: "Kami tidak menyediakan integrasi langsung PPh/PPN e-Faktur. WashWallet menyediakan laporan keuangan komersial akurat (Laba Rugi & Neraca) yang bisa Anda atau konsultan Anda gunakan sebagai dasar lapor pajak.",
            },
            {
                question: "Apakah saldo dompet Wallet saya akan ditransfer otomatis dari bank?",
                answer: "Tidak otomatis terpotong dari bank. Proses Withdrawal adalah pengajuan (request) melalui sistem WashWallet yang nantinya akan diproses (mark paid) oleh pihak admin setelah transfer manual dilakukan.",
            },
            {
                question: "Apakah ada rekonsiliasi otomatis dengan rekening bank?",
                answer: "Sistem mencatat transaksi berdasarkan konfirmasi payment gateway (Midtrans) dan approval internal, namun tidak menarik mutasi rekening BCA/Mandiri/dsb secara otomatis (direct bank feed).",
            },
            {
                question: "Bolehkah saya membuat akun jurnal saya sendiri?",
                answer: "Ya, modul Chart of Accounts memungkinkan owner untuk tidak hanya menggunakan akun default, tetapi juga membuat akun spesifik (custom account) sesuai kebutuhan unik outlet.",
            },
        ],
    },

    ctaFinal: {
        badge: "Penawaran Spesial",
        headline: "Ubah Tumpukan Nota Menjadi Laporan Laba Rugi",
        subheadline: "Tinggalkan Excel dan sinkronkan operasional laundry Anda dengan standar akuntansi yang rapi.",
        accentColor: "var(--color-rose-500)",
        accentBg: "var(--color-rose-50)",
        accentBorder: "var(--color-rose-200)",
        primaryCtaText: "Mulai Free Trial",
        primaryCtaHref: "/register",
        secondaryCtaText: "Chat via WhatsApp",
        whatsappNumber: "6281234567890",
        whatsappMessage: "Halo, saya tertarik mencoba fitur Financial Accounting & Auto-Journal di WashWallet.",
    },
};
