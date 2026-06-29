import { SelectOption } from "@/Components/Input/types";

/**
 * Ensure value is proper type for select
 */
export function normalizeSelectValue(
    value: any,
    multiple: boolean = false
): string | number | (string | number)[] {
    if (multiple) {
        if (Array.isArray(value)) {
            return value.filter(
                (v): v is string | number =>
                    typeof v === "string" || typeof v === "number"
            );
        }
        return value ? [value as string | number] : [];
    }

    return value ?? "";
}

/**
 * Create select options from array
 */
export function createSelectOptions<T>(
    items: T[],
    labelKey: keyof T,
    valueKey: keyof T,
    options?: {
        descriptionKey?: keyof T;
        groupKey?: keyof T;
        iconRender?: (item: T) => React.ReactNode;
        disabledCondition?: (item: T) => boolean;
    }
): SelectOption[] {
    return items.map((item) => ({
        value: item[valueKey] as string | number,
        label: String(item[labelKey]),
        description: options?.descriptionKey
            ? String(item[options.descriptionKey])
            : undefined,
        group: options?.groupKey ? String(item[options.groupKey]) : undefined,
        icon: options?.iconRender?.(item),
        disabled: options?.disabledCondition?.(item) ?? false,
        data: item,
    }));
}

/**
 * Get selected option objects from values
 */
export function getSelectedOptions(
    values: (string | number)[],
    options: SelectOption[]
): SelectOption[] {
    return options.filter((option) => values.includes(option.value));
}
