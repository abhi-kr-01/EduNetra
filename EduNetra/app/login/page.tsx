"use client";

import React, { Suspense } from "react";
import { AuthPage } from "@/components/auth/AuthPage";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-100">Loading...</div>}>
      <AuthPage initialMode="login" />
    </Suspense>
  );
}
