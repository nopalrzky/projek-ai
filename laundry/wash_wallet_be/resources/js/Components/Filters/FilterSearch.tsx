import React, { useEffect, useState } from "react";
import { SearchInput } from "@/Components/Input";
import { FilterSearchProps } from "./types";

const FilterSearch: React.FC<FilterSearchProps> = ({
    value,
    onChange,
    onClear,
    placeholder = "Search...",
    disabled = false,
    className,
}) => {
    const [inputValue, setInputValue] = useState(value || "");

    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    return (
        <SearchInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onSearch={onChange}
            onClear={() => {
                setInputValue("");
                onClear?.();
                onChange("");
            }}
            placeholder={placeholder}
            disabled={disabled}
            debounceMs={0}
            searchOnType={false}
            size="md"
            variant="default"
            className={className}
        />
    );
};

export default FilterSearch;
