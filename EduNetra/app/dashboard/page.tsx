"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/Card";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";
import { getWithAuth } from "@/lib/utils/api";
import { MetricsData } from "@/components/MetricsRadarChart";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { ChevronRight, Filter, Calendar, BookOpen } from "lucide-react";

// Lazy load heavy charts
const MetricsRadarChart = dynamic(
  () => import("@/components/MetricsRadarChart").then((mod) => mod.MetricsRadarChart),
  { 
    loading: () => <div className="flex justify-center items-center h-[300px]"><Skeleton className="h-[250px] w-[250px] rounded-full" /></div>,
    ssr: false 
  }
);

const TimelineSummary = dynamic(
  () => import("@/components/TimelineSummary").then((mod) => mod.TimelineSummary),
  {
    loading: () => <div className="w-full h-[300px]"><Skeleton className="w-full h-full rounded-lg" /></div>,
    ssr: false
  }
);

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  institutionId?: string;
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

/**
 * Normalize interaction index to 0-100 range
 * ML model returns values that may be > 100, so we clamp them
 */
const normalizeInteractionIndex = (value: number = 0): number => {
  return Math.min(Math.max(value, 0), 100);
};

export default function DashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [institutionName, setInstitutionName] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("shikshanetra_token");
    const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";
    
    if (!token && !loggedIn) {
      // Don't redirect immediately to avoid flash if state is hydrating
      // But here we rely on localStorage so it is sync-ish on mount.
      // Show toast and push
      showToast("Please login to access dashboard");
      router.push("/login");
      return;
    }

    const userData = localStorage.getItem("shikshanetra_user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser?.institutionId) {
          fetchInstitution(parsedUser.institutionId);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      // Create demo user if not exists
      setUser({
        id: "demo",
        email: "demo@example.com",
        name: "Demo User",
        role: "mentor",
      });
    }
    
    fetchAnalysisHistory();
    refreshUserFromServer();
  }, []);

  // When user (and institutionId) changes, refetch institution
  useEffect(() => {
    if (user?.institutionId) {
      fetchInstitution(user.institutionId);
    }
  }, [user?.institutionId]);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await getWithAuth(`/api/analyze/history?limit=100`);

      if (!response.ok) {
        throw new Error("Failed to fetch analysis history");
      }

      const data = await response.json();
      setAnalyses(data.analyses || []);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      // Don't show toast on initial load error to avoid annoying user if network blip
      // showToast("Failed to load analysis history");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstitution = async (institutionId: string) => {
    try {
      const res = await getWithAuth(`/api/institution/${institutionId}`);
      if (!res.ok) return;
      const data = await res.json();
      setInstitutionName(data?.institution?.name || "");
    } catch (e) {
      console.warn("Failed to load institution", e);
    }
  };

  const refreshUserFromServer = async () => {
    try {
      const res = await getWithAuth(`/api/auth/me`);
      if (!res.ok) return;
      const freshUser = await res.json();
      setUser(freshUser);
      localStorage.setItem("shikshanetra_user", JSON.stringify(freshUser));
      if (freshUser?.institutionId) {
        fetchInstitution(freshUser.institutionId);
      }
    } catch (e) {
      console.warn("Failed to refresh user", e);
    }
  };

  // Filter analyses based on filters
  const filteredAnalyses = useMemo(() => {
    let filtered = [...analyses];

    if (subjectFilter !== "all") {
      filtered = filtered.filter((a) => a.subject === subjectFilter);
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((a) => new Date(a.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((a) => new Date(a.createdAt) <= toDate);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [analyses, subjectFilter, dateFrom, dateTo]);

  // Get unique subjects for filter
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set(analyses.map((a) => a.subject));
    return Array.from(subjects).sort();
  }, [analyses]);

  // Calculate average metrics for radar chart
  const averageMetrics: MetricsData = useMemo(() => {
    if (filteredAnalyses.length === 0) {
      return {
        clarity: 0,
        confidence: 0,
        engagement: 0,
        technicalDepth: 0,
        interaction: 0,
        topicRelevance: 0,
      };
    }

    const totals = filteredAnalyses.reduce(
      (acc, a) => ({
        clarity: acc.clarity + a.clarityScore,
        confidence: acc.confidence + a.confidenceScore,
        engagement: acc.engagement + a.engagementScore,
        technicalDepth: acc.technicalDepth + a.technicalDepth,
        interaction: acc.interaction + normalizeInteractionIndex(a.interactionIndex),
        topicRelevance: acc.topicRelevance + (a.topicRelevanceScore || 0),
      }),
      {
        clarity: 0,
        confidence: 0,
        engagement: 0,
        technicalDepth: 0,
        interaction: 0,
        topicRelevance: 0,
      }
    );

    const count = filteredAnalyses.length;
    return {
      clarity: totals.clarity / count,
      confidence: totals.confidence / count,
      engagement: totals.engagement / count,
      technicalDepth: totals.technicalDepth / count,
      interaction: totals.interaction / count,
      topicRelevance: totals.topicRelevance / count,
    };
  }, [filteredAnalyses]);

  // Get timeline data
  const timelineData = useMemo(() => {
    return filteredAnalyses.map((a) => ({
      date: a.createdAt,
      clarity: a.clarityScore,
      engagement: a.engagementScore,
      confidence: a.confidenceScore,
    }));
  }, [filteredAnalyses]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate overall growth/decline from last session
  const getGrowthTag = (index: number) => {
    // Logic: Compare current session (index) with the immediately PREVIOUS chronological session (index + 1)
    // Because the list is sorted Newest -> Oldest
    const current = filteredAnalyses[index];
    const previous = filteredAnalyses[index + 1];

    // If no previous session exists (at index + 1), this is the BASELINE (First Session)
    if (!previous) {
        return { label: "Baseline Session", color: "bg-slate-100 text-slate-600 border border-slate-200", tooltip: "First recorded session", isBaseline: true };
    }
    
    const currentScore = (current.clarityScore + current.confidenceScore + current.engagementScore) / 3;
    const previousScore = (previous.clarityScore + previous.confidenceScore + previous.engagementScore) / 3;

    if (previousScore <= 0) {
      return { label: "Baseline", color: "bg-slate-100 text-slate-700", tooltip: "Previous score invalid", isBaseline: true };
    }
    
    const diff = currentScore - previousScore;
    const percentChange = ((diff / previousScore) * 100).toFixed(1);
    const dateStr = new Date(previous.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    if (diff > 2) {
      return { label: `📈 +${percentChange}%`, color: "bg-green-100 text-green-700", tooltip: `Compared to session on ${dateStr}`, isBaseline: false };
    } else if (diff > 0) {
      return { label: `↗️ +${percentChange}%`, color: "bg-blue-100 text-blue-700", tooltip: `Compared to session on ${dateStr}`, isBaseline: false };
    } else if (diff < -2) {
      return { label: `📉 ${percentChange}%`, color: "bg-red-100 text-red-700", tooltip: `Compared to session on ${dateStr}`, isBaseline: false };
    } else {
      return { label: `→ ${percentChange}%`, color: "bg-slate-100 text-slate-700", tooltip: `Compared to session on ${dateStr}`, isBaseline: false };
    }
  };

  if (!user || loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 font-sans">
      <div className="mx-auto max-w-[1320px] px-6 space-y-8">
        
        {/* 1. Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-transparent">
          <div>
             <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
             <p className="mt-2 text-slate-500 font-medium">Welcome back, {user.name}</p>
             {institutionName && (
               <p className="mt-1 text-slate-500 text-sm">
                 Institution: <span className="font-semibold text-slate-700">{institutionName}</span>
               </p>
             )}
          </div>
          
          <div className="hidden md:block h-px flex-1 mx-8 bg-slate-200/60 self-center"></div>
        </div>

        {/* 2. Filters Bar */}
        <Card className="p-1.5 shadow-sm border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-center p-3 bg-slate-50/50 rounded-lg">
             <div className="flex items-center gap-2 text-slate-500 mr-2">
                 <Filter className="h-4 w-4" />
                 <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
             </div>
             
             <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div className="relative">
                   <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none pl-9"
                   >
                    <option value="all">All Subjects</option>
                    {uniqueSubjects.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                   <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500 pl-9"
                   />
                   <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                    <input
                     type="date"
                     value={dateTo}
                     onChange={(e) => setDateTo(e.target.value)}
                     className="w-full h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500 pl-9"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
             </div>
          </div>
        </Card>

        {/* 3. KPI Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-md border-slate-200 h-full flex flex-col justify-between group">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-primary-600 transition-colors">
              Total Sessions
            </p>
            <div>
                 <p className="mt-4 text-4xl font-bold text-slate-900 tracking-tight">
                   {filteredAnalyses.length}
                 </p>
                 <p className="mt-1 text-xs text-slate-400 font-medium">Recorded analyses</p>
            </div>
          </Card>

          <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-md border-slate-200 h-full flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Clarity
            </p>
            <div>
                <p className="mt-4 text-4xl font-bold text-primary-600 tracking-tight">
                  {averageMetrics.clarity.toFixed(1)}
                </p>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.min(averageMetrics.clarity, 100)}%` }}></div>
                </div>
            </div>
          </Card>

          <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-md border-slate-200 h-full flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Engagement
            </p>
            <div>
                <p className="mt-4 text-4xl font-bold text-emerald-600 tracking-tight">
                  {averageMetrics.engagement.toFixed(1)}
                </p>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(averageMetrics.engagement, 100)}%` }}></div>
                </div>
            </div>
          </Card>

          <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-md border-slate-200 h-full flex flex-col justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Avg Confidence
            </p>
            <div>
                <p className="mt-4 text-4xl font-bold text-amber-600 tracking-tight">
                  {averageMetrics.confidence.toFixed(1)}
                </p>
                <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(averageMetrics.confidence, 100)}%` }}></div>
                </div>
            </div>
          </Card>
        </div>

        {/* 4. Charts Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-8 border-slate-200 flex flex-col">
            <h2 className="mb-6 text-lg font-bold text-slate-900 flex items-center gap-2">
              Metrics Overview
            </h2>
            <div className="flex-1 flex items-center justify-center min-h-[350px]">
                {loading ? (
                  <p className="text-sm text-slate-500 animate-pulse">Loading chart...</p>
                ) : (
                  <div className="w-full max-w-[400px]">
                      <MetricsRadarChart data={averageMetrics} label="Average Metrics" />
                  </div>
                )}
            </div>
          </Card>

          <Card className="p-8 border-slate-200 flex flex-col">
            <h2 className="mb-6 text-lg font-bold text-slate-900">
              Performance Timeline
            </h2>
            <div className="flex-1 flex items-center justify-center min-h-[350px]">
                {loading ? (
                  <p className="text-sm text-slate-500 animate-pulse">Loading timeline...</p>
                ) : (
                  <div className="w-full h-full">
                     <TimelineSummary data={timelineData} />
                  </div>
                )}
            </div>
          </Card>
        </div>

        {/* 5. Session History Table */}
        <Card className="overflow-hidden border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-bold text-slate-900">
              Session History
            </h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">
              Loading session history...
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="py-16 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <BookOpen className="h-8 w-8" />
              </div>
              <p className="text-slate-900 font-medium">No sessions found</p>
              <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">
                {subjectFilter !== "all" || dateFrom || dateTo
                  ? "Try adjusting your filters to see more results."
                  : "Upload your first teaching session to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Clarity
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Engagement
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Confidence
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredAnalyses.map((analysis, index) => {
                    const growthTag = getGrowthTag(index);
                    return (
                    <tr
                      key={analysis.id}
                      className="group transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{formatDate(analysis.createdAt)}</span>
                          {growthTag && (
                            <span 
                              title={growthTag.tooltip}
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${growthTag.color}`}
                            >
                              {growthTag.isBaseline ? growthTag.label : `${growthTag.label} from last session`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        {analysis.topic}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            {analysis.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                        {analysis.clarityScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                        {analysis.engagementScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">
                        {analysis.confidenceScore.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/report/${analysis.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 group-hover:shadow-md"
                        >
                          View Report <ChevronRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
