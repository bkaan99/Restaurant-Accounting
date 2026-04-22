"use client";

import { useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { AppUser, UserRole } from "@/lib/types";

export function useAuth(appUsers: AppUser[]) {
  const [email, setEmail] = useState("admin@restaurant.local");
  const [password, setPassword] = useState("123456");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const user = appUsers.find((u) => u.id === currentUserId) ?? null;

  useEffect(() => {
    const savedUserId = localStorage.getItem("currentUserId");
    if (savedUserId && !currentUserId) {
      setCurrentUserId(savedUserId);
    }
    // Set to false after checking localStorage
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem("currentUserId", currentUserId);
    } else {
      localStorage.removeItem("currentUserId");
    }
  }, [currentUserId]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setIsCheckingAuth(false);
      return;
    }

    let isMounted = true;
    const mapAuthUserToAppUser = (authUser: { id: string; email?: string | null }) => {
      return appUsers.find((u) => u.authUserId === authUser.id || u.email === authUser.email) ?? null;
    };

    const syncSessionToAppUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const authUser = data.session?.user;
      if (!authUser) {
        setCurrentUserId(null);
        setIsCheckingAuth(false);
        return;
      }
      const found = mapAuthUserToAppUser(authUser);
      setCurrentUserId(found?.id ?? null);
      setIsCheckingAuth(false);
    };

    syncSessionToAppUser();

    const { data: authSubscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      const authUser = session?.user;
      if (!authUser) {
        setCurrentUserId(null);
      } else {
        const found = mapAuthUserToAppUser(authUser);
        setCurrentUserId(found?.id ?? null);
      }
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [appUsers]);

  const handleLogin = async () => {
    setLoginError(null);
    if (!email || !password) {
      setLoginError("E-posta ve şifre gerekli.");
      return;
    }

    setLoginSubmitting(true);

    if (hasSupabaseConfig && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        setLoginError("Giriş başarısız. E-posta veya şifre hatalı.");
        setLoginSubmitting(false);
        return;
      }
      const found = appUsers.find((u) => u.authUserId === data.user.id || u.email === data.user.email);
      if (!found) {
        setLoginError("Kullanıcı profili bulunamadı. Lütfen yöneticinizle iletişime geçin.");
        setLoginSubmitting(false);
        return;
      }
      setShowSplash(true);
      setTimeout(() => {
        setCurrentUserId(found.id);
        setShowSplash(false);
        setLoginSubmitting(false);
      }, 1000);
      return;
    }

    // Demo Fallback
    const fallbackUser = appUsers.find((u) => u.email === email);
    if (!fallbackUser || password !== "123456") {
      setLoginError("Demo giriş: e-posta veya şifre hatalı.");
      setLoginSubmitting(false);
      return;
    }
    setShowSplash(true);
    setTimeout(() => {
      setCurrentUserId(fallbackUser.id);
      setShowSplash(false);
      setLoginSubmitting(false);
    }, 1000);
  };

  const handleLogout = async () => {
    if (hasSupabaseConfig && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUserId(null);
  };

  return {
    user,
    currentUserId,
    email,
    password,
    setEmail,
    setPassword,
    loginError,
    loginSubmitting,
    showSplash,
    isCheckingAuth,
    handleLogin,
    handleLogout,
  };
}
