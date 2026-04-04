"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getWithAuth } from "@/lib/utils/api";
import { useToast } from "@/components/ToastContext";
import { Card } from "@/components/Card";
import type { MemoryResponse } from "@/lib/types/memory";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Leaf, 
  Zap, 
  Brain, 
  Mic, 
  Hand, 
  Users, 
  Lightbulb, 
  Calendar,
  Layers,
  AlertTriangle
} from "lucide-react";

// Robust mapping for field names
const LABEL_MAP: Record<string, string> = {
  clarityScore: "Clarity",
  confidenceScore: "Confidence",
  engagementScore: "Engagement",
  technicalDepth: "Technical Depth",
  interactionIndex: "Interaction",
  gestureIndex: "Gestures",
  topicRelevanceScore: "Topic Relevance"
};

export const dynamic = "force-dynamic";

export default function InsightsPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [memory, setMemory] = useState<MemoryResponse | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("shikshanetra_token");
    const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";
    
    if (!token && !loggedIn) {
      router.push("/login");
      return;
    }
    
    fetchMemory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMemory = async () => {
    try {
      const response = await getWithAuth("/api/memory/my-summary");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.memory) {
          setMemory(data.memory);
        }
      }
    } catch (error) {
      console.error("Error fetching memory:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-8"></div>
        <div className="grid gap-6">
           <div className="h-40 bg-slate-100 rounded-xl animate-pulse"></div>
           <div className="grid grid-cols-3 gap-6">
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
              <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
           </div>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
         <h2 className="text-xl font-semibold text-slate-900">No Insights Yet</h2>
         <p className="text-slate-500 mt-2 mb-6">Upload a session to generate your teaching analytics.</p>
         <button  onClick={() => router.push('/upload')} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Upload Session
         </button>
      </div>
    );
  }

  // Helper Logic
  const metrics = [
    { name: "Clarity", icon: Mic, ...memory.clarityScore },
    { name: "Confidence", icon: Leaf, ...memory.confidenceScore }, // Swapped icon for a softer feel
    { name: "Engagement", icon: Users, ...memory.engagementScore },
    { name: "Technical Depth", icon: Brain, ...memory.technicalDepth },
    { name: "Interaction", icon: Zap, ...memory.interactionIndex },
    { name: "Gestures", icon: Hand, ...memory.gestureIndex },
  ].map(m => ({
     ...m,
     score: m.mean || 0,
     trend: m.trend || 0,
     latest: m.latest || 0
  }));

  const overallScore = (metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length) || 0;
  const performanceLevel = 
     overallScore >= 85 ? "Expert" :
     overallScore >= 75 ? "Advanced" :
     overallScore >= 60 ? "Proficient" :
     overallScore >= 45 ? "Developing" : "Beginner";

  // Data Normalization for Weaknesses
  // Handle case where backend might return object, array, or use alternate naming like 'waekness'
  const rawWeaknesses = memory.weaknesses || (memory as any).waekness || (memory as any).weakness || [];
  const weaknessesArray = Array.isArray(rawWeaknesses) 
      ? rawWeaknesses 
      : rawWeaknesses 
          ? [rawWeaknesses] 
          : [];

  // Helper to find improvement text based on field name
  const getImprovementText = (fieldName: string, score: number) => {
      const tips: Record<string, string> = {
          "Clarity": "Consider simplifying complex terms and slowing down your pace.",
          "Confidence": "Practice maintaining eye contact and reducing filler words.",
          "Engagement": "Try asking more rhetorical questions and using voice modulation.",
          "Technical Depth": "Add more structured explanations and connect concepts to real-world scenarios.",
          "Interaction": "Increase checks for understanding and encourage participation.",
          "Gestures": "Use more open hand gestures to appear approachable.",
          "Topic Relevance": "Stay focused on the main objectives."
      };
      
      const label = LABEL_MAP[fieldName] || fieldName;
      return tips[label] || "Focus on consistency to improve overall performance.";
  };

  // Helper for positive feedback
  const getStrengthText = (fieldName: string) => {
      const positives: Record<string, string> = {
          "Clarity": "Your clear articulation makes complex topics easy to understand.",
          "Confidence": "You exhibit a strong leadership presence that builds trust.",
          "Engagement": "You naturally keep the audience hooked throughout the session.",
          "Technical Depth": "Your deep subject knowledge adds significant value.",
          "Interaction": "You create an inclusive environment by encouraging participation.",
          "Gestures": "Your expressive body language effectively reinforces your points.",
          "Topic Relevance": "You stay perfectly aligned with the session's learning goals."
      };
      return positives[fieldName] || "You demonstrate exceptional consistency in this area.";
  };

  // Logic to prevent overlap: Calculate Top Strengths first
  const topStrengths = metrics
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

  const strengthNames = new Set(topStrengths.map(s => s.name));

  // Filter out any weakness that is already listed as a strength
  const filteredWeaknesses = weaknessesArray.filter((w: any) => {
      const rawField = w.fieldName || w.field || "unknown";
      const label = LABEL_MAP[rawField] || rawField.replace(/_/g, " ");
      return !strengthNames.has(label);
  });

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10">
        
        {/* 1️⃣ HEADER */}
        <div className="mb-10">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Insights & Analytics
           </h1>
           <p className="mt-2 text-lg text-slate-500">
              A holistic view of your teaching performance based on <span className="font-semibold text-slate-900">{memory.totalSessions} sessions</span>.
           </p>
        </div>

        {/* 2️⃣ EXECUTIVE SUMMARY PANEL */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
               {/* Left: Score */}
               <div className="p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
                   <div className="flex items-center gap-3 mb-2">
                       <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold 
                          ${overallScore >= 75 ? 'bg-emerald-100 text-emerald-700' : 
                            overallScore >= 60 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {performanceLevel}
                       </span>
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-slate-900 tracking-tight">{overallScore.toFixed(1)}</span>
                      <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">/ 100 Overall</span>
                   </div>
               </div>

               {/* Right: Metadata & Highlights */}
               <div className="p-8 md:w-2/3 bg-slate-50/50 flex flex-col justify-center">
                   <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                             <Calendar className="h-4 w-4" /> Last Session
                          </p>
                          <p className="text-base font-semibold text-slate-900">
                             {memory.lastAnalysisDate ? new Date(memory.lastAnalysisDate).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'long', day: 'numeric'
                             }) : "N/A"}
                          </p>
                       </div>
                       <div>
                          <p className="text-sm font-medium text-slate-500 mb-1 flex items-center gap-2">
                             <Layers className="h-4 w-4" /> Total Analyzed
                          </p>
                          <p className="text-base font-semibold text-slate-900">
                             {memory.totalSessions} Sessions
                          </p>
                       </div>
                   </div>
               </div>
            </div>
        </div>

        {/* 3️⃣ CORE METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
           {metrics.map((metric) => (
              <MetricCard key={metric.name} metric={metric} />
           ))}
        </div>

        {/* 4️⃣ KEY INSIGHTS (Strengths vs Improvements) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
           {/* Strengths */}
           <div className="rounded-2xl border border-slate-200 p-6 bg-white h-full">
               <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                     <TrendingUp className="h-4 w-4" />
                  </div>
                  Top Strengths
               </h3>
               <ul className="space-y-3">
                  {topStrengths.map((m) => (
                      <li key={m.name} className="flex items-start gap-3 text-sm text-slate-700 bg-emerald-50/50 p-3 rounded-lg">
                          <m.icon className="h-5 w-5 text-emerald-600 shrink-0" />
                          <div>
                             <span className="font-semibold text-slate-900">{m.name}: </span>
                             <span className="text-slate-600">
                                ({m.score.toFixed(1)}/100). {getStrengthText(m.name)}
                             </span>
                          </div>
                      </li>
                  ))}
               </ul>
           </div>

           {/* Areas to Improve */}
           <div className="rounded-2xl border border-slate-200 p-6 bg-white h-full">
               <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center">
                     <TrendingDown className="h-4 w-4" />
                  </div>
                  Areas to Focus
               </h3>
               <ul className="space-y-3">
                  {filteredWeaknesses.length > 0 ? (
                     filteredWeaknesses.slice(0, 3).map((w: any, idx: number) => {
                        // Safe field access
                        const rawField = w.fieldName || w.field || "unknown";
                        const label = LABEL_MAP[rawField] || rawField.replace(/_/g, " "); // Fallback to cleanup
                        const score = w.latestScore ?? w.score ?? 0;
                        
                        return (
                            <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 bg-amber-50/50 p-3 rounded-lg">
                                <Zap className="h-5 w-5 text-amber-600 shrink-0" />
                                <div>
                                    <span className="font-semibold text-slate-900 capitalize">{label}: </span>
                                    {score > 0 ? (
                                        <span className="text-slate-600">is low ({score.toFixed(1)}/100). {getImprovementText(rawField, score)}</span>
                                    ) : (
                                        <span className="text-slate-600">needs attention to improve overall score.</span>
                                    )}
                                </div>
                            </li>
                        );
                     })
                  ) : (
                     <li className="text-sm text-slate-500 italic flex items-center gap-2">
                        <Leaf className="h-4 w-4 text-emerald-500" />
                        No critical weaknesses detected recently.
                     </li>
                  )}
               </ul>
           </div>
        </div>

        {/* 5️⃣ RECOMMENDATIONS */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-2xl shadow-lg border-0">
           <div className="flex items-start gap-4">
               <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-6 w-6 text-yellow-300" />
               </div>
               <div>
                  <h3 className="text-lg font-bold text-white mb-2">AI Coach Recommendation</h3>
                  <p className="text-slate-300 leading-relaxed max-w-3xl">
                     {metrics.some(m => m.score < 60) ? (
                        <>Based on your recent analysis, focusing on <strong>{metrics.sort((a,b) => a.score - b.score)[0].name}</strong> would yield the biggest improvement. Try reviewing your session playback to identify moments where engagement dropped.</>
                     ) : (
                        "Your performance is solid across the board. To reach Expert level, focus on maintaining high energy in the final 10 minutes of your sessions."
                     )}
                  </p>
               </div>
           </div>
        </Card>

      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: any }) {
   const isGood = metric.score >= 70;
   const isAvg = metric.score >= 50 && metric.score < 70;
   
   return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all">
         <div className="flex items-start justify-between mb-4">
             <div className="flex items-center gap-3">
                 <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isGood ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                    <metric.icon className="h-5 w-5" />
                 </div>
                 <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{metric.name}</h4>
                    <span className="text-2xl font-bold text-slate-900">{metric.score.toFixed(1)}</span>
                 </div>
             </div>
             
             {/* Trend Badge */}
             <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                 metric.trend > 0 ? 'bg-green-100 text-green-700' : 
                 metric.trend < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
             }`}>
                 {metric.trend > 0 ? <TrendingUp className="h-3 w-3" /> : 
                  metric.trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                 {Math.abs(metric.trend).toFixed(1)}%
             </div>
         </div>

         {/* Progress Bar */}
         <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
             <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                   isGood ? 'bg-emerald-500' : isAvg ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
             ></div>
         </div>
      </div>
   );
}
