"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";
import { getWithAuth, postWithAuth } from "@/lib/utils/api";
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  UserCircle,
  FileText,
  TrendingUp,
  Video,
  Clock,
  ChevronRight
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
  createdAt: string;
}

export default function InstitutionDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [addTeacherEmail, setAddTeacherEmail] = useState("");
  const [isAddingTeacher, setIsAddingTeacher] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("shikshanetra_token");
    const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";

    if (!token && !loggedIn) {
      showToast("Please login to access dashboard");
      router.push("/login");
      return;
    }

    const userData = localStorage.getItem("shikshanetra_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        
        // Only institution admins can access this page
        if (parsedUser.role !== "Institution Admin") {
          showToast("Access denied - Institution Admin access only");
          router.push("/dashboard");
          return;
        }
        
        // Check if institutionId exists
        if (!parsedUser.institutionId) {
          console.error("Institution ID missing from user data:", parsedUser);
          showToast("Please log out and log back in to refresh your session");
          localStorage.removeItem("shikshanetra_token");
          localStorage.removeItem("shikshanetra_user");
          localStorage.removeItem("shikshanetra_logged_in");
          router.push("/login");
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

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addTeacherEmail.trim()) {
      showToast("Please enter teacher's email");
      return;
    }

    if (!user?.institutionId) {
      showToast("Institution ID not found");
      return;
    }

    setIsAddingTeacher(true);

    try {
      const response = await postWithAuth(
        `/api/institution/${user.institutionId}/teachers/add`,
        { email: addTeacherEmail.trim() }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Failed to add teacher");
        return;
      }

      showToast("Teacher added successfully!");
      setAddTeacherEmail("");
      setShowAddForm(false);
      fetchTeachers(user.institutionId);
    } catch (error) {
      console.error("Error adding teacher:", error);
      showToast("Failed to add teacher");
    } finally {
      setIsAddingTeacher(false);
    }
  };

  const handleRemoveTeacher = async (teacherEmail: string) => {
    if (!confirm(`Remove ${teacherEmail} from your institution?`)) {
      return;
    }

    if (!user?.institutionId) {
      showToast("Institution ID not found");
      return;
    }

    try {
      const response = await postWithAuth(
        `/api/institution/${user.institutionId}/teachers/remove`,
        { email: teacherEmail }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || "Failed to remove teacher");
        return;
      }

      showToast("Teacher removed successfully");
      fetchTeachers(user.institutionId);
    } catch (error) {
      console.error("Error removing teacher:", error);
      showToast("Failed to remove teacher");
    }
  };

  const handleViewTeacherProfile = (teacherId: string) => {
    router.push(`/institution/teachers?teacherId=${teacherId}`);
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
          Institution Dashboard
        </h1>
        <p className="text-slate-600">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 border-slate-200 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Teachers</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{teachers.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 border-slate-200 bg-gradient-to-br from-green-50 to-white cursor-pointer hover:shadow-md transition-shadow"
        >
          <div 
            className="flex items-center justify-between"
            onClick={() => router.push("/institution/upload")}
          >
            <div>
              <p className="text-sm font-medium text-slate-600">Upload Video</p>
              <p className="text-sm text-slate-500 mt-1">Analyze session</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Video className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 border-slate-200 bg-gradient-to-br from-purple-50 to-white cursor-pointer hover:shadow-md transition-shadow"
        >
          <div 
            className="flex items-center justify-between"
            onClick={() => router.push("/institution/history")}
          >
            <div>
              <p className="text-sm font-medium text-slate-600">View History</p>
              <p className="text-sm text-slate-500 mt-1">Past analyses</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 border-slate-200 bg-gradient-to-br from-orange-50 to-white cursor-pointer hover:shadow-md transition-shadow"
        >
          <div 
            className="flex items-center justify-between"
            onClick={() => router.push("/institution/summaries")}
          >
            <div>
              <p className="text-sm font-medium text-slate-600">Summaries</p>
              <p className="text-sm text-slate-500 mt-1">View insights</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Teachers Management */}
      <Card className="p-6 border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teachers
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage teachers in your institution
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Teacher
          </button>
        </div>

        {/* Add Teacher Form */}
        {showAddForm && (
          <form onSubmit={handleAddTeacher} className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Teacher Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={addTeacherEmail}
                onChange={(e) => setAddTeacherEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="flex-1 h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
                disabled={isAddingTeacher}
              />
              <button
                type="submit"
                disabled={isAddingTeacher}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingTeacher ? "Adding..." : "Add"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddTeacherEmail("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Teachers List */}
        {teachers.length === 0 ? (
          <div className="text-center py-12">
            <UserCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No teachers yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Add teachers by their email to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserCircle className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{teacher.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-3.5 w-3.5" />
                      {teacher.email}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{teacher.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewTeacherProfile(teacher.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Profile
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveTeacher(teacher.email)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
