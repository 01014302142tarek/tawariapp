"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserProfile } from "@/app/actions/profile";

const PROFILE_CACHE_KEY = "tabibi_profile_cache";
import {
    signInWithPassword as serverSignIn,
    signUpWithPassword as serverSignUp,
    signUpDoctor as serverSignUpDoctor,
    signInWithGoogleAccount as serverSignInWithGoogleAccount,
    signOut as serverSignOut,
} from "@/app/actions/auth";
import { upsertMockGoogleAccount } from "@/lib/supabase/mock";
import GoogleAuthModal, { type GoogleAccountSelection } from "@/components/auth/GoogleAuthModal";
import {
    type FullProfile,
    type FullPatientProfile,
    type FullDoctorProfile,
    type FullAdminProfile,
    type FullAssistantProfile,
    isPatientProfile,
    isDoctorProfile,
    isAdminProfile,
    isAssistantProfile,
} from "@/lib/types/profile";

// Re-export profile types and type guards for convenience
export type {
    FullProfile,
    FullPatientProfile,
    FullDoctorProfile,
    FullAdminProfile,
    FullAssistantProfile,
};
export { isPatientProfile, isDoctorProfile, isAdminProfile, isAssistantProfile };

interface AuthResult {
    error: Error | null;
    retryAfter?: number;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: FullProfile | null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
    signUp: (email: string, password: string, metadata?: { fullName?: string; phone?: string; role?: string }) => Promise<AuthResult>;
    signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
    signInWithGoogle: (
        redirectToPath?: string,
        preferredRole?: "patient" | "doctor"
    ) => Promise<{ error: Error | null; redirectUrl?: string }>;
    signOut: () => Promise<void>;
    updateUserRole: (role: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<FullProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [googleModalState, setGoogleModalState] = useState<{
        isOpen: boolean;
        redirectToPath: string;
        defaultRole: "patient" | "doctor";
        isAr: boolean;
        resolve?: (res: { error: Error | null; redirectUrl?: string }) => void;
    }>({
        isOpen: false,
        redirectToPath: "/ar/dashboard",
        defaultRole: "patient",
        isAr: true,
    });
    const supabase = createClient();
    const hasMounted = useRef(false);

    // Load cached profile from localStorage (client-side only)
    const loadCachedProfile = useCallback(() => {
        if (typeof window === "undefined") return null;
        try {
            const cached = localStorage.getItem(PROFILE_CACHE_KEY);
            if (cached) {
                return JSON.parse(cached) as FullProfile;
            }
        } catch {
            // Ignore parse errors
        }
        return null;
    }, []);

    // Save profile to localStorage cache
    const cacheProfile = useCallback((profileData: FullProfile | null) => {
        if (typeof window === "undefined") return;
        try {
            if (profileData) {
                localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileData));
            } else {
                localStorage.removeItem(PROFILE_CACHE_KEY);
            }
        } catch {
            // Ignore storage errors
        }
    }, []);

    // Fetch profile from database and update cache
    const fetchProfile = useCallback(async () => {
        const profileData = await getCurrentUserProfile();
        setProfile(profileData);
        cacheProfile(profileData);
    }, [cacheProfile]);

    // Refresh profile (call after profile updates)
    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        // Load cached profile immediately for instant display
        if (!hasMounted.current) {
            hasMounted.current = true;
            const cached = loadCachedProfile();
            if (cached) {
                setProfile(cached);
            }
        }

        // Get initial session and profile
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);

            // Fetch fresh profile if user is logged in (will update cache)
            if (session?.user) {
                await fetchProfile();
            } else {
                // Clear cache if not logged in
                cacheProfile(null);
                setProfile(null);
            }

            setIsLoading(false);
        };

        getSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                // Fetch or clear profile based on auth state
                if (session?.user) {
                    await fetchProfile();
                } else {
                    cacheProfile(null);
                    setProfile(null);
                }

                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase.auth, fetchProfile, loadCachedProfile, cacheProfile]);

    // Listen for popup OAuth postMessage completion
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
                await supabase.auth.getSession();
                await fetchProfile();
                const targetUrl =
                    typeof event.data.redirectUrl === "string"
                        ? event.data.redirectUrl
                        : window.location.pathname.startsWith("/en")
                        ? "/en/dashboard"
                        : "/ar/dashboard";
                window.location.href = targetUrl;
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [supabase.auth, fetchProfile]);

    const signUp = async (
        email: string,
        password: string,
        metadata?: { fullName?: string; phone?: string; role?: string }
    ): Promise<AuthResult> => {
        const isDoctor = metadata?.role === "doctor";
        const result = isDoctor
            ? await serverSignUpDoctor(email, password, { fullName: metadata?.fullName, phone: metadata?.phone })
            : await serverSignUp(email, password, { fullName: metadata?.fullName, phone: metadata?.phone });

        if (!result.success) {
            return {
                error: new Error(result.error || "Sign up failed"),
                retryAfter: result.retryAfter,
            };
        }

        await supabase.auth.getSession();

        return { error: null };
    };

    const signIn = async (email: string, password: string, rememberMe?: boolean): Promise<AuthResult> => {
        void rememberMe;
        const result = await serverSignIn(email, password);

        if (!result.success) {
            return {
                error: new Error(result.error || "Sign in failed"),
                retryAfter: result.retryAfter,
            };
        }

        await supabase.auth.getSession();

        return { error: null };
    };

    const openInteractiveGoogleModal = useCallback(
        (targetRedirect: string, role: "patient" | "doctor") => {
            const isAr =
                typeof window !== "undefined"
                    ? !window.location.pathname.startsWith("/en")
                    : true;
            return new Promise<{ error: Error | null; redirectUrl?: string }>((resolve) => {
                setGoogleModalState({
                    isOpen: true,
                    redirectToPath: targetRedirect,
                    defaultRole: role,
                    isAr,
                    resolve,
                });
            });
        },
        []
    );

    const handleGoogleAccountSelect = async (selection: GoogleAccountSelection) => {
        const result = await serverSignInWithGoogleAccount({
            email: selection.email,
            fullName: selection.fullName,
            avatarUrl: selection.avatarUrl,
            role: selection.role,
        });

        if (!result.success) {
            throw new Error(result.error || "Failed to sign in with Google");
        }

        // Also ensure client-side mock account is synced immediately in this browser tab
        upsertMockGoogleAccount({
            email: selection.email,
            fullName: selection.fullName,
            avatarUrl: selection.avatarUrl,
            role: selection.role,
        });

        await supabase.auth.getSession();
        await fetchProfile();

        const langPrefix =
            typeof window !== "undefined" && window.location.pathname.startsWith("/en")
                ? "/en"
                : "/ar";
        const resolvedRole = result.role || selection.role || "patient";
        const defaultDashboard = `${langPrefix}/dashboard/${resolvedRole}`;
        const requestedRedirect = googleModalState.redirectToPath;
        const finalRedirect =
            requestedRedirect &&
            requestedRedirect !== "/ar/dashboard" &&
            requestedRedirect !== "/en/dashboard"
                ? requestedRedirect
                : defaultDashboard;

        const resolver = googleModalState.resolve;
        setGoogleModalState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
        resolver?.({ error: null, redirectUrl: finalRedirect });

        if (typeof window !== "undefined" && finalRedirect) {
            window.location.href = finalRedirect;
        }
    };

    const handleGoogleModalClose = () => {
        const resolver = googleModalState.resolve;
        setGoogleModalState((prev) => ({ ...prev, isOpen: false, resolve: undefined }));
        resolver?.({ error: null });
    };

    const signInWithGoogle = async (
        redirectToPath?: string,
        preferredRole?: "patient" | "doctor"
    ): Promise<{ error: Error | null; redirectUrl?: string }> => {
        const langPrefix =
            typeof window !== "undefined" && window.location.pathname.startsWith("/en")
                ? "/en"
                : "/ar";
        const targetRedirect = redirectToPath || `${langPrefix}/dashboard`;
        const role: "patient" | "doctor" =
            preferredRole ||
            (typeof window !== "undefined" &&
            window.location.pathname.includes("doctor")
                ? "doctor"
                : "patient");

        try {
            const res = await fetch(
                `/api/auth/google/url?next=${encodeURIComponent(targetRedirect)}&role=${role}`
            );
            if (res.ok) {
                const data = await res.json();
                if (data.mode === "google_oauth" && data.url) {
                    const popup = window.open(
                        data.url,
                        "google_oauth_popup",
                        "width=540,height=660,menubar=no,toolbar=no,location=no,status=no"
                    );
                    if (popup) {
                        return { error: null };
                    }
                } else if (data.mode === "supabase_oauth") {
                    const { data: oauthData, error } = await supabase.auth.signInWithOAuth({
                        provider: "google",
                        options: {
                            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetRedirect)}`,
                            skipBrowserRedirect: true,
                        },
                    });
                    if (!error && oauthData?.url && !oauthData.url.startsWith("/")) {
                        const popup = window.open(
                            oauthData.url,
                            "google_oauth_popup",
                            "width=540,height=660,menubar=no,toolbar=no,location=no,status=no"
                        );
                        if (popup) {
                            return { error: null };
                        }
                    }
                }
            }
        } catch (err) {
            console.warn("[AuthContext] Falling back to interactive Google modal:", err);
        }

        return openInteractiveGoogleModal(targetRedirect, role);
    };

    const signOut = async () => {
        try {
            const result = await serverSignOut();

            if (!result.success) {
                console.error("[AuthContext] Sign out failed:", result.error);
            }

            cacheProfile(null);
            await supabase.auth.getSession();
        } catch (error) {
            console.error("[AuthContext] Error during sign out:", error);
            cacheProfile(null);
            await supabase.auth.getSession();
        }
    };

    const updateUserRole = async (role: string) => {
        const { error } = await supabase.auth.updateUser({
            data: { role },
        });
        return { error: error as Error | null };
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                isLoading,
                refreshProfile,
                signUp,
                signIn,
                signInWithGoogle,
                signOut,
                updateUserRole,
            }}
        >
            {children}
            <GoogleAuthModal
                isOpen={googleModalState.isOpen}
                defaultRole={googleModalState.defaultRole}
                isAr={googleModalState.isAr}
                onClose={handleGoogleModalClose}
                onSelectAccount={handleGoogleAccountSelect}
            />
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

