"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function HomePage() {
  const measures = [
    { label: "Visual letter recognition & rapid naming speed" },
    { label: "Sound-to-letter matching & phonological skills" },
    { label: "Syllable breakdown & acoustic processing speed" },
    { label: "Working memory & sequence recall dynamics" }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100/90 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden font-sans antialiased text-slate-800 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl flex flex-col gap-5 items-stretch"
      >
        {/* Centered Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
          {/* Header section with minimal icon */}
          <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-extrabold text-emerald-950 text-base sm:text-lg tracking-tight">
              Dyslexia Screening Assessment
            </h2>
          </div>

          {/* Welcome Text */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Welcome to the DysTest cognitive screening system. This tool helps identify early indicators of dyslexia and reading challenges in children through gamified interactive tasks.
          </p>

          {/* What will be measured */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">
              What does the test measure?
            </h3>
            <ul className="space-y-2 text-slate-600 text-xs sm:text-sm pl-1">
              {measures.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-emerald-700 font-bold text-base leading-none shrink-0">•</span>
                  <span className="leading-relaxed font-medium">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Closing Text */}
          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed border-t border-slate-200/60 pt-4 font-medium">
            This assessment helps parents and educators better understand a child's reading patterns and support their development.
          </p>
        </div>

        {/* Separate CTA Button below the Card */}
        <motion.div
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          className="w-full"
        >
          <Link
            href="/instructions"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-[0_4px_14px_rgba(4,120,87,0.15)] hover:shadow-[0_6px_20px_rgba(4,120,87,0.25)] transition-all duration-300 flex items-center justify-center gap-2 group text-center"
          >
            Next: Assessment Steps
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
