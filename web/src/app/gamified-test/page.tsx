"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, ArrowLeft, AlertCircle } from "lucide-react";

type Theme = "gamified" | "light";

type SessionStartResponse = {
  sessionId?: string;
  questionIds?: number[];
  error?: string;
};

export default function GamifiedTestStartPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<Theme>("light");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState<number | "">(9);
  const [studentName, setStudentName] = useState("");
  const [nativeLang, setNativeLang] = useState(true);
  const [otherLang, setOtherLang] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/gamified-test/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age, gender, nativeLang, otherLang, examLanguage: "en", theme }),
      });

      const payload = (await response.json()) as SessionStartResponse;
      if (!response.ok || !payload.sessionId || !payload.questionIds) {
        throw new Error(payload.error ?? "Unable to start the test.");
      }

      sessionStorage.setItem(
        `gt_session_${payload.sessionId}`,
        JSON.stringify({
          sessionId: payload.sessionId,
          demographics: { age: age as number, gender, nativeLang, otherLang, studentName },
          questionIds: payload.questionIds,
          theme: theme === "gamified" ? "dark" : "light",
        }),
      );

      router.push(
        `/gamified-test/test/${payload.sessionId}?lang=en&theme=${theme === "gamified" ? "dark" : "light"}`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-100/90 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden font-sans antialiased text-slate-800 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl flex flex-col gap-4 items-stretch"
      >
        {/* Demographics Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-4">
          
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-200/60 pb-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm shrink-0">
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-extrabold text-emerald-950 text-base sm:text-lg tracking-tight">
              Child Demographics
            </h2>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            {/* Student Name */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Student's Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student's full name"
                required
                className="w-full rounded-xl px-3 py-2.5 text-xs border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-100 transition"
              />
            </div>

            {/* Age & Gender side-by-side for compactness */}
            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Child's Age (7 – 17)
                </label>
                <input
                  type="number"
                  min={7}
                  max={17}
                  value={age}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAge(val === "" ? "" : Number(val));
                  }}
                  required
                  className="w-full rounded-xl px-3 py-2 text-xs border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-100 transition"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Gender</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all ${
                        gender === g
                          ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:border-emerald-700/40"
                      }`}
                    >
                      {g === "male" ? "👦 Male" : "👧 Female"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Language background (Compact switches) */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-700">Language Background</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { checked: nativeLang, onChange: setNativeLang, label: "English is native language" },
                  { checked: otherLang, onChange: setOtherLang, label: "Speaks another language" },
                ].map(({ checked, onChange, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => onChange(!checked)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs text-left transition-all ${
                      checked
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                      checked ? "bg-emerald-700 border-emerald-700" : "border-slate-300"
                    }`}>
                      {checked && (
                        <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Theme */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-700">Display Theme</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTheme("gamified")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    theme === "gamified"
                      ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-emerald-700/40"
                  }`}
                >
                  🎮 Gamified Theme
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    theme === "light"
                      ? "bg-emerald-700 border-emerald-700 text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-emerald-700/40"
                  }`}
                >
                  ☀️ Light Theme
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Submit Button inside standard HTML form flow */}
            <button type="submit" id="submit-demographics-form" className="hidden" />
          </form>
        </div>

        {/* Separate CTA Button below the Card */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="w-full"
          >
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => document.getElementById("submit-demographics-form")?.click()}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-[0_4px_14px_rgba(4,120,87,0.15)] hover:shadow-[0_6px_20px_rgba(4,120,87,0.25)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 text-center"
            >
              {isSubmitting ? "Configuring Session..." : "Begin Assessment"}
            </button>
          </motion.div>

          {/* Go Back Link */}
          <Link
            href="/instructions"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-800 transition-colors uppercase tracking-wider py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Instructions
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
