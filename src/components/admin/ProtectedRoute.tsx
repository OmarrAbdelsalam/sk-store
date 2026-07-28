'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Simple local auth check
const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem("access_token");
  const expiresAt = localStorage.getItem("token_expires_at");
  
  if (!token || !expiresAt) return false;
  
  // Check if token is expired
  const isValid = Date.now() < parseInt(expiresAt);
  
  // Sync cookie with localStorage
  if (isValid) {
    const cookieExists = document.cookie.includes('access_token=');
    if (!cookieExists) {
      document.cookie = `access_token=${token}; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
    }
  }
  
  return isValid;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsAuthed(authenticated);
      setIsLoading(false);
      
      if (!authenticated) {
        // Use window.location to avoid i18n routing issues
        const currentPath = pathname || '/admin';
        window.location.href = `/en/admin/login?from=${encodeURIComponent(currentPath)}`;
      }
    };

    checkAuth();
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
