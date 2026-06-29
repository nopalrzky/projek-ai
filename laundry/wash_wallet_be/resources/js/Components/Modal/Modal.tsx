import React, { Fragment, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from "@headlessui/react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ModalProps } from "./types";
import ModalBody from "./ModalBody";
import ModalFooter from "./ModalFooter";
import { cn } from "@/lib/utils";
import { ModalHeader } from ".";
import ModalLoadingState from "./ModalLoadingState";

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = "md",
    variant = "default",
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    className,
    overlayClassName,
    headerClassName,
    bodyClassName,
    footerClassName,
    preventClose = false,
    centered = true,
    loading = false,
    scrollable = true,
    maxHeight,
    glass = false,
    blur = false,
    animation = "scale",
    position = "center",
    loadingVariant = "skeleton",
    loadingText = "Memuat data...",
}) => {
    const handleEscape = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === "Escape" && closeOnEscape && !preventClose) {
                onClose();
            }
        },
        [closeOnEscape, preventClose, onClose],
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
            document.body.classList.add("modal-open");
        } else {
            document.body.style.overflow = "unset";
            document.body.classList.remove("modal-open");
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
            document.body.classList.remove("modal-open");
        };
    }, [isOpen, handleEscape]);

    const handleClose = () => {
        if (!preventClose && !loading) {
            onClose();
        }
    };

    const handleOverlayClick = () => {
        if (closeOnOverlayClick && !preventClose && !loading) {
            onClose();
        }
    };

    const sizeClasses = {
        xs: "max-w-xs w-full mx-2 sm:mx-4",
        sm: "max-w-sm w-full mx-2 sm:mx-4",
        md: "max-w-md w-full mx-2 sm:mx-4",
        lg: "max-w-lg w-full mx-2 sm:mx-4",
        xl: "max-w-2xl w-full mx-2 sm:mx-4",
        "2xl": "max-w-4xl w-full mx-2 sm:mx-4",
        "3xl": "max-w-6xl w-full mx-2 sm:mx-4",
        "4xl": " w-full mx-2 sm:mx-4",
        full: "max-w-[98vw] w-full h-[98vh] mx-1 sm:max-w-[96vw] sm:h-[96vh] sm:mx-2",
        screen: "w-screen h-screen max-w-none",
    };

    const variantClasses = {
        default: "border-[var(--color-border)]",
        danger: "border-red-300 dark:border-red-700",
        warning: "border-yellow-300 dark:border-yellow-700",
        success: "border-green-300 dark:border-green-700",
        info: "border-blue-300 dark:border-blue-700",
        glass: "border-white/20 dark:border-white/10",
    };

    const positionClasses = {
        center: "items-center justify-center",
        top: "items-start justify-center pt-8 sm:pt-16",
        bottom: "items-end justify-center pb-8 sm:pb-16",
        left: "items-center justify-start pl-4 sm:pl-16",
        right: "items-center justify-end pr-4 sm:pr-16",
        "top-left": "items-start justify-start pt-8 pl-4 sm:pt-16 sm:pl-16",
        "top-right": "items-start justify-end pt-8 pr-4 sm:pt-16 sm:pr-16",
        "bottom-left": "items-end justify-start pb-8 pl-4 sm:pb-16 sm:pl-16",
        "bottom-right": "items-end justify-end pb-8 pr-4 sm:pb-16 sm:pr-16",
    };

    const overlayVariants: Variants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.2,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.15,
                ease: "easeIn",
            },
        },
    };

    const scaleVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.85,
            y: 30,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 30,
                stiffness: 400,
                duration: 0.4,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.85,
            y: 30,
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
    };

    const slideVariants: Variants = {
        hidden: {
            opacity: 0,
            x: 0,
            y: "100%",
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                type: "spring" as const,
                damping: 25,
                stiffness: 300,
                duration: 0.5,
            },
        },
        exit: {
            opacity: 0,
            x: 0,
            y: "100%",
            transition: {
                duration: 0.25,
                ease: "easeIn",
            },
        },
    };

    const fadeVariants: Variants = {
        hidden: {
            opacity: 0,
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.25,
                ease: "easeOut",
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
    };

    const zoomVariants: Variants = {
        hidden: {
            opacity: 0,
            scale: 0.7,
        },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring" as const,
                damping: 25,
                stiffness: 350,
                duration: 0.4,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.7,
            transition: {
                duration: 0.2,
                ease: "easeIn",
            },
        },
    };

    const getAnimationVariants = (animationType: string): Variants => {
        switch (animationType) {
            case "slide":
                return slideVariants;
            case "fade":
                return fadeVariants;
            case "zoom":
                return zoomVariants;
            default:
                return scaleVariants;
        }
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="relative z-[9999]"
                        onClose={handleClose}
                        static={preventClose || loading}
                    >
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <motion.div
                                variants={overlayVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className={cn(
                                    "fixed inset-0 transition-all duration-300",
                                    glass || blur
                                        ? "backdrop-blur-md bg-black/40 dark:bg-black/60"
                                        : "bg-black/50 dark:bg-black/70",
                                    blur && "backdrop-blur-xl",
                                    "supports-[backdrop-filter]:bg-black/25 supports-[backdrop-filter]:dark:bg-black/40",
                                    overlayClassName,
                                )}
                                onClick={handleOverlayClick}
                                aria-hidden="true"
                            />
                        </TransitionChild>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div
                                className={cn(
                                    "flex min-h-full p-2 text-center",
                                    centered
                                        ? "items-center justify-center"
                                        : positionClasses[position],
                                    "sm:p-4 md:p-6",
                                )}
                            >
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel
                                        as={motion.div}
                                        variants={getAnimationVariants(
                                            animation,
                                        )}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className={cn(
                                            "transform overflow-hidden transition-all",
                                            "border shadow-2xl relative",
                                            glass
                                                ? "glass bg-white/90 dark:bg-[var(--color-surface)]/90 backdrop-blur-2xl"
                                                : "bg-[var(--color-surface)] dark:bg-[var(--color-surface)]",
                                            size === "screen"
                                                ? "rounded-none"
                                                : "rounded-2xl",
                                            sizeClasses[size],
                                            variantClasses[
                                                glass ? "glass" : variant
                                            ],
                                            (size === "full" ||
                                                size === "screen") &&
                                                "h-[98vh] sm:h-[96vh]",
                                            "ring-1 ring-black/5 dark:ring-white/10",
                                            className,
                                        )}
                                        style={{
                                            maxHeight:
                                                maxHeight ||
                                                (size === "full" ||
                                                size === "screen"
                                                    ? "98vh"
                                                    : "90vh"),
                                        }}
                                    >
                                        {!glass && (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-500)]/3 via-transparent to-[var(--color-secondary-500)]/3 opacity-60 dark:opacity-40" />
                                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary-50)_0%,_transparent_40%)] dark:bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary-900)/20_0%,_transparent_40%)]" />
                                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-primary-300)]/30 to-transparent" />
                                            </>
                                        )}

                                        {loading && (
                                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/92 dark:bg-[var(--color-surface)]/92 backdrop-blur-sm rounded-2xl border border-white/40 dark:border-white/10">
                                                <ModalLoadingState
                                                    variant={loadingVariant}
                                                    text={loadingText}
                                                />
                                            </div>
                                        )}

                                        <div
                                            className={cn(
                                                "relative z-10 flex flex-col h-full",
                                                size === "full" ||
                                                    size === "screen"
                                                    ? "max-h-[98vh] sm:max-h-[96vh]"
                                                    : "max-h-[90vh]",
                                            )}
                                        >
                                            {title && (
                                                <ModalHeader
                                                    title={title}
                                                    onClose={
                                                        preventClose || loading
                                                            ? undefined
                                                            : handleClose
                                                    }
                                                    showCloseButton={
                                                        showCloseButton
                                                    }
                                                    className={headerClassName}
                                                    variant={variant}
                                                    glass={glass}
                                                />
                                            )}

                                            <ModalBody
                                                className={bodyClassName}
                                                scrollable={scrollable}
                                                glass={glass}
                                            >
                                                {children}
                                            </ModalBody>

                                            {footer && (
                                                <ModalFooter
                                                    className={footerClassName}
                                                    glass={glass}
                                                >
                                                    {footer}
                                                </ModalFooter>
                                            )}
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            )}
        </AnimatePresence>
    );
};

export default Modal;
