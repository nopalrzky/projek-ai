import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Phone, Shield, UserPlus, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import AuthSplitPanel from "./Partials/AuthSplitPanel";
import RegisterStepper from "./Partials/RegisterStepper";
import PhoneVerification from "./Partials/PhoneVerification";
import OtpVerification from "./Partials/OtpVerification";
import UserInformation from "./Partials/UserInformation";

const heroFeatures = [
    { icon: TrendingUp, title: "Mulai Gratis", desc: "Tanpa biaya setup, langsung bisa digunakan", delay: "0ms" },
    { icon: Users, title: "Kelola Pelanggan", desc: "Database pelanggan terintegrasi & otomatis", delay: "100ms" },
    { icon: Zap, title: "Setup Cepat", desc: "Siap operasional dalam hitungan menit", delay: "200ms" },
    { icon: Phone, title: "Support 24/7", desc: "Tim support siap membantu kapan saja", delay: "300ms" },
];

const stats = [
    { num: "500+", label: "Outlet Aktif" },
    { num: "Gratis", label: "Setup Awal" },
    { num: "24/7", label: "Support" },
];

const steps = [
    { number: 1, title: "Verifikasi HP", icon: Phone },
    { number: 2, title: "Kode OTP", icon: Shield },
    { number: 3, title: "Data Diri", icon: UserPlus },
];

const Register: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [stepData, setStepData] = useState<any>({});
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleNext = async (data?: any) => {
        setIsTransitioning(true);
        if (data) setStepData((prev: any) => ({ ...prev, ...data }));
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCurrentStep((prev) => prev + 1);
        setIsTransitioning(false);
    };

    const handleBack = async () => {
        setIsTransitioning(true);
        await new Promise((resolve) => setTimeout(resolve, 300));
        setCurrentStep((prev) => prev - 1);
        setIsTransitioning(false);
    };

    const renderCurrentStep = () => {
        const stepProps = {
            onNext: handleNext,
            onBack: currentStep > 1 ? handleBack : undefined,
            data: stepData,
        };
        switch (currentStep) {
            case 1: return <PhoneVerification {...stepProps} />;
            case 2: return <OtpVerification {...stepProps} />;
            case 3: return <UserInformation {...stepProps} />;
            default: return <PhoneVerification {...stepProps} />;
        }
    };

    return (
        <GuestLayout showNavigation={false} showFooter={false} isFullWidth={true}>
            <Head title="Daftar - WashWallet" />

            <div className="min-h-screen flex bg-background">
                <AuthSplitPanel
                    badge="Ekosistem Laundry Digital"
                    heading={
                        <>
                            Bergabung &{" "}
                            <span className="text-white/60">Mulai</span>
                            <br />
                            Bisnis Anda.
                        </>
                    }
                    subheading="Ribuan pengusaha laundry sudah bergabung. Giliran Anda membangun bisnis yang lebih cerdas."
                    features={heroFeatures}
                    stats={stats}
                />

                <div className="w-full lg:w-[48%] flex items-start justify-center py-10 px-8 lg:px-12 relative overflow-y-auto bg-background">
                    <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,var(--color-primary-50)_0%,transparent_70%)]" />

                    <div className="w-full max-w-md relative z-10 animate-fadeInUp">
                        <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                            <Sparkles className="w-6 h-6 text-primary-500" />
                            <span className="text-xl font-bold text-primary-500">
                                WashWallet
                            </span>
                        </div>

                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-text-primary">
                                Bergabung Sekarang
                            </h2>
                            <p className="text-sm mt-1 text-text-secondary">
                                Daftar akun baru untuk memulai bisnis laundry Anda
                            </p>
                        </div>

                        <RegisterStepper steps={steps} currentStep={currentStep} />

                        <div
                            className={`rounded-2xl p-7 border bg-surface border-border shadow-2xl transition-all duration-300 ${
                                isTransitioning ? "opacity-50 scale-[0.99]" : "opacity-100 scale-100"
                            }`}
                        >
                            <div
                                className={`transition-all duration-300 ${
                                    isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                                }`}
                            >
                                {renderCurrentStep()}
                            </div>
                        </div>

                        <p className="text-xs text-center mt-6 text-text-tertiary">
                            © 2025 WashWallet. Solusi Digital untuk Pengusaha Laundry.
                        </p>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
};

export default Register;
