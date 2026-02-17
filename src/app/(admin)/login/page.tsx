"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Mail,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 selection:bg-primary/20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
      <div className="w-full max-w-[460px] animate-in fade-in zoom-in duration-500">
        {/* Logo and Header section */}
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 mb-6 group hover:scale-105 transition-transform duration-300"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse group-hover:bg-primary/30 transition-colors" />
              <BrandLogo size={80} />
            </div>
            <span className="font-display font-black text-3xl tracking-tight text-foreground uppercase">
              TemanYoga
            </span>
          </Link>
          <p className="text-muted-foreground text-lg max-w-[320px] mx-auto leading-relaxed">
            Welcome back! Access your dashboard to manage orders and products.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-2xl shadow-primary/5 ring-1 ring-border/50 backdrop-blur-sm transition-all duration-300 hover:shadow-primary/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm font-semibold py-3 px-6 rounded-2xl text-center animate-in slide-in-from-top-2 duration-300 border border-destructive/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[13px] font-bold text-foreground/70 uppercase tracking-wider px-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan Email Anda"
                  required
                  autoComplete="email"
                  className="w-full bg-[#fcfaf8] border-border/50 rounded-2xl h-14 pl-12 pr-6 text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-bold text-foreground/70 uppercase tracking-wider"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-semibold text-primary/80 hover:text-primary transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#fcfaf8] border-border/50 rounded-2xl h-14 pl-12 pr-12 text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground/60 hover:text-primary transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="peer w-5 h-5 rounded-md border-border text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                  />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember this device
                </span>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 px-8 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98] mt-2 group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          {/* Footer inside card */}
          <div className="mt-10 pt-8 border-t border-muted/60 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 rounded-full text-primary/80">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                Secure Encryption Active
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground px-4 leading-relaxed">
              Authorized personnel only. Access attempt and IP address are
              logged.
            </p>
          </div>
        </div>

        {/* External links */}
        <div className="mt-8 flex justify-center gap-8 text-[13px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          <Link
            href="/"
            className="hover:text-primary transition-all hover:tracking-widest"
          >
            Storefront
          </Link>
          <span className="text-border/40">|</span>
          <Link
            href="#"
            className="hover:text-primary transition-all hover:tracking-widest"
          >
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
