import "server-only";

import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AdminIdentity = { userId: string; email: string | null };

export type AdminAuthResult =
  | { ok: true; admin: AdminIdentity }
  | { ok: false; status: 401 | 403; message: string };

/**
 * Establishes that the caller is a listed admin.
 *
 * The admin panel runs entirely in the browser against Supabase, so the only
 * thing a server route receives is the session's access token. Two separate
 * facts have to be proved from it, and proving one is not proving the other:
 * that the token is a real, unexpired Supabase session (`getUser` verifies the
 * signature server-side), and that the user behind it is in `admin_users`.
 * Being signed in is not the same as being an admin — anyone who can sign up
 * holds a valid token.
 */
export async function requireAdmin(request: NextRequest): Promise<AdminAuthResult> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return { ok: false, status: 401, message: "Not signed in." };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data?.user) {
    return { ok: false, status: 401, message: "Your session has expired — sign in again." };
  }

  const { data: adminRow, error: adminError } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (adminError) {
    console.error("Admin lookup failed:", adminError.message);
    // Refusing on an unreadable allowlist is the only safe direction: the
    // alternative is letting everyone through whenever the table hiccups.
    return { ok: false, status: 403, message: "Couldn't verify your access. Try again." };
  }

  if (!adminRow) {
    return { ok: false, status: 403, message: "This account isn't an admin." };
  }

  return { ok: true, admin: { userId: data.user.id, email: data.user.email ?? null } };
}
