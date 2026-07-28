"use client";

import { useState, useEffect } from "react";
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { setAuthToken } from "@/lib/auth";

interface LoginProps {
  redirectTo?: string;
}

const Login = ({ redirectTo }: LoginProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [finalRedirect, setFinalRedirect] = useState(redirectTo || "/en/admin");

  useEffect(() => {
    const fromParam = searchParams.get('from');
    if (fromParam) {
      setFinalRedirect(fromParam);
    } else if (redirectTo) {
      setFinalRedirect(redirectTo);
    } else {
      setFinalRedirect("/en/admin");
    }
  }, [searchParams, redirectTo]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const expiresAt = localStorage.getItem("token_expires_at");
    if (token && expiresAt && Date.now() < parseInt(expiresAt)) {
      window.location.href = finalRedirect;
    }
  }, [finalRedirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      if (data.session) {
        setAuthToken(data.session.access_token);
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem("token_expires_at", expiresAt.toString());
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = finalRedirect;
      } else {
        setError("Login failed: Session not found");
        setIsLoading(false);
      }

    } catch (err) {
      setError("Connection error, please try again");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex" dir="ltr">
      {/* Left side - Minimal Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground relative overflow-hidden items-center justify-center">
        <div className="relative z-10 text-center flex flex-col items-center px-12">
          <div className="w-16 h-16 border-2 border-background/20 flex items-center justify-center mb-10">
            <span className="text-background font-light text-2xl tracking-widest">SK</span>
          </div>
          <h1 className="text-4xl font-light text-background tracking-wider uppercase mb-4">
            Admin Portal
          </h1>
          <div className="h-px w-16 bg-background/30 mb-6" />
          <p className="text-background/50 text-sm tracking-wider leading-relaxed max-w-sm">
            Manage your storefront, track orders, and analyze your growth all in one place.
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-12 flex flex-col items-center">
            <div className="w-14 h-14 border-2 border-foreground flex items-center justify-center mb-5">
              <span className="text-foreground font-light text-xl tracking-widest">SK</span>
            </div>
            <h1 className="text-xl font-light tracking-widest uppercase">Admin Portal</h1>
          </div>

          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-light tracking-wider uppercase">Welcome back</h2>
            <div className="h-px w-12 bg-foreground mt-3" />
            <p className="text-xs tracking-wider text-muted-foreground mt-3">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="p-4 border border-red-300 bg-red-50/50 dark:bg-red-950/20">
                <p className="text-xs text-red-600 dark:text-red-400 tracking-wider">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@skbags.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="text-xs font-medium tracking-wider uppercase text-muted-foreground mb-2.5 block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-none border-border bg-transparent focus-visible:ring-1 focus-visible:ring-foreground text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-13 py-4 bg-foreground text-background text-xs font-medium tracking-widest uppercase
                transition-all duration-300 hover:bg-foreground/90 active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-[11px] tracking-wider uppercase text-muted-foreground mt-16">
            © {new Date().getFullYear()} SK Bags. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
