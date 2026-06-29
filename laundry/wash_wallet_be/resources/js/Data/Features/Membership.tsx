import React from "react";
import {
    Gift,
    Zap,
    TrendingUp,
    CreditCard,
    BarChart3,
    Bell,
    Heart,
    AlertCircle,
    Award,
    DollarSign
} from "lucide-react";
import type {
    DetailedSectionsData,
    FeatureBenefitsData,
    FeatureComparisonData,
    FeatureCTAFinalData,
    FeatureFAQData,
    FeatureHeroData,
    FeatureHighlightsData,
    FeaturePainPointsData,
    UseCasesData,
} from "@/Pages/Features/Partials/types";

interface MembershipFeatureData {
    hero: FeatureHeroData;
    painPoints: FeaturePainPointsData;
    highlights: FeatureHighlightsData;
    detailedSections: DetailedSectionsData;
    benefits: FeatureBenefitsData;
    comparison: FeatureComparisonData;
    useCases: UseCasesData["cases"];
    faqs: FeatureFAQData;
    ctaFinal: FeatureCTAFinalData;
}

export const membershipData: MembershipFeatureData = {
    hero: {
        badge: "Paket & Membership",
        headline: "Kunci Loyalitas Pelanggan dengan ",
        headlineHighlight: "Paket & Layanan Prabayar",
        subheadline:
            "Kelola kuota berlangganan pelanggan, atur deposit saldo cashless, serta berikan keuntungan membership eksklusif seperti diskon dan gratis ongkir untuk melipatgandakan repeat order outlet laundry Anda.",
        highlights: [
            "Paket Kuota Layanan",
            "Keanggotaan & Diskon Member",
            "Jatah Gratis Ongkir Kurir",
            "Deposit Saldo & Topup",
        ],
        accentColor: "var(--color-info-500)",
        accentBg: "var(--color-info-50)",
        accentBorder: "var(--color-info-200)",
    },

    painPoints: {
        badge: "Masalah Operasional yang Diselesaikan",
        headline: "Mengapa Mengelola Paket Kuota Secara Manual Merepotkan?",
        subheadline: "Tantangan retensi pelanggan tanpa sistem yang terintegrasi",
        accentColor: "var(--color-info-500)",
        accentBg: "var(--color-info-50)",
        accentBorder: "var(--color-info-200)",
        items: [
            {
                icon: <AlertCircle className="h-6 w-6" />,
                title: "Pencatatan Kuota Paket Manual",
                description:
                    "Mencatat sisa kuota pelanggan di buku atau kartu cap fisik rawan hilang dan sering salah tulis. Memicu kesalahpahaman dengan pelanggan setia Anda.",
            },
            {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Benefit Member Sulit Dipantau",
                description:
                    "Menghitung jatah gratis ongkir kurir atau potongan diskon member secara manual saat order sangat melelahkan dan sering salah hitung.",
            },
            {
                icon: <DollarSign className="h-6 w-6" />,
                title: "Uang Deposit Pelanggan Berantakan",
                description:
                    "Menerima titipan deposit saldo dari pelanggan reguler tanpa mutasi yang jelas membuat pembukuan keuangan kasir menjadi tidak seimbang.",
            },
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Laporan Keuangan Paket Bias",
                description:
                    "Kesulitan memisahkan pendapatan dari penjualan paket awal dengan porsi pemakaian layanan harian, serta melacak paket yang hangus (expired).",
            },
        ],
    },

    highlights: {
        badge: "Fitur Membership",
        headline: "Fitur Pendukung Repeat Order Laundry",
        subheadline: "Pondasi program loyalitas pelanggan yang terintegrasi langsung di sistem kasir",
        accentColor: "var(--color-info-500)",
        accentBg: "var(--color-info-50)",
        accentBorder: "var(--color-info-200)",
        items: [
            {
                icon: <Gift className="h-6 w-6" />,
                title: "Service Package & Quota",
                description:
                    "Buat paket layanan prabayar (misal: paket cuci 10 kg) dengan jumlah kuota pengerjaan untuk mengunci repeat order sejak awal.",
                color: "var(--color-info-500)",
            },
            {
                icon: <Zap className="h-6 w-6" />,
                title: "Penggunaan Kuota Instan",
                description:
                    "Kasir tinggal memotong sisa kuota pelanggan saat mencatat transaksi laundry. Sistem akan otomatis memvalidasi sisa kuota.",
                color: "var(--color-info-600)",
            },
            {
                icon: <Award className="h-6 w-6" />,
                title: "Membership Plan Khusus",
                description:
                    "Buat skema keanggotaan outlet dengan benefit diskon tetap (%) dan jatah gratis ongkir (free shipping quota) per masa aktif kontrak.",
                color: "var(--color-info-600)",
            },
            {
                icon: <CreditCard className="h-6 w-6" />,
                title: "Deposit & Topup Cashless",
                description:
                    "Pelanggan dapat menyimpan saldo deposit di outlet dan melakukan topup saldo secara mandiri via payment gateway Midtrans.",
                color: "var(--color-info-500)",
            },
            {
                icon: <Bell className="h-6 w-6" />,
                title: "Notifikasi Sisa Kuota",
                description:
                    "Setiap transaksi pemotongan kuota dikonfirmasikan ke pelanggan melalui WhatsApp beserta informasi sisa kuota yang dapat digunakan.",
                color: "var(--color-info-500)",
            },
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Jurnal Akuntansi Otomatis",
                description:
                    "Penjualan paket, pemakaian kuota layanan harian, hingga kuota hangus dicatat otomatis dalam sistem akuntansi (journal entries).",
                color: "var(--color-info-600)",
            },
        ],
    },

    detailedSections: {
        badge: "Detail Cara Kerja Fitur",
        headline: "Menjaga Kepercayaan Pelanggan dengan Data Terbuka",
        subheadline: "Didukung dengan sistem yang mencatat setiap mutasi sisa kuota dan saldo secara transparan",
        accentColor: "var(--color-info-500)",
        sections: [
            {
                icon: <Gift className="h-8 w-8" />,
                title: "Sistem Paket Prabayar & Kuota",
                description:
                    "Tawarkan paket hemat kepada pelanggan untuk menjamin loyalitas jangka panjang. Tentukan jumlah kuota per jenis layanan laundry dan biarkan sistem memotong kuota tersebut secara digital saat order dibuat.",
                features: [
                    "Pembuatan paket dengan nama, harga, dan masa aktif kuota",
                    "Pengurangan sisa kuota otomatis di kasir saat order menggunakan paket",
                    "Pencatatan riwayat penggunaan kuota (Quota Usage Log)",
                    "Status pembayaran order otomatis ditandai paid_by_package"
                ],
                bgColor: "var(--color-info-500)",
            },
            {
                icon: <Award className="h-8 w-8" />,
                title: "Membership Plan & Kontrak Keanggotaan",
                description:
                    "Tingkatkan loyalitas dengan langganan membership berbayar. Atur paket member outlet yang memberikan diskon transaksi langsung dan gratis biaya pengiriman kurir laundry sesuai jatah kuota kontrak.",
                features: [
                    "Atur persentase diskon per tingkat membership plan",
                    "Pengaturan jatah gratis ongkir kurir (free shipping quota)",
                    "Masa aktif kontrak member dihitung akurat dari tanggal beli",
                    "Sistem otomatis mengunci diskon jika kontrak keanggotaan habis"
                ],
                bgColor: "var(--color-info-600)",
            },
            {
                icon: <CreditCard className="h-8 w-8" />,
                title: "Akun Pelanggan & Deposit Saldo",
                description:
                    "Permudah metode pembayaran nontunai pelanggan setia dengan sistem saldo deposit. Pelanggan dapat melakukan pengisian saldo secara mandiri untuk mempercepat transaksi di kasir.",
                features: [
                    "Penyimpanan deposit saldo per akun pelanggan",
                    "Pengisian saldo topup mandiri via payment gateway Midtrans",
                    "Penggunaan saldo deposit sebagai metode pembayaran order",
                    "Riwayat mutasi saldo deposit tercatat rapi di sistem"
                ],
                bgColor: "var(--color-info-500)",
            },
        ],
    },

    benefits: {
        headline: "Manfaat Riil bagi Bisnis Laundry Anda",
        badge: "Manfaat Bisnis",
        subheadline: "Dirancang untuk meningkatkan repeat order dan mempermudah administrasi",
        accentColor: "var(--color-info-500)",
        accentBg: "var(--color-info-50)",
        accentBorder: "var(--color-info-200)",
        items: [
            {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Repeat Order Terjaga",
                description: "Pelanggan cenderung terus kembali mencuci untuk menghabiskan kuota paket yang sudah dibeli.",
                benefits: [
                    "Mengamankan loyalitas pelanggan jangka panjang",
                    "Mengurangi risiko pelanggan berpindah ke kompetitor"
                ],
            },
            {
                icon: <Zap className="h-6 w-6" />,
                title: "Kasir Bebas Ribet",
                description: "Kasir tidak perlu menghitung sisa kuota di kertas, sistem memvalidasi sisa kuota secara otomatis.",
                benefits: [
                    "Mengurangi antrean transaksi pelanggan di outlet",
                    "Mencegah kebocoran akibat kesalahan tulis kuota manual"
                ],
            },
            {
                icon: <Heart className="h-6 w-6" />,
                title: "Kepercayaan Pelanggan",
                description: "Pelanggan merasa tenang karena sisa kuota dan saldo terekam transparan di aplikasi.",
                benefits: [
                    "Notifikasi sisa kuota terupdate dikirim langsung via WhatsApp",
                    "Riwayat pemakaian yang jelas jika pelanggan ingin mencocokkan data"
                ],
            },
            {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Pembukuan Keuangan Akurat",
                description: "Pendapatan paket dipetakan rapi dalam sistem jurnal akuntansi.",
                benefits: [
                    "Pemisahan penjualan paket dengan pemakaian harian riil",
                    "Pencatatan paket kedaluwarsa (breakage) sebagai pendapatan outlet"
                ],
            },
            {
                icon: <Award className="h-6 w-6" />,
                title: "Kontrol Keanggotaan Tepat",
                description: "Kontrak member kedaluwarsa secara otomatis sesuai durasi hari yang ditentukan.",
                benefits: [
                    "Mencegah jatah diskon dinikmati pelanggan setelah kontrak habis",
                    "Pengendalian jatah gratis ongkir kurir agar tidak disalahgunakan"
                ],
            },
            {
                icon: <DollarSign className="h-6 w-6" />,
                title: "Transaksi Nontunai Mudah",
                description: "Saldo deposit mempermudah kasir melayani transaksi tanpa kembalian.",
                benefits: [
                    "Pelanggan dapat melakukan pengisian saldo (topup) cashless",
                    "Mempercepat waktu pengerjaan administrasi harian kasir"
                ],
            },
        ],
    },

    comparison: {
        badge: "Perbandingan Metode",
        headline: "Pencatatan Manual vs Sistem WashWallet",
        subheadline: "Bandingkan kemudahan pengelolaan paket pelanggan di outlet",
        accentColor: "var(--color-info-500)",
        accentBg: "var(--color-info-50)",
        accentBorder: "var(--color-info-200)",
        rows: [
            {
                aspect: "Pencatatan Paket Kuota",
                manual: "Ditulis di kartu kertas atau spreadsheet, rawan hilang & sulit dicari saat antrean.",
                washwallet:
                    "Kuota tersimpan digital, divalidasi dan dikurangi otomatis saat kasir mencatat order.",
            },
            {
                aspect: "Benefit Diskon & Ongkir",
                manual: "Kasir harus menghafal member aktif dan menghitung potongan harga manual.",
                washwallet:
                    "Sistem mendeteksi kontrak membership aktif dan memotong nominal secara otomatis.",
            },
            {
                aspect: "Saldo Deposit Pelanggan",
                manual: "Menerima uang titipan pelanggan tanpa mutasi saldo yang rapi, rawan selisih kas.",
                washwallet:
                    "Uang tersimpan di saldo akun pelanggan, tercatat mutasi keluar-masuk secara digital.",
            },
            {
                aspect: "Pembukuan Keuangan",
                manual: "Uang paket dicatat sebagai omzet saat itu juga, membuat kas laporan bias.",
                washwallet:
                    "Jurnal memisahkan uang muka paket (package sale) dengan penggunaan riil (usage journal).",
            },
            {
                aspect: "Masa Berlaku Paket",
                manual: "Kasir meneliti tanggal kedaluwarsa secara manual pada buku catatan outlet.",
                washwallet:
                    "Kuota otomatis hangus (expired) saat masa berlaku terlewati tanpa perlu pengecekan manual.",
            },
            {
                aspect: "Data Keanggotaan",
                manual: "Tidak ada database, outlet tidak mengetahui pelanggan mana yang paling bernilai.",
                washwallet:
                    "Database customer merekam riwayat pembelian paket dan keanggotaan per outlet.",
            },
        ],
    },

    useCases: [
            {
                persona: "Outlet Laundry Kiloan",
            scenario:
                "Menjual paket cuci 10 kg kepada pelanggan reguler agar pelanggan kembali memakai layanan yang sama selama masa aktif paket.",
            outcome:
                "Repeat order lebih terjaga, sisa kuota terpotong otomatis saat transaksi, dan kasir tidak perlu mencatat kartu paket manual.",
            accentColor: "var(--color-info-500)",
        },
        {
            persona: "Laundry dengan Layanan Kurir",
            scenario:
                "Membuat membership berbayar yang memberi diskon transaksi serta jatah gratis ongkir untuk pelanggan yang sering pickup dan delivery.",
            outcome:
                "Benefit member diterapkan konsisten, penggunaan jatah ongkir tercatat, dan biaya kurir tetap terkendali.",
            accentColor: "var(--color-info-600)",
        },
        {
            persona: "Pelanggan Korporat atau Kost",
            scenario:
                "Mengisi deposit saldo untuk pembayaran nontunai rutin sehingga transaksi harian bisa langsung dipotong dari saldo pelanggan.",
            outcome:
                "Checkout lebih cepat, mutasi saldo transparan, dan pembukuan outlet lebih rapi karena setiap topup serta pemakaian tercatat.",
            accentColor: "var(--color-info-500)",
        },
    ],

    faqs: {
        badge: "Pertanyaan Umum",
        headline: "FAQ Membership & Paket Layanan",
        subheadline:
            "Jawaban seputar pengelolaan paket kuota dan membership laundry",
        accentColor: "var(--color-info-500)",
        accentBg: "var(--color-info-50)",
        accentBorder: "var(--color-info-200)",
        items: [
            {
                question: "Bagaimana cara membuat paket kuota layanan di WashWallet?",
                answer: "Melalui dashboard owner, Anda dapat membuat Service Package. Tentukan nama paket, harga jual, masa berlaku (hari), dan tambahkan jenis layanan laundry (misal: Cuci Lipat Kiloan 10 kg, Setrika Satuan 5 pcs). Pelanggan dapat membelinya sebagai paket berlangganan.",
            },
            {
                question: "Apakah sisa kuota pelanggan langsung terupdate saat transaksi?",
                answer: "Ya, betul. Saat kasir membuat order dengan metode pembayaran paket (paid_by_package), kasir memilih langganan aktif milik pelanggan tersebut. Sistem akan memotong sisa kuota layanan tersebut di database secara instan.",
            },
            {
                question: "Apa perbedaan antara Service Package dengan Membership Plan?",
                answer: "Service Package adalah kuota cucian prabayar (misal: beli 10 kali cuci di depan). Sedangkan Membership Plan adalah keanggotaan berbayar yang memberikan hak istimewa seperti potongan diskon (%) untuk setiap transaksi reguler dan jatah gratis ongkir (free shipping) dari kurir.",
            },
            {
                question: "Bagaimana pelanggan mengisi saldo deposit mereka?",
                answer: "Pelanggan dapat menitipkan pengisian saldo tunai lewat kasir outlet, atau melakukan pengisian saldo (topup) mandiri secara cashless via aplikasi pelanggan menggunakan payment gateway Midtrans.",
            },
            {
                question: "Bagaimana pembukuan mencatat kuota paket yang kedaluwarsa?",
                answer: "Jika masa berlaku paket habis dan kuota pelanggan masih tersisa, sistem akuntansi WashWallet akan mencatat jurnal penyesuaian (package breakage journal) untuk memindahkan sisa nilai paket tersebut menjadi pendapatan outlet.",
            },
        ],
    },

    ctaFinal: {
        badge: "Coba Sekarang",
        headline: "Bangun Alur Langganan Laundry yang Profesional",
        subheadline:
            "Kelola paket kuota, kontrak member, dan deposit pelanggan secara praktis dan transparan bersama WashWallet.",
        accentColor: "var(--color-info-500)",
        accentBg: "var(--color-info-50)",
        accentBorder: "var(--color-info-200)",
        primaryCtaText: "Mulai Free Trial",
        primaryCtaHref: "/register",
        secondaryCtaText: "Hubungi Tim Kami",
        whatsappNumber: "6281234567890",
        whatsappMessage:
            "Halo, saya ingin bertanya lebih lanjut mengenai fitur Paket & Membership di WashWallet.",
    },
};
