import React from "react";
import { Head } from "@inertiajs/react";
import {
    Briefcase,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    Info,
    Mail,
    Save,
    ShieldCheck,
    Trash2,
    UserCheck,
    UserX,
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

const summaryItems: SummaryItem[] = [
    {
        label: "Pemohon",
        value: "Customer",
        icon: UserCheck,
        tone: "primary",
    },
    {
        label: "Kanal",
        value: "Email support",
        icon: Mail,
        tone: "info",
    },
    {
        label: "Verifikasi",
        value: "Wajib",
        icon: ShieldCheck,
        tone: "success",
    },
    {
        label: "SLA",
        value: "30 hari",
        icon: Clock,
        tone: "accent",
    },
];

const sections: Section[] = [
    {
        id: "customer-request",
        title: "Cara Meminta Penghapusan Akun Customer",
        description:
            "Langkah resmi bagi pengguna aplikasi WashWallet Customer untuk mengajukan penghapusan akun.",
        icon: Mail,
        tone: "primary",
        items: [
            `Kirim email ke ${CONTACT.email}.`,
            'Gunakan subjek email "Account Deletion Request".',
            "Sertakan nomor telepon yang terdaftar di akun WashWallet.",
            "Sertakan email yang terdaftar jika ada.",
            "Sertakan nama lengkap untuk kebutuhan verifikasi identitas.",
            "Tim support akan memverifikasi permintaan Anda dan menghubungi Anda untuk konfirmasi.",
            "Proses penghapusan diselesaikan maksimal dalam 30 hari kalender sejak permintaan valid dan terverifikasi diterima.",
        ],
    },
    {
        id: "employee-accounts",
        title: "Akun Employee WashWallet Cashier dan Production",
        description:
            "Akun kerja dikelola oleh outlet atau administrator, sehingga proses penonaktifan mengikuti struktur organisasi.",
        icon: Briefcase,
        tone: "info",
        items: [
            "Akun pada WashWallet Cashier dan WashWallet Production adalah akun kerja yang dikelola oleh masing-masing outlet laundry.",
            "Akun kerja dibuat, dikelola, dan dihentikan oleh administrator outlet atau administrator sistem.",
            "Untuk penonaktifan atau penghapusan akun kerja, employee dapat menghubungi administrator outlet tempat bekerja.",
            "Employee juga dapat menghubungi administrator sistem WashWallet yang bertanggung jawab atas outlet tersebut.",
            `Jika perlu eskalasi, employee dapat menghubungi tim support WashWallet melalui ${CONTACT.email}.`,
        ],
    },
    {
        id: "deleted-data",
        title: "Data yang Dapat Dihapus atau Dianonimkan",
        description:
            "Kategori data yang akan dihapus atau dianonimkan setelah permintaan valid diproses.",
        icon: Trash2,
        tone: "danger",
        items: [
            "Akun pengguna, termasuk informasi akun dan kredensial login.",
            "Data profil seperti nama, email, nomor telepon, gender, tanggal lahir, dan avatar.",
            "Alamat tersimpan.",
            "Token perangkat seperti FCM token.",
            "Data sesi aktif.",
        ],
    },
    {
        id: "retained-data",
        title: "Data yang Mungkin Tetap Disimpan",
        description:
            "Beberapa data dapat tetap disimpan karena kebutuhan operasional, akuntansi, sengketa, keamanan, atau kewajiban hukum.",
        icon: Save,
        tone: "warning",
        items: [
            "Riwayat transaksi dan order laundry.",
            "Invoice dan payment record atau catatan pembayaran.",
            "Data audit dan log sistem.",
            "Data yang diperlukan untuk penyelesaian sengketa atau dispute resolution.",
            "Data yang wajib disimpan menurut peraturan hukum yang berlaku.",
        ],
    },
    {
        id: "retention-reasons",
        title: "Alasan Penyimpanan Data Tertentu",
        description:
            "Dasar penyimpanan sebagian data setelah akun dihapus atau dinonaktifkan.",
        icon: FileText,
        tone: "accent",
        items: [
            "Keperluan audit internal.",
            "Kewajiban hukum dan perpajakan, termasuk riwayat transaksi.",
            "Keperluan akuntansi dan pembukuan bisnis outlet mitra.",
            "Penyelesaian sengketa atau dispute resolution.",
            "Pencegahan penipuan atau fraud prevention.",
            "Menjaga keamanan dan integritas sistem.",
        ],
    },
    {
        id: "timeline",
        title: "Estimasi Waktu Proses",
        description:
            "Estimasi waktu penyelesaian setelah permintaan valid diterima dan berhasil diverifikasi.",
        icon: Clock,
        tone: "success",
        items: [
            "Penghapusan data diproses dalam waktu maksimal 30 hari kalender sejak permintaan valid diterima dan diverifikasi.",
            "WashWallet akan menginformasikan status proses penghapusan melalui email support.",
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

const AccountDeletion: React.FC = () => (
    <>
        <Head title="Penghapusan Akun - WashWallet" />

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
                                    leftIcon={<UserX className="h-4 w-4" />}
                                    className="border-[var(--color-error-500)]/30 bg-[var(--color-surface)] text-[var(--color-error-600)]"
                                >
                                    Hak penghapusan akun
                                </Badge>

                                <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight tracking-normal text-text-primary sm:text-5xl lg:text-6xl">
                                    Penghapusan Akun WashWallet
                                </h1>

                                <p className="mt-5 max-w-3xl text-base leading-8 text-text-secondary sm:text-lg">
                                    WashWallet menghormati hak pengguna atas data pribadi.
                                    Halaman ini menjelaskan cara mengajukan penghapusan akun,
                                    proses verifikasi, data yang dihapus, dan data yang tetap
                                    dapat disimpan karena kewajiban tertentu.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <Button
                                        href={`mailto:${CONTACT.email}?subject=Account%20Deletion%20Request`}
                                        external
                                        variant="primary"
                                        leftIcon={<Mail className="h-4 w-4" />}
                                    >
                                        Minta Penghapusan
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
                                    <IconBadge icon={Info} tone="info" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-text-primary">
                                            Permintaan harus diverifikasi terlebih dahulu
                                        </h2>
                                        <p className="mt-2 leading-7 text-text-secondary">
                                            Penghapusan akun hanya diproses setelah informasi
                                            pemohon valid. Verifikasi ini membantu melindungi
                                            akun dari permintaan tidak sah.
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

                            <Card variant="elevated">
                                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
                                    <IconBadge icon={CheckCircle2} tone="success" />
                                    <div>
                                        <h2 className="text-lg font-semibold text-text-primary">
                                            Data transaksi bisa tetap disimpan
                                        </h2>
                                        <p className="mt-2 leading-7 text-text-secondary">
                                            Penghapusan akun tidak selalu berarti seluruh catatan
                                            transaksi ikut dihapus. Beberapa data tetap diperlukan
                                            untuk audit, pembukuan, sengketa, keamanan, dan
                                            kewajiban hukum.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

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
                                                    Untuk pertanyaan lebih lanjut mengenai
                                                    penghapusan akun, hubungi tim support
                                                    WashWallet.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            href={`mailto:${CONTACT.email}?subject=Account%20Deletion%20Request`}
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

export default AccountDeletion;
