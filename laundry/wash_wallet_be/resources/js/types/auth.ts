import { FormDataConvertible } from "@/types";

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    phone: string;
    otp: string;
    name: string;
    email: string;
    username?: string;
    address?: string;
    password: string;
    password_confirmation: string;
    referralCode?: string | null;
}

export interface ResendOtpFormData {
    phone: string;
    [key: string]: FormDataConvertible;
}

export interface VerifyOtpFormData {
    phone: string;
    otp: string;
    [key: string]: FormDataConvertible;
}

export interface ForgotPasswordFormData {
    email: string;
    [key: string]: FormDataConvertible;
}

export interface ResetPasswordFormData {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
    [key: string]: FormDataConvertible;
}
