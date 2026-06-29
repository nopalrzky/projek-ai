export const isActiveLink = (href: string, currentPath: string): boolean => {
    if (href === "/") {
        return currentPath === "/";
    }
    return currentPath.startsWith(href);
};

export const getNavbarClasses = (
    sticky?: boolean,
    transparent?: boolean
): string => {
    const baseClasses = "w-full transition-all duration-300 ease-in-out";
    const stickyClasses = sticky ? "sticky top-0 z-50" : "";
    const backgroundClasses = transparent
        ? "bg-transparent"
        : "bg-white shadow-sm border-b border-gray-200";

    return `${baseClasses} ${stickyClasses} ${backgroundClasses}`.trim();
};
