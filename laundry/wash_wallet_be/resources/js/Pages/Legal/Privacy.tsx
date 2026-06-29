import React from "react";
import { Head } from "@inertiajs/react";
import {
    Bell,
    Clock,
    Database,
    ExternalLink,
    FileCheck2,
    Globe2,
    LockKeyhole,
    Mail,
    MapPinned,
    ShieldCheck,
    Smartphone,
    UserRound,
    UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Badge } from "@/Components/Badge";
import { Button } from "@/Components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/Card";
import { cn } from "@/lib/utils";

const CONTACT = {
    org: "WashWallet",
    email: "support@washwallet.com",
    website: "https://washwallet.id",
};

type IconTone = "primary" | "info" | "success" | "accent";

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

type ThirdPartyService = {
    name: string;
    purpose: string;
    icon: LucideIcon;
    tone: IconTone;
};

const iconToneClass: Record<IconTone, string> = {
    primary: "legal-icon",
    info: "legal-icon legal-icon-info",
    success: "legal-icon legal-icon-success",
    accent: "legal-icon legal-icon-accent",
};

const apps = ["WashWallet", "WashWallet Cashier", "WashWallet Production"];

const summaryItems: SummaryItem[] = [
    {
        label: "Cakupan",
        value: "3 aplikasi",
        icon: Smartphone,
        tone: "primary",
    },
    {
        label: "Akses",
        value: "Publik",
        icon: Globe2,
        tone: "info",
    },
    {
        label: "Keamanan",
        value: "Role-based",
        icon: ShieldCheck,
        tone: "success",
    },
    {
        label: "Retensi",
        value: "Berbasis kebutuhan",
        icon: Clock,
        tone: "accent",
    },
];

const sections: Section[] = [
    {
        id: "data-customer",
        title: "Data Customer",
        description:
            "Data yang dibutuhkan untuk akun, alamat, order, pickup, delivery, pembayaran, topup, dan review.",
        icon: UserRound,
        tone: "primary",
        items: [
            "Informasi akun seperti nama, nomor telepon, email, gender, tanggal lahir opsional, avatar opsional, password terenkripsi, status verifikasi, status aktif, last login, dan FCM token.",
            "Informasi alamat seperti label alamat, nama dan nomor penerima, alamat lengkap, catatan alamat, latitude, longitude, dan status alamat utama.",
            "Informasi transaksi seperti order laundry, status order, item order, invoice, metode pembayaran, topup customer, deposit balance, dan riwayat transaksi.",
            "Informasi pickup dan delivery seperti tipe layanan, alamat pickup atau delivery, jadwal, biaya, dan instruksi khusus.",
            "Review dan feedback seperti rating, komentar, nama customer, dan status publikasi review.",
        ],
    },
    {
        id: "data-employee",
        title: "Data Employee dan Owner",
        description:
            "Data akun kerja, operasional outlet, role, permission, dan aktivitas bisnis yang mendukung aplikasi cashier dan production.",
        icon: UsersRound,
        tone: "info",
        items: [
            "Informasi employee seperti nama, username, nomor telepon, alamat, gender, tanggal lahir, avatar, password terenkripsi, PIN terenkripsi, status aktif, tanggal mulai, outlet, posisi, role, permission, dan last login.",
            "Informasi perangkat employee seperti FCM token, device id, device name, dan waktu terakhir digunakan.",
            "Informasi operasional seperti aktivitas kasir, produksi, kurir, status pekerjaan, pickup atau delivery activity, order item process, work log, payroll, commission, fine, dan loan jika fitur terkait digunakan.",
            "Informasi owner atau admin seperti nama, username, email, phone, address, role, permission, outlet yang dikelola, wallet, coin, reward balance, rekening withdrawal, accounting, dan transaksi bisnis outlet.",
        ],
    },
    {
        id: "media-location",
        title: "Media, Lokasi, dan Perangkat",
        description:
            "Data teknis yang digunakan untuk bukti operasional, pencarian outlet, notifikasi, keamanan, dan diagnostic.",
        icon: MapPinned,
        tone: "success",
        items: [
            "Media dan attachment seperti avatar, foto bukti pickup, foto bukti kedatangan atau pengantaran, foto bukti timbang, evidence proses produksi, serta attachment transaksi jika fitur terkait digunakan.",
            "Data lokasi seperti latitude dan longitude outlet, latitude dan longitude alamat customer, serta koordinat yang dikirim aplikasi untuk menemukan outlet terdekat dan menghitung biaya pickup atau delivery.",
            "WashWallet tidak mengklaim melakukan tracking lokasi real-time terus-menerus.",
            "Data perangkat, log, dan diagnostik seperti FCM token, device id, device name, user agent, IP address pada OTP, log aplikasi, log server, dan diagnostic information.",
        ],
    },
    {
        id: "usage-security",
        title: "Penggunaan, Keamanan, dan Retensi",
        description:
            "Cara WashWallet menggunakan, melindungi, menyimpan, dan mengelola hak pengguna atas data pribadi.",
        icon: LockKeyhole,
        tone: "accent",
        items: [
            "Data digunakan untuk membuat dan mengelola akun, memproses order, mengelola transaksi, mengirim notifikasi, menghitung biaya layanan, menampilkan outlet terdekat, menyediakan pickup dan delivery, memberikan support, meningkatkan layanan, menjaga keamanan, dan memenuhi kewajiban hukum.",
            "Password dan PIN disimpan dalam bentuk terenkripsi. Akses data dibatasi sesuai role dan permission yang relevan.",
            "Data akun disimpan selama akun aktif. Data transaksi dapat disimpan lebih lama untuk kebutuhan operasional, audit, accounting, kewajiban hukum, penyelesaian sengketa, pencegahan fraud, dan keamanan sistem.",
            "Pengguna dapat meminta akses, pembaruan, koreksi, atau penghapusan akun melalui tim support sesuai proses yang tersedia.",
        ],
    },
];

const thirdPartyServices: ThirdPartyService[] = [
    {
        name: "Firebase Cloud Messaging",
        purpose: "Push notification untuk customer dan employee.",
        icon: Bell,
        tone: "primary",
    },
    {
        name: "Google Maps Platform",
        purpose:
            "Layanan lokasi, perhitungan jarak, outlet terdekat, dan biaya pickup atau delivery.",
        icon: MapPinned,
        tone: "info",
    },
    {
        name: "Midtrans",
        purpose:
            "Payment gateway untuk pembayaran order, topup, QRIS, e-wallet, dan virtual account.",
        icon: FileCheck2,
        tone: "success",
    },
    {
        name: "Fonnte",
        purpose: "WhatsApp notification dan OTP WhatsApp.",
        icon: Mail,
        tone: "accent",
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

const Privacy: React.FC = () => (
    <>
        <Head title="Kebijakan Privasi - WashWallet" />

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
                                    leftIcon={
                                        <ShieldCheck className="h-4 w-4" />
                                    }
                                    className="border-[var(--color-primary-500)]/30 bg-[var(--color-surface)] text-[var(--color-primary-700)]"
                                >
                                    Berlaku sejak 23 Juni 2026
                                </Badge>

                                <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-normal text-text-primary sm:text-5xl lg:text-6xl">
                                    Kebijakan Privasi WashWallet
                                </h1>

                                <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
                                    Kebijakan ini menjelaskan bagaimana
                                    WashWallet mengumpulkan, menggunakan,
                                    melindungi, dan menyimpan data dalam satu
                                    ekosistem aplikasi laundry untuk customer,
                                    cashier, production, owner, dan admin.
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
                                        href="#data-customer"
                                        variant="primary"
                                        leftIcon={
                                            <Database className="h-4 w-4" />
                                        }
                                    >
                                        Lihat Data yang Dikumpulkan
                                    </Button>
                                    <Button
                                        href="/account-deletion"
                                        variant="outline"
                                        rightIcon={
                                            <ExternalLink className="h-4 w-4" />
                                        }
                                    >
                                        Penghapusan Akun
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
                                            <IconBadge
                                                icon={item.icon}
                                                tone={item.tone}
                                            />
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
                                        href="#third-party"
                                        className="legal-nav-link flex rounded-[var(--radius-md)] border px-3 py-2 text-sm"
                                    >
                                        Layanan Pihak Ketiga
                                    </a>
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
                                    <IconBadge icon={Globe2} tone="info" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-text-primary">
                                            Satu kebijakan untuk seluruh
                                            ekosistem
                                        </h2>
                                        <p className="mt-2 leading-7 text-text-secondary">
                                            WashWallet, WashWallet Cashier, dan
                                            WashWallet Production memakai
                                            backend dan database yang sama.
                                            Karena itu, kebijakan ini berlaku
                                            untuk seluruh layanan WashWallet
                                            yang saling terhubung.
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
                                            {section.items.map(
                                                (item, index) => (
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
                                                ),
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <Card
                                id="third-party"
                                variant="default"
                                className="scroll-mt-28"
                            >
                                <CardHeader>
                                    <div className="flex flex-col gap-4 sm:flex-row">
                                        <IconBadge
                                            icon={ExternalLink}
                                            tone="primary"
                                        />
                                        <div>
                                            <CardTitle className="text-2xl">
                                                Layanan Pihak Ketiga
                                            </CardTitle>
                                            <p className="mt-2 leading-7 text-text-secondary">
                                                Beberapa fitur WashWallet
                                                terhubung dengan layanan pihak
                                                ketiga. Setiap layanan dapat
                                                memiliki kebijakan privasi
                                                masing-masing.
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {thirdPartyServices.map((service) => (
                                            <div
                                                key={service.name}
                                                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                                            >
                                                <IconBadge
                                                    icon={service.icon}
                                                    tone={service.tone}
                                                    className="mb-4"
                                                />
                                                <h3 className="text-lg font-semibold text-text-primary">
                                                    {service.name}
                                                </h3>
                                                <p className="mt-2 leading-7 text-text-secondary">
                                                    {service.purpose}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                id="contact"
                                variant="elevated"
                                className="legal-contact-panel scroll-mt-28"
                            >
                                <CardContent className="p-6 sm:p-8">
                                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="flex gap-4">
                                            <IconBadge
                                                icon={Mail}
                                                tone="primary"
                                            />
                                            <div>
                                                <h2 className="text-2xl font-semibold text-text-primary">
                                                    Hubungi Kami
                                                </h2>
                                                <p className="mt-2 max-w-2xl leading-7 text-text-secondary">
                                                    Untuk pertanyaan terkait
                                                    privasi, koreksi data, atau
                                                    permintaan terkait data
                                                    pribadi, hubungi tim support
                                                    WashWallet.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            href={`mailto:${CONTACT.email}`}
                                            external
                                            variant="primary"
                                            leftIcon={
                                                <Mail className="h-4 w-4" />
                                            }
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

export default Privacy;
