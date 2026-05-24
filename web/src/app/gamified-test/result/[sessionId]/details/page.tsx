"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Gamepad2 } from "lucide-react";
import type { SessionResult } from "@/features/gamified-test/lib/types";

type ResultPayload = {
  sessionId: string;
  completedAt?: string;
  result: SessionResult;
};

export default function DetailsPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResultPayload | null>(null);
  const isLightTheme = true;

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`gt_result_${sessionId}`);
      if (!raw) setError("Result not found. Please complete the test first.");
      else setData(JSON.parse(raw) as ResultPayload);
    } catch {
      setError("Unable to load result.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightTheme ? "bg-[#fafbf9]" : "bg-[#f1f5f9]"}`}>
        <p className="text-slate-400 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLightTheme ? "bg-[#fafbf9]" : "bg-[#f1f5f9]"}`}>
        <div className="text-center">
          <p className="text-red-600 text-sm mb-4">{error ?? "No data found."}</p>
          <Link href={isLightTheme ? "/" : "/gamified-test"} className={`font-semibold text-sm ${isLightTheme ? "text-emerald-700 hover:underline" : "text-indigo-600 underline"}`}>
            Start over
          </Link>
        </div>
      </div>
    );
  }

  const { result } = data;
  const avgAccuracy = result.metrics.reduce((s, m) => s + m.accuracy, 0) / result.metrics.length;

  return (
    <div className={`min-h-screen ${isLightTheme ? "bg-[#fafbf9]" : "bg-[#f1f5f9]"}`}>
      {/* Header */}
      <header className={`px-6 h-14 flex items-center justify-between border-b ${
        isLightTheme ? "bg-white border-emerald-100/60" : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLightTheme ? "bg-emerald-800" : "bg-indigo-600"}`}>
            <Gamepad2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className={`font-extrabold ${isLightTheme ? "text-emerald-950 tracking-tight" : "text-slate-800"}`}>
            {isLightTheme ? "Lexora" : "DysTest"}
          </span>
        </div>
        <span className="text-xs text-slate-400">Question Breakdown</span>
      </header>

      <main className="max-w-3xl mx-auto p-4 pt-8 pb-16 space-y-5">
        {/* Back link */}
        <Link
          href={`/gamified-test/result/${sessionId}?theme=${isLightTheme ? 'light' : 'dark'}`}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
            isLightTheme ? "text-slate-500 hover:text-emerald-800" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to result summary
        </Link>

        {/* Heading */}
        <div>
          <h1 className={`text-xl font-black ${isLightTheme ? "text-emerald-950" : "text-slate-800"}`}>Per-Question Breakdown</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Model: <span className="text-slate-600">{result.modelSource ?? "fallback"}{result.modelVersion ? ` · ${result.modelVersion}` : ""}</span>
          </p>
        </div>

        {/* Summary bar */}
        <div className={`rounded-2xl bg-white shadow-sm px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border ${
          isLightTheme ? "border-emerald-100" : "border-slate-200"
        }`}>
          {[
            { label: "Avg Accuracy", value: `${(avgAccuracy * 100).toFixed(0)}%`, color: isLightTheme ? "text-emerald-950 font-extrabold" : "text-slate-800" },
            { label: "Total Hits", value: result.metrics.reduce((s, m) => s + m.hits, 0), color: "text-emerald-700 font-bold" },
            { label: "Total Misses", value: result.metrics.reduce((s, m) => s + m.misses, 0), color: "text-red-500 font-semibold" },
            { label: "Total Clicks", value: result.metrics.reduce((s, m) => s + m.clicks, 0), color: isLightTheme ? "text-slate-700 font-bold" : "text-indigo-600" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className={`rounded-2xl bg-white shadow-sm overflow-hidden border ${
          isLightTheme ? "border-emerald-100" : "border-slate-200"
        }`}>
          <div className={`px-5 py-3.5 border-b ${isLightTheme ? "border-emerald-50 bg-emerald-50/10" : "border-slate-100"}`}>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              All {result.metrics.length} Questions
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className={`border-b text-slate-400 text-xs text-left ${isLightTheme ? "border-emerald-50" : "border-slate-100"}`}>
                  {["Question", "Clicks", "Hits", "Misses", "Score", "Accuracy", "Miss Rate", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.metrics.map((metric, i) => {
                  const acc = metric.accuracy;
                  const TrendIcon = acc >= 0.7 ? TrendingUp : acc >= 0.4 ? Minus : TrendingDown;
                  const trendColor = acc >= 0.7 ? "text-emerald-600" : acc >= 0.4 ? "text-amber-500" : "text-red-500";
                  return (
                    <tr
                      key={metric.questionId}
                      className={`border-b ${
                        isLightTheme 
                          ? "border-emerald-50/40" 
                          : "border-slate-50"
                      } ${
                        i % 2 === 0 ? "bg-white" : isLightTheme ? "bg-emerald-50/5" : "bg-slate-50/50"
                      }`}
                    >
                      <td className={`px-4 py-3 font-extrabold uppercase ${isLightTheme ? "text-emerald-950" : "text-slate-700"}`}>{metric.questionId}</td>
                      <td className="px-4 py-3 text-slate-500">{metric.clicks}</td>
                      <td className="px-4 py-3 font-bold text-emerald-700">{metric.hits}</td>
                      <td className="px-4 py-3 font-medium text-red-500">{metric.misses}</td>
                      <td className="px-4 py-3 text-slate-500">{metric.score}</td>
                      <td className="px-4 py-3 font-bold text-slate-700">{(acc * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3 text-slate-500">{(metric.missrate * 100).toFixed(0)}%</td>
                      <td className="px-4 py-3"><TrendIcon className={`w-4 h-4 ${trendColor}`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <Link
          href={`/gamified-test/result/${sessionId}?theme=${isLightTheme ? 'light' : 'dark'}`}
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-colors ${
            isLightTheme ? "text-slate-500 hover:text-emerald-800" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to result summary
        </Link>
      </main>
    </div>
  );
}
