import {
    AlertCircle,
    Users,
    Clock,
    TrendingUp,
    BarChart3,
    Activity,
    Bell,
    Lock,
    FileText,
    Heart,
    MapPin,
    Printer} from "lucide-react";

export const operationalManagementData = {
    hero: {
        badge: "Manajemen Operasional",
        headline: "Alur Operasional Laundry ",
        headlineHighlight: "Terintegrasi",
        subheadline:
            "Kelola lifecycle order dari masuk hingga selesai, pantau produksi per item, kelola rute kurir, serta otomatisasi WhatsApp dan cetak struk dari satu sistem terpusat.",
        highlights: [
            "Order Lifecycle Tracking",
            "Item & Process Tracking",
            "Courier Pricing & Routing",
            "WhatsApp & Print API",
        ],
        accentColor: "var(--color-primary-500)",
        accentBg: "var(--color-primary-50)",
        accentBorder: "var(--color-primary-200)",
    },

    painPoints: {
        badge: "Masalah yang Diselesaikan",
        headline: "Operasional Tercecer & Tidak Sinkron?",
        subheadline: "Tantangan operasional laundry yang sering ditemui di lapangan",
        accentColor: "var(--color-primary-500)",
        accentBg: "var(--color-primary-50)",
        accentBorder: "var(--color-primary-200)",
        items: [
            {
                icon: <AlertCircle className="h-6 w-6" />,
                title: "Status Order Tidak Jelas",
                description:
                    "Pelanggan, kasir, dan tim produksi memiliki data status order yang berbeda. Memicu keluhan dan membuang waktu konfirmasi manual.",
            },
            {
                icon: <Users className="h-6 w-6" />,
                title: "Tracking Produksi Lemah",
                description:
                    "Sulit memantau pengerjaan per item cucian. Owner tidak tahu staf mana yang memproses baju tertentu atau kapan selesainya.",
            },
            {
                icon: <Clock className="h-6 w-6" />,
                title: "Penentuan Ongkir Kurir Tidak Akurat",
                description:
                    "Biaya jemput-antar kurir sering salah hitung. Rute penjemputan tidak teratur sehingga waktu kurir habis di jalan.",
            },
            {
                icon: <Bell className="h-6 w-6" />,
                title: "Konfirmasi & Cetak Struk Manual",
                description:
                    "Kasir harus mengetik manual notifikasi status satu per satu ke pelanggan, serta kesulitan mengontrol printer receipt & label secara terpusat.",
            },
        ],
    },

    highlights: {
        badge: "Fitur Operasional",
        headline: "Fitur Real untuk Operasional Laundry",
        subheadline: "Pondasi operasional yang dipetakan langsung dengan service & model di database",
        accentColor: "var(--color-primary-500)",
        accentBg: "var(--color-primary-50)",
        accentBorder: "var(--color-primary-200)",
        items: [
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Lifecycle Order Lengkap",
                description:
                    "Mendukung 14 status pengerjaan (dari requested, accepted, weighing, ready_to_process, in_progress, ready, hingga completed) yang tercatat di OrderStatusHistory.",
                color: "var(--color-primary-500)",
            },
            {
                icon: <Activity className="h-6 w-6" />,
                title: "Tracking Produksi Per Item",
                description:
                    "Mulai & selesaikan proses per item cucian. Catat log kerja karyawan, evidence attachment bukti pengerjaan, serta kalkulasi komisi karyawan.",
                color: "var(--color-secondary-500)",
            },
            {
                icon: <MapPin className="h-6 w-6" />,
                title: "Courier Pricing & Rute",
                description:
                    "Mendukung courier pricing engine (zone/tier), free shipping threshold, toggle supports_courier per layanan, serta konfirmasi pickup & arrived.",
                color: "var(--color-warning-500)",
            },
            {
                icon: <Bell className="h-6 w-6" />,
                title: "WhatsApp & FCM Alerts",
                description:
                    "Preview dan kirim notifikasi WhatsApp status order ke pelanggan dengan pemotongan saldo koin, serta FCM token push notifications.",
                color: "var(--color-success-500)",
            },
            {
                icon: <Printer className="h-6 w-6" />,
                title: "Print Struk & Label",
                description:
                    "API printer bluetooth untuk cetak struk kasir & label barcode laundry. Terintegrasi dengan journal entry dan transaksi koin.",
                color: "var(--color-info-500)",
            },
            {
                icon: <Lock className="h-6 w-6" />,
                title: "Role Permission Ketat",
                description:
                    "Gunakan middleware position permission per outlet. Mengunci akses rute mobile kasir, produksi, dan kurir sesuai otorisasi.",
                color: "var(--color-error-500)",
            },
        ],
    },

    detailedSections: {
        badge: "Detail Arsitektur Fitur",
        headline: "Bagaimana WashWallet Mengamankan Operasional Anda",
        subheadline: "Didukung oleh modul backend Laravel terstruktur untuk skalabilitas multi-outlet",
        accentColor: "var(--color-primary-500)",
        sections: [
            {
                icon: <Users className="h-8 w-8" />,
                title: "Akses & Konfigurasi Multi-Outlet",
                description:
                    "Sebagai owner, kelola outlet tak terbatas dengan pengaturan detail: jam operasional, status eksposur outlet ke publik, aktivasi modul berbayar (trial & auto-renewal), serta manajemen kurir internal.",
                features: [
                    "Aktivasi & trial fitur outlet via OutletFeatureService",
                    "Akses posisi karyawan dikunci dengan CheckPositionPermission",
                    "Pengaturan hari & jam operasional outlet fleksibel",
                    "Dashboard khusus role Owner, Kasir, Produksi, dan Kurir"
                ],
                bgColor: "var(--color-primary-500)",
            },
            {
                icon: <Activity className="h-8 w-8" />,
                title: "Pelacakan Workflow Produksi Detail",
                description:
                    "Setiap cucian dipecah menjadi item pengerjaan (OrderItem). Staf produksi dapat memulai dan menyelesaikan pengerjaan per proses, mengunggah bukti pengerjaan, dan mencatat komisi kerja secara real-time.",
                features: [
                    "OrderItemProcess melacak start, complete, & PIC pengerjaan",
                    "Upload file bukti pengerjaan (evidence attachment)",
                    "Perhitungan komisi kerja (work log commission) per proses",
                    "Validasi laundry service dengan flag supports_courier"
                ],
                bgColor: "var(--color-secondary-500)",
            },
            {
                icon: <MapPin className="h-8 w-8" />,
                title: "Logistik Kurir & Pricing Engine",
                description:
                    "Optimalkan operasional kurir jemput-antar. Tentukan pricing kurir berdasarkan zona jarak atau tier harga. Kurir dapat mengelola rute pengerjaan dan konfirmasi pickup/arrived melalui aplikasi khusus.",
                features: [
                    "Kalkulasi ongkir otomatis via CourierPricingEngine",
                    "Manajemen jadwal pengantaran & penjemputan terpadu",
                    "Konfirmasi pickup dan arrived oleh kurir di lapangan",
                    "Dukungan free shipping threshold per outlet"
                ],
                bgColor: "var(--color-warning-500)",
            },
        ],
    },

    pricingBox: {
        headline: "Unlock Fitur Operasional Lengkap",
        subheadline: "Kelola operasional laundry Anda dengan koin terintegrasi",
        features: [
            "Kelola data outlet, karyawan, dan permission",
            "Pelacakan order & produksi tingkat item",
            "Setting pricing kurir (tier & zone)",
            "WhatsApp & print API dengan transaksi koin",
            "Dashboard performa multi-outlet & per role",
        ],
        ctaText: "Hubungi Penjualan",
        ctaHref: "/contact",
    },

    useCases: [
        {
            persona: "Owner Laundry Multi-Outlet",
            scenario: "Memantau pengerjaan cucian tanpa harus di outlet",
            challenge:
                "Ingin memantau pengerjaan per item di 3 cabang berbeda secara real-time dan transparan.",
            solution:
                "Mengakses dashboard terpadu, melihat progress OrderItemProcess dan log karyawan pengerja.",
            outcome: "Kontrol penuh atas kualitas, transparansi komisi karyawan terjamin.",
            accentColor: "var(--color-primary-500)",
        },
        {
            persona: "Tim Produksi & Kasir",
            scenario: "Menghindari cucian tertukar atau proses terlewat",
            challenge:
                "Cucian sering tertukar pada tahap setrika atau dibungkus sebelum semua item selesai.",
            solution:
                "Sistem mewajibkan start & complete per item di aplikasi produksi sebelum order ditandai 'ready'.",
            outcome: "Zero komplain cucian tertukar atau kurang item.",
            accentColor: "var(--color-secondary-500)",
        },
        {
            persona: "Kurir Laundry Internal",
            scenario: "Mengatur rute pickup & delivery harian",
            challenge:
                "Kurir bingung menentukan urutan jemput/antar, sering melewati rute yang sama berulang kali.",
            solution:
                "Aplikasi kurir menyediakan list route penjemputan dan pengantaran terintegrasi status order.",
            outcome: "Hemat bahan bakar dan waktu pengantaran lebih efisien.",
            accentColor: "var(--color-success-500)",
        },
    ],

    benefits: {
        headline: "Keuntungan Nyata bagi Bisnis Laundry Anda",
        badge: "Manfaat Bisnis",
        subheadline: "Dirancang untuk efisiensi operasional dan kepuasan pelanggan",
        items: [
            {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Throughput Optimal",
                description: "Workflow teratur meminimalkan cucian menumpuk.",
                benefits: [
                    "Alur pengerjaan seimbang antar kasir, produksi, dan kurir",
                    "Identifikasi bottleneck di setiap tahapan status order"
                ],
            },
            {
                icon: <Clock className="h-6 w-6" />,
                title: "Waktu Proses Terukur",
                description: "Staf produksi mengetahui prioritas pengerjaan.",
                benefits: [
                    "Pencatatan durasi pengerjaan per proses secara otomatis",
                    "Notifikasi order prioritas untuk mempercepat SLA pengerjaan"
                ],
            },
            {
                icon: <Bell className="h-6 w-6" />,
                title: "Minim Komplain Pelanggan",
                description: "Pelanggan mendapatkan kepastian status cucian.",
                benefits: [
                    "Notifikasi WhatsApp otomatis berisi update pengerjaan order",
                    "Tracking live order untuk meningkatkan kepuasan pelanggan"
                ],
            },
            {
                icon: <Users className="h-6 w-6" />,
                title: "Transparansi Kinerja Staf",
                description: "Penilaian staf berdasarkan data pengerjaan riil.",
                benefits: [
                    "Kalkulasi komisi pengerjaan otomatis terintegrasi work log",
                    "Audit pengerjaan per staf dengan evidence attachment"
                ],
            },
            {
                icon: <FileText className="h-6 w-6" />,
                title: "Administrasi Efisien",
                description: "Pencatatan data terotomatisasi di backend.",
                benefits: [
                    "Laporan status order harian yang dapat diekspor langsung",
                    "Sinkronisasi otomatis jurnal keuangan untuk biaya kurir & cetak"
                ],
            },
            {
                icon: <Heart className="h-6 w-6" />,
                title: "Loyalitas Pelanggan",
                description: "Kombinasi kecepatan, kualitas, dan transparansi.",
                benefits: [
                    "Meningkatkan repeat order karena pengalaman mencuci yang andal",
                    "Keamanan pakaian terjamin dengan history per item"
                ],
            },
        ],
    },

    comparison: {
        badge: "Perbandingan Metode",
        subheadline: "Bandingkan operasional manual vs alur kerja terstruktur WashWallet",
        headline: "Manual vs WashWallet",
        rows: [
            {
                aspect: "Intake & Tracking Order",
                manual: "Catatan nota kertas terpisah, rawan hilang & status cucian tidak terpantau.",
                washwallet:
                    "Lifecycle order digital dari requested hingga completed, terekam di database.",
            },
            {
                aspect: "Pengerjaan Produksi",
                manual: "Pakaian dicampur tanpa pencatatan detail proses, staf bingung pembagian kerja.",
                washwallet:
                    "OrderItemProcess merekam start/complete per item dilengkapi lampiran bukti pengerjaan.",
            },
            {
                aspect: "Logistik Kurir",
                manual: "Biaya kurir dikira-kira manual, penjemputan tidak teratur dan sering terlambat.",
                washwallet:
                    "CourierPricingEngine menghitung ongkir otomatis, rute penjemputan terarah.",
            },
            {
                aspect: "Update Pelanggan",
                manual: "Staf mengetik chat manual satu per satu ke pelanggan saat baju selesai.",
                washwallet:
                    "Kirim notifikasi WhatsApp status order langsung dari sistem dengan saldo koin.",
            },
            {
                aspect: "Pembatasan Akses",
                manual: "Karyawan dapat melihat data keuangan & data outlet lain secara bebas.",
                washwallet:
                    "Akses dibatasi ketat per outlet menggunakan middleware position permission.",
            },
            {
                aspect: "Cetak Nota & Label",
                manual: "Menulis manual tag kertas, rawan robek terkena air saat proses mencuci.",
                washwallet:
                    "Cetak digital receipt & label barcode tahan air dengan API print bluetooth.",
            },
        ],
    },

    faqs: {
        badge: "Pertanyaan Umum",
        headline: "Yang Sering Ditanyakan",
        subheadline:
            "Jawaban seputar fitur dan arsitektur operasional WashWallet",
        items: [
            {
                question: "Bagaimana sistem membatasi akses kasir, produksi, dan kurir?",
                answer: "Setiap karyawan dikaitkan dengan posisi tertentu di outlet. Melalui middleware CheckPositionPermission di backend Laravel, rute API mobile kasir, produksi, dan kurir dikunci rapat hanya untuk pengguna yang memiliki permission key yang sesuai.",
            },
            {
                question: "Apakah sistem mencatat siapa yang mengerjakan item pakaian tertentu?",
                answer: "Ya, betul. Saat tim produksi memulai proses (misal: menyetrika), mereka melakukan 'start' pada item tersebut. Sistem mencatat ID karyawan, waktu pengerjaan, dan bukti foto (evidence attachment) ke dalam tabel OrderItemProcess.",
            },
            {
                question: "Bagaimana cara kerja perhitungan komisi karyawan pengerjaan?",
                answer: "Setiap proses pengerjaan dapat diatur memiliki tarif komisi tertentu. Ketika staf produksi menyelesaikan proses pengerjaan (complete process), sistem secara otomatis mencatat log kerja komisi karyawan tersebut.",
            },
            {
                question: "Apakah aplikasi kasir dan kurir memerlukan internet?",
                answer: "Ya, aplikasi kasir, produksi, dan kurir terhubung langsung secara real-time dengan backend server WashWallet untuk memastikan keaslian data, log transaksi koin, dan sinkronisasi status pengerjaan yang akurat.",
            },
            {
                question: "Bagaimana integrasi cetak struk dan notifikasi WhatsApp berjalan?",
                answer: "Kedua fitur ini beroperasi menggunakan sistem saldo koin outlet. Ketika kasir memicu aksi cetak struk atau mengirimkan template notifikasi WhatsApp status order, sistem memotong koin outlet dan mencatat transaksi tersebut di journal entry.",
            },
        ],
    },

    ctaFinal: {
        badge: "Coba Sekarang",
        headline: "Kelola Operasional Laundry Anda Lebih Terstruktur",
        subheadline:
            "Tinggalkan cara manual. Bangun workflow operasional laundry yang andal dan aman bersama WashWallet.",
        primaryCtaText: "Mulai Free Trial",
        primaryCtaHref: "/register",
        secondaryCtaText: "Hubungi Tim Kami",
        whatsappNumber: "6281234567890",
        whatsappMessage:
            "Halo, saya ingin bertanya lebih lanjut mengenai fitur Manajemen Operasional WashWallet.",
    },
};
