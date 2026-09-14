"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, LogIn, Sparkles, ArrowRight, ShieldCheck, Zap, Globe, Layers } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Floating particle component
function FloatingParticle({ delay, size, color, left, duration }: { delay: number; size: number; color: string; left: string; duration: number }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        left,
        bottom: "-10%",
        animation: `particleFloat1 ${duration}s ease-in-out ${delay}s infinite`,
        filter: "blur(1px)",
      }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "test@nexus.com",
      password: "password123",
    },
  });

  const handleInstantDemoLogin = async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: "test@nexus.com",
        password: "password123",
      });

      if (result?.error) {
        setError("Demo login failed. Please try again.");
        setIsDemoLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during sign in.");
      setIsDemoLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050810] text-slate-100 p-4 overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 gradient-mesh opacity-80" />
      
      {/* Aurora animated glow */}
      <div className="absolute inset-0 aurora-bg" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      {/* Floating ambient orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px] pointer-events-none animate-float delay-200" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating particles */}
      <FloatingParticle delay={0} size={4} color="rgba(99, 102, 241, 0.6)" left="20%" duration={8} />
      <FloatingParticle delay={1.5} size={3} color="rgba(139, 92, 246, 0.5)" left="45%" duration={10} />
      <FloatingParticle delay={3} size={5} color="rgba(6, 182, 212, 0.4)" left="70%" duration={7} />
      <FloatingParticle delay={0.5} size={3} color="rgba(99, 102, 241, 0.5)" left="85%" duration={9} />
      <FloatingParticle delay={2} size={4} color="rgba(139, 92, 246, 0.4)" left="10%" duration={11} />
      <FloatingParticle delay={4} size={3} color="rgba(16, 185, 129, 0.4)" left="60%" duration={8} />

      {/* Main Card */}
      <div className={`relative w-full max-w-[440px] transition-all duration-700 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
        {/* Animated border glow ring behind card */}
        <div className="absolute -inset-px rounded-[28px] bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-cyan-500/30 blur-sm animate-pulse-glow" />
        
        <div className="relative bg-[#0a0f1e]/90 backdrop-blur-2xl p-8 sm:p-10 rounded-[28px] shadow-2xl border border-slate-800/60 overflow-hidden">
          {/* Subtle shimmer overlay */}
          <div className="absolute inset-0 animate-shimmer rounded-[28px] pointer-events-none" />
          
          {/* Header with staggered entrance */}
          <div className="relative text-center mb-8">
            {/* Animated logo */}
            <div className={`inline-flex items-center justify-center mb-5 transition-all duration-500 ${mounted ? "animate-scale-in" : "opacity-0"}`}>
              <div className="relative">
                {/* Pulse rings */}
                <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-indigo-500/20 animate-ring-pulse" />
                <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-indigo-500/15 animate-ring-pulse" style={{ animationDelay: "0.5s" }} />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                  N
                </div>
              </div>
            </div>

            <div className={`transition-all duration-500 ${mounted ? "animate-fade-in-up delay-100" : "opacity-0"}`}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[11px] font-semibold uppercase tracking-widest mb-4">
                <Sparkles size={12} className="animate-pulse" />
                Enterprise Workspace
              </div>
            </div>

            <h1 className={`text-4xl font-black tracking-tight mb-2 transition-all duration-500 ${mounted ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
              <span className="text-gradient-wide">NEXUS OS</span>
            </h1>
            <p className={`text-sm text-slate-400 transition-all duration-500 ${mounted ? "animate-fade-in-up delay-300" : "opacity-0"}`}>
              Your unified command center awaits
            </p>
          </div>

          {/* Feature badges row */}
          <div className={`flex justify-center gap-4 mb-7 transition-all duration-500 ${mounted ? "animate-fade-in-up delay-400" : "opacity-0"}`}>
            {[
              { icon: Zap, label: "Instant", color: "text-amber-400" },
              { icon: Globe, label: "Unified", color: "text-cyan-400" },
              { icon: Layers, label: "Smart", color: "text-violet-400" },
            ].map((feat) => (
              <div key={feat.label} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <feat.icon size={12} className={feat.color} />
                <span>{feat.label}</span>
              </div>
            ))}
          </div>

          {/* 1-Click Demo Login */}
          <div className={`mb-6 transition-all duration-500 ${mounted ? "animate-fade-in-up delay-500" : "opacity-0"}`}>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-violet-950/40 to-indigo-950/60 border border-indigo-500/25 relative overflow-hidden group">
              {/* Animated shimmer accent */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              
              <div className="relative">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-indigo-500/15">
                      <ShieldCheck className="text-indigo-400" size={16} />
                    </div>
                    <span className="text-xs font-bold text-indigo-200 tracking-wide">Instant Demo Mode</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-dot-breathe" />
                    Ready
                  </span>
                </div>
                <p className="text-[11px] text-slate-400/80 mb-4 leading-relaxed">
                  Full access to all features — dashboards, AI assistant, canvas, analytics & more.
                </p>
                <button
                  type="button"
                  onClick={handleInstantDemoLogin}
                  disabled={isDemoLoading}
                  className="w-full py-3 px-5 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 hover:from-indigo-600 hover:via-violet-600 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 btn-press group/btn"
                >
                  {isDemoLoading ? (
                    <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles size={15} className="group-hover/btn:rotate-12 transition-transform" />
                      <span>1-Click Demo Login</span>
                      <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-950/50 border border-red-800/50 text-red-300 rounded-xl text-xs flex items-center gap-2.5 animate-fade-in-down">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Divider */}
          <div className={`relative flex items-center gap-3 mb-5 transition-all duration-500 ${mounted ? "animate-fade-in-up delay-600" : "opacity-0"}`}>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">or sign in manually</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 transition-all duration-500 ${mounted ? "animate-fade-in-up delay-700" : "opacity-0"}`}>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2 tracking-wide uppercase">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@nexus.com"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-950/90 transition-all duration-200"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-semibold text-slate-400 tracking-wide uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setValue("email", "test@nexus.com");
                    setValue("password", "password123");
                  }}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium hover-underline"
                >
                  Auto-fill demo
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 focus:bg-slate-950/90 transition-all duration-200"
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400" />{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2.5 border border-slate-700/50 hover:border-slate-600/50 disabled:opacity-50 cursor-pointer btn-press mt-3 hover:shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={15} />
                  <span>Sign In with Password</span>
                </>
              )}
            </button>
          </form>

          <p className={`mt-7 text-center text-xs text-slate-500 transition-all duration-500 ${mounted ? "animate-fade-in-up delay-800" : "opacity-0"}`}>
            Ready to build?{" "}
            <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300 font-semibold hover-underline transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
