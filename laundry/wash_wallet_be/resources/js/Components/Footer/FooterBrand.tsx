import React from "react";
import { cn } from "@/lib/utils";
import { FooterBrandProps } from "./types";

const FooterBrand: React.FC<FooterBrandProps> = ({
    children,
    href,
    className,
    logo,
    title,
    description,
    ...props
}) => {
    const content = (
        <div className={cn("flex flex-col space-y-4", className)} {...props}>
            {(logo || title) && (
                <div className="flex items-center gap-3">
                    {logo && <div className="flex-shrink-0">{logo}</div>}
                    {title && (
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-800)] bg-clip-text text-transparent dark:from-[var(--color-primary-400)] dark:to-[var(--color-primary-600)]">
                            {title}
                        </h2>
                    )}
                </div>
            )}

            {description && (
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xs">
                    {description}
                </p>
            )}

            {children}
        </div>
    );

    if (href) {
        return (
            <a
                href={href}
                className="group inline-block transition-transform duration-300 hover:opacity-90 hover:scale-[1.02]"
            >
                {content}
            </a>
        );
    }

    return content;
};

export default FooterBrand;
