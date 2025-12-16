"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "system" | "light" | "dark";
type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): Theme {
    if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
    const [theme, setTheme] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedMode = localStorage.getItem("admin-theme-mode") as ThemeMode;
        if (savedMode && ["system", "light", "dark"].includes(savedMode)) {
            setThemeModeState(savedMode);
            if (savedMode === "system") {
                setTheme(getSystemTheme());
            } else {
                setTheme(savedMode);
            }
        } else {
            // Default to light theme
            setThemeModeState("light");
            setTheme("light");
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (themeMode === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = (e: MediaQueryListEvent) => {
                setTheme(e.matches ? "dark" : "light");
            };
            setTheme(getSystemTheme());
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [themeMode, mounted]);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
        localStorage.setItem("admin-theme-mode", mode);
        if (mode === "system") {
            setTheme(getSystemTheme());
        } else {
            setTheme(mode);
        }
    };

    if (!mounted) {
        return <div className="min-h-screen bg-white" />;
    }

    return (
        <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
