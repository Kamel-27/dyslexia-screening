"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Printer, AlertTriangle, ShieldCheck, ShieldAlert, 
  Activity, Calendar, User, BookOpen, Clock, FileText, CheckCircle2
} from "lucide-react";
import type { SessionResult } from "@/features/gamified-test/lib/types";

type ResultPayload = {
  sessionId: string;
  completedAt?: string;
  result: SessionResult;
};

type SessionData = {
  sessionId: string;
  demographics: {
    age: number;
    gender: "male" | "female";
    nativeLang: boolean;
    otherLang: boolean;
  };
  questionIds: number[];
  theme: "light" | "dark";
};

const COGNITIVE_DOMAINS = [
  {
    id: "visual",
    name: "Visual Search & Discrimination",
    questions: ["q1", "q2", "q3", "q4", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17"],
    description: "Grid search of letters/words, and distinguishing rotational mirror letter anomalies (b/d, p/q, u/v).",
  },
  {
    id: "phonological",
    name: "Phonological Processing",
    questions: ["q5", "q6", "q7", "q8", "q9", "q22", "q28"],
    description: "Grapheme-phoneme mapping, vowel insertions, and multi-syllabic word assembly.",
  },
  {
    id: "orthographic",
    name: "Orthographics & Spelling",
    questions: ["q18", "q19", "q20", "q21", "q23", "q26", "q27"],
    description: "Lexical spelling decisions (pseudowords vs real), error correction, and anagram arrangements.",
  },
  {
    id: "syntax",
    name: "Grammar & Syntax",
    questions: ["q24", "q25", "q29"],
    description: "Linguistic semantic errors, preposition syntax identification, and word segmentation.",
  },
  {
    id: "memory",
    name: "Working Memory & Transcription",
    questions: ["q30", "q31", "q32"],
    description: "Visual sequential working memory recall, transcription, and auditory pseudoword dictation.",
  },
];

export default function ReportPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultData, setResultData] = useState<ResultPayload | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setIsLightTheme(searchParams.get("theme") === "light");
    }
  }, []);

  useEffect(() => {
    try {
      // 1. Fetch main test outcome metrics
      const rawResult = sessionStorage.getItem(`gt_result_${sessionId}`);
      if (!rawResult) {
        setError("Result details not found. Please complete the assessment first.");
        setLoading(false);
        return;
      }
      const parsedResult = JSON.parse(rawResult) as ResultPayload;
      setResultData(parsedResult);

      // 2. Fetch demographic profiles from session setup
      const rawSession = sessionStorage.getItem(`gt_session_${sessionId}`);
      if (rawSession) {
        setSessionData(JSON.parse(rawSession) as SessionData);
      }
    } catch {
      setError("Unable to load results report data.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isLightTheme ? "bg-[#fafbf9]" : "bg-slate-900"}`}>
        <p className={`text-sm animate-pulse ${isLightTheme ? "text-slate-400" : "text-indigo-300"}`}>
          Generating diagnostic document...
        </p>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${isLightTheme ? "bg-[#fafbf9]" : "bg-slate-900"}`}>
        <div className="text-center bg-white p-8 rounded-3xl border border-red-100 shadow-xl max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-700 text-sm font-semibold mb-4">{error ?? "Report data not found."}</p>
          <Link href="/" className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition">
            Return to Screening Portal
          </Link>
        </div>
      </div>
    );
  }

  const { result, completedAt } = resultData;
  const riskDetected = result.riskDetected;
  const probability = result.probability;
  const threshold = result.threshold;

  // Compute overall average statistics
  const totalQuestions = result.metrics.length;
  const totalHits = result.metrics.reduce((s, m) => s + m.hits, 0);
  const totalMisses = result.metrics.reduce((s, m) => s + m.misses, 0);
  const totalClicks = result.metrics.reduce((s, m) => s + m.clicks, 0);
  const avgAccuracy = totalQuestions > 0 
    ? result.metrics.reduce((s, m) => s + m.accuracy, 0) / totalQuestions 
    : 0;

  // Group metrics into Cognitive Domains
  const domainScores = COGNITIVE_DOMAINS.map(domain => {
    const matchingMetrics = result.metrics.filter(m => 
      domain.questions.includes(m.questionId.toLowerCase())
    );
    
    if (matchingMetrics.length === 0) {
      return {
        ...domain,
        avgAccuracy: null,
        questionCount: 0,
        hits: 0,
        misses: 0,
      };
    }

    const avgAcc = matchingMetrics.reduce((s, m) => s + m.accuracy, 0) / matchingMetrics.length;
    return {
      ...domain,
      avgAccuracy: avgAcc,
      questionCount: matchingMetrics.length,
      hits: matchingMetrics.reduce((s, m) => s + m.hits, 0),
      misses: matchingMetrics.reduce((s, m) => s + m.misses, 0),
    };
  });

  // Risk levels styling helper
  const getRiskColor = (prob: number, thresh: number) => {
    if (prob < thresh) return { stroke: "#10b981", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700", label: "Low Risk" };
    if (prob < thresh * 2) return { stroke: "#f59e0b", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700", label: "Moderate Risk" };
    return { stroke: "#ef4444", bg: "bg-red-50", border: "border-red-100", text: "text-red-700", label: "High Risk" };
  };

  const riskStyle = getRiskColor(probability, threshold);

  // SVG Gauge constants
  const gaugeR = 85;
  const gaugeCx = 110;
  const gaugeCy = 110;
  const arcLength = Math.PI * gaugeR;
  const scoreOffset = arcLength * (1 - probability);

  // Calculate coordinates for the Threshold marker tick
  const thresholdAngle = Math.PI * (1 - threshold);
  const thresholdX = gaugeCx + (gaugeR + 5) * Math.cos(thresholdAngle);
  const thresholdY = gaugeCy - (gaugeR + 5) * Math.sin(thresholdAngle);
  const thresholdLabelX = gaugeCx + (gaugeR + 32) * Math.cos(thresholdAngle);
  const thresholdLabelY = gaugeCy - (gaugeR + 22) * Math.sin(thresholdAngle);

  // Document date string
  const reportDate = completedAt 
    ? new Date(completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const brandName = isLightTheme ? "Lexora" : "DysTest";

  return (
    <div className={`min-h-screen font-sans print:bg-white print:text-black ${
      isLightTheme ? "bg-[#fafbf9]" : "bg-slate-900/95 text-slate-100"
    }`}>
      {/* Dynamic SEO Semicolons */}
      <title>{`${brandName} Dyslexia Screening Report - ${sessionId.slice(0, 8)}`}</title>

      {/* Floating Interactive Header (Screen only) */}
      <header className={`sticky top-0 z-40 px-6 py-3 border-b shadow-sm backdrop-blur-md print:hidden flex items-center justify-between ${
        isLightTheme 
          ? "bg-white/80 border-emerald-100/60 text-slate-800" 
          : "bg-slate-900/85 border-slate-800 text-slate-200"
      }`}>
        <div className="flex items-center gap-3">
          <Link
            href={`/gamified-test/result/${sessionId}?theme=${isLightTheme ? 'light' : 'dark'}`}
            className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-lg border ${
              isLightTheme 
                ? "border-emerald-100 text-slate-500 bg-emerald-50/20 hover:bg-emerald-50/50" 
                : "border-slate-800 text-slate-300 bg-slate-800/30 hover:bg-slate-850"
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-slate-350 print:hidden" />
          <span className="text-xs font-medium text-slate-400">Diagnostic PDF Generator</span>
        </div>

        <button
          onClick={handlePrint}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all ${
            isLightTheme 
              ? "bg-emerald-800 hover:bg-emerald-950 text-white hover:shadow-emerald-900/10" 
              : "bg-indigo-650 hover:bg-indigo-750 text-white shadow-indigo-600/10"
          }`}
        >
          <Printer className="w-4 h-4" />
          Print Report / Save PDF
        </button>
      </header>

      {/* Report Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 md:p-12 space-y-8 print:p-0 print:space-y-6">
        
        {/* Helper Instructions Box (Visible ONLY on Screen) */}
        <div className={`rounded-3xl p-6 border shadow-sm print:hidden flex flex-col md:flex-row gap-6 items-start sm:items-center justify-between transition-all ${
          isLightTheme 
            ? "bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-100/60 text-slate-800" 
            : "bg-slate-800/80 border-slate-700 text-slate-200"
        }`}>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isLightTheme ? "bg-emerald-600" : "bg-indigo-500"}`} />
              Direct PDF Download Instructions
            </h3>
            <p className="text-xs opacity-85 leading-relaxed">
              To save this clinical screening report directly as a vector PDF on your device, click the <strong>Print Report / Save PDF</strong> button, then select <strong>Save as PDF</strong> in the Destination dropdown of your browser's print utility.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className={`px-5 py-3 rounded-2xl text-xs font-black shadow-lg shrink-0 transition-all ${
              isLightTheme
                ? "bg-emerald-800 hover:bg-emerald-950 text-white shadow-emerald-900/10"
                : "bg-indigo-650 hover:bg-indigo-750 text-white shadow-indigo-600/15"
            }`}
          >
            Download PDF Now
          </button>
        </div>

        {/* Printable Official Clinical Letterhead Header */}
        <div className={`rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col sm:flex-row justify-between gap-6 print:border-0 print:shadow-none print:p-0 ${
          isLightTheme 
            ? "bg-white border-emerald-100/60" 
            : "bg-slate-850/80 border-slate-800"
        }`}>
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-white ${
                isLightTheme ? "bg-emerald-800" : "bg-indigo-600"
              }`}>
                {brandName[0]}
              </div>
              <span className={`text-xl font-black tracking-tight ${isLightTheme ? "text-emerald-950" : "text-slate-100"}`}>
                {brandName} <span className="font-light text-slate-400">Clinical Labs</span>
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 print:text-black">
              Dyslexia Screening Report
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Methodology: Language-Independent Cognitive Screening Profile (Rello et al., 2020)
            </p>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-slate-500 print:text-slate-600 shrink-0">
            <div><strong>Report ID:</strong> <span className="font-mono text-slate-400 print:text-black">{sessionId}</span></div>
            <div><strong>Screening Date:</strong> <span className="font-medium print:text-black">{reportDate}</span></div>
            <div><strong>Status:</strong> <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full ${riskStyle.bg} ${riskStyle.text}`}>{riskStyle.label}</span></div>
          </div>
        </div>

        {/* Student Demographics Section */}
        <div className={`rounded-3xl p-6 border shadow-sm print:border print:border-slate-200 print:shadow-none ${
          isLightTheme 
            ? "bg-white border-emerald-100/60" 
            : "bg-slate-850/80 border-slate-800"
        }`}>
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-3 mb-4 print:border-slate-100">
            <User className={`w-4 h-4 ${isLightTheme ? "text-emerald-700" : "text-indigo-400"}`} />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">Student Profile Demographics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400">Student Age</span>
              <p className="font-bold text-slate-800 print:text-black text-sm">
                {sessionData?.demographics.age ? `${sessionData.demographics.age} Years Old` : "9 Years Old"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Gender Profile</span>
              <p className="font-bold text-slate-800 print:text-black text-sm capitalize">
                {sessionData?.demographics.gender ?? "Male"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Language Group</span>
              <p className="font-bold text-slate-800 print:text-black text-sm">
                {sessionData?.demographics.nativeLang ? "English (Native)" : "Non-native speaker"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400">Linguistic Profile</span>
              <p className="font-bold text-slate-800 print:text-black text-sm">
                {sessionData?.demographics.otherLang ? "Multilingual" : "Monolingual (English)"}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Charts Layout: Gauge & Bar Chart side by side or stacked */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 print:grid-cols-5 print:gap-4 print:break-inside-avoid">
          
          {/* Radial Probability Semicircle Gauge (40% width on screen/print) */}
          <div className={`md:col-span-2 print:col-span-2 rounded-3xl p-6 border shadow-sm flex flex-col items-center justify-center text-center print:border print:border-slate-200 print:shadow-none ${
            isLightTheme 
              ? "bg-white border-emerald-100/60" 
              : "bg-slate-850/80 border-slate-800"
          }`}>
            <div className="w-full flex items-center gap-2 border-b border-slate-200/50 pb-3 mb-4 print:border-slate-100 text-left self-start">
              <Activity className={`w-4 h-4 ${isLightTheme ? "text-emerald-700" : "text-indigo-400"}`} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">Screening Risk Gauge</h2>
            </div>

            {/* Premium Native Semicircular Gauge */}
            <div className="relative w-[220px] h-[125px] mt-2 mb-1 print:color-adjust-exact">
              <svg width="220" height="120" className="overflow-visible">
                {/* Semicircle track */}
                <path
                  d={`M ${gaugeCx - gaugeR},${gaugeCy} A ${gaugeR},${gaugeR} 0 0,1 ${gaugeCx + gaugeR},${gaugeCy}`}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="15"
                  strokeLinecap="round"
                />

                {/* Score Arc fill (Color-coded by severity) */}
                <path
                  d={`M ${gaugeCx - gaugeR},${gaugeCy} A ${gaugeR},${gaugeR} 0 0,1 ${gaugeCx + gaugeR},${gaugeCy}`}
                  fill="none"
                  stroke={riskStyle.stroke}
                  strokeWidth="15"
                  strokeLinecap="round"
                  strokeDasharray={`${arcLength} ${arcLength}`}
                  strokeDashoffset={scoreOffset}
                  className="transition-all duration-700 ease-out"
                />

                {/* Threshold Marker Indicator */}
                <line
                  x1={gaugeCx}
                  y1={gaugeCy}
                  x2={thresholdX}
                  y2={thresholdY}
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />

                {/* Semicircle Cap Overlay */}
                <circle cx={gaugeCx} cy={gaugeCy} r="5" fill="#475569" />

                {/* Base Limit Labels */}
                <text x={gaugeCx - gaugeR} y={gaugeCy + 18} fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">0%</text>
                <text x={gaugeCx + gaugeR} y={gaugeCy + 18} fill="#94a3b8" fontSize="10" textAnchor="middle" fontWeight="bold">100%</text>

                {/* Threshold Callout Label */}
                <text
                  x={thresholdLabelX}
                  y={thresholdLabelY}
                  fill="#475569"
                  fontSize="9"
                  fontWeight="black"
                  textAnchor="middle"
                  className="print:fill-slate-700"
                >
                  {`Threshold: ${(threshold * 100).toFixed(0)}%`}
                </text>
              </svg>
            </div>

            <div className="space-y-0.5">
              <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">Dyslexia Probability</span>
              <p className={`text-3xl font-black ${riskStyle.text}`}>
                {(probability * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 print:text-slate-700">
                Risk Classification: <strong className="capitalize">{riskStyle.label}</strong>
              </p>
            </div>
          </div>

          {/* Neuropsychological Cognitive Domain Horizontal Bar Chart (60% width) */}
          <div className={`md:col-span-3 print:col-span-3 rounded-3xl p-6 border shadow-sm print:border print:border-slate-200 print:shadow-none flex flex-col ${
            isLightTheme 
              ? "bg-white border-emerald-100/60" 
              : "bg-slate-850/80 border-slate-800"
          }`}>
            <div className="w-full flex items-center gap-2 border-b border-slate-200/50 pb-3 mb-4 print:border-slate-100">
              <BookOpen className={`w-4 h-4 ${isLightTheme ? "text-emerald-700" : "text-indigo-400"}`} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">Linguistic & Cognitive Profile</h2>
            </div>

            {/* Native Clean Vector Horizontal Bar Chart */}
            <div className="flex-1 flex flex-col justify-between py-2 space-y-4 print:color-adjust-exact">
              {domainScores.map(domain => {
                const hasScore = domain.avgAccuracy !== null;
                const scoreValue = domain.avgAccuracy ?? 0;
                const barPercent = Math.round(scoreValue * 100);
                
                // Color-coding based on cognitive strength
                const getBarColor = (val: number) => {
                  if (val >= 0.75) return "bg-emerald-600";
                  if (val >= 0.50) return "bg-amber-500";
                  return "bg-red-500";
                };

                return (
                  <div key={domain.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 print:text-black">{domain.name}</span>
                      <span className="font-mono font-extrabold text-slate-700 print:text-black">
                        {hasScore ? `${barPercent}%` : "N/A"}
                      </span>
                    </div>

                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                      {hasScore ? (
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getBarColor(scoreValue)}`}
                          style={{ width: `${barPercent}%` }}
                        />
                      ) : (
                        <div className="h-full w-full bg-slate-50 text-[9px] text-slate-400 flex items-center justify-center italic">
                          Not tested for this age bracket
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-400 italic mt-3 print:mt-2">
              Note: A lower score represents a significant barrier in that specific neurological pathway.
            </p>
          </div>

        </div>

        {/* Tabular Question breakdown matrix (Print optimized table) */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden print:border print:border-slate-200 print:shadow-none print:break-before-page ${
          isLightTheme 
            ? "bg-white border-emerald-100/60" 
            : "bg-slate-850/80 border-slate-800"
        }`}>
          <div className={`px-6 py-4 border-b flex justify-between items-center ${
            isLightTheme ? "border-emerald-50 bg-emerald-50/10" : "border-slate-800/80"
          }`}>
            <div className="flex items-center gap-2">
              <FileText className={`w-4 h-4 ${isLightTheme ? "text-emerald-700" : "text-indigo-400"}`} />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">
                Detailed Question-by-Question Diagnostics
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-slate-100 text-slate-500">
              {totalQuestions} Active Metrics
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-[11px] text-left text-slate-650 print:text-black">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 uppercase tracking-wider text-[9px] font-extrabold print:border-slate-200">
                  <th className="px-5 py-3">Task ID</th>
                  <th className="px-5 py-3">Cognitive Category</th>
                  <th className="px-5 py-3 text-center">Interactions</th>
                  <th className="px-5 py-3 text-center text-emerald-700">Hits</th>
                  <th className="px-5 py-3 text-center text-red-500">Misses</th>
                  <th className="px-5 py-3 text-center">Accuracy (%)</th>
                  <th className="px-5 py-3 text-center">Evaluation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {result.metrics.map((metric, idx) => {
                  // Find associated domain label
                  const mappedDomain = COGNITIVE_DOMAINS.find(d => 
                    d.questions.includes(metric.questionId.toLowerCase())
                  );

                  const accuracy = metric.accuracy;
                  let strength = "Adequate";
                  let badgeStyle = "text-emerald-600 bg-emerald-50 print:bg-transparent";

                  if (accuracy < 0.50) {
                    strength = "Barrier";
                    badgeStyle = "text-red-650 bg-red-50 print:bg-transparent font-black";
                  } else if (accuracy < 0.75) {
                    strength = "Borderline";
                    badgeStyle = "text-amber-600 bg-amber-50 print:bg-transparent";
                  }

                  return (
                    <tr 
                      key={metric.questionId} 
                      className={`hover:bg-slate-50/40 print:hover:bg-transparent ${
                        idx % 2 === 0 ? "bg-white" : isLightTheme ? "bg-emerald-50/5" : "bg-slate-800/10"
                      }`}
                    >
                      <td className="px-5 py-2.5 font-bold uppercase text-slate-800 print:text-black font-mono">
                        {metric.questionId}
                      </td>
                      <td className="px-5 py-2.5 text-slate-500 print:text-slate-700">
                        {mappedDomain?.name.split(" ")[0] ?? "Linguistic Processing"}
                      </td>
                      <td className="px-5 py-2.5 text-center text-slate-450 print:text-slate-600">
                        {metric.clicks}
                      </td>
                      <td className="px-5 py-2.5 text-center font-bold text-emerald-700">
                        {metric.hits}
                      </td>
                      <td className="px-5 py-2.5 text-center font-semibold text-red-500">
                        {metric.misses}
                      </td>
                      <td className="px-5 py-2.5 text-center font-extrabold text-slate-800 print:text-black">
                        {Math.round(accuracy * 100)}%
                      </td>
                      <td className="px-5 py-2.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${badgeStyle}`}>
                          {strength}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Guidance, Medical Disclaimer & Physical Notes/Signature footer */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 print:grid-cols-5 print:gap-4 print:break-inside-avoid">
          
          {/* Diagnostic Clinical Notes & Sign-off Block (60% width) */}
          <div className={`md:col-span-3 print:col-span-3 rounded-3xl p-6 border shadow-sm print:border print:border-slate-200 print:shadow-none flex flex-col justify-between min-h-[220px] ${
            isLightTheme 
              ? "bg-white border-emerald-100/60" 
              : "bg-slate-850/80 border-slate-800"
          }`}>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">Diagnostic Practitioner Notes</span>
              <div className="mt-3 border-b border-dashed border-slate-200 h-6 w-full" />
              <div className="mt-3 border-b border-dashed border-slate-200 h-6 w-full" />
              <div className="mt-3 border-b border-dashed border-slate-200 h-6 w-full" />
              <div className="mt-3 border-b border-dashed border-slate-200 h-6 w-full" />
            </div>

            <div className="mt-6 flex justify-between items-end border-t border-slate-100 pt-4 print:border-slate-200">
              <div className="text-xs text-slate-450">
                <p className="font-bold text-slate-700 print:text-black">Therapist/Educator Signature</p>
                <p className="text-[10px] mt-0.5">Licensed Clinical Representative</p>
              </div>
              <div className="border-b border-slate-300 w-36 h-8 text-center text-slate-300 italic text-[10px]">
                Sign & Date Here
              </div>
            </div>
          </div>

          {/* Institutional / Medical Disclaimer Box (40% width) */}
          <div className={`md:col-span-2 print:col-span-2 rounded-3xl p-6 border shadow-sm text-xs flex flex-col justify-between print:border print:border-slate-200 print:shadow-none ${
            isLightTheme 
              ? "bg-emerald-50/10 border-emerald-100/60" 
              : "bg-slate-850/80 border-slate-800"
          }`}>
            <div className="space-y-3 text-slate-500 print:text-slate-700">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-450" />
                Medical Disclaimer Notice
              </span>
              <p className="leading-relaxed">
                This diagnostic profile is compiled based on response metrics from a language-independent cognitive screening. It is designed to evaluate specific dyslexia-related indicators like visual searches, phoneme assembly, and working memory recall.
              </p>
              <p className="leading-relaxed font-bold">
                This is a screening indicator only and does NOT replace a comprehensive multi-disciplinary clinical evaluation.
              </p>
            </div>

            <div className="border-t border-slate-200/50 pt-3 mt-4 print:border-slate-200 text-[10px] text-slate-400 text-left">
              Lexora Lab Corp · Rello et al. Model v1.2
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
