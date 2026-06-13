"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

function AINotesContent() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically pre-fill the topic from query params
  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchParams]);

  const generateNotes = async () => {
    try {
      setLoading(true);
      setNotes("");

      const response = await fetch("/api/ai-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNotes(data.notes);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate notes");
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
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          AI Notes Generator
        </h1>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Input a coding question, design pattern, or concept to generate a structured revision cheat sheet, code walkthrough, and complexity breakdown instantly.
        </p>
      </div>

      {/* Main card panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
            Enter Topic / Question
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. Reverse Linked List, Binary Search, Dynamic Programming..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-5 py-4 text-slate-800 placeholder-slate-400 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold"
            />

            <button
              onClick={generateNotes}
              disabled={loading || !topic}
              className="md:w-48 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-4 rounded-xl shadow-md shadow-purple-900/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4.5 h-4.5 text-purple-100" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm">Generate Notes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic chip selection list */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest block">
            Suggested Core Topics
          </span>
          <div className="flex gap-2 flex-wrap">
            {[
              "Binary Search",
              "Dynamic Programming",
              "Graphs",
              "Linked Lists",
              "Trees",
            ].map((item) => (
              <button
                key={item}
                onClick={() => setTopic(item)}
                className={`border px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                  topic === item
                    ? "bg-purple-600 border-purple-600 text-white shadow-sm shadow-purple-500/20 scale-[1.02]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-350 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Generated output section */}
      {notes && (
        <div className="border border-slate-200/80 rounded-2xl p-6 md:p-8 bg-white shadow-xl shadow-slate-100/50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <svg className="w-5.5 h-5.5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Notes: </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold">
                {topic}
              </span>
            </h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(notes);
                alert("📋 Notes copied to clipboard!");
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3" />
              </svg>
              Copy Notes
            </button>
          </div>

          <div className="prose prose-indigo max-w-none prose-slate prose-headings:font-bold prose-a:text-indigo-600 prose-strong:text-slate-900 prose-pre:bg-slate-900 prose-pre:text-slate-100">
            <ReactMarkdown>
              {notes}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AINotesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center bg-slate-50/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Loading Notes Space...</p>
        </div>
      </div>
    }>
      <AINotesContent />
    </Suspense>
  );
}