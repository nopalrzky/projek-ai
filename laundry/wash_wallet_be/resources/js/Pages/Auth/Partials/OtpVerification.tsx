import React, { useState, useEffect, useRef } from "react";
import { FormField } from "@/Components/Form";
import { Button } from "@/Components/Button";
import { Shield, RefreshCw, Clock } from "lucide-react";
import { RegisterStepProps } from "../types";
import axios from "axios";

const OtpVerification: React.FC<RegisterStepProps> = ({
    onNext,
    onBack,
    data,
}) => {
    const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!data?.expiresAt) {
            setResendTimer(0);
            return;
        }
        const expiry = new Date(data.expiresAt).getTime();
        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
            setResendTimer(remaining);
        };
        updateTimer();
        const id = setInterval(updateTimer, 1000);
        return () => clearInterval(id);
    }, [data?.expiresAt]);

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otpCode];
        newOtp[index] = value;
        setOtpCode(newOtp);
        if (error) setError("");
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
        if (newOtp.every((d) => d !== "") && newOtp.join("").length === 6) {
            handleVerifyOtp(newOtp.join(""));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otpCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (otp?: string) => {
        const otpString = otp || otpCode.join("");
        if (otpString.length !== 6) return;

        try {
            setIsProcessing(true);
            setError("");

            const res = await axios.post("/verify-otp", { 
                phone: data?.phone, 
                otp: otpString 
            });

            if (res.data.success) {
                onNext({ phone: data?.phone, otpVerified: true, otp: otpString });
            } else {
                setError(res.data.message ?? "Kode OTP tidak valid.");
                setOtpCode(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (err: any) {
            console.error("OTP verification failed:", err);
            const message = err.response?.data?.message || "Terjadi kesalahan. Silakan coba lagi.";
            setError(message);
            setOtpCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        try {
            setIsProcessing(true);
            setError("");

            const res = await axios.post("/resend-otp", { 
                phone: data?.phone 
            });

            if (res.data.success) {
                onNext({ ...data, expiresAt: res.data.data?.expires_at });
                setOtpCode(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            } else {
                setError(res.data.message ?? "Gagal mengirim ulang OTP.");
            }
        } catch (err: any) {
            const message = err.response?.data?.message || "Gagal mengirim ulang OTP.";
            setError(message);
        } finally {
            setIsProcessing(false);
        }
    };

    const timerPercent = Math.min(100, (resendTimer / 60) * 100);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <div className="relative inline-flex mb-4">
                    <div
                        className="absolute inset-0 w-16 h-16 rounded-full animate-ping opacity-20"
                        style={{ backgroundColor: "var(--color-success-500)" }}
                    />
                    <div
                        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: "linear-gradient(135deg, var(--color-success-500), var(--color-success-600))" }}
                    >
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                    Masukkan Kode OTP
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Kami telah mengirimkan kode 6 digit ke{" "}
                    <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                        {data?.phone}
                    </span>
                </p>
            </div>

            <FormField error={error}>
                <div className="flex justify-center gap-2.5">
                    {otpCode.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={isProcessing}
                            autoFocus={index === 0}
                            className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-200 focus:scale-105"
                            style={{
                                borderColor: error ? "var(--color-error-500)" : digit ? "var(--color-primary-500)" : "var(--color-border)",
                                backgroundColor: digit ? "var(--color-primary-50)" : "var(--color-surface)",
                                color: "var(--color-text-primary)",
                                boxShadow: digit ? "0 0 0 3px var(--color-primary-50)" : "none",
                            }}
                        />
                    ))}
                </div>
            </FormField>

            <div className="flex flex-col items-center gap-2">
                {resendTimer > 0 ? (
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="13" fill="none" strokeWidth="3" style={{ stroke: "var(--color-border)" }} />
                                <circle
                                    cx="16" cy="16" r="13" fill="none" strokeWidth="3" strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 13}`}
                                    strokeDashoffset={`${2 * Math.PI * 13 * (1 - timerPercent / 100)}`}
                                    className="transition-all duration-1000"
                                    style={{ stroke: "var(--color-primary-500)" }}
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold" style={{ color: "var(--color-primary-600)" }}>
                                {resendTimer}
                            </span>
                        </div>
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            <Clock className="w-3.5 h-3.5 inline mr-1 opacity-60" />
                            Kirim ulang dalam {resendTimer} detik
                        </span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isProcessing}
                        className="flex items-center gap-1.5 font-semibold text-sm transition-opacity hover:opacity-70 disabled:opacity-40"
                        style={{ color: "var(--color-primary-600)" }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Kirim ulang kode OTP
                    </button>
                )}
            </div>

            <Button
                type="button" variant="primary" size="lg" fullWidth
                onClick={() => handleVerifyOtp()}
                loading={isProcessing}
                disabled={otpCode.some((d) => d === "") || isProcessing}
                className="font-bold relative overflow-hidden group"
                style={{ boxShadow: "0 8px 20px -4px var(--color-primary-200)" }}
            >
                {!isProcessing && (
                    <div className="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                )}
                {isProcessing ? "Memverifikasi..." : "Verifikasi Kode"}
            </Button>

            <Button
                type="button" variant="ghost" size="lg" fullWidth
                onClick={onBack}
                disabled={isProcessing}
                style={{ color: "var(--color-text-secondary)" }}
            >
                Ubah Nomor HP
            </Button>
        </div>
    );
};

export default OtpVerification;
