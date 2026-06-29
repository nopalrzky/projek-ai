import GuestLayout from "@/Layouts/GuestLayout";
import { Card, CardContent } from "@/Components/Card/Card";
import Button from "@/Components/Button/Button";
import {
    Heart,
    Target,
    Users,
    Handshake,
    TrendingUp,
    ArrowRight,
    Sparkles,
    MapPin,
    Calendar,
    Zap,
    Award,
    Shield,
    Rocket,
    CheckCircle2,
    Star,
    Building2,
    Globe,
    Lightbulb,
} from "lucide-react";

const About = () => {
    const whyWashwallet = [
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Solusi Lengkap",
            description:
                "Dari kasir, stok, keuangan, hingga HR & Payroll dalam satu sistem terpadu.",
            color: "var(--color-primary-500)",
        },
        {
            icon: <Shield className="w-8 h-8" />,
            title: "Terpercaya & Aman",
            description:
                "Data bisnis kamu aman dengan enkripsi dan backup otomatis harian.",
            color: "var(--color-info-500)",
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Support 24/7",
            description:
                "Tim kami siap bantu kapan saja. Bukan cuma vendor, tapi partner bisnis!",
            color: "var(--color-success-500)",
        },
        {
            icon: <TrendingUp className="w-8 h-8" />,
            title: "Berkembang Bersama",
            description:
                "Kami berkomitmen menemani pertumbuhan bisnis laundry kamu langkah demi langkah.",
            color: "var(--color-warning-500)",
        },
    ];

    const visionMission = [
        {
            icon: <Target className="w-10 h-10" />,
            label: "Visi",
            title: "Meningkatkan Daya Saing Industri Laundry Indonesia",
            description:
                "Membawa industri laundry Indonesia ke level global dengan teknologi modern dan sistem yang efisien. Kami percaya, dengan tools yang tepat, laundry lokal bisa bersaing bahkan lebih unggul dari kompetitor internasional.",
            color: "var(--color-primary-600)",
            bgColor: "var(--color-primary-50)",
        },
        {
            icon: <Heart className="w-10 h-10" />,
            label: "Misi",
            title: "Membuat Mitra Kami Senang & Sukses",
            description:
                "Sesuai dengan nama badan hukum kami PT. Anda Puas Kami Senang, fokus utama kami adalah kepuasan dan kesuksesan para owner laundry. Kami tidak hanya menyediakan software, tapi solusi yang benar-benar membantu bisnis kamu berkembang.",
            color: "var(--color-success-600)",
            bgColor: "var(--color-success-50)",
        },
    ];

    const coreValues = [
        {
            icon: <Handshake className="w-6 h-6" />,
            title: "Partnership",
            description:
                "Bukan vendor, tapi mitra strategis untuk kesuksesanmu.",
        },
        {
            icon: <Lightbulb className="w-6 h-6" />,
            title: "Inovasi",
            description:
                "Terus berinovasi untuk solusi terbaik industri laundry.",
        },
        {
            icon: <Award className="w-6 h-6" />,
            title: "Kualitas",
            description: "Komitmen pada kualitas sistem dan layanan terbaik.",
        },
        {
            icon: <Globe className="w-6 h-6" />,
            title: "Visi Makro",
            description:
                "Fokus pada pertumbuhan industri laundry Indonesia secara keseluruhan.",
        },
    ];

    const milestones = [
        {
            year: "2025",
            icon: <Rocket className="w-6 h-6" />,
            title: "Lahirnya Washwallet",
            description:
                "Berawal dari Surabaya, kami hadir untuk merevolusi cara owner laundry mengelola bisnis mereka.",
            color: "var(--color-primary-500)",
        },
        {
            year: "2025",
            icon: <Users className="w-6 h-6" />,
            title: "Bergabung dengan Mitra Pertama",
            description:
                "Kepercayaan owner laundry adalah aset berharga bagi kami untuk terus berkembang.",
            color: "var(--color-success-500)",
        },
        {
            year: "Masa Depan",
            icon: <Star className="w-6 h-6" />,
            title: "Ekspansi Nasional",
            description:
                "Target kami: menjadi sistem #1 pilihan owner laundry di seluruh Indonesia!",
            color: "var(--color-warning-500)",
        },
    ];

    return (
        <GuestLayout>
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4 sm:px-6">
                {/* Dynamic Gradient Background */}
                <div
                    className="absolute inset-0 transition-all duration-500"
                    style={{
                        background: `
                            radial-gradient(circle at 25% 35%, var(--color-primary-100) 0%, transparent 50%),
                            radial-gradient(circle at 75% 65%, var(--color-success-100) 0%, transparent 50%),
                            radial-gradient(circle at 50% 85%, var(--color-accent-50) 0%, transparent 40%),
                            linear-gradient(135deg, var(--color-background) 0%, var(--color-gray-50) 100%)
                        `,
                    }}
                />

                {/* Floating Icons */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 15 }, (_, i) => (
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
                            {i % 3 === 0 ? (
                                <Heart
                                    className="w-6 h-6 opacity-15"
                                    style={{
                                        color: "var(--color-primary-400)",
                                    }}
                                />
                            ) : i % 3 === 1 ? (
                                <Star
                                    className="w-6 h-6 opacity-15"
                                    style={{
                                        color: "var(--color-success-400)",
                                    }}
                                />
                            ) : (
                                <Sparkles
                                    className="w-6 h-6 opacity-15"
                                    style={{
                                        color: "var(--color-warning-400)",
                                    }}
                                />
                            )}
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
                            <Heart
                                className="w-5 h-5 animate-pulse"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                            <span
                                className="text-sm font-bold"
                                style={{ color: "var(--color-primary-700)" }}
                            >
                                Tentang Kami
                            </span>
                        </div>

                        {/* Main Headline */}
                        <h1
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight mb-6 text-balance"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Aset Berharga untuk{" "}
                            <span className="relative inline-block">
                                <span
                                    className="relative z-10"
                                    style={{
                                        backgroundImage: `linear-gradient(135deg, var(--color-primary-500), var(--color-success-500))`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    Pengusaha Laundry
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
                            Bukan sekadar aplikasi, tapi{" "}
                            <strong>sistem lengkap</strong> yang membantu owner
                            laundry di Indonesia mengelola dan mengembangkan
                            bisnis mereka. Bersama{" "}
                            <strong
                                style={{ color: "var(--color-primary-600)" }}
                            >
                                Washwallet
                            </strong>
                            , mari kita tingkatkan industri laundry Indonesia!
                            🚀
                        </p>

                        {/* Location & Year Info */}
                        <div className="flex flex-wrap gap-4 justify-center mb-10">
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <MapPin
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Surabaya, Indonesia
                                </span>
                            </div>
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-sm border"
                                style={{
                                    backgroundColor: "var(--color-surface)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <Calendar
                                    className="w-5 h-5"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                                <span
                                    className="font-semibold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Berdiri 2025
                                </span>
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
                                Bergabung Sekarang!
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        </Button>

                        {/* Trust Signal */}
                        <div className="mt-12 pt-8 space-y-4">
                            <div
                                className="h-px w-24 mx-auto"
                                style={{
                                    backgroundColor: "var(--color-border)",
                                }}
                            />
                            <p
                                className="text-sm font-medium"
                                style={{
                                    color: "var(--color-text-secondary)",
                                }}
                            >
                                ✨ PT. Anda Puas Kami Senang - Komitmen untuk
                                kesuksesan bersama
                            </p>
                        </div>
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

            {/* About Washwallet Section */}
            <section className="py-20 sm:py-24 bg-surface">
                <div className="container-fluid max-w-6xl">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-6"
                            style={{
                                backgroundColor: "var(--color-info-50)",
                                borderColor: "var(--color-info-200)",
                            }}
                        >
                            <Building2
                                className="w-4 h-4"
                                style={{ color: "var(--color-info-600)" }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-info-700)" }}
                            >
                                Siapa Kami
                            </span>
                        </div>
                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Tentang{" "}
                            <span style={{ color: "var(--color-primary-600)" }}>
                                Washwallet
                            </span>
                        </h2>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-6 animate-fadeInUp">
                        <p
                            className="text-lg leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Ini bukan sekadar aplikasi, tapi{" "}
                            <span
                                className="font-bold px-2 py-1 rounded"
                                style={{
                                    backgroundColor: "var(--color-primary-100)",
                                    color: "var(--color-primary-700)",
                                }}
                            >
                                aset berharga
                            </span>{" "}
                            bagi seluruh pengusaha laundry di Indonesia.
                            Washwallet bercita-cita untuk meningkatkan industri
                            laundry di Indonesia agar terus tumbuh dan
                            berkembang secara makro, sehingga membuat daya saing
                            industri laundry Indonesia bisa berkompetisi dan
                            lebih unggul dengan industri laundry negara lain.
                        </p>

                        <p
                            className="text-lg leading-relaxed"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Membuat mitra kami{" "}
                            <span
                                className="italic font-semibold"
                                style={{ color: "var(--color-success-600)" }}
                            >
                                senang
                            </span>{" "}
                            adalah misi kami yang sesuai dengan nama badan hukum
                            kami yaitu{" "}
                            <span
                                className="font-bold"
                                style={{ color: "var(--color-primary-600)" }}
                            >
                                PT. Anda Puas Kami Senang
                            </span>
                            . Begitulah entitas ini dibentuk berfokus untuk
                            menyenangkan para pengusaha laundry.
                        </p>

                        {/* Quote Box */}
                        <Card
                            variant="elevated"
                            className="relative mt-8 animate-fadeInUp"
                            style={{ animationDelay: "200ms" }}
                        >
                            <CardContent
                                className="p-8 border-l-4"
                                style={{
                                    borderColor: "var(--color-primary-500)",
                                }}
                            >
                                <div
                                    className="absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center"
                                    style={{
                                        backgroundColor:
                                            "var(--color-primary-500)",
                                    }}
                                >
                                    <span className="text-white text-lg font-bold">
                                        "
                                    </span>
                                </div>
                                <p
                                    className="text-lg italic leading-relaxed mb-4"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Perjalanan 1000 kilometer dimulai dari 1
                                    langkah. Sulit bukan berarti tidak bisa,
                                    kita hanya perlu bergandengan tangan untuk
                                    mencapai tujuan yang diharapkan. Bersama
                                    Washwallet mari kita tempuh tujuan kita
                                    bersama-sama. Kami akan setia menemani
                                    pertumbuhan dan peningkatan usaha laundry
                                    Anda langkah demi langkah.
                                </p>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary-100)",
                                        }}
                                    >
                                        <Heart
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-primary-600)",
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <p
                                            className="font-semibold"
                                            style={{
                                                color: "var(--color-text-primary)",
                                            }}
                                        >
                                            Tim Washwallet
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        >
                                            Surabaya, 2025
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Why Washwallet Section */}
            <section className="py-20 sm:py-24 bg-background">
                <div className="container-fluid">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-6"
                            style={{
                                backgroundColor: "var(--color-success-50)",
                                borderColor: "var(--color-success-200)",
                            }}
                        >
                            <Sparkles
                                className="w-4 h-4"
                                style={{ color: "var(--color-success-600)" }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-success-700)" }}
                            >
                                Nilai Kami
                            </span>
                        </div>
                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Kenapa{" "}
                            <span style={{ color: "var(--color-primary-600)" }}>
                                Washwallet?
                            </span>
                        </h2>
                        <p
                            className="text-lg max-w-2xl mx-auto"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Lebih dari sekedar software, kami adalah partner
                            strategis untuk kesuksesan bisnis laundry kamu
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6  mx-auto">
                        {whyWashwallet.map((item, index) => (
                            <Card
                                key={index}
                                variant="elevated"
                                hoverable
                                className="group animate-fadeInUp"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                <CardContent className="text-center">
                                    <div
                                        className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
                                        style={{
                                            backgroundColor: `${item.color}20`,
                                            color: item.color,
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                    <h3
                                        className="font-bold text-xl mb-3"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        className="leading-relaxed"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Vision & Mission Section */}
            <section className="py-20 sm:py-24 bg-surface">
                <div className="container-fluid max-w-6xl">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-6"
                            style={{
                                backgroundColor: "var(--color-primary-50)",
                                borderColor: "var(--color-primary-200)",
                            }}
                        >
                            <Target
                                className="w-4 h-4"
                                style={{ color: "var(--color-primary-600)" }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-primary-700)" }}
                            >
                                Visi & Misi
                            </span>
                        </div>
                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Tujuan{" "}
                            <span style={{ color: "var(--color-primary-600)" }}>
                                Besar Kami
                            </span>
                        </h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {visionMission.map((item, index) => (
                            <Card
                                key={index}
                                variant="elevated"
                                className="group animate-fadeInUp"
                                style={{
                                    animationDelay: `${index * 150}ms`,
                                }}
                            >
                                <CardContent className="p-8">
                                    <div
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                                        style={{
                                            backgroundColor: item.bgColor,
                                            color: item.color,
                                        }}
                                    >
                                        {item.icon}
                                        <span className="font-bold text-sm">
                                            {item.label}
                                        </span>
                                    </div>

                                    <h3
                                        className="text-2xl font-bold mb-4"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {item.title}
                                    </h3>

                                    <p
                                        className="text-lg leading-relaxed"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {item.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Core Values */}
                    <div className="mt-16">
                        <h3
                            className="text-2xl font-bold text-center mb-8"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Nilai-Nilai Inti Kami
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {coreValues.map((value, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center text-center p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fadeInUp"
                                    style={{
                                        backgroundColor: "var(--color-surface)",
                                        borderColor: "var(--color-border)",
                                        animationDelay: `${index * 80}ms`,
                                    }}
                                >
                                    <div
                                        className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                                        style={{
                                            backgroundColor:
                                                "var(--color-primary-100)",
                                            color: "var(--color-primary-600)",
                                        }}
                                    >
                                        {value.icon}
                                    </div>
                                    <h4
                                        className="font-semibold text-lg mb-2"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        {value.title}
                                    </h4>
                                    <p
                                        className="text-sm"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        {value.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Journey Section */}
            <section className="py-20 sm:py-24 bg-background relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23125b48' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                />

                <div className="container-fluid max-w-6xl relative z-10">
                    <div className="text-center mb-16 animate-fadeInUp">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-6"
                            style={{
                                backgroundColor: "var(--color-warning-50)",
                                borderColor: "var(--color-warning-200)",
                            }}
                        >
                            <Rocket
                                className="w-4 h-4"
                                style={{ color: "var(--color-warning-600)" }}
                            />
                            <span
                                className="text-sm font-semibold"
                                style={{ color: "var(--color-warning-700)" }}
                            >
                                Perjalanan Kami
                            </span>
                        </div>
                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance"
                            style={{ color: "var(--color-text-primary)" }}
                        >
                            Langkah Demi{" "}
                            <span style={{ color: "var(--color-warning-600)" }}>
                                Langkah
                            </span>
                        </h2>
                        <p
                            className="text-lg max-w-2xl mx-auto"
                            style={{ color: "var(--color-text-secondary)" }}
                        >
                            Dari Surabaya untuk Indonesia
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        {milestones.map((milestone, index) => (
                            <div
                                key={index}
                                className="relative animate-fadeInUp"
                                style={{
                                    animationDelay: `${index * 150}ms`,
                                }}
                            >
                                <Card variant="elevated" hoverable>
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div
                                                className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
                                                style={{
                                                    backgroundColor: `${milestone.color}20`,
                                                    color: milestone.color,
                                                }}
                                            >
                                                {milestone.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span
                                                        className="px-3 py-1 rounded-full text-sm font-bold"
                                                        style={{
                                                            backgroundColor: `${milestone.color}20`,
                                                            color: milestone.color,
                                                        }}
                                                    >
                                                        {milestone.year}
                                                    </span>
                                                </div>
                                                <h3
                                                    className="text-xl font-bold mb-2"
                                                    style={{
                                                        color: "var(--color-text-primary)",
                                                    }}
                                                >
                                                    {milestone.title}
                                                </h3>
                                                <p
                                                    className="text-lg leading-relaxed"
                                                    style={{
                                                        color: "var(--color-text-secondary)",
                                                    }}
                                                >
                                                    {milestone.description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Connector Line */}
                                {index < milestones.length - 1 && (
                                    <div
                                        className="h-8 w-1 mx-auto my-4"
                                        style={{
                                            backgroundColor:
                                                "var(--color-border)",
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 sm:py-24 relative overflow-hidden bg-surface">
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `
                            radial-gradient(circle at 30% 50%, var(--color-primary-200) 0%, transparent 50%),
                            radial-gradient(circle at 70% 50%, var(--color-success-200) 0%, transparent 50%)
                        `,
                    }}
                />

                <div className="container-fluid max-w-4xl text-center relative z-10">
                    <Card
                        variant="elevated"
                        isGlass
                        className="group overflow-hidden"
                    >
                        <CardContent className="py-16 relative">
                            <div
                                className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-12"
                                style={{
                                    backgroundColor: "var(--color-primary-50)",
                                }}
                            >
                                <Handshake
                                    className="w-12 h-12 animate-pulse"
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                />
                            </div>

                            <h2
                                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance"
                                style={{ color: "var(--color-text-primary)" }}
                            >
                                Siap Bergabung dengan{" "}
                                <span
                                    style={{
                                        color: "var(--color-primary-600)",
                                    }}
                                >
                                    Washwallet?
                                </span>
                            </h2>

                            <p
                                className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed"
                                style={{ color: "var(--color-text-secondary)" }}
                            >
                                Mari bersama-sama membawa bisnis laundry kamu ke
                                level selanjutnya. Kami siap menemani setiap
                                langkah pertumbuhan bisnis kamu! 🚀
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
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
                                </Button>
                                <Button
                                    size="xl"
                                    variant="outline"
                                    href="/#features"
                                >
                                    Lihat Semua Fitur
                                </Button>
                            </div>

                            <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-success-500)",
                                        }}
                                    />
                                    <span className="text-secondary">
                                        Gratis Trial
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-success-500)",
                                        }}
                                    />
                                    <span className="text-secondary">
                                        Support 24/7
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2
                                        className="w-5 h-5"
                                        style={{
                                            color: "var(--color-success-500)",
                                        }}
                                    />
                                    <span className="text-secondary">
                                        Partner Terpercaya
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </GuestLayout>
    );
};

export default About;
