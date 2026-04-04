"use client";

import { useState, useMemo } from "react";
import { Card } from "./Card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { BarChart3, LineChart } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerMinuteData {
  minute: number;
  start_sec: number;
  end_sec: number;
  [key: string]: number | string;
}

interface MinuteWiseAnalyticsProps {
  audioPerMinute?: PerMinuteData[];
  videoPerMinute?: PerMinuteData[];
  previousMetrics?: {
    avgClarityScore?: number;
    avgConfidenceScore?: number;
    avgEngagementScore?: number;
  };
}

export function MinuteWiseAnalytics({ audioPerMinute, videoPerMinute, previousMetrics }: MinuteWiseAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<"audio" | "video">("audio");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  if (!audioPerMinute && !videoPerMinute) {
    return (
      <Card className="bg-slate-50 p-6 text-center">
        <p className="text-slate-600">No minute-wise data available</p>
      </Card>
    );
  }

  const data = selectedMetric === "audio" ? audioPerMinute : videoPerMinute;
  const labels = data?.map((d) => `${d.minute}m`) || [];

  // Metrics configuration
  const metrics = selectedMetric === "audio" 
    ? [
        { key: "clarity_score", label: "Clarity", color: "rgb(16, 185, 129)", bg: "rgba(16, 185, 129, 0.5)" },
        { key: "confidence_score", label: "Confidence", color: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.5)" }
      ]
    : [
        { key: "engagement_score", label: "Engagement", color: "rgb(249, 115, 22)", bg: "rgba(249, 115, 22, 0.5)" }, // Orange
        // scaling gesture index (0-10) to 0-100 for chart roughly x10? Or keep separate axis? 
        // For simplicity, let's just show engagement first as it's the main one. Gesture often confusing on same scale.
        // Or mapped x10.
        { key: "gesture_index", label: "Gesture Index (x10)", color: "rgb(236, 72, 153)", bg: "rgba(236, 72, 153, 0.5)", transform: (v: number) => v * 10 }
      ];

  const chartData = useMemo(() => {
    return {
      labels,
      datasets: metrics.map((m) => ({
        label: m.label,
        data: data?.map((d) => {
             const val = d[m.key] as number;
             return m.transform ? m.transform(val) : val;
        }) || [],
        borderColor: m.color,
        backgroundColor: m.bg,
        borderWidth: 2,
        borderRadius: 4,
        tension: 0.4, // smooth lines
      })),
    };
  }, [data, labels, metrics]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255,255,255,0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // assuming scores are 0-100
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      x: {
        grid: { display: false },
      },
    },
    interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false
    }
  };

  return (
    <Card className="p-6 transition-all hover:shadow-md border-slate-200">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
             Minute-by-Minute Evolution
          </h3>
          <p className="text-sm text-slate-500">
             Track how metrics changed throughout the session
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
           <button
             onClick={() => setChartType("bar")}
             className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
               chartType === "bar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
             }`}
           >
             <BarChart3 className="h-4 w-4" /> Bars
           </button>
           <button
             onClick={() => setChartType("line")}
             className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
               chartType === "line" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
             }`}
           >
             <LineChart className="h-4 w-4" /> Line
           </button>
        </div>
      </div>

      <div className="mb-6 border-b border-slate-200">
         <div className="flex gap-6">
            <button 
               onClick={() => setSelectedMetric("audio")}
               className={`pb-3 text-sm font-semibold transition-colors ${
                  selectedMetric === "audio" 
                    ? "border-b-2 border-primary-600 text-primary-600" 
                    : "text-slate-500 hover:text-slate-700"
               }`}
            >
               Audio Metrics
            </button>
            <button 
               onClick={() => setSelectedMetric("video")}
               className={`pb-3 text-sm font-semibold transition-colors ${
                  selectedMetric === "video" 
                    ? "border-b-2 border-primary-600 text-primary-600" 
                    : "text-slate-500 hover:text-slate-700"
               }`}
            >
               Video Metrics
            </button>
         </div>
      </div>

      <div className="h-[300px] w-full">
         {chartType === "bar" ? (
            <Bar data={chartData} options={options} />
         ) : (
            <Line data={chartData} options={options} />
         )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-500 border border-slate-100">
         <div className="flex items-center gap-2">
            <div className="h-1.5 w-8 rounded bg-green-500"></div>
            <span>High Performance (80-100)</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-1.5 w-8 rounded bg-blue-500"></div>
            <span>Stable (60-79)</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="h-1.5 w-8 rounded bg-orange-500"></div>
            <span>Needs Focus (&lt;60)</span>
         </div>
      </div>
    </Card>
  );
}
