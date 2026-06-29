/**
 * Application routes constants
 * Centralized route definitions for type safety and maintainability
 */
export const ROUTES = {
    LOGIN: "login",
    REGISTER: "register",
    LOGOUT: "logout",
    FORGOT_PASSWORD: "forgot-password",
    RESET_PASSWORD: "reset-password",
    RESEND_OTP: "resend-otp",
    VERIFY_OTP: "verify-otp",

    HOME: "/",
    DASHBOARD: "/dashboard",

    EMPLOYEES: "/employees",
    EMPLOYEE_CREATE: "/employees/create",
    EMPLOYEE_EDIT: (id: number | string) => `/employees/${id}/edit`,
    ATTENDANCE: "/attendance",
    PAYROLL: "/payroll",
} as const;

export default ROUTES;
