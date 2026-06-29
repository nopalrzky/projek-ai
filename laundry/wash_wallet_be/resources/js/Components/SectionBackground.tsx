import React from "react";
import clsx from "clsx";

interface SectionBackgroundProps {
    variant?: "default" | "alternate" | "dark";
    className?: string;
}

const SectionBackground: React.FC<SectionBackgroundProps> = ({ 
    variant = "default", 
    className 
}) => {
    return (
        <div className={clsx("absolute inset-0 overflow-hidden pointer-events-none -z-10", className)}>
            <div
                className="absolute inset-0 transition-colors duration-700 ease-in-out"
                style={{
                    background: variant === "alternate"
                        ? "linear-gradient(to bottom, var(--color-surface), var(--color-primary-50))"
                        : variant === "dark"
                            ? "linear-gradient(to bottom, var(--color-primary-900), var(--color-primary-950))"
                            : "linear-gradient(to bottom, var(--color-background), var(--color-surface))"
                }}
            />
            
            <div className={clsx(
                "absolute inset-0 mix-blend-multiply dark:mix-blend-screen",
                variant === "dark" ? "opacity-30" : "opacity-[0.15]"
            )}>
                <div
                    className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse-slow"
                    style={{
                        background: variant === "dark" 
                            ? "var(--color-primary-500)" 
                            : "var(--color-primary-300)",
                        animationDuration: "12s"
                    }}
                />
                
                <div
                    className="absolute top-1/2 -right-32 w-[800px] h-[800px] -translate-y-1/2 rounded-full blur-[150px] animate-pulse-slow"
                    style={{
                        background: variant === "dark"
                            ? "var(--color-secondary-600)"
                            : "var(--color-secondary-200)",
                        animationDelay: "3s",
                        animationDuration: "15s"
                    }}
                />
            </div>
            
            <div className={clsx(
                "absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]",
                variant === "dark" 
                    ? "[mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#fff,transparent)] opacity-15" 
                    : "[mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]"
            )} />
        </div>
    );
};

export default SectionBackground;
