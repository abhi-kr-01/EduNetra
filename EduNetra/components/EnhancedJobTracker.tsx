"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "./Card";
import { 
  FileVideo, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  ChevronDown,
  Clock,
  ExternalLink
} from "lucide-react";

type JobStatus = "created" | "uploading" | "uploaded" | "analyzing" | "analysis_done" | "generating_feedback" | "completed" | "failed";

interface JobItem {
  id: string;
  status: JobStatus;
  progress: number;
  analysisId?: string;
  error?: string;
  videoMetadata?: { fileName?: string };
  subject?: string;
  language?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EnhancedJobTrackerProps {
  jobs: JobItem[];
  expandedJobIds: Record<string, boolean>;
  onToggleExpand: (jobId: string) => void;
  messageTick?: number;
  getRotatingMessage?: (job: JobItem) => string;
}

export function EnhancedJobTracker({
  jobs,
  expandedJobIds,
  onToggleExpand,
  messageTick = 0,
  getRotatingMessage,
}: EnhancedJobTrackerProps) {
  if (jobs.length === 0) {
    return (
      <Card className="bg-slate-50 border border-dashed border-slate-200 p-8 text-center rounded-xl">
        <div className="mx-auto h-12 w-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-sm">
            <FileVideo className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No jobs yet</p>
        <p className="mt-1 text-xs text-slate-500">Your analysis history will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
         <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Your Analysis Jobs</h3>
         <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{jobs.length}</span>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => {
          const isCompleted = job.status === "completed";
          const isFailed = job.status === "failed";
          const isProcessing = !isCompleted && !isFailed;
          const isExpanded = expandedJobIds[job.id];
          
          return (
            <div
              key={job.id}
              className={`group overflow-hidden rounded-xl border transition-all duration-200 ${
                isFailed
                  ? "border-red-100 bg-red-50/50 hover:border-red-200"
                  : isCompleted
                    ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    : "border-blue-100 bg-blue-50/30 hover:border-blue-200"
              }`}
            >
              {/* Main Job Card Header */}
              <button
                onClick={() => onToggleExpand(job.id)}
                className="w-full flex items-center justify-between px-4 py-3.5"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Status Icon */}
                  <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center border shadow-sm ${
                      isCompleted ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                      isFailed ? "bg-red-50 border-red-100 text-red-600" :
                      "bg-white border-blue-100 text-blue-600"
                  }`}>
                      {isCompleted ? <CheckCircle2 className="h-5 w-5" /> :
                       isFailed ? <AlertCircle className="h-5 w-5" /> :
                       <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>

                  <div className="text-left min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate pr-4">
                        {job.videoMetadata?.fileName || "Untitled Session"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                        {isProcessing && (
                             <span className="text-xs font-medium text-blue-600 animate-pulse">Running Analysis...</span>
                        )}
                        {isCompleted && <span className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(job.createdAt || Date.now()).toLocaleDateString()}</span>}
                        {isFailed && <span className="text-xs text-red-600">Analysis Failed</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                   {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              {/* Progress Bar (Visible only when processing) */}
              {isProcessing && (
                 <div className="px-4 pb-4">
                     <div className="flex items-center justify-between text-xs mb-1.5">
                         <span className="text-slate-500 font-medium tracking-tight">
                            {getRotatingMessage ? getRotatingMessage(job) : "Processing..."}
                         </span>
                         <span className="text-blue-600 font-bold">{job.progress}%</span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                           style={{ width: `${job.progress}%` }}
                        ></div>
                     </div>
                 </div>
              )}

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                  {/* Error Message */}
                  {isFailed && job.error && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                      <p className="font-semibold">Error Details:</p>
                      <p className="mt-1">{job.error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 mb-4">
                      <div>
                          <p className="font-semibold text-slate-700 mb-0.5">Subject</p>
                          <p>{job.subject || "General"}</p>
                      </div>
                      <div>
                          <p className="font-semibold text-slate-700 mb-0.5">Language</p>
                          <p>{job.language || "English"}</p>
                      </div>
                      <div className="col-span-2">
                         <p className="font-semibold text-slate-700 mb-0.5">Job ID</p>
                         <p className="font-mono text-[10px] text-slate-400">{job.id}</p>
                      </div>
                  </div>

                  {/* Success Actions */}
                  {isCompleted && job.analysisId && (
                    <div className="pt-2">
                       <Link
                          href={`/report/${job.analysisId}`}
                          className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm transition-all"
                       >
                          View Full Report <ExternalLink className="h-3.5 w-3.5" />
                       </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
