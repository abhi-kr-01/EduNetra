"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/Card";
import { useToast } from "@/components/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getWithAuth } from "@/lib/utils/api";
import { TimeSegments, TimeSegment } from "@/components/TimeSegments";
import dynamic from "next/dynamic";
import { ReportSkeleton } from "@/components/skeletons/ReportSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScoreCard } from "@/components/ScoreCard";
import { 
  ChevronLeft, 
  Share2, 
  Download, 
  Clock, 
  Languages, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Activity, 
  Smile, 
  Mic, 
  Search,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Lightbulb
} from "lucide-react";

// Lazy load heavy chart component
const MinuteWiseAnalytics = dynamic(
  () => import("@/components/MinuteWiseAnalytics").then((mod) => mod.MinuteWiseAnalytics),
  {
    loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
    ssr: false
  }
);

interface Analysis {
  id: string;
  sessionId: string;
  topic: string;
  subject: string;
  language: string;
  transcript: string;
  createdAt: string;
  clarityScore: number;
  confidenceScore: number;
  audioPerMinute?: Array<{
    minute: number;
    start_sec: number;
    end_sec: number;
    clarity_score: number;
    confidence_score: number;
  }>;
  engagementScore: number;
  gestureIndex: number;
  dominantEmotion: string;
  videoConfidenceScore?: number;
  videoPerMinute?: Array<{
    minute: number;
    start_sec: number;
    end_sec: number;
    engagement_score: number;
    gesture_index: number;
    dominant_emotion: string;
    confidence_score: number;
  }>;
  technicalDepth: number;
  interactionIndex: number;
  topicRelevanceScore: number;
  coachFeedback?: {
    performance_summary?: string;
    teaching_style?: { style: string; explanation: string };
    strengths?: string[];
    weaknesses?: string[];
    factual_accuracy_audit?: string[];
    content_metadata?: { titles: string[]; hashtags: string[] };
  };
  videoMetadata: {
    fileName: string;
    videoUrl?: string;
    storagePath?: string; // legacy
  };
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const { showToast } = useToast();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // UI States
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("shikshanetra_token");
    const loggedIn = localStorage.getItem("shikshanetra_logged_in") === "true";
    if (!token && !loggedIn) {
      showToast("Please login to view reports");
      router.push("/login");
      return;
    }

    fetchAnalysisReport();
    
    // Scroll listener for sticky header
    const handleScroll = () => {
      setShowStickyHeader(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchAnalysisReport = async () => {
    try {
      const response = await getWithAuth(`/api/analyze/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch analysis report");
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      showToast("Failed to load analysis report");
      
      // Determine redirect based on user role
      const userData = localStorage.getItem("shikshanetra_user");
      const user = userData ? JSON.parse(userData) : null;
      const redirectPath = user?.role === "Institution Admin" ? "/institution/summaries" : "/dashboard";
      
      router.push(redirectPath);
    } finally {
      setLoading(false);
    }
  };

  const loadVideo = async () => {
    const directUrl = analysis?.videoMetadata?.videoUrl;
    if (!directUrl) {
      showToast("Video not available");
      return;
    }

    setLoadingVideo(true);
    try {
      setVideoUrl(directUrl);
    } catch (error) {
      console.error("Error loading video:", error);
      showToast("Failed to load video");
    } finally {
      setLoadingVideo(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  
  // Generate summary text based on scores if AI summary is missing
  const getSummaryText = () => {
    if (analysis?.coachFeedback?.performance_summary) {
      return analysis.coachFeedback.performance_summary;
    }
    
    // Fallback logic
    if (!analysis) return "";
    const avgScore = (
      analysis.clarityScore +
      analysis.confidenceScore +
      analysis.engagementScore +
      analysis.technicalDepth
    ) / 4;

    let summary = `This teaching session on "${analysis.topic}" demonstrates `;
    if (avgScore >= 80) summary += "strong overall performance with excellent clarity.";
    else if (avgScore >= 60) summary += "solid performance with room for improvement.";
    else summary += "areas that need significant attention.";
    
    return summary;
  };
  
  const getOverallStatus = () => {
    if (!analysis) return { label: "N/A", color: "gray" };
    const avg = (analysis.clarityScore + analysis.engagementScore + analysis.confidenceScore + analysis.technicalDepth) / 4;
    
    if (avg >= 80) return { label: "Excellent Session", color: "green", icon: <CheckCircle2 className="h-5 w-5" /> };
    if (avg >= 60) return { label: "Good Session", color: "blue", icon: <CheckCircle2 className="h-5 w-5" /> };
    return { label: "Needs Improvement", color: "orange", icon: <AlertCircle className="h-5 w-5" /> };
  };

  const getInsights = () => {
    if (!analysis) return { strengths: [], focusAreas: [] };

    // Define metrics with descriptions and improvement tips
    const metrics = [
      { 
        name: "Clarity", 
        score: analysis.clarityScore, 
        description: "Your explanations are clear, articulate, and easy to follow.", 
        improvement: "Consider simplifying complex terms, slowing down your pace, and using more analogies." 
      },
      { 
        name: "Confidence", 
        score: analysis.confidenceScore, 
        description: "You maintain a steady, assured delivery with good presence.", 
        improvement: "Practice maintaining eye contact, using a steady voice tone, and reducing filler words." 
      },
      { 
        name: "Engagement", 
        score: analysis.engagementScore, 
        description: "You successfully keep the audience interested and attentive.", 
        improvement: "Try asking more rhetorical questions, using voice modulation, and adding interactive elements." 
      },
      { 
        name: "Technical Depth", 
        score: analysis.technicalDepth, 
        description: "You demonstrate strong subject matter expertise and depth.", 
        improvement: "Add more structured explanations, technical examples, and connect concepts to real-world scenarios." 
      },
      { 
        name: "Interaction", 
        score: analysis.interactionIndex, 
        description: "You effectively involve the learners in the session.", 
        improvement: "Increase the frequency of checks for understanding and encourage more participation." 
      },
      { 
        name: "Topic Relevance", 
        score: analysis.topicRelevanceScore, 
        description: "Your content stays highly relevant to the core topic.", 
        improvement: "Ensure you stay focused on the main objectives and avoid tangible digressions." 
      },
      {
        name: "Gesture",
        score: analysis.gestureIndex,
        description: "Your body language and gestures support your message effectively.",
        improvement: "Use more open hand gestures and avoid crossing arms to appear more approachable."
      }
    ];

    // 1. Generate Strengths
    // Sort descending by score
    const sortedByScore = [...metrics].sort((a, b) => b.score - a.score);
    
    // Take top 3
    const strengths = sortedByScore.slice(0, 3).map(m => {
        let label = "Developing Strength";
        let colorClass = "bg-yellow-100 text-yellow-700";
        
        if (m.score >= 70) {
            label = "Primary Strength";
            colorClass = "bg-green-100 text-green-700";
        } else if (m.score >= 50) {
            label = "Strong Area";
            colorClass = "bg-blue-100 text-blue-700";
        }
        
        return {
            ...m,
            label,
            colorClass
        };
    });

    // 2. Generate Areas to Focus
    // Filter for low scores (< 75) AND exclude items that are already listed as strengths (overlap prevention)
    const strengthNames = new Set(strengths.map(s => s.name));
    const lowMetrics = metrics
        .filter(m => m.score < 75 && !strengthNames.has(m.name))
        .sort((a, b) => a.score - b.score);
    
    let focusAreas = [];
    if (lowMetrics.length > 0) {
        focusAreas = lowMetrics.slice(0, 3).map(m => ({
            name: m.name,
            score: m.score,
            message: `⚡ ${m.name} is low (${Math.round(m.score)}/100). ${m.improvement}`
        }));
    } else {
        // No critical weaknesses found
        focusAreas.push({
            name: "Consistency",
            score: 100,
            message: "✅ No critical weaknesses detected. Focus on maintaining consistency to improve overall performance."
        });
    }

    return { strengths, focusAreas };
  };

  // Generate time segments from analysis data
  // In a real app, this would come from the API
  const generateTimeSegments = (): TimeSegment[] => {
    if (!analysis) return [];

    const segments: TimeSegment[] = [];

    // Example logic
    if (analysis.engagementScore >= 80) {
      segments.push({
        startTime: 0,
        endTime: 120,
        label: "High Engagement Opening",
        type: "highlight",
        description: "Strong student engagement and interaction during introduction",
      });
    }

    if (analysis.clarityScore < 70) {
      segments.push({
        startTime: 300,
        endTime: 420,
        label: "Clarity Issue Detected",
        type: "warning",
        description: "Reduced clarity in explanation - consider slowing pace",
      });
    }
    
    // Add logic to use audio/video per minute data if available for segments?
    // For now keeping simple fallback + API segments if existed.
    
    return segments;
  };
  
  const handleTranscriptSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setTranscriptSearch(e.target.value);
      if (e.target.value && !isTranscriptExpanded) setIsTranscriptExpanded(true);
  };
  
  // Highlight keywords in transcript
  const getHighlightedTranscript = (text: string) => {
      if (!transcriptSearch) return text;
      
      const parts = text.split(new RegExp(`(${transcriptSearch})`, 'gi'));
      return (
          <>
             {parts.map((part, i) => 
                part.toLowerCase() === transcriptSearch.toLowerCase() ? 
                <span key={i} className="bg-yellow-200 text-slate-900 font-medium px-0.5 rounded">{part}</span> : 
                part
             )}
          </>
      );
  };

  if (loading) {
    return <ReportSkeleton />;
  }


  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Report not found</h3>
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                Back to Dashboard
            </Link>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Link copied to clipboard");
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const overallStatus = getOverallStatus();
  const { strengths: dynamicStrengths, focusAreas: dynamicFocusAreas } = getInsights();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans print:bg-white print:pb-0">
      
      {/* 1. Sticky Mini Header */}
      <div className={`fixed top-0 left-0 right-0 z-50 transform bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 transition-transform duration-300 ${showStickyHeader ? "translate-y-0" : "-translate-y-full"} print:hidden`}>
        <div className="mx-auto flex max-w-[1320px] items-center justify-between">
           <div className="flex items-center gap-3">
               <h3 className="font-semibold text-slate-800">{analysis.topic}</h3>
               <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium bg-${overallStatus.color}-100 text-${overallStatus.color}-700`}>
                  {overallStatus.label}
               </span>
           </div>
           <div className="flex gap-2">
               <button onClick={handleShare} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Share</button>
               <button onClick={handleDownloadPDF} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800">Download PDF</button>
           </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 py-8">
        
        {/* 2. Main Header */}
        <header className="mb-8 print:hidden">
           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
               <div>
                   <Link href="/dashboard" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800">
                       <ChevronLeft className="h-4 w-4" /> Back to Dashboard
                   </Link>
                   <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                       Session Analysis Report
                   </h1>
                   <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                       <div className="flex items-center gap-2">
                           <BookOpen className="h-4 w-4" />
                           <span>{analysis.subject}</span>
                       </div>
                       <div className="flex items-center gap-2">
                           <Languages className="h-4 w-4" />
                           <span>{analysis.language}</span>
                       </div>
                       <div className="flex items-center gap-2">
                           <Clock className="h-4 w-4" />
                           <span>{formatDate(analysis.createdAt)}</span>
                       </div>
                   </div>
               </div>
               <div className="flex gap-3">
                   <button onClick={handleShare} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                       <Share2 className="h-4 w-4" /> Share
                   </button>
                   <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                       <Download className="h-4 w-4" /> Download PDF
                   </button>
               </div>
           </div>
        </header>

        {/* 3. Executive Summary (Hero Section) */}
        <section className="mb-8 break-inside-avoid">
            <Card className="overflow-hidden border-none bg-gradient-to-r from-blue-50/50 to-indigo-50/30 p-0 shadow-sm ring-1 ring-slate-200">
                <div className="grid gap-6 p-6 lg:grid-cols-3 lg:gap-12">
                   <div className="lg:col-span-2 space-y-3">
                       <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                           <Zap className="h-5 w-5 text-amber-500 fill-amber-500" /> AI Executive Summary
                       </h2>
                       <p className="text-base leading-relaxed text-slate-700">
                           {getSummaryText()}
                       </p>
                   </div>
                   <div className="flex flex-col items-center justify-center rounded-xl bg-white/60 p-6 text-center ring-1 ring-slate-100">
                       <span className="mb-2 text-sm font-medium uppercase tracking-wider text-slate-500">
                           Overall Status
                       </span>
                       <div className={`mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-${overallStatus.color}-100 text-${overallStatus.color}-600`}>
                           {overallStatus.icon}
                       </div>
                       <span className={`text-lg font-bold text-${overallStatus.color}-700`}>
                           {overallStatus.label}
                       </span>
                   </div>
                </div>
            </Card>
        </section>

        {/* 4. Core Score Cards (KPIs) */}
        <section className="mb-10 break-inside-avoid">
           <div className="mb-4 flex items-center justify-between">
               <h2 className="text-lg font-semibold text-slate-900">Key Performance Indicators</h2>
           </div>
           <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
               <ScoreCard 
                  title="Clarity" 
                  score={analysis.clarityScore} 
                  type="clarity"
                  description="Measures how clear and understandable your speech was."
               />
               <ScoreCard 
                  title="Engagement" 
                  score={analysis.engagementScore} 
                  type="engagement"
                  description="Measures student interest and attentiveness potential."
               />
               <ScoreCard 
                  title="Confidence" 
                  score={analysis.confidenceScore} 
                  type="confidence"
                  description="Measures your vocal assurance and delivery strength."
               />
               <ScoreCard 
                  title="Technical Depth" 
                  score={analysis.technicalDepth} 
                  type="technical"
                  description="Measures the complexity and accuracy of technical terms."
               />
           </div>
        </section>

        {/* 5. Video & Time Segments Grid */}
        <section className="mb-10 grid gap-8 lg:grid-cols-12 print:hidden">
            
            {/* Left: Video Player (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Session Recording</h2>
               </div>
               
                 <Card className="overflow-hidden bg-slate-900 p-0 shadow-md">
                   {analysis.videoMetadata?.videoUrl ? (
                        videoUrl ? (
                            <video
                            ref={videoRef}
                            controls
                            className="w-full aspect-video object-contain bg-black"
                            src={videoUrl}
                            >
                            Your browser does not support the video tag.
                            </video>
                        ) : (
                            <div className="flex aspect-video w-full flex-col items-center justify-center bg-slate-900 text-white">
                                <p className="mb-4 text-slate-400">Video preview available</p>
                                <button
                                    onClick={loadVideo}
                                    disabled={loadingVideo}
                                    className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-slate-900 transition-transform hover:scale-105"
                                >
                                    {loadingVideo ? "Loading..." : "Load Recording"}
                                </button>
                            </div>
                        )
                   ) : (
                        <div className="flex aspect-video w-full flex-col items-center justify-center bg-slate-100 text-slate-400">
                             <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                             <p className="text-sm">No recording available</p>
                        </div>
                   )}
               </Card>
            </div>
            
            {/* Right: Segments (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
               <h2 className="text-lg font-semibold text-slate-900">Key Moments</h2>
               <Card className="h-full max-h-[500px] overflow-y-auto p-4 border-slate-200 shadow-sm">
                   <TimeSegments
                       segments={generateTimeSegments()}
                       videoRef={videoRef}
                   />
               </Card>
            </div>
        </section>
        
        {/* 6. Minute-wise Analytics */}
        <section className="mb-10 break-inside-avoid">
           <MinuteWiseAnalytics 
             audioPerMinute={analysis.audioPerMinute}
             videoPerMinute={analysis.videoPerMinute}
             previousMetrics={{
               avgClarityScore: analysis.clarityScore,
               avgConfidenceScore: analysis.confidenceScore,
               avgEngagementScore: analysis.engagementScore,
             }}
           />
        </section>

        {/* 7. Insights Grid (Teaching Style, Emotions, etc.) */}
        <section className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4 break-inside-avoid">
           <Card className="relative overflow-hidden p-5 border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-violet-100 text-violet-600 rounded-lg">
                    <Activity className="h-5 w-5" />
                 </div>
                 <h3 className="font-semibold text-slate-700">Interaction Index</h3>
              </div>
              <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-slate-900">{analysis.interactionIndex.toFixed(1)}</span>
              </div>
              
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                 <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min(analysis.interactionIndex, 100)}%` }}></div>
              </div>
           </Card>

           <Card className="relative overflow-hidden p-5 border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                    <Zap className="h-5 w-5" />
                 </div>
                 <h3 className="font-semibold text-slate-700">Gesture Index</h3>
              </div>
              <div className="flex items-end gap-2">
                 <span className="text-3xl font-bold text-slate-900">{analysis.gestureIndex.toFixed(1)}</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                 <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${Math.min(analysis.gestureIndex, 100)}%` }}></div>
              </div>
           </Card>

           <Card className="relative overflow-hidden p-5 border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Smile className="h-5 w-5" />
                 </div>
                 <h3 className="font-semibold text-slate-700">Dominant Emotion</h3>
              </div>
              <p className="text-2xl font-bold capitalize text-slate-900">{analysis.dominantEmotion}</p>
              <p className="mt-1 text-xs text-slate-500">Based on facial expression analysis</p>
           </Card>
           
           <Card className="relative overflow-hidden p-5 border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                 <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <BrainCircuit className="h-5 w-5" />
                 </div>
                 <h3 className="font-semibold text-slate-700">Teaching Style</h3>
              </div>
              <p className="text-lg font-bold text-slate-900 leading-tight">
                 {analysis.coachFeedback?.teaching_style?.style || "Balanced"}
              </p>
              <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                 {analysis.coachFeedback?.teaching_style?.explanation || "A balanced approach to teaching."}
              </p>
           </Card>
        </section>

        {/* 8. Transcript Section */}
        {analysis.transcript && (
           <section className="mb-10">
               <Card className="p-0 border-slate-200 overflow-hidden bg-white shadow-sm">
                   <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                       <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                           <Mic className="h-5 w-5 text-slate-400" />
                           Transcript Analysis
                       </h2>
                       <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search transcript..."
                                value={transcriptSearch}
                                onChange={handleTranscriptSearch}
                                className="w-full sm:w-64 rounded-lg border border-slate-200 py-1.5 pl-9 pr-4 text-sm focus:border-primary-500 focus:outline-none"
                            />
                       </div>
                   </div>
                   <div className="relative p-6">
                        <div className={`prose prose-sm max-w-none text-slate-600 leading-relaxed ${!isTranscriptExpanded ? "max-h-[200px] overflow-hidden mask-linear-fade" : ""}`}>
                           <p className="whitespace-pre-wrap font-mono text-sm">
                               {getHighlightedTranscript(analysis.transcript)}
                           </p>
                        </div>
                        <div className={`mt-4 flex justify-center ${!isTranscriptExpanded ? "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white pt-20 pb-4" : ""}`}>
                            <button 
                                onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                                className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white shadow-sm px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-600"
                            >
                                {isTranscriptExpanded ? (
                                    <>Collapse Transcript <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                    <>Read Full Transcript <ChevronDown className="h-4 w-4" /></>
                                )}
                            </button>
                        </div>
                   </div>
               </Card>
           </section>
        )}

        {/* 9. Actionable Insights (Dynamic) */}
        <section className="grid gap-8 lg:grid-cols-2 mb-10 break-inside-avoid">
            {/* Strengths */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Top Strengths</h2>
                </div>
                <div className="space-y-3">
                    {dynamicStrengths.map((strength, i) => (
                        <Card key={i} className="flex flex-col gap-1 border-l-4 border-l-green-500 bg-white p-4 shadow-sm transition-all hover:translate-x-1">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-900">{strength.name} <span className="text-slate-400 font-normal">({Math.round(strength.score)}/100)</span></span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${strength.colorClass}`}>
                                    {strength.label}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600">{strength.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
            
            {/* Areas to Focus */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                            <Lightbulb className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Areas to Focus</h2>
                </div>
                <div className="space-y-3">
                    {dynamicFocusAreas.map((area, i) => (
                        <Card key={i} className="group relative flex items-start gap-4 border-l-4 border-l-orange-500 bg-white p-4 shadow-sm transition-all hover:translate-x-1">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">{area.message}</p>
                            </div>
                        </Card>
                    ))}
                </div>
                <div className="mt-4 flex justify-end">
                    <button className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-200 hover:bg-slate-800 hover:shadow-xl transition-all">
                        <Zap className="h-4 w-4 text-yellow-400" /> Get AI Improvement Plan
                    </button>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
