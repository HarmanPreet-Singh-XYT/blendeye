"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { setActiveUser } from "@/lib/project-store";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isConfigured: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithPassword: (email: string, password: string, fullName?: string) => Promise<{ error: AuthError | null }>;
  signInWithOtp: (email: string) => Promise<{ error: AuthError | null }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isConfigured = isSupabaseConfigured();

  const handleSessionChange = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    if (newSession?.user) {
      setActiveUser(newSession.user.id, newSession.access_token);
    } else {
      setActiveUser(null, null);
    }
  }, []);

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      setActiveUser(null, null);
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Check current active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      handleSessionChange(currentSession);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      handleSessionChange(newSession);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured, handleSessionChange]);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: { message: "Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env", name: "AuthError", status: 500 } as AuthError };
    }
    const res = await supabase.auth.signInWithPassword({ email, password });
    if (!res.error && res.data.session) {
      handleSessionChange(res.data.session);
      setIsAuthModalOpen(false);
    }
    return { error: res.error };
  }, [handleSessionChange]);

  const signUpWithPassword = useCallback(async (email: string, password: string, fullName?: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: { message: "Supabase is not configured. Please configure credentials to register.", name: "AuthError", status: 500 } as AuthError };
    }
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "Director",
        },
      },
    });
    if (!res.error && res.data.session) {
      handleSessionChange(res.data.session);
      setIsAuthModalOpen(false);
    }
    return { error: res.error };
  }, [handleSessionChange]);

  const signInWithOtp = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: { message: "Supabase is not configured", name: "AuthError", status: 500 } as AuthError };
    }
    const res = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
      },
    });
    return { error: res.error };
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { error: { message: "Supabase is not configured", name: "AuthError", status: 500 } as AuthError };
    }
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined,
    });
    return { error: res.error };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut error:", err);
      }
    }
    handleSessionChange(null);
  }, [handleSessionChange]);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
    return {};
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        token: session?.access_token || null,
        userId: user?.id || null,
        isAuthenticated: Boolean(user),
        loading,
        isConfigured,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithPassword,
        signUpWithPassword,
        signInWithOtp,
        resetPasswordForEmail,
        signOut,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

