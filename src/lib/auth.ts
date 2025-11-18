// lib/auth.ts
"use client";

export function setAuthToken(token: string) {
  // localStorage (للاستخدام داخل المتصفح)
  localStorage.setItem("access_token", token);
  // Cookie (علشان middleware يقدر يقرأ)
  // صلاحية 7 أيام — عدّلها برحتك
  document.cookie = `access_token=${token}; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
}

export function clearAuthToken() {
  localStorage.removeItem("access_token");
  document.cookie = "access_token=; Max-Age=0; Path=/; SameSite=Lax";
}

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function isLoggedInClient(): boolean {
  return !!getClientToken();
}
