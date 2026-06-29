import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Form } from "@/Components/Form";
import { Input } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import ROUTES from "@/Constants/routes";
import {
    Mail,
    Lock,
    Sparkles,
    TrendingUp,
    Shield,
    Zap,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
} from "lucide-react";
import { LoginFormData } from "@/types";
import AuthSplitPanel from "./Partials/AuthSplitPanel";

const features = [
    {
        icon: TrendingUp,
        title: "Analisis Real-time",
        desc: "Pantau performa bisnis setiap detik",
        delay: "0ms",
    },
    {
        icon: Shield,
        title: "Keamanan Data",
        desc: "Enkripsi tingkat tinggi untuk privasi",
        delay: "100ms",
    },
    {
        icon: Zap,
        title: "Operasional Cepat",
        desc: "Otomatisasi alur kerja harian",
        delay: "200ms",
    },
];

const stats = [
    { num: "500+", label: "Outlet Aktif" },
    { num: "99.9%", label: "Uptime" },
    { num: "24/7", label: "Support" },
];

const Login: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showCredentialError, setShowCredentialError] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<LoginFormData>({ email: "", password: "" });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setShowCredentialError(false);
        post(route("login"), {
            preserveScroll: true,
            onError: () => setShowCredentialError(true),
            onSuccess: () => setShowCredentialError(false),
            onFinish: () => reset("password"),
        });
    };

    const handleInputChange =
        (field: keyof LoginFormData) => (value: string) => {
            setData(field, value);
            setShowCredentialError(false);
            if (errors[field]) clearErrors(field);
        };

    return (
        <GuestLayout showNavigation={false} showFooter={false} isFullWidth={true}>
            <Head title="Masuk - WashWallet" />

            <div className="min-h-screen flex w-full bg-background">
                <AuthSplitPanel
                    badge="Platform Laundry Modern"
                    heading={
                        <>
                            Kelola Laundry{" "}
                            <span className="text-white/60">Lebih Cerdas,</span>
                            <br />
                            Lebih Cepat.
                        </>
                    }
                    subheading="Sistem kasir dan manajemen laundry terintegrasi untuk bisnis yang lebih efisien."
                    features={features}
                    stats={stats}
                />

                <div className="w-full lg:w-[48%] flex items-center justify-center p-8 lg:p-12 relative bg-background">
                    <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,var(--color-primary-50)_0%,transparent_70%)]" />

                    <div className="w-full max-w-[420px] relative z-10 animate-fadeInUp">
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                            <div className="p-2 rounded-xl bg-primary-50">
                                <Sparkles className="w-5 h-5 text-primary-600" />
                            </div>
                            <span className="text-lg font-bold text-primary-600">
                                WashWallet
                            </span>
                        </div>

                        <div className="rounded-2xl p-8 space-y-6 bg-surface border border-border shadow-2xl">
                            <div className="space-y-1.5">
                                <h2 className="text-2xl font-bold tracking-tight text-text-primary">
                                    Masuk ke Akun
                                </h2>
                                <p className="text-sm text-text-secondary">
                                    Selamat datang kembali! Silakan masuk untuk
                                    melanjutkan.
                                </p>
                            </div>

                            {showCredentialError && (
                                <Alert
                                    variant="error"
                                    title="Gagal Masuk"
                                    description="Email atau kata sandi yang Anda masukkan salah."
                                    icon={<AlertCircle className="w-5 h-5" />}
                                    className="animate-shake"
                                />
                            )}

                            <Form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Alamat Email"
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        handleInputChange("email")(e.target.value)
                                    }
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    size="lg"
                                    variant="outline"
                                    fullWidth
                                    disabled={processing}
                                    error={errors.email}
                                    autoFocus
                                />

                                <Input
                                    label="Kata Sandi"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan kata sandi"
                                    value={data.password}
                                    onChange={(e) =>
                                        handleInputChange("password")(e.target.value)
                                    }
                                    leftIcon={<Lock className="w-4 h-4" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="p-1 rounded-md text-text-tertiary hover:text-primary-600 transition-colors duration-150"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    }
                                    size="lg"
                                    variant="outline"
                                    fullWidth
                                    disabled={processing}
                                    error={errors.password}
                                />

                                <div className="flex items-center pt-1">
                                    <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                                        <div
                                            className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 cursor-pointer ${
                                                rememberMe
                                                    ? "border-primary-500 bg-primary-500"
                                                    : "border-border bg-transparent"
                                            }`}
                                            onClick={() => setRememberMe(!rememberMe)}
                                        >
                                            {rememberMe && (
                                                <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary">
                                            Ingat saya
                                        </span>
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="xl"
                                    fullWidth
                                    loading={processing}
                                    disabled={processing}
                                    className="font-bold relative overflow-hidden group mt-2"
                                >
                                    {!processing && (
                                        <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                                    )}
                                    <span className="relative flex items-center justify-center gap-2">
                                        {processing ? (
                                            "Memproses..."
                                        ) : (
                                            <>
                                                Masuk Sekarang
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </Form>
                        </div>

                        <div className="mt-6 text-center space-y-1">
                            <p className="text-sm text-text-secondary">
                                Belum punya akun?
                            </p>
                            <a
                                href={ROUTES.REGISTER}
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-500 transition-opacity hover:opacity-70"
                            >
                                Daftarkan Outlet Anda Sekarang
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        <p className="text-xs text-center mt-8 text-text-tertiary">
                            © 2025 WashWallet System. Protected by reCAPTCHA.
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default Login;
