"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, BarChart3, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

interface AuthPageProps {
  initialMode?: "login" | "register";
}

export function AuthPage({ initialMode = "login" }: AuthPageProps) {
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  
  // Sync with URL param if present, but don't force it (optional sync)
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "login") setIsLogin(true);
    if (mode === "register") setIsLogin(false);
  }, [searchParams]);

  // Toggle function
  const toggleMode = () => setIsLogin((prev) => !prev);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 overflow-x-hidden">
      
      {/* Mobile/Tablet View (Stacked) */}
      <div className="w-full max-w-md md:hidden bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 text-center border-b border-slate-100">
           <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>AI Evaluation Platform</span>
           </div>
        </div>
        
        {isLogin ? <LoginForm /> : <RegisterForm />}
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600 mb-3">
              {isLogin ? "Don't have an account yet?" : "Already have an account?"}
            </p>
            <button 
              onClick={toggleMode}
              className="text-sm font-bold text-primary-600 hover:underline"
            >
              {isLogin ? "Create an Account" : "Sign In to Dashboard"}
            </button>
        </div>
      </div>

      {/* Desktop View (Sliding Panels) */}
      <div className="hidden md:block relative w-full max-w-[1000px] min-h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Forms Container */}
        <div className="absolute inset-0 flex">
            {/* Login Form Slot (Left) */}
            <div className="w-1/2 h-full flex items-center justify-center p-8 bg-white transition-opacity duration-300">
               <LoginForm className={cn("transition-opacity duration-300", !isLogin && "opacity-20 pointer-events-none")} />
            </div>

            {/* Register Form Slot (Right) */}
            <div className="w-1/2 h-full flex items-center justify-center p-8 bg-white transition-opacity duration-300">
               <RegisterForm className={cn("transition-opacity duration-300", isLogin && "opacity-20 pointer-events-none")} />
            </div>
        </div>

        {/* Sliding Overlay */}
        <div 
          className={cn(
            "absolute top-0 left-0 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 rounded-2xl md:rounded-l-2xl md:rounded-r-none",
            isLogin ? "translate-x-full rounded-r-2xl rounded-l-none" : "translate-x-0"
          )}
        >
           <div className="absolute inset-0 bg-slate-900 text-white">
              {/* Abstract Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 opacity-100" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.3),transparent_50%)]" />
              <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Overlay Inner Content Wrapper (Moves opposite to overlay to create static/parallax effect) */}
              <div 
                className={cn(
                    "relative h-full w-[200%] flex transition-transform duration-700 ease-in-out",
                    isLogin ? "-translate-x-1/2" : "translate-x-0"
                )}
              >
                 
                 {/* Left Panel Content (Visible when Overlay is Left -> Register Mode) */}
                 <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center space-y-8">
                     <div className="space-y-4 max-w-sm">
                        <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/10">
                            <Users className="h-8 w-8 text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Join ShikshaNetra</h2>
                        <p className="text-slate-300 text-lg">
                           Start your journey with us today and evaluate mentors efficiently
                        </p>
                     </div>

                     <div className="space-y-6 w-full max-w-xs">
                        <div className="space-y-3 text-left bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                           <div className="flex items-center gap-3 text-slate-200">
                               <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                               <span className="text-sm font-medium">Verify Mentor Quality</span>
                           </div>
                           <div className="flex items-center gap-3 text-slate-200">
                               <BarChart3 className="h-5 w-5 text-indigo-400 shrink-0" />
                               <span className="text-sm font-medium">Automated Reports</span>
                           </div>
                        </div>

                         <button 
                            onClick={toggleMode}
                            className="w-full py-3 px-6 rounded-lg border-2 border-white text-white font-bold hover:bg-white hover:text-slate-900 transition-all shadow-lg active:scale-95"
                         >
                            Already have an account? Login
                         </button>
                     </div>
                 </div>

                 {/* Right Panel Content (Visible when Overlay is Right -> Login Mode) */}
                 <div className="w-1/2 h-full flex flex-col items-center justify-center p-12 text-center space-y-8">
                     <div className="space-y-4 max-w-sm">
                        <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/10">
                            <ShieldCheck className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Welcome Back!</h2>
                        <p className="text-slate-300 text-lg">
                           We are glad to see you again. Sign in to continue your evaluation.
                        </p>
                     </div>
                     
                     <div className="space-y-6 w-full max-w-xs">
                        <div className="space-y-3 text-left bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                           <div className="flex items-center gap-3 text-slate-200">
                              <BarChart3 className="h-5 w-5 text-indigo-400 shrink-0" />
                              <span className="text-sm font-medium">Detailed Analytics</span>
                           </div>
                           <div className="flex items-center gap-3 text-slate-200">
                              <Zap className="h-5 w-5 text-amber-400 shrink-0" />
                              <span className="text-sm font-medium">Real-time AI Feedback</span>
                           </div>
                        </div>

                         <button 
                            onClick={toggleMode}
                            className="w-full py-3 px-6 rounded-lg border-2 border-white text-white font-bold hover:bg-white hover:text-slate-900 transition-all shadow-lg active:scale-95"
                         >
                            Create an Account
                         </button>
                     </div>
                 </div>

              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
