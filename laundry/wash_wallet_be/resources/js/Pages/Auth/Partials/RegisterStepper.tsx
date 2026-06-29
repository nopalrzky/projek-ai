import React from "react";
import { Check, LucideIcon } from "lucide-react";

interface StepItem {
    number: number;
    title: string;
    icon: LucideIcon;
}

interface RegisterStepperProps {
    steps: StepItem[];
    currentStep: number;
}

const RegisterStepper: React.FC<RegisterStepperProps> = ({ steps, currentStep }) => {
    const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="rounded-2xl p-5 mb-5 bg-surface border border-border shadow-md">
            <div className="flex items-center">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.number;
                    const isCompleted = currentStep > step.number;

                    return (
                        <React.Fragment key={step.number}>
                            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                                <div className="relative">
                                    {isActive && (
                                        <div className="absolute inset-0 w-9 h-9 rounded-full animate-ping opacity-25 bg-primary-500" />
                                    )}
                                    <div
                                        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                                            isCompleted
                                                ? "bg-success-500 text-white scale-110 ring-[3px] ring-primary-50"
                                                : isActive
                                                  ? "bg-primary-500 text-white scale-110 ring-4 ring-primary-50"
                                                  : "bg-gray-200 text-text-tertiary"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Icon className="w-4 h-4" />
                                        )}
                                    </div>
                                </div>
                                <span
                                    className={`text-[11px] font-medium whitespace-nowrap ${
                                        isActive
                                            ? "text-primary-600"
                                            : isCompleted
                                              ? "text-success-600"
                                              : "text-text-tertiary"
                                    }`}
                                >
                                    {step.title}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-500 mb-4 ${
                                        currentStep > step.number
                                            ? "bg-success-500"
                                            : "bg-border"
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            <div className="mt-4 h-1 rounded-full overflow-hidden bg-border">
                <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-primary-500 to-success-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
        </div>
    );
};

export default RegisterStepper;
