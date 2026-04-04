"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastContext";

// Import upload page implementation
import UploadPage from "@/app/upload/page";

export default function InstitutionUploadPage() {
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("shikshanetra_token");
    const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";

    if (!token && !loggedIn) {
      showToast("Please login to access this page");
      router.push("/login");
      return;
    }

    const userData = localStorage.getItem("shikshanetra_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        if (parsedUser.role !== "Institution Admin") {
          showToast("Access denied - Institution Admin access only");
          router.push("/institution/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, []);

  // Render the same upload page component
  return <UploadPage />;
}
