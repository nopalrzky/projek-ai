import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.{js,ts,jsx,tsx}",
    ],

    darkMode: ["class"],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", ...defaultTheme.fontFamily.sans],
                mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
            },

            colors: {
                primary: {
                    50: "var(--color-primary-50)",
                    100: "var(--color-primary-100)",
                    200: "var(--color-primary-200)",
                    300: "var(--color-primary-300)",
                    400: "var(--color-primary-400)",
                    500: "var(--color-primary-500)",
                    600: "var(--color-primary-600)",
                    700: "var(--color-primary-700)",
                    800: "var(--color-primary-800)",
                    900: "var(--color-primary-900)",
                    950: "var(--color-primary-950)",
                    DEFAULT: "var(--color-primary-500)",
                },
                secondary: {
                    50: "var(--color-secondary-50)",
                    100: "var(--color-secondary-100)",
                    200: "var(--color-secondary-200)",
                    300: "var(--color-secondary-300)",
                    400: "var(--color-secondary-400)",
                    500: "var(--color-secondary-500)",
                    600: "var(--color-secondary-600)",
                    700: "var(--color-secondary-700)",
                    800: "var(--color-secondary-800)",
                    900: "var(--color-secondary-900)",
                    950: "var(--color-secondary-950)",
                    DEFAULT: "var(--color-secondary-500)",
                },

                success: {
                    50: "var(--color-success-50)",
                    100: "var(--color-success-100)",
                    200: "var(--color-success-200)",
                    300: "var(--color-success-300)",
                    400: "var(--color-success-400)",
                    500: "var(--color-success-500)",
                    600: "var(--color-success-600)",
                    700: "var(--color-success-700)",
                    800: "var(--color-success-800)",
                    900: "var(--color-success-900)",
                    950: "var(--color-success-950)",
                    DEFAULT: "var(--color-success-500)",
                },
                warning: {
                    50: "var(--color-warning-50)",
                    100: "var(--color-warning-100)",
                    200: "var(--color-warning-200)",
                    300: "var(--color-warning-300)",
                    400: "var(--color-warning-400)",
                    500: "var(--color-warning-500)",
                    600: "var(--color-warning-600)",
                    700: "var(--color-warning-700)",
                    800: "var(--color-warning-800)",
                    900: "var(--color-warning-900)",
                    950: "var(--color-warning-950)",
                    DEFAULT: "var(--color-warning-500)",
                },
                error: {
                    50: "var(--color-error-50)",
                    100: "var(--color-error-100)",
                    200: "var(--color-error-200)",
                    300: "var(--color-error-300)",
                    400: "var(--color-error-400)",
                    500: "var(--color-error-500)",
                    600: "var(--color-error-600)",
                    700: "var(--color-error-700)",
                    800: "var(--color-error-800)",
                    900: "var(--color-error-900)",
                    950: "var(--color-error-950)",
                    DEFAULT: "var(--color-error-500)",
                },
                info: {
                    50: "var(--color-info-50)",
                    100: "var(--color-info-100)",
                    200: "var(--color-info-200)",
                    300: "var(--color-info-300)",
                    400: "var(--color-info-400)",
                    500: "var(--color-info-500)",
                    600: "var(--color-info-600)",
                    700: "var(--color-info-700)",
                    800: "var(--color-info-800)",
                    900: "var(--color-info-900)",
                    950: "var(--color-info-950)",
                    DEFAULT: "var(--color-info-500)",
                },

                background: "var(--color-background)",
                surface: "var(--color-surface)",
                border: "var(--color-border)",
                "border-light": "var(--color-border-light)",
                text: {
                    primary: "var(--color-text-primary)",
                    secondary: "var(--color-text-secondary)",
                    tertiary: "var(--color-text-tertiary)",
                    DEFAULT: "var(--color-text-primary)",
                },

                accent: {
                    50: "var(--color-accent-50)",
                    100: "var(--color-accent-100)",
                    200: "var(--color-accent-200)",
                    300: "var(--color-accent-300)",
                    400: "var(--color-accent-400)",
                    500: "var(--color-accent-500)",
                    600: "var(--color-accent-600)",
                    700: "var(--color-accent-700)",
                    800: "var(--color-accent-800)",
                    900: "var(--color-accent-900)",
                    950: "var(--color-accent-950)",
                    DEFAULT: "var(--color-accent-500)",
                },
                purple: {
                    50: "var(--color-purple-50)",
                    100: "var(--color-purple-100)",
                    200: "var(--color-purple-200)",
                    300: "var(--color-purple-300)",
                    400: "var(--color-purple-400)",
                    500: "var(--color-purple-500)",
                    600: "var(--color-purple-600)",
                    700: "var(--color-purple-700)",
                    800: "var(--color-purple-800)",
                    900: "var(--color-purple-900)",
                    950: "var(--color-purple-950)",
                    DEFAULT: "var(--color-purple-500)",
                },
                rose: {
                    50: "var(--color-rose-50)",
                    100: "var(--color-rose-100)",
                    200: "var(--color-rose-200)",
                    300: "var(--color-rose-300)",
                    400: "var(--color-rose-400)",
                    500: "var(--color-rose-500)",
                    600: "var(--color-rose-600)",
                    700: "var(--color-rose-700)",
                    800: "var(--color-rose-800)",
                    900: "var(--color-rose-900)",
                    950: "var(--color-rose-950)",
                    DEFAULT: "var(--color-rose-500)",
                },
            },

            spacing: {
                18: "4.5rem",
                88: "22rem",
                112: "28rem",
                128: "32rem",
            },

            boxShadow: {
                sm: "var(--shadow-sm)",
                md: "var(--shadow-md)",
                lg: "var(--shadow-lg)",
                xl: "var(--shadow-xl)",
                "2xl": "var(--shadow-2xl)",
                glow: "0 0 20px rgb(59 130 246 / 0.5)",
                "glow-lg": "0 0 40px rgb(59 130 246 / 0.6)",
            },

            animation: {
                "fade-in": "fadeIn 0.4s ease-out",
                "fade-in-up": "fadeInUp 0.6s ease-out forwards",
                "slide-in-right": "slideInRight 0.5s ease-out",

                "bounce-slow": "bounce 2s infinite",
                "bounce-x": "bounceX 2s infinite",

                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",

                "spin-slow": "spin 8s linear infinite",
                "spin-reverse": "reverse-spin 6s linear infinite",

                shimmer: "shimmer 2s infinite",
                twinkle: "twinkle 2s infinite",
                float: "float 3s ease-in-out infinite",

                "gradient-x": "gradient-x 3s ease infinite",
                "gradient-y": "gradient-y 3s ease infinite",
                "text-shimmer": "text-shimmer 2s ease-in-out infinite",
            },

            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                fadeInUp: {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideInRight: {
                    "0%": { opacity: "0", transform: "translateX(30px)" },
                    "100%": { opacity: "1", transform: "translateX(0)" },
                },
                bounceX: {
                    "0%, 100%": { transform: "translateX(0)" },
                    "50%": { transform: "translateX(25%)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                twinkle: {
                    "0%, 100%": { opacity: "0", transform: "scale(0.8)" },
                    "50%": { opacity: "1", transform: "scale(1.2)" },
                },
                "reverse-spin": {
                    "0%": { transform: "rotate(360deg)" },
                    "100%": { transform: "rotate(0deg)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                "gradient-x": {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
                "gradient-y": {
                    "0%, 100%": { backgroundPosition: "50% 0%" },
                    "50%": { backgroundPosition: "50% 100%" },
                },
                "text-shimmer": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "100%": { backgroundPosition: "100% 50%" },
                },
            },

            backdropBlur: {
                xs: "2px",
            },

            borderRadius: {
                "4xl": "2rem",
                "5xl": "2.5rem",
            },

            transitionDuration: {
                400: "400ms",
                600: "600ms",
                800: "800ms",
                900: "900ms",
            },

            zIndex: {
                60: "60",
                70: "70",
                80: "80",
                90: "90",
                100: "100",
            },

            fontSize: {
                "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
                "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
                "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
                "5xl": ["3rem", { lineHeight: "1" }],
                "6xl": ["3.75rem", { lineHeight: "1" }],
                "7xl": ["4.5rem", { lineHeight: "1" }],
                "8xl": ["6rem", { lineHeight: "1" }],
                "9xl": ["8rem", { lineHeight: "1" }],
            },

            lineHeight: {
                "extra-loose": "2.5",
                12: "3rem",
            },

            letterSpacing: {
                "extra-wide": "0.2em",
            },

            containers: {
                "2xs": "16rem",
                xs: "20rem",
                sm: "24rem",
                md: "28rem",
                lg: "32rem",
                xl: "36rem",
                "2xl": "42rem",
                "3xl": "48rem",
                "4xl": "56rem",
                "5xl": "64rem",
                "6xl": "72rem",
                "7xl": "80rem",
            },

            aspectRatio: {
                "4/3": "4 / 3",
                "3/2": "3 / 2",
                "2/3": "2 / 3",
                "9/16": "9 / 16",
            },
        },
    },

    plugins: [
        forms,
        typography,
        function ({ addUtilities, theme }) {
            const newUtilities = {
                ".text-gradient": {
                    background:
                        "linear-gradient(45deg, var(--color-primary-500), var(--color-secondary-500))",
                    "-webkit-background-clip": "text",
                    "background-clip": "text",
                    "-webkit-text-fill-color": "transparent",
                },
                ".text-gradient-primary": {
                    background:
                        "linear-gradient(45deg, var(--color-primary-400), var(--color-primary-600))",
                    "-webkit-background-clip": "text",
                    "background-clip": "text",
                    "-webkit-text-fill-color": "transparent",
                },

                ".glass-light": {
                    background: "rgba(255, 255, 255, 0.7)",
                    "backdrop-filter": "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                },
                ".glass-dark": {
                    background: "rgba(17, 24, 39, 0.7)",
                    "backdrop-filter": "blur(10px)",
                    border: "1px solid rgba(55, 65, 81, 0.3)",
                },

                ".scrollbar-hide": {
                    "-ms-overflow-style": "none",
                    "scrollbar-width": "none",
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                },
                ".scrollbar-thin": {
                    "scrollbar-width": "thin",
                    "&::-webkit-scrollbar": {
                        width: "6px",
                        height: "6px",
                    },
                },
            };

            addUtilities(newUtilities);
        },
    ],
};
