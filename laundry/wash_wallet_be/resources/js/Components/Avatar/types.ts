import React from "react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type AvatarShape = "circle" | "square" | "rounded";
export type AvatarStatus = "online" | "offline" | "busy" | "away";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string | null;
    alt?: string;
    name?: string;
    size?: AvatarSize;
    shape?: AvatarShape;
    status?: AvatarStatus;
    bordered?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export interface AvatarImageProps extends Omit<
    React.ImgHTMLAttributes<HTMLImageElement>,
    "src"
> {
    src?: string | null;
    alt: string;
    onLoadSuccess?: () => void;
    onLoadError?: () => void;
}

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
    name?: string;
    delayMs?: number;
    children?: React.ReactNode;
}
