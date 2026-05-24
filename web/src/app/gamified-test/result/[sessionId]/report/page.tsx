"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Printer, AlertTriangle, User, BookOpen, Activity, CheckCircle2
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
    studentName?: string;
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
  const [studentName, setStudentName] = useState("");

  const isLightTheme = true;
  const brandName = "Lexora";

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
        const parsedSession = JSON.parse(rawSession) as SessionData;
        setSessionData(parsedSession);
        if (parsedSession.demographics.studentName) {
          setStudentName(parsedSession.demographics.studentName);
        }
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
      <div className="min-h-screen flex items-center justify-center bg-[#fafbf9]">
        <p className="text-sm animate-pulse text-slate-400">
          Generating diagnostic document...
        </p>
      </div>
    );
  }

  if (error || !resultData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#fafbf9]">
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

  // Risk levels styling helper (2 values: Risk or Risk Free)
  const riskStyle = {
    bg: riskDetected ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100",
    text: riskDetected ? "text-red-700" : "text-emerald-700",
    label: riskDetected ? "Risk" : "Risk Free",
  };

  const stickPosition = riskDetected ? 80 : 20;

  // Document date string
  const reportDate = completedAt 
    ? new Date(completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) 
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen font-sans bg-[#fafbf9] text-slate-800 print:bg-white print:text-black">
      {/* Dynamic SEO Semicolons */}
      <title>{`${brandName} Dyslexia Screening Report - ${sessionId.slice(0, 8)}`}</title>

      {/* Embedded print layout style for strict single page layout */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border-radius: 12px !important;
            padding: 12px 16px !important;
            margin-bottom: 10px !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .print-no-border {
            border: none !important;
            padding: 0 !important;
            margin-bottom: 12px !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Floating Interactive Header (Screen only) */}
      <header className="sticky top-0 z-40 px-6 py-3 border-b shadow-sm backdrop-blur-md print:hidden flex items-center justify-between bg-white/80 border-emerald-100/60 text-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={`/gamified-test/result/${sessionId}?theme=light`}
            className="inline-flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-lg border border-emerald-100 text-slate-500 bg-emerald-50/20 hover:bg-emerald-50/50"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-slate-300 print:hidden" />
          <span className="text-xs font-medium text-slate-400">Diagnostic PDF Generator</span>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all bg-emerald-800 hover:bg-emerald-950 text-white hover:shadow-emerald-900/10"
        >
          <Printer className="w-4 h-4" />
          Print Report / Save PDF
        </button>
      </header>

      {/* Report Container */}
      <main className="max-w-4xl mx-auto p-4 sm:p-5 md:p-6 space-y-4 print:p-0 print:space-y-3">
        
        {/* Helper Instructions Box (Visible ONLY on Screen) */}
        <div className="rounded-3xl p-5 border shadow-sm print:hidden flex flex-col md:flex-row gap-5 items-start sm:items-center justify-between transition-all bg-gradient-to-r from-emerald-50 to-teal-50/50 border-emerald-100/60 text-slate-800">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-emerald-600" />
              Direct PDF Download Instructions
            </h3>
            <p className="text-xs opacity-85 leading-relaxed">
              To save this clinical screening report directly as a vector PDF on your device, click the <strong>Print Report / Save PDF</strong> button, then select <strong>Save as PDF</strong> in the Destination dropdown of your browser's print utility.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-3 rounded-2xl text-xs font-black shadow-lg shrink-0 transition-all bg-emerald-800 hover:bg-emerald-950 text-white shadow-emerald-900/10"
          >
            Download PDF Now
          </button>
        </div>

        {/* Printable Official Clinical Letterhead Header */}
        <div className="rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col sm:flex-row justify-between gap-4 print-card print-no-border bg-white border-emerald-100/60">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white bg-emerald-800">
                {brandName[0]}
              </div>
              <span className="text-xl font-black tracking-tight text-emerald-950">
                {brandName} <span className="font-light text-slate-400">Screening Report</span>
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
        <div className="rounded-2xl p-4 border shadow-sm print-card bg-white border-emerald-100/60">
          <div className="flex items-center gap-2 border-b border-slate-200/50 pb-1.5 mb-3 print:border-slate-100">
            <User className="w-3.5 h-3.5 text-emerald-700" />
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">Student Profile Demographics</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs">
            <div className="space-y-0.5 col-span-2 md:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Student Name</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter Name..."
                className="font-bold text-slate-800 print:text-black text-xs bg-transparent border-b border-dashed border-slate-350 focus:border-emerald-600 focus:outline-none w-full print:border-none print:p-0"
              />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Student Age</span>
              <p className="font-bold text-slate-800 print:text-black text-xs">
                {sessionData?.demographics.age ? `${sessionData.demographics.age} Years Old` : "9 Years Old"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Gender Profile</span>
              <p className="font-bold text-slate-800 print:text-black text-xs capitalize">
                {sessionData?.demographics.gender ?? "Male"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Language Group</span>
              <p className="font-bold text-slate-800 print:text-black text-xs">
                {sessionData?.demographics.nativeLang ? "English (Native)" : "Non-native speaker"}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Linguistic Profile</span>
              <p className="font-bold text-slate-800 print:text-black text-xs">
                {sessionData?.demographics.otherLang ? "Multilingual" : "Monolingual (English)"}
              </p>
            </div>
          </div>
        </div>

        {/* Screening Outcome & Risk Spectrum Visualization */}
        <div className="rounded-2xl p-4 border shadow-sm print-card bg-white border-emerald-100/60">
          <div className="w-full flex items-center gap-2 border-b border-slate-200/50 pb-1.5 mb-3 print:border-slate-100">
            <Activity className="w-3.5 h-3.5 text-emerald-700" />
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">
              Screening Risk Analysis
            </h2>
          </div>

          <div className="space-y-4">
            {/* Top info row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Classification Result</p>
                <h3 className={`text-xl font-black mt-0.5 ${
                  riskDetected 
                    ? "text-red-650 print:text-red-700" 
                    : "text-emerald-650 print:text-emerald-700"
                }`}>
                  {riskDetected ? "Dyslexia Risk Detected" : "Risk Free (No Risk Detected)"}
                </h3>
              </div>
            </div>

            {/* Horizontal Heat Bar Spectrum */}
            <div className="relative pt-4 pb-2">
              {/* The Heat Bar */}
              <div 
                className="relative w-full h-5 rounded-full shadow-inner border border-slate-200/20"
                style={{ 
                  background: 'linear-gradient(to right, #10b981, #f59e0b, #ef4444)',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}
              >
                {/* Visual ticks inside the bar */}
                <div className="absolute inset-0 flex justify-between px-4 items-center opacity-35 text-[9px] text-white font-mono font-bold select-none">
                  <span>|</span>
                  <span>|</span>
                  <span>|</span>
                  <span>|</span>
                  <span>|</span>
                </div>
              </div>

              {/* The Stick / Indicator Marker */}
              <div 
                className="absolute w-3.5 rounded-full shadow-md transition-all duration-1000 ease-out z-10 pointer-events-none"
                style={{ 
                  left: `${stickPosition}%`,
                  transform: 'translateX(-50%)',
                  top: '-7px',
                  height: '34px',
                  backgroundColor: '#000000',
                  border: '2.5px solid #ffffff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}
              />
            </div>

            {/* Labels under the Heat Bar */}
            <div className="flex justify-between items-center text-[10px] font-bold px-1 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
                <span className="text-slate-750">Risk Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
                <span className="text-slate-750">Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linguistic & Cognitive Section Results */}
        <div className="rounded-2xl p-4 border shadow-sm print-card flex flex-col bg-white border-emerald-100/60">
          <div className="w-full flex items-center gap-2 border-b border-slate-200/50 pb-1.5 mb-3 print:border-slate-100">
            <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-500">Linguistic & Cognitive Profile</h2>
          </div>

          <div className="flex-1 flex flex-col justify-between py-0.5 space-y-2">
            {domainScores.map(domain => {
              const hasScore = domain.avgAccuracy !== null;
              const scoreValue = domain.avgAccuracy ?? 0;
              const barPercent = Math.round(scoreValue * 100);
              
              // Color-coding based on cognitive strength
              const getBarColorHex = (val: number) => {
                if (val >= 0.75) return "#059669";
                if (val >= 0.50) return "#f59e0b";
                return "#ef4444";
              };

              return (
                <div key={domain.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-850 print:text-black">{domain.name}</span>
                    <span className="font-mono font-extrabold text-slate-700 print:text-black">
                      {hasScore ? `${barPercent}%` : "N/A"}
                    </span>
                  </div>

                  <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                    {hasScore ? (
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ 
                          width: `${barPercent}%`,
                          backgroundColor: getBarColorHex(scoreValue),
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact'
                        }}
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-50 text-[8px] text-slate-400 flex items-center justify-center italic">
                        Not tested for this age bracket
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-[9px] text-slate-400 italic mt-2 print:mt-1">
            Note: A lower score represents a significant barrier in that specific neurological pathway.
          </p>
        </div>

        {/* Institutional / Medical Disclaimer Box (Full width) */}
        <div className="rounded-2xl p-4 border shadow-sm text-xs flex flex-col justify-between print-card bg-emerald-50/10 border-emerald-100/60">
          <div className="space-y-1.5 text-slate-500 print:text-slate-700">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
              Disclaimer Notice
            </span>
            <p className="leading-relaxed text-[11px]">
              This screening profile is compiled based on response metrics from a language-independent cognitive screening. It is designed to evaluate specific dyslexia-related indicators like visual searches, phoneme assembly, and working memory recall.
            </p>
            <p className="leading-relaxed font-bold text-[11px]">
              This is a screening indicator only and does NOT replace a comprehensive multi-disciplinary evaluation.
            </p>
          </div>

          <div className="border-t border-slate-200/50 pt-1.5 mt-2.5 print:border-slate-200 text-[9px] text-slate-400 text-left">
            Lexora Screening · Rello et al. Model v1.2
          </div>
        </div>

      </main>
    </div>
  );
}
