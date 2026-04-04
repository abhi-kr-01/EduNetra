import React from "react";
import { Clock, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";

export type TimeSegment = {
  startTime: number; // in seconds
  endTime: number; // in seconds
  label: string;
  type: "highlight" | "warning" | "issue";
  description?: string;
};

type TimeSegmentsProps = {
  segments: TimeSegment[];
  onSegmentClick?: (segment: TimeSegment) => void;
  videoRef?: React.RefObject<HTMLVideoElement>;
};

export function TimeSegments({
  segments,
  onSegmentClick,
  videoRef,
}: TimeSegmentsProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSegmentStyles = (type: TimeSegment["type"]) => {
    switch (type) {
      case "highlight":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          hoverBorder: "hover:border-emerald-300",
          text: "text-emerald-700",
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          hoverBorder: "hover:border-amber-300",
          text: "text-amber-700",
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        };
      case "issue":
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          hoverBorder: "hover:border-rose-300",
          text: "text-rose-700",
          icon: <AlertCircle className="h-4 w-4 text-rose-600" />,
        };
    }
  };

  const handleSegmentClick = (segment: TimeSegment) => {
    // Jump video to segment start time if video ref is provided
    if (videoRef?.current) {
      videoRef.current.currentTime = segment.startTime;
      videoRef.current.play();
    }
    
    // Call custom handler if provided
    if (onSegmentClick) {
      onSegmentClick(segment);
    }
  };

  if (!segments || segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
        <Clock className="h-8 w-8 text-slate-300 mb-2" />
        <p className="text-sm font-medium text-slate-600">No key moments found</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          We didn't detect any specific anomalies or highlights in this session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {segments.map((segment, index) => {
        const styles = getSegmentStyles(segment.type);
        const duration = segment.endTime - segment.startTime;

        return (
          <button
            key={index}
            onClick={() => handleSegmentClick(segment)}
            className={`group w-full rounded-lg border ${styles.border} ${styles.bg} p-3 text-left transition-all hover:shadow-sm ${styles.hoverBorder} active:scale-[0.99]`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {styles.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${styles.text}`}>
                    {segment.label}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-slate-500 bg-white/50 px-1.5 py-0.5 rounded border border-black/5">
                    {formatTime(segment.startTime)}
                  </span>
                </div>
                {segment.description && (
                  <p className="mt-1 text-xs text-slate-600 leading-snug">
                    {segment.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2 text-[10px] subpixel-antialiased uppercase tracking-wide text-slate-400 font-medium">
                  {/* Visual Duration Line */}
                  <div className="h-1 w-full max-w-[60px] rounded-full bg-slate-200 overflow-hidden">
                     <div className="h-full bg-slate-400 w-1/2"></div>
                  </div>
                  <span>{Math.round(duration)}s Duration</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
