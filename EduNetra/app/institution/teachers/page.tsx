"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/Card";
import { useToast } from "@/components/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getWithAuth } from "@/lib/utils/api";
import Link from "next/link";
import { 
  ArrowLeft, 
  UserCircle, 
  Mail, 
  TrendingUp, 
  FileText,
  Calendar,
  Award,
  BarChart3,
  Eye
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
  name: string;
  email: string;
}

interface Memory {
  userId: string;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  updatedAt: string;
}

interface Analysis {
  id: string;
  sessionId: string;
  topic: string;
  subject: string;
  language: string;
  createdAt: string;
  clarityScore: number;
  confidenceScore: number;
  engagementScore: number;
  technicalDepth: number;
  interactionIndex?: number;
  topicRelevanceScore?: number;
}

export const dynamic = "force-dynamic";

function TeachersPageContent() {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teacherId = searchParams.get("teacherId");

  const [user, setUser] = useState<UserData | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
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

        if (teacherId) {
          fetchTeacherData(parsedUser.institutionId, teacherId);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [teacherId]);

  const fetchTeacherData = async (institutionId: string, teacherId: string) => {
    try {
      // Fetch teacher memory
      const memoryResponse = await getWithAuth(
        `/api/institution/${institutionId}/teachers/${teacherId}/memory`
      );

      if (memoryResponse.ok) {
        const memoryData = await memoryResponse.json();
        setTeacher(memoryData.teacher);
        setMemory(memoryData.memory);
      }

      // Fetch teacher analyses (top 5)
      const analysesResponse = await getWithAuth(
        `/api/institution/${institutionId}/teachers/${teacherId}/analyses?limit=5`
      );

      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        setAnalyses(analysesData.analyses || []);
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      showToast("Failed to load teacher data");
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScore = (analyses: Analysis[]) => {
    if (analyses.length === 0) return 0;
    
    const total = analyses.reduce((sum, a) => {
      const avg = (
        a.clarityScore + 
        a.confidenceScore + 
        a.engagementScore + 
        a.technicalDepth +
        (a.interactionIndex || 0) +
        (a.topicRelevanceScore || 0)
      ) / 6;
      return sum + avg;
    }, 0);
    
    return (total / analyses.length).toFixed(1);
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

  if (!teacherId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/institution/dashboard"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        <Card className="p-12 text-center border-slate-200">
          <UserCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Teacher Selected</h2>
          <p className="text-slate-600 mb-6">
            Please select a teacher from the dashboard to view their profile.
          </p>
          <Link
            href="/institution/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Go to Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <Link
        href="/institution/dashboard"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Teacher Profile */}
      <Card className="p-6 border-slate-200 shadow-lg mb-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <UserCircle className="h-10 w-10 text-slate-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {teacher?.name || "Teacher Profile"}
            </h1>
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <Mail className="h-4 w-4" />
              {teacher?.email}
            </div>
            
            {analyses.length > 0 && (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {analyses.length}
                    </p>
                    <p className="text-xs text-slate-600">Total Sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {calculateAverageScore(analyses)}%
                    </p>
                    <p className="text-xs text-slate-600">Average Score</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memory Summary */}
        <Card className="p-6 border-slate-200 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Summary & Insights
          </h2>
          
          {memory ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Summary</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {memory.summary}
                </p>
              </div>
              
              {memory.strengths && memory.strengths.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-green-700 mb-2">Strengths</h3>
                  <ul className="space-y-1">
                    {memory.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {memory.areasForImprovement && memory.areasForImprovement.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-orange-700 mb-2">
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-1">
                    {memory.areasForImprovement.map((area, idx) => (
                      <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5">→</span>
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Last updated: {new Date(memory.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 font-medium">No summary available</p>
              <p className="text-xs text-slate-500 mt-1">
                Summary will be generated after analyzing sessions
              </p>
            </div>
          )}
        </Card>

        {/* Top 5 Sessions */}
        <Card className="p-6 border-slate-200 shadow-lg">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Recent Sessions (Top 5)
          </h2>
          
          {analyses.length > 0 ? (
            <div className="space-y-3">
              {analyses.map((analysis, idx) => (
                <div
                  key={analysis.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm">
                        {analysis.topic}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {analysis.subject}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/report/${analysis.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center">
                      <p className="text-xs text-slate-600">Clarity</p>
                      <p className="text-sm font-bold text-slate-900">
                        {analysis.clarityScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-600">Confidence</p>
                      <p className="text-sm font-bold text-slate-900">
                        {analysis.confidenceScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-600">Engagement</p>
                      <p className="text-sm font-bold text-slate-900">
                        {analysis.engagementScore.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 font-medium">No sessions yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Sessions will appear here once the teacher uploads videos
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-slate-600">Loading...</div>
          </div>
        </div>
      }
    >
      <TeachersPageContent />
    </Suspense>
  );
}
