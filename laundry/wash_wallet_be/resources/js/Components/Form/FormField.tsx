import React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormFieldProps } from "./types";

const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    success,
    info,
    children,
    required = false,
    className,
    description,
    disabled = false,
    optional = false,
    tooltip,
    ...props
}) => {
    return (
        <div
            className={cn(
                "space-y-2 group relative",
                disabled && "opacity-60 pointer-events-none",
                className,
            )}
            {...props}
        >
            {label && (
                <div className="flex items-center justify-between gap-2">
                    <label
                        className={cn(
                            "block text-sm font-medium transition-colors duration-200",
                            error
                                ? "text-[var(--color-error-500)]"
                                : success
                                  ? "text-[var(--color-success-600)]"
                                  : "text-[var(--color-text-primary)] group-focus-within:text-[var(--color-primary-500)]",
                        )}
                    >
                        {label}
                        {required && (
                            <span className="ml-1 text-[var(--color-error-500)]">
                                *
                            </span>
                        )}
                    </label>

                    {optional && !required && (
                        <span className="text-xs text-[var(--color-text-tertiary)] italic">
                            Optional
                        </span>
                    )}

                    {tooltip && (
                        <div className="group/tooltip relative">
                            <Info className="w-4 h-4 text-[var(--color-text-tertiary)] hover:text-[var(--color-primary-500)] cursor-help transition-colors" />
                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block z-50">
                                <div className="bg-[var(--color-gray-900)] text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
                                    {tooltip}
                                    <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[var(--color-gray-900)]" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="relative">
                {React.isValidElement(children)
                    ? React.cloneElement(children as React.ReactElement<any>, {
                          disabled: disabled || children.props?.disabled,
                          "aria-invalid": !!error,
                          "aria-describedby": error
                              ? `${children.props?.id}-error`
                              : undefined,
                          className: cn(
                              children.props.className,
                              error &&
                                  "border-[var(--color-error-500)] focus:ring-[var(--color-error-500)] pr-10",
                              success &&
                                  "border-[var(--color-success-500)] focus:ring-[var(--color-success-500)] pr-10",
                          ),
                      })
                    : children}

                {error && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <AlertCircle className="w-5 h-5 text-[var(--color-error-500)]" />
                    </div>
                )}
                {success && !error && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <CheckCircle2 className="w-5 h-5 text-[var(--color-success-500)]" />
                    </div>
                )}
            </div>

            {description && !error && !success && !info && (
                <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{description}</span>
                </p>
            )}

            {info && !error && !success && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        {info}
                    </p>
                </div>
            )}

            {success && !error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 animate-in slide-in-from-top-1 fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-green-700 dark:text-green-300 leading-relaxed">
                        {success}
                    </p>
                </div>
            )}

            {error && (
                <div
                    className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 animate-in slide-in-from-top-1 fade-in duration-200"
                    role="alert"
                    id={
                        children && React.isValidElement(children)
                            ? `${children.props?.id}-error`
                            : undefined
                    }
                >
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium text-red-700 dark:text-red-300 leading-relaxed">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FormField;
