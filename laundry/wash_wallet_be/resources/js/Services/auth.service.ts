import { router } from "@inertiajs/react";
import { ROUTES } from "@/Constants/routes";
import axios from "axios";
import {
    ForgotPasswordFormData,
    InertiaOptions,
    ResendOtpFormData,
    ResetPasswordFormData,
    VerifyOtpFormData,
} from "@/types";

export const authService = {
    /**
     * Check if referral code is valid
     */
    async checkReferral(
        code: string,
    ): Promise<{ valid: boolean; referrer?: { id: number; name: string } }> {
        try {
            const response = await axios.get("/api/referral/check", {
                params: { code },
            });

            return response.data;
        } catch (error: any) {
            // If 404 or validation error, return invalid
            if (
                error.response?.status === 404 ||
                error.response?.status === 422
            ) {
                return { valid: false };
            }

            // Re-throw other errors
            throw error;
        }
    },

    /**
     * Resend OTP to user's phone number
     */
    async resendOtp(
        data: ResendOtpFormData,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post("/resend-otp", data, {
                errorBag: "otp",
                preserveState: true,
                onSuccess: (page) => {
                    console.log("OTP sent successfully");
                    options.onSuccess?.(page);
                    resolve();
                },
                onError: (errors) => {
                    console.error("Send OTP error:", errors);
                    options.onError?.(errors);
                    reject(errors);
                },
            });
        });
    },

    /**
     * Verify OTP code
     */
    async verifyOtp(
        data: VerifyOtpFormData,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post("/verify-otp", data, {
                errorBag: "otp_verification",
                preserveState: true,
                onSuccess: (page) => {
                    console.log("OTP verification successful");
                    options.onSuccess?.(page);
                    resolve();
                },
                onError: (errors) => {
                    console.error("Verify OTP error:", errors);
                    options.onError?.(errors);
                    reject(errors);
                },
            });
        });
    },

    /**
     * Send password reset link
     */
    async forgotPassword(
        data: ForgotPasswordFormData,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post("/forgot-password", data, {
                errorBag: "forgotPassword",
                preserveState: true,
                onSuccess: (page) => {
                    console.log("Password reset link sent");
                    options.onSuccess?.(page);
                    resolve();
                },
                onError: (errors) => {
                    console.error("Forgot password error:", errors);
                    options.onError?.(errors);
                    reject(errors);
                },
            });
        });
    },

    /**
     * Reset password with token
     */
    async resetPassword(
        data: ResetPasswordFormData,
        options: InertiaOptions = {},
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post("/reset-password", data, {
                errorBag: "resetPassword",
                preserveState: true,
                onSuccess: (page) => {
                    console.log("Password reset successful");
                    options.onSuccess?.(page);
                    resolve();
                },
                onError: (errors) => {
                    console.error("Reset password error:", errors);
                    options.onError?.(errors);
                    reject(errors);
                },
            });
        });
    },

    /**
     * Logout current user
     */
    async logout(options: InertiaOptions = {}): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            router.post(
                "/logout",
                {},
                {
                    preserveState: false,
                    onSuccess: (page) => {
                        console.log("Logout successful");
                        options.onSuccess?.(page);
                        resolve();
                    },
                    onError: (errors) => {
                        console.error("Logout error:", errors);
                        options.onError?.(errors);
                        reject(errors);
                    },
                },
            );
        });
    },

    goToLogin(): void {
        router.visit(ROUTES.LOGIN);
    },

    goToRegister(): void {
        router.visit(ROUTES.REGISTER);
    },

    goToForgotPassword(): void {
        router.visit(ROUTES.FORGOT_PASSWORD);
    },

    goToHome(): void {
        router.visit(ROUTES.HOME);
    },
};

export default authService;
