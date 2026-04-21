import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return NextResponse.json({ error: "Supabase env ayarlari eksik." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!bearerToken) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${bearerToken}` } },
  });
  const { data: requesterData, error: requesterError } = await authClient.auth.getUser();
  if (requesterError || !requesterData.user) {
    return NextResponse.json({ error: "Oturum dogrulanamadi." }, { status: 401 });
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { data: requesterProfile, error: profileError } = await serviceClient
    .from("users")
    .select("role")
    .eq("auth_user_id", requesterData.user.id)
    .single();
  if (profileError || !requesterProfile || requesterProfile.role !== "admin") {
    return NextResponse.json({ error: "Sadece admin kullanici olusturabilir." }, { status: 403 });
  }

  const body = (await request.json()) as { name?: string; email?: string; password?: string; role?: "admin" | "manager" | "staff" };
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password?.trim();
  const role = body.role;

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "Ad, e-posta, sifre ve rol zorunludur." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Sifre en az 6 karakter olmalidir." }, { status: 400 });
  }

  const { data: createdAuthUser, error: authCreateError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authCreateError || !createdAuthUser.user) {
    return NextResponse.json({ error: authCreateError?.message ?? "Auth kullanicisi olusturulamadi." }, { status: 400 });
  }

  const { data: createdProfile, error: profileCreateError } = await serviceClient
    .from("users")
    .insert({
      name,
      email,
      role,
      auth_user_id: createdAuthUser.user.id,
    })
    .select("id, name, role, email, auth_user_id")
    .single();

  if (profileCreateError || !createdProfile) {
    await serviceClient.auth.admin.deleteUser(createdAuthUser.user.id);
    return NextResponse.json({ error: profileCreateError?.message ?? "Profil kaydi olusturulamadi." }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: createdProfile.id,
      name: createdProfile.name,
      role: createdProfile.role,
      email: createdProfile.email,
      authUserId: createdProfile.auth_user_id,
    },
  });
}
