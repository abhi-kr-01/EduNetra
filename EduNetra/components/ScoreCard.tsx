import React from "react";
import { Card } from "./Card";

interface ScoreCardProps {
  title: string;
  score: number;
  type?: "clarity" | "engagement" | "confidence" | "technical";
  description?: string;
}

export function ScoreCard({ title, score, type = "clarity", description }: ScoreCardProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 border-emerald-500 bg-emerald-50";
    if (score >= 60) return "text-blue-600 border-blue-500 bg-blue-50";
    if (score >= 40) return "text-yellow-600 border-yellow-500 bg-yellow-50";
    return "text-rose-600 border-rose-500 bg-rose-50";
  };

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "#059669"; // emerald-600
    if (score >= 60) return "#2563eb"; // blue-600
    if (score >= 40) return "#ca8a04"; // yellow-600
    return "#e11d48"; // rose-600
  };

  const colorClass = getColor(score);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;

  return (
    <Card className="relative overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-slate-500 uppercase tracking-wider text-xs">
              {title}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold tracking-tight ${colorClass.split(" ")[0]}`}>
                {score.toFixed(0)}
              </span>
              <span className="text-sm font-medium text-slate-400">/100</span>
            </div>
          </div>
          
          {/* Radial Progress Indicator */}
          <div className="relative h-16 w-16">
            <svg className="h-full w-full -rotate-90 transform">
              {/* Background Circle */}
              <circle
                className="text-slate-100"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
              />
              {/* Progress Circle */}
              <circle
                stroke={getStrokeColor(score)}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span 
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass.split(" ").slice(1).join(" ")} ${colorClass.split(" ")[0]}`}
          >
            {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Needs Work"}
          </span>
          {description && (
            <div className="group relative">
               <span className="cursor-help rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">?</span>
               <div className="absolute bottom-full left-1/2 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-slate-800 p-2 text-xs text-white shadow-lg group-hover:block z-10">
                 {description}
                 <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800"></div>
               </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
