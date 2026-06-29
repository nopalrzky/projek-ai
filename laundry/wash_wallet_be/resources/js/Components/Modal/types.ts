import { ReactNode } from "react";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    size?:
        | "xs"
        | "sm"
        | "md"
        | "lg"
        | "xl"
        | "2xl"
        | "3xl"
        | "4xl"
        | "full"
        | "screen";
    variant?: "default" | "danger" | "warning" | "success" | "info";
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    showCloseButton?: boolean;
    className?: string;
    overlayClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
    preventClose?: boolean;
    centered?: boolean;
    loading?: boolean;
    loadingVariant?: "skeleton" | "spinner";
    loadingText?: string;
    scrollable?: boolean;
    maxHeight?: string;
    glass?: boolean;
    blur?: boolean;
    animation?: "scale" | "slide" | "fade" | "zoom";
    position?:
        | "center"
        | "top"
        | "bottom"
        | "left"
        | "right"
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right";
    responsive?: boolean;
}

export interface ModalHeaderProps {
    title?: ReactNode;
    subtitle?: string;
    onClose?: () => void;
    showCloseButton?: boolean;
    className?: string;
    variant?: "default" | "danger" | "warning" | "success" | "info";
    icon?: ReactNode;
    glass?: boolean;
    children?: ReactNode;
}

export interface ModalBodyProps {
    children: ReactNode;
    className?: string;
    scrollable?: boolean;
    padding?: "none" | "sm" | "md" | "lg" | "xl";
    glass?: boolean;
}

export interface ModalFooterProps {
    children: ReactNode;
    className?: string;
    justify?: "start" | "center" | "end" | "between";
    padding?: "none" | "sm" | "md" | "lg" | "xl";
    glass?: boolean;
}
