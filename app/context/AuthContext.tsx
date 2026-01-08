"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserProfile } from "@/app/actions/profile";
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

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: FullProfile | null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
    signUp: (email: string, password: string, metadata?: { fullName?: string; phone?: string; role?: string }) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
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

    // Fetch profile from database
    const fetchProfile = useCallback(async () => {
        const profileData = await getCurrentUserProfile();
        setProfile(profileData);
    }, []);

    // Refresh profile (call after profile updates)
    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        // Get initial session and profile
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);

            // Fetch profile if user is logged in
            if (session?.user) {
                await fetchProfile();
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
                    setProfile(null);
                }

                setIsLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase.auth, fetchProfile]);

    const signUp = async (
        email: string,
        password: string,
        metadata?: { fullName?: string; phone?: string; role?: string }
    ) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: metadata?.fullName,
                    phone: metadata?.phone,
                    role: metadata?.role || "patient",
                },
            },
        });
        return { error: error as Error | null };
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
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
        await supabase.auth.signOut();
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
