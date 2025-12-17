"use client";

// Re-export from global theme context for backwards compatibility
// All components using the old local useTheme will now use the global theme
export { useGlobalTheme as useTheme, useGlobalTheme } from "@/app/context/GlobalThemeContext";
