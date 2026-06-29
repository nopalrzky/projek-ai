import React from "react";
import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { FooterCopyrightProps } from "./types";

const FooterCopyright: React.FC<FooterCopyrightProps> = ({
    text,
    year = new Date().getFullYear(),
    companyName = "WashWallet",
    className,
    showMadeWith = true,
    ...props
}) => {
    return (
        <div
            className={cn(
                "col-span-1 sm:col-span-2 lg:col-span-4",
                "mt-8 pt-8 border-t",
                "border-[var(--color-border)]",
                "flex flex-col md:flex-row justify-between items-center gap-4",
                "text-center md:text-left",
                className,
            )}
            {...props}
        >
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <p className="text-sm text-[var(--color-text-tertiary)]">
                    {text || (
                        <>
                            © {year}{" "}
                            <span className="font-semibold text-[var(--color-text-primary)]">
                                {companyName}
                            </span>
                            . All rights reserved.
                        </>
                    )}
                </p>
            </div>

            {showMadeWith && (
                <div className="flex items-center gap-4">
                    <p className="text-sm text-[var(--color-text-tertiary)] flex items-center justify-center gap-2">
                        <span>Made with</span>
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
                        <span>for Laundry Owners</span>
                    </p>

                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 dark:border-yellow-500/10">
                        <Sparkles className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                            v1.0.0
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FooterCopyright;
