import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Form, FormField } from "@/Components/Form";
import Input from "@/Components/Input/Input";
import { Button } from "@/Components/Button";
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    CheckCircle2,
    Shield,
    Zap,
    Gift,
    Search,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { RegisterStepProps } from "../types";
import ROUTES from "@/Constants/routes";
import authService from "@/Services/auth.service";
import { RegisterFormData } from "@/types";

const UserInformation: React.FC<RegisterStepProps> = ({ onBack, data }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [referralStatus, setReferralStatus] = useState<
        "valid" | "invalid" | null
    >(null);
    const [referrerName, setReferrerName] = useState("");
    const [checkingReferral, setCheckingReferral] = useState(false);

    const {
        data: formData,
        setData,
        errors,
        clearErrors,
        post,
    } = useForm<RegisterFormData>({
        phone: data?.phone || "",
        otp: data?.otp || "",
        name: "",
        username: "",
        email: "",
        address: "",
        password: "",
        password_confirmation: "",
        referralCode: "",
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password.length < 8) return;
        if (!/[A-Z]/.test(formData.password)) return;
        if (formData.password !== formData.password_confirmation) return;

        try {
            setIsSubmitting(true);
            clearErrors();
            post(route("register"), {
                preserveScroll: true,
                onError: (errors) =>
                    console.error("Registration errors:", errors),
                onSuccess: () => console.log("Registration successful"),
                onFinish: () => setIsSubmitting(false),
            });
        } catch (error) {
            console.error("Registration error:", error);
            setIsSubmitting(false);
        }
    };

    const handleInputChange =
        (field: keyof RegisterFormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setData(field, e.target.value);
            if (errors[field]) clearErrors(field);
        };

    const handleReferralCodeChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const value = e.target.value.toUpperCase().slice(0, 8);
        setData("referralCode", value);
        if (referralStatus !== null) {
            setReferralStatus(null);
            setReferrerName("");
        }
        if (errors.referralCode) clearErrors("referralCode");
    };

    const handleCheckReferral = async () => {
        const code = formData.referralCode?.trim();
        if (!code) return;
        try {
            setCheckingReferral(true);
            setReferralStatus(null);
            setReferrerName("");
            const result = await authService.checkReferral(code);
            if (result.valid && result.referrer) {
                setReferralStatus("valid");
                setReferrerName(result.referrer.name);
            } else {
                setReferralStatus("invalid");
            }
        } catch (error) {
            console.error("Failed to check referral:", error);
            setReferralStatus("invalid");
        } finally {
            setCheckingReferral(false);
        }
    };

    const passwordRequirements = [
        {
            label: "Minimal 8 karakter",
            met: formData.password.length >= 8,
        },
        {
            label: "Minimal 1 huruf kapital",
            met: /[A-Z]/.test(formData.password),
        },
    ];

    const allRequirementsMet = passwordRequirements.every((r) => r.met);

    // Shared toggle button style helper
    const toggleBtnStyle = {
        color: "var(--color-text-tertiary)",
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="relative inline-flex mb-4">
                    <div
                        className="absolute inset-0 w-16 h-16 rounded-full animate-ping opacity-20"
                        style={{
                            backgroundColor: "var(--color-primary-500)",
                        }}
                    />
                    <div
                        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))`,
                        }}
                    >
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
                        style={{
                            backgroundColor: "var(--color-success-500)",
                        }}
                    >
                        <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                </div>

                <h3
                    className="text-xl font-bold mb-1.5"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Lengkapi Data Diri
                </h3>
                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Isi informasi akun Anda untuk menyelesaikan pendaftaran
                </p>
            </div>

            <Form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="Nomor HP" required>
                    <Input
                        type="tel"
                        value={formData.phone}
                        disabled
                        leftIcon={
                            <CheckCircle
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-success-500)",
                                }}
                            />
                        }
                        rightIcon={
                            <span
                                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                    backgroundColor: "var(--color-primary-50)",
                                    color: "var(--color-primary-700)",
                                    border: "1px solid var(--color-primary-200)",
                                }}
                            >
                                Terverifikasi
                            </span>
                        }
                        size="lg"
                    />
                </FormField>

                <FormField label="Nama Lengkap" error={errors.name} required>
                    <Input
                        type="text"
                        name="name"
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={handleInputChange("name")}
                        disabled={isSubmitting}
                        autoFocus
                        leftIcon={
                            <User
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            />
                        }
                        size="lg"
                    />
                </FormField>

                <FormField label="Username" error={errors.username}>
                    <Input
                        type="text"
                        name="username"
                        placeholder="Masukkan username (opsional)"
                        value={formData.username || ""}
                        onChange={handleInputChange("username")}
                        disabled={isSubmitting}
                        leftIcon={
                            <span
                                className="text-sm font-bold"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                @
                            </span>
                        }
                        size="lg"
                    />
                </FormField>

                <FormField label="Email" error={errors.email} required>
                    <Input
                        type="email"
                        name="email"
                        placeholder="nama@email.com"
                        value={formData.email}
                        onChange={handleInputChange("email")}
                        disabled={isSubmitting}
                        leftIcon={
                            <Mail
                                className="w-5 h-5"
                                style={{
                                    color: "var(--color-text-tertiary)",
                                }}
                            />
                        }
                        size="lg"
                    />
                </FormField>

                <FormField label="Alamat" error={errors.address}>
                    <Input
                        type="text"
                        name="address"
                        placeholder="Masukkan alamat (opsional)"
                        value={formData.address || ""}
                        onChange={handleInputChange("address")}
                        disabled={isSubmitting}
                        size="lg"
                    />
                </FormField>

                <FormField label="Password" error={errors.password} required>
                    <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Masukkan password"
                        value={formData.password}
                        onChange={handleInputChange("password")}
                        disabled={isSubmitting}
                        leftIcon={
                            <Lock className="w-5 h-5" style={toggleBtnStyle} />
                        }
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="p-1 rounded-md transition-all duration-200"
                                style={toggleBtnStyle}
                                onMouseEnter={(e) => {
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.backgroundColor =
                                        "var(--color-primary-50)";
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.color = "var(--color-primary-600)";
                                }}
                                onMouseLeave={(e) => {
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.backgroundColor = "transparent";
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.color =
                                        "var(--color-text-tertiary)";
                                }}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        }
                        size="lg"
                    />

                    {formData.password && (
                        <div className="mt-3 space-y-2">
                            {passwordRequirements.map((req, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm transition-all duration-200"
                                >
                                    {req.met ? (
                                        <CheckCircle2
                                            className="w-4 h-4 flex-shrink-0"
                                            style={{
                                                color: "var(--color-success-500)",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                                            style={{
                                                borderColor:
                                                    "var(--color-border)",
                                            }}
                                        />
                                    )}
                                    <span
                                        className="font-medium"
                                        style={{
                                            color: req.met
                                                ? "var(--color-success-600)"
                                                : "var(--color-text-tertiary)",
                                        }}
                                    >
                                        {req.label}
                                    </span>
                                </div>
                            ))}

                            <div
                                className="flex items-center gap-2 p-3 rounded-lg mt-2 border-l-4"
                                style={{
                                    backgroundColor: allRequirementsMet
                                        ? "var(--color-primary-50)"
                                        : "var(--color-gray-50)",
                                    borderColor: allRequirementsMet
                                        ? "var(--color-success-500)"
                                        : "var(--color-gray-300)",
                                }}
                            >
                                <Shield
                                    className="w-4 h-4 flex-shrink-0"
                                    style={{
                                        color: allRequirementsMet
                                            ? "var(--color-success-600)"
                                            : "var(--color-text-tertiary)",
                                    }}
                                />
                                <span
                                    className="text-xs font-semibold"
                                    style={{
                                        color: allRequirementsMet
                                            ? "var(--color-success-600)"
                                            : "var(--color-text-tertiary)",
                                    }}
                                >
                                    {allRequirementsMet
                                        ? "✓ Password memenuhi syarat keamanan"
                                        : "Lengkapi syarat password di atas"}
                                </span>
                            </div>
                        </div>
                    )}
                </FormField>

                <FormField
                    label="Konfirmasi Password"
                    error={errors.password_confirmation}
                    required
                >
                    <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="password_confirmation"
                        placeholder="Konfirmasi password"
                        value={formData.password_confirmation}
                        onChange={handleInputChange("password_confirmation")}
                        disabled={isSubmitting}
                        leftIcon={
                            <Lock className="w-5 h-5" style={toggleBtnStyle} />
                        }
                        rightIcon={
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="p-1 rounded-md transition-all duration-200"
                                style={toggleBtnStyle}
                                onMouseEnter={(e) => {
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.backgroundColor =
                                        "var(--color-primary-50)";
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.color = "var(--color-primary-600)";
                                }}
                                onMouseLeave={(e) => {
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.backgroundColor = "transparent";
                                    (
                                        e.currentTarget as HTMLButtonElement
                                    ).style.color =
                                        "var(--color-text-tertiary)";
                                }}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        }
                        size="lg"
                    />

                    {formData.password_confirmation &&
                        formData.password &&
                        formData.password ===
                            formData.password_confirmation && (
                            <div
                                className="flex items-center gap-2 mt-2 text-sm"
                                style={{
                                    color: "var(--color-success-600)",
                                }}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="font-semibold">
                                    Password cocok
                                </span>
                            </div>
                        )}
                </FormField>

                <FormField
                    label="Kode Referral (Opsional)"
                    error={errors.referralCode}
                >
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    name="referralCode"
                                    placeholder="Kode referral (8 karakter)"
                                    value={formData.referralCode || ""}
                                    onChange={handleReferralCodeChange}
                                    disabled={isSubmitting || checkingReferral}
                                    maxLength={8}
                                    leftIcon={
                                        <Gift
                                            className="w-5 h-5"
                                            style={{
                                                color: "var(--color-text-tertiary)",
                                            }}
                                        />
                                    }
                                    size="lg"
                                    style={{ textTransform: "uppercase" }}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={handleCheckReferral}
                                disabled={
                                    !formData.referralCode?.trim() ||
                                    checkingReferral ||
                                    isSubmitting
                                }
                                loading={checkingReferral}
                                className="px-4 flex-shrink-0"
                                style={{
                                    borderColor: "var(--color-primary-400)",
                                    color: "var(--color-primary-600)",
                                }}
                            >
                                {!checkingReferral && (
                                    <Search className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        {referralStatus === "valid" && (
                            <div
                                className="flex items-start gap-3 p-3.5 rounded-xl border animate-fadeIn"
                                style={{
                                    backgroundColor: "var(--color-primary-50)",
                                    borderColor: "var(--color-primary-200)",
                                }}
                            >
                                <CheckCircle
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-success-600)",
                                    }}
                                />
                                <div>
                                    <p
                                        className="text-sm font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Kode Referral Ditemukan!
                                    </p>
                                    <p
                                        className="text-xs mt-0.5"
                                        style={{
                                            color: "var(--color-primary-700)",
                                        }}
                                    >
                                        Direferensikan oleh:{" "}
                                        <span className="font-semibold">
                                            {referrerName}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {referralStatus === "invalid" && (
                            <div
                                className="flex items-start gap-3 p-3.5 rounded-xl border animate-fadeIn"
                                style={{
                                    backgroundColor: "var(--color-gray-50)",
                                    borderColor: "var(--color-border)",
                                }}
                            >
                                <XCircle
                                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-error-500)",
                                    }}
                                />
                                <div>
                                    <p
                                        className="text-sm font-semibold"
                                        style={{
                                            color: "var(--color-text-primary)",
                                        }}
                                    >
                                        Kode Tidak Ditemukan
                                    </p>
                                    <p
                                        className="text-xs mt-0.5"
                                        style={{
                                            color: "var(--color-text-secondary)",
                                        }}
                                    >
                                        Anda tetap bisa melanjutkan pendaftaran.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!referralStatus && (
                            <div
                                className="flex items-start gap-3 p-3.5 rounded-xl border"
                                style={{
                                    backgroundColor: "var(--color-gray-50)",
                                    borderColor: "var(--color-border-light)",
                                }}
                            >
                                <AlertCircle
                                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                                    style={{
                                        color: "var(--color-text-tertiary)",
                                    }}
                                />
                                <p
                                    className="text-xs"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                    }}
                                >
                                    Punya kode referral? Masukkan untuk
                                    mendapatkan bonus spesial saat pertama
                                    topup!
                                </p>
                            </div>
                        )}
                    </div>
                </FormField>

                <div className="pt-4 space-y-3">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        className="font-bold relative overflow-hidden group"
                        style={{
                            boxShadow: isSubmitting
                                ? "none"
                                : "0 8px 20px -4px var(--color-primary-200)",
                        }}
                    >
                        {!isSubmitting && (
                            <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                        )}
                        <span className="relative flex items-center justify-center gap-2">
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Mendaftarkan...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Daftar Sekarang
                                </>
                            )}
                        </span>
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        fullWidth
                        onClick={onBack}
                        disabled={isSubmitting}
                        style={{ color: "var(--color-text-secondary)" }}
                    >
                        Kembali ke Verifikasi OTP
                    </Button>
                </div>
            </Form>

            <div
                className="text-center pt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
            >
                <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Sudah punya akun?{" "}
                    <a
                        href={ROUTES.LOGIN}
                        className="font-semibold transition-opacity hover:opacity-70"
                        style={{ color: "var(--color-primary-600)" }}
                    >
                        Masuk di sini
                    </a>
                </p>
            </div>
        </div>
    );
};

export default UserInformation;
