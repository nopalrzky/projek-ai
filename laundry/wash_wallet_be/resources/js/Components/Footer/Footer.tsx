import React from "react";
import { cn } from "@/lib/utils";
import { FooterProps } from "./types";

const Footer: React.FC<FooterProps> = ({
    children,
    className,
    isGlass = false,
    variant = "default",
    ...props
}) => {
    const variants = {
        default: "bg-[var(--color-surface)]",
        dark: "bg-gradient-to-br from-[var(--color-gray-900)] to-[var(--color-gray-950)] text-white",
        gradient:
            "bg-gradient-to-br from-[var(--color-primary-600)] via-[var(--color-primary-700)] to-[var(--color-primary-800)] text-white",
    };

    return (
        <footer
            className={cn(
                "w-full border-t mt-auto transition-all duration-300 relative overflow-hidden",
                "border-[var(--color-border)]",
                isGlass
                    ? "glass bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/20 dark:border-white/10"
                    : variants[variant],
                className,
            )}
            {...props}
        >
            {!isGlass && (
                <>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-surface)] dark:to-[var(--color-background)]" />
                </>
            )}

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {children}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
