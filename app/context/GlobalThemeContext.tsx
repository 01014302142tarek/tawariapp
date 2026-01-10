"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";
type Theme = "light" | "dark";

interface GlobalThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
    isDark: boolean;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(undefined);

// Single localStorage key for the entire app
const THEME_STORAGE_KEY = "tawari-app-theme";

function getSystemTheme(): Theme {
    if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
}

export function GlobalThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Initialize theme on mount
    useEffect(() => {
        const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
        if (savedMode && ["system", "light", "dark"].includes(savedMode)) {
            const initialTheme = savedMode === "system" ? getSystemTheme() : savedMode;
            setThemeModeState(savedMode);
            setTheme(initialTheme);
        } else {
            // Default to dark theme
            setThemeModeState("dark");
            setTheme("dark");
        }
        setMounted(true);
    }, []);

    // Apply theme to document and handle system theme changes
    useEffect(() => {
        if (!mounted) return;

        // Apply data-theme attribute to html element
        document.documentElement.setAttribute("data-theme", theme);

        if (themeMode === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => {
                const newTheme = e.matches ? "dark" : "light";
                setTheme(newTheme);
                document.documentElement.setAttribute("data-theme", newTheme);
            };
            // Only update if the system theme differs from current
            const systemTheme = getSystemTheme();
            if (theme !== systemTheme) {
                setTheme(systemTheme);
            }
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [themeMode, theme, mounted]);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        if (mode === "system") {
            setTheme(getSystemTheme());
        } else {
            setTheme(mode);
        }
    };

    const toggleTheme = () => {
        const newMode = themeMode === "dark" ? "light" : "dark";
        setThemeMode(newMode);
    };

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <GlobalThemeContext.Provider value={{
                theme: "dark",
                themeMode: "dark",
                setThemeMode: () => { },
                toggleTheme: () => { },
                isDark: true
            }}>
                {children}
            </GlobalThemeContext.Provider>
        );
    }

    return (
        <GlobalThemeContext.Provider value={{
            theme,
            themeMode,
            setThemeMode,
            toggleTheme,
            isDark: theme === "dark"
        }}>
            {children}
        </GlobalThemeContext.Provider>
    );
}

export function useGlobalTheme() {
    const context = useContext(GlobalThemeContext);
    if (context === undefined) {
        throw new Error("useGlobalTheme must be used within a GlobalThemeProvider");
    }
    return context;
}

// Re-export for backwards compatibility with existing useTheme hooks
export { useGlobalTheme as useTheme };
