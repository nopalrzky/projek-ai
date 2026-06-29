import React, { useState, useEffect } from "react";
import { cn, resolveStorageUrl } from "@/lib/utils";
import { AvatarImageProps } from "./types";

const AvatarImage: React.FC<AvatarImageProps> = ({
    src,
    alt,
    className,
    onLoadSuccess,
    onLoadError,
    ...props
}) => {
    const [status, setStatus] = useState<"loading" | "error" | "loaded">(
        "loading",
    );
    const resolvedSrc = resolveStorageUrl(src);

    useEffect(() => {
        if (!resolvedSrc) {
            setStatus("error");
            return;
        }

        const img = new Image();
        img.src = resolvedSrc;
        img.onload = () => {
            setStatus("loaded");
            onLoadSuccess?.();
        };
        img.onerror = () => {
            setStatus("error");
            onLoadError?.();
        };
    }, [resolvedSrc, onLoadSuccess, onLoadError]);

    if (status === "error" || !resolvedSrc) return null;

    return (
        <img
            src={resolvedSrc}
            alt={alt}
            className={cn("h-full w-full object-cover", className)}
            {...props}
        />
    );
};

export default AvatarImage;
