"use client";

import { useState } from "react";

export default function UploadLinkPage() {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError("Please enter a video URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch("http://127.0.0.1:5000/analyze_from_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          topic: topic.trim() || "General",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setReport(data);
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Correctly extract from nested structure
  const audio = report?.scores?.audio?.overall ?? {};
  const video = report?.scores?.video?.overall ?? {};
  const text = report?.scores?.text ?? {};
  const audioPerMinute = report?.scores?.audio?.per_minute ?? [];
  const videoPerMinute = report?.scores?.video?.per_minute ?? [];

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">🔗 Analyze from Link</h1>
          <p className="text-gray-400">
            Paste any public YouTube, Vimeo, or video link to get instant AI coaching feedback.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-gray-900 rounded-2xl p-6 space-y-4 mb-6 border border-gray-800">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              🎬 Video URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-600"
            />
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              📚 Topic <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Machine Learning, Physics, Chemistry..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-600"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Analyzing... this may take a few minutes
              </span>
            ) : (
              "🔍 Analyze Video"
            )}
          </button>

          <p className="text-gray-600 text-xs text-center">
            Supports YouTube, Vimeo, Dailymotion, and 1000+ platforms via yt-dlp
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500 text-red-300 rounded-xl px-5 py-4 mb-6">
            ❌ {error}
          </div>
        )}

        {/* Results */}
        {report && (
          <div className="space-y-6">

            {/* Success Banner */}
            <div className="bg-green-900/30 border border-green-600 text-green-300 rounded-xl px-5 py-3 text-sm flex justify-between items-center">
              <span>✅ Analysis complete</span>
              <span>⏱ {report.metadata?.processing_time_sec}s</span>
            </div>

            {/* Top Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="AVG CLARITY" value={audio?.clarity_score} color="text-teal-400" barColor="bg-teal-500" />
              <StatCard label="AVG CONFIDENCE" value={audio?.confidence_score} color="text-yellow-400" barColor="bg-yellow-500" />
              <StatCard label="AVG ENGAGEMENT" value={video?.engagement_score} color="text-green-400" barColor="bg-green-500" />
              <StatCard label="GESTURE INDEX" value={video?.gesture_index} color="text-purple-400" barColor="bg-purple-500" />
            </div>

            {/* Audio Scores */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">🎵 Audio Analysis</h2>
              <div className="grid grid-cols-2 gap-4">
                <ScoreCard label="Clarity Score" value={audio?.clarity_score} color="blue" />
                <ScoreCard label="Confidence Score" value={audio?.confidence_score} color="blue" />
              </div>
            </div>

            {/* Video Scores */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">🎥 Video Analysis</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ScoreCard label="Engagement Score" value={video?.engagement_score} color="purple" />
                <ScoreCard label="Gesture Index" value={video?.gesture_index} color="purple" />
                <ScoreCard label="Confidence Score" value={video?.confidence_score} color="purple" />
                <div className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">Dominant Emotion</p>
                  <p className="text-2xl font-bold text-pink-400 capitalize">
                    {video?.dominant_emotion ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Text Scores */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-4">📝 Text Analysis</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ScoreCard label="Technical Depth" value={text?.technical_depth} color="green" />
                <ScoreCard label="Interaction Index" value={text?.interaction_index} color="green" />
                <ScoreCard label="Topic Relevance" value={text?.topic_relevance?.relevance_score} color="green" />
              </div>
            </div>

            {/* Transcript */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-lg font-semibold mb-3">💬 Transcript</h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {report.transcript || "No transcript available."}
              </p>
            </div>

            {/* Per Minute Audio Breakdown */}
            {audioPerMinute.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold mb-4">🕐 Audio — Per Minute</h2>
                <div className="space-y-3">
                  {audioPerMinute.map((min: any) => (
                    <div key={min.minute} className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Minute {min.minute + 1}
                        <span className="text-gray-600 ml-2 text-xs">({min.start_sec}s – {min.end_sec}s)</span>
                      </span>
                      <div className="flex gap-6">
                        <span className="text-blue-400 text-sm">Clarity: <strong>{min.clarity_score}</strong></span>
                        <span className="text-teal-400 text-sm">Confidence: <strong>{min.confidence_score}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Per Minute Video Breakdown */}
            {videoPerMinute.length > 0 && (
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold mb-4">🎬 Video — Per Minute</h2>
                <div className="space-y-3">
                  {videoPerMinute.map((min: any) => (
                    <div key={min.minute} className="bg-gray-800 rounded-xl px-4 py-3 flex justify-between items-center flex-wrap gap-2">
                      <span className="text-gray-400 text-sm">Minute {min.minute + 1}</span>
                      <div className="flex gap-4 flex-wrap">
                        <span className="text-green-400 text-sm">Engagement: <strong>{min.engagement_score}</strong></span>
                        <span className="text-purple-400 text-sm">Gesture: <strong>{min.gesture_index}</strong></span>
                        <span className="text-yellow-400 text-sm">Confidence: <strong>{min.confidence_score}</strong></span>
                        <span className="text-pink-400 text-sm capitalize">Emotion: <strong>{min.dominant_emotion}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, barColor }: {
  label: string; value: any; color: string; barColor: string;
}) {
  const numVal = value !== undefined && value !== null ? Number(value) : null;
  const percent = numVal !== null ? Math.min(numVal, 100) : 0;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-gray-500 text-xs font-semibold tracking-widest mb-2">{label}</p>
      <p className={`text-3xl font-bold mb-3 ${color}`}>
        {numVal !== null ? numVal : "—"}
      </p>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function ScoreCard({ label, value, color }: {
  label: string; value: any; color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    green: "text-green-400",
  };
  return (
    <div className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color]}`}>
        {value !== undefined && value !== null ? value : "—"}
      </p>
    </div>
  );
}