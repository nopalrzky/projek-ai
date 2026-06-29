import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalLoadingStateProps {
    variant?: "skeleton" | "spinner";
    text?: string;
}

const SkeletonLine: React.FC<{ className?: string }> = ({ className }) => (
    <div
        className={cn(
            "h-3 rounded-full animate-pulse",
            "bg-gray-200 dark:bg-gray-700",
            className,
        )}
    />
);

const ModalLoadingState: React.FC<ModalLoadingStateProps> = ({
    variant = "skeleton",
    text = "Memuat data...",
}) => {
    if (variant === "spinner") {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)]" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                    {text}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl animate-pulse bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                    <SkeletonLine className="w-1/2" />
                    <SkeletonLine className="w-1/3 h-2.5" />
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70 p-4">
                    <SkeletonLine className="w-1/3 h-2.5" />
                    <SkeletonLine className="w-full h-10 rounded-lg" />
                </div>

                <div className="space-y-2.5 rounded-xl border border-gray-200/70 dark:border-gray-700/70 p-4">
                    <SkeletonLine className="w-1/4 h-2.5" />
                    <SkeletonLine className="w-full h-10 rounded-lg" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <SkeletonLine className="w-20 h-9 rounded-lg" />
                    <SkeletonLine className="w-24 h-9 rounded-lg" />
                </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-tertiary)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{text}</span>
            </div>
        </div>
    );
};

export default ModalLoadingState;
