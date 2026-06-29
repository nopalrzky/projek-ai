import React, { isValidElement } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeaderProps } from "./types";

const PageHeader = ({
    title,
    subtitle,
    icon,
    badges,
    actions,
    children,
    className,
    animate = true,
    variant = "default",
}: PageHeaderProps) => {
    const renderIcon = () => {
        if (!icon) return null;

        if (isValidElement(icon)) {
            return icon;
        }

        const IconComponent = icon as React.ElementType;
        return (
            <IconComponent className="h-6 w-6 text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]" />
        );
    };

    const renderSubtitle = () => {
        if (!subtitle) return null;

        if (typeof subtitle === "string") {
            return (
                <p className="text-sm text-[var(--color-text-secondary)] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-primary-500)]" />
                    {subtitle}
                </p>
            );
        }

        return <div className="text-sm">{subtitle}</div>;
    };

    const variantStyles = {
        default: {
            iconBg: "bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-primary-100)] dark:from-[var(--color-primary-900)]/30 dark:to-[var(--color-primary-800)]/20",
            iconBorder:
                "border-[var(--color-primary-200)] dark:border-[var(--color-primary-700)]/50",
            accentBar:
                "bg-gradient-to-r from-[var(--color-primary-500)] via-[var(--color-primary-400)] to-transparent",
        },
        gradient: {
            iconBg: "bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)]",
            iconBorder:
                "border-transparent shadow-lg shadow-[var(--color-primary-500)]/25",
            accentBar:
                "bg-gradient-to-r from-[var(--color-primary-500)] via-[var(--color-secondary-500)] to-[var(--color-primary-500)]",
        },
        glass: {
            iconBg: "bg-white/80 dark:bg-[var(--color-gray-800)]/80 backdrop-blur-xl",
            iconBorder:
                "border-white/20 dark:border-[var(--color-gray-700)]/50 shadow-xl",
            accentBar:
                "bg-gradient-to-r from-[var(--color-primary-500)]/20 via-[var(--color-primary-400)]/10 to-transparent",
        },
    };

    const selectedVariant = variantStyles[variant];

    const content = (
        <div className={cn("space-y-6 overflow-visible", className)}>
            <div className="relative">
                {animate && (
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={cn(
                            "absolute left-0 top-0 h-full w-1 rounded-full",
                            selectedVariant.accentBar,
                        )}
                        style={{ transformOrigin: "top" }}
                    />
                )}

                {!animate && (
                    <div
                        className={cn(
                            "absolute left-0 top-0 h-full w-1 rounded-full",
                            selectedVariant.accentBar,
                        )}
                    />
                )}

                <div className="pl-6 md:pl-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            {icon && (
                                <motion.div
                                    initial={
                                        animate
                                            ? { scale: 0.8, rotate: -10 }
                                            : false
                                    }
                                    animate={
                                        animate
                                            ? {
                                                  scale: 1,
                                                  rotate: 0,
                                              }
                                            : false
                                    }
                                    transition={
                                        animate
                                            ? {
                                                  type: "spring",
                                                  stiffness: 200,
                                                  damping: 15,
                                              }
                                            : undefined
                                    }
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    className={cn(
                                        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 transition-all duration-200",
                                        selectedVariant.iconBg,
                                        selectedVariant.iconBorder,
                                    )}
                                >
                                    {variant === "gradient" ? (
                                        <div className="text-white">
                                            {renderIcon()}
                                        </div>
                                    ) : (
                                        renderIcon()
                                    )}
                                    {variant === "gradient" && (
                                        <motion.div
                                            className="absolute -top-1 -right-1"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 180, 360],
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                        >
                                            <Sparkles className="w-4 h-4 text-[var(--color-warning-400)]" />
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                            <div className="space-y-2 flex-1 min-w-0">
                                <div className="flex items-start gap-3">
                                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)] bg-clip-text">
                                        {title}
                                    </h1>
                                </div>
                                {renderSubtitle()}
                                {badges && badges.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        {badges.map((badge, index) => (
                                            <React.Fragment key={index}>
                                                {badge}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {actions && (
                            <motion.div
                                initial={
                                    animate ? { opacity: 0, x: 20 } : false
                                }
                                animate={animate ? { opacity: 1, x: 0 } : false}
                                transition={
                                    animate ? { delay: 0.2 } : undefined
                                }
                                className="flex shrink-0 items-center gap-3 flex-wrap"
                            >
                                {actions}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {children && (
                <motion.div
                    initial={animate ? { opacity: 0, y: 10 } : false}
                    animate={animate ? { opacity: 1, y: 0 } : false}
                    transition={animate ? { delay: 0.3 } : undefined}
                    className="pt-2"
                >
                    {children}
                </motion.div>
            )}
        </div>
    );

    if (!animate) {
        return content;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
            {content}
        </motion.div>
    );
};

export default PageHeader;
