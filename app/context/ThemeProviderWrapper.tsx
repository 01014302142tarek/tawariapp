"use client";

import { GlobalThemeProvider } from "./GlobalThemeContext";

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
    return (
        <GlobalThemeProvider>
            {children}
        </GlobalThemeProvider>
    );
}
