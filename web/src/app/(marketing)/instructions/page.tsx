"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardList, ArrowLeft } from "lucide-react";

export default function InstructionsPage() {
  const steps = [
    {
      icon: "🖥️",
      title: "Device Setup",
      desc: "Use a tablet, laptop, or desktop computer with a mouse or touchscreen."
    },
    {
      icon: "🔊",
      title: "Enable Sound",
      desc: "Ensure volume is enabled (or use headphones) since several tasks play spoken audio."
    },
    {
      icon: "🧑‍🧒",
      title: "Parental Supervision",
      desc: "Help configure the screen, but let the child answer all game questions on their own."
    },
    {
      icon: "🕹️",
      title: "No Time Pressure",
      desc: "The screening features 33 short, play-like mini-games. Take as much time as needed!"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-slate-100/90 flex flex-col justify-center items-center p-4 sm:p-6 overflow-hidden font-sans antialiased text-slate-800 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-xl flex flex-col gap-4 items-stretch"
      >
        {/* Centered Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl space-y-5">
          {/* Header section with minimal icon */}
          <div className="flex items-center gap-3 border-b border-slate-200/60 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-sm shrink-0">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-extrabold text-emerald-950 text-base sm:text-lg tracking-tight">
              Assessment Steps & Guidelines
            </h2>
          </div>

          {/* Guidelines list */}
          <div className="space-y-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-3.5 items-start">
                <span className="text-xl sm:text-2xl select-none leading-none shrink-0" role="img" aria-label={step.title}>
                  {step.icon}
                </span>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">
                    {step.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Separate CTA Button below the Card */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="w-full"
          >
            <Link
              href="/gamified-test"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-[0_4px_14px_rgba(4,120,87,0.15)] hover:shadow-[0_6px_20px_rgba(4,120,87,0.25)] transition-all duration-300 flex items-center justify-center gap-2 group text-center"
            >
              Begin Screening Test
            </Link>
          </motion.div>

          {/* Go Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-800 transition-colors uppercase tracking-wider py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
