import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getInputClasses = (
    size: "sm" | "md" | "lg" = "md",
    hasError: boolean = false,
    hasSuccess: boolean = false,
    disabled: boolean = false,
    fullWidth: boolean = false,
    className?: string,
) => {
    return cn(
        "flex rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 py-2 text-sm ring-offset-background transition-all duration-200",
        "border-[var(--color-border)] placeholder:text-[var(--color-text-tertiary)] text-[var(--color-text-primary)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2",
        "hover:border-[var(--color-border-hover)]",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",

        size === "sm" && "h-8 px-2 text-xs",
        size === "md" && "h-10 px-3 text-sm",
        size === "lg" && "h-12 px-4 text-base",

        hasError &&
            "border-[var(--color-error-500)] focus-visible:ring-[var(--color-error-500)] bg-red-50/50 dark:bg-red-950/10",
        hasSuccess &&
            "border-[var(--color-success-500)] focus-visible:ring-[var(--color-success-500)] bg-green-50/50 dark:bg-green-950/10",
        disabled &&
            "cursor-not-allowed opacity-50 bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-900)]",
        fullWidth && "w-full",

        className,
    );
};

export const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
    const errors: string[] = [];
    if (password.length < 8) errors.push("Minimal 8 karakter");
    if (!/[A-Z]/.test(password)) errors.push("Butuh huruf besar");
    if (!/[a-z]/.test(password)) errors.push("Butuh huruf kecil");
    if (!/[0-9]/.test(password)) errors.push("Butuh angka");
    if (!/[!@#$%^&*]/.test(password)) errors.push("Butuh karakter spesial");

    return {
        isValid: errors.length === 0,
        errors,
        strength: getPasswordStrength(password),
    };
};

export const getPasswordStrength = (
    password: string,
): "weak" | "medium" | "strong" => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 2) return "weak";
    if (strength <= 4) return "medium";
    return "strong";
};

export const validateRequired = (value: any): boolean => {
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
};

export const validateMinLength = (value: string, min: number): boolean => {
    return value.length >= min;
};

export const validateMaxLength = (value: string, max: number): boolean => {
    return value.length <= max;
};

export const validatePattern = (value: string, pattern: RegExp): boolean => {
    return pattern.test(value);
};

export const validatePhone = (phone: string): boolean => {
    return /^(\+62|62|0)[0-9]{9,12}$/.test(phone.replace(/[\s-]/g, ""));
};

export const validateUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
