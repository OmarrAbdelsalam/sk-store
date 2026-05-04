"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
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
  const [finalRedirect, setFinalRedirect] = useState(redirectTo || "/admin");

  useEffect(() => {
    // Get redirect path from URL params or use default
    const fromParam = searchParams.get('from');
    if (fromParam) {
      setFinalRedirect(fromParam);
    } else if (redirectTo) {
      setFinalRedirect(redirectTo);
    }
  }, [searchParams, redirectTo]);

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
        console.error("Login error:", error.message);
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        setIsLoading(false);
        return;
      }

      if (data.session) {
        // Store auth token using our helper (sets cookie & localStorage)
        setAuthToken(data.session.access_token);
        
        // Store token expiry for ProtectedRoute check
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        localStorage.setItem("token_expires_at", expiresAt.toString());
        
        // Store user info if needed
        localStorage.setItem("user", JSON.stringify(data.user));
        
        router.push(finalRedirect);
      } else {
        setError("فشل تسجيل الدخول: لم يتم العثور على جلسة");
        setIsLoading(false);
      }

    } catch (err) {
      console.error("Unexpected error:", err);
      setError("حدث خطأ في الاتصال، حاول مرة أخرى");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f7] flex items-center justify-center p-6 relative overflow-hidden" dir="rtl">
      {/* Background Texture - Minimal & Calm */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative blurred circles for subtle luxury feel */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#e6e2dd] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#f0edea] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
          className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60"
        >
          {/* Logo / Branding */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-luxury text-[#1c1c1c] mb-2 tracking-wide font-medium">
              SK Bags
            </h1>
            <p className="text-[#8c8c8c] text-xs tracking-[0.2em] uppercase font-medium">
              Admin Portal
            </p>
          </div>

          <div className="text-center mb-8 space-y-2">
            <h2 className="text-xl font-bold text-[#2d2d2d]">مرحباً بعودتك</h2>
            <p className="text-gray-500 font-light text-sm">سجل دخولك للمتابعة إلى لوحة التحكم</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2d2d2d] font-medium text-sm">
                  البريد الإلكتروني
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@skbags.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-[#fbfbfb] border-gray-100 focus:bg-white focus:border-[#d4d1cd] focus:ring-0 rounded-xl transition-all duration-300 text-sm"
                    dir="ltr"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-60" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2d2d2d] font-medium text-sm">
                  كلمة المرور
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-[#fbfbfb] border-gray-100 focus:bg-white focus:border-[#d4d1cd] focus:ring-0 rounded-xl transition-all duration-300 text-sm"
                    dir="ltr"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-60" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember" 
                  className="rounded border-[#e0e0e0] data-[state=checked]:bg-[#2d2d2d] data-[state=checked]:border-[#2d2d2d]" 
                />
                <Label htmlFor="remember" className="text-gray-500 cursor-pointer text-xs">
                  تذكرني
                </Label>
              </div>
              <button 
                type="button" 
                className="text-[#2d2d2d] hover:underline underline-offset-4 text-xs font-medium transition-all"
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#2d2d2d] hover:bg-[#000000] text-white rounded-xl text-sm tracking-wide font-medium shadow-lg shadow-gray-200 hover:shadow-xl transition-all duration-300 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>


          </form>
        </motion.div>
        
        <div className="mt-8 text-center text-xs text-[#8c8c8c]">
           <p>© {new Date().getFullYear()} SK Bags. Designed for excellence.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;