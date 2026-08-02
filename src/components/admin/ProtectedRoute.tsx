'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      // Ask Supabase, not localStorage. The old check read a timestamp the
      // browser itself had written, so anyone could grant themselves admin by
      // setting two keys in devtools. getUser() validates the token against the
      // auth server, and the same session is what row level security sees on
      // every query this panel makes — if it isn't real, the data won't load
      // anyway.
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;

      const authenticated = Boolean(data?.user) && !error;
      setIsAuthed(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        const currentPath = pathname || '/admin';
        window.location.href = `/en/admin/login?from=${encodeURIComponent(currentPath)}`;
      }
    };

    checkAuth();

    // Sign-out in another tab, or an expired refresh token, should drop this
    // one back to the login screen rather than leaving a dead panel open.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && !cancelled) {
        setIsAuthed(false);
        window.location.href = '/en/admin/login';
      }
    });

    return () => {
      cancelled = true;
      listener?.subscription.unsubscribe();
    };
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
