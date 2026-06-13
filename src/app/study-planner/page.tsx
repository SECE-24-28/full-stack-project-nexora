"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function StudyPlannerPage() {
  const [company, setCompany] = useState("");
  const [days, setDays] = useState(30);
  const [level, setLevel] = useState("Beginner");

  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    try {
      setLoading(true);
      setPlan("");

      const response = await fetch("/api/study-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company,
          days,
          level,
        }),
      });

      const data = await response.json();
      setPlan(data.plan);
    } catch (error) {
      console.error(error);
      alert("Failed to generate study plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mt-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
          ✨ AI Tools Suite
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
          AI Study Planner
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Get a personalized, timeline-based learning syllabus tailored for specific companies, preparation levels, and deadlines.
        </p>
      </div>

      {/* Main card panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Company */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
              Target Company
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Google, Meta, Amazon..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Timeline Days */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
              Timeline (Days)
            </label>
            <div className="relative">
              <input
                type="number"
                placeholder="Days"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Quick Suggestions */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-slate-400 mr-1">Quick timelines:</span>
          {[7, 14, 30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`border px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 ${
                days === d
                  ? "bg-blue-50 border-blue-200 text-blue-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-550 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>

        {/* Experience Level Selector */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
            Target Experience Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {["Beginner", "Intermediate", "Advanced"].map((lvl) => {
              const isActive = level === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`py-3.5 px-4 rounded-xl border text-sm font-bold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 ${
                    isActive
                      ? "bg-indigo-50/80 border-indigo-500 text-indigo-700 shadow-md shadow-indigo-500/5"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 text-slate-600"
                  }`}
                >
                  <span className="text-lg">
                    {lvl === "Beginner" && "🌱"}
                    {lvl === "Intermediate" && "🚀"}
                    {lvl === "Advanced" && "🏆"}
                  </span>
                  <span>{lvl}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            onClick={generatePlan}
            disabled={loading || !company || days <= 0}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-md shadow-indigo-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating Roadmap...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-blue-100" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.97-8.97L15 9l-5.187 6.904zM18 5.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                <span>Generate Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated output section */}
      {plan && (
        <div className="border border-slate-200/80 rounded-2xl p-6 md:p-8 bg-white shadow-xl shadow-slate-100/50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span>Syllabus: </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold">
                {company} ({days} Days)
              </span>
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(plan);
                alert("📋 Study plan copied to clipboard!");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
              </svg>
              Copy Plan
            </button>
          </div>

          <div className="prose prose-indigo max-w-none prose-slate prose-headings:font-bold prose-a:text-indigo-600 prose-strong:text-slate-900 prose-pre:bg-slate-900 prose-pre:text-slate-100">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {plan}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}