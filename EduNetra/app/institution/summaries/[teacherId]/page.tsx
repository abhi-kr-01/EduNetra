"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/Card";
import { useToast } from "@/components/ToastContext";
import { useRouter, useParams } from "next/navigation";
import { getWithAuth } from "@/lib/utils/api";
import { 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  FileText,
  Eye,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

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

interface Memory {
  id: string;
  userId: string;
  totalSessions: number;
  overallScore: number;
  clarityScore: { mean: number; latest: number };
  confidenceScore: { mean: number; latest: number };
  engagementScore: { mean: number; latest: number };
  technicalDepth: { mean: number; latest: number };
  weaknesses: Array<{
    fieldName: string;
    averageScore: number;
    latestScore: number;
    trendLabel: string;
  }>;
  subjectsCovered: string[];
  languagesCovered: string[];
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

export default function TeacherSummaryDetailPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const teacherId = params.teacherId as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [teacherMemory, setTeacherMemory] = useState<Memory | null>(null);
  const [teacherAnalyses, setTeacherAnalyses] = useState<Analysis[]>([]);
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
        
        if (!parsedUser.institutionId) {
          showToast("Institution ID not found");
          router.push("/institution/summaries");
          return;
        }
        
        setUser(parsedUser);
        fetchTeacherData(parsedUser.institutionId, teacherId);
      } catch (error) {
        console.error("Error parsing user data:", error);
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [teacherId]);

  const fetchTeacherData = async (institutionId: string, tId: string) => {
    try {
      // Fetch teacher memory
      const memoryResponse = await getWithAuth(
        `/api/institution/${institutionId}/teachers/${tId}/memory`
      );

      if (memoryResponse.ok) {
        const memoryData = await memoryResponse.json();
        console.log("Memory response:", memoryData);
        setTeacherMemory(memoryData.memory);
        setTeacher(memoryData.teacher);
      } else {
        console.error("Memory fetch failed:", memoryResponse.status, await memoryResponse.text());
      }

      // Fetch teacher analyses (top 5)
      const analysesResponse = await getWithAuth(
        `/api/institution/${institutionId}/teachers/${tId}/analyses?limit=5`
      );

      if (analysesResponse.ok) {
        const analysesData = await analysesResponse.json();
        console.log("Analyses response:", analysesData);
        setTeacherAnalyses(analysesData.analyses || []);
        if (!teacher && analysesData.teacher) {
          setTeacher(analysesData.teacher);
        }
      } else {
        console.error("Analyses fetch failed:", analysesResponse.status, await analysesResponse.text());
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      showToast("Failed to load teacher data");
    } finally {
      setLoading(false);
    }
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
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/institution/summaries")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Summaries
        </button>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {teacher?.name || "Teacher Summary"}
        </h1>
        <p className="text-slate-600">
          {teacher?.email}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Summary */}
        <Card className="p-6 border-slate-200 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Summary & Insights</h2>
          </div>
          
          {teacherMemory ? (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Overall Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Overall Score</p>
                    <p className="text-2xl font-bold text-slate-900">{teacherMemory.overallScore.toFixed(0)}%</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold text-slate-900">{teacherMemory.totalSessions}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Key Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-600 font-medium">Clarity</span>
                    <span className="text-sm font-bold text-slate-900">{teacherMemory.clarityScore.mean.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-600 font-medium">Confidence</span>
                    <span className="text-sm font-bold text-slate-900">{teacherMemory.confidenceScore.mean.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-600 font-medium">Engagement</span>
                    <span className="text-sm font-bold text-slate-900">{teacherMemory.engagementScore.mean.toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-xs text-slate-600 font-medium">Technical Depth</span>
                    <span className="text-sm font-bold text-slate-900">{teacherMemory.technicalDepth.mean.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {teacherMemory.weaknesses && teacherMemory.weaknesses.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <span className="text-lg">→</span> Areas for Improvement
                  </h3>
                  <ul className="space-y-2">
                    {teacherMemory.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="text-xs text-slate-700 p-2 bg-orange-50 rounded-lg">
                        <p className="font-semibold text-orange-900 mb-1">{weakness.fieldName}</p>
                        <p className="text-orange-700">Score: {weakness.latestScore.toFixed(0)}% (Trend: {weakness.trendLabel})</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {teacherMemory.subjectsCovered && teacherMemory.subjectsCovered.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Subjects Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {teacherMemory.subjectsCovered.map((subject, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Last updated: {new Date(teacherMemory.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-600 font-medium">No summary available</p>
              <p className="text-xs text-slate-500 mt-2">
                Summary will be generated after analyzing sessions
              </p>
            </div>
          )}
        </Card>

        {/* Recent Sessions */}
        <Card className="p-6 border-slate-200 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Recent Sessions (Top 5)</h2>
          </div>
          
          {teacherAnalyses.length > 0 ? (
            <div className="space-y-4">
              {teacherAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm mb-1">
                        {analysis.topic}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                          {analysis.subject}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/report/${analysis.id}`}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors whitespace-nowrap ml-2"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View Report
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-200">
                    <div className="text-center">
                      <p className="text-xs text-slate-600 font-medium mb-1">Clarity</p>
                      <p className="text-base font-bold text-slate-900">
                        {analysis.clarityScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-600 font-medium mb-1">Confidence</p>
                      <p className="text-base font-bold text-slate-900">
                        {analysis.confidenceScore.toFixed(0)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-600 font-medium mb-1">Engagement</p>
                      <p className="text-base font-bold text-slate-900">
                        {analysis.engagementScore.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-600 font-medium">No sessions yet</p>
              <p className="text-xs text-slate-500 mt-2">
                Sessions will appear here once the teacher uploads videos
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
