import React, { useState, useEffect, useCallback } from "react";
import Autosuggest from "react-autosuggest";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { useGooglePlacesAutocomplete } from "@/Hooks/useGooglePlacesAutocomplete";
import { cn } from "@/lib/utils";

interface PlacesAutocompleteInputProps {
    apiKey: string;
    label?: string;
    value: string;
    onChange: (value: string) => void;
    onPlaceSelected: (details: {
        latitude: number;
        longitude: number;
        formattedAddress: string;
        addressComponents?: any[];
    }) => void;
    error?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    hint?: string;
    locationBias?: {
        north: number;
        south: number;
        east: number;
        west: number;
    } | null;
}

const PlacesAutocompleteInput: React.FC<PlacesAutocompleteInputProps> = ({
    apiKey,
    label,
    value,
    onChange,
    onPlaceSelected,
    error,
    placeholder = "Cari alamat...",
    required = false,
    disabled = false,
    className,
    hint,
    locationBias,
}) => {
    const {
        suggestions,
        isLoading,
        fetchSuggestions,
        getPlaceDetails,
        isLoaded,
    } = useGooglePlacesAutocomplete(apiKey);

    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
        fetchSuggestions(value, locationBias || undefined);
    };

    const onSuggestionsClearRequested = () => {};

    const getSuggestionValue = (suggestion: any) => suggestion.description;

    const renderSuggestion = (suggestion: any) => (
        <div className="flex items-start gap-3 p-3 hover:bg-[var(--color-gray-50)] transition-colors cursor-pointer border-b border-[var(--color-border)] last:border-0">
            <MapPin className="w-5 h-5 mt-0.5 text-[var(--color-text-tertiary)] flex-shrink-0" />
            <span className="text-sm text-[var(--color-text-primary)]">
                {suggestion.description}
            </span>
        </div>
    );

    const onSuggestionSelected = async (
        event: any,
        { suggestion }: { suggestion: any }
    ) => {
        const details = await getPlaceDetails(suggestion.placeId);
        if (details) {
            onPlaceSelected(details);
        }
    };

    const inputProps = {
        placeholder,
        value: inputValue,
        onChange: (e: any, { newValue }: { newValue: string }) => {
            setInputValue(newValue);
            onChange(newValue);
        },
        disabled: disabled || !isLoaded,
        className: cn(
            "form-input w-full h-11 pl-11 pr-10 text-base transition-all duration-200",
            "bg-[var(--color-surface)] border-[var(--color-border)]",
            "focus:border-[var(--color-primary-500)] focus:ring-[var(--color-primary-500)]",
            "disabled:bg-[var(--color-gray-100)] disabled:cursor-not-allowed",
            error && "border-[var(--color-error-500)] focus:border-[var(--color-error-500)] focus:ring-[var(--color-error-500)]",
            className
        ),
    };

    const theme = {
        container: "relative w-full",
        suggestionsContainer: "absolute z-50 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl max-h-64 overflow-y-auto",
        suggestionsList: "list-none p-0 m-0",
        suggestion: "m-0",
        suggestionHighlighted: "bg-[var(--color-gray-50)]",
    };

    return (
        <div className="flex flex-col w-full gap-1.5">
            {label && (
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    {label}
                    {required && <span className="ml-1 text-[var(--color-error-500)]">*</span>}
                </label>
            )}

            <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3.5 z-10 pointer-events-none">
                    <Search className="w-5 h-5 text-[var(--color-text-tertiary)]" />
                </div>

                <Autosuggest
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    onSuggestionSelected={onSuggestionSelected}
                    inputProps={inputProps}
                    theme={theme}
                />

                <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 z-10">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary-500)]" />
                    ) : inputValue ? (
                        <button
                            type="button"
                            onClick={() => {
                                setInputValue("");
                                onChange("");
                            }}
                            className="p-1 rounded-full hover:bg-[var(--color-gray-100)] text-[var(--color-text-tertiary)] transition-colors"
                        >
                            <X size={14} />
                        </button>
                    ) : null}
                </div>
            </div>

            {error && (
                <p className="text-xs font-medium text-[var(--color-error-600)]">
                    {error}
                </p>
            )}
            {hint && !error && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                    {hint}
                </p>
            )}
        </div>
    );
};

export default PlacesAutocompleteInput;
