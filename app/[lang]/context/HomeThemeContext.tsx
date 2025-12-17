"use client";

// Re-export from global theme context for backwards compatibility
// All components using the old HomeThemeContext will now use the global theme
export {
    useGlobalTheme as useHomeTheme,
    useGlobalTheme,
    GlobalThemeProvider as HomeThemeProvider
} from "@/app/context/GlobalThemeContext";
