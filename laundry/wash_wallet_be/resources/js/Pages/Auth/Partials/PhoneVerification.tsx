import React, { useState } from "react";
import { FormField } from "@/Components/Form";
import Input from "@/Components/Input/Input";
import { Button } from "@/Components/Button";
import { Phone, Smartphone, ShieldCheck } from "lucide-react";
import { RegisterStepProps } from "../types";
import axios from "axios";

const PhoneVerification: React.FC<RegisterStepProps> = ({ onNext, data }) => {
    const [phoneNumber, setPhoneNumber] = useState(data?.phone || "");
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");

    const handleSendOtp = async () => {
        const phoneRegex = /^(0[8][0-9]{8,11}|62[8][0-9]{8,11})$/;
        if (!phoneNumber) {
            setError("Nomor HP wajib diisi.");
            return;
        }
        if (!phoneRegex.test(phoneNumber)) {
            setError("Format nomor HP tidak valid. Gunakan format 08xxx atau 628xxx.");
            return;
        }

        try {
            setIsProcessing(true);
            setError("");

            const res = await axios.post("/resend-otp", { 
                phone: phoneNumber 
            });

            if (res.data.success) {
                onNext({
                    phone: phoneNumber,
                    expiresAt: res.data.data?.expires_at ?? null,
                });
            } else {
                setError(res.data.message ?? "Gagal mengirim OTP. Silakan coba lagi.");
            }
        } catch (err: any) {
            console.error("Failed to send OTP:", err);
            const message = err.response?.data?.message || "Gagal mengirim OTP. Silakan coba lagi.";
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    };



    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, "");
        setPhoneNumber(value);
        if (error) setError("");
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
                        className="absolute inset-1 w-14 h-14 rounded-full opacity-25 animate-pulse"
                        style={{
                            backgroundColor: "var(--color-primary-400)",
                        }}
                    />
                    <div
                        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                            background: `linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))`,
                        }}
                    >
                        <Smartphone className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h3
                    className="text-xl font-bold mb-1.5"
                    style={{ color: "var(--color-text-primary)" }}
                >
                    Verifikasi Nomor HP
                </h3>
                <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                >
                    Masukkan nomor HP Anda untuk menerima kode OTP verifikasi
                </p>
            </div>

            <FormField label="Nomor HP" error={error} required>
                <Input
                    type="tel"
                    placeholder="08123456789"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    disabled={isProcessing}
                    autoFocus
                    leftIcon={<Phone className="w-5 h-5" />}
                    size="lg"
                    maxLength={13}
                />
            </FormField>

            <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{
                    backgroundColor: "var(--color-primary-50)",
                    borderColor: "var(--color-primary-200)",
                }}
            >
                <ShieldCheck
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: "var(--color-primary-600)" }}
                />
                <div className="text-sm">
                    <p
                        className="font-semibold mb-0.5"
                        style={{ color: "var(--color-primary-700)" }}
                    >
                        Aman & Terpercaya
                    </p>
                    <p style={{ color: "var(--color-primary-600)" }}>
                        Nomor HP hanya digunakan untuk verifikasi akun Anda
                    </p>
                </div>
            </div>

            <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleSendOtp}
                loading={isProcessing}
                disabled={
                    !phoneNumber || phoneNumber.length < 10 || isProcessing
                }
                className="font-bold relative overflow-hidden group"
                style={{
                    boxShadow: "0 8px 20px -4px var(--color-primary-200)",
                }}
            >
                {!isProcessing && (
                    <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                )}
                {isProcessing ? "Mengirim OTP..." : "Kirim Kode OTP"}
            </Button>

            <p
                className="text-xs text-center"
                style={{ color: "var(--color-text-tertiary)" }}
            >
                Dengan melanjutkan, Anda menyetujui{" "}
                <button
                    className="font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    Syarat & Ketentuan
                </button>{" "}
                dan{" "}
                <button
                    className="font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "var(--color-primary-600)" }}
                >
                    Kebijakan Privasi
                </button>
            </p>
        </div>
    );
};

export default PhoneVerification;
