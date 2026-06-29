import {
    InputHTMLAttributes,
    TextareaHTMLAttributes,
    SelectHTMLAttributes,
    ReactNode,
    RefObject,
} from "react";

export type InputVariant =
    | "default"
    | "outline"
    | "filled"
    | "underline"
    | "ghost";
export type InputSize = "xs" | "sm" | "md" | "lg" | "xl";
export type InputStatus = "default" | "success" | "warning" | "error";

export type InputColorScheme =
    | "gray"
    | "blue"
    | "green"
    | "red"
    | "yellow"
    | "purple"
    | "pink";

export interface BaseInputProps {
    label?: string;
    placeholder?: string;
    error?: string | string[];
    success?: string;
    warning?: string;
    hint?: string;
    variant?: InputVariant;
    size?: InputSize;
    status?: InputStatus;
    colorScheme?: InputColorScheme;
    required?: boolean;
    optional?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
    className?: string;
    containerClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    leftAddon?: ReactNode;
    rightAddon?: ReactNode;
    helperText?: string;
    showOptionalText?: boolean;
    showRequiredIndicator?: boolean;
}

// Standard Text Input
export interface InputProps
    extends
        Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    clearable?: boolean;
    onClear?: () => void;
    maxLength?: number;
    showCharCount?: boolean;
}

// Number Input
export interface NumberInputProps
    extends
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "size" | "type" | "value" | "onChange"
        >,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    value?: number | null;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (value: number | null, formattedValue: string) => void;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    allowNegative?: boolean;
    allowDecimal?: boolean;
    thousandSeparator?: string;
    decimalSeparator?: string;
    prefix?: string;
    suffix?: string;
    clampValueOnBlur?: boolean;
    keepWithinRange?: boolean;
}

// Textarea
export interface TextareaProps
    extends
        Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
        BaseInputProps {
    textareaRef?: RefObject<HTMLTextAreaElement>;
    minRows?: number;
    maxRows?: number;
    autoResize?: boolean;
    maxLength?: number;
    showCharCount?: boolean;
    showCharacterCount?: boolean;
    resize?: "none" | "vertical" | "horizontal" | "both";
}

export interface TimeInputProps
    extends
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "size" | "type" | "value" | "onChange"
        >,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (time: string | null) => void;
    format?: "12" | "24";
    step?: number;
    min?: string;
    max?: string;
    showSeconds?: boolean;
    showPicker?: boolean;
    timeOptions?: { value: string; label: string }[];
    interval?: number;
    use12Hour?: boolean;
    ampmLabels?: { am: string; pm: string };
    clearable?: boolean;
    onClear?: () => void;
    autoFormat?: boolean;
    placeholder?: string;
}

// Select Option
export interface SelectOption {
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    group?: string;
    data?: any;
}

// Select
export interface SelectProps
    extends
        Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">,
        BaseInputProps {
    selectRef?: RefObject<HTMLSelectElement>;
    options: SelectOption[];
    placeholder?: string;
    searchable?: boolean;
    clearable?: boolean;
    multiple?: boolean;
    maxSelectedItems?: number;
    groupBy?: string;
    onSearch?: (searchTerm: string) => void;
    onClear?: () => void;
    renderOption?: (option: SelectOption) => ReactNode;
    renderSelectedValue?: (option: SelectOption | SelectOption[]) => ReactNode;
    loading?: boolean;
    loadingText?: string;
    noOptionsText?: string;
    createOption?: boolean;
    onCreateOption?: (
        inputValue: string,
    ) => SelectOption | Promise<SelectOption>;
}

// Checkbox Variant Type
export type CheckboxVariant = "default" | "switch";

// Checkbox
export interface CheckboxProps
    extends
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "size" | "type" | "onChange"
        >,
        Omit<BaseInputProps, "variant"> {
    checkboxRef?: RefObject<HTMLInputElement>;
    indeterminate?: boolean;
    children?: ReactNode;
    description?: string;
    colorScheme?: InputColorScheme;
    iconColor?: string;
    spacing?: "tight" | "normal" | "loose";
    isInvalid?: boolean;
    isChecked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    containerClassName?: string;
    success?: string;
    warning?: string;
    variant?: CheckboxVariant;
}

// Radio
export interface RadioOption {
    value: string | number;
    label: string;
    description?: string;
    disabled?: boolean;
    icon?: ReactNode;
}

export interface RadioProps
    extends
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "size" | "type" | "onChange"
        >,
        BaseInputProps {
    radioRef?: RefObject<HTMLInputElement>;
    options: RadioOption[];
    direction?: "row" | "column";
    spacing?: "tight" | "normal" | "loose";
    colorScheme?: InputColorScheme;
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (value: string | number) => void;
}

// File Input
export interface FileInputProps
    extends
        Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxFileSize?: number; // in bytes
    allowedFileTypes?: string[];
    onFileSelect?: (files: File[]) => void;
    onFileRemove?: (index: number) => void;
    preview?: boolean;
    dragAndDrop?: boolean;
    uploadProgress?: number[];
    files?: File[];
    showFileList?: boolean;
    placeholder?: string;
    dropzoneText?: string;
    browseText?: string;
    removeText?: string;
    fileListClassName?: string;
}

// Date Input
export interface DateInputProps
    extends
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "size" | "type" | "value" | "onChange"
        >,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    value?: Date | string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (date: Date | string | null) => void;
    min?: string;
    max?: string;
    clearable?: boolean;
    onClear?: () => void;
    format?: string;
    showCalendarIcon?: boolean;
    dateFormat?: "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
    locale?: string;
    disabledDates?: Date[] | ((date: Date) => boolean);
    highlightedDates?: Date[];
    minDate?: Date;
    maxDate?: Date;
    showWeekNumbers?: boolean;
    firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

// Search Input
export interface SearchInputProps
    extends
        Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    debounceMs?: number;
    searchOnType?: boolean;
    onSearch?: (searchTerm: string) => void;
    onClear?: () => void;
    searchIcon?: ReactNode;
    clearIcon?: ReactNode;
    showRecentSearches?: boolean;
    recentSearches?: string[];
    onRecentSearchClick?: (search: string) => void;
    suggestions?: string[];
    onSuggestionClick?: (suggestion: string) => void;
    showSuggestions?: boolean;
    maxSuggestions?: number;
    highlightMatches?: boolean;
}

// Password Input
export interface PasswordInputProps
    extends
        Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    showPasswordToggle?: boolean;
    showPasswordStrength?: boolean;
    strengthLevels?: string[];
    strengthColors?: string[];
    strengthLabels?: string[];
    onStrengthChange?: (strength: number, score: number) => void;
    visibilityIcon?: ReactNode;
    hiddenIcon?: ReactNode;
    generatePassword?: boolean;
    onGeneratePassword?: () => string;
    copyToClipboard?: boolean;
    onCopy?: () => void;
}

// Toggle/Switch
export interface ToggleSwitchProps
    extends
        Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "size" | "type" | "checked" | "onChange"
        >,
        BaseInputProps {
    inputRef?: RefObject<HTMLInputElement>;
    description?: string;
    colorScheme?: InputColorScheme;
    showIcons?: boolean;
    onText?: string;
    offText?: string;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (
        checked: boolean,
        event: React.ChangeEvent<HTMLInputElement>,
    ) => void;
}

// Pin Input
export interface PinInputProps extends BaseInputProps {
    length?: number;
    type?: "number" | "alphanumeric";
    mask?: boolean;
    placeholder?: string;
    spacing?: string;
    autoFocus?: boolean;
    onComplete?: (pin: string) => void;
    onChange?: (pin: string) => void;
    onPaste?: (pin: string) => void;
    value?: string;
    defaultValue?: string;
    manageFocus?: boolean;
    allowPaste?: boolean;
    inputMode?: "numeric" | "text";
}

// Input Group (for compound inputs)
export interface InputGroupProps {
    children: ReactNode;
    className?: string;
    spacing?: "tight" | "normal" | "loose";
    direction?: "row" | "column";
    align?: "start" | "center" | "end" | "stretch";
    wrap?: boolean;
}

// Form Control (wrapper for all inputs)
export interface FormControlProps {
    children: ReactNode;
    isRequired?: boolean;
    isDisabled?: boolean;
    isInvalid?: boolean;
    isReadOnly?: boolean;
    className?: string;
    spacing?: "tight" | "normal" | "loose";
}

// Input validation rules
export interface ValidationRule {
    required?: boolean | string;
    minLength?: number | { value: number; message: string };
    maxLength?: number | { value: number; message: string };
    min?: number | { value: number; message: string };
    max?: number | { value: number; message: string };
    pattern?: RegExp | { value: RegExp; message: string };
    validate?: (value: any) => boolean | string | Promise<boolean | string>;
    custom?: (value: any) => boolean | string | Promise<boolean | string>;
}

// Input theme configuration
export interface InputTheme {
    variants: Record<InputVariant, string>;
    sizes: Record<InputSize, string>;
    colors: Record<InputColorScheme, string>;
    status: Record<InputStatus, string>;
    defaults: {
        variant: InputVariant;
        size: InputSize;
        colorScheme: InputColorScheme;
    };
}

// Helper type for input refs
export type InputRef<T = HTMLInputElement> = RefObject<T>;

// Event handlers
export interface InputEventHandlers {
    onFocus?: (event: React.FocusEvent) => void;
    onBlur?: (event: React.FocusEvent) => void;
    onChange?: (event: React.ChangeEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    onKeyPress?: (event: React.KeyboardEvent) => void;
    onClick?: (event: React.MouseEvent) => void;
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
}

// Accessibility props
export interface InputAccessibilityProps {
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-required"?: boolean;
    "aria-invalid"?: boolean;
    "aria-expanded"?: boolean;
    "aria-controls"?: string;
    "aria-activedescendant"?: string;
    role?: string;
    tabIndex?: number;
}
