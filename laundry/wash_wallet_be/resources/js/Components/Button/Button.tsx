import React, { forwardRef, useState } from "react";
import { Link } from "@inertiajs/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "./types";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = "primary",
            size = "md",
            shape = "rounded",
            loading = false,
            disabled = false,
            fullWidth = false,
            leftIcon,
            rightIcon,
            loadingText,
            href,
            target,
            external = false,
            gradient = false,
            shadow = false,
            isGlass = false,
            ripple = true,
            animateOnHover = true,
            className = "",
            badge,
            tooltip,
            type = "button",
            onClick,
            ...props
        },
        ref,
    ) => {
        const [ripples, setRipples] = useState<
            { x: number; y: number; id: number }[]
        >([]);

        const addRipple = (e: React.MouseEvent<HTMLElement>) => {
            if (!ripple || disabled || loading) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const newRipple = { x, y, id: Date.now() };
            setRipples((prev) => [...prev, newRipple]);
        };

        const handleAnimationEnd = (id: number) => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        };

        const variants = {
            primary:
                "bg-[var(--color-primary-600)] text-white border-transparent hover:bg-[var(--color-primary-700)] active:bg-[var(--color-primary-800)] dark:bg-[var(--color-primary-500)] dark:hover:bg-[var(--color-primary-600)]",
            secondary:
                "bg-[var(--color-secondary-300)] text-[var(--color-secondary-900)] border-transparent hover:bg-[var(--color-secondary-400)] active:bg-[var(--color-secondary-500)] dark:bg-[var(--color-secondary-700)] dark:text-white",
            success:
                "bg-[var(--color-success-500)] text-white border-transparent hover:bg-[var(--color-success-600)] active:bg-[var(--color-success-600)]",
            danger: "bg-[var(--color-error-500)] text-white border-transparent hover:bg-[var(--color-error-600)] active:bg-[var(--color-error-600)]",
            warning:
                "bg-[var(--color-warning-500)] text-white border-transparent hover:bg-[var(--color-warning-400)] active:bg-[var(--color-warning-400)]",
            info: "bg-[var(--color-info-500)] text-white border-transparent hover:bg-[var(--color-info-600)] active:bg-[var(--color-info-600)]",
            ghost: "bg-transparent text-[var(--color-text-primary)] border-transparent hover:bg-[var(--color-gray-100)] active:bg-[var(--color-gray-200)] dark:hover:bg-[var(--color-gray-800)] dark:active:bg-[var(--color-gray-700)]",
            outline:
                "bg-transparent border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary-500)] hover:text-[var(--color-primary-500)] dark:border-[var(--color-gray-700)]",
            link: "bg-transparent border-transparent text-[var(--color-primary-600)] underline-offset-4 hover:underline p-0 h-auto",
        };

        const gradients = {
            primary:
                "bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] hover:brightness-110 border-none",
            success:
                "bg-gradient-to-r from-[var(--color-success-500)] to-[var(--color-success-600)] hover:brightness-110 border-none",
            danger: "bg-gradient-to-r from-[var(--color-error-500)] to-[var(--color-error-600)] hover:brightness-110 border-none",
            warning:
                "bg-gradient-to-r from-[var(--color-warning-500)] to-[var(--color-warning-500)] hover:brightness-110 border-none",
            info: "bg-gradient-to-r from-[var(--color-info-500)] to-[var(--color-info-600)] hover:brightness-110 border-none",
            secondary:
                "bg-gradient-to-r from-[var(--color-secondary-400)] to-[var(--color-secondary-600)] hover:brightness-110 border-none",
            ghost: "",
            outline: "",
            link: "",
        };

        const sizes = {
            xs: "h-7 px-2 text-xs",
            sm: "h-9 px-3 text-sm",
            md: "h-10 px-4 py-2 text-sm",
            lg: "h-11 px-8 text-base",
            xl: "h-14 px-10 text-lg",
        };

        const shapes = {
            rounded: "rounded-[var(--radius-md)]",
            pill: "rounded-full",
            square: "rounded-none",
        };

        const Component: any = href ? (external ? "a" : Link) : "button";
        const componentProps = href
            ? {
                  href,
                  target: external ? "_blank" : target,
                  rel: external ? "noopener noreferrer" : undefined,
              }
            : { type, disabled: disabled || loading };

        return (
            <Component
                ref={ref as any}
                className={cn(
                    "relative inline-flex items-center justify-center font-medium transition-all duration-200 outline-none select-none overflow-hidden",
                    "focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "disabled:pointer-events-none disabled:opacity-50",
                    gradient ? gradients[variant] : variants[variant],
                    sizes[size],
                    shapes[shape],
                    fullWidth && "w-full",
                    shadow && "shadow-lg shadow-black/5 active:shadow-none",
                    isGlass &&
                        "glass text-[var(--color-text-primary)] hover:bg-white/40 dark:hover:bg-black/40 border-white/20",
                    animateOnHover &&
                        !disabled &&
                        !loading &&
                        "hover:-translate-y-0.5 active:translate-y-0",
                    className,
                )}
                title={tooltip}
                onClick={(e: React.MouseEvent<any>) => {
                    addRipple(e);
                    onClick?.(e as any);
                }}
                {...componentProps}
                {...props}
            >
                {ripples.map((r) => (
                    <span
                        key={r.id}
                        className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
                        style={{
                            left: r.x,
                            top: r.y,
                            width: "200%",
                            paddingBottom: "200%",
                            transform: "scale(0)",
                        }}
                        onAnimationEnd={() => handleAnimationEnd(r.id)}
                    />
                ))}

                <span className="relative z-10 flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {!loading && leftIcon && (
                        <span className="flex-shrink-0">{leftIcon}</span>
                    )}
                    {loading && loadingText ? loadingText : children}
                    {!loading && rightIcon && (
                        <span className="flex-shrink-0">{rightIcon}</span>
                    )}
                </span>

                {badge && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-error-500)] text-[10px] text-white shadow-sm ring-2 ring-white dark:ring-gray-900">
                        {badge}
                    </span>
                )}
            </Component>
        );
    },
);

Button.displayName = "Button";

export default Button;
