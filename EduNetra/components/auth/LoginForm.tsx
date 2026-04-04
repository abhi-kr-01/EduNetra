"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react"; // Import Icons
import { useToast } from "@/components/ToastContext";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { cn } from "@/lib/utils/cn";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    
    if (!email || !password) {
      setApiError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        setApiError(error.error || "Login failed");
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      localStorage.setItem("shikshanetra_token", data.accessToken);
      localStorage.setItem("shikshanetra_user", JSON.stringify(data.user));
      localStorage.setItem("shikshanetra_logged_in", "true");

      showToast("Login successful!");
      router.push("/dashboard");
    } catch (error) {
        console.error("Login failure", error); 
        setApiError("Something went wrong. Please try again.");
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("w-full max-w-sm space-y-5 px-8 py-10", className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your details to sign in</p>
      </div>

      <div className="space-y-4">
        <GoogleAuthButton mode="signin" />
        
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
        </div>

        {apiError && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
            {apiError}
          </div>
        )}

        <div className="space-y-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                </div>
                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-50 bg-white/50"
                />
            </div>
            <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                </div>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:opacity-50 bg-white/50"
                />
            </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
             <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
             Remember me
          </label>
          <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">Forgot password?</a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-slate-800 hover:translate-y-[-1px] active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
      </button>
    </form>
  );
}
