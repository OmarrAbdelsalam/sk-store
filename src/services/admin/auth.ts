import { supabase } from "@/lib/supabaseClient";

// Mock admin authentication service for frontend-only store

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

// Get stored tokens
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("access_token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem("refresh_token");
};

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Store tokens
export const setTokens = (data: TokenData) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem("access_token", data.accessToken);
  localStorage.setItem("refresh_token", data.refreshToken);
  // Set expiry to 1 hour from now (default JWT expiry)
  const expiresAt = Date.now() + 60 * 60 * 1000;
  localStorage.setItem("token_expires_at", expiresAt.toString());
};

// Clear all auth data
export const clearAuth = async () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("token_expires_at");
  localStorage.removeItem("user");
  // Clear cookie as well
  document.cookie = "access_token=; Max-Age=0; Path=/; SameSite=Lax";
  
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Error signing out from Supabase:", e);
  }
};

// Check if token is expired or about to expire (within 5 minutes)
export const isTokenExpired = (): boolean => {
  if (typeof window === 'undefined') return true;
  const expiresAt = localStorage.getItem("token_expires_at");
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt) - 5 * 60 * 1000;
};

// Refresh the access token (mock)
export const refreshAccessToken = async (): Promise<boolean> => {
  const token = getRefreshToken();
  if (!token) return false;

  try {
    // Mock refresh - just extend the expiry
    const expiresAt = Date.now() + 60 * 60 * 1000;
    localStorage.setItem("token_expires_at", expiresAt.toString());
    return true;
  } catch {
    return false;
  }
};

// Get valid access token (refresh if needed)
export const getValidAccessToken = async (): Promise<string | null> => {
  if (isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearAuth();
      return null;
    }
  }
  return getAccessToken();
};

// Mock authenticated fetch wrapper
export const authFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getValidAccessToken();

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Mock response for admin endpoints
  if (url.includes('/Analytics/') || url.includes('/dashboard')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        summary: {
          total_revenue: 15000,
          revenue_growth: 12.5,
          total_orders: 45,
          orders_growth: 8.3,
          average_order_value: 333.33,
          conversion_rate: 2.1,
        },
        traffic: {
          total_sessions: 1250,
          unique_visitors: 890,
          avg_pages_per_session: 3.2,
          converted_sessions: 26,
        },
        top_products: [],
        recent_orders: [],
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // For other requests, return a generic success response
  return new Response(JSON.stringify({
    success: true,
    data: null,
    message: 'Mock response'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken() && !isTokenExpired();
};