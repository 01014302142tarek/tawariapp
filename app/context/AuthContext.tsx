"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserProfile } from "@/app/actions/profile";

const PROFILE_CACHE_KEY = "tawari_profile_cache";
import {
    signInWithPassword as serverSignIn,
    signUpWithPassword as serverSignUp,
    signUpDoctor as serverSignUpDoctor,
    signOut as serverSignOut,
} from "@/app/actions/auth";
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
    signIn: (email: string, password: string) => Promise<AuthResult>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    updateUserRole: (role: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<FullProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

    const signUp = async (
        email: string,
        password: string,
        metadata?: { fullName?: string; phone?: string; role?: string }
    ): Promise<AuthResult> => {
        // Use doctor-specific signup for doctors (auto-confirms email for onboarding)
        // This ensures doctors can complete the onboarding flow without email confirmation blocking them
        const isDoctor = metadata?.role === "doctor";
        const result = isDoctor
            ? await serverSignUpDoctor(email, password, { fullName: metadata?.fullName, phone: metadata?.phone })
            : await serverSignUp(email, password, metadata);

        if (!result.success) {
            return {
                error: new Error(result.error || "Sign up failed"),
                retryAfter: result.retryAfter,
            };
        }

        // After successful server-side auth, refresh the client session
        // The auth state change listener will update the UI
        await supabase.auth.getSession();

        return { error: null };
    };

    const signIn = async (email: string, password: string): Promise<AuthResult> => {
        // Use rate-limited server action
        const result = await serverSignIn(email, password);

        if (!result.success) {
            return {
                error: new Error(result.error || "Sign in failed"),
                retryAfter: result.retryAfter,
            };
        }

        // After successful server-side auth, refresh the client session
        // The auth state change listener will update the UI
        await supabase.auth.getSession();

        return { error: null };
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        try {
            // Use server action to sign out (handles doctor availability)
            // This must happen BEFORE clearing the cache
            const result = await serverSignOut();

            if (!result.success) {
                console.error("[AuthContext] Sign out failed:", result.error);
            }

            // Clear profile cache after signing out
            cacheProfile(null);

            // Refresh client session to trigger auth state change
            await supabase.auth.getSession();
        } catch (error) {
            console.error("[AuthContext] Error during sign out:", error);
            // Clear cache anyway
            cacheProfile(null);
            // Try to clear session anyway
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
