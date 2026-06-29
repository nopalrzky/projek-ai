import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Save,
    ArrowLeft,
    Lock,
    Eye,
    EyeOff,
    Shield,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";
import { withAuthenticatedLayout } from "@/Layouts/AuthenticatedLayout";
import { Form } from "@/Components/Form";
import { Input } from "@/Components/Input";
import { Button } from "@/Components/Button";
import { Alert } from "@/Components/Alert";
import { Card } from "@/Components/Card";
import type { ChangePasswordFormData } from "./types";

function ProfileChangePassword() {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    const { data, setData, post, processing, errors, reset, isDirty } =
        useForm<ChangePasswordFormData>({
            current_password: "",
            password: "",
            password_confirmation: "",
        });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("profile.password"), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                window.location.href = route("profile.index");
            },
        });
    };

    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: "", color: "" };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        if (strength <= 2)
            return {
                strength,
                label: "Lemah",
                color: "var(--color-error-500)",
            };
        if (strength === 3)
            return {
                strength,
                label: "Sedang",
                color: "var(--color-warning-500)",
            };
        if (strength === 4)
            return {
                strength,
                label: "Kuat",
                color: "var(--color-success-500)",
            };
        return {
            strength,
            label: "Sangat Kuat",
            color: "var(--color-success-600)",
        };
    };

    const passwordStrength = getPasswordStrength(data.password);

    return (
        <>
            <Head title="Change Password" />

            <div
                className="min-h-screen p-6"
                style={{ backgroundColor: "var(--color-background)" }}
            >
                <div className=" mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1">
                                <h1
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "var(--color-text-primary)",
                                    }}
                                >
                                    Change Password
                                </h1>
                                <p
                                    className="mt-1"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Perbarui password akun Anda untuk keamanan
                                    yang lebih baik
                                </p>
                            </div>
                        </div>

                        <div
                            className="p-4 rounded-lg border"
                            style={{
                                backgroundColor: "var(--color-info-50)",
                                borderColor: "var(--color-info-200)",
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <Shield
                                    className="w-5 h-5 mt-0.5"
                                    style={{ color: "var(--color-info-600)" }}
                                />
                                <div>
                                    <h4
                                        className="text-sm font-medium mb-1"
                                        style={{
                                            color: "var(--color-info-700)",
                                        }}
                                    >
                                        Tips Keamanan Password
                                    </h4>
                                    <ul
                                        className="text-xs space-y-1"
                                        style={{
                                            color: "var(--color-info-600)",
                                        }}
                                    >
                                        <li>• Minimal 8 karakter</li>
                                        <li>
                                            • Kombinasi huruf besar dan kecil
                                        </li>
                                        <li>
                                            • Sertakan angka dan simbol khusus
                                        </li>
                                        <li>
                                            • Hindari password yang mudah
                                            ditebak
                                        </li>
                                        <li>
                                            • Jangan gunakan informasi pribadi
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        <Card className="p-8">
                            <Form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-warning-100)",
                                            }}
                                        >
                                            <Lock
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-warning-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Verifikasi Identitas
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Masukkan password saat ini untuk
                                                verifikasi
                                            </p>
                                        </div>
                                    </div>

                                    <Input
                                        label="Password Saat Ini"
                                        type={
                                            showCurrentPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Masukkan password saat ini"
                                        value={data.current_password}
                                        onChange={(e) =>
                                            setData(
                                                "current_password",
                                                e.target.value,
                                            )
                                        }
                                        error={errors.current_password}
                                        required
                                        disabled={processing}
                                        leftIcon={<Lock className="w-5 h-5" />}
                                        rightIcon={
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowCurrentPassword(
                                                        !showCurrentPassword,
                                                    )
                                                }
                                                className="text-tertiary hover:text-secondary transition-colors"
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        }
                                        hint="Password yang sedang Anda gunakan"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div
                                        className="flex items-center gap-3 pb-4 border-b"
                                        style={{
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div
                                            className="p-3 rounded-lg"
                                            style={{
                                                backgroundColor:
                                                    "var(--color-success-100)",
                                            }}
                                        >
                                            <Shield
                                                className="w-6 h-6"
                                                style={{
                                                    color: "var(--color-success-600)",
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h2
                                                className="text-xl font-semibold"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Password Baru
                                            </h2>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: "var(--color-text-secondary)",
                                                }}
                                            >
                                                Buat password baru yang kuat dan
                                                aman
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            label="Password Baru"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Masukkan password baru"
                                            value={data.password}
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.password}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <Lock className="w-5 h-5" />
                                            }
                                            rightIcon={
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword,
                                                        )
                                                    }
                                                    className="text-tertiary hover:text-secondary transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            }
                                            hint="Minimal 8 karakter dengan kombinasi huruf, angka, dan simbol"
                                        />

                                        {data.password && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span
                                                        className="text-xs font-medium"
                                                        style={{
                                                            color: "var(--color-text-secondary)",
                                                        }}
                                                    >
                                                        Kekuatan Password:
                                                    </span>
                                                    <span
                                                        className="text-xs font-semibold"
                                                        style={{
                                                            color: passwordStrength.color,
                                                        }}
                                                    >
                                                        {passwordStrength.label}
                                                    </span>
                                                </div>
                                                <div
                                                    className="w-full h-2 rounded-full overflow-hidden"
                                                    style={{
                                                        backgroundColor:
                                                            "var(--color-gray-200)",
                                                    }}
                                                >
                                                    <div
                                                        className="h-full transition-all duration-300"
                                                        style={{
                                                            width: `${(passwordStrength.strength / 5) * 100}%`,
                                                            backgroundColor:
                                                                passwordStrength.color,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <Input
                                            label="Konfirmasi Password Baru"
                                            type={
                                                showPasswordConfirmation
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Masukkan ulang password baru"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                            error={errors.password_confirmation}
                                            required
                                            disabled={processing}
                                            leftIcon={
                                                <CheckCircle2 className="w-5 h-5" />
                                            }
                                            rightIcon={
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPasswordConfirmation(
                                                            !showPasswordConfirmation,
                                                        )
                                                    }
                                                    className="text-tertiary hover:text-secondary transition-colors"
                                                >
                                                    {showPasswordConfirmation ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            }
                                            hint="Pastikan password yang dimasukkan sama"
                                        />
                                    </div>
                                </div>

                                {data.password && (
                                    <div
                                        className="p-4 rounded-lg border"
                                        style={{
                                            backgroundColor:
                                                "var(--color-gray-50)",
                                            borderColor: "var(--color-border)",
                                        }}
                                    >
                                        <div className="space-y-2">
                                            <p
                                                className="text-sm font-medium mb-3"
                                                style={{
                                                    color: "var(--color-text-primary)",
                                                }}
                                            >
                                                Persyaratan Password:
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {[
                                                    {
                                                        check:
                                                            data.password
                                                                .length >= 8,
                                                        label: "Minimal 8 karakter",
                                                    },
                                                    {
                                                        check: /[a-z]/.test(
                                                            data.password,
                                                        ),
                                                        label: "Huruf kecil (a-z)",
                                                    },
                                                    {
                                                        check: /[A-Z]/.test(
                                                            data.password,
                                                        ),
                                                        label: "Huruf besar (A-Z)",
                                                    },
                                                    {
                                                        check: /[0-9]/.test(
                                                            data.password,
                                                        ),
                                                        label: "Angka (0-9)",
                                                    },
                                                    {
                                                        check: /[^a-zA-Z0-9]/.test(
                                                            data.password,
                                                        ),
                                                        label: "Simbol khusus (!@#$%)",
                                                    },
                                                    {
                                                        check:
                                                            data.password ===
                                                                data.password_confirmation &&
                                                            data.password_confirmation !==
                                                                "",
                                                        label: "Password cocok",
                                                    },
                                                ].map((req, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2"
                                                    >
                                                        {req.check ? (
                                                            <CheckCircle2
                                                                className="w-4 h-4"
                                                                style={{
                                                                    color: "var(--color-success-500)",
                                                                }}
                                                            />
                                                        ) : (
                                                            <AlertCircle
                                                                className="w-4 h-4"
                                                                style={{
                                                                    color: "var(--color-gray-400)",
                                                                }}
                                                            />
                                                        )}
                                                        <span
                                                            className="text-xs"
                                                            style={{
                                                                color: req.check
                                                                    ? "var(--color-success-600)"
                                                                    : "var(--color-text-tertiary)",
                                                            }}
                                                        >
                                                            {req.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor:
                                            "var(--color-warning-50)",
                                        borderColor: "var(--color-warning-200)",
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <AlertCircle
                                            className="w-5 h-5 mt-0.5"
                                            style={{
                                                color: "var(--color-warning-600)",
                                            }}
                                        />
                                        <div>
                                            <h4
                                                className="text-sm font-medium mb-1"
                                                style={{
                                                    color: "var(--color-warning-700)",
                                                }}
                                            >
                                                Penting untuk Diperhatikan
                                            </h4>
                                            <ul
                                                className="text-xs space-y-1"
                                                style={{
                                                    color: "var(--color-warning-600)",
                                                }}
                                            >
                                                <li>
                                                    • Setelah password diubah,
                                                    Anda harus login kembali
                                                </li>
                                                <li>
                                                    • Pastikan Anda mengingat
                                                    password baru Anda
                                                </li>
                                                <li>
                                                    • Simpan password di tempat
                                                    yang aman
                                                </li>
                                                <li>
                                                    • Jangan bagikan password
                                                    kepada siapapun
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {Object.keys(errors).length > 0 && (
                                    <Alert
                                        variant="error"
                                        title="Terdapat kesalahan pada form"
                                        description="Silakan periksa kembali semua field yang bertanda merah."
                                    />
                                )}

                                <div
                                    className="flex items-center justify-between pt-6 border-t"
                                    style={{
                                        borderColor: "var(--color-border)",
                                    }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        href={route("profile.index")}
                                        disabled={processing}
                                        leftIcon={
                                            <ArrowLeft className="w-4 h-4" />
                                        }
                                    >
                                        Kembali
                                    </Button>

                                    <div className="flex items-center gap-3">
                                        {isDirty && (
                                            <span
                                                className="text-xs"
                                                style={{
                                                    color: "var(--color-text-tertiary)",
                                                }}
                                            >
                                                * Form belum disimpan
                                            </span>
                                        )}
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={
                                                processing ||
                                                !data.current_password ||
                                                !data.password ||
                                                !data.password_confirmation ||
                                                data.password !==
                                                    data.password_confirmation
                                            }
                                            loading={processing}
                                            size="lg"
                                            leftIcon={
                                                <Save className="w-4 h-4" />
                                            }
                                        >
                                            {processing
                                                ? "Mengubah..."
                                                : "Ubah Password"}
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

ProfileChangePassword.layout = withAuthenticatedLayout({
    title: "Change Password",
    searchable: false,
    breadcrumbs: [
        { label: "Dashboard", href: route("dashboard") },
        { label: "Profil", href: route("profile.index") },
        { label: "Change Password", href: "#" },
    ],
});

export default ProfileChangePassword;
