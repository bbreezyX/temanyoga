"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email atau password salah");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 sm:p-12 selection:bg-primary/20">
      <div className="w-full max-w-[460px] animate-floatIn">
        {/* Logo and Header section */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <Image
                src="/images/brand-logo.png"
                alt="TemanYoga Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-display font-black text-3xl tracking-tight text-foreground uppercase">
              TemanYoga
            </span>
          </div>
          <h1 className="font-display text-4xl font-extrabold text-foreground tracking-tight mb-3">
            Welcome Back, Admin
          </h1>
          <p className="text-muted-foreground text-lg max-w-[320px] mx-auto leading-relaxed">
            Enter your credentials to securely manage your studio and orders.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-[40px] p-8 sm:p-10 shadow-soft ring-1 ring-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm font-medium py-3 px-6 rounded-full text-center animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[13px] font-bold text-foreground uppercase tracking-wider px-6"
              >
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@temanyoga.com"
                required
                autoComplete="email"
                className="w-full bg-[#fcfaf8] border-border/50 rounded-full h-14 px-6 text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[13px] font-bold text-foreground uppercase tracking-wider px-6"
              >
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-[#fcfaf8] border-border/50 rounded-full h-14 px-6 text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all outline-none"
              />
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary transition-all cursor-pointer"
                />
                <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="#"
                className="text-sm font-semibold text-primary/80 hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 px-8 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all active:scale-[0.99] mt-4"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Footer inside card */}
          <div className="mt-10 pt-8 border-t border-muted flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-muted-foreground/80">
              <ShieldCheck className="w-5 h-5 text-primary/70" />
              <span className="text-[12px] font-bold uppercase tracking-[0.2em]">
                Secure Admin Access
              </span>
            </div>
            <p className="text-sm text-muted-foreground px-4 leading-relaxed font-medium">
              Authorized personnel only. All access is logged and encrypted to
              ensure your store&apos;s security.
            </p>
          </div>
        </div>

        {/* External links */}
        <div className="mt-8 flex justify-center gap-6 text-[13px] font-bold text-muted-foreground/70 uppercase tracking-widest">
          <Link href="/" className="hover:text-primary transition-colors">
            Back to Storefront
          </Link>
          <span className="text-border">|</span>
          <Link href="#" className="hover:text-primary transition-colors">
            Help & Support
          </Link>
        </div>
      </div>
    </div>
  );
}
