import React from "react";
import { cn } from "@/lib/utils";
import { FormProps } from "./types";

const Form: React.FC<FormProps> = ({
    children,
    onSubmit,
    className,
    loading = false,
    ...props
}) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (onSubmit && !loading) {
            event.preventDefault();
            onSubmit(event);
        }
    };

    return (
        <form
            className={cn(
                "w-full space-y-6 text-[var(--color-text-primary)] font-sans",
                loading && "pointer-events-none opacity-70",
                className,
            )}
            onSubmit={handleSubmit}
            noValidate
            {...props}
        >
            {children}
        </form>
    );
};

export default Form;
