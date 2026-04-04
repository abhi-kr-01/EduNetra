"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/Card";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";
import { getWithAuth, postWithAuth } from "@/lib/utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  User,
  MapPin,
  Mail,
  Settings,
  Award,
  TrendingUp,
  Zap,
  Activity,
  Smile,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  ChevronRight,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// --- Types ---

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
  gestureIndex?: number;
  dominantEmotion?: string;
  topicRelevanceScore?: number;
}

// --- Helper Components ---

function KPICard({
  title,
  score,
  type,
  icon: Icon,
}: {
  title: string;
  score: number;
  type: "default" | "success" | "warning" | "info";
  icon: any;
}) {
  const getColor = () => {
    switch (type) {
      case "success":
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
      case "warning":
        return "text-amber-600 bg-amber-50 border-amber-100";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-100";
      default:
        return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const colorClass = getColor();

  return (
    <Card
      className={`group relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 border border-slate-200 h-full p-5`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
        </div>
        <div className={`p-1.5 rounded-lg ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 mb-4">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
            {score.toFixed(1)}
          </h3>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-auto">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            type === "success"
              ? "bg-emerald-500"
              : type === "warning"
              ? "bg-amber-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(score, 100)}%` }}
        ></div>
      </div>
    </Card>
  );
}

function InsightCard({
  title,
  value,
  subtext,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtext: string;
  icon: any;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5 transition-all hover:shadow-md border border-slate-200 h-full">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-${color}-100 text-${color}-600 bg-opacity-50`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </p>
        <h4 className="text-lg font-bold text-slate-900 truncate">{value}</h4>
        <p className="text-xs text-slate-500 line-clamp-1">{subtext}</p>
      </div>
    </Card>
  );
}

// --- Main Page Component ---

export default function ProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [institutionName, setInstitutionName] = useState<string>("");
  const [newInstitutionAdminEmail, setNewInstitutionAdminEmail] =
    useState<string>("");
  const [changingInstitution, setChangingInstitution] =
    useState<boolean>(false);

  // States for filter
  const [timeFilter, setTimeFilter] = useState<"all" | "30days" | "5sessions">(
    "all"
  );

  useEffect(() => {
    // Auth Check
    const token = localStorage.getItem("shikshanetra_token");
    const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";
    if (!token && !loggedIn) {
      showToast("Please login to view profile");
      router.push("/login");
      return;
    }

    // Load User
    const userData = localStorage.getItem("shikshanetra_user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        if (parsed?.institutionId) {
          fetchInstitution(parsed.institutionId);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Fallback demo
      setUser({
        id: "demo",
        email: "demo@example.com",
        name: "Demo Educator",
        role: "educator",
      });
    }

    fetchHistory();
    refreshUserFromServer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch institution when institutionId changes
  useEffect(() => {
    if (user?.institutionId) {
      fetchInstitution(user.institutionId);
    }
  }, [user?.institutionId]);

  const fetchHistory = async () => {
    try {
      const response = await getWithAuth(`/api/analyze/history?limit=100`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const sorted = (data.analyses || []).sort(
        (a: Analysis, b: Analysis) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAnalyses(sorted);
    } catch (err) {
      console.error(err);
      showToast("Failed to load profile data");
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
    } catch {}
  };

  const handleChangeInstitution = async () => {
    if (!newInstitutionAdminEmail.trim()) {
      showToast("Enter the institution admin's email");
      return;
    }
    setChangingInstitution(true);
    try {
      const res = await postWithAuth(`/api/institution/membership`, {
        adminEmail: newInstitutionAdminEmail.trim().toLowerCase(),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data?.error || "Failed to change institution");
        return;
      }
      showToast("Institution updated");
      // Update local user cache
      const userData = localStorage.getItem("shikshanetra_user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          parsed.institutionId = data?.institution?.id;
          localStorage.setItem("shikshanetra_user", JSON.stringify(parsed));
          setUser(parsed);
        } catch {}
      }
      setInstitutionName(data?.institution?.name || "");
      setNewInstitutionAdminEmail("");
    } catch (e) {
      console.error(e);
      showToast("Failed to change institution");
    } finally {
      setChangingInstitution(false);
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
    } catch (e) {}
  };

  // --- Aggregation Logic ---

  const filteredData = useMemo(() => {
    if (timeFilter === "5sessions") return analyses.slice(0, 5);
    if (timeFilter === "30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return analyses.filter((a) => new Date(a.createdAt) >= thirtyDaysAgo);
    }
    return analyses;
  }, [analyses, timeFilter]);

  const stats = useMemo(() => {
    if (!filteredData.length) return null;

    const sum = (key: keyof Analysis) =>
      filteredData.reduce((acc, curr) => acc + ((curr[key] as number) || 0), 0);
    const avg = (key: keyof Analysis) => sum(key) / filteredData.length;

    const overall =
      (avg("clarityScore") +
        avg("engagementScore") +
        avg("confidenceScore") +
        avg("technicalDepth")) /
      4;

    return {
      overall,
      clarity: avg("clarityScore"),
      engagement: avg("engagementScore"),
      confidence: avg("confidenceScore"),
      techDepth: avg("technicalDepth"),
      interaction: Math.min(avg("interactionIndex"), 100), // clamp
      totalSessions: analyses.length, // Always total
    };
  }, [filteredData, analyses.length]);

  const trendsData = useMemo(() => {
    // Reverse for chart (oldest to newest)
    const chartData = [...filteredData].reverse();

    return {
      labels: chartData.map((d) =>
        new Date(d.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          label: "Overall Score",
          data: chartData.map(
            (d) =>
              (d.clarityScore +
                d.engagementScore +
                d.confidenceScore +
                d.technicalDepth) /
              4
          ),
          borderColor: "#4f46e5", // Indigo 600
          backgroundColor: "rgba(79, 70, 229, 0.1)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [filteredData]);

  const teachingPersona = useMemo(() => {
    if (!stats) return { style: "Undetermined", desc: "No data available." };
    if (stats.engagement > 80)
      return {
        style: "Engaging Storyteller",
        desc: "You excel at capturing attention and keeping students hooked.",
      };
    if (stats.techDepth > 80)
      return {
        style: "Technical Expert",
        desc: "Your content is highly detailed and structurally sound.",
      };
    if (stats.clarity > 80)
      return {
        style: "Clear Explainer",
        desc: "You simplify complex topics effectively.",
      };
    return {
      style: "Balanced Instructor",
      desc: "You maintain a steady balance across all metrics.",
    };
  }, [stats]);

  // --- Render ---

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Loading Profile...</div>
      </div>
    );
  if (!user) return null;

  const currentOverall = stats ? stats.overall : 0;
  const statusBadge =
    currentOverall >= 80
      ? { label: "Excellent", color: "emerald" }
      : currentOverall >= 60
      ? { label: "Good", color: "blue" }
      : { label: "Needs Attention", color: "amber" };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20 font-sans">
      {/* 1. Header Section */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-500 border-4 border-white shadow-sm shrink-0">
                {user.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Award className="h-4 w-4" /> {user.role || "Mentor"}
                  </span>
                  <span className="hidden sm:inline h-1 w-1 rounded-full bg-slate-300"></span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> Online
                  </span>
                  {institutionName && (
                    <>
                      <span className="hidden sm:inline h-1 w-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {institutionName}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    Science
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    English
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-8 md:border-l border-slate-100 md:pl-8">
              <div className="shrink-0">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats?.totalSessions || 0}
                </p>
              </div>
              <div className="shrink-0">
                <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1">
                  Overall Score
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-4xl font-bold text-${statusBadge.color}-600`}
                  >
                    {currentOverall.toFixed(0)}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-${statusBadge.color}-100 text-${statusBadge.color}-700 whitespace-nowrap`}
                  >
                    {statusBadge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Institution Membership Controls (Mentors/Coordinators) */}
        {(user.role === "Mentor" || user.role === "Coordinator") && (
          <Card className="p-5 border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Institution Membership
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input
                type="email"
                value={newInstitutionAdminEmail}
                onChange={(e) => setNewInstitutionAdminEmail(e.target.value)}
                placeholder="Institution admin email"
                className="w-full sm:w-96 h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={handleChangeInstitution}
                disabled={changingInstitution}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 text-white px-3 py-2 text-sm font-semibold shadow-sm disabled:opacity-50"
              >
                {changingInstitution ? "Updating..." : "Change Institution"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Changing institutions will remove you from your current
              institution and add you to the new one.
            </p>
          </Card>
        )}

        {/* 2. KPI Cards */}
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Clarity"
            score={stats?.clarity || 0}
            type={stats?.clarity && stats.clarity >= 80 ? "success" : "info"}
            icon={BookOpen}
          />
          <KPICard
            title="Engagement"
            score={stats?.engagement || 0}
            type={
              stats?.engagement && stats.engagement >= 80 ? "success" : "info"
            }
            icon={Zap}
          />
          <KPICard
            title="Confidence"
            score={stats?.confidence || 0}
            type={
              stats?.confidence && stats.confidence >= 80
                ? "success"
                : "warning"
            }
            icon={Award}
          />
          <KPICard
            title="Tech Depth"
            score={stats?.techDepth || 0}
            type="info"
            icon={Activity}
          />
        </section>

        {/* 3. Insights & Persona */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-indigo-500" /> Teaching Persona
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <InsightCard
                title="Teaching Style"
                value={teachingPersona.style}
                subtext={teachingPersona.desc}
                icon={BookOpen}
                color="indigo"
              />
              <InsightCard
                title="Dominant Emotion"
                value="Neutral" // Hardcoded for aggregate, or mode of emotions if available
                subtext="Maintained professional demeanor"
                icon={Smile}
                color="amber"
              />
            </div>
          </Card>

          <Card className="p-6 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" /> Performance
                Trend
              </h3>
              <div className="flex bg-slate-100 rounded-lg p-1 self-start sm:self-auto">
                <button
                  onClick={() => setTimeFilter("5sessions")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeFilter === "5sessions"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Last 5
                </button>
                <button
                  onClick={() => setTimeFilter("all")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeFilter === "all"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  All Time
                </button>
              </div>
            </div>
            <div className="h-[180px] w-full">
              <Line
                data={trendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                      border: { display: false },
                      grid: { color: "#f1f5f9" },
                    },
                    x: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </Card>
        </section>

        {/* 4. Strengths & Weaknesses */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 border-l-4 border-l-emerald-500">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Top
              Strengths
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 mt-2"></div>
                <p className="text-sm text-slate-700">
                  Consistently high clarity score, indicating excellent verbal
                  communication.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 mt-2"></div>
                <p className="text-sm text-slate-700">
                  Strong technical depth in Science subjects.
                </p>
              </li>
            </ul>
          </Card>
          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" /> Areas to
                Improve
              </h3>
              <button className="text-xs font-semibold text-primary-600 hover:underline whitespace-nowrap">
                Get AI Plan
              </button>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 mt-2"></div>
                <p className="text-sm text-slate-700">
                  Engagement tends to drop in the middle of long sessions.
                </p>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 mt-2"></div>
                <p className="text-sm text-slate-700">
                  Consider adding more interactive questions to boost
                  Interaction Index.
                </p>
              </li>
            </ul>
          </Card>
        </section>

        {/* 5. Session History Table */}
        <section>
          <Card className="overflow-hidden border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Recent Sessions
              </h3>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View Dashboard <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Topic</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.slice(0, 5).map((session) => (
                    <tr
                      key={session.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {session.topic}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {(
                            (session.clarityScore +
                              session.engagementScore +
                              session.confidenceScore +
                              session.technicalDepth) /
                            4
                          ).toFixed(0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => router.push(`/report/${session.id}`)}
                          className="text-primary-600 font-medium hover:text-primary-800 text-xs"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
