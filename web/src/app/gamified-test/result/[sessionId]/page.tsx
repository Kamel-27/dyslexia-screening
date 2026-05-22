"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ShieldCheck, ShieldAlert, RefreshCw, Info, BarChart2, ChevronRight, Gamepad2, ArrowLeft, FileText
} from "lucide-react";
import type { SessionResult } from "@/features/gamified-test/lib/types";

type ResultPayload = {
  sessionId: string;
  completedAt?: string;
  result: SessionResult;
};

export default function ResultPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResultPayload | null>(null);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setIsLightTheme(searchParams.get("theme") === "light");
    }
  }, []);

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
        <p className="text-slate-400 text-sm animate-pulse">Loading result…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLightTheme ? "bg-[#fafbf9]" : "bg-[#f1f5f9]"}`}>
        <div className="text-center">
          <p className="text-red-600 text-sm mb-4">{error ?? "No data found."}</p>
          <Link href="/" className="text-emerald-700 hover:underline text-sm font-semibold">
            Try again
          </Link>
        </div>
      </div>
    );
  }

  const { result } = data;
  const riskDetected = result.riskDetected;

  return (
    <div className={`min-h-screen ${isLightTheme ? "bg-[#fafbf9]" : "bg-[#f1f5f9]"}`}>
      {/* Header */}
      <header className={`px-6 h-14 flex items-center justify-between border-b ${
        isLightTheme 
          ? "bg-white border-emerald-100/60" 
          : "bg-white border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isLightTheme ? "bg-emerald-800" : "bg-indigo-600"}`}>
            <Gamepad2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className={`font-extrabold ${isLightTheme ? "text-emerald-950 tracking-tight" : "text-slate-800"}`}>
            {isLightTheme ? "Lexora" : "DysTest"}
          </span>
        </div>
        <span className="text-xs text-slate-400">Screening Result</span>
      </header>

      <main className="max-w-lg mx-auto p-4 pt-8 pb-16 space-y-4">
        {/* Back to main portal for Light/Screening flow */}
        {isLightTheme && (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Screening Portal
          </Link>
        )}

        {/* ── Risk card ──────────────────────────────────── */}
        <div className={`rounded-2xl p-7 text-center border shadow-sm bg-white ${
          isLightTheme 
            ? "border-emerald-100" 
            : riskDetected 
            ? "border-red-200" 
            : "border-emerald-200"
        }`}>
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${
            riskDetected ? "bg-red-100 text-red-500" : "bg-emerald-100 text-emerald-600"
          }`}>
            {riskDetected
              ? <ShieldAlert className="w-7 h-7" />
              : <ShieldCheck className="w-7 h-7" />
            }
          </div>

          <h1 className={`text-xl font-black ${isLightTheme ? "text-emerald-950" : "text-slate-800"} mb-1`}>
            {riskDetected ? "Dyslexia Risk Detected" : "No Risk Detected"}
          </h1>

          <div className="flex items-center justify-center gap-5 text-sm text-slate-500 mt-3 mb-5">
            <span>
              Probability:{" "}
              <strong className="text-slate-700 font-extrabold">{(result.probability * 100).toFixed(1)}%</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Threshold:{" "}
              <strong className="text-slate-700">{(result.threshold * 100).toFixed(1)}%</strong>
            </span>
          </div>

          {/* Confidence bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5">
            <div
              className={`h-1.5 rounded-full transition-all ${riskDetected ? "bg-red-400" : "bg-emerald-500"}`}
              style={{ width: `${(result.probability * 100).toFixed(0)}%` }}
            />
          </div>

          {/* Disclaimer */}
          <div className={`flex gap-2.5 rounded-xl p-3 text-xs text-left border ${
            isLightTheme 
              ? "bg-[#fafbf9] border-emerald-100 text-slate-600" 
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}>
            <Info className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLightTheme ? "text-emerald-700" : "text-amber-500"}`} />
            <span>
              <strong>Screening assessment only.</strong> This is not a formal medical diagnosis.
              Based on Rello et al. (2020) model features. Please consult a qualified educational professional for diagnostics.
            </span>
          </div>
        </div>

        {/* ── Stats strip ────────────────────────────────── */}
        <div className={`rounded-2xl border bg-white shadow-sm px-6 py-5 grid grid-cols-3 gap-4 text-center ${
          isLightTheme ? "border-emerald-100" : "border-slate-200"
        }`}>
          {[
            { label: "Questions", value: result.metrics.length, color: isLightTheme ? "text-emerald-950 font-extrabold" : "text-slate-800" },
            { label: "Total Hits", value: result.metrics.reduce((s, m) => s + m.hits, 0), color: "text-emerald-700 font-bold" },
            { label: "Total Misses", value: result.metrics.reduce((s, m) => s + m.misses, 0), color: "text-red-500 font-semibold" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Breakdown link ─────────────────────────────── */}
        <Link
          href={`/gamified-test/result/${sessionId}/details?theme=${isLightTheme ? 'light' : 'dark'}`}
          className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl border bg-white text-sm transition-all group shadow-sm ${
            isLightTheme 
              ? "border-emerald-100 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/20" 
              : "border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30"
          }`}
        >
          <span className="flex items-center gap-2 font-bold">
            <BarChart2 className={`w-4 h-4 ${isLightTheme ? "text-emerald-700" : "text-indigo-500"}`} />
            View question-by-question breakdown
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* ── Export Report ──────────────────────────────── */}
        <Link
          href={`/gamified-test/result/${sessionId}/report?theme=${isLightTheme ? 'light' : 'dark'}`}
          className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border text-sm font-bold transition-all shadow-sm ${
            isLightTheme
              ? "border-emerald-200 bg-emerald-800 text-white hover:bg-emerald-950"
              : "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          <FileText className="w-4 h-4" />
          Export Official PDF Report
        </Link>

        {/* ── New session ────────────────────────────────── */}
        <Link
          href={isLightTheme ? "/" : "/gamified-test"}
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl border bg-white text-sm font-bold transition-all shadow-sm ${
            isLightTheme
              ? "border-emerald-100 text-emerald-800 hover:bg-emerald-50/30"
              : "border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50"
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          {isLightTheme ? "Start New Screening" : "Start a new session"}
        </Link>
      </main>
    </div>
  );
}
