export interface RegisterStepProps {
    onNext: (data?: any) => void;
    onBack?: () => void;
    data?: any;
    isLoading?: boolean;
}

export interface PhoneVerificationFormData {
    phone: string;
}

export interface OtpVerificationFormData {
    phone: string;
    otp: string;
}
