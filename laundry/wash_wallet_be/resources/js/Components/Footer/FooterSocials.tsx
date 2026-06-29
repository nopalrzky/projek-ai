import React from "react";
import { cn } from "@/lib/utils";
import { FooterSocialsProps } from "./types";

const FooterSocials: React.FC<FooterSocialsProps> = ({
    title,
    socials,
    className,
    ...props
}) => {
    return (
        <div className={cn("flex flex-col space-y-4", className)} {...props}>
            {title && (
                <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-[var(--color-text-primary)] relative inline-flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-primary-700)] rounded-full" />
                    {title}
                </h3>
            )}

            <div className="flex flex-wrap gap-3">
                {socials.map((social, index) => (
                    <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            "group relative flex items-center justify-center",
                            "w-10 h-10 sm:w-11 sm:h-11",
                            "rounded-xl border-2 transition-all duration-300",
                            "bg-[var(--color-surface)] border-[var(--color-border)]",
                            "text-[var(--color-text-secondary)]",
                            "hover:bg-gradient-to-br hover:from-[var(--color-primary-500)] hover:to-[var(--color-primary-700)]",
                            "hover:border-transparent hover:text-white",
                            "hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--color-primary-500)]/25",
                            "active:scale-95",
                        )}
                        aria-label={social.name}
                    >
                        <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                            {social.icon}
                        </span>

                        {/* Ripple Effect on Hover */}
                        <span className="absolute inset-0 rounded-xl bg-[var(--color-primary-500)] opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
                    </a>
                ))}
            </div>
        </div>
    );
};

export default FooterSocials;
