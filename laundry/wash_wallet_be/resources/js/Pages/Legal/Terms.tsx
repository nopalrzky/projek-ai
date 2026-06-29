import React from "react";
import { Head } from "@inertiajs/react";
import {
    Ban,
    BookOpen,
    Copyright,
    CreditCard,
    ExternalLink,
    FileText,
    Mail,
    RefreshCw,
    Scale,
    ShieldAlert,
    Sparkles,
    Users,
    Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/Components/Card";
import { cn } from "@/lib/utils";

const CONTACT = {
    org: "WashWallet",
    email: "support@washwallet.com",
    website: "https://washwallet.com",
};

type IconTone = "primary" | "info" | "success" | "accent" | "warning" | "danger";

type SummaryItem = {
    label: string;
    value: string;
    icon: LucideIcon;
    tone: IconTone;
};

type Section = {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone: IconTone;
    items: string[];
};

const iconToneClass: Record<IconTone, string> = {
    primary: "legal-icon",
    info: "legal-icon legal-icon-info",
    success: "legal-icon legal-icon-success",
    accent: "legal-icon legal-icon-accent",
    warning: "legal-icon legal-icon-warning",
    danger: "legal-icon legal-icon-danger",
};

const apps = [
    "WashWallet",
    "WashWallet Cashier",
    "WashWallet Production",
];

const summaryItems: SummaryItem[] = [
    {
        label: "Cakupan",
        value: "Seluruh aplikasi",
        icon: Sparkles,
        tone: "primary",
    },
    {
        label: "Transaksi",
        value: "Payment gateway",
        icon: CreditCard,
        tone: "success",
    },
    {
        label: "Operasional",
        value: "Best effort",
        icon: Wrench,
        tone: "info",
    },
    {
        label: "Hukum",
        value: "Indonesia",
        icon: Scale,
        tone: "accent",
    },
];

const sections: Section[] = [
    {
        id: "definitions",
        title: "Definisi",
        description:
            "Istilah utama yang digunakan dalam syarat dan ketentuan WashWallet.",
        icon: BookOpen,
        tone: "primary",
        items: [
            '"Platform" berarti WashWallet dan seluruh aplikasinya.',
            '"Customer" berarti pengguna aplikasi WashWallet Customer.',
            '"Employee" berarti pengguna WashWallet Cashier atau WashWallet Production.',
            '"Owner/Admin" berarti pengguna dashboard web WashWallet.',
        ],
    },
    {
        id: "user-responsibilities",
        title: "Tanggung Jawab Pengguna",
        description:
            "Kewajiban customer dan employee saat menggunakan akun pribadi maupun akun kerja.",
        icon: Users,
        tone: "info",
        items: [
            "Customer wajib memberikan informasi akun yang akurat dan terkini.",
            "Customer wajib menjaga kerahasiaan akun dan password.",
            "Customer tidak boleh menyalahgunakan layanan untuk aktivitas penipuan, aktivitas ilegal, atau tindakan yang merugikan pihak lain.",
            "Customer bertanggung jawab sepenuhnya atas semua aktivitas yang dilakukan dari akun miliknya.",
            "Employee menggunakan akun kerja yang diberikan oleh organisasi atau outlet tempat bekerja.",
            "Employee bertanggung jawab atas aktivitas yang dilakukan menggunakan akun kerjanya.",
            "Employee wajib mengikuti seluruh kebijakan operasional outlet dan organisasi yang berwenang.",
            "Employee memahami bahwa akun kerja bukan akun pribadi, sehingga pengelolaan akun berada di tangan administrator.",
        ],
    },
    {
        id: "payments",
        title: "Pembayaran",
        description:
            "Ketentuan pembayaran, harga layanan, topup, deposit, dan peran payment gateway pihak ketiga.",
        icon: CreditCard,
        tone: "success",
        items: [
            "Pembayaran diproses melalui metode yang tersedia di platform, termasuk Midtrans, virtual account, QRIS, e-wallet, dan metode lain yang tersedia.",
            "Harga layanan laundry ditentukan sepenuhnya oleh masing-masing outlet laundry mitra, bukan oleh WashWallet.",
            "WashWallet bertindak sebagai platform teknologi yang memfasilitasi transaksi antara Customer dan Outlet.",
            "Transaksi melalui payment gateway pihak ketiga mengikuti ketentuan provider terkait.",
            "Topup saldo atau deposit customer diproses melalui mekanisme resmi yang tersedia di aplikasi.",
        ],
    },
    {
        id: "availability",
        title: "Ketersediaan Layanan dan Maintenance",
        description:
            "Prinsip ketersediaan layanan, maintenance, dan batasan terkait waktu henti sistem.",
        icon: Wrench,
        tone: "accent",
        items: [
            "Platform berusaha menjaga ketersediaan layanan dengan upaya terbaik atau best effort basis.",
            "Maintenance terjadwal atau tidak terjadwal dapat dilakukan dan mungkin menyebabkan gangguan layanan sementara.",
            "WashWallet tidak memberikan jaminan ketersediaan layanan 100% tanpa downtime.",
        ],
    },
    {
        id: "prohibited-use",
        title: "Larangan Penggunaan",
        description:
            "Aktivitas yang dilarang karena dapat merusak keamanan platform atau merugikan pihak lain.",
        icon: Ban,
        tone: "danger",
        items: [
            "Dilarang melakukan akses tidak sah ke sistem, reverse engineering, atau scraping massal.",
            "Dilarang memberikan informasi palsu atau menyesatkan saat menggunakan platform.",
            "Dilarang menggunakan platform untuk aktivitas penipuan atau pencucian uang.",
            "Pelanggaran terhadap larangan ini dapat mengakibatkan penonaktifan akun secara sepihak dan pelaporan ke pihak berwajib.",
        ],
    },
    {
        id: "intellectual-property",
        title: "Hak Kekayaan Intelektual",
        description:
            "Kepemilikan dan batasan penggunaan konten, desain, logo, serta fitur platform.",
        icon: Copyright,
        tone: "primary",
        items: [
            "Seluruh konten, desain, logo, dan fitur platform adalah milik WashWallet atau pemegang lisensi resmi.",
            "User tidak diperbolehkan menyalin, mendistribusikan, mereproduksi, atau memodifikasi konten platform tanpa izin tertulis dari WashWallet.",
        ],
    },
    {
        id: "liability",
        title: "Batasan Tanggung Jawab",
        description:
            "Batas tanggung jawab WashWallet atas kerugian, gangguan pihak ketiga, dan konsekuensi penggunaan layanan.",
        icon: ShieldAlert,
        tone: "warning",
        items: [
            "WashWallet tidak bertanggung jawab atas kerugian tidak langsung atau konsekuensial yang dialami oleh pengguna.",
            "WashWallet tidak bertanggung jawab atas kerugian yang timbul akibat kegagalan layanan pihak ketiga, termasuk gangguan payment gateway.",
            "Tanggung jawab maksimum WashWallet terbatas sesuai dengan hukum yang berlaku di Indonesia.",
            "Informasi umum ini tunduk pada hukum perikatan dan perlindungan konsumen.",
        ],
    },
    {
        id: "changes",
        title: "Perubahan Syarat dan Ketentuan",
        description:
            "Bagaimana perubahan syarat dan ketentuan diumumkan kepada pengguna.",
        icon: RefreshCw,
        tone: "info",
        items: [
            "WashWallet berhak mengubah Syarat dan Ketentuan ini sewaktu-waktu.",
            "Setiap perubahan akan diumumkan di halaman ini.",
            "Penggunaan platform yang berkelanjutan setelah perubahan dianggap menyetujui syarat dan ketentuan yang baru.",
        ],
    },
    {
        id: "law",
        title: "Hukum yang Berlaku",
        description:
            "Dasar hukum yang digunakan untuk menafsirkan syarat dan ketentuan ini.",
        icon: Scale,
        tone: "accent",
        items: [
            "Syarat dan ketentuan ini tunduk pada dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia.",
        ],
    },
];

const IconBadge = ({
    icon: Icon,
    tone = "primary",
    className,
}: {
    icon: LucideIcon;
    tone?: IconTone;
    className?: string;
}) => (
    <span
        className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)]",
            iconToneClass[tone],
            className,
        )}
    >
        <Icon className="h-5 w-5" />
    </span>
);

const Terms: React.FC = () => (
    <>
        <Head title="Syarat dan Ketentuan - WashWallet" />

        <GuestLayout showNavigation showFooter isFullWidth>
            <div className="legal-page-shell">
                <section className="container mx-auto px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-16 lg:pt-14">
                    <div className="legal-hero-panel overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-8 lg:p-10">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
                            <div>
                                <Badge
                                    variant="outline"
                                    size="sm"
                                    rounded="full"
                                    leftIcon={<FileText className="h-4 w-4" />}
                                    className="border-[var(--color-primary-500)]/30 bg-[var(--color-surface)] text-[var(--color-primary-700)]"
                                >
                                    Berlaku sejak 23 Juni 2026
                                </Badge>

                                <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-normal text-text-primary sm:text-5xl lg:text-6xl">
                                    Syarat dan Ketentuan Penggunaan WashWallet
                                </h1>

                                <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
                                    Ketentuan ini mengatur penggunaan seluruh layanan
                                    WashWallet, termasuk aplikasi customer, cashier,
                                    production, dan dashboard operasional outlet.
                                </p>

                                <div className="mt-7 flex flex-wrap gap-3">
                                    {apps.map((app) => (
                                        <Badge
                                            key={app}
                                            variant="secondary"
                                            size="sm"
                                            rounded="md"
                                            className="border-[var(--color-secondary-200)]"
                                        >
                                            {app}
                                        </Badge>
                                    ))}
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        href="#user-responsibilities"
                                        variant="primary"
                                        leftIcon={<Users className="h-4 w-4" />}
                                    >
                                        Lihat Tanggung Jawab
                                    </Button>
                                    <Button
                                        href="/privacy"
                                        variant="outline"
                                        rightIcon={<ExternalLink className="h-4 w-4" />}
                                    >
                                        Kebijakan Privasi
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {summaryItems.map((item) => (
                                    <Card
                                        key={item.label}
                                        variant="elevated"
                                        className="rounded-[var(--radius-lg)]"
                                    >
                                        <CardContent className="space-y-4 p-4">
                                            <IconBadge icon={item.icon} tone={item.tone} />
                                            <div>
                                                <p className="text-sm text-text-secondary">
                                                    {item.label}
                                                </p>
                                                <p className="mt-1 text-lg font-semibold text-text-primary">
                                                    {item.value}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="container mx-auto px-4 pb-16 sm:px-6 lg:px-8">
                    <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
                        <aside className="hidden lg:sticky lg:top-28 lg:block">
                            <Card variant="default">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Daftar Isi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {sections.map((section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            className="legal-nav-link flex rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                                        >
                                            {section.title}
                                        </a>
                                    ))}
                                    <a
                                        href="#contact"
                                        className="legal-nav-link flex rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                                    >
                                        Kontak
                                    </a>
                                </CardContent>
                            </Card>
                        </aside>

                        <div className="space-y-6">
                            <Card variant="elevated" className="legal-callout">
                                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
                                    <IconBadge icon={Scale} tone="info" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-text-primary">
                                            Ketentuan berlaku untuk seluruh ekosistem
                                        </h2>
                                        <p className="mt-2 leading-7 text-text-secondary">
                                            Dengan menggunakan aplikasi WashWallet, pengguna
                                            dianggap memahami dan menyetujui ketentuan yang
                                            mengatur akun, transaksi, operasional, dan batas
                                            penggunaan platform.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {sections.map((section) => (
                                <Card
                                    key={section.id}
                                    id={section.id}
                                    variant="default"
                                    className="scroll-mt-28"
                                >
                                    <CardHeader className="border-b border-[var(--color-border)]">
                                        <div className="flex flex-col gap-4 sm:flex-row">
                                            <IconBadge
                                                icon={section.icon}
                                                tone={section.tone}
                                            />
                                            <div>
                                                <CardTitle className="text-2xl">
                                                    {section.title}
                                                </CardTitle>
                                                <p className="mt-2 leading-7 text-text-secondary">
                                                    {section.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-[var(--color-border)]">
                                            {section.items.map((item, index) => (
                                                <div
                                                    key={item}
                                                    className="grid gap-4 p-5 sm:grid-cols-[2rem_minmax(0,1fr)] sm:p-6"
                                                >
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-sm font-semibold text-text-secondary">
                                                        {index + 1}
                                                    </span>
                                                    <p className="leading-7 text-text-secondary">
                                                        {item}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Card id="contact" variant="elevated" className="legal-contact-panel scroll-mt-28">
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex gap-4">
                                            <IconBadge icon={Mail} tone="primary" />
                                            <div>
                                                <h2 className="text-2xl font-semibold text-text-primary">
                                                    Hubungi Kami
                                                </h2>
                                                <p className="mt-2 max-w-2xl leading-7 text-text-secondary">
                                                    Untuk pertanyaan mengenai Syarat dan
                                                    Ketentuan ini, hubungi tim support
                                                    WashWallet.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            href={`mailto:${CONTACT.email}`}
                                            external
                                            variant="primary"
                                            leftIcon={<Mail className="h-4 w-4" />}
                                            className="shrink-0"
                                        >
                                            Email Support
                                        </Button>
                                    </div>

                                    <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                            <p className="text-sm text-text-secondary">
                                                Organisasi
                                            </p>
                                            <p className="mt-1 font-semibold text-text-primary">
                                                {CONTACT.org}
                                            </p>
                                        </div>
                                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                            <p className="text-sm text-text-secondary">
                                                Email
                                            </p>
                                            <a
                                                href={`mailto:${CONTACT.email}`}
                                                className="mt-1 block break-words font-semibold text-[var(--color-primary-700)] hover:underline"
                                            >
                                                {CONTACT.email}
                                            </a>
                                        </div>
                                        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                                            <p className="text-sm text-text-secondary">
                                                Website
                                            </p>
                                            <a
                                                href={CONTACT.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1 block break-words font-semibold text-[var(--color-primary-700)] hover:underline"
                                            >
                                                {CONTACT.website}
                                            </a>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>
            </div>
        </GuestLayout>
    </>
);

export default Terms;
