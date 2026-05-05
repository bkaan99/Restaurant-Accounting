"use client";

import { useEffect, useState } from "react";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { AppUser } from "@/lib/types";

async function fetchUserProfileFromDB(authUser: { id: string; email?: string | null }): Promise<AppUser | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("users")
    .select("id, name, role, email, auth_user_id, permissions")
    .or(`auth_user_id.eq.${authUser.id},email.eq.${authUser.email}`)
    .single();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    email: data.email,
    authUserId: data.auth_user_id,
    permissions: data.permissions ?? null,
  };
}

export function useAuth() {
  const [email, setEmail] = useState("admin@restaurant.local");
  const [password, setPassword] = useState("123456");
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    if (typeof window === "undefined" || hasSupabaseConfig) return null;
    return localStorage.getItem("currentUserId");
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [localUser, setLocalUser] = useState<AppUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(hasSupabaseConfig);

  const user = localUser;

  // currentUserId değişince localStorage'a yaz
  useEffect(() => {
    if (!hasSupabaseConfig) {
      if (currentUserId) {
        localStorage.setItem("currentUserId", currentUserId);
      } else {
        localStorage.removeItem("currentUserId");
      }
    }
  }, [currentUserId]);

  // Supabase session sync — sadece bir kez çalışır
  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) return;

    let isMounted = true;

    const syncSession = async () => {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      const authUser = data.session?.user;
      if (!authUser) {
        setLocalUser(null);
        setCurrentUserId(null);
        setIsCheckingAuth(false);
        return;
      }
      const found = await fetchUserProfileFromDB(authUser);
      if (!isMounted) return;
      setLocalUser(found);
      setCurrentUserId(found?.id ?? null);
      setIsCheckingAuth(false);
    };

    syncSession();

    const { data: authSubscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      const authUser = session?.user;
      if (!authUser) {
        setLocalUser(null);
        setCurrentUserId(null);
      } else {
        const found = await fetchUserProfileFromDB(authUser);
        if (!isMounted) return;
        setLocalUser(found);
        setCurrentUserId(found?.id ?? null);
      }
      setIsCheckingAuth(false);
    });

    return () => {
      isMounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, []); // sadece mount'ta çalışır

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
      const found = await fetchUserProfileFromDB(data.user);
      if (!found) {
        setLoginError("Kullanıcı profili bulunamadı. Lütfen yöneticinizle iletişime geçin.");
        setLoginSubmitting(false);
        return;
      }
      setShowSplash(true);
      setTimeout(() => {
        setLocalUser(found);
        setCurrentUserId(found.id);
        setShowSplash(false);
        setLoginSubmitting(false);
      }, 1000);
      return;
    }

    // Demo mod — Supabase yoksa
    setLoginError("Supabase bağlantısı bulunamadı.");
    setLoginSubmitting(false);
  };

  const handleLogout = async () => {
    if (hasSupabaseConfig && supabase) {
      await supabase.auth.signOut();
    }
    setLocalUser(null);
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
