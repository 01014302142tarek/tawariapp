"use client";

import { useI18n, Language } from "@/app/i18n";

/**
 * Hook for generating language-aware URLs
 * Ensures all internal links maintain the current language
 */
export function useLanguageUrl() {
    const { language } = useI18n();

    /**
     * Converts a path to include the current language prefix
     * @param path - The path without language prefix (e.g., "/dashboard" or "dashboard")
     * @returns The path with language prefix (e.g., "/en/dashboard")
     */
    const getUrl = (path: string): string => {
        // Remove leading slash if present
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;

        // Check if path already has a language prefix
        if (cleanPath.startsWith('en/') || cleanPath.startsWith('ar/') ||
            cleanPath === 'en' || cleanPath === 'ar') {
            return `/${cleanPath}`;
        }

        return `/${language}/${cleanPath}`;
    };

    /**
     * Converts a path to use a specific language
     * @param path - The path without language prefix
     * @param lang - The language to use
     * @returns The path with specified language prefix
     */
    const getUrlWithLang = (path: string, lang: Language): string => {
        const cleanPath = path.startsWith('/') ? path.slice(1) : path;

        // Check if path already has a language prefix and replace it
        if (cleanPath.startsWith('en/') || cleanPath.startsWith('ar/')) {
            return `/${lang}/${cleanPath.slice(3)}`;
        }
        if (cleanPath === 'en' || cleanPath === 'ar') {
            return `/${lang}`;
        }

        return `/${lang}/${cleanPath}`;
    };

    /**
     * Gets the current path without the language prefix
     * @param pathname - The full pathname including language
     * @returns The path without language prefix
     */
    const getPathWithoutLang = (pathname: string): string => {
        if (pathname.startsWith('/en/') || pathname.startsWith('/ar/')) {
            return pathname.slice(3);
        }
        if (pathname === '/en' || pathname === '/ar') {
            return '/';
        }
        return pathname;
    };

    return {
        language,
        getUrl,
        getUrlWithLang,
        getPathWithoutLang,
    };
}

/**
 * Utility function to generate language-aware URL (for server-side or outside of React)
 * @param path - The path without language prefix
 * @param language - The language to use
 * @returns The path with language prefix
 */
export function createLanguageUrl(path: string, language: Language): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    if (cleanPath.startsWith('en/') || cleanPath.startsWith('ar/') ||
        cleanPath === 'en' || cleanPath === 'ar') {
        return `/${cleanPath}`;
    }

    return `/${language}/${cleanPath}`;
}
