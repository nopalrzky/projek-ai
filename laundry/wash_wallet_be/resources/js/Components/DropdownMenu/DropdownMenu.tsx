import React, {
    useState,
    useRef,
    useEffect,
    useContext,
    createContext,
    isValidElement,
    cloneElement,
    ReactElement,
} from "react";
import ReactDOM from "react-dom";
import { Link } from "@inertiajs/react";
import { cn } from "@/lib/utils";
import {
    DropdownMenuContextType,
    DropdownMenuProps,
    DropdownTriggerProps,
    DropdownContentProps,
    DropdownItemProps,
    DropdownSeparatorProps,
    DropdownLabelProps,
    DropdownGroupProps,
    DropdownShortcutProps,
} from "./types";

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(
    undefined,
);

const useDropdownMenu = () => {
    const context = useContext(DropdownMenuContext);
    if (!context) {
        throw new Error("useDropdownMenu must be used within a DropdownMenu");
    }
    return context;
};

const DropdownMenu = ({
    children,
    className,
    align = "right",
    width = "w-56",
    isGlass = false,
    ...props
}: DropdownMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLElement>(null);

    const toggle = () => setIsOpen((prev) => !prev);
    const close = () => setIsOpen(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                close();
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        if (isOpen) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen]);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, toggle, close, triggerRef }}>
            <div
                ref={containerRef}
                className={cn("relative inline-block text-left", className)}
                {...props}
            >
                {React.Children.map(children, (child) => {
                    if (
                        isValidElement(child) &&
                        (child.type as any).displayName === "DropdownContent"
                    ) {
                        return cloneElement(child as ReactElement<any>, {
                            align,
                            width,
                            isGlass,
                        });
                    }
                    return child;
                })}
            </div>
        </DropdownMenuContext.Provider>
    );
};

const DropdownTrigger = ({
    children,
    className,
    asChild = false,
    ...props
}: DropdownTriggerProps) => {
    const { toggle, isOpen, triggerRef } = useDropdownMenu();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
        }
    };

    if (asChild && isValidElement(children)) {
        return cloneElement(children as ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
                (children as ReactElement<any>).props.onClick?.(e);
                toggle();
            },
            "aria-expanded": isOpen,
            "aria-haspopup": true,
        });
    }

    return (
        <div
            ref={triggerRef as React.RefObject<HTMLDivElement>}
            onClick={toggle}
            className={cn(
                "cursor-pointer outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]/20 rounded-[var(--radius-md)] transition-all",
                className,
            )}
            aria-expanded={isOpen}
            aria-haspopup="true"
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            {...props}
        >
            {children}
        </div>
    );
};
DropdownTrigger.displayName = "DropdownTrigger";

const DropdownContent = ({
    children,
    className,
    align = "right",
    width = "w-56",
    isGlass = false,
    sideOffset = 8,
    ...props
}: DropdownContentProps) => {
    const { isOpen, triggerRef } = useDropdownMenu();
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, right: 0 });

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
        } else {
            const timeout = setTimeout(() => setMounted(false), 200);
            return () => clearTimeout(timeout);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + sideOffset + window.scrollY,
                left: rect.left + window.scrollX,
                right: window.innerWidth - rect.right - window.scrollX,
            });
        }
    }, [isOpen, triggerRef, sideOffset]);

    if (!mounted) return null;

    const positionStyle: React.CSSProperties =
        align === "right"
            ? { top: position.top, right: position.right }
            : align === "left"
              ? { top: position.top, left: position.left }
              : { top: position.top, left: position.left + (triggerRef.current?.offsetWidth ?? 0) / 2 };

    return ReactDOM.createPortal(
        <div
            className={cn(
                "fixed z-[9999] rounded-[var(--radius-lg)] border overflow-hidden",
                "bg-[var(--color-surface)] shadow-[var(--shadow-xl)] dark:shadow-black/30",
                "border-[var(--color-border)]",
                "transition-all duration-200",
                isOpen
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
                align === "center" && "-translate-x-1/2",
                width,
                isGlass &&
                    "glass bg-white/90 dark:bg-black/90 backdrop-blur-xl border-white/20 dark:border-white/10",
                className,
            )}
            style={positionStyle}
            role="menu"
            {...props}
        >
            <div className="p-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>,
        document.body,
    );
};
DropdownContent.displayName = "DropdownContent";

const DropdownItem = ({
    children,
    className,
    icon,
    href,
    external,
    disabled,
    danger,
    onClick,
    active,
    shortcut,
    ...props
}: DropdownItemProps) => {
    const { close } = useDropdownMenu();

    const itemClasses = cn(
        "group relative flex cursor-pointer select-none items-center gap-2",
        "rounded-[var(--radius-md)] px-3 py-2 text-sm outline-none",
        "transition-all duration-200",
        "focus:bg-[var(--color-gray-100)] dark:focus:bg-[var(--color-gray-800)]",
        "hover:bg-gradient-to-r hover:from-[var(--color-gray-100)] hover:to-transparent",
        "dark:hover:from-[var(--color-gray-800)] dark:hover:to-transparent",
        "text-[var(--color-text-primary)]",
        active &&
            "bg-[var(--color-primary-50)] text-[var(--color-primary-700)]",
        active &&
            "dark:bg-[var(--color-primary-900)]/20 dark:text-[var(--color-primary-300)]",
        active && "font-medium",
        danger && "text-red-600 hover:bg-red-50 hover:text-red-700",
        danger &&
            "dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300",
        disabled && "pointer-events-none opacity-50 cursor-not-allowed",
        className,
    );

    const content = (
        <>
            {icon && (
                <span
                    className={cn(
                        "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                        danger
                            ? "text-current"
                            : active
                              ? "text-current"
                              : "text-[var(--color-text-secondary)]",
                    )}
                >
                    {isValidElement(icon)
                        ? cloneElement(icon as ReactElement<any>, {
                              size: 16,
                              className: "w-4 h-4",
                          })
                        : icon}
                </span>
            )}
            <span className="flex-1 truncate">{children}</span>
            {shortcut && (
                <span className="ml-auto text-xs text-[var(--color-text-tertiary)] font-mono">
                    {shortcut}
                </span>
            )}
        </>
    );

    if (href && !disabled) {
        if (external) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={itemClasses}
                    onClick={(e) => {
                        onClick?.(e as any);
                        close();
                    }}
                    role="menuitem"
                >
                    {content}
                </a>
            );
        }
        return (
            <Link
                href={href}
                className={itemClasses}
                onClick={(e) => {
                    onClick?.(e as any);
                    close();
                }}
                role="menuitem"
            >
                {content}
            </Link>
        );
    }

    return (
        <div
            className={itemClasses}
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault();
                    return;
                }
                onClick?.(e);
                if (!disabled) close();
            }}
            role="menuitem"
            tabIndex={disabled ? -1 : 0}
            {...props}
        >
            {content}
        </div>
    );
};
DropdownItem.displayName = "DropdownItem";

const DropdownSeparator = ({ className, ...props }: DropdownSeparatorProps) => (
    <div
        className={cn(
            "-mx-1 my-1 h-px",
            "bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent",
            className,
        )}
        role="separator"
        {...props}
    />
);
DropdownSeparator.displayName = "DropdownSeparator";

const DropdownLabel = ({
    className,
    children,
    ...props
}: DropdownLabelProps) => (
    <div
        className={cn(
            "px-3 py-2 text-xs font-semibold uppercase tracking-wider",
            "text-[var(--color-text-tertiary)]",
            className,
        )}
        role="presentation"
        {...props}
    >
        {children}
    </div>
);
DropdownLabel.displayName = "DropdownLabel";

const DropdownGroup = ({
    className,
    children,
    label,
    ...props
}: DropdownGroupProps) => (
    <div className={cn("py-1", className)} role="group" {...props}>
        {label && <DropdownLabel>{label}</DropdownLabel>}
        {children}
    </div>
);
DropdownGroup.displayName = "DropdownGroup";

const DropdownShortcut = ({
    className,
    children,
    ...props
}: DropdownShortcutProps) => (
    <span
        className={cn(
            "ml-auto text-xs tracking-widest text-[var(--color-text-tertiary)] font-mono",
            className,
        )}
        {...props}
    >
        {children}
    </span>
);
DropdownShortcut.displayName = "DropdownShortcut";

const DropdownMenuNamespace = Object.assign(DropdownMenu, {
    Trigger: DropdownTrigger,
    Content: DropdownContent,
    Item: DropdownItem,
    Separator: DropdownSeparator,
    Label: DropdownLabel,
    Group: DropdownGroup,
    Shortcut: DropdownShortcut,
});

export default DropdownMenuNamespace;
