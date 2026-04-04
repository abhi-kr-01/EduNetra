"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleAuthWrapper({ children }: { children: React.ReactNode }) {
  // Using a fallback for development if env is missing, but in prod it should be set.
  // The user should provide GOOGLE_CLIENT_ID in .env
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  
  if (!clientId) {
      console.warn("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in environment variables. Google Auth will not work.");
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
