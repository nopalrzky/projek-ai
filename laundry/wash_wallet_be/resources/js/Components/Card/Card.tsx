import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
    CardProps,
    CardHeaderProps,
    CardTitleProps,
    CardDescriptionProps,
    CardContentProps,
    CardFooterProps,
} from "./types";

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = "default",
            hoverable = false,
            isGlass = false,
            ...props
        },
        ref,
    ) => {
        const variants = {
            default:
                "bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] dark:shadow-black/10",
            outlined:
                "bg-transparent border-2 border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
            elevated:
                "bg-[var(--color-surface)] border border-[var(--color-border-light)] shadow-[var(--shadow-lg)] dark:shadow-black/20",
            flat: "bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-100)] border-none shadow-none",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-[var(--radius-lg)] transition-all duration-300",
                    "ring-0 focus-within:ring-2 focus-within:ring-[var(--color-primary-500)]/20",
                    "relative",
                    variants[variant],
                    isGlass &&
                        "glass border-white/20 dark:border-white/10 shadow-xl backdrop-blur-xl bg-white/70 dark:bg-black/50",
                    hoverable &&
                        "hover:-translate-y-1 hover:shadow-[var(--shadow-xl)] dark:hover:shadow-black/30 cursor-pointer hover:border-[var(--color-border-hover)]",
                    className,
                )}
                {...props}
            />
        );
    },
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, action, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex flex-col gap-3 sm:gap-4",
                "px-4 sm:px-6 py-4 sm:py-5",
                "border-b border-[var(--color-border)]",
                "bg-gradient-to-b from-[var(--color-gray-50)]/50 to-transparent",
                "dark:from-[var(--color-gray-900)]/30 dark:to-transparent",
                className,
            )}
            {...props}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">{children}</div>
                {action && (
                    <div className="flex-shrink-0 sm:ml-4 self-start sm:self-auto">
                        {action}
                    </div>
                )}
            </div>
        </div>
    ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, noPadding = false, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                !noPadding && "px-4 sm:px-6 py-4 sm:py-5",
                "text-[var(--color-text-secondary)]",
                "text-sm sm:text-base",
                className,
            )}
            {...props}
        />
    ),
);
CardContent.displayName = "CardContent";

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4",
                "px-4 sm:px-6 py-3 sm:py-4",
                "border-t border-[var(--color-border)]",
                "bg-[var(--color-gray-50)] dark:bg-[var(--color-gray-900)]/30",
                "backdrop-blur-sm",
                className,
            )}
            {...props}
        />
    ),
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
