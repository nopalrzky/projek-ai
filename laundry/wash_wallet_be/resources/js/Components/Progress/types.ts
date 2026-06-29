export interface ProgressProps {
    /**
     * Current value of the progress
     */
    value: number;

    /**
     * Maximum value of the progress
     * @default 100
     */
    max?: number;

    /**
     * Visual variant of the progress bar
     * @default "primary"
     */
    variant?:
        | "primary"
        | "secondary"
        | "success"
        | "danger"
        | "warning"
        | "info";

    /**
     * Size of the progress bar
     * @default "md"
     */
    size?: "xs" | "sm" | "md" | "lg" | "xl";

    /**
     * Show percentage label
     * @default false
     */
    showLabel?: boolean;

    /**
     * Label position
     * @default "right"
     */
    labelPosition?: "top" | "right" | "bottom" | "inside";

    /**
     * Custom label text
     */
    label?: string;

    /**
     * Show animation
     * @default true
     */
    animated?: boolean;

    /**
     * Striped pattern
     * @default false
     */
    striped?: boolean;

    /**
     * Indeterminate progress (loading state)
     * @default false
     */
    indeterminate?: boolean;

    /**
     * Additional CSS classes for the container
     */
    className?: string;

    /**
     * Additional CSS classes for the bar
     */
    barClassName?: string;

    /**
     * Additional CSS classes for the label
     */
    labelClassName?: string;

    /**
     * Custom color for the progress bar
     */
    color?: string;

    /**
     * Show min/max labels
     * @default false
     */
    showMinMax?: boolean;

    /**
     * Custom min label
     */
    minLabel?: string;

    /**
     * Custom max label
     */
    maxLabel?: string;

    /**
     * Rounded corners
     * @default true
     */
    rounded?: boolean;

    /**
     * Thickness multiplier
     * @default 1
     */
    thickness?: number;
}

export interface LoadingSpinnerProps {
    /**
     * Size of the spinner
     * @default "md"
     */
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

    /**
     * Visual variant of the spinner
     * @default "primary"
     */
    variant?: "primary" | "secondary" | "white" | "black" | "current";

    /**
     * Display as fullscreen overlay
     * @default false
     */
    fullscreen?: boolean;

    /**
     * Label text below spinner
     */
    label?: string;

    /**
     * Spinner type
     * @default "spinner"
     */
    type?: "spinner" | "dots" | "pulse" | "bars";

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Show backdrop when fullscreen
     * @default true
     */
    backdrop?: boolean;

    /**
     * Backdrop opacity (0-100)
     * @default 80
     */
    backdropOpacity?: number;

    /**
     * Center alignment
     * @default false
     */
    center?: boolean;
}
