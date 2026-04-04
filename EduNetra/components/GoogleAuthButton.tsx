"use client";
import React from 'react';

import { GoogleLogin } from "@react-oauth/google";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";

export function GoogleAuthButton({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const { showToast } = useToast();
  const router = useRouter();

  // Move useState import to top
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      
      if (!res.ok) {
          throw new Error(data.error || "Google Authentications Failed");
      }

      // Store tokens/user
      localStorage.setItem("shikshanetra_token", data.accessToken);
      if (data.user) {
          localStorage.setItem("shikshanetra_user", JSON.stringify(data.user));
      }
      localStorage.setItem("shikshanetra_logged_in", "true");

      showToast(`Welcome ${data.user?.name || "User"}!`);
      // Start navigation but stick to loading state
      router.push("/dashboard");

    } catch (err: any) {
        console.error(err);
        showToast(err.message || "Failed to authenticate with Google");
        setIsLoading(false);
    }
  };

  if (isLoading) {
      return (
          <div className="w-full flex justify-center py-2">
              <div className="flex w-[320px] h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white text-slate-600 shadow-sm">
                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-transparent"></div>
                 <span className="text-sm font-medium">Authenticating...</span>
              </div>
          </div>
      );
  }

  return (
    <div className="w-full flex justify-center py-2">
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => showToast("Google Login Failed")}
            theme="outline"
            size="large"
            width="320" // Reasonable width for cards
            text={mode === "signup" ? "signup_with" : "signin_with"}
            shape="rectangular"
            logo_alignment="left"
        />
    </div>
  );
}
