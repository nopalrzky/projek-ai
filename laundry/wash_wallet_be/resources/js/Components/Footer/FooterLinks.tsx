import React from "react";
import { Link } from "@inertiajs/react";
import { ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FooterLinksProps } from "./types";

const FooterLinks: React.FC<FooterLinksProps> = ({
    title,
    links,
    className,
    ...props
}) => {
    return (
        <div className={cn("flex flex-col space-y-4", className)} {...props}>
            {title && (
                <h3 className="text-sm sm:text-base font-bold tracking-wider uppercase text-[var(--color-text-primary)] relative inline-flex items-center gap-2">
                    <span className="w-1 h-4 bg-gradient-to-b from-[var(--color-primary-500)] to-[var(--color-primary-700)] rounded-full" />
                    {title}
                </h3>
            )}

            <ul className="space-y-3">
                {links.map((link, index) => {
                    const LinkComponent = link.external ? "a" : Link;
                    const linkProps = link.external
                        ? {
                              href: link.href,
                              target: "_blank",
                              rel: "noopener noreferrer",
                          }
                        : { href: link.href };

                    return (
                        <li key={index}>
                            <LinkComponent
                                {...linkProps}
                                className={cn(
                                    "group inline-flex items-center gap-2 text-sm font-medium transition-all duration-200",
                                    "text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)]",
                                    "dark:hover:text-[var(--color-primary-400)]",
                                    "hover:translate-x-1",
                                )}
                            >
                                <ChevronRight className="w-0 h-4 opacity-0 -ml-6 transition-all duration-200 group-hover:w-4 group-hover:opacity-100 group-hover:ml-0 text-[var(--color-primary-500)]" />
                                <span className="relative">
                                    {link.label}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-primary-700)] transition-all duration-200 group-hover:w-full" />
                                </span>
                                {link.external && (
                                    <ExternalLink className="w-3 h-3 opacity-0 -translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0" />
                                )}
                            </LinkComponent>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default FooterLinks;
