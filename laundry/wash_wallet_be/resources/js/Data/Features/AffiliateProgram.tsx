import React from "react";
import {
    TrendingUp,
    Zap,
    DollarSign,
    BarChart3,
    Users,
    Link,
    Award,
    AlertCircle,
    Wallet,
} from "lucide-react";

export const affiliateProgramData = {
    hero: {
        badge: "Program Afiliasi",
        headline: "Dapatkan Komisi Koin Melalui ",
        headlineHighlight: "Program Referral",
        subheadline:
            "Ajak rekan pengusaha laundry bergabung dengan WashWallet menggunakan kode referral unik Anda, dan dapatkan komisi koin otomatis dari setiap top-up saldo koin yang mereka lakukan.",
        highlights: [
            "Kode Referral 8 Karakter",
            "Komisi 10% Setiap Top-up",
            "Pencatatan Referral Log",
            "Jurnal Akuntansi Otomatis",
        ],
        accentColor: "var(--color-purple-500)",
        accentBg: "var(--color-purple-50)",
        accentBorder: "var(--color-purple-200)",
        accentStrongColor: "var(--color-purple-600)",
        orbColor: "var(--color-purple-400)",
    },

    painPoints: {
        badge: "Masalah yang Diselesaikan",
        headline: "Mengapa Program Rekomendasi Manual Sulit Berkembang?",
        subheadline: "Tantangan melacak kemitraan tanpa pencatatan sistem terpusat",
        accentColor: "var(--color-purple-500)",
        accentBg: "var(--color-purple-50)",
        accentBorder: "var(--color-purple-200)",
        items: [
            {
                icon: <AlertCircle className="h-6 w-6" />,
                title: "Rekomendasi Sulit Dilacak",
                description:
                    "Tidak ada cara formal untuk mengetahui owner laundry mana yang merekomendasikan sistem, membuat apresiasi tidak terdata.",
            },
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Rekap Komisi Manual",
                description:
                    "Menghitung komisi kemitraan satu per satu di akhir bulan menggunakan spreadsheet memakan waktu dan rawan terjadi salah hitung.",
            },
            {
                icon: <DollarSign className="h-6 w-6" />,
                title: "Ketiadaan Transparansi Data",
                description:
                    "Mitra Anda tidak memiliki akses untuk melihat daftar partner yang diajak, total transaksi mereka, dan berapa koin komisi yang masuk.",
            },
            {
                icon: <Users className="h-6 w-6" />,
                title: "Kemitraan Tidak Aktif",
                description:
                    "Tanpa kepastian saldo reward dan notifikasi otomatis, mitra tidak termotivasi mengajak pengusaha laundry lain bergabung.",
            },
        ],
    },

    highlights: {
        badge: "Fitur Referral",
        headline: "Pilar Program Afiliasi WashWallet",
        subheadline: "Didukung alur backend Laravel yang mencatat relasi mitra secara terstruktur",
        accentColor: "var(--color-purple-500)",
        accentBg: "var(--color-purple-50)",
        accentBorder: "var(--color-purple-200)",
        items: [
            {
                icon: <Link className="h-6 w-6" />,
                title: "Kode Referral 8 Karakter",
                description:
                    "Setiap owner laundry terdaftar mendapatkan kode referral unik 8 karakter yang dapat dibagikan saat registrasi user baru.",
                color: "var(--color-purple-500)",
            },
            {
                icon: <Zap className="h-6 w-6" />,
                title: "Komisi Top-up 10%",
                description:
                    "Dapatkan komisi sebesar 10% dari jumlah koin yang dibeli oleh partner referred Anda setiap kali mereka melakukan top-up koin sukses.",
                color: "var(--color-purple-400)",
            },
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Dashboard Kemitraan Riil",
                description:
                    "Lihat ringkasan kemitraan, jumlah partner yang diajak, total komisi koin yang terkumpul, dan daftar log referral terbaru.",
                color: "var(--color-purple-600)",
            },
            {
                icon: <Award className="h-6 w-6" />,
                title: "Referral Log Transparan",
                description:
                    "Setiap komisi yang masuk terekam dalam tabel log rincian lengkap mengenai sumber referred user dan transaksi top-up terkait.",
                color: "var(--color-purple-300)",
            },
            {
                icon: <DollarSign className="h-6 w-6" />,
                title: "Reward Balance Terintegrasi",
                description:
                    "Hasil komisi koin otomatis menambah reward balance Anda di sistem dan dapat digunakan langsung untuk biaya operasional struk/WhatsApp.",
                color: "var(--color-purple-500)",
            },
            {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Pembukuan Jurnal Akuntansi",
                description:
                    "Pemberian komisi referral otomatis tercatat dalam entri jurnal buku besar (akuntansi) untuk menjaga kepatuhan laporan keuangan.",
                color: "var(--color-purple-500)",
            },
        ],
    },

    detailedSections: {
        badge: "Detail Alur Kerja Fitur",
        headline: "Kolaborasi Menguntungkan Antar Pemilik Laundry",
        subheadline: "Sistem rujukan satu tingkat (one-level) yang adil dan transparan",
        accentColor: "var(--color-purple-500)",
        sections: [
            {
                icon: <Link className="h-8 w-8" />,
                title: "Pendaftaran Kemitraan Akurat",
                description:
                    "Saat owner laundry baru mendaftar akun di form registrasi, mereka memasukkan kode referral Anda. Sistem memverifikasi kecocokan kode dan mengikat relasi tersebut secara permanen.",
                features: [
                    "Verifikasi instan format kode referral 8 karakter",
                    "Penyimpanan data referred_by pada database pengguna",
                    "Pencegahan penggunaan kode tidak aktif atau format salah",
                    "Daftar referred user dapat dipantau langsung di profil"
                ],
                bgColor: "var(--color-purple-500)",
            },
            {
                icon: <Zap className="h-8 w-8" />,
                title: "Pembagian Komisi Otomatis",
                description:
                    "Setiap kali partner referred Anda melakukan pembelian koin (top-up) operasional yang berhasil diselesaikan, sistem menghitung komisi 10% dan menambah reward balance Anda secara instan.",
                features: [
                    "Kalkulasi komisi 10% flat dari total koin top-up yang diterima",
                    "Penambahan balance reward secara realtime pasca pembayaran sukses",
                    "Penyimpanan riwayat transaksi di tabel ReferralLog",
                    "Status komisi transparan tanpa potongan biaya admin"
                ],
                bgColor: "var(--color-purple-400)",
            },
            {
                icon: <BarChart3 className="h-8 w-8" />,
                title: "Pencatatan Keuangan Terstandar",
                description:
                    "Bukan sekadar penambahan saldo, setiap komisi yang dibagikan dicatat dalam entri jurnal akuntansi WashWallet sebagai beban referral dan pendapatan afiliasi.",
                features: [
                    "Pencatatan jurnal keuangan terintegrasi AccountingService",
                    "Pemisahan alur pencatatan koin transaksi komisi",
                    "Laporan audit keuangan yang seimbang (balanced)",
                    "Dukungan export data referral harian"
                ],
                bgColor: "var(--color-purple-600)",
            },
        ],
    },

    useCases: [
        {
            persona: "Owner Cabang Tebet",
            scenario: "Mengajak partner baru melalui kode referral",
            outcome: "Mendapatkan komisi koin gratis secara otomatis untuk menekan pengeluaran operasional outlet.",
            accentColor: "var(--color-purple-500)",
        },
        {
            persona: "Penyelenggara Forum Laundry",
            scenario: "Berbagi kode rujukan di komunitas pengusaha laundry",
            outcome: "Akumulasi komisi koin yang signifikan dari top-up kumulatif rekan-rekan anggota.",
            accentColor: "var(--color-purple-400)",
        },
        {
            persona: "Owner Laundry Tertib Administrasi",
            scenario: "Melacak pencatatan beban biaya komisi afiliasi",
            outcome: "Semua mutasi koin terposting rapi di jurnal buku besar tanpa rekap spreadsheet manual.",
            accentColor: "var(--color-purple-600)",
        },
    ],

    benefits: {
        headline: "Keuntungan Program Afiliasi WashWallet",
        badge: "Manfaat Kemitraan",
        subheadline: "Dapatkan penghasilan koin tambahan untuk operasional outlet Anda",
        accentColor: "var(--color-purple-500)",
        accentBg: "var(--color-purple-50)",
        accentBorder: "var(--color-purple-200)",
        items: [
            {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Peluang Pendapatan Koin",
                description: "Gunakan saldo koin komisi untuk menghemat biaya operasional pengiriman WhatsApp dan cetak nota.",
                benefits: [
                    "Mengurangi pengeluaran operasional outlet Anda",
                    "Koin komisi langsung aktif setelah partner melakukan top-up"
                ],
            },
            {
                icon: <Users className="h-6 w-6" />,
                title: "Kolaborasi Antar Owner",
                description: "Membantu sesama pengusaha laundry mendapatkan sistem manajemen outlet yang andal.",
                benefits: [
                    "Membangun komunitas owner laundry yang solid",
                    "Berbagi solusi digitalisasi operasional laundry"
                ],
            },
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Transparansi Penuh",
                description: "Semua mitra yang Anda undang dan total komisi koin terekam jelas di dashboard.",
                benefits: [
                    "Tidak ada komisi yang terlewat atau tidak terhitung",
                    "Data kemitraan dapat diakses kapan saja secara real-time"
                ],
            },
            {
                icon: <Wallet className="h-6 w-6" />,
                title: "Tanpa Biaya Tambahan",
                description: "Program kemitraan ini gratis dan aktif secara otomatis untuk seluruh pemilik outlet.",
                benefits: [
                    "Tidak memerlukan biaya pendaftaran program afiliasi",
                    "Setiap user owner berhak mendapatkan kode referral unik"
                ],
            },
            {
                icon: <Award className="h-6 w-6" />,
                title: "Pencatatan Keuangan Rapi",
                description: "Setiap mutasi komisi koin tercatat dalam jurnal akuntansi yang balanced.",
                benefits: [
                    "Mendukung pembukuan outlet yang rapi dan patuh aturan",
                    "Mempermudah audit kas bulanan Anda"
                ],
            },
            {
                icon: <Link className="h-6 w-6" />,
                title: "Penggunaan Kode Praktis",
                description: "Cukup bagikan kode 8 karakter Anda melalui grup chat atau media sosial.",
                benefits: [
                    "Sangat mudah diingat dibanding link panjang yang rumit",
                    "Partner baru tinggal memasukkan kode saat registrasi"
                ],
            },
        ],
    },

    comparison: {
        badge: "Perbandingan Metode",
        headline: "Manual vs Sistem WashWallet",
        subheadline: "Bandingkan alur rekomendasi manual dengan program referral otomatis",
        accentColor: "var(--color-purple-500)",
        accentBg: "var(--color-purple-50)",
        accentBorder: "var(--color-purple-200)",
        rows: [
            {
                aspect: "Pencatatan Referral",
                manual: "Mencatat manual siapa merekomendasikan siapa di spreadsheet, rawan terlewat.",
                washwallet:
                    "Sistem otomatis mengikat relasi referred_by di database sejak registrasi.",
            },
            {
                aspect: "Perhitungan Komisi",
                manual: "Kasir/owner menghitung persentase komisi secara manual setiap akhir bulan.",
                washwallet:
                    "Komisi 10% koin otomatis dihitung dan dialokasikan saat top-up partner sukses.",
            },
            {
                aspect: "Saldo Reward Kemitraan",
                manual: "Komisi disimpan di catatan kertas terpisah, rawan hilang dan sulit dikontrol.",
                washwallet:
                    "Komisi langsung masuk ke saldo reward owner, tercatat di log transaksi koin.",
            },
            {
                aspect: "Pembukuan Akuntansi",
                manual: "Beban komisi tidak dicatat rapi dalam jurnal keuangan, mengabaikan pos beban.",
                washwallet:
                    "Setiap transaksi tercatat otomatis di entri jurnal beban referral dan pendapatan komisi.",
            },
            {
                aspect: "Kemudahan Berbagi",
                manual: "Menggunakan link pendaftaran panjang yang sulit diketik atau diingat partner.",
                washwallet:
                    "Menggunakan kode referral 8 karakter sederhana yang divalidasi sistem saat registrasi.",
            },
            {
                aspect: "Tingkat Transparansi",
                manual: "Mitra tidak mengetahui apakah partner yang diajak sudah aktif bertransaksi.",
                washwallet:
                    "Daftar referred user dan log detail komisi ditampilkan langsung di dashboard affiliate.",
            },
        ],
    },

    faqs: {
        badge: "Pertanyaan Umum",
        headline: "FAQ Program Kemitraan",
        subheadline:
            "Jawaban seputar program referral dan komisi afiliasi koin",
        accentColor: "var(--color-purple-500)",
        accentBg: "var(--color-purple-50)",
        accentBorder: "var(--color-purple-200)",
        items: [
            {
                question: "Di mana saya bisa melihat kode referral saya?",
                answer: "Kode referral unik Anda terdiri dari 8 karakter dan dapat dilihat langsung di halaman Profil Akun atau di dashboard Affiliates pada akun Owner Anda.",
            },
            {
                question: "Berapa besar komisi yang saya terima jika partner melakukan top-up?",
                answer: "Anda akan mendapatkan komisi sebesar 10% dari jumlah koin laundry yang diterima oleh partner referred Anda saat mereka melakukan top-up koin sukses di sistem.",
            },
            {
                question: "Apakah saldo komisi koin ini bisa ditarik ke rekening bank?",
                answer: "Tidak. Komisi diberikan dalam bentuk saldo koin (reward balance) di sistem WashWallet. Saldo ini dirancang untuk digunakan langsung membiayai operasional outlet Anda seperti cetak struk kasir, cetak label pakaian, atau mengirim notifikasi WhatsApp.",
            },
            {
                question: "Bagaimana sistem mendeteksi rujukan saya saat registrasi?",
                answer: "Saat calon partner mendaftar, mereka memasukkan kode referral Anda di form registrasi. Sistem memverifikasi kode tersebut ke database, dan jika aktif, akan menghubungkan akun baru tersebut di bawah ID referred Anda.",
            },
            {
                question: "Apakah komisi kemitraan ini berlaku multi-level?",
                answer: "Tidak. Program referral WashWallet menggunakan sistem rujukan satu tingkat (one-level). Komisi hanya didapatkan secara langsung dari aktivitas top-up koin partner yang mendaftar menggunakan kode Anda.",
            },
        ],
    },

    ctaFinal: {
        badge: "Mulai Sekarang",
        headline: "Bagikan Kode Referral Anda & Dapatkan Komisi Koin",
        subheadline:
            "Bantu sesama pengusaha laundry menggunakan sistem operasional modern dan nikmati keuntungan koin bersama.",
        accentColor: "var(--color-purple-500)",
        accentBg: "var(--color-purple-50)",
        accentBorder: "var(--color-purple-200)",
        primaryCtaText: "Lihat Kode Referral",
        primaryCtaHref: "/dashboard/affiliates",
        secondaryCtaText: "Hubungi Hubungan Kemitraan",
        whatsappNumber: "6281234567890",
        whatsappMessage:
            "Halo, saya ingin bertanya lebih lanjut tentang program kemitraan referral di WashWallet.",
    },
};
