import React, {
    forwardRef,
    useState,
    useEffect,
    useRef,
    useCallback,
} from "react";
import Autosuggest, {
    SuggestionsFetchRequestedParams,
    SuggestionSelectedEventData,
    RenderSuggestionParams,
    InputProps as AutosuggestInputProps,
} from "react-autosuggest";
import { Search as SearchIcon, X, Clock, Loader2 } from "lucide-react";
import { SearchInputProps } from "./types";
import Button from "@/Components/Button/Button";
import { cn } from "@/lib/utils";

// Types for autosuggest
interface SuggestionItem {
    type: "recent" | "suggestion";
    value: string;
    subtitle?: string;
}

interface SectionData {
    title: string;
    suggestions: SuggestionItem[];
}

const Search = forwardRef<HTMLInputElement, SearchInputProps>(
    (
        {
            label,
            placeholder = "Search...",
            error,
            success,
            warning,
            hint,
            variant = "default",
            size = "md",
            status = "default",
            disabled = false,
            loading = false,
            fullWidth = true,
            className = "",
            containerClassName = "",
            searchIcon,
            clearIcon,
            onSearch,
            onClear,
            showRecentSearches = false,
            recentSearches = [],
            onRecentSearchClick,
            suggestions = [],
            onSuggestionClick,
            showSuggestions = false,
            maxSuggestions = 5,
            highlightMatches = true,
            debounceMs = 300,
            searchOnType = true,
            value,
            onChange,
            onFocus,
            onBlur,
            id,
            inputRef,
            ...props
        },
        ref,
    ) => {
        const [searchValue, setSearchValue] = useState(String(value || ""));
        const [isFocused, setIsFocused] = useState(false);
        const [suggestionSections, setSuggestionSections] = useState<
            SectionData[]
        >([]);

        const searchRef = useRef<HTMLInputElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);

        const inputId =
            id || `search-${Math.random().toString(36).substr(2, 9)}`;
        const actualStatus = error
            ? "error"
            : success
              ? "success"
              : warning
                ? "warning"
                : status;

        // Icon size mapping
        const iconSizeClasses = {
            xs: 12,
            sm: 14,
            md: 16,
            lg: 18,
            xl: 20,
        };

        // Handle suggestions fetch
        const onSuggestionsFetchRequested = useCallback(
            ({ value: query }: SuggestionsFetchRequestedParams) => {
                const sections: SectionData[] = [];

                // Filter recent searches
                if (showRecentSearches && query.length > 0) {
                    const filteredRecentSearches = recentSearches
                        .filter(
                            (search) =>
                                search
                                    .toLowerCase()
                                    .includes(query.toLowerCase()) &&
                                search !== query,
                        )
                        .slice(0, 3)
                        .map((search) => ({
                            type: "recent" as const,
                            value: search,
                        }));

                    if (filteredRecentSearches.length > 0) {
                        sections.push({
                            title: "Pencarian Terkini",
                            suggestions: filteredRecentSearches,
                        });
                    }
                }

                // Filter suggestions
                if (showSuggestions && query.length > 0) {
                    const filteredSuggestions = suggestions
                        .filter((suggestion) =>
                            suggestion
                                .toLowerCase()
                                .includes(query.toLowerCase()),
                        )
                        .slice(0, maxSuggestions)
                        .map((suggestion) => ({
                            type: "suggestion" as const,
                            value: suggestion,
                        }));

                    if (filteredSuggestions.length > 0) {
                        sections.push({
                            title: "Saran",
                            suggestions: filteredSuggestions,
                        });
                    }
                }

                setSuggestionSections(sections);
            },
            [
                showRecentSearches,
                recentSearches,
                showSuggestions,
                suggestions,
                maxSuggestions,
            ],
        );

        // Handle suggestions clear
        const onSuggestionsClearRequested = useCallback(() => {
            setSuggestionSections([]);
        }, []);

        // Handle suggestion selection
        const onSuggestionSelected = useCallback(
            (
                event: React.FormEvent<any>,
                { suggestion }: SuggestionSelectedEventData<SuggestionItem>,
            ) => {
                setSearchValue(suggestion.value);

                if (suggestion.type === "recent") {
                    onRecentSearchClick?.(suggestion.value);
                } else {
                    onSuggestionClick?.(suggestion.value);
                }

                onSearch?.(suggestion.value);
            },
            [onRecentSearchClick, onSuggestionClick, onSearch],
        );

        // Get suggestion value
        const getSuggestionValue = useCallback(
            (suggestion: SuggestionItem) => suggestion.value,
            [],
        );

        // Get section suggestions
        const getSectionSuggestions = useCallback(
            (section: SectionData) => section.suggestions,
            [],
        );

        // Render section title with dark mode support
        const renderSectionTitle = useCallback(
            (section: SectionData) => (
                <div
                    className="px-3 py-2 text-xs font-medium uppercase tracking-wide border-b"
                    style={{
                        color: "var(--color-text-tertiary)",
                        borderColor: "var(--color-border)",
                    }}
                >
                    {section.title}
                </div>
            ),
            [],
        );

        // Highlight matches in text
        const highlightText = useCallback(
            (text: string, query: string) => {
                if (!highlightMatches || !query) return text;

                const regex = new RegExp(`(${query})`, "gi");
                const parts = text.split(regex);

                return parts.map((part, index) =>
                    regex.test(part) ? (
                        <mark
                            key={index}
                            className="rounded px-0.5"
                            style={{
                                backgroundColor: "var(--color-warning-200)",
                                color: "var(--color-warning-800)",
                            }}
                        >
                            {part}
                        </mark>
                    ) : (
                        part
                    ),
                );
            },
            [highlightMatches],
        );

        // Render suggestion with dark mode support
        const renderSuggestion = useCallback(
            (suggestion: SuggestionItem, { query }: RenderSuggestionParams) => (
                <div className="flex items-center gap-3 transition-colors duration-150">
                    {suggestion.type === "recent" ? (
                        <Clock
                            size={16}
                            className="flex-shrink-0"
                            style={{ color: "var(--color-text-quaternary)" }}
                        />
                    ) : (
                        <SearchIcon
                            size={16}
                            className="flex-shrink-0"
                            style={{ color: "var(--color-text-quaternary)" }}
                        />
                    )}
                    <span
                        className="truncate"
                        style={{ color: "var(--color-text-primary)" }}
                    >
                        {highlightText(suggestion.value, query)}
                    </span>
                </div>
            ),
            [highlightText],
        );

        // Handle input change
        const handleChange = useCallback(
            (
                event: React.FormEvent<any>,
                { newValue }: { newValue: string },
            ) => {
                setSearchValue(newValue);

                // Call original onChange
                if (onChange) {
                    const syntheticEvent = {
                        target: { value: newValue },
                        currentTarget: { value: newValue },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(syntheticEvent);
                }
            },
            [onChange],
        );

        // Handle focus with dark mode
        const handleFocus = useCallback(
            (event: React.FocusEvent<HTMLInputElement>) => {
                setIsFocused(true);
                onFocus?.(event);
            },
            [onFocus],
        );

        // Handle blur with dark mode
        const handleBlur = useCallback(
            (event: React.FocusEvent<HTMLElement>) => {
                setTimeout(() => {
                    setIsFocused(false);
                    onBlur?.(event as React.FocusEvent<HTMLInputElement>);
                }, 150);
            },
            [onBlur],
        );

        // Handle form submission
        const handleSubmit = useCallback(
            (e: React.FormEvent) => {
                e.preventDefault();
                onSearch?.(searchValue);
            },
            [onSearch, searchValue],
        );

        // Handle clear
        const handleClear = useCallback(() => {
            setSearchValue("");
            onClear?.();
            searchRef.current?.focus();
        }, [onClear]);

        // Base classes for input with dark mode
        const baseClasses = cn(
            "transition-all duration-200 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            disabled && "cursor-not-allowed",
            fullWidth ? "w-full" : "w-auto",
        );

        // Variant classes with dark mode support
        const variantClasses = {
            default: cn(
                "border rounded-lg",
                "focus:ring-2",
                actualStatus === "error" && [
                    "border-red-500 focus:border-red-500",
                    "focus:ring-red-500/20",
                ],
                actualStatus === "success" && [
                    "border-green-500 focus:border-green-500",
                    "focus:ring-green-500/20",
                ],
                actualStatus === "warning" && [
                    "border-yellow-500 focus:border-yellow-500",
                    "focus:ring-yellow-500/20",
                ],
                actualStatus === "default" && [
                    "focus:ring-2",
                    "focus:ring-blue-500/20",
                ],
                disabled && "opacity-50",
                // Dark mode styles via CSS variables
                {
                    backgroundColor: "var(--color-surface)",
                    borderColor: isFocused
                        ? "var(--color-primary-500)"
                        : "var(--color-border)",
                    color: "var(--color-text-primary)",
                },
            ),
            outline: cn(
                "border-2 rounded-lg bg-transparent",
                "focus:ring-2",
                actualStatus === "error" &&
                    "border-red-500 focus:border-red-500 focus:ring-red-500/20",
                actualStatus === "default" && "focus:ring-blue-500/20",
                disabled && "opacity-50",
                {
                    borderColor: isFocused
                        ? "var(--color-primary-500)"
                        : "var(--color-border)",
                    color: "var(--color-text-primary)",
                },
            ),
            filled: cn(
                "border border-transparent rounded-lg",
                "focus:ring-2 focus:ring-blue-500/20",
                disabled && "opacity-50",
                {
                    backgroundColor: isFocused
                        ? "var(--color-surface)"
                        : "var(--color-gray-50)",
                    borderColor: isFocused
                        ? "var(--color-primary-500)"
                        : "transparent",
                    color: "var(--color-text-primary)",
                },
            ),
            underline: cn(
                "border-0 border-b-2 rounded-none bg-transparent",
                "focus:ring-0",
                actualStatus === "default" && "focus:border-blue-500",
                disabled && "opacity-50",
                {
                    borderColor: isFocused
                        ? "var(--color-primary-500)"
                        : "var(--color-border)",
                    color: "var(--color-text-primary)",
                },
            ),
            ghost: cn(
                "border border-transparent rounded-lg bg-transparent",
                "hover:bg-gray-50/50 focus:ring-2 focus:ring-gray-300/20",
                disabled && "hover:bg-transparent opacity-50",
                {
                    backgroundColor: isFocused
                        ? "var(--color-surface)"
                        : "transparent",
                    borderColor: isFocused
                        ? "var(--color-border)"
                        : "transparent",
                    color: "var(--color-text-primary)",
                },
            ),
        };

        // Size classes
        const sizeClasses = {
            xs: "px-8 py-1 text-xs pl-8",
            sm: "px-9 py-1.5 text-sm pl-9",
            md: "px-10 py-2 text-base pl-10",
            lg: "px-11 py-2.5 text-lg pl-11",
            xl: "px-12 py-3 text-xl pl-12",
        };

        const inputClasses = cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[size],
            className,
        );

        // Autosuggest input props
        const inputProps: AutosuggestInputProps<SuggestionItem> = {
            id: inputId,
            placeholder,
            value: searchValue,
            onChange: handleChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
            disabled: disabled || loading,
            className: inputClasses,
            autoComplete: "off",
            ref: inputRef || searchRef,
            style: {
                backgroundColor: "var(--color-surface)",
                borderColor: isFocused
                    ? "var(--color-primary-500)"
                    : "var(--color-border)",
                color: "var(--color-text-primary)",
            },
            ...props,
        };

        const theme = {
            container: "relative",
            containerOpen: "relative",
            input: "",
            inputOpen: "",
            inputFocused: "",
            suggestionsContainer: cn(
                "absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto border",
                "backdrop-blur-sm",
            ),
            suggestionsContainerOpen: cn(
                "absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto border",
                "backdrop-blur-sm",
            ),
            suggestionsList: "",
            suggestion: cn(
                "w-full text-left px-3 py-2 cursor-pointer transition-colors duration-150",
                "hover:bg-opacity-80",
            ),
            suggestionHighlighted: "",
            sectionContainer: "",
            sectionContainerFirst: "",
            sectionTitle: "",
        };

        // Update search value when value prop changes
        useEffect(() => {
            if (value !== undefined && String(value) !== searchValue) {
                setSearchValue(String(value));
            }
        }, [value, searchValue]);

        // Optional type-to-search behavior, disabled when searchOnType is false.
        useEffect(() => {
            if (!searchOnType) {
                return;
            }

            const timeoutId = window.setTimeout(() => {
                onSearch?.(searchValue);
            }, debounceMs);

            return () => {
                window.clearTimeout(timeoutId);
            };
        }, [searchValue, searchOnType, debounceMs, onSearch]);

        return (
            <div
                className={cn("relative", containerClassName)}
                ref={containerRef}
            >
                {/* Label with dark mode */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className={cn(
                            "block text-sm font-medium mb-1.5",
                            disabled && "opacity-50",
                        )}
                        style={{
                            color:
                                actualStatus === "error"
                                    ? "var(--color-error-600)"
                                    : "var(--color-text-primary)",
                        }}
                    >
                        {label}
                    </label>
                )}

                {/* Search Input Container */}
                <form onSubmit={handleSubmit} className="relative">
                    {/* Search Icon */}
                    <div className="absolute left-0 top-0 h-full flex items-center pl-3 pointer-events-none z-10">
                        <div style={{ color: "var(--color-text-quaternary)" }}>
                            {searchIcon ? (
                                React.isValidElement(searchIcon) ? (
                                    React.cloneElement(searchIcon, {
                                        size: iconSizeClasses[size],
                                    } as any)
                                ) : (
                                    searchIcon
                                )
                            ) : (
                                <SearchIcon size={iconSizeClasses[size]} />
                            )}
                        </div>
                    </div>

                    {/* Autosuggest Component */}
                    <Autosuggest
                        multiSection={true}
                        suggestions={suggestionSections}
                        onSuggestionsFetchRequested={
                            onSuggestionsFetchRequested
                        }
                        onSuggestionsClearRequested={
                            onSuggestionsClearRequested
                        }
                        onSuggestionSelected={onSuggestionSelected}
                        getSuggestionValue={getSuggestionValue}
                        getSectionSuggestions={getSectionSuggestions}
                        renderSectionTitle={renderSectionTitle}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps}
                        theme={{
                            ...theme,
                            suggestionsContainer: cn(
                                theme.suggestionsContainer,
                                "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                            ),
                            suggestionsContainerOpen: cn(
                                theme.suggestionsContainerOpen,
                                "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                            ),
                            suggestion: cn(
                                theme.suggestion,
                                "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                            ),
                            suggestionHighlighted:
                                "bg-blue-50 dark:bg-blue-900/30",
                        }}
                        focusInputOnSuggestionClick={false}
                    />

                    {/* Right Icons */}
                    <div className="absolute right-0 top-0 h-full flex items-center pr-3 gap-1 z-10">
                        {/* Loading Spinner */}
                        {loading && (
                            <div
                                className="animate-spin"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                            >
                                <Loader2 size={iconSizeClasses[size]} />
                            </div>
                        )}

                        {/* Clear Button */}
                        {searchValue && !loading && (
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={handleClear}
                                disabled={disabled}
                                className="p-0 h-auto min-h-0 hover:opacity-80 transition-opacity"
                                style={{
                                    color: "var(--color-text-quaternary)",
                                }}
                                leftIcon={
                                    clearIcon ? (
                                        React.isValidElement(clearIcon) ? (
                                            React.cloneElement(clearIcon, {
                                                size: iconSizeClasses[size],
                                            } as any)
                                        ) : (
                                            clearIcon
                                        )
                                    ) : (
                                        <X size={iconSizeClasses[size]} />
                                    )
                                }
                            />
                        )}
                    </div>
                </form>

                {/* Helper Messages with dark mode */}
                <div className="mt-1 space-y-1">
                    {error && (
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-error-600)" }}
                        >
                            {Array.isArray(error) ? error[0] : error}
                        </p>
                    )}
                    {success && !error && (
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-success-600)" }}
                        >
                            {success}
                        </p>
                    )}
                    {warning && !error && !success && (
                        <p
                            className="text-sm"
                            style={{ color: "var(--color-warning-600)" }}
                        >
                            {warning}
                        </p>
                    )}
                    {hint && !error && !success && !warning && (
                        <p
                            className="text-xs"
                            style={{ color: "var(--color-text-tertiary)" }}
                        >
                            {hint}
                        </p>
                    )}
                </div>
            </div>
        );
    },
);

Search.displayName = "Search";

export default Search;
