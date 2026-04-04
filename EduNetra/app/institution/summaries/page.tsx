"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";
import { getWithAuth } from "@/lib/utils/api";
import { 
  Users,
  ArrowRight
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  institutionId?: string;
}

interface Teacher {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function InstitutionSummariesPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

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
          router.push("/dashboard");
          return;
        }
        
        setUser(parsedUser);
        fetchTeachers(parsedUser.institutionId);
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, []);

  const fetchTeachers = async (institutionId: string) => {
    try {
      const response = await getWithAuth(`/api/institution/${institutionId}/teachers`);

      if (!response.ok) {
        throw new Error("Failed to fetch teachers");
      }

      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      showToast("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    if (!user?.institutionId) return;
    router.push(`/institution/summaries/${teacherId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-slate-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Teacher Summaries
        </h1>
        <p className="text-slate-600">
          Select a teacher to view their summary and recent sessions
        </p>
      </div>

      {teachers.length === 0 ? (
        <Card className="p-12 text-center border-slate-200">
          <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No Teachers Yet
          </h2>
          <p className="text-slate-600 mb-6">
            Add teachers to your institution to view their summaries.
          </p>
          <button
            onClick={() => router.push("/institution/dashboard")}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                onClick={() => handleTeacherSelect(teacher.id)}
                className="cursor-pointer"
              >
                <Card className="p-6 border-slate-200 h-full hover:shadow-lg hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-slate-600 mb-3">{teacher.email}</p>
                      <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {teacher.role}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-colors flex-shrink-0 mt-1" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
                      View Summary
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
