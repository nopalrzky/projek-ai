import React, { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ErrorItem, ErrorListProps } from ".";

const ErrorList: React.FC<ErrorListProps> = ({
    errors,
    title = "Errors Found",
    maxHeight = "400px",
    showRowNumber = true,
    showDataPreview = false,
    collapsible = false,
    defaultCollapsed = false,
    className,
    variant = "default",
}) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    if (errors.length === 0) return null;

    const renderErrorItem = (error: ErrorItem, index: number) => {
        if (variant === "compact") {
            return (
                <div
                    key={index}
                    className="px-3 py-2 text-sm text-red-700 dark:text-red-300 bg-white dark:bg-red-950 rounded border border-red-200 dark:border-red-800"
                >
                    {showRowNumber && (
                        <span className="font-semibold">Row {error.row}: </span>
                    )}
                    {error.errors.join(", ")}
                </div>
            );
        }

        return (
            <div
                key={index}
                className="p-4 bg-white dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 space-y-2"
            >
                <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    {showRowNumber && (
                        <span className="font-semibold text-red-900 dark:text-red-100">
                            Row {error.row}
                        </span>
                    )}
                </div>

                <ul className="space-y-1 ml-6">
                    {error.errors.map((err, errIndex) => (
                        <li
                            key={errIndex}
                            className="text-sm text-red-700 dark:text-red-300 list-disc"
                        >
                            {err}
                        </li>
                    ))}
                </ul>

                {showDataPreview && error.data && (
                    <details className="mt-3 text-xs">
                        <summary className="cursor-pointer text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                            Show data
                        </summary>
                        <pre className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded text-red-800 dark:text-red-200 overflow-x-auto">
                            {JSON.stringify(error.data, null, 2)}
                        </pre>
                    </details>
                )}
            </div>
        );
    };

    return (
        <div
            className={cn(
                "bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg",
                className,
            )}
        >
            <div
                className={cn(
                    "flex items-center justify-between p-4",
                    collapsible &&
                        "cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50",
                )}
                onClick={() => collapsible && setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-red-900 dark:text-red-100">
                            {title}
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                            {errors.length} error{errors.length > 1 ? "s" : ""}{" "}
                            found
                        </p>
                    </div>
                </div>

                {collapsible && (
                    <button
                        type="button"
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        aria-label={isCollapsed ? "Expand" : "Collapse"}
                    >
                        {isCollapsed ? (
                            <ChevronDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                            <ChevronUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                    </button>
                )}
            </div>

            {!isCollapsed && (
                <div className="px-4 pb-4">
                    <div
                        className={cn(
                            "space-y-2 overflow-auto",
                            variant === "compact" && "space-y-1",
                        )}
                        style={{ maxHeight }}
                    >
                        {errors.map((error, index) =>
                            renderErrorItem(error, index),
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

ErrorList.displayName = "ErrorList";

export default ErrorList;
